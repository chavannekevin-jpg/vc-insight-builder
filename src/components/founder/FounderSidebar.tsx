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
  ChevronDown,
  ChevronRight,
  Gift,
  Lock,
  Zap,
  Target,
  Brain,
  TrendingUp,
  Lightbulb,
  DollarSign,
  Flame,
  Users,
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface FounderSidebarProps {
  isAdmin: boolean;
  hasPaid: boolean;
  hasMemo: boolean;
  companyId?: string;
  matchingFunds: number;
  onResetClick: () => void;
  onDeleteAccountClick: () => void;
  onFundDiscoveryClick: () => void;
  onInviteFounderClick: () => void;
}

const mainMenuItems = [
  { title: "Dashboard", path: "/hub", icon: LayoutDashboard },
  { title: "My Profile", path: "/company-profile", icon: Edit },
  { title: "Sample Analysis", path: "/sample-memo", icon: FileText },
];

const knowledgeLibraryItems = [
  { title: "Stage Guides", path: "/vcbrain/stages/pre-seed", icon: Target },
  { title: "Pitch Deck Library", path: "/vcbrain/deck-building/problem", icon: FileText },
  { title: "VC Insider Takes", path: "/vcbrain/insider/power-laws", icon: Brain },
  { title: "How VCs Work", path: "/vcbrain/how-vcs-work/structure", icon: Building2 },
  { title: "Tactical Guides", path: "/vcbrain/guides/angels", icon: Lightbulb },
];

const toolsItems = [
  { title: "Raise Calculator", path: "/raise-calculator", icon: DollarSign },
  { title: "Valuation Calculator", path: "/valuation-calculator", icon: TrendingUp },
  { title: "Venture Scale Diagnostic", path: "/venture-scale-diagnostic", icon: Target },
  { title: "Roast Your Baby", path: "/roast-your-baby", icon: Flame, premium: true },
  { title: "Dilution Lab", path: "/dilution-lab", icon: Calculator, premium: true },
  { title: "Outreach Lab", path: "/investor-email-generator", icon: Users },
];

export const FounderSidebar = ({
  isAdmin,
  hasPaid,
  hasMemo,
  companyId,
  matchingFunds,
  onResetClick,
  onDeleteAccountClick,
  onFundDiscoveryClick,
  onInviteFounderClick,
}: FounderSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  
  const [toolsOpen, setToolsOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // Determine where "My Analysis" should link
  const handleMyAnalysisClick = () => {
    if (hasPaid && hasMemo && companyId) {
      navigate(`/analysis?companyId=${companyId}`);
    } else if (companyId) {
      navigate(`/checkout-analysis?companyId=${companyId}`);
    } else {
      navigate('/checkout-analysis');
    }
  };

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
              
              {/* My Analysis - conditional link */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleMyAnalysisClick}
                  className={cn(
                    "w-full transition-all",
                    isActive("/analysis")
                      ? "bg-primary/20 text-primary border-l-2 border-primary"
                      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Zap className="w-4 h-4 shrink-0" />
                  {!collapsed && (
                    <span className="flex items-center gap-2">
                      My Analysis
                      {!hasPaid && <Lock className="w-3 h-3 text-muted-foreground" />}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              
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
              
              {/* Invite a Founder - quick access */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onInviteFounderClick}
                  className="w-full transition-all hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                >
                  <Gift className="w-4 h-4 shrink-0 text-primary" />
                  {!collapsed && <span>Invite a Founder</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Resources - with expandable submenus */}
        <SidebarGroup>
          <SidebarGroupLabel className={cn(collapsed && "sr-only")}>
            Resources
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Knowledge Library - expandable */}
              <Collapsible open={libraryOpen} onOpenChange={setLibraryOpen}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={cn(
                        "w-full transition-all",
                        location.pathname.startsWith("/vcbrain")
                          ? "bg-primary/20 text-primary"
                          : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <BookOpen className="w-4 h-4 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">Knowledge Library</span>
                          {libraryOpen ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  
                  {!collapsed && (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {knowledgeLibraryItems.map((item) => (
                          <SidebarMenuSubItem key={item.path}>
                            <SidebarMenuSubButton
                              onClick={() => navigate(item.path)}
                              className={cn(
                                "transition-all",
                                isActive(item.path)
                                  ? "text-primary bg-primary/10"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <item.icon className="w-3.5 h-3.5 shrink-0" />
                              <span>{item.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            onClick={() => navigate("/vcbrain")}
                            className="text-primary hover:text-primary/80 font-medium"
                          >
                            <span>View All →</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  )}
                </SidebarMenuItem>
              </Collapsible>
              
              {/* Tools - expandable */}
              <Collapsible open={toolsOpen} onOpenChange={setToolsOpen}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={cn(
                        "w-full transition-all",
                        location.pathname.startsWith("/tools") ||
                        toolsItems.some(t => isActive(t.path))
                          ? "bg-primary/20 text-primary"
                          : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Calculator className="w-4 h-4 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">Tools</span>
                          {toolsOpen ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  
                  {!collapsed && (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {toolsItems.map((item) => (
                          <SidebarMenuSubItem key={item.path}>
                            <SidebarMenuSubButton
                              onClick={() => navigate(item.path)}
                              className={cn(
                                "transition-all",
                                isActive(item.path)
                                  ? "text-primary bg-primary/10"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <item.icon className="w-3.5 h-3.5 shrink-0" />
                              <span className="flex items-center gap-1.5">
                                {item.title}
                                {item.premium && (
                                  <span className="text-[9px] px-1 py-0.5 rounded bg-primary/20 text-primary font-bold">
                                    PRO
                                  </span>
                                )}
                              </span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            onClick={() => navigate("/tools")}
                            className="text-primary hover:text-primary/80 font-medium"
                          >
                            <span>View All →</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  )}
                </SidebarMenuItem>
              </Collapsible>
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