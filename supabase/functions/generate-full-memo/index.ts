import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Keep edge-function typing loose (Supabase types are not available in Deno runtime).
async function fetchKBContext(
  supabaseClient: any,
  opts: { geography?: string; stage?: string; sector?: string | null },
) {
  const geography = opts.geography ?? "Europe";
  const stage = opts.stage;
  const sector = opts.sector ?? null;

  const { data: reportSources } = await supabaseClient
    .from("kb_sources")
    .select("id,title,publisher,publication_date")
    .eq("status", "active")
    .eq("content_kind", "report")
    .eq("geography_scope", geography)
    .order("publication_date", { ascending: false, nullsFirst: false })
    .limit(5);

  const { data: frameworkSources } = await supabaseClient
    .from("kb_sources")
    .select("id,title,publisher,publication_date")
    .eq("status", "active")
    .eq("content_kind", "framework")
    .eq("geography_scope", geography)
    .order("publication_date", { ascending: false, nullsFirst: false })
    .limit(10);

  const reportSourceIds = (reportSources || []).map((s: any) => s.id).filter(Boolean);
  const frameworkSourceIds = (frameworkSources || []).map((s: any) => s.id).filter(Boolean);

  if (reportSourceIds.length === 0 && frameworkSourceIds.length === 0) return "";

  // Balanced matching strategy:
  // 1) Try stage+sector
  // 2) Fallback to stage
  // 3) Fallback to sector
  // 4) Fallback to anything in geography
  async function fetchBenchmarks(filters: { stage?: string; sector?: string | null }) {
    let q = supabaseClient
      .from("kb_benchmarks")
      .select(
        "geography_scope,region,stage,sector,business_model,timeframe_label,sample_size,currency,metric_key,metric_label,median_value,p25_value,p75_value,unit,notes,source_id",
      )
      .in("source_id", reportSourceIds)
      .eq("geography_scope", geography)
      .order("updated_at", { ascending: false })
      .limit(60);

    if (filters.stage) q = q.eq("stage", filters.stage);
    if (filters.sector) q = q.eq("sector", filters.sector);
    const { data } = await q;
    return (data || []) as any[];
  }

  async function fetchMarketNotes(filters: { sector?: string | null }) {
    let q = supabaseClient
      .from("kb_market_notes")
      .select(
        "geography_scope,region,sector,timeframe_label,headline,summary,key_points,source_id",
      )
      .in("source_id", reportSourceIds)
      .eq("geography_scope", geography)
      .order("updated_at", { ascending: false })
      .limit(25);
    if (filters.sector) q = q.eq("sector", filters.sector);
    const { data } = await q;
    return (data || []) as any[];
  }

  async function fetchFrameworks(filters: { sector?: string | null }) {
    let q = supabaseClient
      .from("kb_frameworks")
      .select("geography_scope,region,sector,title,summary,key_points,tags,source_id")
      .in("source_id", frameworkSourceIds)
      .eq("geography_scope", geography)
      .order("updated_at", { ascending: false })
      .limit(20);

    // Global frameworks (sector IS NULL) should always be available alongside sector-matched ones.
    if (filters.sector) q = q.or(`sector.eq.${filters.sector},sector.is.null`);
    const { data } = await q;
    return (data || []) as any[];
  }

  let benchmarks: any[] = [];
  if (reportSourceIds.length > 0) {
    if (stage && sector) benchmarks = await fetchBenchmarks({ stage, sector });
    if (benchmarks.length === 0 && stage) benchmarks = await fetchBenchmarks({ stage });
    if (benchmarks.length === 0 && sector) benchmarks = await fetchBenchmarks({ sector });
    if (benchmarks.length === 0) benchmarks = await fetchBenchmarks({});
  }

  let marketNotes: any[] = [];
  if (reportSourceIds.length > 0) {
    if (sector) marketNotes = await fetchMarketNotes({ sector });
    if (marketNotes.length === 0) marketNotes = await fetchMarketNotes({});
  }

  let frameworks: any[] = [];
  if (frameworkSourceIds.length > 0) {
    if (sector) frameworks = await fetchFrameworks({ sector });
    if (frameworks.length === 0) frameworks = await fetchFrameworks({});
  }

  const reportSourcesStr = (reportSources || [])
    .map((s: any) =>
      `- ${s.publisher ?? "Unknown publisher"} — ${s.title ?? "Untitled"}${s.publication_date ? ` (${s.publication_date})` : ""} [${s.id}]`,
    )
    .join("\n");

  const frameworkSourcesStr = (frameworkSources || [])
    .map((s: any) =>
      `- ${s.publisher ?? "Unknown publisher"} — ${s.title ?? "Untitled"}${s.publication_date ? ` (${s.publication_date})` : ""} [${s.id}]`,
    )
    .join("\n");

  const benchStr = (benchmarks || [])
    .slice(0, 30)
    .map((b: any) => {
      const range =
        b.p25_value != null || b.p75_value != null
          ? ` (p25 ${b.p25_value ?? "?"}, p75 ${b.p75_value ?? "?"})`
          : "";
      return `- [${b.source_id}] ${b.stage}${b.sector ? ` / ${b.sector}` : ""}: ${b.metric_key}${b.metric_label ? ` (${b.metric_label})` : ""} = median ${b.median_value ?? "?"}${range}${b.unit ? ` ${b.unit}` : ""}${b.currency ? ` (${b.currency})` : ""}`;
    })
    .join("\n");

  const notesStr = (marketNotes || [])
    .slice(0, 10)
    .map((n: any) => `- [${n.source_id}] ${n.headline ?? "Market note"}: ${n.summary}`)
    .join("\n");

  const frameworksStr = (frameworks || [])
    .slice(0, 10)
    .map((f: any) => {
      const title = f.title ? `${f.title}` : "Framework";
      const sectorLabel = f.sector ? ` / ${f.sector}` : "";
      return `- [${f.source_id}] ${title}${sectorLabel}: ${String(f.summary ?? "").slice(0, 1200)}`;
    })
    .join("\n");

  const reportBlock = reportSourceIds.length
    ? `\n\n=== EUROPE KNOWLEDGE BASE (benchmarks + market notes) ===\nUse these to calibrate stage-appropriate expectations and to add Europe-specific market context where relevant. Cite sources by publisher/title/date when you use a benchmark.\n\nSOURCES:\n${reportSourcesStr}\n\nBENCHMARK ROWS (filtered):\n${benchStr || "(none matched)"}\n\nMARKET NOTES (sample):\n${notesStr || "(none)"}\n=== END EUROPE KNOWLEDGE BASE ===`
    : "";

  const frameworkBlock = frameworkSourceIds.length
    ? `\n\n=== EUROPE FRAMEWORKS (methodology) ===\nUse these as methodological guidance and evaluation heuristics (not as quantitative benchmarks). Prefer sector-matched frameworks, but ALWAYS also consider global frameworks.\nIMPORTANT: Do NOT mention frameworks, publishers, source IDs, or citations in the final memo. Use them implicitly to structure your reasoning.\n\nSOURCES (internal only):\n${frameworkSourcesStr}\n\nFRAMEWORK SUMMARIES (sample):\n${frameworksStr || "(none)"}\n=== END EUROPE FRAMEWORKS ===`
    : "";

  if (frameworks?.length) {
    console.log(
      `[kb] frameworks_selected count=${frameworks.length} sector=${sector ?? "(none)"} sources=${[
        ...new Set((frameworks || []).map((f: any) => f.source_id).filter(Boolean)),
      ].join(",")}`,
    );
  }

  return `${reportBlock}${frameworkBlock}`;
}

// =============================================================================
// COMPANY MODEL TYPE IMPORTS (inline for edge function)
// =============================================================================
interface CompanyModel {
  id: string;
  companyId: string;
  companyName: string;
  stage: string;
  category: string | null;
  description: string | null;
  builtAt: string;
  version: number;
  financial: any;
  customer: any;
  market: any;
  traction: any;
  team: any;
  defensibility: any;
  gtm: any;
  temporal: any;
  coherence: {
    overallCoherence: string;
    score: number;
    checks: Record<string, { passed: boolean; explanation: string; severity: string }>;
    conditionalHypotheses: { hypothesis: string; dependsOn: string[]; probability: string }[];
    resolutionQuestions: string[];
  };
  discrepancies: { field: string; statedValue: any; computedValue: any; discrepancyType: string; severity: string; explanation: string }[];
  sourceResponses: Record<string, string>;
}

// =============================================================================
// ADAPTIVE BENCHMARK COHORT SYSTEM (inline for edge function)
// =============================================================================
interface BenchmarkCohort {
  id: string;
  name: string;
  benchmarks: {
    growth: { exceptional: number; good: number; average: number; concerning: number; description: string };
    ltvCacRatio: { exceptional: number; good: number; minimum: number; description: string };
    paybackMonths: { exceptional: number; good: number; acceptable: number; description: string };
    netRevenueRetention: { exceptional: number; good: number; acceptable: number; description: string };
    grossChurn: { exceptional: number; good: number; concerning: number; description: string };
    magicNumber: { efficient: number; acceptable: number; inefficient: number; description: string };
    grossMargin: { exceptional: number; good: number; minimum: number; description: string };
    salesCycleWeeks: { fast: number; typical: number; long: number; description: string };
    cac: { low: number; typical: number; high: number; description: string };
    tractionExpectations: { month3: string; month6: string; month12: string; month18: string; description: string };
  };
  scoringAdjustments: { maxTractionScore: number; maxBusinessModelScore: number; maxSolutionScore: number; maxTeamScore: number; maxMarketScore: number };
  comparables: string[];
}

interface CohortMatch {
  cohort: BenchmarkCohort;
  matchScore: number;
  matchedCriteria: string[];
}

// Benchmark cohort definitions (simplified for edge function)
const BENCHMARK_COHORTS: Record<string, BenchmarkCohort> = {
  'plg-micro-preseed': {
    id: 'plg-micro-preseed', name: 'PLG Micro-ACV Pre-Seed',
    benchmarks: {
      growth: { exceptional: 25, good: 15, average: 10, concerning: 5, description: 'Monthly growth for PLG pre-seed' },
      ltvCacRatio: { exceptional: 5, good: 3, minimum: 2, description: 'PLG should have low CAC' },
      paybackMonths: { exceptional: 3, good: 6, acceptable: 12, description: 'Fast payback for low-ACV' },
      netRevenueRetention: { exceptional: 120, good: 105, acceptable: 95, description: 'NRR harder at micro-ACV' },
      grossChurn: { exceptional: 2, good: 4, concerning: 7, description: 'Monthly churn' },
      magicNumber: { efficient: 1.0, acceptable: 0.7, inefficient: 0.5, description: 'PLG should be efficient' },
      grossMargin: { exceptional: 85, good: 75, minimum: 65, description: 'Software margins' },
      salesCycleWeeks: { fast: 0.5, typical: 1, long: 2, description: 'Self-serve converts in days' },
      cac: { low: 50, typical: 150, high: 300, description: 'CAC for micro-ACV PLG' },
      tractionExpectations: { month3: '100+ signups, 10+ paying', month6: '500+ signups, $1-5K MRR', month12: '2K+ signups, $10-25K MRR', month18: '5K+ signups, $25-50K MRR', description: 'PLG micro-ACV milestones' }
    },
    scoringAdjustments: { maxTractionScore: 35, maxBusinessModelScore: 45, maxSolutionScore: 55, maxTeamScore: 70, maxMarketScore: 65 },
    comparables: ['Notion (early)', 'Calendly (early)', 'Loom (early)']
  },
  'plg-smb-seed': {
    id: 'plg-smb-seed', name: 'PLG SMB Seed',
    benchmarks: {
      growth: { exceptional: 20, good: 15, average: 10, concerning: 5, description: 'Monthly growth for PLG SMB seed' },
      ltvCacRatio: { exceptional: 5, good: 3, minimum: 2.5, description: 'Higher ACV allows some sales touch' },
      paybackMonths: { exceptional: 6, good: 12, acceptable: 18, description: 'SMB ACV allows slightly longer payback' },
      netRevenueRetention: { exceptional: 130, good: 115, acceptable: 100, description: 'SMB expansion via seats/usage' },
      grossChurn: { exceptional: 2, good: 3, concerning: 5, description: 'Monthly churn' },
      magicNumber: { efficient: 1.0, acceptable: 0.75, inefficient: 0.5, description: 'Efficiency with sales-assist' },
      grossMargin: { exceptional: 85, good: 75, minimum: 65, description: 'Software margins' },
      salesCycleWeeks: { fast: 1, typical: 2, long: 4, description: 'Quick cycles with sales assist' },
      cac: { low: 500, typical: 1500, high: 3000, description: 'Blended CAC for PLG with sales' },
      tractionExpectations: { month3: '50+ active, initial paying', month6: '100+ paying, $5-15K MRR', month12: '300+ paying, $25-75K MRR', month18: '500+ paying, $75-150K MRR', description: 'Seed PLG SMB milestones' }
    },
    scoringAdjustments: { maxTractionScore: 55, maxBusinessModelScore: 65, maxSolutionScore: 70, maxTeamScore: 75, maxMarketScore: 70 },
    comparables: ['Airtable (seed)', 'Linear (seed)', 'Zapier (early)']
  },
  'inside-sales-midmarket-seed': {
    id: 'inside-sales-midmarket-seed', name: 'Inside Sales Mid-Market Seed',
    benchmarks: {
      growth: { exceptional: 15, good: 10, average: 7, concerning: 3, description: 'Monthly growth for inside sales' },
      ltvCacRatio: { exceptional: 5, good: 3, minimum: 2, description: 'Higher CAC acceptable with higher ACV' },
      paybackMonths: { exceptional: 12, good: 18, acceptable: 24, description: 'Longer payback with higher ACV' },
      netRevenueRetention: { exceptional: 140, good: 120, acceptable: 105, description: 'Strong expansion potential' },
      grossChurn: { exceptional: 0.5, good: 1, concerning: 2, description: 'Monthly churn' },
      magicNumber: { efficient: 0.8, acceptable: 0.6, inefficient: 0.4, description: 'Higher tolerance for CAC' },
      grossMargin: { exceptional: 80, good: 70, minimum: 60, description: 'May include implementation' },
      salesCycleWeeks: { fast: 4, typical: 8, long: 12, description: 'Multi-stakeholder deals' },
      cac: { low: 5000, typical: 15000, high: 30000, description: 'CAC for inside sales mid-market' },
      tractionExpectations: { month3: '5-10 qualified opps', month6: '3-5 closed, $50-100K ARR', month12: '10-20 customers, $200-500K ARR', month18: '20-40 customers, $500K-1M ARR', description: 'Mid-market seed milestones' }
    },
    scoringAdjustments: { maxTractionScore: 50, maxBusinessModelScore: 60, maxSolutionScore: 65, maxTeamScore: 75, maxMarketScore: 70 },
    comparables: ['Gong (early)', 'Lattice (early)', 'Rippling (seed)']
  },
  'enterprise-sales-seed': {
    id: 'enterprise-sales-seed', name: 'Enterprise Sales Seed',
    benchmarks: {
      growth: { exceptional: 10, good: 7, average: 5, concerning: 2, description: 'Monthly growth for enterprise' },
      ltvCacRatio: { exceptional: 5, good: 3, minimum: 2, description: 'High CAC offset by high ACV' },
      paybackMonths: { exceptional: 18, good: 24, acceptable: 36, description: 'Multi-year contracts allow longer payback' },
      netRevenueRetention: { exceptional: 150, good: 130, acceptable: 115, description: 'Substantial enterprise expansion' },
      grossChurn: { exceptional: 0.3, good: 0.5, concerning: 1, description: 'Monthly churn - enterprise sticky' },
      magicNumber: { efficient: 0.7, acceptable: 0.5, inefficient: 0.3, description: 'Enterprise sales is expensive' },
      grossMargin: { exceptional: 75, good: 65, minimum: 55, description: 'Often includes pro services' },
      salesCycleWeeks: { fast: 12, typical: 24, long: 52, description: 'Enterprise deals take 3-12 months' },
      cac: { low: 30000, typical: 75000, high: 150000, description: 'Enterprise CAC' },
      tractionExpectations: { month3: '3-5 enterprise pilots', month6: '1-2 contracts, $100-300K ARR', month12: '3-5 customers, $300-700K ARR', month18: '5-10 customers, $700K-1.5M ARR', description: 'Enterprise seed milestones' }
    },
    scoringAdjustments: { maxTractionScore: 45, maxBusinessModelScore: 55, maxSolutionScore: 60, maxTeamScore: 80, maxMarketScore: 70 },
    comparables: ['Snowflake (early)', 'Databricks (early)']
  },
  'marketplace-seed': {
    id: 'marketplace-seed', name: 'Marketplace Seed',
    benchmarks: {
      growth: { exceptional: 30, good: 20, average: 12, concerning: 5, description: 'GMV growth - must show network effects' },
      ltvCacRatio: { exceptional: 4, good: 2.5, minimum: 1.5, description: 'Supply-side CAC often high' },
      paybackMonths: { exceptional: 6, good: 12, acceptable: 18, description: 'Recover CAC quickly' },
      netRevenueRetention: { exceptional: 130, good: 110, acceptable: 95, description: 'Repeat purchase rate' },
      grossChurn: { exceptional: 3, good: 5, concerning: 10, description: 'Monthly churn - low switching costs' },
      magicNumber: { efficient: 0.8, acceptable: 0.5, inefficient: 0.3, description: 'Marketing efficiency' },
      grossMargin: { exceptional: 70, good: 50, minimum: 30, description: 'Take rate minus fulfillment' },
      salesCycleWeeks: { fast: 0.5, typical: 1, long: 2, description: 'Transaction velocity matters' },
      cac: { low: 30, typical: 100, high: 300, description: 'Demand-side CAC' },
      tractionExpectations: { month3: 'Liquidity in one geo/vertical', month6: '$50-200K GMV/mo, 15-25% take', month12: '$200-500K GMV/mo, repeat behavior', month18: '$500K-1M GMV/mo, network effects', description: 'Marketplace milestones' }
    },
    scoringAdjustments: { maxTractionScore: 50, maxBusinessModelScore: 55, maxSolutionScore: 60, maxTeamScore: 75, maxMarketScore: 70 },
    comparables: ['Airbnb (early)', 'DoorDash (early)', 'Faire (early)']
  },
  'preseed-general': {
    id: 'preseed-general', name: 'Pre-Seed General',
    benchmarks: {
      growth: { exceptional: 20, good: 10, average: 5, concerning: 0, description: 'Any traction is signal at pre-seed' },
      ltvCacRatio: { exceptional: 4, good: 2, minimum: 1, description: 'Unit economics often unknown' },
      paybackMonths: { exceptional: 6, good: 12, acceptable: 24, description: 'Payback is hypothesis' },
      netRevenueRetention: { exceptional: 120, good: 100, acceptable: 80, description: 'NRR often unknown' },
      grossChurn: { exceptional: 3, good: 5, concerning: 10, description: 'Early churn acceptable' },
      magicNumber: { efficient: 0.7, acceptable: 0.4, inefficient: 0.2, description: 'Often not relevant' },
      grossMargin: { exceptional: 80, good: 60, minimum: 40, description: 'Model dependent' },
      salesCycleWeeks: { fast: 1, typical: 4, long: 12, description: 'Shorter is better' },
      cac: { low: 100, typical: 500, high: 2000, description: 'CAC varies widely' },
      tractionExpectations: { month3: 'Waitlist, LOIs, beta users', month6: 'First paying customers', month12: '$5-25K MRR', month18: '$25-75K MRR, PMF signals', description: 'General pre-seed' }
    },
    scoringAdjustments: { maxTractionScore: 30, maxBusinessModelScore: 40, maxSolutionScore: 50, maxTeamScore: 70, maxMarketScore: 65 },
    comparables: ['Stage-appropriate comparisons']
  },
  'seed-general': {
    id: 'seed-general', name: 'Seed General',
    benchmarks: {
      growth: { exceptional: 15, good: 10, average: 7, concerning: 3, description: 'Monthly growth at seed' },
      ltvCacRatio: { exceptional: 4, good: 3, minimum: 2, description: 'Early unit economics data expected' },
      paybackMonths: { exceptional: 12, good: 18, acceptable: 24, description: 'Payback trackable' },
      netRevenueRetention: { exceptional: 130, good: 110, acceptable: 95, description: 'NRR becoming important' },
      grossChurn: { exceptional: 2, good: 4, concerning: 7, description: 'Churn stabilizing with PMF' },
      magicNumber: { efficient: 0.8, acceptable: 0.6, inefficient: 0.4, description: 'Sales efficiency expected' },
      grossMargin: { exceptional: 80, good: 70, minimum: 55, description: 'Heading toward target' },
      salesCycleWeeks: { fast: 2, typical: 6, long: 16, description: 'Sales cycle understood' },
      cac: { low: 500, typical: 2000, high: 10000, description: 'Must justify with LTV' },
      tractionExpectations: { month3: 'Consistent growth, refining ICP', month6: '$50-150K ARR, PMF signals', month12: '$150-500K ARR, repeatable sales', month18: '$500K-1M ARR, Series A ready', description: 'General seed' }
    },
    scoringAdjustments: { maxTractionScore: 55, maxBusinessModelScore: 65, maxSolutionScore: 70, maxTeamScore: 75, maxMarketScore: 70 },
    comparables: ['Stage-appropriate comparisons']
  }
};

// Select appropriate benchmark cohort based on company characteristics
function selectBenchmarkCohort(model: CompanyModel | null, stage: string): CohortMatch {
  // Extract characteristics from Company Model
  const businessModel = model?.financial?.pricing?.model || null;
  const acvBand = model?.financial?.pricing?.acvBand || null;
  const salesMotion = model?.gtm?.motion?.primary || model?.customer?.acquisition?.salesMotion || null;
  const customerSegment = model?.customer?.icp?.segment || null;

  // Score each cohort
  let bestMatch: CohortMatch | null = null;
  let highestScore = -1;

  for (const [id, cohort] of Object.entries(BENCHMARK_COHORTS)) {
    let score = 0;
    const matched: string[] = [];

    // Stage matching (basic)
    const isPreSeed = stage === 'Pre-Seed' || stage === 'Idea';
    const isSeed = stage === 'Seed';
    
    if (id.includes('preseed') && isPreSeed) { score += 3; matched.push('stage'); }
    else if (id.includes('seed') && !id.includes('preseed') && isSeed) { score += 3; matched.push('stage'); }
    else if (id === 'preseed-general' && isPreSeed) { score += 1; matched.push('stage-fallback'); }
    else if (id === 'seed-general' && isSeed) { score += 1; matched.push('stage-fallback'); }
    else continue; // Skip non-matching stages

    // Business model matching
    if (businessModel === 'marketplace' && id.includes('marketplace')) { score += 3; matched.push('marketplace'); }
    if (businessModel === 'subscription' || businessModel === 'freemium') {
      if (salesMotion === 'self-serve' || salesMotion === 'plg') {
        if (id.includes('plg')) { score += 2; matched.push('plg'); }
      } else if (salesMotion === 'inside-sales' || salesMotion === 'hybrid') {
        if (id.includes('inside-sales')) { score += 2; matched.push('inside-sales'); }
      } else if (salesMotion === 'field-sales') {
        if (id.includes('enterprise')) { score += 2; matched.push('enterprise'); }
      }
    }

    // ACV band matching
    if (acvBand === 'micro' && id.includes('micro')) { score += 2; matched.push('micro-acv'); }
    if (acvBand === 'smb' && id.includes('smb')) { score += 2; matched.push('smb-acv'); }
    if (acvBand === 'mid-market' && id.includes('midmarket')) { score += 2; matched.push('mid-market-acv'); }
    if (acvBand === 'enterprise' && id.includes('enterprise')) { score += 2; matched.push('enterprise-acv'); }

    // Customer segment matching
    if (customerSegment === 'enterprise' && id.includes('enterprise')) { score += 1; matched.push('enterprise-segment'); }
    if (customerSegment === 'mid-market' && id.includes('midmarket')) { score += 1; matched.push('mid-market-segment'); }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = { cohort, matchScore: score, matchedCriteria: matched };
    }
  }

  // Fallback
  if (!bestMatch || highestScore < 2) {
    const fallback = stage === 'Seed' ? BENCHMARK_COHORTS['seed-general'] : BENCHMARK_COHORTS['preseed-general'];
    return { cohort: fallback, matchScore: 1, matchedCriteria: ['stage-fallback'] };
  }

  return bestMatch;
}

// Format benchmark context for prompts
function formatBenchmarkContext(cohortMatch: CohortMatch): string {
  const { cohort, matchScore, matchedCriteria } = cohortMatch;
  const b = cohort.benchmarks;
  const s = cohort.scoringAdjustments;

  return `
=== ADAPTIVE BENCHMARK COHORT: ${cohort.name} ===
Match Quality: ${matchScore >= 6 ? 'Excellent' : matchScore >= 4 ? 'Good' : matchScore >= 2 ? 'Partial' : 'Fallback'}
Matched On: ${matchedCriteria.join(', ')}
Comparable Companies: ${cohort.comparables.join(', ')}

--- GROWTH BENCHMARKS ---
Exceptional (Top 10%): ${b.growth.exceptional}% MoM | Good: ${b.growth.good}% | Average: ${b.growth.average}% | Concerning: <${b.growth.concerning}%

--- UNIT ECONOMICS ---
LTV:CAC: Exceptional >${b.ltvCacRatio.exceptional}x | Good >${b.ltvCacRatio.good}x | Min ${b.ltvCacRatio.minimum}x
Payback: Exceptional <${b.paybackMonths.exceptional}mo | Good <${b.paybackMonths.good}mo | Acceptable <${b.paybackMonths.acceptable}mo
CAC: Low <$${b.cac.low} | Typical $${b.cac.typical} | High >$${b.cac.high}

--- RETENTION ---
NRR: Exceptional >${b.netRevenueRetention.exceptional}% | Good >${b.netRevenueRetention.good}% | Acceptable >${b.netRevenueRetention.acceptable}%
Gross Churn: Exceptional <${b.grossChurn.exceptional}% | Good <${b.grossChurn.good}% | Concerning >${b.grossChurn.concerning}%

--- EFFICIENCY ---
Magic Number: Efficient >${b.magicNumber.efficient} | Acceptable >${b.magicNumber.acceptable} | Inefficient <${b.magicNumber.inefficient}
Gross Margin: Exceptional >${b.grossMargin.exceptional}% | Good >${b.grossMargin.good}% | Min >${b.grossMargin.minimum}%
Sales Cycle: Fast <${b.salesCycleWeeks.fast}wk | Typical ${b.salesCycleWeeks.typical}wk | Long >${b.salesCycleWeeks.long}wk

--- TRACTION EXPECTATIONS ---
Month 3: ${b.tractionExpectations.month3}
Month 6: ${b.tractionExpectations.month6}
Month 12: ${b.tractionExpectations.month12}
Month 18: ${b.tractionExpectations.month18}

--- SCORING CAPS FOR THIS COHORT ---
Max Traction: ${s.maxTractionScore} | Max Business Model: ${s.maxBusinessModelScore} | Max Solution: ${s.maxSolutionScore}
Max Team: ${s.maxTeamScore} | Max Market: ${s.maxMarketScore}

=== END BENCHMARK COHORT ===`;
}

