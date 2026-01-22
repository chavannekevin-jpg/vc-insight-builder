import { Flame, Lock, Telescope, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

export interface ARCClassification {
  type: "Hair on Fire" | "Hard Fact" | "Future Vision";
  reasoning: string;
  implications: string;
  confidence?: number;
}

interface ARCClassificationCardProps {
  classification: ARCClassification;
  companyName: string;
}

const ARC_CONFIG = {
  "Hair on Fire": {
    icon: Flame,
    accentColor: "text-orange-400",
    glowColor: "shadow-orange-500/20",
    borderAccent: "border-l-orange-500",
    bgGlow: "from-orange-500/5 via-transparent to-transparent",
    gtmImplication: "Speed wins. Out-execute competitors with superior distribution.",
    description: "Customers have an urgent, painful problem they're actively seeking solutions for."
  },
  "Hard Fact": {
    icon: Lock,
    accentColor: "text-blue-400",
    glowColor: "shadow-blue-500/20",
    borderAccent: "border-l-blue-500",
    bgGlow: "from-blue-500/5 via-transparent to-transparent",
    gtmImplication: "Educate the market. Create 'epiphany' moments that reveal hidden costs.",
    description: "The problem is real but customers don't realize they have it or underestimate its impact."
  },
  "Future Vision": {
    icon: Telescope,
    accentColor: "text-violet-400",
    glowColor: "shadow-violet-500/20",
    borderAccent: "border-l-violet-500",
    bgGlow: "from-violet-500/5 via-transparent to-transparent",
    gtmImplication: "Build conviction. Find commercial pit-stops on the journey to the vision.",
    description: "The product enables something that wasn't possible before. A new category is being created."
  }
};

export function ARCClassificationCard({ classification, companyName }: ARCClassificationCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const config = ARC_CONFIG[classification.type] || ARC_CONFIG["Hair on Fire"];
  const Icon = config.icon;
  
  return (
    <div className={`relative mb-8 rounded-xl border border-border/40 bg-gradient-to-r ${config.bgGlow} backdrop-blur-sm overflow-hidden`}>
      {/* Subtle left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.borderAccent}`} />
      
      <div className="p-5 pl-6">
        {/* Header row */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-background/60 ${config.glowColor} shadow-lg`}>
              <Icon className={`w-5 h-5 ${config.accentColor}`} />
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-0.5">
                Problem Archetype
              </p>
              <h3 className={`text-lg font-semibold ${config.accentColor}`}>
                {classification.type}
              </h3>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className="text-[10px] font-medium text-muted-foreground border-border/50 bg-background/40"
          >
            <Sparkles className="w-3 h-3 mr-1.5 opacity-60" />
            Sequoia ARC
          </Badge>
        </div>
        
        {/* Reasoning */}
        <p className="text-sm text-foreground/80 leading-relaxed mb-4">
          <span className="font-medium text-foreground">{companyName}</span> {classification.reasoning}
        </p>
        
        {/* Strategic Implication - subtle inline */}
        <div className="flex items-start gap-2.5 text-sm">
          <span className="text-muted-foreground shrink-0">→</span>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground/70">Strategy:</span>{" "}
            {classification.implications || config.gtmImplication}
          </p>
        </div>
        
        {/* Collapsible Learn More */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="mt-4 text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors flex items-center gap-1">
            {isOpen ? "Hide" : "Learn more"} about archetypes
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <div className="grid gap-2 pl-1">
              {Object.entries(ARC_CONFIG).map(([type, cfg]) => {
                const TypeIcon = cfg.icon;
                const isActive = type === classification.type;
                return (
                  <div 
                    key={type} 
                    className={`flex items-center gap-3 py-1.5 px-2 rounded-md transition-all ${
                      isActive 
                        ? 'bg-background/50 border border-border/30' 
                        : 'opacity-50'
                    }`}
                  >
                    <TypeIcon className={`w-3.5 h-3.5 ${cfg.accentColor}`} />
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs ${isActive ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                        {type}
                      </span>
                      <p className="text-[10px] text-muted-foreground/70 truncate">
                        {cfg.description}
                      </p>
                    </div>
                    {isActive && (
                      <span className="text-[9px] font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                        Current
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
