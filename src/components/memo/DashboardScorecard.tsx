import { useState, useMemo } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  Shield,
  Target,
  Share2,
  Gift,
  Users,
  FileText,
  Wrench,
  RotateCcw,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Flame,
  Lock,
  Telescope,
  ScrollText,
  Boxes,
  Globe,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { buildHolisticScorecard, type SectionVerdict } from "@/lib/holisticVerdictGenerator";
import { SectionDetailModal } from "./SectionDetailModal";
import { ShareScorecardModal } from "@/components/founder/ShareScorecardModal";
import { InviteFounderModal } from "@/components/founder/InviteFounderModal";
import { InsightWithTooltip } from "./InsightWithTooltip";
import { getStrengthHeadline, getWeaknessHeadline } from "@/lib/insightExplanations";
import { type CompanyInsightContext } from "@/lib/companyInsightContext";
import { type MemoStructuredContent } from "@/types/memo";
import { MiniToolCard } from "./MiniToolCard";
import { ToolPopupModal } from "./ToolPopupModal";
import { TOOL_CONFIGS, SECTION_TOOL_MAP, CROSS_SECTION_TOOLS } from "@/lib/toolConfig";

export interface ARCClassification {
  type: "Hair on Fire" | "Hard Fact" | "Future Vision";
  reasoning: string;
  implications: string;
  confidence?: number;
}

interface DashboardScorecardProps {
  sectionTools: Record<string, { sectionScore?: { score: number; vcBenchmark: number } }>;
  companyName: string;
  companyDescription?: string;
  stage: string;
  category?: string;
  companyId: string;
  onNavigate: (path: string) => void;
  companyInsightContext?: CompanyInsightContext | null;
  memoContent?: MemoStructuredContent | null;
  arcClassification?: ARCClassification | null;
  isDemo?: boolean;
}

const STATUS_CONFIG = {
  critical: {
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    icon: XCircle,
    label: 'CRITICAL'
  },
  weak: {
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    icon: AlertTriangle,
    label: 'WEAK'
  },
  passing: {
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/30',
    icon: CheckCircle2,
    label: 'PASS'
  },
  strong: {
    color: 'text-success',
    bg: 'bg-success/15',
    border: 'border-success/40',
    icon: TrendingUp,
    label: 'STRONG'
  }
};

const READINESS_CONFIG = {
  'NOT_READY': {
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    label: 'Not Ready',
    glow: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]'
  },
  'CONDITIONAL': {
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    label: 'Conditional',
    glow: 'shadow-[0_0_30px_rgba(234,179,8,0.3)]'
  },
  'READY': {
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/30',
    label: 'Ready',
    glow: 'shadow-[0_0_30px_rgba(34,197,94,0.3)]'
  }
};

// Memo section order - follows the investment analysis structure
const MEMO_SECTION_ORDER = [
  "Problem",
  "Solution", 
  "Market",
  "Competition",
  "Team",
  "Business Model",
  "Traction",
  "Vision"
];

// Section icons mapping
const SECTION_ICONS: Record<string, React.ReactNode> = {
  'Problem': <AlertTriangle className="w-4 h-4" />,
  'Solution': <Zap className="w-4 h-4" />,
  'Market': <TrendingUp className="w-4 h-4" />,
  'Competition': <Users className="w-4 h-4" />,
  'Team': <Users className="w-4 h-4" />,
  'Business Model': <Target className="w-4 h-4" />,
  'Traction': <TrendingUp className="w-4 h-4" />,
  'Vision': <Sparkles className="w-4 h-4" />
};

