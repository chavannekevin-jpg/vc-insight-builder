/**
 * Startup-to-Investor affinity calculator
 * Matches startup profile data against investor/fund criteria
 */

export interface StartupProfile {
  stage?: string | null;
  category?: string | null;
  sector?: string[] | null;
  keywords?: string[] | null;
  location?: string | null;
  fundingAsk?: number | null;
  hasRevenue?: boolean;
  hasCustomers?: boolean;
  currentARR?: number | null;
}

export interface InvestorCriteria {
  stages?: string[] | null;
  investment_focus?: string[] | null;
  thesis_keywords?: string[] | null;
  ticket_size_min?: number | null;
  ticket_size_max?: number | null;
  city?: string | null;
}

export interface StartupAffinityResult {
  score: number;
  percentage: number;
  matchSignals: MatchSignal[];
  tier: 'strong' | 'good' | 'partial' | 'low';
}

export interface MatchSignal {
  type: 'stage' | 'sector' | 'keyword' | 'ticket' | 'location' | 'traction' | 'theme';
  label: string;
  strength: 'high' | 'medium' | 'low';
}

// Stage normalization map
const STAGE_ALIASES: Record<string, string[]> = {
  'pre-seed': ['pre-seed', 'preseed', 'pre seed', 'idea', 'concept'],
  'seed': ['seed', 'angel', 'early'],
  'series a': ['series a', 'series-a', 'a round'],
  'series b': ['series b', 'series-b', 'b round'],
  'series c+': ['series c', 'series-c', 'series c+', 'growth', 'late stage', 'expansion'],
};

// Sector keyword matching - expanded
const SECTOR_KEYWORDS: Record<string, string[]> = {
  'saas': ['saas', 'software', 'b2b software', 'enterprise software', 'cloud', 'subscription'],
  'fintech': ['fintech', 'financial technology', 'payments', 'banking', 'insurtech', 'defi', 'crypto', 'lending', 'neobank'],
  'healthtech': ['healthtech', 'health tech', 'medtech', 'digital health', 'healthcare', 'biotech', 'clinical', 'telemedicine'],
  'ai/ml': ['ai', 'ml', 'artificial intelligence', 'machine learning', 'deep learning', 'llm', 'generative ai', 'nlp', 'computer vision'],
  'climate': ['climate', 'cleantech', 'green tech', 'sustainability', 'renewable', 'carbon', 'energy transition'],
  'consumer': ['consumer', 'dtc', 'd2c', 'b2c', 'e-commerce', 'retail', 'ecommerce'],
  'b2b': ['b2b', 'enterprise', 'business software', 'smb', 'sme'],
  'marketplace': ['marketplace', 'platform', 'two-sided', 'network effects'],
  'deeptech': ['deeptech', 'deep tech', 'hardware', 'robotics', 'quantum', 'space', 'semiconductor'],
  'edtech': ['edtech', 'education', 'learning', 'e-learning', 'training'],
  'proptech': ['proptech', 'real estate', 'property', 'construction'],
  'legaltech': ['legaltech', 'legal tech', 'law', 'compliance'],
  'foodtech': ['foodtech', 'food tech', 'agtech', 'agriculture'],
  'mobility': ['mobility', 'transportation', 'logistics', 'automotive', 'fleet'],
  'hrtech': ['hrtech', 'hr tech', 'human resources', 'recruiting', 'talent'],
  'cybersecurity': ['cybersecurity', 'security', 'infosec', 'data protection'],
};

// Theme keywords that investors often focus on
const THEME_KEYWORDS: Record<string, string[]> = {
  'automation': ['automation', 'automate', 'autonomous'],
  'developer-tools': ['developer tools', 'devtools', 'api-first', 'api first', 'sdk'],
  'no-code': ['no-code', 'low-code', 'no code', 'low code'],
  'analytics': ['analytics', 'data analytics', 'business intelligence', 'bi tool'],
  'vertical-saas': ['vertical saas', 'vertical software', 'industry-specific'],
  'plg': ['product-led', 'plg', 'self-serve', 'freemium', 'bottoms-up'],
  'infrastructure': ['infrastructure', 'infra', 'backend', 'middleware'],
  'embedded': ['embedded finance', 'embedded', 'banking as a service', 'baas'],
  'creator': ['creator economy', 'creator', 'influencer'],
  'remote': ['remote work', 'remote-first', 'distributed', 'hybrid work'],
};

