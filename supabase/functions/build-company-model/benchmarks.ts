// =============================================================================
// ADAPTIVE BENCHMARK COHORT SYSTEM
// Dynamically selects relevant benchmarks based on company characteristics
// =============================================================================

// -----------------------------------------------------------------------------
// BENCHMARK COHORT DEFINITIONS
// -----------------------------------------------------------------------------

export interface BenchmarkCohort {
  id: string;
  name: string;
  description: string;
  
  // Matching criteria
  criteria: {
    stages?: string[];
    businessModels?: ('subscription' | 'transactional' | 'marketplace' | 'freemium' | 'hybrid')[];
    acvBands?: ('micro' | 'smb' | 'mid-market' | 'enterprise')[];
    salesMotions?: ('self-serve' | 'inside-sales' | 'field-sales' | 'plg' | 'channel' | 'hybrid')[];
    verticals?: string[];
    customerSegments?: ('consumer' | 'smb' | 'mid-market' | 'enterprise')[];
  };
  
  // Benchmark values
  benchmarks: {
    // Growth benchmarks
    growth: {
      exceptional: number;  // Top 10%
      good: number;         // Top 25%
      average: number;      // Median
      concerning: number;   // Bottom 25%
      description: string;
    };
    
    // Unit economics
    ltvCacRatio: {
      exceptional: number;
      good: number;
      minimum: number;
      description: string;
    };
    
    paybackMonths: {
      exceptional: number;
      good: number;
      acceptable: number;
      description: string;
    };
    
    // Retention
    netRevenueRetention: {
      exceptional: number;
      good: number;
      acceptable: number;
      description: string;
    };
    
    grossChurn: {
      exceptional: number;
      good: number;
      concerning: number;
      description: string;
    };
    
    // Sales efficiency
    magicNumber: {
      efficient: number;
      acceptable: number;
      inefficient: number;
      description: string;
    };
    
    // Gross margin
    grossMargin: {
      exceptional: number;
      good: number;
      minimum: number;
      description: string;
    };
    
    // Sales cycle
    salesCycleWeeks: {
      fast: number;
      typical: number;
      long: number;
      description: string;
    };
    
    // CAC benchmarks (contextual)
    cac: {
      low: number;
      typical: number;
      high: number;
      description: string;
    };
    
    // Time to value
    timeToFirstRevenue: {
      fast: string;
      typical: string;
      slow: string;
      description: string;
    };
    
    // Traction expectations by months in market
    tractionExpectations: {
      month3: string;
      month6: string;
      month12: string;
      month18: string;
      description: string;
    };
  };
  
  // Stage-specific scoring adjustments
  scoringAdjustments: {
    maxTractionScore: number;
    maxBusinessModelScore: number;
    maxSolutionScore: number;
    maxTeamScore: number;
    maxMarketScore: number;
  };
  
  // Comparable companies for context
  comparables: string[];
}

// -----------------------------------------------------------------------------
// COHORT DEFINITIONS
// -----------------------------------------------------------------------------

