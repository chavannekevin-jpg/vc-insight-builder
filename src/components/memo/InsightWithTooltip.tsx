import { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, Building2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InsightWithTooltipProps {
  /** The statement/insight to display */
  children: ReactNode;
  /** Generic explanation shown on hover (what this means in VC-speak) */
  explanation: string;
  /** Optional company-specific context (why this applies to YOUR company) */
  companyContext?: string;
  /** Evidence points backing the insight */
  evidence?: string[];
  /** Optional class for the wrapper */
  className?: string;
  /** Whether to show dotted underline */
  showUnderline?: boolean;
  /** Optional icon to show */
  showIcon?: boolean;
}

/**
 * Wraps analytical statements with hover explanations.
 * Shows three tiers of information:
 * 1. Generic VC explanation
 * 2. Company-specific context (if provided)
 * 3. Evidence trail (if provided)
 */
export const InsightWithTooltip = ({
  children,
  explanation,
  companyContext,
  evidence,
  className,
  showUnderline = true,
  showIcon = false,
}: InsightWithTooltipProps) => {
  const hasCompanyContext = companyContext && companyContext.length > 0;
  const hasEvidence = evidence && evidence.length > 0;
  
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "cursor-help transition-colors inline-flex items-center gap-1",
              showUnderline && "border-b border-dotted border-muted-foreground/50 hover:border-primary",
              hasCompanyContext && showUnderline && "border-primary/40 hover:border-primary",
              className
            )}
          >
            {children}
            {showIcon && <Info className="w-3 h-3 text-muted-foreground/70" />}
          </span>
        </TooltipTrigger>
        <TooltipContent 
          className={cn(
            "max-w-md p-0 bg-background/98 border-2 shadow-2xl overflow-hidden",
            hasCompanyContext ? "border-primary/40" : "border-border"
          )}
          side="top"
        >
          {/* Generic Explanation */}
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                What This Means
              </p>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {explanation}
            </p>
          </div>
          
          {/* Company-Specific Context */}
          {hasCompanyContext && (
            <div className="p-4 bg-primary/5 border-b border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                  For Your Company
                </p>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {companyContext}
              </p>
            </div>
          )}
          
          {/* Evidence Trail */}
          {hasEvidence && (
            <div className="p-4 bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Based On
                </p>
              </div>
              <ul className="space-y-1">
                {evidence.slice(0, 4).map((item, i) => (
                  <li 
                    key={i} 
                    className="text-xs text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-primary mt-0.5 flex-shrink-0">•</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
