/**
 * Utility functions for safely handling tool data in memo components
 * Prevents React Error #310 (Objects are not valid as React children)
 */

// Safely convert any value to a string for rendering
export const safeText = (val: unknown): string => {
  if (typeof val === 'string') return val;
  if (val === null || val === undefined) return '';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    // Handle objects with 'text' property (AI sometimes returns { text: "..." })
    if ('text' in val && typeof (val as { text: unknown }).text === 'string') {
      return (val as { text: string }).text;
    }
    console.warn('safeText received object instead of string:', val);
    return '';
  }
  // Fallback for any other type
  try {
    return String(val);
  } catch {
    return '';
  }
};

// Safely get an array, returning empty array if invalid
export const safeArray = <T>(arr: unknown): T[] => {
  if (Array.isArray(arr)) return arr as T[];
  if (arr === null || arr === undefined) return [];
  console.warn('safeArray received non-array:', arr);
  return [];
};

// Safely get a number, with default fallback
// Handles currency strings like "€25,000", "€250M", "$1.5B", "10,000 companies", "Unknown"
export const safeNumber = (val: unknown, defaultVal: number = 0): number => {
  if (typeof val === 'number' && !isNaN(val)) return val;
  if (typeof val === 'string') {
    // Return default for "Unknown" or empty-like values
    const lowerVal = val.toLowerCase().trim();
    if (!lowerVal || lowerVal === 'unknown' || lowerVal.includes('not ') || lowerVal.includes('n/a')) {
      return defaultVal;
    }
    
    // Strip currency symbols and extract numeric part
    let cleanedVal = val
      .replace(/[€$£¥₹kr]/gi, '') // Remove currency symbols
      .replace(/,/g, '')          // Remove comma separators
      .replace(/\s+/g, '')        // Remove spaces
      .trim();
    
    // Handle multiplier suffixes (K, M, B)
    let multiplier = 1;
    if (/k$/i.test(cleanedVal)) {
      multiplier = 1000;
      cleanedVal = cleanedVal.slice(0, -1);
    } else if (/m$/i.test(cleanedVal)) {
      multiplier = 1000000;
      cleanedVal = cleanedVal.slice(0, -1);
    } else if (/b$/i.test(cleanedVal)) {
      multiplier = 1000000000;
      cleanedVal = cleanedVal.slice(0, -1);
    }
    
    const parsed = parseFloat(cleanedVal);
    if (!isNaN(parsed)) return parsed * multiplier;
  }
  return defaultVal;
};

// Check if data structure is valid for EditableTool
export const isValidEditableTool = <T>(data: unknown): data is { aiGenerated: T; userOverrides?: Partial<T>; dataSource?: string } => {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  
  // Check for aiGenerated wrapper
  if ('aiGenerated' in d && d.aiGenerated !== null && typeof d.aiGenerated === 'object') {
    return true;
  }
  
  return false;
};

// Unwrap potentially double-wrapped data
export const unwrapToolData = <T>(data: unknown): T | null => {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  
  // Check for double-wrapping: { aiGenerated: { aiGenerated: {...} } }
  if ('aiGenerated' in d && d.aiGenerated && typeof d.aiGenerated === 'object') {
    const inner = d.aiGenerated as Record<string, unknown>;
    if ('aiGenerated' in inner && inner.aiGenerated && typeof inner.aiGenerated === 'object') {
      // Double-wrapped - return the inner aiGenerated
      return inner.aiGenerated as T;
    }
    // Single wrapped - return the aiGenerated content
    return d.aiGenerated as T;
  }
  
  // Not wrapped - return as-is
  return data as T;
};

// Safely merge EditableTool data
export const mergeToolData = <T>(
  aiGenerated: T | undefined | null,
  userOverrides: Partial<T> | undefined | null
): T => {
  const base = (aiGenerated || {}) as T;
  const overrides = (userOverrides || {}) as Partial<T>;
  return { ...base, ...overrides };
};

// Validate that a SectionScore is properly structured
export const isValidSectionScore = (score: unknown): boolean => {
  if (!score || typeof score !== 'object') return false;
  const s = score as Record<string, unknown>;
  return typeof s.score === 'number' && typeof s.label === 'string';
};

// Validate that benchmarks array is properly structured
export const isValidBenchmarksArray = (benchmarks: unknown): boolean => {
  if (!Array.isArray(benchmarks)) return false;
  return benchmarks.length === 0 || benchmarks.every(b => 
    b && typeof b === 'object' && 'metric' in b
  );
};

// Validate Section90DayPlan structure
export const isValidActionPlan = (plan: unknown): boolean => {
  if (!plan || typeof plan !== 'object') return false;
  const p = plan as Record<string, unknown>;
  return Array.isArray(p.actions);
};

// Validate LeadInvestorRequirements structure
export const isValidLeadInvestorRequirements = (req: unknown): boolean => {
  if (!req || typeof req !== 'object') return false;
  const r = req as Record<string, unknown>;
  return Array.isArray(r.requirements) && Array.isArray(r.dealbreakers) && Array.isArray(r.wouldWantToSee);
};

// ============================================
// CONDITIONAL ASSESSMENT UTILITIES (Week 4)
// ============================================

import type { ConditionalAssessment, ConfidenceLevel } from '@/types/memo';

// Create a default conditional assessment
export const createDefaultAssessment = (
  confidenceScore: number = 50,
  dataCompleteness: number = 50
): ConditionalAssessment => ({
  confidence: getConfidenceLevel(confidenceScore),
  confidenceScore,
  dataCompleteness,
  whatWouldChangeThisAssessment: [],
  assumptions: [],
  caveats: [],
});

// Get confidence level from score
export const getConfidenceLevel = (score: number): ConfidenceLevel => {
  if (score >= 80) return 'high';
  if (score >= 50) return 'medium';
  if (score >= 20) return 'low';
  return 'insufficient_data';
};

// Validate ConditionalAssessment structure
export const isValidAssessment = (assessment: unknown): assessment is ConditionalAssessment => {
  if (!assessment || typeof assessment !== 'object') return false;
  const a = assessment as Record<string, unknown>;
  return (
    typeof a.confidence === 'string' &&
    typeof a.confidenceScore === 'number' &&
    typeof a.dataCompleteness === 'number' &&
    Array.isArray(a.whatWouldChangeThisAssessment) &&
    Array.isArray(a.assumptions)
  );
};

// Get assessment color based on confidence
export const getAssessmentColor = (confidence: ConfidenceLevel): string => {
  switch (confidence) {
    case 'high': return 'text-emerald-400';
    case 'medium': return 'text-amber-400';
    case 'low': return 'text-orange-400';
    case 'insufficient_data': return 'text-red-400';
  }
};

// Get assessment background color
export const getAssessmentBgColor = (confidence: ConfidenceLevel): string => {
  switch (confidence) {
    case 'high': return 'bg-emerald-950/80 border-emerald-500/30';
    case 'medium': return 'bg-amber-950/80 border-amber-500/30';
    case 'low': return 'bg-orange-950/80 border-orange-500/30';
    case 'insufficient_data': return 'bg-red-950/80 border-red-500/30';
  }
};

// Format confidence label for display
export const getConfidenceLabel = (confidence: ConfidenceLevel): string => {
  switch (confidence) {
    case 'high': return 'High Confidence';
    case 'medium': return 'Medium Confidence';
    case 'low': return 'Low Confidence';
    case 'insufficient_data': return 'Insufficient Data';
  }
};
