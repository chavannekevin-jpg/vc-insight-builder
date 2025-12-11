import { MemoParagraph } from "@/types/memo";
import { TooltipProvider } from "@/components/ui/tooltip";
import { parseMarkdownBold } from "@/lib/markdownParser";
import { 
  frameworkIcons, 
  frameworkPatterns, 
  getFrameworkIcon, 
  FrameworkHighlight 
} from "@/lib/frameworkUtils";

interface MemoNarrativeProps {
  paragraphs: MemoParagraph[];
}

// Helper to safely convert any value to string
const safeText = (text: unknown): string => {
  if (typeof text === 'string') return text;
  if (text === null || text === undefined) return '';
  if (typeof text === 'object') {
    console.warn('MemoNarrative received object instead of string:', text);
    return JSON.stringify(text);
  }
  return String(text);
};

const highlightFrameworks = (text: unknown): React.ReactNode => {
  const safeString = safeText(text);
  if (!safeString) return null;
  
  // First parse markdown bold, then highlight frameworks
  const parsedBold = parseMarkdownBold(safeString);
  
  return parsedBold.map((part, partIndex) => {
    // If it's already a React element (bold text), leave it
    if (typeof part !== 'string') {
      return <span key={`part-${partIndex}`}>{part}</span>;
    }
    
    // Apply framework highlighting to string parts
    let segments: Array<{ text: string; isFramework: boolean }> = [{ text: part, isFramework: false }];
    
    for (const pattern of frameworkPatterns) {
      const newSegments: Array<{ text: string; isFramework: boolean }> = [];
      
      for (const segment of segments) {
        if (segment.isFramework) {
          newSegments.push(segment);
          continue;
        }
        
        let lastIndex = 0;
        let match;
        const regex = new RegExp(pattern.source, pattern.flags);
        
        while ((match = regex.exec(segment.text)) !== null) {
          if (match.index > lastIndex) {
            newSegments.push({ text: segment.text.slice(lastIndex, match.index), isFramework: false });
          }
          newSegments.push({ text: match[0], isFramework: true });
          lastIndex = match.index + match[0].length;
        }
        
        if (lastIndex < segment.text.length) {
          newSegments.push({ text: segment.text.slice(lastIndex), isFramework: false });
        }
      }
      
      segments = newSegments.length > 0 ? newSegments : segments;
    }
    
    return (
      <span key={`part-${partIndex}`}>
        {segments.map((segment, i) => 
          segment.isFramework ? (
            <FrameworkHighlight key={i} text={segment.text} />
          ) : (
            <span key={i}>{segment.text}</span>
          )
        )}
      </span>
    );
  });
};

export const MemoNarrative = ({ paragraphs }: MemoNarrativeProps) => {
  if (!paragraphs || paragraphs.length === 0) return null;

  // Filter out invalid paragraphs and ensure text is string
  const validParagraphs = paragraphs.filter(p => p && (typeof p.text === 'string' || p.text));

  // Check if any paragraph contains a framework reference
  const hasFramework = validParagraphs.some(p => {
    const text = safeText(p.text).toLowerCase();
    return Object.keys(frameworkIcons).some(key => text.includes(key));
  });

  // Get the primary framework icon if present
  const PrimaryIcon = hasFramework 
    ? validParagraphs.reduce<React.ElementType | null>((acc, p) => acc || getFrameworkIcon(safeText(p.text)), null)
    : null;

  return (
    <TooltipProvider>
      <div className="prose prose-lg max-w-none">
        {/* Framework callout if detected */}
        {PrimaryIcon && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 pb-3 border-b border-pink-500/30">
            <PrimaryIcon className="w-4 h-4 text-pink-500" />
            <span className="font-medium text-pink-500">VC Framework Applied</span>
            <span className="text-xs text-muted-foreground/70 ml-auto">Hover pink terms for definitions</span>
          </div>
        )}

        <div className="space-y-5">
          {validParagraphs.map((paragraph, index) => {
            const isQuote = paragraph.emphasis === "quote";
            const paragraphText = safeText(paragraph.text);
            
            if (isQuote) {
              return (
                <blockquote 
                  key={index}
                  className="border-l-4 border-pink-500 pl-5 py-2 my-6 italic text-foreground/80 bg-muted/30 rounded-r-lg pr-4"
                >
                  <p className="text-base leading-relaxed m-0">
                    {highlightFrameworks(paragraphText)}
                  </p>
                </blockquote>
              );
            }

            // First paragraph gets larger treatment
            if (index === 0) {
              return (
                <p 
                  key={index}
                  className="text-lg text-foreground leading-relaxed first-letter:text-2xl first-letter:font-bold first-letter:text-foreground"
                >
                  {highlightFrameworks(paragraphText)}
                </p>
              );
            }

            return (
              <p 
                key={index}
                className="text-base text-foreground/90 leading-relaxed"
              >
                {highlightFrameworks(paragraphText)}
              </p>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};