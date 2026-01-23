import { useState } from "react";
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
      className="border-r border-white/[0.04]"
      style={{
        background: 'linear-gradient(180deg, hsl(330 20% 8% / 0.95) 0%, hsl(330 20% 6% / 0.98) 100%)',
        backdropFilter: 'blur(40px) saturate(180%)',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SidebarContent className="flex flex-col h-full">
        {/* Accelerator Profile Section */}
        <div className={`p-4 border-b border-white/[0.04] ${collapsed ? "px-2" : ""}`}>
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-3 ${!collapsed ? "p-4 rounded-2xl relative overflow-hidden" : ""}`}
            style={!collapsed ? {
              background: 'linear-gradient(135deg, hsl(330 20% 15% / 0.6) 0%, hsl(330 20% 10% / 0.4) 100%)',
              border: '1px solid hsl(330 100% 65% / 0.1)',
            } : {}}
          >
            {/* Decorative glow */}
            {!collapsed && (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-60" />
            )}
            
            <div className="relative group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/20 flex items-center justify-center text-primary font-bold flex-shrink-0 border border-primary/20">
                {accelerator?.name ? getInitials(accelerator.name) : <Building2 className="w-5 h-5" />}
              </div>
              <div className="absolute inset-0 rounded-xl bg-primary/30 blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1 relative z-10">
                <p className="font-semibold text-sm truncate text-foreground">{accelerator?.name || "Accelerator"}</p>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <p className="text-xs text-muted-foreground/80">Ecosystem</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Main Menu */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-semibold px-4 mb-2">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {mainMenuItems.map((item, index) => (
                <SidebarMenuItem key={item.section}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <SidebarMenuButton
                      onClick={() => handleNavClick(item.section)}
                      isActive={activeSection === item.section}
                      tooltip={item.title}
                      className={`group relative rounded-xl transition-all duration-300 ${
                        activeSection === item.section 
                          ? "text-primary" 
                          : "hover:bg-white/[0.04]"
                      }`}
                      style={activeSection === item.section ? {
                        background: 'linear-gradient(135deg, hsl(330 100% 65% / 0.15) 0%, hsl(330 100% 65% / 0.05) 100%)',
                      } : {}}
                    >
                      {activeSection === item.section && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full"
                          style={{ boxShadow: '0 0 12px hsl(330 100% 65% / 0.6)' }}
                        />
                      )}
                      <item.icon className={`w-4 h-4 transition-all duration-200 ${
                        activeSection === item.section ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      }`} />
                      <span className={`font-medium ${
                        activeSection === item.section ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      }`}>{item.title}</span>
                    </SidebarMenuButton>
                  </motion.div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tools Menu */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-semibold px-4 mb-2">
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {toolsMenuItems.map((item, index) => (
                <SidebarMenuItem key={item.section}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                  >
                    <SidebarMenuButton
                      onClick={() => handleNavClick(item.section)}
                      isActive={activeSection === item.section}
                      tooltip={item.title}
                      className={`group relative rounded-xl transition-all duration-300 ${
                        activeSection === item.section 
                          ? "text-primary" 
                          : "hover:bg-white/[0.04]"
                      }`}
                      style={activeSection === item.section ? {
                        background: 'linear-gradient(135deg, hsl(330 100% 65% / 0.15) 0%, hsl(330 100% 65% / 0.05) 100%)',
                      } : {}}
                    >
                      {activeSection === item.section && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full"
                          style={{ boxShadow: '0 0 12px hsl(330 100% 65% / 0.6)' }}
                        />
                      )}
                      <item.icon className={`w-4 h-4 transition-all duration-200 ${
                        activeSection === item.section ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      }`} />
                      <span className={`font-medium ${
                        activeSection === item.section ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      }`}>{item.title}</span>
                    </SidebarMenuButton>
                  </motion.div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Quick Invite Button */}
        {!collapsed && accelerator?.slug && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="px-4 py-3"
          >
            <button
              onClick={copySlug}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, hsl(330 100% 65% / 0.15) 0%, hsl(280 100% 70% / 0.1) 100%)',
                border: '1px solid hsl(330 100% 65% / 0.2)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 flex items-center gap-3 w-full">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground flex-1 text-left">Invite Startups</span>
                {copied ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
              </div>
            </button>
          </motion.div>
        )}

        {/* Settings & Sign Out */}
        <SidebarGroup className="border-t border-white/[0.04] pt-3 pb-2">
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
                        : "hover:bg-white/[0.04]"
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
                  className="group rounded-xl transition-all duration-300 hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <SidebarMenuButton
                      tooltip="Delete Account"
                      className="group rounded-xl transition-all duration-300 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="font-medium">Delete Account</span>
                    </SidebarMenuButton>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-white/[0.08]" style={{
                    background: 'linear-gradient(135deg, hsl(330 20% 12%) 0%, hsl(330 20% 8%) 100%)',
                    backdropFilter: 'blur(40px)',
                  }}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your account and all associated data, including your accelerator ecosystem, cohorts, and team members. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting} className="border-white/[0.08] hover:bg-white/[0.04]">
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
