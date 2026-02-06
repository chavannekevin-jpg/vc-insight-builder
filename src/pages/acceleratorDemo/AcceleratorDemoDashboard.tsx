import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, Info, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

// Production components
import { AcceleratorSidebar } from "@/components/accelerator/AcceleratorSidebar";
import { AcceleratorOverview } from "@/components/accelerator/sections/AcceleratorOverview";
import { AcceleratorPortfolio } from "@/components/accelerator/sections/AcceleratorPortfolio";
import { AcceleratorCohortsView } from "@/components/accelerator/sections/AcceleratorCohortsView";
import { AcceleratorTeam } from "@/components/accelerator/sections/AcceleratorTeam";
import { AcceleratorInvites } from "@/components/accelerator/sections/AcceleratorInvites";
import { AcceleratorAnalyticsSection } from "@/components/accelerator/sections/AcceleratorAnalyticsSection";
import { AcceleratorSettings } from "@/components/accelerator/sections/AcceleratorSettings";

// Demo-specific components
import { AcceleratorDemoProvider, useAcceleratorDemo } from "@/contexts/AcceleratorDemoContext";
import { AcceleratorDemoWelcomeModal } from "@/components/acceleratorDemo/AcceleratorDemoWelcomeModal";
import { AcceleratorDemoEntranceAnimation, useAcceleratorDemoEntrance } from "@/components/acceleratorDemo/AcceleratorDemoEntranceAnimation";
import { ProductTourSpotlight } from "@/components/tour/ProductTourSpotlight";
import { useAcceleratorDemoProductTour } from "@/hooks/useAcceleratorDemoProductTour";

function AcceleratorDemoDashboardContent() {
  const navigate = useNavigate();
  const { accelerator, cohorts, companies, stats } = useAcceleratorDemo();
  
  const [activeSection, setActiveSection] = useState("overview");
  
  // Demo entrance and tour state
  const { showEntrance, isChecked: entranceChecked, completeEntrance } = useAcceleratorDemoEntrance();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const tour = useAcceleratorDemoProductTour();

  // After entrance animation completes, show welcome modal
  const handleEntranceComplete = () => {
    completeEntrance();
    setShowWelcomeModal(true);
  };

  // After welcome modal completes, start tour
  const handleWelcomeComplete = () => {
    setShowWelcomeModal(false);
    setTimeout(() => {
      tour.startTour();
    }, 500);
  };

  const handleRestartTour = () => {
    setShowWelcomeModal(true);
  };

  const handleViewStartup = (id: string) => {
    navigate(`/accelerator-demo/startup/${id}`);
  };

  const handleViewStartupFullPage = (id: string) => {
    navigate(`/accelerator-demo/startup/${id}`);
  };

  // No-op for demo mode (data is static)
  const handleRefresh = () => {};

  const renderContent = () => {
    switch (activeSection) {
      case "portfolio":
        return <AcceleratorPortfolio companies={companies} onViewStartup={handleViewStartup} isDemo />;
      case "cohorts":
        return <AcceleratorCohortsView cohorts={cohorts} acceleratorId={accelerator.id} onRefresh={handleRefresh} onViewStartup={handleViewStartupFullPage} isDemo />;
      case "team":
        return <AcceleratorTeam acceleratorId={accelerator.id} acceleratorName={accelerator.name} currentUserId="demo-user" isDemo />;
      case "invites":
        return <AcceleratorInvites acceleratorId={accelerator.id} acceleratorName={accelerator.name} acceleratorSlug={accelerator.slug} isDemo />;
      case "analytics":
        return <AcceleratorAnalyticsSection stats={stats} companies={companies} acceleratorId={accelerator.id} />;
      case "settings":
        return <AcceleratorSettings accelerator={accelerator} onUpdate={handleRefresh} isDemo />;
      default:
        return (
          <AcceleratorOverview
            accelerator={accelerator}
            stats={stats}
            recentCompanies={companies.slice(0, 5)}
            onNavigate={setActiveSection}
            onViewStartup={handleViewStartup}
            isDemo
          />
        );
    }
  };

  // Wait for entrance check
  if (!entranceChecked) {
    return null;
  }

  // Show entrance animation if needed
  if (showEntrance) {
    return <AcceleratorDemoEntranceAnimation onComplete={handleEntranceComplete} />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background relative overflow-hidden">
        {/* Ultra-premium animated background - matching production */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
          
          {/* Animated mesh orbs */}
          <motion.div
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-primary/8 via-primary/4 to-transparent blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -40, 0],
              y: [0, 30, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-1/3 -left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-secondary/6 via-secondary/3 to-transparent blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, 20, 0],
              y: [0, -30, 0],
              scale: [1, 1.08, 1],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            className="absolute -bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-accent/5 via-accent/2 to-transparent blur-3xl"
          />
          
          {/* Subtle grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
          
          {/* Top light wash */}
          <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent" />
        </div>

        {/* Production Sidebar with demo mode enabled */}
        <AcceleratorSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          accelerator={accelerator}
          onStartTour={tour.startTour}
          isDemo
          onRestartTour={handleRestartTour}
        />

        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          {/* Demo Mode Banner */}
          <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-b border-primary/20 px-4 py-2">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Info className="w-4 h-4 text-primary" />
                <span className="text-foreground">
                  <span className="font-semibold text-primary">Demo Mode</span> — You're viewing a fictional accelerator cohort.
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/accelerator/signup")}
                className="text-primary hover:text-primary hover:bg-primary/10 gap-1"
              >
                Apply to your cohort
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Premium glass header */}
          <motion.header 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="h-16 border-b border-white/[0.06] flex items-center justify-between px-6 sticky top-0 z-40 bg-card/40 backdrop-blur-2xl"
          >
            <div className="flex items-center gap-4">
              <SidebarTrigger className="p-2 -ml-2 rounded-lg hover:bg-white/[0.04] transition-colors">
                <Menu className="w-5 h-5 text-muted-foreground" />
              </SidebarTrigger>
              <div className="h-6 w-px bg-white/[0.06]" />
              <div>
                <h1 className="text-sm font-semibold text-foreground">
                  {accelerator.name}
                </h1>
                <p className="text-xs text-muted-foreground/70">Ecosystem Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors relative group">
                <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
              </button>
            </div>
          </motion.header>

          <main className="flex-1 overflow-auto">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {renderContent()}
            </motion.div>
          </main>
        </div>

        {/* Welcome Modal */}
        <AcceleratorDemoWelcomeModal 
          open={showWelcomeModal} 
          onComplete={handleWelcomeComplete} 
        />

        {/* Product Tour Spotlight */}
        <ProductTourSpotlight
          isActive={tour.isActive}
          currentStep={tour.currentStep}
          currentStepIndex={tour.currentStepIndex}
          totalSteps={tour.totalSteps}
          onNext={tour.nextStep}
          onPrev={tour.prevStep}
          onSkip={tour.skipTour}
        />
      </div>
    </SidebarProvider>
  );
}

export default function AcceleratorDemoDashboard() {
  return (
    <AcceleratorDemoProvider>
      <AcceleratorDemoDashboardContent />
    </AcceleratorDemoProvider>
  );
}
