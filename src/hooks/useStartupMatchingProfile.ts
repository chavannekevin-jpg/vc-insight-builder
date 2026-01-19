import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EnrichedStartupProfile {
  // Basic info
  stage: string | null;
  category: string | null;
  
  // Extracted sectors from responses
  sectors: string[];
  keywords: string[];
  
  // Financial signals
  fundingAsk: number | null;
  currentMRR: number | null;
  currentARR: number | null;
  targetARR: number | null;
  
  // Traction signals  
  hasRevenue: boolean;
  hasCustomers: boolean;
  customerCount: number | null;
  
  // Market signals
  marketSize: string | null;
  businessModel: string | null;
  
  // Profile completeness
  dataCompleteness: number;
}

/**
 * Parse currency values from text (handles €, $, k, K, M, B formats)
 */
function parseCurrencyValue(text: string | null): number | null {
  if (!text) return null;
  
  // Match patterns like "€500k", "$1.5M", "500000", "1,000,000"
  const patterns = [
    /[€$]?\s*([\d,.]+)\s*[kK]/,   // 500k, €500K
    /[€$]?\s*([\d,.]+)\s*[mM]/,   // 1.5M, €2M
    /[€$]?\s*([\d,.]+)\s*[bB]/,   // 1B
    /[€$]?\s*([\d,.]+)/,          // Plain numbers
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const numStr = match[1].replace(/,/g, '');
      let value = parseFloat(numStr);
      if (isNaN(value)) continue;
      
      // Apply multiplier
      if (/[kK]/.test(text.substring(text.indexOf(match[1])))) {
        value *= 1000;
      } else if (/[mM]/.test(text.substring(text.indexOf(match[1])))) {
        value *= 1000000;
      } else if (/[bB]/.test(text.substring(text.indexOf(match[1])))) {
        value *= 1000000000;
      }
      
      return value;
    }
  }
  
  return null;
}

/**
 * Extract sectors/keywords from business model and market descriptions
 */
function extractSectorsFromText(texts: (string | null)[]): string[] {
  const sectorKeywords: Record<string, string[]> = {
    'SaaS': ['saas', 'software as a service', 'subscription software', 'cloud software'],
    'Fintech': ['fintech', 'financial', 'banking', 'payments', 'lending', 'insurtech', 'neobank', 'defi', 'crypto'],
    'HealthTech': ['healthtech', 'health tech', 'medtech', 'healthcare', 'medical', 'clinical', 'biotech', 'pharma', 'telemedicine'],
    'AI/ML': ['artificial intelligence', ' ai ', 'machine learning', ' ml ', 'deep learning', 'neural', 'llm', 'generative ai', 'nlp'],
    'Climate': ['climate', 'cleantech', 'sustainability', 'renewable', 'carbon', 'green tech', 'energy transition', 'circular economy'],
    'Consumer': ['consumer', 'b2c', 'd2c', 'direct to consumer', 'retail', 'e-commerce', 'ecommerce'],
    'B2B': ['b2b', 'enterprise', 'business software', 'smb', 'sme'],
    'Marketplace': ['marketplace', 'platform', 'two-sided', 'matching platform', 'network effects'],
    'DeepTech': ['deeptech', 'deep tech', 'hardware', 'robotics', 'quantum', 'space', 'semiconductor'],
    'EdTech': ['edtech', 'education', 'learning', 'e-learning', 'training', 'upskilling'],
    'PropTech': ['proptech', 'real estate', 'property', 'housing', 'construction tech'],
    'Mobility': ['mobility', 'transportation', 'logistics', 'automotive', 'fleet', 'last mile'],
    'FoodTech': ['foodtech', 'food tech', 'agtech', 'agriculture', 'farm', 'food delivery'],
    'HRTech': ['hrtech', 'hr tech', 'human resources', 'recruiting', 'talent', 'workforce'],
    'LegalTech': ['legaltech', 'legal tech', 'contract', 'compliance'],
    'Cybersecurity': ['cybersecurity', 'security', 'infosec', 'data protection'],
  };

  const foundSectors = new Set<string>();
  const combinedText = texts.filter(Boolean).join(' ').toLowerCase();
  
  for (const [sector, keywords] of Object.entries(sectorKeywords)) {
    if (keywords.some(kw => combinedText.includes(kw))) {
      foundSectors.add(sector);
    }
  }
  
  return Array.from(foundSectors);
}

/**
 * Extract keywords/themes from market and problem descriptions
 */
function extractKeywordsFromText(texts: (string | null)[]): string[] {
  const themeKeywords = [
    'automation', 'digitization', 'remote work', 'hybrid work', 'creator economy',
    'no-code', 'low-code', 'api-first', 'developer tools', 'devtools',
    'analytics', 'data', 'personalization', 'community', 'collaboration',
    'workflow', 'productivity', 'embedded finance', 'banking as a service',
    'infrastructure', 'platform', 'vertical saas', 'horizontal saas',
    'enterprise', 'smb', 'prosumer', 'freemium', 'plg', 'product-led',
    'self-serve', 'sales-led', 'network effects', 'flywheel',
    'recurring revenue', 'subscription', 'transaction-based', 'usage-based',
    'cross-border', 'global', 'emerging markets', 'underserved',
  ];
  
  const foundKeywords = new Set<string>();
  const combinedText = texts.filter(Boolean).join(' ').toLowerCase();
  
  for (const keyword of themeKeywords) {
    if (combinedText.includes(keyword)) {
      foundKeywords.add(keyword);
    }
  }
  
  return Array.from(foundKeywords).slice(0, 10);
}

