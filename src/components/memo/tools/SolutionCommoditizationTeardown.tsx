import { useState } from "react";
import { Layers, AlertTriangle, Clock, Shield } from "lucide-react";
import { EditableToolCard } from "./EditableToolCard";
import { CommoditizationTeardown, EditableTool } from "@/types/memo";
import { cn } from "@/lib/utils";

interface SolutionCommoditizationTeardownProps {
  data: EditableTool<CommoditizationTeardown>;
  onUpdate?: (data: Partial<CommoditizationTeardown>) => void;
}

export const SolutionCommoditizationTeardown = ({ data, onUpdate }: SolutionCommoditizationTeardownProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const currentData = data.userOverrides ? { ...data.aiGenerated, ...data.userOverrides } : data.aiGenerated;

  const getRiskStyle = (risk: "Low" | "Medium" | "High") => {
    switch (risk) {
      case "Low": return { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-600" };
      case "Medium": return { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-600" };
      case "High": return { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-600" };
    }
  };

  return (
    <EditableToolCard
      title="Feature Commoditization Teardown"
      icon={<Layers className="w-5 h-5 text-amber-500" />}
      dataSource={data.dataSource}
      inputGuidance={[
        "List your key features and what makes them unique",
        "Consider if AWS, Google, or well-funded startups could replicate",
        "Estimate time and cost for competitors to build each feature"
      ]}
      isEditing={isEditing}
      onEditToggle={() => setIsEditing(true)}
      onSave={() => setIsEditing(false)}
      accentColor="amber"
    >
      {/* Overall Risk */}
      <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-muted/30">
        <AlertTriangle className={cn("w-5 h-5", getRiskStyle(currentData.overallRisk).text)} />
        <div>
          <p className="text-sm font-medium text-foreground">Overall Commoditization Risk</p>
          <p className={cn("text-sm font-semibold", getRiskStyle(currentData.overallRisk).text)}>
            {currentData.overallRisk}
          </p>
        </div>
      </div>

      {/* Feature Breakdown */}
      <div className="space-y-3">
        {currentData.features.map((feature, idx) => {
          const style = getRiskStyle(feature.commoditizationRisk);
          return (
            <div 
              key={idx}
              className={cn(
                "p-4 rounded-lg border",
                style.bg,
                style.border
              )}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h5 className="font-medium text-foreground">{feature.feature}</h5>
                <span className={cn("px-2 py-0.5 rounded text-xs font-medium", style.bg, style.text)}>
                  {feature.commoditizationRisk} Risk
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Time to Clone</p>
                    <p className="text-foreground">{feature.timeToClone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Defensibility</p>
                    <p className="text-foreground">{feature.defensibility}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* VC Warning */}
      <div className="mt-4 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
        <p className="text-sm text-red-600">
          <strong>VC Reality Check:</strong> Features marked as "High Risk" are assumed commoditized 
          by most VCs. They won't invest based on these alone.
        </p>
      </div>
    </EditableToolCard>
  );
};
