import { format, endOfMonth } from "date-fns";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AcceleratorDiscountBannerProps {
  discountPercent: number;
  acceleratorName: string;
  onGenerate?: () => void;
}

export function AcceleratorDiscountBanner({ 
  discountPercent, 
  acceleratorName,
  onGenerate 
}: AcceleratorDiscountBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  
  if (dismissed) return null;
  
  const endOfMonthDate = endOfMonth(new Date());
  const formattedDate = format(endOfMonthDate, "MMMM d, yyyy");
  
  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 px-4 py-3">
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="hidden sm:flex w-8 h-8 rounded-lg bg-primary/20 items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">
              <span className="font-bold text-primary">{discountPercent}% discount</span>
              {" "}from {acceleratorName} — valid until {formattedDate}
            </p>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Generate your VC analysis before your discount expires
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {onGenerate && (
            <Button 
              size="sm" 
              onClick={onGenerate}
              className="gradient-primary shadow-glow text-xs h-8"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Generate Now
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDismissed(true)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
