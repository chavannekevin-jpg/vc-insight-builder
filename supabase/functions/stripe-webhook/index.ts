import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    // SECURITY: Webhook signature verification is REQUIRED
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    let event: Stripe.Event;

    if (!webhookSecret) {
      logStep("ERROR: STRIPE_WEBHOOK_SECRET is not configured - rejecting request");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!signature) {
      logStep("ERROR: Missing stripe-signature header - rejecting request");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook signature verified successfully");
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Event type", { type: event.type });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      logStep("Processing checkout.session.completed", { 
        sessionId: session.id,
        paymentStatus: session.payment_status 
      });

      if (session.payment_status === "paid") {
        const metadata = session.metadata || {};
        const companyId = metadata.companyId;
        const userId = metadata.userId;
        const discountCode = metadata.discountCode;
        const discountId = metadata.discountId;

        if (!companyId || !userId) {
          logStep("Missing metadata", { companyId, userId });
          return new Response(JSON.stringify({ error: "Missing metadata" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Record the purchase
        const amountPaid = (session.amount_total || 0) / 100;
        const { error: purchaseError } = await supabase
          .from("memo_purchases")
          .insert({
            user_id: userId,
            company_id: companyId,
            amount_paid: amountPaid,
            discount_code_used: discountCode || null,
          });

        if (purchaseError) {
          logStep("Error recording purchase", { error: purchaseError });
        } else {
          logStep("Purchase recorded", { companyId, amountPaid });
        }

        // Grant premium access and 1 generation credit
        const { error: updateError } = await supabase
          .from("companies")
          .update({ 
            has_premium: true,
            generations_available: 1,
            generations_used: 0
          })
          .eq("id", companyId);

        if (updateError) {
          logStep("Error granting premium access", { error: updateError });
        } else {
          logStep("Premium access and generation credit granted", { companyId });
        }

        // Update discount code usage if applicable
        if (discountId) {
          const { data: currentCode } = await supabase
            .from("discount_codes")
            .select("uses")
            .eq("id", discountId)
            .single();

          if (currentCode) {
            await supabase
              .from("discount_codes")
              .update({ uses: currentCode.uses + 1 })
              .eq("id", discountId);
            logStep("Discount code usage updated", { discountId });
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
