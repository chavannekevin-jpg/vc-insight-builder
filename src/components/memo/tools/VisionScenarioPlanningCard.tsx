import { useState } from "react";
import { GitBranch, TrendingUp, Minus, TrendingDown } from "lucide-react";
import { EditableToolCard } from "./EditableToolCard";
import { ScenarioPlanning, EditableTool } from "@/types/memo";
import { cn } from "@/lib/utils";

interface VisionScenarioPlanningCardProps {
  data: EditableTool<ScenarioPlanning>;
  onUpdate?: (data: Partial<ScenarioPlanning>) => void;
}

export const VisionScenarioPlanningCard = ({ data, onUpdate }: VisionScenarioPlanningCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const currentData = data.userOverrides ? { ...data.aiGenerated, ...data.userOverrides } : data.aiGenerated;

  const scenarios = [
    { key: "bestCase", label: "Best Case", icon: <TrendingUp className="w-5 h-5" />, data: currentData.bestCase, style: "emerald" },
    { key: "baseCase", label: "Base Case", icon: <Minus className="w-5 h-5" />, data: currentData.baseCase, style: "blue" },
    { key: "downside", label: "Downside", icon: <TrendingDown className="w-5 h-5" />, data: currentData.downside, style: "red" },
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
      onSave={() => setIsEditing(false)}
      accentColor="blue"
    >
      <div className="space-y-3">
        {scenarios.map((scenario) => {
          const bgClass = scenario.style === "emerald" ? "bg-emerald-500/5 border-emerald-500/20" :
                         scenario.style === "blue" ? "bg-blue-500/5 border-blue-500/20" :
                         "bg-red-500/5 border-red-500/20";
          const textClass = scenario.style === "emerald" ? "text-emerald-600" :
                           scenario.style === "blue" ? "text-blue-600" : "text-red-600";
          
          return (
            <div key={scenario.key} className={cn("p-4 rounded-lg border", bgClass)}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className={textClass}>{scenario.icon}</span>
                  <h5 className={cn("font-semibold", textClass)}>{scenario.label}</h5>
                </div>
                <span className={cn("px-2 py-1 rounded text-xs font-medium", bgClass, textClass)}>
                  {scenario.data.probability}% likely
                </span>
              </div>
              
              <p className="text-sm text-foreground mb-2">{scenario.data.description}</p>
              
              <div className="p-2 rounded bg-background/50">
                <p className="text-xs font-medium text-muted-foreground mb-1">Fundraising Implication</p>
                <p className="text-sm text-foreground">{scenario.data.fundraisingImplication}</p>
              </div>
            </div>
          );
        })}
      </div>
    </EditableToolCard>
  );
};
