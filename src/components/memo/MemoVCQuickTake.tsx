import { AlertTriangle, TrendingUp, AlertCircle, CheckCircle2, Zap, Lock } from "lucide-react";
import { MemoVCQuickTake as MemoVCQuickTakeType } from "@/types/memo";
import { renderMarkdownText } from "@/lib/markdownParser";

interface MemoVCQuickTakeProps {
  quickTake: MemoVCQuickTakeType;
  showTeaser?: boolean;
}

export const MemoVCQuickTake = ({ quickTake, showTeaser = false }: MemoVCQuickTakeProps) => {
  // Helper to safely render text
  const safeText = (text: unknown) => typeof text === 'string' ? text : String(text || '');
  
  // Helper to safely get arrays - CRITICAL for preventing React error #310
  const safeArray = (arr: unknown): string[] => {
    if (Array.isArray(arr)) return arr;
    if (arr === null || arr === undefined) return [];
    console.warn('MemoVCQuickTake: Expected array but received:', typeof arr, arr);
    return [];
  };
  
  // Safely extract values with fallbacks
  const verdict = quickTake?.verdict || '';
  const concerns = safeArray(quickTake?.concerns);
  const strengths = safeArray(quickTake?.strengths);
  const readinessLevel = quickTake?.readinessLevel || 'MEDIUM';
  const readinessRationale = quickTake?.readinessRationale || '';

  const readinessConfig = {
    LOW: {
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive/30",
      icon: AlertCircle,
      label: "Low Readiness"
    },
    MEDIUM: {
      color: "text-warning",
      bgColor: "bg-warning/10",
      borderColor: "border-warning/30",
      icon: AlertTriangle,
      label: "Medium Readiness"
    },
    HIGH: {
      color: "text-success",
      bgColor: "bg-success/10",
      borderColor: "border-success/30",
      icon: CheckCircle2,
      label: "High Readiness"
    }
  };

  const config = readinessConfig[readinessLevel] || readinessConfig.MEDIUM;
  const ReadinessIcon = config.icon;

  return (
    <div className="relative animate-fade-in mb-8">
      {/* Gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-destructive/30 via-warning/20 to-success/30 rounded-3xl blur-xl opacity-50" />
      
      <div className="relative bg-card/95 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-lg">
        {/* Header with Icon */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg">
            <Zap className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">VC Quick Take</h2>
            <p className="text-muted-foreground text-sm">30-second investment assessment</p>
          </div>
        </div>

        {/* Verdict */}
        <div className="mb-8 p-5 rounded-xl bg-muted/30 border border-border/30">
          <p className="text-lg text-foreground leading-relaxed font-medium italic">
            "{renderMarkdownText(safeText(verdict))}"
          </p>
        </div>

        {/* Readiness Indicator */}
        <div className={`mb-8 p-4 rounded-xl ${config.bgColor} border ${config.borderColor}`}>
          <div className="flex items-center gap-3">
            <ReadinessIcon className={`w-6 h-6 ${config.color}`} />
            <div>
              <span className={`font-bold ${config.color}`}>{config.label}</span>
              <p className="text-sm text-muted-foreground mt-1">{renderMarkdownText(safeText(readinessRationale))}</p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Concerns Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              <h3 className="font-semibold text-foreground">Top Concerns</h3>
            </div>
            <div className="space-y-2">
              {concerns.map((concern, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-destructive/20 text-destructive text-xs font-bold flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-sm text-foreground leading-relaxed">{renderMarkdownText(safeText(concern))}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <h3 className="font-semibold text-foreground">Top Strengths</h3>
            </div>
            <div className="space-y-2">
              {strengths.map((strength, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/20 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-success/20 text-success text-xs font-bold flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-sm text-foreground leading-relaxed">{renderMarkdownText(safeText(strength))}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Teaser for free users */}
        {showTeaser && (
          <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">The full analysis reveals how to address each concern</p>
                <p className="text-sm text-muted-foreground">
                  Unlock detailed preparation guides, VC reasoning, and actionable next steps for each section.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
