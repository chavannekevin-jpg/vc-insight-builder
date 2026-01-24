import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Menu, Bell } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AcceleratorSidebar } from "@/components/accelerator/AcceleratorSidebar";
import { AcceleratorOverview } from "@/components/accelerator/sections/AcceleratorOverview";
import { AcceleratorPortfolio } from "@/components/accelerator/sections/AcceleratorPortfolio";
import { AcceleratorCohortsView } from "@/components/accelerator/sections/AcceleratorCohortsView";
import { AcceleratorTeam } from "@/components/accelerator/sections/AcceleratorTeam";
import { AcceleratorInvites } from "@/components/accelerator/sections/AcceleratorInvites";
import { AcceleratorAnalyticsSection } from "@/components/accelerator/sections/AcceleratorAnalyticsSection";
import { AcceleratorSettings } from "@/components/accelerator/sections/AcceleratorSettings";
import { StartupQuickViewModal } from "@/components/accelerator/StartupQuickViewModal";
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
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [activeSection, setActiveSection] = useState("overview");
  const [accelerator, setAccelerator] = useState<Accelerator | null>(null);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state for quick startup view
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  // Get accelerator ID from URL or fallback to user's membership
  const urlAcceleratorId = searchParams.get("id");

  const fetchData = async () => {
    if (!isAuthenticated || authLoading || !user) return;

    try {
      let acceleratorId = urlAcceleratorId;

      // If no ID in URL, find user's first accelerator membership
      if (!acceleratorId) {
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
        acceleratorId = membership.accelerator_id;
      }

      const { data: accData, error: accError } = await supabase
        .from("accelerators")
        .select("*")
        .eq("id", acceleratorId)
        .single();

      if (accError) throw accError;
      
      if (!accData.onboarding_completed) {
        navigate(`/accelerator/onboarding?id=${acceleratorId}&bypassed=true`);
        return;
      }

      setAccelerator(accData);

      const { data: cohortData } = await supabase
        .from("accelerator_cohorts")
        .select("*")
        .eq("accelerator_id", acceleratorId)
        .order("created_at", { ascending: false });

      setCohorts(cohortData || []);

      // Get all invites linked to this accelerator (not just through cohorts)
      const { data: allInvites } = await supabase
        .from("accelerator_invites")
        .select("id")
        .eq("linked_accelerator_id", acceleratorId);

      // Collect invite IDs from both cohorts and direct accelerator invites
      const cohortInviteIds = (cohortData || []).filter(c => c.invite_id).map(c => c.invite_id);
      const directInviteIds = (allInvites || []).map(inv => inv.id);
      
      // Combine and deduplicate
      const allInviteIds = [...new Set([...cohortInviteIds, ...directInviteIds])];

      if (allInviteIds.length > 0) {
        const { data: companyData } = await supabase
          .from("companies")
          .select("id, name, category, stage, public_score, memo_content_generated, created_at")
          .in("accelerator_invite_id", allInviteIds);
        setCompanies(companyData || []);
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
    // Open the quick view modal instead of navigating
    setSelectedCompanyId(id);
    setQuickViewOpen(true);
  };

  const handleViewStartupFullPage = (id: string) => {
    // For cases where we need full page navigation
    navigate(`/accelerator/startup/${id}?acceleratorId=${accelerator?.id || ''}`);
  };

  const renderContent = () => {
    if (!accelerator) return null;

    switch (activeSection) {
      case "portfolio":
        return <AcceleratorPortfolio companies={companies} onViewStartup={handleViewStartup} />;
      case "cohorts":
        return <AcceleratorCohortsView cohorts={cohorts} acceleratorId={accelerator.id} onRefresh={fetchData} onViewStartup={handleViewStartupFullPage} />;
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
      <div className="min-h-screen flex w-full bg-background relative overflow-hidden">
        {/* Ultra-premium animated background */}
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

        <AcceleratorSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          accelerator={accelerator}
        />

        <div className="flex-1 flex flex-col min-w-0 relative z-10">
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
                  {accelerator?.name}
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
              key={activeSection}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {renderContent()}
            </motion.div>
          </main>
        </div>

        {/* Startup Quick View Modal */}
        <StartupQuickViewModal
          open={quickViewOpen}
          onOpenChange={setQuickViewOpen}
          companyId={selectedCompanyId}
          acceleratorId={accelerator?.id}
        />
      </div>
    </SidebarProvider>
  );
}
