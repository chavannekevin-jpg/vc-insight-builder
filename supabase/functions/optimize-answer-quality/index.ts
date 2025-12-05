import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answer, questionKey } = await req.json();

    if (!answer || !questionKey) {
      return new Response(
        JSON.stringify({ error: 'Missing answer or questionKey' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Skip analysis for very short answers
    if (answer.length < 30) {
      return new Response(
        JSON.stringify({
          score: 0,
          found: [],
          missing: [],
          suggestions: [],
          tooShort: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch criteria for this question
    const { data: criteria, error: criteriaError } = await supabase
      .from('answer_quality_criteria')
      .select('*')
      .eq('question_key', questionKey)
      .single();

    if (criteriaError || !criteria) {
      console.log('No criteria found for question:', questionKey);
      return new Response(
        JSON.stringify({
          score: 50,
          found: [],
          missing: [],
          suggestions: [],
          noCriteria: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const requiredElements = criteria.required_elements || [];
    const niceToHave = criteria.nice_to_have || [];

    const systemPrompt = `You are an expert VC analyst evaluating startup founder responses. 
Your task is to analyze a founder's answer and identify what elements are present vs missing.

Context: ${criteria.vc_context}

Required elements to look for: ${JSON.stringify(requiredElements)}
Nice-to-have elements: ${JSON.stringify(niceToHave)}

Example of a good answer: "${criteria.example_good_answer}"

Analyze the founder's answer and return a JSON object with:
1. "found": array of element keys that ARE present in the answer
2. "missing": array of required element keys that are MISSING (only from required_elements)
3. "nice_to_have_missing": array of nice-to-have elements that could improve the answer
4. "score": number 0-100 based on completeness (100 = all required elements present with good detail)
5. "suggestions": array of objects with:
   - "element": the missing element key
   - "prompt": a specific, actionable prompt to add this info (max 15 words)
   - "example": a brief example of what to add (max 20 words)

Be generous with scoring if the core information is there, even if not perfectly formatted.
Only return valid JSON, no markdown or explanation.`;

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
          { role: 'user', content: `Analyze this answer for "${questionKey}":\n\n${answer}` }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded, please try again later' }),
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

    // Parse JSON from response (handle markdown code blocks)
    let analysis;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, content];
      analysis = JSON.parse(jsonMatch[1] || content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      // Return a default response instead of failing
      analysis = {
        score: 50,
        found: [],
        missing: requiredElements,
        nice_to_have_missing: [],
        suggestions: requiredElements.slice(0, 3).map((el: string) => ({
          element: el,
          prompt: `Add information about ${el.replace(/_/g, ' ')}`,
          example: `See the placeholder for examples`
        }))
      };
    }

    return new Response(
      JSON.stringify({
        score: analysis.score || 50,
        found: analysis.found || [],
        missing: analysis.missing || [],
        niceToHaveMissing: analysis.nice_to_have_missing || [],
        suggestions: (analysis.suggestions || []).slice(0, 3), // Max 3 suggestions
        vcContext: criteria.vc_context
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in optimize-answer-quality:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});