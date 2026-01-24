import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  ChevronRight,
  Building2,
  CheckCircle2,
  Users,
  BarChart3,
  Eye,
  Share2,
  Layers
} from "lucide-react";

interface AcceleratorDemoWelcomeModalProps {
  open: boolean;
  onComplete: () => void;
}

const ACCELERATOR_DEMO_WELCOME_KEY = "accelerator_demo_welcome_completed";

export function AcceleratorDemoWelcomeModal({ open, onComplete }: AcceleratorDemoWelcomeModalProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: Building2,
      title: "Welcome to Ugly Baby's Foundry",
      subtitle: "A fictional pre-seed accelerator demo",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            You're about to explore <span className="text-primary font-semibold">Ugly Baby's Foundry</span>, 
            a fictional accelerator we've created to showcase how the Accelerator Operating System works.
          </p>
          <div className="p-4 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20">
            <p className="text-sm text-foreground/80">
              <span className="font-semibold text-primary">10 startups</span> across FinTech, Climate Tech, and B2B SaaS. 
              Week 6 of 12. Demo Day in 6 weeks. Everything you see is what you'd get with your own cohort.
            </p>
          </div>
        </div>
      )
    },
    {
      icon: BarChart3,
      title: "Real-Time Portfolio Insights",
      subtitle: "See every startup's fundability at a glance",
      content: (
        <div className="space-y-4">
          <div className="grid gap-3">
            <FeatureRow 
              icon={<CheckCircle2 className="w-4 h-4 text-green-400" />}
              text="Cohort-wide fundability scores and trends"
            />
            <FeatureRow 
              icon={<CheckCircle2 className="w-4 h-4 text-green-400" />}
              text="Section-by-section heatmaps across your portfolio"
            />
            <FeatureRow 
              icon={<CheckCircle2 className="w-4 h-4 text-green-400" />}
              text="Priority interventions surfaced automatically"
            />
            <FeatureRow 
              icon={<CheckCircle2 className="w-4 h-4 text-green-400" />}
              text="Demo Day readiness tracking"
            />
          </div>
        </div>
      )
    },
    {
      icon: Eye,
      title: "Deep Dive Into Any Startup",
      subtitle: "Access the same reports founders see",
      content: (
        <div className="space-y-4">
          <div className="grid gap-3">
            <FeatureRow 
              icon={<Eye className="w-4 h-4 text-primary" />}
              text="Full 8-dimension scorecard with VC benchmarks"
            />
            <FeatureRow 
              icon={<Layers className="w-4 h-4 text-primary" />}
              text="23+ strategic tools (TAM calculators, action plans, etc.)"
            />
            <FeatureRow 
              icon={<Share2 className="w-4 h-4 text-primary" />}
              text="Shareable investor previews for each startup"
            />
            <FeatureRow 
              icon={<Users className="w-4 h-4 text-primary" />}
              text="Investor matching based on startup profile"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Click on any startup to see their complete analysis and tools.
          </p>
        </div>
      )
    },
    {
      icon: Users,
      title: "Explore the Full Platform",
      subtitle: "Everything is interactive—but read-only in demo mode",
      content: (
        <div className="space-y-4">
          <div className="grid gap-3">
            <FeatureRow 
              icon={<BarChart3 className="w-4 h-4 text-primary" />}
              text="Analytics — Cohort-wide patterns and section heatmaps"
            />
            <FeatureRow 
              icon={<Layers className="w-4 h-4 text-primary" />}
              text="Cohorts — Manage multiple batches and programs"
            />
            <FeatureRow 
              icon={<Users className="w-4 h-4 text-primary" />}
              text="Team — Invite mentors and program managers"
            />
            <FeatureRow 
              icon={<Share2 className="w-4 h-4 text-primary" />}
              text="Invites — Generate startup invite codes"
            />
          </div>
          <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Note:</span> This is a read-only demo. 
              To manage your own cohort, you'll need to create your ecosystem.
            </p>
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;
  const isLastStep = step === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      localStorage.setItem(ACCELERATOR_DEMO_WELCOME_KEY, "true");
      onComplete();
    } else {
      setStep(step + 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 bg-card/40 backdrop-blur-2xl border-border/50 overflow-hidden rounded-3xl shadow-2xl [&>button]:hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 -left-1/4 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-1/4 -right-1/4 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[80px]" />
        </div>
        
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-tl-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-secondary/10 to-transparent rounded-br-3xl pointer-events-none" />

        {/* Header with gradient */}
        <div className="relative px-6 pt-8 pb-6">
          {/* Top highlight line */}
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          
          {/* Step indicator */}
          <div className="flex justify-center gap-1.5 mb-6">
            {steps.map((_, i) => (
              <div 
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step 
                    ? 'w-10 bg-primary' 
                    : i < step 
                      ? 'w-4 bg-primary/50' 
                      : 'w-4 bg-border/50'
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
              <Icon className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground mb-1">
              {currentStep.title}
            </h2>
            <p className="text-sm text-muted-foreground">{currentStep.subtitle}</p>
          </div>
        </div>

        {/* Content */}
        <div className="relative px-6 py-4">
          {currentStep.content}
        </div>

        {/* Footer */}
        <div className="relative px-6 pb-6 pt-2">
          <Button 
            onClick={handleNext}
            className="w-full h-13 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground rounded-xl font-semibold text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            {isLastStep ? (
              <>
                Start Exploring
                <Sparkles className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FeatureRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30">
      {icon}
      <span className="text-sm text-foreground">{text}</span>
    </div>
  );
}

// Hook to manage accelerator demo welcome state
export function useAcceleratorDemoWelcome() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const hasCompletedWelcome = localStorage.getItem(ACCELERATOR_DEMO_WELCOME_KEY) === "true";
    setShowWelcome(!hasCompletedWelcome);
    setIsChecked(true);
  }, []);

  const completeWelcome = () => {
    setShowWelcome(false);
  };

  const resetWelcome = () => {
    localStorage.removeItem(ACCELERATOR_DEMO_WELCOME_KEY);
    setShowWelcome(true);
  };

  return { 
    showWelcome, 
    isChecked, 
    completeWelcome, 
    resetWelcome 
  };
}
