import { Shield, Sparkles, Network, Database, Award, DollarSign, Lock } from "lucide-react";
import { MoatScores } from "@/lib/memoDataExtractor";

interface MemoMoatScoreCardProps {
  moatScores: MoatScores;
  companyName: string;
}

const moatConfig = {
  networkEffects: { label: "Network Effects", icon: Network, description: "Value grows with users" },
  switchingCosts: { label: "Switching Costs", icon: Lock, description: "Hard to leave" },
  dataAdvantage: { label: "Data Advantage", icon: Database, description: "Proprietary data moat" },
  brandTrust: { label: "Brand/Trust", icon: Award, description: "Reputation & certifications" },
  costAdvantage: { label: "Cost Advantage", icon: DollarSign, description: "Economic moat" }
};

function getScoreColor(score: number): string {
  if (score >= 7) return "text-green-500";
  if (score >= 4) return "text-yellow-500";
  return "text-red-400";
}

function getScoreBarColor(score: number): string {
  if (score >= 7) return "bg-green-500";
  if (score >= 4) return "bg-yellow-500";
  return "bg-red-400";
}

function getOverallGrade(score: number): { grade: string; color: string; label: string } {
  if (score >= 70) return { grade: "A", color: "text-green-500", label: "STRONG" };
  if (score >= 50) return { grade: "B", color: "text-blue-500", label: "MODERATE" };
  if (score >= 30) return { grade: "C", color: "text-yellow-500", label: "DEVELOPING" };
  return { grade: "D", color: "text-red-400", label: "WEAK" };
}

function getMoatSuggestions(moatScores: MoatScores): string[] {
  const suggestions: string[] = [];
  
  if (moatScores.networkEffects.score < 5) {
    suggestions.push("Consider building community features or marketplace dynamics to create network effects");
  }
  if (moatScores.switchingCosts.score < 5) {
    suggestions.push("Deepen integrations with customer workflows to increase switching costs");
  }
  if (moatScores.dataAdvantage.score < 5) {
    suggestions.push("Leverage customer data to build proprietary insights or AI capabilities");
  }
  if (moatScores.brandTrust.score < 5) {
    suggestions.push("Pursue enterprise certifications (SOC2, ISO) to build trust moat");
  }
  if (moatScores.costAdvantage.score < 5) {
    suggestions.push("Focus on operational efficiency or proprietary tech to create cost advantages");
  }
  
  return suggestions.slice(0, 3);
}

export function MemoMoatScoreCard({ moatScores, companyName }: MemoMoatScoreCardProps) {
  const overallGrade = getOverallGrade(moatScores.overallScore);
  const suggestions = getMoatSuggestions(moatScores);
  
  return (
    <div className="my-10 bg-gradient-to-br from-card via-card to-blue-500/5 border border-border/50 rounded-2xl p-6 md:p-8 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Shield className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Defensibility Score</h3>
          <p className="text-sm text-muted-foreground">How protected is {companyName} from competition?</p>
        </div>
      </div>

      {/* Overall Score */}
      <div className="bg-background/50 border border-border/30 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">Overall Defensibility</span>
          <div className="flex items-center gap-2">
            <span className={`text-3xl font-bold ${overallGrade.color}`}>{moatScores.overallScore}</span>
            <span className="text-muted-foreground">/100</span>
          </div>
        </div>
        <div className="h-3 bg-muted/50 rounded-full overflow-hidden mb-2">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(moatScores.overallScore / 10)}`}
            style={{ width: `${moatScores.overallScore}%` }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className={`font-semibold ${overallGrade.color}`}>{overallGrade.label}</span>
          <span className="text-muted-foreground">VC Benchmark: 60+</span>
        </div>
      </div>

      {/* Individual Moat Scores */}
      <div className="space-y-4 mb-6">
        {(Object.keys(moatConfig) as Array<keyof typeof moatConfig>).map((key) => {
          const config = moatConfig[key];
          const score = moatScores[key];
          const Icon = config.icon;
          
          return (
            <div key={key} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{config.label}</span>
                </div>
                <span className={`text-sm font-bold ${getScoreColor(score.score)}`}>
                  {score.score}/10
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(score.score)}`}
                    style={{ width: `${score.score * 10}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {score.evidence}
              </p>
            </div>
          );
        })}
      </div>

      {/* Moat Acceleration Suggestions */}
      {suggestions.length > 0 && (
        <div className="border-t border-border/30 pt-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Moat Acceleration Opportunities</span>
          </div>
          <ul className="space-y-2">
            {suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* VC Context */}
      <div className="mt-5 pt-5 border-t border-border/30">
        <p className="text-xs text-muted-foreground italic">
          <span className="font-semibold text-foreground">VC Perspective:</span> Defensibility is crucial for venture returns. Companies with strong moats can maintain pricing power and resist competitive pressure as they scale.
        </p>
      </div>
    </div>
  );
}
