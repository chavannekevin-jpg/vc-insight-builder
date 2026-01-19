import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Zap, Target, TrendingUp, Users, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FundDiscoveryPremiumModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchingFundsCount?: number;
  companyStage?: string;
  companyCategory?: string | null;
}

export const FundDiscoveryPremiumModal = memo(({
  open,
  onOpenChange,
  matchingFundsCount = 0,
  companyStage,
  companyCategory,
}: FundDiscoveryPremiumModalProps) => {
  const navigate = useNavigate();

  const handleUnlock = () => {
    onOpenChange(false);
    navigate('/checkout-memo');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden border-primary/20 bg-card">
        {/* Header with gradient */}
        <div className="relative p-6 pb-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-border/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <DialogHeader className="relative">
            <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 border border-primary/30 shadow-[0_0_20px_rgba(236,72,153,0.15)]">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
            <DialogTitle className="text-xl font-display font-bold">
              Unlock Investor Discovery
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              AI-powered matching to find VCs that fit your startup
            </p>
          </DialogHeader>
        </div>

        {/* Matching preview */}
        {matchingFundsCount > 0 && (
          <div className="px-6 py-4 bg-primary/5 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {matchingFundsCount}+ investors match your profile
                </p>
                <p className="text-xs text-muted-foreground">
                  Based on {companyStage}{companyCategory ? ` • ${companyCategory}` : ''}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Purchase your full investment analysis to unlock:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Smart Matching</p>
                <p className="text-xs text-muted-foreground">
                  AI scores each investor based on stage, sector, thesis & ticket size
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Traction Signals</p>
                <p className="text-xs text-muted-foreground">
                  Matches improve based on your revenue and customer data
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Growing Network</p>
                <p className="text-xs text-muted-foreground">
                  Access to 100+ European VCs, angels & family offices
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="p-6 pt-0">
          <Button 
            onClick={handleUnlock}
            className="w-full h-11 font-semibold shadow-[0_0_20px_rgba(236,72,153,0.2)]"
          >
            <Zap className="w-4 h-4 mr-2" />
            Unlock Full Access
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-3">
            Included with your investment analysis purchase
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
});

FundDiscoveryPremiumModal.displayName = "FundDiscoveryPremiumModal";
