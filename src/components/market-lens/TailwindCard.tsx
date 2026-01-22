import { TrendingUp, Sparkles } from "lucide-react";

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
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-emerald-500/20 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Market Tailwinds</h3>
          <p className="text-xs text-muted-foreground">Trends working in your favor</p>
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-border/50">
        {items.map((item, index) => (
          <div key={index} className="px-5 py-4 space-y-2">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <h4 className="font-medium text-sm text-foreground">{item.title}</h4>
            </div>
            <p className="text-sm text-muted-foreground pl-6">{item.insight}</p>
            <div className="pl-6 pt-1">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Why this matters for you:
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.relevance}</p>
            </div>
            <p className="text-xs text-muted-foreground/60 pl-6 pt-1 italic">
              Source: {item.source}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
