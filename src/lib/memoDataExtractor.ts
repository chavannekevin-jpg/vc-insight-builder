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

// Business model types for VC Scale Card
export type BusinessModelType = 'b2c' | 'saas' | 'enterprise' | 'marketplace' | 'aum' | 'project';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'SEK' | 'NOK' | 'DKK';

// Enhanced pricing metrics for VC Scale Card
export interface EnhancedPricingMetrics {
  avgMonthlyRevenue: number;
  currentCustomers: number;
  currentMRR: number;
  currency: Currency;
  businessModelType: BusinessModelType;
  isB2C: boolean;
  isTransactionBased: boolean;
  // Additional metrics for specific business models
  ltv?: number;
  avgDealSize?: number;
  aumFeePercent?: number;
  aumTotal?: number;
  transactionFeePercent?: number;
  avgTransactionValue?: number;
  setupFee?: number;
}

// Legacy interface for backwards compatibility
export interface PricingMetrics {
  avgMonthlyRevenue: number;
  currentCustomers: number;
  currentMRR: number;
}

/**
 * Detect currency from text - returns the most frequently mentioned currency
 */
function detectCurrency(text: string): Currency {
  const currencyPatterns: { currency: Currency; patterns: RegExp[] }[] = [
    { currency: 'EUR', patterns: [/€/, /eur\b/i] },
    { currency: 'GBP', patterns: [/£/, /gbp\b/i] },
    { currency: 'SEK', patterns: [/\bsek\b/i, /\bkr\b/i, /\bkronor\b/i] },
    { currency: 'NOK', patterns: [/\bnok\b/i] },
    { currency: 'DKK', patterns: [/\bdkk\b/i] },
    { currency: 'USD', patterns: [/\$/, /usd\b/i] },
  ];

  const counts: Record<Currency, number> = { USD: 0, EUR: 0, GBP: 0, SEK: 0, NOK: 0, DKK: 0 };
  
  for (const { currency, patterns } of currencyPatterns) {
    for (const pattern of patterns) {
      const matches = text.match(new RegExp(pattern, 'gi'));
      if (matches) counts[currency] += matches.length;
    }
  }

  // Return the most frequent, defaulting to USD
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0][1] > 0 ? sorted[0][0] as Currency : 'USD';
}

/**
 * Detect business model type from text
 */
function detectBusinessModelType(text: string): BusinessModelType {
  const lowerText = text.toLowerCase();
  
  // AUM-based (asset management, fund management)
  const aumIndicators = ['aum fee', 'assets under management', '% of aum', 'management fee', 'annual aum', 'aum-based'];
  if (aumIndicators.some(ind => lowerText.includes(ind))) return 'aum';
  
  // Project/deal-based
  const projectIndicators = ['per deal', 'per project', 'structuring fee', 'setup fee', 'listing fee', 'per engagement', 'per transaction fee', 'one-time fee'];
  if (projectIndicators.some(ind => lowerText.includes(ind))) return 'project';
  
  // Marketplace
  const marketplaceIndicators = ['take rate', 'transaction fee', 'marketplace', 'platform fee', 'gmv', 'gross merchandise'];
  if (marketplaceIndicators.some(ind => lowerText.includes(ind))) return 'marketplace';
  
  // Enterprise SaaS
  const enterpriseIndicators = ['enterprise', 'acv', 'annual contract', 'enterprise client', 'b2b saas'];
  if (enterpriseIndicators.some(ind => lowerText.includes(ind))) return 'enterprise';
  
  // B2C
  const b2cIndicators = ['consumer', 'b2c', 'app users', 'subscribers', 'individuals', 'personal', 'retail customer', 'end user'];
  if (b2cIndicators.some(ind => lowerText.includes(ind))) return 'b2c';
  
  // Default to SaaS
  return 'saas';
}

/**
 * Parse a currency value from text, handling k/M suffixes
 */
