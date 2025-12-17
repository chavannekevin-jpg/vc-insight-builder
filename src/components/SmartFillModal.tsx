import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Sparkles, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SmartQuestion {
  questionKey: string;
  question: string;
  helpText: string;
  placeholder: string;
  priority: number;
}

interface SmartFillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  questions: SmartQuestion[];
  summary: string;
  currentReadiness: number;
  onComplete: () => void;
  onSkip: () => void;
}

export function SmartFillModal({
  open,
  onOpenChange,
  companyId,
  questions,
  summary,
  currentReadiness,
  onComplete,
  onSkip
}: SmartFillModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleNext = async () => {
    if (!currentQuestion) return;

    const answer = answers[currentQuestion.questionKey]?.trim();
    
    if (!answer) {
      // Allow skipping individual questions
      if (isLastQuestion) {
        await saveAllAnswers();
      } else {
        setCurrentIndex(prev => prev + 1);
      }
      return;
    }

    if (isLastQuestion) {
      await saveAllAnswers();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const saveAllAnswers = async () => {
    setSaving(true);
    try {
      const answersToSave = Object.entries(answers).filter(([_, value]) => value?.trim());
      
      if (answersToSave.length > 0) {
        for (const [questionKey, answer] of answersToSave) {
          const { error } = await supabase
            .from('memo_responses')
            .upsert({
              company_id: companyId,
              question_key: questionKey,
              answer: answer,
              source: 'smart_fill'
            }, {
              onConflict: 'company_id,question_key'
            });

          if (error) {
            console.error(`Error saving ${questionKey}:`, error);
          }
        }

        toast({
          title: "Data saved",
          description: `${answersToSave.length} answers added to your profile.`
        });
      }

      onComplete();
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (value: string) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.questionKey]: value
    }));
  };

  if (!questions.length) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              {currentReadiness}% Ready
            </span>
          </div>
          <DialogTitle className="text-xl">
            Quick questions before your memo
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {summary}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-muted-foreground">
                {Object.values(answers).filter(a => a?.trim()).length} answered
              </span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          {/* Current Question */}
          {currentQuestion && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  {currentQuestion.question}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {currentQuestion.helpText}
                </p>
              </div>

              <Textarea
                value={answers[currentQuestion.questionKey] || ''}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={currentQuestion.placeholder}
                className="min-h-[100px] resize-none"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between gap-3">
          <Button
            variant="ghost"
            onClick={onSkip}
            disabled={saving}
            className="text-muted-foreground"
          >
            Skip all & generate anyway
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={saving}
            className="gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : isLastQuestion ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Done - Build Analysis
              </>
            ) : (
              <>
                {answers[currentQuestion?.questionKey]?.trim() ? 'Next' : 'Skip'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
