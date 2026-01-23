import { ReactNode, useEffect } from "react";
import { DemoBanner } from "./DemoBanner";
import { DemoFloatingCTA } from "./DemoFloatingCTA";
import { DemoSidebar } from "./DemoSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { DEMO_COMPANY } from "@/data/demo/demoSignalFlow";

interface DemoLayoutProps {
  children: ReactNode;
  currentPage?: 'dashboard' | 'market-lens' | 'fund-discovery' | 'profile' | 'analysis';
}

// Inner component to handle sidebar auto-collapse on mobile
function DemoLayoutInner({ children, currentPage }: DemoLayoutProps) {
  const { setOpenMobile } = useSidebar();

  // Close mobile sidebar on route change
  useEffect(() => {
    setOpenMobile(false);
  }, [currentPage, setOpenMobile]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <DemoSidebar currentPage={currentPage || 'dashboard'} />
      <SidebarInset className="flex-1">
        <DemoBanner companyName={DEMO_COMPANY.name} />
        
        {/* Mobile header */}
        <div className="sticky top-[49px] z-40 flex h-14 items-center gap-4 border-b border-border/30 bg-background/80 backdrop-blur-2xl px-4 lg:hidden">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{DEMO_COMPANY.name}</span>
            <span className="text-xs text-muted-foreground">Demo</span>
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

export function DemoLayout({ children, currentPage = 'dashboard' }: DemoLayoutProps) {
  return (
    <SidebarProvider>
      <DemoLayoutInner currentPage={currentPage}>
        {children}
      </DemoLayoutInner>
    </SidebarProvider>
  );
}
