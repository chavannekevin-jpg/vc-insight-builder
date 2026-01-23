import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Target, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AcceleratorAnalyticsSectionProps {
  stats: {
    totalStartups: number;
    withReports: number;
    avgScore: number;
    activeCohorts: number;
  };
  companies: Array<{
    id: string;
    name: string;
    public_score: number | null;
    category: string | null;
  }>;
}

export function AcceleratorAnalyticsSection({ stats, companies }: AcceleratorAnalyticsSectionProps) {
  // Calculate score distribution
  const scoreRanges = {
    excellent: companies.filter(c => c.public_score && c.public_score >= 75).length,
    good: companies.filter(c => c.public_score && c.public_score >= 60 && c.public_score < 75).length,
    average: companies.filter(c => c.public_score && c.public_score >= 45 && c.public_score < 60).length,
    needsWork: companies.filter(c => c.public_score && c.public_score < 45).length,
    unscored: companies.filter(c => !c.public_score).length,
  };

  // Get top categories
  const categoryCount: Record<string, number> = {};
  companies.forEach(c => {
    const cat = c.category || "Uncategorized";
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Portfolio performance and insights</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Portfolio Size", value: stats.totalStartups, icon: Users },
          { label: "Analysis Complete", value: `${Math.round((stats.withReports / Math.max(stats.totalStartups, 1)) * 100)}%`, icon: Target },
          { label: "Avg Fundability", value: stats.avgScore || "—", icon: TrendingUp },
          { label: "Active Cohorts", value: stats.activeCohorts, icon: BarChart3 },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-4">Fundability Distribution</h2>
          <div className="space-y-3">
            {[
              { label: "Excellent (75+)", value: scoreRanges.excellent, color: "bg-success" },
              { label: "Good (60-74)", value: scoreRanges.good, color: "bg-primary" },
              { label: "Average (45-59)", value: scoreRanges.average, color: "bg-warning" },
              { label: "Needs Work (<45)", value: scoreRanges.needsWork, color: "bg-destructive" },
              { label: "Not Scored", value: scoreRanges.unscored, color: "bg-muted" },
            ].map((range) => (
              <div key={range.label} className="flex items-center gap-3">
                <div className="w-32 text-sm text-muted-foreground">{range.label}</div>
                <div className="flex-1 h-6 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", range.color)}
                    style={{ width: `${(range.value / Math.max(companies.length, 1)) * 100}%` }}
                  />
                </div>
                <div className="w-8 text-sm font-medium text-foreground text-right">{range.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-4">Portfolio by Category</h2>
          {topCategories.length === 0 ? (
            <p className="text-muted-foreground text-sm">No category data available</p>
          ) : (
            <div className="space-y-3">
              {topCategories.map(([category, count], i) => (
                <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {i + 1}
                    </div>
                    <span className="font-medium text-foreground">{category}</span>
                  </div>
                  <span className="text-muted-foreground">{count} startup{count !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-5">
        <h2 className="font-semibold text-foreground mb-4">Top Performers</h2>
        {companies.filter(c => c.public_score).length === 0 ? (
          <p className="text-muted-foreground text-sm">No scored startups yet</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies
              .filter(c => c.public_score)
              .sort((a, b) => (b.public_score || 0) - (a.public_score || 0))
              .slice(0, 6)
              .map((company, i) => (
                <div key={company.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                    i < 3 ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground"
                  )}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{company.name}</p>
                    <p className="text-xs text-muted-foreground">{company.category || "Uncategorized"}</p>
                  </div>
                  <div className="text-lg font-bold text-success">{company.public_score}</div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
