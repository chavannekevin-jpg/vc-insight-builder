import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target,
  Users,
  Lightbulb,
  ArrowLeft,
  Loader2,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useAcceleratorCompanies,
  getCohortStats,
  getSectionAverages,
  getScoreDistribution,
  getWeakestAndStrongestSections,
  SECTION_LABELS,
  type AcceleratorCompany
} from "@/hooks/useAcceleratorData";

export default function AcceleratorAnalytics() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [acceleratorId, setAcceleratorId] = useState<string | null>(null);
  const [acceleratorName, setCeleratorName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch accelerator membership
  useEffect(() => {
    const fetchAccelerator = async () => {
      if (!isAuthenticated || authLoading || !user) return;

      try {
        const { data: membership } = await supabase
          .from("accelerator_members")
          .select("accelerator_id")
          .eq("user_id", user.id)
          .not("joined_at", "is", null)
          .limit(1)
          .maybeSingle();

        if (!membership) {
          navigate("/accelerator/signup");
          return;
        }

        const { data: accData } = await supabase
          .from("accelerators")
          .select("id, name, onboarding_completed")
          .eq("id", membership.accelerator_id)
          .single();

        if (!accData?.onboarding_completed) {
          navigate("/accelerator/onboarding");
          return;
        }

        setAcceleratorId(accData.id);
        setCeleratorName(accData.name);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to load accelerator");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccelerator();
  }, [isAuthenticated, authLoading, user, navigate]);

  const { data: companies = [], isLoading: companiesLoading } = useAcceleratorCompanies(acceleratorId || undefined);

  const stats = getCohortStats(companies);
  const sectionAverages = getSectionAverages(companies);
  const distributionData = getScoreDistribution(companies);
  const { weakest, strongest } = getWeakestAndStrongestSections(companies);

  // Status distribution for pie chart
  const statusData = [
    { name: "Demo Ready", value: stats.demoReady, color: "hsl(var(--success))" },
    { name: "On Track", value: stats.onTrack, color: "hsl(var(--primary))" },
    { name: "Needs Work", value: stats.needsWork, color: "hsl(var(--warning))" },
    { name: "At Risk", value: stats.atRisk, color: "hsl(var(--destructive))" },
  ].filter(d => d.value > 0);

  // Top and bottom performers
  const sortedByScore = [...companies]
    .filter(c => c.public_score)
    .sort((a, b) => (b.public_score || 0) - (a.public_score || 0));
  
  const topPerformers = sortedByScore.slice(0, 3);
  const needsAttention = sortedByScore.slice(-3).reverse();

  const getScoreColor = (score: number) => {
    if (score >= 75) return "bg-success";
    if (score >= 60) return "bg-primary";
    if (score >= 45) return "bg-warning";
    return "bg-destructive";
  };

  const getScoreOpacity = (score: number) => {
    return 0.3 + (score / 100) * 0.7;
  };

  if (isLoading || authLoading || companiesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/accelerator")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="font-semibold text-lg">Cohort Analytics</h1>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-16 text-center">
          <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Data Yet</h2>
          <p className="text-muted-foreground mb-6">
            Connect a cohort with startups that have completed their reports to see analytics.
          </p>
          <Button onClick={() => navigate("/accelerator")}>
            Go to Dashboard
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/accelerator")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="font-semibold text-lg">Cohort Analytics</h1>
              <p className="text-xs text-muted-foreground">{acceleratorName}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground font-medium">Cohort Average</span>
            </div>
            <div className="text-3xl font-bold text-primary">{stats.avgScore || "—"}</div>
            <div className="text-xs text-muted-foreground">out of 100</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-card border border-border rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-success" />
              <span className="text-sm text-muted-foreground font-medium">Demo Ready</span>
            </div>
            <div className="text-3xl font-bold text-success">{stats.demoReady}</div>
            <div className="text-xs text-muted-foreground">of {stats.totalStartups} startups</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-sm text-muted-foreground font-medium">Strongest Area</span>
            </div>
            <div className="text-xl font-bold text-foreground">{strongest?.section || "—"}</div>
            <div className="text-xs text-muted-foreground">
              {strongest ? `avg ${strongest.average}/100` : "No data"}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-sm text-muted-foreground font-medium">Weakest Area</span>
            </div>
            <div className="text-xl font-bold text-foreground">{weakest?.section || "—"}</div>
            <div className="text-xs text-muted-foreground">
              {weakest ? `avg ${weakest.average}/100` : "No data"}
            </div>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Fundability Distribution */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-6 shadow-sm"
          >
            <h3 className="font-semibold mb-6">Fundability Score Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Status Breakdown */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card border border-border rounded-xl p-6 shadow-sm"
          >
            <h3 className="font-semibold mb-6">Status Breakdown</h3>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No scored startups yet
              </div>
            )}
          </motion.div>
        </div>

        {/* Section Performance Radar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm"
        >
          <h3 className="font-semibold mb-6">Section Performance (Cohort Average)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={sectionAverages}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="section" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Radar
                name="Average Score"
                dataKey="average"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
              />
              <Legend />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Section Heatmap */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm"
        >
          <h3 className="font-semibold mb-6">Section Scores Heatmap</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Startup</th>
                  {Object.values(SECTION_LABELS).map(label => (
                    <th key={label} className="py-2 px-2 font-medium text-muted-foreground text-center text-xs">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedByScore.slice(0, 10).map(startup => (
                  <tr 
                    key={startup.id} 
                    className="border-t border-border/30 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => navigate(`/accelerator/startup/${startup.id}`)}
                  >
                    <td className="py-2 px-3 font-medium">{startup.name}</td>
                    {Object.keys(SECTION_LABELS).map(section => {
                      const score = startup.sectionScores[section];
                      return (
                        <td key={section} className="py-2 px-2">
                          {score !== undefined ? (
                            <div
                              className={cn(
                                "w-full h-8 rounded flex items-center justify-center text-xs font-bold text-white",
                                getScoreColor(score)
                              )}
                              style={{ opacity: getScoreOpacity(score) }}
                            >
                              {score}
                            </div>
                          ) : (
                            <div className="w-full h-8 rounded flex items-center justify-center text-xs text-muted-foreground bg-muted/30">
                              —
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <span>Score: </span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-destructive opacity-60" />
              <span>&lt;45</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-warning opacity-70" />
              <span>45-59</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-primary opacity-80" />
              <span>60-74</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-success opacity-90" />
              <span>75+</span>
            </div>
          </div>
        </motion.div>

        {/* Top Performers & Needs Attention */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Performers */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded-xl p-6 shadow-sm"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              Top Performers
            </h3>
            <div className="space-y-3">
              {topPerformers.map((startup, index) => (
                <div 
                  key={startup.id} 
                  className="flex items-center justify-between p-3 bg-success/5 border border-success/20 rounded-lg cursor-pointer hover:bg-success/10 transition-colors"
                  onClick={() => navigate(`/accelerator/startup/${startup.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-success">#{index + 1}</span>
                    <div>
                      <div className="font-medium">{startup.name}</div>
                      <div className="text-xs text-muted-foreground">{startup.category || "Uncategorized"}</div>
                    </div>
                  </div>
                  <div className="text-success font-bold text-xl">{startup.public_score}</div>
                </div>
              ))}
              {topPerformers.length === 0 && (
                <p className="text-muted-foreground text-sm">No scored startups yet</p>
              )}
            </div>
          </motion.div>

          {/* Needs Attention */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-card border border-border rounded-xl p-6 shadow-sm"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-destructive" />
              Needs Attention
            </h3>
            <div className="space-y-3">
              {needsAttention.filter(s => (s.public_score || 0) < 60).map((startup) => (
                <div 
                  key={startup.id} 
                  className="flex items-center justify-between p-3 bg-destructive/5 border border-destructive/20 rounded-lg cursor-pointer hover:bg-destructive/10 transition-colors"
                  onClick={() => navigate(`/accelerator/startup/${startup.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-destructive">!</span>
                    <div>
                      <div className="font-medium">{startup.name}</div>
                      <div className="text-xs text-muted-foreground">{startup.category || "Uncategorized"}</div>
                    </div>
                  </div>
                  <div className="text-destructive font-bold text-xl">{startup.public_score}</div>
                </div>
              ))}
              {needsAttention.filter(s => (s.public_score || 0) < 60).length === 0 && (
                <p className="text-muted-foreground text-sm">All startups are performing well!</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Cohort Insights */}
        {weakest && strongest && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-primary/5 border border-primary/20 rounded-xl p-6 shadow-sm"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              Cohort Insights & Recommendations
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-background/50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Workshop Recommendation</h4>
                <p className="text-sm text-muted-foreground">
                  Based on cohort averages, consider a <span className="text-primary font-medium">{weakest.section}</span> workshop. 
                  This is the weakest area across the cohort with an average of {weakest.average}/100.
                </p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Demo Day Risk</h4>
                <p className="text-sm text-muted-foreground">
                  {stats.atRisk + stats.needsWork} of {stats.totalStartups} startups need significant improvement 
                  before Demo Day. Focus mentor hours on these teams.
                </p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Showcase Candidates</h4>
                <p className="text-sm text-muted-foreground">
                  {stats.demoReady} startup{stats.demoReady !== 1 ? 's are' : ' is'} demo-ready and could represent the cohort well. 
                  Consider featuring them in investor pre-meetings.
                </p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Team Strength</h4>
                <p className="text-sm text-muted-foreground">
                  <span className="text-success font-medium">{strongest.section}</span> is the cohort's 
                  strongest area ({strongest.average}/100). This is a positive signal for investor confidence.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
