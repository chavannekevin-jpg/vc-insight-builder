import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Layers,
  Mail,
  BarChart3,
  Settings,
  LogOut,
  Building2,
  UserPlus,
  Calendar,
  Copy,
  Check,
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const mainMenuItems = [
  { title: "Overview", icon: LayoutDashboard, section: "overview" },
  { title: "Portfolio", icon: Briefcase, section: "portfolio" },
  { title: "Cohorts", icon: Layers, section: "cohorts" },
  { title: "Team", icon: Users, section: "team" },
];

const toolsMenuItems = [
  { title: "Invites", icon: Mail, section: "invites" },
  { title: "Analytics", icon: BarChart3, section: "analytics" },
  { title: "Calendar", icon: Calendar, section: "calendar" },
];

const settingsMenuItems = [
  { title: "Settings", icon: Settings, section: "settings" },
];

interface AcceleratorSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  accelerator: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export function AcceleratorSidebar({ 
  activeSection, 
  onSectionChange, 
  accelerator 
}: AcceleratorSidebarProps) {
  const navigate = useNavigate();
  const { state, setOpen } = useSidebar();
  const collapsed = state === "collapsed";
  const [copied, setCopied] = useState(false);

  const handleMouseEnter = () => {
    if (collapsed) {
      setOpen(true);
    }
  };

  const handleMouseLeave = () => {
    setOpen(false);
  };

  const handleNavClick = (section: string) => {
    onSectionChange(section);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/accelerator/auth");
    toast.success("Signed out successfully");
  };

  const copySlug = () => {
    if (accelerator?.slug) {
      navigator.clipboard.writeText(`${window.location.origin}/join/${accelerator.slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Invite link copied!");
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r border-border/30 bg-gradient-to-b from-card/80 to-card/50 backdrop-blur-xl"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SidebarContent className="flex flex-col h-full">
        {/* Accelerator Profile Section */}
        <div className={`p-4 border-b border-border/30 ${collapsed ? "px-2" : ""}`}>
          <div className={`flex items-center gap-3 ${!collapsed ? "p-3 rounded-xl bg-gradient-to-br from-primary/5 to-transparent border border-border/30 hover:border-primary/20 transition-all duration-300" : ""}`}>
            <div className="relative group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-semibold flex-shrink-0 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all duration-300">
                {accelerator?.name ? getInitials(accelerator.name) : <Building2 className="w-5 h-5" />}
              </div>
              <div className="absolute inset-0 rounded-lg bg-primary/20 blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate text-foreground">{accelerator?.name || "Accelerator"}</p>
                <p className="text-xs text-muted-foreground/80 truncate">Ecosystem Dashboard</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Menu */}
        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium px-4">Main</SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.section}>
                  <SidebarMenuButton
                    onClick={() => handleNavClick(item.section)}
                    isActive={activeSection === item.section}
                    tooltip={item.title}
                    className={`group relative rounded-lg transition-all duration-200 ${
                      activeSection === item.section 
                        ? "bg-primary/10 text-primary shadow-sm before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-5 before:bg-primary before:rounded-r-full before:shadow-[0_0_8px_rgba(var(--primary),0.5)]" 
                        : "hover:bg-muted/50 hover:translate-x-0.5"
                    }`}
                  >
                    <item.icon className={`w-4 h-4 transition-transform duration-200 ${activeSection === item.section ? "scale-110" : "group-hover:scale-105"}`} />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tools Menu */}
        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium px-4">Tools</SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {toolsMenuItems.map((item) => (
                <SidebarMenuItem key={item.section}>
                  <SidebarMenuButton
                    onClick={() => handleNavClick(item.section)}
                    isActive={activeSection === item.section}
                    tooltip={item.title}
                    className={`group relative rounded-lg transition-all duration-200 ${
                      activeSection === item.section 
                        ? "bg-primary/10 text-primary shadow-sm before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-5 before:bg-primary before:rounded-r-full before:shadow-[0_0_8px_rgba(var(--primary),0.5)]" 
                        : "hover:bg-muted/50 hover:translate-x-0.5"
                    }`}
                  >
                    <item.icon className={`w-4 h-4 transition-transform duration-200 ${activeSection === item.section ? "scale-110" : "group-hover:scale-105"}`} />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Quick Invite Button */}
        {!collapsed && accelerator?.slug && (
          <div className="px-4 py-3">
            <button
              onClick={copySlug}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 hover:border-primary/40 transition-all group"
            >
              <UserPlus className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground flex-1 text-left">Invite Startups</span>
              {copied ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </button>
          </div>
        )}

        {/* Settings & Sign Out */}
        <SidebarGroup className="border-t border-border/30 pt-2">
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {settingsMenuItems.map((item) => (
                <SidebarMenuItem key={item.section}>
                  <SidebarMenuButton
                    onClick={() => handleNavClick(item.section)}
                    isActive={activeSection === item.section}
                    tooltip={item.title}
                    className={`group rounded-lg transition-all duration-200 ${
                      activeSection === item.section 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleSignOut}
                  tooltip="Sign Out"
                  className="group rounded-lg transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
