import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Timeout for AI API call (120 seconds for longer memo generation)
const AI_TIMEOUT_MS = 120000;

// Max file size for upload (15MB)
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;

// Keep edge-function typing loose (Supabase types are not available in Deno runtime).
async function fetchKBContext(
  serviceClient: any,
  opts: { geography?: string; stage?: string; sector?: string | null },
) {
  // Balanced matching strategy:
  // 1) Try stage+sector
  // 2) Fallback to stage
  // 3) Fallback to sector
  // 4) Fallback to anything in geography
  const geography = opts.geography ?? "Europe";
  const stage = opts.stage;
  const sector = opts.sector ?? null;

  const { data: sources } = await serviceClient
    .from("kb_sources")
    .select("id,title,publisher,publication_date")
    .eq("status", "active")
    .eq("geography_scope", geography)
    .order("publication_date", { ascending: false, nullsFirst: false })
    .limit(5);

  const sourceIds = (sources || []).map((s: any) => s.id).filter(Boolean);
  if (sourceIds.length === 0) {
    return { sources: [], benchmarks: [], notes: [] };
  }

  async function fetchBenchmarks(filters: { stage?: string; sector?: string | null }) {
    let q = serviceClient
      .from("kb_benchmarks")
      .select(
        "geography_scope,region,stage,sector,business_model,timeframe_label,sample_size,currency,metric_key,metric_label,median_value,p25_value,p75_value,unit,notes,source_id",
      )
      .in("source_id", sourceIds)
      .eq("geography_scope", geography)
      .order("updated_at", { ascending: false })
      .limit(60);
    if (filters.stage) q = q.eq("stage", filters.stage);
    if (filters.sector) q = q.eq("sector", filters.sector);
    const { data } = await q;
    return (data || []) as any[];
  }

  async function fetchMarketNotes(filters: { sector?: string | null }) {
    let q = serviceClient
      .from("kb_market_notes")
      .select(
        "geography_scope,region,sector,timeframe_label,headline,summary,key_points,source_id",
      )
      .in("source_id", sourceIds)
      .eq("geography_scope", geography)
      .order("updated_at", { ascending: false })
      .limit(25);
    if (filters.sector) q = q.eq("sector", filters.sector);
    const { data } = await q;
    return (data || []) as any[];
  }

  let benchmarks: any[] = [];
  if (stage && sector) benchmarks = await fetchBenchmarks({ stage, sector });
  if (benchmarks.length === 0 && stage) benchmarks = await fetchBenchmarks({ stage });
  if (benchmarks.length === 0 && sector) benchmarks = await fetchBenchmarks({ sector });
  if (benchmarks.length === 0) benchmarks = await fetchBenchmarks({});

  let marketNotes: any[] = [];
  if (sector) marketNotes = await fetchMarketNotes({ sector });
  if (marketNotes.length === 0) marketNotes = await fetchMarketNotes({});

  return {
    sources: sources || [],
    benchmarks: benchmarks || [],
    notes: marketNotes || [],
  };
}

