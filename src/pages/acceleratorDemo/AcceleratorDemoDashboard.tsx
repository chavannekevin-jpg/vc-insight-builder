import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  ArrowRight, 
  Calendar, 
  Target, 
  TrendingUp,
  Users,
  Lightbulb,
  ChevronRight,
  FileText,
  BarChart3,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductTourSpotlight } from "@/components/tour/ProductTourSpotlight";
import { AcceleratorDemoSidebar } from "@/components/acceleratorDemo/AcceleratorDemoSidebar";
import { AcceleratorDemoEntranceAnimation, useAcceleratorDemoEntrance } from "@/components/acceleratorDemo/AcceleratorDemoEntranceAnimation";
import { AcceleratorDemoWelcomeModal, useAcceleratorDemoWelcome } from "@/components/acceleratorDemo/AcceleratorDemoWelcomeModal";
import { useAcceleratorDemoProductTour } from "@/hooks/useAcceleratorDemoProductTour";
import { DemoModeBanner } from "@/components/acceleratorDemo/DemoModeBanner";
import { StartupCard } from "@/components/acceleratorDemo/StartupCard";
import { DEMO_ACCELERATOR } from "@/data/acceleratorDemo/acceleratorProfile";
import { DEMO_STARTUPS, getStartupsByStatus, getCohortStats } from "@/data/acceleratorDemo/demoStartups";

