/**
 * Business Model Intelligence Framework
 * 
 * Provides a unified metric framework that adapts terminology, calculations,
 * and benchmarks based on detected business model type.
 */

export type BusinessModelType = 
  | 'b2c_subscription'      // Consumer subscription (Spotify, Netflix)
  | 'b2c_transactional'     // Consumer one-time/transactional (e-commerce)
  | 'b2b_smb_saas'          // SMB SaaS ($1K-$15K ACV)
  | 'b2b_mid_market'        // Mid-market SaaS ($15K-$100K ACV)
  | 'b2b_enterprise'        // Enterprise SaaS ($100K+ ACV)
  | 'marketplace'           // Two-sided marketplace (Airbnb, Uber)
  | 'fintech_aum'           // AUM-based fintech
  | 'agency_services'       // Project-based/services
  | 'hardware'              // Hardware + potential subscription
  | 'unknown';

export type PrimaryMetricKey = 'arpu' | 'acv' | 'deal_size' | 'gmv' | 'aum' | 'arpa';
export type Periodicity = 'monthly' | 'annual' | 'per_transaction';

export interface PrimaryMetric {
  key: PrimaryMetricKey;
  label: string;           // "ARPU" or "ACV" or "GMV"
  fullLabel: string;       // "Average Revenue Per User" or "Annual Contract Value"
  periodicity: Periodicity;
  scaleFactor: number;     // Monthly to annual multiplier (12 for ARPU, 1 for ACV)
}

export interface CustomerMetric {
  singular: string;        // "user" or "customer" or "account" or "merchant"
  plural: string;          // "users" or "customers" or "accounts" or "merchants"
  countLabel: string;      // "Monthly Active Users" or "Paying Customers" or "Enterprise Accounts"
  acquisitionVerb: string; // "acquire" or "onboard" or "sign"
}

export interface ScaleTestConfig {
  targetARR: number;       // Usually $100M
  calculationMethod: 'units_x_metric' | 'gmv_x_take_rate' | 'aum_x_fee';
  formulaDisplay: string;  // "Users × ARPU × 12" or "Customers × ACV"
  feasibilityFactors: string[];
}

export interface BenchmarkRange {
  low: number;
  mid: number;
  high: number;
  description?: string;
}

export interface IndustryBenchmarks {
  typicalRange: BenchmarkRange;
  byStage: {
    'pre-seed': BenchmarkRange;
    'seed': BenchmarkRange;
    'series-a': BenchmarkRange;
  };
  comparables: Array<{
    name: string;
    value: number;
    stage?: string;
  }>;
}

export interface MetricFramework {
  type: BusinessModelType;
  typeLabel: string;       // "B2C Subscription" or "Enterprise SaaS"
  
  primaryMetric: PrimaryMetric;
  customerMetric: CustomerMetric;
  scaleTest: ScaleTestConfig;
  benchmarks: IndustryBenchmarks;
  
  // Additional context
  typicalSalesCycle?: string;        // "Self-serve" or "6-12 month enterprise cycle"
  churnExpectation?: string;         // "Monthly churn <5%" or "Annual churn <10%"
  expansionPotential?: string;       // "Net Revenue Retention 100-120%" etc.
}

/**
 * Detect business model type from multiple signals
 */
