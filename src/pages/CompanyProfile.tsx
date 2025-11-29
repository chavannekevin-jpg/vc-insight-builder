import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Edit, Sparkles, Loader2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Company {
  id: string;
  name: string;
  description: string;
  category: string;
  stage: string;
  biggest_challenge: string;
}

interface MemoResponse {
  question_key: string;
  answer: string;
}

const QUESTION_LABELS: Record<string, { section: string; title: string }> = {
  problem_description: { section: "Problem", title: "What Makes People Suffer?" },
  problem_workflow: { section: "Problem", title: "Show Us The Broken System" },
  solution_description: { section: "Solution", title: "Your Weapon of Choice" },
  solution_features: { section: "Solution", title: "Unlock Your Arsenal" },
  solution_social_proof: { section: "Solution", title: "Show Me You Have Believers" },
  market_target_customer: { section: "Market", title: "Who's Paying The Bills?" },
  market_buying_persona: { section: "Market", title: "The Money Person" },
  market_current_acv: { section: "Market", title: "Your Price Tag Today" },
  market_projected_acv: { section: "Market", title: "Your Future Price Tag" },
  competition_mission: { section: "Competition", title: "Your Battle Cry" },
  competition_competitors: { section: "Competition", title: "Name Your Enemies" },
  competition_strength: { section: "Competition", title: "Your Secret Weapon" },
  team_size: { section: "Team", title: "Headcount Power" },
  team_functions: { section: "Team", title: "Who's In Your Elite Squad?" },
  team_founders: { section: "Team", title: "Meet The Founding Legends" },
  team_history: { section: "Team", title: "Team Chemistry Check" },
  team_ownership: { section: "Team", title: "Skin In The Game" },
  usp_differentiators: { section: "USP", title: "Your Unfair Advantages" },
  usp_distribution: { section: "USP", title: "Network Effect Unlocked?" },
  usp_business_model: { section: "USP", title: "The Money Machine Design" },
  usp_compliance: { section: "USP", title: "Your Regulatory Moat" },
  usp_data: { section: "USP", title: "Data Gold Mine?" },
  usp_customer_rationale: { section: "USP", title: "Why Customers Choose You" },
  business_model_type: { section: "Business Model", title: "How You Print Money" },
  business_model_revenue: { section: "Business Model", title: "Revenue Breakdown" },
  business_model_acv_growth: { section: "Business Model", title: "Growth Trajectory" },
  business_model_gtm: { section: "Business Model", title: "Sales War Room Strategy" },
  business_model_margins: { section: "Business Model", title: "Margin Magic" },
  business_model_future: { section: "Business Model", title: "Future Money Moves" },
  traction_launch: { section: "Traction", title: "Launch & First Wins" },
  traction_revenue: { section: "Traction", title: "Show Me You Have Momentum" },
  traction_customers: { section: "Traction", title: "Army Size" },
  traction_key_customers: { section: "Traction", title: "Name Drop Your Stars" },
  traction_efficiency: { section: "Traction", title: "Unit Economics Flex" },
  traction_funding: { section: "Traction", title: "Who Believes In You?" },
  traction_milestones: { section: "Traction", title: "Major Victory Lap" },
};

