import { useMemo } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
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
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  buildHolisticScorecard, 
  type HolisticScorecard,
  type SectionVerdict,
  type DynamicHolisticVerdict
} from "@/lib/holisticVerdictGenerator";
import { InsightWithTooltip } from "./InsightWithTooltip";
import { 
  findConcernExplanation, 
  DEFAULT_INSIGHT_EXPLANATION,
  getStrengthHeadline,
  getWeaknessHeadline,
  generateInsightExplanation
} from "@/lib/insightExplanations";
import { 
  getCompanyContextForInsight, 
  type CompanyInsightContext 
} from "@/lib/companyInsightContext";

interface MemoScoreRadarProps {
  sectionTools: Record<string, { sectionScore?: { score: number; vcBenchmark: number } }>;
  companyName: string;
  stage: string;
  category?: string;
  onSectionClick?: (sectionName: string) => void;
  // Dynamic holistic verdicts from AI generation
  holisticVerdicts?: Record<string, DynamicHolisticVerdict>;
  // Company-specific insight context for tooltips
  companyInsightContext?: CompanyInsightContext | null;
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
    icon: CheckCircle2,
    label: 'STRONG'
  }
};

const READINESS_CONFIG = {
  'NOT_READY': {
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    label: 'Not Ready',
    description: 'Fix critical issues before approaching investors'
  },
  'CONDITIONAL': {
    color: 'text-warning',
    bg: 'bg-warning/10',
    label: 'Conditional',
    description: 'Fundable with right positioning'
  },
  'READY': {
    color: 'text-success',
    bg: 'bg-success/10',
    label: 'Ready',
    description: 'Strong enough to approach top-tier'
  }
};

// Section card component
const SectionScoreCard = ({ section, onClick }: { section: SectionVerdict; onClick?: () => void }) => {
  const config = STATUS_CONFIG[section.status];
  const isClickable = !!onClick;
  const Icon = config.icon;
  
  return (
    <button
      onClick={onClick}
      disabled={!isClickable}
      className={cn(
        "relative p-4 rounded-xl border transition-all duration-300 text-left w-full",
        "bg-card/50 backdrop-blur-sm hover:bg-card/80",
        config.border,
        "group hover:scale-[1.02]",
        isClickable && "cursor-pointer hover:shadow-glow"
      )}
    >
      {/* Glow effect on hover */}
      <div className={cn(
        "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity",
        section.status === 'strong' && "bg-success/5",
        section.status === 'passing' && "bg-success/5",
        section.status === 'weak' && "bg-warning/5",
        section.status === 'critical' && "bg-destructive/5"
      )} />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-foreground uppercase tracking-wide">
            {section.section}
          </span>
          <div className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold",
            config.bg,
            config.color
          )}>
            <Icon className="w-3 h-3" />
            {config.label}
          </div>
        </div>
        
        {/* Score display */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className={cn(
            "text-3xl font-bold tabular-nums",
            section.score >= section.benchmark ? "text-success" : 
            section.score >= section.benchmark - 15 ? "text-warning" : "text-destructive"
          )}>
            {section.score}
          </span>
          <span className="text-sm text-muted-foreground">
            / {section.benchmark} benchmark
          </span>
        </div>
        
        {/* Holistic verdict */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          "{section.holisticVerdict}"
        </p>
        {/* Click hint for clickable cards */}
        {isClickable && (
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            Click to view →
          </div>
        )}
      </div>
    </button>
  );
};

