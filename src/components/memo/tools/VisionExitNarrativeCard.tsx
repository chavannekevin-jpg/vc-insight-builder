import { useState } from "react";
import { DoorOpen, Building2, DollarSign } from "lucide-react";
import { EditableToolCard } from "./EditableToolCard";
import { ExitNarrative, EditableTool } from "@/types/memo";
import { safeText, safeArray, mergeToolData } from "@/lib/toolDataUtils";
import { useAddEnrichment } from "@/hooks/useProfileEnrichments";

interface VisionExitNarrativeCardProps {
  data: EditableTool<ExitNarrative>;
  onUpdate?: (data: Partial<ExitNarrative>) => void;
}

export const VisionExitNarrativeCard = ({ data, onUpdate }: VisionExitNarrativeCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { addEnrichment } = useAddEnrichment();
  
  // Early return if data is invalid
  if (!data?.aiGenerated) {
    return null;
  }
  
  const currentData = mergeToolData(data.aiGenerated, data.userOverrides);
  const potentialAcquirers = safeArray<string>(currentData.potentialAcquirers);
  const strategicValue = safeText(currentData.strategicValue);
  const comparableExits = safeArray<{ company: string; acquirer: string; value: string; multiple: string }>(currentData.comparableExits);
  const pathToExit = safeText(currentData.pathToExit);

  return (
    <EditableToolCard
      title="Exit Narrative"
      icon={<DoorOpen className="w-5 h-5 text-emerald-500" />}
      dataSource={data.dataSource}
      inputGuidance={[
        "Research recent acquisitions in your space",
        "Identify strategic value to potential acquirers",
        "Consider both strategic and financial buyers"
      ]}
      isEditing={isEditing}
      onEditToggle={() => setIsEditing(true)}
      onSave={() => {
        setIsEditing(false);
        addEnrichment('exit_narrative', 'VisionExitNarrativeCard', {
          potentialAcquirers,
          strategicValue,
          comparableExits: comparableExits.map(e => ({
            company: safeText(e?.company),
            acquirer: safeText(e?.acquirer),
            value: safeText(e?.value),
            multiple: safeText(e?.multiple)
          })),
          pathToExit
        }, 'vision_ask');
      }}
      accentColor="emerald"
    >
      {/* Potential Acquirers */}
      {potentialAcquirers.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            Potential Acquirers
          </p>
          <div className="flex flex-wrap gap-2">
            {potentialAcquirers.map((acquirer, idx) => (
              <span key={idx} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {safeText(acquirer)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Strategic Value */}
      {strategicValue && (
        <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 mb-4">
          <p className="text-sm font-medium text-emerald-600 mb-1">Strategic Value</p>
          <p className="text-sm text-foreground">{strategicValue}</p>
        </div>
      )}

      {/* Comparable Exits */}
      {comparableExits.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            Comparable Exits
          </p>
          <div className="space-y-2">
            {comparableExits.map((exit, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-muted/30 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{safeText(exit?.company)}</p>
                  <p className="text-sm text-muted-foreground">Acquired by {safeText(exit?.acquirer)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{safeText(exit?.value)}</p>
                  <p className="text-sm text-emerald-600">{safeText(exit?.multiple)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Path to Exit */}
      {pathToExit && (
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-sm font-medium text-primary mb-1">Path to Becoming Acquisition Target</p>
          <p className="text-sm text-foreground">{pathToExit}</p>
        </div>
      )}
    </EditableToolCard>
  );
};
