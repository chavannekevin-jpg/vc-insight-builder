import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  Trash2,
  Loader2,
  Shield,
  HelpCircle,
  BookOpen,
  Home,
  RotateCcw,
  Sparkles,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InviteStartupDialog } from "./InviteStartupDialog";
import { AcceleratorProductGuide } from "./AcceleratorProductGuide";
import { StartupGuideDialog } from "./StartupGuideDialog";

const mainMenuItems = [
  { title: "Overview", icon: LayoutDashboard, section: "overview", tourId: "tour-overview" },
  { title: "Portfolio", icon: Briefcase, section: "portfolio", tourId: "tour-portfolio" },
  { title: "Cohorts", icon: Layers, section: "cohorts", tourId: "tour-cohorts" },
  { title: "Team", icon: Users, section: "team", tourId: "tour-team" },
];

const toolsMenuItems = [
  { title: "Invites", icon: Mail, section: "invites", tourId: "tour-invites" },
  { title: "Analytics", icon: BarChart3, section: "analytics", tourId: "tour-analytics" },
  { title: "Calendar", icon: Calendar, section: "calendar", tourId: "tour-calendar" },
];

const settingsMenuItems = [
  { title: "Settings", icon: Settings, section: "settings", tourId: "tour-settings" },
];

interface AcceleratorSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  accelerator: {
    id: string;
    name: string;
    slug: string;
  } | null;
  onStartTour?: () => void;
  isDemo?: boolean;
  onRestartTour?: () => void;
}

