// =============================================================================
// COMPANY MODEL BUILDER
// Constructs the complete CompanyModel from user responses
// =============================================================================

import {
  CompanyModel,
  FinancialModel,
  CustomerModel,
  MarketModel,
  TractionModel,
  TeamModel,
  DefensibilityModel,
  GTMModel,
  TemporalModel,
  CoherenceAnalysis,
  Discrepancy,
  CalculationTrace,
  StageSignal,
  HolisticStageAssessment
} from './types.ts';

import {
  extractNumber,
  extractPercentage,
  extractMonths,
  extractBusinessModelType,
  extractCustomerSegment,
  extractSalesMotion,
  getACVBand,
  extractCompetitors,
  extractFounders,
  extractList,
  createTrace,
  createDiscrepancy,
  hasSignificantVariance
} from './extractors.ts';

// -----------------------------------------------------------------------------
// MAIN BUILDER
// -----------------------------------------------------------------------------

export function buildCompanyModel(
  companyId: string,
  companyName: string,
  stage: string,
  category: string | null,
  description: string | null,
  responses: Record<string, string>
): CompanyModel {
  const discrepancies: Discrepancy[] = [];

  // Build each sub-model
  const financial = buildFinancialModel(responses, discrepancies);
  const customer = buildCustomerModel(responses, discrepancies);
  const market = buildMarketModel(responses, customer, discrepancies);
  const traction = buildTractionModel(responses, financial, customer, discrepancies);
  const team = buildTeamModel(responses, discrepancies);
  const defensibility = buildDefensibilityModel(responses, discrepancies);
  const gtm = buildGTMModel(responses, customer, traction, discrepancies);
  const temporal = buildTemporalModel(responses, traction, discrepancies);

  // Run holistic stage detection BEFORE coherence (so we can add stage discrepancy)
  const holisticStage = detectHolisticStage(
    stage, financial, customer, traction, team, defensibility, discrepancies
  );

  // Run coherence analysis across all sub-models
  const coherence = analyzeCoherence(
    financial, customer, market, traction, team, gtm, temporal, discrepancies
  );

  return {
    id: crypto.randomUUID(),
    companyId,
    companyName,
    stage,
    category,
    description,
    builtAt: new Date().toISOString(),
    version: 1,
    financial,
    customer,
    market,
    traction,
    team,
    defensibility,
    gtm,
    temporal,
    coherence,
    discrepancies,
    holisticStage,
    sourceResponses: responses
  };
}

// -----------------------------------------------------------------------------
// FINANCIAL MODEL BUILDER
// -----------------------------------------------------------------------------

function buildFinancialModel(
  responses: Record<string, string>,
  discrepancies: Discrepancy[]
): FinancialModel {
  const tractionText = responses['traction_proof'] || '';
  const businessText = responses['business_model'] || '';
  
  // Extract stated values
  const mrrExtract = extractNumber(tractionText.match(/mrr[:\s]*([\$\d,kmb]+)/i)?.[0]);
  const arrExtract = extractNumber(tractionText.match(/arr[:\s]*([\$\d,kmb]+)/i)?.[0]);
  const revenueExtract = extractNumber(tractionText.match(/revenue[:\s]*([\$\d,kmb]+)/i)?.[0]);
  const customerCountExtract = extractNumber(tractionText.match(/(\d+)\s*(?:customers?|clients?|users?)/i)?.[0]);
  
  // Extract ACV from business model
  const acvExtract = extractNumber(businessText.match(/acv[:\s]*([\$\d,kmb]+)/i)?.[0] || businessText.match(/\$([\d,]+)\s*(?:per|\/)\s*(?:year|annual|contract)/i)?.[0]);
  
  // Compute derived values
  let computedMRR: number | null = null;
  let computedARR: number | null = null;
  let impliedFromCustomers: number | null = null;

  if (arrExtract.value && !mrrExtract.value) {
    computedMRR = arrExtract.value / 12;
  } else if (mrrExtract.value && !arrExtract.value) {
    computedARR = mrrExtract.value * 12;
  }

  // Compute revenue from customers * ACV
  if (customerCountExtract.value && acvExtract.value) {
    impliedFromCustomers = customerCountExtract.value * acvExtract.value;
  }

  // Check for revenue discrepancy
  const statedRevenue = arrExtract.value || (mrrExtract.value ? mrrExtract.value * 12 : null);
  if (statedRevenue && impliedFromCustomers && hasSignificantVariance(statedRevenue, impliedFromCustomers)) {
    discrepancies.push(createDiscrepancy(
      'revenue',
      statedRevenue,
      impliedFromCustomers,
      'inconsistency',
      statedRevenue > impliedFromCustomers * 2 ? 'high' : 'medium',
      `Stated revenue ($${statedRevenue.toLocaleString()}) differs significantly from computed (${customerCountExtract.value} customers × $${acvExtract.value} ACV = $${impliedFromCustomers.toLocaleString()}). This could indicate: variable pricing, upsells, one-time revenue, or inaccurate customer count.`,
      ['customer_count', 'acv', 'revenue'],
      ['Can you break down your revenue by customer?', 'Do you have variable pricing tiers?']
    ));
  }

  // Extract pricing model
  const businessModelType = extractBusinessModelType(businessText);
  
  // Extract unit economics
  const cacExtract = extractNumber(businessText.match(/cac[:\s]*([\$\d,kmb]+)/i)?.[0]);
  const ltvExtract = extractNumber(businessText.match(/ltv[:\s]*([\$\d,kmb]+)/i)?.[0]);
  const grossMarginExtract = extractPercentage(businessText.match(/(?:gross\s*)?margin[:\s]*([\d.]+%?)/i)?.[0]);

  // Compute LTV/CAC
  let ltvCacRatio: number | null = null;
  if (ltvExtract.value && cacExtract.value && cacExtract.value > 0) {
    ltvCacRatio = ltvExtract.value / cacExtract.value;
  }

  // Compute payback
  let paybackMonths: number | null = null;
  if (cacExtract.value && mrrExtract.value && grossMarginExtract.value) {
    const grossMarginDecimal = grossMarginExtract.value / 100;
    paybackMonths = cacExtract.value / (mrrExtract.value * grossMarginDecimal);
  }

  // Build traces
  const revenueTraces: Record<string, CalculationTrace> = {
    mrr: createTrace('traction_proof', tractionText, mrrExtract.value, mrrExtract.value ? 'extracted' : 'default', mrrExtract.confidence),
    arr: createTrace('traction_proof', tractionText, arrExtract.value, arrExtract.value ? 'extracted' : 'default', arrExtract.confidence),
  };

  const pricingTraces: Record<string, CalculationTrace> = {
    model: createTrace('business_model', businessText, businessModelType.model, businessModelType.model ? 'extracted' : 'inferred', businessModelType.confidence),
    acv: createTrace('business_model', businessText, acvExtract.value, acvExtract.value ? 'extracted' : 'default', acvExtract.confidence),
  };

  const unitEconomicsTraces: Record<string, CalculationTrace> = {
    cac: createTrace('business_model', businessText, cacExtract.value, cacExtract.value ? 'extracted' : 'default', cacExtract.confidence),
    ltv: createTrace('business_model', businessText, ltvExtract.value, ltvExtract.value ? 'extracted' : 'default', ltvExtract.confidence),
    ltvCacRatio: createTrace('computed', null, null, 'computed', ltvCacRatio ? 0.9 : 0, ltvCacRatio, 'LTV / CAC'),
  };

  return {
    revenue: {
      stated: {
        mrr: mrrExtract.value,
        arr: arrExtract.value,
        totalRevenue: revenueExtract.value,
      },
      computed: {
        mrr: computedMRR,
        arr: computedARR,
        impliedFromCustomers,
      },
      traces: revenueTraces,
    },
    pricing: {
      model: businessModelType.model,
      acv: acvExtract.value,
      acvBand: getACVBand(acvExtract.value),
      pricingMetric: null, // Would need more sophisticated extraction
      traces: pricingTraces,
    },
    unitEconomics: {
      cac: cacExtract.value,
      ltv: ltvExtract.value,
      ltvCacRatio,
      paybackMonths,
      grossMargin: grossMarginExtract.value,
      computed: {
        impliedLTV: acvExtract.value ? acvExtract.value * 3 : null, // Default 3-year lifetime
        impliedPayback: paybackMonths,
      },
      traces: unitEconomicsTraces,
    },
    burn: {
      monthlyBurn: null,
      runway: null,
      lastRaise: null,
      totalRaised: null,
      traces: {},
    },
  };
}

