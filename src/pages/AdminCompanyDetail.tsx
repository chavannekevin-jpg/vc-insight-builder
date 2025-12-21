import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CompanyDetail {
  id: string;
  name: string;
  stage: string;
  founder_email: string;
  created_at: string;
  has_premium: boolean;
  generations_available: number;
  generations_used: number;
  memo_content_generated: boolean;
}

interface MemoResponse {
  question_key: string;
  answer: string;
  updated_at: string;
}

interface MemoJob {
  id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
}

const questionLabels: Record<string, string> = {
  companyName: "Company Name",
  stage: "Company Stage",
  problemStatement: "Problem Statement",
  solution: "Solution Description",
  targetMarket: "Target Market",
  uniqueValue: "Unique Value Proposition",
  competitiveAdvantage: "Competitive Advantage",
  businessModel: "Business Model",
  revenueStreams: "Revenue Streams",
  currentTraction: "Current Traction",
  keyMetrics: "Key Metrics",
  teamBackground: "Team Background",
  fundingNeeds: "Funding Needs",
  useOfFunds: "Use of Funds",
  exitStrategy: "Exit Strategy",
};

const AdminCompanyDetail = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [responses, setResponses] = useState<MemoResponse[]>([]);
  const [latestJob, setLatestJob] = useState<MemoJob | null>(null);
  const [generatingMemo, setGeneratingMemo] = useState(false);
  const [pollingJob, setPollingJob] = useState(false);

  useEffect(() => {
    checkAuthAndFetch();
  }, [companyId]);

  // Poll for job status when generating
  useEffect(() => {
    if (!pollingJob || !latestJob) return;

    const interval = setInterval(async () => {
      await fetchLatestJob();
    }, 3000);

    return () => clearInterval(interval);
  }, [pollingJob, latestJob?.id]);

  const checkAuthAndFetch = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/");
        return;
      }

      // Check admin role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        navigate("/");
        return;
      }

      await Promise.all([fetchCompanyData(), fetchLatestJob()]);
    } catch (error) {
      console.error("Error:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyData = async () => {
    if (!companyId) return;

    try {
      // Fetch active question keys first
      const { data: activeQuestions } = await supabase
        .from("questionnaire_questions")
        .select("question_key")
        .eq("is_active", true);

      const activeQuestionKeys = (activeQuestions || []).map(q => q.question_key);

      // Fetch company details
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select(`
          id,
          name,
          stage,
          created_at,
          has_premium,
          generations_available,
          generations_used,
          memo_content_generated,
          profiles!companies_founder_id_fkey(email)
        `)
        .eq("id", companyId)
        .single();

      if (companyError) throw companyError;

      setCompany({
        id: companyData.id,
        name: companyData.name,
        stage: companyData.stage,
        founder_email: (companyData.profiles as any)?.email || "N/A",
        created_at: companyData.created_at,
        has_premium: companyData.has_premium || false,
        generations_available: companyData.generations_available || 0,
        generations_used: companyData.generations_used || 0,
        memo_content_generated: companyData.memo_content_generated || false,
      });

      // Fetch responses - only for active questions
      const { data: responsesData, error: responsesError } = await supabase
        .from("memo_responses")
        .select("question_key, answer, updated_at")
        .eq("company_id", companyId)
        .order("updated_at", { ascending: true });

      if (responsesError) throw responsesError;

      // Filter to only active question responses
      const activeResponses = (responsesData || []).filter(
        r => activeQuestionKeys.includes(r.question_key)
      );

      setResponses(activeResponses);
    } catch (error) {
      console.error("Error fetching company data:", error);
      toast({
        title: "Error",
        description: "Failed to load company details",
        variant: "destructive",
      });
    }
  };

  const fetchLatestJob = async () => {
    if (!companyId) return;

    try {
      const { data: jobs, error } = await supabase
        .from("memo_generation_jobs")
        .select("id, status, started_at, completed_at, error_message")
        .eq("company_id", companyId)
        .order("started_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (jobs && jobs.length > 0) {
        const job = jobs[0];
        setLatestJob(job);
        
        // Stop polling if job is completed or failed
        if (job.status === "completed" || job.status === "failed") {
          setPollingJob(false);
          setGeneratingMemo(false);
          
          // Refresh company data to get updated memo status
          await fetchCompanyData();
          
          if (job.status === "completed") {
            toast({
              title: "Memo Generated",
              description: "The memo has been successfully generated.",
            });
          } else if (job.status === "failed") {
            toast({
              title: "Generation Failed",
              description: job.error_message || "Unknown error occurred",
              variant: "destructive",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching latest job:", error);
    }
  };

  const handleGenerateMemo = async () => {
    if (!companyId) return;

    setGeneratingMemo(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("Not authenticated");
      }

      const response = await supabase.functions.invoke("admin-generate-memo", {
        body: { companyId },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to trigger memo generation");
      }

      const result = response.data;

      if (!result.success) {
        throw new Error(result.error || "Failed to trigger memo generation");
      }

      toast({
        title: "Memo Generation Started",
        description: "The memo is being generated in the background. This may take 1-2 minutes.",
      });

      // Start polling for job status
      setLatestJob({ 
        id: result.jobId, 
        status: "pending", 
        started_at: new Date().toISOString(),
        completed_at: null,
        error_message: null 
      });
      setPollingJob(true);
    } catch (error) {
      console.error("Error generating memo:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate memo",
        variant: "destructive",
      });
      setGeneratingMemo(false);
    }
  };

  const getJobStatusBadge = () => {
    if (!latestJob) return null;

    switch (latestJob.status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs">
            <AlertCircle className="w-3 h-3" />
            Failed
          </span>
        );
      case "processing":
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs">
            <Loader2 className="w-3 h-3 animate-spin" />
            Processing
          </span>
        );
      default:
        return (
          <span className="text-xs text-muted-foreground">{latestJob.status}</span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Company not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button
            onClick={() => navigate("/admin")}
            variant="ghost"
            size="sm"
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-primary">{company.name}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Company Info */}
        <ModernCard className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Company Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Company Name</p>
              <p className="text-foreground font-medium">{company.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Stage</p>
              <p className="text-foreground font-medium">{company.stage}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Founder Email</p>
              <p className="text-foreground font-medium">{company.founder_email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Submitted</p>
              <p className="text-foreground font-medium">
                {new Date(company.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Premium Status</p>
              <p className={`font-medium ${company.has_premium ? 'text-green-500' : 'text-muted-foreground'}`}>
                {company.has_premium ? 'Premium' : 'Free'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Generations</p>
              <p className="text-foreground font-medium">
                {company.generations_used} used / {company.generations_available} available
              </p>
            </div>
          </div>
        </ModernCard>

        {/* Memo Generation Card */}
        <ModernCard className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Memo Generation</h2>
            {getJobStatusBadge()}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Memo Generated</p>
                <p className={`font-medium ${company.memo_content_generated ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {company.memo_content_generated ? 'Yes' : 'No'}
                </p>
              </div>
            </div>

            {latestJob && (
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <p className="text-sm font-medium text-foreground">Latest Job</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Started:</span>{" "}
                    {new Date(latestJob.started_at).toLocaleString()}
                  </div>
                  {latestJob.completed_at && (
                    <div>
                      <span className="text-muted-foreground">Completed:</span>{" "}
                      {new Date(latestJob.completed_at).toLocaleString()}
                    </div>
                  )}
                </div>
                {latestJob.error_message && (
                  <p className="text-sm text-destructive mt-2">
                    Error: {latestJob.error_message}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleGenerateMemo}
                disabled={generatingMemo || pollingJob}
                className="gap-2"
              >
                {generatingMemo || pollingJob ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Generate Memo
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => fetchLatestJob()}
                variant="outline"
                size="icon"
                disabled={generatingMemo}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Admin-triggered memo generation bypasses frontend requirements. Use this to fix stuck users.
            </p>
          </div>
        </ModernCard>

        {/* Questionnaire Responses */}
        <ModernCard>
          <h2 className="text-2xl font-bold text-foreground mb-6">Questionnaire Responses</h2>
          {responses.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No responses submitted yet
            </p>
          ) : (
            <div className="space-y-6">
              {responses.map((response) => (
                <div key={response.question_key} className="border-b border-border pb-6 last:border-0">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {questionLabels[response.question_key] || response.question_key}
                  </h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {response.answer || "No answer provided"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Last updated: {new Date(response.updated_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ModernCard>
      </main>
    </div>
  );
};

export default AdminCompanyDetail;
