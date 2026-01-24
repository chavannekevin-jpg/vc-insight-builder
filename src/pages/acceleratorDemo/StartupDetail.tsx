import { useParams, useNavigate } from "react-router-dom";
import { AcceleratorDemoLayout } from "@/components/acceleratorDemo/AcceleratorDemoLayout";
import { getStartupById } from "@/data/acceleratorDemo/demoStartups";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  Building2,
  FileText,
  Target,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";

const sectionLabels: Record<string, string> = {
  problem: "Problem",
  solution: "Solution",
  market: "Market",
  competition: "Competition",
  team: "Team",
  businessModel: "Business Model",
  traction: "Traction",
  vision: "Vision"
};

const getScoreColor = (score: number) => {
  if (score >= 75) return "text-emerald-400";
  if (score >= 60) return "text-primary";
  if (score >= 45) return "text-amber-400";
  return "text-rose-400";
};

const getScoreBg = (score: number) => {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 60) return "bg-primary";
  if (score >= 45) return "bg-amber-500";
  return "bg-rose-500";
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Strong";
  if (score >= 60) return "Good";
  if (score >= 50) return "Developing";
  if (score >= 40) return "Weak";
  return "Critical";
};

const statusConfig = {
  "demo-ready": {
    label: "Demo Ready",
    icon: CheckCircle2,
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    textColor: "text-emerald-400",
  },
  "on-track": {
    label: "On Track",
    icon: TrendingUp,
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
    textColor: "text-primary",
  },
  "needs-work": {
    label: "Needs Work",
    icon: Clock,
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    textColor: "text-amber-400",
  },
  "at-risk": {
    label: "At Risk",
    icon: AlertTriangle,
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/20",
    textColor: "text-rose-400",
  },
};

const StartupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const startup = getStartupById(id || "");

  if (!startup) {
    return (
      <AcceleratorDemoLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-xl font-bold mb-2">Startup not found</h1>
            <Button onClick={() => navigate("/accelerator-demo/cohort")}>
              Back to Portfolio
            </Button>
          </div>
        </div>
      </AcceleratorDemoLayout>
    );
  }

  const status = statusConfig[startup.status];
  const StatusIcon = status.icon;

  const sortedSections = Object.entries(startup.sectionScores)
    .sort(([, a], [, b]) => a - b);

  return (
    <AcceleratorDemoLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/accelerator-demo/cohort")}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Portfolio
        </Button>

        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold">{startup.name}</h1>
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium",
                    status.bgColor, status.textColor
                  )}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{startup.tagline}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="px-2 py-0.5 rounded bg-muted/50">{startup.category}</span>
                  <span>{startup.stage}</span>
                </div>
              </div>
            </div>

            {/* Score & Progress */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-card/40 backdrop-blur-xl border border-white/[0.06]">
              <div className="text-center">
                <div className={cn("text-3xl font-bold", getScoreColor(startup.fundabilityScore))}>
                  {startup.fundabilityScore}
                </div>
                <div className="text-[10px] text-muted-foreground">Fundability</div>
              </div>
              <div className="h-10 w-px bg-white/[0.06]" />
              <div className="text-center">
                <div className={cn(
                  "text-xl font-bold flex items-center justify-center gap-1",
                  startup.weeklyProgress > 2 ? "text-emerald-400" :
                  startup.weeklyProgress < -2 ? "text-rose-400" : "text-muted-foreground"
                )}>
                  {startup.weeklyProgress > 0 ? <TrendingUp className="w-4 h-4" /> : 
                   startup.weeklyProgress < 0 ? <TrendingDown className="w-4 h-4" /> : 
                   <Minus className="w-4 h-4" />}
                  {startup.weeklyProgress > 0 ? "+" : ""}{startup.weeklyProgress}
                </div>
                <div className="text-[10px] text-muted-foreground">Week Progress</div>
              </div>
              <div className="h-10 w-px bg-white/[0.06]" />
              <div className="flex-1">
                <Button
                  onClick={() => navigate(`/accelerator-demo/startup/${startup.id}/analysis`)}
                  size="sm"
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Full Analysis
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Section Scores */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section Scores */}
            <section className="p-5 rounded-xl bg-card/40 backdrop-blur-xl border border-white/[0.06]">
              <h2 className="text-lg font-semibold mb-4">Section Scores</h2>
              <div className="space-y-3">
                {Object.entries(startup.sectionScores).map(([section, score]) => (
                  <div key={section} className="flex items-center gap-3">
                    <div className="w-24 text-xs font-medium text-muted-foreground">
                      {sectionLabels[section] || section}
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", getScoreBg(score))}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                    <div className={cn("w-10 text-right text-sm font-bold", getScoreColor(score))}>
                      {score}
                    </div>
                    <div className="w-16 text-[10px] text-muted-foreground">
                      {getScoreLabel(score)}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Founders */}
            <section className="p-5 rounded-xl bg-card/40 backdrop-blur-xl border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Founding Team</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {startup.founders.map((founder, index) => (
                  <div key={index} className="p-3 border border-white/[0.04] rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center text-xs font-bold">
                        {founder.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{founder.name}</h3>
                        <p className="text-xs text-primary">{founder.role}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{founder.background}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Priority Areas */}
            <section className="p-5 rounded-xl bg-card/40 backdrop-blur-xl border border-white/[0.06]">
              <h2 className="text-lg font-semibold mb-4">Priority Improvement Areas</h2>
              <div className="space-y-3">
                {sortedSections.slice(0, 3).map(([section, score]) => (
                  <div key={section} className="p-3 border border-rose-500/10 bg-rose-500/5 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-sm">{sectionLabels[section] || section}</h3>
                      <span className={cn("font-bold text-sm", getScoreColor(score))}>{score}/100</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Focus area for improvement based on current score.
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Mentor Briefing */}
          <div className="space-y-6">
            <section className="p-5 rounded-xl bg-card/40 backdrop-blur-xl border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Mentor Focus</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{startup.mentorFocus}</p>
              
              <div className="mb-4">
                <h4 className="text-xs font-medium text-muted-foreground mb-2">Top Concerns</h4>
                <div className="space-y-1.5">
                  {startup.topConcerns.map((concern, i) => (
                    <div key={i} className="text-xs p-2 rounded bg-rose-500/5 border border-rose-500/10 text-rose-400">
                      {concern}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">Top Strengths</h4>
                <div className="space-y-1.5">
                  {startup.topStrengths.map((strength, i) => (
                    <div key={i} className="text-xs p-2 rounded bg-emerald-500/5 border border-emerald-500/10 text-emerald-400">
                      {strength}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Quick Actions</h3>
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-white/[0.06]"
                  onClick={() => navigate(`/accelerator-demo/startup/${startup.id}/analysis`)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Full Analysis
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-white/[0.06]"
                  onClick={() => navigate("/accelerator-demo/compare")}
                >
                  Compare with Others
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AcceleratorDemoLayout>
  );
};

export default StartupDetail;