export const BENCHMARK_COHORTS: BenchmarkCohort[] = [
  // ==========================================================================
  // PLG / SELF-SERVE COHORTS
  // ==========================================================================
  {
    id: 'plg-micro-preseed',
    name: 'PLG Micro-ACV Pre-Seed',
    description: 'Product-led growth startups with <$1K ACV at pre-seed stage',
    criteria: {
      stages: ['Pre-Seed', 'Idea'],
      businessModels: ['subscription', 'freemium'],
      acvBands: ['micro'],
      salesMotions: ['self-serve', 'plg'],
    },
    benchmarks: {
      growth: {
        exceptional: 25,  // 25% MoM
        good: 15,
        average: 10,
        concerning: 5,
        description: 'Monthly growth rate for PLG at pre-seed. High velocity expected due to low friction.'
      },
      ltvCacRatio: {
        exceptional: 5,
        good: 3,
        minimum: 2,
        description: 'PLG should have very low CAC, so higher ratios expected even with low ACV.'
      },
      paybackMonths: {
        exceptional: 3,
        good: 6,
        acceptable: 12,
        description: 'Fast payback critical for low-ACV PLG to work economically.'
      },
      netRevenueRetention: {
        exceptional: 120,
        good: 105,
        acceptable: 95,
        description: 'NRR harder at micro-ACV; expansion limited but churn should be low.'
      },
      grossChurn: {
        exceptional: 2,
        good: 4,
        concerning: 7,
        description: 'Monthly gross churn. Low-touch products should retain well.'
      },
      magicNumber: {
        efficient: 1.0,
        acceptable: 0.7,
        inefficient: 0.5,
        description: 'S&M efficiency. PLG should be highly efficient.'
      },
      grossMargin: {
        exceptional: 85,
        good: 75,
        minimum: 65,
        description: 'Software margins expected for PLG SaaS.'
      },
      salesCycleWeeks: {
        fast: 0.5,
        typical: 1,
        long: 2,
        description: 'Self-serve should convert in days, not weeks.'
      },
      cac: {
        low: 50,
        typical: 150,
        high: 300,
        description: 'CAC for micro-ACV PLG. Should be <$300 to work economically.'
      },
      timeToFirstRevenue: {
        fast: '< 3 months from launch',
        typical: '3-6 months',
        slow: '> 6 months',
        description: 'PLG should monetize quickly once product is live.'
      },
      tractionExpectations: {
        month3: '100+ signups, 10+ paying',
        month6: '500+ signups, 50+ paying, $1-5K MRR',
        month12: '2,000+ signups, 200+ paying, $10-25K MRR',
        month18: '5,000+ signups, 500+ paying, $25-50K MRR',
        description: 'Expected traction milestones for PLG micro-ACV.'
      }
    },
    scoringAdjustments: {
      maxTractionScore: 35,
      maxBusinessModelScore: 45,
      maxSolutionScore: 55,
      maxTeamScore: 70,
      maxMarketScore: 65
    },
    comparables: ['Notion (early)', 'Calendly (early)', 'Loom (early)', 'Figma (early)']
  },
  
  {
    id: 'plg-smb-seed',
    name: 'PLG SMB Seed',
    description: 'Product-led growth startups with $1K-$10K ACV at seed stage',
    criteria: {
      stages: ['Seed'],
      businessModels: ['subscription', 'freemium'],
      acvBands: ['smb'],
      salesMotions: ['self-serve', 'plg', 'hybrid'],
    },
    benchmarks: {
      growth: {
        exceptional: 20,
        good: 15,
        average: 10,
        concerning: 5,
        description: 'Monthly growth for PLG SMB at seed. T2D3 trajectory = ~15% MoM.'
      },
      ltvCacRatio: {
        exceptional: 5,
        good: 3,
        minimum: 2.5,
        description: 'Higher ACV allows for some sales touch while maintaining efficiency.'
      },
      paybackMonths: {
        exceptional: 6,
        good: 12,
        acceptable: 18,
        description: 'SMB ACV allows slightly longer payback than micro.'
      },
      netRevenueRetention: {
        exceptional: 130,
        good: 115,
        acceptable: 100,
        description: 'SMB expansion possible through seat/usage growth.'
      },
      grossChurn: {
        exceptional: 2,
        good: 3,
        concerning: 5,
        description: 'Monthly gross churn. SMB has higher churn than enterprise.'
      },
      magicNumber: {
        efficient: 1.0,
        acceptable: 0.75,
        inefficient: 0.5,
        description: 'Efficiency important even with sales-assist.'
      },
      grossMargin: {
        exceptional: 85,
        good: 75,
        minimum: 65,
        description: 'Software margins expected.'
      },
      salesCycleWeeks: {
        fast: 1,
        typical: 2,
        long: 4,
        description: 'Quick cycles with possible sales assist.'
      },
      cac: {
        low: 500,
        typical: 1500,
        high: 3000,
        description: 'Blended CAC for PLG with some sales assist.'
      },
      timeToFirstRevenue: {
        fast: '< 6 months from launch',
        typical: '6-9 months',
        slow: '> 12 months',
        description: 'Should have meaningful revenue by seed.'
      },
      tractionExpectations: {
        month3: '50+ active users, initial paying customers',
        month6: '100+ paying, $5-15K MRR',
        month12: '300+ paying, $25-75K MRR',
        month18: '500+ paying, $75-150K MRR',
        description: 'Seed stage PLG SMB expectations.'
      }
    },
    scoringAdjustments: {
      maxTractionScore: 55,
      maxBusinessModelScore: 65,
      maxSolutionScore: 70,
      maxTeamScore: 75,
      maxMarketScore: 70
    },
    comparables: ['Airtable (seed)', 'Linear (seed)', 'Notion (seed)', 'Zapier (early)']
  },

  // ==========================================================================
  // INSIDE SALES / MID-MARKET COHORTS
  // ==========================================================================
  {
    id: 'inside-sales-midmarket-seed',
    name: 'Inside Sales Mid-Market Seed',
    description: 'Inside sales motion with $10K-$100K ACV at seed stage',
    criteria: {
      stages: ['Seed'],
      businessModels: ['subscription'],
      acvBands: ['mid-market'],
      salesMotions: ['inside-sales', 'hybrid'],
      customerSegments: ['mid-market'],
    },
    benchmarks: {
      growth: {
        exceptional: 15,
        good: 10,
        average: 7,
        concerning: 3,
        description: 'Monthly growth for inside sales. Slower than PLG but larger deals.'
      },
      ltvCacRatio: {
        exceptional: 5,
        good: 3,
        minimum: 2,
        description: 'Higher CAC acceptable with higher ACV.'
      },
      paybackMonths: {
        exceptional: 12,
        good: 18,
        acceptable: 24,
        description: 'Longer payback acceptable with higher ACV and retention.'
      },
      netRevenueRetention: {
        exceptional: 140,
        good: 120,
        acceptable: 105,
        description: 'Mid-market should have strong expansion potential.'
      },
      grossChurn: {
        exceptional: 0.5,
        good: 1,
        concerning: 2,
        description: 'Monthly gross churn. Mid-market more stable than SMB.'
      },
      magicNumber: {
        efficient: 0.8,
        acceptable: 0.6,
        inefficient: 0.4,
        description: 'Sales efficiency. Higher tolerance for CAC with bigger deals.'
      },
      grossMargin: {
        exceptional: 80,
        good: 70,
        minimum: 60,
        description: 'May have some implementation/services component.'
      },
      salesCycleWeeks: {
        fast: 4,
        typical: 8,
        long: 12,
        description: 'Multi-stakeholder deals take time.'
      },
      cac: {
        low: 5000,
        typical: 15000,
        high: 30000,
        description: 'CAC for inside sales mid-market.'
      },
      timeToFirstRevenue: {
        fast: '< 6 months from starting sales',
        typical: '6-12 months',
        slow: '> 12 months',
        description: 'Longer sales cycles mean slower initial revenue.'
      },
      tractionExpectations: {
        month3: '5-10 qualified opportunities',
        month6: '3-5 closed deals, $50-100K ARR',
        month12: '10-20 customers, $200-500K ARR',
        month18: '20-40 customers, $500K-1M ARR',
        description: 'Mid-market seed expectations.'
      }
    },
    scoringAdjustments: {
      maxTractionScore: 50,
      maxBusinessModelScore: 60,
      maxSolutionScore: 65,
      maxTeamScore: 75,
      maxMarketScore: 70
    },
    comparables: ['Gong (early)', 'Lattice (early)', 'Rippling (seed)', 'Brex (early)']
  },

  // ==========================================================================
  // ENTERPRISE SALES COHORTS
  // ==========================================================================
  {
    id: 'enterprise-sales-seed',
    name: 'Enterprise Sales Seed',
    description: 'Field sales motion with >$100K ACV at seed stage',
    criteria: {
      stages: ['Seed'],
      businessModels: ['subscription'],
      acvBands: ['enterprise'],
      salesMotions: ['field-sales'],
      customerSegments: ['enterprise'],
    },
    benchmarks: {
      growth: {
        exceptional: 10,
        good: 7,
        average: 5,
        concerning: 2,
        description: 'Monthly growth for enterprise. Fewer, larger deals.'
      },
      ltvCacRatio: {
        exceptional: 5,
        good: 3,
        minimum: 2,
        description: 'High CAC offset by very high ACV and retention.'
      },
      paybackMonths: {
        exceptional: 18,
        good: 24,
        acceptable: 36,
        description: 'Enterprise allows longer payback with multi-year contracts.'
      },
      netRevenueRetention: {
        exceptional: 150,
        good: 130,
        acceptable: 115,
        description: 'Enterprise expansion should be substantial.'
      },
      grossChurn: {
        exceptional: 0.3,
        good: 0.5,
        concerning: 1,
        description: 'Monthly gross churn. Enterprise should be sticky.'
      },
      magicNumber: {
        efficient: 0.7,
        acceptable: 0.5,
        inefficient: 0.3,
        description: 'Enterprise sales is expensive. Accept lower efficiency.'
      },
      grossMargin: {
        exceptional: 75,
        good: 65,
        minimum: 55,
        description: 'Often includes professional services.'
      },
      salesCycleWeeks: {
        fast: 12,
        typical: 24,
        long: 52,
        description: 'Enterprise deals take 3-12 months.'
      },
      cac: {
        low: 30000,
        typical: 75000,
        high: 150000,
        description: 'Enterprise CAC. Must be offset by high ACV/LTV.'
      },
      timeToFirstRevenue: {
        fast: '< 9 months',
        typical: '9-15 months',
        slow: '> 18 months',
        description: 'Long sales cycles mean patient capital required.'
      },
      tractionExpectations: {
        month3: '3-5 enterprise pilots/POCs',
        month6: '1-2 signed contracts, $100-300K ARR',
        month12: '3-5 enterprise customers, $300-700K ARR',
        month18: '5-10 customers, $700K-1.5M ARR',
        description: 'Enterprise seed traction. Quality over quantity.'
      }
    },
    scoringAdjustments: {
      maxTractionScore: 45,
      maxBusinessModelScore: 55,
      maxSolutionScore: 60,
      maxTeamScore: 80,
      maxMarketScore: 70
    },
    comparables: ['Snowflake (early)', 'Databricks (early)', 'Figma Enterprise', 'Notion Enterprise']
  },

  // ==========================================================================
  // MARKETPLACE COHORTS
  // ==========================================================================
  {
    id: 'marketplace-seed',
    name: 'Marketplace Seed',
    description: 'Two-sided marketplace at seed stage',
    criteria: {
      stages: ['Seed', 'Pre-Seed'],
      businessModels: ['marketplace', 'transactional'],
    },
    benchmarks: {
      growth: {
        exceptional: 30,
        good: 20,
        average: 12,
        concerning: 5,
        description: 'GMV growth for marketplaces. Must show network effects.'
      },
      ltvCacRatio: {
        exceptional: 4,
        good: 2.5,
        minimum: 1.5,
        description: 'Marketplace economics different. Supply-side CAC often high.'
      },
      paybackMonths: {
        exceptional: 6,
        good: 12,
        acceptable: 18,
        description: 'Need to recover CAC quickly given competitive dynamics.'
      },
      netRevenueRetention: {
        exceptional: 130,
        good: 110,
        acceptable: 95,
        description: 'Repeat purchase rate and wallet share expansion.'
      },
      grossChurn: {
        exceptional: 3,
        good: 5,
        concerning: 10,
        description: 'Monthly supply/demand churn. High due to low switching costs.'
      },
      magicNumber: {
        efficient: 0.8,
        acceptable: 0.5,
        inefficient: 0.3,
        description: 'Marketing efficiency. Often negative unit economics early.'
      },
      grossMargin: {
        exceptional: 70,
        good: 50,
        minimum: 30,
        description: 'Take rate minus fulfillment/support costs.'
      },
      salesCycleWeeks: {
        fast: 0.5,
        typical: 1,
        long: 2,
        description: 'Transaction velocity matters more than sales cycles.'
      },
      cac: {
        low: 30,
        typical: 100,
        high: 300,
        description: 'Blended demand-side CAC. Supply CAC often higher.'
      },
      timeToFirstRevenue: {
        fast: '< 3 months post-launch',
        typical: '3-6 months',
        slow: '> 9 months',
        description: 'Marketplaces should transact quickly once live.'
      },
      tractionExpectations: {
        month3: 'Supply-demand liquidity in one geography/vertical',
        month6: '$50-200K GMV/month, 15-25% take rate',
        month12: '$200-500K GMV/month, early repeat behavior',
        month18: '$500K-1M GMV/month, clear network effects',
        description: 'Marketplace traction. GMV and liquidity matter most.'
      }
    },
    scoringAdjustments: {
      maxTractionScore: 50,
      maxBusinessModelScore: 55,
      maxSolutionScore: 60,
      maxTeamScore: 75,
      maxMarketScore: 70
    },
    comparables: ['Airbnb (early)', 'DoorDash (early)', 'Instacart (early)', 'Faire (early)']
  },

  // ==========================================================================
  // PRE-SEED GENERAL (FALLBACK)
  // ==========================================================================
  {
    id: 'preseed-general',
    name: 'Pre-Seed General',
    description: 'General pre-seed benchmarks when specific cohort not matched',
    criteria: {
      stages: ['Pre-Seed', 'Idea'],
    },
    benchmarks: {
      growth: {
        exceptional: 20,
        good: 10,
        average: 5,
        concerning: 0,
        description: 'Early growth expectations. Any traction is signal.'
      },
      ltvCacRatio: {
        exceptional: 4,
        good: 2,
        minimum: 1,
        description: 'Unit economics often unknown at pre-seed.'
      },
      paybackMonths: {
        exceptional: 6,
        good: 12,
        acceptable: 24,
        description: 'Payback should be reasonable hypothesis.'
      },
      netRevenueRetention: {
        exceptional: 120,
        good: 100,
        acceptable: 80,
        description: 'NRR often unknown; retention matters.'
      },
      grossChurn: {
        exceptional: 3,
        good: 5,
        concerning: 10,
        description: 'Early churn acceptable while finding PMF.'
      },
      magicNumber: {
        efficient: 0.7,
        acceptable: 0.4,
        inefficient: 0.2,
        description: 'Sales efficiency. Often not relevant at pre-seed.'
      },
      grossMargin: {
        exceptional: 80,
        good: 60,
        minimum: 40,
        description: 'Depends heavily on business model.'
      },
      salesCycleWeeks: {
        fast: 1,
        typical: 4,
        long: 12,
        description: 'Varies by model. Shorter is generally better.'
      },
      cac: {
        low: 100,
        typical: 500,
        high: 2000,
        description: 'CAC varies wildly. Should be proportional to LTV.'
      },
      timeToFirstRevenue: {
        fast: '< 3 months',
        typical: '3-9 months',
        slow: '> 12 months',
        description: 'Pre-seed may be pre-revenue. Speed to revenue is signal.'
      },
      tractionExpectations: {
        month3: 'Waitlist, LOIs, or early beta users',
        month6: 'First paying customers or strong engagement',
        month12: '$5-25K MRR or equivalent engagement metrics',
        month18: '$25-75K MRR, early PMF signals',
        description: 'General pre-seed expectations.'
      }
    },
    scoringAdjustments: {
      maxTractionScore: 30,
      maxBusinessModelScore: 40,
      maxSolutionScore: 50,
      maxTeamScore: 70,
      maxMarketScore: 65
    },
    comparables: ['Generic early-stage comparisons based on vertical']
  },

  // ==========================================================================
  // SEED GENERAL (FALLBACK)
  // ==========================================================================
  {
    id: 'seed-general',
    name: 'Seed General',
    description: 'General seed benchmarks when specific cohort not matched',
    criteria: {
      stages: ['Seed'],
    },
    benchmarks: {
      growth: {
        exceptional: 15,
        good: 10,
        average: 7,
        concerning: 3,
        description: 'Monthly growth expectations at seed.'
      },
      ltvCacRatio: {
        exceptional: 4,
        good: 3,
        minimum: 2,
        description: 'Should have early unit economics data.'
      },
      paybackMonths: {
        exceptional: 12,
        good: 18,
        acceptable: 24,
        description: 'Payback should be trackable.'
      },
      netRevenueRetention: {
        exceptional: 130,
        good: 110,
        acceptable: 95,
        description: 'NRR becoming important signal at seed.'
      },
      grossChurn: {
        exceptional: 2,
        good: 4,
        concerning: 7,
        description: 'Churn should be stabilizing as PMF emerges.'
      },
      magicNumber: {
        efficient: 0.8,
        acceptable: 0.6,
        inefficient: 0.4,
        description: 'Sales efficiency expectations at seed.'
      },
      grossMargin: {
        exceptional: 80,
        good: 70,
        minimum: 55,
        description: 'Margins should be heading toward target.'
      },
      salesCycleWeeks: {
        fast: 2,
        typical: 6,
        long: 16,
        description: 'Sales cycle should be understood.'
      },
      cac: {
        low: 500,
        typical: 2000,
        high: 10000,
        description: 'CAC varies by model. Must justify with LTV.'
      },
      timeToFirstRevenue: {
        fast: 'Already generating',
        typical: '< 6 months post-seed',
        slow: '> 12 months',
        description: 'Most seed companies should have some revenue.'
      },
      tractionExpectations: {
        month3: 'Consistent growth, refining ICP',
        month6: '$50-150K ARR, early PMF signals',
        month12: '$150-500K ARR, repeatable sales motion',
        month18: '$500K-1M ARR, Series A ready',
        description: 'General seed stage expectations.'
      }
    },
    scoringAdjustments: {
      maxTractionScore: 55,
      maxBusinessModelScore: 65,
      maxSolutionScore: 70,
      maxTeamScore: 75,
      maxMarketScore: 70
    },
    comparables: ['Stage-appropriate comparisons based on vertical and model']
  }
];

