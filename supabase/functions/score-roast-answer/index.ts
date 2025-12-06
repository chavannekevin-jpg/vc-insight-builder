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
    const { question, answer, companyContext, questionIndex, timeElapsed } = await req.json();

    if (!question || !answer) {
      throw new Error('Question and answer are required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const speedBonus = timeElapsed && timeElapsed <= 30;

    const systemPrompt = `You are a brutally honest but fair VC partner scoring a founder's answer to a tough question. You have a sharp wit and don't sugarcoat, but you're ultimately trying to help them improve.

SCORING RULES:
- Score from 0-10 based on: specificity, honesty, strategic thinking, and self-awareness
- 0-3: Weak, evasive, or shows lack of understanding
- 4-6: Adequate but missing depth or specificity
- 7-8: Strong answer with good insight
- 9-10: Exceptional, VC-ready answer

ROAST STYLE:
- Be witty and direct, not mean-spirited
- Use VC/startup jargon naturally
- Reference their specific answer
- Keep roasts under 2 sentences
- Balance criticism with actionable insight

Return ONLY valid JSON in this exact format:
{
  "score": <number 0-10>,
  "roast": "<witty 1-2 sentence roast of their answer>",
  "hint": "<one specific thing they could add to improve this answer>"
}`;

    const userPrompt = `Question #${questionIndex + 1}: "${question}"

Founder's Answer: "${answer}"

Company Context: ${companyContext?.substring(0, 500) || 'Not provided'}

Score this answer and provide your roast.`;

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
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      console.error('Parse error:', parseError);
      result = {
        score: 5,
        roast: "I couldn't quite parse that one, but let's call it middle of the road.",
        hint: "Try being more specific with concrete numbers or examples."
      };
    }

    // Apply speed bonus
    const finalScore = speedBonus ? Math.min(10, result.score + 1) : result.score;

    return new Response(JSON.stringify({
      score: finalScore,
      baseScore: result.score,
      roast: result.roast,
      hint: result.hint,
      speedBonus,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in score-roast-answer:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
