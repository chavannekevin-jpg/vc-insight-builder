// Utility functions to extract structured data from unstructured questionnaire text

export interface MoatScores {
  networkEffects: { score: number; evidence: string };
  switchingCosts: { score: number; evidence: string };
  dataAdvantage: { score: number; evidence: string };
  brandTrust: { score: number; evidence: string };
  costAdvantage: { score: number; evidence: string };
  overallScore: number;
}

export interface ExtractedTeamMember {
  name: string;
  role: string;
  equity?: string;
}

export interface UnitEconomicsData {
  ltv?: number;
  cac?: number;
  ltvCacRatio?: number;
  paybackMonths?: number;
  grossMargin?: number;
  monthlyChurn?: number;
}

export interface ExitPathData {
  currentARR?: number;
  projectedARR?: number;
  category: string;
  revenueMultiple: { low: number; mid: number; high: number };
}

// Moat keyword patterns for extraction
const MOAT_PATTERNS = {
  networkEffects: ['network effect', 'marketplace', 'community', 'viral', 'two-sided', 'platform effect', 'user-generated', 'flywheel'],
  switchingCosts: ['switching cost', 'lock-in', 'integration', 'workflow', 'embedded', 'migration', 'dependency', 'sticky'],
  dataAdvantage: ['proprietary data', 'dataset', 'ai training', 'machine learning', 'unique data', 'data moat', 'analytics', 'insights'],
  brandTrust: ['brand', 'trust', 'certification', 'reputation', 'enterprise', 'compliance', 'soc2', 'iso', 'gdpr'],
  costAdvantage: ['economies of scale', 'cost advantage', 'margin', 'efficiency', 'proprietary tech', 'patent', 'cheaper']
};

export function extractMoatScores(competitiveMoatText: string): MoatScores {
  if (!competitiveMoatText) {
    return {
      networkEffects: { score: 0, evidence: 'Not mentioned' },
      switchingCosts: { score: 0, evidence: 'Not mentioned' },
      dataAdvantage: { score: 0, evidence: 'Not mentioned' },
      brandTrust: { score: 0, evidence: 'Not mentioned' },
      costAdvantage: { score: 0, evidence: 'Not mentioned' },
      overallScore: 0
    };
  }

  const text = competitiveMoatText.toLowerCase();
  const scores: MoatScores = {
    networkEffects: { score: 0, evidence: 'Not mentioned' },
    switchingCosts: { score: 0, evidence: 'Not mentioned' },
    dataAdvantage: { score: 0, evidence: 'Not mentioned' },
    brandTrust: { score: 0, evidence: 'Not mentioned' },
    costAdvantage: { score: 0, evidence: 'Not mentioned' },
    overallScore: 0
  };

  // Check each moat type for keyword matches
  Object.entries(MOAT_PATTERNS).forEach(([moatType, keywords]) => {
    let matchCount = 0;
    let evidenceSnippets: string[] = [];
    
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        matchCount++;
        // Extract context around the keyword
        const idx = text.indexOf(keyword);
        const start = Math.max(0, idx - 30);
        const end = Math.min(text.length, idx + keyword.length + 30);
        evidenceSnippets.push(text.substring(start, end).trim());
      }
    });

    const key = moatType as keyof typeof MOAT_PATTERNS;
    if (matchCount > 0) {
      // Score based on keyword density (max 10)
      const score = Math.min(10, matchCount * 3 + 2);
      scores[key] = {
        score,
        evidence: evidenceSnippets[0] ? `"...${evidenceSnippets[0]}..."` : 'Mentioned'
      };
    }
  });

  // Calculate overall score
  const moatScores = [
    scores.networkEffects.score,
    scores.switchingCosts.score,
    scores.dataAdvantage.score,
    scores.brandTrust.score,
    scores.costAdvantage.score
  ];
  scores.overallScore = Math.round(moatScores.reduce((a, b) => a + b, 0) * 2); // Scale to 100

  return scores;
}

