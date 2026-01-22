import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// NOTE: This export intentionally avoids platform-level confidential system prompts.
// It includes:
// - developer-authored prompts stored in DB (memo_prompts)
// - developer-authored deck extraction schema/prompt (parse-pitch-deck)
// - developer-authored KB retrieval and scoring methodology (summarized + excerpted)

const PARSE_PITCH_DECK_SYSTEM_PROMPT_EXCERPT = `You are a senior VC investment analyst at a top-tier venture fund. Your job is to extract EVERY piece of relevant information from pitch decks to build comprehensive investment memoranda.

CRITICAL: Extract ALL details you can find - numbers, names, percentages, dates, claims. VCs need specifics, not vague summaries.

Return a JSON object with this EXACT structure:

{ ... see live implementation in function parse-pitch-deck ... }

CONFIDENCE SCORING:
- 0.9-1.0: Explicitly stated with specific numbers/facts
- 0.7-0.8: Clearly shown/implied, can confidently extract
- 0.5-0.6: Partially available, some inference needed
- 0.3-0.4: Limited context, educated guess
- 0.0-0.2: Not found or highly speculative

EXTRACTION RULES:
1. ALWAYS include specific numbers when visible (don't round or generalize)
2. Name drop - include company names, investor names, customer logos
3. If a metric is shown in a chart, describe what the chart shows
4. Extract dates and timelines when available
5. For missing critical info, set to null but note in redFlags what's missing
6. Be comprehensive - VCs read between the lines, you should too`;

function mdEscape(val: unknown) {
  return String(val ?? "").replace(/\u0000/g, "");
}

function mdCodeBlock(lang: string, content: string) {
  return `\n\n\`\`\`${lang}\n${content}\n\`\`\`\n`;
}

