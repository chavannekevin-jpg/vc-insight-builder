import { DemoModeBanner } from "@/components/acceleratorDemo/DemoModeBanner";
import { AcceleratorDemoHeader } from "@/components/acceleratorDemo/AcceleratorDemoHeader";
import { DemoWrapper } from "@/components/acceleratorDemo/DemoWrapper";
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

  // Fundability distribution data
  const distributionData = [
    { range: "0-40", count: DEMO_STARTUPS.filter(s => s.fundabilityScore < 40).length, color: "hsl(var(--destructive))" },
    { range: "40-60", count: DEMO_STARTUPS.filter(s => s.fundabilityScore >= 40 && s.fundabilityScore < 60).length, color: "hsl(var(--warning))" },
    { range: "60-75", count: DEMO_STARTUPS.filter(s => s.fundabilityScore >= 60 && s.fundabilityScore < 75).length, color: "hsl(var(--primary))" },
    { range: "75-100", count: DEMO_STARTUPS.filter(s => s.fundabilityScore >= 75).length, color: "hsl(var(--success))" },
  ];

  // Status distribution for pie chart
  const statusData = [
    { name: "Demo Ready", value: stats.demoReady, color: "hsl(var(--success))" },
    { name: "On Track", value: stats.onTrack, color: "hsl(var(--primary))" },
    { name: "Needs Work", value: stats.needsWork, color: "hsl(var(--warning))" },
    { name: "At Risk", value: stats.atRisk, color: "hsl(var(--destructive))" },
  ];

  // Section averages for radar chart
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

  // Heatmap data - startups vs sections
  const heatmapData = DEMO_STARTUPS.map(startup => ({
    name: startup.name,
    ...startup.sectionScores
  }));

  // Find weakest and strongest sections
  const sectionTotals = Object.keys(sectionLabels).map(section => ({
    section,
    label: sectionLabels[section],
    avg: Math.round(
      DEMO_STARTUPS.reduce((sum, s) => sum + s.sectionScores[section as keyof typeof s.sectionScores], 0) / DEMO_STARTUPS.length
    )
  })).sort((a, b) => a.avg - b.avg);

  const weakestSection = sectionTotals[0];
  const strongestSection = sectionTotals[sectionTotals.length - 1];

  // Weekly progress leaders
  const progressLeaders = [...DEMO_STARTUPS]
    .sort((a, b) => b.weeklyProgress - a.weeklyProgress)
    .slice(0, 3);

  const progressLaggers = [...DEMO_STARTUPS]
    .sort((a, b) => a.weeklyProgress - b.weeklyProgress)
    .slice(0, 3);

  const getScoreColor = (score: number) => {
    if (score >= 75) return "bg-success";
    if (score >= 60) return "bg-primary";
    if (score >= 45) return "bg-warning";
    return "bg-destructive";
  };

  const getScoreOpacity = (score: number) => {
    return 0.3 + (score / 100) * 0.7;
  };

  return (
    <DemoWrapper>
    <div className="min-h-screen bg-background">
      <DemoModeBanner />
      <AcceleratorDemoHeader />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Cohort Analytics</h1>
          <p className="text-muted-foreground">
            Deep insights into {DEMO_ACCELERATOR.batchName} performance
          </p>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card/50 border border-border/50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Cohort Average</span>
            </div>
            <div className="text-3xl font-bold text-primary">{stats.avgFundabilityScore}</div>
            <div className="text-xs text-muted-foreground">out of 100</div>
          </div>
          <div className="bg-card/50 border border-border/50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-success" />
              <span className="text-sm text-muted-foreground">Demo Ready</span>
            </div>
            <div className="text-3xl font-bold text-success">{stats.demoReady}</div>
            <div className="text-xs text-muted-foreground">of {stats.totalStartups} startups</div>
          </div>
          <div className="bg-card/50 border border-border/50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-sm text-muted-foreground">Strongest Area</span>
            </div>
            <div className="text-xl font-bold text-foreground">{strongestSection.label}</div>
            <div className="text-xs text-muted-foreground">avg {strongestSection.avg}/100</div>
          </div>
          <div className="bg-card/50 border border-border/50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-sm text-muted-foreground">Weakest Area</span>
            </div>
            <div className="text-xl font-bold text-foreground">{weakestSection.label}</div>
            <div className="text-xs text-muted-foreground">avg {weakestSection.avg}/100</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Fundability Distribution */}
          <div className="bg-card/50 border border-border/50 rounded-xl p-6">
            <h3 className="font-semibold mb-6">Fundability Score Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
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

          {/* Status Breakdown */}
          <div className="bg-card/50 border border-border/50 rounded-xl p-6">
            <h3 className="font-semibold mb-6">Status Breakdown</h3>
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
          </div>
        </div>

        {/* Section Performance Radar */}
        <div className="bg-card/50 border border-border/50 rounded-xl p-6 mb-8">
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
        </div>

        {/* Section Heatmap */}
        <div className="bg-card/50 border border-border/50 rounded-xl p-6 mb-8">
          <h3 className="font-semibold mb-6">Section Scores Heatmap</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Startup</th>
                  {Object.values(sectionLabels).map(label => (
                    <th key={label} className="py-2 px-2 font-medium text-muted-foreground text-center text-xs">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DEMO_STARTUPS.sort((a, b) => b.fundabilityScore - a.fundabilityScore).map(startup => (
                  <tr key={startup.id} className="border-t border-border/30">
                    <td className="py-2 px-3 font-medium">{startup.name}</td>
                    {Object.keys(sectionLabels).map(section => {
                      const score = startup.sectionScores[section as keyof typeof startup.sectionScores];
                      return (
                        <td key={section} className="py-2 px-2">
                          <div
                            className={cn(
                              "w-full h-8 rounded flex items-center justify-center text-xs font-bold",
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
        </div>

        {/* Progress & Insights */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Weekly Progress Leaders */}
          <div className="bg-card/50 border border-border/50 rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              Trending Up This Week
            </h3>
            <div className="space-y-3">
              {progressLeaders.map((startup, index) => (
                <div key={startup.id} className="flex items-center justify-between p-3 bg-success/5 border border-success/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-success">#{index + 1}</span>
                    <div>
                      <div className="font-medium">{startup.name}</div>
                      <div className="text-xs text-muted-foreground">{startup.fundabilityScore}/100</div>
                    </div>
                  </div>
                  <div className="text-success font-bold">+{startup.weeklyProgress}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Needs Attention */}
          <div className="bg-card/50 border border-border/50 rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-destructive" />
              Needs Attention
            </h3>
            <div className="space-y-3">
              {progressLaggers.filter(s => s.weeklyProgress < 0).map((startup, index) => (
                <div key={startup.id} className="flex items-center justify-between p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-destructive">!</span>
                    <div>
                      <div className="font-medium">{startup.name}</div>
                      <div className="text-xs text-muted-foreground">{startup.fundabilityScore}/100</div>
                    </div>
                  </div>
                  <div className="text-destructive font-bold">{startup.weeklyProgress}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cohort Insights */}
        <div className="mt-8 bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Cohort Insights & Recommendations
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-background/50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Workshop Recommendation</h4>
              <p className="text-sm text-muted-foreground">
                Based on cohort averages, consider a <span className="text-primary font-medium">{weakestSection.label}</span> workshop. 
                This is the weakest area across the cohort with an average of {weakestSection.avg}/100.
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
                {stats.demoReady} startups are demo-ready and could represent the cohort well. 
                Consider featuring them in investor pre-meetings.
              </p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Team Strength</h4>
              <p className="text-sm text-muted-foreground">
                <span className="text-success font-medium">{strongestSection.label}</span> is the cohort's 
                strongest area ({strongestSection.avg}/100). This is a positive signal for investor confidence.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
    </DemoWrapper>
  );
};

export default CohortAnalytics;
