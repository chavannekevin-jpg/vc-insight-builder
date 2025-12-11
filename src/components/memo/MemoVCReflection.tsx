import { Eye } from "lucide-react";
import { renderMarkdownText } from "@/lib/markdownParser";

interface MemoVCReflectionProps {
  text: string;
}

export const MemoVCReflection = ({ text }: MemoVCReflectionProps) => {
  // Guard against objects being passed instead of strings
  const safeText = typeof text === 'string' ? text : String(text || '');
  
  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background p-6 mt-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
          <Eye className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">VC Perspective</h3>
      </div>
      
      {/* Content */}
      <div className="pl-13">
        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {renderMarkdownText(safeText)}
        </p>
      </div>
    </div>
  );
};
