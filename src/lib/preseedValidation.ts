/**
 * Pre-Seed Validation Utilities
 * 
 * Shared logic for analyzing and scoring pre-seed startup validation signals.
 * Focus: problem discovery, customer validation, founder-market fit.
 */

import { safeLower } from "@/lib/stringUtils";

// ============= Pain Analysis (Problem Section) =============

export interface PainScore {
  score: number;
  label: string;
  evidence: string;
}

export interface PainAnalysis {
  urgency: PainScore;
  frequency: PainScore;
  willingness: PainScore;
  alternatives: PainScore;
  overallScore: number;
}

/**
 * Analyze problem text for pain intensity signals.
 * Returns scores across 4 dimensions: urgency, frequency, willingness to pay, poor alternatives.
 */
export function analyzePainPoints(text: string): PainAnalysis {
  const textLower = safeLower(text, "preseedValidation.analyzePainPoints");
  
  // Urgency indicators
  const urgencyKeywords = ['critical', 'urgent', 'immediate', 'now', 'can\'t wait', 'emergency', 'crisis', 'broken', 'failing', 'losing', 'desperate', 'must have', 'essential'];
  const urgencyCount = urgencyKeywords.filter(k => textLower.includes(k)).length;
  const urgencyScore = Math.min(10, urgencyCount * 2 + 3);
  
  // Frequency indicators
  const frequencyKeywords = ['daily', 'every day', 'constantly', 'always', 'recurring', 'frequent', 'regular', 'ongoing', 'continuous', 'hourly', 'weekly', 'multiple times'];
  const frequencyCount = frequencyKeywords.filter(k => textLower.includes(k)).length;
  const frequencyScore = Math.min(10, frequencyCount * 2 + 3);
  
  // Willingness to pay indicators
  const payKeywords = ['budget', 'spend', 'invest', 'pay', 'cost', 'expensive', 'money', 'revenue', 'savings', 'roi', '$', 'price', 'willing to pay'];
  const payCount = payKeywords.filter(k => textLower.includes(k)).length;
  const payScore = Math.min(10, payCount * 2 + 3);
  
  // Poor alternatives indicators
  const altKeywords = ['manual', 'spreadsheet', 'excel', 'no solution', 'workaround', 'legacy', 'outdated', 'inefficient', 'broken process', 'hack', 'cobbled together', 'duct tape'];
  const altCount = altKeywords.filter(k => textLower.includes(k)).length;
  const altScore = Math.min(10, altCount * 2 + 3);
  
  const overallScore = Math.round((urgencyScore + frequencyScore + payScore + altScore) / 4 * 10);
  
  return {
    urgency: {
      score: urgencyScore,
      label: urgencyScore >= 7 ? 'High' : urgencyScore >= 4 ? 'Medium' : 'Low',
      evidence: urgencyCount > 0 ? `Found ${urgencyCount} urgency signals` : 'Limited urgency signals detected'
    },
    frequency: {
      score: frequencyScore,
      label: frequencyScore >= 7 ? 'High' : frequencyScore >= 4 ? 'Medium' : 'Low',
      evidence: frequencyCount > 0 ? `Found ${frequencyCount} frequency indicators` : 'Problem frequency unclear'
    },
    willingness: {
      score: payScore,
      label: payScore >= 7 ? 'Strong' : payScore >= 4 ? 'Moderate' : 'Weak',
      evidence: payCount > 0 ? `Found ${payCount} budget/ROI references` : 'Willingness to pay not demonstrated'
    },
    alternatives: {
      score: altScore,
      label: altScore >= 7 ? 'Poor' : altScore >= 4 ? 'Mediocre' : 'Good',
      evidence: altCount > 0 ? `Found ${altCount} workaround indicators` : 'Current alternatives unclear'
    },
    overallScore
  };
}

/**
 * Get heat level label and styling based on overall pain score
 */
