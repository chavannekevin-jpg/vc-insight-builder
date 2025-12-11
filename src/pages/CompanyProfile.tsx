import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Edit, Sparkles, Loader2, Check, X, Zap, Rocket, Upload, RefreshCw, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QuickFillWizard } from "@/components/QuickFillWizard";
import { DeckImportWizard } from "@/components/DeckImportWizard";
import { UnitEconomicsEditor } from "@/components/UnitEconomicsEditor";
import { DataSourceBadge } from "@/components/company/DataSourceBadge";
import { FinancialMetricsDashboard } from "@/components/company/FinancialMetricsDashboard";
import { CompletionProgress } from "@/components/company/CompletionProgress";

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
  answer: string | null;
  source?: string | null;
}

interface MemoSection {
  title: string;
  narrative?: {
    paragraphs?: Array<{ text: string }>;
    keyPoints?: string[];
  };
  overview?: string;
  tools?: {
    unitEconomics?: {
      aiGenerated?: {
        metrics?: {
          arr?: number;
          mrr?: number;
          ltv?: number;
          cac?: number;
          grossMargin?: number;
          churnRate?: number;
          paybackPeriod?: number;
        };
        pricing?: {
          model?: string;
          price?: number;
          interval?: string;
        };
      };
    };
  };
}

interface StructuredContent {
  sections?: MemoSection[];
}

const QUESTION_LABELS: Record<string, { section: string; title: string }> = {
  problem_core: { section: "Problem", title: "Core Problem" },
  solution_core: { section: "Solution", title: "Core Solution" },
  target_customer: { section: "Market", title: "Target Customer" },
  competitive_moat: { section: "Competition", title: "Competitive Edge" },
  team_story: { section: "Team", title: "Team Story" },
  business_model: { section: "Business Model", title: "Business Model" },
  unit_economics: { section: "Business Model", title: "Unit Economics" },
  traction_proof: { section: "Traction", title: "Traction Proof" },
  vision_ask: { section: "Vision", title: "Vision & Ask" },
};

const MEMO_SECTION_TO_QUESTION_KEY: Record<string, string> = {
  "Problem": "problem_core",
  "Solution": "solution_core",
  "Market": "target_customer",
  "Competition": "competitive_moat",
  "Team": "team_story",
  "Business Model": "business_model",
  "Traction": "traction_proof",
  "Vision": "vision_ask",
};

const extractMemoSectionContent = (section: MemoSection): string => {
  if (section.overview) return section.overview;
  if (section.narrative?.paragraphs) {
    return section.narrative.paragraphs.map(p => p.text).filter(Boolean).join("\n\n");
  }
  return "";
};

// Extract unit economics from Business Model section
const extractUnitEconomicsFromMemo = (sections: MemoSection[]): Record<string, any> | null => {
  const businessModelSection = sections.find(s => s.title === "Business Model");
  if (!businessModelSection?.tools?.unitEconomics?.aiGenerated) return null;
  
  const { metrics, pricing } = businessModelSection.tools.unitEconomics.aiGenerated;
  if (!metrics && !pricing) return null;
  
  return {
    ...metrics,
    pricingModel: pricing?.model,
    price: pricing?.price,
    pricingInterval: pricing?.interval
  };
};