function section(title: string) {
  return `\n\n---\n\n## ${title}\n`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Backend not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch all relevant assets in parallel.
    const [
      promptsRes,
      qSectionsRes,
      qQuestionsRes,
      kbSourcesRes,
      kbFrameworksRes,
      kbBenchmarksRes,
      kbMarketNotesRes,
    ] = await Promise.all([
      supabaseAdmin.from("memo_prompts").select("section_name,prompt,updated_at").order("section_name"),
      supabaseAdmin.from("questionnaire_sections").select("id,name,display_title,sort_order").order("sort_order"),
      supabaseAdmin
        .from("questionnaire_questions")
        .select("id,section_id,question_key,title,tldr,question,placeholder,sort_order,is_required,is_active")
        .order("sort_order"),
      supabaseAdmin.from("kb_sources").select("id,content_kind,source_type,title,publisher,publication_date,geography_scope,status").order("updated_at", { ascending: false }),
      supabaseAdmin.from("kb_frameworks").select("source_id,geography_scope,region,sector,title,summary,key_points,tags").order("updated_at", { ascending: false }),
      supabaseAdmin.from("kb_benchmarks").select("source_id,geography_scope,region,stage,sector,business_model,timeframe_label,sample_size,currency,metric_key,metric_label,median_value,p25_value,p75_value,unit,notes").order("updated_at", { ascending: false }),
      supabaseAdmin.from("kb_market_notes").select("source_id,geography_scope,region,sector,timeframe_label,headline,summary,key_points").order("updated_at", { ascending: false }),
    ]);

    if (promptsRes.error) throw promptsRes.error;
    if (qSectionsRes.error) throw qSectionsRes.error;
    if (qQuestionsRes.error) throw qQuestionsRes.error;
    if (kbSourcesRes.error) throw kbSourcesRes.error;
    if (kbFrameworksRes.error) throw kbFrameworksRes.error;
    if (kbBenchmarksRes.error) throw kbBenchmarksRes.error;
    if (kbMarketNotesRes.error) throw kbMarketNotesRes.error;

    const nowIso = new Date().toISOString();

    let md = `# Investment Analysis Framework — Full Spec (Export)\n\n`;
    md += `**Generated:** ${nowIso}\n\n`;
    md += `This document is a text-based, end-to-end specification of the current investment analysis system: ingestion → normalization → knowledge augmentation → scoring → QA → rendering.\n\n`;
    md += `> Note: Platform-level confidential prompts are excluded. Developer-authored prompts, schemas, and templates are included.\n`;

    // -------------------------------------------------------------------------
    md += section("1) End-to-end pipeline overview");
    md += `### 1.1 Data sources\n`;
    md += `- **Founder pitch deck** (PDF or images) → extracted via backend function **parse-pitch-deck**.\n`;
    md += `- **Founder questionnaire answers** (manual + deck-import autofill) stored in **memo_responses**.\n`;
    md += `- **Knowledge Library** (reports + frameworks) stored as sources + extracted rows in KB tables.\n`;
    md += `\n### 1.2 High-level flow\n`;
    md += `1. Upload deck → stored → signed URL produced\n`;
    md += `2. parse-pitch-deck → structured extraction + per-field confidence\n`;
    md += `3. High-confidence extractedSections → upsert into memo_responses (source = deck_import)\n`;
    md += `4. generate-full-memo pipeline:\n`;
    md += `   - Load company + memo_responses\n`;
    md += `   - Build CompanyModel (structured extraction + discrepancy tracking)\n`;
    md += `   - Select benchmark cohort (stage + motion signals)\n`;
    md += `   - Retrieve KB context (benchmarks + frameworks)\n`;
    md += `   - Generate section tools + narratives + holistic verdicts\n`;
    md += `   - Run coherence/consistency validation\n`;
    md += `   - Persist memo + tool data + render in UI\n`;

    // -------------------------------------------------------------------------
    md += section("2) Ingestion schema (pitch deck + founder inputs)");
    md += `This system has two primary ingestion layers:\n`;
    md += `- **Deck extraction schema** (AI-extracted JSON)\n`;
    md += `- **Founder input schema** (questionnaire keys → memo_responses)\n`;
    md += `\n### 2.1 Deck extraction schema (developer-authored)\n`;
    md += `The deck extraction prompt defines the exact JSON object shape. The key payloads used for downstream memo generation are:\n`;
    md += `- companyInfo (name, description, stage, category, foundedYear, headquarters, website)\n`;
    md += `- metrics (revenue, users, growth, unitEconomics, funding)\n`;
    md += `- team (founders, teamSize, keyHires, advisors)\n`;
    md += `- extractedSections: problem_core, solution_core, target_customer, competitive_moat, business_model, traction_proof, team_story, vision_ask\n`;
    md += `- redFlags[], strengths[], summary\n`;
    md += mdCodeBlock("text", PARSE_PITCH_DECK_SYSTEM_PROMPT_EXCERPT);
    md += `\n### 2.2 Questionnaire input keys\n`;
    md += `Questionnaire answers are stored as (company_id, question_key, answer, source, confidence_score).\n`;
    md += `Below is the current question inventory (sections + questions).\n`;
    const qSections = qSectionsRes.data || [];
    const qQuestions = qQuestionsRes.data || [];
    for (const s of qSections) {
      md += `\n#### Section: ${mdEscape(s.display_title ?? s.name)} (id=${s.id})\n`;
      const qs = qQuestions.filter((q: any) => q.section_id === s.id);
      for (const q of qs) {
        if (q.is_active === false) continue;
        md += `- **${mdEscape(q.question_key)}** (${q.is_required ? "required" : "optional"})\n`;
        if (q.title) md += `  - title: ${mdEscape(q.title)}\n`;
        md += `  - question: ${mdEscape(q.question)}\n`;
        if (q.tldr) md += `  - tldr: ${mdEscape(q.tldr)}\n`;
        if (q.placeholder) md += `  - placeholder: ${mdEscape(q.placeholder)}\n`;
      }
    }

    // -------------------------------------------------------------------------
    md += section("3) Normalization and assumptions");
    md += `### 3.1 Currency & units\n`;
    md += `- The system attempts to maintain a canonical currency across the memo and warns on drift.\n`;
    md += `- Extractors parse numeric values and infer temporality/classification (actual/projected/minimum/target).\n`;
    md += `\n### 3.2 Assumptions propagation\n`;
    md += `- A structured CompanyModel is built from memo_responses. Values include CalculationTrace provenance.\n`;
    md += `- When explicit pricing is missing, the system computes implied values (e.g., ARR ÷ customers).\n`;
    md += `- Discrepancies are tracked and surfaced as coherence flags and follow-up questions.\n`;

    // -------------------------------------------------------------------------
    md += section("4) Product motion modes and metric hygiene");
    md += `Business model typing (B2C subscription, B2B SMB SaaS, marketplace, etc.) is formalized in the metric framework.\n`;
    md += `Rules prevent misuse by choosing a primary metric label (ARPU vs ACV vs GMV) and mapping customer units (users vs customers).\n`;
    md += `\nKey behaviors:\n`;
    md += `- B2C subscription: ARPU (monthly), MAU/users, consumer churn\n`;
    md += `- B2B: ACV (annual), customers/accounts, NRR/expansion\n`;
    md += `- Marketplace: GMV × take rate\n`;

    // -------------------------------------------------------------------------
    md += section("5) Scoring rubric (Investment Readiness)");
    md += `The UI scorecard aggregates section scores and applies stage-calibrated thresholds.\n`;
    md += `Default section weight map (current):\n`;
    md += mdCodeBlock(
      "json",
      JSON.stringify(
        {
          Team: 0.2,
          Traction: 0.2,
          Market: 0.15,
          Problem: 0.12,
          Solution: 0.1,
          "Business Model": 0.1,
          Competition: 0.08,
          Vision: 0.05,
        },
        null,
        2,
      ),
    );
    md += `Readiness classification:\n`;
    md += `- NOT_READY: 2+ critical sections OR overallScore < 50\n`;
    md += `- CONDITIONAL: 1 critical section OR overallScore < 60\n`;
    md += `- READY: otherwise\n`;

    // -------------------------------------------------------------------------
    md += section("6) Confidence and evidence grades");
    md += `Current implementation includes metric classification (actual/projected/minimum/target) and temporality (historical/current/future).\n`;
    md += `Evidence grade taxonomy (A/B/C) is defined as a methodology requirement; implementers should map these grades onto: extraction confidence + trace.method + presence of third-party validation.\n`;

    // -------------------------------------------------------------------------
    md += section("7) Computation formulas and constraints");
    md += `The CompanyModel and tool generators use these canonical formulas (when inputs exist):\n`;
    md += `- **ARR = MRR × 12**\n`;
    md += `- **MRR = ARR ÷ 12**\n`;
    md += `- **Implied ARR from customers = Customers × ACV**\n`;
    md += `- **Revenue per customer = Revenue ÷ Customers**\n`;
    md += `- **Conversion rate = Paid ÷ Free** (when both exist)\n`;
    md += `\nConstraints / validation behaviors:\n`;
    md += `- Large inconsistencies (e.g., stated vs computed revenue) are recorded as discrepancies with severity.\n`;
    md += `- Coherence checks include revenue consistency, TAM plausibility, GTM↔traction alignment, and runway↔milestone alignment.\n`;

    // -------------------------------------------------------------------------
    md += section("8) Knowledge Library integration");
    md += `Retrieval strategy (current):\n`;
    md += `- Select recent active sources by geography_scope + content_kind (reports/frameworks).\n`;
    md += `- Pull benchmarks with tiered fallback (stage+sector → stage → sector → any).\n`;
    md += `- Pull frameworks with sector OR global frameworks (sector is NULL).\n`;
    md += `\nPolicy:\n`;
    md += `- Benchmarks calibrate expectations; frameworks shape evaluation heuristics.\n`;
    md += `- Framework citations are internal-only and should not appear in the final memo (used implicitly).\n`;

    // -------------------------------------------------------------------------
    md += section("9) QA preflight and contradiction detection");
    md += `QA checks are implemented across CompanyModel coherence + metric discrepancy tracking.\n`;
    md += `Expected checks:\n`;
    md += `- Currency consistency\n- Arithmetic consistency (ARR/MRR, customers×ACV)\n- ICP unit alignment (users vs companies)\n- Score↔narrative reconciliation\n- Evidence/confidence alignment\n- Cross-section contradiction flags\n`;

    // -------------------------------------------------------------------------
    md += section("10) Output structure and rendering");
    md += `Canonical memo section order (current):\n`;
    md += `1. Problem\n2. Solution\n3. Market\n4. Competition\n5. Team\n6. Business Model\n7. Traction\n8. Investment Thesis\n`;
    md += `Rendering is done in the memo UI by iterating memoContent.sections and rendering section-specific tool cards when present.\n`;

    // -------------------------------------------------------------------------
    md += section("11) Prompts / templates (developer-authored)");
    md += `Below are the current per-section prompts (memo_prompts). These are the primary editable templates that drive narrative generation.\n`;
    const prompts = promptsRes.data || [];
    for (const p of prompts) {
      md += `\n### ${mdEscape(p.section_name)}\n`;
      md += `Last updated: ${mdEscape(p.updated_at)}\n`;
      md += mdCodeBlock("text", mdEscape(p.prompt));
    }

    // -------------------------------------------------------------------------
    md += section("12) Knowledge Library snapshot (internal)");
    md += `This appendix lists the current KB sources and extracted artifacts included in the system.\n`;
    const sources = kbSourcesRes.data || [];
    md += `\n### Sources (${sources.length})\n`;
    for (const s of sources) {
      md += `- [${s.id}] ${mdEscape(s.publisher)} — ${mdEscape(s.title)} (${mdEscape(s.publication_date)}) kind=${mdEscape(s.content_kind)} geo=${mdEscape(s.geography_scope)} status=${mdEscape(s.status)}\n`;
    }
    md += `\n### Framework rows (${(kbFrameworksRes.data || []).length})\n`;
    md += `\n(omitted full listing in UI by default; engineer can re-run export and grep by source_id/sector)\n`;
    md += `\n### Benchmark rows (${(kbBenchmarksRes.data || []).length})\n`;
    md += `\n(omitted full listing in UI by default; engineer can re-run export and grep by metric_key/stage)\n`;
    md += `\n### Market notes (${(kbMarketNotesRes.data || []).length})\n`;
    md += `\n(omitted full listing in UI by default; engineer can re-run export and grep by sector)\n`;

    return new Response(JSON.stringify({ markdown: md }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("admin-methodology-export error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
