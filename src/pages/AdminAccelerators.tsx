import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Trash2, Users, Calendar, Search, Loader2, ExternalLink, Settings, Percent, Copy, Check, Ticket, Plus, Link2, Clock, Briefcase, UserMinus } from "lucide-react";
import { format } from "date-fns";

interface Accelerator {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  ecosystem_head_id: string;
  focus_areas: string[] | null;
  is_active: boolean;
  onboarding_completed: boolean;
  created_at: string;
  paid_at: string | null;
  stripe_payment_id: string | null;
  default_discount_percent: number;
  max_discounted_startups: number | null;
  pending_head_email?: string | null;
  cohort_count?: number;
  member_count?: number;
  startup_count?: number;
  ecosystem_head_email?: string;
  claim_token?: string | null;
}

interface LinkedCompany {
  id: string;
  name: string;
  stage: string;
  created_at: string;
  founder_email: string;
}

export default function AdminAccelerators() {
  const [accelerators, setAccelerators] = useState<Accelerator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Accelerator | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [configTarget, setConfigTarget] = useState<Accelerator | null>(null);
  const [configDiscount, setConfigDiscount] = useState(100);
  const [savingConfig, setSavingConfig] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Pre-create ecosystem state
  const [showPreCreateDialog, setShowPreCreateDialog] = useState(false);
  const [preCreateName, setPreCreateName] = useState("");
  const [preCreateEmail, setPreCreateEmail] = useState("");
  const [preCreateDiscount, setPreCreateDiscount] = useState(100);
  const [preCreateMaxStartups, setPreCreateMaxStartups] = useState<string>("");
  const [preCreating, setPreCreating] = useState(false);
  const [generatedClaimLink, setGeneratedClaimLink] = useState<string | null>(null);
  
  // Companies view state
  const [companiesTarget, setCompaniesTarget] = useState<Accelerator | null>(null);
  const [linkedCompanies, setLinkedCompanies] = useState<LinkedCompany[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [removingCompanyId, setRemovingCompanyId] = useState<string | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchAccelerators();
  }, []);

  const fetchAccelerators = async () => {
    try {
      // Fetch accelerators
      const { data: accData, error: accError } = await supabase
        .from("accelerators")
        .select("*")
        .order("created_at", { ascending: false });

      if (accError) throw accError;

      // Enrich with counts, head email, and claim tokens
      const enrichedData = await Promise.all(
        (accData || []).map(async (acc) => {
          // Get cohort count
          const { count: cohortCount } = await supabase
            .from("accelerator_cohorts")
            .select("id", { count: "exact", head: true })
            .eq("accelerator_id", acc.id);

          // Get member count
          const { count: memberCount } = await supabase
            .from("accelerator_members")
            .select("id", { count: "exact", head: true })
            .eq("accelerator_id", acc.id);

          // Get startup count - companies linked via accelerator_invites
          let startupCount = 0;
          const { data: invites } = await supabase
            .from("accelerator_invites")
            .select("id")
            .eq("linked_accelerator_id", acc.id);
          
          if (invites && invites.length > 0) {
            const inviteIds = invites.map(i => i.id);
            const { count } = await supabase
              .from("companies")
              .select("id", { count: "exact", head: true })
              .in("accelerator_invite_id", inviteIds);
            startupCount = count || 0;
          }

          // Get ecosystem head email
          const { data: profileData } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", acc.ecosystem_head_id)
            .single();

          // Check for pending claim token (unclaimed pre-created ecosystem)
          let claimToken = null;
          if (acc.stripe_payment_id === "admin_precreated") {
            const { data: pendingMember } = await supabase
              .from("accelerator_members")
              .select("invite_token")
              .eq("accelerator_id", acc.id)
              .eq("role", "head")
              .is("joined_at", null)
              .maybeSingle();
            
            if (pendingMember?.invite_token) {
              claimToken = pendingMember.invite_token;
            }
          }

          return {
            ...acc,
            cohort_count: cohortCount || 0,
            member_count: memberCount || 0,
            startup_count: startupCount,
            ecosystem_head_email: profileData?.email || "Unknown",
            claim_token: claimToken,
          };
        })
      );

      setAccelerators(enrichedData);
    } catch (error) {
      console.error("Error fetching accelerators:", error);
      toast({
        title: "Error",
        description: "Failed to load accelerators",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke("admin-delete-accelerator", {
        body: { acceleratorId: deleteTarget.id },
      });

      if (error) throw error;

      toast({
        title: "Accelerator deleted",
        description: `Successfully deleted ${deleteTarget.name}`,
      });

      setDeleteTarget(null);
      fetchAccelerators();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete accelerator",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveDiscount = async () => {
    if (!configTarget) return;
    
    setSavingConfig(true);
    try {
      const { error } = await supabase
        .from("accelerators")
        .update({ default_discount_percent: configDiscount })
        .eq("id", configTarget.id);

      if (error) throw error;

      toast({
        title: "Discount updated",
        description: `${configTarget.name} now offers ${configDiscount}% discount to invitees`,
      });
      
      setConfigTarget(null);
      fetchAccelerators();
    } catch (error: any) {
      toast({
        title: "Failed to update",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingConfig(false);
    }
  };

  const fetchLinkedCompanies = async (accelerator: Accelerator) => {
    setCompaniesTarget(accelerator);
    setLoadingCompanies(true);
    setLinkedCompanies([]);
    
    try {
      // Get all invite IDs for this accelerator
      const { data: invites } = await supabase
        .from("accelerator_invites")
        .select("id")
        .eq("linked_accelerator_id", accelerator.id);
      
      if (!invites || invites.length === 0) {
        setLinkedCompanies([]);
        return;
      }
      
      const inviteIds = invites.map(i => i.id);
      
      // Get companies linked to these invites
      const { data: companies, error } = await supabase
        .from("companies")
        .select("id, name, stage, created_at, founder_id")
        .in("accelerator_invite_id", inviteIds)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Enrich with founder email
      const enrichedCompanies = await Promise.all(
        (companies || []).map(async (company) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", company.founder_id)
            .single();
          
          return {
            id: company.id,
            name: company.name,
            stage: company.stage,
            created_at: company.created_at,
            founder_email: profile?.email || "Unknown",
          };
        })
      );
      
      setLinkedCompanies(enrichedCompanies);
    } catch (error) {
      console.error("Error fetching linked companies:", error);
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive",
      });
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleRemoveCompany = async (companyId: string, companyName: string) => {
    setRemovingCompanyId(companyId);
    try {
      // Remove the accelerator link from the company
      const { error } = await supabase
        .from("companies")
        .update({ accelerator_invite_id: null })
        .eq("id", companyId);
      
      if (error) throw error;
      
      toast({
        title: "Company removed",
        description: `${companyName} has been unlinked from ${companiesTarget?.name}`,
      });
      
      // Refresh the companies list
      setLinkedCompanies(prev => prev.filter(c => c.id !== companyId));
      
      // Refresh accelerators to update counts
      fetchAccelerators();
    } catch (error: any) {
      toast({
        title: "Failed to remove",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRemovingCompanyId(null);
    }
  };

  const handlePreCreateEcosystem = async () => {
    if (!preCreateName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter an accelerator name",
        variant: "destructive",
      });
      return;
    }

    setPreCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-accelerator-for-head", {
        body: { 
          acceleratorName: preCreateName.trim(),
          headEmail: preCreateEmail.trim() || null,
          discountPercent: preCreateDiscount,
          maxDiscountedStartups: preCreateMaxStartups ? parseInt(preCreateMaxStartups) : null,
        },
      });

      if (error) throw error;

      const fullClaimLink = `${window.location.origin}/accelerator/auth?claim=${data.claimToken}`;
      setGeneratedClaimLink(fullClaimLink);
      
      toast({
        title: "Ecosystem pre-created!",
        description: `${preCreateName} is ready. Share the claim link with the ecosystem head.`,
      });

      fetchAccelerators();
    } catch (error: any) {
      console.error("Pre-create error:", error);
      toast({
        title: "Failed to create",
        description: error.message || "Failed to pre-create ecosystem",
        variant: "destructive",
      });
    } finally {
      setPreCreating(false);
    }
  };

  const copyClaimLink = (token: string) => {
    const fullLink = `${window.location.origin}/accelerator/auth?claim=${token}`;
    navigator.clipboard.writeText(fullLink);
    setCopiedCode(`claim-${token}`);
    setTimeout(() => setCopiedCode(null), 3000);
    toast({
      title: "Link copied!",
      description: "Claim link copied to clipboard",
    });
  };

  const copyStartupJoinLink = (slug: string) => {
    const fullLink = `${window.location.origin}/join/${slug}`;
    navigator.clipboard.writeText(fullLink);
    setCopiedCode(`join-${slug}`);
    setTimeout(() => setCopiedCode(null), 3000);
    toast({
      title: "Link copied!",
      description: "Startup join link copied to clipboard",
    });
  };

  const resetPreCreateDialog = () => {
    setShowPreCreateDialog(false);
    setPreCreateName("");
    setPreCreateEmail("");
    setPreCreateDiscount(100);
    setPreCreateMaxStartups("");
    setGeneratedClaimLink(null);
  };

  const filteredAccelerators = accelerators.filter(
    (acc) =>
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.ecosystem_head_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingClaimCount = accelerators.filter(acc => acc.claim_token).length;

  return (
    <AdminLayout title="Accelerator Ecosystems">
      <div className="space-y-6">
        {/* How Invite Flows Work */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Ticket className="h-5 w-5 text-primary" />
              Startup Invite System Guide
            </CardTitle>
            <CardDescription>
              Three ways for accelerators to bring startups into their ecosystem
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-background/80 border border-border/50">
                <h4 className="font-semibold mb-2 text-foreground">1. Admin Claim Code</h4>
                <p className="text-muted-foreground text-xs mb-3">
                  You generate a claim code for a specific startup. Give this code to the accelerator, who enters it in Settings → Claim Startups.
                </p>
                <div className="text-xs space-y-1 text-muted-foreground/80">
                  <p>• Use "Generate Claim Code" in Users Hub</p>
                  <p>• Code format: CLAIM-XXXXXX</p>
                  <p>• Single-use, expires in 30 days</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-background/80 border border-border/50">
                <h4 className="font-semibold mb-2 text-foreground">2. Accelerator Invite Code</h4>
                <p className="text-muted-foreground text-xs mb-3">
                  Accelerator creates invite codes from their dashboard. Existing startups enter the code in Company Profile → Accelerator section.
                </p>
                <div className="text-xs space-y-1 text-muted-foreground/80">
                  <p>• Discount from "Default Discount %" column</p>
                  <p>• Reusable based on max uses setting</p>
                  <p>• Links startup + applies discount</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-background/80 border border-border/50">
                <h4 className="font-semibold mb-2 text-foreground">3. Signup Invite Link</h4>
                <p className="text-muted-foreground text-xs mb-3">
                  Accelerator shares invite link with new startups. They sign up via the link, auto-join the ecosystem with discount applied.
                </p>
                <div className="text-xs space-y-1 text-muted-foreground/80">
                  <p>• URL: /join/[accelerator-slug]?code=XXX</p>
                  <p>• New users only, auto-links on signup</p>
                  <p>• Best for cohort onboarding</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground pt-2 border-t border-border/50">
              <strong>Discount Config:</strong> Click the % badge or settings icon on any accelerator row to set their default discount (0-100%). This discount applies to all new invite codes they create.
            </p>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Ecosystems</CardDescription>
              <CardTitle className="text-3xl">{accelerators.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Ecosystems</CardDescription>
              <CardTitle className="text-3xl">
                {accelerators.filter((a) => a.is_active && a.onboarding_completed).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Onboarding</CardDescription>
              <CardTitle className="text-3xl">
                {accelerators.filter((a) => !a.onboarding_completed && !a.claim_token).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className={pendingClaimCount > 0 ? "border-amber-500/50 bg-amber-500/5" : ""}>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Pending Claim
              </CardDescription>
              <CardTitle className="text-3xl">{pendingClaimCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Accelerators Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  All Accelerator Ecosystems
                </CardTitle>
                <CardDescription>
                  Manage accelerator ecosystems and their data
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowPreCreateDialog(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Pre-Create Ecosystem
                </Button>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search accelerators..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredAccelerators.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchTerm ? "No accelerators match your search" : "No accelerators found"}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ecosystem</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Startups</TableHead>
                    <TableHead>Cohorts</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccelerators.map((acc) => (
                    <TableRow key={acc.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{acc.name}</span>
                          <span className="text-xs text-muted-foreground">{acc.slug}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{acc.ecosystem_head_email}</span>
                          {acc.pending_head_email && (
                            <span className="text-xs text-amber-600">
                              Invited: {acc.pending_head_email}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {acc.claim_token ? (
                            <Badge variant="outline" className="w-fit border-amber-500 text-amber-600 bg-amber-500/10">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending Claim
                            </Badge>
                          ) : acc.onboarding_completed ? (
                            <Badge variant="default" className="w-fit">Active</Badge>
                          ) : (
                            <Badge variant="secondary" className="w-fit">Pending</Badge>
                          )}
                          {acc.stripe_payment_id === "admin_bypass" && (
                            <Badge variant="outline" className="w-fit text-xs">Admin</Badge>
                          )}
                          {acc.stripe_payment_id === "admin_precreated" && !acc.claim_token && (
                            <Badge variant="outline" className="w-fit text-xs">Pre-created</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={acc.default_discount_percent === 100 ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => {
                            setConfigTarget(acc);
                            setConfigDiscount(acc.default_discount_percent);
                          }}
                        >
                          <Percent className="h-3 w-3 mr-1" />
                          {acc.default_discount_percent}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto py-1 px-2"
                          onClick={() => fetchLinkedCompanies(acc)}
                        >
                          <Briefcase className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>{acc.startup_count || 0}</span>
                          {acc.max_discounted_startups && (
                            <span className="text-muted-foreground">/{acc.max_discounted_startups}</span>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {acc.cohort_count}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          {acc.member_count}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(acc.created_at), "MMM d, yyyy")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Startup Join Link - always available */}
                          <Button
                            variant="outline"
                            size="sm"
                            title="Copy startup join link"
                            onClick={() => copyStartupJoinLink(acc.slug)}
                            className="gap-1"
                          >
                            {copiedCode === `join-${acc.slug}` ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Users className="h-4 w-4" />
                            )}
                            Join Link
                          </Button>
                          {acc.claim_token && (
                            <Button
                              variant="outline"
                              size="sm"
                              title="Copy claim link for ecosystem head"
                              onClick={() => copyClaimLink(acc.claim_token!)}
                              className="gap-1 text-amber-600 border-amber-500/50 hover:bg-amber-500/10"
                            >
                              {copiedCode === `claim-${acc.claim_token}` ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Link2 className="h-4 w-4" />
                              )}
                              Claim Link
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Configure discount"
                            onClick={() => {
                              setConfigTarget(acc);
                              setConfigDiscount(acc.default_discount_percent);
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/accelerator/dashboard?id=${acc.id}`, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget(acc)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => !deleting && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Accelerator Ecosystem?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This will permanently delete <strong>{deleteTarget?.name}</strong> and all associated data:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>All cohorts ({deleteTarget?.cohort_count} cohorts)</li>
                <li>All team members ({deleteTarget?.member_count} members)</li>
                <li>Linked invite codes</li>
                <li>Accelerator role from owner (if no other ecosystems)</li>
              </ul>
              <p className="text-destructive font-medium">
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Ecosystem"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Discount Configuration Dialog */}
      <Dialog open={!!configTarget} onOpenChange={() => !savingConfig && setConfigTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configure Discount</DialogTitle>
            <DialogDescription>
              Set the default discount for startups invited by {configTarget?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Default Discount Percentage</Label>
              <Select
                value={configDiscount.toString()}
                onValueChange={(v) => setConfigDiscount(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0% (No discount)</SelectItem>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="20">20%</SelectItem>
                  <SelectItem value="25">25%</SelectItem>
                  <SelectItem value="30">30%</SelectItem>
                  <SelectItem value="40">40%</SelectItem>
                  <SelectItem value="50">50%</SelectItem>
                  <SelectItem value="75">75%</SelectItem>
                  <SelectItem value="100">100% (Free)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This discount will apply to new invite codes created by this accelerator.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setConfigTarget(null)}
                disabled={savingConfig}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSaveDiscount}
                disabled={savingConfig}
              >
                {savingConfig ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pre-Create Ecosystem Dialog */}
      <Dialog open={showPreCreateDialog} onOpenChange={resetPreCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Pre-Create Ecosystem
            </DialogTitle>
            <DialogDescription>
              Create an accelerator ecosystem and generate a claim link for the ecosystem head. 
              They can sign up or sign in to claim ownership.
            </DialogDescription>
          </DialogHeader>
          
          {!generatedClaimLink ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="acc-name">Accelerator Name *</Label>
                <Input
                  id="acc-name"
                  placeholder="e.g., TechStars NYC"
                  value={preCreateName}
                  onChange={(e) => setPreCreateName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="head-email">Ecosystem Head Email (optional)</Label>
                <Input
                  id="head-email"
                  type="email"
                  placeholder="head@accelerator.com"
                  value={preCreateEmail}
                  onChange={(e) => setPreCreateEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  If provided, only this email can claim the ecosystem. Leave empty to allow anyone with the link.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pre-discount">Startup Discount (%)</Label>
                <Select
                  value={preCreateDiscount.toString()}
                  onValueChange={(value) => setPreCreateDiscount(parseInt(value))}
                >
                  <SelectTrigger id="pre-discount">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100% (Free)</SelectItem>
                    <SelectItem value="75">75%</SelectItem>
                    <SelectItem value="50">50%</SelectItem>
                    <SelectItem value="25">25%</SelectItem>
                    <SelectItem value="0">0% (Full price)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Discount applied when startups join via this accelerator's invite link.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pre-max-startups">Max Discounted Startups (optional)</Label>
                <Input
                  id="pre-max-startups"
                  type="number"
                  min="1"
                  placeholder="e.g., 20 (leave empty for unlimited)"
                  value={preCreateMaxStartups}
                  onChange={(e) => setPreCreateMaxStartups(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  After this limit, new startups must pay the full €100. Leave empty for unlimited discounts.
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={resetPreCreateDialog}
                  disabled={preCreating}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handlePreCreateEcosystem}
                  disabled={preCreating || !preCreateName.trim()}
                >
                  {preCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create & Generate Link
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <Check className="h-5 w-5" />
                  <span className="font-semibold">Ecosystem Created!</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Share these links with the ecosystem head. They can sign up or sign in to claim <strong>{preCreateName}</strong>.
                </p>
                
                {/* Claim Link for Head */}
                <div className="space-y-2 mb-4">
                  <Label className="text-xs font-medium">Claim Link (for Ecosystem Head)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={generatedClaimLink}
                      readOnly
                      className="text-sm font-mono bg-background"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedClaimLink!);
                        toast({
                          title: "Copied!",
                          description: "Claim link copied to clipboard",
                        });
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Startup Join Link */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Startup Join Link (for inviting startups)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={`${window.location.origin}/join/${preCreateName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
                      readOnly
                      className="text-sm font-mono bg-background"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const slug = preCreateName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                        navigator.clipboard.writeText(`${window.location.origin}/join/${slug}`);
                        toast({
                          title: "Copied!",
                          description: "Startup join link copied to clipboard",
                        });
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Share this with startups to invite them to the ecosystem.
                  </p>
                </div>
                
                {/* Startup Guide Link */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Startup Guide (for onboarding startups)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={`${window.location.origin}/startup-guide`}
                      readOnly
                      className="text-sm font-mono bg-background"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/startup-guide`);
                        toast({
                          title: "Copied!",
                          description: "Startup guide link copied to clipboard",
                        });
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Step-by-step guide explaining how startups use the platform.
                  </p>
                </div>
              </div>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={resetPreCreateDialog}
              >
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Companies List Dialog */}
      <Dialog open={!!companiesTarget} onOpenChange={() => setCompaniesTarget(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Startups in {companiesTarget?.name}
            </DialogTitle>
            <DialogDescription>
              {linkedCompanies.length} startup{linkedCompanies.length !== 1 ? "s" : ""} linked to this accelerator
              {companiesTarget?.max_discounted_startups && (
                <span className="ml-1">(cap: {companiesTarget.max_discounted_startups})</span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto">
            {loadingCompanies ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : linkedCompanies.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No startups linked to this accelerator yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Founder</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linkedCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {company.founder_email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {company.stage}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(company.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveCompany(company.id, company.name)}
                          disabled={removingCompanyId === company.id}
                        >
                          {removingCompanyId === company.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UserMinus className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setCompaniesTarget(null)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
