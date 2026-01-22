// Reconciliation Agent for post-generation document-level review
// This module evaluates the complete memo for internal consistency,
// narrative/score alignment, and tone calibration.

interface ReconciliationInput {
  sections: Array<{
    title: string;
    paragraphs?: Array<{ text: string; emphasis?: string }>;
  }>;
  vcQuickTake?: {
    verdict?: string;
    concerns?: string[];
    strengths?: string[];
    readinessAssessment?: string;
  };
  sectionScores?: Record<string, { score: number; verdict?: string }>;
  coherenceFlags?: Array<{
    type: string;
    severity: string;
    description: string;
  }>;
}

interface ReconciliationIssue {
  type: 'narrative_score_mismatch' | 'cross_section_contradiction' | 'tone_violation' | 'missing_evidence' | 'verdict_misalignment';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedSections: string[];
  suggestion: string;
  autoRepaired?: boolean;
}

export interface ReconciliationReport {
  version: number;
  generatedAt: string;
  passed: boolean;
  issues: ReconciliationIssue[];
  repairAttempts: number;
  narrativeScoreAlignment: 'aligned' | 'minor_drift' | 'major_drift';
  toneCalibration: 'analytical' | 'promotional' | 'overly_negative';
  overallQuality: 'high' | 'medium' | 'low';
}

// Extract section narrative text
function extractNarrativeText(section: { paragraphs?: Array<{ text: string }> }): string {
  return section.paragraphs?.map(p => p.text).join(' ') || '';
}

// Check for promotional language patterns
function detectPromotionalTone(text: string): boolean {
  const promotionalPatterns = [
    /revolutionary/i,
    /game[\s-]?changing/i,
    /disrupt(?:ive|ing|s)/i,
    /best[\s-]?in[\s-]?class/i,
    /world[\s-]?class/i,
    /unparalleled/i,
    /unprecedented/i,
    /enormous\s+opportunity/i,
    /massive\s+potential/i,
    /can['']t\s+fail/i,
    /guaranteed/i,
  ];
  
  const matches = promotionalPatterns.filter(p => p.test(text));
  return matches.length >= 2; // Flag if 2+ promotional phrases
}

// Check for overly negative tone
function detectOverlyNegativeTone(text: string): boolean {
  const negativePatterns = [
    /fatal\s+flaw/i,
    /impossible\s+to/i,
    /will\s+never/i,
    /doomed/i,
    /hopeless/i,
    /completely\s+lacks/i,
    /no\s+chance/i,
    /avoid\s+at\s+all\s+costs/i,
  ];
  
  const matches = negativePatterns.filter(p => p.test(text));
  return matches.length >= 2;
}

// Check for score/narrative misalignment
function checkScoreNarrativeAlignment(
  sectionTitle: string,
  narrativeText: string,
  score: number | undefined
): ReconciliationIssue | null {
  if (score === undefined) return null;
  
  // Detect sentiment in narrative
  const positiveIndicators = [
    /strong/i, /excellent/i, /impressive/i, /solid/i, /well[\s-]?positioned/i,
    /clear\s+advantage/i, /compelling/i, /robust/i
  ].filter(p => p.test(narrativeText)).length;
  
  const negativeIndicators = [
    /weak/i, /lacking/i, /insufficient/i, /unclear/i, /concerning/i,
    /missing/i, /limited/i, /risky/i, /gap/i
  ].filter(p => p.test(narrativeText)).length;
  
  const sentimentScore = positiveIndicators - negativeIndicators;
  
  // High score (>75) but negative narrative
  if (score > 75 && sentimentScore < -2) {
    return {
      type: 'narrative_score_mismatch',
      severity: 'high',
      description: `${sectionTitle} has a high score (${score}) but the narrative is predominantly negative`,
      affectedSections: [sectionTitle],
      suggestion: 'Either lower the score to reflect concerns or revise the narrative to highlight strengths',
    };
  }
  
  // Low score (<50) but positive narrative
  if (score < 50 && sentimentScore > 2) {
    return {
      type: 'narrative_score_mismatch',
      severity: 'high',
      description: `${sectionTitle} has a low score (${score}) but the narrative is predominantly positive`,
      affectedSections: [sectionTitle],
      suggestion: 'Either raise the score to match the analysis or add specific concerns to the narrative',
    };
  }
  
  // Minor drift
  if ((score > 70 && sentimentScore < 0) || (score < 40 && sentimentScore > 0)) {
    return {
      type: 'narrative_score_mismatch',
      severity: 'medium',
      description: `${sectionTitle} shows minor misalignment between score (${score}) and narrative tone`,
      affectedSections: [sectionTitle],
      suggestion: 'Consider aligning the analytical tone with the quantitative assessment',
    };
  }
  
  return null;
}

