import { TrendingUp, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { SectionScore } from "@/types/memo";
import { cn } from "@/lib/utils";
import { safeText, safeNumber, isValidAssessment } from "@/lib/toolDataUtils";
import { ConditionalAssessmentBadge } from "@/components/memo/ConditionalAssessmentBadge";
import { InsightWithTooltip } from "@/components/memo/InsightWithTooltip";
import { getScoreInterpretation, generateInsightExplanation } from "@/lib/insightExplanations";
import { 
  getCompanyContextForInsight, 
  type CompanyInsightContext 
} from "@/lib/companyInsightContext";

interface SectionScoreCardProps {
  score: SectionScore;
  sectionName: string;
  companyInsightContext?: CompanyInsightContext | null;
}

export const SectionScoreCard = ({ score, sectionName, companyInsightContext }: SectionScoreCardProps) => {
  // Early return if data is invalid
  if (!score || typeof score !== 'object') {
    return null;
  }

  const scoreValue = safeNumber(score?.score, 0);
  const vcBenchmark = safeNumber(score?.vcBenchmark, 60);
  const hasAssessment = isValidAssessment(score?.assessment);

  // Get company-specific context for the insights
  const whatThisTellsVCText = safeText(score?.whatThisTellsVC);
  const fundabilityImpactText = safeText(score?.fundabilityImpact);
  
  const vcContext = companyInsightContext 
    ? getCompanyContextForInsight(whatThisTellsVCText, companyInsightContext)
    : null;
  const fundabilityContext = companyInsightContext 
    ? getCompanyContextForInsight(fundabilityImpactText, companyInsightContext)
    : null;

  // Also get section-specific insight directly
  const sectionInsight = companyInsightContext?.sectionInsights[sectionName];

  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-emerald-500";
    if (s >= 60) return "text-blue-500";
    if (s >= 40) return "text-amber-500";
    return "text-red-500";
  };

  const getScoreBg = (s: number) => {
    if (s >= 80) return "bg-emerald-500";
    if (s >= 60) return "bg-blue-500";
    if (s >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  const getScoreIcon = (s: number) => {
    if (s >= 80) return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    if (s >= 60) return <TrendingUp className="w-5 h-5 text-blue-500" />;
    if (s >= 40) return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card to-muted/20 p-5">
      {/* Score Display */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center",
              "bg-gradient-to-br from-muted/50 to-muted"
            )}>
              <span className={cn("text-2xl font-bold", getScoreColor(scoreValue))}>
                {scoreValue}
              </span>
            </div>
            <div className={cn(
              "absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center bg-background border-2",
              scoreValue >= 60 ? "border-emerald-500" : "border-amber-500"
            )}>
              {getScoreIcon(scoreValue)}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{safeText(sectionName)} Score</h4>
            <p className={cn("text-sm font-medium", getScoreColor(scoreValue))}>
              {safeText(score?.label)}
            </p>
            <p className="text-xs text-muted-foreground">
              {safeText(score?.percentile)}
            </p>
          </div>
        </div>

        {/* VC Benchmark + Assessment Badge */}
        <div className="text-right space-y-2">
          <div>
            <p className="text-xs text-muted-foreground">VC Benchmark</p>
            <p className="text-lg font-semibold text-foreground">{vcBenchmark}+</p>
            <p className="text-xs text-muted-foreground">expected at Seed</p>
          </div>
          {hasAssessment && (
            <ConditionalAssessmentBadge assessment={score.assessment!} compact />
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-4">
        <div 
          className={cn("absolute left-0 top-0 h-full rounded-full transition-all duration-500", getScoreBg(scoreValue))}
          style={{ width: `${Math.min(scoreValue, 100)}%` }}
        />
        <div 
          className="absolute top-0 h-full w-0.5 bg-foreground/50"
          style={{ left: `${Math.min(vcBenchmark, 100)}%` }}
        />
      </div>

      {/* VC Insights */}
      <div className="space-y-3">
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-xs font-medium text-muted-foreground mb-1">What This Tells a VC</p>
          <InsightWithTooltip
            explanation={generateInsightExplanation({ sectionName, insightText: whatThisTellsVCText })}
            companyContext={vcContext?.companyContext || sectionInsight?.reasoning}
            evidence={vcContext?.evidence || sectionInsight?.assumptions?.slice(0, 2)}
            className="text-sm text-foreground"
          >
            {whatThisTellsVCText}
          </InsightWithTooltip>
        </div>
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-xs font-medium text-primary mb-1">Fundability Impact</p>
          <InsightWithTooltip
            explanation={`Score interpretation: ${getScoreInterpretation(scoreValue).meaning}. ${getScoreInterpretation(scoreValue).vcReaction}`}
            companyContext={fundabilityContext?.companyContext || sectionInsight?.fundabilityImpact}
            evidence={fundabilityContext?.evidence}
            className="text-sm text-foreground"
          >
            {fundabilityImpactText}
          </InsightWithTooltip>
        </div>
      </div>

      {/* Assessment Details */}
      {hasAssessment && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <ConditionalAssessmentBadge assessment={score.assessment!} showDetails={false} />
        </div>
      )}
    </div>
  );
};
