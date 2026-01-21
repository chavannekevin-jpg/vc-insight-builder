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
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buildHolisticScorecard, type SectionVerdict } from "@/lib/holisticVerdictGenerator";
import { SectionDetailModal } from "./SectionDetailModal";

interface DashboardScorecardProps {
  sectionTools: Record<string, { sectionScore?: { score: number; vcBenchmark: number } }>;
  companyName: string;
  stage: string;
  category?: string;
  companyId: string;
  onNavigate: (path: string) => void;
  onInviteStartup: () => void;
  onShareScorecard: () => void;
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

// Mini section card for the grid
const MiniSectionCard = ({ 
  section, 
  onClick 
}: { 
  section: SectionVerdict; 
  onClick: () => void;
}) => {
  const config = STATUS_CONFIG[section.status];
  const Icon = config.icon;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative p-3 rounded-xl border transition-all duration-300 text-left w-full",
        "bg-card/50 backdrop-blur-sm hover:bg-card/80",
        config.border,
        "group hover:scale-[1.02] cursor-pointer hover:shadow-md"
      )}
    >
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wide truncate">
            {section.section}
          </span>
          <Icon className={cn("w-3.5 h-3.5 shrink-0", config.color)} />
        </div>
        
        {/* Score */}
        <div className="flex items-baseline gap-1">
          <span className={cn(
            "text-2xl font-bold tabular-nums",
            section.score >= section.benchmark ? "text-success" : 
            section.score >= section.benchmark - 15 ? "text-warning" : "text-destructive"
          )}>
            {section.score}
          </span>
          <span className="text-xs text-muted-foreground">
            /{section.benchmark}
          </span>
        </div>
        
        {/* Click hint */}
        <div className="absolute bottom-1.5 right-1.5 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          View →
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
        <p className="font-semibold text-foreground">{data.section}</p>
        <div className="flex items-center gap-3 mt-1">
          <span>Score: <span className="font-bold text-primary">{data.score}</span></span>
          <span className="text-muted-foreground">Benchmark: {data.benchmark}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const DashboardScorecard = ({ 
  sectionTools, 
  companyName, 
  stage, 
  category,
  companyId,
  onNavigate,
  onInviteStartup,
  onShareScorecard
}: DashboardScorecardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedSection, setSelectedSection] = useState<SectionVerdict | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  const scorecard = useMemo(() =>
    buildHolisticScorecard(sectionTools, companyName, stage, category),
    [sectionTools, companyName, stage, category]
  );
  
  const radarData = useMemo(() => 
    scorecard.sections.map(s => ({
      section: s.section.substring(0, 3).toUpperCase(),
      fullSection: s.section,
      score: s.score,
      benchmark: s.benchmark,
      fullMark: 100
    })),
    [scorecard]
  );
  
  const readinessConfig = READINESS_CONFIG[scorecard.investmentReadiness];
  
  const scoreColor = scorecard.overallScore >= 65 ? 'border-success' :
                     scorecard.overallScore >= 50 ? 'border-warning' : 'border-destructive';
  
  const scoreGlow = scorecard.overallScore >= 65 ? 'shadow-[0_0_25px_rgba(34,197,94,0.25)]' :
                    scorecard.overallScore >= 50 ? 'shadow-[0_0_25px_rgba(234,179,8,0.25)]' : 
                    'shadow-[0_0_25px_rgba(239,68,68,0.25)]';
  
  const handleSectionClick = (section: SectionVerdict) => {
    setSelectedSection(section);
    setModalOpen(true);
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
              <h3 className="text-base font-bold text-foreground">Investment Readiness</h3>
              <p className="text-xs text-muted-foreground">How VCs evaluate your pitch</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Share dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 border-primary/50 hover:bg-primary/10">
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuItem onClick={onInviteStartup} className="cursor-pointer py-3">
                  <div className="flex items-start gap-3">
                    <Gift className="w-4 h-4 mt-0.5 text-primary" />
                    <div className="space-y-0.5">
                      <p className="font-medium">Invite a Founder</p>
                      <p className="text-xs text-muted-foreground">
                        Give friends a discount, earn free credits
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onShareScorecard} className="cursor-pointer py-3">
                  <div className="flex items-start gap-3">
                    <Users className="w-4 h-4 mt-0.5 text-primary" />
                    <div className="space-y-0.5">
                      <p className="font-medium">Share Your Scorecard</p>
                      <p className="text-xs text-muted-foreground">
                        Show off your score publicly
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
              {stage}
            </span>
          </div>
        </div>
        
        {/* Main content */}
        <div className="relative z-10 p-5">
          <div className="grid grid-cols-12 gap-5 items-start">
            
            {/* Left: Radar Chart */}
            <div className="col-span-4 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 15, right: 15, bottom: 15, left: 15 }}>
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
            
            {/* Center: Score Circle + Readiness */}
            <div className="col-span-4 flex flex-col items-center justify-center">
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
            
            {/* Right: Verdict + Stats */}
            <div className="col-span-4 space-y-3">
              {/* Mini Verdict */}
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Target className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">VC Verdict</span>
                </div>
                <p className="text-xs text-foreground line-clamp-3">
                  {scorecard.overallVerdict}
                </p>
              </div>
              
              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-success/5 border border-success/20">
                  <div className="flex items-center gap-1 mb-0.5">
                    <TrendingUp className="w-2.5 h-2.5 text-success" />
                    <span className="text-[9px] font-semibold text-success uppercase">Strengths</span>
                  </div>
                  <p className="text-[10px] text-foreground line-clamp-2">
                    {scorecard.topStrengths.length > 0 
                      ? scorecard.topStrengths.slice(0, 2).join(', ')
                      : 'Build evidence'}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-warning/5 border border-warning/20">
                  <div className="flex items-center gap-1 mb-0.5">
                    <AlertTriangle className="w-2.5 h-2.5 text-warning" />
                    <span className="text-[9px] font-semibold text-warning uppercase">Focus</span>
                  </div>
                  <p className="text-[10px] text-foreground line-clamp-2">
                    {scorecard.criticalWeaknesses.length > 0 
                      ? scorecard.criticalWeaknesses.slice(0, 2).join(', ')
                      : 'On track'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Collapsible Section Breakdown */}
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <button className="w-full mt-5 pt-4 border-t border-border/30 flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors">
                <span className="font-semibold uppercase tracking-wide text-xs">
                  Section Breakdown
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="pt-4">
              <div className="grid grid-cols-4 gap-3">
                {scorecard.sections.slice(0, 8).map((section) => (
                  <MiniSectionCard 
                    key={section.section} 
                    section={section} 
                    onClick={() => handleSectionClick(section)}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          {/* Action buttons */}
          <div className="mt-5 pt-4 border-t border-border/30 flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate(`/analysis/section?companyId=${companyId}&section=0`)}
              className="border-primary/50 hover:bg-primary/10 text-xs"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Full Memo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate(`/tools`)}
              className="border-primary/50 hover:bg-primary/10 text-xs"
            >
              <Wrench className="w-3.5 h-3.5 mr-1.5" />
              Tools
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate(`/analysis/regenerate?companyId=${companyId}`)}
              className="border-amber-500/50 hover:bg-amber-500/10 hover:border-amber-500 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Regenerate
            </Button>
            <Button
              size="sm"
              onClick={() => onNavigate(`/analysis/overview?companyId=${companyId}`)}
              className="gradient-primary shadow-glow text-xs"
            >
              <LayoutGrid className="w-3.5 h-3.5 mr-1.5" />
              Overview
            </Button>
          </div>
        </div>
      </div>
      
      {/* Section Detail Modal */}
      <SectionDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        section={selectedSection}
        companyId={companyId}
      />
    </>
  );
};
