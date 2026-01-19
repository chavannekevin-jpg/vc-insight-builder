import { memo, useMemo } from "react";
import { Calculator, TrendingUp, Lock, Zap, Mail, Flame, FlaskConical, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ModernCard } from "./ModernCard";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface ToolsRowProps {
  memoGenerated?: boolean;
}

export const ToolsRow = memo(({ memoGenerated = false }: ToolsRowProps) => {
  const navigate = useNavigate();

  const tools = useMemo(() => [
    {
      id: "raise-calculator",
      icon: Calculator,
      title: "Raise Calculator",
      description: "Plan your funding round",
      available: memoGenerated,
      requiresMemo: true,
      path: "/raise-calculator",
      badge: "After Purchase",
      lockedReason: "Unlock your full analysis first"
    },
    {
      id: "valuation-calculator",
      icon: TrendingUp,
      title: "Valuation Calculator",
      description: "Estimate your startup's value",
      available: memoGenerated,
      requiresMemo: true,
      path: "/valuation-calculator",
      badge: "After Purchase",
      lockedReason: "Unlock your full analysis first"
    },
    {
      id: "venture-scale-diagnostic",
      icon: Zap,
      title: "Venture Scale Diagnostic",
      description: "Reality check: Are you truly VC-scale?",
      available: memoGenerated,
      requiresMemo: true,
      path: "/venture-scale-diagnostic",
      badge: "After Purchase",
      lockedReason: "Unlock your full analysis first"
    },
    {
      id: "investor-email-generator",
      icon: Mail,
      title: "Outreach Lab",
      description: "Craft cold email templates from your memo",
      available: memoGenerated,
      requiresMemo: true,
      path: "/investor-email-generator",
      badge: "After Purchase",
      lockedReason: "Unlock your full analysis first"
    },
    {
      id: "roast-your-baby",
      icon: Flame,
      title: "Roast Your Baby",
      description: "Survive 10 brutal VC questions",
      available: memoGenerated,
      requiresMemo: true,
      path: "/roast-your-baby",
      badge: "After Purchase",
      lockedReason: "Unlock your full analysis first"
    },
    {
      id: "dilution-lab",
      icon: FlaskConical,
      title: "Dilution Lab",
      description: "Simulate funding rounds & cap tables",
      available: memoGenerated,
      requiresMemo: true,
      path: "/dilution-lab",
      badge: "After Purchase",
      lockedReason: "Unlock your full analysis first"
    },
    {
      id: "fund-discovery",
      icon: Building2,
      title: "VC Network",
      description: "Explore funds in our investor network",
      available: memoGenerated,
      requiresMemo: true,
      path: "/fund-discovery",
      badge: "After Purchase",
      lockedReason: "Unlock your full analysis first"
    }
  ], [memoGenerated]);

  const renderToolCard = (tool: typeof tools[0]) => {
    const Icon = tool.icon;
    const isLocked = tool.requiresMemo && !tool.available;
    
    const cardContent = (
      <ModernCard
        hover={tool.available}
        onClick={tool.available ? () => navigate(tool.path) : undefined}
        className={isLocked ? "opacity-60 cursor-not-allowed" : ""}
      >
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isLocked ? "bg-muted" : "bg-primary/10"
          }`}>
            {isLocked ? (
              <Lock className="w-6 h-6 text-muted-foreground" />
            ) : (
              <Icon className="w-6 h-6 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`font-semibold ${isLocked ? "text-muted-foreground" : ""}`}>{tool.title}</h4>
              {tool.badge && (
                <Badge className={`text-xs ${
                  isLocked 
                    ? "bg-muted text-muted-foreground border-muted" 
                    : "bg-primary/20 text-primary border-primary/40"
                }`}>
                  {tool.badge}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{tool.description}</p>
          </div>
        </div>
      </ModernCard>
    );
    
    if (isLocked && tool.lockedReason) {
      return (
        <TooltipProvider key={tool.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>{cardContent}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tool.lockedReason}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    return <div key={tool.id}>{cardContent}</div>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-display font-semibold">Founder Tools</h3>
        <p className="text-sm text-muted-foreground">
          {memoGenerated ? "All tools unlocked" : "Purchase your analysis to unlock all tools"}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map(renderToolCard)}
      </div>
    </div>
  );
});

ToolsRow.displayName = "ToolsRow";