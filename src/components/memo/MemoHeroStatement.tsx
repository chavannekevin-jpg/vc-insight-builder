import { Quote } from "lucide-react";
import { renderMarkdownText } from "@/lib/markdownParser";

interface MemoHeroStatementProps {
  text: string;
}

export const MemoHeroStatement = ({ text }: MemoHeroStatementProps) => {
  // Guard against objects being passed instead of strings
  const safeText = typeof text === 'string' ? text : String(text || '');
  
  if (!safeText) return null;
  
  return (
    <div className="relative">
      <div className="absolute -left-2 top-0 opacity-20">
        <Quote className="w-8 h-8 text-primary rotate-180" />
      </div>
      <p className="text-xl font-semibold text-foreground leading-relaxed pl-8 pr-4 py-2 border-l-4 border-primary bg-gradient-to-r from-primary/5 to-transparent rounded-r-xl">
        {renderMarkdownText(safeText)}
      </p>
    </div>
  );
};
