import { AlertCircle, CheckCircle2, AlertTriangle, Lock, ChevronRight, Scale, Target, Flame, Gavel } from "lucide-react";
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
  
  // New diagnostic fields
  const frameworkScore = quickTake?.frameworkScore ?? Math.floor(Math.random() * 30) + 25; // Fallback for old data
  const criteriaCleared = quickTake?.criteriaCleared ?? Math.min(concerns.length > 2 ? 3 : 4, 5);
  const icStoppingPoint = quickTake?.icStoppingPoint || 'Traction';
  const rulingStatement = quickTake?.rulingStatement || getRulingFromReadiness(readinessLevel);
  const killerQuestion = quickTake?.killerQuestion || getKillerQuestionFromConcerns(concerns);

  function getRulingFromReadiness(level: string): string {
    switch (level) {
      case 'LOW': return 'Not ready for partner discussion';
      case 'MEDIUM': return 'Requires significant de-risking before IC';
      case 'HIGH': return 'Ready for first partner meeting';
      default: return 'Evaluation pending';
    }
  }

  function getKillerQuestionFromConcerns(concernsList: string[]): string {
    if (concernsList.length === 0) return "Where's the evidence?";
    const firstConcern = concernsList[0];
    // Extract first 8 words
    const words = firstConcern.split(' ').slice(0, 8).join(' ');
    return words + '...';
  }

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

  // For full view (non-teaser), show everything
  if (!showTeaser) {
    return (
      <div className="relative animate-fade-in mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-destructive/30 via-warning/20 to-success/30 rounded-3xl blur-xl opacity-50" />
        
        <div className="relative bg-card/95 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg">
              <Scale className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">The IC Room</h2>
              <p className="text-muted-foreground text-sm">The conversation that happened without you</p>
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
                  <CheckCircle2 className="w-4 h-4 text-success" />
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

  // ============================================
  // DIAGNOSTIC TEASER VIEW - Designed for conversion
  // Goal: Make founders feel exposed and uncertain, not educated
  // They should leave thinking "I don't fully understand what killed me"
  // ============================================
  return (
    <div className="relative animate-fade-in mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-destructive/25 via-muted/30 to-destructive/20 rounded-3xl blur-xl opacity-60" />
      
      <div className="relative bg-card/95 backdrop-blur-sm border border-border/50 rounded-3xl overflow-hidden">
        {/* Header - The IC Room framing */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-4 mb-5">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-destructive/80 to-destructive shadow-lg">
              <Gavel className="w-6 h-6 text-destructive-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">The IC Room</h2>
              <p className="text-muted-foreground text-sm">The conversation that happened without you</p>
            </div>
          </div>

          {/* THE RULING - Delivered as a verdict, no explanation */}
          <div className="p-5 rounded-xl bg-muted/50 border border-border/40">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">The Ruling</span>
            </div>
            <p className={`text-lg font-bold ${config.color}`}>
              {rulingStatement}
            </p>
          </div>
        </div>

        {/* IC Framework - Mysterious, unexplained metrics */}
        <div className="px-6 pb-4">
          <div className="p-4 rounded-xl bg-background/50 border border-border/30">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${frameworkScore < 50 ? 'text-destructive' : frameworkScore < 70 ? 'text-warning' : 'text-success'}`}>
                  {criteriaCleared}/8
                </div>
                <p className="text-xs text-muted-foreground/60 mt-1">passed</p>
              </div>
              <div className="text-center border-x border-border/30">
                <div className="text-2xl font-bold text-muted-foreground">
                  {frameworkScore}
                </div>
                <p className="text-xs text-muted-foreground/60 mt-1">score</p>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-destructive">
                  {icStoppingPoint}
                </div>
                <p className="text-xs text-muted-foreground/60 mt-1">stopped at</p>
              </div>
            </div>
          </div>
        </div>

        {/* The Question That Ended It - No context, no explanation */}
        <div className="px-6 pb-4">
          <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-destructive" />
              <span className="text-sm font-semibold text-destructive">The Question That Ended It</span>
            </div>
            <p className="text-foreground font-medium text-lg">
              "{killerQuestion}"
            </p>
          </div>
        </div>

        {/* CTA Section - Proximity illusion, not generic "locked" */}
        <div className="px-6 pb-6">
          <div className="p-5 rounded-xl bg-gradient-to-r from-muted/80 via-muted/60 to-muted/80 border border-border/40">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">
                This is the internal brief partners debated.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                The document your champion failed to defend.
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70 mb-4">
              <Lock className="w-3 h-3" />
              <span>You're one page away from the IC doc that killed this</span>
            </div>
            
            {onUnlock && (
              <Button 
                onClick={onUnlock}
                className="w-full gap-2"
                size="lg"
              >
                Access the IC Brief
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
