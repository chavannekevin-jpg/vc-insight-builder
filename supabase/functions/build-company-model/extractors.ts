// =============================================================================
// EXTRACTION & COMPUTATION UTILITIES
// Parse user responses and compute derived values
// =============================================================================

import { CalculationTrace, Discrepancy } from './types.ts';

// -----------------------------------------------------------------------------
// NUMBER EXTRACTION - Parse numbers from free-form text
// -----------------------------------------------------------------------------

/**
 * Extract a number from text, handling various formats:
 * - "$50k MRR", "50,000", "50K", "$50M ARR", "5000 users"
 */
export function extractNumber(text: string | null | undefined): { value: number | null; confidence: number; raw: string | null } {
  if (!text) return { value: null, confidence: 0, raw: null };
  
  const cleanText = text.toString().toLowerCase();
  
  // Match patterns like: $50k, 50K, $50,000, 50000, $5M, $5.5M, 5 million
  const patterns = [
    // $5.5M, $5M, 5M
    /\$?([\d.]+)\s*(?:million|m)\b/i,
    // $500K, 500K, $500k
    /\$?([\d.]+)\s*(?:thousand|k)\b/i,
    // $5.5B, 5B
    /\$?([\d.]+)\s*(?:billion|b)\b/i,
    // $50,000 or 50,000 or $50000
    /\$?([\d,]+(?:\.\d+)?)/,
  ];

  for (const pattern of patterns) {
    const match = cleanText.match(pattern);
    if (match) {
      let value = parseFloat(match[1].replace(/,/g, ''));
      
      // Apply multiplier based on suffix
      if (/million|m\b/i.test(cleanText) && value < 1000) {
        value *= 1_000_000;
      } else if (/thousand|k\b/i.test(cleanText) && value < 10000) {
        value *= 1_000;
      } else if (/billion|b\b/i.test(cleanText) && value < 100) {
        value *= 1_000_000_000;
      }
      
      return { 
        value, 
        confidence: pattern === patterns[patterns.length - 1] ? 0.7 : 0.9,
        raw: match[0]
      };
    }
  }
  
  return { value: null, confidence: 0, raw: null };
}

/**
 * Extract percentage from text: "15%", "15 percent", "0.15 churn"
 */
export function extractPercentage(text: string | null | undefined): { value: number | null; confidence: number } {
  if (!text) return { value: null, confidence: 0 };
  
  const cleanText = text.toString().toLowerCase();
  
  // Match: 15%, 15 percent, 15pct
  const percentMatch = cleanText.match(/([\d.]+)\s*(?:%|percent|pct)/i);
  if (percentMatch) {
    return { value: parseFloat(percentMatch[1]), confidence: 0.9 };
  }
  
  // Match decimal: 0.15 (assume it's a rate)
  const decimalMatch = cleanText.match(/\b0\.([\d]+)\b/);
  if (decimalMatch) {
    return { value: parseFloat('0.' + decimalMatch[1]) * 100, confidence: 0.6 };
  }
  
  return { value: null, confidence: 0 };
}

/**
 * Extract duration in months from text: "18 months", "1.5 years", "2 years"
 */
export function extractMonths(text: string | null | undefined): { value: number | null; confidence: number } {
  if (!text) return { value: null, confidence: 0 };
  
  const cleanText = text.toString().toLowerCase();
  
  // Years
  const yearMatch = cleanText.match(/([\d.]+)\s*years?/i);
  if (yearMatch) {
    return { value: parseFloat(yearMatch[1]) * 12, confidence: 0.9 };
  }
  
  // Months
  const monthMatch = cleanText.match(/([\d.]+)\s*months?/i);
  if (monthMatch) {
    return { value: parseFloat(monthMatch[1]), confidence: 0.9 };
  }
  
  // Weeks
  const weekMatch = cleanText.match(/([\d.]+)\s*weeks?/i);
  if (weekMatch) {
    return { value: parseFloat(weekMatch[1]) / 4, confidence: 0.8 };
  }
  
  return { value: null, confidence: 0 };
}

// -----------------------------------------------------------------------------
// PATTERN EXTRACTION - Identify categories and types from text
// -----------------------------------------------------------------------------

