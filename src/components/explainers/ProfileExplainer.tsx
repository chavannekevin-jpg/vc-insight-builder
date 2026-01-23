import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  User, 
  FileText,
  Sparkles,
  ChevronRight,
  Database,
  RefreshCw,
  CheckCircle2
} from "lucide-react";

interface ProfileExplainerProps {
  open: boolean;
  onComplete: () => void;
}

const PROFILE_EXPLAINER_KEY = "profile_explainer_seen";

export function ProfileExplainer({ open, onComplete }: ProfileExplainerProps) {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem(PROFILE_EXPLAINER_KEY, "true");
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem(PROFILE_EXPLAINER_KEY, "true");
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 bg-card/95 backdrop-blur-2xl border-border/30 overflow-hidden rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] [&>button]:hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 -left-1/4 w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-1/4 -right-1/4 w-[200px] h-[200px] bg-purple-500/10 rounded-full blur-[80px]" />
        </div>

        {step === 0 ? (
          <>
            {/* Header */}
            <div className="relative px-6 pt-8 pb-4">
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
              
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 backdrop-blur-sm border border-violet-500/20 flex items-center justify-center">
                  <User className="w-8 h-8 text-violet-500" />
                </div>
              </div>

              {/* Title */}
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground mb-1">
                  Your Company Profile
                </h2>
                <p className="text-sm text-muted-foreground">
                  The foundation of your analysis
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="relative px-6 py-4 space-y-4">
              <p className="text-muted-foreground leading-relaxed text-sm">
                This is your <span className="text-violet-500 font-semibold">central data hub</span> — the information here 
                powers your entire analysis, from VC verdicts to investor matching. The more complete and accurate your 
                profile, the more valuable your insights.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30">
                  <Database className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Single Source of Truth</p>
                    <p className="text-xs text-muted-foreground">
                      All your company data in one place — edit once, update everywhere
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30">
                  <FileText className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Powers Your Analysis</p>
                    <p className="text-xs text-muted-foreground">
                      Every section feeds directly into your VC memorandum and investment readiness score
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30">
                  <RefreshCw className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Always Editable</p>
                    <p className="text-xs text-muted-foreground">
                      Update your profile anytime as your company evolves — regenerate your analysis with fresh data
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Header */}
            <div className="relative px-6 pt-8 pb-4">
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
              
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 backdrop-blur-sm border border-violet-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-violet-500" />
                </div>
              </div>

              {/* Title */}
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground mb-1">
                  Getting the Most Value
                </h2>
                <p className="text-sm text-muted-foreground">
                  Tips for a stronger profile
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="relative px-6 py-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-500 text-xs font-bold">1</div>
                  <p className="text-sm text-foreground">Be specific with numbers — VCs love concrete metrics</p>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-500 text-xs font-bold">2</div>
                  <p className="text-sm text-foreground">Complete all sections for the most accurate scoring</p>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-500 text-xs font-bold">3</div>
                  <p className="text-sm text-foreground">Update after major milestones (funding, product launches, etc.)</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  <p className="text-sm font-semibold text-foreground">Pro Tip</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use the "Import Deck" feature to auto-fill your profile from an existing pitch deck — 
                  it saves time and ensures consistency with your investor materials.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="relative px-6 pb-6 pt-2">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground rounded-xl"
            >
              Skip
            </Button>

            <div className="flex items-center gap-1.5">
              {[0, 1].map((i) => (
                <div 
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === step ? 'bg-violet-500' : 'bg-border'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              size="sm"
              className="gap-1 bg-violet-500 hover:bg-violet-600 rounded-xl"
            >
              {step < 1 ? "Next" : "Get Started"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useProfileExplainer() {
  const [showExplainer, setShowExplainer] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(PROFILE_EXPLAINER_KEY);
    setShowExplainer(!seen);
    setIsChecked(true);
  }, []);

  const completeExplainer = () => setShowExplainer(false);
  const resetExplainer = () => {
    localStorage.removeItem(PROFILE_EXPLAINER_KEY);
    setShowExplainer(true);
  };

  return { showExplainer, isChecked, completeExplainer, resetExplainer };
}