function parseCurrencyValue(match: string): number {
  // Remove currency symbols and normalize
  let cleaned = match.replace(/[€£$,\s]/g, '').toLowerCase();
  let multiplier = 1;
  
  if (cleaned.endsWith('k')) {
    multiplier = 1000;
    cleaned = cleaned.slice(0, -1);
  } else if (cleaned.endsWith('m')) {
    multiplier = 1000000;
    cleaned = cleaned.slice(0, -1);
  } else if (cleaned.endsWith('b')) {
    multiplier = 1000000000;
    cleaned = cleaned.slice(0, -1);
  }
  
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : value * multiplier;
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
): EnhancedPricingMetrics {
  // Include market text in combined search
  const combinedTextRaw = `${businessModelText || ''} ${tractionText || ''} ${marketText || ''}`;
  const combinedText = safeLower(combinedTextRaw, "extractPricingMetrics.combinedText");
  
  // Add memo responses to the search text
  const memoResponseText = memoResponses ? Object.values(memoResponses).filter(v => typeof v === 'string').join(' ') : '';
  const allText = `${combinedText} ${memoResponseText.toLowerCase()}`;
  
  // Detect currency and business model
  const currency = detectCurrency(allText);
  const businessModelType = detectBusinessModelType(allText);
  
  // Initialize defaults
  const defaults: EnhancedPricingMetrics = {
    avgMonthlyRevenue: 0,
    currentCustomers: 0,
    currentMRR: 0,
    currency,
    businessModelType,
    isB2C: businessModelType === 'b2c',
    isTransactionBased: businessModelType === 'marketplace',
  };

  // === AUM-BASED MODEL EXTRACTION ===
  if (businessModelType === 'aum') {
    // Extract AUM fee percentage (e.g., "0.5% Annual AUM Fee", "1% management fee")
    const feeMatch = allText.match(/(\d+(?:\.\d+)?)\s*%\s*(?:annual\s*)?(?:aum|management|fund)\s*fee/i) ||
                     allText.match(/(?:aum|management)\s*fee[:\s]+(\d+(?:\.\d+)?)\s*%/i);
    if (feeMatch) {
      defaults.aumFeePercent = parseFloat(feeMatch[1]);
    }
    
    // Extract total AUM (e.g., "€200M AUM", "200 million in AUM")
    const aumMatch = allText.match(/[€£$]?([\d,]+(?:\.\d+)?)\s*[kmb]?\s*(?:in\s*)?aum/i) ||
                     allText.match(/aum[:\s]*[€£$]?([\d,]+(?:\.\d+)?)\s*[kmb]?/i);
    if (aumMatch) {
      defaults.aumTotal = parseCurrencyValue(aumMatch[0]);
    }
    
    // Extract setup/structuring fee (e.g., "€35k Structuring Fee")
    const setupMatch = allText.match(/[€£$]([\d,]+(?:\.\d+)?)\s*k?\s*(?:structuring|setup|listing|origination)\s*fee/i);
    if (setupMatch) {
      defaults.setupFee = parseCurrencyValue(setupMatch[0]);
    }
    
    // Calculate effective monthly revenue for AUM model
    if (defaults.aumFeePercent && defaults.aumTotal) {
      // Annual fee revenue / 12
      defaults.avgMonthlyRevenue = Math.round((defaults.aumFeePercent / 100) * defaults.aumTotal / 12);
    } else if (defaults.aumFeePercent) {
      // Use typical AUM per client assumption
      const avgAumPerClient = 50000000; // €50M default
      defaults.avgMonthlyRevenue = Math.round((defaults.aumFeePercent / 100) * avgAumPerClient / 12);
    }
    
    // Add setup fee if exists (amortize over typical client lifetime of 5 years)
    if (defaults.setupFee && defaults.avgMonthlyRevenue) {
      defaults.avgMonthlyRevenue += Math.round(defaults.setupFee / 60);
    }
  }
  
  // === PROJECT/DEAL-BASED MODEL EXTRACTION ===
  if (businessModelType === 'project') {
    // Extract per-deal/project fee
    const dealMatch = allText.match(/[€£$]([\d,]+(?:\.\d+)?)\s*k?\s*(?:per\s*)?(?:deal|project|engagement|structuring|listing)/i) ||
                      allText.match(/(?:deal|project)\s*(?:size|value|fee)[:\s]*[€£$]?([\d,]+(?:\.\d+)?)\s*k?/i);
    if (dealMatch) {
      defaults.avgDealSize = parseCurrencyValue(dealMatch[0]);
      // Assume 1 deal per month per customer as baseline
      defaults.avgMonthlyRevenue = defaults.avgDealSize;
    }
    
    // Extract setup fee if separate
    const setupMatch = allText.match(/[€£$]([\d,]+(?:\.\d+)?)\s*k?\s*(?:setup|structuring|listing)\s*fee/i);
    if (setupMatch) {
      defaults.setupFee = parseCurrencyValue(setupMatch[0]);
      if (!defaults.avgDealSize) {
        defaults.avgDealSize = defaults.setupFee;
        defaults.avgMonthlyRevenue = defaults.setupFee;
      }
    }
  }
  
  // === MARKETPLACE MODEL EXTRACTION ===
  if (businessModelType === 'marketplace') {
    // Extract take rate / transaction fee percentage
    const rateMatch = allText.match(/(\d+(?:\.\d+)?)\s*%\s*(?:take\s*rate|transaction\s*fee|platform\s*fee|commission)/i) ||
                      allText.match(/(?:take\s*rate|commission)[:\s]+(\d+(?:\.\d+)?)\s*%/i);
    if (rateMatch) {
      defaults.transactionFeePercent = parseFloat(rateMatch[1]);
    }
    
    // Extract average transaction value
    const txMatch = allText.match(/(?:average|avg)\s*(?:transaction|order)[:\s]*[€£$]?([\d,]+)/i);
    if (txMatch) {
      defaults.avgTransactionValue = parseCurrencyValue(txMatch[0]);
    }
    
    // Calculate effective revenue
    if (defaults.transactionFeePercent && defaults.avgTransactionValue) {
      const txPerMonth = 2; // Assume 2 transactions per user per month
      defaults.avgMonthlyRevenue = Math.round((defaults.transactionFeePercent / 100) * defaults.avgTransactionValue * txPerMonth);
    }
  }
  
  // === LTV EXTRACTION (works for all models) ===
  const ltvMatch = allText.match(/ltv[:\s]*[€£$]?([\d,]+(?:\.\d+)?)\s*[kmb]?/i) ||
                   allText.match(/lifetime\s*value[:\s]*[€£$]?([\d,]+(?:\.\d+)?)\s*[kmb]?/i) ||
                   allText.match(/[€£$]([\d,]+(?:\.\d+)?)\s*[kmb]?\s*ltv/i);
  if (ltvMatch) {
    defaults.ltv = parseCurrencyValue(ltvMatch[0]);
    // If we have LTV but no monthly revenue, estimate (assume 3-year lifetime)
    if (!defaults.avgMonthlyRevenue && defaults.ltv) {
      defaults.avgMonthlyRevenue = Math.round(defaults.ltv / 36);
    }
  }

  // === STANDARD EXTRACTION (SaaS, Enterprise, B2C) ===
  // 1. Try structured JSON first (most reliable)
  if (unitEconomicsJson) {
    if (unitEconomicsJson.avg_monthly_revenue && !defaults.avgMonthlyRevenue) {
      defaults.avgMonthlyRevenue = parseFloat(unitEconomicsJson.avg_monthly_revenue);
    }
    if (unitEconomicsJson.current_customers) {
      defaults.currentCustomers = parseInt(unitEconomicsJson.current_customers);
    }
    if (unitEconomicsJson.current_mrr) {
      defaults.currentMRR = parseFloat(unitEconomicsJson.current_mrr);
    }
  }

  // 2. Try memo responses (questionnaire answers)
  if (memoResponses && !defaults.avgMonthlyRevenue) {
    const pricingAnswer = memoResponses['pricing_model'] || memoResponses['pricing'] || '';
    const businessAnswer = memoResponses['business_model'] || '';
    const revenueAnswer = memoResponses['revenue'] || memoResponses['current_revenue'] || '';
    const customersAnswer = memoResponses['customers'] || memoResponses['current_customers'] || memoResponses['traction'] || '';
    const allPricingText = `${pricingAnswer} ${businessAnswer}`.toLowerCase();
    
    // Extract ARPU/ACV from answers
    if (!defaults.avgMonthlyRevenue) {
      // Range format: "ARPU is £120-150"
      const arpuRangeMatch = allPricingText.match(/(?:arpu|acv)[^£$€\d]*[€£$]?([\d,]+(?:\.\d+)?)\s*[-–—to]+\s*[€£$]?([\d,]+(?:\.\d+)?)/i);
      if (arpuRangeMatch) {
        const low = parseFloat(arpuRangeMatch[1].replace(/,/g, ''));
        const high = parseFloat(arpuRangeMatch[2].replace(/,/g, ''));
        const isAnnual = allPricingText.includes('/year') || allPricingText.includes('per year') || allPricingText.includes('annual');
        defaults.avgMonthlyRevenue = isAnnual ? Math.round((low + high) / 2 / 12) : Math.round((low + high) / 2);
      }
      
      // Single value: "(ARPU) of £150", "ACV: $50k"
      if (!defaults.avgMonthlyRevenue) {
        const acvMatch = allPricingText.match(/acv[:\s]*[€£$]?([\d,]+(?:\.\d+)?)\s*k?/i) ||
                         allPricingText.match(/\(arpu\)\s*(?:of|is|:)?\s*[€£$]?([\d,]+(?:\.\d+)?)/i) ||
                         allPricingText.match(/arpu\s*(?:is|of|:)\s*[€£$]?([\d,]+(?:\.\d+)?)/i);
        if (acvMatch) {
          let value = parseCurrencyValue(acvMatch[0]);
          const isAnnual = allPricingText.includes('/year') || allPricingText.includes('per year') || allPricingText.includes('annual') || allPricingText.includes('acv');
          defaults.avgMonthlyRevenue = isAnnual ? Math.round(value / 12) : value;
        }
      }
    }

    // Extract customer count
    if (!defaults.currentCustomers && customersAnswer) {
      const customerMatch = customersAnswer.match(/(\d+)\s*(?:paying\s*)?(?:customers?|clients?|users?|issuers?|members?)/i) ||
                           customersAnswer.match(/(\d+)\s*companies/i);
      if (customerMatch) {
        defaults.currentCustomers = parseInt(customerMatch[1]);
      }
    }

    // Extract MRR
    if (!defaults.currentMRR && revenueAnswer) {
      const mrrMatch = revenueAnswer.match(/[€£$]?([\d,]+(?:\.\d+)?)\s*(?:k)?\s*mrr/i);
      if (mrrMatch) {
        defaults.currentMRR = parseCurrencyValue(mrrMatch[0]);
      }
    }
  }

  // 3. Extract from narrative text as fallback
  if (!defaults.avgMonthlyRevenue) {
    // ACV patterns
    const acvMatch = combinedText.match(/[€£$]?([\d,]+)[k]?\s*acv/i) ||
                    combinedText.match(/acv[:\s]+[€£$]?([\d,]+)/i);
    if (acvMatch) {
      defaults.avgMonthlyRevenue = Math.round(parseCurrencyValue(acvMatch[0]) / 12);
    }
    
    // Monthly price patterns
    if (!defaults.avgMonthlyRevenue) {
      const monthlyMatch = combinedText.match(/[€£$]?([\d,]+(?:\.\d+)?)\s*(?:\/|per)\s*(?:month|mo)/i);
      if (monthlyMatch) {
        defaults.avgMonthlyRevenue = parseCurrencyValue(monthlyMatch[0]);
      }
    }
    
    // ARPU from narrative
    if (!defaults.avgMonthlyRevenue) {
      const arpuMatch = combinedText.match(/\(arpu\)\s*(?:of|is|:)?\s*[€£$]?([\d,]+(?:\.\d+)?)/i) ||
                       combinedText.match(/arpu\s*(?:is|of|:)\s*[€£$]?([\d,]+(?:\.\d+)?)/i);
      if (arpuMatch) {
        defaults.avgMonthlyRevenue = parseCurrencyValue(arpuMatch[0]);
      }
    }
  }
  
  // Extract customer count from narrative
  if (!defaults.currentCustomers) {
    const customerMatch = combinedText.match(/(\d+(?:,\d+)*)\s*(?:paying\s*)?(?:customers?|clients?|issuers?|users?)/i) ||
                         combinedText.match(/serves?\s*(\d+(?:,\d+)*)/i);
    if (customerMatch) {
      defaults.currentCustomers = parseInt(customerMatch[1].replace(/,/g, ''));
    }
  }
  
  // Extract MRR from narrative
  if (!defaults.currentMRR) {
    const mrrMatch = combinedText.match(/[€£$]?([\d,]+(?:\.\d+)?)[k]?\s*mrr/i);
    if (mrrMatch) {
      defaults.currentMRR = parseCurrencyValue(mrrMatch[0]);
    }
    
    // Extract ARR and divide by 12
    if (!defaults.currentMRR) {
      const arrMatch = combinedText.match(/[€£$]?([\d,]+(?:\.\d+)?)\s*[kmb]?\s*arr/i);
      if (arrMatch) {
        defaults.currentMRR = Math.round(parseCurrencyValue(arrMatch[0]) / 12);
      }
    }
  }

  // 4. Calculate MRR from customers × monthly price if we have both but no MRR
  if (!defaults.currentMRR && defaults.avgMonthlyRevenue > 0 && defaults.currentCustomers > 0) {
    defaults.currentMRR = defaults.avgMonthlyRevenue * defaults.currentCustomers;
  }

  // 5. Set smart defaults based on business model if still no revenue data
  if (!defaults.avgMonthlyRevenue) {
    switch (businessModelType) {
      case 'b2c':
        defaults.avgMonthlyRevenue = 10; // $10/month typical B2C
        break;
      case 'enterprise':
        defaults.avgMonthlyRevenue = 5000; // $60k ACV typical
        break;
      case 'aum':
        defaults.avgMonthlyRevenue = 20000; // ~$240k/year from 0.5% on $50M
        break;
      case 'project':
        defaults.avgMonthlyRevenue = 35000; // ~$35k per project
        break;
      case 'marketplace':
        defaults.avgMonthlyRevenue = 50; // 2.5% of $100 * 20 tx/month
        break;
      default:
        defaults.avgMonthlyRevenue = 300; // $300/month typical SaaS
    }
  }

  return defaults;
}