/**
 * Identify business model type from pricing description
 */
export function extractBusinessModelType(text: string | null | undefined): {
  model: 'subscription' | 'transactional' | 'marketplace' | 'freemium' | 'hybrid' | 'other' | null;
  confidence: number;
} {
  if (!text) return { model: null, confidence: 0 };
  
  const cleanText = text.toString().toLowerCase();
  
  const patterns: [RegExp, 'subscription' | 'transactional' | 'marketplace' | 'freemium' | 'hybrid' | 'other'][] = [
    [/subscription|saas|recurring|monthly fee|annual fee|per seat|per user/i, 'subscription'],
    [/transaction|per use|usage-based|pay per|commission per/i, 'transactional'],
    [/marketplace|platform fee|take rate|gmv/i, 'marketplace'],
    [/freemium|free tier|free plan|premium/i, 'freemium'],
    [/hybrid|multiple revenue|combination of/i, 'hybrid'],
  ];
  
  for (const [pattern, model] of patterns) {
    if (pattern.test(cleanText)) {
      return { model, confidence: 0.8 };
    }
  }
  
  return { model: 'other', confidence: 0.5 };
}

/**
 * Identify customer segment from ICP description
 */
export function extractCustomerSegment(text: string | null | undefined): {
  segment: 'consumer' | 'smb' | 'mid-market' | 'enterprise' | 'mixed' | null;
  confidence: number;
} {
  if (!text) return { segment: null, confidence: 0 };
  
  const cleanText = text.toString().toLowerCase();
  
  // Enterprise signals
  if (/enterprise|fortune 500|large corporation|f500|global 2000|multinational/i.test(cleanText)) {
    return { segment: 'enterprise', confidence: 0.9 };
  }
  
  // Mid-market signals
  if (/mid-market|mid market|medium-sized|100-1000 employees|growth stage companies/i.test(cleanText)) {
    return { segment: 'mid-market', confidence: 0.8 };
  }
  
  // SMB signals
  if (/small business|smb|sme|startup|solopreneur|freelancer|small team|1-50 employees/i.test(cleanText)) {
    return { segment: 'smb', confidence: 0.8 };
  }
  
  // Consumer signals
  if (/consumer|b2c|individual|personal|household|family/i.test(cleanText)) {
    return { segment: 'consumer', confidence: 0.9 };
  }
  
  return { segment: null, confidence: 0 };
}

/**
 * Extract sales motion from GTM description
 */
export function extractSalesMotion(text: string | null | undefined): {
  motion: 'self-serve' | 'inside-sales' | 'field-sales' | 'plg' | 'channel' | 'hybrid' | null;
  confidence: number;
} {
  if (!text) return { motion: null, confidence: 0 };
  
  const cleanText = text.toString().toLowerCase();
  
  if (/product.led|plg|viral|self.serve|sign up|try free/i.test(cleanText)) {
    return { motion: 'plg', confidence: 0.85 };
  }
  
  if (/field sales|enterprise sales|face.to.face|on.site|account executive/i.test(cleanText)) {
    return { motion: 'field-sales', confidence: 0.85 };
  }
  
  if (/inside sales|sdr|bdr|outbound|cold call|email outreach/i.test(cleanText)) {
    return { motion: 'inside-sales', confidence: 0.8 };
  }
  
  if (/channel|partner|reseller|distributor|agency/i.test(cleanText)) {
    return { motion: 'channel', confidence: 0.8 };
  }
  
  if (/self.service|self.sign.up|credit card|no sales/i.test(cleanText)) {
    return { motion: 'self-serve', confidence: 0.8 };
  }
  
  return { motion: null, confidence: 0 };
}

/**
 * Determine ACV band from ACV value
 */
export function getACVBand(acv: number | null): 'micro' | 'smb' | 'mid-market' | 'enterprise' | null {
  if (acv === null) return null;
  if (acv < 1000) return 'micro';
  if (acv < 10000) return 'smb';
  if (acv < 100000) return 'mid-market';
  return 'enterprise';
}

// -----------------------------------------------------------------------------
// LIST EXTRACTION - Parse arrays from text
// -----------------------------------------------------------------------------

