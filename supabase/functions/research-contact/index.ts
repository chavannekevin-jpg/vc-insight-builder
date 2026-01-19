import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResearchRequest {
  name: string;
  organization_name?: string;
  linkedin_url?: string;
  global_contact_id: string;
}

interface ResearchResult {
  investment_focus: string[];
  stages: string[];
  thesis_keywords: string[];
  notable_investments: string[];
  confidence: "high" | "medium" | "low";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, organization_name, linkedin_url, global_contact_id }: ResearchRequest = await req.json();

    if (!name && !organization_name) {
      return new Response(
        JSON.stringify({ error: "Name or organization is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the research prompt
    const entityDescription = organization_name 
      ? `${name} at ${organization_name}` 
      : name;
    
    const linkedinContext = linkedin_url 
      ? `Their LinkedIn profile is: ${linkedin_url}` 
      : "";

    const researchPrompt = `You are an expert venture capital researcher. Research the following investor/fund and extract their investment focus:

Entity: ${entityDescription}
${linkedinContext}

Based on your knowledge, determine:
1. What sectors/industries do they focus on? (e.g., Fintech, SaaS, Healthcare, EdTech, Climate Tech, etc.)
2. What investment stages do they prefer? (Pre-Seed, Seed, Series A, Series B, Growth, etc.)
3. What are key thesis keywords that describe their investment philosophy? (e.g., "B2B", "developer tools", "marketplace", "API-first")
4. What are some notable portfolio companies or investments they've made?

If this is a well-known investor or fund, provide accurate information. If you're less certain, indicate lower confidence.

Respond ONLY with a valid JSON object in this exact format:
{
  "investment_focus": ["sector1", "sector2"],
  "stages": ["stage1", "stage2"],
  "thesis_keywords": ["keyword1", "keyword2", "keyword3"],
  "notable_investments": ["Company A", "Company B"],
  "confidence": "high" | "medium" | "low"
}

Rules:
- investment_focus should be 2-5 sectors
- stages should be 1-3 investment stages
- thesis_keywords should be 3-8 descriptive keywords
- notable_investments should be 0-5 companies (empty array if unknown)
- confidence should be "high" if well-known, "medium" if somewhat known, "low" if mostly guessing

Return ONLY the JSON, no markdown or explanation.`;

    console.log(`Researching contact: ${entityDescription}`);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "user", content: researchPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response
    let result: ResearchResult;
    try {
      // Clean up potential markdown formatting
      const cleanedContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      
      result = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return a low-confidence fallback
      result = {
        investment_focus: ["Venture Capital"],
        stages: ["Seed"],
        thesis_keywords: ["startups", "technology"],
        notable_investments: [],
        confidence: "low",
      };
    }

    // Update the global_contact in the database
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && global_contact_id) {
      const updateResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/global_contacts?id=eq.${global_contact_id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            investment_focus: result.investment_focus,
            stages: result.stages,
            thesis_keywords: result.thesis_keywords,
            notable_investments: result.notable_investments,
            focus_confidence: result.confidence,
            focus_source: "ai_research",
            focus_last_researched_at: new Date().toISOString(),
          }),
        }
      );

      if (!updateResponse.ok) {
        console.error("Failed to update contact:", await updateResponse.text());
      } else {
        console.log(`Successfully updated contact ${global_contact_id} with research data`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Research contact error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
