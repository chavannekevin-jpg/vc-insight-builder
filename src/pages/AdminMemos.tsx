import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogOut, Search, Eye, Home, ArrowLeft, FileText } from "lucide-react";
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
      // Fetch all paid companies with their memos
      const { data: companiesData, error } = await supabase
        .from("companies")
        .select(`
          id,
          name,
          stage,
          created_at,
          has_premium,
          profiles!companies_founder_id_fkey(email),
          memos(id, status, created_at)
        `)
        .eq("has_premium", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedCompanies: PaidCompanyData[] = (companiesData || []).map((company) => {
        const memos = company.memos as any[];
        const latestMemo = memos && memos.length > 0 ? memos[0] : null;
        
        return {
          id: company.id,
          name: company.name,
          stage: company.stage,
          founder_email: (company.profiles as any)?.email || "N/A",
          created_at: company.created_at,
          has_memo: memos && memos.length > 0,
          memo_status: latestMemo?.status || null,
          memo_created_at: latestMemo?.created_at || null,
        };
      });

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
                    <TableHead>Memo Status</TableHead>
                    <TableHead>Memo Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>{company.founder_email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {company.stage}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {company.has_memo ? (
                          <Badge 
                            variant={company.memo_status === "completed" ? "default" : "secondary"}
                            className={company.memo_status === "completed" ? "bg-green-500/20 text-green-500" : ""}
                          >
                            {company.memo_status || "draft"}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            No memo
                          </Badge>
                        )}
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
                    </TableRow>
                  ))}
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
