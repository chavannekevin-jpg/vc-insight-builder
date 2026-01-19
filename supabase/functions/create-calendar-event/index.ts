import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateEventRequest {
  investorId: string;
  calendarId?: string;
  title: string;
  description?: string;
  location?: string;
  startDateTime: string;
  endDateTime: string;
  attendees?: string[];
  reminders?: { method: string; minutes: number }[];
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: CreateEventRequest = await req.json();
    const { 
      investorId, 
      calendarId = 'primary',
      title, 
      description, 
      location, 
      startDateTime, 
      endDateTime, 
      attendees = [],
      reminders
    } = body;

    if (!investorId || !title || !startDateTime || !endDateTime) {
      throw new Error('Missing required fields: investorId, title, startDateTime, endDateTime');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const clientId = Deno.env.get('GOOGLE_CALENDAR_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CALENDAR_CLIENT_SECRET');

    if (!supabaseUrl || !supabaseServiceKey || !clientId || !clientSecret) {
      throw new Error('Missing environment configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the calendar credentials (use primary calendar or specified one)
    const { data: calendar, error: calError } = await supabase
      .from('linked_calendars')
      .select('*')
      .eq('investor_id', investorId)
      .eq('calendar_id', calendarId)
      .single();

    if (calError || !calendar) {
      // Fallback to any linked calendar
      const { data: fallbackCal, error: fallbackError } = await supabase
        .from('linked_calendars')
        .select('*')
        .eq('investor_id', investorId)
        .order('is_primary', { ascending: false })
        .limit(1)
        .single();

      if (fallbackError || !fallbackCal) {
        throw new Error('No linked calendar found. Please connect a Google Calendar first.');
      }
      
      // Use fallback calendar
      Object.assign(calendar || {}, fallbackCal);
    }

    // Refresh token if expired
    let accessToken = calendar!.access_token;
    if (new Date(calendar!.expires_at) < new Date()) {
      const newTokens = await refreshAccessToken(
        calendar!.refresh_token,
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
          .eq('id', calendar!.id);
      } else {
        throw new Error('Failed to refresh access token. Please reconnect your calendar.');
      }
    }

    // Prepare the Google Calendar event
    const eventBody: Record<string, unknown> = {
      summary: title,
      start: {
        dateTime: startDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: endDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };

    if (description) {
      eventBody.description = description;
    }

    if (location) {
      eventBody.location = location;
    }

    if (attendees.length > 0) {
      eventBody.attendees = attendees.map(email => ({ email }));
      eventBody.sendUpdates = 'all'; // Send invite emails
    }

    if (reminders) {
      eventBody.reminders = {
        useDefault: false,
        overrides: reminders
      };
    }

    // Create the event in Google Calendar
    const targetCalendarId = calendar!.calendar_id || 'primary';
    const createResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(targetCalendarId)}/events?sendUpdates=all`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventBody)
      }
    );

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Google Calendar API error:', errorText);
      throw new Error('Failed to create event in Google Calendar');
    }

    const createdEvent = await createResponse.json();

    return new Response(
      JSON.stringify({ 
        success: true,
        event: {
          id: createdEvent.id,
          title: createdEvent.summary,
          start: createdEvent.start?.dateTime || createdEvent.start?.date,
          end: createdEvent.end?.dateTime || createdEvent.end?.date,
          htmlLink: createdEvent.htmlLink
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error creating calendar event:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});