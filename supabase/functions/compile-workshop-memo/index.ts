import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { companyId } = await req.json();
    if (!companyId) {
      return new Response(
        JSON.stringify({ error: "companyId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch workshop responses
    const { data: responses, error: respError } = await supabase
      .from("workshop_responses")
      .select("*")
      .eq("company_id", companyId);

    if (respError) throw respError;

    // Fetch templates for context
    const { data: templates, error: tmpError } = await supabase
      .from("workshop_templates")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (tmpError) throw tmpError;

    // Compile the mini-memo
    const sections = templates.map((template) => {
      const response = responses?.find((r) => r.section_key === template.section_key);
      return {
        title: template.section_title,
        content: response?.answer || "[Not provided]",
      };
    });

    const miniMemo = sections
      .map((s) => `## ${s.title}\n\n${s.content}`)
      .join("\n\n---\n\n");

    // Upsert completion
    const { error: upsertError } = await supabase
      .from("workshop_completions")
      .upsert({
        company_id: companyId,
        completed_at: new Date().toISOString(),
        mini_memo_content: miniMemo,
        mapped_to_profile: false,
      }, { onConflict: "company_id" });

    if (upsertError) throw upsertError;

    return new Response(
      JSON.stringify({ success: true, miniMemo }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error compiling workshop memo:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
