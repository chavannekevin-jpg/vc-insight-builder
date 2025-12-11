import { useState } from "react";
import { FlaskConical, AlertTriangle, TrendingDown } from "lucide-react";
import { EditableToolCard } from "./EditableToolCard";
import { ModelStressTest, EditableTool } from "@/types/memo";
import { cn } from "@/lib/utils";

interface BusinessModelStressTestProps {
  data: EditableTool<ModelStressTest>;
  onUpdate?: (data: Partial<ModelStressTest>) => void;
}

export const BusinessModelStressTestCard = ({ data, onUpdate }: BusinessModelStressTestProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const currentData = data.userOverrides ? { ...data.aiGenerated, ...data.userOverrides } : data.aiGenerated;

  const getResilienceStyle = (resilience: "Low" | "Medium" | "High") => {
    switch (resilience) {
      case "High": return { bg: "bg-emerald-500/10", text: "text-emerald-600", label: "Resilient" };
      case "Medium": return { bg: "bg-amber-500/10", text: "text-amber-600", label: "Moderate" };
      case "Low": return { bg: "bg-red-500/10", text: "text-red-600", label: "Fragile" };
    }
  };

  const resilienceStyle = getResilienceStyle(currentData.overallResilience);

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
      <div className="space-y-3">
        {currentData.scenarios.map((scenario, idx) => (
          <div key={idx} className="p-4 rounded-lg border border-border/50 bg-card">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h5 className="font-medium text-foreground">{scenario.scenario}</h5>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Survival</p>
                <p className={cn(
                  "font-semibold",
                  scenario.survivalProbability >= 70 ? "text-emerald-500" :
                  scenario.survivalProbability >= 40 ? "text-amber-500" : "text-red-500"
                )}>
                  {scenario.survivalProbability}%
                </p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">{scenario.impact}</p>
            
            <div className="p-2 rounded bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground mb-1">Mitigations</p>
              <ul className="space-y-1">
                {scenario.mitigations.map((m, mIdx) => (
                  <li key={mIdx} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-emerald-500">→</span>
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </EditableToolCard>
  );
};
