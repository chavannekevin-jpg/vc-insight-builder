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

    // Build the comprehensive memo generation prompt
    const systemPrompt = `You are a senior VC investment analyst at a top-tier venture fund. Your task is to analyze this pitch deck and write a comprehensive investment memorandum.

CRITICAL INSTRUCTIONS:
- Write a COMPLETE investment memo, not bullet points or summaries
- Each section should be a well-crafted narrative paragraph (250-400 words)
- Use professional VC language and terminology
- Be analytical and critical - identify both strengths and concerns
- Include specific numbers, metrics, and facts from the deck when available
- If information is missing, note it as a gap

Return a JSON object with this EXACT structure:

{
  "company_name": "Company Name",
  "tagline": "One-line description of what the company does",
  "stage": "Pre-Seed|Seed|Series A|Series B|Later",
  "sector": "Primary sector/industry",
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

IMPORTANT: 
- Write in complete sentences and paragraphs, not bullet points
- Be analytical, not just descriptive
- Include specific numbers and facts from the deck
- Note when information is missing or unclear
- Each section should flow as professional prose`;

    // Prepare content for the API
    const contentParts: any[] = [
      { type: 'text', text: 'Please analyze this pitch deck and generate a comprehensive VC investment memorandum. Extract all relevant information and write detailed narrative sections.' }
    ];

    // Add the document/images
    for (const url of imagesToProcess.slice(0, 15)) {
      if (url.startsWith('data:application/pdf')) {
        // PDF data URL - send as file
        contentParts.push({
          type: "file",
          file: {
            url: url,
          }
        });
      } else {
        // Image URL
        contentParts.push({
          type: "image_url",
          image_url: { url, detail: "high" }
        });
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    try {
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-pro',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: contentParts }
          ],
          temperature: 0.3,
          max_tokens: 8000,
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

      const responseContent = aiData.choices?.[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No content in AI response');
      }

      // Parse the JSON response
      let memo;
      try {
        // Extract JSON from the response (handle markdown code blocks)
        let jsonStr = responseContent;
        const jsonMatch = responseContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonStr = jsonMatch[1];
        }
        memo = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
        console.log('Raw response:', responseContent.substring(0, 500));
        throw new Error('Failed to parse memo structure');
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
