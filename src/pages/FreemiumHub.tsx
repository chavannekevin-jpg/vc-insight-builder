import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CompanyBadge } from "@/components/CompanyBadge";
import { CompanyProfileCard } from "@/components/CompanyProfileCard";
import { VCVerdictCard } from "@/components/VCVerdictCard";
import { StakesReminderBanner } from "@/components/StakesReminderBanner";
import { CompanySummaryCard } from "@/components/CompanySummaryCard";
import { ToolsRow } from "@/components/ToolsRow";
import { CollapsedLibrary } from "@/components/CollapsedLibrary";
import { DeckImportWizard, ExtractedData } from "@/components/DeckImportWizard";
import { LogOut, Sparkles, Edit, FileText, BookOpen, Calculator, Shield, ArrowRight, RotateCcw, Flame, LayoutGrid, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/hooks/useCompany";

// Insider articles for daily rotation
const insiderArticles = [
  { label: "VCs Pick Power Laws", path: "/vcbrain/insider/power-laws", teaser: "Why portfolio math matters more than your startup story." },
  { label: "Pitching a Return Profile", path: "/vcbrain/insider/return-profile", teaser: "You're not pitching a company. The difference changes everything." },
  { label: "Good Business ≠ Good VC Bet", path: "/vcbrain/insider/good-business-bad-vc", teaser: "Great company doesn't always mean great VC outcome." },
  { label: "VCs Are Managed Pessimists", path: "/vcbrain/insider/managed-pessimists", teaser: "What diligence actually feels like inside the fund." },
  { label: "VCs Bet on Asymmetry", path: "/vcbrain/insider/asymmetry", teaser: "How outsized outcomes justify irrational-seeming decisions." },
  { label: "Liquidity Is Your Customer", path: "/vcbrain/insider/liquidity-not-customer", teaser: "Why exits, not revenue, drive VC decision-making." },
  { label: "After the Pitch Room", path: "/vcbrain/insider/after-pitch-room", teaser: "Internal partner meetings, deal debates, and silent vetoes." },
  { label: "Scored When You're Not There", path: "/vcbrain/insider/scored-not-in-room", teaser: "IC dynamics and partner psychology revealed." },
  { label: "One Partner Can Kill You", path: "/vcbrain/insider/one-partner-kill", teaser: "Politics inside funds that founders never see." },
  { label: "Why VCs Ghost Founders", path: "/vcbrain/insider/why-vcs-ghost", teaser: "It's not personal. It's structural." },
  { label: "Follow-On Capital Decisions", path: "/vcbrain/insider/follow-on-capital", teaser: "Why today's 'yes' doesn't guarantee tomorrow's check." },
  { label: "Ownership vs. Valuation", path: "/vcbrain/insider/ownership-vs-valuation", teaser: "Math beats ego. Always." },
];

// Get daily article based on date
const getDailyArticle = () => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return insiderArticles[dayOfYear % insiderArticles.length];
};
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Company {
  id: string;
  name: string;
  stage: string;
  category: string | null;
  description: string | null;
  has_premium: boolean | null;
  deck_parsed_at?: string | null;
  vc_verdict_json?: any;
}

interface Memo {
  id: string;
  status: string;
  structured_content: any;
}

interface MemoResponse {
  question_key: string;
  answer: string | null;
}

// Confidence threshold for auto-filling
const CONFIDENCE_THRESHOLD = 0.6;

