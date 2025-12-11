import { useState } from "react";
import { Gauge, TrendingUp, DollarSign, ArrowLeftRight } from "lucide-react";
import { EditableToolCard } from "./EditableToolCard";
import { MarketReadinessIndex, EditableTool } from "@/types/memo";
import { cn } from "@/lib/utils";
import { safeText, safeNumber, mergeToolData, isValidEditableTool } from "@/lib/toolDataUtils";

interface MarketReadinessIndexCardProps {
  data: EditableTool<MarketReadinessIndex>;
  onUpdate?: (data: Partial<MarketReadinessIndex>) => void;
}

export const MarketReadinessIndexCard = ({ data, onUpdate }: MarketReadinessIndexCardProps) => {
  // Early return if data is invalid
  if (!isValidEditableTool<MarketReadinessIndex>(data)) {
    return null;
  }

  const [isEditing, setIsEditing] = useState(false);
  const currentData = mergeToolData(data.aiGenerated, data.userOverrides);

  const overallScore = safeNumber(currentData?.overallScore, 50);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-amber-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  const factors = [
    { key: "regulatoryPressure", label: "Regulatory Pressure", icon: <TrendingUp className="w-4 h-4" />, data: currentData?.regulatoryPressure },
    { key: "urgency", label: "Market Urgency", icon: <Gauge className="w-4 h-4" />, data: currentData?.urgency },
    { key: "willingnessToPay", label: "Willingness to Pay", icon: <DollarSign className="w-4 h-4" />, data: currentData?.willingnessToPay },
    { key: "switchingFriction", label: "Switching Friction", icon: <ArrowLeftRight className="w-4 h-4" />, data: currentData?.switchingFriction },
  ].filter(f => f.data && typeof f.data === 'object');

  return (
    <EditableToolCard
      title="Market Readiness Index"
      icon={<Gauge className="w-5 h-5 text-blue-500" />}
      dataSource={data.dataSource}
      inputGuidance={[
        "Consider recent regulatory changes affecting your market",
        "Evidence of budget allocation for this problem category",
        "Switching costs from incumbent solutions"
      ]}
      isEditing={isEditing}
      onEditToggle={() => setIsEditing(true)}
      onSave={() => setIsEditing(false)}
      accentColor="blue"
    >
      {/* Overall Score */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted" />
            <circle 
              cx="48" 
              cy="48" 
              r="42" 
              stroke="currentColor" 
              strokeWidth="8" 
              fill="none" 
              strokeDasharray={`${overallScore * 2.64} 264`}
              className={getScoreColor(overallScore)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-2xl font-bold", getScoreColor(overallScore))}>
              {overallScore}
            </span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
        </div>
        <div>
          <p className="font-semibold text-foreground">Market Readiness Score</p>
          <p className="text-sm text-muted-foreground">
            VCs look for 60+ to confirm market timing
          </p>
          <p className={cn("text-sm font-medium mt-1", getScoreColor(overallScore))}>
            {overallScore >= 80 ? "Excellent timing" : 
             overallScore >= 60 ? "Good timing" :
             overallScore >= 40 ? "Uncertain timing" : "Early/risky timing"}
          </p>
        </div>
      </div>

      {/* Factor Breakdown */}
      {factors.length > 0 && (
        <div className="space-y-4">
          {factors.map((factor) => {
            const factorScore = safeNumber(factor.data?.score, 0);
            const factorEvidence = safeText(factor.data?.evidence);
            return (
              <div key={factor.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{factor.icon}</span>
                    <span className="text-sm font-medium text-foreground">{factor.label}</span>
                  </div>
                  <span className={cn("text-sm font-semibold", getScoreColor(factorScore))}>
                    {factorScore}/100
                  </span>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn("absolute left-0 top-0 h-full rounded-full transition-all duration-500", getScoreBg(factorScore))}
                    style={{ width: `${Math.min(factorScore, 100)}%` }}
                  />
                </div>
                {factorEvidence && (
                  <p className="text-xs text-muted-foreground">{factorEvidence}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </EditableToolCard>
  );
};
