import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  ArrowRight,
  Building2,
  Sparkles,
  BookOpen
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { DEMO_COMPANY } from "@/data/demo/demoCarbonPrint";

interface DemoSidebarProps {
  currentPage: 'dashboard' | 'market-lens' | 'fund-discovery';
}

export function DemoSidebar({ currentPage }: DemoSidebarProps) {
  const navigate = useNavigate();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/demo',
      description: 'Overview & IC Room'
    },
    {
      id: 'market-lens',
      label: 'Market Lens',
      icon: TrendingUp,
      path: '/demo/market-lens',
      description: 'Market Intelligence'
    },
    {
      id: 'fund-discovery',
      label: 'VC Network',
      icon: Users,
      path: '/demo/fund-discovery',
      description: '800+ Matched Investors'
    }
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm truncate">{DEMO_COMPANY.name}</span>
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
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider">
            Explore
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={currentPage === item.id}
                    onClick={() => navigate(item.path)}
                    className="h-auto py-3"
                  >
                    <item.icon className="w-4 h-4" />
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-[10px] text-muted-foreground">{item.description}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider">
            Resources
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/vcbrain')}>
                  <BookOpen className="w-4 h-4" />
                  <span>VC Brain Library</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
