/**
 * Metric Extractor Utility
 * 
 * Extracts financial metrics from text and structured data,
 * and calculates derived metrics (e.g., ACV from ARR + customers)
 */

export interface ExtractedMetrics {
  arr?: number;
  mrr?: number;
  acv?: number;
  customers?: number;
  ltv?: number;
  cac?: number;
  churnRate?: number;
  growthRate?: number;
  burnRate?: number;
  runway?: number;
  revenue?: number;
  valuation?: number;
  ltvcacRatio?: number;
  paybackMonths?: number;
  currency?: string;
  sourceConfidence?: 'high' | 'medium' | 'low';
  calculationNotes?: string[];
}

// Normalize number from text (handles k, K, M, million, etc.)
function normalizeNumber(value: string, suffix?: string): number {
  const cleanValue = value.replace(/[,\s]/g, '');
  let num = parseFloat(cleanValue);
  
  if (isNaN(num)) return 0;
  
  const lowerSuffix = (suffix || '').toLowerCase();
  if (lowerSuffix === 'k') {
    num *= 1000;
  } else if (lowerSuffix === 'm' || lowerSuffix === 'million') {
    num *= 1000000;
  } else if (lowerSuffix === 'b' || lowerSuffix === 'billion') {
    num *= 1000000000;
  }
  
  return Math.round(num);
}

// Detect currency from text
function detectCurrency(text: string): string {
  if (text.includes('$') || /USD/i.test(text)) return 'USD';
  if (text.includes('£') || /GBP/i.test(text)) return 'GBP';
  if (text.includes('€') || /EUR/i.test(text)) return 'EUR';
  return 'EUR'; // Default to EUR
}

/**
 * Extract metrics from freeform text using regex patterns
 */
