/**
 * Company-specific insight context extraction
 * Extracts and organizes AI-generated reasoning from memo_tool_data
 * to provide company-tailored tooltip explanations
 */

import { EnhancedSectionTools, SectionScore, VCInvestmentLogic } from "@/types/memo";
import { safeText, safeArray } from "@/lib/toolDataUtils";

export interface CompanyInsightContext {
  companyName: string;
  stage: string;
  category?: string;
  
  // Section-specific reasoning from AI
  sectionInsights: Record<string, SectionInsight>;
  
  // Aggregated key evidence points
  keyEvidence: string[];
  
  // Coherence/data quality indicators
  coherenceScore?: number;
  dataQualityNotes: string[];
}

export interface SectionInsight {
  section: string;
  score?: number;
  benchmark?: number;
  
  // From vcInvestmentLogic
  reasoning?: string;
  keyCondition?: string;
  decision?: string;
  
  // From sectionScore
  whatThisTellsVC?: string;
  fundabilityImpact?: string;
  topInsight?: string;
  
  // From assessment
  assumptions?: string[];
  whatWouldChange?: string[];
  confidenceScore?: number;
  
  // Extracted evidence points
  evidencePoints: string[];
}

/**
 * Extract company-specific insight context from section tools
 */
export function extractCompanyInsightContext(
  sectionTools: Record<string, EnhancedSectionTools>,
  companyName: string,
  stage: string,
  category?: string
): CompanyInsightContext {
  const context: CompanyInsightContext = {
    companyName,
    stage,
    category,
    sectionInsights: {},
    keyEvidence: [],
    dataQualityNotes: []
  };
  
  // Process each section's tools
  for (const [sectionName, tools] of Object.entries(sectionTools)) {
    const insight = extractSectionInsight(sectionName, tools);
    if (insight) {
      context.sectionInsights[sectionName] = insight;
      
      // Aggregate evidence
      context.keyEvidence.push(...insight.evidencePoints);
      
      // Track coherence issues
      if (insight.confidenceScore && insight.confidenceScore < 50) {
        context.dataQualityNotes.push(`${sectionName}: Low confidence (${insight.confidenceScore}/100)`);
      }
      
      // Extract coherence score from assumptions
      insight.assumptions?.forEach(assumption => {
        const coherenceMatch = assumption.match(/coherence score[^0-9]*(\d+)/i);
        if (coherenceMatch) {
          context.coherenceScore = parseInt(coherenceMatch[1]);
        }
      });
    }
  }
  
  return context;
}

/**
 * Extract insights for a single section
 */
function extractSectionInsight(
  sectionName: string,
  tools: EnhancedSectionTools
): SectionInsight | null {
  const insight: SectionInsight = {
    section: sectionName,
    evidencePoints: []
  };
  
  // Extract from sectionScore
  const sectionScore = tools.sectionScore as SectionScore | undefined;
  if (sectionScore) {
    insight.score = sectionScore.score;
    insight.benchmark = sectionScore.vcBenchmark;
    insight.whatThisTellsVC = safeText(sectionScore.whatThisTellsVC);
    insight.fundabilityImpact = safeText(sectionScore.fundabilityImpact);
    insight.topInsight = safeText((sectionScore as any).topInsight);
    
    // Extract from assessment
    const assessment = sectionScore.assessment;
    if (assessment) {
      insight.assumptions = safeArray<string>(assessment.assumptions);
      insight.whatWouldChange = safeArray<string>(assessment.whatWouldChangeThisAssessment);
      insight.confidenceScore = assessment.confidenceScore;
      
      // Add assumptions as evidence
      insight.evidencePoints.push(...(insight.assumptions || []));
    }
  }
  
  // Extract from vcInvestmentLogic
  const vcLogic = tools.vcInvestmentLogic as VCInvestmentLogic | undefined;
  if (vcLogic) {
    insight.reasoning = safeText(vcLogic.reasoning);
    insight.keyCondition = safeText(vcLogic.keyCondition);
    insight.decision = safeText(vcLogic.decision);
    
    // Extract specific evidence from reasoning text
    const evidencePatterns = [
      /lack of .*? validation/gi,
      /\d+\/100.*?score/gi,
      /no .*? customers/gi,
      /\d+ customers/gi,
      /\€[\d,]+k? (?:ACV|MRR|ARR)/gi,
      /\$[\d,]+k? (?:ACV|MRR|ARR)/gi,
      /contradictory/gi,
      /unverified/gi,
      /assumed/gi,
    ];
    
    const reasoning = insight.reasoning || '';
    evidencePatterns.forEach(pattern => {
      const matches = reasoning.match(pattern);
      if (matches) {
        insight.evidencePoints.push(...matches.map(m => m.trim()));
      }
    });
  }
  
  // Only return if we have meaningful data
  if (insight.reasoning || insight.whatThisTellsVC || insight.score !== undefined) {
    return insight;
  }
  
  return null;
}

