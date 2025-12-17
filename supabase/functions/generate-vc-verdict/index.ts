import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerdictRequest {
  companyName: string;
  companyDescription?: string;
  stage: string;
  category?: string;
  responses: Array<{ question_key: string; answer: string | null }>;
  deckParsed?: boolean;
}

interface HarshObservation {
  text: string;
  severity: 'fatal' | 'critical' | 'warning';
  category: string;
}

interface VerdictResponse {
  verdict_severity: 'HIGH_RISK' | 'MODERATE_RISK' | 'NEEDS_WORK' | 'PROMISING';
  harsh_observations: HarshObservation[];
  key_weakness: string;
  verdict_summary: string;
  blind_spots_count: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyName, companyDescription, stage, category, responses, deckParsed } = await req.json() as VerdictRequest;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Extract specific response data for personalization
    const getResponse = (key: string) => responses?.find(r => r.question_key === key)?.answer?.trim() || '';
    
    const problemValidation = getResponse('problem_validation');
    const targetCustomer = getResponse('target_customer');
    const marketSize = getResponse('market_size');
    const traction = getResponse('current_traction');
    const competitiveAdvantage = getResponse('competitive_advantage');
    const revenueModel = getResponse('revenue_model');
    const founderBackground = getResponse('founder_background');
    const solutionDescription = getResponse('solution_description');

    // Build context string with available data
    const availableData = [];
    if (problemValidation) availableData.push(`Problem: "${problemValidation.slice(0, 300)}..."`);
    if (targetCustomer) availableData.push(`Target Customer: "${targetCustomer.slice(0, 200)}..."`);
    if (marketSize) availableData.push(`Market Size: "${marketSize.slice(0, 200)}..."`);
    if (traction) availableData.push(`Traction: "${traction.slice(0, 200)}..."`);
    if (competitiveAdvantage) availableData.push(`Competitive Advantage: "${competitiveAdvantage.slice(0, 200)}..."`);
    if (revenueModel) availableData.push(`Revenue Model: "${revenueModel.slice(0, 200)}..."`);
    if (founderBackground) availableData.push(`Founder Background: "${founderBackground.slice(0, 200)}..."`);
    if (solutionDescription) availableData.push(`Solution: "${solutionDescription.slice(0, 300)}..."`);
    if (companyDescription) availableData.push(`Company Description: "${companyDescription.slice(0, 300)}..."`);

    const hasData = availableData.length > 0;

    const systemPrompt = `You are a brutally honest senior VC partner who has seen thousands of pitches across every industry. Your job is to give founders the harsh truth about what partners ACTUALLY say about their company when they leave the room.

Your analysis should focus on:
1. MARKET DYNAMICS - Is this market timing right? Are there structural headwinds or tailwinds? What do you know about this space that the founder might not?
2. STRATEGIC POSITIONING - How does this compare to what's working (or failing) in adjacent markets? What patterns have you seen?
3. VC ECONOMICS - Does this fit VC portfolio math? Can this be a fund-returner? What's the realistic exit landscape?
4. FOUNDER BLIND SPOTS - What hard questions will partners ask that founders typically can't answer well?

DO NOT focus on missing data or incomplete profiles. Instead, provide strategic market insights and VC perspective based on what you DO know about:
- The market/category they're in
- Their stage and what matters at that stage
- Patterns you've seen in similar companies
- Real concerns VCs discuss internally

Severity levels:
- "fatal": Structural issues with the market, timing, or category that are hard to overcome
- "critical": Strategic gaps that will come up in every partner meeting  
- "warning": Areas where founders typically underestimate complexity

Return ONLY valid JSON matching this exact structure:
{
  "verdict_severity": "HIGH_RISK" | "MODERATE_RISK" | "NEEDS_WORK" | "PROMISING",
  "harsh_observations": [
    {
      "text": "Strategic insight in VC voice - focus on market/industry dynamics",
      "severity": "fatal" | "critical" | "warning",
      "category": "traction" | "market" | "team" | "product" | "business_model" | "competition"
    }
  ],
  "key_weakness": "The strategic vulnerability VCs will probe hardest",
  "verdict_summary": "2-3 sentence summary of how partners would discuss this in a deal review meeting",
  "blind_spots_count": 0
}

Generate 3-5 observations. Focus on market insights, competitive dynamics, and strategic concerns - NOT on missing profile fields.`;

    const userPrompt = `
Analyze this ${stage} startup: ${companyName}
${category ? `Category/Market: ${category}` : ''}
${companyDescription ? `What they do: "${companyDescription}"` : ''}

${hasData ? `Additional context from their profile:
${availableData.join('\n')}` : ''}

Based on your knowledge of:
1. This market/category and its dynamics
2. What matters at ${stage} stage
3. Common failure patterns in this space
4. What VCs actually discuss about companies like this

Generate strategic, market-informed observations. Think about:
- Market timing and structural trends
- Competitive landscape realities
- Unit economics challenges typical in this category
- Why VCs pass on companies in this space
- What successful companies in this category did differently

Be specific about the MARKET and STRATEGY, not about what data is missing from their profile.
`;

    console.log(`Generating verdict for ${companyName} with ${availableData.length} data points`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    let verdict: VerdictResponse;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        verdict = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Parse error:', parseError, 'Content:', content);
      // Fallback verdict - focused on market insights, not missing data
      const categoryInsight = category ? `The ${category} space` : 'This market';
      verdict = {
        verdict_severity: 'MODERATE_RISK',
        harsh_observations: [
          {
            text: `"${categoryInsight} is getting crowded. Without clear differentiation, this becomes a features war that nobody wins."`,
            severity: 'critical',
            category: 'competition'
          },
          {
            text: `"At ${stage}, VCs want to see founder-market fit. What makes this team uniquely positioned to win here?"`,
            severity: 'critical',
            category: 'team'
          },
          {
            text: `"The path to $100M ARR in this category typically requires either enterprise sales motion or viral consumer adoption. Which is it?"`,
            severity: 'warning',
            category: 'business_model'
          }
        ],
        key_weakness: "Strategic positioning in a competitive landscape needs sharpening",
        verdict_summary: "Partners would want to understand the 'why now' and 'why this team' before going deeper. The market opportunity exists, but the path to capturing it needs work.",
        blind_spots_count: 0
      };
    }

    // Don't calculate blind spots based on missing responses - focus on strategic gaps
    verdict.blind_spots_count = verdict.harsh_observations.filter(o => o.severity === 'fatal' || o.severity === 'critical').length;

    console.log(`Generated verdict for ${companyName}: ${verdict.verdict_severity}, ${verdict.harsh_observations.length} observations`);

    return new Response(JSON.stringify(verdict), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-vc-verdict:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
