// Extract insights from paid audits for profile enrichment
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyId } = await req.json();

    if (!companyId) {
      return new Response(
        JSON.stringify({ success: false, error: "Company ID required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Check if company has paid audit and hasn't been extracted yet
    const { data: company, error: companyError } = await supabaseClient
      .from("companies")
      .select("id, has_premium, memo_content_generated, audit_insights_extracted")
      .eq("id", companyId)
      .single();

    if (companyError || !company) {
      return new Response(
        JSON.stringify({ success: false, error: "Company not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!company.has_premium || !company.memo_content_generated) {
      return new Response(
        JSON.stringify({ success: false, error: "No paid audit available" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (company.audit_insights_extracted) {
      return new Response(
        JSON.stringify({ success: true, message: "Audit insights already extracted", extracted: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Fetch the memo with structured_content
    const { data: memo, error: memoError } = await supabaseClient
      .from("memos")
      .select("id, structured_content")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (memoError || !memo?.structured_content) {
      return new Response(
        JSON.stringify({ success: false, error: "No memo content found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Fetch tool data (section scores, etc.)
    const { data: toolData } = await supabaseClient
      .from("memo_tool_data")
      .select("section_name, tool_name, ai_generated_data")
      .eq("company_id", companyId);

    const content = memo.structured_content as Record<string, unknown>;
    const enrichmentsToQueue: Array<{
      company_id: string;
      source_type: string;
      source_tool: string;
      input_data: Record<string, unknown>;
      target_section_hint: string | null;
    }> = [];

    // 4. Extract from VC Quick Take
    if (content.vcQuickTake) {
      const quickTake = content.vcQuickTake as Record<string, unknown>;
      enrichmentsToQueue.push({
        company_id: companyId,
        source_type: "audit_insight",
        source_tool: "vc_quick_take",
        input_data: {
          verdict: quickTake.verdict,
          strengths: quickTake.strengths,
          weaknesses: quickTake.weaknesses,
          summary: quickTake.summary
        },
        target_section_hint: null
      });
    }

    // 5. Extract from section narratives
    const sections = content.sections as Array<Record<string, unknown>> || [];
    for (const section of sections) {
      if (section.narrative && typeof section.narrative === 'string' && section.narrative.length > 50) {
        enrichmentsToQueue.push({
          company_id: companyId,
          source_type: "audit_insight",
          source_tool: `audit_${section.name || 'unknown'}`,
          input_data: {
            narrative: section.narrative,
            sectionName: section.name
          },
          target_section_hint: section.name as string || null
        });
      }
    }

    // 6. Extract from tool data (section scores with improvements)
    if (toolData) {
      for (const tool of toolData) {
        if (tool.tool_name === "sectionScore" && tool.ai_generated_data) {
          const scoreData = tool.ai_generated_data as Record<string, unknown>;
          if (scoreData.improvementAreas || scoreData.rationale) {
            enrichmentsToQueue.push({
              company_id: companyId,
              source_type: "audit_insight",
              source_tool: `score_${tool.section_name}`,
              input_data: {
                score: scoreData.score,
                rationale: scoreData.rationale,
                improvements: scoreData.improvementAreas
              },
              target_section_hint: tool.section_name
            });
          }
        }
      }
    }

    // 7. Insert all enrichments
    if (enrichmentsToQueue.length > 0) {
      const { error: insertError } = await supabaseClient
        .from("profile_enrichment_queue")
        .insert(enrichmentsToQueue);

      if (insertError) {
        console.error("Error inserting enrichments:", insertError);
      }
    }

    // 8. Mark company as extracted
    await supabaseClient
      .from("companies")
      .update({ audit_insights_extracted: true })
      .eq("id", companyId);

    console.log(`Extracted ${enrichmentsToQueue.length} insights from audit for company ${companyId}`);

    return new Response(
      JSON.stringify({
        success: true,
        extracted: enrichmentsToQueue.length,
        sources: enrichmentsToQueue.map(e => e.source_tool)
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error extracting audit insights:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
