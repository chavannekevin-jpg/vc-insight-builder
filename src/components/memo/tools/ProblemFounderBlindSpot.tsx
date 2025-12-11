import { useState } from "react";
import { EyeOff, AlertCircle } from "lucide-react";
import { EditableToolCard } from "./EditableToolCard";
import { FounderBlindSpot, EditableTool } from "@/types/memo";

interface ProblemFounderBlindSpotProps {
  data: EditableTool<FounderBlindSpot>;
  onUpdate?: (data: Partial<FounderBlindSpot>) => void;
}

export const ProblemFounderBlindSpot = ({ data, onUpdate }: ProblemFounderBlindSpotProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const currentData = data.userOverrides ? { ...data.aiGenerated, ...data.userOverrides } : data.aiGenerated;

  return (
    <EditableToolCard
      title="Founder Blind Spots"
      icon={<EyeOff className="w-5 h-5 text-amber-500" />}
      dataSource={data.dataSource}
      inputGuidance={[
        "Be honest about assumptions you haven't validated",
        "Consider what a skeptical VC would question"
      ]}
      isEditing={isEditing}
      onEditToggle={() => setIsEditing(true)}
      onSave={() => setIsEditing(false)}
      accentColor="amber"
    >
      <div className="space-y-4">
        {/* Potential Exaggerations */}
        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
          <p className="text-sm font-medium text-red-600 mb-2">Potential Exaggerations</p>
          <p className="text-xs text-muted-foreground mb-2">Areas where you might be overstating the problem</p>
          <ul className="space-y-1">
            {currentData.potentialExaggerations.map((item, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <AlertCircle className="w-3 h-3 text-red-500 mt-1 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Misdiagnoses */}
        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <p className="text-sm font-medium text-amber-600 mb-2">Possible Misdiagnoses</p>
          <p className="text-xs text-muted-foreground mb-2">Ways founders commonly misidentify the real problem</p>
          <ul className="space-y-1">
            {currentData.misdiagnoses.map((item, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-amber-500">?</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Unvalidated Assumptions */}
        <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
          <p className="text-sm font-medium text-blue-600 mb-2">Unvalidated Assumptions</p>
          <ul className="space-y-1">
            {currentData.assumptions.map((item, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-blue-500">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Common Mistakes */}
        <div className="p-3 rounded-lg bg-muted/30">
          <p className="text-sm font-medium text-foreground mb-2">Common Founder Mistakes in This Space</p>
          <ul className="space-y-1">
            {currentData.commonMistakes.map((item, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-muted-foreground">→</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </EditableToolCard>
  );
};
