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
  Trophy,
  Telescope,
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
import { MarketLensUpsellDialog } from "@/components/market-lens/MarketLensUpsellDialog";

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
  onScoreboardClick: () => void;
}

const mainMenuItems = [
  { title: "Dashboard", path: "/hub", icon: LayoutDashboard },
  { title: "My Profile", path: "/company-profile", icon: Edit },
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
  onScoreboardClick,
}: FounderSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state: sidebarState, setOpen } = useSidebar();
  const collapsed = sidebarState === "collapsed";
  
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [showMarketLensUpsell, setShowMarketLensUpsell] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;

  const handleMarketLensClick = () => {
    if (hasPaid && hasMemo) {
      navigate("/market-lens");
    } else {
      setShowMarketLensUpsell(true);
    }
  };

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

  // Determine where "VC Memorandum" should link
  const handleVCMemorandumClick = () => {
    if (hasPaid && hasMemo && companyId) {
      navigate(`/vc-memorandum?companyId=${companyId}`);
    } else if (companyId) {
      navigate(`/checkout-analysis?companyId=${companyId}`);
    } else {
      navigate('/checkout-analysis');
    }
  };

  // Hover handlers for auto-expand
  const handleMouseEnter = () => {
    if (collapsed) {
      setOpen(true);
    }
  };

  const handleMouseLeave = () => {
    // Only collapse if it was auto-expanded via hover
    // We use a slight delay to prevent flickering
    setOpen(false);
  };

  return (
    <Sidebar
      className={cn(
        "border-r border-border/20 bg-sidebar/40 backdrop-blur-2xl transition-all duration-300",
        "shadow-[inset_0_0_60px_rgba(255,51,153,0.03)]",
        collapsed ? "w-16" : "w-64"
      )}
      collapsible="icon"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SidebarContent className="flex flex-col h-full relative">
        {/* Subtle gradient mesh overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
        </div>
        
        {/* Logo Section */}
        <div className={cn(
          "relative p-4 border-b border-border/20 flex items-center",
          "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent",
          collapsed ? "justify-center" : "gap-3"
        )}>
          <button 
            onClick={() => navigate("/")}
            className={cn(
              "text-xl font-display font-black tracking-tight text-primary",
              "hover:scale-105 transition-all duration-300",
              "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
            )}
          >
            {collapsed ? "U" : "UglyBaby"}
          </button>
        </div>

        <SidebarGroup className="relative z-10">
          <SidebarGroupLabel className={cn(
            "text-xs uppercase tracking-wider text-muted-foreground/80 font-semibold",
            collapsed && "sr-only"
          )}>
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "w-full transition-all duration-200 rounded-lg",
                      isActive(item.path)
                        ? "bg-primary/15 text-primary border-l-2 border-primary shadow-[0_0_20px_hsl(var(--primary)/0.15)]"
                        : "hover:bg-muted/40 text-muted-foreground hover:text-foreground hover:shadow-sm"
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span className="font-medium">{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* My Analysis - conditional link */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleMyAnalysisClick}
                  className={cn(
                    "w-full transition-all duration-200 rounded-lg",
                    isActive("/analysis")
                      ? "bg-primary/15 text-primary border-l-2 border-primary shadow-[0_0_20px_hsl(var(--primary)/0.15)]"
                      : "hover:bg-muted/40 text-muted-foreground hover:text-foreground hover:shadow-sm"
                  )}
                >
                  <Zap className="w-4 h-4 shrink-0" />
                  {!collapsed && (
                    <span className="flex items-center gap-2 font-medium">
                      My Analysis
                      {!hasPaid && <Lock className="w-3 h-3 text-muted-foreground/70" />}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* VC Memorandum - conditional link */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleVCMemorandumClick}
                  className={cn(
                    "w-full transition-all duration-200 rounded-lg",
                    isActive("/vc-memorandum")
                      ? "bg-primary/15 text-primary border-l-2 border-primary shadow-[0_0_20px_hsl(var(--primary)/0.15)]"
                      : "hover:bg-muted/40 text-muted-foreground hover:text-foreground hover:shadow-sm"
                  )}
                >
                  <BookOpen className="w-4 h-4 shrink-0" />
                  {!collapsed && (
                    <span className="flex items-center gap-2 font-medium">
                      VC Memorandum
                      {!(hasPaid && hasMemo) && <Lock className="w-3 h-3 text-muted-foreground/70" />}
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
                    "w-full transition-all duration-200 rounded-lg",
                    isActive("/fund-discovery")
                      ? "bg-primary/15 text-primary border-l-2 border-primary shadow-[0_0_20px_hsl(var(--primary)/0.15)]"
                      : "hover:bg-muted/40 text-muted-foreground hover:text-foreground hover:shadow-sm"
                  )}
                >
                  <Building2 className="w-4 h-4 shrink-0" />
                  {!collapsed && (
                    <span className="flex items-center gap-2 font-medium">
                      VC Network
                      {!hasPaid && matchingFunds > 0 && (
                        <span className="px-1.5 py-0.5 bg-primary/20 text-primary rounded-md text-[10px] font-bold shadow-[0_0_10px_hsl(var(--primary)/0.3)]">
                          {matchingFunds}+
                        </span>
                      )}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Market Lens - premium tool */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleMarketLensClick}
                  className={cn(
                    "w-full transition-all duration-200 rounded-lg",
                    isActive("/market-lens")
                      ? "bg-primary/15 text-primary border-l-2 border-primary shadow-[0_0_20px_hsl(var(--primary)/0.15)]"
                      : "hover:bg-muted/40 text-muted-foreground hover:text-foreground hover:shadow-sm"
                  )}
                >
                  <Telescope className="w-4 h-4 shrink-0" />
                  {!collapsed && (
                    <span className="flex items-center gap-2 font-medium">
                      Market Lens
                      {!(hasPaid && hasMemo) && <Lock className="w-3 h-3 text-muted-foreground/70" />}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Invite a Founder - quick access */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onInviteFounderClick}
                  className="w-full transition-all duration-200 rounded-lg hover:bg-muted/40 text-muted-foreground hover:text-foreground hover:shadow-sm"
                >
                  <Gift className="w-4 h-4 shrink-0 text-primary drop-shadow-[0_0_4px_hsl(var(--primary)/0.5)]" />
                  {!collapsed && <span className="font-medium">Invite a Founder</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Scoreboard */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onScoreboardClick}
                  className="w-full transition-all duration-200 rounded-lg hover:bg-muted/40 text-muted-foreground hover:text-foreground hover:shadow-sm"
                >
                  <Trophy className="w-4 h-4 shrink-0 text-warning drop-shadow-[0_0_4px_hsl(var(--warning)/0.5)]" />
                  {!collapsed && <span className="font-medium">Scoreboard</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Resources - with expandable submenus */}
        <SidebarGroup className="relative z-10">
          <SidebarGroupLabel className={cn(
            "text-xs uppercase tracking-wider text-muted-foreground/80 font-semibold",
            collapsed && "sr-only"
          )}>
            Resources
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {/* Knowledge Library - expandable */}
              <Collapsible open={libraryOpen} onOpenChange={setLibraryOpen}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={cn(
                        "w-full transition-all duration-200 rounded-lg",
                        location.pathname.startsWith("/vcbrain")
                          ? "bg-primary/15 text-primary shadow-[0_0_20px_hsl(var(--primary)/0.15)]"
                          : "hover:bg-muted/40 text-muted-foreground hover:text-foreground hover:shadow-sm"
                      )}
                    >
                      <BookOpen className="w-4 h-4 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 font-medium">Knowledge Library</span>
                          {libraryOpen ? (
                            <ChevronDown className="w-4 h-4 opacity-70" />
                          ) : (
                            <ChevronRight className="w-4 h-4 opacity-70" />
                          )}
                        </>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  
                  {!collapsed && (
                    <CollapsibleContent>
                      <SidebarMenuSub className="border-l border-border/30 ml-2 pl-2">
                        {knowledgeLibraryItems.map((item) => (
                          <SidebarMenuSubItem key={item.path}>
                            <SidebarMenuSubButton
                              onClick={() => navigate(item.path)}
                              className={cn(
                                "transition-all duration-200 rounded-md",
                                isActive(item.path)
                                  ? "text-primary bg-primary/10"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
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
                            className="text-primary hover:text-primary/80 font-medium transition-all"
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
                        "w-full transition-all duration-200 rounded-lg",
                        location.pathname.startsWith("/tools") ||
                        toolsItems.some(t => isActive(t.path))
                          ? "bg-primary/15 text-primary shadow-[0_0_20px_hsl(var(--primary)/0.15)]"
                          : "hover:bg-muted/40 text-muted-foreground hover:text-foreground hover:shadow-sm"
                      )}
                    >
                      <Calculator className="w-4 h-4 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 font-medium">Tools</span>
                          {toolsOpen ? (
                            <ChevronDown className="w-4 h-4 opacity-70" />
                          ) : (
                            <ChevronRight className="w-4 h-4 opacity-70" />
                          )}
                        </>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  
                  {!collapsed && (
                    <CollapsibleContent>
                      <SidebarMenuSub className="border-l border-border/30 ml-2 pl-2">
                        {toolsItems.map((item) => (
                          <SidebarMenuSubItem key={item.path}>
                            <SidebarMenuSubButton
                              onClick={() => navigate(item.path)}
                              className={cn(
                                "transition-all duration-200 rounded-md",
                                isActive(item.path)
                                  ? "text-primary bg-primary/10"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                              )}
                            >
                              <item.icon className="w-3.5 h-3.5 shrink-0" />
                              <span className="flex items-center gap-1.5">
                                {item.title}
                                {item.premium && (
                                  <span className="text-[9px] px-1 py-0.5 rounded-md bg-primary/20 text-primary font-bold shadow-[0_0_6px_hsl(var(--primary)/0.3)]">
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
                            className="text-primary hover:text-primary/80 font-medium transition-all"
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
          <SidebarGroup className="relative z-10">
            <SidebarGroupLabel className={cn(
              "text-xs uppercase tracking-wider text-muted-foreground/80 font-semibold",
              collapsed && "sr-only"
            )}>
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate("/admin")}
                    className={cn(
                      "w-full transition-all duration-200 rounded-lg",
                      isActive("/admin")
                        ? "bg-primary/15 text-primary border-l-2 border-primary shadow-[0_0_20px_hsl(var(--primary)/0.15)]"
                        : "hover:bg-muted/40 text-muted-foreground hover:text-foreground hover:shadow-sm"
                    )}
                  >
                    <Shield className="w-4 h-4 shrink-0" />
                    {!collapsed && <span className="font-medium">Admin Panel</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={onResetClick}
                    className="w-full text-warning hover:bg-warning/10 hover:text-warning transition-all duration-200 rounded-lg"
                  >
                    <RotateCcw className="w-4 h-4 shrink-0" />
                    {!collapsed && <span className="font-medium">Reset Flow</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom Actions */}
        <SidebarGroup className="mt-auto border-t border-border/20 pt-3 relative z-10 bg-gradient-to-t from-sidebar/80 to-transparent backdrop-blur-sm">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onDeleteAccountClick}
                  className="w-full text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 rounded-lg"
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="font-medium">Delete Account</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      {/* Market Lens Upsell Dialog */}
      <MarketLensUpsellDialog 
        open={showMarketLensUpsell} 
        onOpenChange={setShowMarketLensUpsell} 
      />
    </Sidebar>
  );
};