export function extractTeamMembers(teamStoryText: string): ExtractedTeamMember[] {
  if (!teamStoryText) return [];

  const members: ExtractedTeamMember[] = [];
  
  // Common role patterns
  const rolePatterns = [
    /(?:^|\n|,\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*[-–]\s*(CEO|CTO|COO|CFO|CMO|CPO|VP|Head|Director|Founder|Co-founder)/gi,
    /(?:^|\n|,\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*\((CEO|CTO|COO|CFO|CMO|CPO|VP|Head|Director|Founder|Co-founder)[^)]*\)/gi,
    /(CEO|CTO|COO|CFO|CMO|CPO):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi
  ];

  rolePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(teamStoryText)) !== null) {
      const name = match[1]?.trim() || match[2]?.trim();
      const role = match[2]?.trim() || match[1]?.trim();
      
      if (name && role && !members.some(m => m.name.toLowerCase() === name.toLowerCase())) {
        members.push({ name, role });
      }
    }
  });

  return members;
}

export function extractUnitEconomics(
  businessModelText: string, 
  tractionText: string,
  unitEconomicsJson?: Record<string, any>
): UnitEconomicsData {
  const data: UnitEconomicsData = {};

  // First try to extract from structured JSON if available
  if (unitEconomicsJson) {
    if (unitEconomicsJson.ltv) data.ltv = parseFloat(unitEconomicsJson.ltv);
    if (unitEconomicsJson.cac) data.cac = parseFloat(unitEconomicsJson.cac);
    if (unitEconomicsJson.gross_margin) data.grossMargin = parseFloat(unitEconomicsJson.gross_margin);
    if (unitEconomicsJson.monthly_churn) data.monthlyChurn = parseFloat(unitEconomicsJson.monthly_churn);
    if (unitEconomicsJson.payback_months) data.paybackMonths = parseFloat(unitEconomicsJson.payback_months);
  }

  // Try to extract from text as fallback
  const combinedText = `${businessModelText || ''} ${tractionText || ''}`.toLowerCase();

  // Extract LTV
  if (!data.ltv) {
    const ltvMatch = combinedText.match(/ltv[:\s]+\$?([\d,]+)/i) || 
                     combinedText.match(/lifetime value[:\s]+\$?([\d,]+)/i);
    if (ltvMatch) data.ltv = parseFloat(ltvMatch[1].replace(',', ''));
  }

  // Extract CAC
  if (!data.cac) {
    const cacMatch = combinedText.match(/cac[:\s]+\$?([\d,]+)/i) ||
                     combinedText.match(/customer acquisition cost[:\s]+\$?([\d,]+)/i);
    if (cacMatch) data.cac = parseFloat(cacMatch[1].replace(',', ''));
  }

  // Extract gross margin
  if (!data.grossMargin) {
    const marginMatch = combinedText.match(/gross margin[:\s]+([\d.]+)%?/i) ||
                        combinedText.match(/([\d.]+)%?\s*gross margin/i);
    if (marginMatch) data.grossMargin = parseFloat(marginMatch[1]);
  }

  // Calculate LTV:CAC ratio if both are available
  if (data.ltv && data.cac && data.cac > 0) {
    data.ltvCacRatio = Math.round((data.ltv / data.cac) * 10) / 10;
  }

  return data;
}

export function getExitPathData(
  tractionText: string,
  visionAskText: string,
  category: string
): ExitPathData {
  const combinedText = `${tractionText || ''} ${visionAskText || ''}`;
  
  // Try to extract ARR from text
  let currentARR: number | undefined;
  let projectedARR: number | undefined;
  
  const arrMatch = combinedText.match(/\$?([\d.]+)\s*[mk]?\s*arr/i);
  if (arrMatch) {
    let value = parseFloat(arrMatch[1]);
    if (combinedText.toLowerCase().includes('k arr')) value *= 1000;
    if (combinedText.toLowerCase().includes('m arr')) value *= 1000000;
    currentARR = value;
  }

  const mrrMatch = combinedText.match(/\$?([\d,]+)\s*mrr/i);
  if (mrrMatch) {
    currentARR = parseFloat(mrrMatch[1].replace(',', '')) * 12;
  }

  // Revenue multiples by category
  const categoryLower = category.toLowerCase();
  let revenueMultiple = { low: 5, mid: 10, high: 15 }; // Default SaaS
  
  if (categoryLower.includes('consumer') || categoryLower.includes('b2c')) {
    revenueMultiple = { low: 3, mid: 5, high: 8 };
  } else if (categoryLower.includes('marketplace')) {
    revenueMultiple = { low: 5, mid: 8, high: 12 };
  } else if (categoryLower.includes('hardware') || categoryLower.includes('deep tech')) {
    revenueMultiple = { low: 2, mid: 4, high: 6 };
  } else if (categoryLower.includes('fintech')) {
    revenueMultiple = { low: 8, mid: 12, high: 18 };
  } else if (categoryLower.includes('health') || categoryLower.includes('biotech')) {
    revenueMultiple = { low: 6, mid: 10, high: 15 };
  }

  return {
    currentARR,
    projectedARR,
    category,
    revenueMultiple
  };
}

