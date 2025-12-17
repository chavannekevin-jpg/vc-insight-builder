import { memo, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Lock, CheckCircle2, AlertTriangle, FileText, Sparkles, Upload, Eye, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { VCRiskIndicator } from "./VCRiskIndicator";

interface VCVerdictCardProps {
  completedQuestions: number;
  totalQuestions: number;
  memoGenerated: boolean;
  hasPaid: boolean;
  nextSection?: string;
  companyId: string;
  onImportDeck?: () => void;
}

export const VCVerdictCard = memo(({
  completedQuestions,
  totalQuestions,
  memoGenerated,
  hasPaid,
  nextSection = "your profile",
  companyId,
  onImportDeck
}: VCVerdictCardProps) => {
  const navigate = useNavigate();
  
  const percentage = useMemo(
    () => (completedQuestions / totalQuestions) * 100,
    [completedQuestions, totalQuestions]
  );
  
  const blindSpots = useMemo(() => totalQuestions - completedQuestions, [totalQuestions, completedQuestions]);
  
  const status = useMemo(() => {
    if (memoGenerated) {
      return hasPaid ? "complete" : "preview";
    }
    return percentage === 100 ? "ready" : "building";
  }, [memoGenerated, hasPaid, percentage]);

  const navigateToPortal = useCallback(() => navigate("/portal"), [navigate]);
  const navigateToMemo = useCallback(() => navigate(`/memo?companyId=${companyId}`), [navigate, companyId]);
  const navigateToCheckout = useCallback(() => navigate(`/checkout-memo?companyId=${companyId}`), [navigate, companyId]);

  const renderContent = () => {
    switch (status) {
      case "building":
        return (
          <>
            {percentage < 50 && onImportDeck && (
              <div className="mb-6 p-4 bg-muted/50 border border-border/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Have a pitch deck? <button onClick={onImportDeck} className="text-primary hover:underline font-medium">Import to auto-fill</button>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-display font-bold mb-2">Your VC Verdict</h2>
                <p className="text-muted-foreground">What partners say about you when you're not in the room</p>
              </div>
              <ShieldAlert className="w-12 h-12 text-destructive/50" />
            </div>

            {/* Risk Indicator instead of Progress Bar */}
            <VCRiskIndicator 
              blindSpots={blindSpots} 
              totalQuestions={totalQuestions}
              completedQuestions={completedQuestions}
            />

            {/* Stakes-focused next step */}
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1 text-destructive">Blind Spot: {nextSection}</p>
                  <p className="text-sm text-muted-foreground">
                    Without this, VCs will make assumptions that hurt your chances.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full text-lg font-semibold"
              onClick={navigateToPortal}
            >
              Remove Blind Spots
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <div className="mt-6 pt-6 border-t border-border/50">
              <p className="text-xs text-muted-foreground text-center">
                Average founder spends 6–9 months fundraising. One wrong narrative can kill a round permanently.
              </p>
            </div>
          </>
        );

      case "ready":
        return (
          <>
            <div className="flex items-start justify-between mb-6">
              <div>
                <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Profile Complete
                </Badge>
                <h2 className="text-3xl font-display font-bold mb-2">Ready for Judgment</h2>
                <p className="text-muted-foreground">Your profile is complete. See what VCs will really think.</p>
              </div>
              <Eye className="w-12 h-12 text-primary" />
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 rounded-xl p-6 mb-6">
              <p className="text-lg font-medium mb-2">Your verdict will reveal:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Red flags VCs will spot immediately
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Strengths you can lead with
                </li>
                <li className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-destructive" />
                  Fatal assumptions that kill rounds
                </li>
              </ul>
            </div>

            <Button 
              size="lg" 
              className="w-full text-lg font-semibold bg-primary hover:bg-primary/90"
              onClick={navigateToPortal}
            >
              See What VCs See
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </>
        );

      case "preview":
        return (
          <>
            <div className="flex items-start justify-between mb-6">
              <div>
                <Badge className="mb-3 bg-amber-500/10 text-amber-600 border-amber-500/20">
                  <Eye className="w-3 h-3 mr-1" />
                  Verdict Ready
                </Badge>
                <h2 className="text-3xl font-display font-bold mb-2">The Truth Awaits</h2>
                <p className="text-muted-foreground">Your VC verdict is ready. Unlock the full truth.</p>
              </div>
              <FileText className="w-12 h-12 text-amber-500/50" />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={navigateToMemo}
              >
                <Lock className="w-5 h-5" />
                <span>See Preview</span>
              </Button>
              <Button 
                className="h-auto py-4 flex-col gap-2 bg-primary hover:bg-primary/90"
                onClick={navigateToCheckout}
              >
                <Sparkles className="w-5 h-5" />
                <span>Get the Full Truth</span>
              </Button>
            </div>

            <div className="bg-muted/30 border border-border/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground text-center">
                This analysis costs less than one rejected coffee meeting.
              </p>
            </div>
          </>
        );

      case "complete":
        return (
          <>
            <div className="flex items-start justify-between mb-6">
              <div>
                <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Full Access
                </Badge>
                <h2 className="text-3xl font-display font-bold mb-2">Your VC Verdict</h2>
                <p className="text-muted-foreground">Complete access unlocked — now you know what VCs know</p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>

            <Button 
              size="lg" 
              className="w-full text-lg font-semibold"
              onClick={navigateToMemo}
            >
              View Your Verdict
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <div className="mt-6 pt-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground text-center">
                Need to update your information?{" "}
                <button 
                  onClick={navigateToPortal}
                  className="text-primary hover:underline"
                >
                  Edit your profile
                </button>
              </p>
            </div>
          </>
        );
    }
  };

  return (
    <div className="relative bg-card border-2 border-primary/30 rounded-3xl p-8 shadow-glow animate-fade-in hover:shadow-glow-strong transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 rounded-3xl -z-10" />
      {renderContent()}
    </div>
  );
});

VCVerdictCard.displayName = "VCVerdictCard";
