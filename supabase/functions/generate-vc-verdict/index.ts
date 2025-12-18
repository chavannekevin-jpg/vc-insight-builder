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
    const { companyId, companyName, companyDescription, stage, category, responses, deckParsed, forcedFounderProfile } = await req.json();

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

    // Fetch memo content if available (for tailor-made concerns)
    let memoSections: Record<string, any> = {};
    let hasMemoContent = false;
    
    if (companyId) {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      
      const { data: memo } = await supabaseClient
        .from("memos")
        .select("structured_content")
        .eq("company_id", companyId)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (memo?.structured_content) {
        hasMemoContent = true;
        const content = memo.structured_content as any;
        
        // Extract key insights from each section
        const sectionNames = ['Problem', 'Solution', 'Market', 'Competition', 'Team', 'Business Model', 'Traction', 'Vision'];
        sectionNames.forEach(name => {
          const section = content[name];
          if (section) {
            memoSections[name] = {
              score: section.score,
              headline: section.headline,
              vcSummary: section.vcReflection?.summary || section.vcSummary,
              concerns: section.vcReflection?.concerns || [],
              questions: section.vcReflection?.questions || []
            };
          }
        });
        
        console.log('Loaded memo content for', companyName, '- sections:', Object.keys(memoSections));
      }
    }

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

You've seen 10,000+ pitches. You know exactly why 99% of startups fail to raise. Your job is to deliver the HARSH TRUTH that VCs discuss privately.

CRITICAL FRAMING: Focus on STRUCTURAL INEVITABILITY, not time pressure.
- VCs don't reject companies because of a clock—they reject them because they don't see a credible path to fund-scale outcomes
- The urgency should come from "this narrative collapses under scrutiny" not "time is running out"
- Frame issues as structural logic failures, not deadlines

FOUNDER PROFILE DETECTED: ${founderProfileSignals.profile}
${founderProfileSignals.toneGuidance}

CRITICAL TONE REQUIREMENTS:
1. Be PRECISE - every criticism should feel anchored to something specific they said or showed
2. Focus on INEVITABILITY - why this pitch fails structurally, not temporally
3. WITHHOLD SOLUTIONS - hint at what changes the narrative without revealing how
4. Use SPECIFIC VC REJECTION LANGUAGE - phrases VCs actually use when passing
5. Show the TRANSFORMATION POSSIBILITY - tease how the internal conversation could change

DO NOT:
- Be empathetic or encouraging
- Provide solutions or actionable advice
- Use generic time-pressure language ("you have X weeks")
- Comment on data completeness

TONE EXAMPLES:
❌ "There are some areas that could be improved..."
✅ "This gets a polite pass email before you leave the parking lot."

❌ "Market timing is important to consider..."
✅ "This narrative doesn't survive the 'why won't incumbents crush this?' question. That's structural, not timing."

❌ "You have 6 weeks before..."
✅ "This pitch fails because there's no defensible answer to the questions partners will ask. Every IC meeting ends the same way."

