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
    const { problem, solution, icp, competition, traction } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Extracting market context from user inputs...");

    const prompt = `You are a VC market analyst. Based on the startup information below, deduce market intelligence that would appear in an investment memo.

STARTUP INFORMATION:

Problem They Solve:
${problem || "Not provided"}

Solution:
${solution || "Not provided"}

Ideal Customer Profile (ICP):
${icp || "Not provided"}

Competition Landscape:
${competition || "Not provided"}

Traction Data:
${traction || "Not provided"}

---

YOUR TASK: Analyze the information and deduce the following market intelligence. Be specific and use your knowledge base to provide realistic estimates.

Return ONLY valid JSON with this structure:

{
  "marketVertical": "The specific industry/vertical (e.g., 'B2B SaaS for Healthcare', 'Fintech for SMBs')",
  "marketSubSegment": "The niche within the vertical (e.g., 'Patient scheduling software', 'Invoice financing')",
  "estimatedTAM": "Total addressable market size with reasoning (e.g., '$5B - Based on 50K hospitals in US/EU × $100K potential ACV')",
  "buyerPersona": "Who typically makes buying decisions for this type of solution (e.g., 'VP of Operations in mid-market healthcare providers. They prioritize efficiency and regulatory compliance.')",
  "competitorWeaknesses": "Common weaknesses in this competitive landscape based on the competition info provided (e.g., 'Incumbents are slow to adopt AI, have poor UX, and charge high implementation fees')",
  "industryBenchmarks": {
    "typicalCAC": "Typical customer acquisition cost for this vertical (e.g., '$5K-15K for mid-market B2B')",
    "typicalLTV": "Typical lifetime value (e.g., '$50K-150K')",
    "typicalGrowthRate": "Industry growth rate (e.g., '25-40% YoY for this segment')",
    "typicalMargins": "Expected gross margins (e.g., '70-85% for SaaS')"
  },
  "marketDrivers": "Key trends or forces making this market attractive now (e.g., 'New HIPAA regulations, rising labor costs, shift to value-based care')",
  "confidence": "high|medium|low - Your confidence in these estimates based on available information"
}

IMPORTANT: 
- Use your knowledge of similar companies and markets to make realistic estimates
- Be specific with numbers and ranges
- If information is limited, clearly state assumptions
- Focus on credible, defensible estimates a VC would find useful`;

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
            content: "You are a VC market analyst with deep knowledge of startup ecosystems, TAM calculations, and industry benchmarks. Provide realistic, well-reasoned market intelligence. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error("Failed to extract market context from AI");
    }

    const data = await response.json();
    let marketContext = data.choices?.[0]?.message?.content?.trim();

    if (!marketContext) {
      throw new Error("No market context returned from AI");
    }

    // Clean up any markdown code blocks
    marketContext = marketContext.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const parsedContext = JSON.parse(marketContext);
      console.log("Successfully extracted market context:", parsedContext);
      
      return new Response(
        JSON.stringify({ 
          marketContext: parsedContext,
          source: "AI-estimated from company information"
        }), 
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (parseError) {
      console.error("Failed to parse market context JSON:", parseError);
      throw new Error("Invalid JSON returned from market context extraction");
    }
  } catch (error) {
    console.error("Error in extract-market-context function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
