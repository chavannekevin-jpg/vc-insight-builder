import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface DemoBannerProps {
  companyName?: string;
}

export function DemoBanner({ companyName = "CarbonPrint" }: DemoBannerProps) {
  const navigate = useNavigate();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-b border-primary/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">DEMO MODE</span>
          </div>
          <p className="text-sm text-muted-foreground hidden sm:block">
            You're exploring the analysis ecosystem for <span className="font-semibold text-foreground">{companyName}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate('/checkout')}
            className="gap-1.5 text-xs h-8"
          >
            Get Your Own Analysis
            <ArrowRight className="w-3 h-3" />
          </Button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
