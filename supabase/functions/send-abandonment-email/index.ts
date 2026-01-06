import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Default template content as fallback
const DEFAULT_SUBJECT = "You stopped right before the interesting part...";
const DEFAULT_CONTENT = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <p style="color: #333; line-height: 1.6; margin-bottom: 16px;">
      Hey there 👋
    </p>
    
    <p style="color: #333; line-height: 1.6; margin-bottom: 16px;">
      You started building your investment memo on VC Brain — and stopped just before the part where things get real.
    </p>
    
    <p style="color: #333; line-height: 1.6; margin-bottom: 16px;">
      This is usually the moment where VCs quietly decide:
    </p>
    
    <p style="color: #555; font-style: italic; line-height: 1.6; margin-bottom: 16px; padding-left: 16px; border-left: 3px solid #7c3aed;">
      "Interesting… but not for us."
    </p>
    
    <p style="color: #333; line-height: 1.6; margin-bottom: 16px;">
      Not because the startup is bad —<br>
      but because something in the story doesn't survive investor scrutiny.
    </p>
    
    <p style="color: #333; line-height: 1.6; margin-bottom: 12px;">
      By finishing your analysis (~10 minutes), you unlock a <strong>9-page VC-style report</strong> that shows:
    </p>
    
    <ul style="color: #333; line-height: 1.8; margin-bottom: 20px; padding-left: 20px;">
      <li>Where investors lose conviction without telling you</li>
      <li>Which assumptions weaken your round before it starts</li>
      <li>How your narrative actually sounds from the other side of the table</li>
    </ul>
    
    <p style="color: #333; line-height: 1.6; margin-bottom: 16px;">
      This isn't pitch advice.<br>
      It's how VCs internally evaluate whether to move forward or pass.
    </p>
    
    <p style="color: #333; line-height: 1.6; margin-bottom: 8px;">
      <strong>In short:</strong>
    </p>
    <p style="color: #333; line-height: 1.6; margin-bottom: 24px;">
      👉 Stop pitching like a founder<br>
      👉 Start explaining your startup like a VC would
    </p>
    
    <p style="color: #333; line-height: 1.6; margin-bottom: 16px;">
      You're already partway through.<br>
      Finish the analysis and see what investors really see.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://vc-brain.com/" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        👉 Continue my VC analysis
      </a>
    </div>
  </div>
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting abandonment email check...");
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch the email template from the database
    console.log("Fetching abandonment email template from database...");
    const { data: template, error: templateError } = await supabase
      .from("email_templates")
      .select("subject, content")
      .eq("automation_key", "abandonment_24h")
      .eq("is_active", true)
      .single();

    if (templateError) {
      console.log("Template not found in DB, using default:", templateError.message);
    }

    const emailSubject = template?.subject || DEFAULT_SUBJECT;
    const emailContent = template?.content || DEFAULT_CONTENT;
    
    console.log(`Using template - Subject: "${emailSubject}"`);

    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    console.log(`Looking for users who signed up before: ${twentyFourHoursAgo}`);

    // Get users who have purchased
    const { data: purchasedUsers, error: purchaseError } = await supabase
      .from("memo_purchases")
      .select("user_id");
    
    if (purchaseError) {
      console.error("Error fetching purchased users:", purchaseError);
      throw purchaseError;
    }

    // Get users who have already received this email
    const { data: emailedUsers, error: emailedError } = await supabase
      .from("sent_emails")
      .select("user_id")
      .eq("email_type", "abandonment_24h");
    
    if (emailedError) {
      console.error("Error fetching emailed users:", emailedError);
      throw emailedError;
    }

    const purchasedSet = new Set((purchasedUsers || []).map(p => p.user_id));
    const emailedSet = new Set((emailedUsers || []).map(e => e.user_id));
    
    console.log(`Users who have purchased: ${purchasedSet.size}`);
    console.log(`Users who have already received abandonment email: ${emailedSet.size}`);

    // Get all profiles created more than 24 hours ago
    const { data: allProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, created_at")
      .lt("created_at", twentyFourHoursAgo);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    // Filter to users who haven't purchased and haven't been emailed
    const usersToEmail = (allProfiles || []).filter(
      user => !purchasedSet.has(user.id) && !emailedSet.has(user.id) && user.email
    );

    console.log(`Found ${usersToEmail.length} users eligible for abandonment email`);

    let sentCount = 0;
    let errorCount = 0;

    for (const user of usersToEmail) {
      try {
        console.log(`Sending abandonment email to: ${user.email}`);
        
        // Add rate limiting delay (500ms between emails)
        if (sentCount > 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Send email via Resend
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Kev from VC Brain <kev@updates.vc-brain.com>",
            to: [user.email],
            subject: emailSubject,
            html: emailContent,
            reply_to: "kev@vc-brain.com",
          }),
        });

        if (emailResponse.ok) {
          // Record that we sent this email
          const { error: insertError } = await supabase.from("sent_emails").insert({
            user_id: user.id,
            email_type: "abandonment_24h",
          });

          if (insertError) {
            console.error(`Error recording sent email for ${user.email}:`, insertError);
          }
          
          sentCount++;
          console.log(`✓ Sent abandonment email to ${user.email}`);
        } else {
          const errorData = await emailResponse.json();
          console.error(`✗ Failed to send to ${user.email}:`, errorData);
          errorCount++;
        }
      } catch (emailError) {
        console.error(`✗ Error sending to ${user.email}:`, emailError);
        errorCount++;
      }
    }

    console.log(`Completed: Sent ${sentCount} emails, ${errorCount} errors`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: sentCount, 
        errors: errorCount,
        eligible: usersToEmail.length,
        templateSource: template ? "database" : "default"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-abandonment-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