/**
 * Normalize stage string for comparison
 */
const normalizeStage = (stage: string): string => {
  const lower = stage.toLowerCase().trim();
  for (const [canonical, aliases] of Object.entries(STAGE_ALIASES)) {
    if (aliases.some(alias => lower.includes(alias))) {
      return canonical;
    }
  }
  return lower;
};

/**
 * Check if startup sector matches investor focus
 */
const matchesSector = (startupSector: string, investorFocus: string[]): boolean => {
  const sectorLower = startupSector.toLowerCase();
  
  // Direct match
  if (investorFocus.some(f => f.toLowerCase().includes(sectorLower) || sectorLower.includes(f.toLowerCase()))) {
    return true;
  }
  
  // Keyword expansion
  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    if (keywords.some(k => sectorLower.includes(k))) {
      if (investorFocus.some(f => {
        const fLower = f.toLowerCase();
        return keywords.some(k => fLower.includes(k)) || fLower.includes(sector);
      })) {
        return true;
      }
    }
  }
  
  return false;
};

/**
 * Check if startup keywords match investor thesis
 */
const matchesTheme = (startupKeywords: string[], investorThesis: string[]): string[] => {
  const matches: string[] = [];
  const investorLower = investorThesis.map(t => t.toLowerCase());
  
  for (const keyword of startupKeywords) {
    const kwLower = keyword.toLowerCase();
    
    // Direct match
    if (investorLower.some(t => t.includes(kwLower) || kwLower.includes(t))) {
      matches.push(keyword);
      continue;
    }
    
    // Theme expansion
    for (const [theme, themeKws] of Object.entries(THEME_KEYWORDS)) {
      if (themeKws.some(tk => kwLower.includes(tk))) {
        if (investorLower.some(t => themeKws.some(tk => t.includes(tk)) || t.includes(theme))) {
          matches.push(keyword);
          break;
        }
      }
    }
  }
  
  return [...new Set(matches)];
};

/**
 * Calculate affinity between a startup and an investor/fund
 */