export function detectBusinessModelType(signals: {
  businessModelText?: string;
  icpDescription?: string;
  pricingText?: string;
  category?: string;
  stage?: string;
  explicitAcv?: number;
}): BusinessModelType {
  const { businessModelText = '', icpDescription = '', pricingText = '', category = '', explicitAcv } = signals;
  const combined = `${businessModelText} ${icpDescription} ${pricingText}`.toLowerCase();
  
  // Direct B2C signals
  const b2cSignals = [
    /\bconsumer\b/i.test(combined),
    /\bb2c\b/i.test(combined),
    /\busers?\b.*\bapp\b/i.test(combined),
    /\bfreemium\b.*\bpremium\b/i.test(combined),
    /\bmobile\s*app\b/i.test(combined),
    /\bsubscription\b.*\$?\d{1,2}(\.\d{2})?\s*\/?\s*month/i.test(combined), // <$100/month
    category.toLowerCase().includes('consumer'),
  ].filter(Boolean).length;
  
  // B2B Enterprise signals
  const enterpriseSignals = [
    /\benterprise\b/i.test(combined),
    /\bciso\b|cto\b|cio\b|vp\s*(of\s*)?(security|engineering|it)/i.test(combined),
    /\bfortune\s*\d{3,4}\b/i.test(combined),
    /\b(soc\s*2|iso\s*27001|fedramp|hipaa)\b/i.test(combined),
    /\b(pilot|poc|proof\s*of\s*concept)\b/i.test(combined),
    explicitAcv && explicitAcv >= 100000,
    /[€$£]1\d{2}k?\+?\s*(acv|contract|deal)/i.test(combined),
  ].filter(Boolean).length;
  
  // Mid-market signals
  const midMarketSignals = [
    /\bmid[\s-]?market\b/i.test(combined),
    /\b(500|1000|5000)\+?\s*employees?\b/i.test(combined),
    explicitAcv && explicitAcv >= 15000 && explicitAcv < 100000,
  ].filter(Boolean).length;
  
  // SMB SaaS signals
  const smbSignals = [
    /\bsmb\b|\bsmall\s*(business|medium)/i.test(combined),
    /\bself[\s-]?serve\b/i.test(combined),
    /\bplg\b|\bproduct[\s-]?led/i.test(combined),
    explicitAcv && explicitAcv >= 1000 && explicitAcv < 15000,
  ].filter(Boolean).length;
  
  // Marketplace signals
  const marketplaceSignals = [
    /\bmarketplace\b/i.test(combined),
    /\btake[\s-]?rate\b/i.test(combined),
    /\bgmv\b/i.test(combined),
    /\btwo[\s-]?sided\b/i.test(combined),
    /\bbuyer\w*\s*and\s*seller/i.test(combined),
  ].filter(Boolean).length;
  
  // Fintech AUM signals
  const aumSignals = [
    /\baum\b|\bassets?\s*under\s*management/i.test(combined),
    /\bwealth\s*management\b/i.test(combined),
    /\brobo[\s-]?advis/i.test(combined),
    /\bbps\b|\bbasis\s*points?\b/i.test(combined),
  ].filter(Boolean).length;
  
  // Determine type based on strongest signals
  if (marketplaceSignals >= 2) return 'marketplace';
  if (aumSignals >= 2) return 'fintech_aum';
  if (enterpriseSignals >= 3) return 'b2b_enterprise';
  if (midMarketSignals >= 2) return 'b2b_mid_market';
  if (smbSignals >= 2) return 'b2b_smb_saas';
  if (b2cSignals >= 3) {
    // Distinguish subscription vs transactional
    if (/\bsubscription\b|\brecurring\b|\bmrr\b/i.test(combined)) return 'b2c_subscription';
    if (/\be[\s-]?commerce\b|\btransaction\b|\bpurchase\b/i.test(combined)) return 'b2c_transactional';
    return 'b2c_subscription'; // Default B2C to subscription
  }
  
  // Fallback based on explicit ACV
  if (explicitAcv) {
    if (explicitAcv >= 100000) return 'b2b_enterprise';
    if (explicitAcv >= 15000) return 'b2b_mid_market';
    if (explicitAcv >= 1000) return 'b2b_smb_saas';
    if (explicitAcv < 500) return 'b2c_subscription';
  }
  
  // Default to SMB SaaS as most common startup model
  return 'b2b_smb_saas';
}

/**
 * Get the complete metric framework for a business model type
 */
