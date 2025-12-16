import { useNavigate, useLocation } from "react-router-dom";
import { Building2, LayoutDashboard, Grid3X3, BarChart3, GitCompare } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEMO_ACCELERATOR } from "@/data/acceleratorDemo/acceleratorProfile";

const navItems = [
  { label: "Dashboard", path: "/accelerator-demo", icon: LayoutDashboard },
  { label: "Cohort", path: "/accelerator-demo/cohort", icon: Grid3X3 },
  { label: "Analytics", path: "/accelerator-demo/analytics", icon: BarChart3 },
  { label: "Compare", path: "/accelerator-demo/compare", icon: GitCompare },
];

export const AcceleratorDemoHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Accelerator Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-lg text-foreground">{DEMO_ACCELERATOR.name}</h1>
              <p className="text-xs text-muted-foreground">{DEMO_ACCELERATOR.batchName}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "gradient-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Week Badge */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full border border-primary/20">
            <span className="text-xs text-muted-foreground font-medium">Week</span>
            <span className="text-sm font-bold text-primary">{DEMO_ACCELERATOR.currentWeek}</span>
            <span className="text-xs text-muted-foreground">/ 12</span>
          </div>
        </div>
      </div>
    </header>
  );
};
