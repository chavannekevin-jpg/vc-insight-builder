import { motion } from "framer-motion";
import { 
  Users, CheckCircle2, TrendingUp, Calendar, 
  ArrowRight, Briefcase, AlertTriangle, Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AcceleratorOverviewProps {
  accelerator: {
    name: string;
    demo_day_date: string | null;
    focus_areas: string[] | null;
  } | null;
  stats: {
    totalStartups: number;
    withReports: number;
    avgScore: number;
    activeCohorts: number;
  };
  recentCompanies: Array<{
    id: string;
    name: string;
    category: string | null;
    public_score: number | null;
    memo_content_generated: boolean;
  }>;
  onNavigate: (section: string) => void;
  onViewStartup: (id: string) => void;
}

export function AcceleratorOverview({ 
  accelerator, 
  stats, 
  recentCompanies,
  onNavigate,
  onViewStartup 
}: AcceleratorOverviewProps) {
  const daysUntilDemoDay = accelerator?.demo_day_date 
    ? Math.ceil((new Date(accelerator.demo_day_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 75) return "text-success";
    if (score >= 60) return "text-primary";
    if (score >= 45) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground">Here's what's happening in your ecosystem</p>
        </div>
        {daysUntilDemoDay !== null && daysUntilDemoDay > 0 && (
          <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                <span className="text-primary font-bold">{daysUntilDemoDay}</span> days until Demo Day
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Startups", value: stats.totalStartups, icon: Users, color: "text-primary" },
          { label: "Reports Ready", value: stats.withReports, icon: CheckCircle2, color: "text-success" },
          { label: "Avg Fundability", value: stats.avgScore || "—", icon: TrendingUp, color: "text-warning" },
          { label: "Active Cohorts", value: stats.activeCohorts, icon: Calendar, color: "text-secondary" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
              <div className={cn("p-2 rounded-lg bg-muted/50", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Startups */}
        <div className="lg:col-span-2">
          <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                Recent Startups
              </h2>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("portfolio")}>
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {recentCompanies.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No startups yet</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => onNavigate("invites")}>
                  Create Invite Code
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentCompanies.slice(0, 5).map((company) => (
                  <div
                    key={company.id}
                    onClick={() => onViewStartup(company.id)}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                        {company.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{company.name}</p>
                        <p className="text-xs text-muted-foreground">{company.category || "Uncategorized"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {company.memo_content_generated ? (
                        <span className={cn("text-lg font-bold", getScoreColor(company.public_score))}>
                          {company.public_score || "—"}
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">Pending</span>
                      )}
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Focus Areas */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-5">
            <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => onNavigate("invites")}
              >
                <Users className="w-4 h-4" />
                Create Invite Code
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => onNavigate("team")}
              >
                <Users className="w-4 h-4" />
                Manage Team
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => onNavigate("analytics")}
              >
                <TrendingUp className="w-4 h-4" />
                View Analytics
              </Button>
            </div>
          </div>

          {/* Focus Areas */}
          {accelerator?.focus_areas && accelerator.focus_areas.length > 0 && (
            <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-5">
              <h2 className="font-semibold text-foreground mb-3">Focus Areas</h2>
              <div className="flex flex-wrap gap-2">
                {accelerator.focus_areas.map((area) => (
                  <span 
                    key={area}
                    className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Attention Needed */}
          {stats.totalStartups > 0 && stats.withReports < stats.totalStartups && (
            <div className="bg-warning/5 border border-warning/20 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-foreground">Attention Needed</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stats.totalStartups - stats.withReports} startup{stats.totalStartups - stats.withReports !== 1 ? 's' : ''} haven't completed their analysis yet.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
