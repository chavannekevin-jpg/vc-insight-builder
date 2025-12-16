import { DemoModeBanner } from "@/components/acceleratorDemo/DemoModeBanner";
import { AcceleratorDemoHeader } from "@/components/acceleratorDemo/AcceleratorDemoHeader";
import { CohortStatsBar } from "@/components/acceleratorDemo/CohortStatsBar";
import { StartupCard } from "@/components/acceleratorDemo/StartupCard";
import { DEMO_ACCELERATOR } from "@/data/acceleratorDemo/acceleratorProfile";
import { DEMO_STARTUPS, getStartupsByStatus } from "@/data/acceleratorDemo/demoStartups";
import { useNavigate } from "react-router-dom";
import { 
  AlertTriangle, 
  ArrowRight, 
  Calendar, 
  Target, 
  TrendingUp,
  Users,
  Lightbulb,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const AcceleratorDemoDashboard = () => {
  const navigate = useNavigate();
  const atRiskStartups = getStartupsByStatus("at-risk");
  const demoReadyStartups = getStartupsByStatus("demo-ready");
  const needsWorkStartups = getStartupsByStatus("needs-work");

  // Priority interventions - startups that need immediate attention
  const priorityInterventions = [...atRiskStartups, ...needsWorkStartups]
    .sort((a, b) => a.fundabilityScore - b.fundabilityScore)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <DemoModeBanner />
      <AcceleratorDemoHeader />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {DEMO_ACCELERATOR.programManager.name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground">
            Week {DEMO_ACCELERATOR.currentWeek} of {DEMO_ACCELERATOR.programLength} • Demo Day: {DEMO_ACCELERATOR.demoDay}
          </p>
        </div>

        {/* Stats Bar */}
        <div className="mb-8">
          <CohortStatsBar />
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Priority Interventions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Priority Interventions */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <h2 className="text-xl font-semibold">Priority Interventions</h2>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/accelerator-demo/cohort")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  View all <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="space-y-3">
                {priorityInterventions.map((startup) => (
                  <div
                    key={startup.id}
                    onClick={() => navigate(`/accelerator-demo/startup/${startup.id}`)}
                    className="bg-card/50 border border-border/50 rounded-xl p-4 cursor-pointer hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{startup.name}</h3>
                          <span className={`text-sm font-bold ${startup.fundabilityScore < 50 ? "text-destructive" : "text-warning"}`}>
                            {startup.fundabilityScore}/100
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{startup.mentorFocus}</p>
                        <div className="flex flex-wrap gap-2">
                          {startup.topConcerns.slice(0, 2).map((concern, i) => (
                            <span key={i} className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">
                              {concern}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Demo Day Ready */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-success" />
                  <h2 className="text-xl font-semibold">Demo Day Ready</h2>
                </div>
                <span className="text-sm text-muted-foreground">{demoReadyStartups.length} startups</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {demoReadyStartups.slice(0, 4).map((startup) => (
                  <StartupCard key={startup.id} startup={startup} />
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Insights & Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <section className="bg-card/50 border border-border/50 rounded-xl p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/accelerator-demo/cohort")}
                >
                  <Users className="w-4 h-4 mr-2" />
                  View Full Cohort
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/accelerator-demo/analytics")}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Cohort Analytics
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/accelerator-demo/compare")}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Compare Startups
                </Button>
              </div>
            </section>

            {/* Cohort Insights */}
            <section className="bg-card/50 border border-border/50 rounded-xl p-5">
              <h3 className="font-semibold mb-4">Cohort Insights</h3>
              <div className="space-y-4">
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium text-primary mb-1">Strongest Section</p>
                  <p className="text-xs text-muted-foreground">
                    Team scores are highest across the cohort (avg 81/100). Founders have strong backgrounds.
                  </p>
                </div>
                <div className="p-3 bg-warning/5 rounded-lg border border-warning/20">
                  <p className="text-sm font-medium text-warning mb-1">Common Weakness</p>
                  <p className="text-xs text-muted-foreground">
                    Business Model clarity is the weakest area (avg 64/100). Consider a unit economics workshop.
                  </p>
                </div>
                <div className="p-3 bg-success/5 rounded-lg border border-success/20">
                  <p className="text-sm font-medium text-success mb-1">Trending Up</p>
                  <p className="text-xs text-muted-foreground">
                    3 startups improved scores by 5+ points this week. FinBot leads with +6.
                  </p>
                </div>
              </div>
            </section>

            {/* Upcoming */}
            <section className="bg-card/50 border border-border/50 rounded-xl p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Upcoming
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Mentor Sessions</span>
                  <span className="font-medium">Tomorrow</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Pitch Practice</span>
                  <span className="font-medium">Week 6</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Demo Day</span>
                  <span className="font-medium text-primary">{DEMO_ACCELERATOR.demoDay}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AcceleratorDemoDashboard;
