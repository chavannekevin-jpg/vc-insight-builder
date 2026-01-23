import { motion } from "framer-motion";
import { 
  Users, CheckCircle2, TrendingUp, Calendar, 
  ArrowRight, Briefcase, AlertTriangle, Rocket,
  Sparkles, Zap, Target, ChevronRight
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
    { 
      label: "Total Startups", 
      value: stats.totalStartups, 
      icon: Users, 
      gradient: "from-primary/20 via-primary/10 to-transparent",
      iconBg: "bg-primary/20",
      iconColor: "text-primary"
    },
    { 
      label: "Reports Ready", 
      value: stats.withReports, 
      icon: CheckCircle2, 
      gradient: "from-success/20 via-success/10 to-transparent",
      iconBg: "bg-success/20",
      iconColor: "text-success"
    },
    { 
      label: "Avg Fundability", 
      value: stats.avgScore || "—", 
      icon: TrendingUp, 
      gradient: "from-warning/20 via-warning/10 to-transparent",
      iconBg: "bg-warning/20",
      iconColor: "text-warning"
    },
    { 
      label: "Active Cohorts", 
      value: stats.activeCohorts, 
      icon: Calendar, 
      gradient: "from-secondary/20 via-secondary/10 to-transparent",
      iconBg: "bg-secondary/20",
      iconColor: "text-secondary"
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Hero Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 md:p-10"
        style={{
          background: 'linear-gradient(135deg, hsl(330 20% 12% / 0.9) 0%, hsl(330 20% 8% / 0.8) 100%)',
          backdropFilter: 'blur(40px)',
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-primary/10 via-transparent to-transparent rounded-full blur-2xl" />
        
        {/* Glass border effect */}
        <div className="absolute inset-0 rounded-3xl border border-white/[0.08]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Ecosystem Overview</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-2"
            >
              Welcome back
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground"
            >
              Here's what's happening in your ecosystem
            </motion.p>
          </div>
          
          {daysUntilDemoDay !== null && daysUntilDemoDay > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-60" />
              <div 
                className="relative px-6 py-4 rounded-2xl border border-white/[0.1]"
                style={{
                  background: 'linear-gradient(135deg, hsl(330 20% 15% / 0.9), hsl(330 20% 10% / 0.9))',
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Demo Day</p>
                    <p className="text-2xl font-bold text-foreground">
                      <span className="text-primary">{daysUntilDemoDay}</span> days
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative"
          >
            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
              style={{ background: `radial-gradient(circle at center, hsl(330 100% 65% / 0.15), transparent 70%)` }}
            />
            
            <div 
              className="relative h-full rounded-2xl p-5 border border-white/[0.06] group-hover:border-white/[0.12] transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, hsl(330 20% 12% / 0.6) 0%, hsl(330 20% 8% / 0.4) 100%)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Gradient overlay */}
              <div className={cn("absolute inset-0 rounded-2xl bg-gradient-to-br opacity-40", stat.gradient)} />
              
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <motion.p 
                    className="text-4xl font-bold text-foreground"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.05, type: "spring", stiffness: 200 }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-sm text-muted-foreground mt-1.5">{stat.label}</p>
                </div>
                <div className={cn("p-3 rounded-xl", stat.iconBg)}>
                  <stat.icon className={cn("w-5 h-5", stat.iconColor)} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Startups */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div 
            className="relative rounded-2xl p-6 border border-white/[0.06] h-full"
            style={{
              background: 'linear-gradient(135deg, hsl(330 20% 12% / 0.6) 0%, hsl(330 20% 8% / 0.4) 100%)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-semibold text-lg text-foreground">Recent Startups</h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onNavigate("portfolio")}
                className="text-muted-foreground hover:text-foreground group"
              >
                View All 
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>

            {recentCompanies.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">No startups in your ecosystem yet</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onNavigate("invites")}
                  className="border-primary/30 hover:border-primary/50 hover:bg-primary/10"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Create Invite Code
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCompanies.slice(0, 5).map((company, index) => (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + index * 0.05 }}
                    onClick={() => onViewStartup(company.id)}
                    className="group flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, hsl(330 20% 15% / 0.4) 0%, hsl(330 20% 10% / 0.3) 100%)',
                    }}
                    whileHover={{
                      background: 'linear-gradient(135deg, hsl(330 20% 18% / 0.6) 0%, hsl(330 20% 12% / 0.4) 100%)',
                    }}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center text-primary font-semibold text-sm border border-white/[0.06]">
                          {company.name.slice(0, 2).toUpperCase()}
                        </div>
                        {company.memo_content_generated && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-success flex items-center justify-center border-2 border-card">
                            <CheckCircle2 className="w-2.5 h-2.5 text-success-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {company.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{company.category || "Uncategorized"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {company.memo_content_generated ? (
                        <div className="text-right">
                          <span className={cn("text-2xl font-bold", getScoreColor(company.public_score))}>
                            {company.public_score || "—"}
                          </span>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</p>
                        </div>
                      ) : (
                        <span className="text-xs px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground border border-white/[0.06]">
                          Pending
                        </span>
                      )}
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="relative rounded-2xl p-6 border border-white/[0.06]"
            style={{
              background: 'linear-gradient(135deg, hsl(330 20% 12% / 0.6) 0%, hsl(330 20% 8% / 0.4) 100%)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-secondary" />
              </div>
              <h2 className="font-semibold text-lg text-foreground">Quick Actions</h2>
            </div>
            <div className="space-y-2">
              {[
                { label: "Create Invite Code", icon: Users, section: "invites" },
                { label: "Manage Team", icon: Users, section: "team" },
                { label: "View Analytics", icon: TrendingUp, section: "analytics" },
              ].map((action, index) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  onClick={() => onNavigate(action.section)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group"
                  style={{
                    background: 'linear-gradient(135deg, hsl(330 20% 15% / 0.3) 0%, hsl(330 20% 10% / 0.2) 100%)',
                  }}
                  whileHover={{
                    background: 'linear-gradient(135deg, hsl(330 20% 18% / 0.5) 0%, hsl(330 20% 12% / 0.3) 100%)',
                  }}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <action.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="font-medium text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {action.label}
                  </span>
                  <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Focus Areas */}
          {accelerator?.focus_areas && accelerator.focus_areas.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative rounded-2xl p-6 border border-white/[0.06]"
              style={{
                background: 'linear-gradient(135deg, hsl(330 20% 12% / 0.6) 0%, hsl(330 20% 8% / 0.4) 100%)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-semibold text-lg text-foreground">Focus Areas</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {accelerator.focus_areas.map((area, index) => (
                  <motion.span 
                    key={area}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.45 + index * 0.03 }}
                    className="px-4 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, hsl(330 100% 65% / 0.15) 0%, hsl(330 100% 65% / 0.05) 100%)',
                      borderColor: 'hsl(330 100% 65% / 0.3)',
                      color: 'hsl(330 100% 75%)',
                    }}
                  >
                    {area}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Attention Needed */}
          {stats.totalStartups > 0 && stats.withReports < stats.totalStartups && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="relative rounded-2xl p-5 border"
              style={{
                background: 'linear-gradient(135deg, hsl(35 100% 55% / 0.08) 0%, hsl(35 100% 55% / 0.02) 100%)',
                borderColor: 'hsl(35 100% 55% / 0.2)',
              }}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Attention Needed</h3>
                  <p className="text-sm text-muted-foreground">
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
