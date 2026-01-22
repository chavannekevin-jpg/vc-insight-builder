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

  const manualLines = Object.entries(sectionResponses)
    .filter(([k, v]) => manualQuestionKeys.has(k) && String(v || "").trim())
    .slice(0, 20)
    .map(([k, v]) => `- ${k}: ${truncate(String(v), 900)}`)
    .join("\n");

  const nonManualLines = (nonManualRows || [])
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
      const src = r?.source ?? "unknown";
      const conf = typeof r?.confidence_score === "number" ? ` (confidence ${r.confidence_score})` : "";
      return `- ${r?.question_key}: ${truncate(String(r?.answer ?? ""), 600)} [source=${src}${conf}]`;
    })
    .join("\n");

  return [
    `=== WRITER INPUT CONTRACT (v3 evidence packet) ===`,
    `Section: ${sectionName}`,
    ``,
    `HARD EVIDENCE (manual founder inputs only; these are the ONLY assertable facts):`,
    manualLines || "(none)",
    ``,
    `DERIVED / COMPUTED (may be used ONLY if explicitly labeled as derived):`,
    input.classifiedMetricSet ? truncate(JSON.stringify(input.classifiedMetricSet), 1800) : "(none)",
    ``,
    `MODEL CONTEXT (cross-check only; do not invent facts from it):`,
    input.companyModel ? truncate(JSON.stringify(input.companyModel), 1600) : "(none)",
    ``,
    `NON-FOUNDER CONTEXT (hypotheses; never attribute to founder; never penalize for its numbers):`,
    nonManualLines || "(none)",
    `=== END WRITER INPUT CONTRACT ===`,
  ].join("\n");
}
