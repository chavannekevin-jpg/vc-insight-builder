import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnswerResult {
  question: string;
  answer: string;
  score: number;
  category: string;
  roast: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { results, companyName, totalTime } = await req.json();

    if (!results || !Array.isArray(results)) {
      throw new Error('Results array is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Calculate category scores
    const categoryScores: Record<string, { total: number; count: number }> = {};
    let totalScore = 0;

    results.forEach((r: AnswerResult) => {
      totalScore += r.score;
      if (!categoryScores[r.category]) {
        categoryScores[r.category] = { total: 0, count: 0 };
      }
      categoryScores[r.category].total += r.score;
      categoryScores[r.category].count += 1;
    });

    const categoryBreakdown = Object.entries(categoryScores).map(([category, data]) => ({
      category,
      score: Math.round((data.total / data.count) * 10) / 10,
      maxScore: 10,
    }));

    // Find weakest categories
    const sortedCategories = [...categoryBreakdown].sort((a, b) => a.score - b.score);
    const weakestAreas = sortedCategories.slice(0, 3).map(c => c.category);

    const systemPrompt = `You are a senior VC partner delivering a final verdict after grilling a founder. You've seen their answers to 10 tough questions and now need to give them honest, actionable feedback.

Your personality: Direct, witty, experienced, ultimately supportive but never sugarcoating.

Based on the results, provide:
1. A verdict title (e.g., "Promising But Needs Polish", "VC-Ready Contender", "Back to the Drawing Board")
2. A 2-3 sentence overall assessment
3. Three specific, actionable recommendations
4. A shareable quote (tweet-length, punchy)

Score interpretation:
- 0-30: Needs significant work
- 31-50: Shows potential but major gaps
- 51-70: Solid foundation, some refinement needed
- 71-85: Strong performer, minor polish needed
- 86-100: Exceptional, VC-ready

Return ONLY valid JSON:
{
  "verdictTitle": "<catchy verdict title>",
  "verdictEmoji": "<single emoji that fits>",
  "assessment": "<2-3 sentence overall assessment>",
  "recommendations": [
    "<specific actionable recommendation 1>",
    "<specific actionable recommendation 2>",
    "<specific actionable recommendation 3>"
  ],
  "shareableQuote": "<tweet-length punchy quote about their performance>",
  "investorReadiness": "<not_ready|getting_there|almost_ready|investor_ready>"
}`;

    const userPrompt = `Company: ${companyName || 'This startup'}
Total Score: ${totalScore}/100
Time Taken: ${Math.round(totalTime / 60)} minutes
Weakest Areas: ${weakestAreas.join(', ')}

Question-by-Question Results:
${results.map((r: AnswerResult, i: number) => `
Q${i + 1} (${r.category}): Score ${r.score}/10
Question: ${r.question}
Answer: ${r.answer.substring(0, 150)}...
Roast: ${r.roast}
`).join('\n')}

Generate the final verdict.`;

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
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      console.error('Parse error:', parseError);
      verdict = {
        verdictTitle: totalScore >= 70 ? "Solid Performer" : "Room to Grow",
        verdictEmoji: totalScore >= 70 ? "💪" : "📚",
        assessment: `You scored ${totalScore}/100. ${totalScore >= 70 ? "You've got the fundamentals down." : "There's work to be done, but that's what this exercise is for."}`,
        recommendations: [
          "Practice articulating your unit economics with specific numbers",
          "Develop a clearer narrative around your competitive moat",
          "Be prepared to discuss failure scenarios honestly"
        ],
        shareableQuote: `Just got roasted by VCs and scored ${totalScore}/100. The truth hurts but makes you stronger. 🔥`,
        investorReadiness: totalScore >= 85 ? "investor_ready" : totalScore >= 70 ? "almost_ready" : totalScore >= 50 ? "getting_there" : "not_ready"
      };
    }

    return new Response(JSON.stringify({
      totalScore,
      categoryBreakdown,
      ...verdict,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-roast-verdict:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
