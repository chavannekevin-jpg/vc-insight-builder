import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function safeJsonParse<T = unknown>(raw: string): T {
  // Provide a cleaner error than "Unexpected end of JSON input".
  if (!raw || !raw.trim()) {
    throw new Error("Empty JSON response");
  }
  return JSON.parse(raw) as T;
}

const MEMO_SCHEMA = {
  type: "object",
  properties: {
    company_name: { type: "string" },
    analysis_date: { type: "string" },
    executive_summary: { type: "string" },
    investment_thesis: { type: "string" },
    overall_score: { type: "number", minimum: 0, maximum: 100 },
    verdict: { type: "string" },
    sections: {
      type: "object",
      properties: {
        business_model: { "$ref": "#/$defs/section" },
        market_opportunity: { "$ref": "#/$defs/section" },
        competitive_position: { "$ref": "#/$defs/section" },
        financials: { "$ref": "#/$defs/section" },
        team: { "$ref": "#/$defs/section" },
        traction: { "$ref": "#/$defs/section" },
        risks: { "$ref": "#/$defs/section" },
        terms: { "$ref": "#/$defs/section" },
      },
      required: ["business_model", "market_opportunity", "competitive_position", "financials", "team", "traction", "risks", "terms"],
    },
    key_metrics: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          value: { type: "string" },
          source_file: { type: "string" },
        },
        required: ["label", "value", "source_file"],
      },
    },
    red_flags: { type: "array", items: { type: "string" } },
    diligence_questions: { type: "array", items: { type: "string" } },
    document_coverage: {
      type: "array",
      items: {
        type: "object",
        properties: {
          file_name: { type: "string" },
          topics_covered: { type: "array", items: { type: "string" } },
        },
        required: ["file_name", "topics_covered"],
      },
    },
  },
  required: ["company_name", "analysis_date", "executive_summary", "investment_thesis", "overall_score", "verdict", "sections", "key_metrics", "red_flags", "diligence_questions", "document_coverage"],
  $defs: {
    section: {
      type: "object",
      properties: {
        title: { type: "string" },
        assessment: { type: "string", enum: ["strong", "moderate", "weak", "unclear"] },
        strengths: { type: "array", items: { type: "string" } },
        concerns: { type: "array", items: { type: "string" } },
        inconsistencies: { type: "array", items: { type: "string" } },
        analyst_notes: { type: "string" },
      },
      required: ["title", "assessment", "strengths", "concerns", "inconsistencies", "analyst_notes"],
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: { user } } = await createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    ).auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { roomId } = await req.json();
    if (!roomId) throw new Error("Missing roomId");

    // Get room and verify ownership
    const { data: room, error: roomError } = await supabase
      .from("investor_data_rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (roomError || !room) throw new Error("Room not found");
    if (room.investor_id !== user.id) throw new Error("Not authorized");

    // Get all completed files
    const { data: files, error: filesError } = await supabase
      .from("investor_data_room_files")
      .select("*")
      .eq("room_id", roomId)
      .eq("extraction_status", "completed");

    if (filesError) throw filesError;
    if (!files || files.length === 0) throw new Error("No processed documents found");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Build document context - truncate very long docs to avoid token limits
    const MAX_DOC_LENGTH = 30000; // Max chars per document
    const documentContext = files.map(f => {
      let content = f.extracted_text || "[No content extracted]";
      if (content.length > MAX_DOC_LENGTH) {
        content = content.slice(0, MAX_DOC_LENGTH) + "\n...[Content truncated for length]...";
      }
      return `=== Document: ${f.file_name} ===\n${content}\n`;
    }).join("\n\n");

    console.log(`Generating memo for ${files.length} documents, total context: ${documentContext.length} chars`);

    // Generate memo using tool calling with timeout handling
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // 2 min timeout

    try {
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
              content: `You are an experienced venture capital analyst conducting due diligence on a startup investment opportunity. You have access to multiple documents from the company's data room.

Your task is to analyze all provided documents and generate a comprehensive investment memorandum. Be thorough, critical, and highlight:
1. Strengths and positive signals
2. Concerns and risks
3. Inconsistencies between documents or claims
4. Missing information that would be needed for a complete analysis
5. Key metrics with their source documents

Act as a skeptical but fair analyst. Cross-reference claims across documents. Note when numbers don't add up or when claims are unsubstantiated.

IMPORTANT: For financial data from Excel/spreadsheet files, extract specific numbers like ARR, MRR, burn rate, runway, revenue figures, and include them in key_metrics.

Company name: ${room.company_name}
Today's date: ${new Date().toISOString().split('T')[0]}`,
            },
            {
              role: "user",
              content: `Analyze these data room documents and generate a comprehensive due diligence memo:\n\n${documentContext}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "generate_investment_memo",
                description: "Generate a structured investment memorandum based on the analyzed documents",
                parameters: MEMO_SCHEMA,
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "generate_investment_memo" } },
          max_tokens: 16000,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errText = await response.text();
        console.error("AI memo generation error:", errText);
        
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again in a few minutes.");
        }
        if (response.status === 402) {
          throw new Error("AI credits exhausted. Please add credits.");
        }
        throw new Error(`AI service error: ${response.status}`);
      }

      // Some upstream failures can return 200 with an empty body (rare but happens).
      // Reading as text first lets us provide a deterministic error.
      const raw = await response.text();
      let result: any;
      try {
        result = safeJsonParse(raw);
      } catch (e) {
        console.error("AI returned invalid JSON (first 800 chars):", (raw || "").slice(0, 800));
        throw new Error("AI returned an invalid response. Please try again.");
      }
      const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
      
      if (!toolCall?.function?.arguments) {
        console.error("Invalid AI response structure:", JSON.stringify(result).slice(0, 500));
        throw new Error("AI did not return a valid memo structure. Please try again.");
      }

      let memo;
      try {
        memo = JSON.parse(toolCall.function.arguments);
      } catch (parseErr) {
        console.error("Failed to parse memo JSON:", parseErr);
        throw new Error("Failed to parse AI response. Please try again.");
      }

      // Validate memo has required fields
      if (!memo.sections || !memo.executive_summary) {
        throw new Error("Generated memo is incomplete. Please try again.");
      }

      return new Response(
        JSON.stringify({ success: true, memo }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (fetchErr) {
      clearTimeout(timeout);
      if (fetchErr instanceof Error && fetchErr.name === 'AbortError') {
        throw new Error("Analysis timed out. Try with fewer or smaller documents.");
      }
      throw fetchErr;
    }

  } catch (error) {
    console.error("Generate memo error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
