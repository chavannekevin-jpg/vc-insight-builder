// Evidence packet builder (contract-style input for writer prompts)
// Keeps manual evidence (hard) separate from non-manual context (hypotheses).

export interface EvidencePacketInput {
  sectionName: string;
  sectionResponses: Record<string, string>;
  manualQuestionKeys: Set<string>;
  nonManualRows: Array<{ question_key?: string; answer?: string; source?: string; confidence_score?: number }>;
  detectedCurrency?: string;
  classifiedMetricSet?: unknown;
  companyModel?: unknown;
}

function truncate(s: string, max: number) {
  const str = String(s ?? "");
  return str.length <= max ? str : `${str.slice(0, max)}…`;
}

export function buildEvidencePacket(input: EvidencePacketInput): string {
  const { sectionName, sectionResponses, manualQuestionKeys, nonManualRows } = input;

  // All founder evidence (manual + deck_import) is treated as unified "company evidence"
  // No source labels shown in final output - all enhanced by AI and Knowledge Library
  const founderLines = Object.entries(sectionResponses)
    .filter(([k, v]) => manualQuestionKeys.has(k) && String(v || "").trim())
    .slice(0, 20)
    .map(([k, v]) => `- ${k}: ${truncate(String(v), 900)}`)
    .join("\n");

  // Supplementary context from system-generated sources (not founder-confirmed)
  const supplementaryLines = (nonManualRows || [])
    .filter((r) => {
      const key = String(r?.question_key ?? "");
      const prefix = key.split("_")[0]?.toLowerCase();
      const normalizedSection = sectionName.toLowerCase();
      return (
        normalizedSection.includes(prefix) ||
        (sectionName === "Market" && (prefix === "target" || prefix === "market")) ||
        (sectionName === "Competition" && prefix === "competitive")
      );
    })
    .slice(0, 10)
    .map((r) => {
      // No source labels in output - unified presentation
      return `- ${r?.question_key}: ${truncate(String(r?.answer ?? ""), 600)}`;
    })
    .join("\n");

  return [
    `=== ANALYSIS INPUT (enhanced by AI and Knowledge Library) ===`,
    `Section: ${sectionName}`,
    ``,
    `COMPANY EVIDENCE (primary data points):`,
    founderLines || "(none)",
    ``,
    `DERIVED / COMPUTED (explicitly labeled when used):`,
    input.classifiedMetricSet ? truncate(JSON.stringify(input.classifiedMetricSet), 1800) : "(none)",
    ``,
    `MODEL CONTEXT (cross-reference only):`,
    input.companyModel ? truncate(JSON.stringify(input.companyModel), 1600) : "(none)",
    ``,
    `SUPPLEMENTARY CONTEXT:`,
    supplementaryLines || "(none)",
    `=== END ANALYSIS INPUT ===`,
  ].join("\n");
}
