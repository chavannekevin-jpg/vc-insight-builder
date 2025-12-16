import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DemoModeBanner } from "@/components/acceleratorDemo/DemoModeBanner";
import { AcceleratorDemoHeader } from "@/components/acceleratorDemo/AcceleratorDemoHeader";
import { DemoWrapper } from "@/components/acceleratorDemo/DemoWrapper";
import { DEMO_STARTUPS, DemoStartup } from "@/data/acceleratorDemo/demoStartups";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { 
  X, 
  Plus, 
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))"
];

const getScoreColor = (score: number) => {
  if (score >= 75) return "text-success";
  if (score >= 60) return "text-primary";
  if (score >= 45) return "text-warning";
  return "text-destructive";
};

const getProgressIcon = (progress: number) => {
  if (progress > 2) return <TrendingUp className="w-4 h-4 text-success" />;
  if (progress < -2) return <TrendingDown className="w-4 h-4 text-destructive" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
};

const statusConfig = {
  "demo-ready": { label: "Demo Ready", icon: CheckCircle2, color: "text-success" },
  "on-track": { label: "On Track", icon: TrendingUp, color: "text-primary" },
  "needs-work": { label: "Needs Work", icon: AlertTriangle, color: "text-warning" },
  "at-risk": { label: "At Risk", icon: AlertTriangle, color: "text-destructive" },
};

