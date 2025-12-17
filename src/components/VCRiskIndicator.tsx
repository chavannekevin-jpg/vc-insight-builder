import { memo } from "react";
import { AlertTriangle, ShieldX, ShieldCheck } from "lucide-react";

interface VCRiskIndicatorProps {
  blindSpots: number;
  totalQuestions: number;
  completedQuestions: number;
}

export const VCRiskIndicator = memo(({ blindSpots, totalQuestions, completedQuestions }: VCRiskIndicatorProps) => {
  const riskLevel = blindSpots > totalQuestions * 0.6 ? "HIGH" : 
                    blindSpots > totalQuestions * 0.3 ? "MEDIUM" : "LOW";
  
  const riskColor = riskLevel === "HIGH" ? "text-destructive" : 
                    riskLevel === "MEDIUM" ? "text-amber-500" : "text-primary";
  
  const riskBg = riskLevel === "HIGH" ? "bg-destructive/10 border-destructive/30" : 
                 riskLevel === "MEDIUM" ? "bg-amber-500/10 border-amber-500/30" : 
                 "bg-primary/10 border-primary/30";

  const RiskIcon = riskLevel === "HIGH" ? ShieldX : 
                   riskLevel === "MEDIUM" ? AlertTriangle : ShieldCheck;

  return (
    <div className={`rounded-xl p-5 mb-6 border ${riskBg}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <RiskIcon className={`w-6 h-6 ${riskColor}`} />
          <div>
            <span className="text-sm font-medium text-muted-foreground">VC Risk Exposure</span>
            <span className={`ml-2 font-bold text-lg ${riskColor}`}>{riskLevel}</span>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-2xl font-bold ${riskColor}`}>{blindSpots}</span>
          <span className="text-sm text-muted-foreground ml-1">blind spots</span>
        </div>
      </div>
      
      {/* Visual risk bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
        <div 
          className={`h-full transition-all duration-500 ${
            riskLevel === "HIGH" ? "bg-destructive" : 
            riskLevel === "MEDIUM" ? "bg-amber-500" : "bg-primary"
          }`}
          style={{ width: `${(completedQuestions / totalQuestions) * 100}%` }}
        />
      </div>
      
      <p className="text-sm text-muted-foreground">
        {riskLevel === "HIGH" && "VCs are making critical assumptions about your business right now."}
        {riskLevel === "MEDIUM" && "Several gaps remain that VCs will question."}
        {riskLevel === "LOW" && "Most areas covered. Ready for thorough analysis."}
      </p>
    </div>
  );
});

VCRiskIndicator.displayName = "VCRiskIndicator";
