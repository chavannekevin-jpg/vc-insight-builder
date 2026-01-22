import { MapPin, Globe, CheckCircle2 } from "lucide-react";

interface GeographicContextData {
  summary: string;
  insights: string[];
}

interface GeographicContextCardProps {
  data: GeographicContextData;
}

export function GeographicContextCard({ data }: GeographicContextCardProps) {
  return (
    <div className="rounded-xl border border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent overflow-hidden h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-secondary/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
          <Globe className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Geographic Context</h3>
          <p className="text-xs text-muted-foreground">Your regional ecosystem</p>
        </div>
      </div>

      {/* Summary with visual accent */}
      <div className="px-5 py-4 border-b border-border/30">
        <div className="flex gap-3">
          <div className="w-1 bg-gradient-to-b from-secondary to-secondary/20 rounded-full flex-shrink-0" />
          <p className="text-sm text-muted-foreground">{data.summary}</p>
        </div>
      </div>

      {/* Insights as a checklist */}
      <div className="px-5 py-4 space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <MapPin className="w-3 h-3 text-secondary" />
          Regional Insights
        </p>
        <div className="space-y-2.5">
          {data.insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-2.5 group">
              <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <p className="text-sm text-foreground">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
