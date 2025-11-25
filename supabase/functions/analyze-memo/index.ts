import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { memoContent, companyInfo } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create a comprehensive prompt for the AI to analyze the memo
    const analysisPrompt = `You are a senior venture capital investment professional with 15+ years of experience analyzing startups. 

Analyze the following investment memorandum and provide structured insights:

COMPANY: ${companyInfo.name}
STAGE: ${companyInfo.stage}
CATEGORY: ${companyInfo.category}

MEMORANDUM SECTIONS:
${Object.entries(memoContent).map(([title, content]) => `
=== ${title} ===
${content}
`).join('\n')}

Based on this memo, provide your analysis in the following JSON format:

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
- Base ALL insights on actual information present in the memo
- Use specific metrics, names, and details from the memo
- Think like a VC making an investment decision
- Be honest about both opportunities and risks
- Provide 4-6 investment insights
- List 3-4 key strengths
- List 2-3 key risks
- Provide 3-4 next step recommendations
- For EACH section in the memo, provide 2-3 specific recommendations based on that section's content
- Section recommendations should be actionable and specific to what was discussed in that section`;

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
            content: "You are a senior VC investment professional. Analyze investment memos with deep expertise. Always respond with valid JSON only."
          },
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
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
      const jsonText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", analysisText);
      throw new Error("Failed to parse AI analysis");
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