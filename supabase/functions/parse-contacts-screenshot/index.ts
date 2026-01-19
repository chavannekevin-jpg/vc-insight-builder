import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const extractionPrompt = `You are an expert at extracting investor/contact information from screenshots of databases, spreadsheets, and investor lists.

Analyze this screenshot and extract ALL contacts/investors you can identify. For each contact, extract:
- name: Full name of the person
- organization: Company, fund, or organization name
- email: Email address if visible
- phone: Phone number if visible
- city: City location if visible
- country: Country if visible
- linkedin_url: LinkedIn URL if visible
- role: Their role/title if visible
- investment_focus: Investment sectors/focus areas if visible
- stages: Investment stages (Pre-seed, Seed, Series A, etc.) if visible

Return a JSON array of contacts. Each contact should have the fields above (use null for missing fields).
Only return the JSON array, no other text. Example format:
[
  {
    "name": "John Smith",
    "organization": "Acme Ventures",
    "email": "john@acme.vc",
    "phone": null,
    "city": "San Francisco",
    "country": "USA",
    "linkedin_url": "https://linkedin.com/in/johnsmith",
    "role": "Partner",
    "investment_focus": ["SaaS", "Fintech"],
    "stages": ["Seed", "Series A"]
  }
]

If you cannot identify any contacts, return an empty array: []
Be thorough - extract every visible contact from the screenshot.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: extractionPrompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType || 'image/png'};base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "[]";
    
    // Parse the JSON from the AI response
    let contacts = [];
    try {
      // Try to extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        contacts = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.log("Raw content:", content);
    }

    // Transform to the format expected by the frontend
    const extractedContacts = contacts.map((contact: any, index: number) => ({
      id: `screenshot-${Date.now()}-${index}`,
      name: contact.name || null,
      organization: contact.organization || null,
      email: contact.email || null,
      phone: contact.phone || null,
      city: contact.city || null,
      country: contact.country || null,
      linkedin_url: contact.linkedin_url || null,
      role: contact.role || null,
      investment_focus: contact.investment_focus || null,
      stages: contact.stages || null,
    }));

    return new Response(
      JSON.stringify({ 
        contacts: extractedContacts,
        count: extractedContacts.length 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error processing screenshot:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process screenshot";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
