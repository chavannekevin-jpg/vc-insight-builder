import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, Bell, Info, ArrowRight } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AcceleratorDemoSidebar } from "./AcceleratorDemoSidebar";
import { DEMO_ACCELERATOR } from "@/data/acceleratorDemo/acceleratorProfile";
import { Button } from "@/components/ui/button";

interface AcceleratorDemoLayoutProps {
  children: ReactNode;
  onRestartTour?: () => void;
}

export function AcceleratorDemoLayout({ children, onRestartTour }: AcceleratorDemoLayoutProps) {
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background relative overflow-hidden">
        {/* Ultra-premium animated background - matching real dashboard */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
          
          {/* Animated mesh orbs */}
          <motion.div
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-primary/8 via-primary/4 to-transparent blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -40, 0],
              y: [0, 30, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-1/3 -left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-secondary/6 via-secondary/3 to-transparent blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, 20, 0],
              y: [0, -30, 0],
              scale: [1, 1.08, 1],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            className="absolute -bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-accent/5 via-accent/2 to-transparent blur-3xl"
          />
          
          {/* Subtle grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
          
          {/* Top light wash */}
          <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent" />
        </div>

        <AcceleratorDemoSidebar onRestartTour={onRestartTour} />

        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          {/* Demo Mode Banner */}
          <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-b border-primary/20 px-4 py-2">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Info className="w-4 h-4 text-primary" />
                <span className="text-foreground">
                  <span className="font-semibold text-primary">Demo Mode</span> — You're viewing a fictional accelerator cohort.
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/accelerator/signup")}
                className="text-primary hover:text-primary hover:bg-primary/10 gap-1"
              >
                Apply to your cohort
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Premium glass header */}
          <motion.header 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="h-16 border-b border-white/[0.06] flex items-center justify-between px-6 sticky top-0 z-40 bg-card/40 backdrop-blur-2xl"
          >
            <div className="flex items-center gap-4">
              <SidebarTrigger className="p-2 -ml-2 rounded-lg hover:bg-white/[0.04] transition-colors">
                <Menu className="w-5 h-5 text-muted-foreground" />
              </SidebarTrigger>
              <div className="h-6 w-px bg-white/[0.06]" />
              <div>
                <h1 className="text-sm font-semibold text-foreground">
                  {DEMO_ACCELERATOR.name}
                </h1>
                <p className="text-xs text-muted-foreground/70">Ecosystem Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors relative group">
                <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
              </button>
            </div>
          </motion.header>

          <main className="flex-1 overflow-auto">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
