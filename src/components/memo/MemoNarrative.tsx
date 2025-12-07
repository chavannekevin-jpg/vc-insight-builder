import { Flame, Lock, Network, Users, TrendingUp, Target, Zap, Database } from "lucide-react";
import { MemoParagraph } from "@/types/memo";

interface MemoNarrativeProps {
  paragraphs: MemoParagraph[];
}

// Framework icons for visual callouts
const frameworkIcons: Record<string, React.ElementType> = {
  "hair on fire": Flame,
  "hard fact": Lock,
  "future vision": Target,
  "network effects": Network,
  "scale economies": TrendingUp,
  "switching costs": Lock,
  "counter-positioning": Zap,
  "cornered resource": Database,
  "process power": TrendingUp,
  "branding": Users,
};

const getFrameworkIcon = (text: string): React.ElementType | null => {
  const lowerText = text.toLowerCase();
  for (const [key, icon] of Object.entries(frameworkIcons)) {
    if (lowerText.includes(key)) return icon;
  }
  return null;
};

// Detect framework mentions for highlighting
const frameworkPatterns = [
  /\b(Hair on Fire|Hard Fact|Future Vision)\b/gi,
  /\b(Network Effects?|Scale Econom(ies|y)|Switching Costs?|Counter-Positioning|Cornered Resource|Process Power|Branding)\b/gi,
  /\b(Product-Led Growth|PLG|Sales-Led|Community-Led)\b/gi,
  /\b(LTV:?CAC|CAC Payback|Gross Margin|Magic Number)\b/gi,
  /\b(Painkiller|Vitamin)\b/gi,
  /\b(Power Law|TAM|SAM|SOM)\b/gi,
];

// Parse markdown bold (**text**) to styled spans
const parseMarkdownBold = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    // Add the bold text
    parts.push(
      <strong key={match.index} className="font-semibold text-foreground">
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
};

const highlightFrameworks = (text: string): React.ReactNode => {
  // First parse markdown bold, then highlight frameworks
  const parsedBold = parseMarkdownBold(text);
  
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
            <span 
              key={i} 
              className="font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md"
              title="VC Framework"
            >
              {segment.text}
            </span>
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

  // Check if any paragraph contains a framework reference
  const hasFramework = paragraphs.some(p => {
    const text = p.text.toLowerCase();
    return Object.keys(frameworkIcons).some(key => text.includes(key));
  });

  // Get the primary framework icon if present
  const PrimaryIcon = hasFramework 
    ? paragraphs.reduce<React.ElementType | null>((acc, p) => acc || getFrameworkIcon(p.text), null)
    : null;

  return (
    <div className="prose prose-lg max-w-none">
      {/* Framework callout if detected */}
      {PrimaryIcon && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 pb-3 border-b border-border/30">
          <PrimaryIcon className="w-4 h-4 text-primary" />
          <span className="font-medium">VC Framework Applied</span>
        </div>
      )}

      <div className="space-y-5">
        {paragraphs.map((paragraph, index) => {
          const isQuote = paragraph.emphasis === "quote";
          const isNarrative = paragraph.emphasis === "narrative" || paragraph.emphasis === "normal";
          
          if (isQuote) {
            return (
              <blockquote 
                key={index}
                className="border-l-4 border-primary pl-5 py-2 my-6 italic text-foreground/80 bg-muted/30 rounded-r-lg pr-4"
              >
                <p className="text-base leading-relaxed m-0">
                  {highlightFrameworks(paragraph.text)}
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
                {highlightFrameworks(paragraph.text)}
              </p>
            );
          }

          return (
            <p 
              key={index}
              className="text-base text-foreground/90 leading-relaxed"
            >
              {highlightFrameworks(paragraph.text)}
            </p>
          );
        })}
      </div>
    </div>
  );
};