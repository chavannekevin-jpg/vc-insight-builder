import { useState, useEffect, useCallback } from "react";
import { Sparkles, Brain, FileText, CheckCircle2, TrendingUp, Target, Users, Briefcase, Rocket, Coffee, RefreshCw, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface MemoLoadingScreenProps {
  analyzing?: boolean;
  progressMessage?: string;
  companyId?: string;
  onMemoReady?: () => void;
  onCheckStatus?: () => void;
}

const loadingSteps = [
  { icon: Brain, label: "Analyzing your company data", minTime: 0 },
  { icon: Target, label: "Extracting market context", minTime: 30 },
  { icon: FileText, label: "Generating Problem section", minTime: 60 },
  { icon: Sparkles, label: "Generating Solution section", minTime: 100 },
  { icon: TrendingUp, label: "Analyzing market opportunity", minTime: 150 },
  { icon: Users, label: "Evaluating team & traction", minTime: 200 },
  { icon: Briefcase, label: "Assessing business model", minTime: 260 },
  { icon: Rocket, label: "Synthesizing investment thesis", minTime: 320 },
  { icon: CheckCircle2, label: "Finalizing your memo", minTime: 370 },
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
  "The average seed round takes 3-6 months to close",
  "Top VCs receive over 1,000 pitches per year but fund less than 1%",
];

export function MemoLoadingScreen({ 
  analyzing = false, 
  companyId,
  onMemoReady,
  onCheckStatus 
}: MemoLoadingScreenProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [funFact, setFunFact] = useState(() => 
    funFacts[Math.floor(Math.random() * funFacts.length)]
  );
  const [isCheckingDatabase, setIsCheckingDatabase] = useState(false);
  const [memoFound, setMemoFound] = useState(false);
  const [showManualCheck, setShowManualCheck] = useState(false);

  // Estimate total time (5-7 minutes based on actual generation times)
  const estimatedTotalTime = 400;
  const progressPercent = Math.min((elapsedTime / estimatedTotalTime) * 100, 98);

  // Fallback check: periodically check database for completed memo
  const checkDatabaseForMemo = useCallback(async () => {
    if (!companyId || memoFound) return;
    
    setIsCheckingDatabase(true);
    try {
      const { data: memo } = await supabase
        .from("memos")
        .select("structured_content, updated_at")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (memo?.structured_content) {
        const sections = (memo.structured_content as any).sections;
        if (sections && Array.isArray(sections) && sections.length > 0) {
          // Check if memo was updated recently (within last 10 minutes)
          const updatedAt = new Date(memo.updated_at || 0);
          const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
          
          if (updatedAt > tenMinutesAgo) {
            console.log("MemoLoadingScreen: Found completed memo in database!");
            setMemoFound(true);
            onMemoReady?.();
          }
        }
      }
    } catch (error) {
      console.error("Error checking database for memo:", error);
    } finally {
      setIsCheckingDatabase(false);
    }
  }, [companyId, memoFound, onMemoReady]);

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

  // Rotate fun facts every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFunFact(funFacts[Math.floor(Math.random() * funFacts.length)]);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  // Show manual check button after 3 minutes
  useEffect(() => {
    if (elapsedTime >= 180 && !showManualCheck) {
      setShowManualCheck(true);
    }
  }, [elapsedTime, showManualCheck]);

  // Fallback database check every 30 seconds after 2 minutes
  useEffect(() => {
    if (elapsedTime >= 120 && elapsedTime % 30 === 0 && companyId) {
      checkDatabaseForMemo();
    }
  }, [elapsedTime, companyId, checkDatabaseForMemo]);

  const handleManualCheck = async () => {
    await checkDatabaseForMemo();
    if (!memoFound) {
      onCheckStatus?.();
    }
  };

  const handleRefreshPage = () => {
    window.location.reload();
  };

  const CurrentIcon = loadingSteps[currentStep]?.icon || Sparkles;

  // Format time as m:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
            This may take up to 15 minutes
          </p>
        </div>

        {/* Coffee message - show after 30 seconds */}
        {elapsedTime >= 30 && elapsedTime < 120 && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground animate-fade-in">
            <Coffee className="w-4 h-4" />
            <span>Perfect time to grab a coffee. Black, no sugar.</span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-3">
          <Progress value={progressPercent} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{Math.round(progressPercent)}% complete</span>
            <span>{formatTime(elapsedTime)} elapsed</span>
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

        {/* Reassurance message after 2 minutes */}
        {elapsedTime > 120 && elapsedTime < 300 && (
          <div className="text-center text-sm text-muted-foreground animate-fade-in">
            <p>Deep AI analysis in progress. We're generating comprehensive insights...</p>
          </div>
        )}

        {/* Extended reassurance after 5 minutes */}
        {elapsedTime >= 300 && elapsedTime < 480 && (
          <div className="text-center text-sm text-muted-foreground animate-fade-in">
            <p>Almost there! Final synthesis underway...</p>
          </div>
        )}

        {/* Manual check button after 3 minutes */}
        {showManualCheck && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              <span>Taking longer than expected?</span>
            </div>
            <div className="flex gap-2 justify-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleManualCheck}
                disabled={isCheckingDatabase}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isCheckingDatabase ? 'animate-spin' : ''}`} />
                Check Status
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefreshPage}
              >
                Refresh Page
              </Button>
            </div>
          </div>
        )}

        {/* Timeout warning after 8 minutes */}
        {elapsedTime >= 480 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Generation is taking longer than usual
                </p>
                <p className="text-xs text-muted-foreground">
                  Your memo may already be ready. Try refreshing the page to check.
                </p>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleRefreshPage}
                  className="mt-2"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