export default function CompanyProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [company, setCompany] = useState<Company | null>(null);
  const [responses, setResponses] = useState<MemoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [enhancing, setEnhancing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [hasMemo, setHasMemo] = useState(false);
  const [memoStructuredContent, setMemoStructuredContent] = useState<StructuredContent | null>(null);
  const [editingCompanyName, setEditingCompanyName] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedCompanyName, setEditedCompanyName] = useState("");
  const [editedSectionContent, setEditedSectionContent] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [deckWizardOpen, setDeckWizardOpen] = useState(false);

  // Sync memo content to responses - with forceSync option
  const syncMemoToResponses = async (
    companyId: string, 
    structuredContent: StructuredContent, 
    currentResponses: MemoResponse[],
    forceSync: boolean = false
  ) => {
    if (!structuredContent?.sections) return currentResponses;
    
    setSyncing(true);
    const newResponses: MemoResponse[] = [];
    
    try {
      // Sync section content
      for (const section of structuredContent.sections) {
        const questionKey = MEMO_SECTION_TO_QUESTION_KEY[section.title];
        if (!questionKey) continue;
        
        const content = extractMemoSectionContent(section);
        if (!content) continue;
        
        // Skip if not forcing and user has content
        const existingResponse = currentResponses.find(r => r.question_key === questionKey);
        if (!forceSync && existingResponse?.answer?.trim()) continue;
        
        const { error } = await supabase
          .from("memo_responses")
          .upsert({
            company_id: companyId,
            question_key: questionKey,
            answer: content,
            source: "memo_sync"
          }, { onConflict: "company_id,question_key" });
        
        if (!error) {
          newResponses.push({ question_key: questionKey, answer: content, source: "memo_sync" });
        }
      }
      
      // Extract and save unit economics
      const unitEconomics = extractUnitEconomicsFromMemo(structuredContent.sections);
      if (unitEconomics) {
        const existingUE = currentResponses.find(r => r.question_key === "unit_economics_json");
        if (forceSync || !existingUE?.answer?.trim()) {
          const ueJson = JSON.stringify(unitEconomics);
          const { error } = await supabase
            .from("memo_responses")
            .upsert({
              company_id: companyId,
              question_key: "unit_economics_json",
              answer: ueJson,
              source: "memo_sync"
            }, { onConflict: "company_id,question_key" });
          
          if (!error) {
            newResponses.push({ question_key: "unit_economics_json", answer: ueJson, source: "memo_sync" });
          }
        }
      }
      
      if (newResponses.length > 0) {
        toast({
          title: forceSync ? "Synced from memo" : "Auto-synced from memo",
          description: `${newResponses.length} sections imported from your generated memo.`,
        });
      } else if (forceSync) {
        toast({
          title: "Already up to date",
          description: "All sections match your memo content.",
        });
      }
      
      // Merge with existing responses
      const merged = [...currentResponses];
      newResponses.forEach(nr => {
        const idx = merged.findIndex(r => r.question_key === nr.question_key);
        if (idx >= 0) {
          merged[idx] = nr;
        } else {
          merged.push(nr);
        }
      });
      
      return merged;
    } catch (error) {
      console.error("Memo sync error:", error);
      toast({
        title: "Sync failed",
        description: "Could not sync from memo. Please try again.",
        variant: "destructive"
      });
      return currentResponses;
    } finally {
      setSyncing(false);
    }
  };

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

      const { data: memoResponses } = await supabase
        .from("memo_responses")
        .select("question_key, answer, source")
        .eq("company_id", companies[0].id);

      let currentResponses: MemoResponse[] = (memoResponses || []) as MemoResponse[];
      
      const { data: memo } = await supabase
        .from("memos")
        .select("structured_content")
        .eq("company_id", companies[0].id)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (memo?.structured_content) {
        setHasMemo(true);
        const structuredContent = memo.structured_content as StructuredContent;
        setMemoStructuredContent(structuredContent);
        
        // Auto-sync empty sections from memo (forceSync = false)
        const hasEmptySections = ["problem_core", "solution_core", "target_customer", "competitive_moat", "team_story", "business_model", "traction_proof", "vision_ask"]
          .some(key => !currentResponses.find(r => r.question_key === key)?.answer?.trim());
        
        if (hasEmptySections) {
          currentResponses = await syncMemoToResponses(companies[0].id, structuredContent, currentResponses, false);
        }
      }
      
      setResponses(currentResponses);
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
      toast({ title: "Company name updated" });
    } catch (error: any) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    }
  };

  const handleSaveSection = async (sectionName: string, questionKey: string) => {
    if (!company || !editedSectionContent.trim()) return;

    try {
      const existingResponse = responses.find((r) => r.question_key === questionKey);

      if (existingResponse) {
        const { error } = await supabase
          .from("memo_responses")
          .update({ answer: editedSectionContent, source: "manual" })
          .eq("company_id", company.id)
          .eq("question_key", questionKey);

        if (error) throw error;
        setResponses(responses.map((r) =>
          r.question_key === questionKey ? { ...r, answer: editedSectionContent, source: "manual" } : r
        ));
      } else {
        const { error } = await supabase
          .from("memo_responses")
          .insert({
            company_id: company.id,
            question_key: questionKey,
            answer: editedSectionContent,
            source: "manual"
          });

        if (error) throw error;
        setResponses([...responses, { question_key: questionKey, answer: editedSectionContent, source: "manual" }]);
      }

      setEditingSection(null);
      toast({ title: "Section updated" });
    } catch (error: any) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    }
  };

  const handleEnhanceContent = async () => {
    if (!company) return;
    
    setEnhancing(true);
    try {
      const sectionData: Record<string, Record<string, string>> = {};
      
      ["Problem", "Solution", "Market", "Competition", "Team", "Business Model", "Traction"].forEach((sectionName) => {
        const sectionResponses = responses.filter((r) => QUESTION_LABELS[r.question_key]?.section === sectionName);
        if (sectionResponses.length > 0) {
          sectionData[sectionName] = {};
          sectionResponses.forEach((response) => {
            if (response.answer) sectionData[sectionName][response.question_key] = response.answer;
          });
        }
      });

      const { data, error } = await supabase.functions.invoke("enhance-memo", {
        body: { company, sections: sectionData },
      });

      if (error) throw error;

      const enhancedData = data as { enhanced: Record<string, string> };
      const updatedResponses = [...responses];
      
      for (const [sectionName, enhancedText] of Object.entries(enhancedData.enhanced)) {
        const sectionResponses = responses.filter((r) => QUESTION_LABELS[r.question_key]?.section === sectionName);
        if (sectionResponses.length > 0) {
          const firstResponse = sectionResponses[0];
          
          await supabase
            .from("memo_responses")
            .update({ answer: enhancedText, source: "enhanced" })
            .eq("company_id", company.id)
            .eq("question_key", firstResponse.question_key);

          const index = updatedResponses.findIndex((r) => r.question_key === firstResponse.question_key);
          if (index !== -1) {
            updatedResponses[index] = { ...updatedResponses[index], answer: enhancedText, source: "enhanced" };
          }
        }
      }
      
      setResponses(updatedResponses);
      toast({ title: "Content Enhanced! ✨" });
    } catch (error: any) {
      toast({ title: "Enhancement Failed", description: error.message, variant: "destructive" });
    } finally {
      setEnhancing(false);
    }
  };

  const handleWizardComplete = (newResponses: MemoResponse[]) => {
    setResponses(prev => {
      const updated = [...prev];
      newResponses.forEach(nr => {
        const idx = updated.findIndex(r => r.question_key === nr.question_key);
        if (idx >= 0) updated[idx] = nr;
        else updated.push(nr);
      });
      return updated;
    });
    toast({ title: "Profile updated!" });
  };

  const handleDeckImportComplete = async (data: any) => {
    if (!company) return;

    try {
      if (data.companyInfo?.category) {
        await supabase.from("companies").update({ category: data.companyInfo.category }).eq("id", company.id);
        setCompany({ ...company, category: data.companyInfo.category });
      }

      const sectionKeyMappings: Record<string, string> = {
        problem_statement: "problem_core",
        solution_description: "solution_core",
        target_market: "target_customer",
        business_model: "business_model",
        competitive_landscape: "competitive_moat",
        team_background: "team_story",
        traction_metrics: "traction_proof",
        funding_ask: "vision_ask",
      };

      const newResponses: MemoResponse[] = [];
      
      for (const [extractedKey, section] of Object.entries(data.extractedSections)) {
        const typedSection = section as { content: string | null; confidence: number };
        if (typedSection.content && typedSection.confidence > 0.3) {
          const questionKey = sectionKeyMappings[extractedKey] || extractedKey;
          
          const { error } = await supabase
            .from("memo_responses")
            .upsert({
              company_id: company.id,
              question_key: questionKey,
              answer: typedSection.content,
              source: "deck_import",
              confidence_score: typedSection.confidence
            }, { onConflict: "company_id,question_key" });

          if (!error) {
            newResponses.push({ question_key: questionKey, answer: typedSection.content, source: "deck_import" });
          }
        }
      }

      setResponses(prev => {
        const updated = [...prev];
        newResponses.forEach(nr => {
          const idx = updated.findIndex(r => r.question_key === nr.question_key);
          if (idx >= 0) updated[idx] = nr;
          else updated.push(nr);
        });
        return updated;
      });

      toast({ title: "Deck imported!", description: `${newResponses.length} sections pre-filled.` });
    } catch (error: any) {
      toast({ title: "Import failed", description: error.message, variant: "destructive" });
    }
  };

  // Force sync handler for button click
  const handleForceSyncFromMemo = async () => {
    if (!company || !memoStructuredContent) return;
    const updated = await syncMemoToResponses(company.id, memoStructuredContent, responses, true);
    setResponses(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const isProfileEmpty = responses.length === 0 || !responses.some(r => r.answer?.trim());

  return (
    <div className="min-h-screen bg-background">
      <Header />

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
            <Rocket className="w-12 h-12 text-primary mx-auto" />
            <h2 className="text-2xl font-serif font-bold">New here? Let's get you funded!</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Complete your profile in under 5 minutes with our guided wizard.
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
            <Button variant="outline" onClick={() => navigate("/hub")}>← Back to Hub</Button>
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-serif font-bold">My Company Details</h1>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button variant="outline" onClick={() => setDeckWizardOpen(true)} className="gap-2">
              <Upload className="w-4 h-4" /> Import Deck
            </Button>
            <Button variant="outline" onClick={() => setWizardOpen(true)} className="gap-2">
              <Zap className="w-4 h-4" /> Quick Fill
            </Button>
            {hasMemo && memoStructuredContent && (
              <Button variant="outline" onClick={handleForceSyncFromMemo} disabled={syncing} className="gap-2">
                {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {syncing ? "Syncing..." : "Sync from Memo"}
              </Button>
            )}
            <Button onClick={handleEnhanceContent} disabled={enhancing || responses.length === 0} className="gap-2">
              {enhancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {enhancing ? "Enhancing..." : "AI Enhance All"}
            </Button>
            <Button variant="outline" onClick={() => navigate("/portal")} className="gap-2">
              <Edit className="w-4 h-4" /> Edit Questionnaire
            </Button>
          </div>
        </div>

        {/* Data Flow Notice */}
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-700 dark:text-blue-300">This is your central data hub</p>
                <p className="text-muted-foreground">
                  Changes you make here will be used when regenerating your memo. Data flows from your deck imports, calculators, and AI enhancements all feed into this profile.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Progress */}
        <Card>
          <CardContent className="py-6">
            <CompletionProgress responses={responses} questionLabels={QUESTION_LABELS} />
          </CardContent>
        </Card>

        {/* Financial Metrics Dashboard */}
        <FinancialMetricsDashboard responses={responses} />

        {/* Company Overview */}
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
                  <Check className="w-4 h-4" /> Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setEditedCompanyName(company?.name || ""); setEditingCompanyName(false); }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-serif font-bold">{company?.name}</h2>
                <Button size="sm" variant="ghost" onClick={() => setEditingCompanyName(true)} className="gap-2">
                  <Edit className="w-4 h-4" /> Edit
                </Button>
              </div>
            )}
            <div className="flex gap-3 mt-4">
              {company?.category && <Badge variant="secondary" className="text-sm px-3 py-1">{company.category}</Badge>}
              <Badge variant="secondary" className="text-sm px-3 py-1">{company?.stage}</Badge>
            </div>
          </div>

          {company?.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Overview</h3>
              <p className="text-lg leading-relaxed">{company.description}</p>
            </div>
          )}

          {company?.biggest_challenge && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Key Challenge</h3>
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
                if (idx >= 0) updated[idx] = { question_key: "unit_economics", answer: metrics };
                else updated.push({ question_key: "unit_economics", answer: metrics });
                return updated;
              });
            }}
          />
        )}

        {/* Memo Sections */}
        {["Problem", "Solution", "Market", "Competition", "Team", "Business Model", "Traction", "Vision"].map((sectionName) => {
          const primaryQuestionKey = Object.entries(QUESTION_LABELS).find(([_, label]) => label.section === sectionName)?.[0] || "";
          const sectionResponses = responses.filter((r) => QUESTION_LABELS[r.question_key]?.section === sectionName);
          const displayContent = sectionResponses[0]?.answer || "";
          const displaySource = sectionResponses[0]?.source;
          const hasContent = sectionResponses.length > 0 && displayContent;
          const charCount = displayContent.length;

          return (
            <div key={sectionName} className="bg-card border border-border rounded-lg p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-serif font-bold">{sectionName}</h2>
                  <DataSourceBadge source={displaySource} />
                </div>
                <div className="flex items-center gap-2">
                  {hasContent && (
                    <span className="text-xs text-muted-foreground">{charCount} chars</span>
                  )}
                  {editingSection === sectionName ? (
                    <>
                      <Button size="sm" onClick={() => handleSaveSection(sectionName, primaryQuestionKey)} className="gap-2">
                        <Check className="w-4 h-4" /> Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingSection(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => { setEditingSection(sectionName); setEditedSectionContent(displayContent); }} className="gap-2">
                      <Edit className="w-4 h-4" /> {hasContent ? "Edit" : "Add Content"}
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
                  <p className="text-foreground text-base leading-relaxed whitespace-pre-wrap">{displayContent}</p>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <div className="text-center space-y-4">
                    <FileText className="w-12 h-12 mx-auto opacity-50" />
                    <p className="text-sm">No content yet for this section.</p>
                    <Button variant="outline" size="sm" onClick={() => { setEditingSection(sectionName); setEditedSectionContent(""); }} className="gap-2">
                      <Edit className="w-4 h-4" /> Add Content
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {responses.length === 0 && (
          <div className="bg-card border border-border rounded-lg p-12 text-center space-y-4">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground" />
            <h3 className="text-2xl font-bold">No Content Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">Complete the questionnaire to generate your investment memo.</p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => setDeckWizardOpen(true)} className="gap-2">
                <Upload className="w-4 h-4" /> Import from Deck
              </Button>
              <Button onClick={() => navigate("/portal")}>Start Questionnaire</Button>
            </div>
          </div>
        )}
      </div>

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