// -----------------------------------------------------------------------------
// CUSTOMER MODEL BUILDER
// -----------------------------------------------------------------------------

function buildCustomerModel(
  responses: Record<string, string>,
  discrepancies: Discrepancy[]
): CustomerModel {
  const targetText = responses['target_customer'] || '';
  const tractionText = responses['traction_proof'] || '';
  const businessText = responses['business_model'] || '';

  // Extract customer segment
  const segmentExtract = extractCustomerSegment(targetText);
  
  // Extract customer counts
  const totalCustomersExtract = extractNumber(tractionText.match(/(\d+)\s*(?:total\s+)?(?:customers?|clients?)/i)?.[0]);
  const paidCustomersExtract = extractNumber(tractionText.match(/(\d+)\s*(?:paid|paying)\s*(?:customers?|clients?)/i)?.[0]);
  const activeUsersExtract = extractNumber(tractionText.match(/(\d+)\s*(?:active\s+)?users?/i)?.[0]);
  const freeUsersExtract = extractNumber(tractionText.match(/(\d+)\s*(?:free\s+)?users?/i)?.[0]);

  // Use total customers or paid customers
  const customerCount = totalCustomersExtract.value || paidCustomersExtract.value;

  // Extract churn
  const churnExtract = extractPercentage(tractionText.match(/churn[:\s]*([\d.]+%?)/i)?.[0]);
  const retentionExtract = extractPercentage(tractionText.match(/retention[:\s]*([\d.]+%?)/i)?.[0]);
  const nrrExtract = extractPercentage(tractionText.match(/(?:net\s+revenue\s+)?retention[:\s]*([\d.]+%?)/i)?.[0]);

  // Compute conversion rate if we have both free and paid
  let conversionRate: number | null = null;
  if (freeUsersExtract.value && paidCustomersExtract.value) {
    conversionRate = (paidCustomersExtract.value / freeUsersExtract.value) * 100;
  }

  // Extract sales motion
  const salesMotionExtract = extractSalesMotion(businessText);

  // Extract sales cycle
  const salesCycleExtract = extractMonths(businessText.match(/(?:sales\s+)?cycle[:\s]*([\d.]+ (?:weeks?|months?|days?))/i)?.[0]);

  // Build customer metrics traces
  const metricsTraces: Record<string, CalculationTrace> = {
    totalCustomers: createTrace('traction_proof', tractionText, totalCustomersExtract.value, 'extracted', totalCustomersExtract.confidence),
    paidCustomers: createTrace('traction_proof', tractionText, paidCustomersExtract.value, 'extracted', paidCustomersExtract.confidence),
    activeUsers: createTrace('traction_proof', tractionText, activeUsersExtract.value, 'extracted', activeUsersExtract.confidence),
  };

  const retentionTraces: Record<string, CalculationTrace> = {
    churn: createTrace('traction_proof', tractionText, churnExtract.value, 'extracted', churnExtract.confidence),
    retention: createTrace('traction_proof', tractionText, retentionExtract.value, 'extracted', retentionExtract.confidence),
    nrr: createTrace('traction_proof', tractionText, nrrExtract.value, 'extracted', nrrExtract.confidence),
  };

  const acquisitionTraces: Record<string, CalculationTrace> = {
    salesMotion: createTrace('business_model', businessText, salesMotionExtract.motion, 'extracted', salesMotionExtract.confidence),
    salesCycle: createTrace('business_model', businessText, salesCycleExtract.value, 'extracted', salesCycleExtract.confidence),
  };

  return {
    icp: {
      segment: segmentExtract.segment,
      vertical: null, // Would need more sophisticated extraction
      persona: null,
      companySize: null,
      geography: null,
    },
    metrics: {
      totalCustomers: customerCount,
      activeCustomers: activeUsersExtract.value,
      paidCustomers: paidCustomersExtract.value,
      freeUsers: freeUsersExtract.value,
      computed: {
        revenuePerCustomer: null, // Computed later with financial data
        conversionRate,
      },
      traces: metricsTraces,
    },
    retention: {
      churnRate: churnExtract.value,
      retentionRate: retentionExtract.value || (churnExtract.value ? 100 - churnExtract.value : null),
      nrr: nrrExtract.value,
      nps: null,
      traces: retentionTraces,
    },
    acquisition: {
      primaryChannel: null,
      salesMotion: salesMotionExtract.motion,
      salesCycleWeeks: salesCycleExtract.value ? salesCycleExtract.value * 4 : null,
      traces: acquisitionTraces,
    },
  };
}

