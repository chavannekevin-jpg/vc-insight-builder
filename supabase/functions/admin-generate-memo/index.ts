import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      return new Response(JSON.stringify({ error: "Backend misconfiguration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    // Authenticate user
    const { data: userResult, error: userError } = await supabaseUser.auth.getUser();
    const user = userResult?.user;
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify admin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) {
      console.error("Role check error:", roleError);
      return new Response(JSON.stringify({ error: "Failed role check" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const { companyId } = await req.json();
    
    if (!companyId) {
      return new Response(JSON.stringify({ error: "companyId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[admin-generate-memo] Admin ${user.email} triggering memo for company ${companyId}`);

    // Verify company exists and get its data
    const { data: company, error: companyError } = await supabaseAdmin
      .from("companies")
      .select("id, name, stage, has_premium, generations_available, generations_used")
      .eq("id", companyId)
      .single();

    if (companyError || !company) {
      console.error("Company not found:", companyError);
      return new Response(JSON.stringify({ error: "Company not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[admin-generate-memo] Company found: ${company.name}, premium: ${company.has_premium}, generations: ${company.generations_available}`);

    // Create a memo generation job
    const { data: job, error: jobError } = await supabaseAdmin
      .from("memo_generation_jobs")
      .insert({
        company_id: companyId,
        status: "pending",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (jobError) {
      console.error("Failed to create job:", jobError);
      return new Response(JSON.stringify({ error: "Failed to create generation job" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[admin-generate-memo] Created job: ${job.id}`);

    // Trigger generate-full-memo directly (it handles its own processing)
    // We don't wait for completion - just kick it off
    const triggerGeneration = fetch(`${SUPABASE_URL}/functions/v1/generate-full-memo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        companyId,
        jobId: job.id,
        isAdminTriggered: true,
      }),
    }).then(async (response) => {
      const result = await response.json();
      
      if (!response.ok) {
        console.error(`[admin-generate-memo] generate-full-memo failed:`, result);
        
        // Update job status to failed
        await supabaseAdmin
          .from("memo_generation_jobs")
          .update({
            status: "failed",
            error_message: result.error || "Unknown error",
            completed_at: new Date().toISOString(),
          })
          .eq("id", job.id);
      } else {
        console.log(`[admin-generate-memo] generate-full-memo triggered for job ${job.id}`);
      }
    }).catch(async (error) => {
      console.error(`[admin-generate-memo] Generation trigger error:`, error);
      
      // Update job status to failed
      await supabaseAdmin
        .from("memo_generation_jobs")
        .update({
          status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown error",
          completed_at: new Date().toISOString(),
        })
        .eq("id", job.id);
    });

    // Don't await - let it run in background
    // The generate-full-memo function will update the job status when done

    return new Response(
      JSON.stringify({
        success: true,
        jobId: job.id,
        message: "Memo generation started in background",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("admin-generate-memo error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
