import { Trophy, ArrowUpRight } from "lucide-react";

interface ExitPrecedent {
  company: string;
  outcome: string;
  relevance: string;
}

interface ExitPrecedentsCardProps {
  items: ExitPrecedent[];
}

export function ExitPrecedentsCard({ items }: ExitPrecedentsCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-muted/30">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
          <Trophy className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-foreground">Exit Precedents</h3>
          <p className="text-xs text-muted-foreground">{items.length} relevant success stories</p>
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-border/50">
        {items.map((item, index) => (
          <div key={index} className="px-4 py-3 space-y-1 hover:bg-muted/10 transition-colors group">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm text-foreground">{item.company}</h4>
              <ArrowUpRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-sm text-muted-foreground">{item.outcome}</p>
            <p className="text-xs text-primary">{item.relevance}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