export default function FreemiumHub() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const adminView = searchParams.get("admin") === "true";
  
  // Use cached hooks instead of manual data loading
  const { user, isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const { 
    company: companyData, 
    hasMemo: hasMemoData,
    memoHasContent,
    hasPaid: hasPaidData,
    completedQuestions: cachedCompletedQuestions,
    totalQuestions: cachedTotalQuestions,
    isLoading: companyLoading 
  } = useCompany(user?.id);

  const [memo, setMemo] = useState<Memo | null>(null);
  const [responses, setResponses] = useState<MemoResponse[]>([]);
  const [generatingTagline, setGeneratingTagline] = useState(false);
  const [tagline, setTagline] = useState<string>("");
  const [taglineAttempted, setTaglineAttempted] = useState(false);
  const [deckWizardOpen, setDeckWizardOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [responsesLoaded, setResponsesLoaded] = useState(false);
  const [cachedVerdict, setCachedVerdict] = useState<any>(null);

  // Map companyData to Company type for compatibility
  const company: Company | null = companyData ? {
    id: companyData.id,
    name: companyData.name,
    stage: companyData.stage,
    category: companyData.category || null,
    description: companyData.description || null,
    has_premium: companyData.has_premium || null,
    deck_parsed_at: (companyData as any).deck_parsed_at || null,
    vc_verdict_json: (companyData as any).vc_verdict_json || null,
  } : null;

  // Load cached verdict from company data
  useEffect(() => {
    if (company?.vc_verdict_json) {
      setCachedVerdict(company.vc_verdict_json);
    }
  }, [company?.vc_verdict_json]);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated && !adminView) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, adminView, navigate]);

  // Redirect to intake if no company
  useEffect(() => {
    if (!authLoading && !companyLoading && isAuthenticated && !companyData) {
      navigate("/intake");
    }
  }, [authLoading, companyLoading, isAuthenticated, companyData, navigate]);

  // Loading timeout recovery - redirect to auth if stuck loading
  useEffect(() => {
    if (!authLoading && !companyLoading) return;
    
    const timeout = setTimeout(() => {
      if (authLoading || companyLoading) {
        console.warn("Dashboard loading timeout - forcing refresh");
        window.location.reload();
      }
    }, 8000); // 8 second timeout
    
    return () => clearTimeout(timeout);
  }, [authLoading, companyLoading]);

  // Load memo details and responses when company is available
  useEffect(() => {
    if (companyData?.id && !responsesLoaded) {
      loadMemoAndResponses(companyData.id);
    }
  }, [companyData?.id, responsesLoaded]);

  // Generate tagline when company loads - only attempt once
  useEffect(() => {
    if (company?.name && !tagline && !generatingTagline && !taglineAttempted) {
      generateTagline(company);
    }
  }, [company?.name, tagline, generatingTagline, taglineAttempted]);

  const loadMemoAndResponses = useCallback(async (companyId: string) => {
    try {
      // Load in parallel for speed
      const [responsesResult, memoResult] = await Promise.all([
        supabase
          .from("memo_responses")
          .select("question_key, answer")
          .eq("company_id", companyId),
        supabase
          .from("memos")
          .select("*")
          .eq("company_id", companyId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      ]);

      setResponses(responsesResult.data || []);
      setMemo(memoResult.data);
      setResponsesLoaded(true);

      // Auto-generate profile if description exists but no responses
      if (companyData?.description && (!responsesResult.data || responsesResult.data.length === 0) && company) {
        await autoGenerateProfile(company);
      }
    } catch (error) {
      console.error("Error loading memo and responses:", error);
      setResponsesLoaded(true);
    }
  }, [companyData]);

  const autoGenerateProfile = async (companyData: Company) => {
    try {
      console.log("Auto-generating profile from description...");
      
      const { data, error } = await supabase.functions.invoke("auto-generate-profile", {
        body: {
          companyName: companyData.name,
          description: companyData.description,
          stage: companyData.stage
        }
      });

      if (error) {
        console.error("Error generating profile:", error);
        return;
      }

      if (data?.prefilled && Object.keys(data.prefilled).length > 0) {
        // Save pre-filled responses
        const responsesToInsert = Object.entries(data.prefilled).map(([key, value]) => ({
          company_id: companyData.id,
          question_key: key,
          answer: value as string
        }));

        const { error: insertError } = await supabase
          .from("memo_responses")
          .insert(responsesToInsert);

        if (insertError) {
          console.error("Error saving pre-filled responses:", insertError);
        } else {
          console.log("Successfully pre-filled questionnaire");
          setResponses(responsesToInsert);
          toast({
            title: "Profile pre-filled!",
            description: "We've used your description to start your questionnaire. Review and refine the answers.",
          });
        }
      }
    } catch (error) {
      console.error("Error in auto-generate:", error);
    }
  };

  const generateTagline = async (companyData: Company) => {
    setGeneratingTagline(true);
    setTaglineAttempted(true); // Mark as attempted to prevent infinite loop
    
    // Add timeout safety
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Tagline generation timeout')), 10000)
    );
    
    try {
      const invokePromise = supabase.functions.invoke("generate-company-tagline", {
        body: {
          companyName: companyData.name,
          description: companyData.description,
          stage: companyData.stage
        }
      });

      const { data, error } = await Promise.race([invokePromise, timeoutPromise]) as any;

      if (error) throw error;
      if (data?.tagline) {
        setTagline(data.tagline);
      }
    } catch (error) {
      console.error("Error generating tagline:", error);
      // Don't show error toast - silently fail for tagline generation
    } finally {
      setGeneratingTagline(false);
    }
  };

  const handleDeckImportComplete = async (data: ExtractedData) => {
    if (!company) return;

    try {
      // 1. Update company profile if we have high-confidence company info
      const companyUpdates: Record<string, any> = {};
      
      if (data.companyInfo.category) {
        companyUpdates.category = data.companyInfo.category;
      }
      if (data.companyInfo.description && !company.description) {
        companyUpdates.description = data.companyInfo.description;
      }

      if (Object.keys(companyUpdates).length > 0) {
        const { error: updateError } = await supabase
          .from("companies")
          .update(companyUpdates)
          .eq("id", company.id);

        if (updateError) {
          console.error("Error updating company:", updateError);
        }
      }

      // 2. Upsert memo responses for high-confidence extractions
      const highConfidenceResponses = Object.entries(data.extractedSections)
        .filter(([_, section]) => section.confidence >= CONFIDENCE_THRESHOLD && section.content)
        .map(([key, section]) => ({
          company_id: company.id,
          question_key: key,
          answer: section.content,
          source: 'deck_import',
          confidence_score: section.confidence
        }));

      if (highConfidenceResponses.length > 0) {
        // Use upsert to update existing or insert new
        for (const response of highConfidenceResponses) {
          const { error: upsertError } = await supabase
            .from("memo_responses")
            .upsert(response, {
              onConflict: 'company_id,question_key'
            });

          if (upsertError) {
            console.error(`Error upserting response for ${response.question_key}:`, upsertError);
          }
        }

        // Reload responses to update UI
        const { data: updatedResponses } = await supabase
          .from("memo_responses")
          .select("question_key, answer")
          .eq("company_id", company.id);

        if (updatedResponses) {
          setResponses(updatedResponses);
        }
      }

      // Clear cached verdict to trigger regeneration with new data
      setCachedVerdict(null);
      
      toast({
        title: "Deck imported successfully!",
        description: "Your VC verdict is being generated with the new data.",
      });
      
      // Stay on hub - don't navigate away
      // The VCVerdictCard will regenerate with the new data

    } catch (error: any) {
      console.error("Error completing deck import:", error);
      toast({
        title: "Import error",
        description: error.message || "Failed to save imported data",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleSoftReset = async () => {
    if (!company?.id) {
      toast({
        title: "Error",
        description: "No company found to reset",
        variant: "destructive",
      });
      return;
    }

    setIsResetting(true);
    try {
      // 1. Get all memo IDs for this company
      const { data: memos } = await supabase
        .from('memos')
        .select('id')
        .eq('company_id', company.id);
      
      // 2. Delete memo_analyses for those memos
      if (memos && memos.length > 0) {
        const memoIds = memos.map(m => m.id);
        await supabase
          .from('memo_analyses')
          .delete()
          .in('memo_id', memoIds);
      }
      
      // 3. Delete memos
      await supabase.from('memos').delete().eq('company_id', company.id);
      
      // 4. Delete memo_responses
      await supabase.from('memo_responses').delete().eq('company_id', company.id);
      
      // 5. Delete waitlist_signups
      await supabase.from('waitlist_signups').delete().eq('company_id', company.id);
      
      // 6. Delete memo_purchases
      await supabase.from('memo_purchases').delete().eq('company_id', company.id);
      
      // 7. Reset company fields including verdict
      await supabase
        .from('companies')
        .update({
          deck_url: null,
          deck_parsed_at: null,
          deck_confidence_scores: null,
          description: null,
          category: null,
          biggest_challenge: null,
          has_premium: false,
          vc_verdict_json: null,
          verdict_generated_at: null
        })
        .eq('id', company.id);

      toast({
        title: "Profile reset successfully!",
        description: "Refreshing page...",
      });
      
      // Refresh the page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Reset error:", error);
      toast({
        title: "Reset failed",
        description: "Failed to reset profile",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
      setResetDialogOpen(false);
    }
  };

  const handleVerdictGenerated = useCallback((verdict: any) => {
    setCachedVerdict(verdict);
  }, []);

  const completedQuestions = responses.filter(r => r.answer && r.answer.trim()).length;
  const totalQuestions = cachedTotalQuestions;
  const memoGenerated = memo && memo.status === "completed";
  const hasPaid = company?.has_premium ?? hasPaidData;
  const deckParsed = !!company?.deck_parsed_at;

  const loading = authLoading || companyLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Sparkles className="w-12 h-12 text-primary animate-pulse mx-auto" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Stakes Reminder Banner - Only show if no memo and not paid */}
      {!memoGenerated && !hasPaid && (
        <StakesReminderBanner 
          onAction={() => navigate("/portal")} 
          hasMemo={!!memoGenerated}
        />
      )}
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6">
          {/* Top Bar */}
          <div className="h-16 flex items-center justify-between border-b border-border/20">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate("/")}
                className="text-2xl font-display font-black tracking-tight neon-pink hover:scale-105 transition-transform"
              >
                UglyBaby
              </button>
              <CompanyBadge
                name={company.name}
                sector={company.category || undefined}
                tagline={generatingTagline ? "Generating tagline..." : tagline}
                isLoading={generatingTagline}
              />
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Navigation Menu */}
          <div className="h-12 flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/hub")}
              className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/portal")}
              className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Edit className="w-4 h-4" />
              My Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/sample-memo")}
              className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <FileText className="w-4 h-4" />
              Sample Analysis
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/vcbrain")}
              className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Knowledge Library
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/tools")}
              className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Calculator className="w-4 h-4" />
              Tools
            </Button>
            {isAdmin && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/admin")}
                  className="gap-2 hover:text-primary transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setResetDialogOpen(true)}
                  className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Single Column Layout */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* VC Verdict Card - Full Width, Top Priority */}
          {memoGenerated ? (
            <div className="space-y-6">
              <CompanySummaryCard
                companyId={company.id}
                companyName={company.name}
                companyDescription={company.description || ""}
                companyStage={company.stage}
              />
              
              {/* Direct link to memo */}
              <Card className="border-2 border-primary/30 shadow-glow hover:shadow-glow-strong transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-serif">Your Investment Memorandum</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Access your latest generated memo and supporting materials
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {hasPaid && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => {
                              if (!company?.id) {
                                toast({
                                  title: "Error",
                                  description: "Company ID not found. Please refresh the page.",
                                  variant: "destructive"
                                });
                                return;
                              }
                              navigate(`/analysis/overview?companyId=${company.id}`);
                            }}
                            className="border-primary/50 hover:bg-primary/10"
                          >
                            <LayoutGrid className="w-4 h-4 mr-2" />
                            Overview
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              if (!company?.id) {
                                toast({
                                  title: "Error",
                                  description: "Company ID not found. Please refresh the page.",
                                  variant: "destructive"
                                });
                                return;
                              }
                              navigate(`/analysis/regenerate?companyId=${company.id}`);
                            }}
                            className="border-primary/50 hover:bg-primary/10"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Regenerate
                          </Button>
                        </>
                      )}
                      <Button
                        onClick={() => {
                          if (!company?.id) {
                            toast({
                              title: "Error",
                              description: "Company ID not found. Please refresh the page.",
                              variant: "destructive"
                            });
                            return;
                          }
                          navigate(`/analysis?companyId=${company.id}`);
                        }}
                        className="gradient-primary shadow-glow"
                      >
                        View Analysis
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Insider Take of the Day */}
              <Card className="border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-transparent overflow-hidden relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Insider Take of the Day</span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground">{getDailyArticle().label}</h3>
                      <p className="text-sm text-muted-foreground">{getDailyArticle().teaser}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="shrink-0 border-amber-500/50 hover:bg-amber-500/10 hover:border-amber-500"
                      onClick={() => navigate(getDailyArticle().path)}
                    >
                      Read <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {/* AI-Powered VC Verdict - Full Width */}
              <VCVerdictCard
                companyId={company.id}
                companyName={company.name}
                companyDescription={company.description}
                companyStage={company.stage}
                companyCategory={company.category}
                responses={responses}
                memoGenerated={!!memoGenerated}
                hasPaid={hasPaid}
                deckParsed={deckParsed}
                cachedVerdict={cachedVerdict}
                onVerdictGenerated={handleVerdictGenerated}
              />
            </>
          )}

          {/* Company Profile Card - Full Width, Below Verdict */}
          <CompanyProfileCard
            name={company.name}
            stage={company.stage}
            sector={company.category || undefined}
            completedQuestions={completedQuestions}
            totalQuestions={totalQuestions}
          />
          
          {/* Fast Track Deck Upload */}
          {!memoGenerated && (
            <Card 
              className="relative overflow-hidden border-2 border-primary/40 hover:border-primary/70 bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group"
              onClick={() => setDeckWizardOpen(true)}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <CardContent className="p-6 relative">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 text-xs font-bold bg-primary text-primary-foreground rounded-full">
                    FAST TRACK
                  </span>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">Upload Your Deck</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      AI extracts your info and pre-fills the questionnaire. Your verdict will update with the new data.
                    </p>
                    <div className="flex items-center gap-2 text-primary text-sm font-medium">
                      <Sparkles className="w-4 h-4" />
                      Save 15+ minutes
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tools Section */}
          <ToolsRow memoGenerated={!!memoGenerated} />

          {/* Knowledge Library */}
          <CollapsedLibrary stage={company.stage} />
        </div>
      </main>

      {/* Deck Import Wizard */}
      <DeckImportWizard
        open={deckWizardOpen}
        onOpenChange={setDeckWizardOpen}
        companyId={company.id}
        companyName={company.name}
        companyDescription={company.description || undefined}
        onImportComplete={handleDeckImportComplete}
      />

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Profile: {company.name}</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all questionnaire responses, memos, deck data, and reset the company profile. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSoftReset}
              disabled={isResetting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isResetting ? "Resetting..." : "Reset Profile"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