// Custom tooltip for radar chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-foreground">{data.section}</p>
        <div className="flex items-center gap-4 mt-1">
          <span className="text-sm">
            Score: <span className="font-bold text-primary">{data.score}</span>
          </span>
          <span className="text-sm text-muted-foreground">
            Benchmark: {data.benchmark}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const MemoScoreRadar = ({ 
  sectionTools, 
  companyName, 
  stage, 
  category,
  onSectionClick,
  holisticVerdicts,
  companyInsightContext
}: MemoScoreRadarProps) => {
  const scorecard = useMemo(() =>
    buildHolisticScorecard(sectionTools, companyName, stage, category, holisticVerdicts),
    [sectionTools, companyName, stage, category, holisticVerdicts]
  );
  
  // Prepare radar chart data
  const radarData = useMemo(() => 
    scorecard.sections.map(s => ({
      section: s.section,
      score: s.score,
      benchmark: s.benchmark,
      fullMark: 100
    })),
    [scorecard]
  );
  
  const readinessConfig = READINESS_CONFIG[scorecard.investmentReadiness];
  
  return (
    <div className="relative mb-12 animate-fade-in">
      {/* Main container with neon glow */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-primary/5">
        {/* Background effects */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        
        {/* Header */}
        <div className="relative z-10 px-6 py-5 border-b border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-glow">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Investment Readiness Scorecard</h2>
              <p className="text-xs text-muted-foreground">How VCs actually evaluate your business</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
              {stage}
            </span>
            {category && (
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {category}
              </span>
            )}
          </div>
        </div>
        
        {/* Main content grid */}
        <div className="relative z-10 p-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Overall Score + Radar Chart */}
            <div className="space-y-6">
              {/* Overall score display */}
              <div className="flex items-center gap-6">
                {/* Score circle with glow */}
                <div className="relative">
                  <div className={cn(
                    "w-24 h-24 rounded-full flex items-center justify-center",
                    "bg-gradient-to-br from-card to-muted border-2",
                    scorecard.overallScore >= 65 ? "border-success shadow-[0_0_30px_rgba(34,197,94,0.3)]" :
                    scorecard.overallScore >= 50 ? "border-warning shadow-[0_0_30px_rgba(234,179,8,0.3)]" :
                    "border-destructive shadow-[0_0_30px_rgba(239,68,68,0.3)]"
                  )}>
                    <div className="text-center">
                      <span className="text-3xl font-bold text-foreground">{scorecard.overallScore}</span>
                      <span className="text-xs text-muted-foreground block">/100</span>
                    </div>
                  </div>
                  {/* Pulse ring animation */}
                  <div className={cn(
                    "absolute inset-0 rounded-full animate-ping opacity-20",
                    scorecard.overallScore >= 65 ? "bg-success" :
                    scorecard.overallScore >= 50 ? "bg-warning" : "bg-destructive"
                  )} style={{ animationDuration: '3s' }} />
                </div>
                
                {/* Readiness badge */}
                <div className="flex-1">
                  <div className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-2",
                    readinessConfig.bg,
                    readinessConfig.color
                  )}>
                    <Shield className="w-4 h-4" />
                    {readinessConfig.label}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {readinessConfig.description}
                  </p>
                </div>
              </div>
              
              {/* Radar chart */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                    <PolarGrid 
                      stroke="hsl(var(--border))" 
                      strokeOpacity={0.5}
                    />
                    <PolarAngleAxis 
                      dataKey="section" 
                      tick={{ 
                        fill: 'hsl(var(--muted-foreground))', 
                        fontSize: 10,
                        fontWeight: 500
                      }}
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                      tickCount={5}
                    />
                    {/* Benchmark line (dashed) */}
                    <Radar
                      name="VC Benchmark"
                      dataKey="benchmark"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fill="transparent"
                    />
                    {/* Actual scores (filled with glow effect) */}
                    <Radar
                      name="Your Score"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      style={{
                        filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.5))'
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend */}
              <div className="flex items-center justify-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-primary rounded" />
                  <span className="text-muted-foreground">Your Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 border-t-2 border-dashed border-muted-foreground" />
                  <span className="text-muted-foreground">VC Benchmark</span>
                </div>
              </div>
            </div>
            
            {/* Right: Holistic Verdict + Strategic Concerns */}
            <div className="space-y-6">
              {/* Holistic Verdict */}
              <div className="p-5 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                    VC Verdict
                  </h3>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {scorecard.overallVerdict}
                </p>
              </div>
              
              {/* Strategic Concerns */}
              {scorecard.strategicConcerns.length > 0 && (
                <div className="p-5 rounded-xl bg-destructive/5 border border-destructive/20">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                      Strategic Concerns
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {scorecard.strategicConcerns.map((concern, i) => {
                      const explanationData = findConcernExplanation(concern);
                      const explanation = explanationData?.explanation || DEFAULT_INSIGHT_EXPLANATION.explanation;
                      
                      // Get company-specific context
                      const companyContext = companyInsightContext 
                        ? getCompanyContextForInsight(concern, companyInsightContext)
                        : null;
                      
                      return (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-destructive mt-0.5">•</span>
                          <InsightWithTooltip 
                            explanation={explanation}
                            companyContext={companyContext?.companyContext || explanationData?.getCompanyContext?.({ category })}
                            evidence={companyContext?.evidence}
                          >
                            {concern}
                          </InsightWithTooltip>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              
              {/* Quick Stats - Now with headlines */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-xs font-semibold text-success uppercase">Top Strength</span>
                  </div>
                  {scorecard.topStrengths.length > 0 ? (() => {
                    const strengthSection = scorecard.topStrengths[0];
                    const strengthInsight = companyInsightContext?.sectionInsights[strengthSection];
                    return (
                      <InsightWithTooltip
                        explanation={`Your ${strengthSection} section scores significantly above stage benchmarks, making it a standout area that will impress investors.`}
                        companyContext={strengthInsight?.topInsight || strengthInsight?.whatThisTellsVC}
                        evidence={strengthInsight?.evidencePoints?.slice(0, 2)}
                        showUnderline={false}
                      >
                        <p className="text-sm text-foreground font-medium">
                          {getStrengthHeadline(
                            strengthSection, 
                            scorecard.sections.find(s => s.section === strengthSection)?.score || 0,
                            scorecard.sections.find(s => s.section === strengthSection)?.benchmark || 60
                          )}
                        </p>
                      </InsightWithTooltip>
                    );
                  })() : (
                    <InsightWithTooltip
                      explanation="You don't have any sections scoring significantly above benchmark yet. Focus on building evidence in your strongest areas."
                      showUnderline={false}
                    >
                      <p className="text-sm text-muted-foreground">Build more evidence</p>
                    </InsightWithTooltip>
                  )}
                </div>
                <div className="p-4 rounded-xl bg-warning/5 border border-warning/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    <span className="text-xs font-semibold text-warning uppercase">Critical Gap</span>
                  </div>
                  {scorecard.criticalWeaknesses.length > 0 ? (() => {
                    const weakSection = scorecard.criticalWeaknesses[0];
                    const weakInsight = companyInsightContext?.sectionInsights[weakSection];
                    return (
                      <InsightWithTooltip
                        explanation={`Your ${weakSection} section is below stage benchmarks. This is likely where VCs will push back — address it proactively.`}
                        companyContext={weakInsight?.reasoning || weakInsight?.fundabilityImpact}
                        evidence={weakInsight?.assumptions?.slice(0, 2) || weakInsight?.evidencePoints?.slice(0, 2)}
                        showUnderline={false}
                      >
                        <p className="text-sm text-foreground font-medium">
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
                      explanation="All your sections meet or exceed benchmark — you're in good shape for your stage."
                      showUnderline={false}
                    >
                      <p className="text-sm text-muted-foreground">On track</p>
                    </InsightWithTooltip>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Section breakdown grid */}
          <div className="mt-8 pt-6 border-t border-border/30">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Section Breakdown
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {scorecard.sections.slice(0, 8).map((section) => (
                <SectionScoreCard 
                  key={section.section} 
                  section={section} 
                  onClick={onSectionClick ? () => onSectionClick(section.section) : undefined}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
