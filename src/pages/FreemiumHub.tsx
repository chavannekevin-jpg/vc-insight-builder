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
import { InviteFounderModal } from "@/components/founder/InviteFounderModal";
import ScoreboardModal from "@/components/founder/ScoreboardModal";
import { MemoLoadingScreen } from "@/components/MemoLoadingScreen";
import { DashboardEntranceAnimation, useDashboardEntrance } from "@/components/DashboardEntranceAnimation";
import { LogOut, Sparkles, Edit, FileText, BookOpen, Calculator, Shield, ArrowRight, RotateCcw, Flame, LayoutGrid, Upload, Wrench, Trash2, Settings, Building2, Menu } from "lucide-react";
import { FundDiscoveryPremiumModal } from "@/components/FundDiscoveryPremiumModal";
import { useMatchingFundsCount } from "@/hooks/useMatchingFundsCount";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/hooks/useCompany";
import { usePrefetchMemoContent, useMemoContent, useInvalidateMemoContent } from "@/hooks/useMemoContent";
import { useVcQuickTake, useSectionTools, useDashboardResponses } from "@/hooks/useDashboardData";
import { WorkshopNPSModal } from "@/components/workshop/WorkshopNPSModal";
import { useAcceleratorDiscount } from "@/hooks/useAcceleratorDiscount";
import { AcceleratorDiscountBanner } from "@/components/AcceleratorDiscountBanner";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const adminView = searchParams.get("admin") === "true";
  const freshCompany = (location.state as any)?.freshCompany === true;
  const freshPurchase = (location.state as any)?.freshPurchase === true;
  const shouldRegenerate = searchParams.get("regenerate") === "true";
  const companyIdFromParams = searchParams.get("companyId");
  
  // Use cached hooks instead of manual data loading
  // IMPORTANT: Use companyIdFromParams if available to ensure correct company is loaded
  const { user, isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const { 
    company: companyData, 
    hasMemo: hasMemoData,
    memoHasContent,
    hasPaid: hasPaidData,
    completedQuestions: cachedCompletedQuestions,
    totalQuestions: cachedTotalQuestions,
    generationsAvailable,
    hasAcceleratorAccess,
    isLoading: companyLoading 
  } = useCompany(user?.id, companyIdFromParams);

  // IMPORTANT: Always derive a single source-of-truth paid flag.
  // Some flows (e.g., 100% invite) may set has_premium before a purchase record is visible.
  const hasPaid = useMemo(
    () => hasPaidData || !!(companyData as any)?.has_premium,
    [hasPaidData, (companyData as any)?.has_premium]
  );

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
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [npsModalOpen, setNpsModalOpen] = useState(false);

  // Dashboard entrance animation
  const { showEntrance, isChecked: entranceChecked, completeEntrance } = useDashboardEntrance();

  // Cache invalidation for after regeneration
  const invalidateMemoCache = useInvalidateMemoContent();

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
  // NOTE: These MUST use the computed `hasPaid` (not raw hasPaidData) to avoid
  // rendering the paywall/freemium view during post-payment propagation.
  const { data: vcQuickTake } = useVcQuickTake(company?.id || null, hasPaid);
  const { data: sectionTools } = useSectionTools(company?.id || null, hasPaid, memoHasContent);
  const { data: responses = [] } = useDashboardResponses(company?.id || null);
  
  // Fetch full memo content for section narratives
  const { data: memoContentData } = useMemoContent(hasPaid && memoHasContent ? company?.id : null);
  
  // Fetch accelerator discount info for banner
  const { discountPercent, acceleratorName, hasDiscount } = useAcceleratorDiscount(
    companyData?.accelerator_invite_id
  );

  // Cached verdict from company data (already cached by useCompany)
  const cachedVerdict = company?.vc_verdict_json || null;

  // Prefetch memo content for instant navigation (paid users with generated memo)
  const prefetchMemo = usePrefetchMemoContent();
  useEffect(() => {
    if (hasPaid && company?.id && memoHasContent) {
      console.log('[FreemiumHub] Prefetching memo content for instant loading...');
      prefetchMemo(company.id);
    }
  }, [hasPaid, company?.id, memoHasContent, prefetchMemo]);

  // Redirect to auth if not authenticated (with grace period for auth state propagation)
  useEffect(() => {
    if (adminView) return;
    
    // Add grace period to allow auth state to propagate after login navigation
    const timer = setTimeout(() => {
      if (!authLoading && !isAuthenticated) {
        navigate("/auth");
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [authLoading, isAuthenticated, adminView, navigate]);

  // Force refetch company data on mount if coming from intake with fresh company or fresh purchase
  useEffect(() => {
    if ((freshCompany || freshPurchase) && user?.id) {
      console.log('[FreemiumHub] Invalidating ALL caches after fresh purchase or company creation');
      
      // Company caches (both patterns)
      queryClient.invalidateQueries({ queryKey: ["company"] });
      queryClient.invalidateQueries({ queryKey: ["company", user.id] });
      if (companyIdFromParams) {
        queryClient.invalidateQueries({ queryKey: ["company", "byId", companyIdFromParams] });
      }
      
      // Payment status
      queryClient.invalidateQueries({ queryKey: ["payment"] });
      
      // Memo and content data
      queryClient.invalidateQueries({ queryKey: ["memo"] });
      if (companyIdFromParams) {
        queryClient.invalidateQueries({ queryKey: ["memo-content", companyIdFromParams] });
        queryClient.invalidateQueries({ queryKey: ["vc-quick-take", companyIdFromParams] });
        queryClient.invalidateQueries({ queryKey: ["sectionTools", companyIdFromParams] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-responses", companyIdFromParams] });
      }
    }
  }, [freshCompany, freshPurchase, user?.id, companyIdFromParams, queryClient]);

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

  // Handle ?openNps=true URL parameter for deep-linking
  useEffect(() => {
    if (searchParams.get('openNps') === 'true' && hasAcceleratorAccess && company?.id) {
      setNpsModalOpen(true);
      // Clear the param to prevent re-opening on refresh
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('openNps');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, hasAcceleratorAccess, company?.id, setSearchParams]);

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

  // Handle regeneration flow - trigger when coming from MemoRegenerate
  useEffect(() => {
    if (shouldRegenerate && company?.id && hasPaidData && !isRegenerating) {
      console.log("Hub: Auto-regenerating memo due to regenerate URL param...");
      // Clear the regenerate param from URL to prevent re-triggering
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("regenerate");
      setSearchParams(newParams, { replace: true });
      // Start regeneration
      handleRegeneration(company.id);
    }
  }, [shouldRegenerate, company?.id, hasPaidData, isRegenerating]);

  const handleRegeneration = async (companyIdToRegenerate: string) => {
    setIsRegenerating(true);
    
    try {
      console.log("Hub: Starting memo regeneration...");
      
      const { data: startData, error: startError } = await supabase.functions.invoke('generate-full-memo', {
        body: { companyId: companyIdToRegenerate, force: true }
      });

      if (startError) {
        console.error("Hub: Regeneration error:", startError);
        throw new Error(startError.message || "Failed to start regeneration");
      }

      if (!startData?.jobId) {
        throw new Error("No job ID returned from regeneration");
      }

      const jobId = startData.jobId;
      console.log(`Hub: Regeneration job started: ${jobId}`);

      // Poll for completion
      await pollRegenerationJob(jobId, companyIdToRegenerate);
      
    } catch (error: any) {
      console.error("Hub: Regeneration error:", error);
      toast({
        title: "Regeneration Error",
        description: error?.message || "Failed to regenerate memo.",
        variant: "destructive"
      });
      setIsRegenerating(false);
    }
  };

  const pollRegenerationJob = async (jobId: string, companyIdToRegenerate: string) => {
    const maxAttempts = 120; // 10 minutes max
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const { data: job, error } = await supabase
          .from("memo_generation_jobs")
          .select("status, error_message")
          .eq("id", jobId)
          .maybeSingle();

        if (error) {
          console.error("Hub: Error polling job:", error);
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }

        if (job?.status === "completed") {
          console.log("Hub: Regeneration completed!");
          handleRegenerationComplete(companyIdToRegenerate);
          return;
        }

        if (job?.status === "failed") {
          throw new Error(job.error_message || "Regeneration failed");
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error("Hub: Polling error:", error);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // Timeout - complete anyway and let user see results
    console.log("Hub: Polling timeout, completing...");
    handleRegenerationComplete(companyIdToRegenerate);
  };

  const handleRegenerationComplete = async (companyIdToRegenerate: string) => {
    console.log("Hub: Regeneration complete, refreshing data...");
    
    // Invalidate all caches to get fresh data
    await invalidateMemoCache(companyIdToRegenerate);
    queryClient.invalidateQueries({ queryKey: ["company"] });
    queryClient.invalidateQueries({ queryKey: ["memo-content", companyIdToRegenerate] });
    queryClient.invalidateQueries({ queryKey: ["vc-quick-take", companyIdToRegenerate] });
    queryClient.invalidateQueries({ queryKey: ["sectionTools", companyIdToRegenerate] });
    
    toast({
      title: "Success",
      description: "Your analysis has been regenerated with the latest data."
    });
    
    setIsRegenerating(false);
  };

  const handleMemoReady = () => {
    handleRegenerationComplete(company?.id || "");
  };

  const handleCheckStatus = () => {
    // Manual check - refresh the page data
    queryClient.invalidateQueries({ queryKey: ["company"] });
    setIsRegenerating(false);
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

      // 2. Upsert ALL memo responses (including low-confidence) - they're still shown but marked
      // Low-confidence fields are pre-filled but labeled so users know to review them
      const allResponses = Object.entries(data.extractedSections)
        .filter(([_, section]) => section.content && section.content.trim().length > 0)
        .map(([key, section]) => ({
          company_id: company.id,
          question_key: key,
          answer: section.content,
          source: 'deck_import',
          confidence_score: section.confidence
        }));

      if (allResponses.length > 0) {
        // Use upsert to update existing or insert new
        for (const response of allResponses) {
          const { error: upsertError } = await supabase
            .from("memo_responses")
            .upsert(response, {
              onConflict: 'company_id,question_key'
            });

          if (upsertError) {
            console.error(`Error upserting response for ${response.question_key}:`, upsertError);
          }
        }

        console.log(`Saved ${allResponses.length} deck-extracted responses (including low-confidence)`);
        
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
  // Use memoHasContent (more robust) instead of memo.status === "completed" for gating
  // memoHasContent checks for actual structured_content existence
  const memoGenerated = memoHasContent || (memo && memo.status === "completed");
  const deckParsed = !!company?.deck_parsed_at;

  const loading = authLoading || companyLoading;
  
  // State for "finalizing" mode when paid but memo not ready yet
  const [isFinalizingAnalysis, setIsFinalizingAnalysis] = useState(false);
  const [finalizingAttempts, setFinalizingAttempts] = useState(0);
  const [finalizingTimedOut, setFinalizingTimedOut] = useState(false);
  
  // Poll for FULL dashboard readiness when paid but sectionTools not ready
  // CRITICAL: Only poll if hasMemoData is true (memo row exists).
  // This prevents infinite "Finalizing" loop for premium users without any memo.
  useEffect(() => {
    const hasSectionToolsReady = sectionTools && Object.keys(sectionTools).length >= 8;
    
    // Exit conditions: not paid, no company, still loading, already regenerating, or dashboard fully ready
    if (!hasPaid || !company?.id || loading || isRegenerating || (memoHasContent && hasSectionToolsReady)) {
      setIsFinalizingAnalysis(false);
      return;
    }
    
    // IMPORTANT: Only start polling if a memo exists (hasMemoData).
    // If premium but no memo, show "Generate analysis" CTA instead of polling forever.
    if (!hasMemoData) {
      console.log("[FreemiumHub] Premium user with no memo - will show 'Generate analysis' CTA instead of polling");
      setIsFinalizingAnalysis(false);
      return;
    }
    
    // User is paid AND has a memo but dashboard isn't fully ready - show finalizing state and poll
    console.log("[FreemiumHub] Paid user with memo but incomplete data, starting finalization polling...");
    setIsFinalizingAnalysis(true);
    setFinalizingTimedOut(false);
    
    let cancelled = false;
    
    const pollForReadiness = async () => {
      // Dynamically import to avoid circular dependencies
      const { checkDashboardReadiness } = await import("@/lib/dashboardReadiness");
      
      let attempts = 0;
      const maxAttempts = 40; // ~2 minutes at 3s intervals
      
      while (!cancelled && attempts < maxAttempts) {
        try {
          const readiness = await checkDashboardReadiness(company.id);
          
          console.log(`[FreemiumHub] Readiness check ${attempts + 1}:`, {
            isReady: readiness.isReady,
            sectionScores: `${readiness.sectionScoreCount}/8`,
            hasVcQuickTake: readiness.hasVcQuickTake,
            missingSections: readiness.missingSections
          });
          
          if (readiness.isReady) {
            console.log("[FreemiumHub] Dashboard fully ready, refreshing all data...");
            // Invalidate all caches with the CORRECT keys
            await queryClient.invalidateQueries({ queryKey: ["memo", company.id] });
            await queryClient.invalidateQueries({ queryKey: ["memo-content", company.id] });
            await queryClient.invalidateQueries({ queryKey: ["sectionTools", company.id] });
            await queryClient.invalidateQueries({ queryKey: ["vc-quick-take", company.id] });
            await queryClient.invalidateQueries({ queryKey: ["company"] });
            await queryClient.invalidateQueries({ queryKey: ["dashboard-responses", company.id] });
            setIsFinalizingAnalysis(false);
            return;
          }
          
          attempts++;
          setFinalizingAttempts(attempts);
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (error) {
          console.error("[FreemiumHub] Readiness poll error:", error);
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
      
      // Timeout - stop polling, mark as timed out (user can refresh/retry)
      console.log("[FreemiumHub] Finalization polling timeout");
      setIsFinalizingAnalysis(false);
      setFinalizingTimedOut(true);
    };
    
    pollForReadiness();
    
    return () => {
      cancelled = true;
    };
  }, [hasPaid, hasMemoData, company?.id, loading, isRegenerating, memoHasContent, sectionTools, queryClient]);

  // Show regeneration loading screen
  if (isRegenerating) {
    return (
      <MemoLoadingScreen 
        analyzing={false}
        progressMessage="Regenerating your analysis with updated data..."
        companyId={company?.id || undefined}
        onMemoReady={handleMemoReady}
        onCheckStatus={handleCheckStatus}
      />
    );
  }
  
  // NOTE: "Finalizing" is now rendered inline in the main content area (not as early-return)
  // so that sidebar and modals remain accessible. This is handled in the main content section below.
  const hasSectionToolsReady = sectionTools && Object.keys(sectionTools).length >= 8;
  
  // Determine if we're in "premium but no memo" state (needs Generate Analysis CTA)
  const isPremiumNoMemo = hasPaid && !hasMemoData;

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
    <>
      {/* Entrance Animation */}
      {entranceChecked && showEntrance && (
        <DashboardEntranceAnimation 
          companyName={company.name}
          onComplete={completeEntrance}
        />
      )}
      
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar */}
        <FounderSidebar
          isAdmin={isAdmin}
          hasPaid={hasPaid}
          hasMemo={memoHasContent}
          companyId={company.id}
          matchingFunds={matchingFunds}
          hasAcceleratorAccess={hasAcceleratorAccess}
          onResetClick={() => setResetDialogOpen(true)}
          onDeleteAccountClick={() => setDeleteAccountDialogOpen(true)}
          onFundDiscoveryClick={() => setFundDiscoveryModalOpen(true)}
          onInviteFounderClick={() => setInviteFounderOpen(true)}
          onScoreboardClick={() => setScoreboardOpen(true)}
          onNpsClick={() => setNpsModalOpen(true)}
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
          
          {/* Header - Desktop */}
          <header className="sticky top-0 z-40 w-full border-b border-border/30 bg-background/80 backdrop-blur-2xl hidden lg:block">
            <div className="px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
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
                className="gap-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted/50 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </header>
          
          {/* Header - Mobile */}
          <header className="sticky top-0 z-40 w-full border-b border-border/30 bg-background/80 backdrop-blur-2xl lg:hidden">
            <div className="px-4 h-14 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0" />
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{company.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {company.stage}{company.category ? ` · ${company.category}` : ''}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Mobile sign out - icon only */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-all flex-shrink-0 h-9 w-9"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </header>

          {/* Main Content - Single Column Layout */}
          <main className="flex-1 px-4 py-6 lg:px-6 lg:py-8 overflow-auto bg-gradient-to-b from-transparent via-muted/5 to-muted/10">
            <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
              
              {/* Accelerator Discount Banner - Show for accelerator users who haven't paid yet */}
              {hasAcceleratorAccess && hasDiscount && !hasPaid && (
                <AcceleratorDiscountBanner
                  discountPercent={discountPercent}
                  acceleratorName={acceleratorName}
                  onGenerate={() => navigate(`/checkout-analysis?companyId=${company.id}`)}
                />
              )}
          
          {/* Main Content based on paid/unpaid/memo status */}
          
          {/* CASE 1: Finalizing Analysis (inline, non-blocking) */}
          {isFinalizingAnalysis && hasPaid && hasMemoData && (!memoHasContent || !hasSectionToolsReady) ? (
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent">
              <CardContent className="p-8 text-center space-y-4">
                <Sparkles className="w-12 h-12 text-primary animate-pulse mx-auto" />
                <h2 className="text-xl font-semibold">Finalizing Your Analysis</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {!memoHasContent 
                    ? "Your investment analysis is being finalized. This usually takes just a moment..."
                    : "Preparing your investment readiness scorecard..."}
                </p>
                {finalizingAttempts > 10 && (
                  <p className="text-sm text-muted-foreground/70">
                    Taking longer than expected. Please wait or refresh the page.
                  </p>
                )}
              </CardContent>
            </Card>
          ) : isPremiumNoMemo ? (
            /* CASE 2: Premium user but no memo generated yet - show "Generate Analysis" CTA + VCVerdictCard if cached */
            <>
              <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent overflow-hidden relative">
                <div className="absolute top-0 right-0 w-60 h-60 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <CardContent className="p-8 relative">
                  <div className="flex flex-col items-center text-center space-y-6 max-w-lg mx-auto">
                    <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-serif font-bold">Generate Your Analysis</h2>
                      <p className="text-muted-foreground">
                        You have premium access! Generate your comprehensive VC investment memo to unlock the full dashboard with scores, insights, and tools.
                      </p>
                    </div>
                    {generationsAvailable > 0 && (
                      <p className="text-sm text-primary font-medium">
                        {generationsAvailable} analysis credit{generationsAvailable > 1 ? 's' : ''} available
                      </p>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        size="lg"
                        className="gradient-primary shadow-glow"
                        onClick={() => navigate(`/portal?companyId=${company.id}`)}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate My Analysis
                      </Button>
                      {hasAcceleratorAccess && (
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => navigate(`/workshop?companyId=${company.id}`)}
                          className="border-primary/50"
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Go to Workshop
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Also show VCVerdictCard if they have a cached verdict */}
              {cachedVerdict && (
                <VCVerdictCard
                  companyId={company.id}
                  companyName={company.name}
                  companyDescription={company.description}
                  companyStage={company.stage}
                  companyCategory={company.category}
                  responses={responses}
                  memoGenerated={false}
                  hasPaid={hasPaid}
                  deckParsed={deckParsed}
                  cachedVerdict={cachedVerdict}
                  onVerdictGenerated={handleVerdictGenerated}
                  generationsAvailable={generationsAvailable}
                />
              )}
            </>
          ) : finalizingTimedOut && hasPaid && hasMemoData ? (
            /* CASE 3: Finalization timed out - show retry option */
            <Card className="border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent">
              <CardContent className="p-6 text-center space-y-4">
                <p className="text-muted-foreground">
                  Your analysis is still being prepared. This can take a few minutes for complex decks.
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="border-amber-500/50 hover:bg-amber-500/10"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
              </CardContent>
            </Card>
          ) : hasPaid && memoGenerated ? (
            /* CASE 4: Paid user with fully generated memo - show dashboard */
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
                  arcClassification={memoContentData?.arcClassification}
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


              {/* VC Quick Take (IC Room) - seamless continuation */}
              {vcQuickTake && (
                <div className="-mt-4">
                  <MemoVCQuickTake quickTake={vcQuickTake} showTeaser={false} />
                </div>
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

        {/* Workshop NPS Modal */}
        <WorkshopNPSModal
          open={npsModalOpen}
          onOpenChange={setNpsModalOpen}
          companyId={company.id}
          acceleratorInviteId={(companyData as any)?.accelerator_invite_id}
        />
      </div>
    </SidebarProvider>
    </>
  );
}
