import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GapAnalysis {
  criticalGaps: Array<{
    category: string;
    label: string;
    keys: string[];
    vcImportance: string;
  }>;
  filledData: Record<string, string>;
  scores: {
    memoReadiness: number;
    momentumScore: number;
  };
}

interface CompanyContext {
  name: string;
  description?: string;
  stage: string;
  category?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { gapAnalysis, company } = await req.json() as { 
      gapAnalysis: GapAnalysis; 
      company: CompanyContext 
    };

    if (!gapAnalysis || !company) {
      throw new Error('Gap analysis and company context are required');
    }

    console.log('Generating smart questions for:', company.name);
    console.log('Critical gaps:', gapAnalysis.criticalGaps.length);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build context from filled data
    const contextSummary = Object.entries(gapAnalysis.filledData)
      .map(([key, value]) => `${key}: ${value.substring(0, 200)}...`)
      .join('\n');

    // Build gaps description
    const gapsDescription = gapAnalysis.criticalGaps
      .map(gap => `- ${gap.label}: Missing ${gap.keys.join(', ')}. ${gap.vcImportance}`)
      .join('\n');

    const systemPrompt = `You are a direct, no-nonsense VC partner helping founders prepare for investment. 
Your job is to generate 3-5 TARGETED questions to fill critical data gaps before generating an investment memo.

TONE: Direct, slightly provocative, helpful. No corporate speak. No "could you please". 
Example: "What's your CAC? VCs won't take you seriously without unit economics."

RULES:
1. Generate ONLY questions for data that's actually missing
2. Questions must be SPECIFIC to the company's context (use what you know about them)
3. Each question should have a clear "questionKey" that maps to our data model
4. Keep questions SHORT - founders hate long forms
5. Include WHY this matters (the VC perspective) in the helpText
6. Maximum 5 questions, prioritize by VC importance

OUTPUT FORMAT (JSON):
{
  "questions": [
    {
      "questionKey": "unit_economics_cac",
      "question": "What's your customer acquisition cost?",
      "helpText": "VCs calculate CAC/LTV ratio before anything else. No CAC = no meeting.",
      "placeholder": "e.g., $50 per customer through paid ads, $0 through referrals",
      "priority": 1
    }
  ],
  "summary": "Brief 1-sentence summary of what's missing and why it matters"
}`;

    const userPrompt = `COMPANY CONTEXT:
Name: ${company.name}
Stage: ${company.stage}
Category: ${company.category || 'Not specified'}
Description: ${company.description || 'Not provided'}

WHAT WE ALREADY KNOW:
${contextSummary || 'Very limited data available'}

CRITICAL GAPS (generate questions for these):
${gapsDescription}

Current memo readiness: ${gapAnalysis.scores.memoReadiness}%
Momentum score: ${gapAnalysis.scores.momentumScore}%

Generate targeted questions to fill the most important gaps. Be specific to this company's context.`;

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
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse JSON from response (handle markdown code blocks)
    let parsedResponse;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonStr = jsonMatch[1] || content;
      parsedResponse = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      // Fallback to default questions based on gaps
      parsedResponse = generateFallbackQuestions(gapAnalysis, company);
    }

    console.log('Generated', parsedResponse.questions?.length || 0, 'smart questions');

    return new Response(JSON.stringify({
      success: true,
      questions: parsedResponse.questions || [],
      summary: parsedResponse.summary || 'Additional information needed for investment-grade memo.',
      gapCount: gapAnalysis.criticalGaps.length,
      currentReadiness: gapAnalysis.scores.memoReadiness
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Error in generate-smart-questions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function generateFallbackQuestions(gapAnalysis: GapAnalysis, company: CompanyContext) {
  const questions = [];
  
  const fallbackMap: Record<string, any> = {
    unit_economics: {
      questionKey: 'unit_economics',
      question: "What are your unit economics? (CAC, LTV, margins)",
      helpText: "VCs won't invest without understanding how your business makes money per customer.",
      placeholder: "e.g., CAC: $50, LTV: $500, Gross margin: 70%",
      priority: 1
    },
    revenue: {
      questionKey: 'revenue_model',
      question: "How do you make money and what do you charge?",
      helpText: "Revenue model clarity separates real businesses from science projects.",
      placeholder: "e.g., SaaS subscription at $99/month, enterprise contracts at $10K/year",
      priority: 2
    },
    growth: {
      questionKey: 'growth_rate',
      question: "What's your growth rate? (monthly or annual)",
      helpText: "Growth rate is the single most important metric for early-stage VCs.",
      placeholder: "e.g., 15% month-over-month for the last 6 months",
      priority: 1
    },
    retention: {
      questionKey: 'retention_rate',
      question: "What's your customer retention rate?",
      helpText: "High churn kills startups. VCs want to see you can keep customers.",
      placeholder: "e.g., 95% monthly retention, 85% annual retention",
      priority: 3
    }
  };

  for (const gap of gapAnalysis.criticalGaps) {
    if (fallbackMap[gap.category]) {
      questions.push(fallbackMap[gap.category]);
    }
  }

  return {
    questions: questions.slice(0, 5),
    summary: `Missing critical ${company.stage} stage metrics. VCs need this data to evaluate your company.`
  };
}
