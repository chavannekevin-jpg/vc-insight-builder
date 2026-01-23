import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Building2, Users, BarChart3, Settings, Plus, Search, 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, 
  Calendar, ArrowRight, Loader2, Link as LinkIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Accelerator {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  focus_areas: string[] | null;
  demo_day_date: string | null;
  program_length_weeks: number | null;
  cohort_size_target: number | null;
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

interface CohortCompany {
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
  
  const [accelerator, setAccelerator] = useState<Accelerator | null>(null);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [companies, setCompanies] = useState<CohortCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [connectCode, setConnectCode] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  // Fetch accelerator data
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || authLoading || !user) return;

      try {
        // Get the user's accelerator via membership
        const { data: membership } = await supabase
          .from("accelerator_members")
          .select("accelerator_id")
          .eq("user_id", user.id)
          .not("joined_at", "is", null)
          .limit(1)
          .maybeSingle();

        if (!membership) {
          // User doesn't have an accelerator
          navigate("/accelerator/signup");
          return;
        }

        // Fetch accelerator details
        const { data: accData, error: accError } = await supabase
          .from("accelerators")
          .select("*")
          .eq("id", membership.accelerator_id)
          .single();

        if (accError) throw accError;
        
        // Check if onboarding is complete
        if (!accData.onboarding_completed) {
          navigate("/accelerator/onboarding");
          return;
        }

        setAccelerator(accData);

        // Fetch cohorts
        const { data: cohortData } = await supabase
          .from("accelerator_cohorts")
          .select("*")
          .eq("accelerator_id", membership.accelerator_id)
          .order("created_at", { ascending: false });

        setCohorts(cohortData || []);

        // Fetch companies from connected cohorts
        if (cohortData && cohortData.length > 0) {
          const inviteIds = cohortData
            .filter(c => c.invite_id)
            .map(c => c.invite_id);

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

    fetchData();
  }, [isAuthenticated, authLoading, user, navigate]);

  // Connect cohort code
  const handleConnectCode = async () => {
    if (!connectCode.trim() || !accelerator) return;

    setIsConnecting(true);
    try {
      // Find the invite
      const { data: invite, error: inviteError } = await supabase
        .from("accelerator_invites")
        .select("id, code, accelerator_name, cohort_name")
        .eq("code", connectCode.trim().toUpperCase())
        .maybeSingle();

      if (inviteError || !invite) {
        toast.error("Invalid invite code");
        return;
      }

      // Check if already connected
      const existing = cohorts.find(c => c.invite_id === invite.id);
      if (existing) {
        toast.error("This cohort is already connected");
        return;
      }

      // Update invite to link to this accelerator
      await supabase
        .from("accelerator_invites")
        .update({ linked_accelerator_id: accelerator.id })
        .eq("id", invite.id);

      // Create cohort record
      const { data: newCohort, error: cohortError } = await supabase
        .from("accelerator_cohorts")
        .insert({
          accelerator_id: accelerator.id,
          name: invite.cohort_name || invite.accelerator_name || "Connected Cohort",
          invite_id: invite.id,
        })
        .select()
        .single();

      if (cohortError) throw cohortError;

      // Fetch companies for this cohort
      const { data: newCompanies } = await supabase
        .from("companies")
        .select("id, name, category, stage, public_score, memo_content_generated, created_at")
        .eq("accelerator_invite_id", invite.id);

      setCohorts(prev => [newCohort, ...prev]);
      setCompanies(prev => [...prev, ...(newCompanies || [])]);
      setConnectCode("");
      
      toast.success(`Connected ${newCompanies?.length || 0} startups from cohort`);
    } catch (error: any) {
      console.error("Connect error:", error);
      toast.error(error.message || "Failed to connect cohort");
    } finally {
      setIsConnecting(false);
    }
  };

  // Filter companies
  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Stats
  const stats = {
    totalStartups: companies.length,
    withReports: companies.filter(c => c.memo_content_generated).length,
    avgScore: companies.length > 0
      ? Math.round(companies.filter(c => c.public_score).reduce((sum, c) => sum + (c.public_score || 0), 0) / companies.filter(c => c.public_score).length) || 0
      : 0,
    activeCohorts: cohorts.filter(c => c.is_active).length,
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 75) return "text-success";
    if (score >= 60) return "text-primary";
    if (score >= 45) return "text-warning";
    return "text-destructive";
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold text-lg text-foreground">{accelerator?.name}</h1>
                <p className="text-xs text-muted-foreground">{stats.activeCohorts} active cohort{stats.activeCohorts !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/accelerator/analytics")}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/accelerator/settings")}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Startups", value: stats.totalStartups, icon: Users },
            { label: "With Reports", value: stats.withReports, icon: CheckCircle2 },
            { label: "Avg Score", value: stats.avgScore || "—", icon: TrendingUp },
            { label: "Active Cohorts", value: stats.activeCohorts, icon: Calendar },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Startups */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search & Connect */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search startups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter cohort code"
                  value={connectCode}
                  onChange={(e) => setConnectCode(e.target.value)}
                  className="w-40"
                />
                <Button
                  onClick={handleConnectCode}
                  disabled={!connectCode.trim() || isConnecting}
                  className="gap-2"
                >
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LinkIcon className="w-4 h-4" />
                  )}
                  Connect
                </Button>
              </div>
            </div>

            {/* Startup List */}
            {filteredCompanies.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No startups yet</h3>
                <p className="text-muted-foreground mb-4">
                  Connect a cohort using an invite code to see your startups here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCompanies.map((company) => (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "bg-card border border-border rounded-xl p-4 cursor-pointer transition-all",
                      "hover:border-primary/50 hover:shadow-md"
                    )}
                    onClick={() => navigate(`/accelerator/startup/${company.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-foreground truncate">{company.name}</h3>
                          {company.memo_content_generated ? (
                            <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
                              Report Ready
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                              Pending
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {company.category || "Uncategorized"} • {company.stage}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {company.public_score && (
                          <div className={cn("text-2xl font-bold", getScoreColor(company.public_score))}>
                            {company.public_score}
                          </div>
                        )}
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cohorts */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Cohorts</h3>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {cohorts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No cohorts connected yet</p>
              ) : (
                <div className="space-y-2">
                  {cohorts.map((cohort) => (
                    <div
                      key={cohort.id}
                      className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground text-sm">{cohort.name}</span>
                        {cohort.is_active && (
                          <span className="w-2 h-2 rounded-full bg-success" />
                        )}
                      </div>
                      {cohort.demo_day_date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Demo Day: {new Date(cohort.demo_day_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/accelerator/compare")}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Compare Startups
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/accelerator/team")}>
                  <Users className="w-4 h-4 mr-2" />
                  Manage Team
                </Button>
              </div>
            </div>

            {/* Demo Day Countdown */}
            {accelerator?.demo_day_date && (
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-2">Demo Day</h3>
                <p className="text-2xl font-bold text-primary">
                  {new Date(accelerator.demo_day_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {Math.ceil((new Date(accelerator.demo_day_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
