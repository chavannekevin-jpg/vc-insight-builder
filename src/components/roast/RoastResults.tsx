import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ModernCard } from "@/components/ModernCard";
import { Progress } from "@/components/ui/progress";
import { Flame, Trophy, Target, Share2, RotateCcw, Home, Copy, Check, Sparkles, FileText, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface CategoryScore {
  category: string;
  score: number;
  maxScore: number;
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

interface IdealAnswer {
  questionIndex: number;
  idealAnswer: string;
}

interface Verdict {
  totalScore: number;
  maxPossibleScore: number;
  categoryBreakdown: CategoryScore[];
  verdictTitle: string;
  verdictEmoji: string;
  assessment: string;
  recommendations: string[];
  shareableQuote: string;
  investorReadiness: string;
  idealAnswers?: IdealAnswer[];
}

interface RoastResultsProps {
  verdict: Verdict;
  results: AnswerResult[];
  onPlayAgain: () => void;
  onSaveAnswers: () => Promise<void>;
  companyName: string;
}

export const RoastResults = ({ verdict, results, onPlayAgain, onSaveAnswers, companyName }: RoastResultsProps) => {
  const navigate = useNavigate();
  const [displayScore, setDisplayScore] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedAnswers, setExpandedAnswers] = useState<Set<number>>(new Set());

  // Calculate percentage score
  const maxScore = verdict.maxPossibleScore || (results.length * 10);
  const percentageScore = Math.round((verdict.totalScore / maxScore) * 100);

  // Animate score counter
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = percentageScore / steps;
    let current = 0;

    const interval = setInterval(() => {
      current += increment;
      if (current >= percentageScore) {
        setDisplayScore(percentageScore);
        clearInterval(interval);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [percentageScore]);

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getReadinessLabel = (readiness: string) => {
    switch (readiness) {
      case "investor_ready": return { label: "Investor Ready", color: "bg-green-500" };
      case "almost_ready": return { label: "Almost Ready", color: "bg-yellow-500" };
      case "getting_there": return { label: "Getting There", color: "bg-orange-500" };
      default: return { label: "Needs Work", color: "bg-red-500" };
    }
  };

  const readiness = getReadinessLabel(verdict.investorReadiness);

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(verdict.shareableQuote);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(verdict.shareableQuote + " #StartupLife #VCRoast");
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleSaveAnswers = async () => {
    setIsSaving(true);
    try {
      await onSaveAnswers();
      setSaved(true);
      toast.success("Your answers have been saved to improve your memo!");
    } catch (error) {
      console.error('Error saving answers:', error);
      toast.error("Failed to save answers. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAnswerExpanded = (index: number) => {
    const newExpanded = new Set(expandedAnswers);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedAnswers(newExpanded);
  };

  const expandAll = () => {
    setExpandedAnswers(new Set(results.map((_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedAnswers(new Set());
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Score reveal */}
      <div className="text-center mb-12">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 blur-3xl bg-gradient-to-t from-orange-500/30 via-red-500/20 to-transparent" />
          <span className="text-8xl relative z-10">{verdict.verdictEmoji}</span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
          {verdict.verdictTitle}
        </h1>

        <div className="flex items-center justify-center gap-4 mb-2">
          <span className={cn("text-6xl font-bold", getScoreColor(percentageScore))}>
            {displayScore}%
          </span>
        </div>
        
        <p className="text-muted-foreground mb-4">
          {verdict.totalScore}/{maxScore} points
        </p>

        <span className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-medium",
          readiness.color
        )}>
          <Trophy className="w-4 h-4" />
          {readiness.label}
        </span>
      </div>

      {/* Save answers CTA */}
      {!saved && percentageScore >= 40 && (
        <ModernCard className="mb-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-primary" />
                Improve Your Memo
              </h3>
              <p className="text-sm text-muted-foreground">
                Your answers can enhance your memo's quality. Save them to strengthen your investor narrative.
              </p>
            </div>
            <Button 
              onClick={handleSaveAnswers}
              disabled={isSaving}
              className="gap-2 whitespace-nowrap"
            >
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Save to Memo
                </>
              )}
            </Button>
          </div>
        </ModernCard>
      )}

      {saved && (
        <ModernCard className="mb-8 bg-green-500/10 border-green-500/20">
          <div className="flex items-center gap-3 text-green-600">
            <Check className="w-5 h-5" />
            <span className="font-medium">Answers saved! Your memo knowledge has been enriched.</span>
          </div>
        </ModernCard>
      )}

      {/* Assessment */}
      <ModernCard className="mb-8">
        <p className="text-lg text-center text-muted-foreground">
          {verdict.assessment}
        </p>
      </ModernCard>

      {/* Q&A Review with Ideal Answers */}
      {verdict.idealAnswers && verdict.idealAnswers.length > 0 && (
        <ModernCard className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Learn From The Best
            </h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={expandAll}>
                Expand All
              </Button>
              <Button variant="ghost" size="sm" onClick={collapseAll}>
                Collapse All
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            See how a VC-ready founder would answer each question:
          </p>
          
          <div className="space-y-4">
            {results.map((result, i) => {
              const idealAnswer = verdict.idealAnswers?.find(a => a.questionIndex === i);
              const isExpanded = expandedAnswers.has(i);
              
              return (
                <Collapsible key={i} open={isExpanded} onOpenChange={() => toggleAnswerExpanded(i)}>
                  <div className="border border-border/50 rounded-lg overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <button className="w-full p-4 flex items-start justify-between gap-4 hover:bg-muted/50 transition-colors text-left">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn(
                              "text-xs font-bold px-2 py-0.5 rounded",
                              result.score >= 7 && "bg-green-500/20 text-green-500",
                              result.score >= 4 && result.score < 7 && "bg-yellow-500/20 text-yellow-500",
                              result.score < 4 && "bg-red-500/20 text-red-500",
                            )}>
                              {result.score}/10
                            </span>
                            <span className="text-xs text-muted-foreground capitalize">
                              {result.category.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="font-medium text-sm">{result.question}</p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        )}
                      </button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="px-4 pb-4 space-y-4">
                        {/* Your answer */}
                        <div className="bg-muted/30 rounded-lg p-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Your Answer:</p>
                          <p className="text-sm">{result.answer}</p>
                        </div>
                        
                        {/* Ideal answer */}
                        {idealAnswer && (
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                            <p className="text-xs font-medium text-green-600 mb-1 flex items-center gap-1">
                              <Lightbulb className="w-3 h-3" />
                              VC-Ready Answer:
                            </p>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              {idealAnswer.idealAnswer}
                            </p>
                          </div>
                        )}
                        
                        {/* Roast feedback */}
                        <div className="text-xs text-muted-foreground italic">
                          <span className="font-medium">Feedback:</span> {result.roast}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        </ModernCard>
      )}

      {/* Category breakdown */}
      {verdict.categoryBreakdown && verdict.categoryBreakdown.length > 0 && (
        <ModernCard className="mb-8">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Category Breakdown
          </h3>
          <div className="space-y-4">
            {verdict.categoryBreakdown.map((cat, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium capitalize">
                    {cat.category.replace('_', ' ')}
                  </span>
                  <span className={cn(
                    "text-sm font-bold",
                    cat.score >= 7 && "text-green-500",
                    cat.score >= 4 && cat.score < 7 && "text-yellow-500",
                    cat.score < 4 && "text-red-500",
                  )}>
                    {cat.score.toFixed(1)}/10
                  </span>
                </div>
                <Progress value={(cat.score / 10) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </ModernCard>
      )}

      {/* Recommendations */}
      {verdict.recommendations && verdict.recommendations.length > 0 && (
        <ModernCard className="mb-8">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Top Recommendations
          </h3>
          <ul className="space-y-3">
            {verdict.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{rec}</span>
              </li>
            ))}
          </ul>
        </ModernCard>
      )}

      {/* Shareable quote */}
      <ModernCard className="mb-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Share your result:</p>
            <p className="italic">"{verdict.shareableQuote}"</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleCopyQuote}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={handleShareTwitter}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </ModernCard>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={onPlayAgain} variant="outline" className="flex-1 gap-2">
          <RotateCcw className="w-4 h-4" />
          Try Again
        </Button>
        <Button onClick={() => navigate('/hub')} className="flex-1 gap-2">
          <Home className="w-4 h-4" />
          Back to Hub
        </Button>
      </div>
    </div>
  );
};