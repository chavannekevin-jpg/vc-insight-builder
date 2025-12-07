import { useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MemoCardGrid } from "./MemoCardGrid";
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
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div className="text-left">
              <span className="font-semibold text-foreground">Company Overview</span>
              <p className="text-xs text-muted-foreground">
                Key facts, metrics & takeaways
              </p>
            </div>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-6 pt-4">
        {/* Card Grid for paragraphs */}
        {paragraphs && paragraphs.length > 0 && (
          <MemoCardGrid paragraphs={paragraphs} />
        )}

        {/* Highlights */}
        {highlights && highlights.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highlights.map((highlight, i) => (
              <MemoHighlight key={i} metric={highlight.metric} label={highlight.label} />
            ))}
          </div>
        )}

        {/* Key Points */}
        {keyPoints && keyPoints.length > 0 && (
          <MemoKeyPoints points={keyPoints} />
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
