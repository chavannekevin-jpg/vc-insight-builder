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
 * Matches the insight text to relevant section data and finds the MOST RELEVANT sentence
 */
export function getCompanyContextForInsight(
  insightText: string,
  context: CompanyInsightContext
): { companyContext: string; evidence: string[] } | null {
  const lower = insightText.toLowerCase();
  
  // Extract significant words from the insight (4+ chars, not common words)
  const commonWords = ['this', 'that', 'with', 'from', 'have', 'been', 'will', 'would', 'could', 'should', 'their', 'there', 'about', 'which', 'when', 'what', 'into', 'more', 'some', 'than', 'very', 'also', 'just', 'only'];
  const significantWords = lower
    .split(/\s+/)
    .filter(w => w.length >= 4 && !commonWords.includes(w))
    .map(w => w.replace(/[^a-z]/g, ''))
    .filter(w => w.length >= 4);
  
  // Score each section's relevance to the insight
  let bestMatch: { section: string; score: number; sentence: string } | null = null;
  
  for (const [sectionName, insight] of Object.entries(context.sectionInsights)) {
    if (!insight.reasoning) continue;
    
    // Split reasoning into sentences
    const sentences = insight.reasoning.split(/(?<=[.!?])\s+(?=[A-Z])/);
    
    for (const sentence of sentences) {
      const sentenceLower = sentence.toLowerCase();
      
      // Score based on matching significant words
      let score = 0;
      for (const word of significantWords) {
        if (sentenceLower.includes(word)) {
          score += word.length; // Longer matching words = higher score
        }
      }
      
      // Bonus for matching multiple words
      const matchCount = significantWords.filter(w => sentenceLower.includes(w)).length;
      if (matchCount >= 2) score *= 1.5;
      if (matchCount >= 3) score *= 2;
      
      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { section: sectionName, score, sentence: sentence.trim() };
      }
    }
    
    // Also check whatThisTellsVC and fundabilityImpact
    const altTexts = [insight.whatThisTellsVC, insight.fundabilityImpact, insight.topInsight].filter(Boolean);
    for (const text of altTexts) {
      if (!text) continue;
      const textLower = text.toLowerCase();
      let score = 0;
      for (const word of significantWords) {
        if (textLower.includes(word)) score += word.length;
      }
      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { section: sectionName, score, sentence: text };
      }
    }
  }
  
  // If no good match found by content, fall back to section keyword matching
  if (!bestMatch || bestMatch.score < 12) {
    const sectionKeywords: Record<string, string[]> = {
      'Problem': ['problem', 'pain', 'customer validation', 'pain point', 'evidence'],
      'Solution': ['solution', 'product', 'api', 'technology', 'differentiation', 'technical'],
      'Market': ['market', 'tam', 'sam', 'som', 'addressable', 'market size'],
      'Competition': ['competition', 'competitor', 'moat', 'defensibility', 'crowded'],
      'Team': ['team', 'founder', 'experience', 'domain expertise', 'execution', 'hire'],
      'Business Model': ['unit economics', 'acv', 'cac', 'ltv', 'pricing', 'revenue model', 'burn', 'margin'],
      'Traction': ['traction', 'customer', 'revenue', 'growth', 'retention', 'churn', 'pmf', 'paying'],
      'Vision': ['vision', 'exit', 'scale', 'roadmap', 'milestone', 'future']
    };
    
    for (const [section, keywords] of Object.entries(sectionKeywords)) {
      if (keywords.some(kw => lower.includes(kw))) {
        const insight = context.sectionInsights[section];
        if (insight?.reasoning) {
          bestMatch = { 
            section, 
            score: 5, 
            sentence: insight.reasoning.split(/(?<=[.!?])\s+/)[0] || insight.reasoning.substring(0, 200)
          };
          break;
        }
      }
    }
  }
  
  if (!bestMatch) return null;
  
  const sectionInsight = context.sectionInsights[bestMatch.section];
  if (!sectionInsight) return null;
  
  // Clean up the matched sentence
  let companyContext = bestMatch.sentence;
  if (!companyContext.endsWith('.') && !companyContext.endsWith('!') && !companyContext.endsWith('?')) {
    companyContext += '.';
  }
  
  // Truncate if too long
  if (companyContext.length > 400) {
    companyContext = companyContext.substring(0, 397) + '...';
  }
  
  // Collect evidence
  const evidence: string[] = [];
  
  if (sectionInsight.assumptions && sectionInsight.assumptions.length > 0) {
    evidence.push(...sectionInsight.assumptions.slice(0, 2));
  }
  
  // Add score context if relevant
  if (sectionInsight.score !== undefined && sectionInsight.benchmark !== undefined) {
    const delta = sectionInsight.score - sectionInsight.benchmark;
    if (Math.abs(delta) >= 5) {
      evidence.push(`${bestMatch.section} score: ${sectionInsight.score}/${sectionInsight.benchmark} benchmark`);
    }
  }
  
  // Add confidence if low
  if (sectionInsight.confidenceScore && sectionInsight.confidenceScore < 50) {
    evidence.push(`Data confidence: ${sectionInsight.confidenceScore}/100`);
  }
  
  return {
    companyContext,
    evidence: evidence.slice(0, 3) // Max 3 evidence points
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
