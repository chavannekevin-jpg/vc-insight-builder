import { HelpCircle } from "lucide-react";

interface MemoVCQuestionsProps {
  questions: string[];
}

export const MemoVCQuestions = ({ questions }: MemoVCQuestionsProps) => {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-6 border border-accent/30 mt-6">
      <h4 className="text-sm font-semibold text-accent mb-4 uppercase tracking-wider flex items-center gap-2">
        <HelpCircle className="w-4 h-4" />
        Key Investor Questions
      </h4>
      <div className="space-y-3">
        {questions.map((question, index) => (
          <div 
            key={index} 
            className="flex items-start gap-3 p-4 rounded-lg bg-background/60 hover:bg-background/80 transition-colors animate-fade-in border border-border/30"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-accent/20 flex-shrink-0 mt-0.5">
              <span className="text-sm font-bold text-accent">{index + 1}</span>
            </div>
            <p className="text-foreground leading-relaxed font-medium">{question}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
