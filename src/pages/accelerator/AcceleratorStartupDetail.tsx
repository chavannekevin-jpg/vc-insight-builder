import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Building2, TrendingUp, Users, Target, 
  Lightbulb, DollarSign, BarChart3, Loader2, ExternalLink,
  CheckCircle2, AlertTriangle, Clock, Layers, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AssignCohortDialog } from "@/components/accelerator/AssignCohortDialog";
import { StartupPreviewCard } from "@/components/accelerator/StartupPreviewCard";
import { checkDashboardReadiness, DashboardReadinessResult } from "@/lib/dashboardReadiness";

interface Company {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  stage: string;
  public_score: number | null;
  memo_content_generated: boolean;
  vc_verdict_json: any;
  created_at: string;
  accelerator_invite_id: string | null;
}

interface MemoToolData {
  section_name: string;
  tool_name: string;
  ai_generated_data: any;
  user_overrides: any;
}

interface CohortInfo {
  name: string;
  accelerator_id: string;
}

type VCQuickTakeItem =
  | string
  | {
      text?: string;
      category?: string;
      teaserLine?: string;
      vcQuote?: string;
    };

const getVCQuickTakeItemText = (item: VCQuickTakeItem): string => {
  if (typeof item === "string") return item;
  return item.teaserLine || item.text || item.vcQuote || "";
};

const sectionIcons: Record<string, any> = {
  Team: Users,
  Market: Target,
  Problem: AlertTriangle,
  Solution: Lightbulb,
  Traction: TrendingUp,
  "Business Model": DollarSign,
  Competition: BarChart3,
  Vision: Building2,
};

const sectionLabels: Record<string, string> = {
  Team: "Team",
  Market: "Market",
  Problem: "Problem",
  Solution: "Solution",
  Traction: "Traction",
  "Business Model": "Business Model",
  Competition: "Competition",
  Vision: "Vision",
};

