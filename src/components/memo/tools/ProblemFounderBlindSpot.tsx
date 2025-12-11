import { useState } from "react";
import { EyeOff, AlertCircle } from "lucide-react";
import { EditableToolCard } from "./EditableToolCard";
import { FounderBlindSpot, EditableTool } from "@/types/memo";
import { safeText, safeArray, mergeToolData, isValidEditableTool } from "@/lib/toolDataUtils";

interface ProblemFounderBlindSpotProps {
  data: EditableTool<FounderBlindSpot>;
  onUpdate?: (data: Partial<FounderBlindSpot>) => void;
}

export const ProblemFounderBlindSpot = ({ data, onUpdate }: ProblemFounderBlindSpotProps) => {
  // Early return if data is invalid
  if (!isValidEditableTool<FounderBlindSpot>(data)) {
    return null;
  }

  const [isEditing, setIsEditing] = useState(false);
  const currentData = mergeToolData(data.aiGenerated, data.userOverrides);

  const potentialExaggerations = safeArray<string>(currentData?.potentialExaggerations);
  const misdiagnoses = safeArray<string>(currentData?.misdiagnoses);
  const assumptions = safeArray<string>(currentData?.assumptions);
  const commonMistakes = safeArray<string>(currentData?.commonMistakes);

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
        {potentialExaggerations.length > 0 && (
          <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
            <p className="text-sm font-medium text-red-600 mb-2">Potential Exaggerations</p>
            <p className="text-xs text-muted-foreground mb-2">Areas where you might be overstating the problem</p>
            <ul className="space-y-1">
              {potentialExaggerations.map((item, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <AlertCircle className="w-3 h-3 text-red-500 mt-1 flex-shrink-0" />
                  {safeText(item)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Misdiagnoses */}
        {misdiagnoses.length > 0 && (
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <p className="text-sm font-medium text-amber-600 mb-2">Possible Misdiagnoses</p>
            <p className="text-xs text-muted-foreground mb-2">Ways founders commonly misidentify the real problem</p>
            <ul className="space-y-1">
              {misdiagnoses.map((item, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-amber-500">?</span>
                  {safeText(item)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Unvalidated Assumptions */}
        {assumptions.length > 0 && (
          <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <p className="text-sm font-medium text-blue-600 mb-2">Unvalidated Assumptions</p>
            <ul className="space-y-1">
              {assumptions.map((item, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  {safeText(item)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Common Mistakes */}
        {commonMistakes.length > 0 && (
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-sm font-medium text-foreground mb-2">Common Founder Mistakes in This Space</p>
            <ul className="space-y-1">
              {commonMistakes.map((item, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground">→</span>
                  {safeText(item)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </EditableToolCard>
  );
};
