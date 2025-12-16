import { useParams, useNavigate } from "react-router-dom";
import { DemoModeBanner } from "@/components/acceleratorDemo/DemoModeBanner";
import { AcceleratorDemoHeader } from "@/components/acceleratorDemo/AcceleratorDemoHeader";
import { MentorBriefingCard } from "@/components/acceleratorDemo/MentorBriefingCard";
import { getStartupById } from "@/data/acceleratorDemo/demoStartups";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  Building2,
  FileText
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
  if (score >= 75) return "text-success";
  if (score >= 60) return "text-primary";
  if (score >= 45) return "text-warning";
  return "text-destructive";
};

const getScoreBg = (score: number) => {
  if (score >= 75) return "bg-success";
  if (score >= 60) return "bg-primary";
  if (score >= 45) return "bg-warning";
  return "bg-destructive";
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
    bgColor: "bg-success/10",
    borderColor: "border-success/30",
    textColor: "text-success",
  },
  "on-track": {
    label: "On Track",
    icon: TrendingUp,
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
    textColor: "text-primary",
  },
  "needs-work": {
    label: "Needs Work",
    icon: Clock,
    bgColor: "bg-warning/10",
    borderColor: "border-warning/30",
    textColor: "text-warning",
  },
  "at-risk": {
    label: "At Risk",
    icon: AlertTriangle,
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/30",
    textColor: "text-destructive",
  },
};

const StartupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const startup = getStartupById(id || "");

  if (!startup) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Startup not found</h1>
          <Button onClick={() => navigate("/accelerator-demo/cohort")}>
            Back to Cohort
          </Button>
        </div>
      </div>
    );
  }

  const status = statusConfig[startup.status];
  const StatusIcon = status.icon;

  // Sort sections by score (weakest first for priority)
  const sortedSections = Object.entries(startup.sectionScores)
    .sort(([, a], [, b]) => a - b);

  return (
    <div className="min-h-screen bg-background">
      <DemoModeBanner />
      <AcceleratorDemoHeader />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/accelerator-demo/cohort")}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cohort
        </Button>

        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          {/* Left: Company Info */}
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold">{startup.name}</h1>
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                    status.bgColor, status.textColor
                  )}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </div>
                </div>
                <p className="text-muted-foreground mb-2">{startup.tagline}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="bg-muted/50 px-2 py-0.5 rounded">{startup.category}</span>
                  <span>{startup.stage}</span>
                </div>
              </div>
            </div>

            {/* Score & Progress */}
            <div className="flex items-center gap-6 p-4 bg-card/50 border border-border/50 rounded-xl">
              <div className="text-center">
                <div className={cn("text-4xl font-bold", getScoreColor(startup.fundabilityScore))}>
                  {startup.fundabilityScore}
                </div>
                <div className="text-xs text-muted-foreground">Fundability Score</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <div className={cn(
                  "text-2xl font-bold flex items-center justify-center gap-1",
                  startup.weeklyProgress > 2 ? "text-success" :
                  startup.weeklyProgress < -2 ? "text-destructive" : "text-muted-foreground"
                )}>
                  {startup.weeklyProgress > 0 ? <TrendingUp className="w-5 h-5" /> : 
                   startup.weeklyProgress < 0 ? <TrendingDown className="w-5 h-5" /> : 
                   <Minus className="w-5 h-5" />}
                  {startup.weeklyProgress > 0 ? "+" : ""}{startup.weeklyProgress}
                </div>
                <div className="text-xs text-muted-foreground">Week Progress</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="flex-1">
                <Button
                  onClick={() => navigate(`/accelerator-demo/startup/${startup.id}/memo`)}
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Full Memo
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Section Scores */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section Scores */}
            <section className="bg-card/50 border border-border/50 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6">Section Scores</h2>
              <div className="space-y-4">
                {Object.entries(startup.sectionScores).map(([section, score]) => (
                  <div key={section} className="flex items-center gap-4">
                    <div className="w-28 text-sm font-medium">
                      {sectionLabels[section] || section}
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", getScoreBg(score))}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                    <div className={cn("w-12 text-right font-bold", getScoreColor(score))}>
                      {score}
                    </div>
                    <div className="w-20 text-xs text-muted-foreground">
                      {getScoreLabel(score)}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Founders */}
            <section className="bg-card/50 border border-border/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Founding Team</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {startup.founders.map((founder, index) => (
                  <div key={index} className="p-4 border border-border/30 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                        {founder.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <h3 className="font-semibold">{founder.name}</h3>
                        <p className="text-sm text-primary">{founder.role}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{founder.background}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Priority Areas */}
            <section className="bg-card/50 border border-border/50 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6">Priority Improvement Areas</h2>
              <div className="space-y-4">
                {sortedSections.slice(0, 3).map(([section, score]) => (
                  <div key={section} className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{sectionLabels[section] || section}</h3>
                      <span className={cn("font-bold", getScoreColor(score))}>{score}/100</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {section === "businessModel" && "Unit economics need validation. Focus on LTV:CAC ratio and churn reduction."}
                      {section === "traction" && "Early traction metrics need strengthening. Prioritize revenue or strong engagement data."}
                      {section === "market" && "Market sizing methodology needs work. Build bottoms-up TAM with verifiable sources."}
                      {section === "competition" && "Competitive differentiation unclear. Define specific moats and positioning."}
                      {section === "solution" && "Solution defensibility is weak. Focus on technical moats or data advantages."}
                      {section === "problem" && "Pain point validation needs more evidence. Quantify the problem in dollars."}
                      {section === "team" && "Team gaps identified. Consider key hires or advisors to fill expertise gaps."}
                      {section === "vision" && "Vision and milestones need clarity. Align funding ask with achievable milestones."}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Mentor Briefing */}
          <div className="space-y-6">
            <MentorBriefingCard startup={startup} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default StartupDetail;
