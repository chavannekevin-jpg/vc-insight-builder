import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sparkles,
  Edit,
  Building2,
  FileText,
  BookOpen,
  Calculator,
  Shield,
  LogOut,
  RotateCcw,
  LayoutDashboard,
  Settings,
  Trash2,
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FounderSidebarProps {
  isAdmin: boolean;
  hasPaid: boolean;
  matchingFunds: number;
  onResetClick: () => void;
  onDeleteAccountClick: () => void;
  onFundDiscoveryClick: () => void;
}

const mainMenuItems = [
  { title: "Dashboard", path: "/hub", icon: LayoutDashboard },
  { title: "My Profile", path: "/company-profile", icon: Edit },
  { title: "Sample Analysis", path: "/sample-memo", icon: FileText },
];

const resourcesMenuItems = [
  { title: "Knowledge Library", path: "/vcbrain", icon: BookOpen },
  { title: "Tools", path: "/tools", icon: Calculator },
];

export const FounderSidebar = ({
  isAdmin,
  hasPaid,
  matchingFunds,
  onResetClick,
  onDeleteAccountClick,
  onFundDiscoveryClick,
}: FounderSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar
      className={cn(
        "border-r border-border/40 bg-gradient-to-b from-card via-card to-background transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
      collapsible="icon"
    >
      <SidebarContent className="flex flex-col h-full">
        {/* Logo Section */}
        <div className={cn(
          "p-4 border-b border-border/30 flex items-center",
          collapsed ? "justify-center" : "gap-3"
        )}>
          <button 
            onClick={() => navigate("/")}
            className="text-xl font-display font-black tracking-tight neon-pink hover:scale-105 transition-transform"
          >
            {collapsed ? "U" : "UglyBaby"}
          </button>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={cn(collapsed && "sr-only")}>
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "w-full transition-all",
                      isActive(item.path)
                        ? "bg-primary/20 text-primary border-l-2 border-primary"
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* VC Network - special handling */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => {
                    if (hasPaid) {
                      navigate("/fund-discovery");
                    } else {
                      onFundDiscoveryClick();
                    }
                  }}
                  className={cn(
                    "w-full transition-all",
                    isActive("/fund-discovery")
                      ? "bg-primary/20 text-primary border-l-2 border-primary"
                      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Building2 className="w-4 h-4 shrink-0" />
                  {!collapsed && (
                    <span className="flex items-center gap-2">
                      VC Network
                      {!hasPaid && matchingFunds > 0 && (
                        <span className="px-1.5 py-0.5 bg-primary/20 text-primary rounded text-[10px] font-bold">
                          {matchingFunds}+
                        </span>
                      )}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Resources */}
        <SidebarGroup>
          <SidebarGroupLabel className={cn(collapsed && "sr-only")}>
            Resources
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourcesMenuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "w-full transition-all",
                      isActive(item.path)
                        ? "bg-primary/20 text-primary border-l-2 border-primary"
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className={cn(collapsed && "sr-only")}>
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate("/admin")}
                    className={cn(
                      "w-full transition-all",
                      isActive("/admin")
                        ? "bg-primary/20 text-primary border-l-2 border-primary"
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Shield className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>Admin Panel</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={onResetClick}
                    className="w-full text-warning hover:bg-warning/10 hover:text-warning transition-all"
                  >
                    <RotateCcw className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>Reset Flow</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom Actions */}
        <SidebarGroup className="mt-auto border-t border-border/30 pt-2">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onDeleteAccountClick}
                  className="w-full text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-all"
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>Delete Account</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
