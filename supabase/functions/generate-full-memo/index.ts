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

// Helper function to normalize VC questions to enhanced format with contextual rationale
function normalizeVCQuestions(questions: any[], sectionName?: string): any[] {
  if (!Array.isArray(questions)) return [];
  
  // Generate context-aware fallback rationale based on section
  const getRationale = (question: string, section?: string): string => {
    const q = question.toLowerCase();
    const s = (section || '').toLowerCase();
    
    if (q.includes('competitor') || q.includes('differentiat') || s.includes('competition')) {
      return "VCs invest in companies that can defend their position. Understanding competitive dynamics reveals whether you have a sustainable advantage or are in a race to the bottom.";
    }
    if (q.includes('customer') || q.includes('retention') || q.includes('churn')) {
      return "Customer retention is the ultimate proof of value. High churn means your product isn't solving the problem well enough, regardless of how fast you acquire customers.";
    }
    if (q.includes('revenue') || q.includes('pricing') || q.includes('monetiz') || s.includes('business')) {
      return "Unit economics determine whether growth creates or destroys value. VCs need to see a path to profitability at scale.";
    }
    if (q.includes('team') || q.includes('founder') || q.includes('hire') || s.includes('team')) {
      return "VCs bet on teams, not just ideas. Execution capability and founder-market fit are often the difference between success and failure.";
    }
    if (q.includes('market') || q.includes('tam') || q.includes('scale')) {
      return "Market size determines outcome potential. VCs need to believe this can be a fund-returning investment, which requires large addressable markets.";
    }
    if (q.includes('traction') || q.includes('growth') || q.includes('metric')) {
      return "Traction is the best predictor of future success. VCs look for evidence of product-market fit through measurable, repeatable growth.";
    }
    return "This question probes a critical assumption that could make or break the investment thesis. VCs need concrete evidence, not promises.";
  };
  
  const getPreparation = (question: string): string => {
    const q = question.toLowerCase();
    
    if (q.includes('why') || q.includes('how')) {
      return "Prepare a clear, specific answer with concrete examples and data. Generic responses will raise red flags about depth of understanding.";
    }
    if (q.includes('data') || q.includes('metric') || q.includes('number')) {
      return "Gather specific metrics with clear definitions and methodology. Show trends over time, not just snapshots. Include benchmarks for context.";
    }
    if (q.includes('risk') || q.includes('concern') || q.includes('challenge')) {
      return "Acknowledge the risk honestly, then explain your mitigation strategy with specific actions and timelines. VCs respect founders who understand their vulnerabilities.";
    }
    if (q.includes('competitor') || q.includes('alternative')) {
      return "Create a detailed competitive matrix showing your differentiation. Include both direct competitors and alternative solutions customers currently use.";
    }
    return "Prepare specific evidence: customer testimonials, contracts, metrics, or third-party validation. Anecdotes without data will not satisfy skeptical investors.";
  };
  
  return questions.map((q, index) => {
    // If it's already an object with the required properties and they're substantive, return as-is
    if (typeof q === 'object' && q !== null && q.question) {
      const hasSubstantiveRationale = q.vcRationale && q.vcRationale.length > 50;
      const hasSubstantivePrep = q.whatToPrepare && q.whatToPrepare.length > 50;
      
      return {
        question: q.question,
        vcRationale: hasSubstantiveRationale ? q.vcRationale : getRationale(q.question, sectionName),
        whatToPrepare: hasSubstantivePrep ? q.whatToPrepare : getPreparation(q.question)
      };
    }
    
    // If it's a string, transform to enhanced format with contextual content
    if (typeof q === 'string') {
      return {
        question: q,
        vcRationale: getRationale(q, sectionName),
        whatToPrepare: getPreparation(q)
      };
    }
    
    // Fallback for unexpected formats
    return {
      question: `Key question ${index + 1}`,
      vcRationale: "This question probes a critical assumption in the investment thesis. VCs need concrete evidence before committing capital.",
      whatToPrepare: "Prepare specific data, customer testimonials, or third-party validation to address this concern convincingly."
    };
  });
}