// =============================================================================
// CONDITIONAL ASSESSMENT SYSTEM (Week 5)
// =============================================================================

interface DataCompletenessResult {
  overall: number;
  bySectionArea: Record<string, number>;
  missingCritical: string[];
  missingOptional: string[];
  assumptions: string[];
  whatWouldChangeAssessment: string[];
}

// Calculate data completeness for each section based on CompanyModel
function calculateDataCompleteness(model: CompanyModel | null, sectionName: string): DataCompletenessResult {
  if (!model) {
    return {
      overall: 10,
      bySectionArea: {},
      missingCritical: ['Company model not available'],
      missingOptional: [],
      assumptions: ['All assessments are estimated without structured data'],
      whatWouldChangeAssessment: ['Provide complete company data to get accurate assessments']
    };
  }

  const result: DataCompletenessResult = {
    overall: 0,
    bySectionArea: {},
    missingCritical: [],
    missingOptional: [],
    assumptions: [],
    whatWouldChangeAssessment: []
  };

  switch (sectionName) {
    case 'Problem':
      const problemAreas = {
        customerValidation: model.customer?.metrics?.totalCustomers ? 70 : 20,
        marketEvidence: model.market?.dynamics?.tailwinds?.length ? 60 : 30,
        painQuantification: model.customer?.icp?.persona ? 50 : 20
      };
      result.bySectionArea = problemAreas;
      result.overall = Math.round(Object.values(problemAreas).reduce((a, b) => a + b, 0) / 3);
      if (!model.customer?.metrics?.totalCustomers) {
        result.missingCritical.push('Customer interview/validation data');
        result.whatWouldChangeAssessment.push('Add 10+ customer interviews with quantified pain points');
      }
      if (!model.customer?.icp?.persona) {
        result.missingOptional.push('Detailed ICP persona');
        result.whatWouldChangeAssessment.push('Define specific ICP with job titles, company size, pain triggers');
      }
      break;

    case 'Solution':
      const solutionAreas = {
        productMaturity: model.traction?.current?.stage ? (model.traction.current.stage === 'revenue' ? 80 : 50) : 20,
        retentionProof: model.customer?.retention?.churnRate ? 70 : 15,
        technicalMoat: model.defensibility?.currentMoats?.strength ? 60 : 25
      };
      result.bySectionArea = solutionAreas;
      result.overall = Math.round(Object.values(solutionAreas).reduce((a, b) => a + b, 0) / 3);
      if (!model.customer?.retention?.churnRate) {
        result.missingCritical.push('Retention/churn data');
        result.whatWouldChangeAssessment.push('Provide 3+ months of cohort retention data');
      }
      if (!model.defensibility?.currentMoats?.type?.length) {
        result.missingOptional.push('Defensibility evidence');
        result.whatWouldChangeAssessment.push('Document proprietary tech, data assets, or network effects');
      }
      break;

    case 'Market':
      const marketAreas = {
        tamMethodology: model.market?.sizing?.computed?.bottomUpTAM ? 80 : (model.market?.sizing?.stated?.tam ? 40 : 10),
        timing: model.market?.dynamics?.timing ? 60 : 20,
        competition: model.market?.competition?.directCompetitors?.length ? 70 : 30
      };
      result.bySectionArea = marketAreas;
      result.overall = Math.round(Object.values(marketAreas).reduce((a, b) => a + b, 0) / 3);
      if (!model.market?.sizing?.computed?.bottomUpTAM) {
        result.missingCritical.push('Bottom-up TAM calculation');
        result.whatWouldChangeAssessment.push('Provide ICP count x ACV calculation with sources');
        result.assumptions.push('TAM estimated from top-down industry reports');
      }
      if (model.market?.sizing?.tamPlausibility === 'implausible') {
        result.whatWouldChangeAssessment.push('Reconcile stated TAM with bottom-up calculation');
      }
      break;

    case 'Competition':
      const compAreas = {
        competitorDetail: model.market?.competition?.directCompetitors?.length ? 70 : 20,
        moatEvidence: model.defensibility?.currentMoats?.strength ? 60 : 25,
        positioning: model.defensibility?.currentMoats?.type?.length ? 55 : 30
      };
      result.bySectionArea = compAreas;
      result.overall = Math.round(Object.values(compAreas).reduce((a, b) => a + b, 0) / 3);
      if (!model.market?.competition?.directCompetitors?.length) {
        result.missingCritical.push('Competitor analysis');
        result.whatWouldChangeAssessment.push('Map 3-5 direct competitors with funding, pricing, positioning');
      }
      break;

    case 'Team':
      const teamAreas = {
        founderBackground: model.team?.founders?.founderMarketFit ? 70 : 30,
        teamComposition: model.team?.team?.totalSize ? 60 : 20,
        credibility: model.team?.credibility?.domainExpertise ? 65 : 25
      };
      result.bySectionArea = teamAreas;
      result.overall = Math.round(Object.values(teamAreas).reduce((a, b) => a + b, 0) / 3);
      if (!model.team?.founders?.founderMarketFit) {
        result.missingOptional.push('Founder-market fit narrative');
        result.whatWouldChangeAssessment.push('Explain why this team is uniquely qualified');
      }
      if (model.team?.team?.criticalGaps?.length) {
        result.whatWouldChangeAssessment.push(`Fill critical gaps: ${model.team.team.criticalGaps.join(', ')}`);
      }
      break;

    case 'Business Model':
      const bizAreas = {
        unitEconomics: model.financial?.unitEconomics?.ltvCacRatio ? 80 : (model.financial?.pricing?.acv ? 40 : 15),
        revenueProof: model.financial?.revenue?.stated?.mrr ? 70 : 20,
        marginData: model.financial?.unitEconomics?.grossMargin ? 65 : 30
      };
      result.bySectionArea = bizAreas;
      result.overall = Math.round(Object.values(bizAreas).reduce((a, b) => a + b, 0) / 3);
      if (!model.financial?.unitEconomics?.ltvCacRatio) {
        result.missingCritical.push('Unit economics (LTV:CAC)');
        result.whatWouldChangeAssessment.push('Calculate LTV:CAC with actual CAC and retention data');
        result.assumptions.push('Unit economics estimated from pricing and industry benchmarks');
      }
      if (!model.financial?.revenue?.stated?.mrr) {
        result.missingCritical.push('Revenue data');
        result.whatWouldChangeAssessment.push('Provide current MRR/ARR with growth trend');
      }
      break;

    case 'Traction':
      const tractionAreas = {
        revenueGrowth: model.traction?.growth?.stated?.monthlyGrowthRate ? 75 : 20,
        customerMetrics: model.customer?.metrics?.paidCustomers ? 70 : 25,
        retentionCohorts: model.customer?.retention?.nrr ? 80 : 30
      };
      result.bySectionArea = tractionAreas;
      result.overall = Math.round(Object.values(tractionAreas).reduce((a, b) => a + b, 0) / 3);
      if (!model.traction?.growth?.stated?.monthlyGrowthRate) {
        result.missingCritical.push('Growth rate data');
        result.whatWouldChangeAssessment.push('Provide month-over-month growth for last 6 months');
      }
      if (!model.customer?.retention?.nrr) {
        result.missingOptional.push('Net revenue retention');
        result.whatWouldChangeAssessment.push('Calculate NRR from cohort expansion/contraction');
      }
      break;

    case 'Vision':
      const visionAreas = {
        milestones: model.temporal?.projections?.length ? 60 : 30,
        exitPath: model.market?.sizing?.stated?.tam ? 50 : 20,
        runway: model.financial?.burn?.runway ? 70 : 25
      };
      result.bySectionArea = visionAreas;
      result.overall = Math.round(Object.values(visionAreas).reduce((a, b) => a + b, 0) / 3);
      if (!model.financial?.burn?.runway) {
        result.missingOptional.push('Runway calculation');
        result.whatWouldChangeAssessment.push('Provide burn rate and cash position');
      }
      break;

    default:
      result.overall = 40;
      result.assumptions.push('Section completeness estimated from available data');
  }

  // Add coherence-based adjustments
  if (model.coherence?.score < 50) {
    result.overall = Math.max(20, result.overall - 20);
    result.assumptions.push(`Low coherence score (${model.coherence.score}/100) - data may be inconsistent`);
  }

  // Add discrepancy-based adjustments
  if (model.discrepancies?.length > 2) {
    result.overall = Math.max(20, result.overall - 10);
    result.whatWouldChangeAssessment.push('Resolve data discrepancies between stated and computed values');
  }

  return result;
}

// Format data completeness context for prompts
function formatDataCompletenessContext(completeness: DataCompletenessResult, sectionName: string): string {
  return `
=== DATA COMPLETENESS FOR ${sectionName.toUpperCase()} ===
Overall Data Completeness: ${completeness.overall}%
${Object.entries(completeness.bySectionArea).map(([area, score]) => `- ${area}: ${score}%`).join('\n')}

Missing Critical Data: ${completeness.missingCritical.length > 0 ? completeness.missingCritical.join(', ') : 'None'}
Missing Optional Data: ${completeness.missingOptional.length > 0 ? completeness.missingOptional.join(', ') : 'None'}
Assumptions Made: ${completeness.assumptions.length > 0 ? completeness.assumptions.join('; ') : 'None'}
What Would Change This Assessment: ${completeness.whatWouldChangeAssessment.join('; ')}
=== END DATA COMPLETENESS ===`;
}
function formatCompanyModelContext(model: CompanyModel): string {
  const sections: string[] = [];
  
  sections.push(`
=== COMPANY MODEL: RELATIONAL CONTEXT ===
This is a structured model of ${model.companyName} built from all available data.
Use this to reason RELATIONALLY - every data point only has meaning in relation to others.

**COHERENCE ASSESSMENT: ${model.coherence.overallCoherence.toUpperCase()} (Score: ${model.coherence.score}/100)**
`);

  // Financial Model Summary
  if (model.financial) {
    const fin = model.financial;
    sections.push(`
--- FINANCIAL MODEL ---
Revenue (Stated): MRR ${fin.revenue?.stated?.mrr ?? 'N/A'} | ARR ${fin.revenue?.stated?.arr ?? 'N/A'}
Revenue (Computed): Implied MRR ${fin.revenue?.computed?.mrr ?? 'N/A'} | Implied from Customers ${fin.revenue?.computed?.impliedFromCustomers ?? 'N/A'}
Pricing Model: ${fin.pricing?.model ?? 'Unknown'} | ACV: ${fin.pricing?.acv ?? 'N/A'} | ACV Band: ${fin.pricing?.acvBand ?? 'N/A'}
Unit Economics: CAC ${fin.unitEconomics?.cac ?? 'N/A'} | LTV ${fin.unitEconomics?.ltv ?? 'N/A'} | LTV:CAC ${fin.unitEconomics?.ltvCacRatio ?? 'N/A'}
Burn: ${fin.burn?.monthlyBurn ?? 'N/A'}/mo | Runway: ${fin.burn?.runway ?? 'N/A'} months | Total Raised: ${fin.burn?.totalRaised ?? 'N/A'}
`);
  }

  // Customer Model Summary
  if (model.customer) {
    const cust = model.customer;
    sections.push(`
--- CUSTOMER MODEL ---
ICP: ${cust.icp?.segment ?? 'Unknown'} | Vertical: ${cust.icp?.vertical ?? 'N/A'} | Persona: ${cust.icp?.persona ?? 'N/A'}
Customers: Total ${cust.metrics?.totalCustomers ?? 'N/A'} | Paid ${cust.metrics?.paidCustomers ?? 'N/A'} | Free ${cust.metrics?.freeUsers ?? 'N/A'}
Computed: Revenue/Customer ${cust.metrics?.computed?.revenuePerCustomer ?? 'N/A'} | Conversion ${cust.metrics?.computed?.conversionRate ?? 'N/A'}%
Retention: Churn ${cust.retention?.churnRate ?? 'N/A'}% | NRR ${cust.retention?.nrr ?? 'N/A'}% | NPS ${cust.retention?.nps ?? 'N/A'}
Acquisition: Primary Channel ${cust.acquisition?.primaryChannel ?? 'N/A'} | Sales Motion: ${cust.acquisition?.salesMotion ?? 'N/A'} | Cycle: ${cust.acquisition?.salesCycleWeeks ?? 'N/A'} weeks
`);
  }

  // Market Model Summary
  if (model.market) {
    const mkt = model.market;
    sections.push(`
--- MARKET MODEL ---
TAM (Stated): ${mkt.sizing?.stated?.tam ?? 'N/A'} | SAM: ${mkt.sizing?.stated?.sam ?? 'N/A'} | SOM: ${mkt.sizing?.stated?.som ?? 'N/A'}
TAM (Bottom-Up Computed): ${mkt.sizing?.computed?.bottomUpTAM ?? 'N/A'} | ICP Count: ${mkt.sizing?.computed?.icpCount ?? 'N/A'}
TAM Plausibility: ${mkt.sizing?.tamPlausibility ?? 'Unknown'}
Market Dynamics: Growth ${mkt.dynamics?.growthRate ?? 'N/A'}% | Maturity: ${mkt.dynamics?.maturity ?? 'N/A'} | Timing: ${mkt.dynamics?.timing ?? 'N/A'}
Tailwinds: ${(mkt.dynamics?.tailwinds || []).join(', ') || 'None identified'}
Headwinds: ${(mkt.dynamics?.headwinds || []).join(', ') || 'None identified'}
Competition: ${(mkt.competition?.directCompetitors || []).length} direct | ${(mkt.competition?.indirectCompetitors || []).length} indirect | Concentration: ${mkt.competition?.marketConcentration ?? 'N/A'}
`);
  }

  // Traction Model Summary
  if (model.traction) {
    const trac = model.traction;
    sections.push(`
--- TRACTION MODEL ---
Stage: ${trac.current?.stage ?? 'N/A'} | Months in Market: ${trac.current?.monthsInMarket ?? 'N/A'}
Growth (Stated): Monthly ${trac.growth?.stated?.monthlyGrowthRate ?? 'N/A'}% | Quarterly ${trac.growth?.stated?.quarterlyGrowthRate ?? 'N/A'}%
Growth (Computed): Implied Monthly ${trac.growth?.computed?.impliedMonthlyGrowth ?? 'N/A'}% | Consistency: ${trac.growth?.computed?.growthConsistency ?? 'N/A'}
Quality Signals: Logo Quality ${trac.qualitySignals?.logoQuality ?? 'N/A'} | Case Studies: ${trac.qualitySignals?.caseStudies ? 'Yes' : 'No'}
PMF Signals: ${(trac.qualitySignals?.productMarketFitSignals || []).join(', ') || 'None identified'}
`);
  }

  // Team Model Summary
  if (model.team) {
    const team = model.team;
    sections.push(`
--- TEAM MODEL ---
Founders: ${team.founders?.count ?? 'N/A'} | Founder-Market Fit: ${team.founders?.founderMarketFit ?? 'Unknown'}
Team Size: ${team.team?.totalSize ?? 'N/A'} | Eng: ${team.team?.breakdown?.engineering ?? 'N/A'} | Sales: ${team.team?.breakdown?.sales ?? 'N/A'}
Critical Gaps: ${(team.team?.criticalGaps || []).join(', ') || 'None identified'}
Credibility: Previous Exits: ${team.credibility?.previousExits ? 'Yes' : 'No'} | Domain Expertise: ${team.credibility?.domainExpertise ? 'Yes' : 'No'}
`);
  }

  // Defensibility Model Summary
  if (model.defensibility) {
    const def = model.defensibility;
    sections.push(`
--- DEFENSIBILITY MODEL ---
Current Moats: ${(def.currentMoats?.type || []).join(', ') || 'None'} | Strength: ${def.currentMoats?.strength ?? 'N/A'}
Future Path: ${(def.futurePath?.potentialMoats || []).join(', ') || 'N/A'} | Time to Moat: ${def.futurePath?.timeToMoat ?? 'N/A'}
Risks: Competitor ${def.risks?.competitorRisk ?? 'N/A'} | Tech Obsolescence ${def.risks?.techObsolescenceRisk ?? 'N/A'} | Regulatory ${def.risks?.regulatoryRisk ?? 'N/A'}
`);
  }

  // GTM Model Summary
  if (model.gtm) {
    const gtm = model.gtm;
    sections.push(`
--- GTM MODEL ---
Motion: ${gtm.motion?.primary ?? 'N/A'} | Sales Cycle: ${gtm.motion?.salesCycle?.weeks ?? 'N/A'} weeks (${gtm.motion?.salesCycle?.complexity ?? 'N/A'})
Primary Channel: ${gtm.channels?.primary ?? 'N/A'}
GTM-Traction Alignment: ${gtm.alignment?.isAligned ? 'ALIGNED' : 'MISALIGNED'} - ${gtm.alignment?.explanation ?? 'N/A'}
`);
  }

  // Coherence Issues (CRITICAL for relational reasoning)
  if (model.coherence?.checks) {
    const failedChecks = Object.entries(model.coherence.checks)
      .filter(([_, check]) => !check.passed)
      .map(([name, check]) => `- ${name}: ${check.explanation} [${check.severity}]`);
    
    if (failedChecks.length > 0) {
      sections.push(`
--- COHERENCE ISSUES (ADDRESS THESE IN YOUR ANALYSIS) ---
${failedChecks.join('\n')}
`);
    }
  }

  // Discrepancies (stated vs computed)
  if (model.discrepancies && model.discrepancies.length > 0) {
    const discrepancyStr = model.discrepancies
      .map(d => `- ${d.field}: Stated "${d.statedValue}" vs Computed "${d.computedValue}" (${d.severity}) - ${d.explanation}`)
      .join('\n');
    sections.push(`
--- DISCREPANCIES DETECTED ---
${discrepancyStr}
`);
  }

  // Conditional Hypotheses
  if (model.coherence?.conditionalHypotheses && model.coherence.conditionalHypotheses.length > 0) {
    const hypothesesStr = model.coherence.conditionalHypotheses
      .map(h => `- ${h.hypothesis} (${h.probability}) - Depends on: ${h.dependsOn.join(', ')}`)
      .join('\n');
    sections.push(`
--- CONDITIONAL HYPOTHESES (USE THESE FOR "X IF Y" FRAMING) ---
${hypothesesStr}
`);
  }

  // Resolution Questions
  if (model.coherence?.resolutionQuestions && model.coherence.resolutionQuestions.length > 0) {
    sections.push(`
--- KEY QUESTIONS THAT WOULD CHANGE ASSESSMENT ---
${model.coherence.resolutionQuestions.map(q => `- ${q}`).join('\n')}
`);
  }

  sections.push(`
=== END COMPANY MODEL ===

CRITICAL INSTRUCTIONS FOR RELATIONAL REASONING:
1. Do NOT evaluate this section in isolation - interpret all data in relation to the full Company Model above
2. If there are coherence issues or discrepancies that affect this section, ADDRESS THEM EXPLICITLY
3. Use conditional framing: "This is acceptable IF [condition]" or "This becomes concerning UNLESS [condition]"
4. Reference cross-sectional implications: How does data in this section relate to other dimensions?
5. Distinguish between "incomplete" (normal for stage) and "directionally confused" (red flag)
`);

  return sections.join('\n');
}

// Helper function to sanitize problematic unicode escapes in JSON strings
function sanitizeJsonString(str: string): string {
  return str
    // Remove incomplete unicode escapes (e.g., \u26a without 4 hex digits)
    .replace(/\\u[0-9a-fA-F]{0,3}(?![0-9a-fA-F])/g, '')
    // Convert valid unicode escapes to actual characters
    .replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
      try {
        return String.fromCharCode(parseInt(hex, 16));
      } catch {
        return '';
      }
    });
}

// =============================================================================
// CLASSIFIED METRIC EXTRACTION - Intelligent metric categorization for edge function
// =============================================================================

interface ClassifiedMetricForExtraction {
  value: number;
  classification: 'actual' | 'calculated' | 'projected' | 'minimum' | 'target' | 'assumed' | 'benchmark';
  temporality: 'current' | 'historical' | 'future_12m' | 'at_exit' | 'unspecified';
  asOfDate?: string;
  confidence: 'verified' | 'extracted' | 'inferred' | 'estimated';
  sourceText?: string;
  calculationMethod?: string;
}

interface MetricDiscrepancyForExtraction {
  metricType: string;
  classification1: string;
  value1: number;
  classification2: string;
  value2: number;
  severity: 'info' | 'warning' | 'error';
  explanation: string;
  recommendation?: string;
}

interface FinancialMetricSetForExtraction {
  arr: { actual?: ClassifiedMetricForExtraction; projected?: ClassifiedMetricForExtraction };
  mrr: { actual?: ClassifiedMetricForExtraction; historical?: ClassifiedMetricForExtraction[] };
  acv: { actual?: ClassifiedMetricForExtraction; minimum?: ClassifiedMetricForExtraction; target?: ClassifiedMetricForExtraction };
  customers: { actual?: ClassifiedMetricForExtraction };
  growth: { yearlyRate?: ClassifiedMetricForExtraction };
}

// Detect currency from text
function detectCurrencyFromText(text: string): string {
  const eurCount = (text.match(/€|eur\b/gi) || []).length;
  const gbpCount = (text.match(/£|gbp\b/gi) || []).length;
  const usdCount = (text.match(/\$|usd\b/gi) || []).length;
  
  if (eurCount > usdCount && eurCount > gbpCount) return 'EUR';
  if (gbpCount > usdCount && gbpCount > eurCount) return 'GBP';
  return 'USD';
}

// Parse numeric value with k/m suffixes
function parseNumericValueForClassification(str: string, fullMatch: string): number {
  const clean = str.replace(/,/g, '').toLowerCase();
  const num = parseFloat(clean);
  const fullLower = fullMatch.toLowerCase();
  
  if (fullLower.includes('m') && !fullLower.includes('mrr') && num < 1000) {
    return num * 1000000;
  }
  if (fullLower.match(/\dk/) || (num < 1000 && fullLower.includes('k'))) {
    return num * 1000;
  }
  if (num < 1000 && fullLower.match(/[€$£][\d,.]+\s*k/)) {
    return num * 1000;
  }
  
  return num;
}

// Format currency for display
function formatValueForClassification(value: number, currency: string): string {
  const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || '€';
  if (value >= 1000000) return `${symbol}${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${symbol}${Math.round(value / 1000)}k`;
  return `${symbol}${value.toLocaleString()}`;
}

