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
    const { sectionName, sectionScore, sectionVerdict, companyContext, allSectionScores } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

const systemPrompt = `You are a VC analyst providing actionable improvement advice for startup founders. 
Your job is to analyze a specific section of their investment readiness analysis and provide 2-3 concrete, actionable suggestions to improve their score.

Guidelines:
- Be specific and actionable - avoid vague advice like "improve traction"
- Reference the actual score and benchmark gap
- Consider stage-appropriate expectations
- Suggest things that can be done in 30-90 days
- Prioritize suggestions by impact on VC perception
- Use the context from other sections to make cross-references where relevant
- For EACH suggestion, provide 1-2 specific questions the founder can answer to provide more context

Respond in JSON format:
{
  "suggestions": [
    {
      "title": "Short actionable title (5-8 words)",
      "description": "2-3 sentences explaining what to do specifically and why it matters to VCs",
      "impact": "high" | "medium",
      "timeframe": "30 days" | "60 days" | "90 days",
      "questions": [
        {
          "id": "unique_snake_case_id",
          "question": "A specific question the founder can answer to provide more context",
          "placeholder": "Example: e.g., We have 500 paying customers with 15% MoM growth..."
        }
      ]
    }
  ],
  "keyInsight": "One sentence explaining the #1 thing holding this section back"
}`;

    const userPrompt = `Analyze the "${sectionName}" section and suggest improvements.

Current Score: ${sectionScore.score}/100 (VC Benchmark: ${sectionScore.benchmark})
Section Assessment: "${sectionVerdict}"

Company Context:
${companyContext || "Early-stage startup seeking venture funding"}

Other Section Scores for context:
${allSectionScores ? Object.entries(allSectionScores).map(([name, data]: [string, any]) => 
  `- ${name}: ${data.score}/${data.benchmark}`
).join('\n') : 'Not available'}

Provide 2-3 specific, actionable suggestions to improve this section's score. Focus on what will most impress VCs. For each suggestion, include 1-2 specific questions the founder can answer to provide more detailed context for their next analysis.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in response");
    }

    // Parse the JSON from the response
    let suggestions;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      suggestions = {
        suggestions: [
          {
            title: "Review and strengthen this section",
            description: "Focus on adding more concrete evidence and metrics to support your claims in this area.",
            impact: "high",
            timeframe: "30 days"
          }
        ],
        keyInsight: "More specific data and evidence would strengthen this section."
      };
    }

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in suggest-section-improvements:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
