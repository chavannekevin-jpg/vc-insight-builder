import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to sanitize problematic unicode escapes in JSON strings
function sanitizeJsonString(str: string): string {
  return str
    // Remove incomplete unicode escapes (e.g., \u26a without 4 hex digits)
    .replace(/\\u[0-9a-fA-F]{0,3}(?![0-9a-fA-F])/g, '')
    // Convert valid unicode escapes to actual characters
    .replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
      try {
        return String.fromCharCode(parseInt(hex, 16));
      } catch {
        return '';
      }
    });
}

// Helper function to retry API calls with exponential backoff
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  maxRetries = 3,
  initialDelay = 1000
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // If successful or client error (4xx), return immediately
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }
      
      // For 5xx errors, retry with backoff
      if (response.status >= 500) {
        const errorText = await response.text();
        console.warn(`Attempt ${attempt + 1}/${maxRetries} failed with ${response.status}: ${errorText}`);
        lastError = new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.warn(`Attempt ${attempt + 1}/${maxRetries} failed with network error:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
    }
    
    // Don't wait after the last attempt
    if (attempt < maxRetries - 1) {
      const delay = initialDelay * Math.pow(2, attempt);
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log("=== Starting generate-full-memo function ===");

  try {
    const { companyId, force = false } = await req.json();
    console.log(`Request received: companyId=${companyId}, force=${force}`);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
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

    // Define section order (USP section removed, merged into Competition; Investment Thesis added at end)
    const sectionOrder = [
      "Problem",
      "Solution",
      "Market",
      "Competition",
      "Team",
      "Business Model",
      "Traction",
      "Investment Thesis"
    ];

    // Create proper section name mapping
    const sectionKeyMapping: Record<string, string> = {
      "problem": "Problem",
      "solution": "Solution",
      "market": "Market",
      "competition": "Competition",
      "team": "Team",
      "business": "Business Model",
      "traction": "Traction"
    };

    // Group responses by section
    const responsesBySection: Record<string, Record<string, string>> = {};
    
    responses?.forEach((response) => {
      const sectionMatch = response.question_key.match(/^([^_]+)/);
      if (sectionMatch) {
        const sectionKey = sectionMatch[1].toLowerCase();
        const sectionName = sectionKeyMapping[sectionKey] || sectionMatch[1].charAt(0).toUpperCase() + sectionMatch[1].slice(1);
        if (!responsesBySection[sectionName]) {
          responsesBySection[sectionName] = {};
        }
        responsesBySection[sectionName][response.question_key] = response.answer || "";
      }
    });

    console.log("Sections found in responses:", Object.keys(responsesBySection));

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

    // Only return existing memo if not forced and has ALL 8 sections including Investment Thesis
    if (!force && existingMemo && existingMemo.structured_content) {
      const content = existingMemo.structured_content as any;
      const hasInvestmentThesis = content.sections?.some(
        (s: any) => s.title === "Investment Thesis"
      );
      const hasContent = content.sections && 
                         Array.isArray(content.sections) && 
                         content.sections.length >= 8 &&
                         hasInvestmentThesis;
      
      if (hasContent) {
        console.log(`Returning existing memo from cache (${content.sections.length} sections)`);
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
        console.log(`Existing memo found but incomplete (${content.sections?.length || 0} sections, has Investment Thesis: ${hasInvestmentThesis}), regenerating...`);
      }
    } else if (force) {
      console.log("Force regeneration requested, skipping cache");
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
        : `You are a skeptical VC investment analyst writing the "${sectionName}" section of an internal due diligence memo. Your job is to assess objectively, NOT to advocate.

CRITICAL ANALYSIS REQUIREMENTS:
- Lead with concerns and risks, not strengths
- Explicitly flag what is MISSING or UNVERIFIED in the data
- Challenge founder assumptions — what could be wrong?
- Assess whether evidence is signal or noise
- Highlight red flags, execution risks, and market risks
- Do NOT default to optimism — be neutral or skeptical unless evidence is strong
- If you would hesitate to invest, say so clearly

Requirements:
- Create 2-4 factual paragraphs (emphasize weaknesses first)
- Extract metrics as highlights (note if unverified)
- Identify 3-5 key concerns and takeaways
- Provide critical VC perspective that highlights gaps
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
    "analysis": "Critical VC assessment focusing on the 2-3 biggest concerns or weaknesses in this section. What assumptions lack evidence? What data is missing?",
    "questions": [
      "What is the single biggest risk or gap in this section?",
      "What assumptions are being made that may not hold?",
      "What critical data is missing that a VC would need?"
    ],
    "benchmarking": "How this compares to market benchmarks or similar companies (if favorable, state why; if concerning, be explicit)",
    "conclusion": "Lead with primary concern/risk. Rate confidence (Low/Medium/High) based on evidence quality. Example: 'Revenue concentration (60% from 2 customers) is a critical risk that overshadows otherwise strong ARR growth. Confidence: Low until pipeline diversification demonstrated.'"
  }
}`;

      console.log(`Generating section: ${sectionName} (${Object.keys(sectionResponses).length} questions)`);

      let response: Response;
      try {
        response = await fetchWithRetry("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                content: "You are a skeptical VC investment analyst writing an internal due diligence memo. Your job is NOT to advocate for the company, but to objectively assess it — highlighting weaknesses, risks, and gaps alongside any strengths. Be critical where warranted. If data is missing or claims are unsubstantiated, flag it explicitly. Return valid JSON only, no markdown formatting.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 3000,
          }),
        }, 3, 2000); // 3 retries, starting with 2s delay
      } catch (fetchError) {
        console.error(`Failed to generate section ${sectionName} after retries:`, fetchError);
        console.error(`Skipping section: ${sectionName}`);
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AI API error for ${sectionName}:`, response.status, errorText);
        console.error(`Failed to generate section: ${sectionName} - skipping`);
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
            console.log(`✓ Successfully generated section: ${sectionName}`);
          } else {
            // Legacy format - wrap in narrative
            enhancedSections[sectionName] = {
              narrative: structuredContent
            };
            console.log(`✓ Successfully generated section: ${sectionName} (legacy format)`);
          }
        } catch (parseError) {
          console.error(`First parse failed for ${sectionName}:`, parseError);
          console.error(`Raw response from AI (first 300 chars):`, enhancedText.substring(0, 300));
          
          // Retry with sanitized string
          try {
            const sanitized = sanitizeJsonString(enhancedText);
            console.log(`Retrying ${sectionName} with sanitized JSON...`);
            const structuredContent = JSON.parse(sanitized);
            
            if (structuredContent.narrative || structuredContent.vcReflection) {
              enhancedSections[sectionName] = structuredContent;
              console.log(`✓ Successfully generated section after sanitization: ${sectionName}`);
            } else {
              enhancedSections[sectionName] = {
                narrative: structuredContent
              };
              console.log(`✓ Generated section after sanitization (legacy format): ${sectionName}`);
            }
          } catch (retryError) {
            console.error(`All parsing attempts failed for ${sectionName}:`, retryError);
            // Final fallback with regeneration message
            enhancedSections[sectionName] = {
              narrative: {
                paragraphs: [{ 
                  text: "Section content could not be fully parsed. Please regenerate the memo to restore this section.", 
                  emphasis: "normal" 
                }],
                keyPoints: ["Regeneration recommended for complete analysis"]
              }
            };
            console.log(`✓ Generated section with final fallback: ${sectionName}`);
          }
        }
      } else {
        console.error(`No content returned for section: ${sectionName}`);
      }
    }

    // ============================================
    // Generate Investment Thesis section (synthesizes ALL sections)
    // ============================================
    console.log("Generating Investment Thesis section (final synthesis)...");
    
    const allResponsesText = responses?.map(r => `${r.question_key}: ${r.answer || "N/A"}`).join("\n\n") || "";
    const allSectionsContext = Object.entries(enhancedSections)
      .map(([title, content]) => `\n### ${title} Section Summary ###\n${JSON.stringify(content)}`)
      .join("\n");

    const investmentThesisPrompt = customPrompts["Investment Thesis"];
    
    if (investmentThesisPrompt) {
      let thesisMarketContextStr = "";
      if (marketContext) {
        thesisMarketContextStr = `\n\n--- AI-DEDUCED MARKET INTELLIGENCE ---
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
--- END MARKET INTELLIGENCE ---`;
      }

      const thesisPromptText = `${investmentThesisPrompt}

---

**Context:** ${company.name} is a ${company.stage} stage ${company.category || "startup"}.${thesisMarketContextStr}

**Company Description:** ${company.description || "N/A"}

**All Questionnaire Responses:**
${allResponsesText}

**Previously Generated Memo Sections:**
${allSectionsContext}

---

IMPORTANT: Synthesize ALL the information above into a comprehensive Investment Thesis. This is the final assessment section that pulls together everything.

Return ONLY valid JSON with this structure (no markdown, no code blocks):
{
  "narrative": {
    "paragraphs": [{"text": "each paragraph covering the 6 structure elements", "emphasis": "high|medium|normal"}],
    "highlights": [{"metric": "key metric", "label": "description"}],
    "keyPoints": ["Core opportunity", "Execution proof", "Scalability driver", "Key risk"]
  },
  "vcReflection": {
    "analysis": "your complete comparative benchmarking and assessment",
    "questions": ["critical question 1", "question 2", "question 3", "question 4", "question 5"],
    "benchmarking": "your complete benchmarking insights with real-world comparables",
    "conclusion": "your strict, non-biased final investment decision with reasoning"
  }
}`;

      let thesisResponse: Response;
      try {
        thesisResponse = await fetchWithRetry("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                content: "You are a senior VC partner writing a critical, unbiased investment thesis. This is NOT an advocacy document. Your job is to assess whether this is truly a VC-grade opportunity with clear eyes. Highlight weaknesses and risks prominently. Challenge assumptions. If data is weak or missing, explicitly state that you cannot recommend investment. Do not default to optimism. Always respond with valid JSON only.",
              },
              {
                role: "user",
                content: thesisPromptText,
              },
            ],
            temperature: 0.7,
            max_tokens: 3000,
          }),
        }, 3, 2000); // 3 retries, starting with 2s delay
      } catch (fetchError) {
        console.error("Failed to generate Investment Thesis after retries:", fetchError);
        console.warn("Investment Thesis generation failed, skipping section");
        thesisResponse = new Response(null, { status: 500 });
      }

      if (thesisResponse.ok) {
        const thesisData = await thesisResponse.json();
        let thesisContent = thesisData.choices?.[0]?.message?.content?.trim();

        if (thesisContent) {
          thesisContent = thesisContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          
          try {
            const structuredThesis = JSON.parse(thesisContent);
            
            if (structuredThesis.narrative || structuredThesis.vcReflection) {
              enhancedSections["Investment Thesis"] = structuredThesis;
              console.log("✓ Successfully generated Investment Thesis section");
            } else {
              enhancedSections["Investment Thesis"] = {
                narrative: structuredThesis
              };
              console.log("✓ Generated Investment Thesis (legacy format)");
            }
          } catch (parseError) {
            console.error("First parse failed for Investment Thesis:", parseError);
            console.error("Raw Investment Thesis response (first 300 chars):", thesisContent.substring(0, 300));
            
            // Retry with sanitized string
            try {
              const sanitized = sanitizeJsonString(thesisContent);
              console.log("Retrying Investment Thesis with sanitized JSON...");
              const structuredThesis = JSON.parse(sanitized);
              
              if (structuredThesis.narrative || structuredThesis.vcReflection) {
                enhancedSections["Investment Thesis"] = structuredThesis;
                console.log("✓ Successfully generated Investment Thesis after sanitization");
              } else {
                enhancedSections["Investment Thesis"] = {
                  narrative: structuredThesis
                };
                console.log("✓ Generated Investment Thesis after sanitization (legacy format)");
              }
            } catch (retryError) {
              console.error("All parsing attempts failed for Investment Thesis:", retryError);
              // Final fallback with regeneration message
              enhancedSections["Investment Thesis"] = {
                narrative: {
                  paragraphs: [{ 
                    text: "Investment Thesis content could not be fully parsed. Please regenerate the memo to restore this section.", 
                    emphasis: "high" 
                  }],
                  keyPoints: ["Regeneration recommended for complete analysis"]
                }
              };
              console.log("✓ Generated Investment Thesis with final fallback");
            }
          }
        } else {
          console.warn("No content returned for Investment Thesis section");
        }
      } else {
        console.warn("Failed to generate Investment Thesis section, skipping");
      }
    } else {
      console.warn("No Investment Thesis prompt found in database, skipping section");
    }

    // Validate memo completeness (expect 7-8 sections now: 7 main + Investment Thesis)
    const generatedSectionCount = Object.keys(enhancedSections).length;
    console.log(`\n=== MEMO GENERATION SUMMARY ===`);
    console.log(`Generated sections: ${generatedSectionCount}/8 expected`);
    console.log(`Section titles: ${Object.keys(enhancedSections).join(", ")}`);
    
    if (generatedSectionCount < 5) {
      console.error(`WARNING: Only ${generatedSectionCount} sections generated, expected at least 5`);
      throw new Error(`Incomplete memo generation: only ${generatedSectionCount} sections generated`);
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

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`=== Memo generation completed successfully in ${totalDuration}s ===`);
    
    return new Response(
      JSON.stringify({ 
        structuredContent: structuredContent,
        company: {
          name: company.name,
          stage: company.stage,
          category: company.category,
          description: company.description
        },
        memoId: memoId,
        generationTime: totalDuration
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorDuration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`=== Error in generate-full-memo function after ${errorDuration}s ===`);
    console.error("Error details:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : String(error),
        duration: errorDuration
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
