import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { FounderSidebar } from "@/components/founder/FounderSidebar";
import { InviteFounderModal } from "@/components/founder/InviteFounderModal";
import ScoreboardModal from "@/components/founder/ScoreboardModal";
import { FundDiscoveryPremiumModal } from "@/components/FundDiscoveryPremiumModal";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/hooks/useCompany";
import { useMatchingFundsCount } from "@/hooks/useMatchingFundsCount";
import { supabase } from "@/integrations/supabase/client";
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

interface FounderLayoutProps {
  children: React.ReactNode;
}

export function FounderLayout({ children }: FounderLayoutProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { user, isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const { 
    company, 
    hasPaid,
    memoHasContent,
    hasAcceleratorAccess,
    isLoading: companyLoading 
  } = useCompany(user?.id);

  const { matchingFunds } = useMatchingFundsCount(
    company?.id || null,
    company ? { stage: company.stage, category: company.category || undefined } : null
  );

  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [fundDiscoveryModalOpen, setFundDiscoveryModalOpen] = useState(false);
  const [inviteFounderOpen, setInviteFounderOpen] = useState(false);
  const [scoreboardOpen, setScoreboardOpen] = useState(false);
  const [cachedVerdict, setCachedVerdict] = useState<any>(null);

  // Load cached verdict
  useEffect(() => {
    if ((company as any)?.vc_verdict_json) {
      setCachedVerdict((company as any).vc_verdict_json);
    }
  }, [(company as any)?.vc_verdict_json]);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Redirect to intake if no company
  useEffect(() => {
    if (!authLoading && !companyLoading && isAuthenticated && !company) {
      const timer = setTimeout(() => {
        if (!company) {
          navigate("/intake");
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [authLoading, companyLoading, isAuthenticated, company, navigate]);

  const handleSoftReset = async () => {
    if (!user?.id) return;
    
    setIsResetting(true);
    try {
      const { error } = await supabase.functions.invoke("admin-reset-flow", {
        body: { userId: user.id }
      });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["company"] });
      toast({ title: "Flow reset successfully" });
      navigate("/intake");
    } catch (error) {
      console.error("Reset error:", error);
      toast({ title: "Failed to reset flow", variant: "destructive" });
    } finally {
      setIsResetting(false);
      setResetDialogOpen(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    
    setIsDeletingAccount(true);
    try {
      const { error } = await supabase.functions.invoke("delete-account", {
        body: { userId: user.id }
      });

      if (error) throw error;

      await supabase.auth.signOut();
      toast({ title: "Account deleted successfully" });
      navigate("/");
    } catch (error) {
      console.error("Delete error:", error);
      toast({ title: "Failed to delete account", variant: "destructive" });
    } finally {
      setIsDeletingAccount(false);
      setDeleteAccountDialogOpen(false);
    }
  };

  if (authLoading || companyLoading || !company) {
    return null; // Let individual pages handle their own loading states
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
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
        />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar with sidebar trigger - Desktop */}
          <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden lg:block">
            <div className="px-4 h-12 flex items-center">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            </div>
          </header>
          
          {/* Top bar with sidebar trigger - Mobile */}
          <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
            <div className="px-4 h-14 flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground flex-shrink-0" />
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="font-semibold text-sm truncate">{company.name}</span>
                <span className="text-xs text-muted-foreground flex-shrink-0">{company.stage}</span>
              </div>
            </div>
          </header>
          
          <main className="flex-1">
            {children}
          </main>
        </div>

        {/* Reset Dialog */}
        <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Your Flow?</AlertDialogTitle>
              <AlertDialogDescription>
                This will clear your company data and start fresh. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSoftReset}
                disabled={isResetting}
                className="bg-warning text-warning-foreground hover:bg-warning/90"
              >
                {isResetting ? "Resetting..." : "Reset Flow"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Account Dialog */}
        <AlertDialog open={deleteAccountDialogOpen} onOpenChange={setDeleteAccountDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Your Account?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your account and all associated data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
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
          currentOptIn={(company as any)?.scoreboard_opt_in || false}
        />
      </div>
    </SidebarProvider>
  );
}