export function extractMetricsFromText(text: string): ExtractedMetrics {
  if (!text || typeof text !== 'string') return {};
  
  const metrics: ExtractedMetrics = {};
  const notes: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Detect currency
  metrics.currency = detectCurrency(text);
  
  // ARR patterns
  const arrPatterns = [
    /(?:ARR|annual recurring revenue)[:\s]*[\$€£]?([\d,]+(?:\.\d+)?)\s*(k|K|M|million)?/gi,
    /[\$€£]([\d,]+(?:\.\d+)?)\s*(k|K|M|million)?\s*(?:ARR|annual recurring revenue)/gi,
    /([\d,]+(?:\.\d+)?)\s*(k|K|M|million)?\s*(?:ARR)/gi,
  ];
  
  for (const pattern of arrPatterns) {
    const match = pattern.exec(text);
    if (match) {
      metrics.arr = normalizeNumber(match[1], match[2]);
      notes.push(`ARR extracted from text: ${match[0]}`);
      break;
    }
  }
  
  // MRR patterns
  const mrrPatterns = [
    /(?:MRR|monthly recurring revenue)[:\s]*[\$€£]?([\d,]+(?:\.\d+)?)\s*(k|K|M)?/gi,
    /[\$€£]([\d,]+(?:\.\d+)?)\s*(k|K)?\s*(?:MRR|monthly recurring revenue)/gi,
    /([\d,]+(?:\.\d+)?)\s*(k|K)?\s*(?:MRR)/gi,
  ];
  
  for (const pattern of mrrPatterns) {
    const match = pattern.exec(text);
    if (match) {
      metrics.mrr = normalizeNumber(match[1], match[2]);
      notes.push(`MRR extracted from text: ${match[0]}`);
      break;
    }
  }
  
  // ACV patterns
  const acvPatterns = [
    /(?:ACV|annual contract value)[:\s]*[\$€£]?([\d,]+(?:\.\d+)?)\s*(k|K|M)?/gi,
    /[\$€£]([\d,]+(?:\.\d+)?)\s*(k|K)?\s*(?:ACV|annual contract value)/gi,
    /([\d,]+(?:\.\d+)?)\s*(k|K)?\s*(?:ACV)/gi,
  ];
  
  for (const pattern of acvPatterns) {
    const match = pattern.exec(text);
    if (match) {
      metrics.acv = normalizeNumber(match[1], match[2]);
      notes.push(`ACV extracted from text: ${match[0]}`);
      break;
    }
  }
  
  // Customer/client count patterns
  const customerPatterns = [
    /(\d+)\s*(?:paying\s+)?(?:customers?|clients?|users?|accounts?|enterprises?)/gi,
    /(?:customers?|clients?|users?|accounts?)[:\s]*(\d+)/gi,
    /(?:signed|closed|acquired)\s+(\d+)\s*(?:deals?|contracts?|customers?|clients?)/gi,
  ];
  
  for (const pattern of customerPatterns) {
    const match = pattern.exec(text);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > 0 && num < 10000) { // Sanity check
        metrics.customers = num;
        notes.push(`Customer count extracted: ${match[0]}`);
        break;
      }
    }
  }
  
  // LTV patterns
  const ltvPatterns = [
    /(?:LTV|lifetime value|customer lifetime value)[:\s]*[\$€£]?([\d,]+(?:\.\d+)?)\s*(k|K|M)?/gi,
    /[\$€£]([\d,]+(?:\.\d+)?)\s*(k|K)?\s*(?:LTV)/gi,
  ];
  
  for (const pattern of ltvPatterns) {
    const match = pattern.exec(text);
    if (match) {
      metrics.ltv = normalizeNumber(match[1], match[2]);
      notes.push(`LTV extracted from text: ${match[0]}`);
      break;
    }
  }
  
  // CAC patterns
  const cacPatterns = [
    /(?:CAC|customer acquisition cost)[:\s]*[\$€£]?([\d,]+(?:\.\d+)?)\s*(k|K)?/gi,
    /[\$€£]([\d,]+(?:\.\d+)?)\s*(k|K)?\s*(?:CAC)/gi,
  ];
  
  for (const pattern of cacPatterns) {
    const match = pattern.exec(text);
    if (match) {
      metrics.cac = normalizeNumber(match[1], match[2]);
      notes.push(`CAC extracted from text: ${match[0]}`);
      break;
    }
  }
  
  // Churn rate patterns
  const churnPatterns = [
    /(?:churn rate?|monthly churn)[:\s]*([\d.]+)\s*%/gi,
    /([\d.]+)\s*%\s*(?:churn|monthly churn)/gi,
  ];
  
  for (const pattern of churnPatterns) {
    const match = pattern.exec(text);
    if (match) {
      metrics.churnRate = parseFloat(match[1]);
      notes.push(`Churn rate extracted: ${match[0]}`);
      break;
    }
  }
  
  // Growth rate patterns
  const growthPatterns = [
    /(?:growth rate?|MoM growth|monthly growth)[:\s]*([\d.]+)\s*%/gi,
    /([\d.]+)\s*%\s*(?:growth|MoM|monthly growth)/gi,
    /growing\s+([\d.]+)\s*%/gi,
  ];
  
  for (const pattern of growthPatterns) {
    const match = pattern.exec(text);
    if (match) {
      metrics.growthRate = parseFloat(match[1]);
      notes.push(`Growth rate extracted: ${match[0]}`);
      break;
    }
  }
  
  // Burn rate patterns
  const burnPatterns = [
    /(?:burn rate?|monthly burn)[:\s]*[\$€£]?([\d,]+(?:\.\d+)?)\s*(k|K)?/gi,
    /burning\s*[\$€£]?([\d,]+(?:\.\d+)?)\s*(k|K)?\s*(?:per month|monthly|\/month)?/gi,
  ];
  
  for (const pattern of burnPatterns) {
    const match = pattern.exec(text);
    if (match) {
      metrics.burnRate = normalizeNumber(match[1], match[2]);
      notes.push(`Burn rate extracted: ${match[0]}`);
      break;
    }
  }
  
  // Runway patterns
  const runwayPatterns = [
    /(\d+)\s*(?:months?)\s*(?:of\s+)?runway/gi,
    /runway[:\s]*(\d+)\s*months?/gi,
  ];
  
  for (const pattern of runwayPatterns) {
    const match = pattern.exec(text);
    if (match) {
      metrics.runway = parseInt(match[1], 10);
      notes.push(`Runway extracted: ${match[0]}`);
      break;
    }
  }
  
  // Revenue patterns (general)
  const revenuePatterns = [
    /(?:revenue|sales)[:\s]*[\$€£]?([\d,]+(?:\.\d+)?)\s*(k|K|M|million)?/gi,
  ];
  
  for (const pattern of revenuePatterns) {
    const match = pattern.exec(text);
    if (match && !metrics.arr && !metrics.mrr) {
      metrics.revenue = normalizeNumber(match[1], match[2]);
      notes.push(`Revenue extracted: ${match[0]}`);
      break;
    }
  }
  
  // Valuation patterns
  const valuationPatterns = [
    /(?:valuation|valued at)[:\s]*[\$€£]?([\d,]+(?:\.\d+)?)\s*(k|K|M|million)?/gi,
    /[\$€£]([\d,]+(?:\.\d+)?)\s*(M|million)?\s*(?:valuation|pre-money|post-money)/gi,
  ];
  
  for (const pattern of valuationPatterns) {
    const match = pattern.exec(text);
    if (match) {
      metrics.valuation = normalizeNumber(match[1], match[2]);
      notes.push(`Valuation extracted: ${match[0]}`);
      break;
    }
  }
  
  // Determine confidence based on extraction quality
  const extractedCount = Object.keys(metrics).filter(k => 
    k !== 'currency' && k !== 'sourceConfidence' && k !== 'calculationNotes' && 
    metrics[k as keyof ExtractedMetrics] !== undefined
  ).length;
  
  if (extractedCount > 0) {
    metrics.sourceConfidence = 'low'; // From text extraction
    metrics.calculationNotes = notes;
  }
  
  return metrics;
}

