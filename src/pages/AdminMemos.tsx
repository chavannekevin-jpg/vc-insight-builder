import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogOut, Search, Eye, Home, ArrowLeft, FileText, Loader2, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { safeLower } from "@/lib/stringUtils";

interface PaidCompanyData {
  id: string;
  name: string;
  stage: string;
  founder_email: string;
  created_at: string;
  has_memo: boolean;
  memo_status: string | null;
  memo_created_at: string | null;
}

const AdminMemos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [companies, setCompanies] = useState<PaidCompanyData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [impersonating, setImpersonating] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/");
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleError || !roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have admin permissions",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      fetchPaidCompanies();
    } catch (error) {
      console.error("Auth error:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchPaidCompanies = async () => {
    try {
      const { data: companiesData, error } = await supabase
        .from("companies")
        .select(`
          id,
          name,
          stage,
          created_at,
          has_premium,
          profiles!companies_founder_id_fkey(email)
        `)
        .eq("has_premium", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedCompanies: PaidCompanyData[] = await Promise.all(
        (companiesData || []).map(async (company) => {
          const { data: memoData } = await supabase
            .from("memos")
            .select("id, status, created_at")
            .eq("company_id", company.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            id: company.id,
            name: company.name,
            stage: company.stage,
            founder_email: (company.profiles as any)?.email || "N/A",
            created_at: company.created_at,
            has_memo: !!memoData,
            memo_status: memoData?.status || null,
            memo_created_at: memoData?.created_at || null,
          };
        })
      );

      setCompanies(formattedCompanies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast({
        title: "Error",
        description: "Failed to load paid companies",
        variant: "destructive",
      });
    }
  };

  const handleToggleMemo = async (companyId: string, companyName: string) => {
    setGeneratingFor(companyId);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Starting memo generation",
        description: `Generating memo for ${companyName}...`,
      });

      const { data, error } = await supabase.functions.invoke("admin-generate-memo", {
        body: { companyId },
      });

      if (error) throw error;

      const jobId = data?.jobId;
      if (!jobId) throw new Error("No job ID returned");

      // Poll for job completion
      const pollInterval = setInterval(async () => {
        const { data: jobData } = await supabase
          .from("memo_generation_jobs")
          .select("status, error_message")
          .eq("id", jobId)
          .single();

        if (jobData?.status === "completed") {
          clearInterval(pollInterval);
          setGeneratingFor(null);
          toast({
            title: "Memo generated!",
            description: `${companyName}'s memo is ready`,
          });
          fetchPaidCompanies(); // Refresh the list
        } else if (jobData?.status === "failed") {
          clearInterval(pollInterval);
          setGeneratingFor(null);
          toast({
            title: "Generation failed",
            description: jobData.error_message || "Unknown error",
            variant: "destructive",
          });
        }
      }, 3000);

      // Stop polling after 5 minutes max
      setTimeout(() => {
        clearInterval(pollInterval);
        if (generatingFor === companyId) {
          setGeneratingFor(null);
          toast({
            title: "Generation timeout",
            description: "Check the job status later",
            variant: "destructive",
          });
        }
      }, 300000);

    } catch (error: any) {
      console.error("Error triggering memo generation:", error);
      setGeneratingFor(null);
      toast({
        title: "Error",
        description: error.message || "Failed to start memo generation",
        variant: "destructive",
      });
    }
  };

  const handleImpersonate = async (userEmail: string, companyName: string) => {
    setImpersonating(userEmail);
    
    try {
      toast({
        title: "Generating login link",
        description: `Creating access for ${companyName}...`,
      });

      const { data, error } = await supabase.functions.invoke("admin-impersonate-user", {
        body: { 
          userEmail,
          redirectTo: `${window.location.origin}/portal`
        },
      });

      if (error) throw error;

      if (data?.magicLink) {
        // Open the magic link in a new tab
        window.open(data.magicLink, "_blank");
        toast({
          title: "Success",
          description: `Opened ${companyName}'s account in a new tab`,
        });
      } else {
        throw new Error(data?.error || "No login link returned");
      }
    } catch (error: any) {
      console.error("Error impersonating user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate login link",
        variant: "destructive",
      });
    } finally {
      setImpersonating(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const filteredCompanies = companies.filter((company) => {
    const searchLower = safeLower(searchTerm, "AdminMemos.search");
    return (
      safeLower(company.name, "AdminMemos.name").includes(searchLower) ||
      safeLower(company.founder_email, "AdminMemos.email").includes(searchLower)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/admin")} variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
            <h1 className="text-2xl font-bold text-primary">User Memos</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate("/portal")} variant="outline" size="sm">
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        <ModernCard>
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Paid User Memos
              </h2>
              <p className="text-muted-foreground">
                View memos from users who have purchased premium access ({companies.length} total)
              </p>
            </div>
          </div>
        </ModernCard>

        {/* Search */}
        <ModernCard className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by company name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </ModernCard>

        {/* Companies Table */}
        <ModernCard>
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No paid companies found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Founder Email</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Has Memo</TableHead>
                    <TableHead>Memo Created</TableHead>
                    <TableHead>Actions</TableHead>
                    <TableHead>Sneak In</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => {
                    const isGenerating = generatingFor === company.id;
                    const isImpersonating = impersonating === company.founder_email;
                    
                    return (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{company.founder_email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {company.stage}
                          </Badge>
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
                                  if (!company.has_memo) {
                                    handleToggleMemo(company.id, company.name);
                                  }
                                }}
                                disabled={company.has_memo || isGenerating}
                              />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {company.memo_created_at 
                            ? formatDate(company.memo_created_at) 
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
                              View Memo
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
                            disabled={isImpersonating || company.founder_email === "N/A"}
                            className="text-primary hover:text-primary/80"
                          >
                            {isImpersonating ? (
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
      </main>
    </div>
  );
};

export default AdminMemos;