/**
 * Get company-specific context for a concern or insight
 * Matches the insight text to relevant section data
 */
export function getCompanyContextForInsight(
  insightText: string,
  context: CompanyInsightContext
): { companyContext: string; evidence: string[] } | null {
  const lower = insightText.toLowerCase();
  
  // Map keywords to sections
  const sectionKeywords: Record<string, string[]> = {
    'Problem': ['problem', 'pain', 'customer validation', 'pain point'],
    'Solution': ['solution', 'product', 'api', 'technology', 'differentiation'],
    'Market': ['market', 'tam', 'sam', 'som', 'addressable', 'market size'],
    'Competition': ['competition', 'competitor', 'moat', 'defensibility', 'crowded'],
    'Team': ['team', 'founder', 'experience', 'domain expertise', 'execution'],
    'Business Model': ['unit economics', 'acv', 'cac', 'ltv', 'pricing', 'revenue model', 'burn'],
    'Traction': ['traction', 'customer', 'revenue', 'growth', 'retention', 'churn', 'pmf'],
    'Vision': ['vision', 'exit', 'scale', 'roadmap', 'milestone']
  };
  
  // Find matching section
  let matchedSection: string | null = null;
  for (const [section, keywords] of Object.entries(sectionKeywords)) {
    if (keywords.some(kw => lower.includes(kw))) {
      matchedSection = section;
      break;
    }
  }
  
  if (!matchedSection) {
    // Try to find any section with relevant data
    for (const [section, insight] of Object.entries(context.sectionInsights)) {
      if (insight.reasoning?.toLowerCase().includes(lower.substring(0, 20))) {
        matchedSection = section;
        break;
      }
    }
  }
  
  if (!matchedSection) return null;
  
  const sectionInsight = context.sectionInsights[matchedSection];
  if (!sectionInsight) return null;
  
  // Build company-specific context
  let companyContext = '';
  const evidence: string[] = [];
  
  // Use reasoning if available
  if (sectionInsight.reasoning) {
    // Extract the most relevant sentence from reasoning
    const sentences = sectionInsight.reasoning.split(/\. (?=[A-Z])/);
    const relevantSentence = sentences.find(s => 
      lower.split(' ').some(word => word.length > 4 && s.toLowerCase().includes(word))
    ) || sentences[0];
    
    if (relevantSentence) {
      companyContext = relevantSentence.trim();
      if (!companyContext.endsWith('.')) companyContext += '.';
    }
  }
  
  // Add key condition as actionable context
  if (sectionInsight.keyCondition && !companyContext.includes(sectionInsight.keyCondition.substring(0, 30))) {
    companyContext += ` ${sectionInsight.keyCondition}`;
  }
  
  // Collect evidence
  if (sectionInsight.assumptions && sectionInsight.assumptions.length > 0) {
    evidence.push(...sectionInsight.assumptions.slice(0, 3));
  }
  
  // Add score context
  if (sectionInsight.score !== undefined && sectionInsight.benchmark !== undefined) {
    const delta = sectionInsight.score - sectionInsight.benchmark;
    if (delta < -10) {
      evidence.push(`${matchedSection} score: ${sectionInsight.score}/${sectionInsight.benchmark} benchmark (${delta} gap)`);
    }
  }
  
  // Add confidence context
  if (sectionInsight.confidenceScore && sectionInsight.confidenceScore < 50) {
    evidence.push(`Confidence: ${sectionInsight.confidenceScore}/100 (data quality issues)`);
  }
  
  if (!companyContext && evidence.length === 0) return null;
  
  return {
    companyContext: companyContext || 'This assessment is based on your provided data.',
    evidence
  };
}

/**
 * Get improvement suggestions for a specific section
 */
export function getImprovementSuggestions(
  sectionName: string,
  context: CompanyInsightContext
): string[] {
  const insight = context.sectionInsights[sectionName];
  if (!insight) return [];
  
  const suggestions: string[] = [];
  
  // Add whatWouldChange items
  if (insight.whatWouldChange && insight.whatWouldChange.length > 0) {
    suggestions.push(...insight.whatWouldChange);
  }
  
  // Parse keyCondition for actionable items
  if (insight.keyCondition) {
    const condition = insight.keyCondition;
    // Extract specific asks like "provide X" or "demonstrate Y"
    const actionMatches = condition.match(/(?:provide|demonstrate|show|add|include|verify)\s+[^.]+/gi);
    if (actionMatches) {
      suggestions.push(...actionMatches.map(m => m.charAt(0).toUpperCase() + m.slice(1)));
    }
  }
  
  return suggestions.slice(0, 5); // Limit to 5 suggestions
}
