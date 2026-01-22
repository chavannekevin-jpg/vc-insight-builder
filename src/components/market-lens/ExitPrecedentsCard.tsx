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
    <div className="rounded-xl border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent overflow-hidden h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-accent/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-accent" />
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
            className="p-4 rounded-lg bg-accent/5 border border-accent/10 hover:border-accent/30 transition-colors group"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Star className="w-4 h-4 text-accent" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground">{item.company}</h4>
                  <ArrowUpRight className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm text-muted-foreground">{item.outcome}</p>
                <p className="text-xs text-accent font-medium">
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