// Extract date reference
function extractDateReferenceForClassification(text: string): string | undefined {
  const match = text.match(/(?:in\s+)?(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/i);
  return match ? match[0].replace(/^in\s+/i, '') : undefined;
}

// Build classified metric set from responses
function buildClassifiedMetricSetFromResponses(
  responses: Record<string, string>,
  currency: string = 'EUR'
): { metricSet: FinancialMetricSetForExtraction; discrepancies: MetricDiscrepancyForExtraction[] } {
  const metricSet: FinancialMetricSetForExtraction = {
    arr: {},
    mrr: {},
    acv: {},
    customers: {},
    growth: {},
  };
  const discrepancies: MetricDiscrepancyForExtraction[] = [];
  
  const tractionText = responses['traction'] || '';
  const businessModelText = responses['business_model'] || '';
  const pricingText = responses['pricing'] || '';
  const combinedText = `${tractionText} ${businessModelText} ${pricingText}`;
  const lowerText = combinedText.toLowerCase();
  
  // 1. Extract MRR with growth pattern
  const mrrGrowthMatch = combinedText.match(
    /mrr\s+(?:grew|increased|went)\s+from\s+[€$£]?([\d,.]+)\s*k?\s*(?:in\s+)?((?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4})\s+to\s+[€$£]?([\d,.]+)\s*k?\s*(?:in\s+)?((?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4})/i
  );
  
  if (mrrGrowthMatch) {
    const historicalValue = parseNumericValueForClassification(mrrGrowthMatch[1], mrrGrowthMatch[0]);
    const currentValue = parseNumericValueForClassification(mrrGrowthMatch[3], mrrGrowthMatch[0]);
    
    metricSet.mrr.historical = [{
      value: historicalValue,
      classification: 'actual',
      temporality: 'historical',
      asOfDate: mrrGrowthMatch[2],
      confidence: 'extracted',
      sourceText: mrrGrowthMatch[0],
    }];
    
    metricSet.mrr.actual = {
      value: currentValue,
      classification: 'actual',
      temporality: 'current',
      asOfDate: mrrGrowthMatch[4],
      confidence: 'extracted',
      sourceText: mrrGrowthMatch[0],
    };
    
    // Calculate YoY growth
    if (historicalValue > 0) {
      metricSet.growth.yearlyRate = {
        value: Math.round(((currentValue - historicalValue) / historicalValue) * 100),
        classification: 'calculated',
        temporality: 'current',
        confidence: 'extracted',
        calculationMethod: 'YoY MRR growth',
      };
    }
  }
  
  // 2. Calculate ARR from MRR
  if (metricSet.mrr.actual) {
    metricSet.arr.actual = {
      value: metricSet.mrr.actual.value * 12,
      classification: 'calculated',
      temporality: 'current',
      confidence: 'inferred',
      calculationMethod: 'MRR × 12',
      sourceText: metricSet.mrr.actual.sourceText,
    };
  } else {
    // Try direct ARR extraction
    const arrMatch = lowerText.match(/[€$£]([\d,.]+)\s*k?\s*(?:carr|arr)/i);
    if (arrMatch) {
      const value = parseNumericValueForClassification(arrMatch[1], arrMatch[0]);
      metricSet.arr.actual = {
        value,
        classification: 'actual',
        temporality: 'current',
        confidence: 'extracted',
        sourceText: arrMatch[0],
      };
    }
  }
  
  // 3. Extract customer count
  const customerMatch = combinedText.match(/(\d+)\+?\s*(?:paying\s*)?(?:customer|client|account|enterprise\s*client)s?/i);
  if (customerMatch) {
    metricSet.customers.actual = {
      value: parseInt(customerMatch[1]),
      classification: 'actual',
      temporality: 'current',
      confidence: 'extracted',
      sourceText: customerMatch[0],
    };
  }
  
  // 4. Extract minimum pricing
  const minMatch = combinedText.match(/minimum\s*(?:annual\s*)?(?:consumption|commitment|contract)(?:\s*of)?\s*[€$£]?([\d,.]+)\s*k?/i);
  if (minMatch) {
    const value = parseNumericValueForClassification(minMatch[1], minMatch[0]);
    metricSet.acv.minimum = {
      value,
      classification: 'minimum',
      temporality: 'current',
      confidence: 'extracted',
      sourceText: minMatch[0],
    };
  }
  
  // 5. Calculate actual ACV from ARR ÷ Customers
  if (metricSet.arr.actual && metricSet.customers.actual && metricSet.customers.actual.value > 0) {
    const calculatedACV = Math.round(metricSet.arr.actual.value / metricSet.customers.actual.value);
    metricSet.acv.actual = {
      value: calculatedACV,
      classification: 'calculated',
      temporality: 'current',
      confidence: 'inferred',
      calculationMethod: `ARR (${formatValueForClassification(metricSet.arr.actual.value, currency)}) ÷ Customers (${metricSet.customers.actual.value})`,
    };
    
    // Check for discrepancy with minimum
    if (metricSet.acv.minimum && calculatedACV < metricSet.acv.minimum.value) {
      discrepancies.push({
        metricType: 'acv',
        classification1: 'actual',
        value1: calculatedACV,
        classification2: 'minimum',
        value2: metricSet.acv.minimum.value,
        severity: 'warning',
        explanation: `Actual average ACV (${formatValueForClassification(calculatedACV, currency)}) is below stated minimum (${formatValueForClassification(metricSet.acv.minimum.value, currency)}). SMB customers may be pulling down the average, or the minimum isn't being enforced.`,
        recommendation: 'Review customer mix and pricing enforcement.',
      });
    }
  }
  
  return { metricSet, discrepancies };
}

// Safe string helpers (AI output sometimes returns objects)
function safeStr(val: unknown, context?: string): string {
  if (typeof val === "string") return val;
  if (val === null || val === undefined) return "";
  if (typeof val === "number" || typeof val === "boolean") return String(val);

  if (typeof val === "object") {
    const obj = val as Record<string, unknown>;
    if ("text" in obj) return safeStr(obj.text, context);
    if ("value" in obj) return safeStr(obj.value, context);
    if (context) console.warn(`[safeStr] Expected string in ${context}, got object`, val);
    return "";
  }

  if (context) console.warn(`[safeStr] Expected string in ${context}, got ${typeof val}`, val);
  return "";
}

function safeLower(val: unknown, context?: string): string {
  return safeStr(val, context).toLowerCase();
}

// Helper function to normalize VC questions to enhanced format with contextual rationale
function normalizeVCQuestions(questions: any[], sectionName?: string): any[] {
  if (!Array.isArray(questions)) return [];
  
  // Generate context-aware fallback rationale based on section
  const getRationale = (question: string, section?: string): string => {
    const q = safeLower(question, "getRationale.question");
    const s = safeLower(section || "", "getRationale.section");
    
    if (q.includes('competitor') || q.includes('differentiat') || s.includes('competition')) {
      return "VCs invest in companies that can defend their position. Understanding competitive dynamics reveals whether you have a sustainable advantage or are in a race to the bottom.";
    }
    if (q.includes('customer') || q.includes('retention') || q.includes('churn')) {
      return "Customer retention is the ultimate proof of value. High churn means your product isn't solving the problem well enough, regardless of how fast you acquire customers.";
    }
    if (q.includes('revenue') || q.includes('pricing') || q.includes('monetiz') || s.includes('business')) {
      return "Unit economics determine whether growth creates or destroys value. VCs need to see a path to profitability at scale.";
    }
    if (q.includes('team') || q.includes('founder') || q.includes('hire') || s.includes('team')) {
      return "VCs bet on teams, not just ideas. Execution capability and founder-market fit are often the difference between success and failure.";
    }
    if (q.includes('market') || q.includes('tam') || q.includes('scale')) {
      return "Market size determines outcome potential. VCs need to believe this can be a fund-returning investment, which requires large addressable markets.";
    }
    if (q.includes('traction') || q.includes('growth') || q.includes('metric')) {
      return "Traction is the best predictor of future success. VCs look for evidence of product-market fit through measurable, repeatable growth.";
    }
    return "This question probes a critical assumption that could make or break the investment thesis. VCs need concrete evidence, not promises.";
  };
  
  const getPreparation = (question: string): string => {
    const q = safeLower(question, "getPreparation.question");
    
    if (q.includes('why') || q.includes('how')) {
      return "Prepare a clear, specific answer with concrete examples and data. Generic responses will raise red flags about depth of understanding.";
    }
    if (q.includes('data') || q.includes('metric') || q.includes('number')) {
      return "Gather specific metrics with clear definitions and methodology. Show trends over time, not just snapshots. Include benchmarks for context.";
    }
    if (q.includes('risk') || q.includes('concern') || q.includes('challenge')) {
      return "Acknowledge the risk honestly, then explain your mitigation strategy with specific actions and timelines. VCs respect founders who understand their vulnerabilities.";
    }
    if (q.includes('competitor') || q.includes('alternative')) {
      return "Create a detailed competitive matrix showing your differentiation. Include both direct competitors and alternative solutions customers currently use.";
    }
    return "Prepare specific evidence: customer testimonials, contracts, metrics, or third-party validation. Anecdotes without data will not satisfy skeptical investors.";
  };
  
  return questions.map((q, index) => {
    // If it's already an object with the required properties and they're substantive, return as-is
    if (typeof q === 'object' && q !== null && (q as any).question) {
      const questionText = safeStr((q as any).question, "normalizeVCQuestions.object.question");
      const vcRationaleText = safeStr((q as any).vcRationale, "normalizeVCQuestions.object.vcRationale");
      const whatToPrepareText = safeStr((q as any).whatToPrepare, "normalizeVCQuestions.object.whatToPrepare");

      const hasSubstantiveRationale = vcRationaleText.length > 50;
      const hasSubstantivePrep = whatToPrepareText.length > 50;
      
      return {
        question: questionText || `Key question ${index + 1}`,
        vcRationale: hasSubstantiveRationale ? vcRationaleText : getRationale(questionText || "", sectionName),
        whatToPrepare: hasSubstantivePrep ? whatToPrepareText : getPreparation(questionText || "")
      };
    }

    // If it's a string, transform to enhanced format with contextual content
    if (typeof q === 'string') {
      return {
        question: q,
        vcRationale: getRationale(q, sectionName),
        whatToPrepare: getPreparation(q)
      };
    }
    
    // Fallback for unexpected formats
    return {
      question: `Key question ${index + 1}`,
      vcRationale: "This question probes a critical assumption in the investment thesis. VCs need concrete evidence before committing capital.",
      whatToPrepare: "Prepare specific data, customer testimonials, or third-party validation to address this concern convincingly."
    };
  });
}

// Helper function to normalize a section's vcReflection questions
function normalizeSectionQuestions(section: any, sectionName?: string): any {
  if (section?.vcReflection?.questions) {
    section.vcReflection.questions = normalizeVCQuestions(section.vcReflection.questions, sectionName);
  }
  return section;
}

// Helper function to retry API calls with exponential backoff
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  maxRetries = 3,
  initialDelay = 1000
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // If successful or client error (4xx), return immediately
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }
      
      // For 5xx errors, retry with backoff
      if (response.status >= 500) {
        const errorText = await response.text();
        console.warn(`Attempt ${attempt + 1}/${maxRetries} failed with ${response.status}: ${errorText}`);
        lastError = new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.warn(`Attempt ${attempt + 1}/${maxRetries} failed with network error:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
    }
    
    // Don't wait after the last attempt
    if (attempt < maxRetries - 1) {
      const delay = initialDelay * Math.pow(2, attempt);
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}

// ============================================
// SECTION TOOL DATA GENERATION FUNCTION
// ============================================

interface MetricFrameworkContext {
  businessModelType: string;
  primaryMetricLabel: string;
  primaryMetricFullLabel: string;
  periodicity: string;
  customerTermPlural: string;
  customerTermSingular: string;
  anchoredValue?: number;
  anchoredValueSource?: string;
  currency?: string;
  
  // NEW: Classified metrics for intelligent usage
  classifiedMetrics?: {
    arr?: { actual?: ClassifiedMetricInfo; projected?: ClassifiedMetricInfo };
    mrr?: { actual?: ClassifiedMetricInfo; historical?: ClassifiedMetricInfo[] };
    acv?: { actual?: ClassifiedMetricInfo; minimum?: ClassifiedMetricInfo; target?: ClassifiedMetricInfo };
    customers?: { actual?: ClassifiedMetricInfo };
    growth?: { yearlyRate?: ClassifiedMetricInfo };
  };
  metricDiscrepancies?: MetricDiscrepancyInfo[];
}

interface ClassifiedMetricInfo {
  value: number;
  classification: 'actual' | 'calculated' | 'projected' | 'minimum' | 'target' | 'assumed' | 'benchmark';
  temporality: 'current' | 'historical' | 'future_12m' | 'at_exit' | 'unspecified';
  asOfDate?: string;
  confidence: 'verified' | 'extracted' | 'inferred' | 'estimated';
  sourceText?: string;
  calculationMethod?: string;
}

interface MetricDiscrepancyInfo {
  metricType: string;
  classification1: string;
  value1: number;
  classification2: string;
  value2: number;
  severity: 'info' | 'warning' | 'error';
  explanation: string;
  recommendation?: string;
}

interface ToolGenerationContext {
  sectionName: string;
  sectionContent: any;
  companyName: string;
  companyCategory: string;
  companyStage: string;
  companyDescription: string;
  financialMetrics: any;
  responses: any[];
  competitorResearch: any;
  marketContext: any;
  companyModel?: CompanyModel | null;
  metricFramework?: MetricFrameworkContext | null;
}

async function generateSectionToolData(
  ctx: ToolGenerationContext,
  apiKey: string,
  supabaseClient: any,
  companyId: string
): Promise<void> {
  const { sectionName, sectionContent, companyName, companyCategory, companyStage, companyDescription, financialMetrics, responses, competitorResearch, marketContext, companyModel, metricFramework } = ctx;
  
  console.log(`Generating tool data for section: ${sectionName}`);
  
  // Calculate data completeness for this section
  const dataCompleteness = calculateDataCompleteness(companyModel ?? null, sectionName);
  const dataCompletenessContext = formatDataCompletenessContext(dataCompleteness, sectionName);
  console.log(`Data completeness for ${sectionName}: ${dataCompleteness.overall}%`);
  
  // Get section-specific tool requirements
  const sectionToolPrompts = getSectionToolPrompt(sectionName, ctx, dataCompleteness);
  if (!sectionToolPrompts) {
    console.log(`No tools required for section: ${sectionName}`);
    return;
  }
  
  try {
    const response = await fetchWithRetry("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a SKEPTICAL VC analyst generating structured analysis tools for the ${sectionName} section of an investment memo. 
Generate SPECIFIC, TAILORED data for ${companyName}, a ${companyStage} ${companyCategory || 'startup'}. 
DO NOT use generic examples or templates. All content must be specifically relevant to this company.

=== RELATIONAL REASONING REQUIREMENTS ===
You have access to a COMPLETE COMPANY MODEL. Use it to:
1. Interpret data RELATIONALLY - a weakness may be acceptable if coherently explained by strength elsewhere
2. Use CONDITIONAL framing: "This is acceptable IF [condition]" or "This is concerning UNLESS [condition]"
3. Address any coherence issues or discrepancies that affect your assessments
4. Distinguish between "incomplete" (normal for stage) and "directionally confused" (red flag)

${companyModel ? `
=== COMPANY MODEL SUMMARY ===
Coherence: ${companyModel.coherence?.overallCoherence || 'unknown'} (Score: ${companyModel.coherence?.score || 'N/A'}/100)
Discrepancies: ${companyModel.discrepancies?.length || 0} detected
Financial: MRR ${companyModel.financial?.revenue?.stated?.mrr ?? 'N/A'} | ACV ${companyModel.financial?.pricing?.acv ?? 'N/A'} | LTV:CAC ${companyModel.financial?.unitEconomics?.ltvCacRatio ?? 'N/A'}
Customers: ${companyModel.customer?.metrics?.paidCustomers ?? 'N/A'} paid | Churn ${companyModel.customer?.retention?.churnRate ?? 'N/A'}%
Market: TAM ${companyModel.market?.sizing?.stated?.tam ?? 'N/A'} | Bottom-Up TAM ${companyModel.market?.sizing?.computed?.bottomUpTAM ?? 'N/A'} | Plausibility: ${companyModel.market?.sizing?.tamPlausibility ?? 'unknown'}
GTM-Traction Aligned: ${companyModel.gtm?.alignment?.isAligned ? 'YES' : 'NO - ' + (companyModel.gtm?.alignment?.explanation || 'N/A')}
Coherence Issues: ${Object.entries(companyModel.coherence?.checks || {}).filter(([_, c]) => !c.passed).map(([k, c]) => `${k}: ${c.explanation}`).join('; ') || 'None'}
Conditional Hypotheses: ${(companyModel.coherence?.conditionalHypotheses || []).map(h => h.hypothesis).join('; ') || 'None'}
=== END COMPANY MODEL ===
` : ''}

${metricFramework ? `
=== METRIC FRAMEWORK (USE THIS TERMINOLOGY THROUGHOUT) ===
Business Model Type: ${metricFramework.businessModelType}
Primary Revenue Metric: ${metricFramework.primaryMetricLabel} (${metricFramework.primaryMetricFullLabel})
Periodicity: ${metricFramework.periodicity}
Customer Terminology: Use "${metricFramework.customerTermPlural}" (not "customers" or "users" unless that matches)
${metricFramework.anchoredValue ? `Anchored Value: ${metricFramework.anchoredValue} ${metricFramework.currency || 'USD'} (Source: ${metricFramework.anchoredValueSource || 'unknown'})` : ''}

CRITICAL TERMINOLOGY RULES:
- ALWAYS use "${metricFramework.primaryMetricLabel}" instead of "ACV" in all calculations and text
- ALWAYS use "${metricFramework.customerTermPlural}" instead of generic "customers"
- When calculating scale requirements, use the correct formula for this business model
- If this is B2C, use monthly metrics (ARPU × users × 12 = ARR)
- If this is Enterprise, use annual metrics (ACV × accounts = ARR)

${metricFramework.classifiedMetrics ? `
=== CLASSIFIED FINANCIAL METRICS (CRITICAL - USE THESE VALUES!) ===
The following metrics are CLASSIFIED by type. You MUST use the appropriate metric for each context:

** ACTUAL METRICS (verified from real data - use for traction/unit economics): **
${metricFramework.classifiedMetrics.arr?.actual ? `- ARR (Actual): ${metricFramework.classifiedMetrics.arr.actual.value} ${metricFramework.currency || 'EUR'}${metricFramework.classifiedMetrics.arr.actual.asOfDate ? ` as of ${metricFramework.classifiedMetrics.arr.actual.asOfDate}` : ''} [${metricFramework.classifiedMetrics.arr.actual.classification}, ${metricFramework.classifiedMetrics.arr.actual.confidence}]${metricFramework.classifiedMetrics.arr.actual.calculationMethod ? ` (${metricFramework.classifiedMetrics.arr.actual.calculationMethod})` : ''}` : '- ARR (Actual): Not available'}
${metricFramework.classifiedMetrics.mrr?.actual ? `- MRR (Actual): ${metricFramework.classifiedMetrics.mrr.actual.value} ${metricFramework.currency || 'EUR'}${metricFramework.classifiedMetrics.mrr.actual.asOfDate ? ` as of ${metricFramework.classifiedMetrics.mrr.actual.asOfDate}` : ''} [${metricFramework.classifiedMetrics.mrr.actual.classification}]` : '- MRR (Actual): Not available'}
${metricFramework.classifiedMetrics.acv?.actual ? `- ${metricFramework.primaryMetricLabel} (Actual): ${metricFramework.classifiedMetrics.acv.actual.value} ${metricFramework.currency || 'EUR'} [${metricFramework.classifiedMetrics.acv.actual.classification}]${metricFramework.classifiedMetrics.acv.actual.calculationMethod ? ` (${metricFramework.classifiedMetrics.acv.actual.calculationMethod})` : ''}` : `- ${metricFramework.primaryMetricLabel} (Actual): Not available`}
${metricFramework.classifiedMetrics.customers?.actual ? `- ${metricFramework.customerTermPlural} (Actual): ${metricFramework.classifiedMetrics.customers.actual.value} [${metricFramework.classifiedMetrics.customers.actual.classification}]` : `- ${metricFramework.customerTermPlural} (Actual): Not available`}
${metricFramework.classifiedMetrics.growth?.yearlyRate ? `- YoY Growth (Actual): ${metricFramework.classifiedMetrics.growth.yearlyRate.value}% [${metricFramework.classifiedMetrics.growth.yearlyRate.classification}]` : ''}

** STATED PRICING (from founder, may differ from actual): **
${metricFramework.classifiedMetrics.acv?.minimum ? `- Minimum ${metricFramework.primaryMetricLabel}: ${metricFramework.classifiedMetrics.acv.minimum.value} ${metricFramework.currency || 'EUR'} [${metricFramework.classifiedMetrics.acv.minimum.classification}] - This is the STATED floor, not the actual average` : '- No minimum pricing stated'}
${metricFramework.classifiedMetrics.acv?.target ? `- Target ${metricFramework.primaryMetricLabel}: ${metricFramework.classifiedMetrics.acv.target.value} ${metricFramework.currency || 'EUR'} [${metricFramework.classifiedMetrics.acv.target.classification}]` : ''}

** HISTORICAL (for growth analysis): **
${metricFramework.classifiedMetrics.mrr?.historical?.length ? metricFramework.classifiedMetrics.mrr.historical.map((h: ClassifiedMetricInfo) => `- MRR (${h.asOfDate || 'historical'}): ${h.value} ${metricFramework.currency || 'EUR'}`).join('\n') : '- No historical MRR data'}

** METRIC USAGE RULES: **
- For TRACTION analysis: Use ACTUAL ARR/MRR/customers only
- For UNIT ECONOMICS: Use ACTUAL ${metricFramework.primaryMetricLabel} (calculated from ARR ÷ customers)
- For SCALE TEST (path to $100M): Use ACTUAL ${metricFramework.primaryMetricLabel}, NOT minimum or target
- For PRICING DISCUSSION: You may reference MINIMUM pricing but clarify it differs from actual average
- NEVER confuse "minimum pricing" with "average ${metricFramework.primaryMetricLabel}" - they are different!

${metricFramework.metricDiscrepancies?.length ? `
⚠️ DISCREPANCIES DETECTED (address these in your analysis):
${metricFramework.metricDiscrepancies.map((d: MetricDiscrepancyInfo) => `- ${d.explanation}${d.recommendation ? ` → ${d.recommendation}` : ''}`).join('\n')}
` : ''}
=== END CLASSIFIED METRICS ===
` : ''}
=== END METRIC FRAMEWORK ===
` : ''}

${dataCompletenessContext}

=== CONDITIONAL ASSESSMENT REQUIREMENTS (CRITICAL!) ===
EVERY tool output MUST include an "assessment" object with:
- confidence: "high" | "medium" | "low" | "insufficient_data" (based on data completeness)
- confidenceScore: 0-100 (derived from data completeness: ${dataCompleteness.overall}%)
- dataCompleteness: ${dataCompleteness.overall} (percentage of required data available)
- whatWouldChangeThisAssessment: ["specific data/evidence that would change this score/assessment"]
- assumptions: ["assumptions made due to missing data"]
- caveats: ["important caveats or conditions"] (optional)

CONFIDENCE SCORING RULES:
- High (80-100%): All critical data present, verified, coherent
- Medium (50-79%): Some critical data missing or unverified
- Low (20-49%): Most critical data missing, heavy assumptions
- Insufficient Data (<20%): Cannot make meaningful assessment

For THIS section, data completeness is ${dataCompleteness.overall}%, so:
${dataCompleteness.overall >= 80 ? '- Use "high" confidence for most assessments' : 
  dataCompleteness.overall >= 50 ? '- Use "medium" confidence, be explicit about assumptions' : 
  dataCompleteness.overall >= 20 ? '- Use "low" confidence, heavily caveat assessments' : 
  '- Use "insufficient_data", assessments are best-guesses'}

=== END CONDITIONAL ASSESSMENT REQUIREMENTS ===

=== CRITICAL SCORING CALIBRATION — SCORE HARSHLY! ===
95% of companies that pitch VCs get rejected. Your scores MUST reflect this reality.
Most early-stage companies should score between 25-55. Scores above 70 are RARE.

STAGE-ADJUSTED SCORING CAPS (maximum realistic scores):
${companyStage === 'Pre-Seed' || companyStage === 'Idea' ? `
PRE-SEED/IDEA STAGE CAPS:
- Traction: MAX 30 (no revenue = max 20, waitlist only = max 30)
- Business Model: MAX 40 (unvalidated pricing = max 35)
- Solution: MAX 50 (no shipped product = max 40)
- Team: MAX 70 (unless prior successful exits)
- Problem/Market/Competition/Vision: MAX 65
` : companyStage === 'Seed' ? `
SEED STAGE CAPS:
- Traction: MAX 50 (unless $100K+ ARR or 1000+ paying customers)
- Business Model: MAX 60 (unless 6+ months revenue data with positive unit economics)
- Solution: MAX 65 (unless shipped product with retention data)
- Team: MAX 75 (unless prior exits or exceptional domain expertise)
- Problem/Market/Competition/Vision: MAX 70
` : `
SERIES A+ STAGE:
- Standard 0-100 scale applies, but remain skeptical
- Scores above 80 require exceptional, verified metrics
`}

PENALTY RULES (subtract from base score):
- Missing revenue data: -20 points
- Missing retention/churn data: -15 points
- Missing CAC data: -15 points
- No paying customers: -25 points
- Waitlist only (no transactions/revenue): -20 points
- Claims without evidence/data: -15 points each
- Founder-claimed data without verification: Apply 0.7 multiplier to score
- AI-estimated/inferred data: Apply 0.6 multiplier to score
- Company Model coherence issues affecting this section: -10 points per issue

SCORING REALITY CHECK (what scores actually mean):
- 0-25: Significant fundability concerns (60% of startups)
- 26-45: Average early-stage company (25% of startups)
- 46-65: Above average, some differentiation (10% of startups)
- 66-80: Strong company with solid evidence (4% of startups)
- 81-100: Top 1% — reserve for exceptional companies with verified strong data

BE SKEPTICAL. Default to LOWER scores. If unsure, score DOWN, not up.
A "good" early-stage score is 45-55. A score of 70+ should be RARE and justified.

=== END SCORING CALIBRATION ===

CRITICAL OUTPUT RULES:
1. Return valid JSON only. No markdown formatting.
2. DO NOT wrap the response in "aiGenerated" or "data" or any wrapper object.
3. DO NOT add "dataSource" or any metadata fields - just return the raw data structure.
4. For actionPlan90Day.actions, use EXACT timeline values: "Week 1-2", "Week 3-4", "Month 2", "Month 3"
5. For actionPlan90Day.actions, use EXACT priority values (lowercase): "critical", "important", "nice-to-have"
6. For actionPlan90Day.actions, use "metric" field (not "outcome") for success metrics
7. Use CONDITIONAL framing in assessments when relevant to Company Model insights
8. ALWAYS include the "assessment" object in sectionScore, vcInvestmentLogic, and section-specific tools`,
          },
          {
            role: "user",
            content: sectionToolPrompts,
          },
        ],
        temperature: 0.7,
        max_tokens: 4500,
      }),
    }, 2, 1500);

    if (!response.ok) {
      console.error(`Tool generation failed for ${sectionName}: HTTP ${response.status}`);
      return;
    }

    const data = await response.json();
    let toolContent = data.choices?.[0]?.message?.content?.trim();
    
    if (!toolContent) {
      console.error(`No tool content returned for ${sectionName}`);
      return;
    }

    // Clean up markdown if present
    toolContent = toolContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let toolData;
    try {
      toolData = JSON.parse(toolContent);
    } catch (parseError) {
      console.error(`Failed to parse tool JSON for ${sectionName}:`, parseError);
      try {
        toolData = JSON.parse(sanitizeJsonString(toolContent));
      } catch (retryError) {
        console.error(`Retry parsing also failed for ${sectionName}`);
        return;
      }
    }

    // Save each tool to the memo_tool_data table
    const toolsToSave = extractToolsFromResponse(sectionName, toolData);
    
    for (const tool of toolsToSave) {
      const { error: insertError } = await supabaseClient
        .from("memo_tool_data")
        .upsert({
          company_id: companyId,
          section_name: sectionName,
          tool_name: tool.name,
          ai_generated_data: tool.data,
          data_source: "ai-complete",
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'company_id,section_name,tool_name'
        });
      
      if (insertError) {
        console.error(`Failed to save tool ${tool.name} for ${sectionName}:`, insertError);
      } else {
        console.log(`✓ Saved tool: ${sectionName}/${tool.name}`);
      }
    }
    
    console.log(`✓ Generated and saved ${toolsToSave.length} tools for ${sectionName}`);
    
  } catch (error) {
    console.error(`Error generating tools for ${sectionName}:`, error);
  }
}

