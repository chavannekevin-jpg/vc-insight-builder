import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileBase64, fileName, fileType } = await req.json();

    if (!fileBase64 || !fileName) {
      return new Response(
        JSON.stringify({ error: 'No file data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing file: ${fileName}, type: ${fileType}, base64 length: ${fileBase64.length}`);

    // Determine content type from filename if not provided
    let contentType = fileType;
    if (!contentType || contentType === 'application/octet-stream') {
      if (fileName.endsWith('.xlsx')) contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      else if (fileName.endsWith('.xls')) contentType = 'application/vnd.ms-excel';
      else if (fileName.endsWith('.csv')) contentType = 'text/csv';
    }

    console.log(`Detected content type: ${contentType}`);

    // Build the AI prompt
    const systemPrompt = `You are an expert at extracting investor contact information from spreadsheets and documents.
Your task is to analyze the uploaded file and extract a list of investor contacts.

For each contact found, extract the following fields:
- name: The person's full name (required)
- organization_name: The fund, firm, or company name
- email: Email address
- phone: Phone number
- city: City location
- country: Country
- stages: Array of investment stages they focus on (e.g., ["Pre-Seed", "Seed", "Series A"])
- linkedin_url: LinkedIn profile URL
- fund_size: Fund size in millions (just the number)
- ticket_min: Minimum ticket size in thousands (just the number)
- ticket_max: Maximum ticket size in thousands (just the number)
- notes: Any additional relevant information

Return ONLY valid JSON in this exact format:
{
  "contacts": [
    {
      "name": "John Smith",
      "organization_name": "Acme Ventures",
      "email": "john@acme.vc",
      "phone": "+1 555 123 4567",
      "city": "San Francisco",
      "country": "USA",
      "stages": ["Seed", "Series A"],
      "linkedin_url": "https://linkedin.com/in/johnsmith",
      "fund_size": 100,
      "ticket_min": 50,
      "ticket_max": 500,
      "notes": "Focus on B2B SaaS"
    }
  ],
  "total_found": 1,
  "confidence": 0.9
}

Important rules:
- Only include contacts that appear to be investors, VCs, angels, or fund representatives
- Skip rows that are clearly headers or metadata
- If a field is not available, omit it or set to null
- For stages, normalize to: "Pre-Seed", "Seed", "Series A", "Series B+"
- Be thorough - extract ALL investor contacts you can find`;

    const userPrompt = `Please analyze this file and extract all investor contact information. The file is named "${fileName}".`;

    // Call AI API with authorization
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Calling AI API...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: userPrompt },
              { 
                type: 'image_url', 
                image_url: { url: `data:${contentType};base64,${fileBase64}` } 
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 8000,
        response_format: { type: 'json_object' }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content returned from AI');
    }

    console.log('AI response received, parsing...');

    // Parse the JSON response
    let parsed;
    try {
      // Clean up potential markdown code blocks
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      
      parsed = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI response as JSON');
    }

    console.log(`Extracted ${parsed.contacts?.length || 0} contacts`);

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error processing file:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process file' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