// Mini section card for the grid - premium design
const MiniSectionCard = ({ 
  section, 
  onClick,
  index
}: { 
  section: SectionVerdict; 
  onClick: () => void;
  index: number;
}) => {
  const config = STATUS_CONFIG[section.status];
  const StatusIcon = config.icon;
  const sectionIcon = SECTION_ICONS[section.section] || <FileText className="w-4 h-4" />;
  const scoreDelta = section.score - section.benchmark;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl border transition-all duration-300 text-left w-full",
        "bg-gradient-to-br from-card via-card to-muted/20",
        "hover:from-card hover:via-muted/10 hover:to-primary/5",
        "border-border/50",
        "group hover:scale-[1.01] cursor-pointer hover:shadow-lg hover:border-primary/40"
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-300" />
      
      {/* Section number indicator */}
      <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-muted/50 flex items-center justify-center">
        <span className="text-[10px] font-medium text-muted-foreground">{index + 1}</span>
      </div>
      
      <div className="relative z-10 p-4 pt-8">
        {/* Section header with icon */}
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-muted/50">
            <span className="text-muted-foreground">{sectionIcon}</span>
          </div>
          <span className="text-base font-bold text-foreground tracking-tight">
            {section.section}
          </span>
        </div>
        
        {/* Score display */}
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-semibold tabular-nums text-foreground">
              {section.score}
            </span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
          
          {/* Status badge */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-muted/50 text-muted-foreground">
            <StatusIcon className="w-3 h-3" />
            {config.label}
          </div>
        </div>
        
        
      </div>
    </button>
  );
};

// Custom tooltip for radar chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg text-xs">
        <p className="font-semibold text-foreground">{data.fullSection || data.section}</p>
        <div className="flex items-center gap-3 mt-1">
          <span>Score: <span className="font-bold text-primary">{data.score}</span></span>
          <span className="text-muted-foreground">Benchmark: {data.benchmark}</span>
        </div>
      </div>
    );
  }
  return null;
};

// ARC type config for inline display - simplified user-friendly explanations
const ARC_CONFIG = {
  "Hair on Fire": {
    icon: Flame,
    accentColor: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    headline: "Your customers have a burning problem",
    explanation: "People are actively searching for a solution right now. They feel the pain daily and will pay to make it stop. This is the easiest type of startup to sell — your job is to be found when they're looking.",
    strategy: "Focus on being discoverable. SEO, paid ads, and sales outreach work well because customers are already hunting for you."
  },
  "Hard Fact": {
    icon: Lock,
    accentColor: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    headline: "Your customers don't realize their problem yet",
    explanation: "There's a real issue, but people have accepted it as 'just the way things are.' You need to wake them up and show them a better way exists. Think of it like selling vitamins — they help, but people don't feel the urgency.",
    strategy: "Invest in education and thought leadership. Show customers what they're missing before they'll buy."
  },
  "Future Vision": {
    icon: Telescope,
    accentColor: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
    headline: "You're creating something new",
    explanation: "You're betting on a future that doesn't exist yet. Customers may not understand what you're building or why they'd want it. This is the hardest path — but also how category-defining companies are built.",
    strategy: "Find early believers who share your vision. Build community and prove your concept before scaling."
  }
};