export function getHeatLevel(score: number): { 
  label: string; 
  color: string; 
  bgColor: string; 
  icon: string;
  description: string;
} {
  if (score >= 80) return { 
    label: 'HAIR ON FIRE', 
    color: 'text-red-500', 
    bgColor: 'from-red-500/20 to-orange-500/10', 
    icon: '🔥🔥🔥',
    description: 'Customers are desperate for a solution'
  };
  if (score >= 60) return { 
    label: 'BURNING', 
    color: 'text-orange-500', 
    bgColor: 'from-orange-500/20 to-yellow-500/10', 
    icon: '🔥🔥',
    description: 'Strong pain signal - customers actively seeking solutions'
  };
  if (score >= 40) return { 
    label: 'WARM', 
    color: 'text-yellow-500', 
    bgColor: 'from-yellow-500/20 to-amber-500/10', 
    icon: '🔥',
    description: 'Pain exists but may not drive urgent action'
  };
  return { 
    label: 'LUKEWARM', 
    color: 'text-blue-400', 
    bgColor: 'from-blue-500/10 to-cyan-500/5', 
    icon: '❄️',
    description: 'Weak pain signal - customers might tolerate status quo'
  };
}

/**
 * Get improvement suggestions based on pain analysis gaps
 */
export function getPainSuggestions(analysis: PainAnalysis): string[] {
  const suggestions: string[] = [];
  
  if (analysis.urgency.score < 6) {
    suggestions.push("Add specific examples of costs/consequences of not solving this problem now");
  }
  if (analysis.frequency.score < 6) {
    suggestions.push("Clarify how often users encounter this pain point (daily? weekly?)");
  }
  if (analysis.willingness.score < 6) {
    suggestions.push("Include evidence of existing budget spend on alternatives or ROI expectations");
  }
  if (analysis.alternatives.score < 6) {
    suggestions.push("Describe current workarounds and why they're inadequate");
  }
  
  return suggestions.slice(0, 3);
}

// ============= Evidence Checklist =============

export interface EvidenceItem {
  key: string;
  label: string;
  detected: boolean;
  hint: string;
}

export interface EvidenceChecklistResult {
  items: EvidenceItem[];
  score: number;
  grade: string;
}

/**
 * Pre-seed evidence items for each workshop section
 */
export const PRESEED_EVIDENCE_ITEMS: Record<string, Array<{ key: string; label: string; keywords: string[]; hint: string }>> = {
  problem: [
    { key: 'interviews', label: 'Customer interviews cited', keywords: ['interviewed', 'spoke to', 'talked to', 'conversations', 'customers told us', 'discovery calls'], hint: 'Mention how many potential customers you spoke to' },
    { key: 'pain_quantified', label: 'Pain quantified', keywords: ['$', 'hours', 'cost', 'lose', 'waste', '%', 'million', 'thousand'], hint: 'Add specific numbers showing the cost of this problem' },
    { key: 'frequency', label: 'Frequency described', keywords: ['daily', 'weekly', 'every', 'constantly', 'recurring', 'each time'], hint: 'Describe how often this problem occurs' },
    { key: 'workarounds', label: 'Current workarounds documented', keywords: ['currently', 'today', 'existing', 'workaround', 'manual', 'spreadsheet', 'use'], hint: 'Explain what solutions people use today' },
  ],
  solution: [
    { key: 'prototype', label: 'Prototype/MVP exists', keywords: ['prototype', 'mvp', 'built', 'demo', 'beta', 'pilot', 'working'], hint: 'Mention if you have a prototype or MVP' },
    { key: 'unique_approach', label: 'Unique approach explained', keywords: ['unlike', 'different', 'unique', 'our approach', 'we do', 'instead of', 'first to'], hint: 'Explain what makes your approach different' },
    { key: 'customer_reaction', label: 'Customer reaction cited', keywords: ['customers said', 'feedback', 'loved', 'response', 'they told us', 'reaction'], hint: 'Share how customers reacted when they saw your solution' },
  ],
  market: [
    { key: 'target_segment', label: 'Target segment defined', keywords: ['focus on', 'target', 'segment', 'specifically', 'niche', 'ideal customer'], hint: 'Define your specific target customer segment' },
    { key: 'beachhead', label: 'Beachhead market identified', keywords: ['start with', 'first', 'initial', 'beachhead', 'entry point', 'land'], hint: 'Identify where you will start (your beachhead)' },
    { key: 'why_now', label: 'Why-now timing explained', keywords: ['now', 'timing', 'recent', 'changed', 'trend', 'shift', 'emerging'], hint: 'Explain why this is the right time for your solution' },
  ],
  business_model: [
    { key: 'revenue_model', label: 'Revenue model outlined', keywords: ['charge', 'subscription', 'saas', 'fee', 'revenue', 'monetize', 'pay'], hint: 'Describe how you will make money' },
    { key: 'pricing', label: 'Pricing hypothesis stated', keywords: ['$', 'price', 'cost', 'per month', 'per user', 'plan', 'tier'], hint: 'Share your pricing hypothesis' },
  ],
  gtm: [
    { key: 'first_customers', label: 'First customers identified', keywords: ['first', 'customers', 'pipeline', 'leads', 'signed', 'loi', 'waiting'], hint: 'Describe who your first customers are or will be' },
    { key: 'acquisition', label: 'Acquisition channel defined', keywords: ['acquire', 'reach', 'channel', 'find', 'marketing', 'sales', 'content', 'referral'], hint: 'Explain how you will reach your customers' },
  ],
  team: [
    { key: 'founder_market_fit', label: 'Founder-market fit explained', keywords: ['worked in', 'experience', 'background', 'insight', 'learned', 'saw firsthand', 'personal'], hint: 'Explain your unique insight or experience with this problem' },
    { key: 'relevant_experience', label: 'Relevant experience cited', keywords: ['years', 'previously', 'founded', 'led', 'built', 'shipped', 'expertise'], hint: 'Cite relevant past experience' },
    { key: 'gaps_acknowledged', label: 'Missing skills acknowledged', keywords: ['need', 'looking for', 'gap', 'hiring', 'missing', 'advisor', 'help with'], hint: 'Acknowledge what skills you need to add' },
  ],
  funding_strategy: [
    { key: 'use_of_funds', label: 'Use of funds specified', keywords: ['use', 'invest', 'spend', 'allocate', 'hire', 'build', 'develop'], hint: 'Specify how you will use the funding' },
    { key: 'milestones', label: '18-month milestones defined', keywords: ['milestone', 'goal', 'target', 'achieve', 'month', 'quarter', 'by'], hint: 'Define key milestones for the next 18 months' },
    { key: 'path_to_seed', label: 'Path to seed metrics outlined', keywords: ['seed', 'next round', 'series', 'metrics', 'raise', 'traction'], hint: 'Outline what metrics you need for next round' },
  ],
};

