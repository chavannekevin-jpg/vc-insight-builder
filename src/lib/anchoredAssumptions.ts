/**
 * Anchored Assumptions Extractor
 * 
 * Creates a single source of truth for key financial assumptions like ACV/ARPU,
 * extracted from company model, memo responses, or AI estimation.
 * This prevents inconsistencies where different components extract different values.
 * 
 * NEW: Includes intelligent metric classification that distinguishes between:
 * - actual: Current, verified values from real data
 * - calculated: Derived from formulas (e.g., ARR ÷ customers = ACV)
 * - projected: Future targets mentioned in plans
 * - minimum: Stated floor/minimum values
 * - assumed: Values used for modeling when real data is missing
 */

import type { Currency } from './memoDataExtractor';
import { 
  detectBusinessModelType, 
  getMetricFramework, 
  calculateScaleRequirements,
  type BusinessModelType,
  type MetricFramework 
} from './businessModelFramework';

// =============================================================================
// CLASSIFIED METRIC TYPES (mirror of backend types for frontend use)
// =============================================================================

export type MetricClassification = 
  | 'actual'
  | 'calculated'
  | 'projected'
  | 'target'
  | 'assumed'
  | 'minimum'
  | 'benchmark';

export type MetricTemporality = 
  | 'current'
  | 'historical'
  | 'future_12m'
  | 'future_24m'
  | 'at_exit'
  | 'unspecified';

export interface ClassifiedMetric {
  value: number;
  currency: Currency;
  classification: MetricClassification;
  temporality: MetricTemporality;
  asOfDate?: string;
  confidence: 'verified' | 'extracted' | 'inferred' | 'estimated';
  sourceText?: string;
  calculationMethod?: string;
}

export interface FinancialMetricSet {
  arr: {
    actual?: ClassifiedMetric;
    historical?: ClassifiedMetric[];
    projected?: ClassifiedMetric;
    target?: ClassifiedMetric;
  };
  mrr: {
    actual?: ClassifiedMetric;
    historical?: ClassifiedMetric[];
  };
  acv: {
    actual?: ClassifiedMetric;
    minimum?: ClassifiedMetric;
    target?: ClassifiedMetric;
    benchmark?: ClassifiedMetric;
  };
  customers: {
    actual?: ClassifiedMetric;
    historical?: ClassifiedMetric[];
    target?: ClassifiedMetric;
  };
  revenue: {
    actual?: ClassifiedMetric;
    projected?: ClassifiedMetric;
  };
  growth: {
    monthlyRate?: ClassifiedMetric;
    yearlyRate?: ClassifiedMetric;
  };
}

export interface MetricDiscrepancy {
  metricType: 'arr' | 'mrr' | 'acv' | 'customers' | 'growth';
  classification1: MetricClassification;
  value1: number;
  classification2: MetricClassification;
  value2: number;
  severity: 'info' | 'warning' | 'error';
  explanation: string;
  recommendation?: string;
}

// =============================================================================
// ORIGINAL TYPES (maintained for backward compatibility)
// =============================================================================

export interface CompanyModelData {
  financial?: {
    pricing?: {
      acv?: number | null;
      acvBand?: 'micro' | 'smb' | 'mid-market' | 'enterprise' | null;
      model?: string | null;
    };
  };
  customer?: {
    acvBand?: string | null;
    icp?: string | null;
  };
}

export interface AIMetricEstimate {
  value: number;
  currency: string;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  comparables: Array<{ name: string; value: number; note?: string }>;
  range: { low: number; high: number };
  methodology: string;
}

export interface AnchoredAssumptions {
  // Business model context
  businessModelType: BusinessModelType;
  metricFramework: MetricFramework;
  
  // Primary metric (ACV, ARPU, etc.)
  primaryMetricValue: number | null;
  primaryMetricLabel: string; // "ACV", "ARPU", "GMV", etc.
  primaryMetricFullLabel: string; // "Annual Contract Value", etc.
  periodicity: 'monthly' | 'annual' | 'per_transaction';
  
  // Source tracking
  source: 'founder_input' | 'company_model' | 'ai_extracted' | 'ai_estimated' | 'default' | 'calculated';
  sourceDescription: string;
  sourceConfidence: 'high' | 'medium' | 'low';
  
