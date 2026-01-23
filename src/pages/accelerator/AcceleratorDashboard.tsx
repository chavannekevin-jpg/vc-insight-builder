import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Menu, Bell } from "lucide-react";
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 text-primary/60 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your ecosystem...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Subtle premium background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-secondary/[0.01]" />
          <div 
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
              backgroundSize: '80px 80px',
            }}
          />
        </div>

        <AcceleratorSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          accelerator={accelerator}
        />

        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          {/* Clean header */}
          <motion.header 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="h-16 border-b border-border/50 flex items-center justify-between px-6 sticky top-0 z-40 bg-background/80 backdrop-blur-xl"
          >
            <div className="flex items-center gap-4">
              <SidebarTrigger className="p-2 -ml-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Menu className="w-5 h-5 text-muted-foreground" />
              </SidebarTrigger>
              <div className="h-6 w-px bg-border/50" />
              <div>
                <h1 className="text-sm font-semibold text-foreground">
                  {accelerator?.name}
                </h1>
                <p className="text-xs text-muted-foreground">Ecosystem Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-muted/50 transition-colors relative">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
              </button>
            </div>
          </motion.header>

          <main className="flex-1 overflow-auto">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {renderContent()}
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
