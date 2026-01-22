// Holistic Verdict Generator - Stage-aware, business-focused VC judgments
// NOT about missing data, but about fundamental business viability

export interface SectionVerdict {
  section: string;
  score: number;
  benchmark: number;
  status: 'critical' | 'weak' | 'passing' | 'strong';
  holisticVerdict: string;
  stageContext?: string;
}

export interface HolisticScorecard {
  companyName: string;
  stage: string;
  category?: string;
  overallScore: number;
  overallVerdict: string;
  investmentReadiness: 'NOT_READY' | 'CONDITIONAL' | 'READY';
  sections: SectionVerdict[];
  strategicConcerns: string[];
  topStrengths: string[];
  criticalWeaknesses: string[];
}

// Dynamic holistic verdict data structure (fetched from memo_tool_data)
export interface DynamicHolisticVerdict {
  verdict: string;
  stageContext?: string;
}

// Status thresholds
const getStatus = (score: number, benchmark: number): 'critical' | 'weak' | 'passing' | 'strong' => {
  if (score >= benchmark + 10) return 'strong';
  if (score >= benchmark) return 'passing';
  if (score >= benchmark - 15) return 'weak';
  return 'critical';
};

// Stage-calibrated weights for overall score
const SECTION_WEIGHTS: Record<string, number> = {
  'Team': 0.20,
  'Traction': 0.20,
  'Market': 0.15,
  'Problem': 0.12,
  'Solution': 0.10,
  'Business Model': 0.10,
  'Competition': 0.08,
  'Vision': 0.05
};

// Default fallback verdicts when no dynamic data is available
// Exported so UI can hide placeholder text instead of showing it on paid memos.
export const DEFAULT_VERDICT = "VC analysis pending — regenerate memo for detailed insights";
export const DEFAULT_STAGE_CONTEXT = "Stage-specific context will be generated with the memo";

// Cross-section strategic concerns based on score combinations
export function generateStrategicConcerns(sections: SectionVerdict[]): string[] {
  const concerns: string[] = [];
  
  const getSection = (name: string) => sections.find(s => s.section === name);
  
  const market = getSection('Market');
  const competition = getSection('Competition');
  const traction = getSection('Traction');
  const businessModel = getSection('Business Model');
  const solution = getSection('Solution');
  const team = getSection('Team');
  
  // Market × Competition cross-check
  if (market && competition && competition.score < 60 && market.score > 55) {
    concerns.push("Market is real but crowded — differentiation is existential, not optional");
  }
  
  // ACV × Sales Cycle × Traction
  if (businessModel && traction && businessModel.score < 60 && traction.score < 50) {
    concerns.push("ACV/sales cycle mismatch creates unsustainable unit economics at scale");
  }
  
  // Solution × Competition (commoditization risk)
  if (solution && competition && solution.score < 55 && competition.score < 60) {
    concerns.push("Low defensibility in crowded market — need moats before well-funded players move");
  }
  
  // Team × Traction (execution risk)
  if (team && traction && team.score >= 65 && traction.score < 50) {
    concerns.push("Strong team but weak traction suggests product or positioning issue, not execution");
  }
  
  // Traction × Business Model (PMF signal)
  if (traction && businessModel && traction.score < 50) {
    concerns.push("No repeatable sales motion — still in founder-led discovery phase");
  }
  
  return concerns.slice(0, 3); // Top 3 concerns
}

