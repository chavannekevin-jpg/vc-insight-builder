import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Confidence threshold for auto-filling
const CONFIDENCE_THRESHOLD = 0.6;

// Timeout for AI API call (90 seconds)
const AI_TIMEOUT_MS = 90000;

// Max file size for single file upload (10MB) - reduced for memory safety
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

// Max size per image when processing multiple images (3MB each)
const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024;

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

    // System prompt with EXACT questionnaire keys
    const systemPrompt = `You are an expert VC analyst who extracts structured information from pitch decks. 
Analyze the provided pitch deck and extract as much relevant information as possible.

Return a JSON object with the following structure. Use these EXACT keys:
{
  "companyInfo": {
    "name": "extracted company name or null",
    "description": "one-paragraph company description",
    "stage": "Pre Seed|Seed|Series A",
    "category": "industry/sector like SaaS, FinTech, HealthTech, etc."
  },
  "extractedSections": {
    "problem_core": { 
      "content": "What specific problem does this company solve? Who suffers from it and how much does it hurt? Include any evidence of problem validation if available.", 
      "confidence": 0.0-1.0 
    },
    "solution_core": { 
      "content": "How does the product/service solve the problem? What makes it unique or different from alternatives? Include demo/product details if available.", 
      "confidence": 0.0-1.0 
    },
    "target_customer": { 
      "content": "Who is the ideal customer? Include demographics, market size (TAM/SAM/SOM), and why now is the right time for this solution.", 
      "confidence": 0.0-1.0 
    },
    "competitive_moat": { 
      "content": "Who are the competitors and what is the company's competitive advantage? What's the moat or unfair advantage that makes them hard to copy?", 
      "confidence": 0.0-1.0 
    },
    "business_model": { 
      "content": "How does the company make money? Include revenue model, pricing, unit economics (CAC, LTV, margins) if available.", 
      "confidence": 0.0-1.0 
    },
    "traction_proof": { 
      "content": "What proof of progress exists? Include current users, revenue, growth metrics, key milestones achieved, and notable wins.", 
      "confidence": 0.0-1.0 
    },
    "team_story": { 
      "content": "Who are the founders and key team members? What's their background and why are they uniquely suited to solve this problem?", 
      "confidence": 0.0-1.0 
    },
    "vision_ask": { 
      "content": "What's the big vision and where is the company going? Include funding ask, use of funds, and key milestones planned.", 
      "confidence": 0.0-1.0 
    }
  },
  "summary": "2-3 sentence executive summary of the company"
}

CONFIDENCE SCORING GUIDELINES:
- 0.9-1.0: Information is explicitly and clearly stated in the deck
- 0.7-0.8: Information is clearly implied or can be confidently inferred
- 0.5-0.6: Information is partially available or requires some inference
- 0.3-0.4: Educated guess based on limited context
- 0.0: No relevant information found (set content to null)

Be thorough but accurate. Only extract what you can actually find or reasonably infer.
For missing information, set content to null and confidence to 0.`;

    let messages: any[] = [];

    if (hasMultipleImages) {
      // Process multiple images (from client-side PDF conversion)
      console.log('Processing', imageUrls.length, 'images from client-side conversion');
      
      const imageContent: any[] = [
        {
          type: 'text',
          text: `Analyze these ${imageUrls.length} pitch deck slides and extract all relevant startup information. ${companyName ? `The company is called "${companyName}".` : ''} ${companyDescription ? `Context: ${companyDescription}` : ''}`
        }
      ];
      
      // Fetch and encode each image
      for (let i = 0; i < imageUrls.length; i++) {
        const url = imageUrls[i];
        console.log(`Fetching image ${i + 1}/${imageUrls.length}`);
        
        try {
          const imageResponse = await fetch(url);
          if (!imageResponse.ok) {
            console.warn(`Failed to fetch image ${i + 1}:`, imageResponse.status);
            continue;
          }
          
          const imageBuffer = await imageResponse.arrayBuffer();
          const imageSize = imageBuffer.byteLength;
          
          // Skip images that are too large
          if (imageSize > MAX_IMAGE_SIZE_BYTES) {
            console.warn(`Image ${i + 1} too large (${imageSize} bytes), skipping`);
            continue;
          }
          
          const base64Image = base64Encode(imageBuffer);
          const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
          
          imageContent.push({
            type: 'image_url',
            image_url: { url: `data:${contentType};base64,${base64Image}` }
          });
          
          console.log(`Added image ${i + 1}, size: ${imageSize} bytes`);
        } catch (imgError) {
          console.error(`Error processing image ${i + 1}:`, imgError);
        }
      }
      
      if (imageContent.length === 1) {
        // Only the text prompt, no images loaded
        return new Response(
          JSON.stringify({ error: 'Failed to load any images from the deck' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
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
            error: `File too large (${fileSizeMB}MB). Maximum size is 10MB for direct upload. For larger decks, please use a supported format that enables client-side conversion.`,
            fileSizeMB: parseFloat(fileSizeMB),
            maxSizeMB: 10
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
            error: `File too large (${actualSizeMB}MB). Maximum size is 10MB.`,
            fileSizeMB: parseFloat(actualSizeMB),
            maxSizeMB: 10
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
                type: 'image_url',
                image_url: { url: `data:application/pdf;base64,${base64Content}` }
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
          model: 'google/gemini-2.5-flash',
          messages,
          response_format: { type: 'json_object' }
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
