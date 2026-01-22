import { TrendingUp, Sparkles, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TailwindItem {
  title: string;
  insight: string;
  relevance: string;
  source: string;
}

interface TailwindCardProps {
  items: TailwindItem[];
}

export function TailwindCard({ items }: TailwindCardProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent overflow-hidden h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-emerald-500/20 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 flex items-center justify-center shadow-lg shadow-emerald-500/10">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Market Tailwinds</h3>
          <p className="text-xs text-muted-foreground">
            {items.length} trend{items.length !== 1 ? "s" : ""} working in your favor
          </p>
        </div>
      </div>

      {/* Items - Accordion Style */}
      <div className="divide-y divide-border/50">
        {items.map((item, index) => (
          <div 
            key={index} 
            className={cn(
              "transition-all duration-300 cursor-pointer",
              expandedIndex === index ? "bg-emerald-500/5" : "hover:bg-emerald-500/5"
            )}
            onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
          >
            <div className="px-5 py-3 flex items-center gap-3">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                expandedIndex === index 
                  ? "bg-emerald-500 text-white" 
                  : "bg-emerald-500/20 text-emerald-600"
              )}>
                {index + 1}
              </div>
              <h4 className="font-medium text-sm text-foreground flex-1">{item.title}</h4>
              <ChevronRight className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                expandedIndex === index && "rotate-90"
              )} />
            </div>
            
            {expandedIndex === index && (
              <div className="px-5 pb-4 space-y-3 animate-fade-in">
                <p className="text-sm text-muted-foreground pl-9">{item.insight}</p>
                <div className="pl-9 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    Why this matters for you
                  </p>
                  <p className="text-sm text-foreground mt-1">{item.relevance}</p>
                </div>
                <p className="text-xs text-muted-foreground/60 pl-9 italic">
                  Source: {item.source}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
