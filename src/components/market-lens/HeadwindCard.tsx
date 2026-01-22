import { Wind, Shield, ChevronDown } from "lucide-react";
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
    <div className="rounded-xl border border-border bg-card overflow-hidden h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-muted/30">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
          <Wind className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-foreground">Market Headwinds</h3>
          <p className="text-xs text-muted-foreground">
            {items.length} challenge{items.length !== 1 ? "s" : ""} to navigate
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
                  ? "bg-muted-foreground text-background" 
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
                <div className="ml-8 p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mb-1">
                    <Shield className="w-3 h-3" />
                    How to address this
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
