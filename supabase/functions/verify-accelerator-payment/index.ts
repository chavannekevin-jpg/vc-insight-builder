import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-ACCELERATOR] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Session ID is required");
    logStep("Session ID received", { sessionId });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Session retrieved", { status: session.payment_status, metadata: session.metadata });

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    // Verify this session belongs to the user
    if (session.metadata?.userId !== user.id) {
      throw new Error("Session does not belong to this user");
    }

    // Check if accelerator already exists for this session
    const { data: existingAccelerator } = await supabaseAdmin
      .from("accelerators")
      .select("id")
      .eq("stripe_payment_id", sessionId)
      .maybeSingle();

    if (existingAccelerator) {
      logStep("Accelerator already created", { acceleratorId: existingAccelerator.id });
      return new Response(JSON.stringify({ 
        success: true, 
        acceleratorId: existingAccelerator.id,
        alreadyExists: true 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Generate unique slug
    const baseName = session.metadata?.acceleratorName || "My Accelerator";
    const baseSlug = baseName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    let slug = baseSlug;
    let counter = 0;
    let slugExists = true;
    
    while (slugExists) {
      const { data: existing } = await supabaseAdmin
        .from("accelerators")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      
      if (!existing) {
        slugExists = false;
      } else {
        counter++;
        slug = `${baseSlug}-${counter}`;
      }
    }

    // Create the accelerator
    const { data: newAccelerator, error: createError } = await supabaseAdmin
      .from("accelerators")
      .insert({
        name: baseName,
        slug,
        ecosystem_head_id: user.id,
        stripe_payment_id: sessionId,
        paid_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (createError) {
      logStep("Error creating accelerator", { error: createError });
      throw new Error(`Failed to create accelerator: ${createError.message}`);
    }

    logStep("Accelerator created", { acceleratorId: newAccelerator.id });

    // Add the user as ecosystem head member
    const { error: memberError } = await supabaseAdmin
      .from("accelerator_members")
      .insert({
        accelerator_id: newAccelerator.id,
        user_id: user.id,
        role: "head",
        joined_at: new Date().toISOString(),
      });

    if (memberError) {
      logStep("Error adding member", { error: memberError });
    }

    // Add accelerator role to user
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .upsert({
        user_id: user.id,
        role: "accelerator",
      }, { onConflict: "user_id,role" });

    if (roleError) {
      logStep("Error adding role", { error: roleError });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      acceleratorId: newAccelerator.id,
      alreadyExists: false 
    }), {
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
