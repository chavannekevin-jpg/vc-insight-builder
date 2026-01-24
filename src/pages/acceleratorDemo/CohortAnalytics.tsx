import { AcceleratorDemoLayout } from "@/components/acceleratorDemo/AcceleratorDemoLayout";
import { DEMO_STARTUPS, getCohortStats } from "@/data/acceleratorDemo/demoStartups";
import { DEMO_ACCELERATOR } from "@/data/acceleratorDemo/acceleratorProfile";
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
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";

const sectionLabels: Record<string, string> = {
  problem: "Problem",
  solution: "Solution",
  market: "Market",
  competition: "Competition",
  team: "Team",
  businessModel: "Biz Model",
  traction: "Traction",
  vision: "Vision"
};

const CohortAnalytics = () => {
  const stats = getCohortStats();

  const distributionData = [
    { range: "0-40", count: DEMO_STARTUPS.filter(s => s.fundabilityScore < 40).length, color: "hsl(var(--destructive))" },
    { range: "40-60", count: DEMO_STARTUPS.filter(s => s.fundabilityScore >= 40 && s.fundabilityScore < 60).length, color: "hsl(var(--warning))" },
    { range: "60-75", count: DEMO_STARTUPS.filter(s => s.fundabilityScore >= 60 && s.fundabilityScore < 75).length, color: "hsl(var(--primary))" },
    { range: "75-100", count: DEMO_STARTUPS.filter(s => s.fundabilityScore >= 75).length, color: "hsl(var(--success))" },
  ];

  const statusData = [
    { name: "Demo Ready", value: stats.demoReady, color: "hsl(var(--success))" },
    { name: "On Track", value: stats.onTrack, color: "hsl(var(--primary))" },
    { name: "Needs Work", value: stats.needsWork, color: "hsl(var(--warning))" },
    { name: "At Risk", value: stats.atRisk, color: "hsl(var(--destructive))" },
  ];

  const sectionAverages = Object.keys(sectionLabels).map(section => {
    const avg = Math.round(
      DEMO_STARTUPS.reduce((sum, s) => sum + s.sectionScores[section as keyof typeof s.sectionScores], 0) / DEMO_STARTUPS.length
    );
    return {
      section: sectionLabels[section],
      average: avg,
      fullMark: 100
    };
  });

  const sectionTotals = Object.keys(sectionLabels).map(section => ({
    section,
    label: sectionLabels[section],
    avg: Math.round(
      DEMO_STARTUPS.reduce((sum, s) => sum + s.sectionScores[section as keyof typeof s.sectionScores], 0) / DEMO_STARTUPS.length
    )
  })).sort((a, b) => a.avg - b.avg);

  const weakestSection = sectionTotals[0];
  const strongestSection = sectionTotals[sectionTotals.length - 1];

  const progressLeaders = [...DEMO_STARTUPS]
    .sort((a, b) => b.weeklyProgress - a.weeklyProgress)
    .slice(0, 3);

  const progressLaggers = [...DEMO_STARTUPS]
    .sort((a, b) => a.weeklyProgress - b.weeklyProgress)
    .slice(0, 3);

  const getScoreColor = (score: number) => {
    if (score >= 75) return "bg-emerald-500";
    if (score >= 60) return "bg-primary";
    if (score >= 45) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getScoreOpacity = (score: number) => {
    return 0.3 + (score / 100) * 0.7;
  };

  return (
    <AcceleratorDemoLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Cohort Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Deep insights into {DEMO_ACCELERATOR.batchName} performance
          </p>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Target, label: "Cohort Average", value: stats.avgFundabilityScore, subtitle: "out of 100", color: "text-primary" },
            { icon: Users, label: "Demo Ready", value: stats.demoReady, subtitle: `of ${stats.totalStartups} startups`, color: "text-emerald-400" },
            { icon: TrendingUp, label: "Strongest Area", value: strongestSection.label, subtitle: `avg ${strongestSection.avg}/100`, color: "text-emerald-400" },
            { icon: AlertTriangle, label: "Weakest Area", value: weakestSection.label, subtitle: `avg ${weakestSection.avg}/100`, color: "text-amber-400" },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-xl bg-card/40 backdrop-blur-xl border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <div className={`text-xl font-bold ${typeof stat.value === 'number' ? stat.color : ''}`}>{stat.value}</div>
              <div className="text-[10px] text-muted-foreground">{stat.subtitle}</div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="p-5 rounded-xl bg-card/40 backdrop-blur-xl border border-white/[0.06]">
            <h3 className="font-semibold text-sm mb-4">Fundability Score Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
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
          </div>

          <div className="p-5 rounded-xl bg-card/40 backdrop-blur-xl border border-white/[0.06]">
            <h3 className="font-semibold text-sm mb-4">Status Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
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
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section Performance Radar */}
        <div className="p-5 rounded-xl bg-card/40 backdrop-blur-xl border border-white/[0.06] mb-8">
          <h3 className="font-semibold text-sm mb-4">Section Performance (Cohort Average)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={sectionAverages}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="section" stroke="hsl(var(--muted-foreground))" fontSize={11} />
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
        </div>

        {/* Section Heatmap */}
        <div className="p-5 rounded-xl bg-card/40 backdrop-blur-xl border border-white/[0.06] mb-8">
          <h3 className="font-semibold text-sm mb-4">Section Scores Heatmap</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Startup</th>
                  {Object.values(sectionLabels).map(label => (
                    <th key={label} className="py-2 px-1.5 font-medium text-muted-foreground text-center text-[10px]">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DEMO_STARTUPS.sort((a, b) => b.fundabilityScore - a.fundabilityScore).map(startup => (
                  <tr key={startup.id} className="border-t border-white/[0.04]">
                    <td className="py-1.5 px-2 font-medium text-xs">{startup.name}</td>
                    {Object.keys(sectionLabels).map(section => {
                      const score = startup.sectionScores[section as keyof typeof startup.sectionScores];
                      return (
                        <td key={section} className="py-1.5 px-1">
                          <div
                            className={cn(
                              "w-full h-6 rounded flex items-center justify-center text-[10px] font-bold text-white",
                              getScoreColor(score)
                            )}
                            style={{ opacity: getScoreOpacity(score) }}
                          >
                            {score}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Progress & Insights */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl bg-card/40 backdrop-blur-xl border border-white/[0.06]">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Trending Up This Week
            </h3>
            <div className="space-y-2">
              {progressLeaders.map((startup, index) => (
                <div key={startup.id} className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-emerald-400">#{index + 1}</span>
                    <div>
                      <div className="font-medium text-sm">{startup.name}</div>
                      <div className="text-[10px] text-muted-foreground">{startup.fundabilityScore}/100</div>
                    </div>
                  </div>
                  <div className="text-emerald-400 font-bold text-sm">+{startup.weeklyProgress}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-card/40 backdrop-blur-xl border border-white/[0.06]">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              Needs Attention
            </h3>
            <div className="space-y-2">
              {progressLaggers.filter(s => s.weeklyProgress < 0).map((startup) => (
                <div key={startup.id} className="flex items-center justify-between p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-rose-400">!</span>
                    <div>
                      <div className="font-medium text-sm">{startup.name}</div>
                      <div className="text-[10px] text-muted-foreground">{startup.fundabilityScore}/100</div>
                    </div>
                  </div>
                  <div className="text-rose-400 font-bold text-sm">{startup.weeklyProgress}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AcceleratorDemoLayout>
  );
};

export default CohortAnalytics;
