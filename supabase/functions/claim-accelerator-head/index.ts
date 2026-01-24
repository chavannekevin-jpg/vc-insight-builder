import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CLAIM-ACCELERATOR-HEAD] ${step}${detailsStr}`);
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

    const { claimToken } = await req.json();
    if (!claimToken) throw new Error("Claim token is required");
    logStep("Claim token received", { claimToken });

    // Find the pending member entry with this claim token
    const { data: pendingMember, error: memberError } = await supabaseAdmin
      .from("accelerator_members")
      .select("id, accelerator_id, role, invite_email, joined_at")
      .eq("invite_token", claimToken)
      .eq("role", "head")
      .maybeSingle();

    if (memberError) {
      logStep("Error finding pending member", { error: memberError });
      throw new Error("Failed to validate claim token");
    }

    if (!pendingMember) {
      throw new Error("Invalid or expired claim token");
    }

    if (pendingMember.joined_at) {
      throw new Error("This ecosystem has already been claimed");
    }

    logStep("Pending member found", { 
      memberId: pendingMember.id, 
      acceleratorId: pendingMember.accelerator_id,
      inviteEmail: pendingMember.invite_email 
    });

    // Optional: Verify email matches if invite_email was set
    if (pendingMember.invite_email && user.email) {
      if (pendingMember.invite_email.toLowerCase() !== user.email.toLowerCase()) {
        logStep("Email mismatch", { 
          expected: pendingMember.invite_email, 
          actual: user.email 
        });
        throw new Error(`This invite is for ${pendingMember.invite_email}. Please sign in with that email.`);
      }
    }

    // Get accelerator details
    const { data: accelerator, error: accError } = await supabaseAdmin
      .from("accelerators")
      .select("id, name, onboarding_completed")
      .eq("id", pendingMember.accelerator_id)
      .single();

    if (accError || !accelerator) {
      throw new Error("Accelerator not found");
    }
    logStep("Accelerator found", { name: accelerator.name });

    // Update the accelerator's ecosystem_head_id to the claiming user
    const { error: updateAccError } = await supabaseAdmin
      .from("accelerators")
      .update({
        ecosystem_head_id: user.id,
        pending_head_email: null, // Clear the pending email
      })
      .eq("id", accelerator.id);

    if (updateAccError) {
      logStep("Error updating accelerator", { error: updateAccError });
      throw new Error("Failed to transfer ownership");
    }
    logStep("Accelerator ownership transferred");

    // Update the member record: set user_id, joined_at, clear token
    const { error: updateMemberError } = await supabaseAdmin
      .from("accelerator_members")
      .update({
        user_id: user.id,
        joined_at: new Date().toISOString(),
        invite_token: null, // Clear the token after use
      })
      .eq("id", pendingMember.id);

    if (updateMemberError) {
      logStep("Error updating member", { error: updateMemberError });
      throw new Error("Failed to update membership");
    }
    logStep("Member record updated");

    // Add accelerator role to user
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .upsert({
        user_id: user.id,
        role: "accelerator",
      }, { onConflict: "user_id,role" });

    if (roleError) {
      logStep("Error adding role (non-fatal)", { error: roleError });
    } else {
      logStep("Accelerator role added");
    }

    return new Response(JSON.stringify({ 
      success: true, 
      acceleratorId: accelerator.id,
      acceleratorName: accelerator.name,
      onboardingCompleted: accelerator.onboarding_completed,
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
