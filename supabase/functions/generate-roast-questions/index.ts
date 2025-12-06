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

    const numQuestions = Math.min(Math.max(questionCount, 1), 10);

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

    // Fetch recent question history (last 50 questions or last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: questionHistory, error: historyError } = await supabase
      .from('roast_question_history')
      .select('question_text, category')
      .eq('company_id', companyId)
      .gte('asked_at', thirtyDaysAgo.toISOString())
      .order('asked_at', { ascending: false })
      .limit(50);

    if (historyError) {
      console.error('Error fetching question history:', historyError);
    }

    const previousQuestions = questionHistory || [];
    console.log(`Found ${previousQuestions.length} previous questions for company ${companyId}`);

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

    // Build the previous questions avoidance section
    const avoidanceSection = previousQuestions.length > 0 
      ? `\n\nCRITICAL - QUESTIONS TO AVOID (already asked recently):
${previousQuestions.map((q, i) => `${i + 1}. [${q.category}] "${q.question_text}"`).join('\n')}

You MUST generate completely NEW questions that:
- Cover DIFFERENT angles than the above
- Ask about aspects NOT yet explored
- Use fresh phrasing and perspectives
- Target different weaknesses or data points`
      : '';

    // Add randomization seed based on timestamp
    const randomSeed = `Session ID: ${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const systemPrompt = `You are a seasoned VC partner known for asking tough, incisive questions that expose weaknesses in startup pitches. Your job is to generate ${numQuestions} challenging but fair questions for a founder based on their company data.

${randomSeed}

RULES:
1. Questions should be specific to THIS company's data - reference their actual claims
2. Target gaps, inconsistencies, or weak spots you identify
3. Mix question types: market, team, traction, unit economics, competition, defensibility
4. Be challenging but not mean - these should be questions a real VC would ask
5. Each question should be answerable in 2-3 sentences
6. Questions should escalate in difficulty (start easier, end harder)
7. Be CREATIVE and VARIED - avoid generic questions${avoidanceSection}

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
      // Fallback questions - filter out recently asked ones
      questions = generateFallbackQuestions(company, previousQuestions).slice(0, numQuestions);
    }

    // Save new questions to history
    if (questions && questions.length > 0) {
      const historyEntries = questions.map((q: any) => ({
        company_id: companyId,
        question_text: q.question,
        category: q.category,
      }));

      const { error: insertError } = await supabase
        .from('roast_question_history')
        .insert(historyEntries);

      if (insertError) {
        console.error('Error saving question history:', insertError);
      } else {
        console.log(`Saved ${historyEntries.length} questions to history`);
      }
    }

    console.log(`Generated ${questions.length} new questions for company ${companyId}`);

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

// Extended fallback questions pool with variations
const fallbackQuestionPool = [
  { question: (name: string) => `What makes ${name} defensible against a well-funded competitor entering tomorrow?`, category: "defensibility", difficulty: "easy", context: "Testing moat awareness" },
  { question: () => "Walk me through your unit economics - what's your CAC and LTV?", category: "unit_economics", difficulty: "easy", context: "Financial fundamentals" },
  { question: () => "What's your unfair advantage that others can't easily replicate?", category: "competition", difficulty: "easy", context: "Competitive positioning" },
  { question: () => "Why is now the right time for this solution? What's changed?", category: "market_size", difficulty: "medium", context: "Market timing" },
  { question: () => "What's the biggest assumption in your business model that could be wrong?", category: "risks", difficulty: "medium", context: "Self-awareness" },
  { question: () => "How do you plan to acquire your first 1000 customers profitably?", category: "go_to_market", difficulty: "medium", context: "GTM strategy" },
  { question: () => "Why is your team uniquely positioned to solve this problem?", category: "team", difficulty: "medium", context: "Founder-market fit" },
  { question: () => "If you had to 10x your price, what would you need to add to justify it?", category: "vision", difficulty: "hard", context: "Value proposition depth" },
  { question: () => "What would make you give up on this company?", category: "risks", difficulty: "hard", context: "Founder resilience" },
  { question: () => "In 5 years, why won't a tech giant just build this feature into their platform?", category: "defensibility", difficulty: "hard", context: "Long-term survival" },
  // Additional variations
  { question: () => "Who is your biggest competitor and why will you win?", category: "competition", difficulty: "easy", context: "Competitive awareness" },
  { question: () => "What's your gross margin and how will it change at scale?", category: "unit_economics", difficulty: "medium", context: "Scalability" },
  { question: (name: string) => `If ${name} fails, what will be the reason?`, category: "risks", difficulty: "hard", context: "Risk awareness" },
  { question: () => "How much runway do you have and what milestones will you hit?", category: "funding", difficulty: "easy", context: "Financial planning" },
  { question: () => "What's your customer churn rate and why?", category: "traction", difficulty: "medium", context: "Retention metrics" },
  { question: () => "Describe your ideal customer in detail.", category: "market_size", difficulty: "easy", context: "Target market clarity" },
  { question: () => "What regulatory or legal risks could impact your business?", category: "risks", difficulty: "medium", context: "External risks" },
  { question: () => "How will you use AI/automation to create a moat?", category: "defensibility", difficulty: "medium", context: "Tech advantage" },
  { question: () => "What's your distribution strategy beyond paid acquisition?", category: "go_to_market", difficulty: "medium", context: "Growth channels" },
  { question: () => "Who on your team has done this before?", category: "team", difficulty: "easy", context: "Relevant experience" },
];

function generateFallbackQuestions(company: any, previousQuestions: any[]) {
  const previousTexts = new Set(previousQuestions.map(q => q.question_text.toLowerCase()));
  
  // Filter out questions that were recently asked
  const availableQuestions = fallbackQuestionPool.filter(q => {
    const questionText = q.question(company.name).toLowerCase();
    return !previousTexts.has(questionText);
  });

  // Shuffle available questions
  const shuffled = availableQuestions.sort(() => Math.random() - 0.5);

  return shuffled.map((q, i) => ({
    id: i + 1,
    question: q.question(company.name),
    category: q.category,
    difficulty: q.difficulty,
    context: q.context,
  }));
}
