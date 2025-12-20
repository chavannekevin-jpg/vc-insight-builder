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
import { 
  ArrowLeft, 
  Search, 
  Shield, 
  ShieldCheck, 
  Users, 
  Building2, 
  FileText,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
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
import { AdminUserDetail } from "@/components/admin/AdminUserDetail";

interface UserData {
  id: string;
  email: string;
  created_at: string;
  is_admin: boolean;
  companies_count: number;
  memos_count: number;
  total_paid: number;
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [pendingToggle, setPendingToggle] = useState<{ userId: string; newValue: boolean } | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

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

      setCurrentUserId(user.id);

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

      await fetchUsers();
    } catch (error) {
      console.error("Auth error:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, created_at")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all admin roles
      const { data: adminRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      if (rolesError) throw rolesError;

      const adminUserIds = new Set((adminRoles || []).map(r => r.user_id));

      // Fetch companies counts per user
      const { data: companies, error: companiesError } = await supabase
        .from("companies")
        .select("founder_id");

      if (companiesError) throw companiesError;

      const companiesCountMap: Record<string, number> = {};
      (companies || []).forEach(c => {
        companiesCountMap[c.founder_id] = (companiesCountMap[c.founder_id] || 0) + 1;
      });

      // Fetch memos counts per company, then aggregate by founder
      const { data: memos, error: memosError } = await supabase
        .from("memos")
        .select("company_id, companies!inner(founder_id)")
        .eq("status", "generated");

      if (memosError) throw memosError;

      const memosCountMap: Record<string, number> = {};
      (memos || []).forEach((m: any) => {
        const founderId = m.companies?.founder_id;
        if (founderId) {
          memosCountMap[founderId] = (memosCountMap[founderId] || 0) + 1;
        }
      });

      // Fetch purchases per user
      const { data: purchases, error: purchasesError } = await supabase
        .from("memo_purchases")
        .select("user_id, amount_paid");

      if (purchasesError) throw purchasesError;

      const purchasesMap: Record<string, number> = {};
      (purchases || []).forEach(p => {
        purchasesMap[p.user_id] = (purchasesMap[p.user_id] || 0) + Number(p.amount_paid);
      });

      // Combine all data
      const usersData: UserData[] = (profiles || []).map(profile => ({
        id: profile.id,
        email: profile.email,
        created_at: profile.created_at,
        is_admin: adminUserIds.has(profile.id),
        companies_count: companiesCountMap[profile.id] || 0,
        memos_count: memosCountMap[profile.id] || 0,
        total_paid: purchasesMap[profile.id] || 0,
      }));

      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    }
  };

  const handleToggleAdmin = (userId: string, newValue: boolean) => {
    // Prevent self-removal
    if (userId === currentUserId && !newValue) {
      toast({
        title: "Cannot Remove Own Admin",
        description: "You cannot remove your own admin privileges",
        variant: "destructive",
      });
      return;
    }

    // Show confirmation dialog
    setPendingToggle({ userId, newValue });
  };

  const confirmToggleAdmin = async () => {
    if (!pendingToggle) return;

    const { userId, newValue } = pendingToggle;
    setToggling(userId);

    try {
      if (newValue) {
        // Grant admin role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: "admin" });

        if (error) throw error;

        toast({
          title: "Admin Granted",
          description: "User now has admin privileges",
        });
      } else {
        // Revoke admin role
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "admin");

        if (error) throw error;

        toast({
          title: "Admin Revoked",
          description: "User no longer has admin privileges",
        });
      }

      // Refresh users list
      await fetchUsers();
    } catch (error) {
      console.error("Error toggling admin:", error);
      toast({
        title: "Error",
        description: "Failed to update admin status",
        variant: "destructive",
      });
    } finally {
      setToggling(null);
      setPendingToggle(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const adminCount = users.filter(u => u.is_admin).length;
  const totalRevenue = users.reduce((sum, u) => sum + u.total_paid, 0);
  const paidUsersCount = users.filter(u => u.total_paid > 0).length;

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
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
            <h1 className="text-xl font-bold text-foreground">User Management</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ModernCard className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total Users</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{users.length}</p>
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
              <FileText className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Paid Users</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{paidUsersCount}</p>
          </ModernCard>

          <ModernCard className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-chart-2" />
              <span className="text-xs text-muted-foreground">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold text-foreground">${totalRevenue.toFixed(2)}</p>
          </ModernCard>
        </div>

        {/* Search */}
        <ModernCard>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </ModernCard>

        {/* Users Table */}
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
                    <TableHead>Companies</TableHead>
                    <TableHead>Memos</TableHead>
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
                          {user.is_admin && (
                            <Shield className="w-4 h-4 text-amber-500" />
                          )}
                          <span className="font-medium">{user.email}</span>
                          {user.id === currentUserId && (
                            <Badge variant="outline" className="text-xs">You</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(user.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{user.companies_count}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.memos_count > 0 ? "default" : "secondary"}>
                          {user.memos_count}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.total_paid > 0 ? (
                          <span className="text-green-600 font-medium">
                            ${user.total_paid.toFixed(2)}
                          </span>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUserId(user.id)}
                        >
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
      </main>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUserId} onOpenChange={(open) => !open && setSelectedUserId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete user activity and history
            </DialogDescription>
          </DialogHeader>
          {selectedUserId && <AdminUserDetail userId={selectedUserId} />}
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
            <AlertDialogAction onClick={confirmToggleAdmin}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
