import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DayAvailability {
  date: string;
  hasSlots: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { investorId, eventTypeId, startDate, endDate } = await req.json();

    if (!investorId || !eventTypeId || !startDate || !endDate) {
      throw new Error('Missing required parameters');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Fetch event type details
    const { data: eventType, error: eventTypeError } = await supabase
      .from('booking_event_types')
      .select('*')
      .eq('id', eventTypeId)
      .eq('is_active', true)
      .single();

    if (eventTypeError || !eventType) {
      throw new Error('Event type not found or inactive');
    }

    // Fetch weekly availability
    const { data: availability } = await supabase
      .from('booking_availability')
      .select('*')
      .eq('investor_id', investorId)
      .eq('is_active', true);

    // Fetch date overrides for the period
    const { data: overrides } = await supabase
      .from('booking_slot_overrides')
      .select('*')
      .eq('investor_id', investorId)
      .gte('date', startDate)
      .lte('date', endDate);

    // Fetch existing bookings
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('start_time, end_time')
      .eq('investor_id', investorId)
      .neq('status', 'cancelled')
      .gte('start_time', startDate)
      .lte('end_time', endDate);

    // Get Google Calendar busy times from ALL linked calendars
    let googleBusyTimes: { start: string; end: string }[] = [];
    const { data: linkedCalendars } = await supabase
      .from('linked_calendars')
      .select('*')
      .eq('investor_id', investorId)
      .eq('include_in_availability', true);

    if (linkedCalendars && linkedCalendars.length > 0) {
      for (const calendar of linkedCalendars) {
        try {
          let accessToken = calendar.access_token;
          if (new Date(calendar.expires_at) < new Date()) {
            const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                refresh_token: calendar.refresh_token,
                client_id: Deno.env.get('GOOGLE_CALENDAR_CLIENT_ID')!,
                client_secret: Deno.env.get('GOOGLE_CALENDAR_CLIENT_SECRET')!,
                grant_type: 'refresh_token'
              })
            });

            if (refreshResponse.ok) {
              const newTokens = await refreshResponse.json();
              accessToken = newTokens.access_token;
              
              await supabase
                .from('linked_calendars')
                .update({
                  access_token: newTokens.access_token,
                  expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString()
                })
                .eq('id', calendar.id);
            } else {
              continue;
            }
          }

          const calendarResponse = await fetch(
            `https://www.googleapis.com/calendar/v3/freeBusy`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                timeMin: new Date(startDate).toISOString(),
                timeMax: new Date(endDate).toISOString(),
                items: [{ id: calendar.calendar_id || 'primary' }]
              })
            }
          );

          if (calendarResponse.ok) {
            const calendarData = await calendarResponse.json();
            const calendarId = calendar.calendar_id || 'primary';
            const busyTimes = calendarData.calendars?.[calendarId]?.busy || [];
            googleBusyTimes.push(...busyTimes);
          }
        } catch (e) {
          console.error(`Error fetching calendar ${calendar.id}:`, e);
        }
      }
    }

    // Check each day for available slots
    const days: DayAvailability[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationMs = eventType.duration_minutes * 60 * 1000;
    const bufferBefore = (eventType.buffer_before_minutes || 0) * 60 * 1000;
    const bufferAfter = (eventType.buffer_after_minutes || 0) * 60 * 1000;
    const now = new Date();

    for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
      const dayOfWeek = day.getDay();
      const dateStr = day.toISOString().split('T')[0];
      
      // Skip past days
      if (day < new Date(now.toISOString().split('T')[0])) {
        days.push({ date: dateStr, hasSlots: false });
        continue;
      }

      // Check for override on this date
      const override = overrides?.find(o => o.date === dateStr);
      if (override && !override.is_available) {
        days.push({ date: dateStr, hasSlots: false });
        continue;
      }

      // Get available times for this day
      let dayStart: string | null = null;
      let dayEnd: string | null = null;

      if (override?.is_available && override.start_time && override.end_time) {
        dayStart = override.start_time;
        dayEnd = override.end_time;
      } else {
        const regularAvail = availability?.find(a => a.day_of_week === dayOfWeek);
        if (regularAvail) {
          dayStart = regularAvail.start_time;
          dayEnd = regularAvail.end_time;
        }
      }

      if (!dayStart || !dayEnd) {
        days.push({ date: dateStr, hasSlots: false });
        continue;
      }

      // Parse times
      const [startHour, startMin] = dayStart.split(':').map(Number);
      const [endHour, endMin] = dayEnd.split(':').map(Number);

      const dayStartTime = new Date(day);
      dayStartTime.setHours(startHour, startMin, 0, 0);

      const dayEndTime = new Date(day);
      dayEndTime.setHours(endHour, endMin, 0, 0);

      // Check if there's at least one available slot
      let hasAvailableSlot = false;
      let slotStart = new Date(dayStartTime);
      
      while (slotStart.getTime() + durationMs <= dayEndTime.getTime()) {
        const slotEnd = new Date(slotStart.getTime() + durationMs);
        
        // Skip past slots
        if (slotStart < now) {
          slotStart = new Date(slotStart.getTime() + 30 * 60 * 1000);
          continue;
        }

        // Check against existing bookings
        const slotWithBufferStart = new Date(slotStart.getTime() - bufferBefore);
        const slotWithBufferEnd = new Date(slotEnd.getTime() + bufferAfter);
        
        const hasBookingConflict = existingBookings?.some(b => {
          const bookingStart = new Date(b.start_time);
          const bookingEnd = new Date(b.end_time);
          return slotWithBufferStart < bookingEnd && slotWithBufferEnd > bookingStart;
        });

        // Check against Google Calendar
        const hasGoogleConflict = googleBusyTimes.some(b => {
          const busyStart = new Date(b.start);
          const busyEnd = new Date(b.end);
          return slotWithBufferStart < busyEnd && slotWithBufferEnd > busyStart;
        });

        if (!hasBookingConflict && !hasGoogleConflict) {
          hasAvailableSlot = true;
          break;
        }

        slotStart = new Date(slotStart.getTime() + 30 * 60 * 1000);
      }

      days.push({ date: dateStr, hasSlots: hasAvailableSlot });
    }

    return new Response(
      JSON.stringify({ days }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error getting available days:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
