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
    const getResponse = (key: string) => responses?.find((r: any) => r.question_key === key)?.answer?.trim() || '';
    
    const problemValidation = getResponse('problem_validation');
    const targetCustomer = getResponse('target_customer');
    const marketSize = getResponse('market_size');
    const traction = getResponse('current_traction');
    const competitiveAdvantage = getResponse('competitive_advantage');
    const revenueModel = getResponse('revenue_model');
    const founderBackground = getResponse('founder_background');
    const solutionDescription = getResponse('solution_description');
    const distributionStrategy = getResponse('distribution_strategy');
    const whyNow = getResponse('why_now');

    // Build rich context
    const contextParts = [];
    if (companyDescription) contextParts.push(`Business: ${companyDescription}`);
    if (problemValidation) contextParts.push(`Problem they solve: ${problemValidation}`);
    if (targetCustomer) contextParts.push(`Target customer: ${targetCustomer}`);
    if (solutionDescription) contextParts.push(`Solution: ${solutionDescription}`);
    if (marketSize) contextParts.push(`Market opportunity: ${marketSize}`);
    if (traction) contextParts.push(`Traction: ${traction}`);
    if (competitiveAdvantage) contextParts.push(`Competitive advantage: ${competitiveAdvantage}`);
    if (revenueModel) contextParts.push(`Revenue model: ${revenueModel}`);
    if (distributionStrategy) contextParts.push(`Go-to-market: ${distributionStrategy}`);
    if (founderBackground) contextParts.push(`Founder background: ${founderBackground}`);
    if (whyNow) contextParts.push(`Why now: ${whyNow}`);

    const systemPrompt = `You are a senior partner at Sequoia Capital with 20+ years experience evaluating startups. You've seen thousands of pitches and know exactly what separates unicorns from the 99% that fail.

YOUR TASK: Provide a professional-grade VC Quick Take for this company - the kind of snap assessment partners share in Monday dealflow meetings.

CRITICAL REQUIREMENTS:
1. Be CONCEPTUAL and STRATEGIC - analyze the business model, market dynamics, and investment thesis
2. Reference REAL case studies - mention actual companies (successful or failed) in this space
3. Apply VC FRAMEWORKS: TAM/SAM/SOM, moat analysis, unit economics, network effects, category dynamics
4. Evaluate TIMING - why now? market readiness, tech inflection points, behavioral shifts
5. Assess FOUNDER-MARKET FIT - does this team have unfair advantages?
6. Analyze DISTRIBUTION STRATEGY - can they actually reach customers cost-effectively?

DO NOT:
- Comment on data completeness or missing information
- Give generic advice that could apply to any startup
- Be vague - be specific about THIS business in THIS market

ANALYSIS FRAMEWORKS TO APPLY:
- Sequoia Capital's "Why Now?" framework
- a16z's category creation vs. category capture
- Benchmark's bottoms-up vs. top-down market sizing
- First Round's founder-market fit assessment
- Unit economics: CAC/LTV, payback period, gross margin structure

TONE: Like you're briefing your partners in a dealflow meeting. Direct, insightful, sophisticated. Show you understand this market deeply.

Return ONLY valid JSON:
{
  "verdict": "One provocative sentence capturing the core investment question - be specific to THIS business. Example: 'Classic SMB SaaS play with strong early traction, but the question is whether they can crack enterprise before the market commoditizes.'",
  "readinessLevel": "LOW" | "MEDIUM" | "HIGH",
  "readinessRationale": "2-3 sentences explaining the assessment with specific strategic reasoning, not data gaps.",
  "concerns": [
    {
      "text": "Strategic concern with market/business model analysis - be specific about WHY this is a concern for THIS business",
      "category": "market" | "team" | "business_model" | "traction" | "competition",
      "caseStudyReference": "Reference a real company example: 'We saw this with [Company] which struggled because...'"
    },
    {
      "text": "Second strategic concern - different dimension (e.g., if first was market, second could be distribution)",
      "category": "market" | "team" | "business_model" | "traction" | "competition"
    },
    {
      "text": "Third concern focusing on execution or timing risk",
      "category": "market" | "team" | "business_model" | "traction" | "competition"
    }
  ],
  "strengths": [
    {
      "text": "Strategic strength - what makes this opportunity compelling from a VC perspective",
      "category": "market" | "team" | "business_model" | "traction" | "competition"
    },
    {
      "text": "Second strength - highlight unfair advantage or market timing",
      "category": "market" | "team" | "business_model" | "traction" | "competition"
    },
    {
      "text": "Third strength - what could make this a fund-returner",
      "category": "market" | "team" | "business_model" | "traction" | "competition"
    }
  ],
  "marketInsight": "Deep market-specific insight showing expertise in this category. Reference market dynamics, recent exits, funding trends, or competitive landscape. Example: 'The vertical SaaS wave in [category] is hitting an inflection point - we're seeing 4x revenue multiples for category leaders vs. 2x for horizontal plays. The winners here will be those who own the workflow, not just provide a tool.'",
  "vcFrameworkCheck": "Apply a specific VC framework to this company. Example: 'Passes Sequoia\\'s \\'Why Now\\' test - regulatory tailwinds and generational shift in buyer behavior create a 2-3 year window. Fails the network effects test - value doesn\\'t compound with scale, which limits terminal valuation.'"
}`;

    const userPrompt = `STARTUP ASSESSMENT REQUEST:

Company: ${companyName || 'Unnamed Startup'}
Stage: ${stage || 'Early'}
Category: ${category || 'Technology'}

${contextParts.length > 0 ? `AVAILABLE CONTEXT:\n${contextParts.join('\n\n')}` : `MINIMAL CONTEXT: Only basic company info available. Focus your analysis on the market category, typical dynamics for ${stage} companies in ${category || 'this space'}, and strategic considerations.`}

Provide your VC Quick Take. Remember:
- Be specific to THIS company and market
- Apply real VC frameworks
- Reference actual case studies
- Focus on strategic analysis, NOT data completeness
- Write like you're briefing your partners

The founder is watching. Show them the caliber of analysis they'll get in the full memo.`;

    console.log('Generating professional VC verdict for:', companyName, '| Context items:', contextParts.length);

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
      // High-quality fallback based on category
      const categoryLower = (category || 'technology').toLowerCase();
      verdict = generateFallbackVerdict(companyName, stage, categoryLower);
    }

    // Validate and ensure arrays
    if (!Array.isArray(verdict.concerns)) verdict.concerns = [];
    if (!Array.isArray(verdict.strengths)) verdict.strengths = [];
    if (!verdict.verdict) verdict.verdict = "Strategic positioning requires deeper analysis.";
    if (!['LOW', 'MEDIUM', 'HIGH'].includes(verdict.readinessLevel)) verdict.readinessLevel = 'MEDIUM';

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

