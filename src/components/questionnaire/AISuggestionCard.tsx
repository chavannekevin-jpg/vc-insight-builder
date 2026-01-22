import { useState } from 'react';
import { Check, X, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface AISuggestionCardProps {
  suggestionId: string;
  questionKey: string;
  companyId: string;
  element: string;
  prompt: string;
  example: string;
  onAccept: (addition: string) => void;
  onDismiss: () => void;
  className?: string;
}

export const AISuggestionCard = ({
  suggestionId,
  questionKey,
  companyId,
  element,
  prompt,
  example,
  onAccept,
  onDismiss,
  className
}: AISuggestionCardProps) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [actionTaken, setActionTaken] = useState<'accepted' | 'dismissed' | null>(null);

  const logSuggestionAction = async (action: 'accepted' | 'dismissed') => {
    try {
      // Log to memo_tool_data for audit trail
      await supabase
        .from('memo_tool_data')
        .upsert({
          company_id: companyId,
          section_name: '__ai_suggestions',
          tool_name: `suggestion_${suggestionId}`,
          ai_generated_data: {
            suggestion_id: suggestionId,
            question_key: questionKey,
            element,
            prompt,
            example,
            action,
            action_timestamp: new Date().toISOString(),
          },
          data_source: 'ai-suggestion-action',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'company_id,section_name,tool_name' });
    } catch (error) {
      console.error('Failed to log suggestion action:', error);
    }
  };

  const handleAccept = async () => {
    setIsAccepting(true);
    await logSuggestionAction('accepted');
    setActionTaken('accepted');
    onAccept(`\n\n${example}`);
    setIsAccepting(false);
  };

  const handleDismiss = async () => {
    setIsDismissing(true);
    await logSuggestionAction('dismissed');
    setActionTaken('dismissed');
    onDismiss();
    setIsDismissing(false);
  };

  if (actionTaken) {
    return (
      <div className={cn(
        'rounded-md px-3 py-2 text-sm flex items-center gap-2',
        actionTaken === 'accepted' ? 'bg-green-500/10 text-green-700' : 'bg-muted text-muted-foreground',
        className
      )}>
        {actionTaken === 'accepted' ? (
          <>
            <Check className="h-3 w-3" />
            <span>Added to your answer</span>
          </>
        ) : (
          <>
            <X className="h-3 w-3" />
            <span>Dismissed</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      'bg-background/50 rounded-md p-3 border border-border/50',
      className
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary uppercase tracking-wide">
              AI Suggestion
            </span>
          </div>
          <p className="text-sm font-medium">{prompt}</p>
          <p className="text-xs text-muted-foreground mt-1 italic">
            e.g., "{example}"
          </p>
        </div>
        
        <div className="flex gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handleDismiss}
            disabled={isAccepting || isDismissing}
            className="h-7 px-2 text-xs"
          >
            {isDismissing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <X className="h-3 w-3" />
            )}
          </Button>
          <Button
            size="sm"
            onClick={handleAccept}
            disabled={isAccepting || isDismissing}
            className="h-7 px-3 text-xs gap-1"
          >
            {isAccepting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <Check className="h-3 w-3" />
                Accept
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