// -----------------------------------------------------------------------------
// MARKET MODEL BUILDER
// -----------------------------------------------------------------------------

function buildMarketModel(
  responses: Record<string, string>,
  customer: CustomerModel,
  discrepancies: Discrepancy[]
): MarketModel {
  const targetText = responses['target_customer'] || '';
  const problemText = responses['problem_core'] || '';
  const competitionText = responses['competitive_moat'] || '';

  // Extract stated TAM/SAM/SOM
  const tamExtract = extractNumber(targetText.match(/tam[:\s]*([\$\d,kmb]+)/i)?.[0] || targetText.match(/(\$[\d,]+\s*(?:billion|million|b|m))\s*(?:market|tam|total)/i)?.[0]);
  const samExtract = extractNumber(targetText.match(/sam[:\s]*([\$\d,kmb]+)/i)?.[0]);
  const somExtract = extractNumber(targetText.match(/som[:\s]*([\$\d,kmb]+)/i)?.[0]);

  // Extract ICP count for bottom-up calculation
  const icpCountExtract = extractNumber(targetText.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:million|m|k|thousand)?\s*(?:potential\s+)?(?:companies|businesses|customers)/i)?.[0]);

  // Compute bottom-up TAM
  let bottomUpTAM: number | null = null;
  let bottomUpSAM: number | null = null;
  let bottomUpSOM: number | null = null;
  
  // This is a simplified computation - real implementation would be more sophisticated
  // TAM = ICP count * ACV (if we had ACV from financial model, we'd use it)
  if (icpCountExtract.value) {
    // Assume average ACV if not known - this creates a sanity check
    bottomUpTAM = icpCountExtract.value * 10000; // $10K average ACV assumption
    bottomUpSAM = bottomUpTAM * 0.3; // 30% serviceable assumption
    bottomUpSOM = bottomUpSAM * 0.1; // 10% obtainable in 5 years assumption
  }

  // Check TAM plausibility
  let tamPlausibility: 'credible' | 'optimistic' | 'inflated' | 'unknown' = 'unknown';
  if (tamExtract.value && bottomUpTAM) {
    const ratio = tamExtract.value / bottomUpTAM;
    if (ratio < 2) {
      tamPlausibility = 'credible';
    } else if (ratio < 5) {
      tamPlausibility = 'optimistic';
    } else {
      tamPlausibility = 'inflated';
      discrepancies.push(createDiscrepancy(
        'tam',
        tamExtract.value,
        bottomUpTAM,
        'implausibility',
        'high',
        `Stated TAM ($${(tamExtract.value / 1e9).toFixed(1)}B) appears ${ratio.toFixed(0)}x larger than bottom-up estimate. This is common but VCs will challenge it. Bottom-up: ~${icpCountExtract.value?.toLocaleString()} potential customers × estimated ACV.`,
        ['target_customer', 'business_model'],
        ['How did you calculate your TAM?', 'What percentage of this market is actually addressable by your solution?']
      ));
    }
  }

  // Extract competitors
  const competitors = extractCompetitors(competitionText);

  // Build traces
  const sizingTraces: Record<string, CalculationTrace> = {
    tam: createTrace('target_customer', targetText, tamExtract.value, 'extracted', tamExtract.confidence),
    sam: createTrace('target_customer', targetText, samExtract.value, 'extracted', samExtract.confidence),
    som: createTrace('target_customer', targetText, somExtract.value, 'extracted', somExtract.confidence),
    icpCount: createTrace('target_customer', targetText, icpCountExtract.value, 'extracted', icpCountExtract.confidence),
    bottomUpTAM: createTrace('computed', null, null, 'computed', bottomUpTAM ? 0.6 : 0, bottomUpTAM, 'ICP count × estimated ACV'),
  };

  const dynamicsTraces: Record<string, CalculationTrace> = {};
  const competitionTraces: Record<string, CalculationTrace> = {
    competitors: createTrace('competitive_moat', competitionText, competitors.direct.join(', '), 'extracted', 0.7),
  };

  return {
    sizing: {
      stated: {
        tam: tamExtract.value,
        sam: samExtract.value,
        som: somExtract.value,
      },
      computed: {
        bottomUpTAM,
        bottomUpSAM,
        bottomUpSOM,
        icpCount: icpCountExtract.value,
      },
      tamPlausibility,
      traces: sizingTraces,
    },
    dynamics: {
      growthRate: null,
      maturity: null,
      timing: null,
      tailwinds: [],
      headwinds: [],
      traces: dynamicsTraces,
    },
    competition: {
      directCompetitors: competitors.direct,
      indirectCompetitors: competitors.indirect,
      marketConcentration: null,
      incumbentThreat: competitors.direct.length > 5 ? 'high' : competitors.direct.length > 2 ? 'medium' : 'low',
      traces: competitionTraces,
    },
  };
}

// -----------------------------------------------------------------------------
// TRACTION MODEL BUILDER
// -----------------------------------------------------------------------------

