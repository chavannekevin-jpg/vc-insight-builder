import { useState } from "react";
import { Shield, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { EditableToolCard } from "./EditableToolCard";
import { EvidenceThreshold, EditableTool } from "@/types/memo";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { safeText, safeArray, mergeToolData, isValidEditableTool } from "@/lib/toolDataUtils";

interface ProblemEvidenceThresholdProps {
  data: EditableTool<EvidenceThreshold>;
  onUpdate?: (data: Partial<EvidenceThreshold>) => void;
}

export const ProblemEvidenceThreshold = ({ data, onUpdate }: ProblemEvidenceThresholdProps) => {
  // Early return if data is invalid
  if (!isValidEditableTool<EvidenceThreshold>(data)) {
    return null;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(data.userOverrides || data.aiGenerated);

  const currentData = mergeToolData(data.aiGenerated, data.userOverrides);
  
  const verifiedPain = safeArray<string>(currentData?.verifiedPain);
  const unverifiedPain = safeArray<string>(currentData?.unverifiedPain);
  const whatVCsConsiderVerified = safeArray<string>(currentData?.whatVCsConsiderVerified);
  const missingEvidence = safeArray<string>(currentData?.missingEvidence);
  const evidenceGrade = safeText(currentData?.evidenceGrade) || "C";

  const getGradeStyle = (grade: string) => {
    switch (grade) {
      case "A": return { bg: "bg-emerald-500", text: "Excellent evidence" };
      case "B": return { bg: "bg-blue-500", text: "Good evidence" };
      case "C": return { bg: "bg-amber-500", text: "Moderate evidence" };
      case "D": return { bg: "bg-orange-500", text: "Weak evidence" };
      case "F": return { bg: "bg-red-500", text: "Insufficient evidence" };
      default: return { bg: "bg-muted", text: "Unknown" };
    }
  };

  const gradeStyle = getGradeStyle(evidenceGrade);

  const handleSave = () => {
    onUpdate?.(editData);
    setIsEditing(false);
  };

  return (
    <EditableToolCard
      title="Evidence Threshold"
      icon={<Shield className="w-5 h-5 text-primary" />}
      dataSource={data.dataSource}
      inputGuidance={[
        "Add customer interviews, surveys, or testimonials",
        "Include quantified pain points (time/money lost)",
        "Reference market research or industry reports"
      ]}
      isEditing={isEditing}
      onEditToggle={() => setIsEditing(true)}
      onSave={handleSave}
      onReset={() => {
        setEditData(data.aiGenerated);
        onUpdate?.({});
      }}
    >
      {/* Grade Display */}
      <div className="flex items-center gap-4 mb-4">
        <div className={cn(
          "w-16 h-16 rounded-xl flex items-center justify-center",
          gradeStyle.bg
        )}>
          <span className="text-2xl font-bold text-white">{evidenceGrade}</span>
        </div>
        <div>
          <p className="font-semibold text-foreground">{gradeStyle.text}</p>
          <p className="text-sm text-muted-foreground">
            VCs need Grade B or higher to proceed confidently
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Verified Pain */}
        <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-600">Verified Pain Points</span>
          </div>
          <ul className="space-y-1">
            {verifiedPain.map((pain, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-emerald-500">✓</span>
                {isEditing ? (
                  <Input 
                    value={safeText(editData?.verifiedPain?.[idx]) || safeText(pain)}
                    onChange={(e) => {
                      const newPain = [...safeArray<string>(editData?.verifiedPain || verifiedPain)];
                      newPain[idx] = e.target.value;
                      setEditData({ ...editData, verifiedPain: newPain });
                    }}
                    className="h-7 text-sm"
                  />
                ) : safeText(pain)}
              </li>
            ))}
          </ul>
        </div>

        {/* Unverified Pain */}
        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-600">Unverified Claims</span>
          </div>
          <ul className="space-y-1">
            {unverifiedPain.map((pain, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-red-500">✗</span>
                {safeText(pain)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* What VCs Consider Verified */}
      {whatVCsConsiderVerified.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-foreground">What VCs Consider as Verified Evidence</span>
          </div>
          <ul className="space-y-1">
            {whatVCsConsiderVerified.map((item, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-amber-500">→</span>
                {safeText(item)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing Evidence */}
      {missingEvidence.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-sm font-medium text-amber-600 mb-2">Evidence You're Missing</p>
          <ul className="space-y-1">
            {missingEvidence.map((item, idx) => (
              <li key={idx} className="text-sm text-muted-foreground">• {safeText(item)}</li>
            ))}
          </ul>
        </div>
      )}
    </EditableToolCard>
  );
};
