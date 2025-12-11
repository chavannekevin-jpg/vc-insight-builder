import { TrendingUp, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { SectionScore } from "@/types/memo";
import { cn } from "@/lib/utils";

interface SectionScoreCardProps {
  score: SectionScore;
  sectionName: string;
}

export const SectionScoreCard = ({ score, sectionName }: SectionScoreCardProps) => {
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
              <span className={cn("text-2xl font-bold", getScoreColor(score.score))}>
                {score.score}
              </span>
            </div>
            <div className={cn(
              "absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center bg-background border-2",
              score.score >= 60 ? "border-emerald-500" : "border-amber-500"
            )}>
              {getScoreIcon(score.score)}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{sectionName} Score</h4>
            <p className={cn("text-sm font-medium", getScoreColor(score.score))}>
              {score.label}
            </p>
            <p className="text-xs text-muted-foreground">
              {score.percentile}
            </p>
          </div>
        </div>

        {/* VC Benchmark */}
        <div className="text-right">
          <p className="text-xs text-muted-foreground">VC Benchmark</p>
          <p className="text-lg font-semibold text-foreground">{score.vcBenchmark}+</p>
          <p className="text-xs text-muted-foreground">expected at Seed</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-4">
        <div 
          className={cn("absolute left-0 top-0 h-full rounded-full transition-all duration-500", getScoreBg(score.score))}
          style={{ width: `${score.score}%` }}
        />
        <div 
          className="absolute top-0 h-full w-0.5 bg-foreground/50"
          style={{ left: `${score.vcBenchmark}%` }}
        />
      </div>

      {/* VC Insights */}
      <div className="space-y-3">
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-xs font-medium text-muted-foreground mb-1">What This Tells a VC</p>
          <p className="text-sm text-foreground">{score.whatThisTellsVC}</p>
        </div>
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-xs font-medium text-primary mb-1">Fundability Impact</p>
          <p className="text-sm text-foreground">{score.fundabilityImpact}</p>
        </div>
      </div>
    </div>
  );
};
