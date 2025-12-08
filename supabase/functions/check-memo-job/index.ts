import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await anonClient.auth.getUser(token);
    
    if (authError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;
    const { jobId } = await req.json();

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: "Job ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch job status
    const { data: job, error: jobError } = await supabaseClient
      .from("memo_generation_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      console.error("Job not found:", jobError);
      return new Response(
        JSON.stringify({ error: "Job not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user owns the company associated with this job
    const { data: company, error: companyError } = await supabaseClient
      .from("companies")
      .select("founder_id, name, stage, category, description")
      .eq("id", job.company_id)
      .single();

    if (companyError || !company) {
      return new Response(
        JSON.stringify({ error: "Company not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (company.founder_id !== userId) {
      return new Response(
        JSON.stringify({ error: "Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If job is completed, fetch the memo content
    if (job.status === "completed") {
      const { data: memo, error: memoError } = await supabaseClient
        .from("memos")
        .select("structured_content, id")
        .eq("company_id", job.company_id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (memoError || !memo) {
        console.error("Memo not found after job completion:", memoError);
        return new Response(
          JSON.stringify({ 
            status: "failed",
            error: "Memo not found after generation"
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const elapsedTime = job.completed_at 
        ? Math.round((new Date(job.completed_at).getTime() - new Date(job.started_at).getTime()) / 1000)
        : null;

      return new Response(
        JSON.stringify({
          status: "completed",
          structuredContent: memo.structured_content,
          company: {
            name: company.name,
            stage: company.stage,
            category: company.category,
            description: company.description
          },
          memoId: memo.id,
          generationTime: elapsedTime ? `${elapsedTime}` : null
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If job failed, return error
    if (job.status === "failed") {
      return new Response(
        JSON.stringify({
          status: "failed",
          error: job.error_message || "Memo generation failed"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Job is still processing
    const elapsedSeconds = Math.round((Date.now() - new Date(job.started_at).getTime()) / 1000);
    
    return new Response(
      JSON.stringify({
        status: job.status,
        elapsedSeconds,
        message: getProgressMessage(elapsedSeconds)
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error checking job status:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getProgressMessage(elapsedSeconds: number): string {
  if (elapsedSeconds < 10) return "Initializing analysis...";
  if (elapsedSeconds < 25) return "Extracting market context...";
  if (elapsedSeconds < 45) return "Researching competitors...";
  if (elapsedSeconds < 65) return "Generating Problem & Solution sections...";
  if (elapsedSeconds < 85) return "Generating Market & Competition sections...";
  if (elapsedSeconds < 105) return "Generating Team & Business Model sections...";
  if (elapsedSeconds < 125) return "Generating Traction & Vision sections...";
  if (elapsedSeconds < 145) return "Creating Investment Thesis...";
  if (elapsedSeconds < 165) return "Generating VC Quick Take...";
  return "Finalizing your memo...";
}
