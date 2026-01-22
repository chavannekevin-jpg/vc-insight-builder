import { useState, useEffect, useCallback, useId } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, CheckCircle2, AlertCircle, Lightbulb, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AISuggestionCard } from '@/components/questionnaire/AISuggestionCard';
import { ConsistencyFlagCard } from '@/components/questionnaire/ConsistencyFlagCard';

interface Suggestion {
  element: string;
  prompt: string;
  example: string;
}

interface ConsistencyFlag {
  severity: 'warning' | 'error';
  field1: string;
  field2: string;
  description: string;
  suggestion: string;
}

interface AnalysisResult {
  score: number;
  found: string[];
  missing: string[];
  niceToHaveMissing: string[];
  suggestions: Suggestion[];
  vcContext?: string;
  tooShort?: boolean;
  noCriteria?: boolean;
}

interface AnswerOptimizerWizardProps {
  answer: string;
  questionKey: string;
  companyId?: string;
  allResponses?: Record<string, string>;
  onSuggestionApply?: (addition: string) => void;
  onNavigateToField?: (field: string) => void;
  className?: string;
}

export const AnswerOptimizerWizard = ({
  answer,
  questionKey,
  companyId,
  allResponses,
  onSuggestionApply,
  onNavigateToField,
  className
}: AnswerOptimizerWizardProps) => {
  const instanceId = useId();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [consistencyFlags, setConsistencyFlags] = useState<ConsistencyFlag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingConsistency, setIsCheckingConsistency] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastAnalyzedAnswer, setLastAnalyzedAnswer] = useState('');
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

  const analyzeAnswer = useCallback(async () => {
    if (!answer || answer.length < 30 || answer === lastAnalyzedAnswer) {
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('optimize-answer-quality', {
        body: { answer, questionKey }
      });

      if (error) {
        console.error('Analysis error:', error);
        return;
      }

      setAnalysis(data);
      setLastAnalyzedAnswer(answer);
      
      // Auto-expand if there are suggestions
      if (data.suggestions?.length > 0 && data.missing?.length > 0) {
        setIsExpanded(true);
      }
    } catch (err) {
      console.error('Failed to analyze answer:', err);
    } finally {
      setIsLoading(false);
    }
  }, [answer, questionKey, lastAnalyzedAnswer]);

  // Check consistency across answers
  const checkConsistency = useCallback(async () => {
    if (!companyId || !allResponses || Object.keys(allResponses).length < 2) {
      return;
    }

    // Only check if we have substantial answers
    const filledCount = Object.values(allResponses).filter(v => v?.trim().length > 50).length;
    if (filledCount < 2) return;

    setIsCheckingConsistency(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-answer-consistency', {
        body: { 
          companyId, 
          currentQuestionKey: questionKey,
          currentAnswer: answer,
          allResponses 
        }
      });

      if (error) {
        console.error('Consistency check error:', error);
        return;
      }

      if (data?.flags?.length > 0) {
        setConsistencyFlags(data.flags);
        setIsExpanded(true);
      } else {
        setConsistencyFlags([]);
      }
    } catch (err) {
      console.error('Failed to check consistency:', err);
    } finally {
      setIsCheckingConsistency(false);
    }
  }, [companyId, allResponses, questionKey, answer]);

  // Debounced analysis trigger
  useEffect(() => {
    if (answer.length < 30) {
      setAnalysis(null);
      return;
    }

    const timer = setTimeout(() => {
      analyzeAnswer();
    }, 2000);

    return () => clearTimeout(timer);
  }, [answer, analyzeAnswer]);

  // Check consistency when answer is substantial enough
  useEffect(() => {
    if (answer.length < 100 || !allResponses) return;

    const timer = setTimeout(() => {
      checkConsistency();
    }, 3000);

    return () => clearTimeout(timer);
  }, [answer, checkConsistency, allResponses]);

  const handleDismissSuggestion = (element: string) => {
    setDismissedSuggestions(prev => new Set(prev).add(element));
  };

  const getVisibleSuggestions = () => {
    if (!analysis?.suggestions) return [];
    return analysis.suggestions.filter(s => !dismissedSuggestions.has(s.element));
  };

  // Show helpful prompt if answer is too short
  if (!answer || answer.length < 30) {
    const charsNeeded = 30 - (answer?.length || 0);
    return (
      <div className={cn('mt-3 rounded-lg border bg-primary/5 border-primary/20', className)}>
        <div className="px-4 py-3 flex items-center gap-3">
          <Lightbulb className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm text-muted-foreground">
            Add more detail to unlock quality insights
          </span>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full whitespace-nowrap">
            {charsNeeded} more chars
          </span>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/10 border-green-500/20';
    if (score >= 60) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-orange-500/10 border-orange-500/20';
  };

  const formatElement = (element: string) => {
    return element.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const visibleSuggestions = getVisibleSuggestions();
  const hasFlags = consistencyFlags.length > 0;
  const hasSuggestions = visibleSuggestions.length > 0;

  return (
    <div className={cn('mt-3 rounded-lg border transition-all', className, 
      analysis ? (analysis.missing.length === 0 ? 'bg-success/10 border-success/20' : 'bg-primary/5 border-primary/20') : 'bg-muted/30 border-border/50'
    )}>
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left"
        disabled={isLoading}
      >
        <div className="flex items-center gap-3">
          {isLoading ? (
            <>
              <Sparkles className="h-4 w-4 animate-pulse text-primary" />
              <span className="text-sm text-muted-foreground">Analyzing answer quality...</span>
            </>
          ) : analysis ? (
            <>
              {analysis.missing.length === 0 ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium text-success">
                    Great answer!
                  </span>
                </>
              ) : (
                <>
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {analysis.missing.length} suggestion{analysis.missing.length > 1 ? 's' : ''} to strengthen your answer
                  </span>
                </>
              )}
              {hasFlags && (
                <span className="text-xs bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                  {consistencyFlags.length} flag{consistencyFlags.length > 1 ? 's' : ''}
                </span>
              )}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Answer quality check</span>
            </>
          )}
        </div>
        
        {(analysis || hasFlags) && !isLoading && (
          isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (analysis || hasFlags) && !isLoading && (
        <div className="px-4 pb-4 space-y-4 border-t border-border/30 pt-3">
          {/* Consistency Flags - Show first as they're most important */}
          {hasFlags && (
            <div className="space-y-2">
              {consistencyFlags.map((flag, idx) => (
                <ConsistencyFlagCard
                  key={`${flag.field1}-${flag.field2}-${idx}`}
                  {...flag}
                  onNavigateToField={onNavigateToField}
                />
              ))}
            </div>
          )}

          {analysis && (
            <>
              {/* Found elements */}
              {analysis.found.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Found in your answer</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.found.map((el) => (
                      <span key={el} className="text-xs bg-green-500/10 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                        {formatElement(el)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing elements */}
              {analysis.missing.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-orange-600 dark:text-orange-400 mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Missing (important for VCs)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missing.map((el) => (
                      <span key={el} className="text-xs bg-orange-500/10 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">
                        {formatElement(el)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Suggestions with Accept/Dismiss */}
              {hasSuggestions && companyId && onSuggestionApply && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                    <Lightbulb className="h-4 w-4" />
                    <span>Quick improvements</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      (requires your approval)
                    </span>
                  </div>
                  {visibleSuggestions.map((suggestion, idx) => (
                    <AISuggestionCard
                      key={`${suggestion.element}-${idx}`}
                      suggestionId={`${instanceId}-${suggestion.element}-${idx}`}
                      questionKey={questionKey}
                      companyId={companyId}
                      element={suggestion.element}
                      prompt={suggestion.prompt}
                      example={suggestion.example}
                      onAccept={(addition) => onSuggestionApply(addition)}
                      onDismiss={() => handleDismissSuggestion(suggestion.element)}
                    />
                  ))}
                </div>
              )}

              {/* VC Context */}
              {analysis.vcContext && analysis.missing.length > 0 && (
                <div className="text-xs text-muted-foreground bg-background/30 rounded p-2 italic">
                  💡 {analysis.vcContext}
                </div>
              )}
            </>
          )}

          {isCheckingConsistency && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Checking consistency across your answers...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
