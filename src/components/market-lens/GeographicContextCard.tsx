import { Globe, CheckCircle2 } from "lucide-react";

interface GeographicContextData {
  summary: string;
  insights: string[];
}

interface GeographicContextCardProps {
  data: GeographicContextData;
}

export function GeographicContextCard({ data }: GeographicContextCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-muted/30">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
          <Globe className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-foreground">Geographic Context</h3>
          <p className="text-xs text-muted-foreground">Your regional ecosystem</p>
        </div>
      </div>

      {/* Summary */}
      <div className="px-4 py-3 border-b border-border/50">
        <p className="text-sm text-muted-foreground">{data.summary}</p>
      </div>

      {/* Insights */}
      <div className="px-4 py-3 space-y-2">
        {data.insights.map((insight, index) => (
          <div key={index} className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
