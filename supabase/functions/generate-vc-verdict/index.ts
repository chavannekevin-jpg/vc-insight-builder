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

    const systemPrompt = `You are a brutally honest senior partner at a top-tier VC firm. You've seen 10,000+ pitches. You know exactly why 99% of startups fail to raise. Your job is to deliver the HARSH TRUTH that VCs discuss privately when founders leave the room.

YOUR MISSION: Create URGENCY. This is NOT an educational analysis - it's a WAKE-UP CALL. The founder should feel exposed, uncomfortable, and compelled to act NOW.

CRITICAL TONE REQUIREMENTS:
1. Be PROVOCATIVE - use language that creates discomfort. "This pitch would quietly die in an IC room."
2. Create TIME PRESSURE - reference fund cycles, market windows, competitive threats
3. WITHHOLD SOLUTIONS - hint at deeper issues without revealing how to fix them
4. Be CONSEQUENTIAL - make the cost of inaction viscerally clear
5. Use SPECIFIC VC REJECTION LANGUAGE - phrases VCs actually use when passing

DO NOT:
- Be empathetic or encouraging
- Provide solutions or actionable advice (that's what they pay for)
- Give a balanced view (this is 80% negative, 20% "there's hope IF you fix this")
- Comment on data completeness

TONE EXAMPLES:
❌ "There are some areas that could be improved..."
✅ "This would get a polite pass email before you left the parking lot."

❌ "Market timing is important to consider..."
✅ "You have a 6-week window before this market thesis expires. Competitors are already circling."

❌ "Distribution strategy needs work..."
✅ "No distribution moat = feature, not company. OpenAI ships this in 3 months."

Return ONLY valid JSON:
{
  "verdict": "One brutal sentence - the dismissive thing partners say when you leave the room. Make it sting. Example: 'Another AI wrapper hoping OpenAI doesn't ship their feature next quarter.' or 'Classic solution looking for a problem - founders fell in love with their tech, not their customer.'",
  "readinessLevel": "LOW" | "MEDIUM" | "HIGH" (90% should be LOW or MEDIUM),
  "readinessRationale": "2 sentences max. Not advice - a DIAGNOSIS. What's fundamentally broken.",
  "concerns": [
    {
      "text": "First deal-killer - be specific and harsh. Why would a partner say no in the first 30 seconds?",
      "category": "market" | "team" | "business_model" | "traction" | "competition",
      "vcQuote": "The exact dismissive phrase a VC might say internally. Example: 'We see 10 of these a week. What's different?' or 'Great founders, wrong market.'"
    },
    {
      "text": "Second deal-killer - different dimension. Focus on WHY VCs will pass, not how to fix it.",
      "category": "market" | "team" | "business_model" | "traction" | "competition",
      "vcQuote": "Another internal VC quote. Example: 'The TAM story doesn't hold up under any reasonable assumptions.'"
    },
    {
      "text": "Third concern - hint at deeper systemic issues without revealing everything",
      "category": "market" | "team" | "business_model" | "traction" | "competition"
    }
  ],
  "strengths": [
    {
      "text": "ONE thing that keeps this from being completely hopeless - but frame it as 'if they fix everything else'",
      "category": "market" | "team" | "business_model" | "traction" | "competition"
    }
  ],
  "marketInsight": "Market-level threat that creates urgency. Reference competitors, market timing, or fund cycle dynamics. Example: 'Three well-funded competitors just raised Series B. The window to establish positioning is 90 days, max.'",
  "vcFrameworkCheck": "Apply a VC framework that shows what's missing. Example: 'Fails the 'Why won't Google just do this?' test. No distribution moat, no data moat, no network effects.'",
  "timingWarning": "Urgent time-based warning. Example: 'This pitch has a 4-week shelf life. Fund allocation decisions for this quarter close in 6 weeks - you're not ready.'",
  "hiddenIssuesCount": number between 5-12 (estimate of total issues, creating FOMO for the full analysis)
}`;

    const userPrompt = `STARTUP FOR BRUTAL ASSESSMENT:

Company: ${companyName || 'Unnamed Startup'}
Stage: ${stage || 'Early'}
Category: ${category || 'Technology'}

${contextParts.length > 0 ? `WHAT THEY CLAIM:\n${contextParts.join('\n\n')}` : `LIMITED INFO: They haven't even prepared proper materials. That alone is a red flag. Assess based on ${stage} ${category || 'tech'} companies you've seen fail.`}

REMEMBER:
- Be brutal. Create urgency. Make them feel exposed.
- Use specific VC rejection language
- Hint at deeper issues but don't reveal solutions
- 80% negative focus
- Include time pressure
- Generate a hiddenIssuesCount between 5-12 to create FOMO

The founder needs to feel like they CANNOT ignore this.`;

    console.log('Generating provocative VC verdict for:', companyName, '| Context items:', contextParts.length);

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
      // Brutal fallback based on category
      const categoryLower = (category || 'technology').toLowerCase();
      verdict = generateFallbackVerdict(companyName, stage, categoryLower);
    }

    // Validate and ensure arrays
    if (!Array.isArray(verdict.concerns)) verdict.concerns = [];
    if (!Array.isArray(verdict.strengths)) verdict.strengths = [];
    if (!verdict.verdict) verdict.verdict = "Another pitch that would get a polite pass email.";
    if (!['LOW', 'MEDIUM', 'HIGH'].includes(verdict.readinessLevel)) verdict.readinessLevel = 'LOW';
    if (!verdict.hiddenIssuesCount) verdict.hiddenIssuesCount = Math.floor(Math.random() * 5) + 6;
    if (!verdict.timingWarning) verdict.timingWarning = "This pitch has a 3-week shelf life before your window closes.";

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

