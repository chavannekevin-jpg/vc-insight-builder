import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { sessionId, companyId } = await req.json();
    logStep("Request data", { sessionId, companyId });

    if (!sessionId || !companyId) {
      throw new Error("Session ID and Company ID are required");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Retrieved session", { 
      paymentStatus: session.payment_status,
      status: session.status 
    });

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Payment not completed" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Verify the session belongs to this user/company
    const metadata = session.metadata || {};
    if (metadata.companyId !== companyId || metadata.userId !== user.id) {
      logStep("Metadata mismatch", { metadata, companyId, userId: user.id });
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Session does not match" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check if already processed
    const { data: existingPurchase } = await supabaseClient
      .from("memo_purchases")
      .select("id")
      .eq("company_id", companyId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingPurchase) {
      logStep("Purchase already processed", { companyId });
      return new Response(JSON.stringify({ success: true, alreadyProcessed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Record the purchase
    const amountPaid = (session.amount_total || 0) / 100;
    const { error: purchaseError } = await supabaseClient
      .from("memo_purchases")
      .insert({
        user_id: user.id,
        company_id: companyId,
        amount_paid: amountPaid,
        discount_code_used: metadata.discountCode || null,
      });

    if (purchaseError) {
      logStep("Error recording purchase", { error: purchaseError });
      throw new Error("Failed to record purchase");
    }
    logStep("Purchase recorded", { companyId, amountPaid });

    // Grant premium access
    const { error: updateError } = await supabaseClient
      .from("companies")
      .update({ has_premium: true })
      .eq("id", companyId);

    if (updateError) {
      logStep("Error granting premium access", { error: updateError });
      throw new Error("Failed to grant premium access");
    }
    logStep("Premium access granted", { companyId });

    // Update discount code usage if applicable
    const discountId = metadata.discountId;
    if (discountId) {
      const { data: currentCode } = await supabaseClient
        .from("discount_codes")
        .select("uses")
        .eq("id", discountId)
        .single();

      if (currentCode) {
        await supabaseClient
          .from("discount_codes")
          .update({ uses: currentCode.uses + 1 })
          .eq("id", discountId);
        logStep("Discount code usage updated", { discountId });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
