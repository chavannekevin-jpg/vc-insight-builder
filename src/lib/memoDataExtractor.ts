import { safeLower, safeStr } from "@/lib/stringUtils";

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

export interface SimilarExit {
  company: string;
  acquirer: string;
  year: number;
  value: string;
  multiple?: string;
  context?: string;
}

export interface ExitPathData {
  currentARR?: number;
  projectedARR?: number;
  category: string;
  revenueMultiple: { low: number; mid: number; high: number };
  similarExits?: SimilarExit[];
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

  const text = safeLower(competitiveMoatText, "extractMoatScores.competitiveMoatText");
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
  const teamText = safeStr(teamStoryText, "extractTeamMembers.teamStoryText");
  if (!teamText) return [];

  const members: ExtractedTeamMember[] = [];
  
  // Extended role keywords - more comprehensive
  const roleKeywords = 'CEO|CTO|COO|CFO|CMO|CPO|VP|Head|Director|Founder|Co-Founder|Co-founder|Cofounder|Chief|Lead|Manager|Engineer|President|Partner|Owner';
  
  // Common role patterns - expanded to catch more formats including "Name (Co-Founder & CEO)"
  const rolePatterns = [
    // Name (Co-Founder & CEO) or Name (CEO) format - PRIORITIZED
    new RegExp(`([A-Z][a-zA-Z]+(?:[\\s-][A-Z][a-zA-Z]+)*)\\s*\\(([^)]*(?:${roleKeywords})[^)]*)\\)`, 'gi'),
    // "led by Name" or "founded by Name" format
    new RegExp(`(?:led by|founded by|co-founded by)\\s+([A-Z][a-zA-Z]+(?:[\\s-][A-Z][a-zA-Z]+)*)(?:[,\\s]+(?:and\\s+)?([A-Z][a-zA-Z]+(?:[\\s-][A-Z][a-zA-Z]+)*))?`, 'gi'),
    // Name - Role format
    new RegExp(`(?:^|\\n|,\\s*|\\*\\*|\\*|\\•)\\s*([A-Z][a-zA-Z]+(?:[\\s-][A-Z][a-zA-Z]+)*)\\s*[-–—:]\\s*(${roleKeywords}[^,\\n]*)`, 'gi'),
    // Role: Name format
    new RegExp(`(${roleKeywords}):\\s*([A-Z][a-zA-Z]+(?:[\\s-][A-Z][a-zA-Z]+)*)`, 'gi'),
    // **Name** as Role format (markdown)
    new RegExp(`\\*\\*([A-Z][a-zA-Z]+(?:[\\s-][A-Z][a-zA-Z]+)*)\\*\\*[^\\n]*(${roleKeywords}[^,\\n]*)`, 'gi'),
    // Name, Role format (comma separated)
    new RegExp(`([A-Z][a-zA-Z]+(?:[\\s-][A-Z][a-zA-Z]+)?),\\s*((?:${roleKeywords})[^,\\n]*)`, 'gi'),
    // Bullet point format: • Name - Role
    new RegExp(`[\\•\\-\\*]\\s*([A-Z][a-zA-Z]+(?:[\\s-][A-Z][a-zA-Z]+)*)\\s*[-–:]\\s*(${roleKeywords}[^\\n]*)`, 'gi'),
    // "as the CEO" or "serves as CEO" or "is the CEO" format
    new RegExp(`([A-Z][a-zA-Z]+(?:[\\s-][A-Z][a-zA-Z]+)*)(?:\\s+(?:is|as|serves as|who is)\\s+(?:the\\s+)?)((?:${roleKeywords})[^,\\.\\n]*)`, 'gi'),
    // Name who serves as Role
    new RegExp(`([A-Z][a-zA-Z]+(?:[\\s-][A-Z][a-zA-Z]+)*)\\s+who\\s+(?:serves as|is)\\s+(?:the\\s+)?(${roleKeywords}[^,\\.\\n]*)`, 'gi')
  ];

