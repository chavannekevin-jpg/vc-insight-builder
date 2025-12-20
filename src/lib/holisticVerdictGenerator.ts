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

// Holistic verdicts - business judgments, NOT data completeness
// These are pre-defined for the sample memo but show the pattern
export const SAMPLE_HOLISTIC_VERDICTS: Record<string, { verdict: string; stageContext: string }> = {
  'Problem': {
    verdict: "SMB sustainability is a vitamin, not a painkiller — buyers deprioritize until forced by supply chain mandates",
    stageContext: "At pre-seed, pain clarity is acceptable. By Seed, need proof of urgency."
  },
  'Solution': {
    verdict: "AI carbon tracking is table-stakes — no defensible moat against Watershed's inevitable SMB push",
    stageContext: "Solution works, but commoditization risk is high. Need integration moats."
  },
  'Market': {
    verdict: "Regulatory tailwinds are real but 2025 deadlines favor enterprises first — SMB adoption lags 18-24 months",
    stageContext: "Market size holds up. Timing question is about SMB urgency, not TAM."
  },
  'Competition': {
    verdict: "Crowded space with $200M+ funded players — 12-18 month window before they move down-market",
    stageContext: "Must build moats now. Enterprise players have resources to clone."
  },
  'Team': {
    verdict: "McKinsey + Google pedigree is fundable — gap is climate industry operator with buyer relationships",
    stageContext: "Strong for pre-seed. Add domain advisor before Seed close."
  },
  'Business Model': {
    verdict: "€12K ACV with 6-month cycles creates unsustainable CAC payback — need PLG or higher ACV",
    stageContext: "Unit economics are early-stage typical but need path to 3:1+ LTV:CAC for Series A."
  },
  'Traction': {
    verdict: "LOIs are promising but no repeatable sales process — still founder-hustle, not product-market fit",
    stageContext: "Acceptable at pre-seed. By Seed, need 3+ deals closed without founder."
  },
  'Vision': {
    verdict: "Exit narrative is credible — Intuit/Sage would pay $100M+ for the mid-market carbon layer",
    stageContext: "Vision clears the bar. Execution risk is the question."
  },
  'Investment Thesis': {
    verdict: "Coherent thesis but caught between SMB pricing and enterprise complexity — must pick a lane",
    stageContext: "Fundable at Seed with right positioning. Series A needs proven wedge."
  }
};

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

// Build full scorecard from section tools
export function buildHolisticScorecard(
  sectionTools: Record<string, { sectionScore?: { score: number; vcBenchmark: number } }>,
  companyName: string,
  stage: string,
  category?: string
): HolisticScorecard {
  const sections: SectionVerdict[] = [];
  
  // Process each section
  Object.entries(sectionTools).forEach(([sectionName, tools]) => {
    if (tools.sectionScore) {
      const { score, vcBenchmark } = tools.sectionScore;
      const verdictData = SAMPLE_HOLISTIC_VERDICTS[sectionName];
      
      sections.push({
        section: sectionName,
        score,
        benchmark: vcBenchmark,
        status: getStatus(score, vcBenchmark),
        holisticVerdict: verdictData?.verdict || "Analysis pending",
        stageContext: verdictData?.stageContext
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
