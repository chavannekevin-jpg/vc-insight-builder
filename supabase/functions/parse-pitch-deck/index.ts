import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const QUESTION_MAPPINGS = {
  problem: 'problem_statement',
  solution: 'solution_description',
  market: 'target_market',
  business_model: 'business_model',
  competition: 'competitive_landscape',
  team: 'team_background',
  traction: 'traction_metrics',
  financials: 'financial_projections',
  ask: 'funding_ask',
  vision: 'company_vision',
  moat: 'competitive_moat',
  gtm: 'go_to_market',
};

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

    const systemPrompt = `You are an expert VC analyst who extracts structured information from pitch decks. 
Analyze the provided pitch deck and extract as much relevant information as possible.

Return a JSON object with the following structure:
{
  "companyInfo": {
    "name": "extracted company name or null",
    "description": "one-paragraph company description",
    "stage": "Pre-Seed|Seed|Series A|Series B|Growth",
    "category": "industry/sector"
  },
  "extractedSections": {
    "problem_statement": { "content": "extracted content", "confidence": 0.0-1.0 },
    "solution_description": { "content": "extracted content", "confidence": 0.0-1.0 },
    "target_market": { "content": "TAM/SAM/SOM and target customer info", "confidence": 0.0-1.0 },
    "business_model": { "content": "how they make money", "confidence": 0.0-1.0 },
    "competitive_landscape": { "content": "competitors and differentiation", "confidence": 0.0-1.0 },
    "team_background": { "content": "founder/team info", "confidence": 0.0-1.0 },
    "traction_metrics": { "content": "current traction, users, revenue", "confidence": 0.0-1.0 },
    "financial_projections": { "content": "financial forecasts if available", "confidence": 0.0-1.0 },
    "funding_ask": { "content": "how much they're raising and use of funds", "confidence": 0.0-1.0 },
    "company_vision": { "content": "long-term vision", "confidence": 0.0-1.0 },
    "competitive_moat": { "content": "defensibility and moats", "confidence": 0.0-1.0 },
    "go_to_market": { "content": "GTM strategy", "confidence": 0.0-1.0 }
  },
  "summary": "2-3 sentence executive summary of the company"
}

For each section:
- Set confidence to 0.9+ if explicitly stated in the deck
- Set confidence to 0.6-0.8 if inferred from context
- Set confidence to 0.3-0.5 if making educated guesses
- Set content to null and confidence to 0 if no relevant information found

Be thorough but accurate. Only extract what you can actually find or reasonably infer.`;

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
      // For PDFs, we'll need to inform the user about limitations
      // In a production app, you'd use a PDF parsing service first
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

    console.log('Successfully parsed pitch deck');

    return new Response(
      JSON.stringify({
        success: true,
        data: parsedContent
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
