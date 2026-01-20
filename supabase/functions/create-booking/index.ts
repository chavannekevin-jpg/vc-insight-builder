import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate ICS file content for calendar attachment
function generateICSContent(
  eventTitle: string,
  startTime: Date,
  endTime: Date,
  description: string,
  organizerName: string,
  organizerEmail: string,
  attendeeEmail: string,
  attendeeName: string
): string {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const uid = `booking-${Date.now()}@lovable.app`;
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Lovable//Booking Calendar//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startTime)}
DTEND:${formatDate(endTime)}
SUMMARY:${eventTitle}
DESCRIPTION:${description.replace(/\n/g, '\\n')}
ORGANIZER;CN=${organizerName}:mailto:${organizerEmail}
ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=${attendeeName}:mailto:${attendeeEmail}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
}

// Format date for email display
function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// Format time for email display
function formatEventTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

// Generate confirmation email HTML
function generateBookingConfirmationEmail(
  eventName: string,
  startTime: string,
  endTime: string,
  organizerName: string,
  bookerName: string,
  notes?: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 28px;">✓</span>
            </div>
            <h1 style="margin: 0; color: #18181b; font-size: 24px; font-weight: 600;">Meeting Confirmed!</h1>
          </div>
          
          <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Hi ${bookerName},<br><br>
            Your meeting with <strong>${organizerName}</strong> has been confirmed.
          </p>
          
          <div style="background: #f4f4f5; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h2 style="margin: 0 0 15px 0; color: #18181b; font-size: 18px; font-weight: 600;">${eventName}</h2>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <span style="color: #71717a; font-size: 14px;">📅</span>
              <span style="color: #3f3f46; font-size: 14px; margin-left: 8px;">${formatEventDate(startTime)}</span>
            </div>
            <div style="display: flex; align-items: center;">
              <span style="color: #71717a; font-size: 14px;">🕐</span>
              <span style="color: #3f3f46; font-size: 14px; margin-left: 8px;">${formatEventTime(startTime)} - ${formatEventTime(endTime)}</span>
            </div>
            ${notes ? `
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e4e4e7;">
              <span style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Notes</span>
              <p style="color: #3f3f46; font-size: 14px; margin: 5px 0 0 0;">${notes}</p>
            </div>
            ` : ''}
          </div>
          
          <p style="color: #71717a; font-size: 14px; line-height: 1.6; margin-bottom: 0;">
            An .ics calendar file is attached to this email. Open it to add this event to your calendar.
          </p>
        </div>
        
        <p style="text-align: center; color: #a1a1aa; font-size: 12px; margin-top: 20px;">
          Powered by Lovable
        </p>
      </div>
    </body>
    </html>
  `;
}

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

        // Get investor profile for name and email
        const { data: investorProfile } = await supabase
          .from('investor_profiles')
          .select('full_name, organization_name')
          .eq('id', investorId)
          .single();

        // Get investor's email from profiles table
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', investorId)
          .single();

        const investorEmail = userProfile?.email || 'noreply@lovable.app';
        const investorName = investorProfile?.full_name || 'Investor';

        // Create calendar event with sendUpdates=all to send invitations
        const calendarResponse = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${tokenData.calendar_id || 'primary'}/events?sendUpdates=all`,
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

        // Send confirmation email with ICS attachment to the booker
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        if (resendApiKey) {
          try {
            const eventTitle = `${eventType.name} with ${investorName}`;
            const description = `Meeting with ${investorName}${investorProfile?.organization_name ? ` from ${investorProfile.organization_name}` : ''}${notes ? `\\n\\nNotes: ${notes}` : ''}`;
            
            const icsContent = generateICSContent(
              eventTitle,
              startDate,
              endDate,
              description,
              investorName,
              investorEmail,
              bookerEmail,
              bookerName
            );

            const emailHtml = generateBookingConfirmationEmail(
              eventTitle,
              startDate.toISOString(),
              endDate.toISOString(),
              investorName,
              bookerName,
              notes
            );

            const icsBase64 = btoa(icsContent);

            const emailResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: `${investorName} <onboarding@resend.dev>`,
                to: [bookerEmail],
                subject: `Meeting Confirmed: ${eventTitle}`,
                html: emailHtml,
                attachments: [
                  {
                    filename: 'meeting.ics',
                    content: icsBase64,
                    content_type: 'text/calendar'
                  }
                ]
              })
            });

            if (!emailResponse.ok) {
              const errorData = await emailResponse.text();
              console.error('Failed to send confirmation email:', errorData);
            } else {
              console.log('Confirmation email sent to:', bookerEmail);
            }
          } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
          }
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
