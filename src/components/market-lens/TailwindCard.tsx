import { TrendingUp, Sparkles, ChevronDown } from "lucide-react";
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
    <div className="rounded-xl border border-border bg-card overflow-hidden h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-muted/30">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-foreground">Market Tailwinds</h3>
          <p className="text-xs text-muted-foreground">
            {items.length} trend{items.length !== 1 ? "s" : ""} in your favor
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-border/50">
        {items.map((item, index) => (
          <div 
            key={index} 
            className={cn(
              "transition-colors cursor-pointer",
              expandedIndex === index ? "bg-muted/20" : "hover:bg-muted/10"
            )}
            onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
          >
            <div className="px-4 py-3 flex items-center gap-3">
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                expandedIndex === index 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              )}>
                {index + 1}
              </div>
              <h4 className="font-medium text-sm text-foreground flex-1 line-clamp-1">{item.title}</h4>
              <ChevronDown className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                expandedIndex === index && "rotate-180"
              )} />
            </div>
            
            {expandedIndex === index && (
              <div className="px-4 pb-4 space-y-3">
                <p className="text-sm text-muted-foreground pl-8">{item.insight}</p>
                <div className="ml-8 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-xs text-primary font-medium flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3 h-3" />
                    Why this matters for you
                  </p>
                  <p className="text-sm text-foreground">{item.relevance}</p>
                </div>
                <p className="text-xs text-muted-foreground/60 pl-8">
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
