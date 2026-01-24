import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-ACCELERATOR-FOR-HEAD] ${step}${detailsStr}`);
};

// Admin emails that can pre-create accelerators
const ADMIN_EMAILS = ["chavanne.kevin@gmail.com"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }
    
    const adminUser = userData.user;
    logStep("User authenticated", { userId: adminUser.id, email: adminUser.email });

    // Verify user is an admin
    if (!adminUser.email || !ADMIN_EMAILS.includes(adminUser.email.toLowerCase())) {
      throw new Error("Unauthorized: Admin access required");
    }
    logStep("Admin verified");

    const { acceleratorName, headEmail, discountPercent, maxDiscountedStartups } = await req.json();
    if (!acceleratorName) throw new Error("Accelerator name is required");
    
    // Default to 100% discount if not specified
    const discount = discountPercent !== undefined ? discountPercent : 100;
    const maxStartups = maxDiscountedStartups || null;
    
    logStep("Request data", { acceleratorName, headEmail, discount, maxStartups });

    // Generate unique slug
    const baseSlug = acceleratorName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const { data: existing } = await supabaseAdmin
        .from("accelerators")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    logStep("Generated slug", { slug });

    // Generate a unique claim token
    const claimToken = crypto.randomUUID();
    logStep("Generated claim token", { claimToken });

    // Create the accelerator with admin as temporary head
    const { data: newAccelerator, error: createError } = await supabaseAdmin
      .from("accelerators")
      .insert({
        name: acceleratorName,
        slug,
        ecosystem_head_id: adminUser.id, // Admin as temporary placeholder
        stripe_payment_id: "admin_precreated",
        paid_at: new Date().toISOString(),
        pending_head_email: headEmail || null, // Optional email for validation
        default_discount_percent: discount,
        max_discounted_startups: maxStartups,
      })
      .select("id")
      .single();

    if (createError) {
      logStep("Error creating accelerator", { error: createError });
      throw new Error(`Failed to create accelerator: ${createError.message}`);
    }
    logStep("Accelerator created", { acceleratorId: newAccelerator.id });

    // Create a pending head member entry with the claim token
    const { error: memberError } = await supabaseAdmin
      .from("accelerator_members")
      .insert({
        accelerator_id: newAccelerator.id,
        user_id: adminUser.id, // Temporary placeholder
        role: "head",
        invite_token: claimToken,
        invite_email: headEmail || null,
        invited_at: new Date().toISOString(),
        invited_by: adminUser.id,
        joined_at: null, // Not claimed yet
      });

    if (memberError) {
      logStep("Error creating pending member", { error: memberError });
      // Clean up the accelerator if member creation fails
      await supabaseAdmin.from("accelerators").delete().eq("id", newAccelerator.id);
      throw new Error(`Failed to create pending membership: ${memberError.message}`);
    }
    logStep("Pending head member created");

    // Generate the claim link
    const claimLink = `/accelerator/auth?claim=${claimToken}`;
    logStep("Claim link generated", { claimLink });

    return new Response(JSON.stringify({ 
      success: true, 
      acceleratorId: newAccelerator.id,
      claimToken,
      claimLink,
      slug,
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
