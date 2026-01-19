/**
 * Startup-to-Investor affinity calculator
 * Matches startup profile data against investor/fund criteria
 */

export interface StartupProfile {
  stage?: string | null;
  category?: string | null;
  sector?: string[] | null;
  location?: string | null;
  fundingAsk?: number | null;
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
  type: 'stage' | 'sector' | 'keyword' | 'ticket' | 'location';
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

// Sector keyword matching
const SECTOR_KEYWORDS: Record<string, string[]> = {
  'saas': ['saas', 'software', 'b2b software', 'enterprise software'],
  'fintech': ['fintech', 'financial technology', 'payments', 'banking', 'insurtech', 'defi', 'crypto'],
  'healthtech': ['healthtech', 'health tech', 'medtech', 'digital health', 'healthcare', 'biotech'],
  'ai/ml': ['ai', 'ml', 'artificial intelligence', 'machine learning', 'deep learning', 'llm', 'generative ai'],
  'climate': ['climate', 'cleantech', 'green tech', 'sustainability', 'renewable', 'carbon'],
  'consumer': ['consumer', 'dtc', 'd2c', 'b2c', 'e-commerce', 'retail'],
  'b2b': ['b2b', 'enterprise', 'business software'],
  'marketplace': ['marketplace', 'platform', 'two-sided'],
  'deeptech': ['deeptech', 'deep tech', 'hardware', 'robotics', 'quantum', 'space'],
  'edtech': ['edtech', 'education', 'learning', 'e-learning'],
  'proptech': ['proptech', 'real estate', 'property'],
  'legaltech': ['legaltech', 'legal tech', 'law'],
  'foodtech': ['foodtech', 'food tech', 'agtech', 'agriculture'],
  'mobility': ['mobility', 'transportation', 'logistics', 'automotive'],
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

  // Stage match (35 points max)
  if (startup.stage && investor.stages?.length) {
    const startupStageNorm = normalizeStage(startup.stage);
    const matchedStage = investor.stages.find(s => normalizeStage(s) === startupStageNorm);
    if (matchedStage) {
      totalScore += 35;
      signals.push({ type: 'stage', label: startup.stage, strength: 'high' });
    }
  }

  // Sector/Category match (30 points max)
  const startupSectors = [
    startup.category,
    ...(startup.sector || [])
  ].filter(Boolean) as string[];
  
  if (startupSectors.length && investor.investment_focus?.length) {
    const matchedSectors = startupSectors.filter(s => 
      matchesSector(s, investor.investment_focus!)
    );
    if (matchedSectors.length > 0) {
      totalScore += Math.min(matchedSectors.length * 15, 30);
      signals.push({ 
        type: 'sector', 
        label: matchedSectors.slice(0, 2).join(', '), 
        strength: matchedSectors.length >= 2 ? 'high' : 'medium' 
      });
    }
  }

  // Thesis keyword match (20 points max)
  if (investor.thesis_keywords?.length && startupSectors.length) {
    const keywordMatches = investor.thesis_keywords.filter(kw => {
      const kwLower = kw.toLowerCase();
      return startupSectors.some(s => 
        s.toLowerCase().includes(kwLower) || kwLower.includes(s.toLowerCase())
      );
    });
    if (keywordMatches.length > 0) {
      totalScore += Math.min(keywordMatches.length * 10, 20);
      signals.push({ 
        type: 'keyword', 
        label: keywordMatches.slice(0, 2).join(', '), 
        strength: keywordMatches.length >= 2 ? 'high' : 'medium' 
      });
    }
  }

  // Ticket size match (15 points)
  if (startup.fundingAsk && (investor.ticket_size_min || investor.ticket_size_max)) {
    const min = investor.ticket_size_min || 0;
    const max = investor.ticket_size_max || Infinity;
    if (startup.fundingAsk >= min && startup.fundingAsk <= max) {
      totalScore += 15;
      signals.push({ type: 'ticket', label: 'Ticket size fits', strength: 'high' });
    } else if (startup.fundingAsk >= min * 0.5 && startup.fundingAsk <= max * 1.5) {
      totalScore += 7;
      signals.push({ type: 'ticket', label: 'Near ticket range', strength: 'medium' });
    }
  }

  const percentage = Math.min(Math.round(totalScore), 100);
  
  // Determine tier
  let tier: StartupAffinityResult['tier'] = 'low';
  if (percentage >= 65) tier = 'strong';
  else if (percentage >= 45) tier = 'good';
  else if (percentage >= 25) tier = 'partial';

  return { score: totalScore, percentage, matchSignals: signals, tier };
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
    case 'ticket': return 'DollarSign';
    case 'location': return 'MapPin';
    default: return 'Circle';
  }
};
