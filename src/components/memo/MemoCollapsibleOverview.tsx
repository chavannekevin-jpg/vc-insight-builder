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

// Helper to safely convert to string
const safeString = (val: unknown): string => {
  if (typeof val === 'string') return val;
  if (val === null || val === undefined) return '';
  return String(val);
};

export const MemoCollapsibleOverview = ({ 
  paragraphs, 
  highlights, 
  keyPoints, 
  defaultOpen = true 
}: MemoCollapsibleOverviewProps) => {
  // Filter out invalid data structures
  const validParagraphs = paragraphs?.filter(p => p && (typeof p.text === 'string' || p.text)) || [];
  const validHighlights = highlights?.filter(h => h && (typeof h.metric === 'string' || h.metric)) || [];
  const validKeyPoints = keyPoints?.filter(k => typeof k === 'string' || k) || [];
  
  const hasContent = validParagraphs.length > 0 || 
                     validHighlights.length > 0 || 
                     validKeyPoints.length > 0;

  if (!hasContent) return null;

  return (
    <div className="mt-4 space-y-6">
      {/* Narrative */}
      {validParagraphs.length > 0 && (
        <MemoNarrative paragraphs={validParagraphs} />
      )}

      {/* Key Metrics */}
      {validHighlights.length > 0 && (
        <div className="pt-4 border-t border-border/30">
          <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Key Metrics</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {validHighlights.map((highlight, i) => (
              <MemoHighlight 
                key={i} 
                metric={safeString(highlight.metric)} 
                label={safeString(highlight.label)} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Key Takeaways */}
      {validKeyPoints.length > 0 && (
        <div className="pt-4 border-t border-border/30">
          <MemoKeyPoints points={validKeyPoints.map(k => safeString(k))} />
        </div>
      )}
    </div>
  );
};
