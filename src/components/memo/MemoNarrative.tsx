import { Flame, Lock, Network, Users, TrendingUp, Target, Zap, Database } from "lucide-react";
import { MemoParagraph } from "@/types/memo";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { parseMarkdownBold } from "@/lib/markdownParser";

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

// VC Framework definitions for tooltips
const frameworkDefinitions: Record<string, string> = {
  // Sequoia PMF Archetypes
  "hair on fire": "Sequoia PMF Archetype: Urgent, obvious pain where customers are actively searching for solutions with budget already allocated.",
  "hard fact": "Sequoia PMF Archetype: Pain accepted as 'just how things are' — requires customer epiphany to recognize it's solvable.",
  "future vision": "Sequoia PMF Archetype: Sounds like science fiction today — requires belief in a new paradigm.",
  
  // 7 Powers
  "network effects": "7 Powers: Value increases with each additional user (e.g., marketplaces, social networks, data flywheels).",
  "network effect": "7 Powers: Value increases with each additional user (e.g., marketplaces, social networks, data flywheels).",
  "scale economies": "7 Powers: Unit costs decline as volume increases — near-zero marginal cost creates winner-take-most dynamics.",
  "scale economy": "7 Powers: Unit costs decline as volume increases — near-zero marginal cost creates winner-take-most dynamics.",
  "switching costs": "7 Powers: Lock-in through data, workflow, or integration depth — makes leaving painful and expensive.",
  "switching cost": "7 Powers: Lock-in through data, workflow, or integration depth — makes leaving painful and expensive.",
  "counter-positioning": "7 Powers: Incumbent can't copy without cannibalizing their core business model or existing revenue.",
  "cornered resource": "7 Powers: Exclusive access to talent, IP, data, regulatory advantage, or distribution that others cannot obtain.",
  "process power": "7 Powers: Embedded organizational capabilities and culture that competitors can't replicate quickly.",
  "branding": "7 Powers: Ability to charge premium prices due to perceived quality, trust, or emotional connection.",
  
  // Market Types
  "red ocean": "Crowded, commoditized market with intense competition fighting over existing demand — margins compressed.",
  "blue ocean": "Uncontested market space creating new demand — no direct competitors yet, higher margins possible.",
  "purple ocean": "Differentiated niche within an existing market — combining blue ocean innovation with red ocean market presence.",
  
  // Go-to-Market
  "beachhead": "Initial niche market to dominate before expanding — your first foothold to prove the model works.",
  "category creation": "Building a new market category rather than competing in an existing one — highest risk, highest reward.",
  
  // Product Types
  "painkiller": "Must-have solution addressing urgent pain — budget already allocated, sales cycle is shorter.",
  "vitamin": "Nice-to-have solution — often first to be cut when budgets tighten, harder to sell.",
  
  // Unit Economics
  "ltv:cac": "Lifetime Value to Customer Acquisition Cost ratio — healthy is 3:1 or better, under 3:1 is concerning.",
  "ltv cac": "Lifetime Value to Customer Acquisition Cost ratio — healthy is 3:1 or better, under 3:1 is concerning.",
  "cac payback": "Months to recover customer acquisition cost — target is under 18 months for SaaS.",
  "gross margin": "Revenue minus cost of goods sold — SaaS target is 70%+, marketplace varies by model.",
  "magic number": "SaaS efficiency metric: (ARR growth × Gross Margin) ÷ S&M spend — above 0.75 is efficient.",
  
  // VC Economics
  "power law": "VC reality: a few investments generate nearly all returns. VCs seek outlier potential, not average outcomes.",
  "fund returner": "A single investment that can return the entire fund — typically requires 20-50x return.",
  
  // Market Sizing
  "tam": "Total Addressable Market: theoretical maximum revenue if you captured 100% of the market.",
  "sam": "Serviceable Addressable Market: portion of TAM you can realistically target with your current product/model.",
  "som": "Serviceable Obtainable Market: portion of SAM you can capture in the near-term (1-3 years).",
  
  // Growth Models
  "product-led growth": "Growth driven by the product itself — users discover, adopt, and expand without sales involvement.",
  "plg": "Product-Led Growth: users discover, adopt, and expand without sales involvement.",
  "sales-led": "Growth driven by sales team outreach — typically higher ACV, longer sales cycles.",
  "community-led": "Growth driven by community engagement and word-of-mouth — strong brand loyalty.",
};

const getFrameworkIcon = (text: string): React.ElementType | null => {
  const lowerText = text.toLowerCase();
  for (const [key, icon] of Object.entries(frameworkIcons)) {
    if (lowerText.includes(key)) return icon;
  }
  return null;
};

// Get the definition for a framework term
const getFrameworkDefinition = (text: string): string | null => {
  const lowerText = text.toLowerCase();
  for (const [key, definition] of Object.entries(frameworkDefinitions)) {
    if (lowerText === key || lowerText.includes(key)) {
      return definition;
    }
  }
  return null;
};

// Detect framework mentions for highlighting
const frameworkPatterns = [
  /\b(Hair on Fire|Hard Fact|Future Vision)\b/gi,
  /\b(Network Effects?|Scale Econom(?:ies|y)|Switching Costs?|Counter-Positioning|Cornered Resource|Process Power|Branding)\b/gi,
  /\b(Product-Led Growth|PLG|Sales-Led|Community-Led)\b/gi,
  /\b(LTV:?CAC|CAC Payback|Gross Margin|Magic Number)\b/gi,
  /\b(Painkiller|Vitamin)\b/gi,
  /\b(Power Law|Fund Returner)\b/gi,
  /\b(TAM|SAM|SOM)\b/gi,
  /\b(Red Ocean|Blue Ocean|Purple Ocean)\b/gi,
  /\b(Beachhead|Category Creation)\b/gi,
];

// Framework highlight component with tooltip
const FrameworkHighlight = ({ text }: { text: string }) => {
  const definition = getFrameworkDefinition(text);
  
  if (!definition) {
    return (
      <span className="font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">
        {text}
      </span>
    );
  }
  
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <span className="font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md cursor-help border-b border-dashed border-primary/40">
          {text}
        </span>
      </TooltipTrigger>
      <TooltipContent 
        side="top" 
        className="max-w-xs text-sm bg-popover text-popover-foreground border shadow-lg"
      >
        <p>{definition}</p>
      </TooltipContent>
    </Tooltip>
  );
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
    <TooltipProvider>
      <div className="prose prose-lg max-w-none">
        {/* Framework callout if detected */}
        {PrimaryIcon && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 pb-3 border-b border-border/30">
            <PrimaryIcon className="w-4 h-4 text-primary" />
            <span className="font-medium">VC Framework Applied</span>
            <span className="text-xs text-muted-foreground/70 ml-auto">Hover highlighted terms for definitions</span>
          </div>
        )}

        <div className="space-y-5">
          {paragraphs.map((paragraph, index) => {
            const isQuote = paragraph.emphasis === "quote";
            
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
    </TooltipProvider>
  );
};