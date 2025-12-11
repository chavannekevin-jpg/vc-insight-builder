import { BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { SectionBenchmark } from "@/types/memo";
import { cn } from "@/lib/utils";

interface SectionBenchmarksProps {
  benchmarks: SectionBenchmark[];
  sectionName: string;
}

export const SectionBenchmarks = ({ benchmarks, sectionName }: SectionBenchmarksProps) => {
  const getPercentileStyle = (percentile: string) => {
    if (percentile.toLowerCase().includes("top") || percentile.toLowerCase().includes("above")) {
      return { icon: <TrendingUp className="w-4 h-4" />, color: "text-emerald-500" };
    }
    if (percentile.toLowerCase().includes("below") || percentile.toLowerCase().includes("lower")) {
      return { icon: <TrendingDown className="w-4 h-4" />, color: "text-red-500" };
    }
    return { icon: <Minus className="w-4 h-4" />, color: "text-amber-500" };
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10">
          <BarChart3 className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">Industry Benchmarks</h4>
          <p className="text-xs text-muted-foreground">{sectionName} comparison</p>
        </div>
      </div>

      {/* Benchmarks Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left text-xs font-medium text-muted-foreground py-2 px-3">Metric</th>
              <th className="text-center text-xs font-medium text-muted-foreground py-2 px-3">Your Value</th>
              <th className="text-center text-xs font-medium text-muted-foreground py-2 px-3">Seed Benchmark</th>
              <th className="text-center text-xs font-medium text-muted-foreground py-2 px-3">Series A</th>
              <th className="text-center text-xs font-medium text-muted-foreground py-2 px-3">Percentile</th>
            </tr>
          </thead>
          <tbody>
            {benchmarks.map((benchmark, idx) => {
              const percentileStyle = getPercentileStyle(benchmark.percentile);
              return (
                <tr key={idx} className="border-b border-border/30 last:border-0">
                  <td className="py-3 px-3">
                    <span className="text-sm font-medium text-foreground">{benchmark.metric}</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-sm font-semibold text-primary">{benchmark.yourValue}</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-sm text-muted-foreground">{benchmark.seedBenchmark}</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-sm text-muted-foreground">{benchmark.seriesABenchmark}</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={cn("inline-flex items-center gap-1 text-sm font-medium", percentileStyle.color)}>
                      {percentileStyle.icon}
                      {benchmark.percentile}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Insights */}
      <div className="mt-4 space-y-2">
        {benchmarks.map((benchmark, idx) => (
          <div key={idx} className="p-2 rounded-lg bg-muted/30 text-sm">
            <span className="font-medium text-foreground">{benchmark.metric}:</span>{" "}
            <span className="text-muted-foreground">{benchmark.insight}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
