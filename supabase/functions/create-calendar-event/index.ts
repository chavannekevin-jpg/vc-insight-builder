import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
  organizerName?: string;
  organizerEmail?: string;
}

function generateICSContent(
  title: string,
  description: string | undefined,
  location: string | undefined,
  startDateTime: string,
  endDateTime: string,
  organizerName: string,
  organizerEmail: string,
  eventId: string
): string {
  const formatDateForICS = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const now = new Date();
  const dtstamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const uid = `${eventId}@lovable.app`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lovable//Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${formatDateForICS(startDateTime)}`,
    `DTEND:${formatDateForICS(endDateTime)}`,
    `SUMMARY:${title.replace(/\n/g, '\\n')}`,
    `ORGANIZER;CN=${organizerName}:mailto:${organizerEmail}`,
  ];

  if (description) {
    lines.push(`DESCRIPTION:${description.replace(/\n/g, '\\n')}`);
  }

  if (location) {
    lines.push(`LOCATION:${location.replace(/\n/g, '\\n')}`);
  }

  lines.push('STATUS:CONFIRMED');
  lines.push('SEQUENCE:0');
  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatEventTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function generateInviteEmailHtml(
  title: string,
  description: string | undefined,
  location: string | undefined,
  startDateTime: string,
  endDateTime: string,
  organizerName: string
): string {
  const eventDate = formatEventDate(startDateTime);
  const startTime = formatEventTime(startDateTime);
  const endTime = formatEventTime(endDateTime);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Invitation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">📅 You're Invited!</h1>
  </div>
  
  <div style="background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef; border-top: none;">
    <p style="font-size: 16px; margin-top: 0;">
      <strong>${organizerName}</strong> has invited you to an event:
    </p>
    
    <div style="background: white; border-radius: 8px; padding: 24px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h2 style="margin: 0 0 16px 0; color: #333; font-size: 20px;">${title}</h2>
      
      <div style="margin-bottom: 12px;">
        <span style="color: #666; font-size: 14px;">📆 Date:</span>
        <span style="font-weight: 500; margin-left: 8px;">${eventDate}</span>
      </div>
      
      <div style="margin-bottom: 12px;">
        <span style="color: #666; font-size: 14px;">🕐 Time:</span>
        <span style="font-weight: 500; margin-left: 8px;">${startTime} - ${endTime}</span>
      </div>
      
      ${location ? `
      <div style="margin-bottom: 12px;">
        <span style="color: #666; font-size: 14px;">📍 Location:</span>
        <span style="font-weight: 500; margin-left: 8px;">${location}</span>
      </div>
      ` : ''}
      
      ${description ? `
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee;">
        <span style="color: #666; font-size: 14px;">📝 Description:</span>
        <p style="margin: 8px 0 0 0; color: #555;">${description}</p>
      </div>
      ` : ''}
    </div>
    
    <div style="text-align: center; margin-top: 24px;">
      <p style="color: #666; font-size: 14px; margin-bottom: 16px;">
        Download the attached .ics file to add this event to your calendar
      </p>
    </div>
  </div>
  
  <div style="background: #f1f3f4; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e9ecef; border-top: none;">
    <p style="margin: 0; color: #666; font-size: 12px;">
      This invitation was sent via Lovable Calendar
    </p>
  </div>
</body>
</html>
  `;
}

async function sendInviteEmails(
  attendees: string[],
  title: string,
  description: string | undefined,
  location: string | undefined,
  startDateTime: string,
  endDateTime: string,
  organizerName: string,
  organizerEmail: string,
  eventId: string
): Promise<void> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.log('RESEND_API_KEY not configured, skipping email notifications');
    return;
  }
  
  const icsContent = generateICSContent(
    title,
    description,
    location,
    startDateTime,
    endDateTime,
    organizerName,
    organizerEmail,
    eventId
  );

  const htmlContent = generateInviteEmailHtml(
    title,
    description,
    location,
    startDateTime,
    endDateTime,
    organizerName
  );

  // Convert ICS to base64
  const icsBase64 = btoa(icsContent);

  // Send to each attendee
  for (const attendeeEmail of attendees) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${organizerName} <onboarding@resend.dev>`,
          to: [attendeeEmail],
          subject: `📅 Invitation: ${title}`,
          html: htmlContent,
          attachments: [
            {
              filename: 'invite.ics',
              content: icsBase64,
            },
          ],
        }),
      });

      if (response.ok) {
        console.log(`Invite email sent to ${attendeeEmail}`);
      } else {
        const error = await response.text();
        console.error(`Failed to send invite to ${attendeeEmail}:`, error);
      }
    } catch (error) {
      console.error(`Failed to send invite to ${attendeeEmail}:`, error);
    }
  }
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
      reminders,
      organizerName = 'Lovable Calendar',
      organizerEmail = 'noreply@lovable.app'
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

    // Send invite emails to attendees
    if (attendees.length > 0) {
      await sendInviteEmails(
        attendees,
        title,
        description,
        location,
        startDateTime,
        endDateTime,
        organizerName,
        organizerEmail,
        createdEvent.id
      );
    }

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