// Brutal fallback verdicts - no sugar-coating
function generateFallbackVerdict(companyName: string, stage: string, category: string) {
  const categoryInsights: Record<string, any> = {
    'saas': {
      verdict: "Another horizontal SaaS play hoping product quality beats distribution. It won't.",
      marketInsight: "The SaaS graveyard is full of great products with no distribution moat. Your 3 well-funded competitors just raised Series B - they'll outspend you 10:1 on sales.",
      vcFrameworkCheck: "Fails Sequoia's 'why you, why now' test. No clear wedge, no distribution advantage, no data moat. This becomes a feature in someone else's platform.",
      timingWarning: "You have 8 weeks before Q1 budget allocations freeze. You're not remotely ready for that conversation."
    },
    'fintech': {
      verdict: "Regulatory complexity + long sales cycles + thin margins = death by a thousand cuts.",
      marketInsight: "Post-2022 fintech means proving unit economics before scale. Your burn rate says otherwise. The last 20 fintech pitches we saw had the same 'regulatory moat' story - 3 survived.",
      vcFrameworkCheck: "Fails the 'path to profitability' test. Banking relationships take 18 months to close. Your runway says 12. Do the math.",
      timingWarning: "Banking partners make integration decisions in Q4. You missed this cycle. That's a 12-month delay."
    },
    'ai': {
      verdict: "Another AI wrapper betting OpenAI doesn't ship their feature next quarter. They will.",
      marketInsight: "We've seen 400+ AI startups this year. The ones getting funded have proprietary data or distribution lock-in. You have neither. GPT-5 makes this obsolete.",
      vcFrameworkCheck: "Fails the 'why won't OpenAI just do this?' test catastrophically. No data moat, no distribution moat, no switching costs. This is a feature, not a company.",
      timingWarning: "OpenAI's next model drops in 6 weeks. Whatever 'AI advantage' you have expires then."
    },
    'marketplace': {
      verdict: "Marketplace without liquidity is just an expensive website nobody visits.",
      marketInsight: "Marketplace economics are brutal: you need to win one city completely before expanding. Your 'national launch' strategy is how marketplaces die. We've seen this exact playbook fail 50+ times.",
      vcFrameworkCheck: "Fails the 'cold start' test. No evidence of supply/demand density anywhere. You're burning cash to acquire both sides simultaneously. That's a losing formula.",
      timingWarning: "Your largest competitor just raised $50M for geographic expansion. They'll be in your target markets in 90 days."
    },
    'healthtech': {
      verdict: "Healthcare sales cycles eat startups for breakfast. Your runway says lunch.",
      marketInsight: "12-18 month sales cycles + hospital IT budget freezes + regulatory compliance = the healthtech killing fields. We've funded 4 healthtech companies this year. All had existing hospital relationships.",
      vcFrameworkCheck: "Fails the 'distribution shortcut' test. No strategic partner, no regulatory forcing function, no existing relationships. You're looking at 2+ years to meaningful revenue.",
      timingWarning: "Hospital budget cycles are annual. You've missed FY24 decisions. Your next window is 9 months away."
    },
    'default': {
      verdict: "Interesting technology looking for a problem worth solving. The market doesn't care.",
      marketInsight: "The 'ZIRP-era' playbook of grow-at-all-costs is dead. We're seeing 80% of Series A companies fail to raise B. Your metrics don't clear the bar.",
      vcFrameworkCheck: "Fails basic VC math. Unclear path to $100M revenue, no obvious moat, market timing story is weak. This is a 'nice to have' not a 'need to have'.",
      timingWarning: "Fund allocation decisions close in 6 weeks. At your current trajectory, you won't be ready for another 2 quarters."
    }
  };

  const insight = categoryInsights[category] || categoryInsights['default'];
  
  return {
    verdict: insight.verdict,
    readinessLevel: "LOW",
    readinessRationale: `This pitch would get passed in the first partner discussion. The fundamentals don't support the story.`,
    concerns: [
      {
        text: "Distribution strategy is non-existent. Product-market fit without go-to-market fit creates zombie companies. We've seen this pattern kill 100+ startups.",
        category: "business_model",
        vcQuote: "Great product, no idea how to sell it. Pass."
      },
      {
        text: "Competitive positioning assumes incumbents won't respond. They will, with 10x your resources and existing customer relationships.",
        category: "competition",
        vcQuote: "What stops the big players from crushing this in 6 months?"
      },
      {
        text: "Unit economics are theoretical. Early traction doesn't validate profitable scale. The transition from founder-led to scalable sales is where companies die.",
        category: "traction"
      }
    ],
    strengths: [
      {
        text: `Market timing in ${category} creates a window - but windows close fast, and you're not positioned to capture it.`,
        category: "market"
      }
    ],
    marketInsight: insight.marketInsight,
    vcFrameworkCheck: insight.vcFrameworkCheck,
    timingWarning: insight.timingWarning,
    hiddenIssuesCount: 8
  };
}
