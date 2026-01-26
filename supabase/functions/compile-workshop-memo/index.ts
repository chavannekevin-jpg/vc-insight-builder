import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Section mapping: workshop section_key -> memo_responses question_key
const SECTION_MAPPING: Record<string, string> = {
  problem: "problem_description",
  solution: "solution_description",
  market: "market_size",
  business_model: "revenue_model",
  gtm: "go_to_market",
  team: "team_background",
  funding_strategy: "funding_plan",
  investment_thesis: "investment_ask",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
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

    // Fetch templates for context (including benchmark examples)
    const { data: templates, error: tmpError } = await supabase
      .from("workshop_templates")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (tmpError) throw tmpError;

    // Fetch company info for context
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("name, stage, category, description")
      .eq("id", companyId)
      .single();

    if (companyError) throw companyError;

    // Build the AI prompt with benchmark examples for each section
    const sectionsForAI = templates.map((template) => {
      const response = responses?.find((r) => r.section_key === template.section_key);
      return {
        sectionKey: template.section_key,
        title: template.section_title,
        founderInput: response?.answer || "",
        benchmarkExample: template.benchmark_example || "",
        benchmarkTips: template.benchmark_tips || [],
      };
    });

    // Create the AI prompt
    const aiPrompt = `You are an expert investment memo writer helping founders articulate their startup story in professional investor language.

COMPANY CONTEXT:
- Name: ${company.name}
- Stage: ${company.stage}
- Category: ${company.category || "Not specified"}
- Description: ${company.description || "Not provided"}

YOUR TASK:
Transform each founder's raw input into polished, investor-ready prose. Use the benchmark example as a style guide - match the tone, structure, and level of detail. Enhance with your knowledge where appropriate, but stay faithful to the founder's core message.

SECTIONS TO TRANSFORM:
${sectionsForAI.map((s, i) => `
---
SECTION ${i + 1}: ${s.title}
Section Key: ${s.sectionKey}

FOUNDER'S INPUT:
${s.founderInput || "[No input provided]"}

BENCHMARK EXAMPLE (use as style guide):
${s.benchmarkExample || "[No benchmark available]"}

KEY ELEMENTS TO INCLUDE:
${(s.benchmarkTips as string[])?.join("\n- ") || "- Professional investor language\n- Specific metrics where available\n- Clear, concise statements"}
---
`).join("\n")}

INSTRUCTIONS:
1. For each section, produce a polished paragraph that:
   - Maintains the founder's core message and facts
   - Matches the benchmark's professional tone and structure
   - Adds clarity and investor-focused framing
   - Includes specific numbers/metrics if the founder provided them
   - Fills gaps tactfully without inventing false data

2. If a section has no founder input, create a brief placeholder noting what information is needed.

3. Return your response as valid JSON in this exact format:
{
  "sections": [
    {
      "sectionKey": "problem",
      "title": "The Problem",
      "enhancedContent": "The polished, investor-ready paragraph..."
    }
  ],
  "executiveSummary": "A 2-3 sentence executive summary of the entire investment opportunity"
}

Respond ONLY with valid JSON, no markdown code blocks or explanations.`;

    // Call the Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an expert investment memo writer. Transform founder inputs into polished, professional investor communications. Match the style of provided benchmark examples. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: aiPrompt,
          },
        ],
        temperature: 0.4,
        max_tokens: 6000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || "";

    // Parse AI response
    let parsedAI;
    try {
      // Remove markdown code blocks if present
      let jsonText = aiContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsedAI = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent);
      // Fallback to simple concatenation if AI fails
      parsedAI = {
        sections: sectionsForAI.map((s) => ({
          sectionKey: s.sectionKey,
          title: s.title,
          enhancedContent: s.founderInput || "[Not provided]",
        })),
        executiveSummary: `${company.name} is a ${company.stage} startup in the ${company.category || "technology"} space.`,
      };
    }

    // Build the final mini-memo
    const miniMemo = [
      `# Investment Mini-Memorandum: ${company.name}`,
      "",
      `**Executive Summary:** ${parsedAI.executiveSummary}`,
      "",
      "---",
      "",
      ...parsedAI.sections.map((s: { title: string; enhancedContent: string }) => 
        `## ${s.title}\n\n${s.enhancedContent}`
      ),
    ].join("\n");

    // Upsert completion record
    const { error: upsertError } = await supabase
      .from("workshop_completions")
      .upsert({
        company_id: companyId,
        completed_at: new Date().toISOString(),
        mini_memo_content: miniMemo,
        mapped_to_profile: false,
      }, { onConflict: "company_id" });

    if (upsertError) throw upsertError;

    // Auto-map enhanced content to memo_responses
    const memoResponses = parsedAI.sections
      .filter((s: { sectionKey: string }) => SECTION_MAPPING[s.sectionKey])
      .map((s: { sectionKey: string; enhancedContent: string }) => ({
        company_id: companyId,
        question_key: SECTION_MAPPING[s.sectionKey],
        answer: s.enhancedContent,
        source: "workshop",
      }));

    if (memoResponses.length > 0) {
      const { error: memoError } = await supabase
        .from("memo_responses")
        .upsert(memoResponses, { onConflict: "company_id,question_key" });

      if (memoError) {
        console.error("Failed to map to memo_responses:", memoError);
        // Don't throw - memo compilation still succeeded
      } else {
        // Update mapped_to_profile flag
        await supabase
          .from("workshop_completions")
          .update({ mapped_to_profile: true })
          .eq("company_id", companyId);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        miniMemo,
        sectionsEnhanced: parsedAI.sections.length,
        mappedToProfile: memoResponses.length > 0,
      }),
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
