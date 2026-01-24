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
  Copy,
  Check,
  Trash2,
  Loader2,
  Shield,
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

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
      className="border-r border-border bg-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SidebarContent className="flex flex-col h-full">
        {/* Accelerator Profile Section */}
        <div className={`p-4 border-b border-border ${collapsed ? "px-2" : ""}`}>
          <div className={`flex items-center gap-3 ${!collapsed ? "p-3 rounded-lg bg-muted/50" : ""}`}>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
              {accelerator?.name ? getInitials(accelerator.name) : <Building2 className="w-5 h-5" />}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate text-foreground">{accelerator?.name || "Accelerator"}</p>
                <p className="text-xs text-muted-foreground">Ecosystem</p>
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
                <SidebarMenuItem key={item.section}>
                  <SidebarMenuButton
                    onClick={() => handleNavClick(item.section)}
                    isActive={activeSection === item.section}
                    tooltip={item.title}
                    className={`group relative rounded-lg transition-colors ${
                      activeSection === item.section 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
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
                <SidebarMenuItem key={item.section}>
                  <SidebarMenuButton
                    onClick={() => handleNavClick(item.section)}
                    isActive={activeSection === item.section}
                    tooltip={item.title}
                    className={`group relative rounded-lg transition-colors ${
                      activeSection === item.section 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
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

        {/* Spacer */}
        <div className="flex-1" />

        {/* Quick Invite Button */}
        {!collapsed && accelerator?.slug && (
          <div className="px-4 py-3">
            <button
              onClick={copySlug}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 hover:bg-primary/15 border border-primary/20 transition-colors group"
            >
              <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-primary" />
              </div>
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
        <SidebarGroup className="border-t border-border pt-2 pb-2">
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {settingsMenuItems.map((item) => (
                <SidebarMenuItem key={item.section}>
                  <SidebarMenuButton
                    onClick={() => handleNavClick(item.section)}
                    isActive={activeSection === item.section}
                    tooltip={item.title}
                    className={`group rounded-lg transition-colors ${
                      activeSection === item.section 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
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
                    className="group rounded-lg transition-colors hover:bg-amber-500/10 text-amber-600 hover:translate-x-0.5"
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
                  className="group rounded-lg transition-colors hover:bg-muted/50 text-muted-foreground hover:text-foreground"
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
                      className="group rounded-lg transition-colors hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
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
      </SidebarContent>
    </Sidebar>
  );
}
