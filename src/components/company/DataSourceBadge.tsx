import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { User, FileText, Upload, Calculator, Sparkles, RefreshCw, CheckCircle2, Bot, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataSourceBadgeProps {
  source: string | null | undefined;
  timestamp?: string;
  showTooltip?: boolean;
  className?: string;
}

const SOURCE_CONFIG: Record<string, { 
  label: string; 
  icon: React.ReactNode; 
  className: string;
  description: string;
  trustLevel: 'high' | 'medium' | 'low';
}> = {
  manual: {
    label: "You wrote",
    icon: <User className="w-3 h-3" />,
    className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    description: "You directly entered this information",
    trustLevel: 'high',
  },
  founder: {
    label: "Founder Input",
    icon: <User className="w-3 h-3" />,
    className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    description: "Directly provided by the founder",
    trustLevel: 'high',
  },
  deck_confirmed: {
    label: "Deck (Confirmed)",
    icon: <CheckCircle2 className="w-3 h-3" />,
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "Extracted from pitch deck and confirmed by you",
    trustLevel: 'high',
  },
  memo_sync: {
    label: "From Memo",
    icon: <FileText className="w-3 h-3" />,
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "Synced from your generated memo",
    trustLevel: 'medium',
  },
  deck_import: {
    label: "From Deck",
    icon: <Upload className="w-3 h-3" />,
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    description: "Extracted from your pitch deck (not yet confirmed)",
    trustLevel: 'medium',
  },
  deck: {
    label: "From Deck",
    icon: <Upload className="w-3 h-3" />,
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    description: "Extracted from your pitch deck",
    trustLevel: 'medium',
  },
  smart_fill: {
    label: "Smart Fill",
    icon: <Sparkles className="w-3 h-3" />,
    className: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
    description: "Added via the Smart Fill questionnaire",
    trustLevel: 'high',
  },
  ai_accepted: {
    label: "AI (Accepted)",
    icon: <Sparkles className="w-3 h-3" />,
    className: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    description: "AI suggestion that you reviewed and accepted",
    trustLevel: 'high',
  },
  ai_inferred: {
    label: "AI Inferred",
    icon: <Bot className="w-3 h-3" />,
    className: "bg-muted text-muted-foreground border-border",
    description: "Inferred by AI based on available context",
    trustLevel: 'low',
  },
  raise_calculator: {
    label: "Raise Calculator",
    icon: <Calculator className="w-3 h-3" />,
    className: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
    description: "Calculated from raise planning tool",
    trustLevel: 'medium',
  },
  valuation_calculator: {
    label: "Valuation Calc",
    icon: <Calculator className="w-3 h-3" />,
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    description: "Calculated from valuation tool",
    trustLevel: 'medium',
  },
  enhanced: {
    label: "AI Enhanced",
    icon: <Sparkles className="w-3 h-3" />,
    className: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20",
    description: "Original content enhanced by AI",
    trustLevel: 'medium',
  },
  auto_sync: {
    label: "Auto-synced",
    icon: <RefreshCw className="w-3 h-3" />,
    className: "bg-muted text-muted-foreground border-border",
    description: "Automatically synchronized from another source",
    trustLevel: 'low',
  }
};

export function DataSourceBadge({ source, timestamp, showTooltip = true, className = "" }: DataSourceBadgeProps) {
  if (!source) return null;
  
  const config = SOURCE_CONFIG[source] || {
    label: source,
    icon: <FileText className="w-3 h-3" />,
    className: "bg-muted text-muted-foreground",
    description: "Unknown source",
    trustLevel: 'low' as const,
  };

  const badge = (
    <Badge 
      variant="outline" 
      className={cn(
        "text-xs gap-1 px-2 py-0.5 font-normal",
        config.className,
        className
      )}
    >
      {config.icon}
      {config.label}
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium text-sm">{config.description}</p>
            {timestamp && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(timestamp).toLocaleDateString()}
              </p>
            )}
            <p className={cn(
              "text-xs",
              config.trustLevel === 'high' && "text-green-600",
              config.trustLevel === 'medium' && "text-amber-600",
              config.trustLevel === 'low' && "text-muted-foreground"
            )}>
              Trust level: {config.trustLevel}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Export source type for type safety
export type DataSourceType = keyof typeof SOURCE_CONFIG;
