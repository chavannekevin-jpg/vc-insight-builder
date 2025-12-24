// =============================================================================
// COMPANY MODEL TYPES
// The structured representation of a company built from user responses
// This model enables relational reasoning across all dimensions
// =============================================================================

// -----------------------------------------------------------------------------
// CALCULATION PROVENANCE - Track how every value was derived
// -----------------------------------------------------------------------------

export interface CalculationTrace {
  sourceField: string;           // Which response field this came from
  rawValue: string | null;       // What the user actually wrote
  extractedValue: number | string | null;  // What we parsed from it
  computedValue?: number | string | null;  // What we calculated (if different)
  method: 'stated' | 'extracted' | 'computed' | 'inferred' | 'default';
  confidence: number;            // 0-1 how confident we are in this value
  notes?: string;                // Any caveats or assumptions
}

// -----------------------------------------------------------------------------
// DISCREPANCY TRACKING - When stated values don't match computed values
// -----------------------------------------------------------------------------

export interface Discrepancy {
  field: string;
  statedValue: string | number | null;
  computedValue: string | number | null;
  discrepancyType: 'inconsistency' | 'implausibility' | 'contradiction' | 'gap';
  severity: 'low' | 'medium' | 'high' | 'critical';
  explanation: string;
  relatedFields: string[];       // Other fields this affects
  questionsToResolve?: string[]; // Follow-up questions for founder
}

// -----------------------------------------------------------------------------
// FINANCIAL MODEL - All money-related metrics
// -----------------------------------------------------------------------------

export interface FinancialModel {
  // Revenue metrics
  revenue: {
    stated: {
      mrr: number | null;
      arr: number | null;
      totalRevenue: number | null;
    };
    computed: {
      mrr: number | null;        // MRR = ARR / 12 or customers * ACV / 12
      arr: number | null;        // ARR = MRR * 12
      impliedFromCustomers: number | null;  // customers * ACV
    };
    traces: Record<string, CalculationTrace>;
  };

  // Pricing & unit economics
  pricing: {
    model: 'subscription' | 'transactional' | 'marketplace' | 'freemium' | 'hybrid' | 'other' | null;
    acv: number | null;          // Average Contract Value
    acvBand: 'micro' | 'smb' | 'mid-market' | 'enterprise' | null;  // <$1K, $1K-$10K, $10K-$100K, >$100K
    pricingMetric: string | null; // per seat, per transaction, etc.
    traces: Record<string, CalculationTrace>;
  };

  unitEconomics: {
    cac: number | null;
    ltv: number | null;
    ltvCacRatio: number | null;
    paybackMonths: number | null;
    grossMargin: number | null;
    computed: {
      impliedLTV: number | null;  // ACV * estimated lifetime
      impliedPayback: number | null;
    };
    traces: Record<string, CalculationTrace>;
  };

  // Burn & runway
  burn: {
    monthlyBurn: number | null;
    runway: number | null;       // in months
    lastRaise: number | null;
    totalRaised: number | null;
    traces: Record<string, CalculationTrace>;
  };
}

// -----------------------------------------------------------------------------
// CUSTOMER MODEL - Who buys and how they behave
// -----------------------------------------------------------------------------

export interface CustomerModel {
  // ICP definition
  icp: {
    segment: 'consumer' | 'smb' | 'mid-market' | 'enterprise' | 'mixed' | null;
    vertical: string | null;
    persona: string | null;      // Job title/role of buyer
    companySize: string | null;  // Employee range or revenue range
    geography: string | null;
  };

  // Customer metrics
  metrics: {
    totalCustomers: number | null;
    activeCustomers: number | null;
    paidCustomers: number | null;
    freeUsers: number | null;
    computed: {
      revenuePerCustomer: number | null;  // Revenue / customers
      conversionRate: number | null;      // Paid / free
    };
    traces: Record<string, CalculationTrace>;
  };

  // Retention & engagement
  retention: {
    churnRate: number | null;    // Monthly or annual
    retentionRate: number | null;
    nrr: number | null;          // Net Revenue Retention
    nps: number | null;
    traces: Record<string, CalculationTrace>;
  };

  // Acquisition
  acquisition: {
    primaryChannel: string | null;
    salesMotion: 'self-serve' | 'inside-sales' | 'field-sales' | 'plg' | 'channel' | 'hybrid' | null;
    salesCycleWeeks: number | null;
    traces: Record<string, CalculationTrace>;
  };
}

// -----------------------------------------------------------------------------
// MARKET MODEL - Size, timing, and dynamics
// -----------------------------------------------------------------------------

export interface MarketModel {
  // Market sizing
  sizing: {
    stated: {
      tam: number | null;
      sam: number | null;
      som: number | null;
    };
    computed: {
      // Bottom-up rebuild: ICP count * ACV
      bottomUpTAM: number | null;
      bottomUpSAM: number | null;
      bottomUpSOM: number | null;
      icpCount: number | null;   // How many potential customers exist
    };
    tamPlausibility: 'credible' | 'optimistic' | 'inflated' | 'unknown';
    traces: Record<string, CalculationTrace>;
  };

