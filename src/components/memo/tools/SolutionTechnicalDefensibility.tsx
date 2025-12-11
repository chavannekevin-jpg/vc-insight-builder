import { useState } from "react";
import { Shield, Lock, Unlock, AlertTriangle } from "lucide-react";
import { EditableToolCard } from "./EditableToolCard";
import { TechnicalDefensibility, EditableTool } from "@/types/memo";
import { cn } from "@/lib/utils";

interface SolutionTechnicalDefensibilityProps {
  data: EditableTool<TechnicalDefensibility>;
  onUpdate?: (data: Partial<TechnicalDefensibility>) => void;
}

export const SolutionTechnicalDefensibility = ({ data, onUpdate }: SolutionTechnicalDefensibilityProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const currentData = data.userOverrides ? { ...data.aiGenerated, ...data.userOverrides } : data.aiGenerated;

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-500";
    if (score >= 50) return "text-blue-500";
    if (score >= 30) return "text-amber-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return "bg-emerald-500";
    if (score >= 50) return "bg-blue-500";
    if (score >= 30) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <EditableToolCard
      title="Technical Defensibility"
      icon={<Shield className="w-5 h-5 text-blue-500" />}
      dataSource={data.dataSource}
      inputGuidance={[
        "List patents, proprietary algorithms, or unique data",
        "Describe technical complexity that creates barriers",
        "Mention time/cost for competitors to replicate"
      ]}
      isEditing={isEditing}
      onEditToggle={() => setIsEditing(true)}
      onSave={() => setIsEditing(false)}
      accentColor="blue"
    >
      {/* Score */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 transform -rotate-90">
            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted" />
            <circle 
              cx="40" 
              cy="40" 
              r="36" 
              stroke="currentColor" 
              strokeWidth="8" 
              fill="none" 
              strokeDasharray={`${currentData.defensibilityScore * 2.26} 226`}
              className={getScoreColor(currentData.defensibilityScore)}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn("text-xl font-bold", getScoreColor(currentData.defensibilityScore))}>
              {currentData.defensibilityScore}
            </span>
          </div>
        </div>
        <div>
          <p className="font-semibold text-foreground">Defensibility Score</p>
          <p className="text-sm text-muted-foreground">
            VCs expect 50+ for Seed, 70+ for Series A
          </p>
        </div>
      </div>

      {/* VC Evaluation */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 mb-4">
        <p className="text-sm font-medium text-primary mb-1">VC Evaluation</p>
        <p className="text-sm text-foreground">{currentData.vcEvaluation}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Your Proof Points */}
        <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-600">Your Proof Points</span>
          </div>
          <ul className="space-y-1">
            {currentData.proofPoints.map((point, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-emerald-500">✓</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Expected by VCs */}
        <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Unlock className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-600">VCs Expect to See</span>
          </div>
          <ul className="space-y-1">
            {currentData.expectedProofs.map((proof, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-blue-500">→</span>
                {proof}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Gaps */}
      {currentData.gaps.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-600">Defensibility Gaps</span>
          </div>
          <ul className="space-y-1">
            {currentData.gaps.map((gap, idx) => (
              <li key={idx} className="text-sm text-muted-foreground">• {gap}</li>
            ))}
          </ul>
        </div>
      )}
    </EditableToolCard>
  );
};
