import { Sparkles } from "lucide-react";
import { renderMarkdownText } from "@/lib/markdownParser";

interface MemoAIConclusionProps {
  text: string;
}

export const MemoAIConclusion = ({ text }: MemoAIConclusionProps) => {
  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 mt-6 shadow-lg">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/15 opacity-50" />
      
      {/* Header */}
      <div className="relative flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Investment Synopsis</h3>
      </div>
      
      {/* Content */}
      <div className="relative pl-13">
        <p className="text-foreground font-medium leading-relaxed whitespace-pre-wrap">
          {renderMarkdownText(text)}
        </p>
      </div>
    </div>
  );
};
