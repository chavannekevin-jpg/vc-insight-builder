import { ThumbsUp, ThumbsDown, AlertCircle, Sparkles } from "lucide-react";
import { VCInvestmentLogic } from "@/types/memo";
import { cn } from "@/lib/utils";
import { safeText } from "@/lib/toolDataUtils";

interface VCInvestmentLogicCardProps {
  logic: VCInvestmentLogic;
  sectionName: string;
}

export const VCInvestmentLogicCard = ({ logic, sectionName }: VCInvestmentLogicCardProps) => {
  // Early return if data is invalid
  if (!logic || typeof logic !== 'object') {
    return null;
  }

  const decision = safeText(logic?.decision);
  const reasoning = safeText(logic?.reasoning);
  const keyCondition = safeText(logic?.keyCondition);

  const getDecisionStyle = () => {
    switch (decision) {
      case "EXCITED":
        return {
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/30",
          text: "text-emerald-600",
          icon: <Sparkles className="w-5 h-5" />,
          label: "Excited to Continue"
        };
      case "INTERESTED":
        return {
          bg: "bg-blue-500/10",
          border: "border-blue-500/30",
          text: "text-blue-600",
          icon: <ThumbsUp className="w-5 h-5" />,
          label: "Interested"
        };
      case "CAUTIOUS":
        return {
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          text: "text-amber-600",
          icon: <AlertCircle className="w-5 h-5" />,
          label: "Cautious"
        };
      case "PASS":
        return {
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          text: "text-red-600",
          icon: <ThumbsDown className="w-5 h-5" />,
          label: "Likely Pass"
        };
      default:
        return {
          bg: "bg-muted/10",
          border: "border-border/30",
          text: "text-muted-foreground",
          icon: <AlertCircle className="w-5 h-5" />,
          label: "Unknown"
        };
    }
  };

  const style = getDecisionStyle();

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border p-5",
      style.bg,
      style.border
    )}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-lg",
          style.bg
        )}>
          <span className={style.text}>{style.icon}</span>
        </div>
        <div>
          <h4 className="font-semibold text-foreground">VC Investment Logic</h4>
          <p className="text-xs text-muted-foreground">Based on {safeText(sectionName)} alone</p>
        </div>
        <div className={cn(
          "ml-auto px-3 py-1 rounded-full text-sm font-medium",
          style.bg,
          style.text
        )}>
          {style.label}
        </div>
      </div>

      {/* Reasoning */}
      <div className="space-y-3">
        {reasoning && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">VC Reasoning</p>
            <p className="text-foreground">{reasoning}</p>
          </div>
        )}
        
        {keyCondition && (
          <div className="p-3 rounded-lg bg-background/50 border border-border/50">
            <p className="text-xs font-medium text-muted-foreground mb-1">Key Condition to Move Forward</p>
            <p className="text-sm text-foreground font-medium">{keyCondition}</p>
          </div>
        )}
      </div>
    </div>
  );
};
