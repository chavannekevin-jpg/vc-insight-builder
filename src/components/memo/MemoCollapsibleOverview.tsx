import { useState } from "react";
import { ChevronDown, BookOpen } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MemoNarrative } from "./MemoNarrative";
import { MemoHighlight } from "./MemoHighlight";
import { MemoKeyPoints } from "./MemoKeyPoints";
import { MemoParagraph, MemoHighlight as MemoHighlightType } from "@/types/memo";

interface MemoCollapsibleOverviewProps {
  paragraphs?: MemoParagraph[];
  highlights?: MemoHighlightType[];
  keyPoints?: string[];
  defaultOpen?: boolean;
}

export const MemoCollapsibleOverview = ({ 
  paragraphs, 
  highlights, 
  keyPoints, 
  defaultOpen = true 
}: MemoCollapsibleOverviewProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const hasContent = (paragraphs && paragraphs.length > 0) || 
                     (highlights && highlights.length > 0) || 
                     (keyPoints && keyPoints.length > 0);

  if (!hasContent) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4">
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <span className="font-semibold text-foreground">VC-Style Analysis</span>
              <p className="text-xs text-muted-foreground">
                How investors would present this story
              </p>
            </div>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-6 pt-6 pl-2 pr-2">
        {/* VC-Style Narrative */}
        {paragraphs && paragraphs.length > 0 && (
          <MemoNarrative paragraphs={paragraphs} />
        )}

        {/* Key Metrics */}
        {highlights && highlights.length > 0 && (
          <div className="pt-4 border-t border-border/30">
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Key Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {highlights.map((highlight, i) => (
                <MemoHighlight key={i} metric={highlight.metric} label={highlight.label} />
              ))}
            </div>
          </div>
        )}

        {/* Key Takeaways */}
        {keyPoints && keyPoints.length > 0 && (
          <div className="pt-4 border-t border-border/30">
            <MemoKeyPoints points={keyPoints} />
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
