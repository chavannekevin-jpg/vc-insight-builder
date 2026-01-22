import { DollarSign, TrendingUp } from "lucide-react";

interface FundingLandscapeData {
  summary: string;
  dataPoints: Array<{
    metric: string;
    value: string;
    context: string;
  }>;
}

interface FundingLandscapeCardProps {
  data: FundingLandscapeData;
}

export function FundingLandscapeCard({ data }: FundingLandscapeCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-muted/30">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-foreground">Funding Landscape</h3>
          <p className="text-xs text-muted-foreground">Capital environment for your stage</p>
        </div>
      </div>

      {/* Summary */}
      <div className="px-4 py-4 border-b border-border/50">
        <p className="text-sm text-muted-foreground">{data.summary}</p>
      </div>

      {/* Data Points as clean metric cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3">
        {data.dataPoints.map((point, index) => (
          <div 
            key={index} 
            className={cn(
              "px-4 py-4 space-y-1",
              index < data.dataPoints.length - 1 && "border-b sm:border-b-0 sm:border-r border-border/50",
              index >= 3 && "sm:border-t border-border/50"
            )}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-primary" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {point.metric}
              </p>
            </div>
            <p className="text-xl font-bold text-foreground">{point.value}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{point.context}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
