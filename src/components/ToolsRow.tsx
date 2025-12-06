import { Calculator, TrendingUp, Lock, Zap, Mail, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ModernCard } from "./ModernCard";
import { Badge } from "./ui/badge";

export const ToolsRow = () => {
  const navigate = useNavigate();

  const tools = [
    {
      id: "raise-calculator",
      icon: Calculator,
      title: "Raise Calculator",
      description: "Plan your funding round",
      available: true,
      path: "/raise-calculator"
    },
    {
      id: "valuation-calculator",
      icon: TrendingUp,
      title: "Valuation Calculator",
      description: "Estimate your startup's value",
      available: true,
      path: "/valuation-calculator"
    },
    {
      id: "venture-scale-diagnostic",
      icon: Zap,
      title: "Venture Scale Diagnostic",
      description: "Reality check: Are you truly VC-scale?",
      available: true,
      path: "/venture-scale-diagnostic",
      badge: "New"
    },
    {
      id: "investor-email-generator",
      icon: Mail,
      title: "Outreach Lab",
      description: "Craft cold email templates from your memo",
      available: true,
      path: "/investor-email-generator",
      badge: "Memo Required"
    },
    {
      id: "roast-your-baby",
      icon: Flame,
      title: "Roast Your Baby",
      description: "Survive 10 brutal VC questions",
      available: true,
      path: "/roast-your-baby",
      badge: "Premium"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-display font-semibold">Founder Tools</h3>
        <p className="text-sm text-muted-foreground">Free calculators to help you plan</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <ModernCard
              key={tool.id}
              hover={tool.available}
              onClick={tool.available ? () => navigate(tool.path) : undefined}
              className={!tool.available ? "opacity-50" : ""}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {tool.available ? (
                    <Icon className="w-6 h-6 text-primary" />
                  ) : (
                    <Lock className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{tool.title}</h4>
                    {tool.badge && (
                      <Badge className="bg-primary/20 text-primary border-primary/40 text-xs">
                        {tool.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </div>
              </div>
            </ModernCard>
          );
        })}
      </div>
    </div>
  );
};