Return ONLY valid JSON:
{
  "verdict": "One brutal sentence - the dismissive thing partners say when you leave. Make it sting. Reference something SPECIFIC from their pitch.",
  "readinessLevel": "LOW" | "MEDIUM" | "HIGH",
  "readinessRationale": "2 sentences max. Why this narrative structurally fails under partner scrutiny. Be SPECIFIC to their claims.",
  "rulingStatement": "A company-specific verdict explaining why this pitch structurally fails. Reference their actual claims. Example: 'This pitch fails at the market definition level—the ICP spans three industries, which means no wedge strategy.' MUST be specific to THIS company.",
  "killerQuestion": "The one question that would stump this founder in an IC meeting. Make it SPECIFIC to their pitch. Example: 'What happens when [specific competitor] ships the same feature in 6 months?' NOT generic.",
  "frameworkScore": 35,
  "criteriaCleared": 2,
  "icStoppingPoint": "Market" | "Team" | "Traction" | "Business Model" | "Competition",
  "concerns": [
    {
      "text": "First deal-killer - be VERY specific to what they claimed.",
      "category": "market" | "team" | "business_model" | "traction" | "competition",
      "vcQuote": "The exact dismissive phrase a VC might say internally.",
      "teaserLine": "COMPLETE sentence starting with 'Partners' (NOT 'Partner A/B/C'—use 'Partners' as a collective). Must be specific to THIS company. Good examples: 'Partners raised concerns about the sales cycle length—enterprise deals take 9 months but runway only supports 6.' or 'Partners questioned the market sizing—the bottoms-up calculation suggests a $50M TAM, not $2B.'"
    },
    {
      "text": "Second deal-killer - different dimension.",
      "category": "market" | "team" | "business_model" | "traction" | "competition",
      "vcQuote": "Internal VC quote.",
      "teaserLine": "COMPLETE sentence starting with 'Partners'. NEVER use 'Partner A/B/C/D'. Example: 'Partners noted the competitive moat relies entirely on execution speed—that is not defensible.'"
    },
    {
      "text": "Third concern",
      "category": "market" | "team" | "business_model" | "traction" | "competition",
      "teaserLine": "COMPLETE sentence starting with 'Partners'. Example: 'Partners flagged that the unit economics require 3x current ACV to work.'"
    },
    {
      "text": "Fourth concern if applicable",
      "category": "market" | "team" | "business_model" | "traction" | "competition",
      "teaserLine": "COMPLETE sentence starting with 'Partners'. Be specific to their pitch."
    },
    {
      "text": "Fifth concern if applicable",
      "category": "market" | "team" | "business_model" | "traction" | "competition",
      "teaserLine": "COMPLETE sentence starting with 'Partners'. Be specific to their pitch."
    }
  ],
  "strengths": [
    {
      "text": "ONE thing that keeps this from being completely hopeless - be specific to what they showed",
      "category": "market" | "team" | "business_model" | "traction" | "competition"
    }
  ],
  "marketInsight": "Market-level structural challenge SPECIFIC to their category and positioning.",
  "vcFrameworkCheck": "Apply a VC framework showing structural gaps SPECIFIC to their claims.",
  "inevitabilityStatement": "Why this pitch STRUCTURALLY fails—not timing, but logic. Reference their actual claims.",
  "narrativeTransformation": {
    "currentNarrative": "What VCs currently say about THIS pitch: One harsh sentence summarizing how they dismiss it. Be specific.",
    "transformedNarrative": "What they'd say if fixed: One sentence showing the conversation shift. Tease, don't reveal."
  },
  "founderProfile": "${founderProfileSignals.profile}",
  "hiddenIssuesCount": 8
}`;

    // Build memo analysis context if available
    let memoAnalysisContext = '';
    if (hasMemoContent && Object.keys(memoSections).length > 0) {
      memoAnalysisContext = `\n\n=== DEEP ANALYSIS FROM INVESTMENT MEMO ===
Use these specific insights to craft TAILOR-MADE concerns with concrete details:

`;
      Object.entries(memoSections).forEach(([sectionName, data]: [string, any]) => {
        memoAnalysisContext += `\n### ${sectionName} Section (Score: ${data.score || 'N/A'}/100)`;
        if (data.headline) memoAnalysisContext += `\nHeadline: ${data.headline}`;
        if (data.vcSummary) memoAnalysisContext += `\nVC Assessment: ${data.vcSummary}`;
        if (data.concerns && data.concerns.length > 0) {
          memoAnalysisContext += `\nConcerns identified: ${data.concerns.slice(0, 3).join('; ')}`;
        }
        memoAnalysisContext += '\n';
      });
      
      memoAnalysisContext += `
CRITICAL: Use the SPECIFIC concerns and scores above to craft your verdict and teaserLines.
Each teaserLine must reference ACTUAL issues found in the analysis above.
Example: If Market section shows concern about "ICP spans multiple industries", your teaserLine should be:
"Partners flagged the ICP definition—spanning fintech, retail, and healthcare means no focused wedge strategy."`;
    }

    const userPrompt = `STARTUP FOR BRUTAL ASSESSMENT:

Company: ${companyName || 'Unnamed Startup'}
Stage: ${stage || 'Early'}
Category: ${category || 'Technology'}

${contextParts.length > 0 ? `WHAT THEY CLAIM:\n${contextParts.join('\n\n')}` : `LIMITED INFO: They haven't even prepared proper materials. That alone is a red flag.`}
${memoAnalysisContext}

