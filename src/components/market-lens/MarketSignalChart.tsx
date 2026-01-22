import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface MarketSignalChartProps {
  tailwindsCount: number;
  headwindsCount: number;
}

export function MarketSignalChart({ tailwindsCount, headwindsCount }: MarketSignalChartProps) {
  const total = tailwindsCount + headwindsCount;
  const tailwindPercent = total > 0 ? Math.round((tailwindsCount / total) * 100) : 50;
  
  const data = [
    { name: "Tailwinds", value: tailwindsCount, color: "hsl(var(--success))" },
    { name: "Headwinds", value: headwindsCount, color: "hsl(var(--warning))" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card/50 p-6 flex items-center gap-6">
      <div className="relative w-28 h-28 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={50}
              paddingAngle={4}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-popover border border-border rounded-lg px-3 py-2 text-sm shadow-lg">
                      <span className="font-medium">{payload[0].name}:</span> {payload[0].value}
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-foreground">{tailwindPercent}%</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Market Sentiment</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-sm text-muted-foreground">
              {tailwindsCount} Tailwind{tailwindsCount !== 1 ? "s" : ""} in your favor
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-sm text-muted-foreground">
              {headwindsCount} Headwind{headwindsCount !== 1 ? "s" : ""} to navigate
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground/70">
          {tailwindPercent >= 60 
            ? "The market environment looks favorable for your venture."
            : tailwindPercent >= 40
            ? "Market conditions are balanced – stay agile."
            : "Navigate carefully – headwinds require attention."}
        </p>
      </div>
    </div>
  );
}