function getSectionToolPrompt(sectionName: string, ctx: ToolGenerationContext, dataCompleteness?: DataCompletenessResult): string | null {
  const { companyName, companyCategory, companyStage, companyDescription, sectionContent, financialMetrics, responses, competitorResearch, marketContext } = ctx;
  
  const sectionNarrative = JSON.stringify(sectionContent?.narrative || sectionContent || {});
  const financialStr = financialMetrics ? JSON.stringify(financialMetrics) : "Not provided";
  const competitorStr = competitorResearch ? JSON.stringify(competitorResearch) : "Not provided";
  const marketStr = marketContext ? JSON.stringify(marketContext) : "Not provided";
  
  // Build assessment schema string for conditional assessments
  const assessmentSchema = dataCompleteness ? `
    "assessment": {
      "confidence": "${dataCompleteness.overall >= 80 ? 'high' : dataCompleteness.overall >= 50 ? 'medium' : dataCompleteness.overall >= 20 ? 'low' : 'insufficient_data'}",
      "confidenceScore": ${dataCompleteness.overall},
      "dataCompleteness": ${dataCompleteness.overall},
      "whatWouldChangeThisAssessment": ${JSON.stringify(dataCompleteness.whatWouldChangeAssessment.slice(0, 3))},
      "assumptions": ${JSON.stringify(dataCompleteness.assumptions.slice(0, 3))},
      "caveats": ["Any important caveats"]
    }` : '';
  
  const baseContext = `
Company: ${companyName}
Stage: ${companyStage}
Category: ${companyCategory || 'Startup'}
Description: ${companyDescription || 'N/A'}
Financial Metrics: ${financialStr}
Section Content: ${sectionNarrative.substring(0, 2000)}
`;

  switch (sectionName) {
    case "Problem":
      return `${baseContext}

Generate these SPECIFIC tools for ${companyName}'s Problem section:

1. sectionScore: Rate this specific problem statement (SCORE ON 0-100 SCALE!)
2. vcInvestmentLogic: VC investment decision for this problem
3. actionPlan90Day: Specific 90-day actions for problem validation
4. caseStudy: Find a REAL company case study relevant to ${companyCategory || 'this market'} (NOT climate tech unless that's the category)
5. evidenceThreshold: Analyze the evidence quality for this specific problem
6. founderBlindSpot: Identify potential blindspots for founders solving THIS problem

PROBLEM SECTION SCORING CALIBRATION:
- Problem clearly defined with specific customer segment: +10-15 points
- Quantified pain ($ lost, hours wasted, etc.): +10-15 points
- Customer interviews/research cited: +10-15 points
- Existing workarounds documented: +5-10 points
- Vague problem statement: MAX 35
- No customer research evidence: MAX 40
- Generic/obvious problem: MAX 45
- Most ${companyStage} companies score 35-55 for Problem

SCORING LABELS (use these thresholds):
- 0-30: Weak (problem unclear or not validated)
- 31-50: Developing (problem exists but needs more evidence)
- 51-70: Strong (well-defined with some validation)
- 71-100: Exceptional (deeply researched, quantified, urgent)

Return JSON:
{
  "sectionScore": {
    "score": 0-100,
    "label": "Weak|Developing|Strong|Exceptional",
    "vcBenchmark": 50,
    "percentile": "25th|50th|75th|90th",
    "topInsight": "Key insight specific to ${companyName}",
    "whatThisTellsVC": "What this score signals to investors",
    "fundabilityImpact": "Impact on ability to raise",
    ${assessmentSchema}
  },
  "vcInvestmentLogic": {
    "decision": "PASS|CAUTIOUS|INTERESTED|EXCITED",
    "reasoning": "VC reasoning specific to this problem",
    "keyCondition": "What would change the decision",
    ${assessmentSchema}
  },
  "actionPlan90Day": {
    "actions": [
      {"action": "Specific action for ${companyName}", "timeline": "Week 1-2", "priority": "critical", "metric": "Expected success metric"},
      {"action": "Another specific action", "timeline": "Week 3-4", "priority": "important", "metric": "Expected success metric"},
      {"action": "Third action", "timeline": "Month 2", "priority": "nice-to-have", "metric": "Expected success metric"},
      {"action": "Fourth action", "timeline": "Month 3", "priority": "important", "metric": "Expected success metric"}
    ]
  },
  "caseStudy": {
    "company": "Real company name in ${companyCategory || 'similar market'}",
    "problem": "What problem they faced",
    "fix": "How they fixed it",
    "outcome": "Results achieved",
    "timeframe": "How long it took",
    "sector": "${companyCategory || 'Technology'}"
  },
  "evidenceThreshold": {
    "verifiedPain": ["Evidence points that are verified"],
    "unverifiedPain": ["Claims that need validation"],
    "evidenceGrade": "A|B|C|D|F",
    "missingEvidence": ["What's needed to prove the problem"],
    "whatVCsConsiderVerified": ["What would satisfy a VC"],
    ${assessmentSchema}
  },
  "founderBlindSpot": {
    "potentialExaggerations": ["Possible overstatements"],
    "misdiagnoses": ["Alternative interpretations of the problem"],
    "assumptions": ["Assumptions that might not hold"],
    "commonMistakes": ["Typical founder mistakes in this space"],
    ${assessmentSchema}
  }
}`;

    case "Solution":
      return `${baseContext}

Generate these SPECIFIC tools for ${companyName}'s Solution section:

1. sectionScore (SCORE ON 0-100 SCALE!), vcInvestmentLogic, actionPlan90Day, caseStudy
2. technicalDefensibility: Rate the technical moat (0-100 scale)
3. commoditizationTeardown: Risk of commoditization
4. competitorBuildAnalysis: Could competitors copy this?

SOLUTION SECTION SCORING CALIBRATION:
- No shipped product: MAX 40
- MVP without users: MAX 45
- Product shipped but no retention data: MAX 55
- Product with engagement/retention proof: +15-20 points
- Proprietary tech/patents: +10-15 points
- Easily replicable solution: MAX 40
- "AI wrapper" or commodity tech: MAX 35
- Most ${companyStage} companies score 30-50 for Solution

SCORING LABELS:
- 0-30: Weak (concept only, easily copied)
- 31-50: Developing (built but unproven)
- 51-70: Strong (working product with some moat)
- 71-100: Exceptional (defensible, validated, loved by users)

Return JSON:
{
  "sectionScore": {"score": 0-100, "label": "Weak|Developing|Strong|Exceptional", "vcBenchmark": 50, "percentile": "25th|50th|75th|90th", "topInsight": "...", "whatThisTellsVC": "...", "fundabilityImpact": "..."},
  "vcInvestmentLogic": {"decision": "PASS|CAUTIOUS|INTERESTED|EXCITED", "reasoning": "...", "keyCondition": "..."},
  "actionPlan90Day": {"actions": [{"action": "...", "timeline": "Week 1-2|Week 3-4|Month 2|Month 3", "priority": "critical|important|nice-to-have", "metric": "..."}]},
  "caseStudy": {"company": "Real company in ${companyCategory}", "problem": "...", "fix": "...", "outcome": "...", "timeframe": "...", "sector": "${companyCategory || 'Technology'}"},
  "technicalDefensibility": {
    "defensibilityScore": 0-100,
    "proofPoints": ["Evidence of technical moat"],
    "expectedProofs": ["What a strong solution would have"],
    "gaps": ["Missing defensibility elements"],
    "vcEvaluation": "VC assessment of defensibility"
  },
  "commoditizationTeardown": {
    "features": [
      {"feature": "Core feature 1", "commoditizationRisk": "Low|Medium|High", "timeToClone": "X months", "defensibility": "Why hard/easy to copy"},
      {"feature": "Core feature 2", "commoditizationRisk": "...", "timeToClone": "...", "defensibility": "..."}
    ],
    "overallRisk": "Low|Medium|High"
  },
  "competitorBuildAnalysis": {
    "couldBeBuilt": true/false,
    "estimatedTime": "X months",
    "requiredResources": "What it would take",
    "barriers": ["Barriers to copying"],
    "verdict": "VC verdict on competitive moat"
  }
}`;

    case "Market":
      return `${baseContext}
Market Context: ${marketStr}

Generate these SPECIFIC tools for ${companyName}'s Market section:

MARKET SECTION SCORING CALIBRATION:
- Top-down TAM only (no bottoms-up): MAX 40
- Small market (<$1B TAM): MAX 45
- Crowded market without clear differentiation: MAX 50
- Strong bottoms-up analysis with ICP: +15-20 points
- Clear "why now" timing evidence: +10-15 points
- Validated willingness to pay: +10-15 points
- Unproven market timing: -15 points
- Most ${companyStage} companies score 35-55 for Market

SCORING LABELS:
- 0-30: Weak (small, timing unclear, or saturated)
- 31-50: Developing (decent size but unvalidated timing)
- 51-70: Strong (large market with clear timing)
- 71-100: Exceptional (massive, urgent, tailwinds obvious)

Return JSON:
{
  "sectionScore": {"score": 0-100, "label": "Weak|Developing|Strong|Exceptional", "vcBenchmark": 50, "percentile": "25th|50th|75th|90th", "topInsight": "...", "whatThisTellsVC": "...", "fundabilityImpact": "..."},
  "vcInvestmentLogic": {"decision": "PASS|CAUTIOUS|INTERESTED|EXCITED", "reasoning": "...", "keyCondition": "..."},
  "actionPlan90Day": {"actions": [{"action": "...", "timeline": "Week 1-2|Week 3-4|Month 2|Month 3", "priority": "critical|important|nice-to-have", "metric": "..."}]},
  "caseStudy": {"company": "Real company in ${companyCategory}", "problem": "...", "fix": "...", "outcome": "...", "timeframe": "...", "sector": "${companyCategory || 'Technology'}"},
  "bottomsUpTAM": {
    "targetSegments": [
      {"segment": "Name of segment (e.g. 'Enterprise SaaS in DACH')", "count": 5000, "acv": 25000, "tam": 125000000}
    ],
    "totalTAM": 500000000,
    "sam": 125000000,
    "som": 3000000,
    "methodology": "How this was calculated - be specific about data sources",
    "assumptions": ["Key assumption 1", "Key assumption 2"]
  },
  CRITICAL FOR bottomsUpTAM:
  - ALL values for count, acv, tam, totalTAM, sam, som MUST be plain NUMBERS (not strings!)
  - If exact data is not available, ESTIMATE based on industry research and comparable companies
  - Use publicly available market research, industry reports, or comparable company data to derive estimates
  - NEVER return "Unknown" - always provide your best estimate with methodology explaining the basis
  - Example: If targeting Nordic manufacturing, research number of manufacturers with >€100M revenue in region
  - For ACV, use founder pricing data OR comparable B2B SaaS pricing in the vertical
  - Break market into 2-3 distinct segments for bottoms-up validation
  "marketReadinessIndex": {
    "regulatoryPressure": {"score": 0-100, "evidence": "Specific to ${companyCategory}"},
    "urgency": {"score": 0-100, "evidence": "Why buyers need this now"},
    "willingnessToPay": {"score": 0-100, "evidence": "Payment evidence"},
    "switchingFriction": {"score": 0-100, "evidence": "Switching cost analysis"},
    "overallScore": 0-100
  },
  "vcMarketNarrative": {
    "pitchToIC": "How to pitch this market to investment committee",
    "marketTiming": "Why now is the right time",
    "whyNow": "Specific market forces"
  }
}`;

    case "Competition":
      return `${baseContext}
Competitor Research: ${competitorStr}

Generate these SPECIFIC tools for ${companyName}'s Competition section (use ACTUAL competitors from research, not generic examples):

COMPETITION SECTION SCORING CALIBRATION:
- No clear differentiation from competitors: MAX 35
- "We have no competitors": MAX 30 (red flag - naive or lying)
- Well-funded competitor with similar product: MAX 45
- Clear competitive advantage articulated: +10-15 points
- Defensible moat with evidence: +15-20 points
- First-mover in new category: +10 points
- Moat scores should also be skeptical - most early companies have WEAK moats
- Most ${companyStage} companies score 30-50 for Competition

MOAT SCORING REALITY:
- Network effects: Most startups have NONE (score 10-20)
- Switching costs: Early-stage = low (score 15-30)
- Data advantage: Needs significant data volume (most early = 10-25)
- Brand trust: Takes years to build (early-stage = 10-25)
- Most overall moat scores should be 20-40 for ${companyStage} companies

SCORING LABELS:
- 0-30: Weak (commodity, easily outcompeted)
- 31-50: Developing (some differentiation but vulnerable)
- 51-70: Strong (clear moat, defensible position)
- 71-100: Exceptional (dominant position, multiple moats)

Return JSON:
{
  "sectionScore": {"score": 0-100, "label": "Weak|Developing|Strong|Exceptional", "vcBenchmark": 50, "percentile": "25th|50th|75th|90th", "topInsight": "...", "whatThisTellsVC": "...", "fundabilityImpact": "..."},
  "vcInvestmentLogic": {"decision": "PASS|CAUTIOUS|INTERESTED|EXCITED", "reasoning": "...", "keyCondition": "..."},
  "actionPlan90Day": {"actions": [{"action": "...", "timeline": "Week 1-2|Week 3-4|Month 2|Month 3", "priority": "critical|important|nice-to-have", "metric": "..."}]},
  "caseStudy": {"company": "Real company that won against competitors in ${companyCategory}", "problem": "...", "fix": "...", "outcome": "...", "timeframe": "...", "sector": "${companyCategory || 'Technology'}"},
  "competitorChessboard": {
    "competitors": [
      {"name": "Real competitor name", "currentPosition": "Their market position", "likely12MonthMoves": ["Expected moves"], "threat24Months": "Low|Medium|High"}
    ],
    "marketDynamics": "Overall competitive dynamics for ${companyName}"
  },
  "reverseDiligence": {
    "weaknesses": ["${companyName}'s weaknesses competitors could exploit"],
    "howCompetitorWouldExploit": ["How competitors might attack"],
    "defenseStrategy": ["How to defend against attacks"]
  },
  "moatDurability": {
    "currentMoatStrength": 0-100,
    "erosionFactors": ["What could erode the moat"],
    "estimatedDuration": "How long the moat lasts",
    "reinforcementOpportunities": ["How to strengthen the moat"]
  },
  "moatScores": {
    "networkEffects": {"score": 0-100, "evidence": "Specific evidence for ${companyName}'s network effects or lack thereof"},
    "switchingCosts": {"score": 0-100, "evidence": "Analysis of lock-in and switching friction for ${companyName}"},
    "dataAdvantage": {"score": 0-100, "evidence": "Proprietary data and AI/ML advantages for ${companyName}"},
    "brandTrust": {"score": 0-100, "evidence": "Brand recognition, certifications, enterprise trust for ${companyName}"},
    "costAdvantage": {"score": 0-100, "evidence": "Economic moats, scale advantages, patents for ${companyName}"},
    "overallScore": 0-100
  },
  "moatAccelerationOpportunities": [
    {"title": "Specific opportunity 1 for ${companyName}", "suggestion": "Tailored suggestion based on ${companyCategory} and company specifics", "priority": "high"},
    {"title": "Specific opportunity 2 for ${companyName}", "suggestion": "Another tailored suggestion for this specific company", "priority": "medium"},
    {"title": "Specific opportunity 3 for ${companyName}", "suggestion": "Third tailored suggestion", "priority": "medium"}
  ]
}`;

    case "Team":
      return `${baseContext}

Generate these SPECIFIC tools for ${companyName}'s Team section:

TEAM SECTION SCORING CALIBRATION:
- Solo founder without technical skills for product: MAX 35
- First-time founders without domain expertise: MAX 50
- Team missing critical roles (no CTO for tech company): MAX 45
- Prior startup experience (even failed): +10-15 points
- Prior exit: +20-25 points
- Deep domain expertise (10+ years in space): +15-20 points
- Working together before: +5-10 points
- Incomplete founding team: -15 points
- Most ${companyStage} companies score 35-55 for Team

CREDIBILITY GAP SCORING:
- Expected vs actual skills gap should be HONEST
- Most first-time founders have significant gaps (overall credibility 30-50)
- Exceptional teams (70+) need verifiable track records

SCORING LABELS:
- 0-30: Weak (missing critical skills, no relevant experience)
- 31-50: Developing (some gaps but potential)
- 51-70: Strong (experienced team with minor gaps)
- 71-100: Exceptional (all-star team with exits/deep expertise)

CRITICAL: Extract ALL team members mentioned in the section content. Look for patterns like:
- "Name (Role)" e.g., "Hatem Ahmed (Co-Founder & CEO)"
- "Name, Role" e.g., "Amr Salem, CTO"  
- "Name serves as Role" or "Name is the Role"
- "led by Name" or "founded by Name"

Return JSON:
{
  "sectionScore": {"score": 0-100, "label": "Weak|Developing|Strong|Exceptional", "vcBenchmark": 50, "percentile": "25th|50th|75th|90th", "topInsight": "...", "whatThisTellsVC": "...", "fundabilityImpact": "..."},
  "vcInvestmentLogic": {"decision": "PASS|CAUTIOUS|INTERESTED|EXCITED", "reasoning": "...", "keyCondition": "..."},
  "actionPlan90Day": {"actions": [{"action": "...", "timeline": "Week 1-2|Week 3-4|Month 2|Month 3", "priority": "critical|important|nice-to-have", "metric": "..."}]},
  "caseStudy": {"company": "Real company with relevant founder background in ${companyCategory}", "problem": "...", "fix": "...", "outcome": "...", "timeframe": "...", "sector": "${companyCategory || 'Technology'}"},
  "teamMembers": [
    {"name": "Full Name", "role": "Title/Role", "background": "Brief background if mentioned"},
    {"name": "Another Name", "role": "Their Role", "background": "Their background"}
  ],
  "credibilityGapAnalysis": {
    "expectedSkills": ["Skills needed for ${companyCategory} success"],
    "currentSkills": ["Skills the team has"],
    "gaps": [{"skill": "Missing skill", "severity": "Critical|Important|Minor", "mitigation": "How to address"}],
    "overallCredibility": 0-100
  },
  "founderMapping": {
    "successfulFounderProfiles": [
      {"company": "Similar successful company", "founderBackground": "Their background", "relevantTo": "Why relevant to ${companyName}"}
    ],
    "matchScore": 0-100,
    "gaps": ["Where this team differs from successful founders"]
  }
}`;

    case "Business Model":
      return `${baseContext}
Financial Metrics: ${financialStr}

Generate these SPECIFIC tools for ${companyName}'s Business Model section:

BUSINESS MODEL SCORING CALIBRATION:
- No pricing validation (no paying customers): MAX 30
- Pricing tested but no sustainable revenue: MAX 40
- <6 months revenue data: MAX 50
- Unit economics unknown: MAX 40
- Unit economics negative: MAX 35
- LTV:CAC < 1: MAX 30
- LTV:CAC 1-2: MAX 45
- LTV:CAC 2-3: MAX 60
- LTV:CAC > 3 with data: 60-80
- Gross margin < 50%: -10 points
- Gross margin > 70%: +10 points
- Most ${companyStage} companies score 25-45 for Business Model

IMPORTANT: Transaction-based models (like ${companyName} if applicable) need:
- Actual transaction volume data
- Take rate/fee structure validated
- Path to profitability clear

SCORING LABELS:
- 0-30: Weak (unproven model, no revenue validation)
- 31-50: Developing (some revenue but unit economics unclear)
- 51-70: Strong (validated pricing, positive unit economics)
- 71-100: Exceptional (proven, scalable, efficient)

Detect the business model type (B2B SaaS, B2C consumer, marketplace, transaction-fee, etc.) and tailor metrics accordingly.

Return JSON:
{
  "sectionScore": {"score": 0-100, "label": "Weak|Developing|Strong|Exceptional", "vcBenchmark": 45, "percentile": "25th|50th|75th|90th", "topInsight": "...", "whatThisTellsVC": "...", "fundabilityImpact": "..."},
  "vcInvestmentLogic": {"decision": "PASS|CAUTIOUS|INTERESTED|EXCITED", "reasoning": "...", "keyCondition": "..."},
  "actionPlan90Day": {"actions": [{"action": "...", "timeline": "Week 1-2|Week 3-4|Month 2|Month 3", "priority": "critical|important|nice-to-have", "metric": "..."}]},
  "caseStudy": {"company": "Real company with similar business model in ${companyCategory}", "problem": "...", "fix": "...", "outcome": "...", "timeframe": "...", "sector": "${companyCategory || 'Technology'}"},
  "businessModelType": "B2B SaaS|B2C Consumer|Marketplace|Transaction Fee|Usage-Based|Freemium|Hardware|Hybrid",
  "pricingMetrics": {
    "avgMonthlyRevenue": number (in USD, ARPU for B2C or ACV/12 for B2B),
    "currentCustomers": number,
    "currentMRR": number,
    "isTransactionBased": true/false,
    "transactionFeePercent": number or null,
    "avgTransactionValue": number or null
  },
  "modelStressTest": {
    "scenarios": [
      {"scenario": "Stress scenario 1", "impact": "Financial impact", "survivalProbability": 0-100, "mitigations": ["How to mitigate"]}
    ],
    "overallResilience": "Low|Medium|High"
  },
  "cashEfficiencyBenchmark": {
    "burnMultiple": number,
    "industryAverage": number,
    "percentile": "Xth percentile",
    "efficiency": "Excellent|Good|Average|Poor",
    "recommendation": "What to improve"
  },
  "profitabilityPath": {
    "currentGrossMargin": percentage,
    "targetGrossMargin": percentage,
    "timeToTarget": "X months/years",
    "keyLevers": ["How to improve margins"],
    "milestones": ["Key milestones to hit"]
  }
}`;

    case "Traction":
      return `${baseContext}
Financial Metrics: ${financialStr}

Generate these SPECIFIC tools for ${companyName}'s Traction section:

TRACTION SECTION SCORING CALIBRATION — BE EXTREMELY STRICT:
- No revenue at all: MAX 20
- Waitlist only (no actual usage/transactions): MAX 25
- Free users only (no payment): MAX 30
- <$5K MRR: MAX 35
- $5K-$10K MRR: MAX 45
- $10K-$50K MRR: MAX 55
- $50K-$100K MRR: MAX 70
- $100K+ MRR with growth: 65-85
- $500K+ MRR with strong retention: 85-100

ADDITIONAL PENALTIES:
- No retention data: -15 points
- Declining MoM growth: -20 points
- Founder-led sales only: -10 points
- Heavy discounting to acquire: -15 points
- Pilot customers not converted: -10 points

REALITY CHECK for ${companyStage}:
- Pre-Seed: Most should score 15-30
- Seed: Most should score 25-45
- Series A: Most should score 45-65

IMPORTANT: Waitlist users are NOT traction. Early pilots without payment are NOT traction.
A waitlist of 500 people is worth MAX 25 points. Actual paying customers = real traction.

SCORING LABELS:
- 0-25: Weak (no revenue or minimal validation)
- 26-45: Developing (early revenue, growth unclear)
- 46-65: Strong (meaningful revenue with growth)
- 66-100: Exceptional (strong revenue, retention, growth)

Return JSON:
{
  "sectionScore": {"score": 0-100, "label": "Weak|Developing|Strong|Exceptional", "vcBenchmark": 40, "percentile": "25th|50th|75th|90th", "topInsight": "...", "whatThisTellsVC": "...", "fundabilityImpact": "..."},
  "vcInvestmentLogic": {"decision": "PASS|CAUTIOUS|INTERESTED|EXCITED", "reasoning": "...", "keyCondition": "..."},
  "actionPlan90Day": {"actions": [{"action": "...", "timeline": "Week 1-2|Week 3-4|Month 2|Month 3", "priority": "critical|important|nice-to-have", "metric": "..."}]},
  "caseStudy": {"company": "Real company with relevant traction story in ${companyCategory}", "problem": "...", "fix": "...", "outcome": "...", "timeframe": "...", "sector": "${companyCategory || 'Technology'}"},
  "tractionDepthTest": {
    "tractionType": "Founder-led|Discount-driven|Repeatable|Viral",
    "sustainabilityScore": 0-100,
    "redFlags": ["Warning signs"],
    "positiveSignals": ["Good indicators"]
  },
  "cohortStabilityProjection": {
    "currentRetention": percentage,
    "industryBenchmark": percentage,
    "projectedLTVImpact": "How retention affects LTV",
    "churnScenarios": [{"churnRate": percentage, "impact": "Financial impact"}]
  },
  "pipelineQuality": {
    "opportunities": [{"stage": "Stage name", "count": number, "avgValue": amount, "conversionRate": percentage, "quality": "Strong|Medium|Weak"}],
    "overallQuality": "Strong|Medium|Weak",
    "redFlags": ["Pipeline concerns"],
    "positiveSignals": ["Pipeline strengths"]
  }
}`;

    case "Vision":
      return `${baseContext}

Generate these SPECIFIC tools for ${companyName}'s Vision section:

VISION SECTION SCORING CALIBRATION:
- Vague vision without milestones: MAX 35
- Vision disconnected from current traction: MAX 40
- No clear path to next funding round: MAX 45
- Clear 12-month milestones with metrics: +10-15 points
- Realistic exit path articulated: +10 points
- Vision backed by current execution: +15 points
- Unrealistic projections: -15 points
- Most ${companyStage} companies score 35-55 for Vision

SCENARIO PLANNING REALITY:
- Best case probability should rarely exceed 20-25%
- Base case should be most likely (50-60%)
- Be honest about downside risks

SCORING LABELS:
- 0-30: Weak (unclear or unrealistic vision)
- 31-50: Developing (vision exists but execution unclear)
- 51-70: Strong (clear vision with achievable milestones)
- 71-100: Exceptional (compelling, realistic, backed by execution)

Return JSON:
{
  "sectionScore": {"score": 0-100, "label": "Weak|Developing|Strong|Exceptional", "vcBenchmark": 50, "percentile": "25th|50th|75th|90th", "topInsight": "...", "whatThisTellsVC": "...", "fundabilityImpact": "..."},
  "vcInvestmentLogic": {"decision": "PASS|CAUTIOUS|INTERESTED|EXCITED", "reasoning": "...", "keyCondition": "..."},
  "actionPlan90Day": {"actions": [{"action": "...", "timeline": "Week 1-2|Week 3-4|Month 2|Month 3", "priority": "critical|important|nice-to-have", "metric": "..."}]},
  "caseStudy": {"company": "Real company with inspiring vision in ${companyCategory}", "problem": "...", "fix": "...", "outcome": "...", "timeframe": "...", "sector": "${companyCategory || 'Technology'}"},
  "vcMilestoneMap": {
    "milestones": [
      {"month": 3, "milestone": "Q1 milestone", "metric": "Key metric", "targetValue": "Target", "currentValue": "Current if known"},
      {"month": 6, "milestone": "Q2 milestone", "metric": "Key metric", "targetValue": "Target"},
      {"month": 12, "milestone": "Year 1 milestone", "metric": "Key metric", "targetValue": "Target"}
    ],
    "criticalPath": ["Critical dependencies"]
  },
  "scenarioPlanning": {
    "bestCase": {"description": "Best case scenario for ${companyName}", "fundraisingImplication": "Impact on next raise", "probability": 0-100},
    "baseCase": {"description": "Base case scenario", "fundraisingImplication": "Impact on next raise", "probability": 0-100},
    "downside": {"description": "Downside scenario", "fundraisingImplication": "Impact on next raise", "probability": 0-100}
  },
  "exitNarrative": {
    "potentialAcquirers": ["Specific companies that might acquire ${companyName}"],
    "strategicValue": "Why acquirers would want this",
    "comparableExits": [{"company": "Similar exit", "acquirer": "Who bought", "value": "Exit value", "multiple": "Revenue multiple"}],
    "pathToExit": "How this company gets to an exit"
  }
}`;

    default:
      return null;
  }
}