// -----------------------------------------------------------------------------
// COHORT SELECTION LOGIC
// -----------------------------------------------------------------------------

export interface CohortMatch {
  cohort: BenchmarkCohort;
  matchScore: number;
  matchedCriteria: string[];
  unmatchedCriteria: string[];
}

export function selectBenchmarkCohort(
  stage: string,
  businessModel: string | null,
  acvBand: string | null,
  salesMotion: string | null,
  customerSegment: string | null,
  vertical: string | null
): CohortMatch {
  let bestMatch: CohortMatch | null = null;
  let highestScore = -1;

  for (const cohort of BENCHMARK_COHORTS) {
    const { matchScore, matchedCriteria, unmatchedCriteria } = calculateCohortMatch(
      cohort,
      stage,
      businessModel,
      acvBand,
      salesMotion,
      customerSegment,
      vertical
    );

    if (matchScore > highestScore) {
      highestScore = matchScore;
      bestMatch = { cohort, matchScore, matchedCriteria, unmatchedCriteria };
    }
  }

  // Fallback to general cohorts if no good match
  if (!bestMatch || highestScore < 2) {
    const fallbackCohort = stage === 'Seed' 
      ? BENCHMARK_COHORTS.find(c => c.id === 'seed-general')!
      : BENCHMARK_COHORTS.find(c => c.id === 'preseed-general')!;
    
    return {
      cohort: fallbackCohort,
      matchScore: 1,
      matchedCriteria: ['stage (fallback)'],
      unmatchedCriteria: ['No specific cohort matched']
    };
  }

  return bestMatch;
}

