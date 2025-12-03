import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CompanyBadge } from "@/components/CompanyBadge";
import { CompanyProfileCard } from "@/components/CompanyProfileCard";
import { MemoJourneyCard } from "@/components/MemoJourneyCard";
import { CompanySummaryCard } from "@/components/CompanySummaryCard";
import { ToolsRow } from "@/components/ToolsRow";
import { CollapsedLibrary } from "@/components/CollapsedLibrary";
import { DeckImportWizard, ExtractedData } from "@/components/DeckImportWizard";
import { LogOut, Sparkles, Edit, FileText, BookOpen, Calculator, Shield, ArrowRight, RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
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
  
  const [company, setCompany] = useState<Company | null>(null);
  const [memo, setMemo] = useState<Memo | null>(null);
  const [responses, setResponses] = useState<MemoResponse[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generatingTagline, setGeneratingTagline] = useState(false);
  const [tagline, setTagline] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [deckWizardOpen, setDeckWizardOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    loadData();
    
    // Safety timeout - if loading takes more than 15 seconds, stop loading state
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 15000);
    
    return () => clearTimeout(timeout);
  }, [navigate, adminView]);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session && !adminView) {
        navigate("/auth");
        return;
      }

      // Check if user is admin
      if (session?.user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();
        
        setIsAdmin(!!roleData);
      }

      // Load questions count
      const { data: questionsData, error: questionsError } = await supabase
        .from("questionnaire_questions")
        .select("id")
        .eq("is_active", true);

      if (questionsError) throw questionsError;
      setTotalQuestions(questionsData?.length || 0);

      // Load company
      let companyQuery = supabase
        .from("companies")
        .select("*");

      if (!adminView && session) {
        companyQuery = companyQuery.eq("founder_id", session.user.id);
      }

      const { data: companiesData, error: companyError } = await companyQuery
        .order("created_at", { ascending: false })
        .limit(1);

      if (companyError || !companiesData || companiesData.length === 0) {
        navigate("/intake");
        return;
      }

      const companyData = companiesData[0];


      setCompany(companyData);

      // Load memo responses
      const { data: responsesData } = await supabase
        .from("memo_responses")
        .select("question_key, answer")
        .eq("company_id", companyData.id);

      setResponses(responsesData || []);

      // Load memo
      const { data: memoData, error: memoError } = await supabase
        .from("memos")
        .select("*")
        .eq("company_id", companyData.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (memoError) {
        console.error("Error loading memo:", memoError);
        // Don't throw - just continue with null memo
      }

      setMemo(memoData);

      // Auto-generate profile if description exists but no responses
      if (companyData.description && (!responsesData || responsesData.length === 0)) {
        await autoGenerateProfile(companyData);
      }

      // Generate tagline if not exists
      if (!tagline && companyData.name) {
        generateTagline(companyData);
      }

    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
        } else {
          setCompany(prev => prev ? { ...prev, ...companyUpdates } : null);
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

        toast({
          title: "Deck imported successfully!",
          description: `Pre-filled ${highConfidenceResponses.length} questionnaire sections from your pitch deck.`,
        });
      } else {
        toast({
          title: "Import complete",
          description: "No high-confidence sections found to auto-fill. You can still review and add content manually.",
        });
      }

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
      
      // 7. Reset company fields
      await supabase
        .from('companies')
        .update({
          deck_url: null,
          deck_parsed_at: null,
          deck_confidence_scores: null,
          description: null,
          category: null,
          biggest_challenge: null,
          has_premium: false
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

  const completedQuestions = responses.filter(r => r.answer && r.answer.trim()).length;
  const memoGenerated = memo && memo.status === "generated";
  const hasPaid = company?.has_premium ?? false;

  // Get next section to complete
  const getNextSection = () => {
    const sectionProgress = [
      { name: "Problem Validation", keys: ["problem_validation"] },
      { name: "Target Customer", keys: ["target_customer"] },
      { name: "Market Size", keys: ["market_size"] },
      { name: "Solution", keys: ["solution_description"] },
      { name: "Competitive Advantage", keys: ["competitive_advantage"] },
      { name: "Traction", keys: ["current_traction"] },
      { name: "Revenue Model", keys: ["revenue_model"] },
      { name: "Founder Background", keys: ["founder_background"] }
    ];

    for (const section of sectionProgress) {
      const sectionComplete = section.keys.every(key =>
        responses.some(r => r.question_key === key && r.answer && r.answer.trim())
      );
      if (!sectionComplete) {
        return section.name;
      }
    }
    return "your profile";
  };

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
              Sample Memo
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

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Profile & Quick Actions */}
            <div className="space-y-6">
              <CompanyProfileCard
                name={company.name}
                stage={company.stage}
                sector={company.category || undefined}
                completedQuestions={completedQuestions}
                totalQuestions={totalQuestions}
              />
            </div>

            {/* Center Column: Main Card */}
            <div className="lg:col-span-2 space-y-8">
              {/* Show summary card if user has memo (premium), otherwise show journey card */}
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
                            navigate(`/memo?companyId=${company.id}`);
                          }}
                          className="gradient-primary shadow-glow"
                        >
                          View Memo
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <MemoJourneyCard
                  completedQuestions={completedQuestions}
                  totalQuestions={totalQuestions}
                  memoGenerated={!!memoGenerated}
                  hasPaid={hasPaid}
                  nextSection={getNextSection()}
                  companyId={company.id}
                  onImportDeck={() => setDeckWizardOpen(true)}
                />
              )}

              {/* Tools Section */}
              <ToolsRow />
            </div>
          </div>

          {/* Knowledge Library - Full Width */}
          <div className="mt-12">
            <CollapsedLibrary stage={company.stage} />
          </div>
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
