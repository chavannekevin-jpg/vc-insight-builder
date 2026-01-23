import { MousePointerClick, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DemoSectionHelperProps {
  onDismiss: () => void;
}

export function DemoSectionHelper({ onDismiss }: DemoSectionHelperProps) {
  return (
    <div className="relative animate-fade-in">
      {/* Arrow pointing down to cards */}
      <div className="absolute -bottom-2 left-12 w-4 h-4 rotate-45 bg-card/90 border-r border-b border-primary/40" />
      
      <div className="bg-card/90 backdrop-blur-xl border border-primary/40 rounded-2xl p-4 shadow-xl shadow-primary/10 animate-pulse-border">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex-shrink-0">
            <MousePointerClick className="w-5 h-5 text-primary" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-foreground mb-1">
              Dive Deeper
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Click any section card below to explore the full VC analysis, strategic tools, and actionable insights.
            </p>
          </div>
          
          {/* Dismiss button */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onDismiss}
            className="h-8 px-3 text-xs font-medium text-primary hover:text-primary hover:bg-primary/10 -mr-1 -mt-1"
          >
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}
