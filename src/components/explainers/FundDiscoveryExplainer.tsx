import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Target,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Users,
  Search,
  Zap
} from "lucide-react";

interface FundDiscoveryExplainerProps {
  open: boolean;
  onComplete: () => void;
}

const FUND_DISCOVERY_EXPLAINER_KEY = "fund_discovery_explainer_seen";

export function FundDiscoveryExplainer({ open, onComplete }: FundDiscoveryExplainerProps) {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem(FUND_DISCOVERY_EXPLAINER_KEY, "true");
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem(FUND_DISCOVERY_EXPLAINER_KEY, "true");
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 bg-card/95 backdrop-blur-2xl border-border/30 overflow-hidden rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] [&>button]:hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 -left-1/4 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-1/4 -right-1/4 w-[200px] h-[200px] bg-teal-500/10 rounded-full blur-[80px]" />
        </div>

        {step === 0 ? (
          <>
            {/* Header */}
            <div className="relative px-6 pt-8 pb-4">
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
              
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 backdrop-blur-sm border border-emerald-500/20 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-emerald-500" />
                </div>
              </div>

              {/* Title */}
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground mb-1">
                  VC Network
                </h2>
                <p className="text-sm text-muted-foreground">
                  Your curated investor database
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="relative px-6 py-4 space-y-4">
              <p className="text-muted-foreground leading-relaxed text-sm">
                Stop wasting time on investors who won't invest. The <span className="text-emerald-500 font-semibold">VC Network</span> matches 
                you with 800+ investors based on your exact stage, sector, and traction — showing you who's actually likely to fund you.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30">
                  <Target className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Smart Matching</p>
                    <p className="text-xs text-muted-foreground">
                      Each investor is scored on how well they align with your company's profile
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30">
                  <Search className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Filter & Discover</p>
                    <p className="text-xs text-muted-foreground">
                      Search by stage, sector, location, or fund size to find your perfect fit
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30">
                  <TrendingUp className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Prioritize Outreach</p>
                    <p className="text-xs text-muted-foreground">
                      Focus your energy on high-match investors who are actively deploying
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
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
              
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 backdrop-blur-sm border border-emerald-500/20 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-emerald-500" />
                </div>
              </div>

              {/* Title */}
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground mb-1">
                  How It Works
                </h2>
                <p className="text-sm text-muted-foreground">
                  Getting the most from VC Network
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="relative px-6 py-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-xs font-bold">1</div>
                  <p className="text-sm text-foreground">Toggle "My Matches" to see only high-fit investors</p>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-xs font-bold">2</div>
                  <p className="text-sm text-foreground">Review each investor's focus areas and portfolio</p>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-xs font-bold">3</div>
                  <p className="text-sm text-foreground">Prioritize outreach based on match strength</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <p className="text-sm font-semibold text-foreground">Pro Tip</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Investors are more likely to respond when you can articulate why they specifically 
                  would be interested in your deal — use the match insights to personalize your outreach.
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
                    i === step ? 'bg-emerald-500' : 'bg-border'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              size="sm"
              className="gap-1 bg-emerald-500 hover:bg-emerald-600 rounded-xl"
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

export function useFundDiscoveryExplainer() {
  const [showExplainer, setShowExplainer] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(FUND_DISCOVERY_EXPLAINER_KEY);
    setShowExplainer(!seen);
    setIsChecked(true);
  }, []);

  const completeExplainer = () => setShowExplainer(false);
  const resetExplainer = () => {
    localStorage.removeItem(FUND_DISCOVERY_EXPLAINER_KEY);
    setShowExplainer(true);
  };

  return { showExplainer, isChecked, completeExplainer, resetExplainer };
}