const AcceleratorDemoDashboard = () => {
  const navigate = useNavigate();
  const { showEntrance, isChecked: entranceChecked, completeEntrance } = useAcceleratorDemoEntrance();
  const { showWelcome, isChecked: welcomeChecked, completeWelcome, resetWelcome } = useAcceleratorDemoWelcome();
  const tour = useAcceleratorDemoProductTour();

  const atRiskStartups = getStartupsByStatus("at-risk");
  const demoReadyStartups = getStartupsByStatus("demo-ready");
  const needsWorkStartups = getStartupsByStatus("needs-work");
  const cohortStats = getCohortStats();

  // Priority interventions - startups that need immediate attention
  const priorityInterventions = [...atRiskStartups, ...needsWorkStartups]
    .sort((a, b) => a.fundabilityScore - b.fundabilityScore)
    .slice(0, 3);

  // Start tour after welcome modal completes (and entrance animation is done)
  useEffect(() => {
    if (!showWelcome && welcomeChecked && !tour.hasCompletedTour && !showEntrance) {
      const timer = setTimeout(() => {
        tour.startTour();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showWelcome, welcomeChecked, tour.hasCompletedTour, showEntrance]);

  const handleRestartTour = () => {
    resetWelcome();
  };

  // Show entrance animation first
  if (!entranceChecked) {
    return null;
  }

  if (showEntrance) {
    return <AcceleratorDemoEntranceAnimation onComplete={completeEntrance} />;
  }

  const getStatusColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 70) return "text-primary";
    if (score >= 50) return "text-warning";
    return "text-destructive";
  };

  const getStatusBg = (score: number) => {
    if (score >= 80) return "bg-success/10 border-success/20";
    if (score >= 70) return "bg-primary/10 border-primary/20";
    if (score >= 50) return "bg-warning/10 border-warning/20";
    return "bg-destructive/10 border-destructive/20";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at center, hsl(var(--primary) / 0.03) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)",
          }}
          animate={{
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, hsl(var(--secondary) / 0.2) 0%, transparent 70%)",
          }}
          animate={{
            x: [0, -30, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Sidebar */}
      <AcceleratorDemoSidebar onRestartTour={handleRestartTour} />

      {/* Welcome Modal */}
      {welcomeChecked && <AcceleratorDemoWelcomeModal open={showWelcome} onComplete={completeWelcome} />}

      {/* Product Tour */}
      <ProductTourSpotlight
        isActive={tour.isActive}
        currentStep={tour.currentStep}
        currentStepIndex={tour.currentStepIndex}
        totalSteps={tour.totalSteps}
        onNext={tour.nextStep}
        onPrev={tour.prevStep}
        onSkip={tour.skipTour}
      />

      {/* Main Content */}
      <div className="ml-64 min-h-screen relative">
        <DemoModeBanner />

        <main className="max-w-6xl mx-auto px-6 py-8">
          {/* Welcome Section */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {DEMO_ACCELERATOR.programManager.name.split(" ")[0]}
            </h1>
            <p className="text-muted-foreground">
              Week {DEMO_ACCELERATOR.currentWeek} of {DEMO_ACCELERATOR.programLength} • Demo Day: {DEMO_ACCELERATOR.demoDay}
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div 
            id="cohort-stats"
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="p-4 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Total Startups</span>
              </div>
              <p className="text-2xl font-bold">{cohortStats.totalStartups}</p>
            </div>
            <div className="p-4 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Avg Score</span>
              </div>
              <p className={`text-2xl font-bold ${getStatusColor(cohortStats.avgFundabilityScore)}`}>
                {cohortStats.avgFundabilityScore}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-success" />
                <span className="text-xs text-muted-foreground">Demo Ready</span>
              </div>
              <p className="text-2xl font-bold text-success">{cohortStats.demoReady}</p>
            </div>
            <div className="p-4 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-xs text-muted-foreground">Needs Attention</span>
              </div>
              <p className="text-2xl font-bold text-destructive">{cohortStats.needsWork + cohortStats.atRisk}</p>
            </div>
          </motion.div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Priority Interventions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Priority Interventions */}
              <motion.section
                id="priority-interventions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
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
                      className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-4 hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 
                              className="font-semibold text-foreground hover:text-primary cursor-pointer transition-colors"
                              onClick={() => navigate(`/accelerator-demo/startup/${startup.id}`)}
                            >
                              {startup.name}
                            </h3>
                            <span className={`text-sm font-bold ${getStatusColor(startup.fundabilityScore)}`}>
                              {startup.fundabilityScore}/100
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{startup.mentorFocus}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {startup.topConcerns.slice(0, 2).map((concern, i) => (
                              <span key={i} className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-lg">
                                {concern}
                              </span>
                            ))}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/accelerator-demo/startup/${startup.id}/memo`)}
                            className="h-7 px-3 text-xs border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                          >
                            <FileText className="w-3 h-3 mr-1.5" />
                            View Memo
                          </Button>
                        </div>
                        <ArrowRight 
                          className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors" 
                          onClick={() => navigate(`/accelerator-demo/startup/${startup.id}`)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>

              {/* Demo Day Ready */}
              <motion.section
                id="demo-ready-startups"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
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
              </motion.section>
            </div>

            {/* Right Column - Insights & Actions */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {/* Quick Actions */}
              <section 
                id="quick-actions"
                className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-5"
              >
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
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
              <section className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Cohort Insights
                </h3>
                <div className="space-y-4">
                  <div className="p-3 bg-primary/5 rounded-xl border border-primary/20">
                    <p className="text-sm font-medium text-primary mb-1">Strongest Section</p>
                    <p className="text-xs text-muted-foreground">
                      Team scores are highest across the cohort (avg 81/100). Founders have strong backgrounds.
                    </p>
                  </div>
                  <div className="p-3 bg-warning/5 rounded-xl border border-warning/20">
                    <p className="text-sm font-medium text-warning mb-1">Common Weakness</p>
                    <p className="text-xs text-muted-foreground">
                      Business Model clarity is the weakest area (avg 64/100). Consider a unit economics workshop.
                    </p>
                  </div>
                  <div className="p-3 bg-success/5 rounded-xl border border-success/20">
                    <p className="text-sm font-medium text-success mb-1">Trending Up</p>
                    <p className="text-xs text-muted-foreground">
                      3 startups improved scores by 5+ points this week. FinBot leads with +6.
                    </p>
                  </div>
                </div>
              </section>

              {/* Upcoming */}
              <section className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-5">
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
                    <span className="font-medium">Week 8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Demo Day</span>
                    <span className="font-medium text-primary">{DEMO_ACCELERATOR.demoDay}</span>
                  </div>
                </div>
              </section>

              {/* CTA */}
              <section className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-5">
                <h3 className="font-semibold mb-2">Ready to try with your cohort?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get the same insights for your own accelerator.
                </p>
                <Button
                  className="w-full"
                  onClick={() => navigate("/accelerator/signup")}
                >
                  Create Your Ecosystem
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </section>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AcceleratorDemoDashboard;
