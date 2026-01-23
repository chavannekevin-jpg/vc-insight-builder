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
    const { companyName, description, stage, sectionKey } = await req.json();
    
    console.log("Auto-generating profile for:", { companyName, stage, sectionKey });

    if (!description || description.trim().length < 20) {
      return new Response(
        JSON.stringify({ 
          error: "Description too short",
          prefilled: {} 
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Section-specific prompts for single-section generation
    const sectionPrompts: Record<string, { name: string; prompt: string }> = {
      problem_description: {
        name: "Problem",
        prompt: "Identify the specific problem this startup solves. Who experiences this pain? How severe is it? What's the cost of not solving it?"
      },
      solution_description: {
        name: "Solution",
        prompt: "Describe how this product solves the problem. What makes it unique? What's the key innovation or insight?"
      },
      target_customer: {
        name: "Target Customer",
        prompt: "Who is the ideal customer? Be specific about demographics, behavior, and market size (TAM/SAM/SOM if possible)."
      },
      competitive_advantage: {
        name: "Competition",
        prompt: "Who are the competitors (direct and indirect)? What's this startup's unfair advantage or moat?"
      },
      founder_background: {
        name: "Team",
        prompt: "Why is this team uniquely positioned to solve this problem? What's their relevant experience or founder-market fit?"
      },
      revenue_model: {
        name: "Business Model",
        prompt: "How does this startup make money? What's the pricing strategy and unit economics?"
      },
      current_traction: {
        name: "Traction",
        prompt: "What progress has been made? Include metrics like users, revenue, growth rate, partnerships, or milestones."
      }
    };

    let systemPrompt: string;
    let userPrompt: string;
    let responseStructure: string;

    if (sectionKey && sectionPrompts[sectionKey]) {
      // Single section generation
      const section = sectionPrompts[sectionKey];
      systemPrompt = `You are an expert startup analyst helping founders craft compelling pitch content.

Your task: ${section.prompt}

Guidelines:
- Extract explicit information from the description
- Make educated inferences when information is implied
- Be specific with numbers, examples, and data points
- Write from the founder's perspective (first person)
- Keep the answer concise but informative (3-5 sentences)
- Make it compelling and investment-ready

Return ONLY valid JSON with this structure:
{
  "${sectionKey}": "your answer here"
}`;

      userPrompt = `Company Name: ${companyName}
Stage: ${stage}
Description: ${description}

Generate compelling ${section.name} content based on this information.`;
    } else {
      // Full profile generation (original behavior)
      systemPrompt = `You are an expert startup analyst. Based on a brief company description, extract and infer information to pre-fill a startup questionnaire.

Your task is to intelligently parse the description and provide structured answers for the following sections:
1. Problem Description - What problem the startup solves
2. Solution Description - How the product solves the problem
3. Target Customer - Who the ideal customer is and market size
4. Competitive Advantage - Competitors and what makes this startup different
5. Founder Background - Why the team is right to build this
6. Revenue Model - How they make money
7. Current Traction - Progress made so far

Guidelines:
- Extract explicit information when mentioned
- Make educated inferences when information is implied
- If something isn't mentioned at all, use "Not specified yet - please add details"
- Be specific with numbers, examples, and data points
- Write from the founder's perspective (first person)
- Keep answers concise but informative (2-4 sentences each)
- For target_customer, include both the customer profile AND market size information

Return ONLY valid JSON with this structure:
{
  "problem_description": "string",
  "solution_description": "string",
  "target_customer": "string",
  "competitive_advantage": "string",
  "founder_background": "string",
  "revenue_model": "string",
  "current_traction": "string"
}`;

      userPrompt = `Company Name: ${companyName}
Stage: ${stage}
Description: ${description}

Based on this information, extract and infer answers for all 7 questionnaire sections. Be specific and use concrete examples from the description.`;
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON from response (handle markdown code blocks)
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith("```json")) {
      cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }

    const prefilled = JSON.parse(cleanedContent);
    
    console.log("Successfully generated profile data");

    return new Response(
      JSON.stringify({ prefilled }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error("Error in auto-generate-profile:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        prefilled: {}
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});