import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      investorId, 
      eventTypeId, 
      startTime, 
      bookerName, 
      bookerEmail, 
      bookerCompany, 
      notes 
    } = await req.json();

    if (!investorId || !eventTypeId || !startTime || !bookerName || !bookerEmail) {
      throw new Error('Missing required fields');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Get event type for duration
    const { data: eventType, error: eventTypeError } = await supabase
      .from('booking_event_types')
      .select('*')
      .eq('id', eventTypeId)
      .eq('is_active', true)
      .single();

    if (eventTypeError || !eventType) {
      throw new Error('Event type not found');
    }

    // Calculate end time
    const startDate = new Date(startTime);
    const endDate = new Date(startDate.getTime() + eventType.duration_minutes * 60 * 1000);

    // Check for conflicts (double-booking prevention)
    const bufferBefore = (eventType.buffer_before_minutes || 0) * 60 * 1000;
    const bufferAfter = (eventType.buffer_after_minutes || 0) * 60 * 1000;
    const checkStart = new Date(startDate.getTime() - bufferBefore);
    const checkEnd = new Date(endDate.getTime() + bufferAfter);

    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('investor_id', investorId)
      .neq('status', 'cancelled')
      .or(`and(start_time.lt.${checkEnd.toISOString()},end_time.gt.${checkStart.toISOString()})`);

    if (existingBookings && existingBookings.length > 0) {
      throw new Error('This time slot is no longer available');
    }

    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        investor_id: investorId,
        event_type_id: eventTypeId,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        booker_name: bookerName,
        booker_email: bookerEmail,
        booker_company: bookerCompany || null,
        notes: notes || null,
        status: 'confirmed'
      })
      .select()
      .single();

    if (bookingError) {
      throw bookingError;
    }

    // Try to create Google Calendar event
    let googleEventId = null;
    const { data: tokenData } = await supabase
      .from('google_calendar_tokens')
      .select('*')
      .eq('investor_id', investorId)
      .single();

    if (tokenData) {
      try {
        // Refresh token if needed
        let accessToken = tokenData.access_token;
        if (new Date(tokenData.expires_at) < new Date()) {
          const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              refresh_token: tokenData.refresh_token,
              client_id: Deno.env.get('GOOGLE_CALENDAR_CLIENT_ID')!,
              client_secret: Deno.env.get('GOOGLE_CALENDAR_CLIENT_SECRET')!,
              grant_type: 'refresh_token'
            })
          });

          if (refreshResponse.ok) {
            const newTokens = await refreshResponse.json();
            accessToken = newTokens.access_token;
            
            await supabase
              .from('google_calendar_tokens')
              .update({
                access_token: newTokens.access_token,
                expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString()
              })
              .eq('investor_id', investorId);
          }
        }

        // Get investor profile for name
        const { data: investorProfile } = await supabase
          .from('investor_profiles')
          .select('full_name, organization_name')
          .eq('id', investorId)
          .single();

        // Create calendar event
        const calendarResponse = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${tokenData.calendar_id || 'primary'}/events`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              summary: `${eventType.name} with ${bookerName}`,
              description: `Meeting booked via investor calendar\n\nBooker: ${bookerName}\nEmail: ${bookerEmail}${bookerCompany ? `\nCompany: ${bookerCompany}` : ''}${notes ? `\n\nNotes: ${notes}` : ''}`,
              start: {
                dateTime: startDate.toISOString(),
                timeZone: 'UTC'
              },
              end: {
                dateTime: endDate.toISOString(),
                timeZone: 'UTC'
              },
              attendees: [
                { email: bookerEmail, displayName: bookerName }
              ],
              reminders: {
                useDefault: false,
                overrides: [
                  { method: 'email', minutes: 24 * 60 },
                  { method: 'popup', minutes: 30 }
                ]
              }
            })
          }
        );

        if (calendarResponse.ok) {
          const eventData = await calendarResponse.json();
          googleEventId = eventData.id;

          // Update booking with Google event ID
          await supabase
            .from('bookings')
            .update({ google_event_id: googleEventId })
            .eq('id', booking.id);
        }
      } catch (e) {
        console.error('Error creating Google Calendar event:', e);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        booking: {
          ...booking,
          google_event_id: googleEventId
        },
        eventType: {
          name: eventType.name,
          duration: eventType.duration_minutes
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error creating booking:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