  // AI estimation details (if applicable)
  aiEstimate?: AIMetricEstimate;
  
  // Currency
  currency: Currency;
  
  // Scale test pre-calculation
  scaleRequirements?: {
    unitsNeeded: number;
    unitLabel: string;
    formula: string;
    feasibilityAssessment: 'highly_feasible' | 'feasible' | 'challenging' | 'very_challenging';
    context: string;
  };
  
  // NEW: Classified metric set for intelligent analysis
  classifiedMetrics?: FinancialMetricSet;
  metricDiscrepancies?: MetricDiscrepancy[];
  
  // Legacy compatibility
  acv?: number;
  acvMonthly?: number;
}

/**
 * Extract anchored assumptions with business model intelligence.
 * This creates a unified source of truth for all financial metrics.
 */
export function extractAnchoredAssumptions(
  companyModelData: CompanyModelData | null,
  memoResponses: Record<string, string>,
  currency: Currency = 'USD',
  companyDetails?: { category?: string; stage?: string; name?: string }
): AnchoredAssumptions {
  // 1. Detect business model type
  const businessModelType = detectBusinessModelType({
    businessModelText: memoResponses['business_model'] || '',
    icpDescription: memoResponses['icp'] || companyModelData?.customer?.icp || '',
    pricingText: memoResponses['pricing'] || memoResponses['traction'] || '',
    category: companyDetails?.category || '',
    stage: companyDetails?.stage || 'seed',
    explicitAcv: companyModelData?.financial?.pricing?.acv || undefined,
  });
  
  // 2. Get the metric framework for this business model
  const metricFramework = getMetricFramework(businessModelType, companyDetails?.category);
  
  // 3. Initialize assumptions with framework
  const assumptions: AnchoredAssumptions = {
    businessModelType,
    metricFramework,
    primaryMetricValue: null,
    primaryMetricLabel: metricFramework.primaryMetric.label,
    primaryMetricFullLabel: metricFramework.primaryMetric.fullLabel,
    periodicity: metricFramework.primaryMetric.periodicity,
    source: 'default',
    sourceDescription: 'No explicit value found',
    sourceConfidence: 'low',
    currency,
  };

  // 4. Try to extract primary metric value from various sources
  const extractedValue = extractPrimaryMetricValue(
    businessModelType,
    metricFramework,
    companyModelData,
    memoResponses,
    currency
  );
  
  if (extractedValue) {
    assumptions.primaryMetricValue = extractedValue.value;
    assumptions.source = extractedValue.source;
    assumptions.sourceDescription = extractedValue.description;
    assumptions.sourceConfidence = extractedValue.confidence;
    
    // Legacy compatibility
    if (metricFramework.primaryMetric.periodicity === 'annual') {
      assumptions.acv = extractedValue.value;
      assumptions.acvMonthly = Math.round(extractedValue.value / 12);
    } else if (metricFramework.primaryMetric.periodicity === 'monthly') {
      assumptions.acvMonthly = extractedValue.value;
      assumptions.acv = extractedValue.value * 12;
    }
    
    // Pre-calculate scale requirements
    assumptions.scaleRequirements = calculateScaleRequirements(
      metricFramework,
      extractedValue.value
    );
  }

  return assumptions;
}

/**
 * Extract primary metric value from multiple sources
 */