function buildTractionModel(
  responses: Record<string, string>,
  financial: FinancialModel,
  customer: CustomerModel,
  discrepancies: Discrepancy[]
): TractionModel {
  const tractionText = responses['traction_proof'] || '';
  const visionText = responses['vision_ask'] || '';

  // Extract growth rates
  const monthlyGrowthExtract = extractPercentage(tractionText.match(/(\d+(?:\.\d+)?)\s*%?\s*(?:monthly|mom|m\/m)\s*growth/i)?.[0]);
  const quarterlyGrowthExtract = extractPercentage(tractionText.match(/(\d+(?:\.\d+)?)\s*%?\s*(?:quarterly|qoq|q\/q)\s*growth/i)?.[0]);

  // Determine stage
  let stage: 'idea' | 'prototype' | 'beta' | 'launched' | 'scaling' | null = null;
  const stagePatterns: [RegExp, 'idea' | 'prototype' | 'beta' | 'launched' | 'scaling'][] = [
    [/scaling|growth stage|series [abc]/i, 'scaling'],
    [/launched|live|production|paying customers/i, 'launched'],
    [/beta|pilot|testing|early access/i, 'beta'],
    [/prototype|mvp|demo/i, 'prototype'],
    [/idea|concept|planning/i, 'idea'],
  ];
  
  for (const [pattern, s] of stagePatterns) {
    if (pattern.test(tractionText)) {
      stage = s;
      break;
    }
  }

  // Extract milestones
  const achievedMilestones = extractList(tractionText.match(/(?:achieved|completed|reached)[:\s]+([\s\S]*?)(?:\.|$)/i)?.[1] || '');
  const upcomingMilestones = extractList(visionText);

  // Determine logo quality (simplified)
  let logoQuality: 'enterprise' | 'strong' | 'mixed' | 'weak' | null = null;
  if (/fortune 500|f500|google|microsoft|amazon|meta|apple/i.test(tractionText)) {
    logoQuality = 'enterprise';
  } else if (/funded startup|known brand|industry leader/i.test(tractionText)) {
    logoQuality = 'strong';
  } else if (customer.metrics.totalCustomers && customer.metrics.totalCustomers > 0) {
    logoQuality = 'mixed';
  }

  // Build traces
  const currentTraces: Record<string, CalculationTrace> = {
    stage: createTrace('traction_proof', tractionText, stage, 'inferred', 0.7),
  };

  const growthTraces: Record<string, CalculationTrace> = {
    monthlyGrowth: createTrace('traction_proof', tractionText, monthlyGrowthExtract.value, 'extracted', monthlyGrowthExtract.confidence),
    quarterlyGrowth: createTrace('traction_proof', tractionText, quarterlyGrowthExtract.value, 'extracted', quarterlyGrowthExtract.confidence),
  };

  return {
    current: {
      stage,
      monthsInMarket: null,
      keyMetrics: {
        customers: customer.metrics.totalCustomers || 0,
        mrr: financial.revenue.stated.mrr || financial.revenue.computed.mrr || 0,
      },
      traces: currentTraces,
    },
    growth: {
      stated: {
        monthlyGrowthRate: monthlyGrowthExtract.value,
        quarterlyGrowthRate: quarterlyGrowthExtract.value,
      },
      computed: {
        impliedMonthlyGrowth: null,
        growthConsistency: null,
      },
      traces: growthTraces,
    },
    milestones: {
      achieved: achievedMilestones,
      upcoming: upcomingMilestones,
      timeline: [],
    },
    qualitySignals: {
      logoQuality,
      referenceCustomers: [],
      caseStudies: /case study|success story/i.test(tractionText),
      productMarketFitSignals: [],
    },
  };
}

// -----------------------------------------------------------------------------
// TEAM MODEL BUILDER
// -----------------------------------------------------------------------------

function buildTeamModel(
  responses: Record<string, string>,
  discrepancies: Discrepancy[]
): TeamModel {
  const teamText = responses['team_story'] || '';

  // Extract founders
  const founders = extractFounders(teamText);
  
  // Extract team size
  const teamSizeExtract = extractNumber(teamText.match(/(\d+)\s*(?:team members?|employees?|people)/i)?.[0]);

  // Check for previous exits
  const hasPreviousExits = /exit|sold|acquired|ipo/i.test(teamText);
  
  // Check for domain expertise
  const hasDomainExpertise = /years? (?:of )?experience|worked at|former|expert in|specialist/i.test(teamText);
  
  // Check for technical depth
  const hasTechnicalDepth = /engineer|developer|phd|technical|built|architect/i.test(teamText);
  
  // Assess founder-market fit
  let founderMarketFit: 'strong' | 'moderate' | 'weak' | 'unknown' = 'unknown';
  if (hasPreviousExits && hasDomainExpertise) {
    founderMarketFit = 'strong';
  } else if (hasDomainExpertise || hasTechnicalDepth) {
    founderMarketFit = 'moderate';
  } else if (teamText.length > 100) {
    founderMarketFit = 'weak';
  }

  // Extract key hires needed
  const criticalGaps = extractList(teamText.match(/(?:need|hiring|looking for|critical hire)[:\s]+([\s\S]*?)(?:\.|$)/i)?.[1] || '');

  // Build traces
  const foundersTraces: Record<string, CalculationTrace> = {
    count: createTrace('team_story', teamText, founders.length, 'extracted', founders.length > 0 ? 0.8 : 0.3),
    founderMarketFit: createTrace('team_story', teamText, founderMarketFit, 'inferred', 0.6),
  };

  const teamTraces: Record<string, CalculationTrace> = {
    totalSize: createTrace('team_story', teamText, teamSizeExtract.value, 'extracted', teamSizeExtract.confidence),
  };

  return {
    founders: {
      count: founders.length || 1, // Assume at least 1 founder
      profiles: founders.map(f => ({
        name: f.name,
        role: f.role,
        background: f.background,
        relevantExperience: [],
        equityPercent: f.equityPercent,
      })),
      founderMarketFit,
      traces: foundersTraces,
    },
    team: {
      totalSize: teamSizeExtract.value,
      breakdown: {
        engineering: null,
        product: null,
        sales: null,
        marketing: null,
        operations: null,
        other: null,
      },
      keyHires: [],
      criticalGaps,
      traces: teamTraces,
    },
    credibility: {
      previousExits: hasPreviousExits,
      domainExpertise: hasDomainExpertise,
      technicalDepth: hasTechnicalDepth,
      salesCapability: /sales|bd|business development|revenue/i.test(teamText),
      investorConnections: [],
    },
  };
}

// -----------------------------------------------------------------------------
// DEFENSIBILITY MODEL BUILDER
// -----------------------------------------------------------------------------

