import { memo } from "react";
import { Eye, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

interface StakesReminderBannerProps {
  onAction: () => void;
  hasMemo: boolean;
}

export const StakesReminderBanner = memo(({ onAction, hasMemo }: StakesReminderBannerProps) => {
  return (
    <div className="bg-gradient-to-r from-destructive/10 via-destructive/5 to-transparent border-b border-destructive/20">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Eye className="w-4 h-4 text-destructive flex-shrink-0" />
            <p className="text-sm">
              <span className="font-medium">Right now,</span>{" "}
              <span className="text-muted-foreground">
                you're being evaluated by VCs who will never tell you why they passed.
              </span>
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onAction}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
          >
            {hasMemo ? "See their verdict" : "See what they're thinking"}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
});

StakesReminderBanner.displayName = "StakesReminderBanner";