export default function AcceleratorStartupDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const acceleratorIdFromUrl = searchParams.get("acceleratorId");
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [company, setCompany] = useState<Company | null>(null);
  const [toolData, setToolData] = useState<MemoToolData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cohortInfo, setCohortInfo] = useState<CohortInfo | null>(null);
  const [acceleratorId, setAcceleratorId] = useState<string | null>(acceleratorIdFromUrl);
  const [assignCohortOpen, setAssignCohortOpen] = useState(false);
  const [showPreviewCard, setShowPreviewCard] = useState(false);
  const [dashboardReadiness, setDashboardReadiness] = useState<DashboardReadinessResult | null>(null);
  const [vcQuickTake, setVcQuickTake] = useState<any>(null);

  const verdictText = (() => {
    const v = vcQuickTake?.verdict;
    if (!v) return "";
    if (typeof v === "string") return v;
    return getVCQuickTakeItemText(v as VCQuickTakeItem);
  })();

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !isAuthenticated || authLoading) return;

      try {
        // Fetch company and check dashboard readiness in parallel
        const [companyResult, readinessResult] = await Promise.all([
          supabase
            .from("companies")
            .select("*")
            .eq("id", id)
            .single(),
          checkDashboardReadiness(id)
        ]);

        if (companyResult.error) throw companyResult.error;
        setCompany(companyResult.data);
        setDashboardReadiness(readinessResult);

        // Fetch memo tool data and memo for vcQuickTake
        const [memoToolResult, memoResult] = await Promise.all([
          supabase
            .from("memo_tool_data")
            .select("section_name, tool_name, ai_generated_data, user_overrides")
            .eq("company_id", id),
          supabase
            .from("memos")
            .select("structured_content")
            .eq("company_id", id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()
        ]);

        setToolData(memoToolResult.data || []);
        
        // Extract vcQuickTake from memo's structured_content
        const structuredContent = memoResult.data?.structured_content as any;
        if (structuredContent?.vcQuickTake) {
          setVcQuickTake(structuredContent.vcQuickTake);
        } else {
          // Fallback to company's vc_verdict_json
          setVcQuickTake(companyResult.data.vc_verdict_json);
        }

        // If company has an accelerator_invite_id, find the cohort/accelerator
        if (companyResult.data.accelerator_invite_id) {
          // First try to find a cohort linked to this invite
          const { data: cohort } = await supabase
            .from("accelerator_cohorts")
            .select("name, accelerator_id")
            .eq("invite_id", companyResult.data.accelerator_invite_id)
            .maybeSingle();

          if (cohort) {
            setCohortInfo({ name: cohort.name, accelerator_id: cohort.accelerator_id });
            if (!acceleratorId) setAcceleratorId(cohort.accelerator_id);
          } else {
            // If no cohort, find the accelerator directly from the invite
            const { data: invite } = await supabase
              .from("accelerator_invites")
              .select("linked_accelerator_id")
              .eq("id", companyResult.data.accelerator_invite_id)
              .maybeSingle();

            if (invite?.linked_accelerator_id && !acceleratorId) {
              setAcceleratorId(invite.linked_accelerator_id);
            }
          }
        }

        // If still no accelerator ID, try to get from user's membership
        if (!acceleratorId && !cohortInfo && user) {
          const { data: membership } = await supabase
            .from("accelerator_members")
            .select("accelerator_id")
            .eq("user_id", user.id)
            .not("joined_at", "is", null)
            .limit(1)
            .maybeSingle();

          if (membership) {
            setAcceleratorId(membership.accelerator_id);
          }
        }
      } catch (error: any) {
        console.error("Error fetching company:", error);
        toast.error("Failed to load startup data");
        navigate("/accelerator");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated, authLoading, navigate, user]);

  const refreshData = async () => {
    if (!id) return;
    
    const { data: companyData } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .single();

    if (companyData) {
      setCompany(companyData);

      // Re-fetch cohort info
      if (companyData.accelerator_invite_id) {
        const { data: cohort } = await supabase
          .from("accelerator_cohorts")
          .select("name, accelerator_id")
          .eq("invite_id", companyData.accelerator_invite_id)
          .maybeSingle();

        if (cohort) {
          setCohortInfo({ name: cohort.name, accelerator_id: cohort.accelerator_id });
        } else {
          setCohortInfo(null);
        }
      }
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 75) return "text-success";
    if (score >= 60) return "text-primary";
    if (score >= 45) return "text-warning";
    return "text-destructive";
  };

  const getScoreBg = (score: number | null) => {
    if (!score) return "bg-muted";
    if (score >= 75) return "bg-success";
    if (score >= 60) return "bg-primary";
    if (score >= 45) return "bg-warning";
    return "bg-destructive";
  };

  // Extract section scores from tool data
  const sectionScores: Record<string, number> = {};
  toolData.forEach((tool) => {
    if (tool.tool_name === "sectionScore") {
      const data = { ...(tool.ai_generated_data || {}), ...(tool.user_overrides || {}) };
      if (data.score) {
        sectionScores[tool.section_name] = data.score;
      }
    }
  });

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Startup Not Found</h2>
          <Button onClick={() => navigate("/accelerator")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  // Show preview card mode
  if (showPreviewCard && dashboardReadiness?.isReady) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Button variant="ghost" size="sm" onClick={() => setShowPreviewCard(false)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Details
            </Button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <StartupPreviewCard
            companyName={company.name}
            description={company.description}
            category={company.category}
            stage={company.stage}
            score={company.public_score}
            sectionScores={sectionScores}
            vcQuickTake={vcQuickTake}
            createdAt={company.created_at}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/accelerator")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="font-semibold text-lg text-foreground">{company.name}</h1>
                <p className="text-xs text-muted-foreground">
                  {company.category || "Uncategorized"} • {company.stage}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {dashboardReadiness?.isReady && (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate(`/accelerator/startup/${id}/preview`)}
                    className="gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Ecosystem
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreviewCard(true)}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Quick Summary
                  </Button>
                </>
              )}
              <div className={cn("text-3xl font-bold", getScoreColor(company.public_score))}>
                {company.public_score || "—"}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Cohort Assignment Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-card/60 border border-border/50 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cohort</p>
              <p className="font-medium text-foreground">
                {cohortInfo?.name || "Not assigned"}
              </p>
            </div>
          </div>
          {acceleratorId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAssignCohortOpen(true)}
              className="gap-2"
            >
              <Layers className="w-4 h-4" />
              {cohortInfo ? "Change Cohort" : "Assign to Cohort"}
            </Button>
          )}
        </motion.div>

        {!dashboardReadiness?.isReady ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Report Not Ready</h3>
            <p className="text-muted-foreground mb-4">
              This startup hasn't completed their analysis yet.
            </p>
            {dashboardReadiness && (
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Missing: {dashboardReadiness.missingSections.length > 0 
                  ? dashboardReadiness.missingSections.join(", ") 
                  : "Section scores complete"}</p>
                <p>VC Quick Take: {dashboardReadiness.hasVcQuickTake ? "✓" : "Pending"}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {company.description && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-xl p-6"
                >
                  <h3 className="font-semibold text-foreground mb-3">About</h3>
                  <p className="text-muted-foreground">{company.description}</p>
                </motion.div>
              )}

              {/* VC Quick Take */}
              {vcQuickTake && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-xl p-6"
                >
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    VC Quick Take
                  </h3>
                  {verdictText && <p className="text-foreground mb-4">{verdictText}</p>}
                  <div className="grid md:grid-cols-2 gap-4">
                    {vcQuickTake.strengths && vcQuickTake.strengths.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-success mb-2">Strengths</h4>
                        <ul className="space-y-1">
                          {vcQuickTake.strengths.slice(0, 3).map((s: VCQuickTakeItem, i: number) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{getVCQuickTakeItemText(s)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {vcQuickTake.concerns && vcQuickTake.concerns.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-destructive mb-2">Concerns</h4>
                        <ul className="space-y-1">
                          {vcQuickTake.concerns.slice(0, 3).map((c: VCQuickTakeItem, i: number) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{getVCQuickTakeItemText(c)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Section Scores */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border border-border rounded-xl p-6"
              >
                <h3 className="font-semibold text-foreground mb-4">Section Breakdown</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {Object.entries(sectionLabels).map(([key, label]) => {
                    const score = sectionScores[key];
                    const Icon = sectionIcons[key] || Target;
                    return (
                      <div
                        key={key}
                        className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-foreground">{label}</span>
                            <span className={cn("font-bold", getScoreColor(score || null))}>
                              {score || "—"}
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn("h-full rounded-full transition-all", getScoreBg(score || null))}
                              style={{ width: `${score || 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Overall Score */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card border border-border rounded-xl p-6 text-center"
              >
                <p className="text-sm text-muted-foreground mb-2">Fundability Score</p>
                <div className={cn("text-5xl font-bold mb-2", getScoreColor(company.public_score))}>
                  {company.public_score || "—"}
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", getScoreBg(company.public_score))}
                    style={{ width: `${company.public_score || 0}%` }}
                  />
                </div>
              </motion.div>

              {/* Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border rounded-xl p-6"
              >
                <h3 className="font-semibold text-foreground mb-4">Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="text-foreground font-medium">{company.category || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Stage</span>
                    <span className="text-foreground font-medium">{company.stage}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Joined</span>
                    <span className="text-foreground font-medium">
                      {new Date(company.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {cohortInfo && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Cohort</span>
                      <span className="text-foreground font-medium">{cohortInfo.name}</span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border border-border rounded-xl p-6"
              >
                <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {company.memo_content_generated && (
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => setShowPreviewCard(true)}
                    >
                      <Eye className="w-4 h-4" />
                      View Full Preview Card
                    </Button>
                  )}
                  {acceleratorId && (
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => setAssignCohortOpen(true)}
                    >
                      <Layers className="w-4 h-4" />
                      {cohortInfo ? "Change Cohort" : "Assign to Cohort"}
                    </Button>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </main>

      {/* Assign Cohort Dialog */}
      {acceleratorId && (
        <AssignCohortDialog
          open={assignCohortOpen}
          onOpenChange={setAssignCohortOpen}
          companyId={company.id}
          companyName={company.name}
          acceleratorId={acceleratorId}
          currentCohortName={cohortInfo?.name}
          onAssigned={refreshData}
        />
      )}
    </div>
  );
}