function buildDefensibilityModel(
  responses: Record<string, string>,
  discrepancies: Discrepancy[]
): DefensibilityModel {
  const competitionText = responses['competitive_moat'] || '';
  const solutionText = responses['solution_core'] || '';

  // Identify moat types
  const moatTypes: DefensibilityModel['currentMoats']['type'] = [];
  
  if (/network effect|viral|user.generated|community/i.test(competitionText + solutionText)) {
    moatTypes.push('network-effects');
  }
  if (/data|ml|machine learning|ai|proprietary data|training data/i.test(competitionText + solutionText)) {
    moatTypes.push('data');
  }
  if (/patent|proprietary|unique tech|breakthrough|novel/i.test(competitionText + solutionText)) {
    moatTypes.push('technology');
  }
  if (/brand|trusted|reputation|recognized/i.test(competitionText + solutionText)) {
    moatTypes.push('brand');
  }
  if (/switching cost|integration|embedded|sticky|lock.in/i.test(competitionText + solutionText)) {
    moatTypes.push('switching-costs');
  }
  if (/regulatory|compliance|licensed|certified|approved/i.test(competitionText + solutionText)) {
    moatTypes.push('regulatory');
  }
  if (/scale|economies|cost advantage|volume/i.test(competitionText + solutionText)) {
    moatTypes.push('scale');
  }
  
  if (moatTypes.length === 0) {
    moatTypes.push('none');
  }

  // Assess moat strength
  let moatStrength: 'strong' | 'moderate' | 'weak' | 'nascent' | null = null;
  if (moatTypes.includes('none')) {
    moatStrength = 'weak';
  } else if (moatTypes.length >= 2) {
    moatStrength = 'strong';
  } else if (moatTypes.length === 1) {
    moatStrength = 'moderate';
  }

  // Build traces
  const moatTraces: Record<string, CalculationTrace> = {
    types: createTrace('competitive_moat', competitionText, moatTypes.join(', '), 'extracted', 0.7),
    strength: createTrace('competitive_moat', competitionText, moatStrength, 'inferred', 0.6),
  };

  return {
    currentMoats: {
      type: moatTypes,
      strength: moatStrength,
      evidence: extractList(competitionText.match(/(?:advantage|moat|defensible)[:\s]+([\s\S]*?)(?:\.|$)/i)?.[1] || ''),
      traces: moatTraces,
    },
    futurePath: {
      potentialMoats: [],
      timeToMoat: null,
      dependsOn: [],
    },
    risks: {
      competitorRisk: null,
      techObsolescenceRisk: null,
      regulatoryRisk: null,
      concentrationRisk: null,
    },
  };
}

// -----------------------------------------------------------------------------
// GTM MODEL BUILDER
// -----------------------------------------------------------------------------

function buildGTMModel(
  responses: Record<string, string>,
  customer: CustomerModel,
  traction: TractionModel,
  discrepancies: Discrepancy[]
): GTMModel {
  const businessText = responses['business_model'] || '';
  
  // Use customer model's sales motion
  const salesMotion = customer.acquisition.salesMotion;
  const salesCycleWeeks = customer.acquisition.salesCycleWeeks;
  
  // Determine sales complexity from segment
  let salesComplexity: 'simple' | 'moderate' | 'complex' | 'enterprise' | null = null;
  if (customer.icp.segment === 'enterprise') {
    salesComplexity = 'enterprise';
  } else if (customer.icp.segment === 'mid-market') {
    salesComplexity = 'complex';
  } else if (customer.icp.segment === 'smb') {
    salesComplexity = 'moderate';
  } else if (customer.icp.segment === 'consumer') {
    salesComplexity = 'simple';
  }

  // Check GTM-Traction alignment
  let isAligned = true;
  let alignmentExplanation: string | null = null;
  
  // PLG motion but low customer count after extended period
  if (salesMotion === 'plg' && traction.current.monthsInMarket && traction.current.monthsInMarket > 12) {
    const customers = customer.metrics.totalCustomers || 0;
    if (customers < 100) {
      isAligned = false;
      alignmentExplanation = `Claims PLG motion but has only ${customers} customers after ${traction.current.monthsInMarket} months. PLG typically requires rapid user acquisition. Consider if sales-led approach is actually needed.`;
      discrepancies.push(createDiscrepancy(
        'gtm_motion',
        salesMotion,
        'sales-led (implied)',
        'contradiction',
        'medium',
        alignmentExplanation,
        ['traction_proof', 'business_model'],
        ['Is your current growth primarily from inbound/self-serve or outbound sales?', 'What is your main source of new customers?']
      ));
    }
  }
  
  // Enterprise segment but no sales team
  if (customer.icp.segment === 'enterprise' && salesMotion === 'self-serve') {
    isAligned = false;
    alignmentExplanation = 'Targeting enterprise customers but relying on self-serve motion. Enterprise deals typically require dedicated sales.';
    discrepancies.push(createDiscrepancy(
      'gtm_motion',
      salesMotion,
      'field-sales (required for enterprise)',
      'inconsistency',
      'high',
      alignmentExplanation,
      ['target_customer', 'business_model']
    ));
  }

  // Build traces
  const motionTraces: Record<string, CalculationTrace> = {
    primary: createTrace('business_model', businessText, salesMotion, 'extracted', 0.7),
    salesCycle: createTrace('business_model', businessText, salesCycleWeeks, 'extracted', 0.6),
  };

  return {
    motion: {
      primary: salesMotion,
      salesCycle: {
        weeks: salesCycleWeeks,
        complexity: salesComplexity,
      },
      traces: motionTraces,
    },
    channels: {
      primary: null,
      secondary: [],
      channelCac: {},
    },
    alignment: {
      isAligned,
      explanation: alignmentExplanation,
    },
  };
}

// -----------------------------------------------------------------------------
// TEMPORAL MODEL BUILDER
// -----------------------------------------------------------------------------

