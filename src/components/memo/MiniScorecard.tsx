import { useMemo } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { 
  Zap, 
  AlertTriangle, 
  TrendingUp,
  Shield,
  FileText,
  Wrench,
  RotateCcw,
  LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { buildHolisticScorecard } from "@/lib/holisticVerdictGenerator";
import { InsightWithTooltip } from "./InsightWithTooltip";
import { getStrengthHeadline, getWeaknessHeadline } from "@/lib/insightExplanations";
import { type CompanyInsightContext } from "@/lib/companyInsightContext";

interface MiniScorecardProps {
  sectionTools: Record<string, { sectionScore?: { score: number; vcBenchmark: number } }>;
  companyName: string;
  stage: string;
  category?: string;
  companyId: string;
  onNavigate: (path: string) => void;
  companyInsightContext?: CompanyInsightContext | null;
}

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

export const MiniScorecard = ({ 
  sectionTools, 
  companyName, 
  stage, 
  category,
  companyId,
  onNavigate,
  companyInsightContext
}: MiniScorecardProps) => {
  const scorecard = useMemo(() =>
    buildHolisticScorecard(sectionTools, companyName, stage, category),
    [sectionTools, companyName, stage, category]
  );
  
  // Prepare compact radar chart data
  const radarData = useMemo(() => 
    scorecard.sections.map(s => ({
      section: s.section.substring(0, 3).toUpperCase(),
      score: s.score,
      benchmark: s.benchmark,
      fullMark: 100
    })),
    [scorecard]
  );
  
  const readinessConfig = READINESS_CONFIG[scorecard.investmentReadiness];
  
  // Determine score color
  const scoreColor = scorecard.overallScore >= 65 ? 'border-success' :
                     scorecard.overallScore >= 50 ? 'border-warning' : 'border-destructive';
  
  const scoreGlow = scorecard.overallScore >= 65 ? 'shadow-[0_0_25px_rgba(34,197,94,0.25)]' :
                    scorecard.overallScore >= 50 ? 'shadow-[0_0_25px_rgba(234,179,8,0.25)]' : 
                    'shadow-[0_0_25px_rgba(239,68,68,0.25)]';
  
  return (
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
          <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
            {stage}
          </span>
        </div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10 p-5">
        <div className="grid grid-cols-12 gap-5 items-center">
          
          {/* Left: Compact Radar Chart */}
          <div className="col-span-4 h-36">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.4} />
                <PolarAngleAxis 
                  dataKey="section" 
                  tick={{ 
                    fill: 'hsl(var(--muted-foreground))', 
                    fontSize: 8,
                    fontWeight: 500
                  }}
                />
                {/* Benchmark dashed line */}
                <Radar
                  name="Benchmark"
                  dataKey="benchmark"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  fill="transparent"
                />
                {/* Score filled area */}
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
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Center: Score Circle + Readiness */}
          <div className="col-span-4 flex flex-col items-center justify-center">
            {/* Score circle with glow */}
            <div className="relative mb-2">
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center",
                "bg-gradient-to-br from-card to-muted border-2",
                scoreColor, scoreGlow
              )}>
                <div className="text-center">
                  <span className="text-2xl font-bold text-foreground">{scorecard.overallScore}</span>
                  <span className="text-[10px] text-muted-foreground block -mt-0.5">/100</span>
                </div>
              </div>
              {/* Subtle pulse animation */}
              <div className={cn(
                "absolute inset-0 rounded-full opacity-20 animate-ping",
                scorecard.overallScore >= 65 ? "bg-success" :
                scorecard.overallScore >= 50 ? "bg-warning" : "bg-destructive"
              )} style={{ animationDuration: '3s' }} />
            </div>
            
            {/* Readiness badge */}
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
              readinessConfig.bg,
              readinessConfig.color
            )}>
              <Shield className="w-3 h-3" />
              {readinessConfig.label}
            </div>
          </div>
          
          {/* Right: Quick Stats */}
          <div className="col-span-4 space-y-2">
            {/* Strengths */}
            <div className="p-2.5 rounded-lg bg-success/5 border border-success/20">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3 h-3 text-success" />
                <span className="text-[10px] font-semibold text-success uppercase">Top Strength</span>
              </div>
              {scorecard.topStrengths.length > 0 ? (
                <InsightWithTooltip
                  explanation={`Your ${scorecard.topStrengths[0]} section scores above benchmark.`}
                  showUnderline={false}
                >
                  <p className="text-xs text-foreground font-medium line-clamp-1">
                    {getStrengthHeadline(
                      scorecard.topStrengths[0],
                      scorecard.sections.find(s => s.section === scorecard.topStrengths[0])?.score || 0,
                      scorecard.sections.find(s => s.section === scorecard.topStrengths[0])?.benchmark || 60
                    )}
                  </p>
                </InsightWithTooltip>
              ) : (
                <InsightWithTooltip
                  explanation="No sections scoring significantly above benchmark yet."
                  showUnderline={false}
                >
                  <p className="text-xs text-muted-foreground">Build more evidence</p>
                </InsightWithTooltip>
              )}
            </div>
            
            {/* Focus Areas */}
            <div className="p-2.5 rounded-lg bg-warning/5 border border-warning/20">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-3 h-3 text-warning" />
                <span className="text-[10px] font-semibold text-warning uppercase">Critical Gap</span>
              </div>
              {scorecard.criticalWeaknesses.length > 0 ? (
                <InsightWithTooltip
                  explanation={`Your ${scorecard.criticalWeaknesses[0]} section is below benchmark.`}
                  showUnderline={false}
                >
                  <p className="text-xs text-foreground font-medium line-clamp-1">
                    {getWeaknessHeadline(
                      scorecard.criticalWeaknesses[0],
                      scorecard.sections.find(s => s.section === scorecard.criticalWeaknesses[0])?.score || 0,
                      scorecard.sections.find(s => s.section === scorecard.criticalWeaknesses[0])?.benchmark || 60
                    )}
                  </p>
                </InsightWithTooltip>
              ) : (
                <InsightWithTooltip
                  explanation="All sections meet or exceed benchmark."
                  showUnderline={false}
                >
                  <p className="text-xs text-muted-foreground">On track</p>
                </InsightWithTooltip>
              )}
            </div>
          </div>
        </div>
        
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
  );
};
