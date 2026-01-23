import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Menu } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AcceleratorSidebar } from "@/components/accelerator/AcceleratorSidebar";
import { AcceleratorOverview } from "@/components/accelerator/sections/AcceleratorOverview";
import { AcceleratorPortfolio } from "@/components/accelerator/sections/AcceleratorPortfolio";
import { AcceleratorCohorts } from "@/components/accelerator/sections/AcceleratorCohorts";
import { AcceleratorTeam } from "@/components/accelerator/sections/AcceleratorTeam";
import { AcceleratorInvites } from "@/components/accelerator/sections/AcceleratorInvites";
import { AcceleratorAnalyticsSection } from "@/components/accelerator/sections/AcceleratorAnalyticsSection";
import { AcceleratorSettings } from "@/components/accelerator/sections/AcceleratorSettings";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Accelerator {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  focus_areas: string[] | null;
  demo_day_date: string | null;
  program_length_weeks: number | null;
  cohort_size_target: number | null;
  website_url: string | null;
}

interface Cohort {
  id: string;
  name: string;
  invite_id: string | null;
  start_date: string | null;
  end_date: string | null;
  demo_day_date: string | null;
  is_active: boolean;
  company_count?: number;
}

interface Company {
  id: string;
  name: string;
  category: string | null;
  stage: string;
  public_score: number | null;
  memo_content_generated: boolean;
  created_at: string;
}

export default function AcceleratorDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [activeSection, setActiveSection] = useState("overview");
  const [accelerator, setAccelerator] = useState<Accelerator | null>(null);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!isAuthenticated || authLoading || !user) return;

    try {
      const { data: membership } = await supabase
        .from("accelerator_members")
        .select("accelerator_id")
        .eq("user_id", user.id)
        .not("joined_at", "is", null)
        .limit(1)
        .maybeSingle();

      if (!membership) {
        navigate("/accelerator/signup");
        return;
      }

      const { data: accData, error: accError } = await supabase
        .from("accelerators")
        .select("*")
        .eq("id", membership.accelerator_id)
        .single();

      if (accError) throw accError;
      
      if (!accData.onboarding_completed) {
        navigate("/accelerator/onboarding?bypassed=true");
        return;
      }

      setAccelerator(accData);

      const { data: cohortData } = await supabase
        .from("accelerator_cohorts")
        .select("*")
        .eq("accelerator_id", membership.accelerator_id)
        .order("created_at", { ascending: false });

      setCohorts(cohortData || []);

      if (cohortData && cohortData.length > 0) {
        const inviteIds = cohortData.filter(c => c.invite_id).map(c => c.invite_id);
        if (inviteIds.length > 0) {
          const { data: companyData } = await supabase
            .from("companies")
            .select("id, name, category, stage, public_score, memo_content_generated, created_at")
            .in("accelerator_invite_id", inviteIds);
          setCompanies(companyData || []);
        }
      }
    } catch (error: any) {
      console.error("Error fetching accelerator:", error);
      toast.error("Failed to load accelerator data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated, authLoading, user, navigate]);

  const stats = {
    totalStartups: companies.length,
    withReports: companies.filter(c => c.memo_content_generated).length,
    avgScore: companies.length > 0
      ? Math.round(companies.filter(c => c.public_score).reduce((sum, c) => sum + (c.public_score || 0), 0) / Math.max(companies.filter(c => c.public_score).length, 1))
      : 0,
    activeCohorts: cohorts.filter(c => c.is_active).length,
  };

  const handleViewStartup = (id: string) => {
    navigate(`/accelerator/startup/${id}`);
  };

  const renderContent = () => {
    if (!accelerator) return null;

    switch (activeSection) {
      case "portfolio":
        return <AcceleratorPortfolio companies={companies} onViewStartup={handleViewStartup} />;
      case "cohorts":
        return <AcceleratorCohorts cohorts={cohorts} acceleratorId={accelerator.id} onRefresh={fetchData} />;
      case "team":
        return <AcceleratorTeam acceleratorId={accelerator.id} currentUserId={user?.id || ""} />;
      case "invites":
        return <AcceleratorInvites acceleratorId={accelerator.id} acceleratorName={accelerator.name} acceleratorSlug={accelerator.slug} />;
      case "analytics":
        return <AcceleratorAnalyticsSection stats={stats} companies={companies} />;
      case "settings":
        return <AcceleratorSettings accelerator={accelerator} onUpdate={fetchData} />;
      default:
        return (
          <AcceleratorOverview
            accelerator={accelerator}
            stats={stats}
            recentCompanies={companies.slice(0, 5)}
            onNavigate={setActiveSection}
            onViewStartup={handleViewStartup}
          />
        );
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        {/* Animated background for loading */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center gap-4"
        >
          <div className="relative">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <div className="absolute inset-0 w-12 h-12 rounded-full bg-primary/20 blur-xl animate-pulse" />
          </div>
          <p className="text-muted-foreground font-medium">Loading your ecosystem...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full relative overflow-hidden">
        {/* Ultra-modern animated background */}
        <div className="fixed inset-0 pointer-events-none">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,51,153,0.08),transparent)]" />
          
          {/* Flowing water-like orbs with staggered animations */}
          <motion.div 
            className="absolute top-[-10%] left-[15%] w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(330 100% 65% / 0.12) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div 
            className="absolute top-[40%] right-[-5%] w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(280 100% 70% / 0.1) 0%, transparent 70%)',
              filter: 'blur(100px)',
            }}
            animate={{
              x: [0, -80, 0],
              y: [0, 80, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
          <motion.div 
            className="absolute bottom-[-10%] left-[30%] w-[700px] h-[700px] rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(200 100% 50% / 0.06) 0%, transparent 70%)',
              filter: 'blur(120px)',
            }}
            animate={{
              x: [0, 60, 0],
              y: [0, -40, 0],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4,
            }}
          />
          
          {/* Subtle grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(330 100% 65%) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(330 100% 65%) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
          
          {/* Light rays effect */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] opacity-30"
            style={{
              background: 'conic-gradient(from 90deg at 50% 0%, transparent 0deg, hsl(330 100% 65% / 0.05) 60deg, transparent 120deg)',
            }}
          />
        </div>

        <AcceleratorSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          accelerator={accelerator}
        />

        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          {/* Premium glassmorphism header */}
          <motion.header 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="h-16 border-b border-white/[0.06] flex items-center px-6 sticky top-0 z-40"
            style={{
              background: 'linear-gradient(to right, hsl(330 20% 10% / 0.8), hsl(330 20% 10% / 0.6))',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            }}
          >
            <SidebarTrigger className="mr-4 p-2 rounded-xl hover:bg-white/[0.06] transition-all duration-300 group">
              <Menu className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </SidebarTrigger>
            <div className="flex items-center gap-4">
              {/* Animated pulse indicator */}
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-primary animate-ping opacity-75" />
                <div className="absolute inset-[-4px] w-4 h-4 rounded-full bg-primary/20 animate-pulse" />
              </div>
              <div>
                <span className="text-sm font-semibold text-foreground tracking-tight">
                  {accelerator?.name || "Accelerator"}
                </span>
                <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">
                  Ecosystem Dashboard
                </span>
              </div>
            </div>
          </motion.header>

          <main className="flex-1 overflow-auto">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {renderContent()}
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
