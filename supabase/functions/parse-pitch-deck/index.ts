import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Confidence threshold for auto-filling
const CONFIDENCE_THRESHOLD = 0.6;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { deckUrl, companyName, companyDescription } = await req.json();

    if (!deckUrl) {
      return new Response(
        JSON.stringify({ error: 'Deck URL is required' }),
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

    console.log('Parsing pitch deck:', { deckUrl, companyName });

    // Fetch the deck content
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

    let messages: any[] = [];

    // System prompt with EXACT questionnaire keys
    const systemPrompt = `You are an expert VC analyst who extracts structured information from pitch decks. 
Analyze the provided pitch deck and extract as much relevant information as possible.

Return a JSON object with the following structure. Use these EXACT keys:
{
  "companyInfo": {
    "name": "extracted company name or null",
    "description": "one-paragraph company description",
    "stage": "Pre-Seed|Seed|Series A|Series B|Growth",
    "category": "industry/sector like SaaS, FinTech, HealthTech, etc."
  },
  "extractedSections": {
    "problem_description": { "content": "What problem does this company solve? Who suffers from it?", "confidence": 0.0-1.0 },
    "problem_validation": { "content": "Evidence that this problem is real and painful", "confidence": 0.0-1.0 },
    "solution_description": { "content": "How does the product/service solve the problem?", "confidence": 0.0-1.0 },
    "solution_demo": { "content": "Description of product demo, screenshots, or how it works", "confidence": 0.0-1.0 },
    "market_size": { "content": "TAM/SAM/SOM analysis, market size data", "confidence": 0.0-1.0 },
    "market_timing": { "content": "Why is now the right time for this solution?", "confidence": 0.0-1.0 },
    "target_customer": { "content": "Ideal customer profile, who pays for this?", "confidence": 0.0-1.0 },
    "competitors": { "content": "Competitive landscape, who else is solving this?", "confidence": 0.0-1.0 },
    "competitive_advantage": { "content": "What's the moat? Why can't competitors copy this?", "confidence": 0.0-1.0 },
    "founder_background": { "content": "Founder credentials, why are they suited to solve this?", "confidence": 0.0-1.0 },
    "team_composition": { "content": "Team members, their roles and backgrounds", "confidence": 0.0-1.0 },
    "revenue_model": { "content": "How does the company make money?", "confidence": 0.0-1.0 },
    "unit_economics": { "content": "CAC, LTV, margins, pricing structure", "confidence": 0.0-1.0 },
    "current_traction": { "content": "Current users, revenue, growth metrics, proof of traction", "confidence": 0.0-1.0 },
    "key_milestones": { "content": "Past achievements and future milestones planned", "confidence": 0.0-1.0 }
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

    if (isImage) {
      // For images, use vision capability
      const imageBuffer = await deckResponse.arrayBuffer();
      const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
      const mimeType = contentType || 'image/png';

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
              image_url: { url: `data:${mimeType};base64,${base64Image}` }
            }
          ]
        }
      ];
    } else if (isPDF) {
      const textContent = await deckResponse.text();
      
      messages = [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Analyze this pitch deck content and extract all relevant startup information. ${companyName ? `The company is called "${companyName}".` : ''} ${companyDescription ? `Context: ${companyDescription}` : ''}

Deck content:
${textContent.substring(0, 50000)}`
        }
      ];
    } else {
      // For PPTX or other formats
      const textContent = await deckResponse.text();
      
      messages = [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Analyze this pitch deck content and extract all relevant startup information. ${companyName ? `The company is called "${companyName}".` : ''} ${companyDescription ? `Context: ${companyDescription}` : ''}

Deck content:
${textContent.substring(0, 50000)}`
        }
      ];
    }

    console.log('Sending to AI for analysis...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
    });

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
      // Clean up potential markdown formatting
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

    console.log(`Successfully parsed pitch deck. High confidence extractions: ${highConfidenceCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: parsedContent,
        confidenceThreshold: CONFIDENCE_THRESHOLD,
        highConfidenceCount
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