async function inferDeckMatchingSignals(params: {
  imagesToProcess: string[];
  lovableApiKey: string;
}) {
  const tool = {
    type: "function",
    function: {
      name: "infer_kb_signals",
      description: "Infer stage and sector from the deck for knowledge-base matching.",
      parameters: {
        type: "object",
        additionalProperties: false,
        required: ["stage", "sector"],
        properties: {
          stage: { type: "string" },
          sector: { type: "string" },
        },
      },
    },
  };

  const contentParts: any[] = [
    {
      type: "text",
      text:
        "Look at this pitch deck and infer ONLY (1) venture stage (Pre-Seed|Seed|Series A|Series B|Later) and (2) primary sector. Be conservative; pick the closest fit.",
    },
  ];

  // Keep this fast: first few pages only.
  for (const url of params.imagesToProcess.slice(0, 4)) {
    contentParts.push({
      type: "image_url",
      image_url: { url, detail: "low" },
    });
  }

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.lovableApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "system",
          content:
            "You are a VC analyst. Return output ONLY via the tool call. No extra text.",
        },
        { role: "user", content: contentParts },
      ],
      tools: [tool],
      tool_choice: { type: "function", function: { name: "infer_kb_signals" } },
      temperature: 0.2,
    }),
  });

  if (!resp.ok) {
    return { stage: undefined as string | undefined, sector: undefined as string | undefined };
  }

  const json = await resp.json();
  const toolCall = json?.choices?.[0]?.message?.tool_calls?.[0];
  const args = toolCall?.function?.arguments;
  try {
    const parsed = typeof args === "string" ? JSON.parse(args) : args;
    return {
      stage: parsed?.stage as string | undefined,
      sector: parsed?.sector as string | undefined,
    };
  } catch {
    return { stage: undefined, sector: undefined };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log('Starting investor memo generation...');

  try {
    // Authentication check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

     const serviceClient = createClient(
       Deno.env.get("SUPABASE_URL") ?? "",
       Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
     );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await anonClient.auth.getUser(token);
    
    if (authError || !userData.user) {
      console.error("Authentication failed:", authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Authenticated user: ${userData.user.id}`);

    const { fileBase64, fileName, fileType, imageUrls } = await req.json();

    // Support both direct image URLs and base64 PDF
    let imagesToProcess: string[] = [];

    if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      // Direct image URLs provided
      imagesToProcess = imageUrls;
    } else if (fileBase64) {
      // PDF provided as base64 - we'll send it directly to Gemini as PDF
      console.log('Processing PDF file:', fileName);
      
      // For PDF, we'll send the raw PDF to the AI (Gemini supports PDF)
      const pdfDataUrl = `data:application/pdf;base64,${fileBase64}`;
      imagesToProcess = [pdfDataUrl];
    } else {
      return new Response(
        JSON.stringify({ error: 'File or image URLs are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating investor memo from deck');

    const inferred = await inferDeckMatchingSignals({
      imagesToProcess,
      lovableApiKey: LOVABLE_API_KEY,
    });

    const kbContext = await fetchKBContext(serviceClient, {
      geography: "Europe",
      stage: inferred.stage,
      sector: inferred.sector,
    });

    const kbContextBlock = kbContext.sources.length
      ? `\n\n=== EUROPE KNOWLEDGE BASE (benchmarks + market notes) ===\nUse these to calibrate expectations (round sizes, valuations, dilution norms, traction-at-raise) and to add Europe-specific market context where relevant. Cite sources by publisher/title/date in your narrative when you use a benchmark.\n\nSOURCES:\n${kbContext.sources
          .map((s: any) => `- ${s.publisher ?? "Unknown publisher"} — ${s.title ?? "Untitled"}${s.publication_date ? ` (${s.publication_date})` : ""} [${s.id}]`)
          .join("\n")}\n\nBENCHMARK ROWS (sample):\n${kbContext.benchmarks
          .map((b: any) => {
            const range =
              b.p25_value != null || b.p75_value != null
                ? ` (p25 ${b.p25_value ?? "?"}, p75 ${b.p75_value ?? "?"})`
                : "";
            return `- [${b.source_id}] ${b.stage}${b.sector ? ` / ${b.sector}` : ""}: ${b.metric_key}${b.metric_label ? ` (${b.metric_label})` : ""} = median ${b.median_value ?? "?"}${range}${b.unit ? ` ${b.unit}` : ""}${b.currency ? ` (${b.currency})` : ""}`;
          })
          .join("\n")}\n\nMARKET NOTES (sample):\n${kbContext.notes
          .map((n: any) => `- [${n.source_id}] ${n.headline ?? "Market note"}: ${n.summary}`)
          .join("\n")}`
      : "";

    // Build the memo generation prompt. We will use tool-calling to guarantee valid JSON output.
    const systemPrompt = `You are a senior VC investment analyst at a top-tier venture fund. Your task is to analyze this pitch deck and write a FAST investor snapshot (not a full diligence memo).

CRITICAL INSTRUCTIONS:
- Write a COMPLETE investment memo, not bullet points or summaries
- Each section should be concise (60-120 words max)
- Use professional VC language and terminology
- Be analytical and critical - identify both strengths and concerns
- Include specific numbers, metrics, and facts from the deck when available
- If information is missing, note it as a gap
- Provide numerical scores (0-100) for key areas based on VC evaluation criteria

You MUST return the result ONLY via the provided function tool call. Do NOT wrap anything in markdown. Do NOT output raw JSON in the message content.

The tool schema matches this structure:

{
  "company_name": "Company Name",
  "tagline": "One-line description of what the company does",
  "stage": "Pre-Seed|Seed|Series A|Series B|Later",
  "sector": "Primary sector/industry",
  
  "quick_analysis": {
    "overall_score": 65,
    "readiness_level": "LOW|MEDIUM|HIGH",
    "one_liner_verdict": "A single sentence VC gut reaction to this opportunity",
    "section_scores": {
      "team": 70,
      "market": 65,
      "traction": 55,
      "product": 72,
      "business_model": 60,
      "competition": 58
    }
  },
  
  "concerns": [
    { "category": "traction", "text": "Specific concern about traction", "severity": "critical" },
    { "category": "team", "text": "Team gap identified", "severity": "warning" },
    { "category": "market", "text": "Market concern", "severity": "minor" }
  ],
  
  "strengths": [
    { "category": "Product", "text": "Strong product differentiation" },
    { "category": "Team", "text": "Experienced founding team" },
    { "category": "Market", "text": "Large addressable market" }
  ],
  
  "matching_signals": {
    "stage": "Seed",
    "sector": "SaaS",
    "secondary_sectors": ["AI", "B2B"],
    "keywords": ["automation", "enterprise", "workflow"],
    "ask_amount": 2000000,
    "has_revenue": true,
    "has_customers": true,
    "geography": "USA"
  },
  
  "sections": {
    "executive_summary": {
      "title": "Executive Summary",
      "content": "A 300-400 word executive summary that captures the company's core value proposition, market opportunity, current traction, team quality, and investment thesis. This should be written as if presenting to an investment committee - covering what the company does, why now, why this team, and what makes this a compelling opportunity."
    },
    "problem": {
      "title": "Problem & Market Need",
      "content": "A 250-400 word analysis of the problem being solved. Discuss the pain point, who experiences it, the cost of the status quo, why existing solutions fall short, and any market timing factors. Include specific examples or data points where available."
    },
    "solution": {
      "title": "Product & Solution",
      "content": "A 250-400 word description of the solution. Explain what the product does, how it works, key features and capabilities, what makes it 10x better than alternatives, and any technical differentiation or IP. Discuss the product-market fit evidence."
    },
    "market": {
      "title": "Market Opportunity",
      "content": "A 250-400 word market analysis. Cover TAM/SAM/SOM if provided, market growth trends, key tailwinds, competitive landscape, and why this market can support a venture-scale outcome. Critically assess the market sizing methodology if presented."
    },
    "business_model": {
      "title": "Business Model & Unit Economics",
      "content": "A 250-400 word analysis of how the company makes money. Cover pricing, revenue model, go-to-market strategy, unit economics (CAC, LTV, margins), and path to profitability. Assess the sustainability and scalability of the business model."
    },
    "traction": {
      "title": "Traction & Validation",
      "content": "A 250-400 word assessment of the company's progress. Cover key metrics (revenue, users, growth rates), notable customers or partnerships, product milestones, and validation of product-market fit. Critically assess the quality and sustainability of traction."
    },
    "competition": {
      "title": "Competitive Landscape",
      "content": "A 250-400 word competitive analysis. Identify direct and indirect competitors, explain the company's differentiation, assess defensibility and moat potential, and discuss risks from incumbents or new entrants."
    },
    "team": {
      "title": "Team Assessment",
      "content": "A 250-400 word evaluation of the founding team. Cover relevant backgrounds, domain expertise, previous entrepreneurial experience, team completeness, and founder-market fit. Identify any key gaps that need to be filled."
    },
    "financials": {
      "title": "Financials & Funding",
      "content": "A 250-400 word overview of the financial situation. Cover current runway, fundraising ask, valuation, use of funds, key milestones for this round, and path to next funding round. Assess capital efficiency."
    },
    "risks": {
      "title": "Key Risks & Concerns",
      "content": "A 250-400 word honest assessment of the main risks. Cover execution risks, market risks, competitive threats, team gaps, and any red flags identified. Be specific and thoughtful about what could go wrong."
    },
    "recommendation": {
      "title": "Investment Recommendation",
      "content": "A 250-400 word investment recommendation. Provide a clear view on whether this is worth pursuing and why. Summarize the key reasons to invest, the main concerns, what you'd want to learn in due diligence, and your overall conviction level."
    }
  },
  "quick_facts": {
    "headquarters": "City, Country or Unknown",
    "founded": "Year or Unknown",
    "employees": "Number or Unknown",
    "funding_raised": "Amount or Unknown",
    "current_raise": "Amount being raised or Unknown",
    "key_metrics": ["Metric 1", "Metric 2", "Metric 3"]
  }
}

SCORING GUIDELINES:
- 80-100: Exceptional, fund-worthy on this dimension
- 60-79: Solid, meets bar with minor concerns
- 40-59: Below bar, significant gaps but not disqualifying
- 0-39: Critical weakness, likely deal-breaker

CONCERNS SEVERITY:
- "critical": Likely deal-breaker, needs immediate resolution
- "warning": Significant concern that needs addressing
- "minor": Worth noting but not blocking

IMPORTANT: 
- Write in complete sentences and paragraphs, not bullet points
- Be analytical, not just descriptive
- Include specific numbers and facts from the deck
- Note when information is missing or unclear
- Each section should flow as professional prose
 - Generate 3-5 concerns and 3-5 strengths based on actual deck content${kbContextBlock}`;

    // Prepare content for the API
    const contentParts: any[] = [
      { type: 'text', text: 'Please analyze this pitch deck and generate a comprehensive VC investment memorandum with structured scoring and analysis. Extract all relevant information and write detailed narrative sections.' }
    ];

    // Add the document/images
    // Speed optimization: fewer pages/images.
    for (const url of imagesToProcess.slice(0, 8)) {
      if (url.startsWith('data:application/pdf;base64,')) {
        // PDF data URL - extract base64 and send as inline_data (Gemini format)
        const base64Data = url.replace('data:application/pdf;base64,', '');
        contentParts.push({
          type: "image_url",
          image_url: { 
            url: `data:application/pdf;base64,${base64Data}` 
          }
        });
      } else if (url.startsWith('data:image/')) {
        // Base64 image - send as image_url with data URL
        contentParts.push({
          type: "image_url",
          image_url: { url, detail: "high" }
        });
      } else {
        // Regular image URL
        contentParts.push({
          type: "image_url",
          image_url: { url, detail: "high" }
        });
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

     // Use tool calling to avoid fragile JSON parsing.
     const snapshotTool = {
       type: "function",
       function: {
         name: "create_investor_snapshot",
         description: "Return the investor deck snapshot in a strict JSON structure.",
         parameters: {
           type: "object",
           additionalProperties: false,
           required: [
             "company_name",
             "tagline",
             "stage",
             "sector",
             "quick_analysis",
             "concerns",
             "strengths",
             "matching_signals",
             "sections",
             "quick_facts",
           ],
           properties: {
             company_name: { type: "string" },
             tagline: { type: "string" },
             stage: { type: "string" },
             sector: { type: "string" },
             quick_analysis: {
               type: "object",
               additionalProperties: false,
               required: ["overall_score", "readiness_level", "one_liner_verdict", "section_scores"],
               properties: {
                 overall_score: { type: "number" },
                 readiness_level: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
                 one_liner_verdict: { type: "string" },
                 section_scores: {
                   type: "object",
                   additionalProperties: false,
                   required: ["team", "market", "traction", "product", "business_model", "competition"],
                   properties: {
                     team: { type: "number" },
                     market: { type: "number" },
                     traction: { type: "number" },
                     product: { type: "number" },
                     business_model: { type: "number" },
                     competition: { type: "number" },
                   },
                 },
               },
             },
             concerns: {
               type: "array",
               items: {
                 type: "object",
                 additionalProperties: false,
                 required: ["category", "text", "severity"],
                 properties: {
                   category: { type: "string" },
                   text: { type: "string" },
                   severity: { type: "string", enum: ["critical", "warning", "minor"] },
                 },
               },
             },
             strengths: {
               type: "array",
               items: {
                 type: "object",
                 additionalProperties: false,
                 required: ["category", "text"],
                 properties: {
                   category: { type: "string" },
                   text: { type: "string" },
                 },
               },
             },
             matching_signals: {
               type: "object",
               additionalProperties: false,
               required: [
                 "stage",
                 "sector",
                 "secondary_sectors",
                 "keywords",
                 "ask_amount",
                 "has_revenue",
                 "has_customers",
                 "geography",
               ],
               properties: {
                 stage: { type: "string" },
                 sector: { type: "string" },
                 secondary_sectors: { type: "array", items: { type: "string" } },
                 keywords: { type: "array", items: { type: "string" } },
                 ask_amount: { type: "number" },
                 has_revenue: { type: "boolean" },
                 has_customers: { type: "boolean" },
                 geography: { type: "string" },
               },
             },
             sections: {
               type: "object",
               additionalProperties: false,
               required: [
                 "executive_summary",
                 "problem",
                 "solution",
                 "market",
                 "business_model",
                 "traction",
                 "competition",
                 "team",
                 "financials",
                 "risks",
                 "recommendation",
               ],
               properties: {
                 executive_summary: {
                   type: "object",
                   additionalProperties: false,
                   required: ["title", "content"],
                   properties: { title: { type: "string" }, content: { type: "string" } },
                 },
                 problem: {
                   type: "object",
                   additionalProperties: false,
                   required: ["title", "content"],
                   properties: { title: { type: "string" }, content: { type: "string" } },
                 },
                 solution: {
                   type: "object",
                   additionalProperties: false,
                   required: ["title", "content"],
                   properties: { title: { type: "string" }, content: { type: "string" } },
                 },
                 market: {
                   type: "object",
                   additionalProperties: false,
                   required: ["title", "content"],
                   properties: { title: { type: "string" }, content: { type: "string" } },
                 },
                 business_model: {
                   type: "object",
                   additionalProperties: false,
                   required: ["title", "content"],
                   properties: { title: { type: "string" }, content: { type: "string" } },
                 },
                 traction: {
                   type: "object",
                   additionalProperties: false,
                   required: ["title", "content"],
                   properties: { title: { type: "string" }, content: { type: "string" } },
                 },
                 competition: {
                   type: "object",
                   additionalProperties: false,
                   required: ["title", "content"],
                   properties: { title: { type: "string" }, content: { type: "string" } },
                 },
                 team: {
                   type: "object",
                   additionalProperties: false,
                   required: ["title", "content"],
                   properties: { title: { type: "string" }, content: { type: "string" } },
                 },
                 financials: {
                   type: "object",
                   additionalProperties: false,
                   required: ["title", "content"],
                   properties: { title: { type: "string" }, content: { type: "string" } },
                 },
                 risks: {
                   type: "object",
                   additionalProperties: false,
                   required: ["title", "content"],
                   properties: { title: { type: "string" }, content: { type: "string" } },
                 },
                 recommendation: {
                   type: "object",
                   additionalProperties: false,
                   required: ["title", "content"],
                   properties: { title: { type: "string" }, content: { type: "string" } },
                 },
               },
             },
             quick_facts: {
               type: "object",
               additionalProperties: false,
               required: [
                 "headquarters",
                 "founded",
                 "employees",
                 "funding_raised",
                 "current_raise",
                 "key_metrics",
               ],
               properties: {
                 headquarters: { type: "string" },
                 founded: { type: "string" },
                 employees: { type: "string" },
                 funding_raised: { type: "string" },
                 current_raise: { type: "string" },
                 key_metrics: { type: "array", items: { type: "string" } },
               },
             },
           },
         },
       },
     };

     try {
       const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
           model: 'google/gemini-3-flash-preview',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: contentParts }
          ],
           tools: [snapshotTool],
           tool_choice: { type: "function", function: { name: "create_investor_snapshot" } },
          temperature: 0.3,
           max_tokens: 3000,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error('AI API error:', aiResponse.status, errorText);
        
        if (aiResponse.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again in a few moments.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (aiResponse.status === 402) {
          return new Response(
            JSON.stringify({ error: 'AI credits exhausted. Please add funds to continue.' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        throw new Error(`AI API error: ${aiResponse.status}`);
      }

       const aiData = await aiResponse.json();
      console.log('AI response received in', Date.now() - startTime, 'ms');

       // Prefer tool-call output (guarantees JSON); fall back to prior parsing for safety.
       let memo: any;
       const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
       const toolArgs = toolCall?.function?.arguments;
       if (toolCall?.function?.name === "create_investor_snapshot" && typeof toolArgs === "string") {
         try {
           memo = JSON.parse(toolArgs);
         } catch (e) {
           console.error("Failed to parse tool arguments JSON:", e);
           throw new Error("Failed to parse memo structure");
         }
       } else {
         const responseContent = aiData.choices?.[0]?.message?.content;
         if (!responseContent) {
           throw new Error('No content in AI response');
         }

         try {
           let jsonStr = responseContent;
           const jsonMatch = responseContent.match(/```(?:json)?\s*([\s\S]*?)```/);
           if (jsonMatch) jsonStr = jsonMatch[1].trim();
           else {
             const objectMatch = responseContent.match(/\{[\s\S]*\}/);
             if (objectMatch) jsonStr = objectMatch[0];
           }
           jsonStr = jsonStr.trim();
           memo = JSON.parse(jsonStr);
         } catch (parseError) {
           console.error('Failed to parse AI response as JSON:', parseError);
           console.log('Raw response:', String(responseContent).substring(0, 1000));
           throw new Error('Failed to parse memo structure');
         }
       }

      console.log('Memo generated successfully for:', memo.company_name);

      return new Response(
        JSON.stringify({
          success: true,
          memo,
          processingTime: Date.now() - startTime
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('AI request timed out');
        return new Response(
          JSON.stringify({ error: 'Request timed out. The deck may be too complex. Please try again.' }),
          { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw fetchError;
    }

  } catch (error) {
    console.error('Error generating memo:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate memo' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
