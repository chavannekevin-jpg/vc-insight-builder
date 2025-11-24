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
    const { company, responses } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Enhance each response using AI
    const enhanced: Record<string, string> = {};

    for (const [key, content] of Object.entries(responses)) {
      if (!content || typeof content !== "string" || content.trim().length === 0) {
        continue;
      }

      const prompt = `You are a professional VC memo writer. Enhance the following startup response to be more concise, impactful, and professional while maintaining the core message. Keep it under 150 words. Return ONLY the enhanced text, no explanations or preambles.

Context: This is for "${key}" section in a VC investment memo for ${company.name} (${company.stage} stage, ${company.category} category).

Original response:
${content}

Enhanced version:`;

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
              content: "You are a professional VC memo writer. Enhance startup responses to be concise, impactful, and professional.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AI API error for ${key}:`, response.status, errorText);
        continue; // Skip this one, keep original
      }

      const data = await response.json();
      const enhancedText = data.choices?.[0]?.message?.content?.trim();

      if (enhancedText) {
        enhanced[key] = enhancedText;
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
