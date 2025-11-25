import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Company {
  id: string;
  name: string;
  stage: string;
  category: string | null;
}

interface Response {
  question_key: string;
  answer: string;
}

const sectionMapping: Record<string, string[]> = {
  problem: ["problem_description", "problem_workflow"],
};

const MemoBuilder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [generatedMemo, setGeneratedMemo] = useState<string>("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have admin permissions",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      await fetchCompanies();
    } catch (error) {
      console.error("Error:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, stage, category")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive",
      });
    }
  };

  const handleCompanySelect = async (companyId: string) => {
    setSelectedCompanyId(companyId);
    setGeneratedMemo("");
    
    const company = companies.find(c => c.id === companyId);
    setSelectedCompany(company || null);

    try {
      const { data, error } = await supabase
        .from("memo_responses")
        .select("question_key, answer")
        .eq("company_id", companyId);

      if (error) throw error;
      setResponses(data || []);
    } catch (error) {
      console.error("Error fetching responses:", error);
      toast({
        title: "Error",
        description: "Failed to load company responses",
        variant: "destructive",
      });
    }
  };

  const handleGenerateMemo = async (section: string) => {
    if (!selectedCompany) return;

    setGenerating(true);
    try {
      const questionKeys = sectionMapping[section] || [];
      const sectionResponses: Record<string, string> = {};
      
      questionKeys.forEach(key => {
        const response = responses.find(r => r.question_key === key);
        if (response?.answer) {
          sectionResponses[key] = response.answer;
        }
      });

      const { data, error } = await supabase.functions.invoke("enhance-memo", {
        body: {
          company: {
            name: selectedCompany.name,
            stage: selectedCompany.stage,
            category: selectedCompany.category || "startup",
          },
          sections: {
            [section]: sectionResponses,
          },
        },
      });

      if (error) throw error;

      if (data?.enhanced?.[section]) {
        setGeneratedMemo(data.enhanced[section]);
        toast({
          title: "Success",
          description: "Memo section generated successfully",
        });
      } else {
        throw new Error("No memo content generated");
      }
    } catch (error) {
      console.error("Error generating memo:", error);
      toast({
        title: "Error",
        description: "Failed to generate memo section",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const getSectionResponses = (section: string) => {
    const questionKeys = sectionMapping[section] || [];
    return questionKeys.map(key => {
      const response = responses.find(r => r.question_key === key);
      return {
        key,
        answer: response?.answer || "No answer provided",
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
          <h1 className="text-2xl font-bold text-primary">Memo Builder</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <ModernCard className="mb-6">
          <div className="flex items-center gap-4">
            <FileText className="w-8 h-8 text-primary" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground mb-1">
                Select a Company
              </h2>
              <p className="text-sm text-muted-foreground">
                Choose a startup to generate professional memo sections
              </p>
            </div>
            <Select value={selectedCompanyId} onValueChange={handleCompanySelect}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a company..." />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name} ({company.stage})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </ModernCard>

        {selectedCompany && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Problem Section */}
            <ModernCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Problem Section</h3>
                <Button
                  onClick={() => handleGenerateMemo("problem")}
                  disabled={generating}
                  size="sm"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {generating ? "Generating..." : "Generate Memo"}
                </Button>
              </div>
              
              <div className="space-y-4">
                {getSectionResponses("problem").map(({ key, answer }) => (
                  <div key={key} className="border-b border-border pb-3 last:border-0">
                    <p className="text-sm font-medium text-foreground mb-1">
                      {key === "problemStatement" ? "Problem Statement" : "Biggest Challenge"}
                    </p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {answer}
                    </p>
                  </div>
                ))}
              </div>
            </ModernCard>

            {/* Generated Memo Output */}
            <ModernCard>
              <h3 className="text-lg font-bold text-foreground mb-4">Generated Memo</h3>
              {generatedMemo ? (
                <div className="space-y-4">
                  <Textarea
                    value={generatedMemo}
                    onChange={(e) => setGeneratedMemo(e.target.value)}
                    className="min-h-[300px] font-sans"
                    placeholder="Generated memo will appear here..."
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedMemo);
                      toast({
                        title: "Copied",
                        description: "Memo content copied to clipboard",
                      });
                    }}
                  >
                    Copy to Clipboard
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] border-2 border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground text-center">
                    Select a section and click "Generate Memo"<br />to see the AI-enhanced content here
                  </p>
                </div>
              )}
            </ModernCard>
          </div>
        )}
      </main>
    </div>
  );
};

export default MemoBuilder;
