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
    <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-primary/20 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Funding Landscape</h3>
          <p className="text-xs text-muted-foreground">Capital environment for your stage</p>
        </div>
      </div>

      {/* Summary */}
      <div className="px-5 py-4 border-b border-border/50">
        <p className="text-sm text-muted-foreground">{data.summary}</p>
      </div>

      {/* Data Points Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/50">
        {data.dataPoints.map((point, index) => (
          <div key={index} className="bg-background px-5 py-4 space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {point.metric}
              </p>
            </div>
            <p className="text-lg font-bold text-foreground">{point.value}</p>
            <p className="text-xs text-muted-foreground">{point.context}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
