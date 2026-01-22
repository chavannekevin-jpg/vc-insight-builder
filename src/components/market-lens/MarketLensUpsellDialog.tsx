import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Telescope, TrendingUp, Wind, MapPin, Target, Sparkles, Lock } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

interface MarketLensUpsellDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MarketLensUpsellDialog({ open, onOpenChange }: MarketLensUpsellDialogProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");

  const features = [
    {
      icon: TrendingUp,
      title: "Market Tailwinds",
      description: "Trends working in your favor for investor conversations"
    },
    {
      icon: Wind,
      title: "Market Headwinds",
      description: "Challenges you should be prepared to address"
    },
    {
      icon: MapPin,
      title: "Funding Landscape",
      description: "Regional ecosystem dynamics and funding activity"
    },
    {
      icon: Target,
      title: "Narrative Alignment",
      description: "How your story fits current investor themes"
    }
  ];

  const handleUnlock = () => {
    onOpenChange(false);
    navigate(`/checkout-analysis${companyId ? `?companyId=${companyId}` : ""}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-primary/20 bg-gradient-to-br from-background via-background to-primary/5">
        {/* Header with gradient accent */}
        <div className="relative px-6 pt-8 pb-6 text-center">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
          
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <Telescope className="w-8 h-8 text-primary" />
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Premium Feature</span>
          </div>
          
          <h2 className="text-2xl font-display font-bold mb-2">
            Market Lens
          </h2>
          <p className="text-muted-foreground">
            Your personalized market intelligence briefing, powered by real VC research data.
          </p>
        </div>

        {/* Features grid */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/30 border border-border/50"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-xs">{feature.title}</h3>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="px-6 pb-4">
          <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">How it works</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              UglyBaby analyzes our knowledge base of VC reports, market trends, and funding data — 
              then filters everything through your specific company context to surface only the insights 
              that matter for <span className="text-foreground font-medium">your</span> fundraise.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 pb-6 space-y-3">
          <Button
            size="lg"
            onClick={handleUnlock}
            className="w-full gap-2 gradient-primary shadow-glow"
          >
            <Lock className="w-4 h-4" />
            Unlock with Full Analysis
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Available after purchasing your investment analysis
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
