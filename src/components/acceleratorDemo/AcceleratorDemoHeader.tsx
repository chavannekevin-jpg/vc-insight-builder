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
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Accelerator Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">{DEMO_ACCELERATOR.name}</h1>
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
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Week Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full">
            <span className="text-xs text-muted-foreground">Week</span>
            <span className="text-sm font-bold text-primary">{DEMO_ACCELERATOR.currentWeek}</span>
            <span className="text-xs text-muted-foreground">/ 12</span>
          </div>
        </div>
      </div>
    </header>
  );
};
