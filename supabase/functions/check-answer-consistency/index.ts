import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConsistencyFlag {
  severity: 'warning' | 'error';
  field1: string;
  field2: string;
  description: string;
  suggestion: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyId, currentQuestionKey, currentAnswer, allResponses } = await req.json();

    if (!companyId || !currentQuestionKey || !allResponses) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Skip if not enough data to check consistency
    const filledResponses = Object.entries(allResponses).filter(([_, v]) => (v as string)?.trim().length > 20);
    if (filledResponses.length < 2) {
      return new Response(
        JSON.stringify({ flags: [], hasEnoughData: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Define consistency rules
    const consistencyRules = `
Check for these inconsistencies across the founder's answers:

1. GROWTH vs TEAM SIZE: If claiming rapid growth but mentioning only 1-2 people, flag potential execution risk.
2. REVENUE vs PRICING: If stated MRR/ARR doesn't align with customer count × price, flag math discrepancy.
3. MARKET SIZE vs TARGET: If TAM is massive but target customer is ultra-niche, flag disconnect.
4. COMPETITION vs DIFFERENTIATION: If naming strong competitors but weak differentiation, flag vulnerability.
5. TRACTION vs STAGE: If claiming significant traction but describing pre-product stage, flag inconsistency.
6. BURN RATE vs RUNWAY: If hiring aggressively but limited runway mentioned, flag concern.
7. B2B vs B2C MISMATCH: If business model says B2B but target customer describes consumers, flag confusion.

Only flag genuine inconsistencies that a VC would catch. Be helpful, not pedantic.
`;

    const systemPrompt = `You are a VC analyst reviewing a startup founder's questionnaire for internal consistency.
Your job is to identify contradictions or misalignments between their different answers.

${consistencyRules}

Return a JSON object with:
{
  "flags": [
    {
      "severity": "warning" or "error",
      "field1": "question_key of first conflicting answer",
      "field2": "question_key of second conflicting answer", 
      "description": "Brief description of the inconsistency (max 20 words)",
      "suggestion": "Specific suggestion to resolve this (max 25 words)"
    }
  ],
  "allClear": true/false (true if no issues found)
}

Be sparing - only flag genuine issues. Return empty flags array if everything looks consistent.
Only return valid JSON, no markdown.`;

    const userPrompt = `Check consistency across these founder answers (focus on any involving "${currentQuestionKey}"):

${filledResponses.map(([key, value]) => `## ${key}\n${value}`).join('\n\n')}`;

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
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    let result;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, content];
      result = JSON.parse(jsonMatch[1] || content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      result = { flags: [], allClear: true };
    }

    return new Response(
      JSON.stringify({
        flags: result.flags || [],
        allClear: result.allClear ?? (result.flags?.length === 0),
        hasEnoughData: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-answer-consistency:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
