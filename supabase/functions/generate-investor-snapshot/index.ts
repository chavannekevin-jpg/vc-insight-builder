import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Keep fast; the UI already has a short loading animation.
const AI_TIMEOUT_MS = 90_000;

async function inferDeckStageSector(params: { imagesToProcess: string[]; lovableApiKey: string }) {
  const tool = {
    type: "function",
    function: {
      name: "infer_kb_signals",
      description: "Infer stage and sector from the deck for lightweight matching/calibration.",
      parameters: {
        type: "object",
        additionalProperties: false,
        required: ["stage", "sector"],
        properties: {
          stage: { type: "string" },
          sector: { type: "string" },
        },
      },
    },
  };

  const contentParts: any[] = [
    {
      type: "text",
      text:
        "Look at this pitch deck and infer ONLY (1) venture stage (Pre-Seed|Seed|Series A|Series B|Later) and (2) primary sector. Be conservative; pick the closest fit.",
    },
  ];

  for (const url of params.imagesToProcess.slice(0, 4)) {
    contentParts.push({
      type: "image_url",
      image_url: { url, detail: "low" },
    });
  }

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.lovableApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: "You are a VC analyst. Return output ONLY via the tool call." },
        { role: "user", content: contentParts },
      ],
      tools: [tool],
      tool_choice: { type: "function", function: { name: "infer_kb_signals" } },
      temperature: 0.2,
    }),
  });

  if (!resp.ok) {
    return { stage: undefined as string | undefined, sector: undefined as string | undefined };
  }

  const json = await resp.json();
  const toolCall = json?.choices?.[0]?.message?.tool_calls?.[0];
  const args = toolCall?.function?.arguments;

  try {
    const parsed = typeof args === "string" ? JSON.parse(args) : args;
    return {
      stage: parsed?.stage as string | undefined,
      sector: parsed?.sector as string | undefined,
    };
  } catch {
    return { stage: undefined, sector: undefined };
  }
}

function withTimeout<T>(p: Promise<T>, ms: number) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  // @ts-ignore - Deno fetch supports AbortController, and we only use this for fetch below
  return { controller, promise: p.finally(() => clearTimeout(t)) };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await anonClient.auth.getUser(token);
    if (authError || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid authentication token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { fileBase64, fileName, imageUrls } = await req.json();

    let imagesToProcess: string[] = [];
    if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      imagesToProcess = imageUrls;
    } else if (fileBase64) {
      const pdfDataUrl = `data:application/pdf;base64,${fileBase64}`;
      imagesToProcess = [pdfDataUrl];
    } else {
      return new Response(JSON.stringify({ error: "File or image URLs are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fast, conservative stage/sector inference to anchor the snapshot.
    const inferred = await inferDeckStageSector({ imagesToProcess, lovableApiKey: LOVABLE_API_KEY });

    const snapshotTool = {
      type: "function",
      function: {
        name: "create_investor_snapshot",
        description: "Create an ultra-readable investor snapshot from a pitch deck.",
        parameters: {
          type: "object",
          additionalProperties: false,
          required: ["company_name", "tagline", "deal_quality", "debrief", "tags"],
          properties: {
            company_name: { type: "string" },
            tagline: { type: "string" },
            deal_quality: {
              type: "object",
              additionalProperties: false,
              required: ["score_0_100", "verdict"],
              properties: {
                score_0_100: { type: "number" },
                verdict: { type: "string" },
              },
            },
            debrief: { type: "string" },
            tags: {
              type: "object",
              additionalProperties: false,
              required: ["stage", "sector", "geography", "revenue", "ask", "traction_tags"],
              properties: {
                stage: { type: "string" },
                sector: { type: "string" },
                geography: { type: ["string", "null"] },
                revenue: {
                  type: "object",
                  additionalProperties: false,
                  required: ["is_pre_revenue", "amount", "metric", "currency"],
                  properties: {
                    is_pre_revenue: { type: "boolean" },
                    amount: { type: ["number", "null"] },
                    metric: { type: "string" },
                    currency: { type: ["string", "null"] },
                  },
                },
                ask: {
                  type: "object",
                  additionalProperties: false,
                  required: ["amount", "currency", "round_type"],
                  properties: {
                    amount: { type: ["number", "null"] },
                    currency: { type: ["string", "null"] },
                    round_type: { type: "string" },
                  },
                },
                traction_tags: {
                  type: "array",
                  items: { type: "string" },
                },
              },
            },
            key_strengths: {
              type: "array",
              items: { type: "string" },
            },
            key_risks: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
      },
    };

    const userContent: any[] = [
      {
        type: "text",
        text:
          `Create a lazy-investor snapshot: a super easy-to-read debrief.

Requirements:
- Debrief: 350–500 words total, plain language, short paragraphs, no fluff.
- Explain: what the company is, the theme, problem and solution, and a clear "deal quality" view.
- Deal quality: include BOTH a numeric score (0–100) and a one-sentence verdict.
- Extract tags:
  - Stage, Sector, Geography
  - Revenue signal: Pre-revenue vs revenue, and amount if stated (MRR/ARR/Revenue/etc)
  - Raise / Ask: amount + round type if stated
  - Traction tags: 5–10 short proof tags (customers, growth, pilots, LOIs, partnerships, etc.)
- Be conservative: if not stated in the deck, leave null/unknown rather than inventing.

Context:
- Inferred stage: ${inferred.stage ?? "Unknown"}
- Inferred sector: ${inferred.sector ?? "Unknown"}

Return ONLY via the tool call.`,
      },
    ];

    // Attach images (fast: a few pages are enough).
    for (const url of imagesToProcess.slice(0, 6)) {
      userContent.push({ type: "image_url", image_url: { url, detail: "low" } });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are a senior VC analyst. Optimize for clarity and speed. Never hallucinate numbers. Output ONLY through the tool call.",
          },
          { role: "user", content: userContent },
        ],
        tools: [snapshotTool],
        tool_choice: { type: "function", function: { name: "create_investor_snapshot" } },
        temperature: 0.3,
      }),
    });

    clearTimeout(timeout);

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage requires additional credits. Please add credits and try again." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const t = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson?.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall?.function?.arguments;

    let snapshot: any = null;
    try {
      snapshot = typeof args === "string" ? JSON.parse(args) : args;
    } catch {
      snapshot = null;
    }

    if (!snapshot) {
      return new Response(JSON.stringify({ error: "Invalid AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Lightweight normalization to avoid empty arrays / undefined values.
    snapshot.tags = snapshot.tags ?? {};
    snapshot.tags.traction_tags = Array.isArray(snapshot.tags.traction_tags) ? snapshot.tags.traction_tags : [];

    return new Response(
      JSON.stringify({
        success: true,
        snapshot,
        meta: {
          fileName: fileName ?? null,
          inferredStage: inferred.stage ?? null,
          inferredSector: inferred.sector ?? null,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const status = String(message).includes("aborted") ? 504 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
