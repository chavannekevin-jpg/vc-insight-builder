// =============================================================================
// EXTRACTION & COMPUTATION UTILITIES
// Parse user responses and compute derived values with intelligent classification
// =============================================================================

import { 
  CalculationTrace, 
  Discrepancy,
  ClassifiedMetric,
  FinancialMetricSet,
  MetricClassification,
  MetricTemporality,
  MetricDiscrepancy
} from './types.ts';

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

// =============================================================================
// INTELLIGENT METRIC CLASSIFICATION - Temporal and contextual extraction
// =============================================================================

/**
 * Temporal signal patterns for detecting when a metric applies
 */
const TEMPORAL_PATTERNS = {
  current: [
    /(?:currently|now|as of|today|at present|presently)/i,
    /(?:in\s+)?(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+202[4-9]/i,
    /(?:this\s+)?(?:month|year|quarter)/i,
  ],
  historical: [
    /(?:was|were|had|grew\s+from|increased\s+from|started\s+at)/i,
    /(?:in\s+)?(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+202[0-3]/i,
    /(?:last\s+)?(?:month|year|quarter)/i,
    /(\d+)\s+months?\s+ago/i,
  ],
  projected: [
    /(?:targeting|projecting|aiming\s+for|expecting|goal\s+of|plan\s+to|will\s+reach|forecast)/i,
    /(?:by\s+)?(?:end\s+of\s+)?(?:next\s+)?(?:year|quarter|month)/i,
    /(?:in\s+)?(?:12|24)\s+months?/i,
  ],
  minimum: [
    /(?:minimum|at\s+least|starting\s+at|floor|base\s+price|from\s+€?\$?\d)/i,
    /(?:minimum\s+annual\s+(?:consumption|commitment|contract))/i,
    /(?:enterprise\s+minimum)/i,
  ],
  target: [
    /(?:can\s+reach|potential|at\s+scale|vision|aspiration|ultimate)/i,
    /(?:large\s+platforms?|enterprise\s+clients?|ideal\s+customer)/i,
  ],
};

/**
 * Extract a date reference from text (e.g., "March 2025")
 */
export function extractDateReference(text: string): string | undefined {
  const monthYearMatch = text.match(/(?:in\s+)?(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/i);
  if (monthYearMatch) return monthYearMatch[0].replace(/^in\s+/i, '');
  
  const quarterMatch = text.match(/Q[1-4]\s+\d{4}/i);
  if (quarterMatch) return quarterMatch[0];
  
  return undefined;
}

/**
 * Detect the temporality of a value based on surrounding text
 */
export function detectTemporality(text: string): MetricTemporality {
  for (const pattern of TEMPORAL_PATTERNS.historical) {
    if (pattern.test(text)) return 'historical';
  }
  for (const pattern of TEMPORAL_PATTERNS.projected) {
    if (pattern.test(text)) return 'future_12m'; // Default to 12m for projected
  }
  for (const pattern of TEMPORAL_PATTERNS.current) {
    if (pattern.test(text)) return 'current';
  }
  return 'unspecified';
}

/**
 * Detect the classification of a metric based on context
 */
export function detectClassification(text: string): MetricClassification {
  for (const pattern of TEMPORAL_PATTERNS.minimum) {
    if (pattern.test(text)) return 'minimum';
  }
  for (const pattern of TEMPORAL_PATTERNS.target) {
    if (pattern.test(text)) return 'target';
  }
  for (const pattern of TEMPORAL_PATTERNS.projected) {
    if (pattern.test(text)) return 'projected';
  }
  for (const pattern of TEMPORAL_PATTERNS.historical) {
    if (pattern.test(text)) return 'actual'; // Historical is still "actual" at that time
  }
  // Default to actual if explicitly stated
  return 'actual';
}

/**
 * Extract MRR with growth pattern: "MRR grew from €22k in March 2024 to €45k in March 2025"
 */
export function extractMRRGrowth(text: string, currency: ClassifiedMetric['currency'] = 'EUR'): {
  historical?: ClassifiedMetric;
  current?: ClassifiedMetric;
  growthRate?: number;
} | null {
  // Pattern: "MRR grew from €22k in March 2024 to €45k in March 2025"
  const growthMatch = text.match(
    /mrr\s+(?:grew|increased|went)\s+from\s+[€$£]?([\d,.]+)\s*k?\s*(?:in\s+)?((?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4})\s+to\s+[€$£]?([\d,.]+)\s*k?\s*(?:in\s+)?((?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4})/i
  );
  
  if (growthMatch) {
    const historicalValue = parseNumericValueWithSuffix(growthMatch[1], text);
    const historicalDate = growthMatch[2];
    const currentValue = parseNumericValueWithSuffix(growthMatch[3], text);
    const currentDate = growthMatch[4];
    
    const growthRate = historicalValue > 0 
      ? Math.round(((currentValue - historicalValue) / historicalValue) * 100)
      : undefined;
    
    return {
      historical: {
        value: historicalValue,
        currency,
        classification: 'actual',
        temporality: 'historical',
        asOfDate: historicalDate,
        confidence: 'extracted',
        sourceText: growthMatch[0],
      },
      current: {
        value: currentValue,
        currency,
        classification: 'actual',
        temporality: 'current',
        asOfDate: currentDate,
        confidence: 'extracted',
        sourceText: growthMatch[0],
      },
      growthRate,
    };
  }
  
  return null;
}

/**
 * Extract customer count with classification
 */
export function extractCustomerCount(text: string, currency: ClassifiedMetric['currency'] = 'EUR'): ClassifiedMetric | null {
  // Pattern: "120+ customers" or "over 120 customers" or "5 enterprise clients"
  const patterns = [
    /(\d+)\+?\s*(?:paying\s*)?(?:customer|client|account|enterprise\s*client|icp)s?/i,
    /(?:over|more\s+than|approximately|around)\s*(\d+)\s*(?:paying\s*)?(?:customer|client|account)s?/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseInt(match[1]);
      return {
        value,
        currency,
        classification: 'actual',
        temporality: detectTemporality(text),
        asOfDate: extractDateReference(text),
        confidence: 'extracted',
        sourceText: match[0],
      };
    }
  }
  
  return null;
}

/**
 * Extract minimum annual commitment (e.g., "minimum annual consumption of €10,000")
 */
export function extractMinimumPricing(text: string, currency: ClassifiedMetric['currency'] = 'EUR'): ClassifiedMetric | null {
  const patterns = [
    /minimum\s*(?:annual\s*)?(?:consumption|commitment|contract)(?:\s*of)?\s*[€$£]?([\d,.]+)\s*k?/i,
    /(?:enterprise\s*)?minimum[:\s]*[€$£]?([\d,.]+)\s*k?\s*(?:\/year|annual|per\s*year)/i,
    /starting\s*at\s*[€$£]?([\d,.]+)\s*k?\s*(?:\/year|annual|per\s*year)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseNumericValueWithSuffix(match[1], match[0]);
      return {
        value,
        currency,
        classification: 'minimum',
        temporality: 'current',
        confidence: 'extracted',
        sourceText: match[0],
      };
    }
  }
  
  return null;
}

/**
 * Extract ARR with temporal awareness
 */
export function extractARRWithClassification(text: string, currency: ClassifiedMetric['currency'] = 'EUR'): ClassifiedMetric | null {
  // Pattern: "€540k ARR" or "€126k CARR" or "ARR of €X"
  const patterns = [
    /[€$£]([\d,.]+)\s*k?\s*(?:in\s*)?(carr|arr|annual\s*(?:recurring\s*)?revenue)/i,
    /(?:carr|arr|annual\s*recurring\s*revenue)[:\s]*[€$£]?([\d,.]+)\s*k?/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      // Find the numeric capture group (could be 1 or 2 depending on pattern)
      const numericStr = match[1].match(/[\d,.]+/) ? match[1] : match[2];
      const value = parseNumericValueWithSuffix(numericStr, match[0]);
      
      return {
        value,
        currency,
        classification: detectClassification(text),
        temporality: detectTemporality(text),
        asOfDate: extractDateReference(text),
        confidence: 'extracted',
        sourceText: match[0],
      };
    }
  }
  
  return null;
}