  // Helper to add member if valid
  const addMember = (name: string, role: string) => {
    name = name?.trim();
    role = role?.trim();
    
    // Handle Role: Name format where role comes first
    if (name && /^(CEO|CTO|COO|CFO|CMO|CPO)$/i.test(name)) {
      [name, role] = [role, name];
    }
    
    // Clean up role (remove extra punctuation/markdown)
    if (role) {
      role = role.replace(/^\*+|\*+$/g, '').replace(/\s+/g, ' ').trim();
    }
    
    // Validate name looks like a real name (allows hyphenated names, non-Western names)
    const isValidName = name && 
      name.length >= 2 && 
      name.length <= 60 && 
      /^[A-Z][a-zA-Z]+(?:[\s-][A-Z]?[a-zA-Z]+)*$/.test(name) &&
      !/(CEO|CTO|COO|CFO|CMO|CPO|Founder|Lead|Head|Director)/i.test(name);
    
    if (isValidName && role && !members.some(m => safeLower(m.name) === safeLower(name))) {
      members.push({ name, role });
    }
  };

  rolePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(teamText)) !== null) {
      addMember(match[1], match[2] || 'Founder');
      // Handle "led by Name and Name2" pattern
      if (match[2] && /^[A-Z]/.test(match[2]) && !/CEO|CTO|COO|CFO/i.test(match[2])) {
        addMember(match[2], 'Co-Founder');
      }
    }
  });

  // If no members found with patterns, try to extract from structured text
  if (members.length === 0) {
    const lines = teamText.split('\n');
    for (const line of lines) {
      // Simple "Name is the Role" pattern
      const simpleMatch = line.match(/([A-Z][a-zA-Z]+(?:[\s-][A-Z][a-zA-Z]+)?)\s+(?:is|as)\s+(?:the\s+)?(CEO|CTO|COO|CFO|CMO|CPO|Founder|Co-Founder|Co-founder)/i);
      if (simpleMatch) {
        addMember(simpleMatch[1], simpleMatch[2]);
      }
      
      // "The team, led by Name and Name2" pattern
      const ledByMatch = line.match(/(?:team|company)[,\s]+led by\s+([A-Z][a-zA-Z]+(?:[\s-][A-Z][a-zA-Z]+)*)\s+and\s+([A-Z][a-zA-Z]+(?:[\s-][A-Z][a-zA-Z]+)*)/i);
      if (ledByMatch) {
        addMember(ledByMatch[1], 'Co-Founder');
        addMember(ledByMatch[2], 'Co-Founder');
      }
    }
  }

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
  const combinedText = safeLower(`${businessModelText || ''} ${tractionText || ''}`, "extractUnitEconomics.combinedText");

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
  const combinedText = safeStr(`${tractionText || ''} ${visionAskText || ''}`, "getExitPathData.combinedText");
  const combinedLower = combinedText.toLowerCase();
  // Try to extract ARR from text
  let currentARR: number | undefined;
  let projectedARR: number | undefined;
  
  const arrMatch = combinedText.match(/\$?([\d.]+)\s*[mk]?\s*arr/i);
  if (arrMatch) {
    let value = parseFloat(arrMatch[1]);
    if (combinedLower.includes('k arr')) value *= 1000;
    if (combinedLower.includes('m arr')) value *= 1000000;
    currentARR = value;
  }

  const mrrMatch = combinedText.match(/\$?([\d,]+)\s*mrr/i);
  if (mrrMatch) {
    currentARR = parseFloat(mrrMatch[1].replace(',', '')) * 12;
  }

  // Revenue multiples by category
  const categoryLower = safeLower(category, "getExitPathData.category");
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

  // Get relevant similar exits based on category
  const similarExits = getSimilarExits(category);

  return {
    currentARR,
    projectedARR,
    category,
    revenueMultiple,
    similarExits
  };
}

