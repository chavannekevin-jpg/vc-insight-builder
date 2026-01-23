import { ReactNode, useEffect } from "react";
import { DemoBanner } from "./DemoBanner";
import { DemoFloatingCTA } from "./DemoFloatingCTA";
import { DemoSidebar } from "./DemoSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { DEMO_COMPANY } from "@/data/demo/demoSignalFlow";

interface DemoLayoutProps {
  children: ReactNode;
  currentPage?: 'dashboard' | 'market-lens' | 'fund-discovery' | 'profile' | 'analysis';
  onRestartTour?: () => void;
}

// Inner component to handle sidebar auto-collapse on mobile
function DemoLayoutInner({ children, currentPage, onRestartTour }: DemoLayoutProps) {
  const { setOpenMobile } = useSidebar();

  // Close mobile sidebar on route change
  useEffect(() => {
    setOpenMobile(false);
  }, [currentPage, setOpenMobile]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <DemoSidebar currentPage={currentPage || 'dashboard'} onRestartTour={onRestartTour} />
      <SidebarInset className="flex-1">
        <DemoBanner companyName={DEMO_COMPANY.name} />
        
        {/* Mobile header */}
        <div className="sticky top-[49px] z-40 flex h-14 items-center gap-3 border-b border-border/30 bg-background/80 backdrop-blur-2xl px-4 lg:hidden">
          <SidebarTrigger className="flex-shrink-0" />
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">SF</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm truncate">{DEMO_COMPANY.name}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/15 text-primary flex-shrink-0">
                  DEMO
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground truncate">
                {DEMO_COMPANY.stage} · {DEMO_COMPANY.category}
              </p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>
        
        <DemoFloatingCTA />
      </SidebarInset>
    </div>
  );
}

export function DemoLayout({ children, currentPage = 'dashboard', onRestartTour }: DemoLayoutProps) {
  return (
    <SidebarProvider>
      <DemoLayoutInner currentPage={currentPage} onRestartTour={onRestartTour}>
        {children}
      </DemoLayoutInner>
    </SidebarProvider>
  );
}
