import { useLocation, useNavigate } from "react-router-dom";
import {
  Map,
  Users,
  Briefcase,
  FileUp,
  Settings,
  BarChart3,
  CalendarDays,
  Target,
  LogOut,
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
import { supabase } from "@/integrations/supabase/client";

const mainMenuItems = [
  { title: "Network Map", url: "/investor/dashboard", icon: Map, section: "map" },
  { title: "CRM", url: "/investor/dashboard?view=crm", icon: Users, section: "crm" },
  { title: "Dealflow", url: "/investor/dashboard?view=dealflow", icon: Briefcase, section: "dealflow" },
  { title: "Upload Deck", url: "/investor/dashboard?view=upload", icon: FileUp, section: "upload" },
];

const toolsMenuItems = [
  { title: "Portfolio", url: "/investor/dashboard?view=portfolio", icon: BarChart3, section: "portfolio" },
  { title: "Calendar", url: "/investor/dashboard?view=calendar", icon: CalendarDays, section: "calendar" },
  { title: "Thesis", url: "/investor/dashboard?view=thesis", icon: Target, section: "thesis" },
];

const settingsMenuItems = [
  { title: "Settings", url: "/investor/dashboard?view=settings", icon: Settings, section: "settings" },
];

interface InvestorSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userProfile: any;
}

const InvestorSidebar = ({ activeSection, onSectionChange, userProfile }: InvestorSidebarProps) => {
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/investor");
  };

  const handleNavClick = (section: string) => {
    onSectionChange(section);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarContent className="flex flex-col h-full">
        {/* User Profile Section */}
        <div className={`p-4 border-b border-border/50 ${collapsed ? "px-2" : ""}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
              {userProfile?.full_name ? getInitials(userProfile.full_name) : "IN"}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{userProfile?.full_name || "Investor"}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {userProfile?.organization_name || "—"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.section}>
                  <SidebarMenuButton
                    onClick={() => handleNavClick(item.section)}
                    isActive={activeSection === item.section}
                    tooltip={item.title}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tools Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsMenuItems.map((item) => (
                <SidebarMenuItem key={item.section}>
                  <SidebarMenuButton
                    onClick={() => handleNavClick(item.section)}
                    isActive={activeSection === item.section}
                    tooltip={item.title}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Settings & Sign Out */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsMenuItems.map((item) => (
                <SidebarMenuItem key={item.section}>
                  <SidebarMenuButton
                    onClick={() => handleNavClick(item.section)}
                    isActive={activeSection === item.section}
                    tooltip={item.title}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut} tooltip="Sign Out">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default InvestorSidebar;