// Database of notable exits by category - based on real M&A data
export function getSimilarExits(category: string): SimilarExit[] {
  const categoryLower = safeLower(category, "getSimilarExits.category");
  
  if (categoryLower.includes('climate') || categoryLower.includes('sustainability') || categoryLower.includes('carbon')) {
    return [
      { company: 'Persefoni', acquirer: 'Workiva', year: 2024, value: '$200M+', multiple: '15x ARR', context: 'Carbon accounting platform' },
      { company: 'Watershed', acquirer: 'Series C ($100M)', year: 2023, value: '$1.8B valuation', multiple: '50x+ ARR', context: 'Enterprise carbon platform' },
      { company: 'Ecoinvent', acquirer: 'Sphera', year: 2021, value: 'Undisclosed', multiple: '8-12x ARR est.', context: 'LCA database provider' },
      { company: 'Normative', acquirer: 'Strategic (ongoing)', year: 2023, value: '$30M raised', context: 'Carbon accounting for SMBs' }
    ];
  }
  
  if (categoryLower.includes('fintech')) {
    return [
      { company: 'Plaid', acquirer: 'Visa (cancelled)', year: 2021, value: '$5.3B', multiple: '25x revenue', context: 'Financial data API' },
      { company: 'Credit Karma', acquirer: 'Intuit', year: 2020, value: '$7.1B', multiple: '7x revenue', context: 'Personal finance platform' },
      { company: 'Honey', acquirer: 'PayPal', year: 2020, value: '$4B', multiple: '20x+ revenue', context: 'Shopping & coupons' },
      { company: 'Afterpay', acquirer: 'Block (Square)', year: 2022, value: '$29B', multiple: '15x revenue', context: 'BNPL platform' }
    ];
  }
  
  if (categoryLower.includes('health') || categoryLower.includes('healthcare')) {
    return [
      { company: 'Signify Health', acquirer: 'CVS', year: 2022, value: '$8B', multiple: '8x revenue', context: 'Value-based care platform' },
      { company: 'One Medical', acquirer: 'Amazon', year: 2023, value: '$3.9B', multiple: '4x revenue', context: 'Primary care tech' },
      { company: 'Calm', acquirer: 'Series D', year: 2021, value: '$2B valuation', multiple: '15x revenue', context: 'Mental wellness app' },
      { company: 'MDaudit', acquirer: 'GHX', year: 2023, value: 'Undisclosed', multiple: '5-7x ARR est.', context: 'Revenue cycle management' }
    ];
  }
  
  if (categoryLower.includes('ecommerce') || categoryLower.includes('retail') || categoryLower.includes('commerce')) {
    return [
      { company: 'Deliverr', acquirer: 'Shopify', year: 2022, value: '$2.1B', multiple: '10x revenue', context: 'Fulfillment platform' },
      { company: 'Returnly', acquirer: 'Affirm', year: 2021, value: '$300M', multiple: '15x revenue', context: 'Returns management' },
      { company: 'Depop', acquirer: 'Etsy', year: 2021, value: '$1.6B', multiple: '25x revenue', context: 'Social commerce' },
      { company: 'Bolt', acquirer: 'Strategic (ongoing)', year: 2023, value: '$1B+ valuation', context: 'Checkout optimization' }
    ];
  }
  
  if (categoryLower.includes('hr') || categoryLower.includes('workforce') || categoryLower.includes('talent')) {
    return [
      { company: 'Greenhouse', acquirer: 'Private Equity', year: 2024, value: '$650M', multiple: '6x ARR', context: 'Recruiting platform' },
      { company: 'Hired', acquirer: 'Vettery/Adecco', year: 2020, value: '$100M+', multiple: '3x revenue', context: 'Tech recruiting marketplace' },
      { company: 'Lattice', acquirer: 'Series F ($175M)', year: 2022, value: '$3B valuation', multiple: '30x ARR', context: 'People management platform' },
      { company: 'Envoy', acquirer: 'Series C', year: 2022, value: '$1.4B valuation', multiple: '20x+ ARR', context: 'Workplace platform' }
    ];
  }
  
  if (categoryLower.includes('security') || categoryLower.includes('cyber')) {
    return [
      { company: 'Duo Security', acquirer: 'Cisco', year: 2018, value: '$2.4B', multiple: '15x ARR', context: 'Zero trust security' },
      { company: 'Auth0', acquirer: 'Okta', year: 2021, value: '$6.5B', multiple: '35x ARR', context: 'Identity platform' },
      { company: 'Snyk', acquirer: 'Series G', year: 2022, value: '$8.5B valuation', multiple: '40x+ ARR', context: 'Developer security' },
      { company: 'Vanta', acquirer: 'Series B', year: 2022, value: '$1.6B valuation', multiple: '50x+ ARR', context: 'Compliance automation' }
    ];
  }
  
  if (categoryLower.includes('ai') || categoryLower.includes('machine learning') || categoryLower.includes('artificial')) {
    return [
      { company: 'Jasper', acquirer: 'Series A', year: 2022, value: '$1.5B valuation', multiple: '30x+ ARR', context: 'AI content generation' },
      { company: 'Moveworks', acquirer: 'Series C', year: 2022, value: '$2.1B valuation', multiple: '50x+ ARR', context: 'Enterprise AI assistant' },
      { company: 'DataRobot', acquirer: 'Series G', year: 2021, value: '$6.3B valuation', multiple: '25x ARR', context: 'AutoML platform' },
      { company: 'Figure AI', acquirer: 'Series B', year: 2024, value: '$2.6B valuation', context: 'AI robotics' }
    ];
  }
  
  if (categoryLower.includes('devtools') || categoryLower.includes('developer') || categoryLower.includes('infrastructure')) {
    return [
      { company: 'Figma', acquirer: 'Adobe (cancelled)', year: 2022, value: '$20B', multiple: '50x ARR', context: 'Design collaboration' },
      { company: 'Postman', acquirer: 'Series D', year: 2021, value: '$5.6B valuation', multiple: '40x+ ARR', context: 'API platform' },
      { company: 'LaunchDarkly', acquirer: 'Series D', year: 2021, value: '$3B valuation', multiple: '30x+ ARR', context: 'Feature management' },
      { company: 'Netlify', acquirer: 'Series D', year: 2021, value: '$2B valuation', multiple: '25x+ ARR', context: 'Web deployment platform' }
    ];
  }
  
  if (categoryLower.includes('marketplace')) {
    return [
      { company: 'Houzz', acquirer: 'Private', year: 2022, value: '$4B valuation', multiple: '8x GMV take rate', context: 'Home marketplace' },
      { company: 'StockX', acquirer: 'Series E', year: 2021, value: '$3.8B valuation', multiple: '5x GMV take rate', context: 'Sneaker marketplace' },
      { company: 'Faire', acquirer: 'Series G', year: 2022, value: '$12.4B valuation', multiple: '10x+ revenue', context: 'Wholesale marketplace' },
      { company: 'Whatnot', acquirer: 'Series D', year: 2022, value: '$3.7B valuation', multiple: '15x+ GMV take rate', context: 'Live shopping' }
    ];
  }
  
  // Default tech/SaaS exits
  return [
    { company: 'Mailchimp', acquirer: 'Intuit', year: 2021, value: '$12B', multiple: '12x revenue', context: 'Marketing automation' },
    { company: 'Slack', acquirer: 'Salesforce', year: 2021, value: '$27.7B', multiple: '26x revenue', context: 'Team collaboration' },
    { company: 'Zendesk', acquirer: 'Private Equity', year: 2022, value: '$10.2B', multiple: '6x revenue', context: 'Customer service platform' },
    { company: 'Qualtrics', acquirer: 'SAP/Silver Lake', year: 2023, value: '$12.5B', multiple: '8x revenue', context: 'Experience management' }
  ];
}

