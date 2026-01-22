import { Trophy, ArrowUpRight, Star } from "lucide-react";

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
    <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-transparent overflow-hidden h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-purple-500/20 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-600/20 flex items-center justify-center shadow-lg shadow-purple-500/10">
          <Trophy className="w-5 h-5 text-purple-500" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Exit Precedents</h3>
          <p className="text-xs text-muted-foreground">{items.length} relevant success stories</p>
        </div>
      </div>

      {/* Items as Cards */}
      <div className="p-4 space-y-3">
        {items.map((item, index) => (
          <div 
            key={index} 
            className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20 hover:border-purple-500/40 transition-colors group"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Star className="w-4 h-4 text-purple-500" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground">{item.company}</h4>
                  <ArrowUpRight className="w-4 h-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm text-muted-foreground">{item.outcome}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  {item.relevance}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