export function AcceleratorSidebar({ 
  activeSection, 
  onSectionChange, 
  accelerator,
  onStartTour,
  isDemo = false,
  onRestartTour 
}: AcceleratorSidebarProps) {
  const navigate = useNavigate();
  const { state, setOpen } = useSidebar();
  const collapsed = state === "collapsed";
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [productGuideOpen, setProductGuideOpen] = useState(false);
  const [startupGuideOpen, setStartupGuideOpen] = useState(false);


  // Check if user has admin role
  useEffect(() => {
    const checkAdminRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      
      setIsAdmin(!!data);
    };
    
    checkAdminRole();
  }, []);

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

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.functions.invoke("delete-account");
      if (error) throw error;
      
      await supabase.auth.signOut();
      toast.success("Account deleted successfully");
      navigate("/");
    } catch (error: any) {
      console.error("Delete account error:", error);
      toast.error(error.message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
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
              {accelerator?.name ? getInitials(accelerator.name) : <Building2 className="w-5 h-5" />}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate text-foreground">{accelerator?.name || "Accelerator"}</p>
                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Ecosystem</p>
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
                <SidebarMenuItem key={item.section} id={item.tourId}>
                  <SidebarMenuButton
                    onClick={() => handleNavClick(item.section)}
                    isActive={activeSection === item.section}
                    tooltip={item.title}
                    className={`group relative rounded-xl transition-all duration-300 ${
                      activeSection === item.section 
                        ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(var(--primary),0.1)]" 
                        : "hover:bg-white/[0.04] text-muted-foreground/70 hover:text-foreground"
                    }`}
                  >
                    {activeSection === item.section && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full"
                      />
                    )}
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{item.title}</span>
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
                <SidebarMenuItem key={item.section} id={item.tourId}>
                  <SidebarMenuButton
                    onClick={() => handleNavClick(item.section)}
                    isActive={activeSection === item.section}
                    tooltip={item.title}
                    className={`group relative rounded-xl transition-all duration-300 ${
                      activeSection === item.section 
                        ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(var(--primary),0.1)]" 
                        : "hover:bg-white/[0.04] text-muted-foreground/70 hover:text-foreground"
                    }`}
                  >
                    {activeSection === item.section && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full"
                      />
                    )}
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{item.title}</span>
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
                  onClick={() => setProductGuideOpen(true)}
                  tooltip="Product Guide"
                  className="group rounded-xl transition-all duration-300 hover:bg-white/[0.04] text-muted-foreground/70 hover:text-foreground"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span className="font-medium text-sm">Product Guide</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setStartupGuideOpen(true)}
                  tooltip="Startup Guide"
                  className="group rounded-xl transition-all duration-300 hover:bg-white/[0.04] text-muted-foreground/70 hover:text-foreground"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="font-medium text-sm">Startup Guide</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Invite Startup Button - Hide in demo mode */}
        {!collapsed && accelerator && !isDemo && (
          <div className="px-4 py-3">
            <InviteStartupDialog accelerator={accelerator}>
              <button
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 hover:from-primary/20 hover:via-primary/15 hover:to-primary/10 border border-primary/20 hover:border-primary/30 transition-all duration-300 group shadow-[0_0_20px_rgba(var(--primary),0.05)] hover:shadow-[0_0_25px_rgba(var(--primary),0.1)]"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/25 to-primary/10 flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground flex-1 text-left">Invite Startups</span>
              </button>
            </InviteStartupDialog>
          </div>
        )}

        {/* Demo Mode CTA */}
        {!collapsed && isDemo && (
          <div className="px-4 py-3">
            <button
              onClick={() => navigate("/accelerator/signup")}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 hover:from-primary/20 hover:via-primary/15 hover:to-primary/10 border border-primary/20 hover:border-primary/30 transition-all duration-300 group shadow-[0_0_20px_rgba(var(--primary),0.05)] hover:shadow-[0_0_25px_rgba(var(--primary),0.1)]"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/25 to-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground flex-1 text-left">Create Your Ecosystem</span>
            </button>
          </div>
        )}

        {/* Settings & Sign Out - Production Mode */}
        {!isDemo && (
          <SidebarGroup className="border-t border-white/[0.06] pt-2 pb-2">
            <SidebarGroupContent className="px-2">
              <SidebarMenu>
                {settingsMenuItems.map((item) => (
                  <SidebarMenuItem key={item.section}>
                    <SidebarMenuButton
                      onClick={() => handleNavClick(item.section)}
                      isActive={activeSection === item.section}
                      tooltip={item.title}
                      className={`group rounded-xl transition-all duration-300 ${
                        activeSection === item.section 
                          ? "bg-primary/10 text-primary" 
                          : "hover:bg-white/[0.04] text-muted-foreground/70 hover:text-foreground"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {isAdmin && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => navigate("/admin")}
                      tooltip="Admin Panel"
                      className="group rounded-xl transition-all duration-300 hover:bg-warning/10 text-warning hover:translate-x-0.5"
                    >
                      <Shield className="w-4 h-4" />
                      <span className="font-medium text-sm">Admin Panel</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleSignOut}
                    tooltip="Sign Out"
                    className="group rounded-xl transition-all duration-300 hover:bg-white/[0.04] text-muted-foreground/70 hover:text-foreground"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium text-sm">Sign Out</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <SidebarMenuButton
                        tooltip="Delete Account"
                        className="group rounded-xl transition-all duration-300 hover:bg-destructive/10 text-muted-foreground/70 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="font-medium text-sm">Delete Account</span>
                      </SidebarMenuButton>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-border bg-card">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete your account and all associated data, including your accelerator ecosystem, cohorts, and team members. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Deleting...
                            </span>
                          ) : (
                            "Delete Account"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Demo Mode Footer */}
        {isDemo && (
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
                      <span className="font-medium text-sm">Take the Tour</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate("/")}
                    tooltip="Back to Home"
                    className="group rounded-xl transition-all duration-300 hover:bg-white/[0.04] text-muted-foreground/70 hover:text-foreground"
                  >
                    <Home className="w-4 h-4" />
                    <span className="font-medium text-sm">Back to Landing</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      
      {/* Guide Dialogs */}
      <AcceleratorProductGuide 
        open={productGuideOpen} 
        onOpenChange={setProductGuideOpen} 
        onComplete={onStartTour}
      />
      <StartupGuideDialog open={startupGuideOpen} onOpenChange={setStartupGuideOpen} acceleratorName={accelerator?.name} />
    </Sidebar>
  );
}
