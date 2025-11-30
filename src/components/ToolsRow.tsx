import { Calculator, TrendingUp, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ModernCard } from "./ModernCard";

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
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-display font-semibold">Founder Tools</h3>
        <p className="text-sm text-muted-foreground">Free calculators to help you plan</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <h4 className="font-semibold mb-1">{tool.title}</h4>
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