function buildTemporalModel(
  responses: Record<string, string>,
  traction: TractionModel,
  discrepancies: Discrepancy[]
): TemporalModel {
  const visionText = responses['vision_ask'] || '';
  const tractionText = responses['traction_proof'] || '';

  // Extract 12-month targets
  const revenueTargetExtract = extractNumber(visionText.match(/\$?([\d,]+(?:\.\d+)?)\s*(?:k|m|million|arr|revenue)/i)?.[0]);
  const customerTargetExtract = extractNumber(visionText.match(/([\d,]+)\s*customers?/i)?.[0]);

  // Determine trajectory
  let direction: 'accelerating' | 'steady' | 'decelerating' | 'pivoting' | 'stalled' | null = null;
  let momentum: 'strong' | 'moderate' | 'weak' | null = null;
  
  if (traction.growth.stated.monthlyGrowthRate) {
    if (traction.growth.stated.monthlyGrowthRate > 20) {
      direction = 'accelerating';
      momentum = 'strong';
    } else if (traction.growth.stated.monthlyGrowthRate > 10) {
      direction = 'steady';
      momentum = 'moderate';
    } else if (traction.growth.stated.monthlyGrowthRate > 0) {
      direction = 'steady';
      momentum = 'weak';
    } else {
      direction = 'stalled';
      momentum = 'weak';
    }
  }

  // Check feasibility of projections
  let feasibility: 'achievable' | 'stretch' | 'aggressive' | 'unrealistic' | null = null;
  if (revenueTargetExtract.value && traction.current.keyMetrics.mrr) {
    const currentARR = (traction.current.keyMetrics.mrr as number) * 12;
    const targetARR = revenueTargetExtract.value;
    const requiredGrowth = targetARR / currentARR;
    
    if (requiredGrowth < 2) {
      feasibility = 'achievable';
    } else if (requiredGrowth < 3) {
      feasibility = 'stretch';
    } else if (requiredGrowth < 5) {
      feasibility = 'aggressive';
    } else {
      feasibility = 'unrealistic';
      discrepancies.push(createDiscrepancy(
        'projections',
        targetARR,
        currentARR,
        'implausibility',
        'medium',
        `12-month target requires ${requiredGrowth.toFixed(1)}x growth. At current MRR, this means ~${Math.round((Math.pow(requiredGrowth, 1/12) - 1) * 100)}% monthly growth, which is exceptionally aggressive.`,
        ['vision_ask', 'traction_proof'],
        ['What specific drivers will achieve this growth rate?', 'What is your current month-over-month growth?']
      ));
    }
  }

  return {
    trajectory: {
      direction,
      momentum,
      learningVelocity: null,
    },
    history: {
      founded: null,
      firstRevenue: null,
      lastMilestone: null,
      pivots: [],
    },
    projections: {
      next12Months: {
        revenueTarget: revenueTargetExtract.value,
        customerTarget: customerTargetExtract.value,
        keyMilestones: traction.milestones.upcoming.slice(0, 5),
      },
      feasibility,
    },
  };
}

// -----------------------------------------------------------------------------
// COHERENCE ANALYSIS
// -----------------------------------------------------------------------------

function analyzeCoherence(
  financial: FinancialModel,
  customer: CustomerModel,
  market: MarketModel,
  traction: TractionModel,
  team: TeamModel,
  gtm: GTMModel,
  temporal: TemporalModel,
  discrepancies: Discrepancy[]
): CoherenceAnalysis {
  const checks: CoherenceAnalysis['checks'] = {
    revenueConsistency: {
      passed: true,
      explanation: 'Revenue figures are internally consistent.',
      severity: 'info',
    },
    tamPlausibility: {
      passed: market.sizing.tamPlausibility !== 'inflated',
      explanation: market.sizing.tamPlausibility === 'inflated' 
        ? 'Stated TAM appears significantly inflated compared to bottom-up calculation.'
        : 'TAM figures appear reasonable or could not be verified.',
      severity: market.sizing.tamPlausibility === 'inflated' ? 'warning' : 'info',
    },
    gtmTractionAlignment: {
      passed: gtm.alignment.isAligned,
      explanation: gtm.alignment.explanation || 'GTM motion aligns with observed traction.',
      severity: gtm.alignment.isAligned ? 'info' : 'warning',
    },
    teamExecutionFit: {
      passed: team.founders.founderMarketFit !== 'weak',
      explanation: team.founders.founderMarketFit === 'weak'
        ? 'Team background shows limited relevant experience for this problem space.'
        : 'Team appears to have relevant experience.',
      severity: team.founders.founderMarketFit === 'weak' ? 'warning' : 'info',
    },
    runwayMilestoneAlignment: {
      passed: true, // Would need burn data to check properly
      explanation: 'Could not verify runway against milestone timeline.',
      severity: 'info',
    },
    growthStageAlignment: {
      passed: true,
      explanation: 'Growth metrics appear consistent with stated stage.',
      severity: 'info',
    },
  };

  // Check revenue consistency
  if (financial.revenue.stated.arr && financial.revenue.computed.impliedFromCustomers) {
    const variance = Math.abs(financial.revenue.stated.arr - financial.revenue.computed.impliedFromCustomers) / financial.revenue.stated.arr;
    if (variance > 0.3) {
      checks.revenueConsistency = {
        passed: false,
        explanation: `Stated revenue differs from computed (customers × ACV) by ${Math.round(variance * 100)}%.`,
        severity: 'warning',
      };
    }
  }

  // Count failures
  const failedChecks = Object.values(checks).filter(c => !c.passed).length;
  const criticalDiscrepancies = discrepancies.filter(d => d.severity === 'critical' || d.severity === 'high').length;

  let overallCoherence: CoherenceAnalysis['overallCoherence'];
  let score: number;

  if (criticalDiscrepancies > 0 || failedChecks > 3) {
    overallCoherence = 'contradictory';
    score = 30 - (criticalDiscrepancies * 10) - (failedChecks * 5);
  } else if (failedChecks > 1) {
    overallCoherence = 'inconsistent';
    score = 60 - (failedChecks * 10);
  } else if (failedChecks === 1) {
    overallCoherence = 'mostly-coherent';
    score = 75;
  } else {
    overallCoherence = 'coherent';
    score = 90;
  }

  // Generate conditional hypotheses
  const conditionalHypotheses: CoherenceAnalysis['conditionalHypotheses'] = [];
  
  if (traction.current.stage === 'beta' || traction.current.stage === 'launched') {
    conditionalHypotheses.push({
      hypothesis: 'Product-market fit is achievable',
      dependsOn: ['Customer retention above 80%', 'Organic referrals emerging', 'Repeatable sales process'],
      probability: traction.qualitySignals.logoQuality === 'enterprise' ? 'likely' : 'possible',
    });
  }

  if (team.founders.founderMarketFit === 'weak') {
    conditionalHypotheses.push({
      hypothesis: 'Team can execute on vision',
      dependsOn: ['Key domain hire made', 'Advisor with relevant exits', 'Demonstrated rapid learning'],
      probability: 'unlikely',
    });
  }

  // Generate resolution questions
  const resolutionQuestions = discrepancies
    .flatMap(d => d.questionsToResolve || [])
    .filter((q, i, arr) => arr.indexOf(q) === i) // dedupe
    .slice(0, 5);

  return {
    overallCoherence,
    score: Math.max(0, Math.min(100, score)),
    checks,
    conditionalHypotheses,
    resolutionQuestions,
  };
}

