import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Building2, TrendingUp, Users, Target, 
  Lightbulb, DollarSign, BarChart3, Loader2, ExternalLink,
  CheckCircle2, AlertTriangle, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
}

interface MemoToolData {
  section_name: string;
  tool_name: string;
  ai_generated_data: any;
  user_overrides: any;
}

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
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [company, setCompany] = useState<Company | null>(null);
  const [toolData, setToolData] = useState<MemoToolData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !isAuthenticated || authLoading) return;

      try {
        // Fetch company
        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select("*")
          .eq("id", id)
          .single();

        if (companyError) throw companyError;
        setCompany(companyData);

        // Fetch memo tool data
        const { data: memoData } = await supabase
          .from("memo_tool_data")
          .select("section_name, tool_name, ai_generated_data, user_overrides")
          .eq("company_id", id);

        setToolData(memoData || []);
      } catch (error: any) {
        console.error("Error fetching company:", error);
        toast.error("Failed to load startup data");
        navigate("/accelerator");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated, authLoading, navigate]);

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

  // Extract VC Quick Take
  const vcQuickTake = company?.vc_verdict_json as any;

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
            <div className={cn("text-3xl font-bold", getScoreColor(company.public_score))}>
              {company.public_score || "—"}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!company.memo_content_generated ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Report Not Ready</h3>
            <p className="text-muted-foreground">
              This startup hasn't completed their analysis yet.
            </p>
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
                  {vcQuickTake.verdict && (
                    <p className="text-foreground mb-4">{vcQuickTake.verdict}</p>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
                    {vcQuickTake.strengths && vcQuickTake.strengths.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-success mb-2">Strengths</h4>
                        <ul className="space-y-1">
                          {vcQuickTake.strengths.slice(0, 3).map((s: string, i: number) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {vcQuickTake.concerns && vcQuickTake.concerns.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-destructive mb-2">Concerns</h4>
                        <ul className="space-y-1">
                          {vcQuickTake.concerns.slice(0, 3).map((c: string, i: number) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                              {c}
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
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