const CompareStartups = () => {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>([
    DEMO_STARTUPS[0].id,
    DEMO_STARTUPS[1].id
  ]);

  const selectedStartups = selectedIds
    .map(id => DEMO_STARTUPS.find(s => s.id === id))
    .filter(Boolean) as DemoStartup[];

  const availableStartups = DEMO_STARTUPS.filter(s => !selectedIds.includes(s.id));

  const addStartup = (id: string) => {
    if (selectedIds.length < 3 && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const removeStartup = (id: string) => {
    if (selectedIds.length > 1) {
      setSelectedIds(selectedIds.filter(sId => sId !== id));
    }
  };

  // Prepare radar chart data
  const radarData = Object.keys(sectionLabels).map(section => {
    const dataPoint: Record<string, any> = {
      section: sectionLabels[section],
      fullMark: 100
    };
    selectedStartups.forEach(startup => {
      dataPoint[startup.name] = startup.sectionScores[section as keyof typeof startup.sectionScores];
    });
    return dataPoint;
  });

  return (
    <DemoWrapper>
    <div className="min-h-screen bg-background">
      <DemoModeBanner />
      <AcceleratorDemoHeader />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Compare Startups</h1>
          <p className="text-muted-foreground">
            Side-by-side comparison of up to 3 startups
          </p>
        </div>

        {/* Startup Selection */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {selectedStartups.map((startup, index) => (
            <div
              key={startup.id}
              className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg"
              style={{ borderColor: CHART_COLORS[index] }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: CHART_COLORS[index] }}
              />
              <span className="font-medium">{startup.name}</span>
              {selectedIds.length > 1 && (
                <button
                  onClick={() => removeStartup(startup.id)}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          {selectedIds.length < 3 && (
            <Select onValueChange={addStartup}>
              <SelectTrigger className="w-48">
                <Plus className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Add startup" />
              </SelectTrigger>
              <SelectContent>
                {availableStartups.map(startup => (
                  <SelectItem key={startup.id} value={startup.id}>
                    {startup.name} ({startup.fundabilityScore})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Radar Chart Comparison */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
          <h3 className="font-semibold mb-6">Section Score Comparison</h3>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="section" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={10} />
              {selectedStartups.map((startup, index) => (
                <Radar
                  key={startup.id}
                  name={startup.name}
                  dataKey={startup.name}
                  stroke={CHART_COLORS[index]}
                  fill={CHART_COLORS[index]}
                  fillOpacity={0.2}
                />
              ))}
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

        {/* Detailed Comparison Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden mb-8 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-4 px-4 font-semibold bg-muted/30">Metric</th>
                  {selectedStartups.map((startup, index) => (
                    <th
                      key={startup.id}
                      className="py-4 px-4 font-semibold text-center"
                      style={{ borderBottom: `3px solid ${CHART_COLORS[index]}` }}
                    >
                      {startup.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Fundability Score */}
                <tr className="border-b border-border/30">
                  <td className="py-3 px-4 font-medium bg-muted/10">Fundability Score</td>
                  {selectedStartups.map(startup => (
                    <td key={startup.id} className="py-3 px-4 text-center">
                      <span className={cn("text-2xl font-bold", getScoreColor(startup.fundabilityScore))}>
                        {startup.fundabilityScore}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Status */}
                <tr className="border-b border-border/30">
                  <td className="py-3 px-4 font-medium bg-muted/10">Status</td>
                  {selectedStartups.map(startup => {
                    const status = statusConfig[startup.status];
                    return (
                      <td key={startup.id} className="py-3 px-4 text-center">
                        <span className={cn("font-medium", status.color)}>
                          {status.label}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* Weekly Progress */}
                <tr className="border-b border-border/30">
                  <td className="py-3 px-4 font-medium bg-muted/10">Weekly Progress</td>
                  {selectedStartups.map(startup => (
                    <td key={startup.id} className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {getProgressIcon(startup.weeklyProgress)}
                        <span className={cn(
                          "font-medium",
                          startup.weeklyProgress > 0 ? "text-success" :
                          startup.weeklyProgress < 0 ? "text-destructive" : "text-muted-foreground"
                        )}>
                          {startup.weeklyProgress > 0 ? "+" : ""}{startup.weeklyProgress}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Category */}
                <tr className="border-b border-border/30">
                  <td className="py-3 px-4 font-medium bg-muted/10">Category</td>
                  {selectedStartups.map(startup => (
                    <td key={startup.id} className="py-3 px-4 text-center text-muted-foreground">
                      {startup.category}
                    </td>
                  ))}
                </tr>

                {/* Team Size */}
                <tr className="border-b border-border/30">
                  <td className="py-3 px-4 font-medium bg-muted/10">Founders</td>
                  {selectedStartups.map(startup => (
                    <td key={startup.id} className="py-3 px-4 text-center">
                      {startup.founders.length}
                    </td>
                  ))}
                </tr>

                {/* Section Scores */}
                {Object.entries(sectionLabels).map(([key, label]) => (
                  <tr key={key} className="border-b border-border/30">
                    <td className="py-3 px-4 font-medium bg-muted/10">{label}</td>
                    {selectedStartups.map(startup => {
                      const score = startup.sectionScores[key as keyof typeof startup.sectionScores];
                      const maxScore = Math.max(...selectedStartups.map(s => s.sectionScores[key as keyof typeof s.sectionScores]));
                      const isMax = score === maxScore && selectedStartups.length > 1;
                      return (
                        <td key={startup.id} className="py-3 px-4 text-center">
                          <span className={cn(
                            "font-bold",
                            getScoreColor(score),
                            isMax && "underline decoration-2"
                          )}>
                            {score}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Strengths & Concerns Comparison */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Top Concerns */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4 text-destructive/80">Top Concerns</h3>
            <div className="space-y-4">
              {selectedStartups.map((startup, index) => (
                <div key={startup.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[index] }}
                    />
                    <span className="font-medium text-sm">{startup.name}</span>
                  </div>
                  <ul className="pl-5 space-y-1">
                    {startup.topConcerns.slice(0, 2).map((concern, i) => (
                      <li key={i} className="text-sm text-muted-foreground">• {concern}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Top Strengths */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4 text-success">Top Strengths</h3>
            <div className="space-y-4">
              {selectedStartups.map((startup, index) => (
                <div key={startup.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[index] }}
                    />
                    <span className="font-medium text-sm">{startup.name}</span>
                  </div>
                  <ul className="pl-5 space-y-1">
                    {startup.topStrengths.slice(0, 2).map((strength, i) => (
                      <li key={i} className="text-sm text-muted-foreground">• {strength}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          {selectedStartups.map(startup => (
            <Button
              key={startup.id}
              variant="outline"
              onClick={() => navigate(`/accelerator-demo/startup/${startup.id}`)}
            >
              View {startup.name} Details
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ))}
        </div>
      </main>
    </div>
    </DemoWrapper>
  );
};

export default CompareStartups;
