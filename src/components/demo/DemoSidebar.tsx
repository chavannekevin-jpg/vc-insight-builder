import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Edit,
  FileText,
  Building2,
  TrendingUp,
  Users,
  BookOpen,
  Calculator,
  DollarSign,
  Target,
  Brain,
  Lightbulb,
  Flame,
  Trophy,
  Gift,
  Lock,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Telescope,
  Home,
  RotateCcw,
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
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DEMO_COMPANY } from "@/data/demo/demoSignalFlow";

interface DemoSidebarProps {
  currentPage: 'dashboard' | 'market-lens' | 'fund-discovery' | 'profile' | 'analysis';
  onRestartTour?: () => void;
}

// Define all menu items - matching real FounderSidebar structure
const mainMenuItems = [
  { title: "Dashboard", path: "/demo", icon: LayoutDashboard, enabled: true },
  { title: "My Profile", path: "/demo/profile", icon: Edit, enabled: true },
  { title: "My Analysis", path: "/demo/analysis", icon: FileText, enabled: true },
  { title: "VC Memorandum", path: "/demo/vc-memorandum", icon: BookOpen, enabled: true },
];

const premiumTools = [
  { title: "VC Network", path: "/demo/fund-discovery", icon: Building2, enabled: true, badge: "15" },
  { title: "Market Lens", path: "/demo/market-lens", icon: Telescope, enabled: true },
];

const knowledgeLibraryItems = [
  { title: "Stage Guides", path: "/vcbrain/stages/pre-seed", icon: Target, enabled: true },
  { title: "Pitch Deck Library", path: "/vcbrain/deck-building/problem", icon: FileText, enabled: true },
  { title: "VC Insider Takes", path: "/vcbrain/insider/power-laws", icon: Brain, enabled: true },
  { title: "How VCs Work", path: "/vcbrain/how-vcs-work/structure", icon: Building2, enabled: true },
  { title: "Tactical Guides", path: "/vcbrain/guides/angels", icon: Lightbulb, enabled: true },
];

const toolsItems = [
  { title: "Raise Calculator", path: "/demo/raise-calculator", icon: DollarSign, enabled: true },
  { title: "Valuation Calculator", path: "/demo/valuation-calculator", icon: TrendingUp, enabled: true },
  { title: "Venture Scale Diagnostic", path: "/demo/venture-scale-diagnostic", icon: Target, enabled: true },
  { title: "Roast Your Baby", path: "/roast-your-baby", icon: Flame, enabled: false, premium: true },
  { title: "Dilution Lab", path: "/dilution-lab", icon: Calculator, enabled: false, premium: true },
  { title: "Outreach Lab", path: "/demo/outreach-lab", icon: Users, enabled: true },
];

const socialItems = [
  { title: "Invite a Founder", icon: Gift, enabled: false },
  { title: "Scoreboard", icon: Trophy, enabled: false },
];

