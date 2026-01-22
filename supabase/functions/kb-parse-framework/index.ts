import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_TIMEOUT_MS = 120000;
const MAX_PDF_BYTES = 20 * 1024 * 1024;

function base64Encode(bytes: Uint8Array): string {
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

type ExtractionConfidence = "high" | "medium" | "low";

type KBFrameworkRow = {
  geography_scope?: string;
  region?: string | null;
  sector?: string | null;
  title?: string | null;
  summary: string;
  key_points?: string[] | null;
  tags?: string[] | null;
};

type ExtractedFramework = {
  meta?: {
    title?: string | null;
    publisher?: string | null;
    geography_scope?: string | null;
    region?: string | null;
    publication_date?: string | null; // ISO date
  };
  confidence: ExtractionConfidence;
  frameworks: KBFrameworkRow[];
  extraction_notes?: string | null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startTime = Date.now();

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const { data: userData, error: userErr } = await anonClient.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid authentication token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Admin gate (KB is admin-only write)
    const { data: adminRole } = await serviceClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminRole) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { sourceId } = await req.json();
    if (!sourceId || typeof sourceId !== "string") {
      return new Response(JSON.stringify({ error: "sourceId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: source, error: sourceErr } = await serviceClient
      .from("kb_sources")
      .select("id, source_type, content_kind, title, publisher, storage_path, geography_scope")
      .eq("id", sourceId)
      .maybeSingle();

    if (sourceErr || !source) {
      return new Response(JSON.stringify({ error: "Source not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (source.content_kind !== "framework") {
      return new Response(JSON.stringify({ error: "Source is not a framework" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (source.source_type !== "pdf_upload") {
      return new Response(JSON.stringify({ error: "Only pdf_upload sources are supported" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!source.storage_path) {
      return new Response(JSON.stringify({ error: "storage_path missing on source" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: file, error: downloadErr } = await serviceClient.storage
      .from("kb-reports")
      .download(source.storage_path);

    if (downloadErr || !file) {
      return new Response(JSON.stringify({ error: downloadErr?.message || "Failed to download PDF" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pdfBytes = new Uint8Array(await file.arrayBuffer());
    if (pdfBytes.byteLength > MAX_PDF_BYTES) {
      return new Response(JSON.stringify({ error: "PDF too large (max 20MB)" }), {
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

    const systemPrompt = `You extract VC frameworks and methodologies from PDF documents.

Return ONLY via the provided tool call.

Rules:
- Extract frameworks as freeform, actionable methodology summaries (not numeric benchmarks).
- Be grounded in the document; do NOT invent facts.
- If sector is clearly implied, set sector; otherwise keep sector null.
- Prefer multiple concise frameworks over one huge blob when the PDF contains multiple sections.
- summary should be written so it can be pasted into an investor memo prompt as guidance (what to check, how to reason, typical failure modes).`;

    const pdfBase64 = base64Encode(pdfBytes);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Extract frameworks/methodologies from this PDF.

Title hint: ${source.title ?? "(unknown)"}
Publisher hint: ${source.publisher ?? "(unknown)"}`,
              },
              {
                type: "image_url",
                image_url: { url: `data:application/pdf;base64,${pdfBase64}` },
              },
            ],
          },
        ],
        temperature: 0.2,
        max_tokens: 8000,
        tools: [
          {
            type: "function",
            function: {
              name: "extract_framework",
              description: "Extract framework summaries and metadata from a VC framework PDF.",
              parameters: {
                type: "object",
                additionalProperties: false,
                required: ["confidence", "frameworks"],
                properties: {
                  meta: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      title: { type: "string", nullable: true },
                      publisher: { type: "string", nullable: true },
                      geography_scope: { type: "string", nullable: true },
                      region: { type: "string", nullable: true },
                      publication_date: { type: "string", nullable: true },
                    },
                  },
                  confidence: { type: "string", enum: ["high", "medium", "low"] },
                  extraction_notes: { type: "string", nullable: true },
                  frameworks: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      required: ["summary"],
                      properties: {
                        geography_scope: { type: "string", nullable: true },
                        region: { type: "string", nullable: true },
                        sector: { type: "string", nullable: true },
                        title: { type: "string", nullable: true },
                        summary: { type: "string" },
                        key_points: {
                          type: "array",
                          items: { type: "string" },
                          nullable: true,
                        },
                        tags: {
                          type: "array",
                          items: { type: "string" },
                          nullable: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_framework" } },
        signal: controller.signal,
      }),
    });

    clearTimeout(timeoutId);

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI extraction failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResp.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const argsStr = toolCall?.function?.arguments;
    if (!argsStr) throw new Error("AI did not return structured extraction");

    const extracted = JSON.parse(argsStr) as ExtractedFramework;

    const geo = extracted.meta?.geography_scope || source.geography_scope || "Europe";

    // Replace previous extraction for this source
    await serviceClient.from("kb_frameworks").delete().eq("source_id", sourceId);

    const frameworksToInsert = (extracted.frameworks || [])
      .map((f) => ({
        source_id: sourceId,
        geography_scope: f.geography_scope || geo,
        region: f.region ?? null,
        sector: f.sector ?? null,
        title: f.title ?? null,
        summary: f.summary,
        key_points: f.key_points ?? null,
        tags: f.tags ?? null,
      }))
      .filter((f) => typeof f.summary === "string" && f.summary.trim().length > 0);

    if (frameworksToInsert.length > 0) {
      const { error: insErr } = await serviceClient.from("kb_frameworks").insert(frameworksToInsert);
      if (insErr) throw new Error(insErr.message);
    }

    const meta = extracted.meta || {};
    const { error: updateSourceErr } = await serviceClient
      .from("kb_sources")
      .update({
        title: meta.title ?? source.title ?? null,
        publisher: meta.publisher ?? source.publisher ?? null,
        geography_scope: meta.geography_scope ?? source.geography_scope ?? "Europe",
        publication_date: meta.publication_date ?? null,
        extracted_json: extracted,
        extraction_confidence: extracted.confidence,
        status: "active",
      })
      .eq("id", sourceId);
    if (updateSourceErr) throw new Error(updateSourceErr.message);

    return new Response(
      JSON.stringify({
        success: true,
        sourceId,
        inserted: {
          frameworks: frameworksToInsert.length,
        },
        processingTimeMs: Date.now() - startTime,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      return new Response(JSON.stringify({ error: "Request timed out" }), {
        status: 504,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("kb-parse-framework error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
