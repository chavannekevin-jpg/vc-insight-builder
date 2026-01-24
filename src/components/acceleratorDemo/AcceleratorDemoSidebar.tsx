import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Layers,
  UserPlus,
  Settings,
  ArrowLeft,
  Building2,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AcceleratorDemoSidebarProps {
  onRestartTour?: () => void;
}

const navItems = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    path: "/accelerator-demo",
    tourId: "sidebar-overview"
  },
  {
    id: "portfolio",
    label: "Portfolio",
    icon: Users,
    path: "/accelerator-demo/cohort",
    tourId: "sidebar-portfolio"
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    path: "/accelerator-demo/analytics",
    tourId: "sidebar-analytics"
  },
  {
    id: "cohorts",
    label: "Cohorts",
    icon: Layers,
    path: null, // Disabled in demo
    tourId: "sidebar-cohorts",
    disabled: true
  },
  {
    id: "team",
    label: "Team",
    icon: UserPlus,
    path: null,
    tourId: "sidebar-team",
    disabled: true
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: null,
    tourId: "sidebar-settings",
    disabled: true
  }
];

export function AcceleratorDemoSidebar({ onRestartTour }: AcceleratorDemoSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const currentPath = location.pathname;

  return (
    <motion.aside
      className={cn(
        "fixed left-0 top-0 h-full bg-card/60 backdrop-blur-2xl border-r border-border/50 z-40 flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className={cn(
        "p-4 border-b border-border/50 flex items-center gap-3",
        isCollapsed && "justify-center"
      )}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5 text-primary-foreground" />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <h2 className="font-semibold text-foreground text-sm truncate">Ugly Baby's Foundry</h2>
            <p className="text-xs text-muted-foreground">Demo Mode</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border/50 flex items-center justify-center hover:bg-muted transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-muted-foreground" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === currentPath || 
            (item.path && currentPath.startsWith(item.path) && item.path !== "/accelerator-demo");
          
          return (
            <button
              key={item.id}
              id={item.tourId}
              onClick={() => item.path && !item.disabled && navigate(item.path)}
              disabled={item.disabled}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isCollapsed && "justify-center px-2",
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : item.disabled
                    ? "text-muted-foreground/40 cursor-not-allowed"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary")} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.disabled && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      Demo
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border/50 space-y-2">
        {onRestartTour && !isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRestartTour}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart Tour
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/accelerators")}
          className={cn(
            "w-full border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground",
            isCollapsed && "justify-center px-2"
          )}
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="ml-2">Back to Landing</span>}
        </Button>
      </div>
    </motion.aside>
  );
}
