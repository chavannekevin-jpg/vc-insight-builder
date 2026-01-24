import { useParams, useNavigate } from "react-router-dom";
import { AcceleratorDemoLayout } from "@/components/acceleratorDemo/AcceleratorDemoLayout";
import { getStartupById } from "@/data/acceleratorDemo/demoStartups";
import { getDemoMemo } from "@/data/acceleratorDemo/demoMemos";
import { Button } from "@/components/ui/button";
import { MemoVCQuickTake } from "@/components/memo/MemoVCQuickTake";
import { 
  ArrowLeft, 
  FileText, 
  Target,
  Lightbulb,
  Users,
  TrendingUp,
  Shield,
  DollarSign,
  BarChart3,
  Rocket,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const sectionIcons: Record<string, any> = {
  Problem: Target,
  Solution: Lightbulb,
  Market: TrendingUp,
  Competition: Shield,
  Team: Users,
  "Business Model": DollarSign,
  Traction: BarChart3,
  Vision: Rocket
};

const getScoreColor = (score: number) => {
  if (score >= 75) return "text-emerald-400";
  if (score >= 60) return "text-primary";
  if (score >= 45) return "text-amber-400";
  return "text-rose-400";
};

const StartupMemo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const startup = getStartupById(id || "");
  const memoData = getDemoMemo(id || "");

  if (!startup || !memoData) {
    return (
      <AcceleratorDemoLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-xl font-bold mb-2">Memo not found</h1>
            <Button onClick={() => navigate("/accelerator-demo/cohort")}>
              Back to Portfolio
            </Button>
          </div>
        </div>
      </AcceleratorDemoLayout>
    );
  }

  const sectionScoreMap: Record<string, number> = {
    Problem: startup.sectionScores.problem,
    Solution: startup.sectionScores.solution,
    Market: startup.sectionScores.market,
    Competition: startup.sectionScores.competition,
    Team: startup.sectionScores.team,
    "Business Model": startup.sectionScores.businessModel,
    Traction: startup.sectionScores.traction,
    Vision: startup.sectionScores.vision
  };

  return (
    <AcceleratorDemoLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/accelerator-demo/startup/${startup.id}`)}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {startup.name}
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{startup.name} Investment Memo</h1>
              <p className="text-sm text-muted-foreground">{startup.tagline}</p>
            </div>
          </div>

          {/* Hero Statement */}
          <div className="p-5 bg-primary/5 border border-primary/20 rounded-xl">
            <p className="text-sm font-medium text-foreground leading-relaxed">
              {memoData.heroStatement}
            </p>
          </div>
        </div>

        {/* VC Quick Take */}
        <section className="mb-10">
          <MemoVCQuickTake quickTake={memoData.vcQuickTake} showTeaser={false} />
        </section>

        {/* Section Navigation */}
        <nav className="mb-8 p-4 rounded-xl bg-card/40 backdrop-blur-xl border border-white/[0.06]">
          <h3 className="text-xs font-semibold text-muted-foreground mb-3">Jump to Section</h3>
          <div className="flex flex-wrap gap-2">
            {memoData.sections.map((section, index) => {
              const Icon = sectionIcons[section.title] || FileText;
              const score = sectionScoreMap[section.title];
              return (
                <button
                  key={index}
                  onClick={() => {
                    document.getElementById(`section-${index}`)?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] rounded-lg text-xs transition-colors"
                >
                  <Icon className="w-3 h-3" />
                  {section.title}
                  <span className={cn("font-bold", getScoreColor(score))}>
                    {score}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Sections */}
        <div className="space-y-10">
          {memoData.sections.map((section, index) => {
            const Icon = sectionIcons[section.title] || FileText;
            const score = sectionScoreMap[section.title];
            
            return (
              <section
                key={index}
                id={`section-${index}`}
                className="scroll-mt-24"
              >
                {/* Section Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <h2 className="text-lg font-bold">{section.title}</h2>
                  </div>
                  <div className={cn("text-xl font-bold", getScoreColor(score))}>
                    {score}<span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </div>

                {/* Section Content */}
                <div className="p-5 rounded-xl bg-card/40 backdrop-blur-xl border border-white/[0.06]">
                  <p className="text-sm text-foreground/90 leading-relaxed mb-5">
                    {section.narrative}
                  </p>

                  {/* Key Points */}
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2">Key Points</h4>
                    <ul className="space-y-1.5">
                      {section.keyPoints.map((point, pointIndex) => (
                        <li key={pointIndex} className="flex items-start gap-2 text-xs">
                          <ChevronRight className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                          <span className="text-foreground/80">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 text-center">
          <h3 className="text-base font-bold mb-2">Want this for your cohort?</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Get detailed fundability analysis for every startup in your accelerator.
          </p>
          <Button size="sm" onClick={() => navigate("/accelerator/signup")}>
            Create Your Ecosystem
            <ArrowRight className="w-3 h-3 ml-2" />
          </Button>
        </div>
      </div>
    </AcceleratorDemoLayout>
  );
};

export default StartupMemo;
