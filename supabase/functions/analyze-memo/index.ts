import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { memoContent, companyInfo, memoId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!memoId) {
      throw new Error("memoId is required");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if analysis already exists for this memo
    const { data: existingAnalysis } = await supabase
      .from('memo_analyses')
      .select('analysis')
      .eq('memo_id', memoId)
      .maybeSingle();

    if (existingAnalysis) {
      console.log("Returning cached analysis for memo:", memoId);
      return new Response(
        JSON.stringify(existingAnalysis.analysis),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create a comprehensive prompt for the AI to analyze the memo
    const analysisPrompt = `You are a ruthless, battle-hardened VC partner with 15+ years of experience. You've seen thousands of pitches and passed on 99% of them. Your job is to FIND REASONS NOT TO INVEST. Your fund's returns depend on saying NO to bad bets.

Analyze this investment memo with one goal: FIGURE OUT WHY NOT TO INVEST. Be brutally skeptical. Challenge every claim. Assume founders are overselling. If something seems too good to be true, it probably is. Your default stance is NO unless they prove otherwise beyond doubt.

COMPANY: ${companyInfo.name}
STAGE: ${companyInfo.stage}
CATEGORY: ${companyInfo.category}

MEMORANDUM SECTIONS:
${Object.entries(memoContent).map(([title, content]) => `
=== ${title} ===
${content}
`).join('\n')}

Provide your hard-hitting analysis in the following JSON format:

{
  "structuredInfo": {
    "industry": "The specific industry/sector (e.g., FinTech, HealthTech, B2B SaaS)",
    "processImproved": "The core process or workflow this company improves (one sentence)",
    "oneLiner": "A compelling one-sentence description that captures the investment opportunity"
  },
  "sectionRecommendations": {
    "[Section Title]": [
      {
        "recommendation": "Specific actionable recommendation for this section",
        "rationale": "Why this matters based on the content",
        "type": "opportunity" | "concern" | "validation_needed"
      }
    ]
  },
  "investmentInsights": [
    {
      "category": "Market Opportunity" | "Competitive Position" | "Execution Risk" | "Team Quality" | "Business Model" | "Traction",
      "insight": "Specific, data-backed insight (2-3 sentences)",
      "sentiment": "positive" | "neutral" | "concern",
      "significance": "high" | "medium" | "low"
    }
  ],
  "keyStrengths": [
    "Specific strength with supporting evidence from memo (1 sentence each)"
  ],
  "keyRisks": [
    "Specific risk or concern with context (1 sentence each)"
  ],
  "nextStepRecommendations": [
    {
      "action": "Specific recommended action",
      "rationale": "Why this matters for investment decision",
      "priority": "high" | "medium" | "low"
    }
  ]
}

CRITICAL INSTRUCTIONS - YOUR JOB IS TO FIND REASONS NOT TO INVEST:
- Start from a position of NO - founders must overcome your skepticism
- Use PROVOCATIVE, DIRECT language - say "This TAM is bullshit" not "This market sizing may be optimistic"
- Call out EVERY red flag explicitly - no softening, no diplomacy
- Challenge EVERY assumption - if they claim "10x better", demand proof or call it handwaving
- Be SKEPTICAL of all data - assume best-case scenarios, cherry-picked metrics, inflated projections
- Use phrases like "This is a dealbreaker", "Founders are handwaving here", "This completely undermines the thesis"
- Focus heavily on WHY NOT TO INVEST - risks should outnumber strengths 2:1
- Don't praise unless truly exceptional and defensible - good enough = not good enough
- Provide 4-6 investment insights (weighted toward concerns - this is your job)
- List 2-3 key strengths (ONLY if genuinely exceptional and backed by hard evidence)
- List 4-6 key risks (be brutal, specific, and focus on dealbreakers)
- Provide 3-4 next step recommendations (what due diligence would expose the flaws)
- For EACH section: provide 2 sharp, skeptical recommendations that poke holes in their narrative
- Think: "My job is to protect the fund from bad bets. What's wrong with this deal?"`;

    console.log("Analyzing memo with AI...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a ruthless VC partner. Your PRIMARY JOB is to figure out WHY NOT TO INVEST. You protect your fund by saying NO to bad bets. Be skeptical of every claim, assume founders are overselling, and focus on finding dealbreakers. Be provocative and direct. Your default answer is NO unless they prove otherwise beyond doubt. Always respond with valid JSON only."
          },
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content?.trim();

    if (!analysisText) {
      throw new Error("No analysis generated");
    }

    console.log("Analysis generated successfully");

    // Parse the JSON response
    let analysis;
    try {
      // Remove markdown code blocks if present
      let jsonText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Check if response was truncated and try to close the JSON
      if (!jsonText.endsWith('}')) {
        console.log("Response appears truncated, attempting to recover...");
        // Try to find the last complete object and close it
        const lastCompleteObject = jsonText.lastIndexOf('}');
        if (lastCompleteObject > 0) {
          jsonText = jsonText.substring(0, lastCompleteObject + 1);
        }
      }
      
      analysis = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", analysisText.substring(0, 500));
      console.error("Parse error:", parseError);
      throw new Error("Failed to parse AI analysis - response may be incomplete");
    }

    // Save analysis to database
    const { error: saveError } = await supabase
      .from('memo_analyses')
      .insert({
        memo_id: memoId,
        analysis: analysis
      });

    if (saveError) {
      console.error("Failed to save analysis:", saveError);
      // Don't throw - still return the analysis even if save fails
    } else {
      console.log("Analysis saved to database for memo:", memoId);
    }

    return new Response(
      JSON.stringify(analysis),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in analyze-memo function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});