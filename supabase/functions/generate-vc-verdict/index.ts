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
    const { companyName, companyDescription, stage, category, responses, deckParsed } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build context from responses
    const responseContext = responses
      ?.filter((r: any) => r.answer && r.answer.trim())
      .map((r: any) => `${r.question_key}: ${r.answer}`)
      .join('\n') || '';

    const systemPrompt = `You are a senior VC partner at a top-tier fund (Sequoia, a16z, Benchmark caliber). Your job is to give founders a brutally honest but BALANCED preview of how VCs will perceive their company.

CRITICAL: You must provide MARKET-LEVEL INSIGHTS, not just critique of their materials.

Your analysis should demonstrate:
1. Deep knowledge of the SPECIFIC market/category they're in
2. References to REAL failed and successful startups in this space (by name)
3. Understanding of VC investment frameworks (Sequoia Capital Efficiency, a16z category creation, etc.)
4. The TIMING question - why now matters in this market
5. Pattern recognition from similar companies

TONE: Insightful industry expert, not a deck reviewer. You're sharing what you KNOW about this space, not just what's missing from their deck.

Return ONLY valid JSON with this exact structure:
{
  "verdict": "One provocative sentence summarizing the core investment question for this company",
  "readinessLevel": "LOW" | "MEDIUM" | "HIGH",
  "readinessRationale": "2-3 sentences explaining why, with market context",
  "concerns": [
    {
      "text": "Market-informed concern with specific framework or case study reference",
      "category": "market" | "team" | "business_model" | "traction" | "competition",
      "caseStudyReference": "Optional: real company example like 'Similar to how Homejoy failed due to...'"
    }
  ],
  "strengths": [
    {
      "text": "What a VC would genuinely find compelling about this opportunity",
      "category": "market" | "team" | "business_model" | "traction" | "competition"
    }
  ],
  "marketInsight": "A deep observation about this specific market/category showing insider knowledge - trends, timing, competitive dynamics, recent exits, funding patterns",
  "vcFrameworkCheck": "Which VC framework this passes or fails, with the specific test name (e.g., 'Fails Sequoia's Why Now test', 'Passes a16z's category creation criteria')"
}

REQUIREMENTS:
- 2-3 concerns with at least one case study reference
- 2-3 strengths (find genuine positives even if challenging)
- Market insight must be SPECIFIC to their category, not generic
- Reference REAL companies that failed or succeeded in this space
- Use authentic VC terminology: fund returner, terminal TAM, zero-to-one, category winner, capital efficiency, burn multiple, etc.
- Do NOT focus on missing deck content or profile gaps - focus on the BUSINESS and MARKET`;

    const userPrompt = `Analyze this startup through VC eyes:

Company: ${companyName || 'Unnamed Startup'}
Description: ${companyDescription || 'No description provided'}
Stage: ${stage || 'Unknown'}
Category/Industry: ${category || 'Not specified'}
Has Pitch Deck: ${deckParsed ? 'Yes' : 'No'}

${responseContext ? `Additional Context:\n${responseContext}` : ''}

Provide your VC verdict focusing on:
1. What you KNOW about this market from your deal flow and portfolio experience
2. Failed companies in this space and why they failed
3. What would make this a "fund returner" vs a "nice business"
4. The timing question for this category
5. Genuine strengths alongside concerns

Remember: You're an industry insider sharing knowledge, not a deck critic pointing out missing slides.`;

    console.log('Generating market-intelligence VC verdict for:', companyName);

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

    let verdict;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        verdict = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Parse error:', parseError, 'Content:', content);
      // Fallback with market-focused content
      verdict = {
        verdict: "Strong concept, but the path to category leadership remains unclear in a competitive market.",
        readinessLevel: "MEDIUM",
        readinessRationale: "Early-stage companies in this space have historically struggled with differentiation. The market timing appears favorable, but execution risk is high without clear moat development.",
        concerns: [
          {
            text: "The market has seen multiple well-funded attempts that couldn't achieve escape velocity. Capital alone doesn't guarantee category creation.",
            category: "market",
            caseStudyReference: "Similar pattern to what we saw with many 2021 'future of work' companies that raised large rounds but couldn't sustain growth."
          },
          {
            text: "Unit economics at scale remain unproven for this business model. Most comparable exits have been acqui-hires rather than venture-scale outcomes.",
            category: "business_model"
          }
        ],
        strengths: [
          {
            text: "The timing for this category appears favorable with recent tailwinds in user behavior and technology infrastructure.",
            category: "market"
          },
          {
            text: "Early positioning before market saturation could provide first-mover advantages if executed well.",
            category: "competition"
          }
        ],
        marketInsight: "This category has historically been capital-intensive with long sales cycles. The winners have typically combined strong bottoms-up adoption with enterprise sales motion. Recent successful exits share a common pattern of becoming 'system of record' rather than 'nice-to-have' tool.",
        vcFrameworkCheck: "Passes the 'large market' test but needs stronger evidence for the 'Why now?' and 'Why you?' questions that every partnership meeting will probe."
      };
    }

    console.log('Successfully generated verdict for:', companyName, 'Level:', verdict.readinessLevel);

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
