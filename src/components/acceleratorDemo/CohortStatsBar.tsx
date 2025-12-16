import { TrendingUp, Target, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { getCohortStats } from "@/data/acceleratorDemo/demoStartups";
import { cn } from "@/lib/utils";

export const CohortStatsBar = () => {
  const stats = getCohortStats();

  const statItems = [
    {
      label: "Cohort Average",
      value: stats.avgFundabilityScore,
      suffix: "/100",
      icon: Target,
      color: stats.avgFundabilityScore >= 70 ? "text-success" : stats.avgFundabilityScore >= 50 ? "text-warning" : "text-destructive",
    },
    {
      label: "Demo Ready",
      value: stats.demoReady,
      suffix: `/${stats.totalStartups}`,
      icon: CheckCircle2,
      color: "text-success",
    },
    {
      label: "On Track",
      value: stats.onTrack,
      suffix: `/${stats.totalStartups}`,
      icon: TrendingUp,
      color: "text-primary",
    },
    {
      label: "Needs Work",
      value: stats.needsWork,
      suffix: `/${stats.totalStartups}`,
      icon: Clock,
      color: "text-warning",
    },
    {
      label: "At Risk",
      value: stats.atRisk,
      suffix: `/${stats.totalStartups}`,
      icon: AlertTriangle,
      color: "text-destructive",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
          >
            <div className="flex items-center gap-2">
              <Icon className={cn("w-4 h-4", item.color)} />
              <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={cn("text-2xl font-bold", item.color)}>{item.value}</span>
              <span className="text-sm text-muted-foreground">{item.suffix}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