/**
 * Build a complete FinancialMetricSet from text responses
 */
export function buildFinancialMetricSet(
  responses: Record<string, string>,
  currency: ClassifiedMetric['currency'] = 'EUR'
): { metricSet: FinancialMetricSet; discrepancies: MetricDiscrepancy[] } {
  const metricSet: FinancialMetricSet = {
    arr: {},
    mrr: {},
    acv: {},
    customers: {},
    revenue: {},
    growth: {},
  };
  const discrepancies: MetricDiscrepancy[] = [];
  
  // Combine relevant response fields
  const tractionText = responses['traction'] || '';
  const businessModelText = responses['business_model'] || '';
  const pricingText = responses['pricing'] || '';
  const combinedText = `${tractionText} ${businessModelText} ${pricingText}`;
  
  // 1. Extract MRR with growth pattern
  const mrrGrowth = extractMRRGrowth(combinedText, currency);
  if (mrrGrowth) {
    if (mrrGrowth.historical) {
      metricSet.mrr.historical = [mrrGrowth.historical];
    }
    if (mrrGrowth.current) {
      metricSet.mrr.actual = mrrGrowth.current;
    }
    if (mrrGrowth.growthRate !== undefined) {
      metricSet.growth.yearlyRate = {
        value: mrrGrowth.growthRate,
        currency,
        classification: 'calculated',
        temporality: 'current',
        confidence: 'extracted',
        calculationMethod: 'YoY MRR growth',
      };
    }
  }
  
  // 2. Extract ARR
  const arr = extractARRWithClassification(combinedText, currency);
  if (arr) {
    metricSet.arr.actual = arr;
  } else if (metricSet.mrr.actual) {
    // Calculate ARR from MRR
    metricSet.arr.actual = {
      value: metricSet.mrr.actual.value * 12,
      currency,
      classification: 'calculated',
      temporality: 'current',
      confidence: 'inferred',
      calculationMethod: 'MRR × 12',
      sourceText: metricSet.mrr.actual.sourceText,
    };
  }
  
  // 3. Extract customer count
  const customers = extractCustomerCount(combinedText, currency);
  if (customers) {
    metricSet.customers.actual = customers;
  }
  
  // 4. Extract minimum pricing
  const minimumPricing = extractMinimumPricing(combinedText, currency);
  if (minimumPricing) {
    metricSet.acv.minimum = minimumPricing;
  }
  
  // 5. Calculate actual ACV from ARR ÷ Customers
  if (metricSet.arr.actual && metricSet.customers.actual && metricSet.customers.actual.value > 0) {
    const calculatedACV = Math.round(metricSet.arr.actual.value / metricSet.customers.actual.value);
    metricSet.acv.actual = {
      value: calculatedACV,
      currency,
      classification: 'calculated',
      temporality: 'current',
      confidence: 'inferred',
      calculationMethod: `ARR (${formatValue(metricSet.arr.actual.value, currency)}) ÷ Customers (${metricSet.customers.actual.value})`,
    };
    
    // 6. Check for discrepancy between actual ACV and minimum
    if (metricSet.acv.minimum && calculatedACV < metricSet.acv.minimum.value) {
      discrepancies.push({
        metricType: 'acv',
        classification1: 'actual',
        value1: calculatedACV,
        classification2: 'minimum',
        value2: metricSet.acv.minimum.value,
        severity: 'warning',
        explanation: `Your actual average ACV (${formatValue(calculatedACV, currency)}) is below your stated minimum (${formatValue(metricSet.acv.minimum.value, currency)}). This suggests either: (1) many customers are below the minimum tier, (2) the minimum isn't being enforced, or (3) heavy discounting is occurring.`,
        recommendation: 'Review your customer mix - if SMB customers are pulling down the average, consider whether to focus on enterprise or adjust pricing strategy.',
      });
    }
  }
  
  // 7. Add $100M target for scale test context
  metricSet.arr.target = {
    value: 100000000,
    currency: 'USD',
    classification: 'target',
    temporality: 'at_exit',
    confidence: 'verified',
    sourceText: 'VC scale benchmark',
  };
  
  return { metricSet, discrepancies };
}

