import { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InsightWithTooltipProps {
  /** The statement/insight to display */
  children: ReactNode;
  /** Explanation shown on hover */
  explanation: string;
  /** Optional company-specific context */
  companyContext?: string;
  /** Optional class for the wrapper */
  className?: string;
  /** Whether to show dotted underline */
  showUnderline?: boolean;
  /** Optional icon to show */
  showIcon?: boolean;
}

/**
 * Wraps analytical statements with hover explanations.
 * Use this for any VC insight that could benefit from context.
 */
export const InsightWithTooltip = ({
  children,
  explanation,
  companyContext,
  className,
  showUnderline = true,
  showIcon = false,
}: InsightWithTooltipProps) => {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "cursor-help transition-colors inline-flex items-center gap-1",
              showUnderline && "border-b border-dotted border-muted-foreground/50 hover:border-primary",
              className
            )}
          >
            {children}
            {showIcon && <Info className="w-3 h-3 text-muted-foreground/70" />}
          </span>
        </TooltipTrigger>
        <TooltipContent 
          className="max-w-sm p-4 bg-background/98 border-2 border-primary/30 shadow-2xl"
          side="top"
        >
          <div className="space-y-2">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">
              What this means
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              {explanation}
            </p>
            {companyContext && (
              <div className="pt-2 mt-2 border-t border-border/50">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  For your company:
                </p>
                <p className="text-sm text-primary">
                  {companyContext}
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
