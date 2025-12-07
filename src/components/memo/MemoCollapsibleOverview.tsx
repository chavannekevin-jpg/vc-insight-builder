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
  const hasContent = (paragraphs && paragraphs.length > 0) || 
                     (highlights && highlights.length > 0) || 
                     (keyPoints && keyPoints.length > 0);

  if (!hasContent) return null;

  return (
    <div className="mt-4 space-y-6">
      {/* Narrative */}
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
    </div>
  );
};