  // Market dynamics
  dynamics: {
    growthRate: number | null;   // Market CAGR
    maturity: 'emerging' | 'growth' | 'mature' | 'declining' | null;
    timing: 'early' | 'right-time' | 'late' | null;
    tailwinds: string[];
    headwinds: string[];
    traces: Record<string, CalculationTrace>;
  };

  // Competition
  competition: {
    directCompetitors: string[];
    indirectCompetitors: string[];
    marketConcentration: 'fragmented' | 'consolidating' | 'concentrated' | null;
    incumbentThreat: 'low' | 'medium' | 'high' | null;
    traces: Record<string, CalculationTrace>;
  };
}

// -----------------------------------------------------------------------------
// TRACTION MODEL - Progress and momentum
// -----------------------------------------------------------------------------

export interface TractionModel {
  // Current state
  current: {
    stage: 'idea' | 'prototype' | 'beta' | 'launched' | 'scaling' | null;
    monthsInMarket: number | null;
    keyMetrics: Record<string, number | string>;  // Flexible for different business types
    traces: Record<string, CalculationTrace>;
  };

  // Growth trajectory
  growth: {
    stated: {
      monthlyGrowthRate: number | null;
      quarterlyGrowthRate: number | null;
    };
    computed: {
      impliedMonthlyGrowth: number | null;  // From revenue history
      growthConsistency: 'accelerating' | 'steady' | 'decelerating' | 'volatile' | null;
    };
    traces: Record<string, CalculationTrace>;
  };

  // Milestone evidence
  milestones: {
    achieved: string[];
    upcoming: string[];
    timeline: { milestone: string; targetDate: string; }[];
  };

  // Quality signals
  qualitySignals: {
    logoQuality: 'enterprise' | 'strong' | 'mixed' | 'weak' | null;
    referenceCustomers: string[];
    caseStudies: boolean;
    productMarketFitSignals: string[];
  };
}

// -----------------------------------------------------------------------------
// TEAM MODEL - Who's building this
// -----------------------------------------------------------------------------

export interface TeamModel {
  // Founders
  founders: {
    count: number;
    profiles: {
      name: string | null;
      role: string | null;
      background: string | null;
      relevantExperience: string[];
      equityPercent: number | null;
    }[];
    founderMarketFit: 'strong' | 'moderate' | 'weak' | 'unknown';
    traces: Record<string, CalculationTrace>;
  };

  // Team composition
  team: {
    totalSize: number | null;
    breakdown: {
      engineering: number | null;
      product: number | null;
      sales: number | null;
      marketing: number | null;
      operations: number | null;
      other: number | null;
    };
    keyHires: string[];
    criticalGaps: string[];
    traces: Record<string, CalculationTrace>;
  };

  // Credibility signals
  credibility: {
    previousExits: boolean;
    domainExpertise: boolean;
    technicalDepth: boolean;
    salesCapability: boolean;
    investorConnections: string[];
  };
}

// -----------------------------------------------------------------------------
// DEFENSIBILITY MODEL - What protects the business
// -----------------------------------------------------------------------------

export interface DefensibilityModel {
  // Current moats
  currentMoats: {
    type: ('network-effects' | 'data' | 'technology' | 'brand' | 'switching-costs' | 'regulatory' | 'scale' | 'none')[];
    strength: 'strong' | 'moderate' | 'weak' | 'nascent' | null;
    evidence: string[];
    traces: Record<string, CalculationTrace>;
  };

  // Future defensibility path
  futurePath: {
    potentialMoats: string[];
    timeToMoat: string | null;   // How long until defensible
    dependsOn: string[];         // What needs to happen
  };

  // Risk assessment
  risks: {
    competitorRisk: 'low' | 'medium' | 'high' | null;
    techObsolescenceRisk: 'low' | 'medium' | 'high' | null;
    regulatoryRisk: 'low' | 'medium' | 'high' | null;
    concentrationRisk: 'low' | 'medium' | 'high' | null;
  };
}

// -----------------------------------------------------------------------------
// GO-TO-MARKET MODEL - How they sell
// -----------------------------------------------------------------------------

export interface GTMModel {
  motion: {
    primary: 'self-serve' | 'inside-sales' | 'field-sales' | 'plg' | 'channel' | 'hybrid' | null;
    salesCycle: {
      weeks: number | null;
      complexity: 'simple' | 'moderate' | 'complex' | 'enterprise' | null;
    };
    traces: Record<string, CalculationTrace>;
  };

  channels: {
    primary: string | null;
    secondary: string[];
    channelCac: Record<string, number>;  // CAC by channel
  };

