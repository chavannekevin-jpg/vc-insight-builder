import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

interface DataPoint {
  metric: string;
  value: string;
  context: string;
}

interface FundingRadarChartProps {
  dataPoints: DataPoint[];
}

export function FundingRadarChart({ dataPoints }: FundingRadarChartProps) {
  // Parse numeric values for the radar chart
  const parseValue = (value: string): number => {
    // Extract numbers and normalize to 0-100 scale
    const num = parseFloat(value.replace(/[^0-9.]/g, ""));
    if (isNaN(num)) return 50;
    // Normalize based on likely ranges
    if (value.includes("%")) return Math.min(num, 100);
    if (value.includes("M") || value.includes("million")) return Math.min((num / 50) * 100, 100);
    if (value.includes("B") || value.includes("billion")) return Math.min((num / 5) * 100, 100);
    if (value.includes("x")) return Math.min((num / 10) * 100, 100);
    return Math.min(num, 100);
  };

  const chartData = dataPoints.slice(0, 6).map((dp) => ({
    metric: dp.metric.length > 15 ? dp.metric.slice(0, 15) + "..." : dp.metric,
    fullMetric: dp.metric,
    value: parseValue(dp.value),
    displayValue: dp.value,
    context: dp.context,
  }));

  if (chartData.length < 3) {
    return null; // Need at least 3 points for a radar chart
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid 
            stroke="hsl(var(--border))" 
            strokeOpacity={0.5}
          />
          <PolarAngleAxis 
            dataKey="metric" 
            tick={{ 
              fill: "hsl(var(--muted-foreground))", 
              fontSize: 11,
            }}
            tickLine={false}
          />
          <Radar
            name="Market Position"
            dataKey="value"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-popover border border-border rounded-lg px-3 py-2 text-sm shadow-xl max-w-xs">
                    <p className="font-medium text-foreground">{data.fullMetric}</p>
                    <p className="text-primary font-bold">{data.displayValue}</p>
                    <p className="text-xs text-muted-foreground mt-1">{data.context}</p>
                  </div>
                );
              }
              return null;
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
