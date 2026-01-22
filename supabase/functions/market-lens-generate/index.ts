import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MarketLensBriefing {
  tailwinds: Array<{
    title: string;
    insight: string;
    relevance: string;
    source: string;
  }>;
  headwinds: Array<{
    title: string;
    insight: string;
    relevance: string;
    source: string;
  }>;
  fundingLandscape: {
    summary: string;
    dataPoints: Array<{
      metric: string;
      value: string;
      context: string;
    }>;
  };
  geographicContext: {
    summary: string;
    insights: string[];
  };
  exitPrecedents: Array<{
    company: string;
    outcome: string;
    relevance: string;
  }>;
  narrativeAlignment: {
    summary: string;
    themes: string[];
  };
  generatedAt: string;
  sourcesUsed: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyId } = await req.json();

    if (!companyId) {
      return new Response(
        JSON.stringify({ error: "Company ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch company data
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .single();

    if (companyError || !company) {
      return new Response(
        JSON.stringify({ error: "Company not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch memo content
    const { data: memoContent } = await supabase
      .from("memo_structured_content")
      .select("*")
      .eq("company_id", companyId)
      .single();

    // Fetch memo responses for additional context
    const { data: memoResponses } = await supabase
      .from("memo_responses")
      .select("question_key, response_text")
      .eq("company_id", companyId);

    // Fetch all active KB sources
    const { data: kbSources, error: kbError } = await supabase
      .from("kb_sources")
      .select("id, title, source_type, geography_scope, content_kind")
      .eq("status", "active");

    console.log("KB Sources found:", kbSources?.length || 0, kbError);

    // Fetch benchmarks
    const { data: benchmarks } = await supabase
      .from("kb_benchmarks")
      .select("*")
      .in("source_id", kbSources?.map(s => s.id) || []);

    // Fetch market notes
    const { data: marketNotes } = await supabase
      .from("kb_market_notes")
      .select("*")
      .in("source_id", kbSources?.map(s => s.id) || []);

    // Fetch frameworks
    const { data: frameworks } = await supabase
      .from("kb_frameworks")
      .select("*")
      .in("source_id", kbSources?.map(s => s.id) || []);

    // Build company context
    const companyContext = {
      name: company.name,
      description: company.description,
      stage: company.stage,
      category: company.category,
      memoSummary: memoContent?.content ? JSON.stringify(memoContent.content).slice(0, 3000) : null,
      responses: memoResponses?.reduce((acc: Record<string, string>, r) => {
        acc[r.question_key] = r.response_text?.slice(0, 500) || "";
        return acc;
      }, {}) || {}
    };

    // Build KB context
    const kbContext = {
      benchmarks: benchmarks?.slice(0, 50).map(b => ({
        metric: b.metric_key,
        label: b.metric_label,
        value: b.median_value,
        stage: b.stage,
        sector: b.sector,
        geography: b.geography_scope,
        notes: b.notes
      })) || [],
      marketNotes: marketNotes?.slice(0, 30).map(n => ({
        headline: n.headline,
        summary: n.summary,
        sector: n.sector,
        geography: n.geography_scope,
        keyPoints: n.key_points
      })) || [],
      frameworks: frameworks?.slice(0, 10).map(f => ({
        title: f.title,
        summary: f.summary,
        keyPoints: f.key_points
      })) || [],
      sources: kbSources?.map(s => s.title) || []
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a senior VC market intelligence analyst preparing a personalized briefing for a startup founder.

Your job is to analyze market reports, benchmarks, and frameworks and extract ONLY the insights that are directly relevant to this specific company.

DO NOT summarize reports generically. Every insight must be personalized to explain:
1. What the data point or trend is
2. Why it matters for THIS specific company
3. How they can use it in investor conversations

Be specific, actionable, and avoid generic advice. Reference specific data points when available.`;

    const userPrompt = `## Company Profile
Name: ${companyContext.name}
Stage: ${companyContext.stage}
Sector: ${companyContext.category || "Not specified"}
Description: ${companyContext.description || "Not provided"}

## Key Responses from Their Analysis
${Object.entries(companyContext.responses).slice(0, 10).map(([k, v]) => `- ${k}: ${v}`).join("\n")}

## Available Market Intelligence

### Benchmarks (${kbContext.benchmarks.length} data points)
${JSON.stringify(kbContext.benchmarks.slice(0, 30), null, 2)}

### Market Notes (${kbContext.marketNotes.length} insights)
${JSON.stringify(kbContext.marketNotes.slice(0, 20), null, 2)}

### Strategic Frameworks
${JSON.stringify(kbContext.frameworks, null, 2)}

---

Generate a personalized Market Lens briefing with exactly this JSON structure:

{
  "tailwinds": [
    {
      "title": "Short title of the positive trend",
      "insight": "2-3 sentence explanation of the trend/data",
      "relevance": "Why this specifically matters for this company",
      "source": "Name of the report/source"
    }
  ],
  "headwinds": [
    {
      "title": "Short title of the challenge/risk",
      "insight": "2-3 sentence explanation",
      "relevance": "Why this is a concern for this company specifically",
      "source": "Name of the report/source"
    }
  ],
  "fundingLandscape": {
    "summary": "2-3 sentence overview of funding environment for their stage/sector",
    "dataPoints": [
      {
        "metric": "Metric name",
        "value": "The value with units",
        "context": "What this means for them"
      }
    ]
  },
  "geographicContext": {
    "summary": "Overview of their regional ecosystem",
    "insights": ["Specific regional insight 1", "Insight 2"]
  },
  "exitPrecedents": [
    {
      "company": "Company name",
      "outcome": "What happened (acquisition, IPO, etc.)",
      "relevance": "Why this is relevant to them"
    }
  ],
  "narrativeAlignment": {
    "summary": "How their story aligns with current investor themes",
    "themes": ["Theme 1 they can leverage", "Theme 2"]
  }
}

Include 2-4 items in each array. If there's no relevant data for a section, include 1 item explaining the gap.
Return ONLY valid JSON, no markdown.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to generate briefing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No response from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response
    let briefing: MarketLensBriefing;
    try {
      const cleanedContent = content.replace(/```json\n?|\n?```/g, "").trim();
      briefing = JSON.parse(cleanedContent);
      briefing.generatedAt = new Date().toISOString();
      briefing.sourcesUsed = kbSources?.length || 0;
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, content);
      return new Response(
        JSON.stringify({ error: "Failed to parse briefing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save the briefing to memo_responses for caching
    await supabase
      .from("memo_responses")
      .upsert({
        company_id: companyId,
        question_key: "market_lens_briefing",
        answer: JSON.stringify(briefing),
        updated_at: new Date().toISOString()
      }, {
        onConflict: "company_id,question_key"
      });

    return new Response(
      JSON.stringify({ briefing }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Market Lens error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
