import { useState, useEffect } from "react";
import { Sparkles, Brain, FileText, CheckCircle2, TrendingUp, Target, Users, Briefcase, Rocket } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface MemoLoadingScreenProps {
  analyzing?: boolean;
  progressMessage?: string;
}

const loadingSteps = [
  { icon: Brain, label: "Analyzing your company data", minTime: 0 },
  { icon: Target, label: "Extracting market context", minTime: 8 },
  { icon: FileText, label: "Generating Problem section", minTime: 15 },
  { icon: Sparkles, label: "Generating Solution section", minTime: 25 },
  { icon: TrendingUp, label: "Analyzing market opportunity", minTime: 35 },
  { icon: Users, label: "Evaluating team & traction", minTime: 50 },
  { icon: Briefcase, label: "Assessing business model", minTime: 65 },
  { icon: Rocket, label: "Synthesizing investment thesis", minTime: 80 },
  { icon: CheckCircle2, label: "Finalizing your memo", minTime: 90 },
];

const funFacts = [
  "VCs typically spend less than 3 minutes reviewing a memo before deciding to dig deeper",
  "The best investment memos tell a story, not just present facts",
  "Most successful startups pivot at least once before finding product-market fit",
  "A clear problem statement is the foundation of any great pitch",
  "VCs look for 10x potential - your memo should demonstrate exactly how",
  "The team section is often what separates funded from unfunded startups",
  "Market timing can be just as important as the idea itself",
  "Good memos answer questions before they're asked",
];

export function MemoLoadingScreen({ analyzing = false }: MemoLoadingScreenProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [funFact, setFunFact] = useState(() => 
    funFacts[Math.floor(Math.random() * funFacts.length)]
  );

  // Estimate total time (90-100 seconds based on logs)
  const estimatedTotalTime = 95;
  const progressPercent = Math.min((elapsedTime / estimatedTotalTime) * 100, 98);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update current step based on elapsed time
  useEffect(() => {
    const step = loadingSteps.findIndex((s, i) => {
      const nextStep = loadingSteps[i + 1];
      if (!nextStep) return true;
      return elapsedTime >= s.minTime && elapsedTime < nextStep.minTime;
    });
    if (step >= 0) setCurrentStep(step);
  }, [elapsedTime]);

  // Rotate fun facts every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFunFact(funFacts[Math.floor(Math.random() * funFacts.length)]);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = loadingSteps[currentStep]?.icon || Sparkles;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        {/* Animated Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center">
              <CurrentIcon className="w-12 h-12 text-primary animate-pulse" />
            </div>
            {/* Orbiting sparkles */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
              <Sparkles className="w-4 h-4 text-primary/60 absolute -top-2 left-1/2 -translate-x-1/2" />
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }}>
              <Sparkles className="w-3 h-3 text-primary/40 absolute top-1/2 -right-2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-display font-bold text-foreground">
            {analyzing ? "Analyzing Your Data" : "Generating Your Investment Memo"}
          </h2>
          <p className="text-muted-foreground">
            This typically takes 60-90 seconds
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <Progress value={progressPercent} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{Math.round(progressPercent)}% complete</span>
            <span>{elapsedTime}s elapsed</span>
          </div>
        </div>

        {/* Current Step */}
        <div className="bg-card/50 border border-border/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <CurrentIcon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {loadingSteps[currentStep]?.label || "Processing..."}
              </p>
              <p className="text-xs text-muted-foreground">
                Step {currentStep + 1} of {loadingSteps.length}
              </p>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-2">
          {loadingSteps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            
            return (
              <div
                key={index}
                className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                  isCompleted ? "text-muted-foreground" : 
                  isCurrent ? "text-foreground" : 
                  "text-muted-foreground/50"
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  isCompleted ? "bg-primary/20 text-primary" :
                  isCurrent ? "bg-primary text-primary-foreground" :
                  "bg-muted text-muted-foreground/50"
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <StepIcon className="w-3 h-3" />
                  )}
                </div>
                <span className={isCurrent ? "font-medium" : ""}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Fun Fact */}
        <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <p className="text-xs text-muted-foreground mb-1">💡 Did you know?</p>
          <p className="text-sm text-foreground italic">"{funFact}"</p>
        </div>

        {/* Reassurance message after 60 seconds */}
        {elapsedTime > 60 && (
          <div className="text-center text-sm text-muted-foreground animate-fade-in">
            <p>Still working! Complex AI analysis takes time. Almost there...</p>
          </div>
        )}
      </div>
    </div>
  );
}