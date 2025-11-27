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
      "Traction",
      "Investment Thesis"
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

    if (existingMemo && (existingMemo.structured_content || existingMemo.content)) {
      // Return existing memo - prefer structured_content
      if (existingMemo.structured_content) {
        return new Response(
          JSON.stringify({ 
            structuredContent: existingMemo.structured_content,
            company: {
              name: company.name,
              stage: company.stage,
              category: company.category,
              description: company.description
            },
            memoId: existingMemo.id,
            fromCache: true
          }), 
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } else if (existingMemo.content) {
        // Legacy markdown format - return as-is for backward compatibility
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
            memoId: existingMemo.id,
            fromCache: true
          }), 
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    const enhancedSections: Record<string, any> = {};

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
      
      // Special handling for Investment Thesis section
      let prompt: string;
      
      if (sectionName === "Investment Thesis") {
        // Gather all available data for Investment Thesis
        const allResponses = Object.values(responsesBySection).flatMap(section => Object.values(section)).join("\n\n");
        const fullMemoContext = Object.keys(enhancedSections).map(s => `${s}: ${JSON.stringify(enhancedSections[s])}`).join("\n\n");
        
        prompt = `You are a Venture Capital Investment Manager writing the Investment Thesis section of an internal investment memorandum.

Your task is to synthesize all available information about the startup into a single, coherent investment thesis written as a high-quality narrative — not as disjointed bullet points, not as a summary, but as a persuasive, logically connected analysis.

The thesis must read like a real investment memo written by a senior VC.

CONTEXT:
Company: ${company.name}
Stage: ${company.stage}
Category: ${company.category || "startup"}
Description: ${company.description || "N/A"}

ALL AVAILABLE INFORMATION:
${allResponses}

PREVIOUS MEMO SECTIONS:
${fullMemoContext}

STRUCTURE TO FOLLOW (INTEGRATED INTO A FLOWING NARRATIVE):
Your output must be written as a single logically flowing text (200-250 words) that naturally integrates:
- Where the true venture-scale opportunity lies
- What real-world evidence supports early validation
- Whether the business can scale efficiently and defend its position
- Why market timing matters now
- What could break the story
- Whether this is a VC-grade opportunity or not

STYLE REQUIREMENTS:
- Professional VC tone
- Plain English
- Analytical and grounded
- No hype or marketing language
- No repetition of pitch content
- Forward-looking but realistic
- Quantify when possible
- Surface tensions, risks, and trade-offs
- Every sentence should add reasoning, insight, or judgment

Return ONLY valid JSON with this structure (no markdown, no code blocks):
{
  "narrative": {
    "paragraphs": [{"text": "your complete investment thesis narrative as one flowing text", "emphasis": "high"}],
    "keyPoints": ["critical insight 1", "critical insight 2", "critical insight 3"]
  },
  "vcReflection": {
    "analysis": "Optional: Investment Committee Considerations section title if adequate data exists, otherwise empty string",
    "questions": ["Critical question IC should debate 1", "Question 2", "Question 3", "Question 4", "Question 5"],
    "benchmarking": "Comparisons to similar companies or market patterns if relevant, otherwise empty string",
    "conclusion": "Final verdict: whether you would invest or not, and why (1-2 sentences)"
  }
}`;
      } else if (customPrompt) {
        prompt = `${customPrompt}\n\n---\n\nContext: ${company.name} is a ${company.stage} stage ${company.category || "startup"}.\n\nRaw information to analyze:\n${combinedContent}\n\n---\n\nIMPORTANT: Follow the PART 1 and PART 2 structure detailed above in your custom instructions. Generate the complete narrative and reflection content first, then format your response as JSON.\n\nReturn ONLY valid JSON with this structure (no markdown, no code blocks):\n{\n  "narrative": {\n    "paragraphs": [{"text": "each paragraph from PART 1", "emphasis": "high|medium|normal"}],\n    "highlights": [{"metric": "90%", "label": "key metric"}],\n    "keyPoints": ["key takeaway 1", "key takeaway 2"]\n  },\n  "vcReflection": {\n    "analysis": "your complete VC Reflection text from PART 2 (painkiller vs vitamin analysis)",\n    "questions": ["specific investor question 1", "question 2", "question 3", "question 4", "question 5"],\n    "benchmarking": "your complete Market & Historical Insights with real-world comparable companies (use web search)",\n    "conclusion": "your AI Conclusion synthesis text from PART 2"\n  }\n}`;
      } else {
        prompt = `You are a professional VC investment memo writer. Take the following startup information for the "${sectionName}" section and create a clear, concise, and compelling narrative in structured JSON format.

Requirements:
- Create 2-4 well-structured paragraphs with varying emphasis levels
- Extract key metrics and statistics as highlights (if any exist in the data)
- Identify 3-5 key takeaway points
- Provide VC perspective with analysis, questions, and conclusion
- Use professional, direct language that VCs expect
- Focus on facts and concrete details
- Keep total content between 150-300 words

Context: ${company.name} is a ${company.stage} stage ${company.category || "startup"}.

Raw information:
${combinedContent}

Return ONLY valid JSON with this exact structure (no markdown, no code blocks, no preambles):
{
  "narrative": {
    "paragraphs": [
      {"text": "Opening paragraph text here", "emphasis": "high"},
      {"text": "Supporting details here", "emphasis": "medium"},
      {"text": "Additional context", "emphasis": "normal"}
    ],
    "highlights": [
      {"metric": "90%", "label": "Market growth rate"},
      {"metric": "$10M", "label": "Revenue run rate"}
    ],
    "keyPoints": [
      "First key takeaway",
      "Second key takeaway",
      "Third key takeaway"
    ]
  },
  "vcReflection": {
    "analysis": "Brief VC perspective on this section",
    "questions": [
      "Key question investors would ask?",
      "Another important question?",
      "Third critical question?"
    ],
    "benchmarking": "How this compares to market benchmarks or similar companies",
    "conclusion": "Investment implication or synthesis"
  }
}`;
      }

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
              content: "You are a professional VC investment memo writer. Return structured JSON data for component-based rendering. Always respond with valid JSON only, no markdown formatting.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AI API error for ${sectionName}:`, response.status, errorText);
        continue;
      }

      const data = await response.json();
      let enhancedText = data.choices?.[0]?.message?.content?.trim();

      if (enhancedText) {
        // Clean up any markdown code blocks if present
        enhancedText = enhancedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        try {
          // Parse to validate it's proper JSON
          const structuredContent = JSON.parse(enhancedText);
          
          // Support both new format (with narrative/vcReflection) and legacy format
          if (structuredContent.narrative || structuredContent.vcReflection) {
            enhancedSections[sectionName] = structuredContent;
          } else {
            // Legacy format - wrap in narrative
            enhancedSections[sectionName] = {
              narrative: structuredContent
            };
          }
        } catch (parseError) {
          console.error(`Failed to parse JSON for ${sectionName}:`, parseError);
          // Fallback to basic structure if parsing fails
          enhancedSections[sectionName] = {
            narrative: {
              paragraphs: [{ text: enhancedText, emphasis: "normal" }],
              keyPoints: []
            }
          };
        }
      }
    }

    // Save memo to database with structured content
    const structuredContent = {
      sections: Object.entries(enhancedSections).map(([title, content]) => ({
        title,
        ...(typeof content === 'string' ? { paragraphs: [{ text: content, emphasis: "normal" }] } : content)
      })),
      generatedAt: new Date().toISOString()
    };

    let memoId: string;

    if (existingMemo) {
      // Update existing memo
      await supabaseClient
        .from("memos")
        .update({ 
          structured_content: structuredContent,
          status: "completed"
        })
        .eq("id", existingMemo.id);
      memoId = existingMemo.id;
    } else {
      // Create new memo
      const { data: newMemo, error: insertError } = await supabaseClient
        .from("memos")
        .insert({
          company_id: companyId,
          structured_content: structuredContent,
          status: "completed"
        })
        .select('id')
        .single();

      if (insertError || !newMemo) {
        throw new Error("Failed to save memo");
      }
      memoId = newMemo.id;
    }

    return new Response(
      JSON.stringify({ 
        structuredContent: structuredContent,
        company: {
          name: company.name,
          stage: company.stage,
          category: company.category,
          description: company.description
        },
        memoId: memoId
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
