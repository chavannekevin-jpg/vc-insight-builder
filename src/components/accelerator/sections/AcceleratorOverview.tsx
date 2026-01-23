import { motion } from "framer-motion";
import { 
  Users, CheckCircle2, TrendingUp, Calendar, 
  Briefcase, AlertTriangle, Rocket,
  Zap, Target, ChevronRight, ArrowUpRight
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

  const statCards = [
    { label: "Total Startups", value: stats.totalStartups, icon: Users, accent: "bg-primary/10 text-primary" },
    { label: "Reports Ready", value: stats.withReports, icon: CheckCircle2, accent: "bg-success/10 text-success" },
    { label: "Avg Fundability", value: stats.avgScore || "—", icon: TrendingUp, accent: "bg-warning/10 text-warning" },
    { label: "Active Cohorts", value: stats.activeCohorts, icon: Calendar, accent: "bg-secondary/10 text-secondary" },
  ];

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-6"
      >
        <div>
          <p className="text-sm font-medium text-primary mb-2">Dashboard</p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-2">Here's what's happening in your ecosystem today</p>
        </div>
        
        {daysUntilDemoDay !== null && daysUntilDemoDay > 0 && (
          <div className="flex items-center gap-4 px-5 py-4 rounded-xl bg-card border border-border">
            <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Demo Day</p>
              <p className="text-2xl font-bold text-foreground">{daysUntilDemoDay} <span className="text-base font-medium text-muted-foreground">days</span></p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.05 }}
            className="rounded-xl p-5 bg-card border border-border hover:border-border/80 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
              <div className={cn("p-2.5 rounded-lg", stat.accent)}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Startups */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <div className="rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-primary" />
                </div>
                <h2 className="font-semibold text-foreground">Recent Startups</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("portfolio")} className="text-muted-foreground hover:text-foreground -mr-2">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="p-2">
              {recentCompanies.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">No startups in your ecosystem yet</p>
                  <Button variant="outline" size="sm" onClick={() => onNavigate("invites")}>
                    <Zap className="w-4 h-4 mr-2" /> Create Invite Code
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {recentCompanies.slice(0, 5).map((company) => (
                    <div
                      key={company.id}
                      onClick={() => onViewStartup(company.id)}
                      className="group flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 rounded-lg bg-muted/80 flex items-center justify-center text-sm font-semibold text-foreground">
                            {company.name.slice(0, 2).toUpperCase()}
                          </div>
                          {company.memo_content_generated && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-success flex items-center justify-center border-2 border-card">
                              <CheckCircle2 className="w-2.5 h-2.5 text-success-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">{company.name}</p>
                          <p className="text-xs text-muted-foreground">{company.category || "Uncategorized"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {company.memo_content_generated ? (
                          <span className={cn("text-lg font-bold", getScoreColor(company.public_score))}>{company.public_score || "—"}</span>
                        ) : (
                          <span className="text-xs px-2.5 py-1 rounded-md bg-muted text-muted-foreground">Pending</span>
                        )}
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3 p-5 border-b border-border">
              <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-secondary" />
              </div>
              <h2 className="font-semibold text-foreground">Quick Actions</h2>
            </div>
            <div className="p-2">
              {[
                { label: "Create Invite Code", icon: Users, section: "invites" },
                { label: "Manage Team", icon: Users, section: "team" },
                { label: "View Analytics", icon: TrendingUp, section: "analytics" },
              ].map((action) => (
                <button key={action.label} onClick={() => onNavigate(action.section)} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-muted transition-colors">
                    <action.icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{action.label}</span>
                  <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Focus Areas */}
          {accelerator?.focus_areas && accelerator.focus_areas.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl bg-card border border-border p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <h2 className="font-semibold text-foreground">Focus Areas</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {accelerator.focus_areas.map((area) => (
                  <span key={area} className="px-3 py-1.5 rounded-md text-xs font-medium bg-muted text-muted-foreground">{area}</span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Attention Needed */}
          {stats.totalStartups > 0 && stats.withReports < stats.totalStartups && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="rounded-xl bg-warning/5 border border-warning/20 p-5">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">Attention Needed</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {stats.totalStartups - stats.withReports} startup{stats.totalStartups - stats.withReports !== 1 ? 's' : ''} haven't completed their analysis yet.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