// Get suggested acquirers based on category
export function getSuggestedAcquirers(category: string): string[] {
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('climate') || categoryLower.includes('sustainability')) {
    return ['Microsoft', 'Salesforce', 'SAP', 'IBM', 'Autodesk'];
  }
  if (categoryLower.includes('fintech')) {
    return ['Stripe', 'PayPal', 'Visa', 'Intuit', 'Block'];
  }
  if (categoryLower.includes('health') || categoryLower.includes('healthcare')) {
    return ['UnitedHealth', 'CVS', 'Optum', 'Teladoc', 'Veeva'];
  }
  if (categoryLower.includes('ecommerce') || categoryLower.includes('retail')) {
    return ['Shopify', 'Amazon', 'Walmart', 'Klarna', 'Adobe'];
  }
  if (categoryLower.includes('hr') || categoryLower.includes('workforce')) {
    return ['Workday', 'SAP', 'ADP', 'UKG', 'Deel'];
  }
  if (categoryLower.includes('cybersecurity') || categoryLower.includes('security')) {
    return ['Palo Alto Networks', 'CrowdStrike', 'Microsoft', 'Cisco', 'Zscaler'];
  }
  if (categoryLower.includes('ai') || categoryLower.includes('machine learning')) {
    return ['Google', 'Microsoft', 'Salesforce', 'Adobe', 'Nvidia'];
  }
  if (categoryLower.includes('devtools') || categoryLower.includes('developer')) {
    return ['Atlassian', 'GitLab', 'Datadog', 'JetBrains', 'Microsoft'];
  }
  
  // Default tech acquirers
  return ['Microsoft', 'Google', 'Salesforce', 'Oracle', 'Adobe'];
}

// Critical missing roles by stage
export function getCriticalRoles(stage: string, existingRoles: string[]): { critical: string[]; suggested: string[] } {
  const stageLower = stage.toLowerCase();
  const existingLower = existingRoles.map(r => r.toLowerCase());
  
  let criticalRoles: string[] = [];
  let suggestedRoles: string[] = [];
  
  if (stageLower.includes('pre-seed') || stageLower.includes('idea')) {
    criticalRoles = ['Technical Co-founder', 'Product Lead'];
    suggestedRoles = ['Advisor (Industry Expert)', 'First Engineer'];
  } else if (stageLower.includes('seed')) {
    criticalRoles = ['Head of Growth/GTM', 'First Sales Hire', 'Lead Engineer'];
    suggestedRoles = ['Customer Success Manager', 'Marketing Lead'];
  } else if (stageLower.includes('series a') || stageLower.includes('series-a')) {
    criticalRoles = ['VP Engineering', 'VP Sales', 'Head of Finance'];
    suggestedRoles = ['HR Lead', 'Product Marketing', 'Data Lead'];
  } else {
    criticalRoles = ['VP Engineering', 'Head of Sales'];
    suggestedRoles = ['Customer Success', 'Marketing Lead'];
  }
  
  // Filter out already filled roles
  criticalRoles = criticalRoles.filter(role => 
    !existingLower.some(er => 
      er.includes(role.toLowerCase().split(' ')[0]) || 
      role.toLowerCase().includes(er.split(' ')[0])
    )
  );
  
  suggestedRoles = suggestedRoles.filter(role =>
    !existingLower.some(er =>
      er.includes(role.toLowerCase().split(' ')[0]) ||
      role.toLowerCase().includes(er.split(' ')[0])
    )
  );
  
  return { critical: criticalRoles.slice(0, 2), suggested: suggestedRoles.slice(0, 3) };
}
