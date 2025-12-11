import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Target, Zap, ArrowRight } from "lucide-react";
import { ActionPlanData, ActionItem } from "@/lib/actionPlanExtractor";
import { GoodVsBadExample } from "./GoodVsBadExample";
import { cn } from "@/lib/utils";

interface MemoActionPlanProps {
  actionPlan: ActionPlanData;
  companyName?: string;
}

const CATEGORY_ICONS = {
  narrative: "📝",
  traction: "📈",
  team: "👥",
  market: "🎯",
  business: "💰",
  competition: "🛡️"
};

const CATEGORY_LABELS = {
  narrative: "Story & Positioning",
  traction: "Traction & Validation",
  team: "Team & Capabilities",
  market: "Market & Scale",
  business: "Business Model",
  competition: "Competitive Moat"
};

const URGENCY_CONFIG = {
  critical: {
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    text: "text-destructive",
    label: "Critical Priority"
  },
  high: {
    bg: "bg-warning/10",
    border: "border-warning/30",
    text: "text-warning",
    label: "High Priority"
  },
  moderate: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    text: "text-primary",
    label: "Moderate Priority"
  }
};

export const MemoActionPlan = ({ actionPlan, companyName }: MemoActionPlanProps) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set([actionPlan.items[0]?.id]));
  
  const urgencyConfig = URGENCY_CONFIG[actionPlan.overallUrgency];

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8 mt-8">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.05),transparent_50%)]" />
      
      {/* Header */}
      <div className="relative mb-6">
        <div className="flex items-start gap-4">
          <div className={cn(
            "flex items-center justify-center w-12 h-12 rounded-xl",
            urgencyConfig.bg,
            urgencyConfig.border,
            "border"
          )}>
            <Target className={cn("w-6 h-6", urgencyConfig.text)} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl md:text-2xl font-display font-bold text-foreground">
                If You Did Nothing Else, Fix These {actionPlan.items.length} Things
              </h2>
              <span className={cn(
                "px-2 py-0.5 text-xs font-semibold rounded-full",
                urgencyConfig.bg,
                urgencyConfig.text
              )}>
                {urgencyConfig.label}
              </span>
            </div>
            <p className="text-muted-foreground text-sm md:text-base">
              {actionPlan.summaryLine}
            </p>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="relative space-y-3">
        {actionPlan.items.map((item, index) => (
          <ActionItemCard
            key={item.id}
            item={item}
            index={index}
            isExpanded={expandedItems.has(item.id)}
            onToggle={() => toggleItem(item.id)}
          />
        ))}
      </div>

      {/* Footer CTA */}
      <div className="relative mt-6 pt-6 border-t border-border/50">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <Zap className="w-4 h-4 inline mr-1 text-warning" />
            Addressing these gaps could significantly improve your fundability
          </p>
        </div>
      </div>
    </div>
  );
};

interface ActionItemCardProps {
  item: ActionItem;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

const ActionItemCard = ({ item, index, isExpanded, onToggle }: ActionItemCardProps) => {
  return (
    <div className={cn(
      "rounded-xl border transition-all duration-200",
      isExpanded ? "border-primary/30 bg-primary/5" : "border-border bg-background hover:border-border/80"
    )}>
      {/* Clickable Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-4 text-left"
      >
        {/* Priority Number */}
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shrink-0",
          index === 0 ? "bg-destructive/20 text-destructive" :
          index === 1 ? "bg-warning/20 text-warning" :
          "bg-muted text-muted-foreground"
        )}>
          {index + 1}
        </div>

        {/* Category Icon & Problem */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{CATEGORY_ICONS[item.category]}</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {CATEGORY_LABELS[item.category]}
            </span>
          </div>
          <p className="font-medium text-foreground line-clamp-2">
            {item.problem}
          </p>
        </div>

        {/* Expand Icon */}
        <div className="shrink-0">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* Impact */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-destructive uppercase tracking-wide">Why It Matters</span>
              <p className="text-sm text-foreground mt-1">{item.impact}</p>
            </div>
          </div>

          {/* How to Fix */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wide">How to Fix</span>
              <p className="text-sm text-foreground mt-1">{item.howToFix}</p>
            </div>
          </div>

          {/* Good vs Bad Example */}
          {item.badExample && item.goodExample && (
            <GoodVsBadExample
              badExample={item.badExample}
              goodExample={item.goodExample}
            />
          )}
        </div>
      )}
    </div>
  );
};