// Check verdict alignment with overall assessment
function checkVerdictAlignment(
  vcQuickTake: ReconciliationInput['vcQuickTake'],
  sectionScores: ReconciliationInput['sectionScores']
): ReconciliationIssue | null {
  if (!vcQuickTake?.verdict || !sectionScores) return null;
  
  const scores = Object.values(sectionScores).map(s => s.score).filter(s => typeof s === 'number');
  if (scores.length === 0) return null;
  
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const verdict = vcQuickTake.verdict.toLowerCase();
  
  // Positive verdict but low average score
  if (avgScore < 50 && (verdict.includes('strong') || verdict.includes('recommend') || verdict.includes('compelling'))) {
    return {
      type: 'verdict_misalignment',
      severity: 'high',
      description: `Overall verdict is positive but average section score is only ${avgScore.toFixed(0)}`,
      affectedSections: ['VC Quick Take'],
      suggestion: 'Revise the verdict to reflect the analytical findings across sections',
    };
  }
  
  // Negative verdict but high average score
  if (avgScore > 70 && (verdict.includes('pass') || verdict.includes('weak') || verdict.includes('concerning'))) {
    return {
      type: 'verdict_misalignment',
      severity: 'high',
      description: `Overall verdict is negative but average section score is ${avgScore.toFixed(0)}`,
      affectedSections: ['VC Quick Take'],
      suggestion: 'Revise the verdict to match the strong scores across sections',
    };
  }
  
  return null;
}

// Main reconciliation function
export function runReconciliation(input: ReconciliationInput): ReconciliationReport {
  const issues: ReconciliationIssue[] = [];
  let toneCalibration: ReconciliationReport['toneCalibration'] = 'analytical';
  
  // Aggregate all narrative text for tone analysis
  const allNarrativeText = input.sections.map(s => extractNarrativeText(s)).join(' ');
  
  // Check tone calibration
  if (detectPromotionalTone(allNarrativeText)) {
    toneCalibration = 'promotional';
    issues.push({
      type: 'tone_violation',
      severity: 'medium',
      description: 'The memo contains promotional language that may undermine analytical credibility',
      affectedSections: ['Multiple'],
      suggestion: 'Replace superlatives with specific, evidence-based statements',
    });
  } else if (detectOverlyNegativeTone(allNarrativeText)) {
    toneCalibration = 'overly_negative';
    issues.push({
      type: 'tone_violation',
      severity: 'medium',
      description: 'The memo contains overly harsh language that may not be constructive',
      affectedSections: ['Multiple'],
      suggestion: 'Frame concerns as risks with mitigation paths rather than fatal flaws',
    });
  }
  
  // Check each section for score/narrative alignment
  for (const section of input.sections) {
    const sectionScore = input.sectionScores?.[section.title];
    const alignmentIssue = checkScoreNarrativeAlignment(
      section.title,
      extractNarrativeText(section),
      sectionScore?.score
    );
    if (alignmentIssue) {
      issues.push(alignmentIssue);
    }
  }
  
  // Check verdict alignment
  const verdictIssue = checkVerdictAlignment(input.vcQuickTake, input.sectionScores);
  if (verdictIssue) {
    issues.push(verdictIssue);
  }
  
  // Incorporate existing coherence flags
  if (input.coherenceFlags) {
    for (const flag of input.coherenceFlags) {
      if (flag.severity === 'high') {
        issues.push({
          type: 'cross_section_contradiction',
          severity: 'high',
          description: flag.description,
          affectedSections: [],
          suggestion: 'Review the flagged metrics and ensure consistency across all sections',
        });
      }
    }
  }
  
  // Determine overall alignment and quality
  const highSeverityCount = issues.filter(i => i.severity === 'high').length;
  const mediumSeverityCount = issues.filter(i => i.severity === 'medium').length;
  
  let narrativeScoreAlignment: ReconciliationReport['narrativeScoreAlignment'] = 'aligned';
  if (highSeverityCount > 0) {
    narrativeScoreAlignment = 'major_drift';
  } else if (mediumSeverityCount > 1) {
    narrativeScoreAlignment = 'minor_drift';
  }
  
  let overallQuality: ReconciliationReport['overallQuality'] = 'high';
  if (highSeverityCount >= 2 || issues.length >= 5) {
    overallQuality = 'low';
  } else if (highSeverityCount === 1 || mediumSeverityCount >= 2) {
    overallQuality = 'medium';
  }
  
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    passed: highSeverityCount === 0,
    issues,
    repairAttempts: 0,
    narrativeScoreAlignment,
    toneCalibration,
    overallQuality,
  };
}