function extractToolsFromResponse(sectionName: string, toolData: any): Array<{name: string, data: any}> {
  const tools: Array<{name: string, data: any}> = [];
  
  // All tools are saved as raw data - the frontend handles wrapping consistently
  // Common tools
  if (toolData.sectionScore) tools.push({ name: 'sectionScore', data: toolData.sectionScore });
  if (toolData.vcInvestmentLogic) tools.push({ name: 'vcInvestmentLogic', data: toolData.vcInvestmentLogic });
  if (toolData.actionPlan90Day) tools.push({ name: 'actionPlan90Day', data: toolData.actionPlan90Day });
  if (toolData.caseStudy) tools.push({ name: 'caseStudy', data: toolData.caseStudy });
  if (toolData.benchmarks) tools.push({ name: 'benchmarks', data: toolData.benchmarks });
  if (toolData.leadInvestorRequirements) tools.push({ name: 'leadInvestorRequirements', data: toolData.leadInvestorRequirements });
  
  // Problem section tools - saved as raw data
  if (toolData.evidenceThreshold) tools.push({ name: 'evidenceThreshold', data: toolData.evidenceThreshold });
  if (toolData.founderBlindSpot) tools.push({ name: 'founderBlindSpot', data: toolData.founderBlindSpot });
  
  // Solution section tools - saved as raw data
  if (toolData.technicalDefensibility) tools.push({ name: 'technicalDefensibility', data: toolData.technicalDefensibility });
  if (toolData.commoditizationTeardown) tools.push({ name: 'commoditizationTeardown', data: toolData.commoditizationTeardown });
  if (toolData.competitorBuildAnalysis) tools.push({ name: 'competitorBuildAnalysis', data: toolData.competitorBuildAnalysis });
  
  // Market section tools - saved as raw data
  if (toolData.bottomsUpTAM) tools.push({ name: 'bottomsUpTAM', data: toolData.bottomsUpTAM });
  if (toolData.marketReadinessIndex) tools.push({ name: 'marketReadinessIndex', data: toolData.marketReadinessIndex });
  if (toolData.vcMarketNarrative) tools.push({ name: 'vcMarketNarrative', data: toolData.vcMarketNarrative });
  
  // Competition section tools - saved as raw data
  if (toolData.competitorChessboard) tools.push({ name: 'competitorChessboard', data: toolData.competitorChessboard });
  if (toolData.reverseDiligence) tools.push({ name: 'reverseDiligence', data: toolData.reverseDiligence });
  if (toolData.moatDurability) tools.push({ name: 'moatDurability', data: toolData.moatDurability });
  
  // Team section tools - saved as raw data
  if (toolData.credibilityGapAnalysis) tools.push({ name: 'credibilityGapAnalysis', data: toolData.credibilityGapAnalysis });
  if (toolData.founderMapping) tools.push({ name: 'founderMapping', data: toolData.founderMapping });
  
  // Business Model section tools - saved as raw data
  if (toolData.modelStressTest) tools.push({ name: 'modelStressTest', data: toolData.modelStressTest });
  if (toolData.cashEfficiencyBenchmark) tools.push({ name: 'cashEfficiencyBenchmark', data: toolData.cashEfficiencyBenchmark });
  if (toolData.profitabilityPath) tools.push({ name: 'profitabilityPath', data: toolData.profitabilityPath });
  
  // Traction section tools - saved as raw data
  if (toolData.tractionDepthTest) tools.push({ name: 'tractionDepthTest', data: toolData.tractionDepthTest });
  if (toolData.cohortStabilityProjection) tools.push({ name: 'cohortStabilityProjection', data: toolData.cohortStabilityProjection });
  if (toolData.pipelineQuality) tools.push({ name: 'pipelineQuality', data: toolData.pipelineQuality });
  
  // Vision section tools - saved as raw data
  if (toolData.vcMilestoneMap) tools.push({ name: 'vcMilestoneMap', data: toolData.vcMilestoneMap });
  if (toolData.scenarioPlanning) tools.push({ name: 'scenarioPlanning', data: toolData.scenarioPlanning });
  if (toolData.exitNarrative) tools.push({ name: 'exitNarrative', data: toolData.exitNarrative });
  
  return tools;
}


