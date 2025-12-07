import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyName, description, problem, solution, industry, userProvidedCompetitors } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Researching competitors for: ${companyName} in ${industry || 'tech'}`);

    const researchPrompt = `You are a VC analyst researching the competitive landscape for a startup.

**COMPANY CONTEXT:**
- Company: ${companyName}
- Description: ${description || 'Not provided'}
- Problem they solve: ${problem || 'Not provided'}
- Solution: ${solution || 'Not provided'}
- Industry/Vertical: ${industry || 'Technology'}
- Competitors mentioned by founder: ${userProvidedCompetitors || 'None specified'}

**YOUR TASK:**
Research and provide a comprehensive competitive analysis. Be CRITICAL and HONEST - if the market is crowded or the startup's positioning is weak, say so clearly.

**OUTPUT FORMAT (JSON):**
{
  "marketType": "Red Ocean | Blue Ocean | Emerging",
  "marketTypeRationale": "Why this classification",
  "incumbents": [
    {
      "name": "Company Name",
      "description": "What they do",
      "estimatedSize": "Revenue/valuation/employees if known",
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "targetMarket": "Who they serve",
      "threatLevel": "High | Medium | Low"
    }
  ],
  "directCompetitors": [
    {
      "name": "Company Name",
      "description": "What they do",
      "funding": "Funding stage/amount if known",
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "differentiation": "How they position vs others",
      "threatLevel": "High | Medium | Low"
    }
  ],
  "adjacentSolutions": [
    {
      "name": "Company Name",
      "description": "What they do",
      "howTheyCompete": "How they might solve the same problem differently"
    }
  ],
  "criticalAssessment": {
    "founderClaimsValid": true | false,
    "reasoning": "Honest assessment of whether the founder's differentiation claims hold up",
    "majorConcerns": ["concern 1", "concern 2"],
    "potentialMoats": ["potential moat 1", "potential moat 2"],
    "recommendedBeachhead": "Suggested initial market to dominate",
    "overallCompetitivePosition": "Strong | Moderate | Weak | Unclear",
    "honestVerdict": "A candid 2-3 sentence assessment of competitive viability"
  }
}

IMPORTANT:
- Include REAL company names based on your knowledge of the market
- Be specific about strengths and weaknesses
- If you don't know exact figures, estimate or say "unknown"
- If the startup is entering a crowded market with well-funded players, be honest about the challenges
- If the founder's claimed differentiation is weak or already offered by competitors, flag it
- Use your training data knowledge of the competitive landscape`;

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
            content: "You are an expert VC analyst with deep knowledge of startup ecosystems, competitive landscapes, and market dynamics across industries. You provide honest, critical assessments. Always respond with valid JSON only, no markdown formatting." 
          },
          { role: "user", content: researchPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response
    let competitorData;
    try {
      // Clean the response - remove markdown code blocks if present
      const cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      competitorData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse competitor data:", parseError);
      console.log("Raw content:", content);
      // Return a fallback structure
      competitorData = {
        marketType: "Unknown",
        marketTypeRationale: "Unable to determine from available information",
        incumbents: [],
        directCompetitors: [],
        adjacentSolutions: [],
        criticalAssessment: {
          founderClaimsValid: null,
          reasoning: "Competitor research could not be completed. Manual analysis recommended.",
          majorConcerns: ["Insufficient data for competitive analysis"],
          potentialMoats: [],
          recommendedBeachhead: "Requires further research",
          overallCompetitivePosition: "Unclear",
          honestVerdict: "Unable to complete competitive analysis. Consider providing more context about your market and competitors."
        }
      };
    }

    console.log("Competitor research completed successfully");

    return new Response(JSON.stringify(competitorData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in research-competitors:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      marketType: "Unknown",
      incumbents: [],
      directCompetitors: [],
      adjacentSolutions: [],
      criticalAssessment: {
        honestVerdict: "Competitor research failed. Please try again."
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
