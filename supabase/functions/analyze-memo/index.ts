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
    const analysisPrompt = `You are a ruthless, battle-hardened VC partner with 15+ years of experience. You've seen thousands of pitches and invested in dozens of unicorns. You don't sugarcoat, you don't hold back, and you call out BS when you see it.

Analyze this investment memo with brutal honesty. Use provocative, direct language. Challenge every assumption. If something smells fishy, say it. If the market thesis is weak, tear it apart. If the founders are missing critical experience, call them out.

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

CRITICAL INSTRUCTIONS:
- Use PROVOCATIVE, DIRECT language - no corporate jargon or hand-holding
- Call out red flags explicitly - don't dance around concerns
- Challenge EVERY assumption - if market size seems inflated, say "This TAM is bullshit"
- Be SKEPTICAL by default - make founders prove it, don't give benefit of the doubt
- Use phrases like "This raises major concerns", "Founders are handwaving", "This is a massive red flag"
- Point out gaps in logic, missing data, or weak arguments aggressively
- Don't praise unless truly exceptional - mediocre = call it mediocre
- Base insights on ACTUAL data from memo, but be critical of that data
- Provide 4-6 investment insights (mix of concerns and rare opportunities)
- List 3-4 key strengths (only if they're genuinely strong)
- List 3-4 key risks (be brutal and specific)
- Provide 3-4 next step recommendations (what you'd demand in due diligence)
- For EACH section: provide 2 sharp, critical recommendations (under 30 words each)
- Recommendations should challenge founders' narrative and demand proof
- Think: "Would I bet $2M of my fund on this?" If no, explain why viciously`;

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
            content: "You are a ruthless VC partner. Your job is to find holes in investment theses, challenge founders, and protect your fund from bad bets. Be provocative, direct, and skeptical. Use language that makes founders sweat. Always respond with valid JSON only."
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