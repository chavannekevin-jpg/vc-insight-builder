import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { 
  Building2, 
  FileText, 
  DollarSign, 
  Calendar,
  Tag,
  Clock,
  LogIn,
  Activity,
  Plus,
  RefreshCw,
  Trash2,
  Loader2,
  Ticket,
  Copy,
  Check,
  RotateCcw
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Company {
  id: string;
  name: string;
  stage: string;
  created_at: string;
  has_memo: boolean;
  has_premium: boolean;
  responses_count: number;
  generations_available: number;
  generations_used: number;
  referral_code: string | null;
}

interface Purchase {
  id: string;
  amount_paid: number;
  created_at: string;
  discount_code_used: string | null;
  company_name: string;
}

interface UserDetailProps {
  userId: string;
  onCompanyClick?: (companyId: string) => void;
  onUserDeleted?: () => void;
}

export const AdminUserDetail = ({ userId, onCompanyClick, onUserDeleted }: UserDetailProps) => {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [userCreatedAt, setUserCreatedAt] = useState<string | null>(null);
  const [lastSignInAt, setLastSignInAt] = useState<string | null>(null);
  const [signInCount, setSignInCount] = useState(0);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [creditsToAdd, setCreditsToAdd] = useState<Record<string, number>>({});
  const [addingCredits, setAddingCredits] = useState<Record<string, boolean>>({});
  const [generatingCode, setGeneratingCode] = useState<Record<string, boolean>>({});
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [claimCodes, setClaimCodes] = useState<Record<string, string | null>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [restartDialogOpen, setRestartDialogOpen] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  const generateClaimCode = async (companyId: string, companyName: string) => {
    setGeneratingCode(prev => ({ ...prev, [companyId]: true }));
    try {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let code = "CLAIM-";
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const { error } = await supabase
        .from("startup_claim_codes")
        .insert({
          code,
          company_id: companyId,
          is_active: true,
        });

      if (error) throw error;

      // Update local state with the new code
      setClaimCodes(prev => ({ ...prev, [companyId]: code }));

      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 3000);

      toast({
        title: "Claim code generated!",
        description: `Code ${code} copied to clipboard. Give this to an accelerator to claim ${companyName}.`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to generate code",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGeneratingCode(prev => ({ ...prev, [companyId]: false }));
    }
  };

  const handleRestartStartupAccount = async () => {
    setIsRestarting(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-restart-startup-account', {
        body: { targetUserId: userId }
      });

      if (error) {
        console.error('[AdminUserDetail] Restart error:', error);
        toast({
          title: "Failed to restart account",
          description: error.message || "An error occurred",
          variant: "destructive"
        });
        return;
      }

      if (data?.success) {
        toast({
          title: "Startup account restarted",
          description: `Deleted ${data.deletedCompanies} companies and ${data.deletedMemos} memos. User will restart from onboarding.`
        });
        // Refresh the data
        fetchUserDetails();
      } else {
        toast({
          title: "Failed to restart account",
          description: data?.error || "An error occurred",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('[AdminUserDetail] Restart exception:', error);
      toast({
        title: "Failed to restart account",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsRestarting(false);
      setRestartDialogOpen(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-delete-account', {
        body: { targetUserId: userId }
      });

      if (error) {
        console.error('[AdminUserDetail] Delete error:', error);
        toast({
          title: "Failed to delete account",
          description: error.message || "An error occurred",
          variant: "destructive"
        });
        return;
      }

      if (data?.success) {
        toast({
          title: "Account deleted",
          description: `${userEmail} has been permanently deleted`
        });
        onUserDeleted?.();
      } else {
        toast({
          title: "Failed to delete account",
          description: data?.error || "An error occurred",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('[AdminUserDetail] Delete exception:', error);
      toast({
        title: "Failed to delete account",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleAddCredits = async (companyId: string, companyName: string) => {
    const credits = creditsToAdd[companyId] || 1;
    if (credits < 1) {
      toast({ title: "Invalid amount", description: "Credits must be at least 1", variant: "destructive" });
      return;
    }

    setAddingCredits(prev => ({ ...prev, [companyId]: true }));
    
    try {
      // Get current generations_available
      const { data: company, error: fetchError } = await supabase
        .from("companies")
        .select("generations_available")
        .eq("id", companyId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const newCredits = (company?.generations_available || 0) + credits;
      
      const { error } = await supabase
        .from("companies")
        .update({ generations_available: newCredits })
        .eq("id", companyId);
      
      if (error) throw error;
      
      // Update local state
      setCompanies(prev => prev.map(c => 
        c.id === companyId 
          ? { ...c, generations_available: newCredits }
          : c
      ));
      
      // Reset input
      setCreditsToAdd(prev => ({ ...prev, [companyId]: 1 }));
      
      toast({
        title: "Credits added",
        description: `Added ${credits} regeneration credit${credits > 1 ? 's' : ''} to ${companyName}`,
      });
    } catch (error) {
      console.error("Error adding credits:", error);
      toast({
        title: "Failed to add credits",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setAddingCredits(prev => ({ ...prev, [companyId]: false }));
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      // Fetch user profile with sign-in data
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, created_at, last_sign_in_at, sign_in_count")
        .eq("id", userId)
        .single();

      if (profile) {
        setUserEmail(profile.email);
        setUserCreatedAt(profile.created_at);
        setLastSignInAt(profile.last_sign_in_at);
        setSignInCount(profile.sign_in_count || 0);
      }

      // Fetch user's companies with memo status
      const { data: companiesData } = await supabase
        .from("companies")
        .select(`
          id,
          name,
          stage,
          created_at,
          has_premium,
          generations_available,
          generations_used,
          referral_code,
          memos(id, status)
        `)
        .eq("founder_id", userId)
        .order("created_at", { ascending: false });

      // Get response counts for each company
      const companiesWithDetails = await Promise.all(
        (companiesData || []).map(async (company: any) => {
          const { count } = await supabase
            .from("memo_responses")
            .select("id", { count: "exact", head: true })
            .eq("company_id", company.id)
            .not("answer", "is", null);

          const hasMemo = (company.memos || []).some((m: any) => m.status === "generated");

          return {
            id: company.id,
            name: company.name,
            stage: company.stage,
            created_at: company.created_at,
            has_memo: hasMemo,
            has_premium: company.has_premium || false,
            responses_count: count || 0,
            generations_available: company.generations_available || 0,
            generations_used: company.generations_used || 0,
            referral_code: company.referral_code || null,
          };
        })
      );

      setCompanies(companiesWithDetails);

      // Fetch existing claim codes for all companies
      const companyIds = companiesWithDetails.map(c => c.id);
      if (companyIds.length > 0) {
        const { data: existingCodes } = await supabase
          .from("startup_claim_codes")
          .select("company_id, code")
          .in("company_id", companyIds)
          .eq("is_active", true)
          .is("claimed_at", null)
          .order("created_at", { ascending: false });

        const codeMap: Record<string, string | null> = {};
        existingCodes?.forEach(cc => {
          if (!codeMap[cc.company_id]) {
            codeMap[cc.company_id] = cc.code;
          }
        });
        setClaimCodes(codeMap);
      }

      // Fetch purchases with company names
      const { data: purchasesData } = await supabase
        .from("memo_purchases")
        .select(`
          id,
          amount_paid,
          created_at,
          discount_code_used,
          companies(name)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      const purchasesWithNames = (purchasesData || []).map((p: any) => ({
        id: p.id,
        amount_paid: p.amount_paid,
        created_at: p.created_at,
        discount_code_used: p.discount_code_used,
        company_name: p.companies?.name || "Unknown",
      }));

      setPurchases(purchasesWithNames);
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3"></div>
        <div className="h-20 bg-muted rounded"></div>
        <div className="h-20 bg-muted rounded"></div>
      </div>
    );
  }

  const totalSpent = purchases.reduce((sum, p) => sum + Number(p.amount_paid), 0);

  return (
    <div className="space-y-6">
      {/* User Info Header */}
      <div className="p-4 rounded-lg bg-muted/30 border border-border">
        <p className="text-lg font-semibold text-foreground">{userEmail}</p>
        <div className="flex flex-wrap items-center gap-4 mt-2">
          {userCreatedAt && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>Joined {format(new Date(userCreatedAt), "MMMM d, yyyy")}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <LogIn className="w-3.5 h-3.5" />
            <span>{signInCount} sign-ins</span>
          </div>
          {lastSignInAt && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Activity className="w-3.5 h-3.5" />
              <span>Last seen {formatDistanceToNow(new Date(lastSignInAt), { addSuffix: true })}</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-center">
          <Building2 className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{companies.length}</p>
          <p className="text-xs text-muted-foreground">Companies</p>
        </div>
        <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10 text-center">
          <FileText className="w-5 h-5 text-green-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{purchases.length}</p>
          <p className="text-xs text-muted-foreground">Purchases</p>
        </div>
        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 text-center">
          <DollarSign className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">${totalSpent.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Total Spent</p>
        </div>
      </div>

      {/* Companies Section */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Companies ({companies.length})
        </h4>
        {companies.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No companies created</p>
        ) : (
          <div className="space-y-3">
            {companies.map((company) => (
              <div 
                key={company.id} 
                className="p-4 rounded-lg border border-border bg-card/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p 
                      className={`font-medium text-foreground ${onCompanyClick ? 'cursor-pointer hover:text-primary hover:underline' : ''}`}
                      onClick={() => onCompanyClick?.(company.id)}
                    >
                      {company.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{company.stage}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {company.responses_count} answers
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {company.has_premium && (
                      <Badge variant="default" className="bg-primary">Premium</Badge>
                    )}
                    {company.has_memo ? (
                      <Badge variant="default" className="bg-green-500">Memo Generated</Badge>
                    ) : (
                      <Badge variant="secondary">No Memo</Badge>
                    )}
                  </div>
                </div>
                
                {/* Credits Management */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Regeneration Credits: 
                      <span className="font-semibold text-foreground ml-1">
                        {company.generations_available}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({company.generations_used} used)
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={creditsToAdd[company.id] ?? 1}
                      onChange={(e) => setCreditsToAdd(prev => ({ 
                        ...prev, 
                        [company.id]: parseInt(e.target.value) || 1 
                      }))}
                      className="w-16 h-8 text-center"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAddCredits(company.id, company.name)}
                      disabled={addingCredits[company.id]}
                      className="h-8"
                    >
                      {addingCredits[company.id] ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          <Plus className="w-3 h-3 mr-1" />
                          Add
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Accelerator Claim Code */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Ticket className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground shrink-0">
                      Claim Code
                    </span>
                    {claimCodes[company.id] && (
                      <code className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-mono font-semibold">
                        {claimCodes[company.id]}
                      </code>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {claimCodes[company.id] && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(claimCodes[company.id]!);
                          setCopiedCode(claimCodes[company.id]!);
                          setTimeout(() => setCopiedCode(null), 3000);
                          toast({ title: "Copied!", description: `Code ${claimCodes[company.id]} copied to clipboard` });
                        }}
                        className="h-8"
                      >
                        {copiedCode === claimCodes[company.id] ? (
                          <Check className="w-3 h-3 text-success" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateClaimCode(company.id, company.name)}
                      disabled={generatingCode[company.id]}
                      className="h-8"
                    >
                      {generatingCode[company.id] ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          <Plus className="w-3 h-3 mr-1" />
                          {claimCodes[company.id] ? "New Code" : "Generate"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Purchases Section */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Purchase History ({purchases.length})
        </h4>
        {purchases.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No purchases yet</p>
        ) : (
          <div className="space-y-2">
            {purchases.map((purchase) => (
              <div 
                key={purchase.id} 
                className="p-3 rounded-lg border border-border bg-card/50 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-foreground">{purchase.company_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(purchase.created_at), "MMM d, yyyy")}
                    </span>
                    {purchase.discount_code_used && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {purchase.discount_code_used}
                      </Badge>
                    )}
                  </div>
                </div>
                <span className="text-lg font-bold text-green-600">
                  ${Number(purchase.amount_paid).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Restart Startup Account Section */}
      <div className="pt-4 border-t border-warning/20">
        <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
          <h4 className="text-sm font-semibold text-warning mb-2 flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Restart Startup Account
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            Remove all startup/company data for this user, allowing them to restart from the deck upload onboarding. 
            This does <strong>not</strong> affect investor or accelerator data.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRestartDialogOpen(true)}
            disabled={isRestarting || companies.length === 0}
            className="border-warning text-warning hover:bg-warning/10"
          >
            {isRestarting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Restarting...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart Account
              </>
            )}
          </Button>
          {companies.length === 0 && (
            <p className="text-xs text-muted-foreground mt-2 italic">
              No companies to delete - user is already at the start.
            </p>
          )}
        </div>
      </div>

      {/* Danger Zone - Delete Account */}
      <div className="pt-4 border-t border-destructive/20">
        <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
          <h4 className="text-sm font-semibold text-destructive mb-2 flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Danger Zone
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            Permanently delete this user account and all associated data. This action cannot be undone.
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Restart Confirmation Dialog */}
      <AlertDialog open={restartDialogOpen} onOpenChange={setRestartDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restart Startup Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all startup data for <strong>{userEmail}</strong> including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>{companies.length} company/companies</li>
                <li>All memos and analyses</li>
                <li>All workshop responses</li>
                <li>All tool data and enrichments</li>
              </ul>
              <span className="block mt-3 text-muted-foreground">
                <strong>Preserved:</strong> Investor profiles, accelerator memberships, and user account.
              </span>
              <span className="block mt-2 font-semibold text-warning">
                User will restart from deck upload onboarding on next startup login.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestarting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestartStartupAccount}
              disabled={isRestarting}
              className="bg-warning text-warning-foreground hover:bg-warning/90"
            >
              {isRestarting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Restarting...
                </>
              ) : (
                "Restart Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{userEmail}</strong> and all associated data including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>{companies.length} company/companies</li>
                <li>All memos and analyses</li>
                <li>All purchase records</li>
                <li>User authentication record</li>
              </ul>
              <span className="block mt-3 font-semibold text-destructive">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
