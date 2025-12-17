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

    const systemPrompt = `You are a brutally honest senior VC partner who has seen thousands of decks. Your job is to give founders the harsh truth about what partners ACTUALLY say about their company when they leave the room.

Your analysis should be:
1. SPECIFIC - Reference actual claims, numbers, or statements from their data
2. HARSH - Use real VC language like "pass", "dead on arrival", "fatal flaw", "non-starter"
3. PERSONAL - Make it feel like you actually READ their materials, not generic criticism
4. ACTIONABLE - Each observation should point to something they can fix

Severity levels:
- "fatal": Issues that would cause immediate rejection (no traction at seed, trillion dollar TAM claims, no founder-market fit)
- "critical": Major red flags that significantly hurt chances (vague customer definition, no competitive moat)
- "warning": Concerns that need addressing (weak problem validation, unclear revenue model)

Return ONLY valid JSON matching this exact structure:
{
  "verdict_severity": "HIGH_RISK" | "MODERATE_RISK" | "NEEDS_WORK" | "PROMISING",
  "harsh_observations": [
    {
      "text": "Specific harsh observation in VC voice",
      "severity": "fatal" | "critical" | "warning",
      "category": "traction" | "market" | "team" | "product" | "business_model" | "competition"
    }
  ],
  "key_weakness": "One sentence summary of their biggest vulnerability",
  "verdict_summary": "2-3 sentence brutal summary of how this would be received in a partner meeting",
  "blind_spots_count": 0
}

Generate 3-5 observations based on available data. If limited data is available, focus on what's MISSING and why that's concerning.`;

    const userPrompt = hasData ? `
Analyze this ${stage} company: ${companyName}
${category ? `Category: ${category}` : ''}
${deckParsed ? '(They uploaded a pitch deck)' : '(No pitch deck uploaded yet)'}

Available data:
${availableData.join('\n')}

Questions NOT answered yet: ${['problem_validation', 'target_customer', 'market_size', 'current_traction', 'competitive_advantage', 'revenue_model', 'founder_background', 'solution_description']
  .filter(key => !getResponse(key))
  .join(', ')}

Generate harsh, specific observations that reference their actual claims. Make it feel like someone actually reviewed their materials. Be ruthless.
` : `
Analyze this ${stage} company: ${companyName}
${category ? `Category: ${category}` : ''}
${companyDescription ? `Description: "${companyDescription}"` : ''}

This founder just uploaded their deck but hasn't filled out the questionnaire. They have massive blind spots because we can only see surface-level information.

Generate 3-5 harsh observations about:
1. What we CAN'T assess because they haven't provided depth
2. What their generic description suggests about their thinking
3. Why VCs would pass without this information
4. What assumptions VCs make when founders don't provide data

Make it feel alarming - they need to understand that VCs are judging them harshly based on limited information.
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
      // Fallback verdict
      verdict = {
        verdict_severity: 'HIGH_RISK',
        harsh_observations: [
          {
            text: `"${companyName} hasn't provided enough information to assess. VCs will assume the worst when founders hide details."`,
            severity: 'critical',
            category: 'product'
          },
          {
            text: `"No depth on any core metrics. This reads like a company that either has nothing to show or doesn't know what matters."`,
            severity: 'critical',
            category: 'traction'
          },
          {
            text: `"At ${stage}, we expect founders to have answers ready. Incomplete profiles signal unprepared founders."`,
            severity: 'warning',
            category: 'team'
          }
        ],
        key_weakness: "Insufficient information to make any positive assessment",
        verdict_summary: "This would get passed immediately. Partners can't evaluate what they can't see, and silence usually means there's nothing good to share.",
        blind_spots_count: 8
      };
    }

    // Calculate blind spots based on missing responses
    const requiredKeys = ['problem_validation', 'target_customer', 'market_size', 'current_traction', 'competitive_advantage', 'revenue_model', 'founder_background', 'solution_description'];
    const missingCount = requiredKeys.filter(key => !getResponse(key)).length;
    verdict.blind_spots_count = missingCount;

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
