import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Check, 
  MessageSquarePlus,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImprovementQuestion {
  id: string;
  question: string;
  placeholder?: string;
}

interface ImprovementQuestionCardProps {
  question: ImprovementQuestion;
  section: string;
  suggestionTitle: string;
  impact: 'high' | 'medium';
  isInQueue: boolean;
  onAddToQueue: (question: ImprovementQuestion) => void;
  onAnswerInline: (questionId: string, answer: string) => void;
  inlineAnswer?: string;
}

export function ImprovementQuestionCard({
  question,
  section,
  suggestionTitle,
  impact,
  isInQueue,
  onAddToQueue,
  onAnswerInline,
  inlineAnswer = ""
}: ImprovementQuestionCardProps) {
  const [showInput, setShowInput] = useState(false);
  const [localAnswer, setLocalAnswer] = useState(inlineAnswer);
  const [saved, setSaved] = useState(false);

  const handleSaveAnswer = () => {
    if (localAnswer.trim()) {
      onAnswerInline(question.id, localAnswer.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleAddToQueue = () => {
    onAddToQueue(question);
  };

  return (
    <div className={cn(
      "group rounded-xl border transition-all backdrop-blur-sm",
      isInQueue 
        ? "border-primary/30 bg-primary/10" 
        : "border-border/40 bg-card/60 hover:border-primary/25 hover:bg-card/80"
    )}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
            isInQueue ? "bg-primary text-primary-foreground" : "bg-muted"
          )}>
            {isInQueue ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <MessageSquarePlus className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground leading-relaxed">
              {question.question}
            </p>
            
            {showInput ? (
              <div className="mt-3 space-y-2">
                <Textarea
                  value={localAnswer}
                  onChange={(e) => setLocalAnswer(e.target.value)}
                  placeholder={question.placeholder || "Type your answer..."}
                  className="min-h-[80px] text-sm resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {localAnswer.length} / 500 characters
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowInput(false)}
                      className="text-xs h-7"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveAnswer}
                      disabled={!localAnswer.trim()}
                      className="text-xs h-7 gap-1"
                    >
                      {saved ? (
                        <>
                          <Check className="w-3 h-3" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          Save Answer
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : inlineAnswer ? (
              <div 
                className="mt-2 p-2 rounded bg-success/10 border border-success/20 cursor-pointer hover:bg-success/15 transition-colors"
                onClick={() => setShowInput(true)}
              >
                <p className="text-xs text-success font-medium mb-1 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Your Answer
                </p>
                <p className="text-sm text-foreground/80 line-clamp-2">{inlineAnswer}</p>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInput(true)}
                  className="text-xs h-7 text-muted-foreground hover:text-foreground"
                >
                  Answer now
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
                
                {!isInQueue && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddToQueue}
                    className="text-xs h-7 gap-1 border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <Plus className="w-3 h-3" />
                    Add to Queue
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isInQueue && !showInput && !inlineAnswer && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 text-xs text-primary">
            <Check className="w-3 h-3" />
            <span>Added to regeneration queue</span>
          </div>
        </div>
      )}
    </div>
  );
}