// Generate overall verdict based on weighted scores and cross-section analysis
export function generateOverallVerdict(
  sections: SectionVerdict[],
  stage: string,
  companyName: string
): { verdict: string; readiness: 'NOT_READY' | 'CONDITIONAL' | 'READY' } {
  const overallScore = calculateOverallScore(sections);
  const criticalSections = sections.filter(s => s.status === 'critical');
  const strongSections = sections.filter(s => s.status === 'strong');
  const weakSections = sections.filter(s => s.status === 'weak');
  
  // Determine readiness
  let readiness: 'NOT_READY' | 'CONDITIONAL' | 'READY';
  if (criticalSections.length >= 2 || overallScore < 50) {
    readiness = 'NOT_READY';
  } else if (criticalSections.length === 1 || overallScore < 60) {
    readiness = 'CONDITIONAL';
  } else {
    readiness = 'READY';
  }
  
  // Build verdict based on pattern
  const strengths = strongSections.map(s => s.section.toLowerCase()).slice(0, 2);
  const weaknesses = [...criticalSections, ...weakSections].map(s => s.section.toLowerCase()).slice(0, 2);
  
  const stageThreshold = stage.toLowerCase().includes('pre-seed') ? 55 : 
                         stage.toLowerCase().includes('seed') ? 62 : 70;
  
  const aboveBelow = overallScore >= stageThreshold ? 'meets' : 'below';
  
  let verdict = `${companyName} scores ${overallScore}/100 — ${aboveBelow} the ~${stageThreshold} threshold for competitive ${stage} rounds. `;
  
  if (strengths.length > 0) {
    verdict += `**Strengths:** ${strengths.join(' and ')} show promise. `;
  }
  
  if (weaknesses.length > 0) {
    verdict += `**Gaps:** ${weaknesses.join(' and ')} need work before approaching top-tier VCs. `;
  }
  
  // Add stage-specific guidance
  if (readiness === 'NOT_READY') {
    verdict += `Fix critical issues before fundraising — VCs will pass quickly.`;
  } else if (readiness === 'CONDITIONAL') {
    verdict += `Fundable with the right investor, but expect tough questions on weak areas.`;
  } else {
    verdict += `Ready to approach investors — lead with strengths, address concerns proactively.`;
  }
  
  return { verdict, readiness };
}

function calculateOverallScore(sections: SectionVerdict[]): number {
  let totalWeight = 0;
  let weightedSum = 0;
  
  sections.forEach(section => {
    const weight = SECTION_WEIGHTS[section.section] || 0.05;
    weightedSum += section.score * weight;
    totalWeight += weight;
  });
  
  return Math.round(weightedSum / totalWeight);
}

// Build full scorecard from section tools - NOW accepts dynamic verdicts
export function buildHolisticScorecard(
  sectionTools: Record<string, { sectionScore?: { score: number; vcBenchmark: number } }>,
  companyName: string,
  stage: string,
  category?: string,
  dynamicVerdicts?: Record<string, DynamicHolisticVerdict>
): HolisticScorecard {
  const sections: SectionVerdict[] = [];
  
  // Process each section
  Object.entries(sectionTools).forEach(([sectionName, tools]) => {
    if (tools.sectionScore) {
      const { score, vcBenchmark } = tools.sectionScore;
      
      // Use dynamic verdict if available, otherwise use default
      const verdictData = dynamicVerdicts?.[sectionName];
      
      sections.push({
        section: sectionName,
        score,
        benchmark: vcBenchmark,
        status: getStatus(score, vcBenchmark),
        holisticVerdict: verdictData?.verdict || DEFAULT_VERDICT,
        stageContext: verdictData?.stageContext || DEFAULT_STAGE_CONTEXT
      });
    }
  });
  
  // Sort by weight importance
  const sectionOrder = Object.keys(SECTION_WEIGHTS);
  sections.sort((a, b) => {
    const aIndex = sectionOrder.indexOf(a.section);
    const bIndex = sectionOrder.indexOf(b.section);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });
  
  const overallScore = calculateOverallScore(sections);
  const { verdict, readiness } = generateOverallVerdict(sections, stage, companyName);
  const strategicConcerns = generateStrategicConcerns(sections);
  
  const topStrengths = sections
    .filter(s => s.status === 'strong')
    .map(s => s.section);
  
  const criticalWeaknesses = sections
    .filter(s => s.status === 'critical' || s.status === 'weak')
    .sort((a, b) => a.score - b.score)
    .slice(0, 2)
    .map(s => s.section);
  
  return {
    companyName,
    stage,
    category,
    overallScore,
    overallVerdict: verdict,
    investmentReadiness: readiness,
    sections,
    strategicConcerns,
    topStrengths,
    criticalWeaknesses
  };
}
