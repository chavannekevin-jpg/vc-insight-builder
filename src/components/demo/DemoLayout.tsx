import { ReactNode } from "react";
import { DemoBanner } from "./DemoBanner";
import { DemoFloatingCTA } from "./DemoFloatingCTA";
import { DemoSidebar } from "./DemoSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { DEMO_COMPANY } from "@/data/demo/demoSignalFlow";

interface DemoLayoutProps {
  children: ReactNode;
  currentPage?: 'dashboard' | 'market-lens' | 'fund-discovery' | 'profile';
}

export function DemoLayout({ children, currentPage = 'dashboard' }: DemoLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <DemoSidebar currentPage={currentPage} />
        <SidebarInset className="flex-1">
          <DemoBanner companyName={DEMO_COMPANY.name} />
          
          {/* Mobile header */}
          <div className="sticky top-[49px] z-40 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:hidden">
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
    </SidebarProvider>
  );
}
