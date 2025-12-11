import { useState } from "react";
import { Shield, Clock, TrendingDown, TrendingUp } from "lucide-react";
import { EditableToolCard } from "./EditableToolCard";
import { MoatDurability, EditableTool } from "@/types/memo";
import { cn } from "@/lib/utils";

interface CompetitionMoatDurabilityProps {
  data: EditableTool<MoatDurability>;
  onUpdate?: (data: Partial<MoatDurability>) => void;
}

export const CompetitionMoatDurabilityCard = ({ data, onUpdate }: CompetitionMoatDurabilityProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const currentData = data.userOverrides ? { ...data.aiGenerated, ...data.userOverrides } : data.aiGenerated;

  const getStrengthColor = (strength: number) => {
    if (strength >= 70) return "text-emerald-500";
    if (strength >= 50) return "text-blue-500";
    if (strength >= 30) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <EditableToolCard
      title="Moat Durability Estimate"
      icon={<Shield className="w-5 h-5 text-amber-500" />}
      dataSource={data.dataSource}
      inputGuidance={[
        "Be honest about how long your advantages will last",
        "Consider both direct competitors and platform risk"
      ]}
      isEditing={isEditing}
      onEditToggle={() => setIsEditing(true)}
      onSave={() => setIsEditing(false)}
      accentColor="amber"
    >
      {/* Strength & Duration */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 rounded-lg bg-muted/30 text-center">
          <p className="text-xs text-muted-foreground mb-1">Current Moat Strength</p>
          <p className={cn("text-3xl font-bold", getStrengthColor(currentData.currentMoatStrength))}>
            {currentData.currentMoatStrength}
            <span className="text-lg text-muted-foreground">/100</span>
          </p>
        </div>
        <div className="p-4 rounded-lg bg-muted/30 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Estimated Duration</p>
          </div>
          <p className="text-xl font-bold text-foreground">{currentData.estimatedDuration}</p>
        </div>
      </div>

      {/* Erosion Factors */}
      <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown className="w-4 h-4 text-red-500" />
          <span className="text-sm font-medium text-red-600">Erosion Factors</span>
        </div>
        <ul className="space-y-1">
          {currentData.erosionFactors.map((factor, idx) => (
            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-red-500">•</span>
              {factor}
            </li>
          ))}
        </ul>
      </div>

      {/* Reinforcement Opportunities */}
      <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-medium text-emerald-600">Reinforcement Opportunities</span>
        </div>
        <ul className="space-y-1">
          {currentData.reinforcementOpportunities.map((opp, idx) => (
            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-emerald-500">+</span>
              {opp}
            </li>
          ))}
        </ul>
      </div>
    </EditableToolCard>
  );
};
