import { AlertTriangle, TrendingUp, AlertCircle, CheckCircle2, Zap, Lock, ChevronRight, Eye, Target, Flame } from "lucide-react";
import { MemoVCQuickTake as MemoVCQuickTakeType } from "@/types/memo";
import { Button } from "@/components/ui/button";

interface MemoVCQuickTakeProps {
  quickTake: MemoVCQuickTakeType;
  showTeaser?: boolean;
  onUnlock?: () => void;
}

export const MemoVCQuickTake = ({ quickTake, showTeaser = false, onUnlock }: MemoVCQuickTakeProps) => {
  // Helper to safely render text
  const safeText = (text: unknown) => typeof text === 'string' ? text : String(text || '');
  
  // Helper to safely get arrays
  const safeArray = (arr: unknown): string[] => {
    if (Array.isArray(arr)) return arr;
    if (arr === null || arr === undefined) return [];
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
      label: "Not Ready",
      sublabel: "Critical gaps identified"
    },
    MEDIUM: {
      color: "text-warning",
      bgColor: "bg-warning/10",
      borderColor: "border-warning/30",
      icon: AlertTriangle,
      label: "Getting There",
      sublabel: "Key areas need work"
    },
    HIGH: {
      color: "text-success",
      bgColor: "bg-success/10",
      borderColor: "border-success/30",
      icon: CheckCircle2,
      label: "Strong Position",
      sublabel: "Ready with minor refinements"
    }
  };

  const config = readinessConfig[readinessLevel] || readinessConfig.MEDIUM;
  const ReadinessIcon = config.icon;

  // Extract first sentence of verdict for teaser
  const getVerdictTeaser = () => {
    const firstSentence = verdict.split(/[.!?]/)[0];
    return firstSentence ? firstSentence + "..." : verdict.substring(0, 100) + "...";
  };

  // Get a glimpse without full details
  const getTopConcernTeaser = () => {
    if (concerns.length === 0) return null;
    const concern = concerns[0];
    // Show first few words only
    const words = concern.split(' ').slice(0, 6).join(' ');
    return words + "...";
  };

  const getTopStrengthTeaser = () => {
    if (strengths.length === 0) return null;
    const strength = strengths[0];
    const words = strength.split(' ').slice(0, 6).join(' ');
    return words + "...";
  };

  // For full view (non-teaser), show everything
  if (!showTeaser) {
    return (
      <div className="relative animate-fade-in mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-destructive/30 via-warning/20 to-success/30 rounded-3xl blur-xl opacity-50" />
        
        <div className="relative bg-card/95 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg">
              <Zap className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">VC Quick Take</h2>
              <p className="text-muted-foreground text-sm">30-second investment assessment</p>
            </div>
          </div>

          <div className="mb-8 p-5 rounded-xl bg-muted/30 border border-border/30">
            <p className="text-lg text-foreground leading-relaxed font-medium italic">
              "{safeText(verdict)}"
            </p>
          </div>

          <div className={`mb-8 p-4 rounded-xl ${config.bgColor} border ${config.borderColor}`}>
            <div className="flex items-center gap-3">
              <ReadinessIcon className={`w-6 h-6 ${config.color}`} />
              <div>
                <span className={`font-bold ${config.color}`}>{config.label}</span>
                <p className="text-sm text-muted-foreground mt-1">{safeText(readinessRationale)}</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
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
                    className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-destructive/20 text-destructive text-xs font-bold flex items-center justify-center mt-0.5">
                      {index + 1}
                    </span>
                    <p className="text-sm text-foreground leading-relaxed">{safeText(concern)}</p>
                  </div>
                ))}
              </div>
            </div>

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
                    className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/20"
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-success/20 text-success text-xs font-bold flex items-center justify-center mt-0.5">
                      {index + 1}
                    </span>
                    <p className="text-sm text-foreground leading-relaxed">{safeText(strength)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Curiosity-driven teaser view
  return (
    <div className="relative animate-fade-in mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-destructive/20 via-warning/15 to-primary/20 rounded-3xl blur-xl opacity-60" />
      
      <div className="relative bg-card/95 backdrop-blur-sm border border-border/50 rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg">
              <Eye className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">VC First Impression</h2>
              <p className="text-muted-foreground text-sm">What investors see in 30 seconds</p>
            </div>
          </div>

          {/* Verdict Teaser - partial */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border/30">
            <p className="text-foreground leading-relaxed italic">
              "{getVerdictTeaser()}"
            </p>
          </div>
        </div>

        {/* Readiness Score - Show level but not full rationale */}
        <div className={`mx-6 mb-4 p-4 rounded-xl ${config.bgColor} border ${config.borderColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ReadinessIcon className={`w-6 h-6 ${config.color}`} />
              <div>
                <span className={`font-bold ${config.color}`}>{config.label}</span>
                <p className="text-xs text-muted-foreground">{config.sublabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span>Full analysis locked</span>
            </div>
          </div>
        </div>

        {/* Issue Counts - Creates curiosity */}
        <div className="px-6 pb-4 grid grid-cols-2 gap-4">
          {/* Concerns Count */}
          <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-destructive" />
              <span className="font-bold text-destructive">{concerns.length} Red Flags</span>
            </div>
            {getTopConcernTeaser() && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                #{1}: {getTopConcernTeaser()}
              </p>
            )}
            <p className="text-xs text-destructive/70 mt-1 font-medium">
              VCs will ask about these
            </p>
          </div>

          {/* Strengths Count */}
          <div className="p-4 rounded-xl bg-success/5 border border-success/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-success" />
              <span className="font-bold text-success">{strengths.length} Strengths</span>
            </div>
            {getTopStrengthTeaser() && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                #{1}: {getTopStrengthTeaser()}
              </p>
            )}
            <p className="text-xs text-success/70 mt-1 font-medium">
              Your competitive edge
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="px-6 pb-6">
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-primary/20">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-foreground text-sm">
                  What are your {concerns.length} red flags?
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  See exactly what VCs will question — and how to prepare.
                </p>
              </div>
              {onUnlock && (
                <Button 
                  onClick={onUnlock}
                  size="sm"
                  className="shrink-0 gap-1"
                >
                  See Full Analysis
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
