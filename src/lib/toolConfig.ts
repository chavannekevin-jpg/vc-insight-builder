import { 
  Shield, Eye, Wrench, Target, TrendingUp, Users, DollarSign, 
  Rocket, Map, GitBranch, Building, Lock, Zap,
  BarChart3, Scale, Clock, Briefcase, Lightbulb, LineChart,
  AlertTriangle, CheckCircle, Activity, Swords
} from "lucide-react";
import { LucideIcon } from "lucide-react";

// Tool configuration with metadata for display
export interface ToolConfig {
  id: string;
  title: string;
  shortTitle: string;
  icon: LucideIcon;
  section: string;
  description: string;
  getQuickStat?: (data: any) => string;
  getStatus?: (data: any) => 'good' | 'warning' | 'critical' | 'neutral';
}

// Helper functions for quick stats
const safeText = (val: unknown): string => {
  if (typeof val === 'string' && val.trim()) return val;
  return '—';
};

const countItems = (arr: unknown): number => {
  return Array.isArray(arr) ? arr.length : 0;
};

export const TOOL_CONFIGS: Record<string, ToolConfig> = {
  // Problem Section Tools
  evidenceThreshold: {
    id: 'evidenceThreshold',
    title: 'Evidence Threshold',
    shortTitle: 'Evidence',
    icon: Shield,
    section: 'Problem',
    description: 'Pain point verification status',
    getQuickStat: (data) => safeText(data?.aiGenerated?.evidenceGrade || data?.evidenceGrade),
    getStatus: (data) => {
      const grade = data?.aiGenerated?.evidenceGrade || data?.evidenceGrade || '';
      if (grade === 'A' || grade === 'B') return 'good';
      if (grade === 'C') return 'warning';
      if (grade === 'D' || grade === 'F') return 'critical';
      return 'neutral';
    }
  },
  founderBlindSpot: {
    id: 'founderBlindSpot',
    title: 'Founder Blind Spots',
    shortTitle: 'Blind Spots',
    icon: Eye,
    section: 'Problem',
    description: 'Potential assumptions and biases',
    getQuickStat: (data) => {
      const ai = data?.aiGenerated || data;
      // Support both field naming conventions
      const count = countItems(ai?.potentialExaggerations || ai?.exaggerations) + 
                    countItems(ai?.misdiagnoses) + 
                    countItems(ai?.assumptions) +
                    countItems(ai?.commonMistakes);
      return count > 0 ? `${count} found` : '—';
    },
    getStatus: (data) => {
      const ai = data?.aiGenerated || data;
      const count = countItems(ai?.potentialExaggerations || ai?.exaggerations) + 
                    countItems(ai?.misdiagnoses) + 
                    countItems(ai?.assumptions) +
                    countItems(ai?.commonMistakes);
      if (count === 0) return 'good';
      if (count <= 3) return 'warning';
      return 'critical';
    }
  },

  // Solution Section Tools
  technicalDefensibility: {
    id: 'technicalDefensibility',
    title: 'Technical Defensibility',
    shortTitle: 'Defensibility',
    icon: Lock,
    section: 'Solution',
    description: 'Technical moat strength',
    getQuickStat: (data) => {
      const score = data?.aiGenerated?.defensibilityScore || data?.defensibilityScore;
      return typeof score === 'number' ? `${score}/100` : '—';
    },
    getStatus: (data) => {
      const score = data?.aiGenerated?.defensibilityScore || data?.defensibilityScore;
      if (score >= 70) return 'good';
      if (score >= 40) return 'warning';
      if (score > 0) return 'critical';
      return 'neutral';
    }
  },
  commoditizationTeardown: {
    id: 'commoditizationTeardown',
    title: 'Commoditization Teardown',
    shortTitle: 'Commoditization',
    icon: AlertTriangle,
    section: 'Solution',
    description: 'Feature replication risk',
    getQuickStat: (data) => safeText(data?.aiGenerated?.overallRisk || data?.overallRisk),
    getStatus: (data) => {
      const risk = (data?.aiGenerated?.overallRisk || data?.overallRisk || '').toLowerCase();
      if (risk.includes('low')) return 'good';
      if (risk.includes('medium')) return 'warning';
      if (risk.includes('high')) return 'critical';
      return 'neutral';
    }
  },
  competitorBuildAnalysis: {
    id: 'competitorBuildAnalysis',
    title: 'Competitor Build Analysis',
    shortTitle: 'Build Analysis',
    icon: Wrench,
    section: 'Solution',
    description: 'Can competitors replicate?',
    getQuickStat: (data) => {
      const couldBuild = data?.aiGenerated?.couldBeBuilt ?? data?.couldBeBuilt;
      return couldBuild === true ? 'Yes' : couldBuild === false ? 'No' : '—';
    },
    getStatus: (data) => {
      const couldBuild = data?.aiGenerated?.couldBeBuilt ?? data?.couldBeBuilt;
      return couldBuild === false ? 'good' : couldBuild === true ? 'critical' : 'neutral';
    }
  },

  // Market Section Tools
  bottomsUpTAM: {
    id: 'bottomsUpTAM',
    title: 'TAM Calculator',
    shortTitle: 'TAM',
    icon: BarChart3,
    section: 'Market',
    description: 'Bottom-up market sizing',
    getQuickStat: (data) => {
      const tam = data?.aiGenerated?.totalTAM || data?.totalTAM;
      if (typeof tam === 'number') {
        if (tam >= 1e9) return `$${(tam / 1e9).toFixed(1)}B`;
        if (tam >= 1e6) return `$${(tam / 1e6).toFixed(0)}M`;
        return `$${tam.toLocaleString()}`;
      }
      return '—';
    },
    getStatus: () => 'neutral'
  },
  marketReadinessIndex: {
    id: 'marketReadinessIndex',
    title: 'Market Readiness Index',
    shortTitle: 'Readiness',
    icon: Activity,
    section: 'Market',
    description: 'Market timing assessment',
    getQuickStat: (data) => {
      const ai = data?.aiGenerated || data;
      const factors = [ai?.regulatoryPressure, ai?.marketUrgency, ai?.willingnessToPay, ai?.switchingFriction];
      const valid = factors.filter(f => typeof f?.score === 'number');
      if (valid.length === 0) return '—';
      const avg = Math.round(valid.reduce((sum, f) => sum + f.score, 0) / valid.length);
      return `${avg}/100`;
    },
    getStatus: (data) => {
      const ai = data?.aiGenerated || data;
      const factors = [ai?.regulatoryPressure, ai?.marketUrgency, ai?.willingnessToPay, ai?.switchingFriction];
      const valid = factors.filter(f => typeof f?.score === 'number');
      if (valid.length === 0) return 'neutral';
      const avg = valid.reduce((sum, f) => sum + f.score, 0) / valid.length;
      if (avg >= 70) return 'good';
      if (avg >= 40) return 'warning';
      return 'critical';
    }
  },
  vcMarketNarrative: {
    id: 'vcMarketNarrative',
    title: 'VC Market Narrative',
    shortTitle: 'Narrative',
    icon: Lightbulb,
    section: 'Market',
    description: 'IC pitch framing',
    getQuickStat: (data) => {
      const narrative = data?.aiGenerated?.partnerPitch || data?.partnerPitch;
      return narrative ? 'Ready' : '—';
    },
    getStatus: (data) => {
      const narrative = data?.aiGenerated?.partnerPitch || data?.partnerPitch;
      return narrative ? 'good' : 'neutral';
    }
  },

  // Competition Section Tools
  competitorChessboard: {
    id: 'competitorChessboard',
    title: 'Competitor Chessboard',
    shortTitle: 'Chessboard',
    icon: Swords,
    section: 'Competition',
    description: 'Competitive positioning map',
    getQuickStat: (data) => {
      const competitors = data?.aiGenerated?.competitors || data?.competitors;
      const count = countItems(competitors);
      return count > 0 ? `${count} tracked` : '—';
    },
    getStatus: () => 'neutral'
  },
  moatDurability: {
    id: 'moatDurability',
    title: 'Moat Durability',
    shortTitle: 'Moat',
    icon: Building,
    section: 'Competition',
    description: 'Defensive moat longevity',
    getQuickStat: (data) => {
      // Support both field naming conventions
      const strength = data?.aiGenerated?.currentMoatStrength ?? data?.currentMoatStrength ?? data?.aiGenerated?.moatStrength ?? data?.moatStrength;
      if (typeof strength === 'number') return `${strength}/100`;
      if (typeof strength === 'string') return strength;
      return '—';
    },
    getStatus: (data) => {
      const strength = data?.aiGenerated?.currentMoatStrength ?? data?.currentMoatStrength ?? data?.aiGenerated?.moatStrength ?? data?.moatStrength;
      if (typeof strength === 'number') {
        if (strength >= 70) return 'good';
        if (strength >= 40) return 'warning';
        return 'critical';
      }
      const strVal = (strength || '').toString().toLowerCase();
      if (strVal.includes('strong') || strVal.includes('high')) return 'good';
      if (strVal.includes('moderate') || strVal.includes('medium')) return 'warning';
      if (strVal.includes('weak') || strVal.includes('low')) return 'critical';
      return 'neutral';
    }
  },

  // Team Section Tools
  credibilityGapAnalysis: {
    id: 'credibilityGapAnalysis',
    title: 'Team Credibility Gap',
    shortTitle: 'Credibility',
    icon: Users,
    section: 'Team',
    description: 'Skills vs. requirements',
    getQuickStat: (data) => {
      const score = data?.aiGenerated?.overallCredibilityScore || data?.overallCredibilityScore;
      return typeof score === 'number' ? `${score}/100` : '—';
    },
    getStatus: (data) => {
      const score = data?.aiGenerated?.overallCredibilityScore || data?.overallCredibilityScore;
      if (score >= 70) return 'good';
      if (score >= 40) return 'warning';
      if (score > 0) return 'critical';
      return 'neutral';
    }
  },

  // Business Model Section Tools
  modelStressTest: {
    id: 'modelStressTest',
    title: 'Model Stress Test',
    shortTitle: 'Stress Test',
    icon: Scale,
    section: 'Business Model',
    description: 'Downside scenario analysis',
    getQuickStat: (data) => safeText(data?.aiGenerated?.overallResilience || data?.overallResilience),
    getStatus: (data) => {
      const resilience = (data?.aiGenerated?.overallResilience || data?.overallResilience || '').toLowerCase();
      if (resilience.includes('high') || resilience.includes('strong')) return 'good';
      if (resilience.includes('moderate') || resilience.includes('medium')) return 'warning';
      if (resilience.includes('low') || resilience.includes('weak')) return 'critical';
      return 'neutral';
    }
  },

  // Traction Section Tools
  tractionDepthTest: {
    id: 'tractionDepthTest',
    title: 'Traction Depth Test',
    shortTitle: 'Depth Test',
    icon: LineChart,
    section: 'Traction',
    description: 'Quality vs. vanity metrics',
    getQuickStat: (data) => {
      const score = data?.aiGenerated?.sustainabilityScore || data?.sustainabilityScore;
      return typeof score === 'number' ? `${score}/100` : '—';
    },
    getStatus: (data) => {
      const score = data?.aiGenerated?.sustainabilityScore || data?.sustainabilityScore;
      if (score >= 70) return 'good';
      if (score >= 40) return 'warning';
      if (score > 0) return 'critical';
      return 'neutral';
    }
  },

  // Vision Section Tools
  vcMilestoneMap: {
    id: 'vcMilestoneMap',
    title: 'Milestone Map',
    shortTitle: 'Milestones',
    icon: Map,
    section: 'Vision',
    description: 'Path to next round',
    getQuickStat: (data) => {
      const milestones = data?.aiGenerated?.milestones || data?.milestones;
      const count = countItems(milestones);
      return count > 0 ? `${count} milestones` : '—';
    },
    getStatus: () => 'neutral'
  },
  scenarioPlanning: {
    id: 'scenarioPlanning',
    title: 'Scenario Planning',
    shortTitle: 'Scenarios',
    icon: GitBranch,
    section: 'Vision',
    description: 'Best/base/downside cases',
    getQuickStat: (data) => {
      const ai = data?.aiGenerated || data;
      if (ai?.bestCase || ai?.baseCase || ai?.downside) return '3 scenarios';
      return '—';
    },
    getStatus: () => 'neutral'
  },
  exitNarrative: {
    id: 'exitNarrative',
    title: 'Exit Narrative',
    shortTitle: 'Exit Path',
    icon: Rocket,
    section: 'Vision',
    description: 'Acquirer & exit strategy',
    getQuickStat: (data) => {
      const acquirers = data?.aiGenerated?.potentialAcquirers || data?.potentialAcquirers;
      const count = countItems(acquirers);
      return count > 0 ? `${count} buyers` : '—';
    },
    getStatus: () => 'neutral'
  },

  // Cross-section tools
  vcInvestmentLogic: {
    id: 'vcInvestmentLogic',
    title: 'VC Investment Logic',
    shortTitle: 'VC Logic',
    icon: Briefcase,
    section: 'Cross-Section',
    description: 'Investment decision framework',
    getQuickStat: (data) => safeText(data?.decision),
    getStatus: (data) => {
      const decision = (data?.decision || '').toLowerCase();
      if (decision.includes('invest') || decision.includes('yes') || decision.includes('proceed')) return 'good';
      if (decision.includes('conditional') || decision.includes('maybe')) return 'warning';
      if (decision.includes('pass') || decision.includes('no')) return 'critical';
      return 'neutral';
    }
  },
  actionPlan90Day: {
    id: 'actionPlan90Day',
    title: '90-Day Action Plan',
    shortTitle: '90-Day Plan',
    icon: Clock,
    section: 'Cross-Section',
    description: 'Priority action items',
    getQuickStat: (data) => {
      const actions = data?.actions;
      const count = countItems(actions);
      return count > 0 ? `${count} actions` : '—';
    },
    getStatus: () => 'neutral'
  },
  caseStudy: {
    id: 'caseStudy',
    title: 'Case Study',
    shortTitle: 'Case Study',
    icon: Lightbulb,
    section: 'Cross-Section',
    description: 'Relevant precedent',
    getQuickStat: (data) => safeText(data?.company),
    getStatus: () => 'neutral'
  },
  leadInvestorRequirements: {
    id: 'leadInvestorRequirements',
    title: 'Lead Investor Requirements',
    shortTitle: 'Lead Reqs',
    icon: CheckCircle,
    section: 'Cross-Section',
    description: 'What lead VCs need',
    getQuickStat: (data) => {
      const reqs = data?.requirements;
      const count = countItems(reqs);
      return count > 0 ? `${count} items` : '—';
    },
    getStatus: () => 'neutral'
  },
  benchmarks: {
    id: 'benchmarks',
    title: 'Industry Benchmarks',
    shortTitle: 'Benchmarks',
    icon: TrendingUp,
    section: 'Cross-Section',
    description: 'Performance vs. peers',
    getQuickStat: (data) => {
      const count = countItems(data);
      return count > 0 ? `${count} metrics` : '—';
    },
    getStatus: () => 'neutral'
  }
};

// Mapping of section names to their specific tools
export const SECTION_TOOL_MAP: Record<string, string[]> = {
  'Problem': ['evidenceThreshold', 'founderBlindSpot'],
  'Solution': ['technicalDefensibility', 'commoditizationTeardown', 'competitorBuildAnalysis'],
  'Market': ['bottomsUpTAM', 'marketReadinessIndex', 'vcMarketNarrative'],
  'Competition': ['competitorChessboard', 'moatDurability'],
  'Team': ['credibilityGapAnalysis'],
  'Business Model': ['modelStressTest'],
  'Traction': ['tractionDepthTest'],
  'Vision': ['vcMilestoneMap', 'scenarioPlanning', 'exitNarrative']
};

// Cross-section tools that may appear for any section
export const CROSS_SECTION_TOOLS = [
  'vcInvestmentLogic',
  'actionPlan90Day', 
  'caseStudy',
  'leadInvestorRequirements',
  'benchmarks'
];

// Get tool config by id
export const getToolConfig = (toolId: string): ToolConfig | undefined => {
  return TOOL_CONFIGS[toolId];
};
