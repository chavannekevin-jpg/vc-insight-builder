import { Wind, Shield, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface HeadwindItem {
  title: string;
  insight: string;
  relevance: string;
  source: string;
}

interface HeadwindCardProps {
  items: HeadwindItem[];
}

export function HeadwindCard({ items }: HeadwindCardProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <div className="rounded-xl border border-warning/20 bg-gradient-to-br from-warning/5 to-transparent overflow-hidden h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-warning/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
          <Wind className="w-5 h-5 text-warning" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Market Headwinds</h3>
          <p className="text-xs text-muted-foreground">
            {items.length} challenge{items.length !== 1 ? "s" : ""} to navigate
          </p>
        </div>
      </div>

      {/* Items - Accordion Style */}
      <div className="divide-y divide-border/30">
        {items.map((item, index) => (
          <div 
            key={index} 
            className={cn(
              "transition-all duration-300 cursor-pointer",
              expandedIndex === index ? "bg-warning/5" : "hover:bg-muted/30"
            )}
            onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
          >
            <div className="px-5 py-3 flex items-center gap-3">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                expandedIndex === index 
                  ? "bg-warning text-warning-foreground" 
                  : "bg-warning/20 text-warning"
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
                <div className="pl-9 p-3 rounded-lg bg-warning/5 border border-warning/10">
                  <p className="text-xs text-warning font-semibold flex items-center gap-1.5">
                    <Shield className="w-3 h-3" />
                    How to address this
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
