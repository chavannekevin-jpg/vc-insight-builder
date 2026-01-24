import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, CheckCircle2, TrendingUp, Calendar, 
  Briefcase, AlertTriangle, Rocket,
  Zap, Target, ChevronRight, ArrowUpRight, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CohortQuickSwitchDialog } from "@/components/accelerator/CohortQuickSwitchDialog";
import { CohortDetailDialog } from "@/components/accelerator/CohortDetailDialog";

interface AcceleratorOverviewProps {
  accelerator: {
    id: string;
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
  isDemo?: boolean;
}

// Premium auth-style glass card component
const FluidGlassCard = ({ 
  children, 
  className = "",
  delay = 0,
  hover = true 
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
  hover?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    className={cn("relative group", className)}
  >
    {/* Animated border glow on hover */}
    {hover && (
      <>
        <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/40 via-secondary/40 to-primary/40 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/15 via-secondary/15 to-primary/15 rounded-3xl opacity-40" />
      </>
    )}
    
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

// Stat card with auth-style glass effect
const StatCard = ({ 
  label, 
  value, 
  icon: Icon, 
  accent, 
  delay 
}: { 
  label: string; 
  value: number | string; 
  icon: any; 
  accent: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    className="relative group"
  >
    {/* Subtle glow on hover */}
    <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-2xl opacity-30" />
    
    <div className="relative bg-card/40 backdrop-blur-2xl rounded-2xl p-5 border border-border/50 overflow-hidden">
      {/* Top highlight */}
      <div className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
      
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
          <p className="text-sm text-muted-foreground/70 mt-1.5">{label}</p>
        </div>
        <div className={cn("p-2.5 rounded-xl backdrop-blur-sm", accent)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  </motion.div>
);

export function AcceleratorOverview({ 
  accelerator, 
  stats, 
  recentCompanies,
  onNavigate,
  onViewStartup,
  isDemo = false 
}: AcceleratorOverviewProps) {
  const [cohortSwitchOpen, setCohortSwitchOpen] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<any>(null);
  const [cohortDetailOpen, setCohortDetailOpen] = useState(false);

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

  const handleCohortClick = () => {
    setCohortSwitchOpen(true);
  };

  const handleCohortSelected = (cohort: any) => {
    setSelectedCohort(cohort);
    setCohortDetailOpen(true);
  };

  const statCards = [
    { label: "Total Startups", value: stats.totalStartups, icon: Users, accent: "bg-primary/15 text-primary", onClick: undefined },
    { label: "Reports Ready", value: stats.withReports, icon: CheckCircle2, accent: "bg-success/15 text-success", onClick: undefined },
    { label: "Avg Fundability", value: stats.avgScore || "—", icon: TrendingUp, accent: "bg-warning/15 text-warning", onClick: undefined },
    { label: "Active Cohorts", value: stats.activeCohorts, icon: Calendar, accent: "bg-secondary/15 text-secondary", onClick: handleCohortClick },
  ];

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-6"
      >
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Dashboard</span>
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground/70 mt-2">Here's what's happening in your ecosystem today</p>
        </div>
        
        {daysUntilDemoDay !== null && daysUntilDemoDay > 0 && (
          <FluidGlassCard delay={0.2} className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-medium">Demo Day</p>
                <p className="text-2xl font-bold text-foreground">{daysUntilDemoDay} <span className="text-base font-medium text-muted-foreground/60">days</span></p>
              </div>
            </div>
          </FluidGlassCard>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div id="tour-portfolio-stats" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={stat.label} onClick={stat.onClick} className={stat.onClick ? "cursor-pointer" : ""}>
            <StatCard label={stat.label} value={stat.value} icon={stat.icon} accent={stat.accent} delay={0.1 + i * 0.05} />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Portfolio Startups */}
        <FluidGlassCard delay={0.25} className="lg:col-span-2">
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Portfolio Startups</h2>
                  <p className="text-xs text-muted-foreground/60">{stats.totalStartups} total</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onNavigate("portfolio")} 
                className="text-muted-foreground/70 hover:text-foreground hover:bg-muted/30 -mr-2"
              >
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {recentCompanies.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground/70 text-sm mb-4">No startups in your ecosystem yet</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onNavigate("invites")}
                  className="bg-muted/20 border-border/50 hover:bg-muted/40"
                >
                  <Zap className="w-4 h-4 mr-2" /> Create Invite Code
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {recentCompanies.slice(0, 5).map((company, i) => (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    onClick={() => onViewStartup(company.id)}
                    className="group flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-muted/30 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 flex items-center justify-center text-sm font-semibold text-foreground/80">
                          {company.name.slice(0, 2).toUpperCase()}
                        </div>
                        {company.memo_content_generated && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-success flex items-center justify-center border-2 border-background">
                            <CheckCircle2 className="w-2.5 h-2.5 text-success-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-foreground/90 truncate group-hover:text-primary transition-colors">{company.name}</p>
                        <p className="text-xs text-muted-foreground/60">{company.category || "Uncategorized"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {company.memo_content_generated ? (
                        <span className={cn("text-lg font-bold", getScoreColor(company.public_score))}>{company.public_score || "—"}</span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-lg bg-muted/40 text-muted-foreground/60">Pending</span>
                      )}
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </FluidGlassCard>

        <div className="space-y-6">
          {/* Quick Actions */}
          <FluidGlassCard delay={0.3}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary/15 to-secondary/5 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-secondary" />
                </div>
                <h2 className="font-semibold text-foreground">Quick Actions</h2>
              </div>
              <div className="space-y-1">
                {[
                  { label: "Create Invite Code", icon: Users, section: "invites" },
                  { label: "Manage Team", icon: Users, section: "team" },
                  { label: "View Analytics", icon: TrendingUp, section: "analytics" },
                ].map((action, i) => (
                  <motion.button 
                    key={action.label} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                    onClick={() => onNavigate(action.section)} 
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-all duration-300 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-muted/30 flex items-center justify-center group-hover:bg-muted/50 transition-colors">
                      <action.icon className="w-4 h-4 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground/70 group-hover:text-foreground transition-colors">{action.label}</span>
                    <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors" />
                  </motion.button>
                ))}
              </div>
            </div>
          </FluidGlassCard>

          {accelerator?.focus_areas && accelerator.focus_areas.length > 0 && (
            <FluidGlassCard delay={0.35}>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                    <Target className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="font-semibold text-foreground">Focus Areas</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {accelerator.focus_areas.map((area, i) => (
                    <motion.span 
                      key={area} 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.03 }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted/30 text-muted-foreground/80 border border-border/30"
                    >
                      {area}
                    </motion.span>
                  ))}
                </div>
              </div>
            </FluidGlassCard>
          )}

          {/* Attention Needed */}
          {stats.totalStartups > 0 && stats.withReports < stats.totalStartups && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl bg-gradient-to-br from-warning/10 via-warning/5 to-transparent border border-warning/20 p-5 backdrop-blur-xl"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">Attention Needed</h3>
                  <p className="text-xs text-muted-foreground/70 leading-relaxed">
                    {stats.totalStartups - stats.withReports} startup{stats.totalStartups - stats.withReports !== 1 ? 's' : ''} haven't completed their analysis yet.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Cohort Quick Switch Dialog */}
      <CohortQuickSwitchDialog
        open={cohortSwitchOpen}
        onOpenChange={setCohortSwitchOpen}
        acceleratorId={accelerator?.id || null}
        onSelectCohort={handleCohortSelected}
      />

      {/* Cohort Detail Dialog */}
      <CohortDetailDialog
        open={cohortDetailOpen}
        onOpenChange={setCohortDetailOpen}
        cohort={selectedCohort}
        onViewStartup={onViewStartup}
        onAddStartup={() => {}}
      />
    </div>
  );
}
