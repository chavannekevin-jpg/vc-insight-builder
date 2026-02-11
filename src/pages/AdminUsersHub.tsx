import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Search, 
  Shield, 
  ShieldCheck, 
  Users, 
  Building2, 
  FileText,
  Eye,
  Activity,
  Clock,
  Crown,
  Loader2,
  UserCheck,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { AdminUserDetail } from "@/components/admin/AdminUserDetail";
import { AdminCompanyQuickActions } from "@/components/admin/AdminCompanyQuickActions";
import { safeLower } from "@/lib/stringUtils";

interface UserData {
  id: string;
  email: string;
  created_at: string;
  is_admin: boolean;
  companies_count: number;
  memos_count: number;
  total_paid: number;
  last_sign_in_at: string | null;
  sign_in_count: number;
  
  abandonment_24h_sent: boolean;
}

interface CompanyAccess {
  id: string;
  name: string;
  stage: string;
  founder_email: string;
  has_premium: boolean;
  created_at: string;
  has_memo: boolean;
  memo_status: string | null;
  memo_created_at: string | null;
  overallScore: number | null;
  investmentReadiness: 'NOT_READY' | 'CONDITIONAL' | 'READY' | null;
}

// Section weights for score calculation
const SECTION_WEIGHTS: Record<string, number> = {
  'Team': 0.20,
  'Traction': 0.20,
  'Market': 0.15,
  'Problem': 0.12,
  'Solution': 0.10,
  'Business Model': 0.10,
  'Competition': 0.08,
  'Vision': 0.05
};

const calculateOverallScore = (scoreData: { section_name: string; ai_generated_data: any }[]): { score: number; readiness: 'NOT_READY' | 'CONDITIONAL' | 'READY' } => {
  let weightedSum = 0;
  let totalWeight = 0;
  let criticalCount = 0;

  scoreData.forEach(row => {
    const score = row.ai_generated_data?.score || 0;
    const benchmark = row.ai_generated_data?.vcBenchmark || 50;
    const weight = SECTION_WEIGHTS[row.section_name] || 0.05;
    weightedSum += score * weight;
    totalWeight += weight;
    if (score < benchmark - 15) criticalCount++;
  });

  const overall = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  const readiness: 'NOT_READY' | 'CONDITIONAL' | 'READY' = 
    criticalCount >= 2 || overall < 50 ? 'NOT_READY' 
    : criticalCount === 1 || overall < 60 ? 'CONDITIONAL' : 'READY';

  return { score: overall, readiness };
};

