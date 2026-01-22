import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { CompanyBadge } from "@/components/CompanyBadge";
import { CompanyProfileCard } from "@/components/CompanyProfileCard";
import { VCVerdictCard } from "@/components/VCVerdictCard";
import { StakesReminderBanner } from "@/components/StakesReminderBanner";
import { CompanySummaryCard } from "@/components/CompanySummaryCard";
import { ToolsRow } from "@/components/ToolsRow";
import { CollapsedLibrary } from "@/components/CollapsedLibrary";
import { DeckImportWizard, ExtractedData } from "@/components/DeckImportWizard";
import { MemoVCQuickTake } from "@/components/memo/MemoVCQuickTake";
import { DashboardScorecard } from "@/components/memo/DashboardScorecard";
import { FounderSidebar } from "@/components/founder/FounderSidebar";
import { StrategicToolsSpotlight } from "@/components/founder/StrategicToolsSpotlight";
import { InviteFounderModal } from "@/components/founder/InviteFounderModal";
import ScoreboardModal from "@/components/founder/ScoreboardModal";
import { LogOut, Sparkles, Edit, FileText, BookOpen, Calculator, Shield, ArrowRight, RotateCcw, Flame, LayoutGrid, Upload, Wrench, Trash2, Settings, Building2, Menu } from "lucide-react";
import { FundDiscoveryPremiumModal } from "@/components/FundDiscoveryPremiumModal";
import { useMatchingFundsCount } from "@/hooks/useMatchingFundsCount";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/hooks/useCompany";
import { usePrefetchMemoContent, useMemoContent } from "@/hooks/useMemoContent";
import { useVcQuickTake, useSectionTools, useDashboardResponses } from "@/hooks/useDashboardData";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const location = useLocation();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const adminView = searchParams.get("admin") === "true";
  const freshCompany = (location.state as any)?.freshCompany === true;
  
  // Use cached hooks instead of manual data loading
  const { user, isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const { 
    company: companyData, 
    hasMemo: hasMemoData,
    memoHasContent,
    hasPaid: hasPaidData,
    completedQuestions: cachedCompletedQuestions,
    totalQuestions: cachedTotalQuestions,
    generationsAvailable,
    isLoading: companyLoading 
  } = useCompany(user?.id);

  const [memo, setMemo] = useState<Memo | null>(null);
  const [generatingTagline, setGeneratingTagline] = useState(false);
  const [tagline, setTagline] = useState<string>("");
  const [taglineAttempted, setTaglineAttempted] = useState(false);
  const [deckWizardOpen, setDeckWizardOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [fundDiscoveryModalOpen, setFundDiscoveryModalOpen] = useState(false);
  const [inviteFounderOpen, setInviteFounderOpen] = useState(false);
  const [scoreboardOpen, setScoreboardOpen] = useState(false);

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

  // Get matching funds count for preview
  const { matchingFunds, strongMatches, isLoading: matchingLoading } = useMatchingFundsCount(
    company?.id || null,
    company ? { stage: company.stage, category: company.category || undefined } : null
  );

  // Use React Query cached hooks for dashboard data (prevents reload on navigation)
  const { data: vcQuickTake } = useVcQuickTake(company?.id || null, hasPaidData);
  const { data: sectionTools } = useSectionTools(company?.id || null, hasPaidData, memoHasContent);
  const { data: responses = [] } = useDashboardResponses(company?.id || null);
  
  // Fetch full memo content for section narratives
  const { data: memoContentData } = useMemoContent(hasPaidData && memoHasContent ? company?.id : null);

  // Cached verdict from company data (already cached by useCompany)
  const cachedVerdict = company?.vc_verdict_json || null;

  // Prefetch memo content for instant navigation (paid users with generated memo)
  const prefetchMemo = usePrefetchMemoContent();
  useEffect(() => {
    if (hasPaidData && company?.id && memoHasContent) {
      console.log('[FreemiumHub] Prefetching memo content for instant loading...');
      prefetchMemo(company.id);
    }
  }, [hasPaidData, company?.id, memoHasContent, prefetchMemo]);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated && !adminView) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, adminView, navigate]);

  // Force refetch company data on mount if coming from intake with fresh company
  useEffect(() => {
    if (freshCompany && user?.id) {
      queryClient.invalidateQueries({ queryKey: ["company", user.id] });
    }
  }, [freshCompany, user?.id, queryClient]);

  // Redirect to intake if no company - with delay to prevent race conditions
  useEffect(() => {
    // Skip redirect if we just came from intake with a fresh company
    if (freshCompany) return;
    
    if (!authLoading && !companyLoading && isAuthenticated && !companyData) {
      // Add delay to allow cache to populate after navigation
      const timer = setTimeout(() => {
        // Double-check we still don't have company data
        if (!companyData) {
          navigate("/intake");
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [authLoading, companyLoading, isAuthenticated, companyData, navigate, freshCompany]);

  // Loading timeout recovery - only warn, don't reload aggressively
  useEffect(() => {
    if (!authLoading && !companyLoading) return;
    
    const timeout = setTimeout(() => {
      if (authLoading || companyLoading) {
        console.warn("Dashboard loading taking longer than expected");
        // Don't force reload - this causes blinking issues
        // Just let react-query continue its work
      }
    }, 15000); // 15 second warning only
    
    return () => clearTimeout(timeout);
  }, [authLoading, companyLoading]);

  // Load memo details when company is available (responses now handled by useDashboardResponses hook)
  useEffect(() => {
    const loadMemo = async () => {
      if (!companyData?.id) return;
      
      const { data: memoResult } = await supabase
        .from("memos")
        .select("*")
        .eq("company_id", companyData.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      setMemo(memoResult);
      
      // Auto-generate profile if description exists but no responses
      if (companyData?.description && (!responses || responses.length === 0) && company) {
        await autoGenerateProfile(company);
      }
    };
    loadMemo();
  }, [companyData?.id, responses?.length]);

  // Generate tagline when company loads - only attempt once
  useEffect(() => {
    if (company?.name && !tagline && !generatingTagline && !taglineAttempted) {
      generateTagline(company);
    }
  }, [company?.name, tagline, generatingTagline, taglineAttempted]);
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
          // Invalidate responses cache to trigger refetch
          queryClient.invalidateQueries({ queryKey: ["dashboard-responses", company?.id] });
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

        // Invalidate responses cache to trigger refetch with new data
        queryClient.invalidateQueries({ queryKey: ["dashboard-responses", company.id] });
      }

      // Invalidate company cache to clear cached verdict and trigger regeneration
      queryClient.invalidateQueries({ queryKey: ["company", user?.id] });
      
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
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be signed in to reset",
        variant: "destructive",
      });
      return;
    }

    setIsResetting(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-reset-flow", {
        body: {},
      });

      if (error) throw error;

      toast({
        title: "Reset complete",
        description: "Starting fresh company setup...",
      });

      // Hard refresh to avoid any cached company data (react-query stale cache)
      setTimeout(() => {
        window.location.assign("/intake");
      }, 300);
    } catch (error: any) {
      console.error("Reset error:", error);
      toast({
        title: "Reset failed",
        description: error.message || "Failed to reset",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
      setResetDialogOpen(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to delete your account",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error("Delete account error:", error);
        toast({
          title: "Error",
          description: "Failed to delete account",
          variant: "destructive",
        });
        return;
      }

      if (data?.success) {
        toast({
          title: "Account deleted",
          description: "Your account has been deleted successfully",
        });
        await supabase.auth.signOut();
        navigate('/');
      } else {
        toast({
          title: "Error",
          description: data?.error || "Failed to delete account",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Delete account exception:", error);
      toast({
        title: "Error",
        description: "An error occurred while deleting your account",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAccount(false);
      setDeleteAccountDialogOpen(false);
    }
  };

  const handleVerdictGenerated = useCallback((verdict: any) => {
    // Verdict is persisted to company.vc_verdict_json by VCVerdictCard
    // Invalidate company cache so cachedVerdict updates from React Query
    queryClient.invalidateQueries({ queryKey: ["company", user?.id] });
  }, [queryClient, user?.id]);

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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar */}
        <FounderSidebar
          isAdmin={isAdmin}
          hasPaid={hasPaid}
          hasMemo={memoHasContent}
          companyId={company.id}
          matchingFunds={matchingFunds}
          onResetClick={() => setResetDialogOpen(true)}
          onDeleteAccountClick={() => setDeleteAccountDialogOpen(true)}
          onFundDiscoveryClick={() => setFundDiscoveryModalOpen(true)}
          onInviteFounderClick={() => setInviteFounderOpen(true)}
          onScoreboardClick={() => setScoreboardOpen(true)}
        />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Stakes Reminder Banner - Only show if no memo and not paid */}
          {!memoGenerated && !hasPaid && (
            <StakesReminderBanner 
              onAction={() => navigate("/portal")} 
              hasMemo={!!memoGenerated}
            />
          )}
          
          {/* Header */}
          <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="px-6 h-14 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                <CompanyBadge
                  name={company.name}
                  sector={company.category || undefined}
                  tagline={generatingTagline ? "Generating tagline..." : tagline}
                  isLoading={generatingTagline}
                />
              </div>
              
              {/* Sign out button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </header>

          {/* Main Content - Single Column Layout */}
          <main className="flex-1 px-6 py-8 overflow-auto">
            <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Main Content based on paid/unpaid status */}
          {hasPaid && memoGenerated ? (
            <div className="space-y-6">
              {/* Investment Readiness Scorecard - with spider graph (always first) */}
              {sectionTools && Object.keys(sectionTools).length > 0 ? (
                <DashboardScorecard
                  sectionTools={sectionTools}
                  companyName={company.name}
                  companyDescription={company.description || undefined}
                  stage={company.stage}
                  category={company.category || undefined}
                  companyId={company.id}
                  onNavigate={navigate}
                  memoContent={memoContentData?.memoContent}
                />
              ) : (
                // Fallback card when sectionTools not available
                <Card className="border-2 border-primary/30 shadow-glow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="text-xl font-serif font-bold">Your Full Analysis</h3>
                        <p className="text-sm text-muted-foreground">
                          Access your complete investment memo and analysis tools
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/analysis/section?companyId=${company.id}&section=0`)}
                          className="border-primary/50 hover:bg-primary/10"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Full Memo
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/tools`)}
                          className="border-primary/50 hover:bg-primary/10"
                        >
                          <Wrench className="w-4 h-4 mr-2" />
                          Tools
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/analysis/regenerate?companyId=${company.id}`)}
                          className="border-amber-500/50 hover:bg-amber-500/10 hover:border-amber-500"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Regenerate
                        </Button>
                        <Button
                          onClick={() => navigate(`/analysis/overview?companyId=${company.id}`)}
                          className="gradient-primary shadow-glow"
                        >
                          <LayoutGrid className="w-4 h-4 mr-2" />
                          Overview
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Strategic Tools Spotlight - Market Lens & VC Network */}
              <StrategicToolsSpotlight
                matchingFunds={matchingFunds}
                hasMarketLensBriefing={responses.some(r => r.question_key === 'market_lens_briefing' && r.answer)}
                reportsAnalyzed={6}
              />

              {/* VC Quick Take (IC Room) - below the spotlight */}
              {vcQuickTake && (
                <MemoVCQuickTake quickTake={vcQuickTake} showTeaser={false} />
              )}

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
              {/* AI-Powered VC Verdict - for unpaid users */}
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
                generationsAvailable={generationsAvailable}
              />
            </>
          )}

          {/* Change Deck Option */}
          {!memoGenerated && (
            <Card 
              className="relative overflow-hidden border border-border/50 hover:border-primary/50 bg-card cursor-pointer transition-all duration-300 hover:shadow-md group"
              onClick={() => setDeckWizardOpen(true)}
            >
              <CardContent className="p-4 relative">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                    <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">Change Deck</h3>
                    <p className="text-xs text-muted-foreground">
                      Upload a different deck to refresh your VC verdict
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tools Section - Only unlocked after payment */}
          <ToolsRow memoGenerated={!!hasPaid} />

          {/* Knowledge Library */}
          <CollapsedLibrary stage={company.stage} />

          {/* Company Profile Card - At Bottom */}
          <CompanyProfileCard
            name={company.name}
            stage={company.stage}
            sector={company.category || undefined}
            completedQuestions={completedQuestions}
            totalQuestions={totalQuestions}
          />
            </div>
          </main>
        </div>
        
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

        {/* Delete Account Confirmation Dialog */}
        <AlertDialog open={deleteAccountDialogOpen} onOpenChange={setDeleteAccountDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive">Delete Account Permanently</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your account and all associated data including:
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Your company profile</li>
                  <li>All questionnaire responses</li>
                  <li>Generated memos and analyses</li>
                  <li>Purchase history</li>
                </ul>
                <br />
                <strong className="text-destructive">This action cannot be undone. Your data cannot be recovered.</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletingAccount}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeletingAccount ? "Deleting..." : "Delete My Account"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Fund Discovery Premium Modal */}
        <FundDiscoveryPremiumModal
          open={fundDiscoveryModalOpen}
          onOpenChange={setFundDiscoveryModalOpen}
          matchingFundsCount={matchingFunds}
          companyStage={company.stage}
          companyCategory={company.category}
        />

        {/* Invite Founder Modal */}
        <InviteFounderModal
          open={inviteFounderOpen}
          onOpenChange={setInviteFounderOpen}
          companyId={company.id}
          companyName={company.name}
        />

        {/* Scoreboard Modal */}
        <ScoreboardModal
          open={scoreboardOpen}
          onOpenChange={setScoreboardOpen}
          companyId={company.id}
          companyName={company.name}
          userScore={cachedVerdict?.overallScore || 0}
          currentOptIn={(companyData as any)?.scoreboard_opt_in || false}
        />
      </div>
    </SidebarProvider>
  );
}
