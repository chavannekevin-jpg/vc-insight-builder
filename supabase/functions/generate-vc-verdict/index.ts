import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Safe string helpers for edge function
const safeLower = (val: unknown, context?: string): string => {
  if (typeof val === 'string') return val.toLowerCase();
  if (val === null || val === undefined) return '';
  if (typeof val === 'number' || typeof val === 'boolean') return String(val).toLowerCase();
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    if ('text' in obj) return safeLower(obj.text, context);
    if ('value' in obj) return safeLower(obj.value, context);
    if (context) console.warn(`[safeLower] Expected string in ${context}, got object`, val);
    return '';
  }
  if (context) console.warn(`[safeLower] Expected string in ${context}, got ${typeof val}`, val);
  return '';
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyName, companyDescription, stage, category, responses, deckParsed, forcedFounderProfile } = await req.json();

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

    // Use forced profile if provided, otherwise detect from signals
    const founderProfileSignals = forcedFounderProfile 
      ? { profile: forcedFounderProfile, toneGuidance: getFounderToneGuidance(forcedFounderProfile) }
      : detectFounderProfile(founderBackground, traction, stage, category);

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

    const systemPrompt = `You are simulating what partners say to each other when the founder leaves the room. This is NOT advice—this is observation. You are the room after the meeting.

You've seen 10,000+ pitches. You know exactly why 99% of startups fail to raise. Your job is to provide an HONEST DIAGNOSTIC—the real questions VCs would discuss privately.

CRITICAL FRAMING: Be direct but not discouraging.
- VCs identify gaps and question assumptions—they don't dismiss outright
- The goal is to PREPARE founders for investor meetings, not to demoralize them
- Every concern should feel like "here's what you need to address" not "here's why you'll fail"
- Frame issues as questions to prepare for, not death sentences

FOUNDER PROFILE DETECTED: ${founderProfileSignals.profile}
${founderProfileSignals.toneGuidance}

CRITICAL TONE REQUIREMENTS:
1. Be PRECISE - every observation should feel anchored to something specific they said or showed
2. BALANCE is essential - identify genuine strengths alongside gaps
3. Frame concerns as QUESTIONS VCs will ask, not reasons they'll fail
4. WITHHOLD SOLUTIONS - hint at what changes the narrative without revealing how
5. Show the TRANSFORMATION POSSIBILITY - tease how the conversation could change

BALANCE IS KEY:
- Be honest about gaps, but frame them as questions to prepare for
- Include 2-3 genuine strengths alongside concerns
- Show that every concern has a path to resolution
- The founder should feel motivated to dig deeper, not give up

DO NOT:
- Be cruel or dismissive
- Suggest the business is hopeless
- Use language that makes founders feel stupid
- Comment on data completeness

TONE EXAMPLES:
❌ "This gets a polite pass email before you leave the parking lot." (too harsh)
✅ "VCs will ask about your distribution strategy—that's the gap to address first."

❌ "This narrative doesn't survive scrutiny" (dismissive)
✅ "Partners will probe on competitive positioning—here's what they'll question."

❌ "Another horizontal SaaS play hoping product quality beats distribution. It won't." (cruel)
✅ "The distribution question is the key unlock—VCs see this as the primary gap."

Return ONLY valid JSON:
{
  "verdict": "One honest sentence - what partners would say after the meeting. Be direct but not cruel. Reference something SPECIFIC from their pitch.",
  "readinessLevel": "LOW" | "MEDIUM" | "HIGH",
  "readinessRationale": "2 sentences max. What questions this pitch raises for partners. Be SPECIFIC to their claims.",
  "rulingStatement": "A company-specific assessment explaining the key questions VCs will ask. Reference their actual claims. Example: 'The core question is market definition—the ICP spans three industries, which VCs will want narrowed.' MUST be specific to THIS company.",
  "killerQuestion": "The one question this founder should prepare for before VC meetings. Make it SPECIFIC to their pitch. Example: 'What's your answer when they ask about [specific competitor]'s response?' NOT generic.",
  "frameworkScore": 35,
  "criteriaCleared": 2,
  "icStoppingPoint": "Market" | "Team" | "Traction" | "Business Model" | "Competition",
  "concerns": [
    {
      "text": "First question VCs will ask - be VERY specific to what they claimed.",
      "category": "market" | "team" | "business_model" | "traction" | "competition",
      "vcQuote": "How a VC might phrase this question internally.",
      "teaserLine": "COMPLETE sentence starting with 'Partners' (NOT 'Partner A/B/C'—use 'Partners' as a collective). Frame as a question they'll probe. Good examples: 'Partners will question the sales cycle length—enterprise deals take 9 months but runway supports 6.' or 'Partners noted the market sizing needs bottoms-up validation.'"
    },
    {
      "text": "Second question - different dimension.",
      "category": "market" | "team" | "business_model" | "traction" | "competition",
      "vcQuote": "Internal VC phrasing.",
      "teaserLine": "COMPLETE sentence starting with 'Partners'. Frame as a question. Example: 'Partners will ask how the competitive moat holds up against well-funded alternatives.'"
    },
    {
      "text": "Third question",
      "category": "market" | "team" | "business_model" | "traction" | "competition",
      "teaserLine": "COMPLETE sentence starting with 'Partners'. Example: 'Partners flagged unit economics as an area needing clearer validation.'"
    },
    {
      "text": "Fourth question if applicable",
      "category": "market" | "team" | "business_model" | "traction" | "competition",
      "teaserLine": "COMPLETE sentence starting with 'Partners'. Be specific to their pitch."
    },
    {
      "text": "Fifth question if applicable",
      "category": "market" | "team" | "business_model" | "traction" | "competition",
      "teaserLine": "COMPLETE sentence starting with 'Partners'. Be specific to their pitch."
    }
  ],
  "strengths": [
    {
      "text": "First genuine strength VCs would acknowledge - be specific to what they showed",
      "category": "market" | "team" | "business_model" | "traction" | "competition"
    },
    {
      "text": "Second genuine strength or promising signal",
      "category": "market" | "team" | "business_model" | "traction" | "competition"
    },
    {
      "text": "Third strength if applicable (can be null)",
      "category": "market" | "team" | "business_model" | "traction" | "competition"
    }
  ],
  "marketInsight": "Market-level observation SPECIFIC to their category and positioning.",
  "vcFrameworkCheck": "Apply a VC framework showing key questions SPECIFIC to their claims.",
  "diagnosticSummary": "The core question VCs will focus on—and why addressing it changes the conversation. Frame constructively.",
  "pathForward": "One sentence showing that every concern above is addressable with the right preparation. Tease the full analysis.",
  "narrativeTransformation": {
    "currentNarrative": "What VCs currently hear when THIS company pitches: One sentence summarizing the perception. Be specific but not cruel.",
    "transformedNarrative": "What they'd hear with preparation: One sentence showing the conversation shift. Tease, don't reveal."
  },
  "preparationSummary": "A 4-5 sentence paragraph demonstrating deep understanding of THIS company. OPENING (use exactly): 'We have listed over 30 questions VCs will ask—and we have answers to all of them.' MIDDLE (3-4 sentences): Reference SPECIFIC things from their pitch—NOT generic topics. BAD: 'market validation, competitive positioning, team credibility' GOOD: 'Your $50B TAM relies on top-down industry reports—we've rebuilt it with a bottoms-up calculation.' 'The 15% MoM growth is strong, but VCs will ask about retention—we've prepared the cohort analysis framework.' 'Three competitors have raised Series B, but your differentiation isn't framed for VC conversations—we've rebuilt the competitive narrative.' Use their ACTUAL numbers, claims (${category}, ${stage}), and gaps from the pitch materials. Each sentence should name a specific gap and what we've prepared. CLOSING (use exactly): 'The full analysis gives you everything you need to walk into investor meetings fully prepared.'",
  "founderProfile": "${founderProfileSignals.profile}",
  "hiddenIssuesCount": 8
}`;

    const userPrompt = `STARTUP FOR VC DIAGNOSTIC:

Company: ${companyName || 'Unnamed Startup'}
Stage: ${stage || 'Early'}
Category: ${category || 'Technology'}

${contextParts.length > 0 ? `WHAT THEY CLAIM:\n${contextParts.join('\n\n')}` : `LIMITED INFO: They haven't provided detailed materials yet—focus on general stage-appropriate questions.`}

