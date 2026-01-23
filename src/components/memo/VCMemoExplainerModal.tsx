import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Users, 
  Target,
  CheckCircle2,
  Sparkles,
  ChevronRight
} from "lucide-react";

interface VCMemoExplainerModalProps {
  open: boolean;
  onComplete: () => void;
}

const VC_MEMO_EXPLAINER_KEY = "vc_memo_explainer_seen";

export function VCMemoExplainerModal({ open, onComplete }: VCMemoExplainerModalProps) {
  const handleContinue = () => {
    localStorage.setItem(VC_MEMO_EXPLAINER_KEY, "true");
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 bg-card/95 backdrop-blur-2xl border-border/30 overflow-hidden rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] [&>button]:hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 -left-1/4 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-1/4 -right-1/4 w-[200px] h-[200px] bg-accent/10 rounded-full blur-[80px]" />
        </div>

        {/* Header */}
        <div className="relative px-6 pt-8 pb-4">
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
              <FileText className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground mb-1">
              The VC Memorandum
            </h2>
            <p className="text-sm text-muted-foreground">
              The document that decides your fate in partner meetings
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="relative px-6 py-4 space-y-4">
          <p className="text-muted-foreground leading-relaxed text-sm">
            When a VC is interested in your company, they write an internal document called an 
            <span className="text-primary font-semibold"> Investment Memorandum</span>. This is 
            shared with their partners to make a final decision on whether to invest.
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30">
              <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Written for VC Partners</p>
                <p className="text-xs text-muted-foreground">
                  This is how VCs communicate deals internally — concise, critical, and focused on investment logic
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30">
              <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">The Real Decision Document</p>
                <p className="text-xs text-muted-foreground">
                  Your pitch deck gets attention, but the memo is what gets discussed in IC meetings
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30">
              <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Your Advantage</p>
                <p className="text-xs text-muted-foreground">
                  By seeing this format, you know exactly how to frame your story for maximum impact
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">What you're about to see</span>
            </div>
            <p className="text-xs text-muted-foreground">
              We've formatted your analysis as an internal VC memo — the same structure partners 
              use to evaluate deals. Use this to understand how VCs think and communicate about your company.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative px-6 pb-6 pt-2">
          <Button 
            onClick={handleContinue}
            className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-xl font-semibold text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            View the Memo
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to manage VC memo explainer state
export function useVCMemoExplainer() {
  const [showExplainer, setShowExplainer] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem(VC_MEMO_EXPLAINER_KEY) === "true";
    setShowExplainer(!hasSeen);
    setIsChecked(true);
  }, []);

  const completeExplainer = () => {
    setShowExplainer(false);
  };

  const resetExplainer = () => {
    localStorage.removeItem(VC_MEMO_EXPLAINER_KEY);
    setShowExplainer(true);
  };

  return { showExplainer, isChecked, completeExplainer, resetExplainer };
}
