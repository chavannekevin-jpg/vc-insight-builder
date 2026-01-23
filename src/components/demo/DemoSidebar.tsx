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
  Zap,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Sparkles,
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
  { title: "Raise Calculator", path: "/raise-calculator", icon: DollarSign, enabled: true },
  { title: "Valuation Calculator", path: "/valuation-calculator", icon: TrendingUp, enabled: true },
  { title: "Venture Scale Diagnostic", path: "/venture-scale-diagnostic", icon: Target, enabled: true },
  { title: "Roast Your Baby", path: "/roast-your-baby", icon: Flame, enabled: false, premium: true },
  { title: "Dilution Lab", path: "/dilution-lab", icon: Calculator, enabled: false, premium: true },
  { title: "Outreach Lab", path: "/investor-email-generator", icon: Users, enabled: true },
];

const socialItems = [
  { title: "Invite a Founder", icon: Gift, enabled: false },
  { title: "Scoreboard", icon: Trophy, enabled: false },
];

export function DemoSidebar({ currentPage }: DemoSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string, enabled: boolean) => {
    if (enabled) {
      navigate(path);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-3 px-2 py-3">
          <div 
            className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors"
            onClick={() => navigate('/')}
            title="Back to Home"
          >
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span 
                className="font-semibold text-sm truncate cursor-pointer hover:text-primary transition-colors"
                onClick={() => navigate('/')}
              >
                {DEMO_COMPANY.name}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                DEMO
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {DEMO_COMPANY.stage} · {DEMO_COMPANY.category}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={cn(collapsed && "sr-only")}>
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.path + item.title}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.path, item.enabled)}
                    className={cn(
                      "w-full transition-all",
                      !item.enabled && "opacity-40 cursor-not-allowed",
                      isActive(item.path) && item.enabled
                        ? "bg-primary/20 text-primary border-l-2 border-primary"
                        : item.enabled 
                          ? "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                          : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {!collapsed && (
                      <span className="flex items-center gap-2">
                        {item.title}
                        {!item.enabled && <Lock className="w-3 h-3 text-muted-foreground" />}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Premium Tools */}
              {premiumTools.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.path, item.enabled)}
                    className={cn(
                      "w-full transition-all",
                      !item.enabled && "opacity-40 cursor-not-allowed",
                      isActive(item.path) && item.enabled
                        ? "bg-primary/20 text-primary border-l-2 border-primary"
                        : item.enabled 
                          ? "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                          : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {!collapsed && (
                      <span className="flex items-center gap-2">
                        {item.title}
                        {item.badge && item.enabled && (
                          <span className="px-1.5 py-0.5 bg-primary/20 text-primary rounded text-[10px] font-bold">
                            {item.badge}
                          </span>
                        )}
                        {!item.enabled && <Lock className="w-3 h-3 text-muted-foreground" />}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Social Items */}
        <SidebarGroup>
          <SidebarGroupLabel className={cn(collapsed && "sr-only")}>
            Community
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {socialItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className="w-full opacity-40 cursor-not-allowed text-muted-foreground"
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
          <SidebarGroupLabel className={cn(collapsed && "sr-only")}>
            Resources
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Knowledge Library Collapsible */}
              <Collapsible open={knowledgeOpen} onOpenChange={setKnowledgeOpen}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full hover:bg-muted/50 text-muted-foreground hover:text-foreground">
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
                    <SidebarMenuSub>
                      {knowledgeLibraryItems.map((item) => (
                        <SidebarMenuSubItem key={item.path}>
                          <SidebarMenuSubButton
                            onClick={() => handleNavigation(item.path, item.enabled)}
                            className={cn(
                              "w-full",
                              item.enabled 
                                ? "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
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
                    <SidebarMenuButton className="w-full hover:bg-muted/50 text-muted-foreground hover:text-foreground">
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
                    <SidebarMenuSub>
                      {toolsItems.map((item) => (
                        <SidebarMenuSubItem key={item.path}>
                          <SidebarMenuSubButton
                            onClick={() => handleNavigation(item.path, item.enabled)}
                            className={cn(
                              "w-full",
                              !item.enabled && "opacity-40 cursor-not-allowed",
                              item.enabled 
                                ? "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
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
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="space-y-3">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-medium text-foreground">Ready for your own?</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Get personalized analysis tailored to your startup.
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/checkout')}
            className="w-full gap-2"
            size="sm"
          >
            Get Started
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
