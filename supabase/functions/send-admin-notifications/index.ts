import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const ADMIN_EMAIL = "chavanne.kevin@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "VC Brain Alerts <kev@updates.vc-brain.com>",
        to: [to],
        subject,
        html,
        reply_to: "kev@vc-brain.com",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Resend API error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

const NOTIFICATIONS_DISABLED = false;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (NOTIFICATIONS_DISABLED) {
    console.log("Admin notifications are disabled; exiting.");
    return new Response(JSON.stringify({ success: true, disabled: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    console.log("Starting admin notifications check...");

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get new signups that haven't been notified
    const { data: newSignups, error: signupsError } = await supabase
      .from("profiles")
      .select("id, email, created_at")
      .eq("admin_notified_signup", false)
      .order("created_at", { ascending: true });

    if (signupsError) {
      console.error("Error fetching new signups:", signupsError);
    }

    // Get new purchases that haven't been notified
    const { data: newPurchases, error: purchasesError } = await supabase
      .from("memo_purchases")
      .select(`
        id,
        amount,
        discount_code,
        created_at,
        user_id,
        company_id,
        companies (name)
      `)
      .eq("admin_notified", false)
      .order("created_at", { ascending: true });

    if (purchasesError) {
      console.error("Error fetching new purchases:", purchasesError);
    }

    let signupNotifications = 0;
    let purchaseNotifications = 0;
    const errors: string[] = [];

    // Send signup notifications
    if (newSignups && newSignups.length > 0) {
      console.log(`Found ${newSignups.length} new signups to notify about`);

      for (const signup of newSignups) {
        const subject = `🆕 New User Signup - ${signup.email}`;
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">New User Registered</h2>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
              <p><strong>Email:</strong> ${signup.email}</p>
              <p><strong>Signed up:</strong> ${formatDate(signup.created_at)}</p>
            </div>
            <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
              This is an automated notification from VC Brain.
            </p>
          </div>
        `;

        const sent = await sendEmail(ADMIN_EMAIL, subject, html);
        
        if (sent) {
          // Mark as notified
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ admin_notified_signup: true })
            .eq("id", signup.id);

          if (updateError) {
            console.error(`Error updating signup notification status for ${signup.email}:`, updateError);
            errors.push(`Failed to update status for signup ${signup.email}`);
          } else {
            signupNotifications++;
            console.log(`Notified admin about signup: ${signup.email}`);
          }
        } else {
          errors.push(`Failed to send signup notification for ${signup.email}`);
        }

        // Small delay between emails
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    // Send purchase notifications
    if (newPurchases && newPurchases.length > 0) {
      console.log(`Found ${newPurchases.length} new purchases to notify about`);

      // Get user emails for purchases
      const userIds = newPurchases.map((p) => p.user_id);
      const { data: users } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds);

      const userEmailMap = new Map(users?.map((u) => [u.id, u.email]) || []);

      for (const purchase of newPurchases) {
        const userEmail = userEmailMap.get(purchase.user_id) || "Unknown";
        const companyName = (purchase.companies as any)?.name || "Unknown Company";
        const amount = (purchase.amount / 100).toFixed(2);

        const subject = `💰 New Memo Purchase - $${amount}`;
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">New Memo Purchased!</h2>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
              <p><strong>User:</strong> ${userEmail}</p>
              <p><strong>Company:</strong> ${companyName}</p>
              <p><strong>Amount:</strong> $${amount}</p>
              ${purchase.discount_code ? `<p><strong>Discount:</strong> ${purchase.discount_code}</p>` : ""}
              <p><strong>Purchased:</strong> ${formatDate(purchase.created_at)}</p>
            </div>
            <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
              This is an automated notification from VC Brain.
            </p>
          </div>
        `;

        const sent = await sendEmail(ADMIN_EMAIL, subject, html);
        
        if (sent) {
          // Mark as notified
          const { error: updateError } = await supabase
            .from("memo_purchases")
            .update({ admin_notified: true })
            .eq("id", purchase.id);

          if (updateError) {
            console.error(`Error updating purchase notification status:`, updateError);
            errors.push(`Failed to update status for purchase ${purchase.id}`);
          } else {
            purchaseNotifications++;
            console.log(`Notified admin about purchase: $${amount} from ${userEmail}`);
          }
        } else {
          errors.push(`Failed to send purchase notification for ${purchase.id}`);
        }

        // Small delay between emails
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    const result = {
      success: true,
      signupNotifications,
      purchaseNotifications,
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log("Admin notifications complete:", result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-admin-notifications:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