export const calculateStartupAffinity = (
  startup: StartupProfile | null | undefined,
  investor: InvestorCriteria | null | undefined
): StartupAffinityResult => {
  if (!startup || !investor) {
    return { score: 0, percentage: 0, matchSignals: [], tier: 'low' };
  }

  const signals: MatchSignal[] = [];
  let totalScore = 0;

  // Stage match (30 points max)
  if (startup.stage && investor.stages?.length) {
    const startupStageNorm = normalizeStage(startup.stage);
    const matchedStage = investor.stages.find(s => normalizeStage(s) === startupStageNorm);
    if (matchedStage) {
      totalScore += 30;
      signals.push({ type: 'stage', label: startup.stage, strength: 'high' });
    }
  }

  // Sector/Category match (25 points max)
  const startupSectors = [
    startup.category,
    ...(startup.sector || [])
  ].filter(Boolean) as string[];
  
  if (startupSectors.length && investor.investment_focus?.length) {
    const matchedSectors = startupSectors.filter(s => 
      matchesSector(s, investor.investment_focus!)
    );
    if (matchedSectors.length > 0) {
      totalScore += Math.min(matchedSectors.length * 12, 25);
      signals.push({ 
        type: 'sector', 
        label: matchedSectors.slice(0, 2).join(', '), 
        strength: matchedSectors.length >= 2 ? 'high' : 'medium' 
      });
    }
  }

  // Thesis keyword/theme match (20 points max)
  const allStartupThemes = [
    ...(startup.keywords || []),
    ...startupSectors
  ];
  
  if (investor.thesis_keywords?.length && allStartupThemes.length) {
    const themeMatches = matchesTheme(allStartupThemes, investor.thesis_keywords);
    if (themeMatches.length > 0) {
      totalScore += Math.min(themeMatches.length * 7, 20);
      signals.push({ 
        type: 'theme', 
        label: themeMatches.slice(0, 2).join(', '), 
        strength: themeMatches.length >= 2 ? 'high' : 'medium' 
      });
    }
  }

  // Ticket size match (15 points max)
  if (startup.fundingAsk && (investor.ticket_size_min || investor.ticket_size_max)) {
    const min = investor.ticket_size_min || 0;
    const max = investor.ticket_size_max || Infinity;
    if (startup.fundingAsk >= min && startup.fundingAsk <= max) {
      totalScore += 15;
      signals.push({ type: 'ticket', label: `€${formatNumber(startup.fundingAsk)} ask`, strength: 'high' });
    } else if (startup.fundingAsk >= min * 0.5 && startup.fundingAsk <= max * 1.5) {
      totalScore += 7;
      signals.push({ type: 'ticket', label: 'Near ticket range', strength: 'medium' });
    }
  }

  // Traction bonus (10 points max) - investors prefer companies with proof points
  if (startup.hasRevenue || startup.hasCustomers) {
    let tractionPoints = 0;
    const tractionLabels: string[] = [];
    
    if (startup.hasRevenue) {
      tractionPoints += 5;
      if (startup.currentARR) {
        tractionLabels.push(`€${formatNumber(startup.currentARR)} ARR`);
      } else {
        tractionLabels.push('Has revenue');
      }
    }
    if (startup.hasCustomers) {
      tractionPoints += 5;
      if (!startup.hasRevenue) {
        tractionLabels.push('Has customers');
      }
    }
    
    if (tractionPoints > 0) {
      totalScore += tractionPoints;
      signals.push({ 
        type: 'traction', 
        label: tractionLabels.join(', '),
        strength: startup.hasRevenue && startup.hasCustomers ? 'high' : 'medium'
      });
    }
  }

  const percentage = Math.min(Math.round(totalScore), 100);
  
  // Determine tier
  let tier: StartupAffinityResult['tier'] = 'low';
  if (percentage >= 60) tier = 'strong';
  else if (percentage >= 40) tier = 'good';
  else if (percentage >= 20) tier = 'partial';

  return { score: totalScore, percentage, matchSignals: signals, tier };
};

/**
 * Format number for display
 */
const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
};

/**
 * Get styling for match tier
 */
export const getMatchTierStyle = (tier: StartupAffinityResult['tier']) => {
  switch (tier) {
    case 'strong':
      return {
        bg: 'bg-primary/20',
        text: 'text-primary',
        border: 'border-primary/40',
        glow: 'shadow-[0_0_12px_rgba(236,72,153,0.3)]',
        label: 'Strong Match'
      };
    case 'good':
      return {
        bg: 'bg-green-500/20',
        text: 'text-green-400',
        border: 'border-green-500/40',
        glow: '',
        label: 'Good Match'
      };
    case 'partial':
      return {
        bg: 'bg-yellow-500/15',
        text: 'text-yellow-400',
        border: 'border-yellow-500/30',
        glow: '',
        label: 'Partial Match'
      };
    default:
      return {
        bg: 'bg-muted/50',
        text: 'text-muted-foreground',
        border: 'border-border',
        glow: '',
        label: 'Low Match'
      };
  }
};

/**
 * Get icon for signal type
 */
export const getSignalIcon = (type: MatchSignal['type']): string => {
  switch (type) {
    case 'stage': return 'Target';
    case 'sector': return 'Briefcase';
    case 'keyword': return 'Hash';
    case 'theme': return 'Lightbulb';
    case 'ticket': return 'DollarSign';
    case 'location': return 'MapPin';
    case 'traction': return 'TrendingUp';
    default: return 'Circle';
  }
};
