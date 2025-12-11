import { TrendingUp } from "lucide-react";
import { renderMarkdownText } from "@/lib/markdownParser";

interface MemoBenchmarkingProps {
  text?: string;
}

export const MemoBenchmarking = ({ text }: MemoBenchmarkingProps) => {
  if (!text) return null;
  
  // Guard against objects being passed instead of strings
  const safeText = typeof text === 'string' ? text : String(text || '');

  return (
    <div className="relative overflow-hidden rounded-xl border border-muted/50 bg-gradient-to-br from-muted/20 to-muted/10 p-6 mt-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/30">
          <TrendingUp className="w-5 h-5 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Market Benchmarking</h3>
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