function calculateCohortMatch(
  cohort: BenchmarkCohort,
  stage: string,
  businessModel: string | null,
  acvBand: string | null,
  salesMotion: string | null,
  customerSegment: string | null,
  vertical: string | null
): { matchScore: number; matchedCriteria: string[]; unmatchedCriteria: string[] } {
  let score = 0;
  const matched: string[] = [];
  const unmatched: string[] = [];

  // Stage match (required, weighted heavily)
  if (cohort.criteria.stages) {
    if (cohort.criteria.stages.includes(stage)) {
      score += 3;
      matched.push(`stage: ${stage}`);
    } else {
      return { matchScore: -1, matchedCriteria: [], unmatchedCriteria: ['stage mismatch'] };
    }
  }

  // Business model match
  if (cohort.criteria.businessModels && businessModel) {
    if (cohort.criteria.businessModels.includes(businessModel as any)) {
      score += 2;
      matched.push(`businessModel: ${businessModel}`);
    } else {
      unmatched.push(`businessModel: ${businessModel} not in ${cohort.criteria.businessModels.join(',')}`);
    }
  }

  // ACV band match
  if (cohort.criteria.acvBands && acvBand) {
    if (cohort.criteria.acvBands.includes(acvBand as any)) {
      score += 2;
      matched.push(`acvBand: ${acvBand}`);
    } else {
      unmatched.push(`acvBand: ${acvBand} not in ${cohort.criteria.acvBands.join(',')}`);
    }
  }

  // Sales motion match
  if (cohort.criteria.salesMotions && salesMotion) {
    if (cohort.criteria.salesMotions.includes(salesMotion as any)) {
      score += 2;
      matched.push(`salesMotion: ${salesMotion}`);
    } else {
      unmatched.push(`salesMotion: ${salesMotion} not in ${cohort.criteria.salesMotions.join(',')}`);
    }
  }

  // Customer segment match
  if (cohort.criteria.customerSegments && customerSegment) {
    if (cohort.criteria.customerSegments.includes(customerSegment as any)) {
      score += 1;
      matched.push(`customerSegment: ${customerSegment}`);
    } else {
      unmatched.push(`customerSegment: ${customerSegment} not in ${cohort.criteria.customerSegments.join(',')}`);
    }
  }

  return { matchScore: score, matchedCriteria: matched, unmatchedCriteria: unmatched };
}