// Main background generation function
async function generateMemoInBackground(
  companyId: string,
  jobId: string,
  force: boolean
) {
  const startTime = Date.now();
  console.log(`=== Starting background memo generation for job ${jobId} ===`);
  
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
  
  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch company details
    const { data: company, error: companyError } = await supabaseClient
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .single();

    if (companyError || !company) {
      throw new Error("Failed to fetch company details");
    }

    // Fetch all memo responses for this company
    const { data: responses, error: responsesError } = await supabaseClient
      .from("memo_responses")
      .select("*")
      .eq("company_id", companyId);

    if (responsesError) {
      throw new Error("Failed to fetch company responses");
    }

    // Fetch custom prompts
    const { data: promptsData, error: promptsError } = await supabaseClient
      .from("memo_prompts")
      .select("section_name, prompt");

    if (promptsError) {
      console.error("Error fetching prompts:", promptsError);
    }

    // Create a map of section names to prompts
    const customPrompts: Record<string, string> = {};
    if (promptsData) {
      promptsData.forEach((p: any) => {
        customPrompts[p.section_name] = p.prompt;
      });
    }

    // Fetch answer quality criteria for enhanced context
    const { data: qualityCriteria, error: criteriaError } = await supabaseClient
      .from("answer_quality_criteria")
      .select("question_key, required_elements, nice_to_have, vc_context");

    if (criteriaError) {
      console.error("Error fetching quality criteria:", criteriaError);
    }

    // Map question keys to sections for criteria lookup
    const criteriaBySection: Record<string, any> = {};
    if (qualityCriteria) {
      const keyToSection: Record<string, string> = {
        "problem_core": "Problem",
        "solution_core": "Solution",
        "target_customer": "Market",
        "competitive_moat": "Competition",
        "team_story": "Team",
        "business_model": "Business Model",
        "traction_proof": "Traction",
        "vision_ask": "Vision"
      };
      qualityCriteria.forEach((c: any) => {
        const section = keyToSection[c.question_key];
        if (section) {
          criteriaBySection[section] = c;
        }
      });
    }
    console.log("Quality criteria loaded for sections:", Object.keys(criteriaBySection));

    // Define section order
    const sectionOrder = [
      "Problem",
      "Solution",
      "Market",
      "Competition",
      "Team",
      "Business Model",
      "Traction",
      "Vision",
      "Investment Thesis"
    ];

    // Create proper section name mapping (expanded to cover all question key prefixes including new merged keys)
    const sectionKeyMapping: Record<string, string> = {
      // New merged question keys
      "problem_core": "Problem",
      "solution_core": "Solution",
      "competitive_moat": "Competition",
      "team_story": "Team",
      "business_model": "Business Model",
      "traction_proof": "Traction",
      "vision_ask": "Vision",
      // Original prefix-based mapping
      "problem": "Problem",
      "solution": "Solution",
      "market": "Market",
      "target": "Market",
      "competition": "Competition",
      "competitors": "Competition",
      "competitive": "Competition",
      "team": "Team",
      "founder": "Team",
      "business": "Business Model",
      "revenue": "Business Model",
      "pricing": "Business Model",
      "unit": "Business Model",
      "average": "Business Model",
      "traction": "Traction",
      "retention": "Traction",
      "current": "Traction",
      "key": "Traction",
      "vision": "Vision"
    };

    // Group responses by section
    const responsesBySection: Record<string, Record<string, string>> = {};
    
    responses?.forEach((response) => {
      // First check if the full question_key has a direct mapping (for merged keys like problem_core)
      const fullKeyMapping = sectionKeyMapping[response.question_key];
      if (fullKeyMapping) {
        if (!responsesBySection[fullKeyMapping]) {
          responsesBySection[fullKeyMapping] = {};
        }
        responsesBySection[fullKeyMapping][response.question_key] = response.answer || "";
        return;
      }
      
      // Fall back to prefix-based mapping
      const sectionMatch = response.question_key.match(/^([^_]+)/);
      if (sectionMatch) {
        const sectionKey = sectionMatch[1].toLowerCase();
        const sectionName = sectionKeyMapping[sectionKey] || sectionMatch[1].charAt(0).toUpperCase() + sectionMatch[1].slice(1);
        if (!responsesBySection[sectionName]) {
          responsesBySection[sectionName] = {};
        }
        responsesBySection[sectionName][response.question_key] = response.answer || "";
      }
    });

    console.log("Sections found in responses:", Object.keys(responsesBySection));

    // ============================================
    // Extract financial metrics for cross-section sharing
    // ============================================
    const unitEconomicsJson = responses?.find(r => r.question_key === 'unit_economics_json')?.answer;
    const unitEconomicsText = responses?.find(r => r.question_key === 'unit_economics')?.answer || "";
    const pricingInfo = responses?.find(r => r.question_key === 'pricing_model')?.answer || "";
    const revenueInfo = responses?.find(r => r.question_key === 'revenue_model')?.answer || "";
    
    let financialMetrics: any = null;
    if (unitEconomicsJson) {
      try {
        financialMetrics = JSON.parse(unitEconomicsJson);
        console.log("Parsed financial metrics from unit_economics_json:", financialMetrics);
      } catch (e) {
        console.warn("Could not parse unit_economics_json:", e);
      }
    }

    // Build financial context string for injection into section prompts
    let financialContextStr = "";
    if (financialMetrics || unitEconomicsText || pricingInfo || revenueInfo) {
      financialContextStr = `\n\n--- COMPANY FINANCIAL DATA (use for calculations) ---`;
      
      if (financialMetrics) {
        if (financialMetrics.mrr) financialContextStr += `\nMRR: €${financialMetrics.mrr}`;
        if (financialMetrics.arr) financialContextStr += `\nARR: €${financialMetrics.arr}`;
        if (financialMetrics.acv) financialContextStr += `\nACV (Avg Contract Value): €${financialMetrics.acv}`;
        if (financialMetrics.totalCustomers) financialContextStr += `\nTotal Customers: ${financialMetrics.totalCustomers}`;
        if (financialMetrics.cac) financialContextStr += `\nCAC: €${financialMetrics.cac}`;
        if (financialMetrics.ltv) financialContextStr += `\nLTV: €${financialMetrics.ltv}`;
        if (financialMetrics.ltvCacRatio) financialContextStr += `\nLTV:CAC Ratio: ${financialMetrics.ltvCacRatio}`;
        if (financialMetrics.paybackPeriod) financialContextStr += `\nPayback Period: ${financialMetrics.paybackPeriod} months`;
        if (financialMetrics.monthlyChurn) financialContextStr += `\nMonthly Churn: ${financialMetrics.monthlyChurn}%`;
        if (financialMetrics.grossMargin) financialContextStr += `\nGross Margin: ${financialMetrics.grossMargin}%`;
        if (financialMetrics.monthlyBurn) financialContextStr += `\nMonthly Burn: €${financialMetrics.monthlyBurn}`;
        if (financialMetrics.runway) financialContextStr += `\nRunway: ${financialMetrics.runway} months`;
        if (financialMetrics.monthlyGrowth) financialContextStr += `\nMonthly Growth: ${financialMetrics.monthlyGrowth}%`;
      }
      
      if (unitEconomicsText && !financialMetrics) {
        financialContextStr += `\nUnit Economics: ${unitEconomicsText}`;
      }
      if (pricingInfo) financialContextStr += `\nPricing Model: ${pricingInfo}`;
      if (revenueInfo) financialContextStr += `\nRevenue Model: ${revenueInfo}`;
      
    // Add bottoms-up calculation guidance for Market section
    financialContextStr += `\n\n**BOTTOMS-UP CALCULATION GUIDANCE:**`;
    
    // Calculate ACV from ARR/customers (use 'customers' field, not 'totalCustomers')
    const numCustomers = financialMetrics?.customers || financialMetrics?.totalCustomers;
    const arrValue = financialMetrics?.arr;
    
    if (financialMetrics?.acv) {
      const acv = parseFloat(financialMetrics.acv);
      const customersFor10M = Math.ceil(10000000 / acv);
      const customersFor50M = Math.ceil(50000000 / acv);
      const customersFor100M = Math.ceil(100000000 / acv);
      financialContextStr += `\n- ACV (Average Contract Value): €${acv}`;
      financialContextStr += `\n- At €${acv} ACV: ${customersFor10M.toLocaleString()} customers needed for €10M ARR`;
      financialContextStr += `\n- At €${acv} ACV: ${customersFor50M.toLocaleString()} customers needed for €50M ARR`;
      financialContextStr += `\n- At €${acv} ACV: ${customersFor100M.toLocaleString()} customers needed for €100M ARR`;
    } else if (arrValue && numCustomers && parseFloat(numCustomers) > 0) {
      const calculatedAcv = parseFloat(arrValue) / parseFloat(numCustomers);
      const customersFor10M = Math.ceil(10000000 / calculatedAcv);
      const customersFor50M = Math.ceil(50000000 / calculatedAcv);
      const customersFor100M = Math.ceil(100000000 / calculatedAcv);
      financialContextStr += `\n- Current customers: ${numCustomers}`;
      financialContextStr += `\n- Current ARR: €${arrValue}`;
      financialContextStr += `\n- Calculated ACV (ARR/customers): €${calculatedAcv.toFixed(0)}`;
      financialContextStr += `\n- At €${calculatedAcv.toFixed(0)} ACV: ${customersFor10M.toLocaleString()} customers needed for €10M ARR`;
      financialContextStr += `\n- At €${calculatedAcv.toFixed(0)} ACV: ${customersFor50M.toLocaleString()} customers needed for €50M ARR`;
      financialContextStr += `\n- At €${calculatedAcv.toFixed(0)} ACV: ${customersFor100M.toLocaleString()} customers needed for €100M ARR`;
    } else if (financialMetrics?.mrr) {
      // Fallback: calculate from MRR
      const mrrValue = parseFloat(financialMetrics.mrr);
      const impliedArr = mrrValue * 12;
      if (numCustomers && parseFloat(numCustomers) > 0) {
        const calculatedAcv = impliedArr / parseFloat(numCustomers);
        const customersFor10M = Math.ceil(10000000 / calculatedAcv);
        const customersFor50M = Math.ceil(50000000 / calculatedAcv);
        const customersFor100M = Math.ceil(100000000 / calculatedAcv);
        financialContextStr += `\n- Current customers: ${numCustomers}`;
        financialContextStr += `\n- Implied ARR (MRR x 12): €${impliedArr}`;
        financialContextStr += `\n- Calculated ACV: €${calculatedAcv.toFixed(0)}`;
        financialContextStr += `\n- At €${calculatedAcv.toFixed(0)} ACV: ${customersFor10M.toLocaleString()} customers needed for €10M ARR`;
        financialContextStr += `\n- At €${calculatedAcv.toFixed(0)} ACV: ${customersFor50M.toLocaleString()} customers needed for €50M ARR`;
        financialContextStr += `\n- At €${calculatedAcv.toFixed(0)} ACV: ${customersFor100M.toLocaleString()} customers needed for €100M ARR`;
      }
    }
    
    financialContextStr += `\n--- END FINANCIAL DATA ---`;
    }
    console.log("Financial context string:", financialContextStr);

    // Extract market context using AI before generating memo
    console.log("Extracting market context from responses...");
    
    // Support both old and new question keys
    const problemInfo = responses?.filter(r => 
      r.question_key.startsWith('problem_') || r.question_key === 'problem_core'
    ).map(r => r.answer).join('\n') || "";
    const solutionInfo = responses?.filter(r => 
      r.question_key.startsWith('solution_') || r.question_key === 'solution_core'
    ).map(r => r.answer).join('\n') || "";
    const icpInfo = responses?.find(r => r.question_key === 'target_customer' || r.question_key === 'market_icp')?.answer || "";
    const competitionInfo = responses?.filter(r => 
      r.question_key.startsWith('competition_') || r.question_key === 'competitive_moat'
    ).map(r => r.answer).join('\n') || "";
    const tractionInfo = responses?.filter(r => 
      r.question_key.startsWith('traction_') || r.question_key === 'traction_proof'
    ).map(r => r.answer).join('\n') || "";

    let marketContext: any = null;
    
    // Call extract-market-context function
    try {
      const contextResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/extract-market-context`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problem: problemInfo,
          solution: solutionInfo,
          icp: icpInfo,
          competition: competitionInfo,
          traction: tractionInfo
        }),
      });

      if (contextResponse.ok) {
        const contextData = await contextResponse.json();
        marketContext = contextData.marketContext;
        console.log("Market context extracted successfully:", marketContext);
      } else {
        console.warn("Failed to extract market context, proceeding without it");
      }
    } catch (contextError) {
      console.warn("Error extracting market context:", contextError);
    }

    // ============================================
    // BUILD COMPANY MODEL (Relational Reasoning Foundation)
    // ============================================
    console.log("Building Company Model for relational reasoning...");
    let companyModel: CompanyModel | null = null;
    let companyModelContext = "";
    
    try {
      const modelResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/build-company-model`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyId: companyId,
          forceRebuild: force
        }),
      });

      if (modelResponse.ok) {
        const modelData = await modelResponse.json();
        if (modelData.success && modelData.model) {
          companyModel = modelData.model as CompanyModel;
          companyModelContext = formatCompanyModelContext(companyModel);
          console.log(`✓ Company Model built successfully (Coherence: ${companyModel.coherence.overallCoherence}, Score: ${companyModel.coherence.score}/100)`);
          console.log(`  - Discrepancies found: ${companyModel.discrepancies?.length || 0}`);
          console.log(`  - Coherence issues: ${Object.values(companyModel.coherence.checks).filter(c => !c.passed).length}`);
          console.log(`  - Conditional hypotheses: ${companyModel.coherence.conditionalHypotheses?.length || 0}`);
        } else {
          console.warn("Company Model build returned unsuccessful:", modelData.errors);
        }
      } else {
        const errorText = await modelResponse.text();
        console.warn("Failed to build Company Model:", errorText);
      }
    } catch (modelError) {
      console.warn("Error building Company Model:", modelError);
    }

    // ============================================
    // SELECT ADAPTIVE BENCHMARK COHORT
    // ============================================
    const benchmarkCohortMatch = selectBenchmarkCohort(companyModel, company.stage);
    const benchmarkContext = formatBenchmarkContext(benchmarkCohortMatch);
    console.log(`✓ Selected benchmark cohort: ${benchmarkCohortMatch.cohort.name} (Match: ${benchmarkCohortMatch.matchScore}, Criteria: ${benchmarkCohortMatch.matchedCriteria.join(', ')})`);

    const kbContext = await fetchKBContext(supabaseClient, {
      geography: "Europe",
      stage: company.stage,
      sector: company.category,
    });

    // Check if memo already exists - get the most recent one
    const { data: existingMemo } = await supabaseClient
      .from("memos")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Only return existing memo if not forced and has ALL 8 sections including Investment Thesis AND vcQuickTake
    if (!force && existingMemo && existingMemo.structured_content) {
      const content = existingMemo.structured_content as any;
      const hasInvestmentThesis = content.sections?.some(
        (s: any) => s.title === "Investment Thesis"
      );
      const hasVCQuickTake = !!content.vcQuickTake;
      const hasEnhancedQuestions = content.sections?.every(
        (s: any) => !s.vcReflection?.questions || 
          s.vcReflection.questions.every((q: any) => 
            typeof q === 'object' && q.vcRationale && q.whatToPrepare
          )
      );
      const hasContent = content.sections && 
                         Array.isArray(content.sections) && 
                         content.sections.length >= 8 &&
                         hasInvestmentThesis &&
                         hasVCQuickTake &&
                         hasEnhancedQuestions;
      
      if (hasContent) {
        console.log(`Returning existing memo from cache (${content.sections.length} sections, vcQuickTake: ${hasVCQuickTake})`);
        return new Response(
          JSON.stringify({ 
            structuredContent: existingMemo.structured_content,
            company: {
              name: company.name,
              stage: company.stage,
              category: company.category,
              description: company.description
            },
            memoId: existingMemo.id,
            fromCache: true
          }), 
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } else {
        console.log(`Existing memo found but incomplete (${content.sections?.length || 0} sections, Investment Thesis: ${hasInvestmentThesis}, vcQuickTake: ${hasVCQuickTake}, enhancedQuestions: ${hasEnhancedQuestions}), regenerating...`);
      }
    } else if (force) {
      console.log("Force regeneration requested, skipping cache");
    }

    const enhancedSections: Record<string, any> = {};

    // ============================================
    // Research competitors using AI before generating Competition section
    // ============================================
    let competitorResearch: any = null;
    try {
      console.log("Researching competitors via AI...");
      const userProvidedCompetitors = responses?.filter(r => 
        r.question_key.startsWith('competition_') || r.question_key === 'competitive_moat'
      ).map(r => r.answer).join('\n') || "";
      
      const competitorResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/research-competitors`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyName: company.name,
          description: company.description,
          problem: problemInfo,
          solution: solutionInfo,
          industry: company.category || marketContext?.marketVertical || "Technology",
          userProvidedCompetitors
        }),
      });

      if (competitorResponse.ok) {
        competitorResearch = await competitorResponse.json();
        console.log("Competitor research completed:", competitorResearch?.marketType || "Unknown market type");
      } else {
        console.warn("Failed to research competitors, proceeding without it");
      }
    } catch (competitorError) {
      console.warn("Error researching competitors:", competitorError);
    }

    // Process each section in order
    for (const sectionName of sectionOrder) {
      const sectionResponses = responsesBySection[sectionName];
      
      if (!sectionResponses || Object.keys(sectionResponses).length === 0) {
        continue;
      }

      // Combine all responses in the section
      const combinedContent = Object.values(sectionResponses)
        .filter(Boolean)
        .join("\n\n");

      if (!combinedContent.trim()) {
        continue;
      }

      // Use custom prompt if available, otherwise use default
      const customPrompt = customPrompts[sectionName];
      
      // Build AI-deduced market context string if available
      let marketContextStr = "";
      if (marketContext) {
        marketContextStr = `\n\n--- AI-DEDUCED MARKET INTELLIGENCE ---
Market Vertical: ${marketContext.marketVertical || "N/A"}
Market Sub-Segment: ${marketContext.marketSubSegment || "N/A"}
Estimated TAM: ${marketContext.estimatedTAM || "N/A"}
Buyer Persona: ${marketContext.buyerPersona || "N/A"}
Competitor Weaknesses: ${marketContext.competitorWeaknesses || "N/A"}
Industry Benchmarks:
  - Typical CAC: ${marketContext.industryBenchmarks?.typicalCAC || "N/A"}
  - Typical LTV: ${marketContext.industryBenchmarks?.typicalLTV || "N/A"}
  - Growth Rate: ${marketContext.industryBenchmarks?.typicalGrowthRate || "N/A"}
  - Margins: ${marketContext.industryBenchmarks?.typicalMargins || "N/A"}
Market Drivers: ${marketContext.marketDrivers || "N/A"}
Confidence Level: ${marketContext.confidence || "N/A"}

NOTE: This market intelligence was AI-estimated based on the company's problem, solution, and ICP. Use it to enrich your analysis but clearly attribute it as "AI-estimated market data" when relevant.
--- END MARKET INTELLIGENCE ---`;
      }
      
      // Add financial context for Market section specifically
      let sectionFinancialStr = financialContextStr;
      if (sectionName === "Market" && financialContextStr) {
        sectionFinancialStr += `\n\n**CRITICAL FOR MARKET SECTION:** You MUST include a bottoms-up analysis using the ACV data above. Calculate exactly how many customers are needed to reach €10M, €50M, and €100M ARR. This is essential for SOM sizing.`;
      }

      // Add competitor research context for Competition section
      let competitorContextStr = "";
      if (sectionName === "Competition" && competitorResearch && !competitorResearch.error) {
        competitorContextStr = `\n\n--- AI-RESEARCHED COMPETITOR INTELLIGENCE ---
**IMPORTANT: This is AI-researched competitor data. Use these REAL company names and insights in your analysis.**

**Market Classification:** ${competitorResearch.marketType || "Unknown"}
**Rationale:** ${competitorResearch.marketTypeRationale || "N/A"}

**INCUMBENTS/GORILLAS:**
${(competitorResearch.incumbents || []).map((c: any) => `
- **${c.name}** ${c.estimatedSize ? `(${c.estimatedSize})` : ''}
  - Description: ${c.description}
  - Strengths: ${(c.strengths || []).join(', ')}
  - Weaknesses: ${(c.weaknesses || []).join(', ')}
  - Target Market: ${c.targetMarket}
  - Threat Level: ${c.threatLevel}`).join('\n') || "None identified"}

**DIRECT COMPETITORS:**
${(competitorResearch.directCompetitors || []).map((c: any) => `
- **${c.name}** ${c.funding ? `(${c.funding})` : ''}
  - Description: ${c.description}
  - Strengths: ${(c.strengths || []).join(', ')}
  - Weaknesses: ${(c.weaknesses || []).join(', ')}
  - Differentiation: ${c.differentiation}
  - Threat Level: ${c.threatLevel}`).join('\n') || "None identified"}

**ADJACENT SOLUTIONS:**
${(competitorResearch.adjacentSolutions || []).map((c: any) => `
- **${c.name}**: ${c.description}
  - How they compete: ${c.howTheyCompete}`).join('\n') || "None identified"}

**CRITICAL ASSESSMENT (BE HONEST!):**
- Founder Claims Valid: ${competitorResearch.criticalAssessment?.founderClaimsValid === true ? 'YES' : competitorResearch.criticalAssessment?.founderClaimsValid === false ? 'NO' : 'UNCLEAR'}
- Reasoning: ${competitorResearch.criticalAssessment?.reasoning || "N/A"}
- Major Concerns: ${(competitorResearch.criticalAssessment?.majorConcerns || []).join('; ') || "None identified"}
- Potential Moats: ${(competitorResearch.criticalAssessment?.potentialMoats || []).join('; ') || "None identified"}
- Recommended Beachhead: ${competitorResearch.criticalAssessment?.recommendedBeachhead || "N/A"}
- Overall Competitive Position: ${competitorResearch.criticalAssessment?.overallCompetitivePosition || "N/A"}
- Honest Verdict: ${competitorResearch.criticalAssessment?.honestVerdict || "N/A"}

**INSTRUCTIONS FOR COMPETITION SECTION:**
1. USE the specific competitor names above in your analysis
2. If the Critical Assessment indicates weak positioning, SAY SO CLEARLY
3. If "Founder Claims Valid" is NO, explain why their differentiation claims don't hold up
4. Be pragmatic and critical — VCs value honesty over cheerleading
5. If this is clearly a Red Ocean with strong, well-funded players, acknowledge the challenges
--- END COMPETITOR INTELLIGENCE ---`;
      }

      // Build quality criteria context for this section
      let criteriaContextStr = "";
      const sectionCriteria = criteriaBySection[sectionName];
      if (sectionCriteria) {
        const requiredElements = Array.isArray(sectionCriteria.required_elements) 
          ? sectionCriteria.required_elements.join(", ") 
          : sectionCriteria.required_elements;
        const niceToHave = Array.isArray(sectionCriteria.nice_to_have) 
          ? sectionCriteria.nice_to_have.join(", ") 
          : sectionCriteria.nice_to_have;
        criteriaContextStr = `\n\n--- EXPECTED DATA ELEMENTS FOR THIS SECTION ---
Required Elements: ${requiredElements}
Nice-to-Have Elements: ${niceToHave}
VC Context: ${sectionCriteria.vc_context || "N/A"}

**DATA QUALITY REQUIREMENTS:**
When analyzing founder-provided information, explicitly distinguish:
- VERIFIED: Data backed by external evidence (customer contracts, bank statements, third-party metrics)
- CLAIMED: Founder statements without independent verification
- INFERRED: AI-derived estimates based on available context
- MISSING: Critical data not provided that would change assessment

Flag explicitly if any REQUIRED elements above are MISSING from founder's response.
In your conclusion, note data confidence level.
--- END EXPECTED DATA ---`;
      }
      
      const prompt = customPrompt 
        ? `${customPrompt}\n\n---\n\nContext: ${company.name} is a ${company.stage} stage ${company.category || "startup"}.${marketContextStr}${sectionFinancialStr}${criteriaContextStr}\n\nRaw information to analyze:\n${combinedContent}\n\n---\n\nIMPORTANT: Follow the PART 1 and PART 2 structure detailed above in your custom instructions. Generate the complete narrative and reflection content first, then format your response as JSON.\n\nReturn ONLY valid JSON with this structure (no markdown, no code blocks):\n{\n  "narrative": {\n    "paragraphs": [{"text": "each paragraph from PART 1", "emphasis": "high|medium|normal"}],\n    "highlights": [{"metric": "90%", "label": "key metric"}],\n    "keyPoints": ["key takeaway 1", "key takeaway 2"]\n  },\n  "vcReflection": {\n    "analysis": "your complete VC Reflection text from PART 2 (painkiller vs vitamin analysis)",\n    "questions": [\n      {"question": "specific investor question 1", "vcRationale": "Why VCs care about this from fund economics perspective", "whatToPrepare": "Evidence/data to address this"},\n      {"question": "question 2", "vcRationale": "Economic reasoning", "whatToPrepare": "Preparation guidance"},\n      {"question": "question 3", "vcRationale": "Economic reasoning", "whatToPrepare": "Preparation guidance"}\n    ],\n    "benchmarking": "your complete Market & Historical Insights with real-world comparable companies (use web search)",\n    "conclusion": "your AI Conclusion synthesis text from PART 2"\n  }\n}`
        : `You are a senior VC investment analyst writing the "${sectionName}" section of an internal due diligence memo. Your job is to assess objectively AND teach founders how to present their company like a VC would.

=== SECTION-SPECIFIC REQUIREMENTS ===
${sectionName === "Problem" ? `
**MANDATORY FRAMEWORK APPLICATION — YOUR FIRST PARAGRAPH MUST BEGIN WITH:**
"This is a [Hair on Fire / Hard Fact / Future Vision] problem because [specific reason based on evidence]."

Sequoia's PMF Archetypes:
- "Hair on Fire": Urgent, obvious pain. Customers actively searching for solutions. Budget already allocated. Crowded market requiring differentiation.
- "Hard Fact": Pain accepted as "just how things are." Requires customer epiphany to recognize the problem is solvable. Often involves workflow inefficiency or manual processes.
- "Future Vision": Sounds like science fiction today. Requires belief in a new paradigm. Early market creation.

**YOU MUST COVER ALL OF THESE ASPECTS IN SEPARATE, LABELED PARAGRAPHS:**

**Today's Reality:** How is this task/process handled today? What tools/methods do people currently use? Paint a vivid picture of the status quo — be specific about the exact workflow and tools (Excel, WhatsApp, paper, legacy software, etc.).

**What's Broken:** What exactly is broken or inefficient about current solutions? Be specific and concrete about the failures. List 2-3 specific pain points with real examples.

**Quantified Pain (MANDATORY — YOU MUST INCLUDE SPECIFIC NUMBERS):**
Put NUMBERS to the problem. This is NOT optional. If founder data includes metrics, USE THEM. If not provided, YOU MUST ESTIMATE based on industry research and clearly label as "[AI-ESTIMATED]".

Calculate and include ALL of these:
- Hours wasted per week/month on manual processes (e.g., "[AI-ESTIMATED] Small business owners spend 5-8 hours/week on manual loyalty tracking")
- Money lost per month due to inefficiency (e.g., "[AI-ESTIMATED] €500-2,000/month in missed repeat revenue due to poor customer follow-up")
- Error rates or data quality issues (e.g., "[AI-ESTIMATED] 30-40% of customer data becomes stale within 90 days")
- Customer churn or lost opportunities (e.g., "[AI-ESTIMATED] 2-5 customers/week never return due to lack of engagement")
- Opportunity cost in € terms (e.g., "[AI-ESTIMATED] Total annual cost of inaction: €15,000-25,000 per SMB")

ALWAYS show your math. Example: "At an average transaction value of €15 and 3 potential repeat visits lost per customer, each churned customer = €45 lost LTV. With 10 preventable churns per month, that's €450/month or €5,400/year."

**Who Hurts Most:** Identify exactly who feels this pain most acutely — specific role titles (e.g., "Operations Manager at a 20-person agency"), company sizes (SMB vs Enterprise), industries, and the urgency level (rate 1-10 pain scale with justification).

**Why Now:** Is this problem getting worse? Identify 2-3 specific forces making this more urgent: regulatory changes, technology shifts (AI adoption), generational changes, economic pressures, competitive dynamics. Create urgency.
` : ""}${sectionName === "Solution" ? `
**MANDATORY FRAMEWORK APPLICATION — YOUR FIRST PARAGRAPH MUST BEGIN WITH:**
"This solution builds [Power Name] because [specific reason]."

Hamilton Helmer's 7 Powers — Identify the PRIMARY power this solution enables:
- Scale Economies: Unit costs decline as volume increases (e.g., software with near-zero marginal cost)
- Network Effects: Value increases with each additional user (marketplaces, social, data networks)
- Counter-Positioning: Incumbent can't copy without harming their core business
- Switching Costs: Lock-in through data, workflow, or integration depth
- Branding: Ability to charge premium for perceived quality/trust
- Cornered Resource: Exclusive access to talent, IP, data, or regulatory advantage
- Process Power: Embedded organizational capabilities competitors can't replicate

**YOU MUST COVER ALL OF THESE ASPECTS IN SEPARATE, LABELED PARAGRAPHS:**

**In Plain English:** Describe what the solution does in ONE simple sentence that a 10-year-old could understand. No jargon. No buzzwords. Just clear, concrete language. Then expand with a real example of how it works in practice.

**Why This Approach:** Why does the market need THIS specific approach? What's fundamentally different about this solution vs. existing alternatives? Be specific about the unique insight or angle.

**The ROI:** Be explicit about measurable outcomes — time saved (X hours/week), cost reduced (Y% or €Z/month), efficiency gained (X% faster), revenue increased (Y% improvement). USE SPECIFIC NUMBERS from founder data. If not provided, flag as [CRITICAL: ROI data needed to validate value proposition].

**Proof It Works:** Back claims with REAL evidence: customer quotes, testimonials, case study results, NPS scores, retention data, pilot outcomes. Clearly label each as:
- VERIFIED: Third-party evidence, public data, or signed contracts
- CLAIMED: Founder-stated without independent verification
- MISSING: Evidence that should exist but wasn't provided
` : ""}${sectionName === "Market" ? `
**MANDATORY: THIS SECTION MUST INCLUDE A COMPLETE BOTTOMS-UP CALCULATION WITH EXACT NUMBERS**
**IF DATA IS INCOMPLETE, YOU MUST PROVIDE NAPKIN MATH ESTIMATES LABELED AS [AI-ESTIMATED]**

**YOU MUST COVER ALL OF THESE ASPECTS IN SEPARATE, LABELED PARAGRAPHS:**

**Ideal Customer Profile:** Define the ICP with extreme precision:
- Company size: X-Y employees, €X-Y revenue range
- Industry vertical(s): specific sectors, not generic categories
- Buyer persona: exact job title, seniority, budget authority
- Pain level: rate 1-10 with justification
- Buying trigger: what event causes them to search for a solution?

**Bottoms-Up Market Math (CRITICAL — SHOW ALL CALCULATIONS):**
YOU MUST INCLUDE THIS EXACT CALCULATION FORMAT IN YOUR NARRATIVE. If founder did not provide ACV/pricing, ESTIMATE based on industry norms and label clearly:

"**The Math:**
- Current ACV: €[X] per customer per year [use provided data OR estimate: e.g., "[AI-ESTIMATED] typical SMB SaaS in this category: €200-500/year"]
- Customers needed for €10M ARR: [10,000,000 ÷ ACV] = [N] customers
- Customers needed for €50M ARR: [50,000,000 ÷ ACV] = [N] customers  
- Customers needed for €100M ARR: [100,000,000 ÷ ACV] = [N] customers
- Total addressable ICP pool: [estimate from market data — use public sources like Eurostat, industry reports]
- Required market penetration for €100M: [N ÷ Total ICP]%"

**VC-Grade Scale Reality Check:**
Explicitly assess: "To reach €100M ARR (VC-grade scale), this company would need [N] customers at current ACV. Given [market size estimate], this represents [X%] market penetration. This is [Achievable / Aggressive / Extremely Aggressive] because [reasoning]."

If penetration seems unrealistic, provide PATH TO SCALE:
- "To reach VC-scale with realistic penetration (5-10%), ACV would need to increase to €[X] through [enterprise tier / usage expansion / multi-product]."
- OR: "Market expansion to [adjacent geography/vertical] would add [N] potential customers, making the math work at [Y%] penetration."

**Growth Acceleration Strategies:** Provide 3 SPECIFIC, ACTIONABLE strategies to reach VC-scale faster:
1. **Adjacent Market:** Name a specific adjacent segment + why they'd buy + estimated additional TAM
2. **Channel Multiplier:** Identify a specific partner type (agencies, platforms, distributors) that could 10x distribution + example company
3. **Pricing Expansion:** Upsell/cross-sell opportunity (premium tier, add-on modules, usage-based) + estimated ACV uplift potential

**Market Tailwinds:** Identify 2-3 SPECIFIC external forces creating urgency:
- Regulatory: Name specific regulations (GDPR, CSRD, SOC2 requirements) creating compliance pressure
- Technology: Specific tech shifts (GenAI adoption, cloud migration mandates) enabling or requiring this solution
- Behavioral: Generational or work pattern changes (remote work, digital-native buyers) accelerating adoption
` : ""}${sectionName === "Competition" ? `
**MANDATORY: USE VC TERMINOLOGY THROUGHOUT — RED OCEAN, BLUE OCEAN, BEACHHEAD, CATEGORY CREATION, ETC.**

**YOU MUST COVER ALL OF THESE ASPECTS IN SEPARATE, LABELED PARAGRAPHS:**

**Competitive Landscape Overview:**
Start with: "This market is a [Red Ocean (crowded, commoditized) / Blue Ocean (uncontested, new category) / Purple Ocean (differentiated niche in existing market)]."

Map the competitive landscape by PLAYER TYPE. For EACH type, provide:
- 2-3 specific named examples (real companies)
- Their primary strength (what they do well)
- Their critical weakness (where they fall short)
- Their target segment (who they serve)

Player Types to Analyze:
1. **Incumbents/Gorillas:** Large established players (e.g., Salesforce, HubSpot, legacy POS systems). They have scale and brand trust but are slow to innovate and over-engineered for SMBs.
2. **Direct Competitors:** Startups solving the same problem. Name them specifically. Where do they overlap? Where do they differ?
3. **Adjacent Solutions:** Products that partially solve the problem (e.g., "many use Excel/WhatsApp as a workaround"). Why are these inadequate?
4. **Non-Consumption:** What % of the market uses NO solution? Why? (complexity, cost, awareness)

**Beachhead Strategy:**
"The beachhead market is [specific niche] because [reason]. Incumbents are [too big/too slow/too expensive/too complex] to effectively serve this segment."

Example: "Incumbents like [Competitor X] target enterprise clients with €50K+ ACV and 6-month implementation cycles. Their self-serve onboarding is non-existent, creating a gap for SMBs who need to be live in <1 week. This is our beachhead."

**Moat Analysis (7 Powers Framework):**
- Which power creates defensibility? (Network Effects, Switching Costs, Scale Economies, Counter-Positioning, Branding, Cornered Resource, Process Power)
- "This solution is a [Painkiller (must-have, budget allocated) / Vitamin (nice-to-have, first to cut)] because [evidence]."
- Counter-Positioning angle: "Incumbents cannot copy this approach without [cannibalizing their enterprise revenue / rebuilding their tech stack / abandoning their sales model]."
- Switching cost analysis: Once a customer is onboarded, what makes them sticky?

**Where We Win:**
Be explicit: "Company X wins against [Competitor Type] specifically because [concrete reason]."
- Speed to value: Onboarding in [X days/hours] vs. [competitor's Y weeks/months]
- Price point: [€X/month] vs. [competitor's €Y/month] — [Z%] cheaper
- Simplicity: [X clicks/steps] to core value vs. [Y clicks/steps] for competitor
- Focus: Purpose-built for [ICP] vs. [competitor's] generic approach
` : ""}${sectionName === "Business Model" ? `
**Unit Economics Lens**:
- LTV:CAC Ratio (target: 3:1+)
- CAC Payback Period (target: <18 months)
- Gross Margin analysis (SaaS: 70%+, marketplace: varies)
- Magic Number for SaaS efficiency

Explicitly state: "At a LTV:CAC of X:Y, this business..."
` : ""}${sectionName === "Traction" ? `
**Power Law Thinking**:
- Is this showing exponential or linear growth patterns?
- Stage-appropriate metrics (what matters at this stage)
- Growth quality vs. growth quantity
` : ""}${sectionName === "Team" ? `
**MANDATORY FRAMEWORK APPLICATION — YOUR FIRST PARAGRAPH MUST ASSESS:**
"This team demonstrates [Strong/Moderate/Weak] Founder-Market Fit because [specific evidence]."

**YOU MUST COVER ALL OF THESE ASPECTS IN SEPARATE, LABELED PARAGRAPHS:**

**Founder-Market Fit:** Assess WHY this specific team is uniquely positioned to win:
- **Domain Depth:** Years in industry, specific roles held, companies worked at, level of seniority. Quantify: "10 years in fintech, including 5 years as Head of Product at [Company]"
- **Unfair Advantage:** Unique access to customers, distribution, technology, or talent that others don't have
- **Personal Stake:** Are they solving their own problem? Have they experienced the pain firsthand?
- **Track Record:** Previous companies built, exits achieved, teams scaled

Rate founder-market fit: Strong (clear industry expertise + network) / Moderate (adjacent experience) / Weak (no obvious connection)

**Equity Structure:** Analyze the cap table health based on any ownership data provided:
- Current founder ownership % (healthy benchmark: 70-90% at pre-seed, 60-75% at seed)
- Split between co-founders — is it balanced and fair given contributions?
- Red flags: single founder with 99% (execution risk), 4+ equal founders (decision paralysis), significant equity already given to advisors/early employees
- If no equity data provided, flag as [MISSING: Cap table structure needed for full assessment]

**Execution Velocity:** What evidence demonstrates this team can ship and iterate fast?
- Time from idea to MVP
- Speed of customer acquisition (first 10 customers timeline)
- Iteration frequency (product updates, pivots made quickly)
- Quality of early team/advisors attracted
- Relevant: "Built and launched MVP in 6 weeks while both founders were employed full-time"
` : ""}${sectionName === "Vision" ? `
**Fund Economics Lens**:
- Power Law potential: Can this be a fund-returner?
- Ownership math at scale
- Market timing considerations
` : ""}
=== END SECTION REQUIREMENTS ===

=== RELATIONAL REASONING REQUIREMENTS ===
CRITICAL: You are NOT evaluating this section in isolation. You have access to a COMPLETE COMPANY MODEL below.
Every data point only has meaning in relation to the others. A weakness in one area may be acceptable if coherently explained by strength elsewhere.

YOUR JOB IS TO:
1. Interpret this section's data THROUGH THE LENS of the full Company Model
2. Address any coherence issues or discrepancies that affect this section
3. Use CONDITIONAL framing: "This is acceptable IF [condition]" or "This concerns me UNLESS [condition]"
4. Reference cross-sectional implications: How does this section relate to other dimensions?
5. Distinguish between "incomplete" (normal for ${company.stage} stage) and "directionally confused" (red flag)

${companyModelContext}

${benchmarkContext}

${kbContext}

=== END RELATIONAL CONTEXT ===

WRITING STYLE:
Write 4-6 flowing paragraphs that demonstrate how a top VC would present this section in an investment memo. This is NOT a summary — it's a COMPREHENSIVE ANALYSIS that teaches founders how VCs think. The writing should be:
- Detailed and thorough (cover all required aspects above)
- Simple and clear language (avoid unnecessary jargon)
- Story-driven with narrative arc
- Professional and polished
- Explicitly reference and apply VC frameworks
- Use CONDITIONAL reasoning based on Company Model insights

Structure:
1. **Hero Statement** (emphasis: "high"): Hook with the single most important insight, informed by the full Company Model
2. **Narrative Paragraphs** (emphasis: "narrative"): 4-5 flowing paragraphs systematically covering ALL the required aspects above
3. **Pull Quote** (emphasis: "quote") [optional]: A standout insight worth highlighting

CRITICAL ANALYSIS REQUIREMENTS:
- Lead with concerns and risks, not strengths
- Explicitly flag what is MISSING or UNVERIFIED
- Challenge founder assumptions
- If you would hesitate to invest, say so clearly
- Reference Company Model discrepancies and coherence issues if relevant to this section
- Use "X if Y" conditional framing for assessments
${criteriaContextStr}

Context: ${company.name} is a ${company.stage} stage ${company.category || "startup"}.${marketContextStr}${sectionFinancialStr}${competitorContextStr}

Raw information:
${combinedContent}

${marketContext ? 'IMPORTANT: Leverage the AI-deduced market intelligence above to enrich your analysis.\n\n' : ''}${sectionName === "Competition" && competitorResearch ? 'CRITICAL: You MUST use the AI-researched competitor names and data above. Be honest about competitive positioning — if the company faces strong, well-funded competitors, acknowledge the challenges.\n\n' : ''}${companyModel ? 'CRITICAL: Use the Company Model context above to inform your relational reasoning. Address any coherence issues that affect this section.\n\n' : ''}Return ONLY valid JSON with this exact structure:
{
  "narrative": {
    "paragraphs": [
      {"text": "One powerful sentence summarizing the most critical insight, explicitly naming any applicable VC framework.", "emphasis": "high"},
      {"text": "First narrative paragraph covering the first required aspect.", "emphasis": "narrative"},
      {"text": "Second narrative paragraph covering additional required aspects.", "emphasis": "narrative"},
      {"text": "Third narrative paragraph with more analysis.", "emphasis": "narrative"},
      {"text": "Fourth narrative paragraph completing the required coverage.", "emphasis": "narrative"},
      {"text": "Optional pull quote - a standout insight.", "emphasis": "quote"}
    ],
    "highlights": [
      {"metric": "3.2x", "label": "LTV:CAC Ratio"},
      {"metric": "$85K", "label": "ACV"}
    ],
    "keyPoints": [
      "Key takeaway 1",
      "Key takeaway 2",
      "Key takeaway 3"
    ]
  },
  "vcReflection": {
    "analysis": "Critical VC assessment focusing on the 2-3 biggest concerns. What assumptions lack evidence?",
    "questions": [
      {
        "question": "What is the single biggest risk?",
        "vcRationale": "Why VCs care from a fund economics perspective.",
        "whatToPrepare": "Specific evidence to address this concern."
      },
      {
        "question": "What assumptions may not hold?",
        "vcRationale": "VC economic reasoning.",
        "whatToPrepare": "Validation needed."
      },
      {
        "question": "What critical data is missing?",
        "vcRationale": "Why this matters for investment decision.",
        "whatToPrepare": "How to gather this data."
      }
    ],
    "benchmarking": "How this compares to market benchmarks",
    "conclusion": "Lead with primary concern. Rate confidence (Low/Medium/High)."
  }
}`;

      console.log(`Generating section: ${sectionName} (${Object.keys(sectionResponses).length} questions)`);

      let response: Response;
      try {
        response = await fetchWithRetry("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                content: `You are a PARTNER at a top-tier VC firm writing an internal investment memo to your fellow partners. 

CRITICAL VOICE REQUIREMENTS:
- Write in FIRST PERSON from a VC perspective ("I met with the founders...", "What I like about this...", "My concern here is...")
- NEVER say "the information provided says", "the founder claims", or "according to the deck"
- Synthesize and present YOUR assessment directly as if briefing partners after a meeting
- Be direct and opinionated: "This is compelling because..." or "I'm skeptical about..."
- Use phrases like "If we invest, we're betting that...", "The key risk I see is...", "What gets me excited here is..."

RELATIONAL REASONING REQUIREMENTS:
- You have access to a COMPLETE COMPANY MODEL with cross-validated data
- Do NOT evaluate sections in isolation - interpret all data in relation to the full context
- Use CONDITIONAL framing: "This is acceptable IF [condition]" or "This becomes concerning UNLESS [condition]"
- Address any coherence issues or discrepancies explicitly
- Distinguish between "incomplete" (normal for early stage) and "directionally confused" (red flag)

You must be objective and critical — highlight weaknesses, risks, and gaps alongside strengths. If data is missing or claims are unsubstantiated, flag it explicitly. Return valid JSON only, no markdown formatting.`,
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 3000,
          }),
        }, 3, 2000); // 3 retries, starting with 2s delay
      } catch (fetchError) {
        console.error(`Failed to generate section ${sectionName} after retries:`, fetchError);
        console.error(`Skipping section: ${sectionName}`);
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AI API error for ${sectionName}:`, response.status, errorText);
        console.error(`Failed to generate section: ${sectionName} - skipping`);
        continue;
      }

      const data = await response.json();
      let enhancedText = data.choices?.[0]?.message?.content?.trim();

      if (enhancedText) {
        // Clean up any markdown code blocks if present
        enhancedText = enhancedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        try {
          // Parse to validate it's proper JSON
          const structuredContent = JSON.parse(enhancedText);
          
          // Support both new format (with narrative/vcReflection) and legacy format
          if (structuredContent.narrative || structuredContent.vcReflection) {
            enhancedSections[sectionName] = structuredContent;
            console.log(`✓ Successfully generated section: ${sectionName}`);
          } else {
            // Legacy format - wrap in narrative
            enhancedSections[sectionName] = {
              narrative: structuredContent
            };
            console.log(`✓ Successfully generated section: ${sectionName} (legacy format)`);
          }
        } catch (parseError) {
          console.error(`First parse failed for ${sectionName}:`, parseError);
          console.error(`Raw response from AI (first 300 chars):`, enhancedText.substring(0, 300));
          
          // Retry with sanitized string
          try {
            const sanitized = sanitizeJsonString(enhancedText);
            console.log(`Retrying ${sectionName} with sanitized JSON...`);
            const structuredContent = JSON.parse(sanitized);
            
            if (structuredContent.narrative || structuredContent.vcReflection) {
              enhancedSections[sectionName] = structuredContent;
              console.log(`✓ Successfully generated section after sanitization: ${sectionName}`);
            } else {
              enhancedSections[sectionName] = {
                narrative: structuredContent
              };
              console.log(`✓ Generated section after sanitization (legacy format): ${sectionName}`);
            }
          } catch (retryError) {
            console.error(`All parsing attempts failed for ${sectionName}:`, retryError);
            // Final fallback: retry with a simpler prompt asking for plain text
            console.log(`Attempting final fallback with simplified prompt for ${sectionName}...`);
            try {
              const fallbackResponse = await fetchWithRetry("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                      content: "You are a VC analyst. Return ONLY valid JSON. Do not use special characters or unicode. Keep responses simple and direct.",
                    },
                    {
                      role: "user",
                      content: `Write a brief ${sectionName} analysis for ${company.name}. Data: ${combinedContent.substring(0, 1000)}

Return EXACTLY this JSON structure with your content filled in:
{"narrative":{"paragraphs":[{"text":"Main analysis paragraph here.","emphasis":"high"},{"text":"Supporting details.","emphasis":"normal"}],"keyPoints":["Key point 1","Key point 2","Key point 3"]},"vcReflection":{"analysis":"Critical assessment.","questions":[{"question":"Key question 1?","vcRationale":"Why VCs care about this","whatToPrepare":"Evidence to address this"},{"question":"Key question 2?","vcRationale":"Why VCs care about this","whatToPrepare":"Evidence to address this"}],"conclusion":"Summary conclusion."}}`,
                    },
                  ],
                  temperature: 0.3,
                  max_tokens: 1500,
                }),
              }, 2, 1000);

              if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json();
                let fallbackContent = fallbackData.choices?.[0]?.message?.content?.trim();
                if (fallbackContent) {
                  fallbackContent = fallbackContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                  const fallbackParsed = JSON.parse(fallbackContent);
                  enhancedSections[sectionName] = fallbackParsed;
                  console.log(`✓ Generated ${sectionName} with simplified fallback`);
                }
              }
            } catch (finalError) {
              console.error(`Final fallback also failed for ${sectionName}:`, finalError);
              enhancedSections[sectionName] = {
                narrative: {
                  paragraphs: [{ 
                    text: `The ${sectionName} section analysis is available but requires regeneration for optimal formatting.`, 
                    emphasis: "normal" 
                  }],
                  keyPoints: ["Please regenerate memo for complete analysis"]
                }
              };
              console.log(`✓ Generated section with placeholder: ${sectionName}`);
            }
          }
        }
      } else {
        console.error(`No content returned for section: ${sectionName}`);
      }
    }

    // ============================================
    // Build Classified Financial Metric Set BEFORE generating tools
    // This ensures consistent metric usage across ALL sections
    // ============================================
    console.log("Building classified financial metric set...");
    
    const responsesMap: Record<string, string> = {};
    for (const r of (responses || [])) {
      if (r.question_key && r.answer) {
        responsesMap[r.question_key] = r.answer;
      }
    }
    
    // Build classified metrics from responses
    const classifiedMetricSet = buildClassifiedMetricSetFromResponses(responsesMap, 'EUR');
    console.log(`Classified metrics built: ARR=${classifiedMetricSet.metricSet.arr?.actual?.value || 'N/A'}, ACV=${classifiedMetricSet.metricSet.acv?.actual?.value || 'N/A'}, Customers=${classifiedMetricSet.metricSet.customers?.actual?.value || 'N/A'}`);
    console.log(`Discrepancies found: ${classifiedMetricSet.discrepancies.length}`);
    
    // ============================================
    // Generate tool data for each section
    // ============================================
    console.log("=== Generating section tool data ===");
    
    for (const [sectionName, sectionContent] of Object.entries(enhancedSections)) {
      if (sectionName === "Investment Thesis") continue; // Skip thesis for now
      
      // Detect currency from responses
      const detectedCurrency = detectCurrencyFromText(Object.values(responsesMap).join(' '));
      
      // Build metric framework context with classified metrics
      const metricFramework: MetricFrameworkContext | null = companyModel ? {
        businessModelType: companyModel.financial?.pricing?.model || 'saas',
        primaryMetricLabel: companyModel.financial?.pricing?.acvBand === 'micro' ? 'ARPU' : 'ACV',
        primaryMetricFullLabel: companyModel.financial?.pricing?.acvBand === 'micro' ? 'Average Revenue Per User' : 'Annual Contract Value',
        periodicity: companyModel.financial?.pricing?.acvBand === 'micro' ? 'monthly' : 'annual',
        customerTermPlural: companyModel.customer?.icp?.segment === 'consumer' ? 'users' : 'customers',
        customerTermSingular: companyModel.customer?.icp?.segment === 'consumer' ? 'user' : 'customer',
        anchoredValue: classifiedMetricSet.metricSet.acv?.actual?.value || companyModel.financial?.pricing?.acv || undefined,
        anchoredValueSource: classifiedMetricSet.metricSet.acv?.actual?.value ? 'calculated' : (companyModel.financial?.pricing?.acv ? 'company_model' : undefined),
        currency: detectedCurrency,
        // NEW: Include full classified metric set
        classifiedMetrics: {
          arr: {
            actual: classifiedMetricSet.metricSet.arr?.actual,
            projected: classifiedMetricSet.metricSet.arr?.projected,
          },
          mrr: {
            actual: classifiedMetricSet.metricSet.mrr?.actual,
            historical: classifiedMetricSet.metricSet.mrr?.historical,
          },
          acv: {
            actual: classifiedMetricSet.metricSet.acv?.actual,
            minimum: classifiedMetricSet.metricSet.acv?.minimum,
            target: classifiedMetricSet.metricSet.acv?.target,
          },
          customers: {
            actual: classifiedMetricSet.metricSet.customers?.actual,
          },
          growth: {
            yearlyRate: classifiedMetricSet.metricSet.growth?.yearlyRate,
          },
        },
        metricDiscrepancies: classifiedMetricSet.discrepancies,
      } : null;
      
      await generateSectionToolData(
        {
          sectionName,
          sectionContent,
          companyName: company.name,
          companyCategory: company.category || "",
          companyStage: company.stage,
          companyDescription: company.description || "",
          financialMetrics,
          responses: responses || [],
          competitorResearch,
          marketContext,
          companyModel: companyModel,
          metricFramework: metricFramework
        },
        LOVABLE_API_KEY,
        supabaseClient,
        companyId
      );
    }
    
    console.log("=== Finished generating section tool data ===");

    // ============================================
    // Generate Investment Thesis section (synthesizes ALL sections)
    // ============================================
    console.log("Generating Investment Thesis section (final synthesis)...");
    
    const allResponsesText = responses?.map(r => `${r.question_key}: ${r.answer || "N/A"}`).join("\n\n") || "";
    const allSectionsContext = Object.entries(enhancedSections)
      .map(([title, content]) => `\n### ${title} Section Summary ###\n${JSON.stringify(content)}`)
      .join("\n");

    const investmentThesisPrompt = customPrompts["Investment Thesis"];
    
    if (investmentThesisPrompt) {
      let thesisMarketContextStr = "";
      if (marketContext) {
        thesisMarketContextStr = `\n\n--- AI-DEDUCED MARKET INTELLIGENCE ---
Market Vertical: ${marketContext.marketVertical || "N/A"}
Market Sub-Segment: ${marketContext.marketSubSegment || "N/A"}
Estimated TAM: ${marketContext.estimatedTAM || "N/A"}
Buyer Persona: ${marketContext.buyerPersona || "N/A"}
Competitor Weaknesses: ${marketContext.competitorWeaknesses || "N/A"}
Industry Benchmarks:
  - Typical CAC: ${marketContext.industryBenchmarks?.typicalCAC || "N/A"}
  - Typical LTV: ${marketContext.industryBenchmarks?.typicalLTV || "N/A"}
  - Growth Rate: ${marketContext.industryBenchmarks?.typicalGrowthRate || "N/A"}
  - Margins: ${marketContext.industryBenchmarks?.typicalMargins || "N/A"}
Market Drivers: ${marketContext.marketDrivers || "N/A"}
Confidence Level: ${marketContext.confidence || "N/A"}
--- END MARKET INTELLIGENCE ---`;
      }

      const thesisPromptText = `${investmentThesisPrompt}

---

**Context:** ${company.name} is a ${company.stage} stage ${company.category || "startup"}.${thesisMarketContextStr}

**Company Description:** ${company.description || "N/A"}

${kbContext}

${companyModel ? `
=== COMPANY MODEL (RELATIONAL REASONING CONTEXT) ===
This is the structured Company Model with cross-validated data. Use it for holistic synthesis.

**Coherence Assessment:** ${companyModel.coherence?.overallCoherence || 'unknown'} (Score: ${companyModel.coherence?.score || 'N/A'}/100)

**Key Financial Metrics:**
- Revenue: MRR ${companyModel.financial?.revenue?.stated?.mrr ?? 'N/A'} | ARR ${companyModel.financial?.revenue?.stated?.arr ?? 'N/A'}
- Pricing: ACV ${companyModel.financial?.pricing?.acv ?? 'N/A'} | Model: ${companyModel.financial?.pricing?.model ?? 'N/A'}
- Unit Economics: LTV:CAC ${companyModel.financial?.unitEconomics?.ltvCacRatio ?? 'N/A'} | Payback ${companyModel.financial?.unitEconomics?.paybackMonths ?? 'N/A'} months

**Market Model:**
- TAM (Stated): ${companyModel.market?.sizing?.stated?.tam ?? 'N/A'}
- TAM (Bottom-Up): ${companyModel.market?.sizing?.computed?.bottomUpTAM ?? 'N/A'}
- Plausibility: ${companyModel.market?.sizing?.tamPlausibility ?? 'unknown'}

**Traction Model:**
- Stage: ${companyModel.traction?.current?.stage ?? 'N/A'}
- Growth Consistency: ${companyModel.traction?.growth?.computed?.growthConsistency ?? 'N/A'}

**GTM-Traction Alignment:** ${companyModel.gtm?.alignment?.isAligned ? 'ALIGNED' : 'MISALIGNED - ' + (companyModel.gtm?.alignment?.explanation || 'N/A')}

**Coherence Issues:** ${Object.entries(companyModel.coherence?.checks || {}).filter(([_, c]) => !c.passed).map(([k, c]) => `${k}: ${c.explanation}`).join('; ') || 'None'}

**Discrepancies:** ${companyModel.discrepancies?.map(d => `${d.field}: ${d.explanation}`).join('; ') || 'None'}

**Conditional Hypotheses:** ${(companyModel.coherence?.conditionalHypotheses || []).map(h => `${h.hypothesis} (${h.probability})`).join('; ') || 'None'}

**Resolution Questions:** ${(companyModel.coherence?.resolutionQuestions || []).join('; ') || 'None'}
=== END COMPANY MODEL ===
` : ''}

**All Questionnaire Responses:**
${allResponsesText}

**Previously Generated Memo Sections:**
${allSectionsContext}

---

IMPORTANT: Synthesize ALL the information above into a comprehensive Investment Thesis. This is the final assessment section that pulls together everything.
${companyModel ? 'CRITICAL: Use the Company Model to inform your holistic synthesis. Address coherence issues and use conditional framing where appropriate.' : ''}

Return ONLY valid JSON with this structure (no markdown, no code blocks):
{
  "narrative": {
    "paragraphs": [{"text": "each paragraph covering the 6 structure elements", "emphasis": "high|medium|normal"}],
    "highlights": [{"metric": "key metric", "label": "description"}],
    "keyPoints": ["Core opportunity", "Execution proof", "Scalability driver", "Key risk"]
  },
  "vcReflection": {
    "analysis": "your complete comparative benchmarking and assessment",
    "questions": [
      {"question": "critical question 1", "vcRationale": "Why VCs care about this from fund economics perspective", "whatToPrepare": "Evidence/data to address this"},
      {"question": "question 2", "vcRationale": "Economic reasoning behind this question", "whatToPrepare": "Preparation guidance"},
      {"question": "question 3", "vcRationale": "Economic reasoning behind this question", "whatToPrepare": "Preparation guidance"},
      {"question": "question 4", "vcRationale": "Economic reasoning behind this question", "whatToPrepare": "Preparation guidance"},
      {"question": "question 5", "vcRationale": "Economic reasoning behind this question", "whatToPrepare": "Preparation guidance"}
    ],
    "benchmarking": "your complete benchmarking insights with real-world comparables",
    "conclusion": "your strict, non-biased final investment decision with reasoning"
  }
}`;

      let thesisResponse: Response;
      try {
        thesisResponse = await fetchWithRetry("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                content: `You are a senior VC PARTNER writing a critical, unbiased investment thesis to your fellow partners. Write in FIRST PERSON ("I believe...", "My recommendation is...", "What concerns me most...").

This is NOT an advocacy document. Your job is to assess whether this is truly a VC-grade opportunity with clear eyes. Highlight weaknesses and risks prominently. Challenge assumptions. If data is weak or missing, explicitly state that you cannot recommend investment. Do not default to optimism. Always respond with valid JSON only.`,
              },
              {
                role: "user",
                content: thesisPromptText,
              },
            ],
            temperature: 0.7,
            max_tokens: 3000,
          }),
        }, 3, 2000); // 3 retries, starting with 2s delay
      } catch (fetchError) {
        console.error("Failed to generate Investment Thesis after retries:", fetchError);
        console.warn("Investment Thesis generation failed, skipping section");
        thesisResponse = new Response(null, { status: 500 });
      }

      if (thesisResponse.ok) {
        const thesisData = await thesisResponse.json();
        let thesisContent = thesisData.choices?.[0]?.message?.content?.trim();

        if (thesisContent) {
          thesisContent = thesisContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          
          try {
            const structuredThesis = JSON.parse(thesisContent);
            
            if (structuredThesis.narrative || structuredThesis.vcReflection) {
              enhancedSections["Investment Thesis"] = structuredThesis;
              console.log("✓ Successfully generated Investment Thesis section");
            } else {
              enhancedSections["Investment Thesis"] = {
                narrative: structuredThesis
              };
              console.log("✓ Generated Investment Thesis (legacy format)");
            }
          } catch (parseError) {
            console.error("First parse failed for Investment Thesis:", parseError);
            console.error("Raw Investment Thesis response (first 300 chars):", thesisContent.substring(0, 300));
            
            // Retry with sanitized string
            try {
              const sanitized = sanitizeJsonString(thesisContent);
              console.log("Retrying Investment Thesis with sanitized JSON...");
              const structuredThesis = JSON.parse(sanitized);
              
              if (structuredThesis.narrative || structuredThesis.vcReflection) {
                enhancedSections["Investment Thesis"] = structuredThesis;
                console.log("✓ Successfully generated Investment Thesis after sanitization");
              } else {
                enhancedSections["Investment Thesis"] = {
                  narrative: structuredThesis
                };
                console.log("✓ Generated Investment Thesis after sanitization (legacy format)");
              }
            } catch (retryError) {
              console.error("All parsing attempts failed for Investment Thesis:", retryError);
              // Final fallback with regeneration message
              enhancedSections["Investment Thesis"] = {
                narrative: {
                  paragraphs: [{ 
                    text: "Investment Thesis content could not be fully parsed. Please regenerate the memo to restore this section.", 
                    emphasis: "high" 
                  }],
                  keyPoints: ["Regeneration recommended for complete analysis"]
                }
              };
              console.log("✓ Generated Investment Thesis with final fallback");
            }
          }
        } else {
          console.warn("No content returned for Investment Thesis section");
        }
      } else {
        console.warn("Failed to generate Investment Thesis section, skipping");
      }
    } else {
      console.warn("No Investment Thesis prompt found in database, skipping section");
    }

    // ============================================
    // Generate VC Quick Take (synthesis of all sections for preview)
    // ============================================
    console.log("Generating VC Quick Take summary...");
    
    let vcQuickTake = null;
    
    try {
    const quickTakePrompt = `You are a senior VC partner on an Investment Committee. Your job is NOT to give advice - it's to render a VERDICT. Think of yourself as a judge in a courtroom, not a consultant.

Based on these memo sections, provide a DIAGNOSTIC assessment - not explanatory feedback:

${Object.entries(enhancedSections).map(([title, content]) => 
  `### ${title} ###\n${JSON.stringify(content).substring(0, 1500)}`
).join("\n\n")}

Company: ${company.name} (${company.stage} stage, ${company.category || "startup"})
${financialContextStr}

CRITICAL TONE REQUIREMENTS:
- You are DIAGNOSING, not ADVISING
- Frame this as "what the IC decided" not "what you should fix"
- Create information asymmetry - imply frameworks and criteria they don't fully understand
- The founder should feel like a ruling was reached elsewhere using rules they haven't seen
- Make them feel intellectually outmatched but not dismissed
- This is a sentence handed down, not a lesson taught

CRITICAL FOR primaryConcernAnalysis:
- MUST reference ACTUAL numbers, metrics, claims, or specifics from the company data above
- Each field should feel like eavesdropping on a real IC discussion about THIS company
- Create "How did they know that?" moments by being specific
- DO NOT give solutions or advice - only diagnose what was found
- Use VC terminology: CAC, LTV, ACV, burn multiple, TAM, PMF, unit economics, etc.

Return ONLY valid JSON with this exact structure:
{
  "verdict": "A one-sentence ruling that sounds like a verdict, not advice. Examples: 'The unit economics don't survive IC scrutiny at current scale.' or 'Interesting opportunity that fails the repeatability test.' Frame as what was DECIDED, not what they should DO.",
  "concerns": [
    {
      "text": "Full IC concern - the complete objection. E.g., 'Customer concentration creates single-point-of-failure risk that makes portfolio construction difficult'",
      "category": "market|team|business_model|traction|competition|unit_economics",
      "teaserLine": "A SHORT company-specific teaser using VC terminology that reveals WHAT was questioned but not the full analysis. MUST start with 'Partners'. Examples:
        - 'Partners questioned the distribution model dependency.'
        - 'Partners flagged the customer concentration risk.'
        - 'Partners raised questions on the ACV trajectory.'
        - 'Partners noted concerns about the CAC payback period.'
        - 'Partners identified gaps in the go-to-market thesis.'
        - 'Partners questioned the burn multiple sustainability.'
        The teaser should reference ACTUAL issues from the memo sections above. Be SPECIFIC to THIS company."
    }
  ],
  "primaryConcernAnalysis": {
    "whyThisMatters": "Company-specific implication using ACTUAL data from the memo. Reference specific numbers, metrics, or claims from THIS company's pitch. E.g., 'Your stated CAC of €1,200 with 24-month payback exceeds the SaaS benchmark by 3x. At current burn, this creates runway pressure before unit economics flip positive.' Must be 2-3 sentences with specific data points.",
    "vcThinking": "What partners specifically discussed about THIS company - NOT generic VC wisdom. Reference actual claims from the pitch. E.g., 'The team claims 15% month-over-month growth but with only 3 months of data. Partners need 6+ months to rule out seasonality and noise. The question is whether this trajectory is repeatable.' Must feel like quoted internal discussion.",
    "fundPerspective": "Fund-level analysis specific to THIS deal with specific references. E.g., 'Customer concentration at 70% creates single-point-of-failure risk. If the primary customer churns, runway drops below our minimum threshold for Series A positioning. This affects our ability to syndicate.' Must reference actual risks from the memo.",
    "sectionSource": "Which memo section this concern primarily came from (e.g., 'Unit Economics', 'Traction', 'Market')"
  },
  "strengths": [
    "Frame as what CLEARED the bar. E.g., 'Founder-market fit exceeded the domain expertise threshold'",
    "E.g., 'Capital efficiency passed the burn multiple criterion'",
    "E.g., 'Initial retention data met the PMF benchmark'"
  ],
  "readinessLevel": "LOW or MEDIUM or HIGH",
  "readinessRationale": "One sentence that sounds like a committee conclusion, not advice. E.g., 'Does not meet the bar for partner-level discussion' or 'Cleared initial screening but requires de-risking on 3 criteria'",
  "frameworkScore": 0-100 (overall IC framework score - be harsh, most companies score 30-60),
  "criteriaCleared": 0-8 (how many of 8 evaluation criteria were passed - most early stage companies clear 2-4),
  "icStoppingPoint": "The section where the IC discussion effectively ended - e.g., 'Traction', 'Unit Economics', 'Market Size', 'Competitive Moat'",
  "rulingStatement": "A formal-sounding verdict. Options: 'Not ready for partner discussion', 'Requires significant de-risking before IC', 'Passed to associate level only', 'Ready for first partner meeting', 'Strong enough for IC, unlikely to proceed without [specific thing]'",
  "killerQuestion": "The single most damaging question that derailed the discussion. E.g., 'Where's the evidence of repeatable sales?' or 'What happens when [competitor] builds this?' - this should be the question that made partners look at each other"
}`;

      const quickTakeResponse = await fetchWithRetry("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              content: "You are a direct, no-nonsense VC partner. Be provocative and specific. Lead with concerns, not enthusiasm. Return only valid JSON.",
            },
            {
              role: "user",
              content: quickTakePrompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      }, 2, 1000);

      if (quickTakeResponse.ok) {
        const quickTakeData = await quickTakeResponse.json();
        let quickTakeContent = quickTakeData.choices?.[0]?.message?.content?.trim();
        
        if (quickTakeContent) {
          quickTakeContent = quickTakeContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          try {
            vcQuickTake = JSON.parse(quickTakeContent);
            
            // CRITICAL: Validate vcQuickTake structure to prevent React error #310
            // Ensure concerns and strengths are always arrays
            if (!Array.isArray(vcQuickTake.concerns)) {
              console.warn('vcQuickTake.concerns is not an array, fixing:', typeof vcQuickTake.concerns);
              vcQuickTake.concerns = [];
            }
            if (!Array.isArray(vcQuickTake.strengths)) {
              console.warn('vcQuickTake.strengths is not an array, fixing:', typeof vcQuickTake.strengths);
              vcQuickTake.strengths = [];
            }
            // Ensure verdict is a string
            if (typeof vcQuickTake.verdict !== 'string') {
              console.warn('vcQuickTake.verdict is not a string, fixing:', typeof vcQuickTake.verdict);
              vcQuickTake.verdict = String(vcQuickTake.verdict || '');
            }
            // Ensure readinessLevel is valid
            if (!['LOW', 'MEDIUM', 'HIGH'].includes(vcQuickTake.readinessLevel)) {
              console.warn('vcQuickTake.readinessLevel is invalid, defaulting to MEDIUM:', vcQuickTake.readinessLevel);
              vcQuickTake.readinessLevel = 'MEDIUM';
            }
            
            // Validate new diagnostic fields with sensible defaults
            if (typeof vcQuickTake.frameworkScore !== 'number' || vcQuickTake.frameworkScore < 0 || vcQuickTake.frameworkScore > 100) {
              vcQuickTake.frameworkScore = vcQuickTake.readinessLevel === 'LOW' ? 35 : vcQuickTake.readinessLevel === 'MEDIUM' ? 55 : 75;
            }
            if (typeof vcQuickTake.criteriaCleared !== 'number' || vcQuickTake.criteriaCleared < 0 || vcQuickTake.criteriaCleared > 8) {
              vcQuickTake.criteriaCleared = vcQuickTake.readinessLevel === 'LOW' ? 2 : vcQuickTake.readinessLevel === 'MEDIUM' ? 4 : 6;
            }
            if (typeof vcQuickTake.icStoppingPoint !== 'string' || !vcQuickTake.icStoppingPoint) {
              vcQuickTake.icStoppingPoint = vcQuickTake.readinessLevel === 'LOW' ? 'Traction' : 'Competitive Moat';
            }
            if (typeof vcQuickTake.rulingStatement !== 'string' || !vcQuickTake.rulingStatement) {
              vcQuickTake.rulingStatement = vcQuickTake.readinessLevel === 'LOW' ? 'Not ready for partner discussion' : 
                vcQuickTake.readinessLevel === 'MEDIUM' ? 'Requires significant de-risking before IC' : 'Ready for first partner meeting';
            }
            if (typeof vcQuickTake.killerQuestion !== 'string' || !vcQuickTake.killerQuestion) {
              vcQuickTake.killerQuestion = vcQuickTake.concerns[0] ? vcQuickTake.concerns[0].split(' ').slice(0, 8).join(' ') + '...' : "Where's the evidence?";
            }
            
            console.log("✓ Successfully generated and validated VC Quick Take with diagnostic fields");
          } catch (parseError) {
            console.warn("Failed to parse VC Quick Take, trying sanitization...");
            try {
              vcQuickTake = JSON.parse(sanitizeJsonString(quickTakeContent));
              
              // Apply same validation after sanitization
              if (!Array.isArray(vcQuickTake.concerns)) vcQuickTake.concerns = [];
              if (!Array.isArray(vcQuickTake.strengths)) vcQuickTake.strengths = [];
              if (typeof vcQuickTake.verdict !== 'string') vcQuickTake.verdict = String(vcQuickTake.verdict || '');
              if (!['LOW', 'MEDIUM', 'HIGH'].includes(vcQuickTake.readinessLevel)) vcQuickTake.readinessLevel = 'MEDIUM';
              
              // Apply diagnostic field defaults
              if (typeof vcQuickTake.frameworkScore !== 'number') vcQuickTake.frameworkScore = 45;
              if (typeof vcQuickTake.criteriaCleared !== 'number') vcQuickTake.criteriaCleared = 3;
              if (!vcQuickTake.icStoppingPoint) vcQuickTake.icStoppingPoint = 'Traction';
              if (!vcQuickTake.rulingStatement) vcQuickTake.rulingStatement = 'Requires significant de-risking before IC';
              if (!vcQuickTake.killerQuestion) vcQuickTake.killerQuestion = "Where's the evidence?";
              
              console.log("✓ Generated VC Quick Take after sanitization");
            } catch (e) {
              console.error("VC Quick Take parsing failed completely:", e);
              // Provide a safe fallback structure with all fields
              vcQuickTake = {
                verdict: "Analysis in progress - please regenerate if this persists.",
                concerns: [],
                strengths: [],
                readinessLevel: "MEDIUM",
                readinessRationale: "Unable to fully parse assessment. Consider regenerating.",
                frameworkScore: 45,
                criteriaCleared: 3,
                icStoppingPoint: "Evaluation",
                rulingStatement: "Evaluation pending",
                killerQuestion: "Requires regeneration"
              };
              console.log("✓ Using fallback VC Quick Take structure");
            }
          }
        }
      }
    } catch (quickTakeError) {
      console.warn("VC Quick Take generation failed:", quickTakeError);
    }

    // ============================================
    // Generate AI Action Plan (tailored action items based on vcQuickTake)
    // ============================================
    console.log("Generating AI Action Plan...");
    
    let aiActionPlan = null;
    
    if (vcQuickTake && Array.isArray(vcQuickTake.concerns) && vcQuickTake.concerns.length > 0) {
      try {
        const concernsForPrompt = vcQuickTake.concerns.map((c: any) => 
          typeof c === 'string' ? c : c?.text || String(c)
        ).filter(Boolean).slice(0, 5);
        
        const financialSummary = companyModel?.financial ? JSON.stringify({
          revenue: companyModel.financial.revenue,
          pricing: companyModel.financial.pricing,
          metrics: companyModel.financial.metrics
        }).substring(0, 800) : 'No financial data available';
        
        const tractionSummary = companyModel?.traction ? JSON.stringify({
          users: companyModel.traction.users,
          customers: companyModel.traction.customers,
          engagement: companyModel.traction.engagement
        }).substring(0, 600) : 'No traction data available';
        
        const teamSummary = companyModel?.team ? JSON.stringify({
          founders: companyModel.team.founders,
          gaps: companyModel.team.gaps
        }).substring(0, 400) : 'No team data available';

        const actionPlanPrompt = `You are a senior VC analyst creating a prioritized action plan for ${company.name} (${company.stage} stage, ${company.category || 'startup'}).

Based on the Investment Committee's concerns below, create 3-5 HIGHLY SPECIFIC action items that the founders should prioritize before their next pitch.

=== IC CONCERNS ===
${concernsForPrompt.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}

=== COMPANY DATA (use this to make recommendations SPECIFIC) ===
${financialSummary}

${tractionSummary}

${teamSummary}

=== INSTRUCTIONS ===
For each action item, you MUST:
1. Reference ACTUAL numbers, metrics, or specific claims from the company data above
2. Provide impact statements that explain why THIS specific issue hurts THIS company's fundability (not generic VC advice)
3. Give actionable fixes that are SPECIFIC to this company's situation and stage
4. Include a "good example" that shows what success looks like for THIS company specifically

CRITICAL: Do NOT use generic templates. Every field must reference specific data points from ${company.name}.

Return ONLY valid JSON:
{
  "items": [
    {
      "category": "narrative|traction|team|market|business|competition",
      "problem": "Specific issue based on THIS company's data - reference actual numbers/claims",
      "impact": "Why this specifically hurts THIS company's fundability - be concrete with implications",
      "howToFix": "Actionable steps tailored to THIS company's situation, stage, and resources",
      "goodExample": "What 'good' would look like for THIS specific company - concrete targets"
    }
  ],
  "overallUrgency": "critical|high|moderate",
  "summaryLine": "Company-specific summary of key improvements needed for ${company.name}"
}`;

        const actionPlanResponse = await fetchWithRetry("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                content: "You are a direct VC analyst creating actionable, company-specific recommendations. Every recommendation must reference specific data points from the company. No generic advice. Return only valid JSON.",
              },
              {
                role: "user",
                content: actionPlanPrompt,
              },
            ],
            temperature: 0.6,
            max_tokens: 2000,
          }),
        }, 2, 1000);

        if (actionPlanResponse.ok) {
          const actionPlanData = await actionPlanResponse.json();
          let actionPlanContent = actionPlanData.choices?.[0]?.message?.content?.trim();
          
          if (actionPlanContent) {
            actionPlanContent = actionPlanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            try {
              aiActionPlan = JSON.parse(actionPlanContent);
              
              // Validate structure
              if (!Array.isArray(aiActionPlan.items)) {
                console.warn('aiActionPlan.items is not an array, fixing');
                aiActionPlan.items = [];
              }
              
              // Ensure each item has required fields and add id/priority
              aiActionPlan.items = aiActionPlan.items.slice(0, 5).map((item: any, index: number) => ({
                id: `action-${index + 1}`,
                priority: index + 1,
                category: item.category || 'narrative',
                problem: item.problem || '',
                impact: item.impact || '',
                howToFix: item.howToFix || '',
                goodExample: item.goodExample || '',
                badExample: item.badExample
              }));
              
              // Validate urgency
              if (!['critical', 'high', 'moderate'].includes(aiActionPlan.overallUrgency)) {
                aiActionPlan.overallUrgency = aiActionPlan.items.length >= 4 ? 'critical' : 
                  aiActionPlan.items.length >= 2 ? 'high' : 'moderate';
              }
              
              // Ensure summaryLine exists
              if (!aiActionPlan.summaryLine) {
                aiActionPlan.summaryLine = `Address these ${aiActionPlan.items.length} gaps to improve ${company.name}'s fundability.`;
              }
              
              console.log(`✓ Successfully generated AI Action Plan with ${aiActionPlan.items.length} items`);
            } catch (parseError) {
              console.warn("Failed to parse AI Action Plan:", parseError);
              try {
                aiActionPlan = JSON.parse(sanitizeJsonString(actionPlanContent));
                console.log("✓ Generated AI Action Plan after sanitization");
              } catch (e) {
                console.error("AI Action Plan parsing failed completely:", e);
              }
            }
          }
        } else {
          console.warn("AI Action Plan generation failed, will fall back to client-side extraction");
        }
      } catch (actionPlanError) {
        console.warn("AI Action Plan generation error:", actionPlanError);
      }
    } else {
      console.log("Skipping AI Action Plan - no vcQuickTake concerns available");
    }

    // Validate memo completeness (expect 7-8 sections now: 7 main + Investment Thesis)
    const generatedSectionCount = Object.keys(enhancedSections).length;
    console.log(`\n=== MEMO GENERATION SUMMARY ===`);
    console.log(`Generated sections: ${generatedSectionCount}/8 expected`);
    console.log(`Section titles: ${Object.keys(enhancedSections).join(", ")}`);
    console.log(`VC Quick Take generated: ${vcQuickTake ? "Yes" : "No"}`);
    
    if (generatedSectionCount < 3) {
      console.error(`WARNING: Only ${generatedSectionCount} sections generated, expected at least 3`);
      throw new Error(`Incomplete memo generation: only ${generatedSectionCount} sections generated`);
    }

    // Normalize all VC questions to enhanced format before saving
    console.log("Normalizing VC questions to enhanced format...");
    for (const sectionName of Object.keys(enhancedSections)) {
      enhancedSections[sectionName] = normalizeSectionQuestions(enhancedSections[sectionName], sectionName);
    }

    // =============================================================================
    // COMPUTE OVERALL ASSESSMENT BY AGGREGATING TOOL DATA
    // =============================================================================
    console.log("Computing overall assessment from tool data...");
    
    // Fetch all tool data for this company to compute aggregated assessment
    const { data: toolDataRecords } = await supabaseClient
      .from("memo_tool_data")
      .select("section_name, tool_name, ai_generated_data")
      .eq("company_id", companyId);

    let overallAssessment: {
      dataCompleteness: number;
      confidenceLevel: 'high' | 'medium' | 'low' | 'insufficient_data';
      confidenceScore: number;
      sectionsAnalyzed: number;
      sectionBreakdown: { sectionName: string; dataCompleteness: number; confidenceScore: number; confidenceLevel: string }[];
      topImprovements: string[];
      assumptions: string[];
    } | null = null;

    if (toolDataRecords && toolDataRecords.length > 0) {
      const sectionAssessments: Map<string, { dataCompleteness: number[]; confidenceScores: number[]; improvements: string[]; assumptions: string[] }> = new Map();
      
      for (const record of toolDataRecords) {
        const aiData = record.ai_generated_data as any;
        if (!aiData?.assessment) continue;
        
        const assessment = aiData.assessment;
        const sectionName = record.section_name;
        
        if (!sectionAssessments.has(sectionName)) {
          sectionAssessments.set(sectionName, { dataCompleteness: [], confidenceScores: [], improvements: [], assumptions: [] });
        }
        
        const sectionData = sectionAssessments.get(sectionName)!;
        
        if (typeof assessment.dataCompleteness === 'number') {
          sectionData.dataCompleteness.push(assessment.dataCompleteness);
        }
        if (typeof assessment.confidenceScore === 'number') {
          sectionData.confidenceScores.push(assessment.confidenceScore);
        }
        if (Array.isArray(assessment.whatWouldChangeThisAssessment)) {
          sectionData.improvements.push(...assessment.whatWouldChangeThisAssessment.slice(0, 2));
        }
        if (Array.isArray(assessment.assumptions)) {
          sectionData.assumptions.push(...assessment.assumptions.slice(0, 2));
        }
      }
      
      // Compute section breakdown and aggregates
      const sectionBreakdown: { sectionName: string; dataCompleteness: number; confidenceScore: number; confidenceLevel: string }[] = [];
      let totalDataCompleteness = 0;
      let totalConfidenceScore = 0;
      let sectionCount = 0;
      const allImprovements: string[] = [];
      const allAssumptions: string[] = [];
      
      for (const [sectionName, data] of sectionAssessments.entries()) {
        if (data.dataCompleteness.length === 0 && data.confidenceScores.length === 0) continue;
        
        const avgDataCompleteness = data.dataCompleteness.length > 0 
          ? Math.round(data.dataCompleteness.reduce((a, b) => a + b, 0) / data.dataCompleteness.length)
          : 50;
        const avgConfidenceScore = data.confidenceScores.length > 0
          ? Math.round(data.confidenceScores.reduce((a, b) => a + b, 0) / data.confidenceScores.length)
          : 50;
        
        const confidenceLevel = avgConfidenceScore >= 75 ? 'high' : avgConfidenceScore >= 50 ? 'medium' : avgConfidenceScore >= 25 ? 'low' : 'insufficient_data';
        
        sectionBreakdown.push({
          sectionName,
          dataCompleteness: avgDataCompleteness,
          confidenceScore: avgConfidenceScore,
          confidenceLevel
        });
        
        totalDataCompleteness += avgDataCompleteness;
        totalConfidenceScore += avgConfidenceScore;
        sectionCount++;
        
        allImprovements.push(...data.improvements);
        allAssumptions.push(...data.assumptions);
      }
      
      if (sectionCount > 0) {
        const overallDataCompleteness = Math.round(totalDataCompleteness / sectionCount);
        const overallConfidenceScore = Math.round(totalConfidenceScore / sectionCount);
        const overallConfidenceLevel = overallConfidenceScore >= 75 ? 'high' : overallConfidenceScore >= 50 ? 'medium' : overallConfidenceScore >= 25 ? 'low' : 'insufficient_data';
        
        // Deduplicate and limit improvements
        const uniqueImprovements = [...new Set(allImprovements)].slice(0, 5);
        const uniqueAssumptions = [...new Set(allAssumptions)].slice(0, 5);
        
        overallAssessment = {
          dataCompleteness: overallDataCompleteness,
          confidenceLevel: overallConfidenceLevel,
          confidenceScore: overallConfidenceScore,
          sectionsAnalyzed: sectionCount,
          sectionBreakdown,
          topImprovements: uniqueImprovements,
          assumptions: uniqueAssumptions
        };
        
        console.log(`✓ Computed overall assessment: ${overallDataCompleteness}% complete, ${overallConfidenceLevel} confidence (${sectionCount} sections)`);
      }
    } else {
      console.log("No tool data found for assessment aggregation");
    }

    // =============================================================================
    // GENERATE DYNAMIC HOLISTIC VERDICTS FOR EACH SECTION
    // These are business-focused VC judgments specific to this company
    // =============================================================================
    console.log("Generating dynamic holistic verdicts for sections...");
    
    try {
      // Fetch section scores from tool data
      const sectionScores: Record<string, { score: number; vcBenchmark: number }> = {};
      if (toolDataRecords) {
        for (const record of toolDataRecords) {
          if (record.tool_name === 'sectionScore') {
            const aiData = record.ai_generated_data as any;
            if (aiData?.score && aiData?.vcBenchmark) {
              sectionScores[record.section_name] = {
                score: aiData.score,
                vcBenchmark: aiData.vcBenchmark
              };
            }
          }
        }
      }
      
      if (Object.keys(sectionScores).length > 0) {
        // Build context for holistic verdict generation
        const sectionScoresSummary = Object.entries(sectionScores).map(([section, data]) => 
          `${section}: ${data.score}/100 (benchmark: ${data.vcBenchmark})`
        ).join('\n');
        
        const holisticVerdictPrompt = `You are a senior VC partner providing holistic business judgments for ${company.name}, a ${company.stage} stage ${company.category || 'startup'}.

Based on the section scores and company context, generate business-focused verdicts for each section. These are NOT about data quality - they are about fundamental business viability and VC concerns.

Company: ${company.name}
Stage: ${company.stage}
Category: ${company.category || 'Technology'}
Description: ${company.description || 'Not provided'}

Section Scores:
${sectionScoresSummary}

Key Context from VC Quick Take:
- Verdict: ${vcQuickTake?.verdict || 'Not available'}
- Killer Question: ${vcQuickTake?.killerQuestion || 'Not available'}
- Top Concerns: ${Array.isArray(vcQuickTake?.concerns) ? vcQuickTake.concerns.slice(0, 3).map((c: any) => typeof c === 'string' ? c : c?.text).join('; ') : 'Not available'}

For EACH section that has a score, generate:
1. A holisticVerdict: A sharp, VC-perspective judgment about this aspect of the business (not the data quality). Should be specific to THIS company, not generic. Examples:
   - "Diaspora mental health is underserved but fragmented — need proof customers will pay vs. rely on community support"
   - "AI Twin concept is novel but unproven — regulatory risk around AI therapy is significant"
   - "First-mover in niche but market timing unclear — SMB budget cycles may delay adoption"

2. A stageContext: What this means at their specific stage and what milestones matter. Examples:
   - "At Seed, need 5+ paying customers to validate willingness to pay"
   - "Pre-seed can survive on LOIs, but Seed requires closed revenue"

Return ONLY valid JSON:
{
  "sectionVerdicts": {
    "Problem": { "verdict": "...", "stageContext": "..." },
    "Solution": { "verdict": "...", "stageContext": "..." },
    "Market": { "verdict": "...", "stageContext": "..." },
    "Competition": { "verdict": "...", "stageContext": "..." },
    "Team": { "verdict": "...", "stageContext": "..." },
    "Business Model": { "verdict": "...", "stageContext": "..." },
    "Traction": { "verdict": "...", "stageContext": "..." },
    "Vision": { "verdict": "...", "stageContext": "..." }
  }
}

CRITICAL: Each verdict must be SPECIFIC to ${company.name} and reference actual aspects of their business. Do not use generic VC clichés.`;

        const holisticResponse = await fetchWithRetry("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                content: "You are a senior VC partner providing business-focused verdicts. Be specific, critical, and reference the actual company context. Return only valid JSON.",
              },
              {
                role: "user",
                content: holisticVerdictPrompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 2000,
          }),
        }, 2, 1000);

        if (holisticResponse.ok) {
          const holisticData = await holisticResponse.json();
          let holisticContent = holisticData.choices?.[0]?.message?.content?.trim();
          
          if (holisticContent) {
            holisticContent = holisticContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            try {
              const parsedVerdicts = JSON.parse(holisticContent);
              const sectionVerdicts = parsedVerdicts.sectionVerdicts || parsedVerdicts;
              
              // Save each verdict to memo_tool_data
              for (const [sectionName, verdictData] of Object.entries(sectionVerdicts)) {
                if (verdictData && typeof verdictData === 'object') {
                  const { error: verdictError } = await supabaseClient
                    .from("memo_tool_data")
                    .upsert({
                      company_id: companyId,
                      section_name: sectionName,
                      tool_name: "holisticVerdict",
                      ai_generated_data: verdictData,
                      data_source: "ai-complete",
                      updated_at: new Date().toISOString()
                    }, {
                      onConflict: 'company_id,section_name,tool_name'
                    });
                  
                  if (verdictError) {
                    console.warn(`Failed to save holistic verdict for ${sectionName}:`, verdictError);
                  }
                }
              }
              
              console.log(`✓ Generated and saved holistic verdicts for ${Object.keys(sectionVerdicts).length} sections`);
            } catch (parseError) {
              console.warn("Failed to parse holistic verdicts:", parseError);
            }
          }
        } else {
          console.warn("Holistic verdict generation failed:", holisticResponse.status);
        }
      } else {
        console.log("No section scores found, skipping holistic verdict generation");
      }
    } catch (holisticError) {
      console.warn("Error generating holistic verdicts:", holisticError);
    }

    // =============================================================================
    // CROSS-SECTION COHERENCE VALIDATION
    // Flag inconsistent ACV/ARPU/GMV values across different tools
    // =============================================================================
    console.log("Running cross-section coherence validation...");
    
    interface MetricMention {
      sectionName: string;
      toolName: string;
      metricType: 'ACV' | 'ARPU' | 'GMV' | 'MRR' | 'ARR';
      value: number;
      currency?: string;
      context: string;
    }
    
    interface CoherenceFlag {
      type: 'metric_inconsistency' | 'terminology_mismatch' | 'calculation_error';
      severity: 'high' | 'medium' | 'low';
      description: string;
      affectedSections: string[];
      values: { section: string; tool: string; value: string }[];
      suggestion: string;
    }
    
    const coherenceFlags: CoherenceFlag[] = [];
    const metricMentions: MetricMention[] = [];
    
    // Scan all tool data for metric values
    if (toolDataRecords && toolDataRecords.length > 0) {
      // Regex patterns for extracting metric values
      const acvPattern = /(?:ACV|annual contract value)[:\s]*[\$€£]?([\d,]+(?:\.\d+)?)\s*(?:k|K|thousand)?/gi;
      const arpuPattern = /(?:ARPU|average revenue per user)[:\s]*[\$€£]?([\d,]+(?:\.\d+)?)\s*(?:\/(?:month|mo|year|yr))?/gi;
      const gmvPattern = /(?:GMV|gross merchandise value)[:\s]*[\$€£]?([\d,]+(?:\.\d+)?)\s*(?:k|K|M|million)?/gi;
      const mrrPattern = /(?:MRR|monthly recurring revenue)[:\s]*[\$€£]?([\d,]+(?:\.\d+)?)\s*(?:k|K)?/gi;
      const arrPattern = /(?:ARR|annual recurring revenue)[:\s]*[\$€£]?([\d,]+(?:\.\d+)?)\s*(?:k|K|M|million)?/gi;
      
      const parseValue = (match: string, multiplier?: string): number => {
        const cleanNum = match.replace(/,/g, '');
        let value = parseFloat(cleanNum);
        if (multiplier?.toLowerCase() === 'k' || multiplier?.toLowerCase() === 'thousand') {
          value *= 1000;
        } else if (multiplier?.toLowerCase() === 'm' || multiplier?.toLowerCase() === 'million') {
          value *= 1000000;
        }
        return value;
      };
      
      for (const record of toolDataRecords) {
        const aiData = record.ai_generated_data as any;
        if (!aiData) continue;
        
        // Convert entire tool data to string for pattern matching
        const toolDataStr = JSON.stringify(aiData);
        
        // Extract ACV mentions
        let acvMatch;
        while ((acvMatch = acvPattern.exec(toolDataStr)) !== null) {
          const value = parseValue(acvMatch[1]);
          if (value > 0 && value < 10000000) { // Sanity check
            metricMentions.push({
              sectionName: record.section_name,
              toolName: record.tool_name,
              metricType: 'ACV',
              value,
              context: toolDataStr.substring(Math.max(0, acvMatch.index - 50), acvMatch.index + 100)
            });
          }
        }
        
        // Extract ARPU mentions
        let arpuMatch;
        while ((arpuMatch = arpuPattern.exec(toolDataStr)) !== null) {
          const value = parseValue(arpuMatch[1]);
          if (value > 0 && value < 100000) { // ARPU typically lower
            metricMentions.push({
              sectionName: record.section_name,
              toolName: record.tool_name,
              metricType: 'ARPU',
              value,
              context: toolDataStr.substring(Math.max(0, arpuMatch.index - 50), arpuMatch.index + 100)
            });
          }
        }
        
        // Also check structured fields in tool data
        if (aiData.primaryMetric?.value) {
          metricMentions.push({
            sectionName: record.section_name,
            toolName: record.tool_name,
            metricType: aiData.primaryMetric?.label?.includes('ARPU') ? 'ARPU' : 'ACV',
            value: parseFloat(aiData.primaryMetric.value),
            context: 'structured field: primaryMetric'
          });
        }
        
        // Check scale calculations
        if (aiData.scaleRequirements?.revenuePerCustomer) {
          metricMentions.push({
            sectionName: record.section_name,
            toolName: record.tool_name,
            metricType: 'ACV',
            value: parseFloat(aiData.scaleRequirements.revenuePerCustomer),
            context: 'structured field: scaleRequirements.revenuePerCustomer'
          });
        }
      }
      
      // Group mentions by metric type and check for inconsistencies
      const groupedByType: Record<string, MetricMention[]> = {};
      for (const mention of metricMentions) {
        if (!groupedByType[mention.metricType]) {
          groupedByType[mention.metricType] = [];
        }
        groupedByType[mention.metricType].push(mention);
      }
      
      // Check each metric type for inconsistencies
      for (const [metricType, mentions] of Object.entries(groupedByType)) {
        if (mentions.length < 2) continue;
        
        const values = mentions.map(m => m.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        
        // Flag if variance is > 30%
        const variance = maxValue > 0 ? ((maxValue - minValue) / maxValue) * 100 : 0;
        
        if (variance > 30) {
          const affectedSections = [...new Set(mentions.map(m => m.sectionName))];
          
          coherenceFlags.push({
            type: 'metric_inconsistency',
            severity: variance > 50 ? 'high' : 'medium',
            description: `Inconsistent ${metricType} values detected across sections. Values range from ${minValue.toLocaleString()} to ${maxValue.toLocaleString()} (${variance.toFixed(0)}% variance).`,
            affectedSections,
            values: mentions.map(m => ({
              section: m.sectionName,
              tool: m.toolName,
              value: `${m.value.toLocaleString()} (${metricType})`
            })),
            suggestion: `Review the ${metricType} assumption in the company profile. All tools should use the same anchored value for consistent analysis.`
          });
        }
      }
      
      // Check for terminology mismatches (using ACV in a B2C context, etc.)
      const hasArpuMentions = (groupedByType['ARPU']?.length || 0) > 0;
      const hasAcvMentions = (groupedByType['ACV']?.length || 0) > 0;
      
      if (hasArpuMentions && hasAcvMentions) {
        coherenceFlags.push({
          type: 'terminology_mismatch',
          severity: 'low',
          description: 'Mixed usage of ARPU and ACV terminology detected. For consistency, choose one primary metric based on business model.',
          affectedSections: [...new Set([
            ...(groupedByType['ARPU']?.map(m => m.sectionName) || []),
            ...(groupedByType['ACV']?.map(m => m.sectionName) || [])
          ])],
          values: [
            ...((groupedByType['ARPU'] || []).map(m => ({ section: m.sectionName, tool: m.toolName, value: `ARPU: ${m.value.toLocaleString()}` }))),
            ...((groupedByType['ACV'] || []).map(m => ({ section: m.sectionName, tool: m.toolName, value: `ACV: ${m.value.toLocaleString()}` })))
          ],
          suggestion: 'B2C and PLG models should use ARPU. B2B enterprise models should use ACV. Ensure consistent terminology throughout.'
        });
      }
      
      console.log(`✓ Coherence validation complete: ${coherenceFlags.length} flag(s) found`);
      if (coherenceFlags.length > 0) {
        for (const flag of coherenceFlags) {
          console.log(`  - [${flag.severity.toUpperCase()}] ${flag.type}: ${flag.description}`);
        }
      }
    }

    // Save memo to database with structured content including overallAssessment, coherenceFlags, and aiActionPlan
    const structuredContent = {
      sections: Object.entries(enhancedSections).map(([title, content]) => ({
        title,
        ...(typeof content === 'string' ? { paragraphs: [{ text: content, emphasis: "normal" }] } : content)
      })),
      vcQuickTake: vcQuickTake,
      aiActionPlan: aiActionPlan,
      overallAssessment: overallAssessment,
      coherenceFlags: coherenceFlags.length > 0 ? coherenceFlags : undefined,
      generatedAt: new Date().toISOString()
    };

    let memoId: string;

    if (existingMemo) {
      // Update existing memo
      await supabaseClient
        .from("memos")
        .update({ 
          structured_content: structuredContent,
          status: "completed"
        })
        .eq("id", existingMemo.id);
      memoId = existingMemo.id;
    } else {
      // Create new memo
      const { data: newMemo, error: insertError } = await supabaseClient
        .from("memos")
        .insert({
          company_id: companyId,
          structured_content: structuredContent,
          status: "completed"
        })
        .select('id')
        .single();

      if (insertError || !newMemo) {
        throw new Error("Failed to save memo");
      }
      memoId = newMemo.id;
    }

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`=== Background memo generation completed successfully in ${totalDuration}s ===`);
    
    // Update job status to completed
    await supabaseClient
      .from("memo_generation_jobs")
      .update({ 
        status: "completed",
        completed_at: new Date().toISOString()
      })
      .eq("id", jobId);
      
    console.log(`Job ${jobId} marked as completed`);
    
  } catch (error) {
    const errorDuration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`=== Error in background memo generation after ${errorDuration}s ===`);
    console.error("Error details:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    // Update job status to failed
    await supabaseClient
      .from("memo_generation_jobs")
      .update({ 
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error",
        completed_at: new Date().toISOString()
      })
      .eq("id", jobId);
      
    console.log(`Job ${jobId} marked as failed`);
  }
}