// Get suggested acquirers based on category
export function getSuggestedAcquirers(category: string): string[] {
  const categoryLower = safeLower(category, "getSuggestedAcquirers.category");
  
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
  const stageLower = safeLower(stage, "getCriticalRoles.stage");
  const existingLower = (existingRoles || []).map((r) => safeLower(r, "getCriticalRoles.existingRole"));

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

  const isAlreadyCovered = (neededRole: string) => {
    const neededLower = safeLower(neededRole);
    const neededFirst = neededLower.split(' ')[0] || '';
    return existingLower.some((er) => {
      const erFirst = (er.split(' ')[0] || '').trim();
      return (neededFirst && er.includes(neededFirst)) || (erFirst && neededLower.includes(erFirst));
    });
  };

  criticalRoles = criticalRoles.filter((role) => !isAlreadyCovered(role));
  suggestedRoles = suggestedRoles.filter((role) => !isAlreadyCovered(role));

  return { critical: criticalRoles.slice(0, 2), suggested: suggestedRoles.slice(0, 3) };
}

// Pricing metrics for VC Scale Card
export interface PricingMetrics {
  avgMonthlyRevenue: number;
  currentCustomers: number;
  currentMRR: number;
}

/**
 * Extract pricing metrics from business model, traction, market sections, and memo responses.
 * Used to populate the VC Scale Card with dynamic data.
 */
