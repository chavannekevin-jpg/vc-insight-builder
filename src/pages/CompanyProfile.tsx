import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Edit, Sparkles, Loader2, Check, X, Zap, Rocket, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QuickFillWizard } from "@/components/QuickFillWizard";
import { DeckImportWizard } from "@/components/DeckImportWizard";
import { UnitEconomicsEditor } from "@/components/UnitEconomicsEditor";

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
  // Problem Section
  problem_description: { section: "Problem", title: "What Makes People Suffer?" },
  problem_validation: { section: "Problem", title: "How Do You Know This Hurts?" },
  
  // Solution Section
  solution_description: { section: "Solution", title: "Your Killer Solution" },
  solution_demo: { section: "Solution", title: "Show, Don't Tell" },
  
  // Market Section
  market_size: { section: "Market", title: "How Big Is This Thing?" },
  market_timing: { section: "Market", title: "Why Now?" },
  target_customer: { section: "Market", title: "Who Pays You?" },
  
  // Competition Section
  competitors: { section: "Competition", title: "Who Else Wants This?" },
  competitive_advantage: { section: "Competition", title: "Your Competitive Edge" },
  
  // Team Section
  founder_background: { section: "Team", title: "Why You?" },
  team_composition: { section: "Team", title: "The Band" },
  
  // Business Model Section
  revenue_model: { section: "Business Model", title: "Show Me The Money" },
  unit_economics: { section: "Business Model", title: "The Math" },
  
  // Traction Section
  current_traction: { section: "Traction", title: "Proof of Life" },
  key_milestones: { section: "Traction", title: "What's Next?" },
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
  const [wizardOpen, setWizardOpen] = useState(false);
  const [deckWizardOpen, setDeckWizardOpen] = useState(false);

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

  const handleSaveSection = async (sectionName: string, questionKey: string) => {
    if (!company || !editedSectionContent.trim()) return;

    try {
      // Check if response exists
      const existingResponse = responses.find((r) => r.question_key === questionKey);

      if (existingResponse) {
        // Update existing response
        const { error } = await supabase
          .from("memo_responses")
          .update({ answer: editedSectionContent })
          .eq("company_id", company.id)
          .eq("question_key", questionKey);

        if (error) throw error;

        // Update local state
        setResponses(
          responses.map((r) =>
            r.question_key === questionKey
              ? { ...r, answer: editedSectionContent }
              : r
          )
        );
      } else {
        // Create new response
        const { error } = await supabase
          .from("memo_responses")
          .insert({
            company_id: company.id,
            question_key: questionKey,
            answer: editedSectionContent,
          });

        if (error) throw error;

        // Update local state
        setResponses([
          ...responses,
          { question_key: questionKey, answer: editedSectionContent },
        ]);
      }

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
      
      ["Problem", "Solution", "Market", "Competition", "Team", "Business Model", "Traction"].forEach(
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

  const filledSections = new Set(responses.filter(r => r.answer?.trim()).map(r => QUESTION_LABELS[r.question_key]?.section)).size;
  const totalSections = 7;
  const isProfileEmpty = responses.length === 0 || !responses.some(r => r.answer?.trim());

  const handleWizardComplete = (newResponses: MemoResponse[]) => {
    setResponses(prev => {
      const updated = [...prev];
      newResponses.forEach(nr => {
        const idx = updated.findIndex(r => r.question_key === nr.question_key);
        if (idx >= 0) {
          updated[idx] = nr;
        } else {
          updated.push(nr);
        }
      });
      return updated;
    });
    toast({
      title: "Profile updated!",
      description: "Your answers have been saved.",
    });
  };

  const handleDeckImportComplete = async (data: any) => {
    if (!company) return;

    try {
      // Update company info if extracted
      if (data.companyInfo?.category) {
        await supabase
          .from("companies")
          .update({ category: data.companyInfo.category })
          .eq("id", company.id);
        setCompany({ ...company, category: data.companyInfo.category });
      }

      // Save extracted sections as memo responses
      const sectionKeyMappings: Record<string, string> = {
        problem_statement: "problem_description",
        solution_description: "solution_description",
        target_market: "market_size",
        business_model: "revenue_model",
        competitive_landscape: "competitors",
        team_background: "founder_background",
        traction_metrics: "current_traction",
        funding_ask: "key_milestones",
      };

      const newResponses: MemoResponse[] = [];
      
      for (const [extractedKey, section] of Object.entries(data.extractedSections)) {
        const typedSection = section as { content: string | null; confidence: number };
        if (typedSection.content && typedSection.confidence > 0.3) {
          const questionKey = sectionKeyMappings[extractedKey] || extractedKey;
          
          // Upsert the response
          const { error } = await supabase
            .from("memo_responses")
            .upsert({
              company_id: company.id,
              question_key: questionKey,
              answer: typedSection.content,
              source: "deck_import",
              confidence_score: typedSection.confidence
            }, {
              onConflict: "company_id,question_key"
            });

          if (!error) {
            newResponses.push({
              question_key: questionKey,
              answer: typedSection.content
            });
          }
        }
      }

      // Update local state
      setResponses(prev => {
        const updated = [...prev];
        newResponses.forEach(nr => {
          const idx = updated.findIndex(r => r.question_key === nr.question_key);
          if (idx >= 0) {
            updated[idx] = nr;
          } else {
            updated.push(nr);
          }
        });
        return updated;
      });

      toast({
        title: "Deck imported successfully!",
        description: `${newResponses.length} sections were pre-filled from your deck.`,
      });
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Quick Fill Wizard */}
      {company && (
        <QuickFillWizard
          open={wizardOpen}
          onOpenChange={setWizardOpen}
          companyId={company.id}
          companyName={company.name}
          companyDescription={company.description || ""}
          companyStage={company.stage}
          existingResponses={responses}
          onComplete={handleWizardComplete}
        />
      )}

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        {/* Hero Banner for Empty Profiles */}
        {isProfileEmpty && (
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-primary/20 rounded-xl p-8 text-center space-y-4">
            <div className="flex justify-center">
              <Rocket className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-serif font-bold">New here? Let's get you funded!</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Complete your profile in under 5 minutes with our guided wizard. 
              We'll help you craft the perfect pitch for each section.
            </p>
            <Button onClick={() => setWizardOpen(true)} size="lg" className="gap-2">
              <Zap className="w-5 h-5" />
              Quick Fill Your Profile
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/hub")}>
              ← Back to Hub
            </Button>
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-4xl font-serif font-bold">My Company Details</h1>
                <p className="text-sm text-muted-foreground">
                  {filledSections}/{totalSections} sections completed
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => setDeckWizardOpen(true)}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Import Deck
            </Button>
            <Button
              variant="outline"
              onClick={() => setWizardOpen(true)}
              className="gap-2"
            >
              <Zap className="w-4 h-4" />
              Quick Fill
            </Button>
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

        {/* Unit Economics Editor */}
        {company && (
          <UnitEconomicsEditor
            companyId={company.id}
            existingMetrics={responses.find(r => r.question_key === "unit_economics_json")?.answer}
            onSave={(metrics) => {
              setResponses(prev => {
                const updated = [...prev];
                const idx = updated.findIndex(r => r.question_key === "unit_economics");
                if (idx >= 0) {
                  updated[idx] = { question_key: "unit_economics", answer: metrics };
                } else {
                  updated.push({ question_key: "unit_economics", answer: metrics });
                }
                return updated;
              });
            }}
          />
        )}

        {/* Memo Sections */}
        {["Problem", "Solution", "Market", "Competition", "Team", "Business Model", "Traction"].map(
          (sectionName) => {
            // Get the primary question key for this section
            const primaryQuestionKey = Object.entries(QUESTION_LABELS).find(
              ([_, label]) => label.section === sectionName
            )?.[0] || "";

            const sectionResponses = responses.filter(
              (r) => QUESTION_LABELS[r.question_key]?.section === sectionName
            );

            // Get the first response which contains the section content
            const displayContent = sectionResponses[0]?.answer || "";
            const hasContent = sectionResponses.length > 0 && displayContent;

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
                          onClick={() => handleSaveSection(sectionName, primaryQuestionKey)}
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
                        {hasContent ? "Edit" : "Add Content"}
                      </Button>
                    )}
                  </div>
                </div>

                {editingSection === sectionName ? (
                  <Textarea
                    value={editedSectionContent}
                    onChange={(e) => setEditedSectionContent(e.target.value)}
                    className="min-h-[300px] text-base leading-relaxed"
                    placeholder={`Add ${sectionName.toLowerCase()} content here...`}
                    autoFocus
                  />
                ) : hasContent ? (
                  <div className="prose prose-slate max-w-none">
                    <p className="text-foreground text-base leading-relaxed whitespace-pre-wrap">
                      {displayContent}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <div className="text-center space-y-4">
                      <FileText className="w-12 h-12 mx-auto opacity-50" />
                      <p className="text-sm">No content yet for this section.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingSection(sectionName);
                          setEditedSectionContent("");
                        }}
                        className="gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Add Content
                      </Button>
                    </div>
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
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => setDeckWizardOpen(true)} className="gap-2">
                <Upload className="w-4 h-4" />
                Import from Deck
              </Button>
              <Button onClick={() => navigate("/portal")}>Start Questionnaire</Button>
            </div>
          </div>
        )}
      </div>

      {/* Deck Import Wizard */}
      {company && (
        <DeckImportWizard
          open={deckWizardOpen}
          onOpenChange={setDeckWizardOpen}
          companyId={company.id}
          companyName={company.name}
          companyDescription={company.description || ""}
          onImportComplete={handleDeckImportComplete}
        />
      )}
    </div>
  );
}