  // GTM-Traction alignment check
  alignment: {
    isAligned: boolean;
    explanation: string | null;
    // e.g., "Claims PLG but has 5 customers after 18 months suggests sales-led is actually required"
  };
}

// -----------------------------------------------------------------------------
// CROSS-SECTIONAL VALIDATION - Does this company make sense as a system?
// -----------------------------------------------------------------------------

export interface CoherenceAnalysis {
  overallCoherence: 'coherent' | 'mostly-coherent' | 'inconsistent' | 'contradictory';
  score: number;  // 0-100
  
  // Specific coherence checks
  checks: {
    // Revenue math checks out
    revenueConsistency: {
      passed: boolean;
      explanation: string;
      severity: 'info' | 'warning' | 'error';
    };
    
    // TAM is plausible given bottom-up rebuild
    tamPlausibility: {
      passed: boolean;
      explanation: string;
      severity: 'info' | 'warning' | 'error';
    };
    
    // GTM motion matches traction evidence
    gtmTractionAlignment: {
      passed: boolean;
      explanation: string;
      severity: 'info' | 'warning' | 'error';
    };
    
    // Team can execute on the plan
    teamExecutionFit: {
      passed: boolean;
      explanation: string;
      severity: 'info' | 'warning' | 'error';
    };
    
    // Burn rate vs runway vs milestones
    runwayMilestoneAlignment: {
      passed: boolean;
      explanation: string;
      severity: 'info' | 'warning' | 'error';
    };
    
    // Growth rate vs stage expectations
    growthStageAlignment: {
      passed: boolean;
      explanation: string;
      severity: 'info' | 'warning' | 'error';
    };
  };

  // Conditional hypotheses about the company
  conditionalHypotheses: {
    hypothesis: string;
    dependsOn: string[];
    probability: 'likely' | 'possible' | 'unlikely';
  }[];

  // Key questions that would change the assessment
  resolutionQuestions: string[];
}

// -----------------------------------------------------------------------------
// TEMPORAL MODEL - How is this company evolving?
// -----------------------------------------------------------------------------

export interface TemporalModel {
  trajectory: {
    direction: 'accelerating' | 'steady' | 'decelerating' | 'pivoting' | 'stalled' | null;
    momentum: 'strong' | 'moderate' | 'weak' | null;
    learningVelocity: 'high' | 'medium' | 'low' | null;
  };

  history: {
    founded: string | null;
    firstRevenue: string | null;
    lastMilestone: string | null;
    pivots: string[];
  };

  projections: {
    next12Months: {
      revenueTarget: number | null;
      customerTarget: number | null;
      keyMilestones: string[];
    };
    feasibility: 'achievable' | 'stretch' | 'aggressive' | 'unrealistic' | null;
  };
}

// -----------------------------------------------------------------------------
// COMPLETE COMPANY MODEL
// -----------------------------------------------------------------------------

export interface CompanyModel {
  // Metadata
  id: string;
  companyId: string;
  companyName: string;
  stage: string;
  category: string | null;
  description: string | null;
  
  // Timestamps
  builtAt: string;
  version: number;
  
  // Sub-models
  financial: FinancialModel;
  customer: CustomerModel;
  market: MarketModel;
  traction: TractionModel;
  team: TeamModel;
  defensibility: DefensibilityModel;
  gtm: GTMModel;
  temporal: TemporalModel;
  
  // Cross-sectional analysis
  coherence: CoherenceAnalysis;
  discrepancies: Discrepancy[];
  holisticStage: HolisticStageAssessment;  // NEW: Holistic stage detection
  
  // Raw source data for transparency
  sourceResponses: Record<string, string>;
}

// -----------------------------------------------------------------------------
// HOLISTIC STAGE DETECTION - Cross-sectional stage assessment
// -----------------------------------------------------------------------------

export interface StageSignal {
  dimension: 'team' | 'traction' | 'revenue' | 'product' | 'defensibility' | 'time-in-market';
  signal: 'Pre-Seed' | 'Seed' | 'Series A';
  strength: number;  // 0-1 confidence weight
  evidence: string;
}

export interface HolisticStageAssessment {
  userStatedStage: string;
  detectedStage: 'Pre-Seed' | 'Seed' | 'Series A';
  confidence: number;  // 0-100
  signals: StageSignal[];
  mismatch: boolean;
  mismatchSeverity: 'none' | 'minor' | 'major';
  mismatchExplanation?: string;
  benchmarkingStage: 'Pre-Seed' | 'Seed' | 'Series A';  // Which stage to use for benchmarking
}

// -----------------------------------------------------------------------------
// BUILD REQUEST/RESPONSE
// -----------------------------------------------------------------------------

export interface BuildCompanyModelRequest {
  companyId: string;
  forceRebuild?: boolean;  // Ignore cached model
}

export interface BuildCompanyModelResponse {
  success: boolean;
  model: CompanyModel | null;
  warnings: string[];
  errors: string[];
}