export function extractPricingMetrics(
  businessModelText: string,
  tractionText: string,
  memoResponses?: Record<string, string>,
  unitEconomicsJson?: Record<string, any>,
  marketText?: string
): PricingMetrics & { isB2C?: boolean; isTransactionBased?: boolean } {
  const defaults: PricingMetrics & { isB2C?: boolean; isTransactionBased?: boolean } = {
    avgMonthlyRevenue: 0,
    currentCustomers: 0,
    currentMRR: 0,
    isB2C: false,
    isTransactionBased: false
  };

  // Include market text in combined search
  const combinedTextRaw = `${businessModelText || ''} ${tractionText || ''} ${marketText || ''}`;
  const combinedText = safeLower(combinedTextRaw, "extractPricingMetrics.combinedText");
  
  // Detect business model type
  const b2cIndicators = ['consumer', 'b2c', 'users', 'app users', 'subscribers', 'individuals', 'personal', 'retail'];
  const transactionIndicators = ['transaction fee', 'take rate', 'commission', '% of', 'per transaction', 'marketplace', 'platform fee'];
  
  defaults.isB2C = b2cIndicators.some(indicator => combinedText.includes(indicator));
  defaults.isTransactionBased = transactionIndicators.some(indicator => combinedText.includes(indicator));
  
  // 1. Try structured JSON first (most reliable)
  if (unitEconomicsJson) {
    if (unitEconomicsJson.avg_monthly_revenue) {
      defaults.avgMonthlyRevenue = parseFloat(unitEconomicsJson.avg_monthly_revenue);
    }
    if (unitEconomicsJson.current_customers) {
      defaults.currentCustomers = parseInt(unitEconomicsJson.current_customers);
    }
    if (unitEconomicsJson.current_mrr) {
      defaults.currentMRR = parseFloat(unitEconomicsJson.current_mrr);
    }
  }

  // 2. Try memo responses (questionnaire answers) - check business_model too
  if (memoResponses) {
    const pricingAnswer = memoResponses['pricing_model'] || memoResponses['pricing'] || '';
    const businessAnswer = memoResponses['business_model'] || '';
    const revenueAnswer = memoResponses['revenue'] || memoResponses['current_revenue'] || '';
    const customersAnswer = memoResponses['customers'] || memoResponses['current_customers'] || memoResponses['traction'] || '';
    const allPricingText = `${pricingAnswer} ${businessAnswer}`.toLowerCase();
    
    // Extract ARPU from business_model or pricing answers
    // Supports formats like: "ARPU is £120-150", "ARPU of £150", "(ARPU) of £150", "average revenue per user (ARPU) is £120-150"
    if (!defaults.avgMonthlyRevenue) {
      // Match "ARPU is £120-150" or "ARPU £120-150" (take average of range)
      const arpuRangeMatch = allPricingText.match(/arpu[^£$€\d]*[\$€£]?([\d,]+(?:\.\d+)?)\s*[-–—to]+\s*[\$€£]?([\d,]+(?:\.\d+)?)/i);
      if (arpuRangeMatch) {
        const low = parseFloat(arpuRangeMatch[1].replace(/,/g, ''));
        const high = parseFloat(arpuRangeMatch[2].replace(/,/g, ''));
        // Check if this is annual (look for /year or per year nearby)
        const isAnnual = allPricingText.includes('/year') || allPricingText.includes('per year') || allPricingText.includes('annual');
        defaults.avgMonthlyRevenue = isAnnual ? Math.round((low + high) / 2 / 12) : Math.round((low + high) / 2);
      }
      
      // Match single ARPU value: "ARPU is £150", "(ARPU) of £150", "arpu: £150"
      if (!defaults.avgMonthlyRevenue) {
        const arpuMatch = allPricingText.match(/\(arpu\)\s*(?:of|is|:)?\s*[\$€£]?([\d,]+(?:\.\d+)?)/i) ||
                         allPricingText.match(/arpu\s*(?:is|of|:)\s*[\$€£]?([\d,]+(?:\.\d+)?)/i) ||
                         allPricingText.match(/average\s*revenue\s*per\s*user[^£$€\d]*[\$€£]?([\d,]+(?:\.\d+)?)/i);
        if (arpuMatch) {
          const value = parseFloat(arpuMatch[1].replace(/,/g, ''));
          const isAnnual = allPricingText.includes('/year') || allPricingText.includes('per year') || allPricingText.includes('annual');
          defaults.avgMonthlyRevenue = isAnnual ? Math.round(value / 12) : value;
        }
      }
      
      // Match monthly price patterns
      if (!defaults.avgMonthlyRevenue) {
        const priceMatch = allPricingText.match(/[\$€£]?([\d,]+(?:\.\d+)?)\s*(?:sek|usd|eur|gbp)?\s*(?:\/|per)\s*(?:month|mo)/i) ||
                           allPricingText.match(/monthly[:\s]+[\$€£]?([\d,]+)/i);
        if (priceMatch) {
          defaults.avgMonthlyRevenue = parseFloat(priceMatch[1].replace(/,/g, ''));
        }
      }
    }

    // Extract customer/user count
    if (!defaults.currentCustomers && customersAnswer) {
      const customerMatch = customersAnswer.match(/(\d+)\s*(?:paying\s*)?(?:customers?|clients?|users?|members?|subscribers?)/i) ||
                           customersAnswer.match(/(\d+)\s*companies/i) ||
                           customersAnswer.match(/waitlist[^\d]*(\d+)/i) ||
                           customersAnswer.match(/(\d+)\s*(?:on|in)\s*(?:the\s*)?waitlist/i);
      if (customerMatch) {
        defaults.currentCustomers = parseInt(customerMatch[1]);
      }
    }

    // Extract MRR from revenue answer
    if (!defaults.currentMRR && revenueAnswer) {
      const mrrMatch = revenueAnswer.match(/[\$€£]?([\d,]+(?:\.\d+)?)\s*(?:sek|usd|eur)?\s*mrr/i) ||
                      revenueAnswer.match(/mrr[:\s]+[\$€£]?([\d,]+)/i);
      if (mrrMatch) {
        defaults.currentMRR = parseFloat(mrrMatch[1].replace(/,/g, ''));
      }
    }
  }

  // 3. Extract from narrative text as fallback
  
  // For transaction-based models, try to calculate effective ARPU
  if (defaults.isTransactionBased && !defaults.avgMonthlyRevenue) {
    // Look for transaction fee percentage
    const feeMatch = combinedText.match(/(\d+(?:\.\d+)?)\s*%\s*(?:transaction|platform|take|commission)/i) ||
                    combinedText.match(/(?:fee|commission|take rate)[:\s]+(\d+(?:\.\d+)?)\s*%/i);
    
    // Look for average transaction value
    const avgTxMatch = combinedText.match(/(?:average|avg)\s*(?:transaction|order)[:\s]*[\$€£]?([\d,]+)/i) ||
                       combinedText.match(/[\$€£]?([\d,]+)\s*(?:average|avg)\s*(?:transaction|order)/i);
    
    // Look for transactions per user
    const txPerUserMatch = combinedText.match(/(\d+)\s*(?:transactions?|orders?)\s*(?:per|\/)\s*(?:user|month)/i);
    
    if (feeMatch && avgTxMatch) {
      const feePercent = parseFloat(feeMatch[1]) / 100;
      const avgTxValue = parseFloat(avgTxMatch[1].replace(/,/g, ''));
      const txPerMonth = txPerUserMatch ? parseFloat(txPerUserMatch[1]) : 2; // Default 2 tx/month
      defaults.avgMonthlyRevenue = Math.round(feePercent * avgTxValue * txPerMonth);
    }
  }
  
  // Extract ACV/monthly price
  if (!defaults.avgMonthlyRevenue) {
    // ACV patterns (annual contract value - divide by 12 for monthly)
    const acvMatch = combinedText.match(/[\$€£]?([\d,]+)[k]?\s*acv/i) ||
                    combinedText.match(/acv[:\s]+[\$€£]?([\d,]+)/i);
    if (acvMatch) {
      let acv = parseFloat(acvMatch[1].replace(/,/g, ''));
      if (combinedText.includes('k acv') || acvMatch[0].includes('k')) acv *= 1000;
      defaults.avgMonthlyRevenue = Math.round(acv / 12);
    }
    
    // Direct monthly price patterns (support multiple currencies)
    if (!defaults.avgMonthlyRevenue) {
      const monthlyMatch = combinedText.match(/[\$€£]?([\d,]+(?:\.\d+)?)\s*(?:sek|usd|eur|gbp)?\s*(?:\/|per)\s*(?:month|mo)/i) ||
                          combinedText.match(/monthly[:\s]+[\$€£]?([\d,]+)/i);
      if (monthlyMatch) {
        defaults.avgMonthlyRevenue = parseFloat(monthlyMatch[1].replace(/,/g, ''));
      }
    }
    
    // ARPU extraction from narrative text - supports "(ARPU) of £150", "ARPU is £120-150"
    if (!defaults.avgMonthlyRevenue) {
      // Range format: "ARPU is £120-150" or "ARPU £120-150"
      const arpuRangeMatch = combinedText.match(/arpu[^£$€\d]*[\$€£]?([\d,]+(?:\.\d+)?)\s*[-–—to]+\s*[\$€£]?([\d,]+(?:\.\d+)?)/i);
      if (arpuRangeMatch) {
        const low = parseFloat(arpuRangeMatch[1].replace(/,/g, ''));
        const high = parseFloat(arpuRangeMatch[2].replace(/,/g, ''));
        defaults.avgMonthlyRevenue = Math.round((low + high) / 2);
      }
      
      // Single value: "(ARPU) of £150" or "ARPU is £150" or "arpu: £150"
      if (!defaults.avgMonthlyRevenue) {
        const arpuMatch = combinedText.match(/\(arpu\)\s*(?:of|is|:)?\s*[\$€£]?([\d,]+(?:\.\d+)?)/i) ||
                         combinedText.match(/arpu\s*(?:is|of|:)\s*[\$€£]?([\d,]+(?:\.\d+)?)/i) ||
                         combinedText.match(/average\s*revenue\s*per\s*user[^£$€\d]*[\$€£]?([\d,]+(?:\.\d+)?)/i);
        if (arpuMatch) {
          defaults.avgMonthlyRevenue = parseFloat(arpuMatch[1].replace(/,/g, ''));
        }
      }
    }
    
    // Look for "effective ACV" or calculated ARPU from text
    if (!defaults.avgMonthlyRevenue) {
      const effectiveMatch = combinedText.match(/effective\s*(?:acv|arpu)[^\d]*[\$€£]?([\d,]+)/i) ||
                            combinedText.match(/[\$€£]?([\d,]+)\s*(?:per active user per year|annual value per user)/i);
      if (effectiveMatch) {
        const annualValue = parseFloat(effectiveMatch[1].replace(/,/g, ''));
        defaults.avgMonthlyRevenue = Math.round(annualValue / 12);
      }
    }
  }
  
  // Extract customer/user count
  if (!defaults.currentCustomers) {
    const customerMatch = combinedText.match(/(\d+(?:,\d+)*)\s*(?:paying\s*)?(?:enterprise\s*)?(?:customers?|clients?|users?|active users?|members?)/i) ||
                         combinedText.match(/(\d+(?:,\d+)*)\s*(?:paying\s*)?companies/i) ||
                         combinedText.match(/serves?\s*(\d+(?:,\d+)*)/i) ||
                         combinedText.match(/waitlist[^\d]*(\d+(?:,\d+)*)/i) ||
                         combinedText.match(/signup[^\d]*(\d+(?:,\d+)*)/i);
    if (customerMatch) {
      defaults.currentCustomers = parseInt(customerMatch[1].replace(/,/g, ''));
    }
  }
  
  // Extract MRR (support multiple currencies including SEK)
  if (!defaults.currentMRR) {
    const mrrMatch = combinedText.match(/[\$€£]?([\d,]+(?:\.\d+)?)[k]?\s*(?:sek|usd|eur)?\s*mrr/i) ||
                    combinedText.match(/mrr[:\s]+[\$€£]?([\d,]+)/i);
    if (mrrMatch) {
      let mrr = parseFloat(mrrMatch[1].replace(/,/g, ''));
      if (combinedText.includes('k mrr') || mrrMatch[0].includes('k')) mrr *= 1000;
      defaults.currentMRR = mrr;
    }
    
    // Look for transaction volume that can be used to calculate effective MRR
    if (!defaults.currentMRR && defaults.isTransactionBased) {
      const volumeMatch = combinedText.match(/(\d+(?:,\d+)*)[k]?\s*(?:sek|usd|eur)?\s*(?:in\s*)?transactions/i) ||
                         combinedText.match(/facilitated\s*[\$€£]?(\d+(?:,\d+)*)[k]?\s*(?:sek|usd|eur)?/i);
      if (volumeMatch) {
        let volume = parseFloat(volumeMatch[1].replace(/,/g, ''));
        if (volumeMatch[0].includes('k')) volume *= 1000;
        // Assume 2-3% take rate if not specified
        const feeMatch = combinedText.match(/(\d+(?:\.\d+)?)\s*%/);
        const feeRate = feeMatch ? parseFloat(feeMatch[1]) / 100 : 0.025;
        defaults.currentMRR = Math.round(volume * feeRate / 12); // Monthly from annual volume
      }
    }
  }

  // 4. Calculate MRR from customers × monthly price if we have both but no MRR
  if (!defaults.currentMRR && defaults.avgMonthlyRevenue > 0 && defaults.currentCustomers > 0) {
    defaults.currentMRR = defaults.avgMonthlyRevenue * defaults.currentCustomers;
  }

  return defaults;
}