/**
 * Extract metrics from structured data (already numeric)
 */
export function extractMetricsFromStructured(data: Record<string, any>): ExtractedMetrics {
  if (!data || typeof data !== 'object') return {};
  
  const metrics: ExtractedMetrics = {};
  const notes: string[] = [];
  
  // Direct mappings
  const mappings: Record<string, keyof ExtractedMetrics> = {
    arr: 'arr',
    mrr: 'mrr',
    acv: 'acv',
    aov: 'acv', // Average order value sometimes used interchangeably
    customers: 'customers',
    customerCount: 'customers',
    clients: 'customers',
    ltv: 'ltv',
    lifetime_value: 'ltv',
    cac: 'cac',
    customer_acquisition_cost: 'cac',
    churnRate: 'churnRate',
    churn: 'churnRate',
    growthRate: 'growthRate',
    growth: 'growthRate',
    burnRate: 'burnRate',
    monthlyBurn: 'burnRate',
    runway: 'runway',
    revenue: 'revenue',
    valuation: 'valuation',
  };
  
  // Check nested and flat structures
  const flatData = flattenObject(data);
  
  for (const [key, metricKey] of Object.entries(mappings)) {
    const value = flatData[key] ?? flatData[key.toLowerCase()] ?? data[key] ?? data[key.toLowerCase()];
    if (value !== undefined && value !== null) {
      const numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
      if (!isNaN(numValue) && numValue > 0) {
        (metrics as Record<string, unknown>)[metricKey] = numValue;
        notes.push(`${metricKey} from structured data: ${numValue}`);
      }
    }
  }
  
  // Look for segment data (TAM calculator style)
  if (data.segments || data.targetSegments) {
    const segments = data.segments || data.targetSegments;
    if (Array.isArray(segments)) {
      let totalAcv = 0;
      let segmentCount = 0;
      for (const segment of segments) {
        if (segment.acv && typeof segment.acv === 'number') {
          totalAcv += segment.acv;
          segmentCount++;
        }
      }
      if (segmentCount > 0 && !metrics.acv) {
        metrics.acv = Math.round(totalAcv / segmentCount);
        notes.push(`ACV calculated as average from ${segmentCount} segments: ${metrics.acv}`);
      }
    }
  }
  
  // Check for monthly/annual revenue in nested objects
  if (data.currentMRR || data.projectedMRR) {
    metrics.mrr = data.currentMRR || data.projectedMRR;
    notes.push(`MRR from structured: ${metrics.mrr}`);
  }
  
  if (data.projectedARR) {
    metrics.arr = data.projectedARR;
    notes.push(`ARR from structured: ${metrics.arr}`);
  }
  
  if (Object.keys(metrics).length > 0) {
    metrics.sourceConfidence = 'high'; // From structured data
    metrics.calculationNotes = notes;
  }
  
  return metrics;
}

/**
 * Flatten nested object for easier key lookup
 */
function flattenObject(obj: Record<string, any>, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[key] = value; // Also keep flat key for easier access
      result[newKey] = value;
    }
  }
  
  return result;
}

/**
 * Calculate derived metrics from existing metrics
 */
