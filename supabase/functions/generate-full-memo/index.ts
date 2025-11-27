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

    // Extract market context using AI before generating memo
    console.log("Extracting market context from responses...");
    
    const problemInfo = responses?.filter(r => r.question_key.startsWith('problem_')).map(r => r.answer).join('\n') || "";
    const solutionInfo = responses?.filter(r => r.question_key.startsWith('solution_')).map(r => r.answer).join('\n') || "";
    const icpInfo = responses?.find(r => r.question_key === 'market_icp')?.answer || "";
    const competitionInfo = responses?.filter(r => r.question_key.startsWith('competition_')).map(r => r.answer).join('\n') || "";
    const tractionInfo = responses?.filter(r => r.question_key.startsWith('traction_')).map(r => r.answer).join('\n') || "";

    let marketContext: any = null;
    
    // Call extract-market-context function
    try {
      const contextResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/extract-market-context`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problem: problemInfo,
          solution: solutionInfo,
          icp: icpInfo,
          competition: competitionInfo,
          traction: tractionInfo
        }),
      });

      if (contextResponse.ok) {
        const contextData = await contextResponse.json();
        marketContext = contextData.marketContext;
        console.log("Market context extracted successfully:", marketContext);
      } else {
        console.warn("Failed to extract market context, proceeding without it");
      }
    } catch (contextError) {
      console.warn("Error extracting market context:", contextError);
    }

    // Check if memo already exists - get the most recent one
    const { data: existingMemo } = await supabaseClient
      .from("memos")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Only return existing memo if it has actual content (non-empty sections)
    if (existingMemo && existingMemo.structured_content) {
      const content = existingMemo.structured_content as any;
      const hasContent = content.sections && Array.isArray(content.sections) && content.sections.length > 0;
      
      if (hasContent) {
        console.log("Returning existing memo from cache");
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
      } else {
        console.log("Existing memo found but has empty sections, regenerating...");
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
      
      // Build AI-deduced market context string if available
      let marketContextStr = "";
      if (marketContext) {
        marketContextStr = `\n\n--- AI-DEDUCED MARKET INTELLIGENCE ---
Market Vertical: ${marketContext.marketVertical || "N/A"}
Market Sub-Segment: ${marketContext.marketSubSegment || "N/A"}
Estimated TAM: ${marketContext.estimatedTAM || "N/A"}
Buyer Persona: ${marketContext.buyerPersona || "N/A"}
Competitor Weaknesses: ${marketContext.competitorWeaknesses || "N/A"}
Industry Benchmarks:
  - Typical CAC: ${marketContext.industryBenchmarks?.typicalCAC || "N/A"}
  - Typical LTV: ${marketContext.industryBenchmarks?.typicalLTV || "N/A"}
  - Growth Rate: ${marketContext.industryBenchmarks?.typicalGrowthRate || "N/A"}
  - Margins: ${marketContext.industryBenchmarks?.typicalMargins || "N/A"}
Market Drivers: ${marketContext.marketDrivers || "N/A"}
Confidence Level: ${marketContext.confidence || "N/A"}

NOTE: This market intelligence was AI-estimated based on the company's problem, solution, and ICP. Use it to enrich your analysis but clearly attribute it as "AI-estimated market data" when relevant.
--- END MARKET INTELLIGENCE ---`;
      }
      
      const prompt = customPrompt 
        ? `${customPrompt}\n\n---\n\nContext: ${company.name} is a ${company.stage} stage ${company.category || "startup"}.${marketContextStr}\n\nRaw information to analyze:\n${combinedContent}\n\n---\n\nIMPORTANT: Follow the PART 1 and PART 2 structure detailed above in your custom instructions. Generate the complete narrative and reflection content first, then format your response as JSON.\n\nReturn ONLY valid JSON with this structure (no markdown, no code blocks):\n{\n  "narrative": {\n    "paragraphs": [{"text": "each paragraph from PART 1", "emphasis": "high|medium|normal"}],\n    "highlights": [{"metric": "90%", "label": "key metric"}],\n    "keyPoints": ["key takeaway 1", "key takeaway 2"]\n  },\n  "vcReflection": {\n    "analysis": "your complete VC Reflection text from PART 2 (painkiller vs vitamin analysis)",\n    "questions": ["specific investor question 1", "question 2", "question 3", "question 4", "question 5"],\n    "benchmarking": "your complete Market & Historical Insights with real-world comparable companies (use web search)",\n    "conclusion": "your AI Conclusion synthesis text from PART 2"\n  }\n}`
        : `You are a professional VC investment memo writer. Take the following startup information for the "${sectionName}" section and create a clear, concise, and compelling narrative in structured JSON format.

Requirements:
- Create 2-4 well-structured paragraphs with varying emphasis levels
- Extract key metrics and statistics as highlights (if any exist in the data)
- Identify 3-5 key takeaway points
- Provide VC perspective with analysis, questions, and conclusion
- Use professional, direct language that VCs expect
- Focus on facts and concrete details
- Keep total content between 150-300 words

Context: ${company.name} is a ${company.stage} stage ${company.category || "startup"}.${marketContextStr}

Raw information:
${combinedContent}

${marketContext ? 'IMPORTANT: Leverage the AI-deduced market intelligence above to enrich your analysis. When using TAM estimates, buyer personas, or benchmarks from the market intelligence, clearly note they are "AI-estimated based on company profile".\n\n' : ''}Return ONLY valid JSON with this exact structure (no markdown, no code blocks, no preambles):
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