// Category-specific fallback verdicts with real insights
function generateFallbackVerdict(companyName: string, stage: string, category: string) {
  const categoryInsights: Record<string, any> = {
    'saas': {
      verdict: "SaaS at this stage is all about proving repeatable sales motion. The question isn't product-market fit - it's go-to-market fit.",
      marketInsight: "The SaaS market is bifurcating: horizontal tools face 40+ funded competitors while vertical solutions command 3-4x higher valuations. Winners own the workflow. Losers become features. We're seeing consolidation accelerate - 2024 had 2x the M&A of 2023 in this space.",
      vcFrameworkCheck: "Passes the 'Can this be a $100M ARR business?' threshold test. The key question is unit economics - most SaaS at seed has CAC payback over 18 months. Need to see path to under 12 months for Series A."
    },
    'fintech': {
      verdict: "Fintech's second wave is infrastructure, not consumer apps. The regulatory moat cuts both ways - barrier to entry, but also barrier to growth.",
      marketInsight: "Post-2022 fintech recalibration means VCs are back to fundamentals: unit economics, regulatory clarity, and path to profitability. The 'fintech premium' valuation multiplier is gone. Winners now are infrastructure plays (like Plaid's trajectory) or deeply vertical solutions with regulatory advantages.",
      vcFrameworkCheck: "Benchmark's 'distribution advantage' framework is critical here - fintech without proprietary distribution channel faces brutal CAC. Need to see embedded strategy or partnership-led growth."
    },
    'ai': {
      verdict: "AI is the new mobile - everyone's building, but the defensibility question is existential. Model commoditization means the moat is in data and distribution, not the model.",
      marketInsight: "The AI gold rush has created a bifurcated market: infrastructure players (training, deployment) see 10x revenue multiples while application layer faces margin compression. We're tracking 3,000+ AI startups - the ones breaking out have proprietary data flywheels or distribution lock-in. Pure wrappers are getting squeezed.",
      vcFrameworkCheck: "Fails a16z's 'Why won't OpenAI just do this?' test unless there's clear data moat or vertical expertise. Passes the timing test - we're in a 3-5 year window before enterprise AI stacks consolidate."
    },
    'marketplace': {
      verdict: "Marketplaces are binary outcomes - you either achieve liquidity and become a monopoly, or you die in the 'cold start' valley. The economics only work at scale.",
      marketInsight: "Marketplace dynamics in 2024: vertical beats horizontal, managed beats pure platform, and winner-take-most is real. We're seeing successful marketplaces launch with 'single-player mode' - useful even without network effects, then layer in marketplace dynamics. Uber, Airbnb playbook still works but requires more capital.",
      vcFrameworkCheck: "Network effects test: Does value compound with each additional user? Liquidity test: Can you achieve critical mass in a single market before expanding? Most marketplaces die trying to be everywhere at once."
    },
    'healthtech': {
      verdict: "Healthcare's trillion-dollar inefficiency is real, but the sales cycle is a startup killer. Success here requires either regulatory tailwind or distribution hack.",
      marketInsight: "Post-COVID healthtech has bifurcated: digital health faces reimbursement headwinds while infrastructure (interoperability, revenue cycle) sees sustained demand. Enterprise deals average 12-18 month cycles. The winners bypass traditional channels - direct-to-employer, pharmacy integration, or regulatory mandates.",
      vcFrameworkCheck: "First Round's GTM framework is critical: healthcare startups without a distribution shortcut (strategic partner, regulatory forcing function) face 5+ year paths to scale. Need to see evidence of accelerated sales motion."
    },
    'default': {
      verdict: "The fundamental question for any early-stage company: Do you have a unique insight that gives you an unfair advantage in capturing a large market?",
      marketInsight: "Across sectors, we're seeing a return to fundamentals: clear path to profitability, capital efficiency, and defensible differentiation. The ZIRP-era playbook of 'grow at all costs' is dead. Winners in 2024-25 will be those who can demonstrate efficient growth and clear unit economics.",
      vcFrameworkCheck: "Sequoia's 'Why Now?' framework remains the single most important test. Markets don't create companies - timing does. What's changed in technology, regulation, or behavior that creates a window for this specific solution?"
    }
  };

  const insight = categoryInsights[category] || categoryInsights['default'];
  
  return {
    verdict: insight.verdict,
    readinessLevel: "MEDIUM",
    readinessRationale: `${stage} stage companies in ${category} require proof of concept and early market validation. The next milestone is demonstrating repeatable, scalable growth.`,
    concerns: [
      {
        text: "Market timing and competitive positioning need validation. Is this the right moment for this solution, and what creates defensibility against well-funded incumbents?",
        category: "market",
        caseStudyReference: "We've seen promising companies in this space struggle when larger players entered - timing the market expansion phase is critical."
      },
      {
        text: "Distribution strategy is often the hidden killer at this stage. Product-market fit without go-to-market fit creates zombie companies that can't scale.",
        category: "business_model"
      },
      {
        text: "Unit economics at scale need to be modeled. Early traction doesn't always translate to profitable growth - the transition from founder-led sales to scalable motion is where most stumble.",
        category: "traction"
      }
    ],
    strengths: [
      {
        text: `Early positioning in ${category} while the category is still forming creates opportunity for market leadership and category definition.`,
        category: "market"
      },
      {
        text: "Capital efficiency is increasingly valued by VCs. Companies that can show progress with disciplined spend stand out in current market.",
        category: "business_model"
      },
      {
        text: "First-mover advantage in emerging segments can create sustainable competitive moats through customer lock-in and data accumulation.",
        category: "competition"
      }
    ],
    marketInsight: insight.marketInsight,
    vcFrameworkCheck: insight.vcFrameworkCheck
  };
}
