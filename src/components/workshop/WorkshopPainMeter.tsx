import { useMemo } from "react";
import { Flame, AlertCircle, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { 
  analyzePainPoints, 
  getHeatLevel, 
  getPainSuggestions,
  type PainAnalysis 
} from "@/lib/preseedValidation";
import { cn } from "@/lib/utils";

interface WorkshopPainMeterProps {
  text: string;
}

function getScoreColor(score: number): string {
  if (score >= 7) return "text-green-500";
  if (score >= 4) return "text-yellow-500";
  return "text-red-400";
}

function getBarColor(score: number): string {
  if (score >= 7) return "bg-green-500";
  if (score >= 4) return "bg-yellow-500";
  return "bg-red-400";
}

export function WorkshopPainMeter({ text }: WorkshopPainMeterProps) {
  const analysis = useMemo(() => analyzePainPoints(text), [text]);
  const heatLevel = useMemo(() => getHeatLevel(analysis.overallScore), [analysis.overallScore]);
  const suggestions = useMemo(() => getPainSuggestions(analysis), [analysis]);

  // Don't show if no text
  if (!text.trim()) {
    return null;
  }

  const dimensions = [
    { key: 'urgency', label: 'Urgency', data: analysis.urgency },
    { key: 'frequency', label: 'Frequency', data: analysis.frequency },
    { key: 'willingness', label: 'Willingness to Pay', data: analysis.willingness },
    { key: 'alternatives', label: 'Poor Alternatives', data: analysis.alternatives },
  ];

  return (
    <div className="rounded-lg border border-border/50 bg-gradient-to-br from-background to-muted/30 p-4 space-y-4">
      {/* Header with overall score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            `bg-gradient-to-br ${heatLevel.bgColor}`
          )}>
            <Flame className={cn("w-4 h-4", heatLevel.color)} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Problem Intensity</p>
            <div className="flex items-center gap-2">
              <span className={cn("font-semibold text-sm", heatLevel.color)}>
                {analysis.overallScore}/100
              </span>
              <span className="text-xs font-medium">
                {heatLevel.icon} {heatLevel.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Heat level description */}
      <p className="text-xs text-muted-foreground">
        {heatLevel.description}
      </p>

      {/* Dimension breakdown */}
      <div className="grid grid-cols-2 gap-3">
        {dimensions.map(({ key, label, data }) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className={cn("text-xs font-medium", getScoreColor(data.score))}>
                {data.score}/10
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all duration-300", getBarColor(data.score))}
                style={{ width: `${data.score * 10}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium">Strengthen Your Problem</span>
          </div>
          <ul className="space-y-1">
            {suggestions.map((suggestion, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-yellow-500" />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
