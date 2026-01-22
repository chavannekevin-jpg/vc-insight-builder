import { DollarSign, TrendingUp, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

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
  // Create bar chart data from data points
  const barData = data.dataPoints.slice(0, 4).map((dp) => {
    const numMatch = dp.value.match(/[\d.]+/);
    const numValue = numMatch ? parseFloat(numMatch[0]) : 50;
    return {
      name: dp.metric.length > 12 ? dp.metric.slice(0, 12) + "..." : dp.metric,
      fullName: dp.metric,
      value: numValue,
      displayValue: dp.value,
      context: dp.context,
    };
  });

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-primary/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Funding Landscape</h3>
          <p className="text-xs text-muted-foreground">Capital environment for your stage</p>
        </div>
      </div>

      {/* Summary */}
      <div className="px-5 py-4 border-b border-border/30">
        <p className="text-sm text-muted-foreground">{data.summary}</p>
      </div>

      {/* Chart Section */}
      {data.dataPoints.length >= 3 && (
        <div className="px-5 py-4 border-b border-border/30">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Market Metrics Overview
            </span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={100}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border rounded-lg px-3 py-2 text-sm shadow-xl">
                          <p className="font-medium text-foreground">{data.fullName}</p>
                          <p className="text-primary font-bold">{data.displayValue}</p>
                          <p className="text-xs text-muted-foreground mt-1">{data.context}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={24}>
                  {barData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`hsl(var(--primary) / ${0.9 - index * 0.15})`} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Data Points Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/30">
        {data.dataPoints.map((point, index) => (
          <div key={index} className="bg-background px-5 py-4 space-y-1 group hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
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
