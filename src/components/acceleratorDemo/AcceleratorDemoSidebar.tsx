import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Layers,
  Mail,
  BarChart3,
  Settings,
  Building2,
  HelpCircle,
  BookOpen,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { DEMO_ACCELERATOR } from "@/data/acceleratorDemo/acceleratorProfile";

const mainMenuItems = [
  { title: "Overview", icon: LayoutDashboard, path: "/accelerator-demo", tourId: "tour-overview" },
  { title: "Portfolio", icon: Briefcase, path: "/accelerator-demo/cohort", tourId: "tour-portfolio" },
  { title: "Cohorts", icon: Layers, path: null, tourId: "tour-cohorts", disabled: true },
  { title: "Team", icon: Users, path: null, tourId: "tour-team", disabled: true },
];

const toolsMenuItems = [
  { title: "Invites", icon: Mail, path: null, tourId: "tour-invites", disabled: true },
  { title: "Analytics", icon: BarChart3, path: "/accelerator-demo/analytics", tourId: "tour-analytics" },
];

interface AcceleratorDemoSidebarProps {
  onRestartTour?: () => void;
}

export function AcceleratorDemoSidebar({ onRestartTour }: AcceleratorDemoSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, setOpen } = useSidebar();
  const collapsed = state === "collapsed";

  const handleMouseEnter = () => {
    if (collapsed) {
      setOpen(true);
    }
  };

  const handleMouseLeave = () => {
    setOpen(false);
  };

  const isActive = (path: string | null) => {
    if (!path) return false;
    if (path === "/accelerator-demo") {
      return location.pathname === "/accelerator-demo";
    }
    return location.pathname.startsWith(path);
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r border-white/[0.06] bg-gradient-to-b from-card/60 via-card/40 to-card/60 backdrop-blur-2xl"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SidebarContent className="flex flex-col h-full">
        {/* Accelerator Profile Section */}
        <div className={`p-4 border-b border-white/[0.06] ${collapsed ? "px-2" : ""}`}>
          <div className={`flex items-center gap-3 ${!collapsed ? "p-3 rounded-xl bg-white/[0.04] border border-white/[0.04]" : ""}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
              {getInitials(DEMO_ACCELERATOR.name)}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate text-foreground">{DEMO_ACCELERATOR.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Demo</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Menu */}
        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium px-4 mb-1">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title} id={item.tourId}>
                  <SidebarMenuButton
                    onClick={() => item.path && navigate(item.path)}
                    isActive={isActive(item.path)}
                    tooltip={item.title}
                    disabled={item.disabled}
                    className={`group relative rounded-xl transition-all duration-300 ${
                      isActive(item.path)
                        ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(var(--primary),0.1)]" 
                        : item.disabled
                          ? "text-muted-foreground/30 cursor-not-allowed"
                          : "hover:bg-white/[0.04] text-muted-foreground/70 hover:text-foreground"
                    }`}
                  >
                    {isActive(item.path) && (
                      <motion.div
                        layoutId="demoActiveIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full"
                      />
                    )}
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium text-sm flex-1">{item.title}</span>
                    {item.disabled && !collapsed && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground/50">
                        Demo
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tools Menu */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium px-4 mb-1">
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {toolsMenuItems.map((item) => (
                <SidebarMenuItem key={item.title} id={item.tourId}>
                  <SidebarMenuButton
                    onClick={() => item.path && navigate(item.path)}
                    isActive={isActive(item.path)}
                    tooltip={item.title}
                    disabled={item.disabled}
                    className={`group relative rounded-xl transition-all duration-300 ${
                      isActive(item.path)
                        ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(var(--primary),0.1)]" 
                        : item.disabled
                          ? "text-muted-foreground/30 cursor-not-allowed"
                          : "hover:bg-white/[0.04] text-muted-foreground/70 hover:text-foreground"
                    }`}
                  >
                    {isActive(item.path) && (
                      <motion.div
                        layoutId="demoActiveIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full"
                      />
                    )}
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium text-sm flex-1">{item.title}</span>
                    {item.disabled && !collapsed && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground/50">
                        Demo
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Guides Menu */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium px-4 mb-1">
            Guides
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Product Guide"
                  disabled
                  className="group rounded-xl transition-all duration-300 text-muted-foreground/30 cursor-not-allowed"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span className="font-medium text-sm flex-1">Product Guide</span>
                  {!collapsed && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground/50">
                      Demo
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Startup Guide"
                  disabled
                  className="group rounded-xl transition-all duration-300 text-muted-foreground/30 cursor-not-allowed"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="font-medium text-sm flex-1">Startup Guide</span>
                  {!collapsed && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground/50">
                      Demo
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer Actions */}
        <SidebarGroup className="border-t border-white/[0.06] pt-2 pb-2">
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {onRestartTour && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={onRestartTour}
                    tooltip="Restart Tour"
                    className="group rounded-xl transition-all duration-300 hover:bg-white/[0.04] text-muted-foreground/70 hover:text-foreground"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="font-medium text-sm">Restart Tour</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate("/accelerators")}
                  tooltip="Back to Landing"
                  className="group rounded-xl transition-all duration-300 hover:bg-primary/10 text-primary hover:text-primary"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="font-medium text-sm">Back to Landing</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
