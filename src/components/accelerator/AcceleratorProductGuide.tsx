/**
 * AcceleratorProductGuide - Multi-step product tour dialog
 * 
 * Walks the accelerator user through all the main features of the platform.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Briefcase,
  Layers,
  Users,
  BarChart3,
  Target,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Building2,
  Share2,
  Brain,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  description: string;
  features: string[];
  icon: any;
  color: string;
}

const steps: Step[] = [
  {
    id: 0,
    title: "Welcome to Your Ecosystem",
    description: "Your accelerator command center for portfolio oversight, pattern recognition, and data-informed startup support.",
    features: [
      "Manage unlimited cohorts and startups",
      "Real-time fundability analytics",
      "AI-powered recommendations",
      "Share-ready investor previews",
    ],
    icon: Building2,
    color: "from-primary/20 to-primary/5",
  },
  {
    id: 1,
    title: "Portfolio Overview",
    description: "Get a bird's-eye view of your entire portfolio with fundability distribution, cohort performance, and quick access to all startups.",
    features: [
      "Fundability score distribution chart",
      "Active cohorts at a glance",
      "Quick-view startup cards",
      "Demo Day countdown timer",
    ],
    icon: LayoutDashboard,
    color: "from-blue-500/20 to-blue-500/5",
  },
  {
    id: 2,
    title: "Startup Analysis",
    description: "Dive deep into each startup's investment readiness with 8-dimension scoring and AI recommendations.",
    features: [
      "8 investment dimensions analyzed",
      "Section-by-section improvement tips",
      "VC Quick Take summary",
      "Market intelligence access",
    ],
    icon: Target,
    color: "from-success/20 to-success/5",
  },
  {
    id: 3,
    title: "AI Recommendations",
    description: "Click on any section score to get AI-powered recommendations on how to help each startup improve.",
    features: [
      "Actionable improvement suggestions",
      "Benchmark comparisons",
      "Cached for instant access",
      "Tailored to each company",
    ],
    icon: Brain,
    color: "from-purple-500/20 to-purple-500/5",
  },
  {
    id: 4,
    title: "Cohort Management",
    description: "Organize startups into cohorts, track progress, and prepare for Demo Day.",
    features: [
      "Create unlimited cohorts",
      "Batch assignment tools",
      "Progress tracking",
      "Demo Day preparation",
    ],
    icon: Layers,
    color: "from-warning/20 to-warning/5",
  },
  {
    id: 5,
    title: "Investor Sharing",
    description: "Generate beautiful, shareable previews to introduce your startups to investors.",
    features: [
      "Public shareable links",
      "Professional presentation",
      "Key metrics highlighted",
      "One-click copy & share",
    ],
    icon: Share2,
    color: "from-pink-500/20 to-pink-500/5",
  },
];

interface AcceleratorProductGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void; // Callback to trigger product tour after guide
}

export function AcceleratorProductGuide({ open, onOpenChange, onComplete }: AcceleratorProductGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onOpenChange(false);
      setCurrentStep(0);
      // Trigger product tour after completing the guide
      if (onComplete) {
        setTimeout(() => onComplete(), 300);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setCurrentStep(0);
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg border-border bg-card/95 backdrop-blur-xl p-0 overflow-hidden">
        {/* Progress indicator */}
        <div className="flex gap-1 px-6 pt-6">
          {steps.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-300",
                i <= currentStep ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        <DialogHeader className="px-6 pt-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Sparkles className="w-3 h-3 text-primary" />
            <span>Step {currentStep + 1} of {steps.length}</span>
          </div>
          <DialogTitle className="text-xl">{step.title}</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Icon */}
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br",
                step.color
              )}>
                <Icon className="w-8 h-8 text-foreground" />
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6">{step.description}</p>

              {/* Features */}
              <div className="space-y-3">
                {step.features.map((feature, i) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              size="sm"
              className="gap-2"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Get Started
                  <CheckCircle2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
