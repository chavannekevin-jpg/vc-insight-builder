import { useState } from "react";
import { Users, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { EditableToolCard } from "./EditableToolCard";
import { CredibilityGapAnalysis, EditableTool } from "@/types/memo";
import { cn } from "@/lib/utils";

interface TeamCredibilityGapCardProps {
  data: EditableTool<CredibilityGapAnalysis>;
  onUpdate?: (data: Partial<CredibilityGapAnalysis>) => void;
}

export const TeamCredibilityGapCard = ({ data, onUpdate }: TeamCredibilityGapCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const currentData = data.userOverrides ? { ...data.aiGenerated, ...data.userOverrides } : data.aiGenerated;

  const getSeverityStyle = (severity: "Critical" | "Important" | "Minor") => {
    switch (severity) {
      case "Critical": return { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-600" };
      case "Important": return { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-600" };
      case "Minor": return { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-600" };
    }
  };

  const getCredibilityColor = (score: number) => {
    if (score >= 70) return "text-emerald-500";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <EditableToolCard
      title="Team Credibility Gap Analysis"
      icon={<Users className="w-5 h-5 text-blue-500" />}
      dataSource={data.dataSource}
      inputGuidance={[
        "List team members' relevant experience",
        "Identify advisor or hire plans for gaps",
        "Consider domain expertise vs. startup experience"
      ]}
      isEditing={isEditing}
      onEditToggle={() => setIsEditing(true)}
      onSave={() => setIsEditing(false)}
      accentColor="blue"
    >
      {/* Overall Credibility Score */}
      <div className="flex items-center gap-4 mb-4 p-3 rounded-lg bg-muted/30">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="none" className="text-muted" />
            <circle 
              cx="32" cy="32" r="28" 
              stroke="currentColor" strokeWidth="6" fill="none" 
              strokeDasharray={`${currentData.overallCredibility * 1.76} 176`}
              className={getCredibilityColor(currentData.overallCredibility)}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn("text-lg font-bold", getCredibilityColor(currentData.overallCredibility))}>
              {currentData.overallCredibility}
            </span>
          </div>
        </div>
        <div>
          <p className="font-medium text-foreground">Team Credibility Score</p>
          <p className="text-sm text-muted-foreground">VCs expect 60+ for Seed rounds</p>
        </div>
      </div>

      {/* Skills Comparison */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-600">Current Skills</span>
          </div>
          <ul className="space-y-1">
            {currentData.currentSkills.map((skill, idx) => (
              <li key={idx} className="text-sm text-muted-foreground">• {skill}</li>
            ))}
          </ul>
        </div>
        <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-600">VCs Expect</span>
          </div>
          <ul className="space-y-1">
            {currentData.expectedSkills.map((skill, idx) => (
              <li key={idx} className="text-sm text-muted-foreground">• {skill}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Gaps */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Identified Gaps</p>
        {currentData.gaps.map((gap, idx) => {
          const style = getSeverityStyle(gap.severity);
          return (
            <div key={idx} className={cn("p-3 rounded-lg border", style.bg, style.border)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{gap.skill}</p>
                  <p className="text-sm text-muted-foreground mt-1">{gap.mitigation}</p>
                </div>
                <span className={cn("px-2 py-0.5 rounded text-xs font-medium", style.text)}>
                  {gap.severity}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </EditableToolCard>
  );
};