// HTTP request handler
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("=== generate-full-memo request received ===");

  // Demo company ID for sample memo generation
  const DEMO_COMPANY_ID = "00000000-0000-0000-0000-000000000001";

  try {
    const { companyId, force = false, isAdminTriggered = false } = await req.json();
    console.log(`Request received: companyId=${companyId}, force=${force}, isAdminTriggered=${isAdminTriggered}`);

    if (!companyId) {
      return new Response(
        JSON.stringify({ error: "Company ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Allow demo company regeneration without auth (for admin purposes)
    const isDemoCompany = companyId === DEMO_COMPANY_ID;
    let userId: string | null = null;

    if (!isDemoCompany) {
      const authHeader = req.headers.get("Authorization");
      
      // Check if this is an admin-triggered request using service role key
      if (isAdminTriggered) {
        const token = authHeader?.replace("Bearer ", "");
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        
        if (token === serviceRoleKey) {
          console.log("Admin-triggered memo generation - bypassing user authentication");
          // Admin bypass - no need to verify user or company ownership
        } else {
          console.error("Admin trigger claimed but invalid service role key");
          return new Response(
            JSON.stringify({ error: "Invalid admin authentication" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else {
        // Normal user flow - authenticate user and verify ownership
        if (!authHeader) {
          console.error("No authorization header provided");
          return new Response(
            JSON.stringify({ error: "Authentication required" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const anonClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? ""
        );

        const token = authHeader.replace("Bearer ", "");
        const { data: userData, error: authError } = await anonClient.auth.getUser(token);
        
        if (authError || !userData.user) {
          console.error("Authentication failed:", authError);
          return new Response(
            JSON.stringify({ error: "Invalid authentication token" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        userId = userData.user.id;
        console.log(`Authenticated user: ${userId}`);

        // Verify company ownership for non-demo, non-admin companies
        const { data: company, error: companyError } = await supabaseClient
          .from("companies")
          .select("founder_id, name")
          .eq("id", companyId)
          .single();

        if (companyError || !company) {
          console.error("Error fetching company:", companyError);
          return new Response(
            JSON.stringify({ error: "Company not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (company.founder_id !== userId) {
          console.error(`Access denied: User ${userId} does not own company ${companyId}`);
          return new Response(
            JSON.stringify({ error: "Access denied" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    } else {
      console.log("Demo company detected - bypassing auth check");
    }

    // Check if there's already a job in progress for this company
    const { data: existingJob } = await supabaseClient
      .from("memo_generation_jobs")
      .select("id, status, started_at")
      .eq("company_id", companyId)
      .in("status", ["pending", "processing"])
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Check if existing job is stale (older than 10 minutes)
    const STALE_JOB_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes
    const isStaleJob = existingJob && 
      (Date.now() - new Date(existingJob.started_at).getTime() > STALE_JOB_THRESHOLD_MS);

    if (existingJob && isStaleJob) {
      console.log(`Found stale job ${existingJob.id} (started ${existingJob.started_at}), marking as failed`);
      // Mark stale job as failed so we can create a new one
      await supabaseClient
        .from("memo_generation_jobs")
        .update({ 
          status: "failed", 
          error_message: "Job timed out after 10 minutes",
          completed_at: new Date().toISOString()
        })
        .eq("id", existingJob.id);
    } else if (existingJob && !force) {
      console.log(`Existing job found: ${existingJob.id} with status ${existingJob.status}`);
      return new Response(
        JSON.stringify({ 
          jobId: existingJob.id,
          status: existingJob.status,
          message: "Generation already in progress"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create new job record
    const { data: newJob, error: jobError } = await supabaseClient
      .from("memo_generation_jobs")
      .insert({
        company_id: companyId,
        status: "processing",
        started_at: new Date().toISOString()
      })
      .select("id")
      .single();

    if (jobError || !newJob) {
      console.error("Error creating job:", jobError);
      return new Response(
        JSON.stringify({ error: "Failed to create generation job" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Created job ${newJob.id} for company ${companyId}`);

    // Start background generation using EdgeRuntime.waitUntil
    // This allows the function to return immediately while processing continues
    (globalThis as any).EdgeRuntime?.waitUntil?.(
      generateMemoInBackground(companyId, newJob.id, force)
    );

    // Return immediately with job ID
    return new Response(
      JSON.stringify({ 
        jobId: newJob.id,
        status: "processing",
        message: "Memo generation started"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-full-memo handler:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
