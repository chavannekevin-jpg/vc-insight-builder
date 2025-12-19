import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EstimateRequest {
  companyName: string;
  category: string;
  stage: string;
  businessModelType: string;
  icpDescription?: string;
  pricingHints?: string;
  currency: string;
  primaryMetricLabel: string; // "ARPU" or "ACV" etc.
}

interface EstimateResponse {
  value: number;
  currency: string;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  comparables: Array<{ name: string; value: number; note?: string }>;
  range: { low: number; high: number };
  methodology: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: EstimateRequest = await req.json();
    const { 
      companyName, 
      category, 
      stage, 
      businessModelType, 
      icpDescription, 
      pricingHints,
      currency,
      primaryMetricLabel 
    } = request;

    console.log(`Estimating ${primaryMetricLabel} for ${companyName} (${businessModelType}, ${stage})`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a VC analyst specializing in startup financial metrics. Your task is to estimate the primary revenue metric for early-stage companies based on their business model, category, and stage.

You have deep knowledge of:
- Industry benchmarks across different business models (B2C, B2B SaaS, enterprise, marketplace, etc.)
- How metrics evolve from pre-seed through Series A
- Comparable companies and their published metrics
- Geographic variations in pricing

Your estimates should be:
- Conservative but realistic for the stage
- Based on actual market data and comparables
- Clearly reasoned with transparent methodology`;

    const userPrompt = `Estimate the ${primaryMetricLabel} for this startup:

Company: ${companyName}
Category: ${category}
Stage: ${stage}
Business Model: ${businessModelType}
${icpDescription ? `Target Customer: ${icpDescription}` : ''}
${pricingHints ? `Pricing Signals: ${pricingHints}` : ''}
Currency: ${currency}

Provide your estimate using this exact JSON structure:
{
  "value": <number - your best estimate in ${currency}>,
  "confidence": "<'high'|'medium'|'low' - based on how much data you have>",
  "reasoning": "<2-3 sentences explaining your logic>",
  "comparables": [
    {"name": "<company name>", "value": <their ${primaryMetricLabel}>, "note": "<optional context>"},
    {"name": "<company name>", "value": <their ${primaryMetricLabel}>}
  ],
  "range": {"low": <conservative estimate>, "high": <optimistic estimate>},
  "methodology": "<brief description of how you arrived at this estimate>"
}

Important guidelines:
1. For B2C subscription, estimate monthly ARPU (typical range $3-$30)
2. For SMB SaaS, estimate annual ACV (typical range $1K-$15K)
3. For mid-market SaaS, estimate annual ACV (typical range $15K-$100K)
4. For enterprise, estimate annual ACV (typical range $100K-$500K+)
5. For marketplace, estimate take rate percentage
6. Early-stage companies (pre-seed/seed) typically have lower metrics than established companies
7. Provide 2-4 relevant comparables when possible
8. If the category is very niche, acknowledge lower confidence`;

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
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    let estimate: EstimateResponse;
    try {
      estimate = JSON.parse(jsonStr.trim());
      estimate.currency = currency;
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      // Return fallback based on business model
      estimate = getFallbackEstimate(businessModelType, stage, currency, primaryMetricLabel);
    }

    console.log(`Estimated ${primaryMetricLabel}: ${estimate.value} ${currency} (${estimate.confidence} confidence)`);

    return new Response(JSON.stringify(estimate), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in estimate-primary-metric:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getFallbackEstimate(
  businessModelType: string, 
  stage: string, 
  currency: string,
  metricLabel: string
): EstimateResponse {
  // Provide reasonable fallbacks based on business model
  const fallbacks: Record<string, { value: number; low: number; high: number }> = {
    'b2c_subscription': { value: 10, low: 5, high: 20 }, // Monthly ARPU
    'b2c_transactional': { value: 100, low: 50, high: 200 }, // Annual ARPU
    'b2b_smb_saas': { value: 6000, low: 2000, high: 12000 }, // Annual ACV
    'b2b_mid_market': { value: 40000, low: 20000, high: 75000 }, // Annual ACV
    'b2b_enterprise': { value: 150000, low: 75000, high: 300000 }, // Annual ACV
    'marketplace': { value: 15, low: 10, high: 25 }, // Take rate %
    'fintech_aum': { value: 50, low: 25, high: 100 }, // Basis points
  };

  // Adjust by stage
  const stageMultipliers: Record<string, number> = {
    'pre-seed': 0.6,
    'seed': 0.85,
    'series-a': 1.1,
  };

  const base = fallbacks[businessModelType] || { value: 10000, low: 5000, high: 25000 };
  const multiplier = stageMultipliers[stage] || 1;

  return {
    value: Math.round(base.value * multiplier),
    currency,
    confidence: 'low',
    reasoning: `Fallback estimate based on typical ${businessModelType} metrics at ${stage} stage. Founder input would improve accuracy.`,
    comparables: [],
    range: { 
      low: Math.round(base.low * multiplier), 
      high: Math.round(base.high * multiplier) 
    },
    methodology: 'Industry benchmark fallback - no specific data available',
  };
}
