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
    const { company, sections } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const enhanced: Record<string, string> = {};

    // Process each section
    for (const [sectionName, sectionResponses] of Object.entries(sections)) {
      if (!sectionResponses || typeof sectionResponses !== "object") {
        continue;
      }

      // Combine all responses in the section
      const combinedContent = Object.values(sectionResponses as Record<string, string>)
        .filter(Boolean)
        .join("\n\n");

      if (!combinedContent.trim()) {
        continue;
      }

      const prompt = `You are a professional VC investment memo writer. Take the following startup information for the "${sectionName}" section and create a clear, concise, and compelling narrative. 

Requirements:
- Synthesize all the information into a cohesive 2-4 paragraph narrative
- Use professional, direct language that VCs expect
- Highlight key metrics, traction, and competitive advantages
- Keep it between 150-250 words
- Focus on facts and concrete details
- Return ONLY the enhanced narrative, no preambles or explanations

Context: ${company.name} is a ${company.stage} stage ${company.category || "startup"}.

Raw information:
${combinedContent}

Professional memo section:`;

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
              role: "system",
              content: "You are a professional VC investment memo writer. Create clear, concise, compelling narratives from startup information.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AI API error for ${sectionName}:`, response.status, errorText);
        continue;
      }

      const data = await response.json();
      const enhancedText = data.choices?.[0]?.message?.content?.trim();

      if (enhancedText) {
        enhanced[sectionName] = enhancedText;
      }
    }

    return new Response(JSON.stringify({ enhanced }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in enhance-memo function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
