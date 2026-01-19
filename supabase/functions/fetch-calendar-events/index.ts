import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  calendarId: string;
  calendarName: string;
  color: string;
  allDay: boolean;
  location?: string;
  description?: string;
}

async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<{ access_token: string; expires_in: number } | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token'
      })
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchEventsFromCalendar(
  accessToken: string,
  calendarId: string,
  calendarName: string,
  color: string,
  timeMin: string,
  timeMax: string
): Promise<CalendarEvent[]> {
  const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
  url.searchParams.set('timeMin', timeMin);
  url.searchParams.set('timeMax', timeMax);
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');
  url.searchParams.set('maxResults', '250');

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    console.error(`Failed to fetch events from ${calendarId}:`, await response.text());
    return [];
  }

  const data = await response.json();
  const events: CalendarEvent[] = [];

  for (const item of data.items || []) {
    // Skip cancelled events
    if (item.status === 'cancelled') continue;

    const isAllDay = !!item.start?.date;
    const start = isAllDay ? item.start.date : item.start?.dateTime;
    const end = isAllDay ? item.end.date : item.end?.dateTime;

    if (!start || !end) continue;

    events.push({
      id: item.id,
      title: item.summary || '(No title)',
      start,
      end,
      calendarId,
      calendarName,
      color,
      allDay: isAllDay,
      location: item.location,
      description: item.description,
    });
  }

  return events;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { investorId, startDate, endDate } = await req.json();

    if (!investorId || !startDate || !endDate) {
      throw new Error('Missing required parameters: investorId, startDate, endDate');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const clientId = Deno.env.get('GOOGLE_CALENDAR_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CALENDAR_CLIENT_SECRET');

    if (!supabaseUrl || !supabaseServiceKey || !clientId || !clientSecret) {
      throw new Error('Missing environment configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all linked calendars for this investor
    const { data: calendars, error: calError } = await supabase
      .from('linked_calendars')
      .select('*')
      .eq('investor_id', investorId);

    if (calError) {
      console.error('Error fetching calendars:', calError);
      throw new Error('Failed to fetch linked calendars');
    }

    if (!calendars || calendars.length === 0) {
      return new Response(
        JSON.stringify({ events: [], calendars: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const allEvents: CalendarEvent[] = [];
    const timeMin = new Date(startDate).toISOString();
    const timeMax = new Date(endDate).toISOString();

    for (const calendar of calendars) {
      let accessToken = calendar.access_token;

      // Refresh token if expired
      if (new Date(calendar.expires_at) < new Date()) {
        const newTokens = await refreshAccessToken(
          calendar.refresh_token,
          clientId,
          clientSecret
        );

        if (newTokens) {
          accessToken = newTokens.access_token;
          const newExpiresAt = new Date(Date.now() + newTokens.expires_in * 1000).toISOString();

          await supabase
            .from('linked_calendars')
            .update({
              access_token: newTokens.access_token,
              expires_at: newExpiresAt,
              updated_at: new Date().toISOString()
            })
            .eq('id', calendar.id);
        } else {
          console.error(`Failed to refresh token for calendar ${calendar.id}`);
          continue;
        }
      }

      try {
        const events = await fetchEventsFromCalendar(
          accessToken,
          calendar.calendar_id,
          calendar.calendar_name,
          calendar.color || '#4285f4',
          timeMin,
          timeMax
        );
        allEvents.push(...events);
      } catch (e) {
        console.error(`Error fetching events for calendar ${calendar.calendar_id}:`, e);
      }
    }

    // Sort events by start time
    allEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return new Response(
      JSON.stringify({ 
        events: allEvents,
        calendars: calendars.map(c => ({
          id: c.id,
          calendarId: c.calendar_id,
          name: c.calendar_name,
          color: c.color,
          isPrimary: c.is_primary,
          includeInAvailability: c.include_in_availability
        }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error fetching calendar events:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});