export function getMetricFramework(type: BusinessModelType, category?: string): MetricFramework {
  const frameworks: Record<BusinessModelType, MetricFramework> = {
    b2c_subscription: {
      type: 'b2c_subscription',
      typeLabel: 'B2C Subscription',
      primaryMetric: {
        key: 'arpu',
        label: 'ARPU',
        fullLabel: 'Average Revenue Per User',
        periodicity: 'monthly',
        scaleFactor: 12,
      },
      customerMetric: {
        singular: 'user',
        plural: 'users',
        countLabel: 'Monthly Active Users',
        acquisitionVerb: 'acquire',
      },
      scaleTest: {
        targetARR: 100000000,
        calculationMethod: 'units_x_metric',
        formulaDisplay: 'Users × ARPU × 12',
        feasibilityFactors: [
          'TAM must support user count',
          'CAC payback < 12 months typical',
          'Viral/organic growth essential at scale',
        ],
      },
      benchmarks: {
        typicalRange: { low: 5, mid: 12, high: 25, description: 'Monthly ARPU' },
        byStage: {
          'pre-seed': { low: 3, mid: 8, high: 15 },
          'seed': { low: 5, mid: 12, high: 20 },
          'series-a': { low: 8, mid: 15, high: 30 },
        },
        comparables: [
          { name: 'Spotify', value: 5.5 },
          { name: 'Netflix', value: 12 },
          { name: 'Calm', value: 6 },
          { name: 'Strava', value: 5 },
        ],
      },
      typicalSalesCycle: 'Self-serve, instant conversion',
      churnExpectation: 'Monthly churn 3-8%',
      expansionPotential: 'Limited - usually single tier',
    },
    
    b2c_transactional: {
      type: 'b2c_transactional',
      typeLabel: 'B2C Transactional',
      primaryMetric: {
        key: 'arpu',
        label: 'ARPU',
        fullLabel: 'Average Revenue Per User',
        periodicity: 'annual',
        scaleFactor: 1,
      },
      customerMetric: {
        singular: 'customer',
        plural: 'customers',
        countLabel: 'Active Customers',
        acquisitionVerb: 'acquire',
      },
      scaleTest: {
        targetARR: 100000000,
        calculationMethod: 'units_x_metric',
        formulaDisplay: 'Customers × Annual ARPU',
        feasibilityFactors: [
          'High transaction frequency or AOV needed',
          'Strong repeat purchase rate',
          'Brand differentiation critical',
        ],
      },
      benchmarks: {
        typicalRange: { low: 50, mid: 150, high: 500, description: 'Annual ARPU' },
        byStage: {
          'pre-seed': { low: 30, mid: 80, high: 200 },
          'seed': { low: 50, mid: 150, high: 400 },
          'series-a': { low: 100, mid: 250, high: 600 },
        },
        comparables: [
          { name: 'Amazon Prime', value: 139 },
          { name: 'Chewy', value: 400 },
        ],
      },
      typicalSalesCycle: 'Instant purchase',
      churnExpectation: '40-60% annual customer retention',
    },
    
    b2b_smb_saas: {
      type: 'b2b_smb_saas',
      typeLabel: 'SMB SaaS',
      primaryMetric: {
        key: 'acv',
        label: 'ACV',
        fullLabel: 'Annual Contract Value',
        periodicity: 'annual',
        scaleFactor: 1,
      },
      customerMetric: {
        singular: 'customer',
        plural: 'customers',
        countLabel: 'Paying Customers',
        acquisitionVerb: 'acquire',
      },
      scaleTest: {
        targetARR: 100000000,
        calculationMethod: 'units_x_metric',
        formulaDisplay: 'Customers × ACV',
        feasibilityFactors: [
          'Product-led growth typically required',
          'Sales efficiency crucial (CAC/LTV > 3x)',
          'Land & expand motion common',
        ],
      },
      benchmarks: {
        typicalRange: { low: 3000, mid: 8000, high: 15000, description: 'Annual ACV' },
        byStage: {
          'pre-seed': { low: 1000, mid: 3000, high: 6000 },
          'seed': { low: 3000, mid: 8000, high: 12000 },
          'series-a': { low: 5000, mid: 10000, high: 18000 },
        },
        comparables: [
          { name: 'HubSpot Starter', value: 5400 },
          { name: 'Slack SMB', value: 3600 },
          { name: 'Notion Team', value: 960 },
        ],
      },
      typicalSalesCycle: 'Self-serve to 2-4 weeks',
      churnExpectation: 'Monthly churn 2-4%',
      expansionPotential: 'NRR 105-120%',
    },
    
    b2b_mid_market: {
      type: 'b2b_mid_market',
      typeLabel: 'Mid-Market SaaS',
      primaryMetric: {
        key: 'acv',
        label: 'ACV',
        fullLabel: 'Annual Contract Value',
        periodicity: 'annual',
        scaleFactor: 1,
      },
      customerMetric: {
        singular: 'customer',
        plural: 'customers',
        countLabel: 'Accounts',
        acquisitionVerb: 'close',
      },
      scaleTest: {
        targetARR: 100000000,
        calculationMethod: 'units_x_metric',
        formulaDisplay: 'Customers × ACV',
        feasibilityFactors: [
          'Inside sales team usually required',
          'Deal cycles 1-3 months typical',
          'Customer success critical for retention',
        ],
      },
      benchmarks: {
        typicalRange: { low: 25000, mid: 50000, high: 80000, description: 'Annual ACV' },
        byStage: {
          'pre-seed': { low: 15000, mid: 30000, high: 50000 },
          'seed': { low: 25000, mid: 50000, high: 75000 },
          'series-a': { low: 40000, mid: 65000, high: 100000 },
        },
        comparables: [
          { name: 'Datadog', value: 45000 },
          { name: 'Monday.com', value: 36000 },
        ],
      },
      typicalSalesCycle: '1-3 months',
      churnExpectation: 'Annual logo churn 10-15%',
      expansionPotential: 'NRR 110-130%',
    },
    
    b2b_enterprise: {
      type: 'b2b_enterprise',
      typeLabel: 'Enterprise SaaS',
      primaryMetric: {
        key: 'acv',
        label: 'ACV',
        fullLabel: 'Annual Contract Value',
        periodicity: 'annual',
        scaleFactor: 1,
      },
      customerMetric: {
        singular: 'enterprise account',
        plural: 'enterprise accounts',
        countLabel: 'Enterprise Customers',
        acquisitionVerb: 'sign',
      },
      scaleTest: {
        targetARR: 100000000,
        calculationMethod: 'units_x_metric',
        formulaDisplay: 'Enterprise Accounts × ACV',
        feasibilityFactors: [
          'Field sales team typically required',
          'Deal cycles 6-18 months',
          'Procurement/security reviews common',
          '100-1000 customers at scale is achievable',
        ],
      },
      benchmarks: {
        typicalRange: { low: 100000, mid: 250000, high: 500000, description: 'Annual ACV' },
        byStage: {
          'pre-seed': { low: 50000, mid: 100000, high: 200000 },
          'seed': { low: 100000, mid: 200000, high: 400000 },
          'series-a': { low: 150000, mid: 300000, high: 600000 },
        },
        comparables: [
          { name: 'Snowflake', value: 170000 },
          { name: 'CrowdStrike', value: 180000 },
          { name: 'Okta', value: 120000 },
        ],
      },
      typicalSalesCycle: '6-12+ months',
      churnExpectation: 'Annual logo churn 5-10%',
      expansionPotential: 'NRR 120-150%',
    },
    
    marketplace: {
      type: 'marketplace',
      typeLabel: 'Marketplace',
      primaryMetric: {
        key: 'gmv',
        label: 'GMV',
        fullLabel: 'Gross Merchandise Value',
        periodicity: 'annual',
        scaleFactor: 1,
      },
      customerMetric: {
        singular: 'active participant',
        plural: 'active participants',
        countLabel: 'Active Buyers + Sellers',
        acquisitionVerb: 'onboard',
      },
      scaleTest: {
        targetARR: 100000000,
        calculationMethod: 'gmv_x_take_rate',
        formulaDisplay: 'GMV × Take Rate (typically 10-25%)',
        feasibilityFactors: [
          'Chicken-and-egg liquidity challenge',
          'Network effects create defensibility',
          '$400M-$1B GMV needed for $100M revenue',
        ],
      },
      benchmarks: {
        typicalRange: { low: 8, mid: 15, high: 25, description: 'Take rate %' },
        byStage: {
          'pre-seed': { low: 10, mid: 15, high: 20 },
          'seed': { low: 12, mid: 18, high: 25 },
          'series-a': { low: 15, mid: 20, high: 30 },
        },
        comparables: [
          { name: 'Airbnb', value: 15 },
          { name: 'Uber', value: 25 },
          { name: 'Etsy', value: 18 },
        ],
      },
      typicalSalesCycle: 'Self-serve onboarding',
      churnExpectation: 'High churn acceptable with volume',
    },
    
    fintech_aum: {
      type: 'fintech_aum',
      typeLabel: 'AUM-Based Fintech',
      primaryMetric: {
        key: 'aum',
        label: 'AUM',
        fullLabel: 'Assets Under Management',
        periodicity: 'annual',
        scaleFactor: 1,
      },
      customerMetric: {
        singular: 'client',
        plural: 'clients',
        countLabel: 'Clients',
        acquisitionVerb: 'acquire',
      },
      scaleTest: {
        targetARR: 100000000,
        calculationMethod: 'aum_x_fee',
        formulaDisplay: 'AUM × Fee Rate (typically 25-100 bps)',
        feasibilityFactors: [
          '$10B-$40B AUM needed for $100M revenue',
          'Trust and regulatory compliance essential',
          'Sticky once established',
        ],
      },
      benchmarks: {
        typicalRange: { low: 25, mid: 50, high: 100, description: 'Fee in basis points' },
        byStage: {
          'pre-seed': { low: 25, mid: 50, high: 75 },
          'seed': { low: 25, mid: 50, high: 75 },
          'series-a': { low: 25, mid: 50, high: 100 },
        },
        comparables: [
          { name: 'Betterment', value: 25 },
          { name: 'Wealthfront', value: 25 },
        ],
      },
      typicalSalesCycle: 'Self-serve or advisory',
      churnExpectation: 'Very low once assets deposited',
    },
    
    agency_services: {
      type: 'agency_services',
      typeLabel: 'Agency/Services',
      primaryMetric: {
        key: 'deal_size',
        label: 'Avg Deal Size',
        fullLabel: 'Average Project Value',
        periodicity: 'per_transaction',
        scaleFactor: 1,
      },
      customerMetric: {
        singular: 'client',
        plural: 'clients',
        countLabel: 'Active Clients',
        acquisitionVerb: 'win',
      },
      scaleTest: {
        targetARR: 100000000,
        calculationMethod: 'units_x_metric',
        formulaDisplay: 'Projects × Avg Deal Size',
        feasibilityFactors: [
          'Revenue per employee ceiling (~$200-400K)',
          'Hard to scale without productization',
          'VC typically not interested without platform play',
        ],
      },
      benchmarks: {
        typicalRange: { low: 25000, mid: 75000, high: 200000, description: 'Per project' },
        byStage: {
          'pre-seed': { low: 10000, mid: 30000, high: 75000 },
          'seed': { low: 25000, mid: 75000, high: 150000 },
          'series-a': { low: 50000, mid: 100000, high: 250000 },
        },
        comparables: [],
      },
      typicalSalesCycle: '2-6 weeks',
      churnExpectation: 'Project-based, varies widely',
    },
    
    hardware: {
      type: 'hardware',
      typeLabel: 'Hardware + Subscription',
      primaryMetric: {
        key: 'arpa',
        label: 'ARPA',
        fullLabel: 'Average Revenue Per Account',
        periodicity: 'annual',
        scaleFactor: 1,
      },
      customerMetric: {
        singular: 'device',
        plural: 'devices',
        countLabel: 'Deployed Devices',
        acquisitionVerb: 'deploy',
      },
      scaleTest: {
        targetARR: 100000000,
        calculationMethod: 'units_x_metric',
        formulaDisplay: 'Devices × (Hardware Rev + Annual Subscription)',
        feasibilityFactors: [
          'Hardware margin typically 20-40%',
          'Subscription creates recurring revenue',
          'Supply chain complexity',
        ],
      },
      benchmarks: {
        typicalRange: { low: 500, mid: 1500, high: 5000, description: 'Annual per device' },
        byStage: {
          'pre-seed': { low: 200, mid: 500, high: 1000 },
          'seed': { low: 500, mid: 1500, high: 3000 },
          'series-a': { low: 1000, mid: 2500, high: 6000 },
        },
        comparables: [
          { name: 'Ring', value: 100 },
          { name: 'Peloton', value: 480 },
        ],
      },
      typicalSalesCycle: 'Varies by B2C vs B2B',
    },
    
    unknown: {
      type: 'unknown',
      typeLabel: 'Unknown Business Model',
      primaryMetric: {
        key: 'acv',
        label: 'ACV',
        fullLabel: 'Annual Contract Value',
        periodicity: 'annual',
        scaleFactor: 1,
      },
      customerMetric: {
        singular: 'customer',
        plural: 'customers',
        countLabel: 'Customers',
        acquisitionVerb: 'acquire',
      },
      scaleTest: {
        targetARR: 100000000,
        calculationMethod: 'units_x_metric',
        formulaDisplay: 'Customers × ACV',
        feasibilityFactors: ['Business model needs clarification'],
      },
      benchmarks: {
        typicalRange: { low: 5000, mid: 25000, high: 100000 },
        byStage: {
          'pre-seed': { low: 1000, mid: 10000, high: 50000 },
          'seed': { low: 5000, mid: 25000, high: 100000 },
          'series-a': { low: 10000, mid: 50000, high: 200000 },
        },
        comparables: [],
      },
    },
  };
  
  return frameworks[type] || frameworks.unknown;
}

