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

// Company Profile ("My Profile") uses a different set of question keys.
// We write both so workshop completion immediately populates the profile.
const PROFILE_SECTION_MAPPING: Record<string, string> = {
  problem: "problem_core",
  solution: "solution_core",
  market: "target_customer",
  business_model: "business_model",
  gtm: "traction_proof",
  team: "team_story",
  funding_strategy: "vision_ask",
  investment_thesis: "vision_ask",
};

const MAX_REGENERATIONS = 5;

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

    // Check regeneration limit
    const { data: existingCompletion } = await supabase
      .from("workshop_completions")
      .select("regeneration_count")
      .eq("company_id", companyId)
      .maybeSingle();

    const currentCount = existingCompletion?.regeneration_count ?? 0;
    if (currentCount >= MAX_REGENERATIONS) {
      return new Response(
        JSON.stringify({ error: "Regeneration limit reached (max 5)" }),
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
    // Separate user-written sections from the AI-generated investment thesis
    const userWrittenSections = templates.filter(t => t.section_key !== 'investment_thesis');
    const investmentThesisTemplate = templates.find(t => t.section_key === 'investment_thesis');
    
    const sectionsForAI = userWrittenSections.map((template) => {
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
1. Expand and elaborate each founder's raw input into comprehensive, investor-ready analysis. The benchmark example is your LENGTH AND QUALITY TARGET - your output for each section should be approximately the same length (150-350 words), with the same level of depth, structure, and specificity as the benchmark.
2. IMPORTANT: Generate a compelling "Investment Thesis" section based on ALL the founder's inputs using the special instructions below.

SECTIONS TO TRANSFORM (from founder input):
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

=== INVESTMENT THESIS GENERATION (CRITICAL - USE THESE INSTRUCTIONS) ===

You are a senior early-stage VC writing an investment thesis blurb about this startup.

Your job is to take the structured information the founder has entered in previous steps (problem, solution, market, traction, business model, go-to-market, team, risks, etc.) and synthesize it into a short, concrete, investor-grade thesis.

OVERALL GOAL:
Write a tight, opinionated 3-5 paragraph thesis that a real investor could paste into an internal memo to justify why this company is interesting.
This is NOT marketing copy and NOT a summary of their answers. It is your analytical view, written in plain language.

STRUCTURE OF THE THESIS (touch most of these in narrative form):

1. THE WORLD & THE PROBLEM
   - What is changing in the world or in this industry?
   - Who has the pain, and why is it economically meaningful?

2. THE SOLUTION & WEDGE
   - How does this startup attack the problem?
   - What is their wedge or entry point (specific customer segment, workflow, product angle)?

3. THE ENGINE & ADVANTAGE
   - What makes this approach structurally interesting?
   - Is there a potential moat (data, workflow, regulation, network, distribution, UX, etc.)?
   - Why could this become a "system of record", key infrastructure, or irreplaceable habit?

4. EVIDENCE SO FAR
   - What traction, signals, or early proof-points exist (revenue, users, pilots, partnerships, engagement)?
   - If no traction yet, what is the most compelling non-traction evidence (founder-market fit, unique access, IP, regulation)?

5. UPSIDE & WHAT NEEDS TO BE TRUE
   - If this works, what could it become (category leader, platform, multi-product company)?
   - What key risks or execution questions remain, and what needs to be proven at this stage?

STYLE GUIDELINES:
- Write in clear, direct, professional English, like a real VC memo
- Use concrete language, not buzzwords ("They have a credible wedge with X", not "They are poised to disrupt Y with cutting-edge AI")
- Prioritize mechanics (distribution, behaviour, workflows, economics, switching costs) over vague enthusiasm
- It's fine to be cautiously positive, but do not oversell. Show both the opportunity and conditions needed
- If information is missing, do not invent it. De-emphasize and lean on what is known

HANDLING WEAK OR EARLY ANSWERS:
If the founder's inputs are thin, still produce a thesis, but keep it honest and grounded:
- Focus more on why the problem is interesting, why this approach could make sense, what the founders understand well
- Encode risk or uncertainty with phrasing like: "If they can prove…", "The key question is whether…", "The opportunity hinges on…"
- Never say "this is a bad company" or "not investable"; phrase it as what would need to be true

=== END INVESTMENT THESIS INSTRUCTIONS ===

INSTRUCTIONS FOR OTHER SECTIONS:
1. For each user-written section, produce a COMPREHENSIVE analysis that:
   - Matches the BENCHMARK LENGTH (150-350 words, multiple paragraphs)
   - Maintains the founder's core message and facts
   - Adds professional framing, context, and investor-focused language
   - Includes specific numbers/metrics if the founder provided them
   - Extrapolates reasonable business logic where founder input is sparse

2. FORMATTING REQUIREMENT (apply to ALL sections):
   - Start with 1-2 introductory sentences
   - Then use BULLET POINTS (using "- " prefix) to list key aspects, features, or insights
   - End with a concluding sentence or paragraph
   - Every section MUST have at least 3-5 bullet points for scannability
   - Use blank lines between paragraphs and before/after bullet lists

3. CRITICAL: If a founder's input is brief, you must EXPAND it to match the benchmark length by:
   - Adding relevant business context
   - Structuring with clear sub-sections using bullet points
   - Including standard investor considerations for that section
   - Using professional VC terminology and framing

4. If a section has no founder input, create a detailed placeholder (100+ words) noting what information is needed and why it matters to investors.

5. Return your response as valid JSON in this exact format:
{
  "sections": [
    {
      "sectionKey": "problem",
      "title": "The Problem",
      "enhancedContent": "The polished, investor-ready paragraph..."
    },
    ... (all 8 sections including investment_thesis at the end)
  ],
  "executiveSummary": "A 2-3 sentence executive summary of the entire investment opportunity",
  "validationReport": {
    "grade": {
      "overall": "A/B/C/D based on validation evidence strength",
      "label": "Strong Discovery/Good Progress/Early Discovery/Hypothesis Only",
      "description": "Brief explanation of the grade"
    },
    "dimensions": [
      { "name": "Problem Clarity", "score": 0-100, "label": "Strong/Good/Weak", "feedback": "specific feedback" },
      { "name": "Validation Depth", "score": 0-100, "label": "Strong/Good/Weak", "feedback": "specific feedback" },
      { "name": "Founder-Market Fit", "score": 0-100, "label": "Strong/Good/Weak", "feedback": "specific feedback" }
    ],
    "strengths": ["3 specific things the founder articulated well with evidence"],
    "gaps": ["3 specific areas needing more customer validation"],
    "nextSteps": ["3 specific validation activities they should do next, e.g. 'Conduct 15 more discovery interviews with [segment]'"]
  }
}

GRADING RUBRIC FOR PRE-SEED:
- A (Strong Discovery): 25+ customer interviews cited, quantified pain, clear founder insight
- B (Good Progress): 10-25 interviews, some quantification, decent validation signals
- C (Early Discovery): Some interviews mentioned, problem identified but limited evidence
- D (Hypothesis Only): No interview evidence, mostly assumptions

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
            content: "You are an expert investment memo writer creating comprehensive VC-grade memorandums. Your outputs must MATCH THE LENGTH AND DEPTH of the provided benchmark examples - typically 150-350 words per section with multiple paragraphs. Brief, summarized outputs are NOT acceptable. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: aiPrompt,
          },
        ],
        temperature: 0.4,
        max_tokens: 10000,
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

    // Build validation report with timestamp
    const validationReport = parsedAI.validationReport ? {
      ...parsedAI.validationReport,
      generatedAt: new Date().toISOString(),
    } : null;

    // Upsert completion record with validation report and increment regeneration count
    const { error: upsertError } = await supabase
      .from("workshop_completions")
      .upsert({
        company_id: companyId,
        completed_at: new Date().toISOString(),
        mini_memo_content: miniMemo,
        mapped_to_profile: false,
        validation_report: validationReport,
        regeneration_count: currentCount + 1,
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

    // Also map into the Company Profile question keys so "My Profile" is pre-filled.
    // If multiple workshop sections map to the same profile key (e.g. vision_ask), concatenate.
    const profileResponseMap = new Map<string, string>();
    for (const s of (parsedAI.sections || []) as Array<{ sectionKey: string; enhancedContent: string }>) {
      const profileKey = PROFILE_SECTION_MAPPING[s.sectionKey];
      if (!profileKey) continue;
      const content = (s.enhancedContent || "").trim();
      if (!content) continue;
      const prev = profileResponseMap.get(profileKey);
      profileResponseMap.set(profileKey, prev ? `${prev}\n\n${content}` : content);
    }

    const profileResponses = Array.from(profileResponseMap.entries()).map(([question_key, answer]) => ({
      company_id: companyId,
      question_key,
      answer,
      source: "workshop",
    }));

    let mappedToProfile = false;

    if (memoResponses.length > 0) {
      const { error: memoError } = await supabase
        .from("memo_responses")
        .upsert(memoResponses, { onConflict: "company_id,question_key" });

      if (memoError) {
        console.error("Failed to map workshop -> memo_responses:", memoError);
        // Don't throw - memo compilation still succeeded
      } else {
        mappedToProfile = true;
      }
    }

    if (profileResponses.length > 0) {
      const { error: profileError } = await supabase
        .from("memo_responses")
        .upsert(profileResponses, { onConflict: "company_id,question_key" });

      if (profileError) {
        console.error("Failed to map workshop -> profile keys:", profileError);
      } else {
        mappedToProfile = true;
      }
    }

    if (mappedToProfile) {
      // Update mapped_to_profile flag
      await supabase
        .from("workshop_completions")
        .update({ mapped_to_profile: true })
        .eq("company_id", companyId);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        miniMemo,
        sectionsEnhanced: parsedAI.sections.length,
        mappedToProfile,
        validationReport,
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