REMEMBER:
- Be honest but constructive. Focus on preparing the founder.
- Make observations feel anchored to what they actually said
- Include 2-3 genuine strengths alongside the questions
- Show the gap between current narrative and what would work
- Include the narrative transformation (before/after)
- Detect and respond to founder profile: ${founderProfileSignals.profile}

Help the founder understand what VCs will question—and motivate them to prepare answers.`;

    console.log('Generating VC verdict for:', companyName, '| Profile:', founderProfileSignals.profile);

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
      const categoryLower = safeLower(category || 'technology', "generate-vc-verdict.fallback");
      verdict = generateFallbackVerdict(companyName, stage, categoryLower, founderProfileSignals.profile);
    }

    // Validate and ensure arrays
    if (!Array.isArray(verdict.concerns)) verdict.concerns = [];
    if (!Array.isArray(verdict.strengths)) verdict.strengths = [];
    if (!verdict.verdict) verdict.verdict = "This pitch raises questions VCs will want to explore further.";
    if (!['LOW', 'MEDIUM', 'HIGH'].includes(verdict.readinessLevel)) verdict.readinessLevel = 'LOW';
    if (!verdict.hiddenIssuesCount) verdict.hiddenIssuesCount = Math.floor(Math.random() * 5) + 6;
    
    // Support both old field name and new field name
    if (!verdict.diagnosticSummary && verdict.inevitabilityStatement) {
      verdict.diagnosticSummary = verdict.inevitabilityStatement;
    }
    if (!verdict.diagnosticSummary) {
      verdict.diagnosticSummary = "The core question is whether the pitch addresses what VCs need to see for this stage. The full analysis provides the roadmap.";
    }
    // Keep inevitabilityStatement for backwards compatibility
    verdict.inevitabilityStatement = verdict.diagnosticSummary;
    
    if (!verdict.pathForward) {
      verdict.pathForward = "Every question above has a proven way to address it—the full analysis shows exactly how.";
    }
    if (!verdict.narrativeTransformation) {
      verdict.narrativeTransformation = {
        currentNarrative: "A pitch that raises questions VCs will want answered.",
        transformedNarrative: "A company that anticipates and addresses investor concerns upfront."
      };
    }
    if (!verdict.founderProfile) verdict.founderProfile = founderProfileSignals.profile;
    if (!verdict.preparationSummary) {
      verdict.preparationSummary = `VCs will ask over 30 questions during your raise—we've identified and prepared responses for each one. Looking at your ${category || 'company'} pitch at ${stage} stage, we've mapped the key areas investors will probe: market validation, competitive positioning, team credibility, and milestone planning. Each section of the full analysis addresses these gaps with specific frameworks and prepared responses.`;
    }

    console.log('Generated verdict for:', companyName, 'Level:', verdict.readinessLevel, 'Profile:', verdict.founderProfile);

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

// Get tone guidance for a specific founder profile
function getFounderToneGuidance(profile: string): string {
  const toneGuidanceMap: Record<string, string> = {
    'serial_founder': 'This is a serial founder. Be direct and respect their experience—they know the game. Focus on the specific questions THIS bet raises, and acknowledge their track record.',
    'technical_founder': 'This is a technical founder. They may prioritize product over distribution—help them see what VCs will probe. Frame go-to-market questions constructively.',
    'business_founder': 'This is a business-background founder. They likely have a polished deck—help them anticipate technical depth and defensibility questions VCs will ask.',
    'domain_expert': 'This is a domain expert founder. They know their industry—help them prepare for questions about startup dynamics and scalable distribution.',
    'first_time_founder': 'This is likely a first-time founder. Be direct about what VCs look for, but frame it as preparation rather than criticism. Focus on fundamentals: market size, defensibility, and team.'
  };
  return toneGuidanceMap[profile] || toneGuidanceMap['first_time_founder'];
}

// Detect founder profile from signals
function detectFounderProfile(founderBackground: string, traction: string, stage: string, category: string): { profile: string; toneGuidance: string } {
  const bgLower = safeLower(founderBackground || '', "detectFounderProfile.bg");
  const tractionLower = safeLower(traction || '', "detectFounderProfile.traction");
  
  // Serial founder indicators
  if (bgLower.includes('exited') || bgLower.includes('sold') || bgLower.includes('previous startup') || 
      bgLower.includes('founded') || bgLower.includes('co-founded') || bgLower.includes('serial')) {
    return {
      profile: 'serial_founder',
      toneGuidance: 'This is a serial founder. Be direct and respect their experience—they know the game. Focus on the specific questions THIS bet raises, and acknowledge their track record.'
    };
  }
  
  // Technical founder indicators
  if (bgLower.includes('engineer') || bgLower.includes('developer') || bgLower.includes('phd') ||
      bgLower.includes('research') || bgLower.includes('technical') || bgLower.includes('built')) {
    return {
      profile: 'technical_founder',
      toneGuidance: 'This is a technical founder. They may prioritize product over distribution—help them see what VCs will probe. Frame go-to-market questions constructively.'
    };
  }
  
  // MBA/Business founder indicators
  if (bgLower.includes('mba') || bgLower.includes('consulting') || bgLower.includes('banking') ||
      bgLower.includes('strategy') || bgLower.includes('business development')) {
    return {
      profile: 'business_founder',
      toneGuidance: 'This is a business-background founder. They likely have a polished deck—help them anticipate technical depth and defensibility questions VCs will ask.'
    };
  }
  
  // Domain expert indicators
  if (bgLower.includes('years in') || bgLower.includes('industry expert') || bgLower.includes('domain') ||
      bgLower.includes('worked at') || bgLower.includes('led') || bgLower.includes('managed')) {
    return {
      profile: 'domain_expert',
      toneGuidance: 'This is a domain expert founder. They know their industry—help them prepare for questions about startup dynamics and scalable distribution.'
    };
  }
  
  // First-time founder (default)
  return {
    profile: 'first_time_founder',
    toneGuidance: 'This is likely a first-time founder. Be direct about what VCs look for, but frame it as preparation rather than criticism. Focus on fundamentals: market size, defensibility, and team.'
  };
}

// Fallback verdicts with balanced, diagnostic framing
function generateFallbackVerdict(companyName: string, stage: string, category: string, founderProfile: string) {
  const categoryInsights: Record<string, any> = {
    'saas': {
      verdict: "VCs will focus on distribution strategy—the key question for horizontal SaaS plays.",
      marketInsight: "The SaaS market is competitive. VCs look for clear wedge strategies and distribution advantages.",
      vcFrameworkCheck: "Partners will apply the 'why you, why now' test—be ready to articulate your unique positioning.",
      diagnosticSummary: "The core question is distribution: how do you reach customers more efficiently than funded alternatives? The full analysis provides frameworks to address this.",
      pathForward: "Distribution questions are solvable—the full analysis shows proven approaches for your category.",
      narrativeTransformation: {
        currentNarrative: "A SaaS company in a competitive market with product strengths to leverage.",
        transformedNarrative: "A company with a clear wedge strategy and distribution playbook."
      }
    },
    'fintech': {
      verdict: "VCs will probe on unit economics and regulatory path—the core questions for fintech.",
      marketInsight: "Post-2022 fintech means proving unit economics before scale. VCs want to see the path.",
      vcFrameworkCheck: "Partners will ask about the path to profitability and banking relationships.",
      diagnosticSummary: "The key questions are economics and regulatory timeline. The full analysis provides frameworks to address both.",
      pathForward: "Fintech unit economics questions are addressable—the analysis shows how to frame your path.",
      narrativeTransformation: {
        currentNarrative: "A fintech with promising technology navigating regulatory complexity.",
        transformedNarrative: "A company with proven economics and a clear regulatory path."
      }
    },
    'ai': {
      verdict: "VCs will ask about defensibility—the central question for AI companies right now.",
      marketInsight: "The AI space is crowded. VCs look for proprietary data or distribution lock-in.",
      vcFrameworkCheck: "Partners will apply the 'why won't foundation model providers do this?' test.",
      diagnosticSummary: "The core question is defensibility: what creates a moat as AI capabilities improve? The full analysis addresses this directly.",
      pathForward: "Defensibility in AI is achievable—the analysis shows proven moat-building strategies.",
      narrativeTransformation: {
        currentNarrative: "An AI company with strong technology seeking its defensible position.",
        transformedNarrative: "A company with proprietary advantages that compound over time."
      }
    },
    'marketplace': {
      verdict: "VCs will focus on liquidity and density—the core questions for marketplaces.",
      marketInsight: "Marketplace economics require winning one market completely before expanding.",
      vcFrameworkCheck: "Partners will probe the cold start strategy and supply/demand density.",
      diagnosticSummary: "The key question is liquidity: how do you solve chicken-and-egg in your first market? The full analysis provides the playbook.",
      pathForward: "Marketplace cold start is a solved problem—the analysis shows proven approaches.",
      narrativeTransformation: {
        currentNarrative: "A marketplace building toward liquidity with strong fundamentals.",
        transformedNarrative: "A company with density in one market and a replication playbook."
      }
    },
    'healthtech': {
      verdict: "VCs will question sales cycle and runway alignment—the critical healthtech question.",
      marketInsight: "Healthcare sales cycles are long. VCs look for distribution shortcuts or existing relationships.",
      vcFrameworkCheck: "Partners will probe distribution strategy and hospital relationship shortcuts.",
      diagnosticSummary: "The core question is sales cycle vs. runway. The full analysis shows how to address this concern.",
      pathForward: "Healthcare distribution challenges have proven solutions—the analysis covers them.",
      narrativeTransformation: {
        currentNarrative: "A healthtech with strong domain expertise building toward hospital traction.",
        transformedNarrative: "A company with existing health system relationships and validated demand."
      }
    },
    'default': {
      verdict: "VCs will probe market opportunity and positioning—the fundamental questions for any startup.",
      marketInsight: "The investment bar is high. VCs look for clear paths to large outcomes.",
      vcFrameworkCheck: "Partners will evaluate market size, defensibility, and path to scale.",
      diagnosticSummary: "The key questions are market size and positioning. The full analysis provides frameworks to strengthen both.",
      pathForward: "These fundamental questions are addressable—the analysis shows how to frame your opportunity.",
      narrativeTransformation: {
        currentNarrative: "A company with promising technology seeking clearer market positioning.",
        transformedNarrative: "A company attacking a clear large opportunity with differentiated positioning."
      }
    }
  };

  const insight = categoryInsights[category] || categoryInsights['default'];
  
  return {
    verdict: insight.verdict,
    readinessLevel: "LOW",
    readinessRationale: `This pitch will raise questions partners will want to explore. Preparing answers strengthens your position.`,
    concerns: [
      {
        text: "Distribution strategy will be probed—VCs want to understand the path to customers.",
        category: "business_model",
        vcQuote: "How does this reach customers at scale?"
      },
      {
        text: "Competitive positioning needs clarity—partners will ask how you defend against alternatives.",
        category: "competition",
        vcQuote: "What's the moat here?"
      },
      {
        text: "Unit economics should be validated—the transition to scalable growth is key.",
        category: "traction"
      }
    ],
    strengths: [
      {
        text: `Market timing in ${category} creates opportunity—VCs are looking for the right companies.`,
        category: "market"
      },
      {
        text: "The problem being addressed is real—that's the foundation to build on.",
        category: "market"
      }
    ],
    marketInsight: insight.marketInsight,
    vcFrameworkCheck: insight.vcFrameworkCheck,
    diagnosticSummary: insight.diagnosticSummary,
    inevitabilityStatement: insight.diagnosticSummary,
    pathForward: insight.pathForward,
    narrativeTransformation: insight.narrativeTransformation,
    founderProfile: founderProfile,
    hiddenIssuesCount: 8
  };
}