/**
 * Calculate customers/users needed to reach target ARR
 */
export function calculateScaleRequirements(
  framework: MetricFramework,
  primaryMetricValue: number,
  takeRate?: number // For marketplace model
): {
  unitsNeeded: number;
  unitLabel: string;
  formula: string;
  feasibilityAssessment: 'highly_feasible' | 'feasible' | 'challenging' | 'very_challenging';
  context: string;
} {
  const targetARR = framework.scaleTest.targetARR;
  let unitsNeeded: number;
  let formula: string;
  
  if (framework.type === 'marketplace' && takeRate) {
    // GMV needed / typical GMV per participant
    const gmvNeeded = targetARR / (takeRate / 100);
    unitsNeeded = Math.ceil(gmvNeeded / 10000); // Assume $10K GMV per active participant
    formula = `${formatLargeNumber(targetARR)} ÷ ${takeRate}% take rate = ${formatLargeNumber(gmvNeeded)} GMV`;
  } else if (framework.type === 'fintech_aum') {
    // AUM needed based on fee rate (primaryMetricValue is in bps)
    const aumNeeded = targetARR / (primaryMetricValue / 10000);
    unitsNeeded = Math.ceil(aumNeeded / 100000); // Per $100K average account
    formula = `${formatLargeNumber(targetARR)} ÷ ${primaryMetricValue}bps = ${formatLargeNumber(aumNeeded)} AUM`;
  } else {
    // Standard units × metric calculation
    const annualValue = framework.primaryMetric.periodicity === 'monthly' 
      ? primaryMetricValue * 12 
      : primaryMetricValue;
    unitsNeeded = Math.ceil(targetARR / annualValue);
    formula = `${formatLargeNumber(targetARR)} ÷ ${formatCurrency(annualValue)} = ${formatNumber(unitsNeeded)}`;
  }
  
  // Assess feasibility based on business model
  let feasibilityAssessment: 'highly_feasible' | 'feasible' | 'challenging' | 'very_challenging';
  let context: string;
  
  if (framework.type.startsWith('b2c')) {
    if (unitsNeeded > 10000000) {
      feasibilityAssessment = 'very_challenging';
      context = `Requires ${formatNumber(unitsNeeded)} users - extremely large TAM needed`;
    } else if (unitsNeeded > 1000000) {
      feasibilityAssessment = 'challenging';
      context = `Requires ${formatNumber(unitsNeeded)} users - significant but achievable with viral growth`;
    } else {
      feasibilityAssessment = 'feasible';
      context = `Requires ${formatNumber(unitsNeeded)} users - typical for successful B2C at scale`;
    }
  } else if (framework.type === 'b2b_enterprise') {
    if (unitsNeeded > 2000) {
      feasibilityAssessment = 'very_challenging';
      context = `Requires ${formatNumber(unitsNeeded)} enterprise accounts - may need larger ACV`;
    } else if (unitsNeeded > 500) {
      feasibilityAssessment = 'challenging';
      context = `Requires ${formatNumber(unitsNeeded)} enterprise accounts - achievable in large markets`;
    } else {
      feasibilityAssessment = 'highly_feasible';
      context = `Requires ${formatNumber(unitsNeeded)} enterprise accounts - very achievable`;
    }
  } else {
    if (unitsNeeded > 50000) {
      feasibilityAssessment = 'challenging';
      context = `Requires ${formatNumber(unitsNeeded)} ${framework.customerMetric.plural}`;
    } else if (unitsNeeded > 10000) {
      feasibilityAssessment = 'feasible';
      context = `Requires ${formatNumber(unitsNeeded)} ${framework.customerMetric.plural} - typical SMB/mid-market scale`;
    } else {
      feasibilityAssessment = 'highly_feasible';
      context = `Requires only ${formatNumber(unitsNeeded)} ${framework.customerMetric.plural}`;
    }
  }
  
  return {
    unitsNeeded,
    unitLabel: framework.customerMetric.plural,
    formula,
    feasibilityAssessment,
    context,
  };
}

// Helper functions
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toLocaleString();
}

function formatLargeNumber(num: number): string {
  if (num >= 1000000000) return `$${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `$${(num / 1000000).toFixed(0)}M`;
  return `$${num.toLocaleString()}`;
}

function formatCurrency(num: number): string {
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return `$${num.toLocaleString()}`;
}
