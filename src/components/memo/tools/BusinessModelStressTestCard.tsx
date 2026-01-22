import { useState } from "react";
import { FlaskConical, AlertTriangle, TrendingDown } from "lucide-react";
import { EditableToolCard } from "./EditableToolCard";
import { ModelStressTest, EditableTool } from "@/types/memo";
import { cn } from "@/lib/utils";
import { safeText, safeArray, safeNumber, mergeToolData } from "@/lib/toolDataUtils";

interface BusinessModelStressTestProps {
  data: EditableTool<ModelStressTest>;
  onUpdate?: (data: Partial<ModelStressTest>) => void;
}

export const BusinessModelStressTestCard = ({ data, onUpdate }: BusinessModelStressTestProps) => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Early return if data is invalid - after hooks
  if (!data?.aiGenerated) {
    return (
      <div className="p-4 rounded-lg border border-border/50 bg-muted/20 text-center">
        <FlaskConical className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Stress test data not available</p>
      </div>
    );
  }
  
  const currentData = mergeToolData(data.aiGenerated, data.userOverrides);
  const overallResilience = safeText(currentData.overallResilience) || "Medium";
  const scenarios = safeArray<{ scenario: string; impact: string; survivalProbability: number; mitigations: string[] }>(currentData.scenarios);

  const getResilienceStyle = (resilience: string) => {
    switch (resilience) {
      case "High": return { bg: "bg-emerald-500/10", text: "text-emerald-600", label: "Resilient" };
      case "Medium": return { bg: "bg-amber-500/10", text: "text-amber-600", label: "Moderate" };
      case "Low": return { bg: "bg-red-500/10", text: "text-red-600", label: "Fragile" };
      default: return { bg: "bg-muted", text: "text-foreground", label: "Unknown" };
    }
  };

  const resilienceStyle = getResilienceStyle(overallResilience);

  return (
    <EditableToolCard
      title="Model Stress Test"
      icon={<FlaskConical className="w-5 h-5 text-red-500" />}
      dataSource={data.dataSource}
      inputGuidance={[
        "Input your current unit economics",
        "Consider realistic downside scenarios",
        "Plan mitigations for each scenario"
      ]}
      isEditing={isEditing}
      onEditToggle={() => setIsEditing(true)}
      onSave={() => setIsEditing(false)}
      accentColor="red"
    >
      {/* Overall Resilience */}
      <div className={cn("p-3 rounded-lg mb-4 flex items-center gap-3", resilienceStyle.bg)}>
        <FlaskConical className={cn("w-5 h-5", resilienceStyle.text)} />
        <div>
          <p className="text-sm font-medium text-foreground">Overall Business Resilience</p>
          <p className={cn("font-semibold", resilienceStyle.text)}>{resilienceStyle.label}</p>
        </div>
      </div>

      {/* Scenarios */}
      {scenarios.length > 0 && (
        <div className="space-y-3">
          {scenarios.map((scenario, idx) => {
            const survivalProbability = safeNumber(scenario?.survivalProbability, 50);
            const mitigations = safeArray<string>(scenario?.mitigations);
            
            return (
              <div key={idx} className="p-4 rounded-lg border border-border/50 bg-card">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <h5 className="font-medium text-foreground">{safeText(scenario?.scenario)}</h5>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Survival</p>
                    <p className={cn(
                      "font-semibold",
                      survivalProbability >= 70 ? "text-emerald-500" :
                      survivalProbability >= 40 ? "text-amber-500" : "text-red-500"
                    )}>
                      {survivalProbability}%
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{safeText(scenario?.impact)}</p>
                
                {mitigations.length > 0 && (
                  <div className="p-2 rounded bg-muted/30">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Mitigations</p>
                    <ul className="space-y-1">
                      {mitigations.map((m, mIdx) => (
                        <li key={mIdx} className="text-sm text-foreground flex items-start gap-2">
                          <span className="text-emerald-500">→</span>
                          {safeText(m)}
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