/**
 * Check if text indicates revenue/customers
 */
function hasRevenueSignals(text: string | null): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  const positiveSignals = ['revenue', 'arr', 'mrr', 'paying customer', 'generated', 'earning'];
  const negativeSignals = ['no revenue', 'pre-revenue', 'not yet generating', '0 revenue', 'zero revenue'];
  
  if (negativeSignals.some(s => lower.includes(s))) return false;
  return positiveSignals.some(s => lower.includes(s));
}

/**
 * Extract customer count from text
 */
function extractCustomerCount(text: string | null): number | null {
  if (!text) return null;
  
  // Match patterns like "5 customers", "15 paying customers", "50+ clients"
  const match = text.match(/(\d+)\+?\s*(?:paying\s+)?(?:customers?|clients?|users?|companies|enterprises)/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

export function useStartupMatchingProfile(companyId: string | null, company: { stage?: string; category?: string } | null) {
  return useQuery({
    queryKey: ['startup-matching-profile', companyId],
    queryFn: async (): Promise<EnrichedStartupProfile> => {
      if (!companyId) {
        return {
          stage: company?.stage || null,
          category: company?.category || null,
          sectors: company?.category ? [company.category] : [],
          keywords: [],
          fundingAsk: null,
          currentMRR: null,
          currentARR: null,
          targetARR: null,
          hasRevenue: false,
          hasCustomers: false,
          customerCount: null,
          marketSize: null,
          businessModel: null,
          dataCompleteness: 10,
        };
      }

      const { data: responses, error } = await supabase
        .from('memo_responses')
        .select('question_key, answer')
        .eq('company_id', companyId);

      if (error) throw error;

      const getAnswer = (keys: string[]): string | null => {
        for (const key of keys) {
          const response = responses?.find(r => r.question_key === key);
          if (response?.answer) return response.answer;
        }
        return null;
      };

      // Extract key data points
      const visionAsk = getAnswer(['vision_ask', 'traction_funding', 'financial_ask']);
      const currentMRR = getAnswer(['financial_current_mrr', 'traction_revenue', 'mrr']);
      const tractionRevenue = getAnswer(['traction_revenue', 'financial_arr_target', 'projected_arr']);
      const marketSize = getAnswer(['market_size', 'market_tam']);
      const businessModel = getAnswer(['business_model', 'business_model_revenue', 'usp_business_model']);
      const problemDesc = getAnswer(['problem_core', 'problem_description', 'problem_validation']);
      const solutionDesc = getAnswer(['solution_core', 'solution_description']);
      const tractionCustomers = getAnswer(['traction_key_customers', 'traction_milestones']);
      const competitorInfo = getAnswer(['competitors', 'competition_competitors', 'competitive_moat']);

      // Parse funding ask
      const fundingAsk = parseCurrencyValue(visionAsk);
      
      // Parse financial metrics
      const parsedMRR = parseCurrencyValue(currentMRR);
      const parsedARR = parsedMRR ? parsedMRR * 12 : parseCurrencyValue(tractionRevenue);
      const targetARR = parseCurrencyValue(getAnswer(['financial_arr_target', 'projected_arr']));

      // Extract sectors from all relevant text
      const allTexts = [businessModel, problemDesc, solutionDesc, marketSize, competitorInfo, company?.category];
      const extractedSectors = extractSectorsFromText(allTexts);
      
      // Combine with company category
      const sectors = company?.category 
        ? [...new Set([company.category, ...extractedSectors])]
        : extractedSectors;

      // Extract keywords/themes
      const keywords = extractKeywordsFromText(allTexts);

      // Revenue/customer signals
      const hasRevenue = hasRevenueSignals(currentMRR) || hasRevenueSignals(tractionRevenue) || (parsedMRR !== null && parsedMRR > 0);
      const customerCount = extractCustomerCount(tractionCustomers) || extractCustomerCount(tractionRevenue);
      const hasCustomers = customerCount !== null && customerCount > 0;

      // Calculate data completeness
      let completeness = 0;
      if (company?.stage) completeness += 15;
      if (sectors.length > 0) completeness += 20;
      if (fundingAsk) completeness += 20;
      if (parsedMRR || parsedARR) completeness += 15;
      if (hasCustomers) completeness += 10;
      if (businessModel) completeness += 10;
      if (marketSize) completeness += 10;

      return {
        stage: company?.stage || null,
        category: company?.category || null,
        sectors,
        keywords,
        fundingAsk,
        currentMRR: parsedMRR,
        currentARR: parsedARR,
        targetARR,
        hasRevenue,
        hasCustomers,
        customerCount,
        marketSize,
        businessModel,
        dataCompleteness: Math.min(completeness, 100),
      };
    },
    enabled: !!companyId || !!company,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
