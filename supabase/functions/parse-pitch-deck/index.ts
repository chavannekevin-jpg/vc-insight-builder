import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Confidence threshold for auto-filling
const CONFIDENCE_THRESHOLD = 0.6;

// Timeout for AI API call (120 seconds for larger files)
const AI_TIMEOUT_MS = 120000;

// Max file size for single file upload (20MB) - matching client-side limit
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

// Max size per image when processing multiple images (5MB each)
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

// Max number of images to process (to avoid CPU limits)
const MAX_IMAGES_TO_PROCESS = 12;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log('Starting deck parse request...');

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

    const { deckUrl, imageUrls, companyName, companyDescription } = await req.json();

    // Support both single deckUrl and multiple imageUrls
    const hasMultipleImages = Array.isArray(imageUrls) && imageUrls.length > 0;
    
    if (!deckUrl && !hasMultipleImages) {
      return new Response(
        JSON.stringify({ error: 'Deck URL or image URLs are required' }),
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

    console.log('Parsing pitch deck:', { 
      mode: hasMultipleImages ? 'multi-image' : 'single-file',
      imageCount: hasMultipleImages ? imageUrls.length : 1,
      companyName 
    });

    // Enhanced VC-grade system prompt for comprehensive extraction
    const systemPrompt = `You are a senior VC investment analyst at a top-tier venture fund. Your job is to extract EVERY piece of relevant information from pitch decks to build comprehensive investment memoranda.

CRITICAL: Extract ALL details you can find - numbers, names, percentages, dates, claims. VCs need specifics, not vague summaries.

VISUAL OCR PRIORITY - TEAM SLIDES: 
- Team slides typically show founder PHOTOS with their NAME and TITLE next to them
- READ the text overlaid on or next to each photo: "John Smith, CEO & Co-Founder"
- Extract YEARS OF EXPERIENCE mentioned (e.g., "18+ years", "10+ years")
- Extract SPECIALIZATIONS/EXPERTISE areas mentioned in their bio text
- CRITICALLY: Team slides often show COMPANY LOGOS at the bottom representing where founders previously worked (e.g., Novartis, Google, McKinsey, Goldman Sachs). NAME EVERY LOGO you can identify.
- DO NOT just summarize with "industry veterans" - extract the ACTUAL NAMES and DETAILS shown

Return a JSON object with this EXACT structure:

{
  "companyInfo": {
    "name": "exact company name",
    "description": "2-3 sentence description covering: what they do, for whom, and how",
    "stage": "Pre Seed|Seed|Series A|Series B",
    "category": "primary sector (SaaS, FinTech, HealthTech, DeepTech, Consumer, Marketplace, etc.)",
    "foundedYear": "year founded or null",
    "headquarters": "city/country or null",
    "website": "URL if visible or null"
  },
  "metrics": {
    "revenue": { "value": "exact figure with currency (e.g., '$50K MRR', '€2M ARR')", "period": "monthly/annual/total", "confidence": 0.0-1.0 },
    "users": { "value": "number (e.g., '10,000 users', '500 B2B customers')", "type": "users/customers/DAU/MAU", "confidence": 0.0-1.0 },
    "growth": { "value": "percentage or multiplier (e.g., '20% MoM', '3x YoY')", "metric": "what's growing", "confidence": 0.0-1.0 },
    "unitEconomics": { 
      "cac": "customer acquisition cost or null",
      "ltv": "lifetime value or null", 
      "ltvCacRatio": "ratio or null",
      "grossMargin": "percentage or null",
      "churn": "monthly/annual churn rate or null",
      "confidence": 0.0-1.0 
    },
    "funding": {
      "raising": "amount being raised (e.g., '$2M')",
      "valuation": "pre/post-money valuation if stated",
      "previousRounds": "prior funding raised",
      "notableInvestors": ["list of named investors"],
      "confidence": 0.0-1.0
    }
  },
    "team": {
    "founders": [
      { "name": "full name (READ FROM IMAGE - look for names next to photos)", "role": "title (CEO, CTO, Co-Founder, etc.)", "background": "years of experience, specializations, previous companies they worked at (extract ALL company logos visible), countries/regions of experience" }
    ],
    "teamSize": "total employees or null",
    "keyHires": "notable team members beyond founders",
    "advisors": "advisory board members if mentioned",
    "previousCompanyLogos": ["list ALL company/brand logos visible on team slides - these indicate where founders worked (e.g., 'Novartis', 'GSK', 'Pfizer', 'SAP', 'Google', etc.)"],
    "confidence": 0.0-1.0
  },
  "extractedSections": {
    "problem_core": { 
      "content": "DETAILED extraction: What specific problem? Who has it (be specific about persona)? How painful is it (quantify if possible)? What's the cost of the status quo? Any customer quotes or validation? Market timing - why now?", 
      "confidence": 0.0-1.0 
    },
    "solution_core": { 
      "content": "DETAILED extraction: What is the product exactly? Key features and how they work. What makes it 10x better than alternatives? Any technical innovation or IP? Demo screenshots/flow if described. Integration capabilities.", 
      "confidence": 0.0-1.0 
    },
    "target_customer": { 
      "content": "DETAILED extraction: Ideal Customer Profile - industry, company size, job titles, geography. TAM/SAM/SOM with methodology if provided. Market trends and tailwinds. Why these customers will pay.", 
      "confidence": 0.0-1.0 
    },
    "competitive_moat": { 
      "content": "DETAILED extraction: Named competitors and their weaknesses. Company's unfair advantages (network effects, data moat, switching costs, brand, tech, team, speed). Defensibility over time. Positioning matrix if shown.", 
      "confidence": 0.0-1.0 
    },
    "business_model": { 
      "content": "DETAILED extraction: Revenue model (subscription, usage, transaction, etc.). Pricing tiers and amounts. Sales motion (PLG, sales-led, hybrid). Unit economics deep dive. Path to profitability.", 
      "confidence": 0.0-1.0 
    },
    "traction_proof": { 
      "content": "DETAILED extraction: ALL metrics mentioned - revenue, users, growth rates, NPS, retention, engagement. Key milestones with dates. Logo customers (name them). Partnerships. Press/awards. Product launches.", 
      "confidence": 0.0-1.0 
    },
    "team_story": { 
      "content": "CRITICAL - MUST EXTRACT FROM IMAGES: Look at EVERY slide for team/founder photos with names next to them. Extract: (1) Each founder's FULL NAME as shown in the image, (2) Their exact title (CEO, CTO, COO, Co-Founder), (3) Years of experience mentioned, (4) Their specialization/expertise, (5) Countries/regions they've worked in, (6) ALL company logos shown on team slides (these are previous employers - name every logo you can identify like 'Novartis', 'Google', 'McKinsey', etc.). This is a VISUAL extraction task - read the text overlaid on founder photos.", 
      "confidence": 0.0-1.0 
    },
    "vision_ask": { 
      "content": "DETAILED extraction: Funding amount requested. Use of funds breakdown (% to engineering, sales, etc.). Key milestones for this round. 18-month roadmap. Long-term vision and exit potential.", 
      "confidence": 0.0-1.0 
    }
  },
  "redFlags": ["any concerns a VC might have based on the deck"],
  "strengths": ["clear strengths that would excite an investor"],
  "summary": "3-4 sentence executive summary: what they do, key traction, why it's investable, and what makes it unique"
}

CONFIDENCE SCORING:
- 0.9-1.0: Explicitly stated with specific numbers/facts
- 0.7-0.8: Clearly shown/implied, can confidently extract
- 0.5-0.6: Partially available, some inference needed
- 0.3-0.4: Limited context, educated guess
- 0.0-0.2: Not found or highly speculative

EXTRACTION RULES:
1. ALWAYS include specific numbers when visible (don't round or generalize)
2. Name drop - include company names, investor names, customer logos
3. If a metric is shown in a chart, describe what the chart shows
4. Extract dates and timelines when available
5. For missing critical info, set to null but note in redFlags what's missing
6. Be comprehensive - VCs read between the lines, you should too`;

    let messages: any[] = [];

    if (hasMultipleImages) {
      // Limit number of images to avoid CPU limits - take first N slides (most important info)
      const imagesToProcess = imageUrls.slice(0, MAX_IMAGES_TO_PROCESS);
      console.log(`Processing ${imagesToProcess.length} of ${imageUrls.length} images (limit: ${MAX_IMAGES_TO_PROCESS})`);
      
      // Fetch all images in parallel for speed
      const imagePromises = imagesToProcess.map(async (url: string, i: number) => {
        try {
          console.log(`Fetching image ${i + 1}/${imagesToProcess.length}`);
          const imageResponse = await fetch(url);
          if (!imageResponse.ok) {
            console.warn(`Failed to fetch image ${i + 1}:`, imageResponse.status);
            return null;
          }
          
          const imageBuffer = await imageResponse.arrayBuffer();
          const imageSize = imageBuffer.byteLength;
          
          if (imageSize > MAX_IMAGE_SIZE_BYTES) {
            console.warn(`Image ${i + 1} too large (${imageSize} bytes), skipping`);
            return null;
          }
          
          const base64Image = base64Encode(imageBuffer);
          const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
          
          console.log(`Processed image ${i + 1}, size: ${imageSize} bytes`);
          return {
            index: i,
            content: {
              type: 'image_url',
              image_url: { url: `data:${contentType};base64,${base64Image}` }
            }
          };
        } catch (imgError) {
          console.error(`Error processing image ${i + 1}:`, imgError);
          return null;
        }
      });
      
      const results = await Promise.all(imagePromises);
      
      // Filter out failed fetches and sort by original index
      const validImages = results
        .filter((r): r is { index: number; content: any } => r !== null)
        .sort((a, b) => a.index - b.index)
        .map(r => r.content);
      
      console.log(`Successfully loaded ${validImages.length} images`);
      
      if (validImages.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Failed to load any images from the deck' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const imageContent: any[] = [
        {
          type: 'text',
          text: `Analyze these ${validImages.length} pitch deck slides (first ${MAX_IMAGES_TO_PROCESS} of ${imageUrls.length} total) and extract all relevant startup information. ${companyName ? `The company is called "${companyName}".` : ''} ${companyDescription ? `Context: ${companyDescription}` : ''}`
        },
        ...validImages
      ];
      
      messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: imageContent }
      ];
      
    } else {
      // Process single file (original flow)
      const deckResponse = await fetch(deckUrl);
      if (!deckResponse.ok) {
        console.error('Failed to fetch deck:', deckResponse.status);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch deck file' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const contentType = deckResponse.headers.get('content-type') || '';
      const isImage = contentType.startsWith('image/');
      const isPDF = contentType.includes('pdf');

      console.log('Content type detected:', contentType, { isImage, isPDF });

      // Check file size before loading into memory
      const contentLength = deckResponse.headers.get('content-length');
      const fileSizeBytes = contentLength ? parseInt(contentLength) : 0;
      const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(1);
      
      if (fileSizeBytes > MAX_FILE_SIZE_BYTES) {
        console.error('File too large:', fileSizeBytes, 'bytes');
        return new Response(
          JSON.stringify({ 
            error: `File too large (${fileSizeMB}MB). Maximum size is 20MB. For larger decks, try compressing the PDF or reducing image quality.`,
            fileSizeMB: parseFloat(fileSizeMB),
            maxSizeMB: 20
          }),
          { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Read file as binary
      const fileBuffer = await deckResponse.arrayBuffer();
      const fileSize = fileBuffer.byteLength;
      
      console.log('File size:', fileSize, 'bytes (~', Math.round(fileSize / 1024), 'KB)');
      
      // Double-check file size after download
      if (fileSize > MAX_FILE_SIZE_BYTES) {
        const actualSizeMB = (fileSize / (1024 * 1024)).toFixed(1);
        console.error('File too large after download:', fileSize, 'bytes');
        return new Response(
          JSON.stringify({ 
            error: `File too large (${actualSizeMB}MB). Maximum size is 20MB.`,
            fileSizeMB: parseFloat(actualSizeMB),
            maxSizeMB: 20
          }),
          { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const encodeStart = Date.now();
      const base64Content = base64Encode(fileBuffer);
      console.log(`Base64 encoding took ${Date.now() - encodeStart}ms`);

      if (isImage) {
        const mimeType = contentType || 'image/png';
        console.log('Processing as image:', mimeType);

        messages = [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this pitch deck slide/image and extract all relevant startup information. ${companyName ? `The company is called "${companyName}".` : ''} ${companyDescription ? `Context: ${companyDescription}` : ''}`
              },
              {
                type: 'image_url',
                image_url: { url: `data:${mimeType};base64,${base64Content}` }
              }
            ]
          }
        ];
      } else if (isPDF) {
        console.log('Processing as PDF document');

        // Gemini requires PDFs to be sent as 'file' type, not 'image_url'
        messages = [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this pitch deck PDF and extract all relevant startup information. ${companyName ? `The company is called "${companyName}".` : ''} ${companyDescription ? `Context: ${companyDescription}` : ''}`
              },
              {
                type: 'file',
                file: { 
                  url: `data:application/pdf;base64,${base64Content}` 
                }
              }
            ]
          }
        ];
      } else {
        console.log('Processing as other format (limited support)');
        const textContent = new TextDecoder().decode(fileBuffer);
        
        messages = [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Analyze this pitch deck content and extract all relevant startup information. ${companyName ? `The company is called "${companyName}".` : ''} ${companyDescription ? `Context: ${companyDescription}` : ''}

Note: This file format may have limited extraction capability. Extract what you can.

Deck content:
${textContent.substring(0, 50000)}`
          }
        ];
      }
    }

    console.log('Sending to AI for analysis...');
    const aiStart = Date.now();

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    let aiResponse;
    try {
      aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-pro',
          messages,
          response_format: { type: 'json_object' },
          temperature: 0.3
        }),
        signal: controller.signal
      });
    } catch (fetchError: unknown) {
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('AI request timed out after', AI_TIMEOUT_MS, 'ms');
        return new Response(
          JSON.stringify({ error: 'Analysis timed out. Try uploading a smaller file or fewer pages.' }),
          { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }

    console.log(`AI analysis took ${Date.now() - aiStart}ms`);

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service credits exhausted.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI analysis failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'No analysis generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response
    let parsedContent;
    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedContent = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse analysis results' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Count high-confidence extractions
    const highConfidenceCount = Object.values(parsedContent.extractedSections || {})
      .filter((section: any) => section.confidence >= CONFIDENCE_THRESHOLD && section.content)
      .length;

    const totalTime = Date.now() - startTime;
    console.log(`Successfully parsed pitch deck in ${totalTime}ms. High confidence extractions: ${highConfidenceCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: parsedContent,
        confidenceThreshold: CONFIDENCE_THRESHOLD,
        highConfidenceCount,
        processingTimeMs: totalTime
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in parse-pitch-deck:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
