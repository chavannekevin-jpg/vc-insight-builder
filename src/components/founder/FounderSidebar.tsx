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
  HelpCircle,
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
        "border-r border-border/10 transition-all duration-300",
        "bg-gradient-to-b from-sidebar/60 via-sidebar/40 to-sidebar/60",
        "backdrop-blur-3xl",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),inset_0_0_80px_rgba(255,51,153,0.02)]",
        collapsed ? "w-16" : "w-64"
      )}
      collapsible="icon"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SidebarContent className="flex flex-col h-full relative overflow-hidden">
        {/* Enhanced gradient mesh overlay with animated feel */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/15 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-1/3 -right-16 w-40 h-40 bg-secondary/12 rounded-full blur-[60px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
          <div className="absolute bottom-1/4 -left-10 w-36 h-36 bg-accent/8 rounded-full blur-[70px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
          {/* Subtle grid pattern overlay */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: 'linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />
        </div>
        
        {/* Logo Section with enhanced glass effect */}
        <div className={cn(
          "relative p-4 border-b border-border/10 flex items-center",
          "bg-gradient-to-r from-primary/8 via-primary/4 to-transparent",
          "backdrop-blur-sm",
          collapsed ? "justify-center" : "gap-3"
        )}>
          <button 
            onClick={() => navigate("/")}
            className={cn(
              "text-xl font-display font-black tracking-tight text-primary",
              "hover:scale-105 transition-all duration-300",
              "drop-shadow-[0_0_12px_hsl(var(--primary)/0.4)]"
            )}
          >
            {collapsed ? "U" : "UglyBaby"}
          </button>
        </div>

        <SidebarGroup className="relative z-10 px-2 pt-2">
          <SidebarGroupLabel className={cn(
            "text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold mb-1",
            collapsed && "sr-only"
          )}>
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "w-full transition-all duration-200 rounded-xl group",
                      isActive(item.path)
                        ? "bg-primary/12 text-primary border border-primary/20 shadow-[0_0_24px_hsl(var(--primary)/0.12),inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                        : "hover:bg-white/5 dark:hover:bg-white/[0.03] text-muted-foreground hover:text-foreground border border-transparent hover:border-border/10"
                    )}
                  >
                    <item.icon className={cn(
                      "w-4 h-4 shrink-0 transition-all duration-200",
                      isActive(item.path) && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]"
                    )} />
                    {!collapsed && <span className="font-medium">{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* My Analysis - conditional link */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleMyAnalysisClick}
                  className={cn(
                    "w-full transition-all duration-200 rounded-xl group",
                    isActive("/analysis")
                      ? "bg-primary/12 text-primary border border-primary/20 shadow-[0_0_24px_hsl(var(--primary)/0.12),inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                      : "hover:bg-white/5 dark:hover:bg-white/[0.03] text-muted-foreground hover:text-foreground border border-transparent hover:border-border/10"
                  )}
                >
                  <Zap className={cn(
                    "w-4 h-4 shrink-0 transition-all duration-200",
                    isActive("/analysis") && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]"
                  )} />
                  {!collapsed && (
                    <span className="flex items-center gap-2 font-medium">
                      My Analysis
                      {!hasPaid && <Lock className="w-3 h-3 text-muted-foreground/50" />}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* VC Memorandum - conditional link */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleVCMemorandumClick}
                  className={cn(
                    "w-full transition-all duration-200 rounded-xl group",
                    isActive("/vc-memorandum")
                      ? "bg-primary/12 text-primary border border-primary/20 shadow-[0_0_24px_hsl(var(--primary)/0.12),inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                      : "hover:bg-white/5 dark:hover:bg-white/[0.03] text-muted-foreground hover:text-foreground border border-transparent hover:border-border/10"
                  )}
                >
                  <BookOpen className={cn(
                    "w-4 h-4 shrink-0 transition-all duration-200",
                    isActive("/vc-memorandum") && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]"
                  )} />
                  {!collapsed && (
                    <span className="flex items-center gap-2 font-medium">
                      VC Memorandum
                      {!(hasPaid && hasMemo) && <Lock className="w-3 h-3 text-muted-foreground/50" />}
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
                    "w-full transition-all duration-200 rounded-xl group",
                    isActive("/fund-discovery")
                      ? "bg-primary/12 text-primary border border-primary/20 shadow-[0_0_24px_hsl(var(--primary)/0.12),inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                      : "hover:bg-white/5 dark:hover:bg-white/[0.03] text-muted-foreground hover:text-foreground border border-transparent hover:border-border/10"
                  )}
                >
                  <Building2 className={cn(
                    "w-4 h-4 shrink-0 transition-all duration-200",
                    isActive("/fund-discovery") && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]"
                  )} />
                  {!collapsed && (
                    <span className="flex items-center gap-2 font-medium">
                      VC Network
                      {!hasPaid && matchingFunds > 0 && (
                        <span className="px-1.5 py-0.5 bg-primary/15 text-primary rounded-lg text-[10px] font-bold border border-primary/20 shadow-[0_0_12px_hsl(var(--primary)/0.2)]">
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
                    "w-full transition-all duration-200 rounded-xl group",
                    isActive("/market-lens")
                      ? "bg-primary/12 text-primary border border-primary/20 shadow-[0_0_24px_hsl(var(--primary)/0.12),inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                      : "hover:bg-white/5 dark:hover:bg-white/[0.03] text-muted-foreground hover:text-foreground border border-transparent hover:border-border/10"
                  )}
                >
                  <Telescope className={cn(
                    "w-4 h-4 shrink-0 transition-all duration-200",
                    isActive("/market-lens") && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]"
                  )} />
                  {!collapsed && (
                    <span className="flex items-center gap-2 font-medium">
                      Market Lens
                      {!(hasPaid && hasMemo) && <Lock className="w-3 h-3 text-muted-foreground/50" />}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Invite a Founder - quick access */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onInviteFounderClick}
                  className="w-full transition-all duration-200 rounded-xl hover:bg-white/5 dark:hover:bg-white/[0.03] text-muted-foreground hover:text-foreground border border-transparent hover:border-border/10"
                >
                  <Gift className="w-4 h-4 shrink-0 text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.4)]" />
                  {!collapsed && <span className="font-medium">Invite a Founder</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Scoreboard */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onScoreboardClick}
                  className="w-full transition-all duration-200 rounded-xl hover:bg-white/5 dark:hover:bg-white/[0.03] text-muted-foreground hover:text-foreground border border-transparent hover:border-border/10"
                >
                  <Trophy className="w-4 h-4 shrink-0 text-warning drop-shadow-[0_0_6px_hsl(var(--warning)/0.4)]" />
                  {!collapsed && <span className="font-medium">Scoreboard</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Resources - with expandable submenus */}
        <SidebarGroup className="relative z-10 px-2 pt-4">
          <SidebarGroupLabel className={cn(
            "text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold mb-1",
            collapsed && "sr-only"
          )}>
            Resources
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {/* Knowledge Library - expandable */}
              <Collapsible open={libraryOpen} onOpenChange={setLibraryOpen}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={cn(
                        "w-full transition-all duration-200 rounded-xl group",
                        location.pathname.startsWith("/vcbrain")
                          ? "bg-primary/12 text-primary border border-primary/20 shadow-[0_0_24px_hsl(var(--primary)/0.12)]"
                          : "hover:bg-white/5 dark:hover:bg-white/[0.03] text-muted-foreground hover:text-foreground border border-transparent hover:border-border/10"
                      )}
                    >
                      <BookOpen className={cn(
                        "w-4 h-4 shrink-0 transition-all duration-200",
                        location.pathname.startsWith("/vcbrain") && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]"
                      )} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 font-medium">Knowledge Library</span>
                          {libraryOpen ? (
                            <ChevronDown className="w-4 h-4 opacity-50" />
                          ) : (
                            <ChevronRight className="w-4 h-4 opacity-50" />
                          )}
                        </>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  
                  {!collapsed && (
                    <CollapsibleContent>
                      <SidebarMenuSub className="border-l border-border/20 ml-3 pl-3 mt-1">
                        {knowledgeLibraryItems.map((item) => (
                          <SidebarMenuSubItem key={item.path}>
                            <SidebarMenuSubButton
                              onClick={() => navigate(item.path)}
                              className={cn(
                                "transition-all duration-200 rounded-lg py-1.5",
                                isActive(item.path)
                                  ? "text-primary bg-primary/8"
                                  : "text-muted-foreground/80 hover:text-foreground hover:bg-white/[0.03]"
                              )}
                            >
                              <item.icon className="w-3.5 h-3.5 shrink-0" />
                              <span className="text-sm">{item.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            onClick={() => navigate("/vcbrain")}
                            className="text-primary/80 hover:text-primary font-medium transition-all rounded-lg py-1.5"
                          >
                            <span className="text-sm">View All →</span>
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
                        "w-full transition-all duration-200 rounded-xl group",
                        location.pathname.startsWith("/tools") ||
                        toolsItems.some(t => isActive(t.path))
                          ? "bg-primary/12 text-primary border border-primary/20 shadow-[0_0_24px_hsl(var(--primary)/0.12)]"
                          : "hover:bg-white/5 dark:hover:bg-white/[0.03] text-muted-foreground hover:text-foreground border border-transparent hover:border-border/10"
                      )}
                    >
                      <Calculator className={cn(
                        "w-4 h-4 shrink-0 transition-all duration-200",
                        (location.pathname.startsWith("/tools") || toolsItems.some(t => isActive(t.path))) && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]"
                      )} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 font-medium">Tools</span>
                          {toolsOpen ? (
                            <ChevronDown className="w-4 h-4 opacity-50" />
                          ) : (
                            <ChevronRight className="w-4 h-4 opacity-50" />
                          )}
                        </>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  
                  {!collapsed && (
                    <CollapsibleContent>
                      <SidebarMenuSub className="border-l border-border/20 ml-3 pl-3 mt-1">
                        {toolsItems.map((item) => (
                          <SidebarMenuSubItem key={item.path}>
                            <SidebarMenuSubButton
                              onClick={() => navigate(item.path)}
                              className={cn(
                                "transition-all duration-200 rounded-lg py-1.5",
                                isActive(item.path)
                                  ? "text-primary bg-primary/8"
                                  : "text-muted-foreground/80 hover:text-foreground hover:bg-white/[0.03]"
                              )}
                            >
                              <item.icon className="w-3.5 h-3.5 shrink-0" />
                              <span className="flex items-center gap-1.5 text-sm">
                                {item.title}
                                {item.premium && (
                                  <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-primary/15 text-primary font-bold border border-primary/20">
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
                            className="text-primary/80 hover:text-primary font-medium transition-all rounded-lg py-1.5"
                          >
                            <span className="text-sm">View All →</span>
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
          <SidebarGroup className="relative z-10 px-2 pt-4">
            <SidebarGroupLabel className={cn(
              "text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold mb-1",
              collapsed && "sr-only"
            )}>
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate("/admin")}
                    className={cn(
                      "w-full transition-all duration-200 rounded-xl group",
                      isActive("/admin")
                        ? "bg-primary/12 text-primary border border-primary/20 shadow-[0_0_24px_hsl(var(--primary)/0.12)]"
                        : "hover:bg-white/5 dark:hover:bg-white/[0.03] text-muted-foreground hover:text-foreground border border-transparent hover:border-border/10"
                    )}
                  >
                    <Shield className={cn(
                      "w-4 h-4 shrink-0 transition-all duration-200",
                      isActive("/admin") && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]"
                    )} />
                    {!collapsed && <span className="font-medium">Admin Panel</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={onResetClick}
                    className="w-full text-warning hover:bg-warning/10 hover:text-warning transition-all duration-200 rounded-xl border border-transparent hover:border-warning/20"
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
        <SidebarGroup className="mt-auto border-t border-border/10 pt-3 px-2 pb-2 relative z-10 bg-gradient-to-t from-sidebar/90 via-sidebar/60 to-transparent backdrop-blur-md">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate("/startup-guide")}
                  className={cn(
                    "w-full transition-all duration-200 rounded-xl group",
                    isActive("/startup-guide")
                      ? "bg-primary/12 text-primary border border-primary/20 shadow-[0_0_24px_hsl(var(--primary)/0.12)]"
                      : "hover:bg-white/5 dark:hover:bg-white/[0.03] text-muted-foreground hover:text-foreground border border-transparent hover:border-border/10"
                  )}
                >
                  <HelpCircle className={cn(
                    "w-4 h-4 shrink-0 transition-all duration-200",
                    isActive("/startup-guide") && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]"
                  )} />
                  {!collapsed && <span className="font-medium text-sm">Platform Guide</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onDeleteAccountClick}
                  className="w-full text-destructive/60 hover:bg-destructive/8 hover:text-destructive transition-all duration-200 rounded-xl border border-transparent hover:border-destructive/15"
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="font-medium text-sm">Delete Account</span>}
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