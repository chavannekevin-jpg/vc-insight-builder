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

    // Calculate key metrics
    const acv = parseFloat(diagnosticData.acv);
    const expectedCustomers = parseFloat(diagnosticData.expectedCustomers);
    const targetRevenue = parseFloat(diagnosticData.targetRevenue || "75000000");
    const salesCycle = parseFloat(diagnosticData.salesCycle);
    const churnRate = parseFloat(diagnosticData.churnRate);
    const nrr = parseFloat(diagnosticData.expansionRevenue || "100");
    const currentMRR = parseFloat(diagnosticData.currentMRR || "0");
    const currentCustomers = parseFloat(diagnosticData.currentCustomers || "0");

    const projectedARR = acv * expectedCustomers;
    const yearsToTarget = Math.ceil(expectedCustomers / (365 / salesCycle));
    const requiredACV = targetRevenue / expectedCustomers;
    
    const systemPrompt = `You are a brutally honest, slightly cynical venture capital partner with 15+ years of experience. Your job is to analyze startup business models and determine if they can realistically achieve venture-scale outcomes (50-100M ARR+). 

You are sassy, provocative, intellectually rigorous, and provide tough love without being rude. You expose illusions and challenge assumptions. Your tone should feel like a VC partner reading the company's assumptions out loud in a partner meeting, questioning everything.

Based on the provided metrics, you must deliver a venture scale diagnostic with the following structure:

1. **Venture Reality Rating**: Classify as one of:
   - "VC-Fit": Can realistically hit 50-100M+ ARR with this model
   - "Venture-Adjacent": Has potential but needs structural changes
   - "Lifestyle Business in Denial": Will never satisfy VC economics

2. **Rating Explanation**: 2-3 sentences explaining the classification

3. **Revenue Machine Narrative**: A flowing paragraph describing how the revenue machine actually works, highlighting where pricing, volume, retention, expansion, and sales velocity hold up or break down

4. **Fantasy vs Physics**: Compare stated goals with realistic constraints, exposing contradictions

5. **What VCs Will Actually Say**: 3-5 sharp, sassy investor comments they'd make when the founder leaves the room

6. **Structural Fragility**: 
   - List top 3 assumptions holding the model together
   - Identify which assumption would collapse first and why
   - Explain consequences

7. **Improvements**: 3-5 concrete structural changes to improve VC-scale potential (pricing, ICP, GTM, positioning, business model)

8. **Verdict**: Final 2-3 sentence verdict in the tone of a fund partner deciding whether to lean in or walk away

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
- Expected Customers at Target: ${expectedCustomers.toLocaleString()}
- Target ARR: $${targetRevenue.toLocaleString()}
- Projected ARR with Current Model: $${projectedARR.toLocaleString()}
- Sales Cycle: ${salesCycle} days
- Annual Churn Rate: ${churnRate}%
- Net Revenue Retention: ${nrr}%
${currentMRR > 0 ? `- Current MRR: $${currentMRR.toLocaleString()}` : ""}
${currentCustomers > 0 ? `- Current Customers: ${currentCustomers}` : ""}

**Customer & GTM:**
- Customer Type (ICP): ${diagnosticData.customerType}
- Go-to-Market Strategy: ${diagnosticData.gtmStrategy}

**Key Calculations:**
- Years to reach target (at current velocity): ~${yearsToTarget} years
- Required ACV to hit target with this customer count: $${requiredACV.toLocaleString()}
- Gap to target: $${(targetRevenue - projectedARR).toLocaleString()}

Run the full diagnostic. Be specific with numbers. Call out assumptions that don't hold up. Make it uncomfortable but intellectually honest.`;

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
        { company_id: companyId, question_key: "business_model_type", answer: `ACV: $${acv}, Target: ${expectedCustomers} customers at $${targetRevenue} ARR` },
        { company_id: companyId, question_key: "business_model_gtm", answer: diagnosticData.gtmStrategy },
        { company_id: companyId, question_key: "market_icp", answer: diagnosticData.customerType },
        { company_id: companyId, question_key: "traction_revenue_progression", answer: `Current: ${currentCustomers} customers, $${currentMRR} MRR. Churn: ${churnRate}%, NRR: ${nrr}%` },
      ];

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