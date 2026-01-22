import { useState } from "react";
import { Swords, ArrowRight } from "lucide-react";
import { EditableToolCard } from "./EditableToolCard";
import { CompetitorChessboard, CompetitorMove, EditableTool } from "@/types/memo";
import { cn } from "@/lib/utils";
import { safeText, safeArray, mergeToolData, isValidEditableTool } from "@/lib/toolDataUtils";

interface CompetitionChessboardCardProps {
  data: EditableTool<CompetitorChessboard>;
  onUpdate?: (data: Partial<CompetitorChessboard>) => void;
}

export const CompetitionChessboardCard = ({ data, onUpdate }: CompetitionChessboardCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Early return if data is invalid - after hooks
  if (!isValidEditableTool<CompetitorChessboard>(data)) {
    return (
      <div className="p-4 rounded-lg border border-border/50 bg-muted/20 text-center">
        <Swords className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Competitor data not available</p>
      </div>
    );
  }

  const currentData = mergeToolData(data.aiGenerated, data.userOverrides);
  const marketDynamics = safeText(currentData?.marketDynamics);
  const competitors = safeArray<CompetitorMove>(currentData?.competitors);

  const getThreatStyle = (threat: string) => {
    switch (threat) {
      case "Low": return { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-600" };
      case "High": return { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-600" };
      default: return { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-600" };
    }
  };

  return (
    <EditableToolCard
      title="Competitor Chessboard"
      icon={<Swords className="w-5 h-5 text-primary" />}
      dataSource={data.dataSource}
      inputGuidance={[
        "List your top 3-5 competitors",
        "Research their recent funding, hires, and product launches",
        "Think about their likely strategic moves"
      ]}
      isEditing={isEditing}
      onEditToggle={() => setIsEditing(true)}
      onSave={() => setIsEditing(false)}
    >
      {/* Market Dynamics */}
      {marketDynamics && (
        <div className="p-3 rounded-lg bg-muted/30 mb-4">
          <p className="text-sm text-foreground">{marketDynamics}</p>
        </div>
      )}

      {/* Competitor Cards */}
      {competitors.length > 0 && (
        <div className="space-y-3">
          {competitors.map((competitor, idx) => {
            const threatLevel = safeText(competitor?.threat24Months) || "Medium";
            const style = getThreatStyle(threatLevel);
            const moves = safeArray<string>(competitor?.likely12MonthMoves);
            return (
              <div key={idx} className={cn("p-4 rounded-lg border", style.bg, style.border)}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h5 className="font-semibold text-foreground">{safeText(competitor?.name)}</h5>
                    <p className="text-sm text-muted-foreground">{safeText(competitor?.currentPosition)}</p>
                  </div>
                  <span className={cn("px-2 py-1 rounded text-xs font-medium", style.text, style.bg)}>
                    {threatLevel} Threat
                  </span>
                </div>
                
                {moves.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Likely Moves (12-24 months)</p>
                    <ul className="space-y-1">
                      {moves.map((move, mIdx) => (
                        <li key={mIdx} className="text-sm text-foreground flex items-start gap-2">
                          <ArrowRight className="w-3 h-3 text-muted-foreground mt-1 flex-shrink-0" />
                          {safeText(move)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </EditableToolCard>
  );
};
