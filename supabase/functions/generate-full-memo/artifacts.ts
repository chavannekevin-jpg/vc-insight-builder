// Pipeline artifact helpers (no schema changes).
// These artifacts are persisted to memo_tool_data using reserved tool_name prefixes
// so they can be inspected/admin-debugged without affecting UI rendering.

export type MemoToolRow = {
  question_key?: string;
  answer?: string;
  source?: string;
  confidence_score?: number;
};

export async function saveMemoArtifact(opts: {
  supabaseClient: any;
  companyId: string;
  sectionName: string;
  toolName: string;
  data: unknown;
  dataSource?: string;
}) {
  const {
    supabaseClient,
    companyId,
    sectionName,
    toolName,
    data,
    dataSource = "ai-complete",
  } = opts;

  const { error } = await supabaseClient
    .from("memo_tool_data")
    .upsert(
      {
        company_id: companyId,
        section_name: sectionName,
        tool_name: toolName,
        ai_generated_data: data,
        data_source: dataSource,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "company_id,section_name,tool_name" },
    );

  if (error) {
    console.warn(`Failed to save artifact ${sectionName}/${toolName}:`, error);
  }
}

// Very lightweight evidence ledger that captures provenance (manual vs non-manual)
// without requiring schema changes.
export function buildEvidenceLedgerV1(input: {
  sectionName: string;
  sectionResponses: Record<string, string>;
  manualQuestionKeys: Set<string>;
  nonManualRows: MemoToolRow[];
}) {
  const { sectionName, sectionResponses, manualQuestionKeys, nonManualRows } = input;
  const manualFacts = Object.entries(sectionResponses)
    .filter(([k, v]) => manualQuestionKeys.has(k) && String(v ?? "").trim())
    .map(([k, v]) => ({
      evidence_id: `manual:${k}`,
      question_key: k,
      claim: String(v),
      source_type: "manual",
    }));

  const nonFounderContext = (nonManualRows || [])
    .filter((r) => String(r?.answer ?? "").trim())
    .map((r) => ({
      evidence_id: `non_manual:${String(r.question_key ?? "unknown")}`,
      question_key: r.question_key ?? null,
      claim: String(r.answer ?? ""),
      source_type: "non_manual",
      source: r.source ?? "unknown",
      confidence_extraction: typeof r.confidence_score === "number" ? r.confidence_score : null,
    }));

  return {
    version: 1,
    section: sectionName,
    generatedAt: new Date().toISOString(),
    founder_manual_facts: manualFacts,
    non_founder_context: nonFounderContext,
  };
}
