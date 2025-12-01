import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
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
import { LogOut, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CompanyAccess {
  id: string;
  name: string;
  stage: string;
  founder_email: string;
  has_premium: boolean;
  created_at: string;
}

const AdminUserAccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<CompanyAccess[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [premiumUsers, setPremiumUsers] = useState(0);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
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
          has_premium,
          created_at,
          profiles!companies_founder_id_fkey(email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedCompanies: CompanyAccess[] = (companiesData || []).map((company) => ({
        id: company.id,
        name: company.name,
        stage: company.stage,
        has_premium: company.has_premium || false,
        created_at: company.created_at,
        founder_email: (company.profiles as any)?.email || "N/A",
      }));

      setCompanies(formattedCompanies);
      
      // Calculate stats
      setTotalUsers(formattedCompanies.length);
      setPremiumUsers(formattedCompanies.filter(c => c.has_premium).length);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast({
        title: "Error",
        description: "Failed to load user access data",
        variant: "destructive",
      });
    }
  };

  const togglePremiumAccess = async (companyId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("companies")
        .update({ has_premium: !currentStatus })
        .eq("id", companyId);

      if (error) {
        console.error("Update error details:", error);
        throw error;
      }

      toast({
        title: "Access Updated",
        description: `Premium access ${!currentStatus ? "granted" : "revoked"}`,
      });

      // Refresh data
      fetchCompanies();
    } catch (error) {
      console.error("Error updating premium access:", error);
      toast({
        title: "Error",
        description: "Failed to update premium access",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/admin")} variant="ghost" size="sm">
              ← Back to Admin
            </Button>
            <h1 className="text-2xl font-bold text-primary">User Access Control</h1>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <ModernCard>
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">Total Users</h3>
            <p className="text-4xl font-bold text-foreground">{totalUsers}</p>
          </ModernCard>

          <ModernCard>
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">Premium Users</h3>
            <p className="text-4xl font-bold text-primary">{premiumUsers}</p>
          </ModernCard>

          <ModernCard>
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">Free Users</h3>
            <p className="text-4xl font-bold text-foreground">{totalUsers - premiumUsers}</p>
          </ModernCard>
        </div>

        {/* User Access Table */}
        <ModernCard>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-foreground">Manage Premium Access</h2>
            <p className="text-muted-foreground mt-1">
              Toggle premium access to allow users to generate memos without payment
            </p>
          </div>

          {companies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No users found</p>
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
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>{company.founder_email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{company.stage || "N/A"}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(company.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {company.has_premium && (
                            <Crown className="w-4 h-4 text-primary" />
                          )}
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
      </main>
    </div>
  );
};

export default AdminUserAccess;
