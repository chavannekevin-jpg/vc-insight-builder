import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyId } = await req.json();

    if (!companyId) {
      throw new Error("Company ID is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch company details including premium status
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("name, description, stage, category, has_premium")
      .eq("id", companyId)
      .single();

    if (companyError || !company) {
      throw new Error("Company not found");
    }

    // SECURITY: Verify premium access
    if (!company.has_premium) {
      throw new Error("Premium access required for email generation");
    }

    // Fetch memo
    const { data: memo, error: memoError } = await supabase
      .from("memos")
      .select("structured_content")
      .eq("company_id", companyId)
      .single();

    if (memoError || !memo || !memo.structured_content) {
      throw new Error("Memo not found");
    }

    // Fetch memo responses for additional context
    const { data: responses } = await supabase
      .from("memo_responses")
      .select("question_key, answer")
      .eq("company_id", companyId);

    // Extract key information from memo
    const sections = memo.structured_content.sections || [];
    let problemStatement = "";
    let solutionDescription = "";
    let marketInfo = "";
    let teamInfo = "";
    let tractionInfo = "";
    let askInfo = "";

    // Helper to safely get string from potentially object title
    const safeStr = (val: unknown): string => {
      if (typeof val === 'string') return val;
      if (val && typeof val === 'object' && 'text' in val) {
        return String((val as { text: unknown }).text || '');
      }
      return String(val || '');
    };

    sections.forEach((section: any) => {
      const title = safeStr(section.title, "generate-investor-emails.section.title").toLowerCase();
      const narrative = section.narrative || {};
      const paragraphs = narrative.paragraphs || section.paragraphs || [];
      const highlights = narrative.highlights || section.highlights || [];
      
      const text = paragraphs.map((p: any) => p.text).join(" ");
      const metrics = highlights.map((h: any) => `${h.label}: ${h.metric}`).join(", ");
      
      if (title.includes("problem") || title.includes("opportunity")) {
        problemStatement = text + " " + metrics;
      } else if (title.includes("solution") || title.includes("product")) {
        solutionDescription = text + " " + metrics;
      } else if (title.includes("market")) {
        marketInfo = text + " " + metrics;
      } else if (title.includes("team")) {
        teamInfo = text + " " + metrics;
      } else if (title.includes("traction") || title.includes("milestone")) {
        tractionInfo = text + " " + metrics;
      } else if (title.includes("ask") || title.includes("investment")) {
        askInfo = text + " " + metrics;
      }
    });

    // Prepare context for AI
    const context = {
      company: company.name,
      sector: company.category || "startup",
      stage: company.stage,
      description: company.description,
      problem: problemStatement,
      solution: solutionDescription,
      market: marketInfo,
      team: teamInfo,
      traction: tractionInfo,
      ask: askInfo
    };

    const systemPrompt = `You are an expert at writing high-converting cold emails for startup fundraising. Generate 5 distinct email templates for investor outreach based on the provided investment memorandum data.

Each email should follow this structure:
1. Subject Line (3-6 words, attention-grabbing)
2. Opening Hook (reference connection, investment, or milestone)
3. Body (2-3 short paragraphs highlighting problem/opportunity, solution/traction, and why now)
4. Clear CTA (specific ask for call or meeting)
5. Professional signature placeholder

Generate 5 variations with these styles:
1. Direct & Data-Driven (focus on metrics and KPIs)
2. Storytelling (narrative approach with context)
3. Problem-First (emphasize pain point being solved)
4. Traction-Heavy (lead with impressive milestones)
5. Personalized Hook (emphasize investor fit and opportunity)

Rules:
- Keep emails under 150 words
- Use short, punchy sentences
- Include specific metrics from the memo
- Professional but confident tone
- Include [INVESTOR NAME] and [RECENT INVESTMENT] placeholders for personalization
- No exaggeration or hype
- Clear, specific call-to-action

Return a JSON array of objects with: subject, body, and style fields.`;

    const userPrompt = `Generate 5 cold email templates for investor outreach based on this company:

Company: ${context.company}
Sector: ${context.sector}
Stage: ${context.stage}
Description: ${context.description}

Problem/Opportunity: ${context.problem}
Solution: ${context.solution}
Market: ${context.market}
Team: ${context.team}
Traction: ${context.traction}
Ask: ${context.ask}

Generate 5 email templates in JSON format.`;

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Calling AI to generate email templates...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error(`AI generation failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content generated from AI");
    }

    // Parse the JSON response
    let emails;
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      emails = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse email templates from AI response");
    }

    console.log(`Generated ${emails.length} email templates`);

    return new Response(
      JSON.stringify({ emails }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error("Error in generate-investor-emails:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to generate email templates",
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
