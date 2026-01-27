import { useState } from "react";
import { Target, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { EditableToolCard } from "./EditableToolCard";
import { TractionDepthTest, EditableTool } from "@/types/memo";
import { cn } from "@/lib/utils";
import { safeText, safeArray, safeNumber, mergeToolData } from "@/lib/toolDataUtils";
import { useAddEnrichment } from "@/hooks/useProfileEnrichments";
interface TractionDepthTestCardProps {
  data: EditableTool<TractionDepthTest>;
  onUpdate?: (data: Partial<TractionDepthTest>) => void;
}

export const TractionDepthTestCard = ({ data, onUpdate }: TractionDepthTestCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { addEnrichment } = useAddEnrichment();
  
  // Early return if data is invalid
  if (!data?.aiGenerated) {
    return null;
  }
  
  const currentData = mergeToolData(data.aiGenerated, data.userOverrides);
  const tractionType = safeText(currentData.tractionType) || "Unknown";
  const sustainabilityScore = safeNumber(currentData.sustainabilityScore, 50);
  const redFlags = safeArray<string>(currentData.redFlags);
  const positiveSignals = safeArray<string>(currentData.positiveSignals);

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "Viral": return { bg: "bg-emerald-500/10", text: "text-emerald-600", desc: "Best - self-sustaining growth" };
      case "Repeatable": return { bg: "bg-blue-500/10", text: "text-blue-600", desc: "Good - scalable process" };
      case "Founder-led": return { bg: "bg-amber-500/10", text: "text-amber-600", desc: "Risky - depends on founders" };
      case "Discount-driven": return { bg: "bg-red-500/10", text: "text-red-600", desc: "Weak - unsustainable" };
      default: return { bg: "bg-muted", text: "text-foreground", desc: "" };
    }
  };

  const typeStyle = getTypeStyle(tractionType);

  return (
    <EditableToolCard
      title="Traction Depth Test"
      icon={<Target className="w-5 h-5 text-blue-500" />}
      dataSource={data.dataSource}
      inputGuidance={[
        "Analyze how you acquired your current customers",
        "Identify if growth depends on founder relationships",
        "Calculate customer acquisition without discounts"
      ]}
      isEditing={isEditing}
      onEditToggle={() => setIsEditing(true)}
      onSave={() => {
        if (data.userOverrides) {
          addEnrichment(
            'traction_depth',
            'TractionDepthTestCard',
            {
              tractionType,
              sustainabilityScore,
              redFlags,
              positiveSignals
            },
            'traction_proof'
          );
        }
        setIsEditing(false);
      }}
      accentColor="blue"
    >
      {/* Traction Type */}
      <div className={cn("p-4 rounded-lg mb-4", typeStyle.bg)}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Traction Type</p>
            <p className={cn("text-xl font-bold", typeStyle.text)}>{tractionType}</p>
            <p className="text-sm text-muted-foreground">{typeStyle.desc}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Sustainability</p>
            <p className={cn(
              "text-2xl font-bold",
              sustainabilityScore >= 70 ? "text-emerald-500" :
              sustainabilityScore >= 50 ? "text-amber-500" : "text-red-500"
            )}>
              {sustainabilityScore}/100
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Red Flags */}
        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-600">Red Flags</span>
          </div>
          <ul className="space-y-1">
            {redFlags.map((flag, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-red-500">•</span>
                {safeText(flag)}
              </li>
            ))}
          </ul>
        </div>

        {/* Positive Signals */}
        <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-600">Positive Signals</span>
          </div>
          <ul className="space-y-1">
            {positiveSignals.map((signal, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-emerald-500">✓</span>
                {safeText(signal)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </EditableToolCard>
  );
};
