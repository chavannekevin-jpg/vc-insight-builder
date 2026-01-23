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
  CheckCircle2,
  Euro,
  TrendingUp
} from "lucide-react";

interface DemoWelcomeModalProps {
  open: boolean;
  onComplete: () => void;
}

const DEMO_WELCOME_KEY = "demo_welcome_completed";

// Value breakdown data
const VALUE_BREAKDOWN = [
  { label: "Investment Audit (8 dimensions)", value: "€2,500" },
  { label: "23+ Diagnostic Tools Suite", value: "€2,000" },
  { label: "Investor Database + Matching", value: "€1,500" },
  { label: "Market Intelligence Briefing", value: "€1,200" },
  { label: "Outreach Generation", value: "€800" },
  { label: "VC Q&A Simulation", value: "€500" },
];

const TOTAL_VALUE = "€8,500+";

export function DemoWelcomeModal({ open, onComplete }: DemoWelcomeModalProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: Euro,
      title: "€8,500+ in Consultant Value",
      subtitle: "What you'd pay for equivalent services",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            {VALUE_BREAKDOWN.map((item, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/30 backdrop-blur-sm"
              >
                <span className="text-sm text-foreground/80">{item.label}</span>
                <span className="text-sm font-semibold text-green-400">{item.value}</span>
              </div>
            ))}
          </div>
          
          <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="font-semibold text-foreground">Total Consultant Value</span>
              </div>
              <span className="text-xl font-bold text-green-400">{TOTAL_VALUE}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Yours for just <span className="text-primary font-semibold">€100</span>
            </p>
          </div>
        </div>
      )
    },
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
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 backdrop-blur-sm">
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
              icon={<CheckCircle2 className="w-4 h-4 text-green-400" />}
              text="8-dimension scorecard with VC benchmarks"
            />
            <FeatureRow 
              icon={<CheckCircle2 className="w-4 h-4 text-green-400" />}
              text="Investment thesis & IC meeting simulation"
            />
            <FeatureRow 
              icon={<CheckCircle2 className="w-4 h-4 text-green-400" />}
              text="Red flags surfaced before you raise"
            />
            <FeatureRow 
              icon={<CheckCircle2 className="w-4 h-4 text-green-400" />}
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
            <ToolCard icon={<Wrench className="w-4 h-4" />} label="23+ Diagnostic Tools" value="€2,000" />
            <ToolCard icon={<Telescope className="w-4 h-4" />} label="Market Lens" value="€1,200" />
            <ToolCard icon={<Users className="w-4 h-4" />} label="800+ Investors" value="€1,500" />
            <ToolCard icon={<Sparkles className="w-4 h-4" />} label="Outreach Lab" value="€800" />
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
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${
              step === 0 
                ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-green-500/20' 
                : 'bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20'
            }`}>
              <Icon className={`w-8 h-8 ${step === 0 ? 'text-green-400' : 'text-primary'}`} />
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h2 className={`text-xl font-bold mb-1 ${step === 0 ? 'text-green-400' : 'text-foreground'}`}>
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
    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/30 backdrop-blur-sm">
      {icon}
      <span className="text-sm text-foreground">{text}</span>
    </div>
  );
}

function ToolCard({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-muted/20 border border-border/30 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className="text-primary">{icon}</div>
        <span className="text-xs font-medium text-foreground">{label}</span>
      </div>
      {value && <span className="text-xs text-green-400 font-bold">{value}</span>}
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
