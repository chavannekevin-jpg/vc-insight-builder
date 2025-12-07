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
    // Authentication check - verify user has access to this company
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Create anon client to verify user token
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await anonClient.auth.getUser(token);
    
    if (authError || !userData.user) {
      console.error("Authentication failed:", authError);
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;
    console.log(`Authenticated user: ${userId}`);

    const { companyId, force = false } = await req.json();
    console.log(`Request received: companyId=${companyId}, force=${force}`);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch company details and verify ownership
    const { data: company, error: companyError } = await supabaseClient
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .single();

    if (companyError) {
      console.error("Error fetching company:", companyError);
      throw new Error("Failed to fetch company details");
    }

    // Verify user owns this company
    if (company.founder_id !== userId) {
      console.error(`Access denied: User ${userId} does not own company ${companyId}`);
      return new Response(
        JSON.stringify({ error: "Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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

    // Fetch answer quality criteria for enhanced context
    const { data: qualityCriteria, error: criteriaError } = await supabaseClient
      .from("answer_quality_criteria")
      .select("question_key, required_elements, nice_to_have, vc_context");

    if (criteriaError) {
      console.error("Error fetching quality criteria:", criteriaError);
    }

    // Map question keys to sections for criteria lookup
    const criteriaBySection: Record<string, any> = {};
    if (qualityCriteria) {
      const keyToSection: Record<string, string> = {
        "problem_core": "Problem",
        "solution_core": "Solution",
        "target_customer": "Market",
        "competitive_moat": "Competition",
        "team_story": "Team",
        "business_model": "Business Model",
        "traction_proof": "Traction",
        "vision_ask": "Vision"
      };
      qualityCriteria.forEach((c) => {
        const section = keyToSection[c.question_key];
        if (section) {
          criteriaBySection[section] = c;
        }
      });
    }
    console.log("Quality criteria loaded for sections:", Object.keys(criteriaBySection));

    // Define section order (USP section removed, merged into Competition; Investment Thesis added at end)
    const sectionOrder = [
      "Problem",
      "Solution",
      "Market",
      "Competition",
      "Team",
      "Business Model",
      "Traction",
      "Vision",
      "Investment Thesis"
    ];

    // Create proper section name mapping (expanded to cover all question key prefixes including new merged keys)
    const sectionKeyMapping: Record<string, string> = {
      // New merged question keys
      "problem_core": "Problem",
      "solution_core": "Solution",
      "competitive_moat": "Competition",
      "team_story": "Team",
      "business_model": "Business Model",
      "traction_proof": "Traction",
      "vision_ask": "Vision",
      // Original prefix-based mapping
      "problem": "Problem",
      "solution": "Solution",
      "market": "Market",
      "target": "Market",
      "competition": "Competition",
      "competitors": "Competition",
      "competitive": "Competition",
      "team": "Team",
      "founder": "Team",
      "business": "Business Model",
      "revenue": "Business Model",
      "pricing": "Business Model",
      "unit": "Business Model",
      "average": "Business Model",
      "traction": "Traction",
      "retention": "Traction",
      "current": "Traction",
      "key": "Traction",
      "vision": "Vision"
    };

    // Group responses by section
    const responsesBySection: Record<string, Record<string, string>> = {};
    
    responses?.forEach((response) => {
      // First check if the full question_key has a direct mapping (for merged keys like problem_core)
      const fullKeyMapping = sectionKeyMapping[response.question_key];
      if (fullKeyMapping) {
        if (!responsesBySection[fullKeyMapping]) {
          responsesBySection[fullKeyMapping] = {};
        }
        responsesBySection[fullKeyMapping][response.question_key] = response.answer || "";
        return;
      }
      
      // Fall back to prefix-based mapping
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

    // ============================================
    // Extract financial metrics for cross-section sharing
    // ============================================
    const unitEconomicsJson = responses?.find(r => r.question_key === 'unit_economics_json')?.answer;
    const unitEconomicsText = responses?.find(r => r.question_key === 'unit_economics')?.answer || "";
    const pricingInfo = responses?.find(r => r.question_key === 'pricing_model')?.answer || "";
    const revenueInfo = responses?.find(r => r.question_key === 'revenue_model')?.answer || "";
    
    let financialMetrics: any = null;
    if (unitEconomicsJson) {
      try {
        financialMetrics = JSON.parse(unitEconomicsJson);
        console.log("Parsed financial metrics from unit_economics_json:", financialMetrics);
      } catch (e) {
        console.warn("Could not parse unit_economics_json:", e);
      }
    }

    // Build financial context string for injection into section prompts
    let financialContextStr = "";
    if (financialMetrics || unitEconomicsText || pricingInfo || revenueInfo) {
      financialContextStr = `\n\n--- COMPANY FINANCIAL DATA (use for calculations) ---`;
      
      if (financialMetrics) {
        if (financialMetrics.mrr) financialContextStr += `\nMRR: €${financialMetrics.mrr}`;
        if (financialMetrics.arr) financialContextStr += `\nARR: €${financialMetrics.arr}`;
        if (financialMetrics.acv) financialContextStr += `\nACV (Avg Contract Value): €${financialMetrics.acv}`;
        if (financialMetrics.totalCustomers) financialContextStr += `\nTotal Customers: ${financialMetrics.totalCustomers}`;
        if (financialMetrics.cac) financialContextStr += `\nCAC: €${financialMetrics.cac}`;
        if (financialMetrics.ltv) financialContextStr += `\nLTV: €${financialMetrics.ltv}`;
        if (financialMetrics.ltvCacRatio) financialContextStr += `\nLTV:CAC Ratio: ${financialMetrics.ltvCacRatio}`;
        if (financialMetrics.paybackPeriod) financialContextStr += `\nPayback Period: ${financialMetrics.paybackPeriod} months`;
        if (financialMetrics.monthlyChurn) financialContextStr += `\nMonthly Churn: ${financialMetrics.monthlyChurn}%`;
        if (financialMetrics.grossMargin) financialContextStr += `\nGross Margin: ${financialMetrics.grossMargin}%`;
        if (financialMetrics.monthlyBurn) financialContextStr += `\nMonthly Burn: €${financialMetrics.monthlyBurn}`;
        if (financialMetrics.runway) financialContextStr += `\nRunway: ${financialMetrics.runway} months`;
        if (financialMetrics.monthlyGrowth) financialContextStr += `\nMonthly Growth: ${financialMetrics.monthlyGrowth}%`;
      }
      
      if (unitEconomicsText && !financialMetrics) {
        financialContextStr += `\nUnit Economics: ${unitEconomicsText}`;
      }
      if (pricingInfo) financialContextStr += `\nPricing Model: ${pricingInfo}`;
      if (revenueInfo) financialContextStr += `\nRevenue Model: ${revenueInfo}`;
      
    // Add bottoms-up calculation guidance for Market section
    financialContextStr += `\n\n**BOTTOMS-UP CALCULATION GUIDANCE:**`;
    
    // Calculate ACV from ARR/customers (use 'customers' field, not 'totalCustomers')
    const numCustomers = financialMetrics?.customers || financialMetrics?.totalCustomers;
    const arrValue = financialMetrics?.arr;
    
    if (financialMetrics?.acv) {
      const acv = parseFloat(financialMetrics.acv);
      const customersFor10M = Math.ceil(10000000 / acv);
      const customersFor50M = Math.ceil(50000000 / acv);
      const customersFor100M = Math.ceil(100000000 / acv);
      financialContextStr += `\n- ACV (Average Contract Value): €${acv}`;
      financialContextStr += `\n- At €${acv} ACV: ${customersFor10M.toLocaleString()} customers needed for €10M ARR`;
      financialContextStr += `\n- At €${acv} ACV: ${customersFor50M.toLocaleString()} customers needed for €50M ARR`;
      financialContextStr += `\n- At €${acv} ACV: ${customersFor100M.toLocaleString()} customers needed for €100M ARR`;
    } else if (arrValue && numCustomers && parseFloat(numCustomers) > 0) {
      const calculatedAcv = parseFloat(arrValue) / parseFloat(numCustomers);
      const customersFor10M = Math.ceil(10000000 / calculatedAcv);
      const customersFor50M = Math.ceil(50000000 / calculatedAcv);
      const customersFor100M = Math.ceil(100000000 / calculatedAcv);
      financialContextStr += `\n- Current customers: ${numCustomers}`;
      financialContextStr += `\n- Current ARR: €${arrValue}`;
      financialContextStr += `\n- Calculated ACV (ARR/customers): €${calculatedAcv.toFixed(0)}`;
      financialContextStr += `\n- At €${calculatedAcv.toFixed(0)} ACV: ${customersFor10M.toLocaleString()} customers needed for €10M ARR`;
      financialContextStr += `\n- At €${calculatedAcv.toFixed(0)} ACV: ${customersFor50M.toLocaleString()} customers needed for €50M ARR`;
      financialContextStr += `\n- At €${calculatedAcv.toFixed(0)} ACV: ${customersFor100M.toLocaleString()} customers needed for €100M ARR`;
    } else if (financialMetrics?.mrr) {
      // Fallback: calculate from MRR
      const mrrValue = parseFloat(financialMetrics.mrr);
      const impliedArr = mrrValue * 12;
      if (numCustomers && parseFloat(numCustomers) > 0) {
        const calculatedAcv = impliedArr / parseFloat(numCustomers);
        const customersFor10M = Math.ceil(10000000 / calculatedAcv);
        const customersFor50M = Math.ceil(50000000 / calculatedAcv);
        const customersFor100M = Math.ceil(100000000 / calculatedAcv);
        financialContextStr += `\n- Current customers: ${numCustomers}`;
        financialContextStr += `\n- Implied ARR (MRR x 12): €${impliedArr}`;
        financialContextStr += `\n- Calculated ACV: €${calculatedAcv.toFixed(0)}`;
        financialContextStr += `\n- At €${calculatedAcv.toFixed(0)} ACV: ${customersFor10M.toLocaleString()} customers needed for €10M ARR`;
        financialContextStr += `\n- At €${calculatedAcv.toFixed(0)} ACV: ${customersFor50M.toLocaleString()} customers needed for €50M ARR`;
        financialContextStr += `\n- At €${calculatedAcv.toFixed(0)} ACV: ${customersFor100M.toLocaleString()} customers needed for €100M ARR`;
      }
    }
    
    financialContextStr += `\n--- END FINANCIAL DATA ---`;
    }
    console.log("Financial context string:", financialContextStr);

    // Extract market context using AI before generating memo
    console.log("Extracting market context from responses...");
    
    // Support both old and new question keys
    const problemInfo = responses?.filter(r => 
      r.question_key.startsWith('problem_') || r.question_key === 'problem_core'
    ).map(r => r.answer).join('\n') || "";
    const solutionInfo = responses?.filter(r => 
      r.question_key.startsWith('solution_') || r.question_key === 'solution_core'
    ).map(r => r.answer).join('\n') || "";
    const icpInfo = responses?.find(r => r.question_key === 'target_customer' || r.question_key === 'market_icp')?.answer || "";
    const competitionInfo = responses?.filter(r => 
      r.question_key.startsWith('competition_') || r.question_key === 'competitive_moat'
    ).map(r => r.answer).join('\n') || "";
    const tractionInfo = responses?.filter(r => 
      r.question_key.startsWith('traction_') || r.question_key === 'traction_proof'
    ).map(r => r.answer).join('\n') || "";

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

    // Only return existing memo if not forced and has ALL 8 sections including Investment Thesis AND vcQuickTake
    if (!force && existingMemo && existingMemo.structured_content) {
      const content = existingMemo.structured_content as any;
      const hasInvestmentThesis = content.sections?.some(
        (s: any) => s.title === "Investment Thesis"
      );
      const hasVCQuickTake = !!content.vcQuickTake;
      const hasEnhancedQuestions = content.sections?.every(
        (s: any) => !s.vcReflection?.questions || 
          s.vcReflection.questions.every((q: any) => 
            typeof q === 'object' && q.vcRationale && q.whatToPrepare
          )
      );
      const hasContent = content.sections && 
                         Array.isArray(content.sections) && 
                         content.sections.length >= 8 &&
                         hasInvestmentThesis &&
                         hasVCQuickTake &&
                         hasEnhancedQuestions;
      
      if (hasContent) {
        console.log(`Returning existing memo from cache (${content.sections.length} sections, vcQuickTake: ${hasVCQuickTake})`);
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
        console.log(`Existing memo found but incomplete (${content.sections?.length || 0} sections, Investment Thesis: ${hasInvestmentThesis}, vcQuickTake: ${hasVCQuickTake}, enhancedQuestions: ${hasEnhancedQuestions}), regenerating...`);
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
      
      // Add financial context for Market section specifically
      let sectionFinancialStr = financialContextStr;
      if (sectionName === "Market" && financialContextStr) {
        sectionFinancialStr += `\n\n**CRITICAL FOR MARKET SECTION:** You MUST include a bottoms-up analysis using the ACV data above. Calculate exactly how many customers are needed to reach €10M, €50M, and €100M ARR. This is essential for SOM sizing.`;
      }

      // Build quality criteria context for this section
      let criteriaContextStr = "";
      const sectionCriteria = criteriaBySection[sectionName];
      if (sectionCriteria) {
        const requiredElements = Array.isArray(sectionCriteria.required_elements) 
          ? sectionCriteria.required_elements.join(", ") 
          : sectionCriteria.required_elements;
        const niceToHave = Array.isArray(sectionCriteria.nice_to_have) 
          ? sectionCriteria.nice_to_have.join(", ") 
          : sectionCriteria.nice_to_have;
        criteriaContextStr = `\n\n--- EXPECTED DATA ELEMENTS FOR THIS SECTION ---
Required Elements: ${requiredElements}
Nice-to-Have Elements: ${niceToHave}
VC Context: ${sectionCriteria.vc_context || "N/A"}

**DATA QUALITY REQUIREMENTS:**
When analyzing founder-provided information, explicitly distinguish:
- VERIFIED: Data backed by external evidence (customer contracts, bank statements, third-party metrics)
- CLAIMED: Founder statements without independent verification
- INFERRED: AI-derived estimates based on available context
- MISSING: Critical data not provided that would change assessment

Flag explicitly if any REQUIRED elements above are MISSING from founder's response.
In your conclusion, note data confidence level.
--- END EXPECTED DATA ---`;
      }
      
      const prompt = customPrompt 
        ? `${customPrompt}\n\n---\n\nContext: ${company.name} is a ${company.stage} stage ${company.category || "startup"}.${marketContextStr}${sectionFinancialStr}${criteriaContextStr}\n\nRaw information to analyze:\n${combinedContent}\n\n---\n\nIMPORTANT: Follow the PART 1 and PART 2 structure detailed above in your custom instructions. Generate the complete narrative and reflection content first, then format your response as JSON.\n\nReturn ONLY valid JSON with this structure (no markdown, no code blocks):\n{\n  "narrative": {\n    "paragraphs": [{"text": "each paragraph from PART 1", "emphasis": "high|medium|normal"}],\n    "highlights": [{"metric": "90%", "label": "key metric"}],\n    "keyPoints": ["key takeaway 1", "key takeaway 2"]\n  },\n  "vcReflection": {\n    "analysis": "your complete VC Reflection text from PART 2 (painkiller vs vitamin analysis)",\n    "questions": [\n      {"question": "specific investor question 1", "vcRationale": "Why VCs care about this from fund economics perspective", "whatToPrepare": "Evidence/data to address this"},\n      {"question": "question 2", "vcRationale": "Economic reasoning", "whatToPrepare": "Preparation guidance"},\n      {"question": "question 3", "vcRationale": "Economic reasoning", "whatToPrepare": "Preparation guidance"}\n    ],\n    "benchmarking": "your complete Market & Historical Insights with real-world comparable companies (use web search)",\n    "conclusion": "your AI Conclusion synthesis text from PART 2"\n  }\n}`
        : `You are a skeptical VC investment analyst writing the "${sectionName}" section of an internal due diligence memo. Your job is to assess objectively, NOT to advocate.

CRITICAL ANALYSIS REQUIREMENTS:
- Lead with concerns and risks, not strengths
- Explicitly flag what is MISSING or UNVERIFIED in the data
- Challenge founder assumptions — what could be wrong?
- Assess whether evidence is signal or noise
- Highlight red flags, execution risks, and market risks
- Do NOT default to optimism — be neutral or skeptical unless evidence is strong
- If you would hesitate to invest, say so clearly
${criteriaContextStr}

Requirements:
- Create 2-4 factual paragraphs (emphasize weaknesses first)
- Extract metrics as highlights (note if unverified)
- Identify 3-5 key concerns and takeaways
- Provide critical VC perspective that highlights gaps
- Keep total content between 150-300 words

Context: ${company.name} is a ${company.stage} stage ${company.category || "startup"}.${marketContextStr}${sectionFinancialStr}

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
      {
        "question": "What is the single biggest risk or gap in this section?",
        "vcRationale": "Explain WHY VCs care about this from a fund economics and return perspective. What does this signal about risk-adjusted returns?",
        "whatToPrepare": "Specific evidence, data, or demonstration the founder should prepare to address this concern."
      },
      {
        "question": "What assumptions are being made that may not hold?",
        "vcRationale": "Explain the VC economic reasoning behind caring about this assumption.",
        "whatToPrepare": "What validation or proof points would de-risk this assumption."
      },
      {
        "question": "What critical data is missing that a VC would need?",
        "vcRationale": "Why this data matters for investment decision-making.",
        "whatToPrepare": "How to gather or present this data effectively."
      }
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
            // Final fallback: retry with a simpler prompt asking for plain text
            console.log(`Attempting final fallback with simplified prompt for ${sectionName}...`);
            try {
              const fallbackResponse = await fetchWithRetry("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                      content: "You are a VC analyst. Return ONLY valid JSON. Do not use special characters or unicode. Keep responses simple and direct.",
                    },
                    {
                      role: "user",
                      content: `Write a brief ${sectionName} analysis for ${company.name}. Data: ${combinedContent.substring(0, 1000)}

Return EXACTLY this JSON structure with your content filled in:
{"narrative":{"paragraphs":[{"text":"Main analysis paragraph here.","emphasis":"high"},{"text":"Supporting details.","emphasis":"normal"}],"keyPoints":["Key point 1","Key point 2","Key point 3"]},"vcReflection":{"analysis":"Critical assessment.","questions":["Question 1?","Question 2?"],"conclusion":"Summary conclusion."}}`,
                    },
                  ],
                  temperature: 0.3,
                  max_tokens: 1500,
                }),
              }, 2, 1000);

              if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json();
                let fallbackContent = fallbackData.choices?.[0]?.message?.content?.trim();
                if (fallbackContent) {
                  fallbackContent = fallbackContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                  const fallbackParsed = JSON.parse(fallbackContent);
                  enhancedSections[sectionName] = fallbackParsed;
                  console.log(`✓ Generated ${sectionName} with simplified fallback`);
                }
              }
            } catch (finalError) {
              console.error(`Final fallback also failed for ${sectionName}:`, finalError);
              enhancedSections[sectionName] = {
                narrative: {
                  paragraphs: [{ 
                    text: `The ${sectionName} section analysis is available but requires regeneration for optimal formatting.`, 
                    emphasis: "normal" 
                  }],
                  keyPoints: ["Please regenerate memo for complete analysis"]
                }
              };
              console.log(`✓ Generated section with placeholder: ${sectionName}`);
            }
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

    // ============================================
    // Generate VC Quick Take (synthesis of all sections for preview)
    // ============================================
    console.log("Generating VC Quick Take summary...");
    
    let vcQuickTake = null;
    
    try {
      const quickTakePrompt = `You are a brutally honest senior VC partner providing a rapid 30-second assessment. Your job is to give founders the unvarnished truth about how VCs will perceive their company.

Based on these memo sections, provide a provocative quick take that creates curiosity:

${Object.entries(enhancedSections).map(([title, content]) => 
  `### ${title} ###\n${JSON.stringify(content).substring(0, 800)}`
).join("\n\n")}

Company: ${company.name} (${company.stage} stage, ${company.category || "startup"})

TONE REQUIREMENTS:
- Be provocative and specific, not generic
- Lead with the hard truth that founders need to hear
- Create urgency - what will make VCs pass in the first 2 minutes?
- Be concrete about blind spots (e.g., "Your pricing is 3x market rate but you haven't justified why")
- The verdict should make founders think "I need to read the full analysis"

Return ONLY valid JSON with this exact structure:
{
  "verdict": "A provocative, specific one-sentence assessment that captures the core investment question. Example: 'Strong product vision but the unit economics don't support a VC-scale outcome yet.' or 'Impressive traction but concentration risk means one churned customer kills the story.'",
  "concerns": [
    "Specific concern #1 with concrete detail - e.g., '60% revenue from 2 customers creates catastrophic concentration risk'",
    "Specific concern #2 - e.g., 'No evidence of repeatable sales motion beyond founder-led deals'",
    "Specific concern #3 - e.g., 'CAC:LTV ratio of 1.5:1 means you're paying more to acquire customers than they're worth'"
  ],
  "strengths": [
    "Specific strength #1 with evidence - e.g., '85% gross retention signals real product-market fit'",
    "Specific strength #2 - e.g., 'Founder's 10-year domain experience in this exact vertical'",
    "Specific strength #3 - e.g., 'Capital-efficient growth: $0 marketing spend for first $100K ARR'"
  ],
  "readinessLevel": "LOW or MEDIUM or HIGH",
  "readinessRationale": "One sentence explaining the readiness score with specific gaps. Example: 'HIGH - Strong traction, clear unit economics, and proven team, though competitive moat needs work.' or 'LOW - Missing critical data on CAC, retention, and market sizing that VCs will demand.'"
}`;

      const quickTakeResponse = await fetchWithRetry("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              content: "You are a direct, no-nonsense VC partner. Be provocative and specific. Lead with concerns, not enthusiasm. Return only valid JSON.",
            },
            {
              role: "user",
              content: quickTakePrompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      }, 2, 1000);

      if (quickTakeResponse.ok) {
        const quickTakeData = await quickTakeResponse.json();
        let quickTakeContent = quickTakeData.choices?.[0]?.message?.content?.trim();
        
        if (quickTakeContent) {
          quickTakeContent = quickTakeContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          try {
            vcQuickTake = JSON.parse(quickTakeContent);
            console.log("✓ Successfully generated VC Quick Take");
          } catch (parseError) {
            console.warn("Failed to parse VC Quick Take, trying sanitization...");
            try {
              vcQuickTake = JSON.parse(sanitizeJsonString(quickTakeContent));
              console.log("✓ Generated VC Quick Take after sanitization");
            } catch (e) {
              console.error("VC Quick Take parsing failed completely:", e);
            }
          }
        }
      }
    } catch (quickTakeError) {
      console.warn("VC Quick Take generation failed:", quickTakeError);
    }

    // Validate memo completeness (expect 7-8 sections now: 7 main + Investment Thesis)
    const generatedSectionCount = Object.keys(enhancedSections).length;
    console.log(`\n=== MEMO GENERATION SUMMARY ===`);
    console.log(`Generated sections: ${generatedSectionCount}/8 expected`);
    console.log(`Section titles: ${Object.keys(enhancedSections).join(", ")}`);
    console.log(`VC Quick Take generated: ${vcQuickTake ? "Yes" : "No"}`);
    
    if (generatedSectionCount < 3) {
      console.error(`WARNING: Only ${generatedSectionCount} sections generated, expected at least 3`);
      throw new Error(`Incomplete memo generation: only ${generatedSectionCount} sections generated`);
    }

    // Save memo to database with structured content
    const structuredContent = {
      sections: Object.entries(enhancedSections).map(([title, content]) => ({
        title,
        ...(typeof content === 'string' ? { paragraphs: [{ text: content, emphasis: "normal" }] } : content)
      })),
      vcQuickTake: vcQuickTake,
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