export default function CompanyProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [company, setCompany] = useState<Company | null>(null);
  const [responses, setResponses] = useState<MemoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [enhancing, setEnhancing] = useState(false);
  const [editingCompanyName, setEditingCompanyName] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedCompanyName, setEditedCompanyName] = useState("");
  const [editedSectionContent, setEditedSectionContent] = useState("");

  useEffect(() => {
    const loadCompanyData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: companies } = await supabase
        .from("companies")
        .select("*")
        .eq("founder_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!companies || companies.length === 0) {
        navigate("/intake");
        return;
      }

      setCompany(companies[0]);

      // Load questionnaire responses
      const { data: memoResponses } = await supabase
        .from("memo_responses")
        .select("question_key, answer")
        .eq("company_id", companies[0].id);

      if (memoResponses) {
        setResponses(memoResponses);
      }

      setEditedCompanyName(companies[0].name);
      setLoading(false);
    };

    loadCompanyData();
  }, [navigate]);

  const handleSaveCompanyName = async () => {
    if (!company || !editedCompanyName.trim()) return;

    try {
      const { error } = await supabase
        .from("companies")
        .update({ name: editedCompanyName })
        .eq("id", company.id);

      if (error) throw error;

      setCompany({ ...company, name: editedCompanyName });
      setEditingCompanyName(false);
      toast({
        title: "Company name updated",
        description: "Your changes have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveSection = async (sectionName: string) => {
    if (!company || !editedSectionContent.trim()) return;

    try {
      // Get all responses for this section
      const sectionResponses = responses.filter(
        (r) => QUESTION_LABELS[r.question_key]?.section === sectionName
      );

      if (sectionResponses.length === 0) return;

      // Update the first response with the edited content
      const firstResponse = sectionResponses[0];
      const { error } = await supabase
        .from("memo_responses")
        .update({ answer: editedSectionContent })
        .eq("company_id", company.id)
        .eq("question_key", firstResponse.question_key);

      if (error) throw error;

      // Update local state
      setResponses(
        responses.map((r) =>
          r.question_key === firstResponse.question_key
            ? { ...r, answer: editedSectionContent }
            : r
        )
      );

      setEditingSection(null);
      toast({
        title: "Section updated",
        description: "Your changes have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEnhanceContent = async () => {
    if (!company) return;
    
    setEnhancing(true);
    try {
      // Group responses by section
      const sectionData: Record<string, Record<string, string>> = {};
      
      ["Problem", "Solution", "Market", "Competition", "Team", "USP", "Business Model", "Traction"].forEach(
        (sectionName) => {
          const sectionResponses = responses.filter(
            (r) => QUESTION_LABELS[r.question_key]?.section === sectionName
          );
          
          if (sectionResponses.length > 0) {
            sectionData[sectionName] = {};
            sectionResponses.forEach((response) => {
              if (response.answer) {
                sectionData[sectionName][response.question_key] = response.answer;
              }
            });
          }
        }
      );

      const { data, error } = await supabase.functions.invoke("enhance-memo", {
        body: {
          company,
          sections: sectionData,
        },
      });

      if (error) throw error;

      const enhancedData = data as { enhanced: Record<string, string> };

      // Save enhanced content to database
      const updatedResponses = [...responses];
      
      for (const [sectionName, enhancedText] of Object.entries(enhancedData.enhanced)) {
        const sectionResponses = responses.filter(
          (r) => QUESTION_LABELS[r.question_key]?.section === sectionName
        );
        
        if (sectionResponses.length > 0) {
          // Update the first response in the section with the enhanced content
          const firstResponse = sectionResponses[0];
          
          const { error: updateError } = await supabase
            .from("memo_responses")
            .update({ answer: enhancedText })
            .eq("company_id", company.id)
            .eq("question_key", firstResponse.question_key);

          if (updateError) {
            console.error(`Error saving enhanced ${sectionName}:`, updateError);
          } else {
            // Update local state
            const index = updatedResponses.findIndex(
              (r) => r.question_key === firstResponse.question_key
            );
            if (index !== -1) {
              updatedResponses[index] = {
                ...updatedResponses[index],
                answer: enhancedText,
              };
            }
          }
        }
      }
      
      setResponses(updatedResponses);
      
      toast({
        title: "Content Enhanced & Saved! ✨",
        description: "Your memo has been professionally refined and saved to the database.",
      });
    } catch (error: any) {
      console.error("Enhancement error:", error);
      toast({
        title: "Enhancement Failed",
        description: error.message || "Could not enhance content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEnhancing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/hub")}>
              ← Back to Hub
            </Button>
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-serif font-bold">My Company Details</h1>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleEnhanceContent}
              disabled={enhancing || responses.length === 0}
              className="gap-2"
            >
              {enhancing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  AI Enhance All
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => navigate("/portal")} className="gap-2">
              <Edit className="w-4 h-4" />
              Edit Questionnaire
            </Button>
          </div>
        </div>

        {/* Company Overview - Memo Style */}
        <div className="bg-card border border-border rounded-lg p-8 space-y-6">
          <div className="border-b border-border pb-6">
            {editingCompanyName ? (
              <div className="flex items-center gap-3">
                <Input
                  value={editedCompanyName}
                  onChange={(e) => setEditedCompanyName(e.target.value)}
                  className="text-3xl font-serif font-bold h-auto py-2"
                  autoFocus
                />
                <Button size="sm" onClick={handleSaveCompanyName} className="gap-2">
                  <Check className="w-4 h-4" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditedCompanyName(company?.name || "");
                    setEditingCompanyName(false);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-serif font-bold">{company?.name}</h2>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingCompanyName(true)}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              </div>
            )}
            <div className="flex gap-3 mt-4">
              {company?.category && (
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {company.category}
                </Badge>
              )}
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {company?.stage}
              </Badge>
            </div>
          </div>

          {company?.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                Overview
              </h3>
              <p className="text-lg leading-relaxed">{company.description}</p>
            </div>
          )}

          {company?.biggest_challenge && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                Key Challenge
              </h3>
              <p className="text-lg leading-relaxed">{company.biggest_challenge}</p>
            </div>
          )}
        </div>

        {/* Memo Sections */}
        {["Problem", "Solution", "Market", "Competition", "Team", "USP", "Business Model", "Traction"].map(
          (sectionName) => {
            const sectionResponses = responses.filter(
              (r) => QUESTION_LABELS[r.question_key]?.section === sectionName
            );

            if (sectionResponses.length === 0) return null;

            // Get the first response which contains the section content (either original or AI-enhanced)
            const displayContent = sectionResponses[0]?.answer || "";

            return (
              <div key={sectionName} className="bg-card border border-border rounded-lg p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <h2 className="text-2xl font-serif font-bold">
                    {sectionName}
                  </h2>
                  <div className="flex items-center gap-2">
                    {editingSection === sectionName ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleSaveSection(sectionName)}
                          className="gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingSection(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingSection(sectionName);
                          setEditedSectionContent(displayContent);
                        }}
                        className="gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>

                {editingSection === sectionName ? (
                  <Textarea
                    value={editedSectionContent}
                    onChange={(e) => setEditedSectionContent(e.target.value)}
                    className="min-h-[300px] text-base leading-relaxed"
                    autoFocus
                  />
                ) : (
                  <div className="prose prose-slate max-w-none">
                    <p className="text-foreground text-base leading-relaxed whitespace-pre-wrap">
                      {displayContent}
                    </p>
                  </div>
                )}
              </div>
            );
          }
        )}

        {responses.length === 0 && (
          <div className="bg-card border border-border rounded-lg p-12 text-center space-y-4">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground" />
            <h3 className="text-2xl font-bold">No Content Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Complete the questionnaire to generate your investment memo.
            </p>
            <Button onClick={() => navigate("/portal")}>Start Questionnaire</Button>
          </div>
        )}
      </div>
    </div>
  );
}
