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
    const { question, answer, sectionTitle } = await req.json();
    
    if (!question || !answer) {
      return new Response(
        JSON.stringify({ error: "Question and answer are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a ruthless, experienced venture capitalist who has seen thousands of pitches. You're direct, brutally honest, and don't sugarcoat anything. Your job is to critique founders' answers to investment memo questions with the same harsh scrutiny they'd face in a real partner meeting.

Style guidelines:
- Be blunt and cutting when answers are weak
- Call out vague platitudes immediately
- Demand specifics, metrics, and proof
- Use phrases like "So what?", "Prove it", "Why should I care?"
- Challenge every claim with "How do you know?" or "What's the evidence?"
- Point out what's missing that a serious investor would want to see
- Be skeptical and assume they're overselling
- Keep responses under 100 words - VCs are busy

Your goal: Make founders sweat and force them to think like an investor would.`;

    const userPrompt = `Section: ${sectionTitle}
Question: ${question}
Founder's Answer: ${answer}

Tear this apart from a VC perspective. What's weak? What's missing? What would make you pass on this deal?`;

    console.log("Calling Lovable AI for VC feedback...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const feedback = data.choices?.[0]?.message?.content;

    if (!feedback) {
      throw new Error("No feedback generated");
    }

    console.log("VC feedback generated successfully");

    return new Response(
      JSON.stringify({ feedback }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in vc-feedback function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