function extractPrimaryMetricValue(
  businessModelType: BusinessModelType,
  framework: MetricFramework,
  companyModelData: CompanyModelData | null,
  memoResponses: Record<string, string>,
  currency: Currency
): { value: number; source: AnchoredAssumptions['source']; description: string; confidence: 'high' | 'medium' | 'low' } | null {
  
  // 1. Try company model first (most authoritative for ACV-type metrics)
  if (companyModelData?.financial?.pricing?.acv && companyModelData.financial.pricing.acv > 0) {
    const acv = companyModelData.financial.pricing.acv;
    
    // Convert to appropriate periodicity if needed
    const value = framework.primaryMetric.periodicity === 'monthly' 
      ? Math.round(acv / 12)
      : acv;
      
    return {
      value,
      source: 'company_model',
      description: `From company model: ${formatCurrencyValue(acv, currency)}/year`,
      confidence: 'high',
    };
  }

  // 2. Parse memo responses for explicit values
  const businessModelText = memoResponses['business_model'] || '';
  const tractionText = memoResponses['traction'] || '';
  const pricingText = memoResponses['pricing'] || '';
  const combinedText = `${businessModelText} ${tractionText} ${pricingText}`.toLowerCase();

  // Enterprise ACV ranges (e.g., "$50K-$500K+ ARR", "€100k ACV")
  if (businessModelType === 'b2b_enterprise' || businessModelType === 'b2b_mid_market') {
    const enterpriseRangeMatch = combinedText.match(/[€$£]([\d,]+)\s*k?\s*[-–—to]+\s*[€$£]?([\d,]+)\s*k?\s*\+?\s*(?:arr|acv|per\s*year|annual|contract)/i);
    if (enterpriseRangeMatch) {
      const low = parseNumericValue(enterpriseRangeMatch[1]);
      const high = parseNumericValue(enterpriseRangeMatch[2]);
      const midpoint = Math.round(Math.sqrt(low * high)); // Geometric mean for skewed distributions
      
      return {
        value: midpoint,
        source: 'founder_input',
        description: `From founder: ${formatCurrencyValue(low, currency)}-${formatCurrencyValue(high, currency)} range (using ${formatCurrencyValue(midpoint, currency)} midpoint)`,
        confidence: 'high',
      };
    }

    // Single ACV value
    const singleAcvMatch = combinedText.match(/(?:acv|annual\s*contract(?:\s*value)?)[:\s]*[€$£]?([\d,]+)\s*k?/i) ||
                           combinedText.match(/[€$£]([\d,]+)\s*k?\s*(?:acv|annual\s*contract)/i);
    if (singleAcvMatch) {
      const value = parseNumericValue(singleAcvMatch[1]);
      return {
        value,
        source: 'founder_input',
        description: `From founder: ${formatCurrencyValue(value, currency)} ACV`,
        confidence: 'high',
      };
    }
  }

  // B2C subscription pricing
  if (businessModelType === 'b2c_subscription') {
    // Look for monthly subscription price
    const monthlyMatch = combinedText.match(/[€$£]([\d,.]+)\s*(?:per\s*)?(?:month|\/mo)/i);
    if (monthlyMatch) {
      const monthlyPrice = parseFloat(monthlyMatch[1].replace(/,/g, ''));
      if (monthlyPrice < 100) { // Sanity check for B2C
        return {
          value: monthlyPrice,
          source: 'founder_input',
          description: `From founder: ${formatCurrencyValue(monthlyPrice, currency)}/month subscription`,
          confidence: 'high',
        };
      }
    }
    
    // Annual subscription price (convert to monthly)
    const annualMatch = combinedText.match(/[€$£]([\d,.]+)\s*(?:per\s*)?(?:year|\/yr|annual)/i);
    if (annualMatch) {
      const annualPrice = parseFloat(annualMatch[1].replace(/,/g, ''));
      if (annualPrice < 500) { // Sanity check for B2C annual
        return {
          value: Math.round(annualPrice / 12),
          source: 'founder_input',
          description: `From founder: ${formatCurrencyValue(annualPrice, currency)}/year (${formatCurrencyValue(annualPrice / 12, currency)}/month)`,
          confidence: 'high',
        };
      }
    }
  }

  // SMB SaaS per-seat pricing
  if (businessModelType === 'b2b_smb_saas') {
    const perSeatMatch = combinedText.match(/[€$£]([\d,.]+)\s*[-–—]?\s*[€$£]?([\d,.]+)?\s*(?:per\s*)?(?:user|seat)?\s*\/?\s*month/i);
    if (perSeatMatch) {
      const low = parseFloat(perSeatMatch[1].replace(/,/g, ''));
      const high = perSeatMatch[2] ? parseFloat(perSeatMatch[2].replace(/,/g, '')) : low;
      const avgMonthly = (low + high) / 2;
      // Assume 20 seats average for SMB
      const estimatedACV = avgMonthly * 20 * 12;
      
      return {
        value: Math.round(estimatedACV),
        source: 'ai_extracted',
        description: `Estimated from ${formatCurrencyValue(avgMonthly, currency)}/user/month × 20 avg seats`,
        confidence: 'medium',
      };
    }
  }

  // Marketplace take rate
  if (businessModelType === 'marketplace') {
    const takeRateMatch = combinedText.match(/(\d{1,2}(?:\.\d+)?)\s*%?\s*(?:take[\s-]?rate|commission|fee)/i);
    if (takeRateMatch) {
      const takeRate = parseFloat(takeRateMatch[1]);
      return {
        value: takeRate,
        source: 'founder_input',
        description: `From founder: ${takeRate}% take rate`,
        confidence: 'high',
      };
    }
  }

  // CRITICAL: Calculate ACV from ARR ÷ Customers when both are available
  // This handles cases like Groundley: "€126k ARR with 5 customers" → €25.2k ACV
  const arrMatch = combinedText.match(/[€$£]([\d,.]+)\s*k?\s*(?:carr|arr|annual\s*(?:recurring\s*)?revenue)/i);
  const customerMatch = combinedText.match(/(\d+)\s*(?:paying\s*)?(?:customer|client|icp|account|enterprise)/i);
  
  if (arrMatch && customerMatch) {
    let arr = parseNumericValue(arrMatch[1]);
    // Handle 'k' suffix in the original match
    if (combinedText.includes(arrMatch[0].toLowerCase()) && /k\s*(?:carr|arr)/i.test(arrMatch[0])) {
      arr = arr * 1000;
    }
    const customers = parseInt(customerMatch[1]);
    
    if (customers > 0 && arr > 0) {
      const calculatedACV = Math.round(arr / customers);
      const value = framework.primaryMetric.periodicity === 'monthly' 
        ? Math.round(calculatedACV / 12)
        : calculatedACV;
        
      return {
        value,
        source: 'calculated' as const,
        description: `Calculated: ${formatCurrencyValue(arr, currency)} ARR ÷ ${customers} customers = ${formatCurrencyValue(calculatedACV, currency)} ACV`,
        confidence: 'high',
      };
    }
  }

  // Also try to extract from separate pricing tiers (e.g., "€18k/year" ... "€37k/year")
  const tierMatches = [...combinedText.matchAll(/[€$£]([\d,.]+)\s*k?\s*(?:\/year|\/yr|per\s*year|annual|arr)/gi)];
  if (tierMatches.length >= 2) {
    const tiers = tierMatches.map(m => parseNumericValue(m[1]));
    const low = Math.min(...tiers);
    const high = Math.max(...tiers);
    const midpoint = Math.round(Math.sqrt(low * high)); // Geometric mean
    const value = framework.primaryMetric.periodicity === 'monthly' 
      ? Math.round(midpoint / 12)
      : midpoint;
      
    return {
      value,
      source: 'founder_input',
      description: `From founder pricing tiers: ${formatCurrencyValue(low, currency)}-${formatCurrencyValue(high, currency)} (using ${formatCurrencyValue(midpoint, currency)} midpoint)`,
      confidence: 'high',
    };
  }

  // No explicit value found - return null to trigger AI estimation
  return null;
}