export function calculateDerivedMetrics(metrics: ExtractedMetrics): ExtractedMetrics {
  const derived = { ...metrics };
  const notes = [...(metrics.calculationNotes || [])];
  
  // MRR <-> ARR conversions
  if (derived.arr && !derived.mrr) {
    derived.mrr = Math.round(derived.arr / 12);
    notes.push(`MRR calculated: ARR / 12 = ${derived.mrr}`);
  } else if (derived.mrr && !derived.arr) {
    derived.arr = Math.round(derived.mrr * 12);
    notes.push(`ARR calculated: MRR × 12 = ${derived.arr}`);
  }
  
  // ACV from ARR + customers
  if (derived.arr && derived.customers && !derived.acv) {
    derived.acv = Math.round(derived.arr / derived.customers);
    notes.push(`ACV calculated: ARR / customers = ${derived.acv}`);
  }
  
  // ARR from ACV + customers (if we don't have ARR)
  if (derived.acv && derived.customers && !derived.arr) {
    derived.arr = Math.round(derived.acv * derived.customers);
    derived.mrr = Math.round(derived.arr / 12);
    notes.push(`ARR calculated: ACV × customers = ${derived.arr}`);
  }
  
  // LTV:CAC ratio
  if (derived.ltv && derived.cac && !derived.ltvcacRatio) {
    derived.ltvcacRatio = Math.round((derived.ltv / derived.cac) * 10) / 10;
    notes.push(`LTV:CAC ratio calculated: ${derived.ltvcacRatio}`);
  }
  
  // LTV from CAC and ratio (if we have both)
  if (derived.cac && derived.ltvcacRatio && !derived.ltv) {
    derived.ltv = Math.round(derived.cac * derived.ltvcacRatio);
    notes.push(`LTV calculated from CAC × ratio = ${derived.ltv}`);
  }
  
  // Runway from burn rate and cash (if we have both in data)
  // Note: We'd need cash data for this, which isn't always available
  
  // LTV from MRR + churn (if we have both)
  if (derived.mrr && derived.churnRate && !derived.ltv) {
    derived.ltv = Math.round(derived.mrr / (derived.churnRate / 100));
    notes.push(`LTV calculated: MRR / churn rate = ${derived.ltv}`);
  }
  
  // Payback months from CAC + MRR
  if (derived.cac && derived.mrr && !derived.paybackMonths) {
    derived.paybackMonths = Math.round((derived.cac / derived.mrr) * 10) / 10;
    notes.push(`Payback months calculated: CAC / MRR = ${derived.paybackMonths}`);
  }
  
  derived.calculationNotes = notes;
  
  return derived;
}

/**
 * Merge new metrics with existing metrics (newer wins on conflicts)
 */
export function mergeMetrics(existing: ExtractedMetrics, newMetrics: ExtractedMetrics): ExtractedMetrics {
  const merged = { ...existing };
  
  for (const [key, value] of Object.entries(newMetrics)) {
    if (value !== undefined && value !== null) {
      // For numeric values, prefer new values if they exist
      // For confidence, prefer higher confidence
      if (key === 'sourceConfidence') {
        const confOrder = { high: 3, medium: 2, low: 1 };
        const existingConf = confOrder[existing.sourceConfidence || 'low'];
        const newConf = confOrder[value as 'high' | 'medium' | 'low'];
        if (newConf >= existingConf) {
          merged.sourceConfidence = value as 'high' | 'medium' | 'low';
        }
      } else if (key === 'calculationNotes') {
        merged.calculationNotes = [
          ...(existing.calculationNotes || []),
          ...(value as string[])
        ];
      } else {
        // Numeric value - prefer new if it exists
        const metricKey = key as keyof ExtractedMetrics;
        (merged as Record<string, unknown>)[metricKey] = value;
      }
    }
  }
  
  return merged;
}

/**
 * Create a hash of input data for deduplication
 */
export function hashInputData(data: Record<string, any>): string {
  const str = JSON.stringify(data, Object.keys(data).sort());
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Extract and calculate metrics from any input
 */
export function extractAllMetrics(inputData: Record<string, any> | string): ExtractedMetrics {
  let metrics: ExtractedMetrics = {};
  
  // Handle string input
  if (typeof inputData === 'string') {
    metrics = extractMetricsFromText(inputData);
  } else {
    // Handle structured data
    metrics = extractMetricsFromStructured(inputData);
    
    // Also check for text fields within the structured data
    const textFields = ['answer', 'description', 'notes', 'content', 'text', 'summary'];
    for (const field of textFields) {
      if (inputData[field] && typeof inputData[field] === 'string') {
        const textMetrics = extractMetricsFromText(inputData[field]);
        metrics = mergeMetrics(metrics, textMetrics);
      }
    }
    
    // Check the full JSON string as fallback
    const jsonStr = JSON.stringify(inputData);
    const jsonMetrics = extractMetricsFromText(jsonStr);
    metrics = mergeMetrics(metrics, jsonMetrics);
  }
  
  // Calculate derived metrics
  return calculateDerivedMetrics(metrics);
}
