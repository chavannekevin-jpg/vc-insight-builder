import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ModernCard } from "@/components/ModernCard";
import { VCAvatar } from "./VCAvatar";
import { ArrowRight, Flame, Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Question {
  id: number;
  question: string;
  category: string;
  difficulty: string;
  context?: string;
}

interface AnswerResult {
  question: string;
  answer: string;
  score: number;
  baseScore: number;
  category: string;
  roast: string;
  hint: string;
  speedBonus: boolean;
  timeElapsed: number;
}

interface RoastGameLoopProps {
  questions: Question[];
  companyContext: string;
  onComplete: (results: AnswerResult[], totalTime: number) => void;
}

export const RoastGameLoop = ({ questions, companyContext, onComplete }: RoastGameLoopProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [currentResult, setCurrentResult] = useState<Omit<AnswerResult, 'question' | 'answer' | 'category' | 'timeElapsed'> | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [runningScore, setRunningScore] = useState(0);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + (showFeedback ? 1 : 0)) / questions.length) * 100;

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(t => t + 1);
      setTotalTime(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Reset timer on new question
  useEffect(() => {
    setTimeElapsed(0);
  }, [currentIndex]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!answer.trim() || answer.trim().length < 10) {
      toast.error("Please provide a more detailed answer (at least 10 characters)");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('score-roast-answer', {
        body: {
          question: currentQuestion.question,
          answer: answer.trim(),
          companyContext,
          questionIndex: currentIndex,
          timeElapsed,
        }
      });

      if (error) throw error;

      setCurrentResult({
        score: data.score,
        baseScore: data.baseScore,
        roast: data.roast,
        hint: data.hint,
        speedBonus: data.speedBonus,
      });
      setRunningScore(prev => prev + data.score);
      setShowFeedback(true);

    } catch (error) {
      console.error('Error scoring answer:', error);
      toast.error("Failed to score answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    // Save result
    const result: AnswerResult = {
      question: currentQuestion.question,
      answer: answer.trim(),
      category: currentQuestion.category,
      timeElapsed,
      ...currentResult!,
    };
    const newResults = [...results, result];
    setResults(newResults);

    // Check if game is complete
    if (currentIndex >= questions.length - 1) {
      onComplete(newResults, totalTime);
      return;
    }

    // Move to next question
    setCurrentIndex(prev => prev + 1);
    setAnswer("");
    setCurrentResult(null);
    setShowFeedback(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header with progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatTime(timeElapsed)}
            </span>
            <span className="text-sm font-bold text-primary">
              Score: {runningScore}/{(currentIndex + (showFeedback ? 1 : 0)) * 10}
            </span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Main game area */}
      <div className="grid md:grid-cols-[1fr_auto] gap-8">
        {/* Question and answer area */}
        <div className="space-y-6">
          {/* Category badge */}
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide",
              currentQuestion.difficulty === "easy" && "bg-green-500/10 text-green-500",
              currentQuestion.difficulty === "medium" && "bg-yellow-500/10 text-yellow-500",
              currentQuestion.difficulty === "hard" && "bg-red-500/10 text-red-500",
            )}>
              {currentQuestion.difficulty}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {currentQuestion.category.replace('_', ' ')}
            </span>
          </div>

          {/* Question */}
          <ModernCard className="border-l-4 border-l-primary">
            <p className="text-lg font-medium leading-relaxed">
              "{currentQuestion.question}"
            </p>
          </ModernCard>

          {/* Answer input or feedback */}
          {!showFeedback ? (
            <div className="space-y-4">
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here... Be specific and confident."
                className="min-h-[150px] text-base"
                disabled={isSubmitting}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {answer.length} characters {answer.length < 50 && answer.length > 0 && "(aim for 50+)"}
                </span>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || answer.trim().length < 10}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Flame className="w-4 h-4 animate-pulse" />
                      Roasting...
                    </>
                  ) : (
                    <>
                      Submit Answer
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              {/* Score display */}
              <ModernCard className={cn(
                "border-2",
                currentResult!.score >= 7 && "border-green-500 bg-green-500/5",
                currentResult!.score >= 4 && currentResult!.score < 7 && "border-yellow-500 bg-yellow-500/5",
                currentResult!.score < 4 && "border-red-500 bg-red-500/5",
              )}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-bold">
                      {currentResult!.score}/10
                    </span>
                    {currentResult!.speedBonus && (
                      <span className="flex items-center gap-1 text-green-500 text-sm font-medium">
                        <Zap className="w-4 h-4" />
                        Speed Bonus!
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Roast */}
                <div className="mb-4">
                  <p className="text-lg italic text-muted-foreground">
                    "{currentResult!.roast}"
                  </p>
                </div>

                {/* Hint */}
                <div className="pt-4 border-t border-border">
                  <p className="text-sm">
                    <strong className="text-primary">Pro tip:</strong> {currentResult!.hint}
                  </p>
                </div>
              </ModernCard>

              {/* Next button */}
              <Button onClick={handleNext} className="w-full gap-2" size="lg">
                {currentIndex >= questions.length - 1 ? (
                  <>
                    See Final Verdict
                    <Flame className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next Question
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* VC Avatar sidebar */}
        <div className="hidden md:flex flex-col items-center">
          <VCAvatar timeElapsed={timeElapsed} isThinking={isSubmitting} />
          
          {/* Speed bonus timer */}
          {!showFeedback && timeElapsed <= 30 && (
            <div className="mt-4 text-center">
              <div className="text-2xl font-bold text-green-500">
                {30 - timeElapsed}s
              </div>
              <div className="text-xs text-green-500">
                for speed bonus
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
