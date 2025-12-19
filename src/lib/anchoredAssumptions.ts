/**
 * Anchored Assumptions Extractor
 * 
 * Creates a single source of truth for key financial assumptions like ACV/ARPU,
 * extracted from company model, memo responses, or AI estimation.
 * This prevents inconsistencies where different components extract different values.
 */

import type { Currency } from './memoDataExtractor';
import { 
  detectBusinessModelType, 
  getMetricFramework, 
  calculateScaleRequirements,
  type BusinessModelType,
  type MetricFramework 
} from './businessModelFramework';

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