/**
 * Extract a list of items from text (competitors, team members, etc.)
 */
export function extractList(text: string | null | undefined): string[] {
  if (!text) return [];
  
  // Try to split by common delimiters
  const items = text
    .split(/[,;\n•\-\*]/)
    .map(item => item.trim())
    .filter(item => item.length > 2 && item.length < 100);
  
  return items;
}

/**
 * Extract competitor names from competition description
 */
export function extractCompetitors(text: string | null | undefined): {
  direct: string[];
  indirect: string[];
} {
  if (!text) return { direct: [], indirect: [] };
  
  const cleanText = text.toString();
  
  // Look for explicit sections
  const directMatch = cleanText.match(/direct(?:\s+competitors?)?[:\s]+([\s\S]*?)(?:indirect|$)/i);
  const indirectMatch = cleanText.match(/indirect(?:\s+competitors?)?[:\s]+([\s\S]*?)$/i);
  
  const direct = directMatch ? extractList(directMatch[1]) : [];
  const indirect = indirectMatch ? extractList(indirectMatch[1]) : [];
  
  // If no explicit sections, try to extract all as direct
  if (direct.length === 0 && indirect.length === 0) {
    return { direct: extractList(text), indirect: [] };
  }
  
  return { direct, indirect };
}

// -----------------------------------------------------------------------------
// TEAM EXTRACTION - Parse team information
// -----------------------------------------------------------------------------

export interface ExtractedFounder {
  name: string | null;
  role: string | null;
  background: string | null;
  equityPercent: number | null;
}

/**
 * Extract founder information from team description
 */
export function extractFounders(text: string | null | undefined): ExtractedFounder[] {
  if (!text) return [];
  
  const founders: ExtractedFounder[] = [];
  
  // Look for patterns like "John (CEO, 40%)" or "Jane Smith - CTO, 30% equity"
  const founderPatterns = [
    /([A-Z][a-z]+ [A-Z][a-z]+)[,\s\-:]+(?:the\s+)?([A-Z]{2,3}|founder|co-founder)[,\s]+(\d+)%/gi,
    /([A-Z]{2,3})[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)[,\s]+(\d+)%/gi,
  ];
  
  for (const pattern of founderPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      founders.push({
        name: match[1] || match[2],
        role: match[2] || match[1],
        background: null,
        equityPercent: parseInt(match[3])
      });
    }
  }
  
  // If no structured data found, at least count founders
  if (founders.length === 0) {
    const founderCount = (text.match(/founder|co-founder/gi) || []).length;
    if (founderCount > 0) {
      for (let i = 0; i < Math.min(founderCount, 3); i++) {
        founders.push({ name: null, role: null, background: null, equityPercent: null });
      }
    }
  }
  
  return founders;
}

// -----------------------------------------------------------------------------
// CALCULATION UTILITIES
// -----------------------------------------------------------------------------

export function createTrace(
  sourceField: string,
  rawValue: string | null,
  extractedValue: number | string | null,
  method: CalculationTrace['method'],
  confidence: number,
  computedValue?: number | string | null,
  notes?: string
): CalculationTrace {
  return {
    sourceField,
    rawValue,
    extractedValue,
    computedValue,
    method,
    confidence,
    notes
  };
}

export function createDiscrepancy(
  field: string,
  statedValue: string | number | null,
  computedValue: string | number | null,
  discrepancyType: Discrepancy['discrepancyType'],
  severity: Discrepancy['severity'],
  explanation: string,
  relatedFields: string[] = [],
  questionsToResolve?: string[]
): Discrepancy {
  return {
    field,
    statedValue,
    computedValue,
    discrepancyType,
    severity,
    explanation,
    relatedFields,
    questionsToResolve
  };
}

/**
 * Check if two values are significantly different (>20% variance)
 */
export function hasSignificantVariance(value1: number | null, value2: number | null, threshold = 0.2): boolean {
  if (value1 === null || value2 === null || value1 === 0 || value2 === 0) return false;
  const variance = Math.abs(value1 - value2) / Math.max(value1, value2);
  return variance > threshold;
}
