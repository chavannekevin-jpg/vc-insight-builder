import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogOut, Search, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CompanyData {
  id: string;
  name: string;
  stage: string;
  founder_id: string;
  created_at: string;
  founder_email: string;
  responses_count: number;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");

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

      setUser(user);

      // Check if user has admin role
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
      fetchCompanies();
    } catch (error) {
      console.error("Auth error:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data: companiesData, error } = await supabase
        .from("companies")
        .select(`
          id,
          name,
          stage,
          founder_id,
          created_at,
          profiles!companies_founder_id_fkey(email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get response counts for each company
      const companiesWithCounts = await Promise.all(
        (companiesData || []).map(async (company) => {
          const { count } = await supabase
            .from("memo_responses")
            .select("*", { count: "exact", head: true })
            .eq("company_id", company.id);

          return {
            id: company.id,
            name: company.name,
            stage: company.stage,
            founder_id: company.founder_id,
            created_at: company.created_at,
            founder_email: (company.profiles as any)?.email || "N/A",
            responses_count: count || 0,
          };
        })
      );

      setCompanies(companiesWithCounts);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast({
        title: "Error",
        description: "Failed to load companies data",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleViewDetails = (companyId: string) => {
    navigate(`/hub?viewCompanyId=${companyId}`);
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.founder_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === "all" || company.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

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
          <h1 className="text-2xl font-bold text-primary">UglyBaby Admin</h1>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div onClick={() => navigate("/admin/sections")} className="cursor-pointer">
            <ModernCard className="hover:border-primary/50 transition-colors h-full">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Manage Sections
              </h2>
              <p className="text-muted-foreground">
                Add and edit questionnaire sections
              </p>
            </ModernCard>
          </div>

          <div onClick={() => navigate("/admin/questions")} className="cursor-pointer">
            <ModernCard className="hover:border-primary/50 transition-colors h-full">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Manage Questions
              </h2>
              <p className="text-muted-foreground">
                Add and edit questions for each section
              </p>
            </ModernCard>
          </div>

          <div onClick={() => navigate("/admin/prompts")} className="cursor-pointer">
            <ModernCard className="hover:border-primary/50 transition-colors h-full">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Manage Prompts
              </h2>
              <p className="text-muted-foreground">
                Edit AI prompts for memo sections
              </p>
            </ModernCard>
          </div>

          <div onClick={() => navigate("/admin/articles")} className="cursor-pointer">
            <ModernCard className="hover:border-primary/50 transition-colors h-full">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Educational Content
              </h2>
              <p className="text-muted-foreground">
                Manage articles and guides
              </p>
            </ModernCard>
          </div>

          <div onClick={() => navigate("/admin/memo-builder")} className="cursor-pointer">
            <ModernCard className="hover:border-primary/50 transition-colors h-full">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Memo Builder
              </h2>
              <p className="text-muted-foreground">
                Generate professional memos from submissions
              </p>
            </ModernCard>
          </div>

          <div onClick={() => navigate("/admin/user-access")} className="cursor-pointer">
            <ModernCard className="hover:border-primary/50 transition-colors h-full">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                User Access
              </h2>
              <p className="text-muted-foreground">
                Manage premium access for memo generation
              </p>
            </ModernCard>
          </div>

          <div onClick={() => navigate("/admin/discount-codes")} className="cursor-pointer">
            <ModernCard className="hover:border-primary/50 transition-colors h-full">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Discount Codes
              </h2>
              <p className="text-muted-foreground">
                Create and manage discount codes for memo purchases
              </p>
            </ModernCard>
          </div>
          
          <ModernCard>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Founder Submissions
            </h2>
            <p className="text-muted-foreground">
              View questionnaire submissions below
            </p>
          </ModernCard>
        </div>

        <ModernCard className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Founder Submissions
          </h2>
          <p className="text-muted-foreground">
            View and manage all founder questionnaire submissions
          </p>
        </ModernCard>

        {/* Filters */}
        <ModernCard className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by company name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="idea">Idea Stage</SelectItem>
                <SelectItem value="mvp">MVP</SelectItem>
                <SelectItem value="early-revenue">Early Revenue</SelectItem>
                <SelectItem value="growth">Growth Stage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </ModernCard>

        {/* Companies Table */}
        <ModernCard>
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No submissions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Founder Email</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Responses</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>{company.founder_email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{company.stage}</Badge>
                      </TableCell>
                      <TableCell>{company.responses_count}</TableCell>
                      <TableCell>
                        {new Date(company.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleViewDetails(company.id)}
                          size="sm"
                          variant="ghost"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
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

export default Admin;
