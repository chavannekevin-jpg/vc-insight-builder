import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_TIMEOUT_MS = 120000;
const MAX_PDF_BYTES = 20 * 1024 * 1024;

function base64Encode(bytes: Uint8Array): string {
  // Deno: safe chunked btoa for large payloads
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

type ExtractionConfidence = "high" | "medium" | "low";

type KBMetricKey =
  | "round_size"
  | "pre_money_valuation"
  | "post_money_valuation"
  | "valuation_cap"
  | "discount"
  | "dilution"
  | "ownership_target"
  | "arr_at_raise"
  | "mrr_at_raise"
  | "revenue_growth_rate"
  | "burn_multiple"
  | "gross_margin"
  | "net_revenue_retention"
  | "gross_churn"
  | "funding_volume"
  | "deal_count"
  | "mega_round_count"
  | "down_round_rate"
  | "exit_value"
  | "exit_count"
  | "ipo_count"
  | "time_to_next_round_months"
  | "vc_fundraising_volume";

type KBBenchmarkRow = {
  geography_scope?: string;
  region?: string | null;
  stage: string;
  sector?: string | null;
  business_model?: string | null;
  timeframe_label?: string | null;
  sample_size?: number | null;
  currency?: string | null;
  metric_key: KBMetricKey;
  metric_label?: string | null;
  median_value?: number | null;
  p25_value?: number | null;
  p75_value?: number | null;
  unit?: string | null;
  notes?: string | null;
};

type KBMarketNoteRow = {
  geography_scope?: string;
  region?: string | null;
  sector?: string | null;
  timeframe_label?: string | null;
  headline?: string | null;
  summary: string;
  key_points?: string[] | null;
};

type ExtractedReport = {
  meta?: {
    title?: string | null;
    publisher?: string | null;
    geography_scope?: string | null;
    region?: string | null;
    publication_date?: string | null; // ISO date
    data_period_start?: string | null;
    data_period_end?: string | null;
    currency?: string | null;
  };
  confidence: ExtractionConfidence;
  benchmarks: KBBenchmarkRow[];
  market_notes: KBMarketNoteRow[];
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
      .select("id, source_type, title, publisher, storage_path, geography_scope")
      .eq("id", sourceId)
      .maybeSingle();

    if (sourceErr || !source) {
      return new Response(JSON.stringify({ error: "Source not found" }), {
        status: 404,
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

    const metricKeyOptions: KBMetricKey[] = [
      "round_size",
      "pre_money_valuation",
      "post_money_valuation",
      "valuation_cap",
      "discount",
      "dilution",
      "ownership_target",
      "arr_at_raise",
      "mrr_at_raise",
      "revenue_growth_rate",
      "burn_multiple",
      "gross_margin",
      "net_revenue_retention",
      "gross_churn",
      "funding_volume",
      "deal_count",
      "mega_round_count",
      "down_round_rate",
      "exit_value",
      "exit_count",
      "ipo_count",
      "time_to_next_round_months",
      "vc_fundraising_volume",
    ];

    const systemPrompt = `You extract structured venture benchmark data AND market insights from PDF reports.

Return ONLY via the provided tool call.

Rules:
    - Be exhaustive: extract as MANY relevant benchmarks/insights as the report supports (don't be minimal).
    - If the report doesn't contain a metric, omit it.
- Prefer numeric medians and (p25,p75) when available.
- Use ISO dates (YYYY-MM-DD) when known.
    - Stages must be one of: Pre-Seed, Seed, Series A, Series B, Later, All Stages.
    - geography_scope should default to "Europe" unless the report is clearly global or clearly narrower.
- metric_key MUST be one of: ${metricKeyOptions.join(", ")}
- Units examples: EUR, %, months, x, (or null).
    - Market notes MUST be grounded in report text and written as clear, VC-usable bullets.
    - Aim for 25-60 market_notes on long reports. Prefer many short notes over a few long ones.
    - Use key_points to capture the most important supporting bullets for each note when present.`;

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
                text: `Extract benchmarks and market notes from this report. Use publisher/title hints when helpful.\n\nTitle hint: ${source.title ?? "(unknown)"}\nPublisher hint: ${source.publisher ?? "(unknown)"}`,
              },
              {
                type: "image_url",
                image_url: { url: `data:application/pdf;base64,${pdfBase64}` },
              },
            ],
          },
        ],
        temperature: 0.2,
         max_tokens: 9000,
        tools: [
          {
            type: "function",
            function: {
              name: "extract_report",
              description: "Extract KB benchmarks and market notes from a funding/benchmark report.",
              parameters: {
                type: "object",
                additionalProperties: false,
                required: ["confidence", "benchmarks", "market_notes"],
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
                      data_period_start: { type: "string", nullable: true },
                      data_period_end: { type: "string", nullable: true },
                      currency: { type: "string", nullable: true },
                    },
                  },
                  confidence: { type: "string", enum: ["high", "medium", "low"] },
                  extraction_notes: { type: "string", nullable: true },
                  benchmarks: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      required: ["stage", "metric_key"],
                      properties: {
                        geography_scope: { type: "string", nullable: true },
                        region: { type: "string", nullable: true },
                        stage: { type: "string" },
                        sector: { type: "string", nullable: true },
                        business_model: { type: "string", nullable: true },
                        timeframe_label: { type: "string", nullable: true },
                        sample_size: { type: "number", nullable: true },
                        currency: { type: "string", nullable: true },
                        metric_key: { type: "string", enum: metricKeyOptions },
                        metric_label: { type: "string", nullable: true },
                        median_value: { type: "number", nullable: true },
                        p25_value: { type: "number", nullable: true },
                        p75_value: { type: "number", nullable: true },
                        unit: { type: "string", nullable: true },
                        notes: { type: "string", nullable: true },
                      },
                    },
                  },
                  market_notes: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      required: ["summary"],
                      properties: {
                        geography_scope: { type: "string", nullable: true },
                        region: { type: "string", nullable: true },
                        sector: { type: "string", nullable: true },
                        timeframe_label: { type: "string", nullable: true },
                        headline: { type: "string", nullable: true },
                        summary: { type: "string" },
                        key_points: {
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
        tool_choice: { type: "function", function: { name: "extract_report" } },
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

    const extracted = JSON.parse(argsStr) as ExtractedReport;

    // Normalize / default
    const geo = extracted.meta?.geography_scope || source.geography_scope || "Europe";

    // Replace previous extraction for this source
    await serviceClient.from("kb_benchmarks").delete().eq("source_id", sourceId);
    await serviceClient.from("kb_market_notes").delete().eq("source_id", sourceId);

    const benchmarksToInsert = (extracted.benchmarks || []).map((b) => ({
      source_id: sourceId,
      geography_scope: b.geography_scope || geo,
      region: b.region ?? null,
      stage: b.stage,
      sector: b.sector ?? null,
      business_model: b.business_model ?? null,
      timeframe_label: b.timeframe_label ?? null,
      sample_size: b.sample_size ?? null,
      currency: b.currency || extracted.meta?.currency || "EUR",
      metric_key: b.metric_key,
      metric_label: b.metric_label ?? null,
      median_value: b.median_value ?? null,
      p25_value: b.p25_value ?? null,
      p75_value: b.p75_value ?? null,
      unit: b.unit ?? null,
      notes: b.notes ?? null,
    }));

    const notesToInsert = (extracted.market_notes || []).map((n) => ({
      source_id: sourceId,
      geography_scope: n.geography_scope || geo,
      region: n.region ?? null,
      sector: n.sector ?? null,
      timeframe_label: n.timeframe_label ?? null,
      headline: n.headline ?? null,
      summary: n.summary,
      key_points: n.key_points ?? null,
    }));

    if (benchmarksToInsert.length > 0) {
      const { error: benchErr } = await serviceClient.from("kb_benchmarks").insert(benchmarksToInsert);
      if (benchErr) throw new Error(benchErr.message);
    }

    if (notesToInsert.length > 0) {
      const { error: notesErr } = await serviceClient.from("kb_market_notes").insert(notesToInsert);
      if (notesErr) throw new Error(notesErr.message);
    }

    const meta = extracted.meta || {};
    const { error: updateSourceErr } = await serviceClient
      .from("kb_sources")
      .update({
        title: meta.title ?? source.title ?? null,
        publisher: meta.publisher ?? source.publisher ?? null,
        geography_scope: meta.geography_scope ?? source.geography_scope ?? "Europe",
        publication_date: meta.publication_date ?? null,
        data_period_start: meta.data_period_start ?? null,
        data_period_end: meta.data_period_end ?? null,
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
          benchmarks: benchmarksToInsert.length,
          market_notes: notesToInsert.length,
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
    console.error("kb-parse-report error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
