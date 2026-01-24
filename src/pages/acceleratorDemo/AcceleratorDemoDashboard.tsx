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
  Sparkles,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductTourSpotlight } from "@/components/tour/ProductTourSpotlight";
import { AcceleratorDemoLayout } from "@/components/acceleratorDemo/AcceleratorDemoLayout";
import { AcceleratorDemoEntranceAnimation, useAcceleratorDemoEntrance } from "@/components/acceleratorDemo/AcceleratorDemoEntranceAnimation";
import { AcceleratorDemoWelcomeModal, useAcceleratorDemoWelcome } from "@/components/acceleratorDemo/AcceleratorDemoWelcomeModal";
import { useAcceleratorDemoProductTour } from "@/hooks/useAcceleratorDemoProductTour";
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
  const onTrackStartups = getStartupsByStatus("on-track");
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
    if (score >= 80) return "text-emerald-400";
    if (score >= 70) return "text-primary";
    if (score >= 50) return "text-amber-400";
    return "text-rose-400";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "demo-ready":
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Ready</span>;
      case "on-track":
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">On Track</span>;
      case "needs-work":
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Needs Work</span>;
      case "at-risk":
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">At Risk</span>;
      default:
        return null;
    }
  };

  return (
    <AcceleratorDemoLayout onRestartTour={handleRestartTour}>
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

      <div className="p-6 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold mb-1">
            Welcome back, {DEMO_ACCELERATOR.programManager.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground">
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
          {[
            { icon: Users, label: "Total Startups", value: cohortStats.totalStartups, color: "text-primary" },
            { icon: BarChart3, label: "Avg Score", value: cohortStats.avgFundabilityScore, color: getStatusColor(cohortStats.avgFundabilityScore) },
            { icon: Target, label: "Demo Ready", value: cohortStats.demoReady, color: "text-emerald-400" },
            { icon: AlertTriangle, label: "Needs Attention", value: cohortStats.needsWork + cohortStats.atRisk, color: "text-rose-400" },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-2xl bg-card/40 backdrop-blur-xl border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Priority Interventions & Portfolio */}
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
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h2 className="text-lg font-semibold">Priority Interventions</h2>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/accelerator-demo/cohort")}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  View all <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
              <div className="space-y-3">
                {priorityInterventions.map((startup) => (
                  <div
                    key={startup.id}
                    className="group p-4 rounded-xl bg-card/40 backdrop-blur-xl border border-white/[0.06] hover:border-primary/30 transition-all cursor-pointer"
                    onClick={() => navigate(`/accelerator-demo/startup/${startup.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {startup.name}
                          </h3>
                          <span className={`text-sm font-bold ${getStatusColor(startup.fundabilityScore)}`}>
                            {startup.fundabilityScore}
                          </span>
                          {getStatusBadge(startup.status)}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{startup.tagline}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {startup.topConcerns.slice(0, 2).map((concern, i) => (
                            <span key={i} className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded">
                              {concern}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Demo Ready Startups */}
            <motion.section
              id="demo-ready-startups"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-lg font-semibold">Demo Day Ready</h2>
                </div>
                <span className="text-xs text-muted-foreground">{demoReadyStartups.length} startups</span>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {demoReadyStartups.slice(0, 4).map((startup) => (
                  <div
                    key={startup.id}
                    className="group p-4 rounded-xl bg-card/40 backdrop-blur-xl border border-white/[0.06] hover:border-emerald-500/30 transition-all cursor-pointer"
                    onClick={() => navigate(`/accelerator-demo/startup/${startup.id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{startup.name}</h3>
                      <span className={`text-sm font-bold ${getStatusColor(startup.fundabilityScore)}`}>
                        {startup.fundabilityScore}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{startup.tagline}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="px-1.5 py-0.5 rounded bg-muted/50">{startup.category}</span>
                      <span>{startup.stage}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Right Column - Quick Actions & Insights */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {/* Quick Actions */}
            <section 
              id="quick-actions"
              className="p-5 rounded-xl bg-card/40 backdrop-blur-xl border border-white/[0.06]"
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm">
                <Lightbulb className="w-4 h-4 text-primary" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-9 text-sm hover:bg-white/[0.04]"
                  onClick={() => navigate("/accelerator-demo/cohort")}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  View Full Portfolio
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-9 text-sm hover:bg-white/[0.04]"
                  onClick={() => navigate("/accelerator-demo/analytics")}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Cohort Analytics
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-9 text-sm hover:bg-white/[0.04]"
                  onClick={() => navigate("/accelerator-demo/compare")}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Compare Startups
                </Button>
              </div>
            </section>

            {/* Cohort Insights */}
            <section className="p-5 rounded-xl bg-card/40 backdrop-blur-xl border border-white/[0.06]">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                Cohort Insights
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-xs font-medium text-emerald-400 mb-0.5">Strongest Section</p>
                  <p className="text-[11px] text-muted-foreground">Team scores highest (avg 81/100)</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <p className="text-xs font-medium text-amber-400 mb-0.5">Common Weakness</p>
                  <p className="text-[11px] text-muted-foreground">Business Model clarity (avg 64/100)</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-xs font-medium text-primary mb-0.5">Trending Up</p>
                  <p className="text-[11px] text-muted-foreground">3 startups improved 5+ points</p>
                </div>
              </div>
            </section>

            {/* Upcoming */}
            <section className="p-5 rounded-xl bg-card/40 backdrop-blur-xl border border-white/[0.06]">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Upcoming
              </h3>
              <div className="space-y-2.5 text-xs">
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
            <section className="p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
              <h3 className="font-semibold mb-2 text-sm">Ready for your cohort?</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Get the same insights for your own accelerator.
              </p>
              <Button
                size="sm"
                className="w-full"
                onClick={() => navigate("/accelerator/signup")}
              >
                Create Your Ecosystem
                <ArrowRight className="w-3 h-3 ml-2" />
              </Button>
            </section>
          </motion.div>
        </div>
      </div>
    </AcceleratorDemoLayout>
  );
};

export default AcceleratorDemoDashboard;