// Helper function to normalize a section's vcReflection questions
function normalizeSectionQuestions(section: any, sectionName?: string): any {
  if (section?.vcReflection?.questions) {
    section.vcReflection.questions = normalizeVCQuestions(section.vcReflection.questions, sectionName);
  }
  return section;
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

// Main background generation function
async function generateMemoInBackground(
  companyId: string,
  jobId: string,
  force: boolean
) {
  const startTime = Date.now();
  console.log(`=== Starting background memo generation for job ${jobId} ===`);
  
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
  
  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch company details
    const { data: company, error: companyError } = await supabaseClient
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .single();

    if (companyError || !company) {
      throw new Error("Failed to fetch company details");
    }

    // Fetch all memo responses for this company
    const { data: responses, error: responsesError } = await supabaseClient
      .from("memo_responses")
      .select("*")
      .eq("company_id", companyId);

    if (responsesError) {
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
      promptsData.forEach((p: any) => {
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
      qualityCriteria.forEach((c: any) => {
        const section = keyToSection[c.question_key];
        if (section) {
          criteriaBySection[section] = c;
        }
      });
    }
    console.log("Quality criteria loaded for sections:", Object.keys(criteriaBySection));

    // Define section order
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

    // ============================================
    // Research competitors using AI before generating Competition section
    // ============================================
    let competitorResearch: any = null;
    try {
      console.log("Researching competitors via AI...");
      const userProvidedCompetitors = responses?.filter(r => 
        r.question_key.startsWith('competition_') || r.question_key === 'competitive_moat'
      ).map(r => r.answer).join('\n') || "";
      
      const competitorResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/research-competitors`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyName: company.name,
          description: company.description,
          problem: problemInfo,
          solution: solutionInfo,
          industry: company.category || marketContext?.marketVertical || "Technology",
          userProvidedCompetitors
        }),
      });

      if (competitorResponse.ok) {
        competitorResearch = await competitorResponse.json();
        console.log("Competitor research completed:", competitorResearch?.marketType || "Unknown market type");
      } else {
        console.warn("Failed to research competitors, proceeding without it");
      }
    } catch (competitorError) {
      console.warn("Error researching competitors:", competitorError);
    }

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

      // Add competitor research context for Competition section
      let competitorContextStr = "";
      if (sectionName === "Competition" && competitorResearch && !competitorResearch.error) {
        competitorContextStr = `\n\n--- AI-RESEARCHED COMPETITOR INTELLIGENCE ---
**IMPORTANT: This is AI-researched competitor data. Use these REAL company names and insights in your analysis.**

**Market Classification:** ${competitorResearch.marketType || "Unknown"}
**Rationale:** ${competitorResearch.marketTypeRationale || "N/A"}

**INCUMBENTS/GORILLAS:**
${(competitorResearch.incumbents || []).map((c: any) => `
- **${c.name}** ${c.estimatedSize ? `(${c.estimatedSize})` : ''}
  - Description: ${c.description}
  - Strengths: ${(c.strengths || []).join(', ')}
  - Weaknesses: ${(c.weaknesses || []).join(', ')}
  - Target Market: ${c.targetMarket}
  - Threat Level: ${c.threatLevel}`).join('\n') || "None identified"}

**DIRECT COMPETITORS:**
${(competitorResearch.directCompetitors || []).map((c: any) => `
- **${c.name}** ${c.funding ? `(${c.funding})` : ''}
  - Description: ${c.description}
  - Strengths: ${(c.strengths || []).join(', ')}
  - Weaknesses: ${(c.weaknesses || []).join(', ')}
  - Differentiation: ${c.differentiation}
  - Threat Level: ${c.threatLevel}`).join('\n') || "None identified"}

**ADJACENT SOLUTIONS:**
${(competitorResearch.adjacentSolutions || []).map((c: any) => `
- **${c.name}**: ${c.description}
  - How they compete: ${c.howTheyCompete}`).join('\n') || "None identified"}

**CRITICAL ASSESSMENT (BE HONEST!):**
- Founder Claims Valid: ${competitorResearch.criticalAssessment?.founderClaimsValid === true ? 'YES' : competitorResearch.criticalAssessment?.founderClaimsValid === false ? 'NO' : 'UNCLEAR'}
- Reasoning: ${competitorResearch.criticalAssessment?.reasoning || "N/A"}
- Major Concerns: ${(competitorResearch.criticalAssessment?.majorConcerns || []).join('; ') || "None identified"}
- Potential Moats: ${(competitorResearch.criticalAssessment?.potentialMoats || []).join('; ') || "None identified"}
- Recommended Beachhead: ${competitorResearch.criticalAssessment?.recommendedBeachhead || "N/A"}
- Overall Competitive Position: ${competitorResearch.criticalAssessment?.overallCompetitivePosition || "N/A"}
- Honest Verdict: ${competitorResearch.criticalAssessment?.honestVerdict || "N/A"}

**INSTRUCTIONS FOR COMPETITION SECTION:**
1. USE the specific competitor names above in your analysis
2. If the Critical Assessment indicates weak positioning, SAY SO CLEARLY
3. If "Founder Claims Valid" is NO, explain why their differentiation claims don't hold up
4. Be pragmatic and critical — VCs value honesty over cheerleading
5. If this is clearly a Red Ocean with strong, well-funded players, acknowledge the challenges
--- END COMPETITOR INTELLIGENCE ---`;
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
        : `You are a senior VC investment analyst writing the "${sectionName}" section of an internal due diligence memo. Your job is to assess objectively AND teach founders how to present their company like a VC would.

=== SECTION-SPECIFIC REQUIREMENTS ===
${sectionName === "Problem" ? `
**MANDATORY FRAMEWORK APPLICATION — YOUR FIRST PARAGRAPH MUST BEGIN WITH:**
"This is a [Hair on Fire / Hard Fact / Future Vision] problem because [specific reason based on evidence]."

Sequoia's PMF Archetypes:
- "Hair on Fire": Urgent, obvious pain. Customers actively searching for solutions. Budget already allocated. Crowded market requiring differentiation.
- "Hard Fact": Pain accepted as "just how things are." Requires customer epiphany to recognize the problem is solvable. Often involves workflow inefficiency or manual processes.
- "Future Vision": Sounds like science fiction today. Requires belief in a new paradigm. Early market creation.

**YOU MUST COVER ALL OF THESE ASPECTS IN SEPARATE, LABELED PARAGRAPHS:**

**Today's Reality:** How is this task/process handled today? What tools/methods do people currently use? Paint a vivid picture of the status quo — be specific about the exact workflow and tools (Excel, WhatsApp, paper, legacy software, etc.).

**What's Broken:** What exactly is broken or inefficient about current solutions? Be specific and concrete about the failures. List 2-3 specific pain points with real examples.

**Quantified Pain (MANDATORY — YOU MUST INCLUDE SPECIFIC NUMBERS):**
Put NUMBERS to the problem. This is NOT optional. If founder data includes metrics, USE THEM. If not provided, YOU MUST ESTIMATE based on industry research and clearly label as "[AI-ESTIMATED]".

Calculate and include ALL of these:
- Hours wasted per week/month on manual processes (e.g., "[AI-ESTIMATED] Small business owners spend 5-8 hours/week on manual loyalty tracking")
- Money lost per month due to inefficiency (e.g., "[AI-ESTIMATED] €500-2,000/month in missed repeat revenue due to poor customer follow-up")
- Error rates or data quality issues (e.g., "[AI-ESTIMATED] 30-40% of customer data becomes stale within 90 days")
- Customer churn or lost opportunities (e.g., "[AI-ESTIMATED] 2-5 customers/week never return due to lack of engagement")
- Opportunity cost in € terms (e.g., "[AI-ESTIMATED] Total annual cost of inaction: €15,000-25,000 per SMB")

ALWAYS show your math. Example: "At an average transaction value of €15 and 3 potential repeat visits lost per customer, each churned customer = €45 lost LTV. With 10 preventable churns per month, that's €450/month or €5,400/year."

**Who Hurts Most:** Identify exactly who feels this pain most acutely — specific role titles (e.g., "Operations Manager at a 20-person agency"), company sizes (SMB vs Enterprise), industries, and the urgency level (rate 1-10 pain scale with justification).

**Why Now:** Is this problem getting worse? Identify 2-3 specific forces making this more urgent: regulatory changes, technology shifts (AI adoption), generational changes, economic pressures, competitive dynamics. Create urgency.
` : ""}${sectionName === "Solution" ? `
**MANDATORY FRAMEWORK APPLICATION — YOUR FIRST PARAGRAPH MUST BEGIN WITH:**
"This solution builds [Power Name] because [specific reason]."

Hamilton Helmer's 7 Powers — Identify the PRIMARY power this solution enables:
- Scale Economies: Unit costs decline as volume increases (e.g., software with near-zero marginal cost)
- Network Effects: Value increases with each additional user (marketplaces, social, data networks)
- Counter-Positioning: Incumbent can't copy without harming their core business
- Switching Costs: Lock-in through data, workflow, or integration depth
- Branding: Ability to charge premium for perceived quality/trust
- Cornered Resource: Exclusive access to talent, IP, data, or regulatory advantage
- Process Power: Embedded organizational capabilities competitors can't replicate

**YOU MUST COVER ALL OF THESE ASPECTS IN SEPARATE, LABELED PARAGRAPHS:**

**In Plain English:** Describe what the solution does in ONE simple sentence that a 10-year-old could understand. No jargon. No buzzwords. Just clear, concrete language. Then expand with a real example of how it works in practice.

**Why This Approach:** Why does the market need THIS specific approach? What's fundamentally different about this solution vs. existing alternatives? Be specific about the unique insight or angle.

**The ROI:** Be explicit about measurable outcomes — time saved (X hours/week), cost reduced (Y% or €Z/month), efficiency gained (X% faster), revenue increased (Y% improvement). USE SPECIFIC NUMBERS from founder data. If not provided, flag as [CRITICAL: ROI data needed to validate value proposition].

**Proof It Works:** Back claims with REAL evidence: customer quotes, testimonials, case study results, NPS scores, retention data, pilot outcomes. Clearly label each as:
- VERIFIED: Third-party evidence, public data, or signed contracts
- CLAIMED: Founder-stated without independent verification
- MISSING: Evidence that should exist but wasn't provided
` : ""}${sectionName === "Market" ? `
**MANDATORY: THIS SECTION MUST INCLUDE A COMPLETE BOTTOMS-UP CALCULATION WITH EXACT NUMBERS**
**IF DATA IS INCOMPLETE, YOU MUST PROVIDE NAPKIN MATH ESTIMATES LABELED AS [AI-ESTIMATED]**

**YOU MUST COVER ALL OF THESE ASPECTS IN SEPARATE, LABELED PARAGRAPHS:**

**Ideal Customer Profile:** Define the ICP with extreme precision:
- Company size: X-Y employees, €X-Y revenue range
- Industry vertical(s): specific sectors, not generic categories
- Buyer persona: exact job title, seniority, budget authority
- Pain level: rate 1-10 with justification
- Buying trigger: what event causes them to search for a solution?

**Bottoms-Up Market Math (CRITICAL — SHOW ALL CALCULATIONS):**
YOU MUST INCLUDE THIS EXACT CALCULATION FORMAT IN YOUR NARRATIVE. If founder did not provide ACV/pricing, ESTIMATE based on industry norms and label clearly:

"**The Math:**
- Current ACV: €[X] per customer per year [use provided data OR estimate: e.g., "[AI-ESTIMATED] typical SMB SaaS in this category: €200-500/year"]
- Customers needed for €10M ARR: [10,000,000 ÷ ACV] = [N] customers
- Customers needed for €50M ARR: [50,000,000 ÷ ACV] = [N] customers  
- Customers needed for €100M ARR: [100,000,000 ÷ ACV] = [N] customers
- Total addressable ICP pool: [estimate from market data — use public sources like Eurostat, industry reports]
- Required market penetration for €100M: [N ÷ Total ICP]%"

**VC-Grade Scale Reality Check:**
Explicitly assess: "To reach €100M ARR (VC-grade scale), this company would need [N] customers at current ACV. Given [market size estimate], this represents [X%] market penetration. This is [Achievable / Aggressive / Extremely Aggressive] because [reasoning]."

If penetration seems unrealistic, provide PATH TO SCALE:
- "To reach VC-scale with realistic penetration (5-10%), ACV would need to increase to €[X] through [enterprise tier / usage expansion / multi-product]."
- OR: "Market expansion to [adjacent geography/vertical] would add [N] potential customers, making the math work at [Y%] penetration."

**Growth Acceleration Strategies:** Provide 3 SPECIFIC, ACTIONABLE strategies to reach VC-scale faster:
1. **Adjacent Market:** Name a specific adjacent segment + why they'd buy + estimated additional TAM
2. **Channel Multiplier:** Identify a specific partner type (agencies, platforms, distributors) that could 10x distribution + example company
3. **Pricing Expansion:** Upsell/cross-sell opportunity (premium tier, add-on modules, usage-based) + estimated ACV uplift potential

**Market Tailwinds:** Identify 2-3 SPECIFIC external forces creating urgency:
- Regulatory: Name specific regulations (GDPR, CSRD, SOC2 requirements) creating compliance pressure
- Technology: Specific tech shifts (GenAI adoption, cloud migration mandates) enabling or requiring this solution
- Behavioral: Generational or work pattern changes (remote work, digital-native buyers) accelerating adoption
` : ""}${sectionName === "Competition" ? `
**MANDATORY: USE VC TERMINOLOGY THROUGHOUT — RED OCEAN, BLUE OCEAN, BEACHHEAD, CATEGORY CREATION, ETC.**

**YOU MUST COVER ALL OF THESE ASPECTS IN SEPARATE, LABELED PARAGRAPHS:**

**Competitive Landscape Overview:**
Start with: "This market is a [Red Ocean (crowded, commoditized) / Blue Ocean (uncontested, new category) / Purple Ocean (differentiated niche in existing market)]."

Map the competitive landscape by PLAYER TYPE. For EACH type, provide:
- 2-3 specific named examples (real companies)
- Their primary strength (what they do well)
- Their critical weakness (where they fall short)
- Their target segment (who they serve)

Player Types to Analyze:
1. **Incumbents/Gorillas:** Large established players (e.g., Salesforce, HubSpot, legacy POS systems). They have scale and brand trust but are slow to innovate and over-engineered for SMBs.
2. **Direct Competitors:** Startups solving the same problem. Name them specifically. Where do they overlap? Where do they differ?
3. **Adjacent Solutions:** Products that partially solve the problem (e.g., "many use Excel/WhatsApp as a workaround"). Why are these inadequate?
4. **Non-Consumption:** What % of the market uses NO solution? Why? (complexity, cost, awareness)

**Beachhead Strategy:**
"The beachhead market is [specific niche] because [reason]. Incumbents are [too big/too slow/too expensive/too complex] to effectively serve this segment."

Example: "Incumbents like [Competitor X] target enterprise clients with €50K+ ACV and 6-month implementation cycles. Their self-serve onboarding is non-existent, creating a gap for SMBs who need to be live in <1 week. This is our beachhead."

**Moat Analysis (7 Powers Framework):**
- Which power creates defensibility? (Network Effects, Switching Costs, Scale Economies, Counter-Positioning, Branding, Cornered Resource, Process Power)
- "This solution is a [Painkiller (must-have, budget allocated) / Vitamin (nice-to-have, first to cut)] because [evidence]."
- Counter-Positioning angle: "Incumbents cannot copy this approach without [cannibalizing their enterprise revenue / rebuilding their tech stack / abandoning their sales model]."
- Switching cost analysis: Once a customer is onboarded, what makes them sticky?

**Where We Win:**
Be explicit: "Company X wins against [Competitor Type] specifically because [concrete reason]."
- Speed to value: Onboarding in [X days/hours] vs. [competitor's Y weeks/months]
- Price point: [€X/month] vs. [competitor's €Y/month] — [Z%] cheaper
- Simplicity: [X clicks/steps] to core value vs. [Y clicks/steps] for competitor
- Focus: Purpose-built for [ICP] vs. [competitor's] generic approach
` : ""}${sectionName === "Business Model" ? `
**Unit Economics Lens**:
- LTV:CAC Ratio (target: 3:1+)
- CAC Payback Period (target: <18 months)
- Gross Margin analysis (SaaS: 70%+, marketplace: varies)
- Magic Number for SaaS efficiency

Explicitly state: "At a LTV:CAC of X:Y, this business..."
` : ""}${sectionName === "Traction" ? `
**Power Law Thinking**:
- Is this showing exponential or linear growth patterns?
- Stage-appropriate metrics (what matters at this stage)
- Growth quality vs. growth quantity
` : ""}${sectionName === "Team" ? `
**MANDATORY FRAMEWORK APPLICATION — YOUR FIRST PARAGRAPH MUST ASSESS:**
"This team demonstrates [Strong/Moderate/Weak] Founder-Market Fit because [specific evidence]."

**YOU MUST COVER ALL OF THESE ASPECTS IN SEPARATE, LABELED PARAGRAPHS:**

**Founder-Market Fit:** Assess WHY this specific team is uniquely positioned to win:
- **Domain Depth:** Years in industry, specific roles held, companies worked at, level of seniority. Quantify: "10 years in fintech, including 5 years as Head of Product at [Company]"
- **Unfair Advantage:** Unique access to customers, distribution, technology, or talent that others don't have
- **Personal Stake:** Are they solving their own problem? Have they experienced the pain firsthand?
- **Track Record:** Previous companies built, exits achieved, teams scaled

Rate founder-market fit: Strong (clear industry expertise + network) / Moderate (adjacent experience) / Weak (no obvious connection)

**Equity Structure:** Analyze the cap table health based on any ownership data provided:
- Current founder ownership % (healthy benchmark: 70-90% at pre-seed, 60-75% at seed)
- Split between co-founders — is it balanced and fair given contributions?
- Red flags: single founder with 99% (execution risk), 4+ equal founders (decision paralysis), significant equity already given to advisors/early employees
- If no equity data provided, flag as [MISSING: Cap table structure needed for full assessment]

**Execution Velocity:** What evidence demonstrates this team can ship and iterate fast?
- Time from idea to MVP
- Speed of customer acquisition (first 10 customers timeline)
- Iteration frequency (product updates, pivots made quickly)
- Quality of early team/advisors attracted
- Relevant: "Built and launched MVP in 6 weeks while both founders were employed full-time"
` : ""}${sectionName === "Vision" ? `
**Fund Economics Lens**:
- Power Law potential: Can this be a fund-returner?
- Ownership math at scale
- Market timing considerations
` : ""}
=== END SECTION REQUIREMENTS ===

WRITING STYLE:
Write 4-6 flowing paragraphs that demonstrate how a top VC would present this section in an investment memo. This is NOT a summary — it's a COMPREHENSIVE ANALYSIS that teaches founders how VCs think. The writing should be:
- Detailed and thorough (cover all required aspects above)
- Simple and clear language (avoid unnecessary jargon)
- Story-driven with narrative arc
- Professional and polished
- Explicitly reference and apply VC frameworks

Structure:
1. **Hero Statement** (emphasis: "high"): Hook with the single most important insight
2. **Narrative Paragraphs** (emphasis: "narrative"): 4-5 flowing paragraphs systematically covering ALL the required aspects above
3. **Pull Quote** (emphasis: "quote") [optional]: A standout insight worth highlighting

CRITICAL ANALYSIS REQUIREMENTS:
- Lead with concerns and risks, not strengths
- Explicitly flag what is MISSING or UNVERIFIED
- Challenge founder assumptions
- If you would hesitate to invest, say so clearly
${criteriaContextStr}

Context: ${company.name} is a ${company.stage} stage ${company.category || "startup"}.${marketContextStr}${sectionFinancialStr}${competitorContextStr}

Raw information:
${combinedContent}

${marketContext ? 'IMPORTANT: Leverage the AI-deduced market intelligence above to enrich your analysis.\n\n' : ''}${sectionName === "Competition" && competitorResearch ? 'CRITICAL: You MUST use the AI-researched competitor names and data above. Be honest about competitive positioning — if the company faces strong, well-funded competitors, acknowledge the challenges.\n\n' : ''}Return ONLY valid JSON with this exact structure:
{
  "narrative": {
    "paragraphs": [
      {"text": "One powerful sentence summarizing the most critical insight, explicitly naming any applicable VC framework.", "emphasis": "high"},
      {"text": "First narrative paragraph covering the first required aspect.", "emphasis": "narrative"},
      {"text": "Second narrative paragraph covering additional required aspects.", "emphasis": "narrative"},
      {"text": "Third narrative paragraph with more analysis.", "emphasis": "narrative"},
      {"text": "Fourth narrative paragraph completing the required coverage.", "emphasis": "narrative"},
      {"text": "Optional pull quote - a standout insight.", "emphasis": "quote"}
    ],
    "highlights": [
      {"metric": "3.2x", "label": "LTV:CAC Ratio"},
      {"metric": "$85K", "label": "ACV"}
    ],
    "keyPoints": [
      "Key takeaway 1",
      "Key takeaway 2",
      "Key takeaway 3"
    ]
  },
  "vcReflection": {
    "analysis": "Critical VC assessment focusing on the 2-3 biggest concerns. What assumptions lack evidence?",
    "questions": [
      {
        "question": "What is the single biggest risk?",
        "vcRationale": "Why VCs care from a fund economics perspective.",
        "whatToPrepare": "Specific evidence to address this concern."
      },
      {
        "question": "What assumptions may not hold?",
        "vcRationale": "VC economic reasoning.",
        "whatToPrepare": "Validation needed."
      },
      {
        "question": "What critical data is missing?",
        "vcRationale": "Why this matters for investment decision.",
        "whatToPrepare": "How to gather this data."
      }
    ],
    "benchmarking": "How this compares to market benchmarks",
    "conclusion": "Lead with primary concern. Rate confidence (Low/Medium/High)."
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
                content: `You are a PARTNER at a top-tier VC firm writing an internal investment memo to your fellow partners. 

CRITICAL VOICE REQUIREMENTS:
- Write in FIRST PERSON from a VC perspective ("I met with the founders...", "What I like about this...", "My concern here is...")
- NEVER say "the information provided says", "the founder claims", or "according to the deck"
- Synthesize and present YOUR assessment directly as if briefing partners after a meeting
- Be direct and opinionated: "This is compelling because..." or "I'm skeptical about..."
- Use phrases like "If we invest, we're betting that...", "The key risk I see is...", "What gets me excited here is..."

You must be objective and critical — highlight weaknesses, risks, and gaps alongside strengths. If data is missing or claims are unsubstantiated, flag it explicitly. Return valid JSON only, no markdown formatting.`,
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
{"narrative":{"paragraphs":[{"text":"Main analysis paragraph here.","emphasis":"high"},{"text":"Supporting details.","emphasis":"normal"}],"keyPoints":["Key point 1","Key point 2","Key point 3"]},"vcReflection":{"analysis":"Critical assessment.","questions":[{"question":"Key question 1?","vcRationale":"Why VCs care about this","whatToPrepare":"Evidence to address this"},{"question":"Key question 2?","vcRationale":"Why VCs care about this","whatToPrepare":"Evidence to address this"}],"conclusion":"Summary conclusion."}}`,
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
    "questions": [
      {"question": "critical question 1", "vcRationale": "Why VCs care about this from fund economics perspective", "whatToPrepare": "Evidence/data to address this"},
      {"question": "question 2", "vcRationale": "Economic reasoning behind this question", "whatToPrepare": "Preparation guidance"},
      {"question": "question 3", "vcRationale": "Economic reasoning behind this question", "whatToPrepare": "Preparation guidance"},
      {"question": "question 4", "vcRationale": "Economic reasoning behind this question", "whatToPrepare": "Preparation guidance"},
      {"question": "question 5", "vcRationale": "Economic reasoning behind this question", "whatToPrepare": "Preparation guidance"}
    ],
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
                content: `You are a senior VC PARTNER writing a critical, unbiased investment thesis to your fellow partners. Write in FIRST PERSON ("I believe...", "My recommendation is...", "What concerns me most...").

This is NOT an advocacy document. Your job is to assess whether this is truly a VC-grade opportunity with clear eyes. Highlight weaknesses and risks prominently. Challenge assumptions. If data is weak or missing, explicitly state that you cannot recommend investment. Do not default to optimism. Always respond with valid JSON only.`,
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

    // Normalize all VC questions to enhanced format before saving
    console.log("Normalizing VC questions to enhanced format...");
    for (const sectionName of Object.keys(enhancedSections)) {
      enhancedSections[sectionName] = normalizeSectionQuestions(enhancedSections[sectionName], sectionName);
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
    console.log(`=== Background memo generation completed successfully in ${totalDuration}s ===`);
    
    // Update job status to completed
    await supabaseClient
      .from("memo_generation_jobs")
      .update({ 
        status: "completed",
        completed_at: new Date().toISOString()
      })
      .eq("id", jobId);
      
    console.log(`Job ${jobId} marked as completed`);
    
  } catch (error) {
    const errorDuration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`=== Error in background memo generation after ${errorDuration}s ===`);
    console.error("Error details:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    // Update job status to failed
    await supabaseClient
      .from("memo_generation_jobs")
      .update({ 
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error",
        completed_at: new Date().toISOString()
      })
      .eq("id", jobId);
      
    console.log(`Job ${jobId} marked as failed`);
  }
}

// HTTP request handler
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("=== generate-full-memo request received ===");

  // Demo company ID for sample memo generation
  const DEMO_COMPANY_ID = "00000000-0000-0000-0000-000000000001";

  try {
    const { companyId, force = false } = await req.json();
    console.log(`Request received: companyId=${companyId}, force=${force}`);

    if (!companyId) {
      return new Response(
        JSON.stringify({ error: "Company ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Allow demo company regeneration without auth (for admin purposes)
    const isDemoCompany = companyId === DEMO_COMPANY_ID;
    let userId: string | null = null;

    if (!isDemoCompany) {
      // Authentication check for non-demo companies
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        console.error("No authorization header provided");
        return new Response(
          JSON.stringify({ error: "Authentication required" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

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

      userId = userData.user.id;
      console.log(`Authenticated user: ${userId}`);

      // Verify company ownership for non-demo companies
      const { data: company, error: companyError } = await supabaseClient
        .from("companies")
        .select("founder_id, name")
        .eq("id", companyId)
        .single();

      if (companyError || !company) {
        console.error("Error fetching company:", companyError);
        return new Response(
          JSON.stringify({ error: "Company not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (company.founder_id !== userId) {
        console.error(`Access denied: User ${userId} does not own company ${companyId}`);
        return new Response(
          JSON.stringify({ error: "Access denied" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      console.log("Demo company detected - bypassing auth check");
    }

    // Check if there's already a job in progress for this company
    const { data: existingJob } = await supabaseClient
      .from("memo_generation_jobs")
      .select("id, status, started_at")
      .eq("company_id", companyId)
      .in("status", ["pending", "processing"])
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingJob && !force) {
      console.log(`Existing job found: ${existingJob.id} with status ${existingJob.status}`);
      return new Response(
        JSON.stringify({ 
          jobId: existingJob.id,
          status: existingJob.status,
          message: "Generation already in progress"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create new job record
    const { data: newJob, error: jobError } = await supabaseClient
      .from("memo_generation_jobs")
      .insert({
        company_id: companyId,
        status: "processing",
        started_at: new Date().toISOString()
      })
      .select("id")
      .single();

    if (jobError || !newJob) {
      console.error("Error creating job:", jobError);
      return new Response(
        JSON.stringify({ error: "Failed to create generation job" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Created job ${newJob.id} for company ${companyId}`);

    // Start background generation using EdgeRuntime.waitUntil
    // This allows the function to return immediately while processing continues
    (globalThis as any).EdgeRuntime?.waitUntil?.(
      generateMemoInBackground(companyId, newJob.id, force)
    );

    // Return immediately with job ID
    return new Response(
      JSON.stringify({ 
        jobId: newJob.id,
        status: "processing",
        message: "Memo generation started"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-full-memo handler:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
