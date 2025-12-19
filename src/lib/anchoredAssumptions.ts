/**
 * Anchored Assumptions Extractor
 * 
 * Creates a single source of truth for key financial assumptions like ACV,
 * extracted from company model, memo responses, or narrative text.
 * This prevents inconsistencies where different components extract different values.
 */

import type { AnchoredAssumptions, Currency, BusinessModelType } from './memoDataExtractor';

interface CompanyModelData {
  financial?: {
    pricing?: {
      acv?: number | null;
      acvBand?: 'micro' | 'smb' | 'mid-market' | 'enterprise' | null;
      model?: string | null;
    };
  };
  customer?: {
    acvBand?: string | null;
  };
}

/**
 * Extract anchored ACV assumptions from multiple data sources.
 * Priority order:
 * 1. Company model pricing.acv (if available and > 0)
 * 2. Memo responses (explicit ACV mentions in business_model)
 * 3. Inferred from enterprise contract ranges in business_model text
 */
export function extractAnchoredAssumptions(
  companyModelData: CompanyModelData | null,
  memoResponses: Record<string, string>,
  currency: Currency = 'USD'
): AnchoredAssumptions {
  const assumptions: AnchoredAssumptions = {
    currency,
    source: 'default',
  };

  // 1. Try company model first (most authoritative)
  if (companyModelData?.financial?.pricing?.acv && companyModelData.financial.pricing.acv > 0) {
    assumptions.acv = companyModelData.financial.pricing.acv;
    assumptions.acvMonthly = Math.round(companyModelData.financial.pricing.acv / 12);
    assumptions.source = 'company_model';
    assumptions.sourceDescription = `From company model: ${formatCurrencyValue(assumptions.acv, currency)}/year ACV`;
    
    // Infer business model from ACV band
    const acvBand = companyModelData.financial.pricing.acvBand;
    if (acvBand === 'enterprise') assumptions.businessModelType = 'enterprise';
    else if (acvBand === 'mid-market') assumptions.businessModelType = 'saas';
    else if (acvBand === 'smb') assumptions.businessModelType = 'saas';
    
    return assumptions;
  }

  // 2. Try extracting from memo responses (founder input)
  const businessModelText = memoResponses['business_model'] || '';
  const tractionText = memoResponses['traction'] || '';
  const combinedText = `${businessModelText} ${tractionText}`.toLowerCase();

  // Look for explicit enterprise ACV ranges (e.g., "$50K-$500K+ ARR", "€100k ACV")
  const enterpriseRangeMatch = combinedText.match(/[€$£]([\d,]+)\s*k?\s*[-–—to]+\s*[€$£]?([\d,]+)\s*k?\s*\+?\s*(?:arr|acv|per\s*year|annual)/i);
  if (enterpriseRangeMatch) {
    const low = parseNumericValue(enterpriseRangeMatch[1]);
    const high = parseNumericValue(enterpriseRangeMatch[2]);
    // Use geometric mean for enterprise contracts (conservative estimate)
    const midpoint = Math.sqrt(low * high);
    assumptions.acv = Math.round(midpoint);
    assumptions.acvMonthly = Math.round(midpoint / 12);
    assumptions.source = 'founder_input';
    assumptions.sourceDescription = `From founder input: ${formatCurrencyValue(low, currency)}-${formatCurrencyValue(high, currency)} enterprise contracts (using ${formatCurrencyValue(assumptions.acv, currency)} midpoint)`;
    assumptions.businessModelType = 'enterprise';
    return assumptions;
  }

  // Look for single ACV value (e.g., "€100k ACV", "ACV of $50,000")
  const singleAcvMatch = combinedText.match(/(?:acv|annual\s*contract(?:\s*value)?)[:\s]*[€$£]?([\d,]+)\s*k?/i) ||
                         combinedText.match(/[€$£]([\d,]+)\s*k?\s*(?:acv|annual\s*contract)/i);
  if (singleAcvMatch) {
    const value = parseNumericValue(singleAcvMatch[1]);
    assumptions.acv = value;
    assumptions.acvMonthly = Math.round(value / 12);
    assumptions.source = 'founder_input';
    assumptions.sourceDescription = `From founder input: ${formatCurrencyValue(value, currency)} ACV`;
    assumptions.businessModelType = value >= 50000 ? 'enterprise' : 'saas';
    return assumptions;
  }

  // Look for per-user/seat pricing (B2B SaaS)
  const perSeatMatch = combinedText.match(/[€$£]([\d,.]+)\s*[-–—]?\s*[€$£]?([\d,.]+)?\s*(?:per\s*)?(?:user|seat)?\s*\/?\s*month/i);
  if (perSeatMatch) {
    const low = parseFloat(perSeatMatch[1].replace(/,/g, ''));
    const high = perSeatMatch[2] ? parseFloat(perSeatMatch[2].replace(/,/g, '')) : low;
    const avgMonthly = (low + high) / 2;
    // Assume 50 seats average for enterprise calculation
    const estimatedACV = avgMonthly * 50 * 12;
    assumptions.acv = Math.round(estimatedACV);
    assumptions.acvMonthly = Math.round(avgMonthly * 50);
    assumptions.source = 'ai_extracted';
    assumptions.sourceDescription = `Estimated from ${formatCurrencyValue(avgMonthly, currency)}/user/month × 50 avg seats`;
    assumptions.businessModelType = 'saas';
    return assumptions;
  }

  // Look for B2C pricing
  const b2cMatch = combinedText.match(/[€$£]([\d,.]+)\s*(?:per\s*)?(?:user|month)/i);
  if (b2cMatch && parseFloat(b2cMatch[1]) < 100) {
    const monthlyPrice = parseFloat(b2cMatch[1].replace(/,/g, ''));
    assumptions.acv = Math.round(monthlyPrice * 12);
    assumptions.acvMonthly = Math.round(monthlyPrice);
    assumptions.source = 'ai_extracted';
    assumptions.sourceDescription = `From B2C pricing: ${formatCurrencyValue(monthlyPrice, currency)}/month`;
    assumptions.businessModelType = 'b2c';
    return assumptions;
  }

  // No explicit ACV found - leave undefined so extractor can use its logic
  return assumptions;
}

/**
 * Parse a numeric string that may include 'k' or 'm' suffixes
 */
function parseNumericValue(str: string): number {
  const clean = str.replace(/,/g, '').toLowerCase();
  const num = parseFloat(clean);
  if (str.toLowerCase().includes('m')) return num * 1000000;
  if (str.toLowerCase().includes('k') || num < 1000) return num * 1000; // Assume 'k' if small number
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
  
  // Count currency indicators
  const eurCount = (allText.match(/€|eur\b/gi) || []).length;
  const gbpCount = (allText.match(/£|gbp\b/gi) || []).length;
  const usdCount = (allText.match(/\$|usd\b/gi) || []).length;
  
  if (eurCount > usdCount && eurCount > gbpCount) return 'EUR';
  if (gbpCount > usdCount && gbpCount > eurCount) return 'GBP';
  return 'USD';
}
