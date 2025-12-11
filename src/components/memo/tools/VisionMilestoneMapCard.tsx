import { useState } from "react";
import { Milestone, Target, CheckCircle, Circle } from "lucide-react";
import { EditableToolCard } from "./EditableToolCard";
import { VCMilestoneMap, EditableTool } from "@/types/memo";
import { cn } from "@/lib/utils";

interface VisionMilestoneMapCardProps {
  data: EditableTool<VCMilestoneMap>;
  onUpdate?: (data: Partial<VCMilestoneMap>) => void;
}

export const VisionMilestoneMapCard = ({ data, onUpdate }: VisionMilestoneMapCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const currentData = data.userOverrides ? { ...data.aiGenerated, ...data.userOverrides } : data.aiGenerated;

  return (
    <EditableToolCard
      title="VC Milestone Map (18 Months)"
      icon={<Milestone className="w-5 h-5 text-primary" />}
      dataSource={data.dataSource}
      inputGuidance={[
        "Define metrics VCs will use to evaluate progress",
        "Set realistic but ambitious targets",
        "Align milestones with next funding round requirements"
      ]}
      isEditing={isEditing}
      onEditToggle={() => setIsEditing(true)}
      onSave={() => setIsEditing(false)}
    >
      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
        
        <div className="space-y-4">
          {currentData.milestones.map((milestone, idx) => {
            const hasCurrentValue = milestone.currentValue !== undefined;
            return (
              <div key={idx} className="relative pl-10">
                {/* Dot */}
                <div className={cn(
                  "absolute left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center",
                  hasCurrentValue ? "bg-emerald-500 border-emerald-500" : "bg-background border-muted-foreground"
                )}>
                  {hasCurrentValue ? (
                    <CheckCircle className="w-3 h-3 text-white" />
                  ) : (
                    <Circle className="w-2 h-2 text-muted-foreground" />
                  )}
                </div>
                
                <div className={cn(
                  "p-3 rounded-lg border",
                  hasCurrentValue ? "bg-emerald-500/5 border-emerald-500/20" : "bg-muted/30 border-border/50"
                )}>
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Month {milestone.month}</span>
                      <h5 className="font-medium text-foreground">{milestone.milestone}</h5>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{milestone.metric}:</span>
                      <span className="text-sm font-medium text-foreground">{milestone.targetValue}</span>
                    </div>
                    {hasCurrentValue && (
                      <span className="text-sm text-emerald-600">
                        Current: {milestone.currentValue}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Critical Path */}
      <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-sm font-medium text-primary mb-2">Critical Path to Series A</p>
        <ul className="space-y-1">
          {currentData.criticalPath.map((item, idx) => (
            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-primary font-medium">{idx + 1}.</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </EditableToolCard>
  );
};