/**
 * Async function to get AI estimation for missing primary metric
 */
export async function getAIMetricEstimate(
  assumptions: AnchoredAssumptions,
  companyDetails: { name: string; category: string; stage: string },
  memoResponses: Record<string, string>
): Promise<AIMetricEstimate | null> {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/estimate-primary-metric`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        companyName: companyDetails.name,
        category: companyDetails.category,
        stage: companyDetails.stage,
        businessModelType: assumptions.businessModelType,
        icpDescription: memoResponses['icp'] || '',
        pricingHints: memoResponses['pricing'] || memoResponses['business_model'] || '',
        currency: assumptions.currency,
        primaryMetricLabel: assumptions.primaryMetricLabel,
      }),
    });

    if (!response.ok) {
      console.error('AI estimation failed:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling AI estimation:', error);
    return null;
  }
}

/**
 * Apply AI estimate to anchored assumptions
 */
export function applyAIEstimate(
  assumptions: AnchoredAssumptions,
  estimate: AIMetricEstimate
): AnchoredAssumptions {
  const updated = { ...assumptions };
  
  updated.primaryMetricValue = estimate.value;
  updated.source = 'ai_estimated';
  updated.sourceDescription = estimate.reasoning;
  updated.sourceConfidence = estimate.confidence;
  updated.aiEstimate = estimate;
  
  // Legacy compatibility
  if (updated.metricFramework.primaryMetric.periodicity === 'annual') {
    updated.acv = estimate.value;
    updated.acvMonthly = Math.round(estimate.value / 12);
  } else if (updated.metricFramework.primaryMetric.periodicity === 'monthly') {
    updated.acvMonthly = estimate.value;
    updated.acv = estimate.value * 12;
  }
  
  // Recalculate scale requirements
  updated.scaleRequirements = calculateScaleRequirements(
    updated.metricFramework,
    estimate.value
  );
  
  return updated;
}

/**
 * Get fallback estimate based on business model benchmarks (no AI call)
 */
export function getFallbackMetricValue(assumptions: AnchoredAssumptions, stage: string): number {
  const benchmarks = assumptions.metricFramework.benchmarks;
  const stageKey = stage.toLowerCase().replace(/\s+/g, '-') as 'pre-seed' | 'seed' | 'series-a';
  const stageBenchmarks = benchmarks.byStage[stageKey] || benchmarks.byStage['seed'];
  
  return stageBenchmarks.mid;
}

/**
 * Parse a numeric string that may include 'k' or 'm' suffixes
 */
function parseNumericValue(str: string): number {
  const clean = str.replace(/,/g, '').toLowerCase();
  const num = parseFloat(clean);
  if (str.toLowerCase().includes('m')) return num * 1000000;
  if (str.toLowerCase().includes('k') || num < 1000) return num * 1000;
  return num;
}

/**
 * Format currency value for display
 */
function formatCurrencyValue(value: number, currency: Currency): string {
  const symbols: Record<Currency, string> = {
    USD: '$', EUR: '€', GBP: '£', SEK: 'kr', NOK: 'kr', DKK: 'kr'
  };
  const symbol = symbols[currency] || '$';
  if (value >= 1000000) return `${symbol}${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${symbol}${(value / 1000).toFixed(0)}k`;
  return `${symbol}${value.toLocaleString()}`;
}

/**
 * Detect currency from memo responses text
 */
export function detectCurrencyFromResponses(memoResponses: Record<string, string>): Currency {
  const allText = Object.values(memoResponses).join(' ').toLowerCase();
  
  const eurCount = (allText.match(/€|eur\b/gi) || []).length;
  const gbpCount = (allText.match(/£|gbp\b/gi) || []).length;
  const usdCount = (allText.match(/\$|usd\b/gi) || []).length;
  
  if (eurCount > usdCount && eurCount > gbpCount) return 'EUR';
  if (gbpCount > usdCount && gbpCount > eurCount) return 'GBP';
  return 'USD';
}

// =============================================================================
// INTELLIGENT METRIC CLASSIFICATION - Frontend extraction utilities
// =============================================================================

const TEMPORAL_PATTERNS = {
  current: [
    /(?:currently|now|as of|today|at present)/i,
    /(?:in\s+)?(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+202[4-9]/i,
  ],
  historical: [
    /(?:was|were|had|grew\s+from|increased\s+from)/i,
    /(?:in\s+)?(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+202[0-3]/i,
  ],
  projected: [
    /(?:targeting|projecting|aiming\s+for|expecting|goal\s+of)/i,
  ],
  minimum: [
    /(?:minimum|at\s+least|starting\s+at|floor|base\s+price)/i,
    /(?:minimum\s+annual\s+(?:consumption|commitment|contract))/i,
  ],
};

/**
 * Detect temporality from surrounding text
 */
function detectTemporality(text: string): MetricTemporality {
  for (const pattern of TEMPORAL_PATTERNS.historical) {
    if (pattern.test(text)) return 'historical';
  }
  for (const pattern of TEMPORAL_PATTERNS.projected) {
    if (pattern.test(text)) return 'future_12m';
  }
  for (const pattern of TEMPORAL_PATTERNS.current) {
    if (pattern.test(text)) return 'current';
  }
  return 'unspecified';
}

/**
 * Detect classification from surrounding text
 */
function detectClassification(text: string): MetricClassification {
  for (const pattern of TEMPORAL_PATTERNS.minimum) {
    if (pattern.test(text)) return 'minimum';
  }
  for (const pattern of TEMPORAL_PATTERNS.projected) {
    if (pattern.test(text)) return 'projected';
  }
  return 'actual';
}

/**
 * Extract date reference from text
 */
function extractDateReference(text: string): string | undefined {
  const match = text.match(/(?:in\s+)?(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/i);
  return match ? match[0].replace(/^in\s+/i, '') : undefined;
}

/**
 * Build a complete classified metric set from memo responses (frontend version)
 */
export function buildClassifiedMetricSet(
  memoResponses: Record<string, string>,
  currency: Currency = 'EUR'
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
  
  const tractionText = memoResponses['traction'] || '';
  const businessModelText = memoResponses['business_model'] || '';
  const pricingText = memoResponses['pricing'] || '';
  const combinedText = `${tractionText} ${businessModelText} ${pricingText}`;
  const lowerText = combinedText.toLowerCase();
  
  // 1. Extract MRR with growth pattern
  const mrrGrowthMatch = combinedText.match(
    /mrr\s+(?:grew|increased|went)\s+from\s+[€$£]?([\d,.]+)\s*k?\s*(?:in\s+)?((?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4})\s+to\s+[€$£]?([\d,.]+)\s*k?\s*(?:in\s+)?((?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4})/i
  );
  
  if (mrrGrowthMatch) {
    const historicalValue = parseNumericValueWithSuffix(mrrGrowthMatch[1], mrrGrowthMatch[0]);
    const currentValue = parseNumericValueWithSuffix(mrrGrowthMatch[3], mrrGrowthMatch[0]);
    
    metricSet.mrr.historical = [{
      value: historicalValue,
      currency,
      classification: 'actual',
      temporality: 'historical',
      asOfDate: mrrGrowthMatch[2],
      confidence: 'extracted',
      sourceText: mrrGrowthMatch[0],
    }];
    
    metricSet.mrr.actual = {
      value: currentValue,
      currency,
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
        currency,
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
      currency,
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
      const value = parseNumericValueWithSuffix(arrMatch[1], arrMatch[0]);
      metricSet.arr.actual = {
        value,
        currency,
        classification: 'actual',
        temporality: detectTemporality(arrMatch[0]),
        asOfDate: extractDateReference(arrMatch[0]),
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
      currency,
      classification: 'actual',
      temporality: detectTemporality(customerMatch[0]),
      asOfDate: extractDateReference(customerMatch[0]),
      confidence: 'extracted',
      sourceText: customerMatch[0],
    };
  }
  
  // 4. Extract minimum pricing
  const minMatch = combinedText.match(/minimum\s*(?:annual\s*)?(?:consumption|commitment|contract)(?:\s*of)?\s*[€$£]?([\d,.]+)\s*k?/i);
  if (minMatch) {
    const value = parseNumericValueWithSuffix(minMatch[1], minMatch[0]);
    metricSet.acv.minimum = {
      value,
      currency,
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
      currency,
      classification: 'calculated',
      temporality: 'current',
      confidence: 'inferred',
      calculationMethod: `ARR (${formatCurrencyValue(metricSet.arr.actual.value, currency)}) ÷ Customers (${metricSet.customers.actual.value})`,
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
        explanation: `Your actual average ACV (${formatCurrencyValue(calculatedACV, currency)}) is below your stated minimum (${formatCurrencyValue(metricSet.acv.minimum.value, currency)}). This suggests SMB customers may be pulling down the average, or the minimum isn't being enforced.`,
        recommendation: 'Review your customer mix and pricing enforcement.',
      });
    }
  }
  
  // 6. Add $100M target
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
      return metricSet.arr.actual || metricSet.mrr.actual || null;
    case 'unit_economics':
    case 'scale_test':
      return metricSet.acv.actual || null;
    case 'valuation':
      return metricSet.arr.actual || null;
    case 'benchmark_comparison':
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
