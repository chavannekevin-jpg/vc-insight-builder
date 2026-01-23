import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Telescope, 
  TrendingUp,
  Sparkles,
  ChevronRight,
  Globe,
  BarChart3,
  Lightbulb,
  Wind
} from "lucide-react";

interface MarketLensExplainerProps {
  open: boolean;
  onComplete: () => void;
}

const MARKET_LENS_EXPLAINER_KEY = "market_lens_explainer_seen";

export function MarketLensExplainer({ open, onComplete }: MarketLensExplainerProps) {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem(MARKET_LENS_EXPLAINER_KEY, "true");
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem(MARKET_LENS_EXPLAINER_KEY, "true");
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 bg-card/95 backdrop-blur-2xl border-border/30 overflow-hidden rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] [&>button]:hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 -left-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-1/4 -right-1/4 w-[200px] h-[200px] bg-blue-500/10 rounded-full blur-[80px]" />
        </div>

        {step === 0 ? (
          <>
            {/* Header */}
            <div className="relative px-6 pt-8 pb-4">
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
              
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 backdrop-blur-sm border border-cyan-500/20 flex items-center justify-center">
                  <Telescope className="w-8 h-8 text-cyan-500" />
                </div>
              </div>

              {/* Title */}
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground mb-1">
                  Market Lens
                </h2>
                <p className="text-sm text-muted-foreground">
                  Your personalized market intelligence
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="relative px-6 py-4 space-y-4">
              <p className="text-muted-foreground leading-relaxed text-sm">
                VCs expect you to know your market inside and out. <span className="text-cyan-500 font-semibold">Market Lens</span> synthesizes 
                50+ industry reports and funding benchmarks to give you the exact talking points you need — tailored to your 
                sector, stage, and geography.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30">
                  <TrendingUp className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Tailwinds & Headwinds</p>
                    <p className="text-xs text-muted-foreground">
                      Market trends working for or against you — so you're never caught off guard
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30">
                  <BarChart3 className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Funding Landscape</p>
                    <p className="text-xs text-muted-foreground">
                      Current round sizes, valuations, and investor sentiment in your space
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30">
                  <Globe className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Geographic Context</p>
                    <p className="text-xs text-muted-foreground">
                      Regional ecosystem dynamics relevant to your target markets
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
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
              
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 backdrop-blur-sm border border-cyan-500/20 flex items-center justify-center">
                  <Lightbulb className="w-8 h-8 text-cyan-500" />
                </div>
              </div>

              {/* Title */}
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground mb-1">
                  Using Market Intelligence
                </h2>
                <p className="text-sm text-muted-foreground">
                  How to leverage your briefing
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="relative px-6 py-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-500 text-xs font-bold">1</div>
                  <p className="text-sm text-foreground">Reference tailwinds to show why "now" is the right time</p>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-500 text-xs font-bold">2</div>
                  <p className="text-sm text-foreground">Proactively address headwinds to build investor confidence</p>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-500 text-xs font-bold">3</div>
                  <p className="text-sm text-foreground">Use exit precedents to anchor your valuation discussions</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-cyan-500" />
                  <p className="text-sm font-semibold text-foreground">Pro Tip</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  The best founders don't just know their market — they can articulate it better than VCs. 
                  Use these insights to demonstrate you've done your homework.
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
                    i === step ? 'bg-cyan-500' : 'bg-border'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              size="sm"
              className="gap-1 bg-cyan-500 hover:bg-cyan-600 rounded-xl"
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

export function useMarketLensExplainer() {
  const [showExplainer, setShowExplainer] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(MARKET_LENS_EXPLAINER_KEY);
    setShowExplainer(!seen);
    setIsChecked(true);
  }, []);

  const completeExplainer = () => setShowExplainer(false);
  const resetExplainer = () => {
    localStorage.removeItem(MARKET_LENS_EXPLAINER_KEY);
    setShowExplainer(true);
  };

  return { showExplainer, isChecked, completeExplainer, resetExplainer };
}
