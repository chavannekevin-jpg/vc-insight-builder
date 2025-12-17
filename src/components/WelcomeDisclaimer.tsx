import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  Target, 
  Brain,
  TrendingUp,
  Zap,
  BarChart3,
  Lightbulb,
  MousePointer
} from "lucide-react";

interface WelcomeDisclaimerProps {
  open: boolean;
  onComplete: () => void;
}

const SCREENS = [
  {
    badge: "Before You Begin",
    type: "intro",
  },
  {
    badge: "The Method",
    type: "methodology",
  },
  {
    badge: "Your AI Guide",
    type: "kev",
  },
  {
    badge: "Let's Go",
    type: "ready",
  },
];

export function WelcomeDisclaimer({ open, onComplete }: WelcomeDisclaimerProps) {
  const [currentScreen, setCurrentScreen] = useState(0);

  const handleNext = () => {
    if (currentScreen < SCREENS.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const renderScreen = () => {
    switch (SCREENS[currentScreen].type) {
      case "intro":
        return (
          <div className="space-y-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Before You Begin</span>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                You're About to Get Your{" "}
                <span className="text-primary neon-pink">VC Analysis</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                This isn't a template. It's the exact framework I use after reviewing{" "}
                <span className="text-foreground font-semibold">thousands of pitches</span> over a decade in VC.
              </p>
            </div>

            <div className="flex items-center justify-center gap-8 py-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">10+</div>
                <div className="text-xs text-muted-foreground">Years</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">1000s</div>
                <div className="text-xs text-muted-foreground">Cases Reviewed</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">Dozens</div>
                <div className="text-xs text-muted-foreground">Invested</div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 max-w-md mx-auto">
              <p className="text-sm italic text-foreground">
                "Most founders <span className="font-semibold">guess</span> what VCs want.{" "}
                <span className="text-primary font-bold">You're about to know.</span>"
              </p>
            </div>
          </div>
        );

      case "methodology":
        return (
          <div className="space-y-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 border border-secondary/30">
              <Target className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">The Method</span>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                Built on <span className="text-secondary">Thousands of Cases</span>.
                <br />Not Guesswork.
              </h2>
            </div>

            <div className="grid gap-4 text-left max-w-md mx-auto">
              {[
                { icon: Target, text: "Each question maps to what VCs actually evaluate" },
                { icon: Brain, text: "Your answers feed prompts refined over 1,000+ reviews" },
                { icon: TrendingUp, text: "Output mirrors real investment committee analyses" },
                { icon: BarChart3, text: "Data quality matters—more detail = better analysis" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <item.icon className="w-5 h-5 text-success mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-lg bg-warning/10 border border-warning/30 max-w-md mx-auto">
              <p className="text-sm text-foreground">
                <span className="font-bold text-warning">⚠️ Warning:</span>{" "}
                Generic answers = generic analysis.{" "}
                <span className="font-semibold">Be specific. Include numbers. Name names.</span>
              </p>
            </div>
          </div>
        );

      case "kev":
        return (
          <div className="space-y-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Your AI Guide</span>
            </div>

            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-glow">
                <span className="text-3xl font-bold text-background">K</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Meet <span className="text-primary neon-pink">Kev</span> ✨
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                As you answer each question, Kev analyzes your response and flags what's missing.
                He's trained on what VCs look for—so when he suggests something,{" "}
                <span className="text-foreground font-semibold">trust him</span>.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              {[
                { icon: BarChart3, label: "Real-time quality scoring", color: "text-primary" },
                { icon: Lightbulb, label: "VC-based suggestions", color: "text-secondary" },
                { icon: Zap, label: "One-click improvements", color: "text-accent" },
                { icon: Target, label: "Tracks missing elements", color: "text-success" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 text-left">
                  <item.icon className={`w-4 h-4 ${item.color} shrink-0`} />
                  <span className="text-xs text-foreground">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-lg bg-success/10 border border-success/30 max-w-md mx-auto">
              <p className="text-sm text-foreground">
                <span className="font-bold text-success">💡 Pro Tip:</span>{" "}
                When Kev suggests something, it's because VCs will ask for it.
                Better in the analysis than scrambling during due diligence.
              </p>
            </div>
          </div>
        );

      case "ready":
        return (
          <div className="space-y-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/20 border border-success/30">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm font-medium text-success">Ready to Start</span>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                Ready to Think Like an{" "}
                <span className="text-primary neon-pink">Investor</span>?
              </h2>
            </div>

            <div className="space-y-3 text-left max-w-sm mx-auto">
              {[
                "Provide detailed, specific answers",
                "Include real numbers and metrics",
                "Follow Kev's suggestions",
                "Don't rush—quality > speed",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>

            <Button 
              onClick={handleNext}
              size="lg"
              className="w-full max-w-sm mx-auto text-lg font-semibold shadow-glow hover:shadow-glow-strong transition-all"
            >
              Let's Get Your Analysis
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-xs text-muted-foreground">
              You can always edit your answers later.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-lg p-8 bg-card border-border overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="min-h-[480px] flex flex-col">
          <div className="flex-1 flex items-center justify-center py-4">
            {renderScreen()}
          </div>

          <div className="pt-6 border-t border-border/50 space-y-4">
            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2">
              {SCREENS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentScreen(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentScreen 
                      ? "w-6 bg-primary" 
                      : i < currentScreen 
                        ? "bg-primary/50" 
                        : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleSkip}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip intro
              </button>
              
              {currentScreen < SCREENS.length - 1 && (
                <Button onClick={handleNext} variant="ghost" className="gap-2">
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
