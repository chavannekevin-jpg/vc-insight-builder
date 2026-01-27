import { useState } from "react";
import { GitBranch, TrendingUp, Minus, TrendingDown } from "lucide-react";
import { EditableToolCard } from "./EditableToolCard";
import { ScenarioPlanning, EditableTool } from "@/types/memo";
import { cn } from "@/lib/utils";
import { safeText, safeNumber, mergeToolData } from "@/lib/toolDataUtils";
import { useAddEnrichment } from "@/hooks/useProfileEnrichments";

interface VisionScenarioPlanningCardProps {
  data: EditableTool<ScenarioPlanning>;
  onUpdate?: (data: Partial<ScenarioPlanning>) => void;
}

export const VisionScenarioPlanningCard = ({ data, onUpdate }: VisionScenarioPlanningCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { addEnrichment } = useAddEnrichment();
  
  // Early return if data is invalid
  if (!data?.aiGenerated) {
    return null;
  }
  
  const currentData = mergeToolData(data.aiGenerated, data.userOverrides);

  // Safely extract scenario data with defaults
  type ScenarioData = { probability?: number; description?: string; fundraisingImplication?: string };
  const bestCase: ScenarioData = currentData.bestCase || {};
  const baseCase: ScenarioData = currentData.baseCase || {};
  const downside: ScenarioData = currentData.downside || {};

  const scenarios = [
    { key: "bestCase", label: "Best Case", icon: <TrendingUp className="w-5 h-5" />, data: bestCase, style: "emerald" },
    { key: "baseCase", label: "Base Case", icon: <Minus className="w-5 h-5" />, data: baseCase, style: "blue" },
    { key: "downside", label: "Downside", icon: <TrendingDown className="w-5 h-5" />, data: downside, style: "red" },
  ];

  return (
    <EditableToolCard
      title="Scenario Planning"
      icon={<GitBranch className="w-5 h-5 text-blue-500" />}
      dataSource={data.dataSource}
      inputGuidance={[
        "Be realistic about probability of each scenario",
        "Consider how each affects your fundraising timeline",
        "Plan runway needs for downside scenarios"
      ]}
      isEditing={isEditing}
      onEditToggle={() => setIsEditing(true)}
      onSave={() => {
        setIsEditing(false);
        addEnrichment('scenario_planning', 'VisionScenarioPlanningCard', {
          bestCase: {
            probability: safeNumber(bestCase?.probability, 33),
            description: safeText(bestCase?.description),
            fundraisingImplication: safeText(bestCase?.fundraisingImplication)
          },
          baseCase: {
            probability: safeNumber(baseCase?.probability, 33),
            description: safeText(baseCase?.description),
            fundraisingImplication: safeText(baseCase?.fundraisingImplication)
          },
          downside: {
            probability: safeNumber(downside?.probability, 33),
            description: safeText(downside?.description),
            fundraisingImplication: safeText(downside?.fundraisingImplication)
          }
        }, 'vision_ask');
      }}
      accentColor="blue"
    >
      <div className="space-y-3">
        {scenarios.map((scenario) => {
          const bgClass = scenario.style === "emerald" ? "bg-emerald-500/5 border-emerald-500/20" :
                         scenario.style === "blue" ? "bg-blue-500/5 border-blue-500/20" :
                         "bg-red-500/5 border-red-500/20";
          const textClass = scenario.style === "emerald" ? "text-emerald-600" :
                           scenario.style === "blue" ? "text-blue-600" : "text-red-600";
          
          const probability = safeNumber(scenario.data?.probability, 33);
          const description = safeText(scenario.data?.description);
          const fundraisingImplication = safeText(scenario.data?.fundraisingImplication);
          
          return (
            <div key={scenario.key} className={cn("p-4 rounded-lg border", bgClass)}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className={textClass}>{scenario.icon}</span>
                  <h5 className={cn("font-semibold", textClass)}>{scenario.label}</h5>
                </div>
                <span className={cn("px-2 py-1 rounded text-xs font-medium", bgClass, textClass)}>
                  {probability}% likely
                </span>
              </div>
              
              {description && (
                <p className="text-sm text-foreground mb-2">{description}</p>
              )}
              
              {fundraisingImplication && (
                <div className="p-2 rounded bg-background/50">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Fundraising Implication</p>
                  <p className="text-sm text-foreground">{fundraisingImplication}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </EditableToolCard>
  );
};