export function DemoSidebar({ currentPage, onRestartTour }: DemoSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, setOpen } = useSidebar();
  const collapsed = state === "collapsed";
  
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string, enabled: boolean) => {
    if (enabled) {
      navigate(path);
    }
  };

  const handleMouseEnter = () => {
    if (collapsed) {
      setOpen(true);
    }
  };

  const handleMouseLeave = () => {
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

        {/* Header */}
        <SidebarHeader className={cn(
          "border-b border-border/10 bg-gradient-to-r from-primary/5 to-transparent relative z-10",
          collapsed && "items-center"
        )}>
          {/* Back to Homepage link */}
          <div 
            onClick={() => navigate('/')}
            className={cn(
              "flex items-center gap-2 rounded-xl cursor-pointer text-muted-foreground hover:text-foreground transition-all duration-200 group",
              "hover:bg-white/5 dark:hover:bg-white/[0.03] border border-transparent hover:border-border/10",
              collapsed ? "justify-center px-2 py-2 mx-auto mt-2" : "px-3 py-2 mx-2 mt-2"
            )}
          >
            <Home className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
            {!collapsed && (
              <span className="text-sm font-medium">Back to Homepage</span>
            )}
          </div>
          
          {/* Company info */}
          <div className={cn(
            "flex items-center gap-3 py-3",
            collapsed ? "justify-center px-0" : "px-2"
          )}>
            <div className="w-10 h-10 rounded-xl bg-primary/15 backdrop-blur-sm flex items-center justify-center border border-primary/20 flex-shrink-0 shadow-[0_0_20px_hsl(var(--primary)/0.15)]">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm truncate">
                    {DEMO_COMPANY.name}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-lg text-[10px] font-medium bg-primary/15 text-primary backdrop-blur-sm shadow-[0_0_12px_hsl(var(--primary)/0.2)]">
                    DEMO
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {DEMO_COMPANY.stage} · {DEMO_COMPANY.category}
                </p>
              </div>
            )}
          </div>
        </SidebarHeader>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto relative z-10 py-2">
          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel className={cn(
              "uppercase tracking-wider text-[10px] font-semibold text-muted-foreground/70 px-4 py-2",
              collapsed && "sr-only"
            )}>
              Main
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="px-2 space-y-1">
                {mainMenuItems.map((item) => {
                  const tourStep = item.title === "My Profile" ? "sidebar-profile" 
                    : item.title === "VC Memorandum" ? "sidebar-memo" 
                    : undefined;
                  
                  return (
                    <SidebarMenuItem key={item.path + item.title}>
                      <SidebarMenuButton
                        onClick={() => handleNavigation(item.path, item.enabled)}
                        data-tour-step={tourStep}
                        className={cn(
                          "w-full transition-all duration-200 rounded-xl group",
                          !item.enabled && "opacity-40 cursor-not-allowed",
                          isActive(item.path) && item.enabled
                            ? "bg-primary/12 text-primary border border-primary/20 shadow-[0_0_24px_hsl(var(--primary)/0.12),inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                            : item.enabled 
                              ? "hover:bg-white/5 dark:hover:bg-white/[0.03] text-muted-foreground hover:text-foreground border border-transparent hover:border-border/10"
                              : "text-muted-foreground border border-transparent"
                        )}
                      >
                        <item.icon className={cn(
                          "w-4 h-4 shrink-0 transition-all duration-200",
                          isActive(item.path) && item.enabled && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                        )} />
                        {!collapsed && (
                          <span className="flex items-center gap-2">
                            {item.title}
                            {!item.enabled && <Lock className="w-3 h-3 text-muted-foreground" />}
                          </span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
                
                {premiumTools.map((item) => {
                  const tourStep = item.title === "VC Network" ? "sidebar-network" 
                    : item.title === "Market Lens" ? "sidebar-market-lens" 
                    : undefined;
                  
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        onClick={() => handleNavigation(item.path, item.enabled)}
                        data-tour-step={tourStep}
                        className={cn(
                          "w-full transition-all duration-200 rounded-xl group",
                          !item.enabled && "opacity-40 cursor-not-allowed",
                          isActive(item.path) && item.enabled
                            ? "bg-primary/12 text-primary border border-primary/20 shadow-[0_0_24px_hsl(var(--primary)/0.12),inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                            : item.enabled 
                              ? "hover:bg-white/5 dark:hover:bg-white/[0.03] text-muted-foreground hover:text-foreground border border-transparent hover:border-border/10"
                              : "text-muted-foreground border border-transparent"
                        )}
                      >
                        <item.icon className={cn(
                          "w-4 h-4 shrink-0 transition-all duration-200",
                          isActive(item.path) && item.enabled && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                        )} />
                        {!collapsed && (
                          <span className="flex items-center gap-2">
                            {item.title}
                            {item.badge && item.enabled && (
                              <span className="px-1.5 py-0.5 bg-primary/20 text-primary rounded-md text-[10px] font-bold shadow-[0_0_12px_hsl(var(--primary)/0.2)]">
                                {item.badge}
                              </span>
                            )}
                            {!item.enabled && <Lock className="w-3 h-3 text-muted-foreground" />}
                          </span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Social Items */}
          <SidebarGroup>
            <SidebarGroupLabel className={cn(
              "uppercase tracking-wider text-[10px] font-semibold text-muted-foreground/70 px-4 py-2",
              collapsed && "sr-only"
            )}>
              Community
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="px-2 space-y-1">
                {socialItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      className="w-full opacity-40 cursor-not-allowed text-muted-foreground rounded-xl border border-transparent"
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {!collapsed && (
                        <span className="flex items-center gap-2">
                          {item.title}
                          <Lock className="w-3 h-3" />
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Resources */}
          <SidebarGroup>
            <SidebarGroupLabel className={cn(
              "uppercase tracking-wider text-[10px] font-semibold text-muted-foreground/70 px-4 py-2",
              collapsed && "sr-only"
            )}>
              Resources
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="px-2 space-y-1">
                {/* Knowledge Library Collapsible */}
                <Collapsible open={knowledgeOpen} onOpenChange={setKnowledgeOpen}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="w-full hover:bg-white/5 dark:hover:bg-white/[0.03] text-muted-foreground hover:text-foreground rounded-xl border border-transparent hover:border-border/10 transition-all duration-200">
                        <BookOpen className="w-4 h-4 shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="flex-1">Knowledge Library</span>
                            {knowledgeOpen ? (
                              <ChevronDown className="w-3 h-3" />
                            ) : (
                              <ChevronRight className="w-3 h-3" />
                            )}
                          </>
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className="ml-4 mt-1 space-y-0.5 border-l border-border/10 pl-2">
                        {knowledgeLibraryItems.map((item) => (
                          <SidebarMenuSubItem key={item.path}>
                            <SidebarMenuSubButton
                              onClick={() => handleNavigation(item.path, item.enabled)}
                              className={cn(
                                "w-full rounded-lg transition-all duration-200",
                                item.enabled 
                                  ? "hover:bg-white/5 dark:hover:bg-white/[0.03] text-muted-foreground hover:text-foreground"
                                  : "opacity-40 cursor-not-allowed"
                              )}
                            >
                              <item.icon className="w-3 h-3 shrink-0" />
                              <span>{item.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

                {/* Tools Collapsible */}
                <Collapsible open={toolsOpen} onOpenChange={setToolsOpen}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="w-full hover:bg-white/5 dark:hover:bg-white/[0.03] text-muted-foreground hover:text-foreground rounded-xl border border-transparent hover:border-border/10 transition-all duration-200">
                        <Calculator className="w-4 h-4 shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="flex-1">Tools</span>
                            {toolsOpen ? (
                              <ChevronDown className="w-3 h-3" />
                            ) : (
                              <ChevronRight className="w-3 h-3" />
                            )}
                          </>
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className="ml-4 mt-1 space-y-0.5 border-l border-border/10 pl-2">
                        {toolsItems.map((item) => (
                          <SidebarMenuSubItem key={item.path}>
                            <SidebarMenuSubButton
                              onClick={() => handleNavigation(item.path, item.enabled)}
                              className={cn(
                                "w-full rounded-lg transition-all duration-200",
                                !item.enabled && "opacity-40 cursor-not-allowed",
                                item.enabled 
                                  ? "hover:bg-white/5 dark:hover:bg-white/[0.03] text-muted-foreground hover:text-foreground"
                                  : "text-muted-foreground"
                              )}
                            >
                              <item.icon className="w-3 h-3 shrink-0" />
                              <span className="flex items-center gap-1.5">
                                {item.title}
                                {item.premium && !item.enabled && (
                                  <Lock className="w-2.5 h-2.5" />
                                )}
                              </span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Footer */}
        <SidebarFooter className={cn(
          "border-t border-border/10 bg-gradient-to-t from-muted/10 to-transparent relative z-10",
          collapsed ? "p-2" : "p-4"
        )}>
          {collapsed ? (
            <Button
              onClick={() => navigate('/checkout')}
              className="w-full rounded-xl p-2 shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
              size="icon"
              variant="default"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <div className="space-y-3">
              {/* Platform Guide link */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/startup-guide')}
                className={cn(
                  "w-full gap-2 rounded-xl transition-all duration-200",
                  location.pathname === '/startup-guide'
                    ? "bg-primary/12 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5 dark:hover:bg-white/[0.03] border border-transparent hover:border-border/10"
                )}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Platform Guide
              </Button>
              
              {/* Take the tour again button */}
              {onRestartTour && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRestartTour}
                  className="w-full gap-2 text-muted-foreground hover:text-foreground hover:bg-white/5 dark:hover:bg-white/[0.03] rounded-xl border border-transparent hover:border-border/10 transition-all duration-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Take the tour again
                </Button>
              )}
              
              <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20 shadow-[0_0_24px_hsl(var(--primary)/0.1)]">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0 drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-foreground">Ready for your own?</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Get personalized analysis tailored to your startup.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/checkout')}
                className="w-full gap-2 rounded-xl shadow-[0_0_20px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)] transition-all duration-300"
                size="sm"
              >
                Get Started
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
