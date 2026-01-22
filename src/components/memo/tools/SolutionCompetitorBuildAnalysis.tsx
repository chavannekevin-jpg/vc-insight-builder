import { useState } from "react";
import { Building2, Clock, Users, CheckCircle, XCircle } from "lucide-react";
import { EditableToolCard } from "./EditableToolCard";
import { CompetitorBuildAnalysis, EditableTool } from "@/types/memo";
import { cn } from "@/lib/utils";
import { safeText, safeArray, mergeToolData, isValidEditableTool } from "@/lib/toolDataUtils";

interface SolutionCompetitorBuildAnalysisProps {
  data: EditableTool<CompetitorBuildAnalysis>;
  onUpdate?: (data: Partial<CompetitorBuildAnalysis>) => void;
}

export const SolutionCompetitorBuildAnalysis = ({ data, onUpdate }: SolutionCompetitorBuildAnalysisProps) => {
  const [isEditing, setIsEditing] = useState(false);

  // Early return if data is invalid
  if (!isValidEditableTool<CompetitorBuildAnalysis>(data)) {
    return null;
  }
  const currentData = mergeToolData(data.aiGenerated, data.userOverrides);

  const couldBeBuilt = currentData?.couldBeBuilt ?? true;
  const estimatedTime = safeText(currentData?.estimatedTime);
  const requiredResources = safeText(currentData?.requiredResources);
  const barriers = safeArray<string>(currentData?.barriers);
  const verdict = safeText(currentData?.verdict);

  return (
    <EditableToolCard
      title="12-Month Competitor Build Analysis"
      icon={<Building2 className="w-5 h-5 text-red-500" />}
      dataSource={data.dataSource}
      inputGuidance={[
        "Consider what a $50M funded competitor could build",
        "Think about big tech (FAANG) entering your space",
        "Identify true technical barriers, not just features"
      ]}
      isEditing={isEditing}
      onEditToggle={() => setIsEditing(true)}
      onSave={() => setIsEditing(false)}
      accentColor="red"
    >
      {/* Main Question */}
      <div className={cn(
        "p-4 rounded-lg mb-4 border",
        couldBeBuilt 
          ? "bg-red-500/10 border-red-500/30" 
          : "bg-emerald-500/10 border-emerald-500/30"
      )}>
        <p className="text-sm font-medium text-muted-foreground mb-1">
          Can this be built by a well-funded competitor in 12 months?
        </p>
        <div className="flex items-center gap-2">
          {couldBeBuilt ? (
            <XCircle className="w-5 h-5 text-red-500" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          )}
          <span className={cn(
            "text-lg font-bold",
            couldBeBuilt ? "text-red-600" : "text-emerald-600"
          )}>
            {couldBeBuilt ? "Replicable by well-funded incumbents" : "Hard to replicate quickly"}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="p-3 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Estimated Time</span>
          </div>
          <p className="text-lg font-semibold text-foreground">{estimatedTime || "N/A"}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Required Resources</span>
          </div>
          <p className="text-foreground">{requiredResources || "N/A"}</p>
        </div>
      </div>

      {/* Barriers */}
      {barriers.length > 0 && (
        <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 mb-4">
          <p className="text-sm font-medium text-emerald-600 mb-2">Your Barriers to Entry</p>
          <ul className="space-y-1">
            {barriers.map((barrier, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-emerald-500">✓</span>
                {safeText(barrier)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Verdict */}
      {verdict && (
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-sm font-medium text-primary mb-1">VC Verdict</p>
          <p className="text-foreground">{verdict}</p>
        </div>
      )}
    </EditableToolCard>
  );
};