export const DashboardScorecard = ({ 
  sectionTools, 
  companyName,
  companyDescription,
  stage, 
  category,
  companyId,
  onNavigate,
  companyInsightContext,
  memoContent,
  arcClassification,
  isDemo = false
}: DashboardScorecardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isARCExpanded, setIsARCExpanded] = useState(false);
  const [isThesisExpanded, setIsThesisExpanded] = useState(true);
  const [isToolsExpanded, setIsToolsExpanded] = useState(true);
  const [selectedSection, setSelectedSection] = useState<SectionVerdict | null>(null);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [shareScorecardOpen, setShareScorecardOpen] = useState(false);
  const [inviteFounderOpen, setInviteFounderOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<{ id: string; toolType: string; data: any; sectionName: string } | null>(null);
  const [toolModalOpen, setToolModalOpen] = useState(false);
  
  const scorecard = useMemo(() => {
    console.log('[DashboardScorecard] sectionTools received:', sectionTools ? Object.keys(sectionTools) : 'null');
    return buildHolisticScorecard(sectionTools, companyName, stage, category);
  }, [sectionTools, companyName, stage, category]);

  const bestStrengthCandidate = useMemo(() => {
    if (scorecard.topStrengths.length > 0) {
      return { sectionName: scorecard.topStrengths[0], isTrueStrength: true };
    }

    const best = scorecard.sections
      .map((s) => ({
        sectionName: s.section,
        delta: s.score - s.benchmark,
      }))
      .sort((a, b) => b.delta - a.delta)[0];

    if (!best) return null;
    return { sectionName: best.sectionName, isTrueStrength: best.delta >= 0 };
  }, [scorecard.sections, scorecard.topStrengths]);
  
  const radarData = useMemo(() => 
    scorecard.sections.map(s => ({
      section: s.section === 'Business Model' ? 'Biz Model' : s.section,
      fullSection: s.section,
      score: s.score,
      benchmark: s.benchmark,
      fullMark: 100
    })),
    [scorecard]
  );
  
  // Build allSectionScores for AI context
  const allSectionScores = useMemo(() => {
    const scores: Record<string, { score: number; benchmark: number }> = {};
    scorecard.sections.forEach(s => {
      scores[s.section] = { score: s.score, benchmark: s.benchmark };
    });
    return scores;
  }, [scorecard]);
  
  const readinessConfig = READINESS_CONFIG[scorecard.investmentReadiness];
  const isEligibleForIntro = scorecard.overallScore >= 60;
  
  const scoreColor = scorecard.overallScore >= 65 ? 'border-success' :
                     scorecard.overallScore >= 50 ? 'border-warning' : 'border-destructive';
  
  const scoreGlow = scorecard.overallScore >= 65 ? 'shadow-[0_0_25px_rgba(34,197,94,0.25)]' :
                    scorecard.overallScore >= 50 ? 'shadow-[0_0_25px_rgba(234,179,8,0.25)]' : 
                    'shadow-[0_0_25px_rgba(239,68,68,0.25)]';
  
  // Find section narrative from memo content
  const findSectionNarrative = (sectionName: string) => {
    if (!memoContent?.sections) return null;
    return memoContent.sections.find(s => 
      s.title?.toLowerCase().includes(sectionName.toLowerCase()) ||
      sectionName.toLowerCase().includes(s.title?.toLowerCase() || '')
    ) || null;
  };

  // Find section tools from sectionTools prop
  const findSectionTools = (sectionName: string) => {
    if (!sectionTools) return null;
    // Try direct match first
    if (sectionTools[sectionName]) return sectionTools[sectionName];
    // Try normalized matching
    const normalizedName = sectionName.toLowerCase().replace(/\s+/g, '');
    const key = Object.keys(sectionTools).find(k => 
      k.toLowerCase().replace(/\s+/g, '') === normalizedName
    );
    return key ? sectionTools[key] : null;
  };

  // Extract investment thesis from memo content
  const investmentThesis = useMemo(() => {
    if (!memoContent?.sections) return null;
    const thesisSection = memoContent.sections.find(s => 
      s.title?.toLowerCase().includes('thesis') || 
      s.title?.toLowerCase().includes('investment')
    );
    if (!thesisSection) return null;
    
    // Extract first paragraph as summary
    const paragraphs = thesisSection.narrative?.paragraphs || thesisSection.paragraphs || [];
    const firstParagraph = paragraphs[0]?.text || '';
    
    // Extract key points
    const keyPoints = thesisSection.narrative?.keyPoints || thesisSection.keyPoints || [];
    
    return {
      summary: firstParagraph,
      keyPoints: keyPoints.slice(0, 3),
      fullSection: thesisSection
    };
  }, [memoContent]);

  // Helper to map tool names from sectionTools to config keys
  const toolNameMapping: Record<string, string> = {
    'evidenceThreshold': 'evidenceThreshold',
    'founderBlindSpot': 'founderBlindSpot',
    'technicalDefensibility': 'technicalDefensibility',
    'commoditizationTeardown': 'commoditizationTeardown',
    'competitorBuildAnalysis': 'competitorBuildAnalysis',
    'bottomsUpTAM': 'bottomsUpTAM',
    'marketReadinessIndex': 'marketReadinessIndex',
    'vcMarketNarrative': 'vcMarketNarrative',
    'competitorChessboard': 'competitorChessboard',
    'moatDurability': 'moatDurability',
    'credibilityGapAnalysis': 'credibilityGapAnalysis',
    'modelStressTest': 'modelStressTest',
    'tractionDepthTest': 'tractionDepthTest',
    'vcMilestoneMap': 'vcMilestoneMap',
    'scenarioPlanning': 'scenarioPlanning',
    'exitNarrative': 'exitNarrative',
    'vcInvestmentLogic': 'vcInvestmentLogic',
    'actionPlan90Day': 'actionPlan90Day',
    'caseStudy': 'caseStudy',
    'leadInvestorRequirements': 'leadInvestorRequirements',
    'benchmarks': 'benchmarks'
  };

  // Build available tools from sectionTools data
  // Filter out cross-section tools (they go in section modals instead)
  const CROSS_SECTION_TOOL_NAMES = ['vcInvestmentLogic', 'actionPlan90Day', 'caseStudy', 'leadInvestorRequirements', 'benchmarks', 'vcMarketNarrative'];
  
  const availableTools = useMemo(() => {
    if (!sectionTools) return [];
    
    interface ToolCardData {
      id: string;
      toolType: string;
      title: string;
      shortTitle: string;
      icon: React.ComponentType<any>;
      section: string;
      data: any;
      quickStat?: string;
      status?: 'good' | 'warning' | 'critical' | 'neutral';
    }
    
    const tools: ToolCardData[] = [];
    
    // Iterate through all sections and collect tools
    Object.entries(sectionTools).forEach(([sectionName, sectionData]) => {
      if (!sectionData || typeof sectionData !== 'object') return;
      
      // Skip internal sections
      if (sectionName.startsWith('__') || sectionName === 'Intake') return;
      
      Object.entries(sectionData).forEach(([toolName, toolData]) => {
        // Skip sectionScore - it's already shown in the section cards
        if (toolName === 'sectionScore' || !toolData) return;
        
        // Skip cross-section tools - they go in section modals
        if (CROSS_SECTION_TOOL_NAMES.includes(toolName)) return;
        
        // Map tool names from sectionTools to our config
        const toolConfigKey = toolNameMapping[toolName] || toolName;
        const config = TOOL_CONFIGS[toolConfigKey];
        
        if (config) {
          tools.push({
            id: `${sectionName}_${toolName}`,
            toolType: toolConfigKey,
            title: config.title,
            shortTitle: config.shortTitle,
            icon: config.icon,
            section: sectionName,
            data: toolData,
            quickStat: config.getQuickStat?.(toolData) || '—',
            status: config.getStatus?.(toolData) || 'neutral'
          });
        }
      });
    });
    
    return tools;
  }, [sectionTools, toolNameMapping]);

  const handleSectionClick = (section: SectionVerdict) => {
    setSelectedSection(section);
    setSectionModalOpen(true);
  };

  const handleToolClick = (tool: { id: string; toolType: string; data: any; section: string }) => {
    setSelectedTool({
      id: tool.id,
      toolType: tool.toolType,
      data: tool.data,
      sectionName: tool.section
    });
    setToolModalOpen(true);
  };
  
  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 shadow-glow">
        {/* Background effects */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
        
        {/* Header */}
        <div className="relative z-10 px-5 py-4 border-b border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Investment Analysis</h3>
              <p className="text-xs text-muted-foreground">VC evaluation of your case</p>
            </div>
          </div>
          
          <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
            {stage}
          </span>
        </div>
        
        {/* Invite Banner */}
        <div className="relative z-10 mx-5 mt-4 p-3 rounded-lg bg-muted/30 border border-border/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">
              <span className="font-medium">Invite a friend</span>
              <span className="text-muted-foreground"> — earn free regeneration credits</span>
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setInviteFounderOpen(true)}
            className="gap-1.5 h-8 px-3 border-primary/40 hover:bg-primary/10 hover:border-primary/60 text-foreground font-medium transition-all"
          >
            <Gift className="w-3.5 h-3.5 text-primary" />
            Invite
          </Button>
        </div>
        
        {/* Main content */}
        <div className="relative z-10 p-5">
          <div className="grid grid-cols-12 gap-5 items-center">
            
            {/* Left: Score Circle */}
            <div className="col-span-3 flex flex-col items-center justify-center">
              <div className="relative mb-3">
                <div className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center",
                  "bg-gradient-to-br from-card to-muted border-2",
                  scoreColor, scoreGlow
                )}>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-foreground">{scorecard.overallScore}</span>
                    <span className="text-xs text-muted-foreground block -mt-0.5">/100</span>
                  </div>
                </div>
                <div className={cn(
                  "absolute inset-0 rounded-full opacity-20 animate-ping",
                  scorecard.overallScore >= 65 ? "bg-success" :
                  scorecard.overallScore >= 50 ? "bg-warning" : "bg-destructive"
                )} style={{ animationDuration: '3s' }} />
              </div>
              
              <div className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
                readinessConfig.bg,
                readinessConfig.color
              )}>
                <Shield className="w-3.5 h-3.5" />
                {readinessConfig.label}
              </div>
            </div>
            
            {/* Center: Radar Chart */}
            <div className="col-span-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                  <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.4} />
                  <PolarAngleAxis 
                    dataKey="section" 
                    tick={{ 
                      fill: 'hsl(var(--muted-foreground))', 
                      fontSize: 9,
                      fontWeight: 500
                    }}
                  />
                  <Radar
                    name="Benchmark"
                    dataKey="benchmark"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    fill="transparent"
                  />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                    style={{
                      filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.4))'
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Right: Verdict + Stats */}
            <div className="col-span-5 space-y-3">
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Target className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">VC Verdict</span>
                </div>
                <p className="text-xs text-foreground line-clamp-3">
                  {scorecard.overallVerdict}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-success/5 border border-success/20">
                  <div className="flex items-center gap-1 mb-0.5">
                    <TrendingUp className="w-2.5 h-2.5 text-success" />
                    <span className="text-[9px] font-semibold text-success uppercase">
                      {bestStrengthCandidate?.isTrueStrength ? "Top Strength" : "Best Area"}
                    </span>
                  </div>
                  {bestStrengthCandidate ? (() => {
                    const strengthSection = bestStrengthCandidate.sectionName;
                    const strengthInsight = companyInsightContext?.sectionInsights[strengthSection];
                    const sectionRow = scorecard.sections.find(s => s.section === strengthSection);
                    const score = sectionRow?.score ?? 0;
                    const benchmark = sectionRow?.benchmark ?? 60;
                    return (
                      <InsightWithTooltip
                        explanation={bestStrengthCandidate.isTrueStrength
                          ? `Your ${strengthSection} section scores above stage benchmarks.`
                          : `This is your strongest area relative to stage benchmarks.`}
                        companyContext={strengthInsight?.topInsight || strengthInsight?.whatThisTellsVC}
                        evidence={strengthInsight?.evidencePoints?.slice(0, 2)}
                        showUnderline={false}
                      >
                        <p className="text-[10px] text-foreground font-medium line-clamp-2">
                          {getStrengthHeadline(
                            strengthSection,
                            score,
                            benchmark
                          )}
                        </p>
                      </InsightWithTooltip>
                    );
                  })() : (
                    <InsightWithTooltip
                      explanation="No sections scoring significantly above benchmark yet."
                      showUnderline={false}
                    >
                      <p className="text-[10px] text-muted-foreground">Building…</p>
                    </InsightWithTooltip>
                  )}
                </div>
                <div className="p-2 rounded-lg bg-warning/5 border border-warning/20">
                  <div className="flex items-center gap-1 mb-0.5">
                    <AlertTriangle className="w-2.5 h-2.5 text-warning" />
                    <span className="text-[9px] font-semibold text-warning uppercase">Critical Gap</span>
                  </div>
                  {scorecard.criticalWeaknesses.length > 0 ? (() => {
                    const weakSection = scorecard.criticalWeaknesses[0];
                    const weakInsight = companyInsightContext?.sectionInsights[weakSection];
                    return (
                      <InsightWithTooltip
                        explanation={`Your ${weakSection} section is below stage benchmarks — VCs will push back here.`}
                        companyContext={weakInsight?.reasoning || weakInsight?.fundabilityImpact}
                        evidence={weakInsight?.assumptions?.slice(0, 2)}
                        showUnderline={false}
                      >
                        <p className="text-[10px] text-foreground font-medium line-clamp-2">
                          {getWeaknessHeadline(
                            weakSection,
                            scorecard.sections.find(s => s.section === weakSection)?.score || 0,
                            scorecard.sections.find(s => s.section === weakSection)?.benchmark || 60
                          )}
                        </p>
                      </InsightWithTooltip>
                    );
                  })() : (
                    <InsightWithTooltip
                      explanation="All sections meet or exceed benchmark — you're in good shape."
                      showUnderline={false}
                    >
                      <p className="text-[10px] text-muted-foreground">On track</p>
                    </InsightWithTooltip>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* ARC Classification - Educational Framework Card */}
          {arcClassification && (
            <div className="mt-5 pt-4 border-t border-border/30">
              <Collapsible open={isARCExpanded} onOpenChange={setIsARCExpanded}>
                <div className={cn(
                  "rounded-xl border transition-all overflow-hidden",
                  ARC_CONFIG[arcClassification.type].bgColor,
                  ARC_CONFIG[arcClassification.type].borderColor
                )}>
                  <CollapsibleTrigger asChild>
                    <button className="w-full p-4 flex items-center gap-3 text-left hover:bg-background/20 transition-colors">
                      {(() => {
                        const ArcIcon = ARC_CONFIG[arcClassification.type].icon;
                        return (
                          <div className={cn("p-2 rounded-lg bg-background/60", ARC_CONFIG[arcClassification.type].bgColor)}>
                            <ArcIcon className={cn("w-5 h-5", ARC_CONFIG[arcClassification.type].accentColor)} />
                          </div>
                        );
                      })()}
                      <div className="flex-1">
                        <p className={cn("text-sm font-semibold", ARC_CONFIG[arcClassification.type].accentColor)}>
                          {ARC_CONFIG[arcClassification.type].headline}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Based on Sequoia's ARC Framework
                        </p>
                      </div>
                      {isARCExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                    </button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="px-4 pb-4 pt-0 space-y-4">
                      <div className="h-px bg-border/50" />
                      
                      {/* Educational Intro */}
                      <div className="p-3 rounded-lg bg-background/30 border border-border/30">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Understanding ARC</p>
                        <p className="text-xs text-foreground/70 leading-relaxed mb-3">
                          Sequoia Capital's ARC framework identifies <span className="font-semibold text-foreground">three types of product-market fit</span>. Each requires a different go-to-market strategy:
                        </p>
                        
                        {/* Three Archetypes Grid */}
                        <div className="space-y-2">
                          {(Object.keys(ARC_CONFIG) as Array<keyof typeof ARC_CONFIG>).map((type) => {
                            const config = ARC_CONFIG[type];
                            const Icon = config.icon;
                            const isActive = type === arcClassification.type;
                            return (
                              <div 
                                key={type}
                                className={cn(
                                  "flex items-start gap-2 p-2 rounded-lg transition-all",
                                  isActive 
                                    ? `${config.bgColor} border ${config.borderColor}` 
                                    : "bg-muted/20 opacity-60"
                                )}
                              >
                                <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", isActive ? config.accentColor : "text-muted-foreground")} />
                                <div className="min-w-0">
                                  <p className={cn(
                                    "text-xs font-semibold",
                                    isActive ? config.accentColor : "text-muted-foreground"
                                  )}>
                                    {type}
                                    {isActive && <span className="ml-1.5 text-[10px] font-medium text-foreground/60">← You</span>}
                                  </p>
                                  <p className="text-[11px] text-foreground/60 leading-snug">
                                    {type === "Hair on Fire" && "Urgent pain. Customers actively searching for solutions."}
                                    {type === "Hard Fact" && "Hidden pain. Customers don't realize there's a better way."}
                                    {type === "Future Vision" && "New paradigm. Creating something that didn't exist before."}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Deep Dive - Your Classification */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {(() => {
                            const ArcIcon = ARC_CONFIG[arcClassification.type].icon;
                            return <ArcIcon className={cn("w-4 h-4", ARC_CONFIG[arcClassification.type].accentColor)} />;
                          })()}
                          <p className={cn("text-xs font-semibold uppercase tracking-wide", ARC_CONFIG[arcClassification.type].accentColor)}>
                            Your Classification: {arcClassification.type}
                          </p>
                        </div>
                        <p className="text-xs text-foreground/80 leading-relaxed">
                          {ARC_CONFIG[arcClassification.type].explanation}
                        </p>
                      </div>
                      
                      {/* AI Reasoning if available */}
                      {arcClassification.reasoning && (
                        <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Why we classified you here</p>
                          <p className="text-xs text-foreground/70 leading-relaxed italic">
                            "{arcClassification.reasoning}"
                          </p>
                        </div>
                      )}
                      
                      {/* Your go-to-market strategy */}
                      <div className="p-3 rounded-lg bg-background/40 border border-primary/20">
                        <p className="text-[10px] font-semibold text-primary uppercase tracking-wide mb-1">💡 Your Recommended Strategy</p>
                        <p className="text-xs text-foreground leading-relaxed">
                          {ARC_CONFIG[arcClassification.type].strategy}
                        </p>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </div>
          )}
          
          {/* Collapsible Section Breakdown */}
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <button className="w-full mt-5 pt-4 border-t border-border/30 flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors">
                <span className="font-semibold uppercase tracking-wide text-xs">
                  Section Breakdown <span className="text-muted-foreground font-normal">(click to read more)</span>
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="pt-4 space-y-4">
              {/* Section Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {MEMO_SECTION_ORDER.map((sectionName, index) => {
                  const section = scorecard.sections.find(s => s.section === sectionName);
                  if (!section) return null;
                  return (
                    <MiniSectionCard 
                      key={section.section} 
                      section={section} 
                      index={index}
                      onClick={() => handleSectionClick(section)}
                    />
                  );
                })}
              </div>
              
              {/* Investment Thesis Card - Collapsible Toggle */}
              {investmentThesis && (
                <Collapsible open={isThesisExpanded} onOpenChange={setIsThesisExpanded}>
                  <div className="mt-4 relative overflow-hidden rounded-xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 transition-all duration-300">
                    {/* Decorative gradient */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-primary/20 via-secondary/20 to-transparent rounded-full blur-2xl opacity-60" />
                    
                    <CollapsibleTrigger asChild>
                      <button className="w-full p-5 text-left hover:bg-background/10 transition-colors relative z-10">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30">
                            <ScrollText className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-bold text-foreground">Investment Thesis</h4>
                              <Badge className="text-[9px] bg-primary/10 text-primary border-primary/20">
                                Final Assessment
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">VC decision synthesis</p>
                          </div>
                          {isThesisExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                          )}
                        </div>
                      </button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="px-5 pb-5 pt-0 space-y-4 relative z-10">
                        <div className="h-px bg-border/50" />
                        
                        {/* Main thesis narrative - always visible when expanded */}
                        {investmentThesis.summary && (
                          <div>
                            <p className="text-sm text-foreground/90 leading-relaxed">
                              {investmentThesis.summary}
                            </p>
                          </div>
                        )}
                        
                        {/* Key Takeaways - collapsible section */}
                        {(investmentThesis.keyPoints.length > 0 || 
                          (investmentThesis.fullSection?.narrative?.paragraphs && 
                           investmentThesis.fullSection.narrative.paragraphs.length > 1)) && (
                          <Collapsible>
                            <CollapsibleTrigger asChild>
                              <button className="w-full flex items-center justify-between py-2 text-left hover:bg-muted/30 rounded-lg px-2 -mx-2 transition-colors">
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Key Takeaways</span>
                                <ChevronDown className="w-3 h-3 text-muted-foreground" />
                              </button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="space-y-3 pt-2">
                                {/* Key Points */}
                                {investmentThesis.keyPoints.length > 0 && (
                                  <div className="space-y-2">
                                    {investmentThesis.keyPoints.map((point, i) => (
                                      <div key={i} className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                        <p className="text-xs text-foreground/80 leading-relaxed">{point}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {/* Additional paragraphs if available */}
                                {investmentThesis.fullSection?.narrative?.paragraphs && 
                                 investmentThesis.fullSection.narrative.paragraphs.length > 1 && (
                                  <div className="space-y-3 pt-2 border-t border-border/30">
                                    {investmentThesis.fullSection.narrative.paragraphs.slice(1).map((p, i) => (
                                      <p key={i} className="text-sm text-foreground/80 leading-relaxed">
                                        {p.text}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              )}
              
              {/* Strategic Analysis Tools - Collapsible */}
              {availableTools.length > 0 && (
                <Collapsible open={isToolsExpanded} onOpenChange={setIsToolsExpanded}>
                  <CollapsibleTrigger asChild>
                    <button className="w-full mt-4 pt-4 border-t border-border/30 flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <span className="font-semibold uppercase tracking-wide text-xs flex items-center gap-2">
                        <Boxes className="w-4 h-4 text-primary/70" />
                        Strategic Analysis Tools
                      </span>
                      {isToolsExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="pt-4">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                      {availableTools.map(tool => (
                        <MiniToolCard
                          key={tool.id}
                          id={tool.id}
                          title={tool.title}
                          shortTitle={tool.shortTitle}
                          icon={tool.icon}
                          quickStat={tool.quickStat}
                          status={tool.status}
                          onClick={() => handleToolClick({
                            id: tool.id,
                            toolType: tool.toolType,
                            data: tool.data,
                            section: tool.section
                          })}
                        />
                      ))}
                    </div>
                    
                    {/* Helper text */}
                    <p className="text-[10px] text-muted-foreground text-center mt-3">
                      Click any tool to view detailed analysis
                    </p>
                  </CollapsibleContent>
                </Collapsible>
              )}
              
              {/* Premium Tools Row */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {/* Market Lens Card */}
                <div 
                  className="relative overflow-hidden rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 transition-all duration-200 hover:border-blue-500/50 hover:bg-blue-500/10 group cursor-pointer"
                  onClick={() => onNavigate('/market-lens')}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Globe className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground">Market Lens</h4>
                      <p className="text-[10px] text-muted-foreground truncate">50+ reports filtered for you</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </div>
                
                {/* VC Network Card */}
                <div 
                  className="relative overflow-hidden rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 transition-all duration-200 hover:border-emerald-500/50 hover:bg-emerald-500/10 group cursor-pointer"
                  onClick={() => onNavigate('/fund-discovery')}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground">VC Network</h4>
                      <p className="text-[10px] text-muted-foreground truncate">800+ investors by stage & sector</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          {/* Action buttons */}
          <div className="mt-5 pt-4 border-t border-border/30 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate(`/analysis/section?companyId=${companyId}&section=0`)}
              className="h-9 px-4 gap-2 border-border/60 bg-card hover:bg-muted/50 hover:border-primary/50 text-foreground font-medium shadow-sm transition-all"
            >
              <FileText className="w-4 h-4 text-muted-foreground" />
              Full Memo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate(`/tools`)}
              className="h-9 px-4 gap-2 border-border/60 bg-card hover:bg-muted/50 hover:border-primary/50 text-foreground font-medium shadow-sm transition-all"
            >
              <Wrench className="w-4 h-4 text-muted-foreground" />
              Tools
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate(`/analysis/regenerate?companyId=${companyId}`)}
              className="h-9 px-4 gap-2 border-warning/40 bg-card hover:bg-warning/10 hover:border-warning/60 text-foreground font-medium shadow-sm transition-all"
            >
              <RotateCcw className="w-4 h-4 text-warning" />
              Regenerate
            </Button>
            <Button
              size="sm"
              onClick={() => onNavigate(`/analysis/overview?companyId=${companyId}`)}
              className="h-9 px-4 gap-2 gradient-primary shadow-glow font-medium"
            >
              <LayoutGrid className="w-4 h-4" />
              Overview
            </Button>
          </div>
        </div>
      </div>
      
      {/* Section Detail Modal with AI Suggestions */}
      <SectionDetailModal
        open={sectionModalOpen}
        onOpenChange={setSectionModalOpen}
        section={selectedSection}
        companyId={companyId}
        companyDescription={companyDescription}
        allSectionScores={allSectionScores}
        sectionNarrative={selectedSection ? findSectionNarrative(selectedSection.section) : null}
        sectionTools={selectedSection ? findSectionTools(selectedSection.section) : null}
        isDemo={isDemo}
      />
      
      {/* Share Scorecard Modal */}
      <ShareScorecardModal
        open={shareScorecardOpen}
        onOpenChange={setShareScorecardOpen}
        companyId={companyId}
        companyName={companyName}
        companyDescription={companyDescription}
        stage={stage}
        category={category}
        sectionTools={sectionTools}
      />
      
      {/* Invite Founder Modal */}
      <InviteFounderModal
        open={inviteFounderOpen}
        onOpenChange={setInviteFounderOpen}
        companyId={companyId}
        companyName={companyName}
      />
      
      {/* Tool Popup Modal */}
      <ToolPopupModal
        open={toolModalOpen}
        onOpenChange={setToolModalOpen}
        toolType={selectedTool?.toolType || ''}
        toolData={selectedTool?.data}
        sectionName={selectedTool?.sectionName || ''}
        isDemo={isDemo}
      />
    </>
  );
};