/**
 * Select the appropriate metric for a given context
 */
export function selectMetricForContext(
  metricSet: FinancialMetricSet,
  context: 'traction_analysis' | 'unit_economics' | 'scale_test' | 'valuation' | 'benchmark_comparison'
): ClassifiedMetric | null {
  switch (context) {
    case 'traction_analysis':
      // Always use ACTUAL metrics for traction
      return metricSet.arr.actual || metricSet.mrr.actual || null;
      
    case 'unit_economics':
      // Use actual ACV for unit economics
      return metricSet.acv.actual || null;
      
    case 'scale_test':
      // Use actual ACV for realistic path to $100M (NOT assumed or minimum)
      return metricSet.acv.actual || null;
      
    case 'valuation':
      // Use actual ARR with growth rate
      return metricSet.arr.actual || null;
      
    case 'benchmark_comparison':
      // Can use either actual or benchmark
      return metricSet.acv.actual || metricSet.acv.benchmark || null;
      
    default:
      return metricSet.acv.actual || null;
  }
}

/**
 * Helper to parse numeric values with k/m suffixes
 */
function parseNumericValueWithSuffix(str: string, fullMatch: string): number {
  const clean = str.replace(/,/g, '').toLowerCase();
  const num = parseFloat(clean);
  
  // Check if 'k' or 'm' appears near the number in the full match
  const fullLower = fullMatch.toLowerCase();
  if (fullLower.includes('m') && !fullLower.includes('mrr') && num < 1000) {
    return num * 1000000;
  }
  if (fullLower.match(/\dk/) || (num < 1000 && fullLower.includes('k') && !fullLower.includes('€k'))) {
    return num * 1000;
  }
  // If it looks like a bare number under 1000, assume it's in thousands
  if (num < 1000 && fullLower.match(/[€$£][\d,.]+\s*k/)) {
    return num * 1000;
  }
  
  return num;
}

/**
 * Format a value for display
 */
function formatValue(value: number, currency: string): string {
  const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || '€';
  if (value >= 1000000) return `${symbol}${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${symbol}${Math.round(value / 1000)}k`;
  return `${symbol}${value.toLocaleString()}`;
}
