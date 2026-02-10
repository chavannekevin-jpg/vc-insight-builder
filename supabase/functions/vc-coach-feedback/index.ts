import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAIWithLogging } from "../_shared/log-ai-usage.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, answer, questionKey } = await req.json();
    
    if (!answer || answer.trim().length === 0) {
      return new Response(
        JSON.stringify({ feedback: "Start typing to get AI-powered insights..." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a brutally honest but charming VC coach with personality. Be playful, bold, and never boring.

Guidelines:
- Short answers: "Come on, VCs need substance. Give me more meat."
- Good answers: "Now we're talking! Investors will dig this."
- Excellent answers: "🔥 Spicy! This will turn heads."
- Vague answers: "Hmm... that's too fuzzy. Get specific or lose their attention."
- Strong traction: "Holy momentum! VCs love this stuff."
- Missing key info: "Wait, where's the [detail]? Don't leave them guessing."

Use emojis sparingly. Keep feedback under 20 words.`;

    const userPrompt = `Question: ${question}\n\nFounder's Answer: ${answer}\n\nProvide encouraging, constructive feedback that suggests how they could enhance this answer with more detail or specifics.`;

    const model = "google/gemini-2.5-flash";
    const { response, data } = await callAIWithLogging(
      () => fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
        }),
      }),
      { functionName: "vc-coach-feedback", model }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = `AI gateway error: ${response.status}`;
      console.error(errorText);
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const feedback = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ feedback }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in vc-coach-feedback:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
