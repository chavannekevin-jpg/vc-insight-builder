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
    const { prompt, sectionName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert AI prompt engineer specializing in investment memo generation. Your task is to optimize prompts for creating professional, well-formatted VC investment memos.

When optimizing prompts, focus on:
1. Clear structure and formatting instructions
2. Specific word counts and paragraph requirements
3. Professional tone and VC-appropriate language
4. Emphasis on metrics, traction, and concrete details
5. Instructions for proper markdown formatting (headings, bullet points, bold text)
6. Guidance on narrative flow and readability

Return ONLY the optimized prompt without any preambles or explanations.`;

    const userPrompt = `Optimize this prompt for the "${sectionName}" section of an investment memo:

${prompt}

Make it more effective for generating professional, well-formatted content that VCs would expect to see in an investment memorandum.`;

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
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error("Failed to optimize prompt");
    }

    const data = await response.json();
    const optimizedPrompt = data.choices?.[0]?.message?.content?.trim();

    if (!optimizedPrompt) {
      throw new Error("No optimized prompt returned");
    }

    return new Response(
      JSON.stringify({ optimizedPrompt }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in optimize-prompt function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