// -----------------------------------------------------------------------------
// HOLISTIC STAGE DETECTION
// Synthesizes signals from ALL sub-models to determine true VC stage
// -----------------------------------------------------------------------------

function detectHolisticStage(
  userStage: string,
  financial: FinancialModel,
  customer: CustomerModel,
  traction: TractionModel,
  team: TeamModel,
  defensibility: DefensibilityModel,
  discrepancies: Discrepancy[]
): HolisticStageAssessment {
  const signals: StageSignal[] = [];
  
  // Normalize user stage for comparison
  const normalizedUserStage = userStage.toLowerCase().replace(/[-_\s]/g, '');
  
  // === TEAM SIGNALS ===
  const hasCoFounder = team.founders.count >= 2;
  const hasTechnicalDepth = team.credibility.technicalDepth;
  const hasSalesCapability = team.credibility.salesCapability;
  const hasPreviousExits = team.credibility.previousExits;
  
  // Solo non-technical founder = strong Pre-Seed signal
  if (!hasTechnicalDepth && !hasCoFounder) {
    signals.push({
      dimension: 'team',
      signal: 'Pre-Seed',
      strength: 0.8,
      evidence: 'Solo non-technical founder (no CTO or technical co-founder)'
    });
  } else if (!hasTechnicalDepth && hasCoFounder) {
    signals.push({
      dimension: 'team',
      signal: 'Pre-Seed',
      strength: 0.6,
      evidence: 'No technical co-founder on the team'
    });
  } else if (hasTechnicalDepth && hasSalesCapability && hasCoFounder) {
    signals.push({
      dimension: 'team',
      signal: 'Seed',
      strength: 0.7,
      evidence: 'Balanced founding team with technical and sales capability'
    });
  }
  
  // Previous exits suggest more maturity
  if (hasPreviousExits) {
    signals.push({
      dimension: 'team',
      signal: 'Seed',
      strength: 0.5,
      evidence: 'Founder(s) with previous exit experience'
    });
  }
  
  // Critical gaps = Pre-Seed signal
  if (team.team.criticalGaps.length > 0) {
    const gapText = team.team.criticalGaps.slice(0, 2).join(', ');
    signals.push({
      dimension: 'team',
      signal: 'Pre-Seed',
      strength: 0.5,
      evidence: `Critical hiring gaps identified: ${gapText || 'key roles missing'}`
    });
  }

  // === REVENUE SIGNALS ===
  const mrr = financial.revenue.stated.mrr || financial.revenue.computed.mrr || 0;
  const arr = mrr * 12;
  
  if (mrr === 0) {
    signals.push({
      dimension: 'revenue',
      signal: 'Pre-Seed',
      strength: 0.9,
      evidence: 'No recurring revenue yet'
    });
  } else if (arr < 50000) {
    signals.push({
      dimension: 'revenue',
      signal: 'Pre-Seed',
      strength: 0.75,
      evidence: `ARR of $${arr.toLocaleString()} is below typical Seed threshold ($50K-$100K+)`
    });
  } else if (arr >= 50000 && arr < 500000) {
    signals.push({
      dimension: 'revenue',
      signal: 'Seed',
      strength: 0.8,
      evidence: `ARR of $${arr.toLocaleString()} is in typical Seed range ($50K-$500K)`
    });
  } else if (arr >= 500000 && arr < 2000000) {
    signals.push({
      dimension: 'revenue',
      signal: 'Series A',
      strength: 0.7,
      evidence: `ARR of $${arr.toLocaleString()} is approaching Series A territory ($1M+)`
    });
  } else if (arr >= 2000000) {
    signals.push({
      dimension: 'revenue',
      signal: 'Series A',
      strength: 0.9,
      evidence: `ARR of $${arr.toLocaleString()} exceeds $2M - strong Series A candidate`
    });
  }

  // === CUSTOMER/TRACTION SIGNALS ===
  const paidCustomers = customer.metrics.paidCustomers || 0;
  const totalCustomers = customer.metrics.totalCustomers || 0;
  
  if (paidCustomers === 0 && totalCustomers > 0) {
    signals.push({
      dimension: 'traction',
      signal: 'Pre-Seed',
      strength: 0.85,
      evidence: `${totalCustomers.toLocaleString()} users but no paying customers yet`
    });
  } else if (paidCustomers === 0 && totalCustomers === 0) {
    signals.push({
      dimension: 'traction',
      signal: 'Pre-Seed',
      strength: 0.95,
      evidence: 'No customers or users yet'
    });
  } else if (paidCustomers > 0 && paidCustomers < 20) {
    signals.push({
      dimension: 'traction',
      signal: 'Pre-Seed',
      strength: 0.65,
      evidence: `Only ${paidCustomers} paying customers - very early traction`
    });
  } else if (paidCustomers >= 20 && paidCustomers < 100) {
    signals.push({
      dimension: 'traction',
      signal: 'Seed',
      strength: 0.6,
      evidence: `${paidCustomers} paying customers - building traction`
    });
  } else if (paidCustomers >= 100) {
    signals.push({
      dimension: 'traction',
      signal: 'Seed',
      strength: 0.8,
      evidence: `${paidCustomers} paying customers - solid customer base`
    });
  }

  // === PRODUCT STAGE SIGNALS ===
  const productStage = traction.current.stage;
  if (productStage === 'idea') {
    signals.push({
      dimension: 'product',
      signal: 'Pre-Seed',
      strength: 0.95,
      evidence: 'Product is still at idea/concept stage'
    });
  } else if (productStage === 'prototype') {
    signals.push({
      dimension: 'product',
      signal: 'Pre-Seed',
      strength: 0.85,
      evidence: 'Product is at prototype/MVP stage'
    });
  } else if (productStage === 'beta') {
    // Beta could be late pre-seed or early seed depending on other signals
    signals.push({
      dimension: 'product',
      signal: 'Pre-Seed',
      strength: 0.5,  // Lower weight - context dependent
      evidence: 'Product in beta - could be late Pre-Seed or early Seed'
    });
  } else if (productStage === 'launched') {
    signals.push({
      dimension: 'product',
      signal: 'Seed',
      strength: 0.7,
      evidence: 'Product is launched in production'
    });
  } else if (productStage === 'scaling') {
    signals.push({
      dimension: 'product',
      signal: 'Series A',
      strength: 0.8,
      evidence: 'Product is in scaling phase'
    });
  }

  // === DEFENSIBILITY SIGNALS ===
  const hasMoats = !defensibility.currentMoats.type.includes('none');
  const moatStrength = defensibility.currentMoats.strength;
  
  if (!hasMoats || moatStrength === 'nascent' || moatStrength === 'weak') {
    signals.push({
      dimension: 'defensibility',
      signal: 'Pre-Seed',
      strength: 0.4,
      evidence: 'No established moats yet - typical for early stage'
    });
  } else if (moatStrength === 'moderate') {
    signals.push({
      dimension: 'defensibility',
      signal: 'Seed',
      strength: 0.5,
      evidence: 'Building defensibility with emerging moats'
    });
  } else if (moatStrength === 'strong') {
    signals.push({
      dimension: 'defensibility',
      signal: 'Series A',
      strength: 0.6,
      evidence: 'Strong competitive moats established'
    });
  }

  // === CALCULATE WEIGHTED STAGE ===
  const stageScores = { 'Pre-Seed': 0, 'Seed': 0, 'Series A': 0 };
  let totalWeight = 0;
  
  for (const signal of signals) {
    stageScores[signal.signal] += signal.strength;
    totalWeight += signal.strength;
  }
  
  // Determine detected stage based on highest weighted score
  let detectedStage: 'Pre-Seed' | 'Seed' | 'Series A' = 'Pre-Seed';
  let maxScore = stageScores['Pre-Seed'];
  
  if (stageScores['Seed'] > maxScore) {
    detectedStage = 'Seed';
    maxScore = stageScores['Seed'];
  }
  if (stageScores['Series A'] > maxScore) {
    detectedStage = 'Series A';
    maxScore = stageScores['Series A'];
  }
  
  // Calculate confidence as the dominance of the detected stage
  const confidence = totalWeight > 0 
    ? Math.round((maxScore / totalWeight) * 100) 
    : 50;
  
  // === DETECT MISMATCH ===
  // Map user stage to normalized VC stage
  const userVCStage = normalizeToVCStage(userStage);
  const mismatch = userVCStage !== detectedStage;
  
  // Determine severity: major if user claims higher stage than detected
  let mismatchSeverity: 'none' | 'minor' | 'major' = 'none';
  if (mismatch) {
    const stageOrder = ['Pre-Seed', 'Seed', 'Series A'];
    const userIdx = stageOrder.indexOf(userVCStage);
    const detectedIdx = stageOrder.indexOf(detectedStage);
    
    if (userIdx > detectedIdx) {
      // User claims more advanced stage than detected - major mismatch
      mismatchSeverity = 'major';
    } else {
      // User claims earlier stage than detected - minor (being conservative)
      mismatchSeverity = 'minor';
    }
  }
  
  // Generate explanation for major mismatches
  let mismatchExplanation: string | undefined;
  if (mismatchSeverity === 'major') {
    const preSeedSignals = signals.filter(s => s.signal === 'Pre-Seed');
    const topSignals = preSeedSignals
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 3);
    
    mismatchExplanation = `You selected "${userStage}", but our analysis across ${signals.length} dimensions suggests you're at "${detectedStage}" stage. Key indicators: ${topSignals.map(s => s.evidence).join('; ')}. This doesn't mean you can't raise - it means VCs will evaluate you against ${detectedStage} benchmarks.`;
    
    // Add discrepancy for stage mismatch
    discrepancies.push(createDiscrepancy(
      'stage',
      userStage,
      detectedStage,
      'inconsistency',
      'high',
      mismatchExplanation,
      ['team', 'traction', 'revenue', 'product'],
      [
        `What milestones would you need to hit to be considered ${userStage} by VCs?`,
        'Do you have paying customers generating recurring revenue?',
        'Is your product live in production with real users?'
      ]
    ));
  }

  // Benchmarking stage: use detected stage for major mismatches, user stage otherwise
  const benchmarkingStage = mismatchSeverity === 'major' ? detectedStage : userVCStage as 'Pre-Seed' | 'Seed' | 'Series A';

  return {
    userStatedStage: userStage,
    detectedStage,
    confidence,
    signals,
    mismatch,
    mismatchSeverity,
    mismatchExplanation,
    benchmarkingStage
  };
}

/**
 * Normalize various stage inputs to standard VC stages
 */
function normalizeToVCStage(stage: string): 'Pre-Seed' | 'Seed' | 'Series A' {
  const normalized = stage.toLowerCase().replace(/[-_\s]/g, '');
  
  if (normalized.includes('preseed') || normalized.includes('angel') || normalized.includes('idea') || normalized.includes('prototype')) {
    return 'Pre-Seed';
  }
  if (normalized.includes('seriesa') || normalized.includes('a') && normalized.includes('round')) {
    return 'Series A';
  }
  if (normalized.includes('seed')) {
    return 'Seed';
  }
  
  // Default to Pre-Seed for unknown stages
  return 'Pre-Seed';
}