/**
 * Analyze text for evidence of pre-seed validation items
 */
export function analyzeEvidence(text: string, sectionKey: string): EvidenceChecklistResult {
  const textLower = safeLower(text, "preseedValidation.analyzeEvidence");
  const items = PRESEED_EVIDENCE_ITEMS[sectionKey] || [];
  
  const checkedItems: EvidenceItem[] = items.map(item => {
    const detected = item.keywords.some(keyword => textLower.includes(keyword.toLowerCase()));
    return {
      key: item.key,
      label: item.label,
      detected,
      hint: item.hint,
    };
  });
  
  const detectedCount = checkedItems.filter(i => i.detected).length;
  const totalCount = checkedItems.length;
  const score = totalCount > 0 ? Math.round((detectedCount / totalCount) * 100) : 0;
  
  let grade = 'D';
  if (score >= 80) grade = 'A';
  else if (score >= 60) grade = 'B';
  else if (score >= 40) grade = 'C';
  
  return {
    items: checkedItems,
    score,
    grade,
  };
}

// ============= Validation Report Types =============

export interface ValidationGrade {
  overall: string;
  label: string;
  description: string;
}

export interface ValidationDimension {
  name: string;
  score: number;
  label: string;
  feedback: string;
}

export interface ValidationReport {
  grade: ValidationGrade;
  dimensions: ValidationDimension[];
  strengths: string[];
  gaps: string[];
  nextSteps: string[];
  generatedAt: string;
}

/**
 * Calculate validation grade from overall score
 */
export function getValidationGrade(score: number): ValidationGrade {
  if (score >= 80) return { 
    overall: 'A', 
    label: 'Strong Discovery', 
    description: 'Deep customer interviews, clear pain, validated hypothesis'
  };
  if (score >= 60) return { 
    overall: 'B', 
    label: 'Good Progress', 
    description: 'Some validation, clear problem, needs more evidence'
  };
  if (score >= 40) return { 
    overall: 'C', 
    label: 'Early Discovery', 
    description: 'Problem identified, limited validation'
  };
  return { 
    overall: 'D', 
    label: 'Hypothesis Only', 
    description: 'No evidence of customer conversations'
  };
}
