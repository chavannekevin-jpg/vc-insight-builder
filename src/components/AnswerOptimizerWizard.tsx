import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, CheckCircle2, AlertCircle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Suggestion {
  element: string;
  prompt: string;
  example: string;
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
  onSuggestionApply?: (addition: string) => void;
  className?: string;
}

export const AnswerOptimizerWizard = ({
  answer,
  questionKey,
  onSuggestionApply,
  className
}: AnswerOptimizerWizardProps) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastAnalyzedAnswer, setLastAnalyzedAnswer] = useState('');

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
      if (data.suggestions?.length > 0 && data.score < 80) {
        setIsExpanded(true);
      }
    } catch (err) {
      console.error('Failed to analyze answer:', err);
    } finally {
      setIsLoading(false);
    }
  }, [answer, questionKey, lastAnalyzedAnswer]);

  // Debounced analysis trigger
  useEffect(() => {
    if (answer.length < 30) {
      setAnalysis(null);
      return;
    }

    const timer = setTimeout(() => {
      analyzeAnswer();
    }, 2000); // Wait 2 seconds after typing stops

    return () => clearTimeout(timer);
  }, [answer, analyzeAnswer]);

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
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/10 border-green-500/20';
    if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-orange-500/10 border-orange-500/20';
  };

  const formatElement = (element: string) => {
    return element.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleApplySuggestion = (suggestion: Suggestion) => {
    if (onSuggestionApply) {
      onSuggestionApply(`\n\n${suggestion.example}`);
    }
  };

  return (
    <div className={cn('mt-3 rounded-lg border transition-all', className, 
      analysis ? getScoreBg(analysis.score) : 'bg-muted/30 border-border/50'
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
              <div className={cn('text-lg font-semibold', getScoreColor(analysis.score))}>
                {analysis.score}/100
              </div>
              <span className="text-sm text-muted-foreground">
                {analysis.score >= 80 
                  ? 'Great answer!' 
                  : analysis.score >= 60 
                    ? 'Good, could be stronger' 
                    : 'Add more detail for best results'}
              </span>
              {analysis.missing.length > 0 && (
                <span className="text-xs bg-orange-500/20 text-orange-600 px-2 py-0.5 rounded-full">
                  {analysis.missing.length} missing
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
        
        {analysis && !isLoading && (
          isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && analysis && !isLoading && (
        <div className="px-4 pb-4 space-y-4 border-t border-border/30 pt-3">
          {/* Found elements */}
          {analysis.found.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-green-600 mb-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Found in your answer</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.found.map((el) => (
                  <span key={el} className="text-xs bg-green-500/10 text-green-700 px-2 py-1 rounded">
                    {formatElement(el)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing elements */}
          {analysis.missing.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-orange-600 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span>Missing (important for VCs)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.missing.map((el) => (
                  <span key={el} className="text-xs bg-orange-500/10 text-orange-700 px-2 py-1 rounded">
                    {formatElement(el)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {analysis.suggestions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                <Lightbulb className="h-4 w-4" />
                <span>Quick improvements</span>
              </div>
              {analysis.suggestions.map((suggestion, idx) => (
                <div 
                  key={idx}
                  className="bg-background/50 rounded-md p-3 flex items-start justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{suggestion.prompt}</p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      e.g., "{suggestion.example}"
                    </p>
                  </div>
                  {onSuggestionApply && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApplySuggestion(suggestion)}
                      className="shrink-0 text-xs h-7"
                    >
                      + Add
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* VC Context */}
          {analysis.vcContext && analysis.score < 80 && (
            <div className="text-xs text-muted-foreground bg-background/30 rounded p-2 italic">
              💡 {analysis.vcContext}
            </div>
          )}
        </div>
      )}
    </div>
  );
};