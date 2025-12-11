import { useState } from "react";
import { Swords, ArrowRight, AlertTriangle } from "lucide-react";
import { EditableToolCard } from "./EditableToolCard";
import { CompetitorChessboard, EditableTool } from "@/types/memo";
import { cn } from "@/lib/utils";

interface CompetitionChessboardCardProps {
  data: EditableTool<CompetitorChessboard>;
  onUpdate?: (data: Partial<CompetitorChessboard>) => void;
}

export const CompetitionChessboardCard = ({ data, onUpdate }: CompetitionChessboardCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const currentData = data.userOverrides ? { ...data.aiGenerated, ...data.userOverrides } : data.aiGenerated;

  const getThreatStyle = (threat: "Low" | "Medium" | "High") => {
    switch (threat) {
      case "Low": return { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-600" };
      case "Medium": return { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-600" };
      case "High": return { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-600" };
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
      <div className="p-3 rounded-lg bg-muted/30 mb-4">
        <p className="text-sm text-foreground">{currentData.marketDynamics}</p>
      </div>

      {/* Competitor Cards */}
      <div className="space-y-3">
        {currentData.competitors.map((competitor, idx) => {
          const style = getThreatStyle(competitor.threat24Months);
          return (
            <div key={idx} className={cn("p-4 rounded-lg border", style.bg, style.border)}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h5 className="font-semibold text-foreground">{competitor.name}</h5>
                  <p className="text-sm text-muted-foreground">{competitor.currentPosition}</p>
                </div>
                <span className={cn("px-2 py-1 rounded text-xs font-medium", style.text, style.bg)}>
                  {competitor.threat24Months} Threat
                </span>
              </div>
              
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Likely Moves (12-24 months)</p>
                <ul className="space-y-1">
                  {competitor.likely12MonthMoves.map((move, mIdx) => (
                    <li key={mIdx} className="text-sm text-foreground flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 text-muted-foreground mt-1 flex-shrink-0" />
                      {move}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </EditableToolCard>
  );
};