// -----------------------------------------------------------------------------
// BENCHMARK CONTEXT FORMATTER
// -----------------------------------------------------------------------------

export function formatBenchmarkContext(cohortMatch: CohortMatch): string {
  const { cohort, matchScore, matchedCriteria } = cohortMatch;
  const b = cohort.benchmarks;

  return `
=== ADAPTIVE BENCHMARK COHORT: ${cohort.name} ===
Match Quality: ${matchScore >= 7 ? 'Excellent' : matchScore >= 5 ? 'Good' : matchScore >= 3 ? 'Partial' : 'Fallback'}
Matched On: ${matchedCriteria.join(', ')}
Comparable Companies: ${cohort.comparables.join(', ')}

--- GROWTH BENCHMARKS ---
- Exceptional (Top 10%): ${b.growth.exceptional}% MoM
- Good (Top 25%): ${b.growth.good}% MoM
- Average (Median): ${b.growth.average}% MoM
- Concerning (Bottom 25%): <${b.growth.concerning}% MoM
Context: ${b.growth.description}

--- UNIT ECONOMICS BENCHMARKS ---
LTV:CAC Ratio:
- Exceptional: >${b.ltvCacRatio.exceptional}x
- Good: >${b.ltvCacRatio.good}x
- Minimum acceptable: ${b.ltvCacRatio.minimum}x
Context: ${b.ltvCacRatio.description}

CAC Payback:
- Exceptional: <${b.paybackMonths.exceptional} months
- Good: <${b.paybackMonths.good} months
- Acceptable: <${b.paybackMonths.acceptable} months
Context: ${b.paybackMonths.description}

CAC Range:
- Low: <$${b.cac.low}
- Typical: $${b.cac.typical}
- High: >$${b.cac.high}
Context: ${b.cac.description}

--- RETENTION BENCHMARKS ---
Net Revenue Retention:
- Exceptional: >${b.netRevenueRetention.exceptional}%
- Good: >${b.netRevenueRetention.good}%
- Acceptable: >${b.netRevenueRetention.acceptable}%
Context: ${b.netRevenueRetention.description}

Gross Monthly Churn:
- Exceptional: <${b.grossChurn.exceptional}%
- Good: <${b.grossChurn.good}%
- Concerning: >${b.grossChurn.concerning}%
Context: ${b.grossChurn.description}

--- EFFICIENCY BENCHMARKS ---
Magic Number (Sales Efficiency):
- Efficient: >${b.magicNumber.efficient}
- Acceptable: >${b.magicNumber.acceptable}
- Inefficient: <${b.magicNumber.inefficient}
Context: ${b.magicNumber.description}

Gross Margin:
- Exceptional: >${b.grossMargin.exceptional}%
- Good: >${b.grossMargin.good}%
- Minimum: >${b.grossMargin.minimum}%
Context: ${b.grossMargin.description}

--- SALES CYCLE BENCHMARKS ---
- Fast: <${b.salesCycleWeeks.fast} weeks
- Typical: ${b.salesCycleWeeks.typical} weeks
- Long: >${b.salesCycleWeeks.long} weeks
Context: ${b.salesCycleWeeks.description}

--- TRACTION EXPECTATIONS ---
Month 3: ${b.tractionExpectations.month3}
Month 6: ${b.tractionExpectations.month6}
Month 12: ${b.tractionExpectations.month12}
Month 18: ${b.tractionExpectations.month18}
Context: ${b.tractionExpectations.description}

--- SCORING ADJUSTMENTS FOR THIS COHORT ---
- Max Traction Score: ${cohort.scoringAdjustments.maxTractionScore}
- Max Business Model Score: ${cohort.scoringAdjustments.maxBusinessModelScore}
- Max Solution Score: ${cohort.scoringAdjustments.maxSolutionScore}
- Max Team Score: ${cohort.scoringAdjustments.maxTeamScore}
- Max Market Score: ${cohort.scoringAdjustments.maxMarketScore}

=== END BENCHMARK COHORT ===`;
}
