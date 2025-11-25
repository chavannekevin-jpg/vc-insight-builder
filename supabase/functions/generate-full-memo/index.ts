import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch company details
    const { data: company, error: companyError } = await supabaseClient
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .single();

    if (companyError) {
      console.error("Error fetching company:", companyError);
      throw new Error("Failed to fetch company details");
    }

    // Fetch all memo responses for this company
    const { data: responses, error: responsesError } = await supabaseClient
      .from("memo_responses")
      .select("*")
      .eq("company_id", companyId);

    if (responsesError) {
      console.error("Error fetching responses:", responsesError);
      throw new Error("Failed to fetch company responses");
    }

    // Fetch custom prompts
    const { data: promptsData, error: promptsError } = await supabaseClient
      .from("memo_prompts")
      .select("section_name, prompt");

    if (promptsError) {
      console.error("Error fetching prompts:", promptsError);
    }

    // Create a map of section names to prompts
    const customPrompts: Record<string, string> = {};
    if (promptsData) {
      promptsData.forEach((p) => {
        customPrompts[p.section_name] = p.prompt;
      });
    }

    // Define section order
    const sectionOrder = [
      "Problem",
      "Solution",
      "Market",
      "Competition",
      "Team",
      "USP",
      "Business Model",
      "Traction"
    ];

    // Group responses by section
    const responsesBySection: Record<string, Record<string, string>> = {};
    
    responses?.forEach((response) => {
      const sectionMatch = response.question_key.match(/^([^_]+)/);
      if (sectionMatch) {
        const sectionName = sectionMatch[1].charAt(0).toUpperCase() + sectionMatch[1].slice(1);
        if (!responsesBySection[sectionName]) {
          responsesBySection[sectionName] = {};
        }
        responsesBySection[sectionName][response.question_key] = response.answer || "";
      }
    });

    // Check if memo already exists - get the most recent one
    const { data: existingMemo } = await supabaseClient
      .from("memos")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingMemo && existingMemo.content) {
      // Return existing memo
      const parsedContent = JSON.parse(existingMemo.content);
      return new Response(
        JSON.stringify({ 
          enhanced: parsedContent.sections,
          company: {
            name: company.name,
            stage: company.stage,
            category: company.category,
            description: company.description
          },
          fromCache: true
        }), 
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const enhancedSections: Record<string, string> = {};

    // Process each section in order
    for (const sectionName of sectionOrder) {
      const sectionResponses = responsesBySection[sectionName];
      
      if (!sectionResponses || Object.keys(sectionResponses).length === 0) {
        continue;
      }

      // Combine all responses in the section
      const combinedContent = Object.values(sectionResponses)
        .filter(Boolean)
        .join("\n\n");

      if (!combinedContent.trim()) {
        continue;
      }

      // Use custom prompt if available, otherwise use default
      const customPrompt = customPrompts[sectionName];
      
      const prompt = customPrompt 
        ? `${customPrompt}\n\nContext: ${company.name} is a ${company.stage} stage ${company.category || "startup"}.\n\nRaw information:\n${combinedContent}\n\nWrite in professional markdown format with proper formatting:`
        : `You are a professional VC investment memo writer. Take the following startup information for the "${sectionName}" section and create a clear, concise, and compelling narrative. 

Requirements:
- Synthesize all the information into a cohesive narrative with 2-4 paragraphs
- Use professional, direct language that VCs expect
- Format using clean markdown: **bold** for emphasis, bullet points for lists, line breaks between paragraphs
- Highlight key metrics, traction, and competitive advantages
- Keep it between 150-300 words
- Focus on facts and concrete details
- Use proper markdown formatting for readability
- Return ONLY the enhanced narrative in markdown, no preambles or meta-commentary

Context: ${company.name} is a ${company.stage} stage ${company.category || "startup"}.

Raw information:
${combinedContent}

Write the professional memo section in clean markdown format:`;

      console.log(`Generating section: ${sectionName}`);

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "You are a professional VC investment memo writer. Create clear, concise, compelling narratives from startup information.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AI API error for ${sectionName}:`, response.status, errorText);
        continue;
      }

      const data = await response.json();
      const enhancedText = data.choices?.[0]?.message?.content?.trim();

      if (enhancedText) {
        enhancedSections[sectionName] = enhancedText;
      }
    }

    // Save memo to database
    const memoContent = JSON.stringify({
      sections: enhancedSections,
      generatedAt: new Date().toISOString()
    });

    if (existingMemo) {
      // Update existing memo
      await supabaseClient
        .from("memos")
        .update({ 
          content: memoContent,
          status: "completed"
        })
        .eq("id", existingMemo.id);
    } else {
      // Create new memo
      await supabaseClient
        .from("memos")
        .insert({
          company_id: companyId,
          content: memoContent,
          status: "completed"
        });
    }

    return new Response(
      JSON.stringify({ 
        enhanced: enhancedSections,
        company: {
          name: company.name,
          stage: company.stage,
          category: company.category,
          description: company.description
        }
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-full-memo function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
