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
    const { companyId, questionCount = 10 } = await req.json();
    
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    const numQuestions = Math.min(Math.max(questionCount, 1), 10); // Clamp between 1-10

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch company info
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (companyError) throw companyError;

    // Fetch all memo responses
    const { data: responses, error: responsesError } = await supabase
      .from('memo_responses')
      .select('question_key, answer')
      .eq('company_id', companyId);

    if (responsesError) throw responsesError;

    // Build context from responses
    const contextMap = responses.reduce((acc, r) => {
      if (r.answer) acc[r.question_key] = r.answer;
      return acc;
    }, {} as Record<string, string>);

    const companyContext = `
Company: ${company.name}
Stage: ${company.stage}
Description: ${company.description || 'Not provided'}
Category: ${company.category || 'Not specified'}

Available Data:
${Object.entries(contextMap).map(([key, val]) => `- ${key}: ${val.substring(0, 200)}...`).join('\n')}
    `.trim();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a seasoned VC partner known for asking tough, incisive questions that expose weaknesses in startup pitches. Your job is to generate ${numQuestions} challenging but fair questions for a founder based on their company data.

RULES:
1. Questions should be specific to THIS company's data - reference their actual claims
2. Target gaps, inconsistencies, or weak spots you identify
3. Mix question types: market, team, traction, unit economics, competition, defensibility
4. Be challenging but not mean - these should be questions a real VC would ask
5. Each question should be answerable in 2-3 sentences
6. Questions should escalate in difficulty (start easier, end harder)

CATEGORIES: market_size, competition, traction, unit_economics, team, defensibility, go_to_market, vision, risks, funding

Return ONLY a JSON array with exactly ${numQuestions} questions in this format:
[
  {
    "id": 1,
    "question": "The actual question text",
    "category": "one of the categories above",
    "difficulty": "easy|medium|hard",
    "context": "Brief note on what data point this targets"
  }
]`;

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
          { role: 'user', content: `Generate ${numQuestions} tough VC questions for this company:\n\n${companyContext}` }
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
    
    // Parse JSON from response
    let questions;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON array found in response');
      }
    } catch (parseError) {
      console.error('Parse error:', parseError, 'Content:', content);
      // Fallback questions - take only the number requested
      questions = generateFallbackQuestions(company).slice(0, numQuestions);
    }

    console.log(`Generated ${questions.length} questions for company ${companyId}`);

    return new Response(JSON.stringify({ questions, companyContext }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-roast-questions:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateFallbackQuestions(company: any) {
  return [
    { id: 1, question: `What makes ${company.name} defensible against a well-funded competitor entering tomorrow?`, category: "defensibility", difficulty: "easy", context: "Testing moat awareness" },
    { id: 2, question: "Walk me through your unit economics - what's your CAC and LTV?", category: "unit_economics", difficulty: "easy", context: "Financial fundamentals" },
    { id: 3, question: "What's your unfair advantage that others can't easily replicate?", category: "competition", difficulty: "easy", context: "Competitive positioning" },
    { id: 4, question: "Why is now the right time for this solution? What's changed?", category: "market_size", difficulty: "medium", context: "Market timing" },
    { id: 5, question: "What's the biggest assumption in your business model that could be wrong?", category: "risks", difficulty: "medium", context: "Self-awareness" },
    { id: 6, question: "How do you plan to acquire your first 1000 customers profitably?", category: "go_to_market", difficulty: "medium", context: "GTM strategy" },
    { id: 7, question: "Why is your team uniquely positioned to solve this problem?", category: "team", difficulty: "medium", context: "Founder-market fit" },
    { id: 8, question: "If you had to 10x your price, what would you need to add to justify it?", category: "vision", difficulty: "hard", context: "Value proposition depth" },
    { id: 9, question: "What would make you give up on this company?", category: "risks", difficulty: "hard", context: "Founder resilience" },
    { id: 10, question: "In 5 years, why won't a tech giant just build this feature into their platform?", category: "defensibility", difficulty: "hard", context: "Long-term survival" },
  ];
}