const AdminUsersHub = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [companies, setCompanies] = useState<CompanyAccess[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [pendingToggle, setPendingToggle] = useState<{ userId: string; newValue: boolean } | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [impersonating, setImpersonating] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const activeTab = searchParams.get("tab") || "users";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
    
    await Promise.all([fetchUsers(), fetchCompanies()]);
  };

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, created_at, last_sign_in_at, sign_in_count")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      const adminUserIds = new Set((adminRoles || []).map(r => r.user_id));

      const { data: allCompanies } = await supabase
        .from("companies")
        .select("founder_id");

      const companiesCountMap: Record<string, number> = {};
      (allCompanies || []).forEach(c => {
        companiesCountMap[c.founder_id] = (companiesCountMap[c.founder_id] || 0) + 1;
      });

      const { data: memos } = await supabase
        .from("memos")
        .select("company_id, companies!inner(founder_id)")
        .eq("status", "generated");

      const memosCountMap: Record<string, number> = {};
      (memos || []).forEach((m: any) => {
        const founderId = m.companies?.founder_id;
        if (founderId) {
          memosCountMap[founderId] = (memosCountMap[founderId] || 0) + 1;
        }
      });

      const { data: purchases } = await supabase
        .from("memo_purchases")
        .select("user_id, amount_paid");

      const purchasesMap: Record<string, number> = {};
      (purchases || []).forEach(p => {
        purchasesMap[p.user_id] = (purchasesMap[p.user_id] || 0) + Number(p.amount_paid);
      });

      // Fetch abandonment emails sent
      const { data: sentEmails } = await supabase
        .from("sent_emails")
        .select("user_id, email_type")
        .eq("email_type", "abandonment_24h");

      const abandonmentSentSet = new Set((sentEmails || []).map(e => e.user_id));

      const usersData: UserData[] = (profiles || []).map(profile => ({
        id: profile.id,
        email: profile.email,
        created_at: profile.created_at,
        is_admin: adminUserIds.has(profile.id),
        companies_count: companiesCountMap[profile.id] || 0,
        memos_count: memosCountMap[profile.id] || 0,
        total_paid: purchasesMap[profile.id] || 0,
        last_sign_in_at: profile.last_sign_in_at,
        sign_in_count: profile.sign_in_count || 0,
        
        abandonment_24h_sent: abandonmentSentSet.has(profile.id),
      }));

      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data: companiesData, error } = await supabase
        .from("companies")
        .select(`
          id, name, stage, has_premium, created_at,
          profiles!companies_founder_id_fkey(email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedCompanies: CompanyAccess[] = await Promise.all(
        (companiesData || []).map(async (company) => {
          // Fetch memo data
          const { data: memoData } = await supabase
            .from("memos")
            .select("id, status, created_at")
            .eq("company_id", company.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          // Fetch section scores for investment readiness calculation
          const { data: scoreData } = await supabase
            .from("memo_tool_data")
            .select("section_name, ai_generated_data")
            .eq("company_id", company.id)
            .eq("tool_name", "sectionScore");

          let overallScore: number | null = null;
          let investmentReadiness: 'NOT_READY' | 'CONDITIONAL' | 'READY' | null = null;

          if (scoreData && scoreData.length > 0) {
            const result = calculateOverallScore(scoreData);
            overallScore = result.score;
            investmentReadiness = result.readiness;
          }

          return {
            id: company.id,
            name: company.name,
            stage: company.stage,
            has_premium: company.has_premium || false,
            created_at: company.created_at,
            founder_email: (company.profiles as any)?.email || "N/A",
            has_memo: !!memoData,
            memo_status: memoData?.status || null,
            memo_created_at: memoData?.created_at || null,
            overallScore,
            investmentReadiness,
          };
        })
      );

      setCompanies(formattedCompanies);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const handleToggleAdmin = (userId: string, newValue: boolean) => {
    if (userId === currentUserId && !newValue) {
      toast({
        title: "Cannot Remove Own Admin",
        description: "You cannot remove your own admin privileges",
        variant: "destructive",
      });
      return;
    }
    setPendingToggle({ userId, newValue });
  };

  const confirmToggleAdmin = async () => {
    if (!pendingToggle) return;
    const { userId, newValue } = pendingToggle;
    setToggling(userId);

    try {
      if (newValue) {
        await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
        toast({ title: "Admin Granted", description: "User now has admin privileges" });
      } else {
        await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
        toast({ title: "Admin Revoked", description: "User no longer has admin privileges" });
      }
      await fetchUsers();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update admin status", variant: "destructive" });
    } finally {
      setToggling(null);
      setPendingToggle(null);
    }
  };

  const togglePremiumAccess = async (companyId: string, currentStatus: boolean) => {
    try {
      await supabase.from("companies").update({ has_premium: !currentStatus }).eq("id", companyId);
      toast({ title: "Access Updated", description: `Premium access ${!currentStatus ? "granted" : "revoked"}` });
      fetchCompanies();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update premium access", variant: "destructive" });
    }
  };

  const handleToggleMemo = async (companyId: string, companyName: string) => {
    setGeneratingFor(companyId);
    
    try {
      toast({ title: "Starting analysis generation", description: `Generating analysis for ${companyName}...` });

      const { data, error } = await supabase.functions.invoke("admin-generate-memo", {
        body: { companyId },
      });

      if (error) throw error;

      const jobId = data?.jobId;
      if (!jobId) throw new Error("No job ID returned");

      const pollInterval = setInterval(async () => {
        const { data: jobData } = await supabase
          .from("memo_generation_jobs")
          .select("status, error_message")
          .eq("id", jobId)
          .single();

        if (jobData?.status === "completed") {
          clearInterval(pollInterval);
          setGeneratingFor(null);
          toast({ title: "Analysis generated!", description: `${companyName}'s analysis is ready` });
          fetchCompanies();
        } else if (jobData?.status === "failed") {
          clearInterval(pollInterval);
          setGeneratingFor(null);
          toast({ title: "Generation failed", description: jobData.error_message || "Unknown error", variant: "destructive" });
        }
      }, 3000);

      setTimeout(() => clearInterval(pollInterval), 300000);
    } catch (error: any) {
      setGeneratingFor(null);
      toast({ title: "Error", description: error.message || "Failed to start generation", variant: "destructive" });
    }
  };

  const handleImpersonate = async (userEmail: string, companyName: string) => {
    setImpersonating(userEmail);
    
    try {
      const { data, error } = await supabase.functions.invoke("admin-impersonate-user", {
        body: { userEmail, redirectTo: `${window.location.origin}/portal` },
      });

      if (error) throw error;

      if (data?.magicLink) {
        window.open(data.magicLink, "_blank");
        toast({ title: "Success", description: `Opened ${companyName}'s account in a new tab` });
      } else {
        throw new Error(data?.error || "No login link returned");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to generate login link", variant: "destructive" });
    } finally {
      setImpersonating(null);
    }
  };

  const filteredUsers = users.filter(user => 
    safeLower(user.email, "").includes(safeLower(searchTerm, ""))
  );

  const filteredCompanies = companies.filter((company) => 
    safeLower(company.name, "").includes(safeLower(searchTerm, "")) ||
    safeLower(company.founder_email, "").includes(safeLower(searchTerm, ""))
  );

  const premiumCompanies = filteredCompanies.filter(c => c.has_premium);

  // Stats
  const adminCount = users.filter(u => u.is_admin).length;
  const totalRevenue = users.reduce((sum, u) => sum + u.total_paid, 0);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const activeUsers = users.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > sevenDaysAgo).length;
  const premiumCount = companies.filter(c => c.has_premium).length;

  return (
    <AdminLayout title="Users Hub">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <ModernCard className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total Users</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{users.length}</p>
          </ModernCard>
          <ModernCard className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Active (7d)</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{activeUsers}</p>
          </ModernCard>
          <ModernCard className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Admins</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{adminCount}</p>
          </ModernCard>
          <ModernCard className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Premium</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{premiumCount}</p>
          </ModernCard>
          <ModernCard className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-chart-2" />
              <span className="text-xs text-muted-foreground">Revenue</span>
            </div>
            <p className="text-2xl font-bold text-foreground">${totalRevenue.toFixed(2)}</p>
          </ModernCard>
        </div>

        {/* Search */}
        <ModernCard>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by email or company name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </ModernCard>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setSearchParams({ tab: v })}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">All Users</TabsTrigger>
            <TabsTrigger value="access">Companies & Access</TabsTrigger>
            <TabsTrigger value="memos">Analyses</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <ModernCard>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Last Seen</TableHead>
                        <TableHead>Sign-ins</TableHead>
                        <TableHead>Emails</TableHead>
                        <TableHead>Companies</TableHead>
                        <TableHead>Analyses</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {user.is_admin && <Shield className="w-4 h-4 text-amber-500" />}
                              <span className="font-medium">{user.email}</span>
                              {user.id === currentUserId && <Badge variant="outline" className="text-xs">You</Badge>}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(user.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            {user.last_sign_in_at ? (
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  {formatDistanceToNow(new Date(user.last_sign_in_at), { addSuffix: true })}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">Never</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.sign_in_count > 5 ? "default" : "secondary"}>
                              {user.sign_in_count}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {/* Abandonment email */}
                              {user.total_paid > 0 ? (
                                <span title="Converted (paid)" className="text-green-500">✅</span>
                              ) : user.abandonment_24h_sent ? (
                                <span title="Abandonment email sent" className="text-blue-500">📧</span>
                              ) : (
                                <span title="Abandonment email pending" className="text-muted-foreground/40">📧</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="secondary">{user.companies_count}</Badge></TableCell>
                          <TableCell>
                            <Badge variant={user.memos_count > 0 ? "default" : "secondary"}>
                              {user.memos_count}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.total_paid > 0 ? (
                              <span className="text-green-600 font-medium">${user.total_paid.toFixed(2)}</span>
                            ) : (
                              <span className="text-muted-foreground">$0</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={user.is_admin}
                              onCheckedChange={(checked) => handleToggleAdmin(user.id, checked)}
                              disabled={toggling === user.id || (user.id === currentUserId && user.is_admin)}
                            />
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedUserId(user.id)}>
                              <Eye className="w-4 h-4 mr-1" />
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </ModernCard>
          </TabsContent>

          {/* Access Tab */}
          <TabsContent value="access">
            <ModernCard>
              <div className="mb-4">
                <h2 className="text-lg font-bold text-foreground">Manage Premium Access</h2>
                <p className="text-sm text-muted-foreground">
                  Toggle premium access to allow users to generate analyses without payment
                </p>
              </div>
              {filteredCompanies.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No companies found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Founder Email</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Premium Access</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCompanies.map((company) => (
                        <TableRow key={company.id}>
                          <TableCell 
                            className="font-medium cursor-pointer hover:text-primary hover:underline"
                            onClick={() => setSelectedCompanyId(company.id)}
                          >
                            {company.name}
                          </TableCell>
                          <TableCell>{company.founder_email}</TableCell>
                          <TableCell><Badge variant="outline">{company.stage || "N/A"}</Badge></TableCell>
                          <TableCell>{new Date(company.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {company.has_premium && <Crown className="w-4 h-4 text-primary" />}
                              <Switch
                                checked={company.has_premium}
                                onCheckedChange={() => togglePremiumAccess(company.id, company.has_premium)}
                              />
                              <span className="text-sm text-muted-foreground">
                                {company.has_premium ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </ModernCard>
          </TabsContent>

          {/* Memos Tab */}
          <TabsContent value="memos">
            <ModernCard>
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-primary" />
                <div>
                  <h2 className="text-lg font-bold text-foreground">Paid User Analyses</h2>
                  <p className="text-sm text-muted-foreground">
                    View analyses from users with premium access ({premiumCompanies.length} total)
                  </p>
                </div>
              </div>
              {premiumCompanies.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No premium companies found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Founder Email</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Has Analysis</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                        <TableHead>Sneak In</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {premiumCompanies.map((company) => {
                        const isGenerating = generatingFor === company.id;
                        const isImpersonatingThis = impersonating === company.founder_email;
                        
                        return (
                          <TableRow key={company.id}>
                            <TableCell 
                              className="font-medium cursor-pointer hover:text-primary hover:underline"
                              onClick={() => setSelectedCompanyId(company.id)}
                            >
                              {company.name}
                            </TableCell>
                            <TableCell>
                              {company.overallScore !== null ? (
                                <Badge 
                                  variant={
                                    company.investmentReadiness === 'READY' ? 'default' : 
                                    company.investmentReadiness === 'CONDITIONAL' ? 'secondary' : 'destructive'
                                  }
                                  className="text-xs font-bold"
                                >
                                  {company.overallScore}/100
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">—</span>
                              )}
                            </TableCell>
                            <TableCell>{company.founder_email}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="capitalize">{company.stage}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {isGenerating ? (
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">Generating...</span>
                                  </div>
                                ) : (
                                  <Switch
                                    checked={company.has_memo}
                                    onCheckedChange={() => {
                                      if (!company.has_memo) handleToggleMemo(company.id, company.name);
                                    }}
                                    disabled={company.has_memo || isGenerating}
                                  />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {company.memo_created_at 
                                ? new Date(company.memo_created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                : "—"
                              }
                            </TableCell>
                            <TableCell>
                              {company.has_memo ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/admin/memos/${company.id}`)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </Button>
                              ) : (
                                <span className="text-muted-foreground text-sm">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleImpersonate(company.founder_email, company.name)}
                                disabled={isImpersonatingThis || company.founder_email === "N/A"}
                                className="text-primary hover:text-primary/80"
                              >
                                {isImpersonatingThis ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <UserCheck className="w-4 h-4" />
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </ModernCard>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUserId} onOpenChange={(open) => !open && setSelectedUserId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Complete user activity and history</DialogDescription>
          </DialogHeader>
          {selectedUserId && (
            <AdminUserDetail 
              userId={selectedUserId} 
              onCompanyClick={(companyId) => {
                setSelectedUserId(null);
                setSelectedCompanyId(companyId);
              }}
              onUserDeleted={() => {
                setSelectedUserId(null);
                fetchData();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Company Quick Actions Dialog */}
      <Dialog open={!!selectedCompanyId} onOpenChange={(open) => !open && setSelectedCompanyId(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Company Quick Actions</DialogTitle>
            <DialogDescription>Manage company settings and actions</DialogDescription>
          </DialogHeader>
          {selectedCompanyId && (
            <AdminCompanyQuickActions
              companyId={selectedCompanyId}
              onClose={() => setSelectedCompanyId(null)}
              onDataChanged={() => fetchCompanies()}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!pendingToggle} onOpenChange={(open) => !open && setPendingToggle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingToggle?.newValue ? "Grant Admin Access?" : "Revoke Admin Access?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingToggle?.newValue
                ? "This user will have full admin access to manage the platform."
                : "This user will no longer have admin privileges."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleAdmin}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminUsersHub;
