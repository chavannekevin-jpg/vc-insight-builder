import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { diagnosticData, companyId } = await req.json();
    
    console.log("Running venture scale diagnostic for company:", companyId);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const acv = parseFloat(diagnosticData.acv);
    const currentRevenue = parseFloat(diagnosticData.currentRevenue || "0");
    const currentCustomers = parseFloat(diagnosticData.currentCustomers || "0");
    const targetRevenue = 100000000; // $100M ARR target

    const customersNeeded = Math.ceil(targetRevenue / acv);
    
    const systemPrompt = `You are a brutally honest, slightly cynical venture capital partner with 15+ years of experience. Your job is to analyze whether a startup can realistically achieve venture-scale outcomes ($100M ARR).

Based on the ACV, market description, and calculated customer requirements, you must deliver a reality check with the following structure:

1. **Venture Reality Rating**: Classify as one of:
   - "VC-Fit": Can realistically hit $100M+ ARR with this model
   - "Venture-Adjacent": Has potential but needs structural changes
   - "Lifestyle Business in Denial": Will never satisfy VC economics

2. **Rating Explanation**: 2-3 sentences explaining the classification

3. **The Math**: Explain how many customers are needed at this ACV to hit $100M ARR, and whether that's realistically achievable given the market size and sales motion

4. **Reality Check Narrative**: A flowing paragraph about whether they can actually acquire and retain that many customers in a reasonable timeframe (5-7 years), considering market dynamics, competition, and typical sales cycles

5. **Fantasy vs Physics**: Compare their market description with what it would actually take to get to $100M

6. **What VCs Will Actually Say**: 3-5 sharp, sassy investor comments they'd make when the founder leaves the room

7. **Structural Analysis**:
   - Can this market support the required customer volume?
   - Is the ACV appropriate for the customer segment?
   - What's the realistic timeline to reach $100M?
   - What would need to be true for this to work?

8. **Improvements**: 3-5 concrete structural changes to improve VC-scale potential (pricing, ICP, market positioning, GTM)

9. **Verdict**: Final 2-3 sentence verdict in the tone of a fund partner deciding whether to lean in or walk away

Return ONLY valid JSON with this exact structure:
{
  "rating": "VC-Fit" | "Venture-Adjacent" | "Lifestyle Business in Denial",
  "ratingExplanation": "string",
  "narrative": "string",
  "fantasyVsPhysics": "string",
  "vcComments": ["string", "string", ...],
  "structuralFragility": {
    "topAssumptions": ["string", "string", "string"],
    "firstToCollapse": "string",
    "consequences": "string"
  },
  "improvements": ["string", "string", ...],
  "verdict": "string"
}`;

    const userPrompt = `Analyze this startup's venture scale potential:

**Business Model:**
- ACV: $${acv.toLocaleString()}
- Target: $100M ARR
- Customers needed at this ACV: ${customersNeeded.toLocaleString()}
${currentRevenue > 0 ? `- Current Annual Revenue: $${currentRevenue.toLocaleString()}` : ""}
${currentCustomers > 0 ? `- Current Customers: ${currentCustomers}` : ""}

**Market Description:**
${diagnosticData.marketDescription}

**Key Question:**
Can they realistically acquire ${customersNeeded.toLocaleString()} customers at $${acv.toLocaleString()} ACV in this market within 5-7 years?

Run the full diagnostic. Be specific with numbers and market realities. Call out if the ACV is too low, if the market is too small, if the sales motion doesn't support the volume needed. Make it uncomfortable but intellectually honest.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 4000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON from response
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith("```json")) {
      cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }

    const result = JSON.parse(cleanedContent);

    // Store diagnostic data in company profile if companyId provided
    if (companyId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Map diagnostic data to questionnaire fields
      const responsesToUpsert = [
        { company_id: companyId, question_key: "business_model_type", answer: `ACV: $${acv}, Target: $100M ARR requires ${customersNeeded} customers` },
        { company_id: companyId, question_key: "market_icp", answer: diagnosticData.marketDescription },
      ];

      if (currentRevenue > 0 || currentCustomers > 0) {
        responsesToUpsert.push({
          company_id: companyId,
          question_key: "traction_revenue_progression",
          answer: `Current: ${currentCustomers} customers, $${currentRevenue} ARR`
        });
      }

      for (const response of responsesToUpsert) {
        await supabase
          .from("memo_responses")
          .upsert(response, { onConflict: "company_id,question_key" });
      }

      console.log("Diagnostic data saved to company profile");
    }

    return new Response(
      JSON.stringify({ result }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error("Error in venture-scale-diagnostic:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});