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
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <Trophy className="w-4 h-4 text-purple-500" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Exit Precedents</h3>
          <p className="text-xs text-muted-foreground">Relevant success stories</p>
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-border/50">
        {items.map((item, index) => (
          <div key={index} className="px-5 py-4 space-y-1.5">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-purple-500" />
              <h4 className="font-medium text-sm text-foreground">{item.company}</h4>
            </div>
            <p className="text-sm text-muted-foreground pl-6">{item.outcome}</p>
            <p className="text-xs text-purple-600 dark:text-purple-400 pl-6">
              {item.relevance}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
