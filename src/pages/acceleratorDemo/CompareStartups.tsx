import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AcceleratorDemoLayout } from "@/components/acceleratorDemo/AcceleratorDemoLayout";
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
  "hsl(142, 76%, 36%)",
  "hsl(45, 93%, 47%)"
];

const getScoreColor = (score: number) => {
  if (score >= 75) return "text-emerald-400";
  if (score >= 60) return "text-primary";
  if (score >= 45) return "text-amber-400";
  return "text-rose-400";
};

const getProgressIcon = (progress: number) => {
  if (progress > 2) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
  if (progress < -2) return <TrendingDown className="w-4 h-4 text-rose-400" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
};

const statusConfig = {
  "demo-ready": { label: "Demo Ready", icon: CheckCircle2, color: "text-emerald-400" },
  "on-track": { label: "On Track", icon: TrendingUp, color: "text-primary" },
  "needs-work": { label: "Needs Work", icon: AlertTriangle, color: "text-amber-400" },
  "at-risk": { label: "At Risk", icon: AlertTriangle, color: "text-rose-400" },
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
    <AcceleratorDemoLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Compare Startups</h1>
          <p className="text-sm text-muted-foreground">
            Side-by-side comparison of up to 3 startups
          </p>
        </div>

        {/* Startup Selection */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {selectedStartups.map((startup, index) => (
            <div
              key={startup.id}
              className="flex items-center gap-2 px-4 py-2 bg-card/40 backdrop-blur-xl border border-white/[0.06] rounded-xl"
              style={{ borderColor: CHART_COLORS[index] }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: CHART_COLORS[index] }}
              />
              <span className="font-medium text-sm">{startup.name}</span>
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
              <SelectTrigger className="w-48 bg-card/40 border-white/[0.06]">
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
        <div className="p-5 rounded-xl bg-card/40 backdrop-blur-xl border border-white/[0.06] mb-8">
          <h3 className="font-semibold text-sm mb-4">Section Score Comparison</h3>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="section" stroke="hsl(var(--muted-foreground))" fontSize={11} />
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
        <div className="p-5 rounded-xl bg-card/40 backdrop-blur-xl border border-white/[0.06] mb-8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Metric</th>
                  {selectedStartups.map((startup, index) => (
                    <th
                      key={startup.id}
                      className="py-3 px-4 font-semibold text-center"
                      style={{ borderBottom: `2px solid ${CHART_COLORS[index]}` }}
                    >
                      {startup.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/[0.04]">
                  <td className="py-3 px-4 font-medium">Fundability Score</td>
                  {selectedStartups.map(startup => (
                    <td key={startup.id} className="py-3 px-4 text-center">
                      <span className={cn("text-xl font-bold", getScoreColor(startup.fundabilityScore))}>
                        {startup.fundabilityScore}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-white/[0.04]">
                  <td className="py-3 px-4 font-medium">Status</td>
                  {selectedStartups.map(startup => {
                    const status = statusConfig[startup.status];
                    return (
                      <td key={startup.id} className="py-3 px-4 text-center">
                        <span className={cn("font-medium text-xs", status.color)}>
                          {status.label}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                <tr className="border-b border-white/[0.04]">
                  <td className="py-3 px-4 font-medium">Weekly Progress</td>
                  {selectedStartups.map(startup => (
                    <td key={startup.id} className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {getProgressIcon(startup.weeklyProgress)}
                        <span className={cn(
                          "font-medium text-xs",
                          startup.weeklyProgress > 0 ? "text-emerald-400" :
                          startup.weeklyProgress < 0 ? "text-rose-400" : "text-muted-foreground"
                        )}>
                          {startup.weeklyProgress > 0 ? "+" : ""}{startup.weeklyProgress}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {Object.entries(sectionLabels).map(([key, label]) => (
                  <tr key={key} className="border-b border-white/[0.04]">
                    <td className="py-3 px-4 font-medium text-xs">{label}</td>
                    {selectedStartups.map(startup => {
                      const score = startup.sectionScores[key as keyof typeof startup.sectionScores];
                      const maxScore = Math.max(...selectedStartups.map(s => s.sectionScores[key as keyof typeof s.sectionScores]));
                      const isMax = score === maxScore && selectedStartups.length > 1;
                      return (
                        <td key={startup.id} className="py-3 px-4 text-center">
                          <span className={cn(
                            "font-bold text-xs",
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

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          {selectedStartups.map(startup => (
            <Button
              key={startup.id}
              variant="outline"
              size="sm"
              onClick={() => navigate(`/accelerator-demo/startup/${startup.id}`)}
              className="border-white/[0.06]"
            >
              View {startup.name}
              <ArrowRight className="w-3 h-3 ml-2" />
            </Button>
          ))}
        </div>
      </div>
    </AcceleratorDemoLayout>
  );
};

export default CompareStartups;
