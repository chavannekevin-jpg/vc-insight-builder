import { Calendar, Clock, Target } from "lucide-react";
import { Section90DayPlan as Section90DayPlanType, SectionActionItem } from "@/types/memo";
import { cn } from "@/lib/utils";
import { safeText, safeArray } from "@/lib/toolDataUtils";

interface Section90DayPlanProps {
  plan: Section90DayPlanType;
  sectionName: string;
}

export const Section90DayPlan = ({ plan, sectionName }: Section90DayPlanProps) => {
  // Early return if data is invalid
  if (!plan || typeof plan !== 'object') {
    return null;
  }

  const safeActions = safeArray<SectionActionItem>(plan?.actions);
  if (safeActions.length === 0) {
    return null;
  }

  const getPriorityStyle = (priority: unknown) => {
    const p = safeText(priority);
    switch (p) {
      case "critical":
        return {
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          text: "text-red-600",
          dot: "bg-red-500"
        };
      case "important":
        return {
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          text: "text-amber-600",
          dot: "bg-amber-500"
        };
      default:
        return {
          bg: "bg-blue-500/10",
          border: "border-blue-500/30",
          text: "text-blue-600",
          dot: "bg-blue-500"
        };
    }
  };

  const timelineOrder = ["Week 1-2", "Week 3-4", "Month 2", "Month 3"];
  
  const groupedActions = timelineOrder.reduce((acc, timeline) => {
    acc[timeline] = safeActions.filter(a => safeText(a?.timeline) === timeline);
    return acc;
  }, {} as Record<string, SectionActionItem[]>);

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-background p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">90-Day Action Plan</h4>
          <p className="text-xs text-muted-foreground">Fix {safeText(sectionName)} issues immediately</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {timelineOrder.map((timeline) => {
          const actions = groupedActions[timeline];
          if (!actions || actions.length === 0) return null;

          return (
            <div key={timeline} className="relative">
              {/* Timeline Header */}
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{timeline}</span>
              </div>

              {/* Actions */}
              <div className="space-y-2 pl-6 border-l-2 border-muted ml-2">
                {actions.map((action, idx) => {
                  const style = getPriorityStyle(action?.priority);
                  return (
                    <div 
                      key={idx}
                      className={cn(
                        "relative p-3 rounded-lg",
                        style.bg,
                        "border",
                        style.border
                      )}
                    >
                      {/* Timeline dot */}
                      <div className={cn(
                        "absolute -left-[25px] top-4 w-3 h-3 rounded-full border-2 border-background",
                        style.dot
                      )} />

                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{safeText(action?.action)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Target className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Success metric: {safeText(action?.metric)}
                            </span>
                          </div>
                        </div>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-xs font-medium capitalize",
                          style.bg,
                          style.text
                        )}>
                          {safeText(action?.priority)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-xs text-muted-foreground">Critical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-xs text-muted-foreground">Important</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-xs text-muted-foreground">Nice-to-have</span>
        </div>
      </div>
    </div>
  );
};
