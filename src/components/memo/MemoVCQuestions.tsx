import { useState } from "react";
import { HelpCircle, ChevronDown, Brain, FileText } from "lucide-react";
import { MemoVCQuestion } from "@/types/memo";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { renderMarkdownText } from "@/lib/markdownParser";

interface MemoVCQuestionsProps {
  questions: (string | MemoVCQuestion)[];
  defaultAllOpen?: boolean;
}

export const MemoVCQuestions = ({ questions, defaultAllOpen = false }: MemoVCQuestionsProps) => {
  // Track multiple open indices when defaultAllOpen is true
  const [openIndices, setOpenIndices] = useState<Set<number>>(
    () => defaultAllOpen ? new Set(questions.map((_, i) => i)) : new Set([0])
  );
  
  const toggleIndex = (index: number) => {
    setOpenIndices(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  if (!questions || questions.length === 0) return null;

  // Check if we have enhanced questions (objects) or simple strings
  const isEnhancedQuestion = (q: string | MemoVCQuestion): q is MemoVCQuestion => {
    return typeof q === "object" && q !== null && "question" in q;
  };

  return (
    <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-6 border border-accent/30 mt-6">
      <h4 className="text-sm font-semibold text-accent mb-4 uppercase tracking-wider flex items-center gap-2">
        <HelpCircle className="w-4 h-4" />
        Key Investor Questions
      </h4>
      <div className="space-y-3">
        {questions.map((question, index) => {
          const isEnhanced = isEnhancedQuestion(question);
          const questionText = isEnhanced ? question.question : question;
          const isOpen = openIndices.has(index);

          if (isEnhanced) {
            // Enhanced question with expandable VC rationale
            return (
              <Collapsible 
                key={index} 
                open={isOpen}
                onOpenChange={() => toggleIndex(index)}
              >
                <div 
                  className="rounded-lg bg-background/60 border border-border/30 overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CollapsibleTrigger className="w-full">
                      <div className="flex items-start gap-3 p-4 hover:bg-background/80 transition-colors cursor-pointer">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-accent/20 flex-shrink-0 mt-0.5">
                        <span className="text-sm font-bold text-accent">{index + 1}</span>
                      </div>
                      <p className="text-foreground leading-relaxed font-medium text-left flex-1">
                        {renderMarkdownText(questionText)}
                      </p>
                      <ChevronDown 
                        className={`w-5 h-5 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
                      />
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-4 border-t border-border/30">
                      {/* Why VCs Ask This */}
                      <div className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-4 h-4 text-primary" />
                          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                            Why VCs Ask This
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                          {renderMarkdownText(question.vcRationale)}
                        </p>
                      </div>

                      {/* What to Prepare */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-secondary" />
                          <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                            What to Prepare
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                          {renderMarkdownText(question.whatToPrepare)}
                        </p>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          }

          // Simple string question (legacy format)
          return (
            <div 
              key={index} 
              className="flex items-start gap-3 p-4 rounded-lg bg-background/60 hover:bg-background/80 transition-colors animate-fade-in border border-border/30"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-accent/20 flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold text-accent">{index + 1}</span>
              </div>
              <p className="text-foreground leading-relaxed font-medium">{renderMarkdownText(questionText)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
