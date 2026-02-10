import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Target, Sparkles, MessageSquareHeart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AcceleratorNPSInsights } from "./AcceleratorNPSInsights";

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
  acceleratorId?: string | null;
}

// Premium auth-style glass card
const FluidGlassCard = ({ 
  children, 
  className = "",
  delay = 0,
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    className={cn("relative group", className)}
  >
    {/* Animated border glow on hover */}
    <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/40 via-secondary/40 to-primary/40 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/15 via-secondary/15 to-primary/15 rounded-3xl opacity-40" />
    
    {/* Glass card */}
    <div className="relative bg-card/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-border/50 overflow-hidden">
      {/* Top highlight */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-primary/8 to-transparent rounded-tl-3xl" />
      <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-secondary/8 to-transparent rounded-br-3xl" />
      
      <div className="relative z-10">{children}</div>
    </div>
  </motion.div>
);

export function AcceleratorAnalyticsSection({ stats, companies, acceleratorId }: AcceleratorAnalyticsSectionProps) {
  const [activeTab, setActiveTab] = useState("portfolio");
  
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
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">Analytics</span>
        </motion.div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Portfolio Insights</h1>
        <p className="text-muted-foreground/70 mt-2">Performance metrics and distributions</p>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-2 bg-muted/50 p-1.5 rounded-xl border border-border/50">
          <TabsTrigger value="portfolio" className="rounded-lg gap-2 py-2.5 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-md">
            <BarChart3 className="w-4 h-4" />
            Portfolio Insights
          </TabsTrigger>
          <TabsTrigger value="nps" className="rounded-lg gap-2 py-2.5 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-md">
            <MessageSquareHeart className="w-4 h-4" />
            NPS Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="mt-6 space-y-6">
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
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.5 }}
                className="relative group"
              >
                {/* Subtle glow on hover */}
                <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-2xl opacity-30" />
                
                <div className="relative bg-card/40 backdrop-blur-2xl rounded-2xl p-5 border border-border/50 overflow-hidden">
                  <div className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground/70">{stat.label}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Score Distribution */}
            <FluidGlassCard delay={0.25}>
              <div className="p-6">
                <h2 className="font-semibold text-foreground mb-5">Fundability Distribution</h2>
                <div className="space-y-4">
                  {[
                    { label: "Excellent (75+)", value: scoreRanges.excellent, color: "bg-success" },
                    { label: "Good (60-74)", value: scoreRanges.good, color: "bg-primary" },
                    { label: "Average (45-59)", value: scoreRanges.average, color: "bg-warning" },
                    { label: "Needs Work (<45)", value: scoreRanges.needsWork, color: "bg-destructive" },
                    { label: "Not Scored", value: scoreRanges.unscored, color: "bg-muted" },
                  ].map((range, i) => (
                    <motion.div 
                      key={range.label} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-32 text-sm text-muted-foreground/70">{range.label}</div>
                      <div className="flex-1 h-7 bg-muted/30 rounded-lg overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(range.value / Math.max(companies.length, 1)) * 100}%` }}
                          transition={{ delay: 0.4 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                          className={cn("h-full rounded-lg", range.color)}
                        />
                      </div>
                      <div className="w-8 text-sm font-medium text-foreground text-right">{range.value}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </FluidGlassCard>

            {/* Top Categories */}
            <FluidGlassCard delay={0.3}>
              <div className="p-6">
                <h2 className="font-semibold text-foreground mb-5">Top Categories</h2>
                {topCategories.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground/60 text-sm">No category data available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topCategories.map(([category, count], i) => (
                      <motion.div 
                        key={category} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + i * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/30"
                      >
                        <span className="text-sm font-medium text-foreground/90">{category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-primary">{count}</span>
                          <span className="text-xs text-muted-foreground/50">
                            ({Math.round((count / companies.length) * 100)}%)
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </FluidGlassCard>
          </div>
        </TabsContent>

        <TabsContent value="nps" className="mt-6">
          <AcceleratorNPSInsights acceleratorId={acceleratorId || null} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
