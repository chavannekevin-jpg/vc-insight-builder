import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIInsightCardProps {
  title: string;
  insights: string[];
  className?: string;
}

export const AIInsightCard = ({ title, insights, className }: AIInsightCardProps) => {
  return (
    <div className={cn(
      "mt-4 p-4 rounded-lg border border-primary/20 bg-primary/5 animate-fade-in",
      className
    )}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <h4 className="text-sm font-semibold text-primary">{title}</h4>
      </div>
      <div className="space-y-2">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
            <p className="text-sm text-muted-foreground leading-relaxed">{insight}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3 italic">
        💡 These insights will appear in your memo automatically
      </p>
    </div>
  );
};