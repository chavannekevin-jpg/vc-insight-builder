import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ACCELERATOR-ADMIN-BYPASS] ${step}${detailsStr}`);
};

// Admin emails that can bypass the paywall
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
    
    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Verify user is an admin
    if (!user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      throw new Error("Unauthorized: Admin access required");
    }
    logStep("Admin verified");

    const { acceleratorName } = await req.json();
    if (!acceleratorName) throw new Error("Accelerator name is required");
    logStep("Request data", { acceleratorName });

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

    // Create the accelerator (bypassing payment)
    const { data: newAccelerator, error: createError } = await supabaseAdmin
      .from("accelerators")
      .insert({
        name: acceleratorName,
        slug,
        ecosystem_head_id: user.id,
        stripe_payment_id: "admin_bypass",
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

    logStep("Admin bypass complete", { acceleratorId: newAccelerator.id });

    return new Response(JSON.stringify({ 
      success: true, 
      acceleratorId: newAccelerator.id,
      bypassed: true 
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
