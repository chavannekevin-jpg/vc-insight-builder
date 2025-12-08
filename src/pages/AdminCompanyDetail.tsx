import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CompanyDetail {
  id: string;
  name: string;
  stage: string;
  founder_email: string;
  created_at: string;
}

interface MemoResponse {
  question_key: string;
  answer: string;
  updated_at: string;
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

  useEffect(() => {
    checkAuthAndFetch();
  }, [companyId]);

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

      await fetchCompanyData();
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
