import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  FileSearch, 
  Wrench, 
  Telescope, 
  Users, 
  ChevronRight,
  Building2,
  CheckCircle2
} from "lucide-react";

interface DemoWelcomeModalProps {
  open: boolean;
  onComplete: () => void;
}

const DEMO_WELCOME_KEY = "demo_welcome_completed";

export function DemoWelcomeModal({ open, onComplete }: DemoWelcomeModalProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: Building2,
      title: "Welcome to the Demo Environment",
      subtitle: "Experience the full platform through a fictional company",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            You're about to explore <span className="text-primary font-semibold">SignalFlow</span>, 
            a fictional B2B SaaS company we've created to showcase exactly what you'll get when 
            you run your own investment audit.
          </p>
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
            <p className="text-sm text-foreground/80">
              <span className="font-semibold text-primary">SignalFlow</span> is an AI-powered 
              revenue intelligence platform at Seed stage with €32K MRR. Everything you see 
              was generated from their questionnaire responses.
            </p>
          </div>
        </div>
      )
    },
    {
      icon: FileSearch,
      title: "Your Investment Audit",
      subtitle: "See exactly what VCs see when evaluating a startup",
      content: (
        <div className="space-y-4">
          <div className="grid gap-3">
            <FeatureRow 
              icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
              text="8-dimension scorecard with VC benchmarks"
            />
            <FeatureRow 
              icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
              text="Investment thesis & IC meeting simulation"
            />
            <FeatureRow 
              icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
              text="Red flags surfaced before you raise"
            />
            <FeatureRow 
              icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
              text="Prioritized action plan to strengthen your case"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Click on any section card to dive into the full analysis with VC framing.
          </p>
        </div>
      )
    },
    {
      icon: Wrench,
      title: "Strategic Tools & Intelligence",
      subtitle: "More than a report—a complete founder ecosystem",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <ToolCard icon={<Wrench className="w-4 h-4" />} label="23+ Diagnostic Tools" />
            <ToolCard icon={<Telescope className="w-4 h-4" />} label="Market Lens" />
            <ToolCard icon={<Users className="w-4 h-4" />} label="800+ Investors" />
            <ToolCard icon={<Sparkles className="w-4 h-4" />} label="Outreach Lab" />
          </div>
          <p className="text-sm text-muted-foreground">
            Every tool is pre-populated with SignalFlow's data. Explore TAM calculators, 
            competitor matrices, 90-day action plans, and more.
          </p>
        </div>
      )
    }
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;
  const isLastStep = step === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      localStorage.setItem(DEMO_WELCOME_KEY, "true");
      onComplete();
    } else {
      setStep(step + 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 bg-card border-border overflow-hidden [&>button]:hidden">
        {/* Header with gradient */}
        <div className="relative px-6 pt-8 pb-6 bg-gradient-to-b from-primary/10 to-transparent">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          
          {/* Step indicator */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, i) => (
              <div 
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step 
                    ? 'w-8 bg-primary' 
                    : i < step 
                      ? 'w-4 bg-primary/50' 
                      : 'w-4 bg-muted'
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
            <h2 className="text-xl font-bold text-foreground mb-1">{currentStep.title}</h2>
            <p className="text-sm text-muted-foreground">{currentStep.subtitle}</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {currentStep.content}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2">
          <Button 
            onClick={handleNext}
            className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-xl font-semibold"
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
          
          {!isLastStep && (
            <button 
              onClick={() => {
                localStorage.setItem(DEMO_WELCOME_KEY, "true");
                onComplete();
              }}
              className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip introduction
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FeatureRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
      {icon}
      <span className="text-sm text-foreground">{text}</span>
    </div>
  );
}

function ToolCard({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
      <div className="text-primary">{icon}</div>
      <span className="text-xs font-medium text-foreground">{label}</span>
    </div>
  );
}

// Hook to manage demo welcome state
export function useDemoWelcome() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const hasCompleted = localStorage.getItem(DEMO_WELCOME_KEY) === "true";
    setShowWelcome(!hasCompleted);
    setIsChecked(true);
  }, []);

  const completeWelcome = () => {
    setShowWelcome(false);
  };

  const resetWelcome = () => {
    localStorage.removeItem(DEMO_WELCOME_KEY);
    setShowWelcome(true);
  };

  return { showWelcome, isChecked, completeWelcome, resetWelcome };
}
