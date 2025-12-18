import React from "react";
import { Flame, Lock, Network, TrendingUp, Target, Zap, Database, Users } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { safeLower } from "@/lib/stringUtils";

// Framework icons for visual callouts
export const frameworkIcons: Record<string, React.ElementType> = {
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
export const frameworkDefinitions: Record<string, string> = {
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
  
  // Additional terms for rejection preview
  "unit economics": "The direct revenues and costs associated with a single customer or transaction — the foundation of business viability.",
  "market pull": "Evidence that customers are actively seeking and paying for a solution — demand-driven rather than supply-pushed.",
  "defensibility": "Barriers that protect a business from competition — moats that make it hard for others to replicate success.",
  "venture scale": "Potential to generate 100x+ returns — the magnitude of outcome VCs need given power law dynamics.",
  "traction": "Quantifiable evidence of market demand — revenue, users, engagement, or other proof points.",
  "runway": "Months of operation remaining at current burn rate — time until the company runs out of money.",
  "burn rate": "Monthly cash expenditure — the speed at which a startup consumes its capital.",
  "pmf": "Product-Market Fit: when a product strongly satisfies market demand — the holy grail of early-stage startups.",
  "product-market fit": "When a product strongly satisfies market demand — customers love it and retention is high.",
};

// Regex patterns for detecting framework mentions
export const frameworkPatterns = [
  /\b(Hair on Fire|Hard Fact|Future Vision)\b/gi,
  /\b(Network Effects?|Scale Econom(?:ies|y)|Switching Costs?|Counter-Positioning|Cornered Resource|Process Power|Branding)\b/gi,
  /\b(Product-Led Growth|PLG|Sales-Led|Community-Led)\b/gi,
  /\b(LTV:?CAC|CAC Payback|Gross Margin|Magic Number)\b/gi,
  /\b(Painkiller|Vitamin)\b/gi,
  /\b(Power Law|Fund Returner)\b/gi,
  /\b(TAM|SAM|SOM)\b/gi,
  /\b(Red Ocean|Blue Ocean|Purple Ocean)\b/gi,
  /\b(Beachhead|Category Creation)\b/gi,
  /\b(Unit Economics|Market Pull|Defensibility|Venture Scale|Traction|Runway|Burn Rate|PMF|Product-Market Fit)\b/gi,
];

export const getFrameworkIcon = (text: unknown): React.ElementType | null => {
  const lowerText = safeLower(text, "getFrameworkIcon");
  for (const [key, icon] of Object.entries(frameworkIcons)) {
    if (lowerText.includes(key)) return icon;
  }
  return null;
};

export const getFrameworkDefinition = (text: unknown): string | null => {
  const lowerText = safeLower(text, "getFrameworkDefinition");
  for (const [key, definition] of Object.entries(frameworkDefinitions)) {
    if (lowerText === key || lowerText.includes(key)) {
      return definition;
    }
  }
  return null;
};

// Framework highlight component with tooltip - pink styling
export const FrameworkHighlight = ({ text }: { text: string }) => {
  const definition = getFrameworkDefinition(text);
  
  if (!definition) {
    return (
      <span className="font-semibold text-pink-500 bg-pink-500/10 px-1.5 py-0.5 rounded-md">
        {text}
      </span>
    );
  }
  
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <span className="font-semibold text-pink-500 bg-pink-500/10 px-1.5 py-0.5 rounded-md cursor-help border-b border-dashed border-pink-500/50 transition-colors hover:bg-pink-500/20">
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

// Utility to highlight framework terms in text
export const highlightFrameworksInText = (text: string): React.ReactNode => {
  let segments: Array<{ text: string; isFramework: boolean }> = [{ text, isFramework: false }];
  
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
    <>
      {segments.map((segment, i) => 
        segment.isFramework ? (
          <FrameworkHighlight key={i} text={segment.text} />
        ) : (
          <span key={i}>{segment.text}</span>
        )
      )}
    </>
  );
};
