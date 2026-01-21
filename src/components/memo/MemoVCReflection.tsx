import { Eye, Info } from "lucide-react";
import { renderMarkdownText } from "@/lib/markdownParser";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">VC Perspective</h3>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm p-4 bg-background/98 border-2 border-primary/30 shadow-2xl">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                    How VCs think about this
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    This section synthesizes how an experienced VC partner would evaluate this aspect of your business. It reflects the pattern-matching and risk assessment that happens in investment committee discussions.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
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