REMEMBER:
- Be brutal. Focus on structural inevitability.
- Make criticisms feel anchored to what they actually said
- ${hasMemoContent ? 'USE THE SPECIFIC CONCERNS FROM THE MEMO ANALYSIS ABOVE for teaserLines' : 'Derive concerns from what they claimed'}
- Show the gap between current narrative and what would work
- Include the narrative transformation (before/after)
- Detect and respond to founder profile: ${founderProfileSignals.profile}

The founder should feel exposed and compelled to fix this NOW.`;

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
      const categoryLower = (category || 'technology').toLowerCase();
      verdict = generateFallbackVerdict(companyName, stage, categoryLower, founderProfileSignals.profile);
    }

    // Validate and ensure arrays
    if (!Array.isArray(verdict.concerns)) verdict.concerns = [];
    if (!Array.isArray(verdict.strengths)) verdict.strengths = [];
    if (!verdict.verdict) verdict.verdict = "Another pitch that would get a polite pass email.";
    if (!['LOW', 'MEDIUM', 'HIGH'].includes(verdict.readinessLevel)) verdict.readinessLevel = 'LOW';
    if (!verdict.hiddenIssuesCount) verdict.hiddenIssuesCount = Math.floor(Math.random() * 5) + 6;
    if (!verdict.inevitabilityStatement) {
      verdict.inevitabilityStatement = "This pitch fails because the core logic doesn't survive partner scrutiny. It's not about timing—it's about structure.";
    }
    if (!verdict.narrativeTransformation) {
      verdict.narrativeTransformation = {
        currentNarrative: "Another pitch that doesn't clear the bar.",
        transformedNarrative: "A company that understands what VCs actually fund."
      };
    }
    if (!verdict.founderProfile) verdict.founderProfile = founderProfileSignals.profile;

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
    'serial_founder': 'This is a serial founder. Be direct and skip the basics—they know the game. Focus on why THIS specific bet doesn\'t clear the bar despite their track record. Challenge them on pattern matching from past success.',
    'technical_founder': 'This is a technical founder. They likely overvalue product and undervalue distribution. Hit hard on go-to-market, sales motion, and why technical excellence alone doesn\'t win. Challenge the "if we build it, they will come" assumption.',
    'business_founder': 'This is a business-background founder. They likely have a polished deck but may lack technical depth or product intuition. Challenge them on defensibility, technical moat, and whether they can actually build what they\'re pitching.',
    'domain_expert': 'This is a domain expert founder. They know their industry but may be blind to startup dynamics. Challenge them on why they\'re building a startup vs. a consultancy, and whether their network translates to scalable distribution.',
    'first_time_founder': 'This is likely a first-time founder. They may not understand VC math or what "fundable" really means. Be direct about the bar they need to clear. Focus on fundamentals: market size, defensibility, and why this team can win.'
  };
  return toneGuidanceMap[profile] || toneGuidanceMap['first_time_founder'];
}

// Detect founder profile from signals
function detectFounderProfile(founderBackground: string, traction: string, stage: string, category: string): { profile: string; toneGuidance: string } {
  const bgLower = (founderBackground || '').toLowerCase();
  const tractionLower = (traction || '').toLowerCase();
  
  // Serial founder indicators
  if (bgLower.includes('exited') || bgLower.includes('sold') || bgLower.includes('previous startup') || 
      bgLower.includes('founded') || bgLower.includes('co-founded') || bgLower.includes('serial')) {
    return {
      profile: 'serial_founder',
      toneGuidance: 'This is a serial founder. Be direct and skip the basics—they know the game. Focus on why THIS specific bet doesn\'t clear the bar despite their track record. Challenge them on pattern matching from past success.'
    };
  }
  
  // Technical founder indicators
  if (bgLower.includes('engineer') || bgLower.includes('developer') || bgLower.includes('phd') ||
      bgLower.includes('research') || bgLower.includes('technical') || bgLower.includes('built')) {
    return {
      profile: 'technical_founder',
      toneGuidance: 'This is a technical founder. They likely overvalue product and undervalue distribution. Hit hard on go-to-market, sales motion, and why technical excellence alone doesn\'t win. Challenge the "if we build it, they will come" assumption.'
    };
  }
  
  // MBA/Business founder indicators
  if (bgLower.includes('mba') || bgLower.includes('consulting') || bgLower.includes('banking') ||
      bgLower.includes('strategy') || bgLower.includes('business development')) {
    return {
      profile: 'business_founder',
      toneGuidance: 'This is a business-background founder. They likely have a polished deck but may lack technical depth or product intuition. Challenge them on defensibility, technical moat, and whether they can actually build what they\'re pitching.'
    };
  }
  
  // Domain expert indicators
  if (bgLower.includes('years in') || bgLower.includes('industry expert') || bgLower.includes('domain') ||
      bgLower.includes('worked at') || bgLower.includes('led') || bgLower.includes('managed')) {
    return {
      profile: 'domain_expert',
      toneGuidance: 'This is a domain expert founder. They know their industry but may be blind to startup dynamics. Challenge them on why they\'re building a startup vs. a consultancy, and whether their network translates to scalable distribution.'
    };
  }
  
  // First-time founder (default)
  return {
    profile: 'first_time_founder',
    toneGuidance: 'This is likely a first-time founder. They may not understand VC math or what "fundable" really means. Be direct about the bar they need to clear. Focus on fundamentals: market size, defensibility, and why this team can win.'
  };
}

// Fallback verdicts with inevitability framing
function generateFallbackVerdict(companyName: string, stage: string, category: string, founderProfile: string) {
  const categoryInsights: Record<string, any> = {
    'saas': {
      verdict: "Another horizontal SaaS play hoping product quality beats distribution. It won't.",
      marketInsight: "The SaaS graveyard is full of great products with no distribution moat.",
      vcFrameworkCheck: "Fails Sequoia's 'why you, why now' test. No clear wedge, no distribution advantage.",
      inevitabilityStatement: "This pitch fails because there's no answer to 'why won't the 10 funded competitors with better distribution win?' That question ends every IC discussion.",
      narrativeTransformation: {
        currentNarrative: "Another SaaS tool in a crowded market hoping to out-product the competition.",
        transformedNarrative: "A company with a wedge strategy that makes distribution inevitable."
      }
    },
    'fintech': {
      verdict: "Regulatory complexity + long sales cycles + thin margins = structural death spiral.",
      marketInsight: "Post-2022 fintech means proving unit economics before scale.",
      vcFrameworkCheck: "Fails the 'path to profitability' test. Banking relationships take 18 months.",
      inevitabilityStatement: "This pitch fails because the unit economics don't work at any scale partners can model. It's not about timing—the math just doesn't close.",
      narrativeTransformation: {
        currentNarrative: "A fintech hoping to figure out unit economics at scale.",
        transformedNarrative: "A company with proven economics and a clear path through regulatory complexity."
      }
    },
    'ai': {
      verdict: "Another AI wrapper betting the foundation model providers won't ship their feature.",
      marketInsight: "We've seen 400+ AI startups this year. The ones getting funded have proprietary data or distribution lock-in.",
      vcFrameworkCheck: "Fails the 'why won't OpenAI just do this?' test catastrophically.",
      inevitabilityStatement: "This pitch fails because there's no defensible moat. The moment foundation models improve, this becomes a feature. That's not timing—it's structural.",
      narrativeTransformation: {
        currentNarrative: "An AI company hoping to stay ahead of the foundation model providers.",
        transformedNarrative: "A company with proprietary data and distribution that makes AI capabilities a moat."
      }
    },
    'marketplace': {
      verdict: "Marketplace without liquidity is just an expensive website nobody visits.",
      marketInsight: "Marketplace economics are brutal: you need to win one city completely before expanding.",
      vcFrameworkCheck: "Fails the 'cold start' test. No evidence of supply/demand density.",
      inevitabilityStatement: "This pitch fails because you can't solve the chicken-and-egg problem at national scale. Every marketplace that tried this playbook is dead.",
      narrativeTransformation: {
        currentNarrative: "A marketplace trying to solve chicken-and-egg nationally.",
        transformedNarrative: "A company with density in one market and a playbook to replicate."
      }
    },
    'healthtech': {
      verdict: "Healthcare sales cycles eat startups for breakfast. Your runway says lunch.",
      marketInsight: "12-18 month sales cycles + hospital IT budget freezes = the healthtech killing fields.",
      vcFrameworkCheck: "Fails the 'distribution shortcut' test. No strategic partner, no regulatory forcing function.",
      inevitabilityStatement: "This pitch fails because you're asking VCs to bet you'll survive 2+ years of sales cycles with current runway. The math makes that impossible.",
      narrativeTransformation: {
        currentNarrative: "A healthtech hoping to survive long enough to close hospital deals.",
        transformedNarrative: "A company with existing health system relationships and revenue."
      }
    },
    'default': {
      verdict: "Interesting technology looking for a problem worth solving. The market doesn't care.",
      marketInsight: "The 'ZIRP-era' playbook of grow-at-all-costs is dead.",
      vcFrameworkCheck: "Fails basic VC math. Unclear path to $100M revenue, no obvious moat.",
      inevitabilityStatement: "This pitch fails because partners can't model a path to fund-returning outcomes. It's not about execution—the opportunity isn't big enough.",
      narrativeTransformation: {
        currentNarrative: "A company with a product looking for a large enough market.",
        transformedNarrative: "A company attacking a clear $1B+ opportunity with differentiated positioning."
      }
    }
  };

  const insight = categoryInsights[category] || categoryInsights['default'];
  
  return {
    verdict: insight.verdict,
    readinessLevel: "LOW",
    readinessRationale: `This pitch would get passed in the first partner discussion. The fundamentals don't support the story.`,
    concerns: [
      {
        text: "Distribution strategy is non-existent. Product-market fit without go-to-market fit creates zombie companies.",
        category: "business_model",
        vcQuote: "Great product, no idea how to sell it. Pass."
      },
      {
        text: "Competitive positioning assumes incumbents won't respond. They will, with 10x your resources.",
        category: "competition",
        vcQuote: "What stops the big players from crushing this in 6 months?"
      },
      {
        text: "Unit economics are theoretical. The transition from founder-led to scalable sales is where companies die.",
        category: "traction"
      }
    ],
    strengths: [
      {
        text: `Market timing in ${category} creates a window—but only for companies with the right structure.`,
        category: "market"
      }
    ],
    marketInsight: insight.marketInsight,
    vcFrameworkCheck: insight.vcFrameworkCheck,
    inevitabilityStatement: insight.inevitabilityStatement,
    narrativeTransformation: insight.narrativeTransformation,
    founderProfile: founderProfile,
    hiddenIssuesCount: 8
  };
}
