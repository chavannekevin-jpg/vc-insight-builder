import { Flame, Lock, Telescope, HelpCircle, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
    color: "from-orange-500/20 to-red-500/20",
    borderColor: "border-orange-500/30",
    badgeClass: "bg-orange-500/10 text-orange-600 border-orange-500/30",
    iconColor: "text-orange-500",
    gtmImplication: "Speed wins. Out-execute competitors with superior distribution.",
    description: "Customers have an urgent, painful problem they're actively seeking solutions for. They know they have a problem and are spending money on suboptimal alternatives."
  },
  "Hard Fact": {
    icon: Lock,
    color: "from-blue-500/20 to-purple-500/20",
    borderColor: "border-blue-500/30",
    badgeClass: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    iconColor: "text-blue-500",
    gtmImplication: "Educate the market. Create 'epiphany' moments that reveal hidden costs.",
    description: "The problem is real but customers don't realize they have it or underestimate its impact. Success requires revealing an uncomfortable truth they've been ignoring."
  },
  "Future Vision": {
    icon: Telescope,
    color: "from-indigo-500/20 to-violet-500/20",
    borderColor: "border-indigo-500/30",
    badgeClass: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
    iconColor: "text-indigo-500",
    gtmImplication: "Build conviction. Find commercial pit-stops on the journey to the vision.",
    description: "The product enables something that wasn't possible before. Customers don't know they want it yet because the category is being created."
  }
};

export function ARCClassificationCard({ classification, companyName }: ARCClassificationCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const config = ARC_CONFIG[classification.type] || ARC_CONFIG["Hair on Fire"];
  const Icon = config.icon;
  
  return (
    <Card className={`mb-8 border ${config.borderColor} bg-gradient-to-br ${config.color} overflow-hidden`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-background/80 backdrop-blur-sm shadow-sm`}>
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Problem Archetype
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-sm">
                        Based on Sequoia's "Archetypes of Successful Companies" framework. 
                        This classification helps determine the right go-to-market strategy.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                {classification.type}
              </h3>
            </div>
          </div>
          <Badge variant="outline" className={config.badgeClass}>
            Sequoia ARC Framework
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Reasoning */}
        <div className="bg-background/60 backdrop-blur-sm rounded-lg p-4 border border-border/50">
          <p className="text-sm text-foreground leading-relaxed">
            <span className="font-medium">{companyName}</span> {classification.reasoning}
          </p>
        </div>
        
        {/* GTM Implication */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <div className="mt-0.5">
            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-primary mb-0.5">Strategic Implication</p>
            <p className="text-sm text-foreground">{classification.implications || config.gtmImplication}</p>
          </div>
        </div>
        
        {/* Collapsible Explanation */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-2">
            <span>What does "{classification.type}" mean?</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground leading-relaxed">
              <p className="mb-3">{config.description}</p>
              <div className="grid gap-2 mt-4">
                {Object.entries(ARC_CONFIG).map(([type, cfg]) => {
                  const TypeIcon = cfg.icon;
                  const isActive = type === classification.type;
                  return (
                    <div 
                      key={type} 
                      className={`flex items-center gap-3 p-2 rounded-md transition-colors ${
                        isActive ? 'bg-background/80 border border-border/50' : 'opacity-60'
                      }`}
                    >
                      <TypeIcon className={`w-4 h-4 ${cfg.iconColor}`} />
                      <span className={`text-sm ${isActive ? 'font-medium text-foreground' : ''}`}>
                        {type}
                      </span>
                      {isActive && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          This company
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
