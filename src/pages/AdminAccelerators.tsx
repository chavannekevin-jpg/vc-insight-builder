import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Building2, Trash2, Users, Calendar, Search, Loader2, ExternalLink } from "lucide-react";
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
  cohort_count?: number;
  member_count?: number;
  ecosystem_head_email?: string;
}

export default function AdminAccelerators() {
  const [accelerators, setAccelerators] = useState<Accelerator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Accelerator | null>(null);
  const [deleting, setDeleting] = useState(false);
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

      // Enrich with counts and head email
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

          // Get ecosystem head email
          const { data: profileData } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", acc.ecosystem_head_id)
            .single();

          return {
            ...acc,
            cohort_count: cohortCount || 0,
            member_count: memberCount || 0,
            ecosystem_head_email: profileData?.email || "Unknown",
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

  const filteredAccelerators = accelerators.filter(
    (acc) =>
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.ecosystem_head_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Accelerator Ecosystems">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                {accelerators.filter((a) => !a.onboarding_completed).length}
              </CardTitle>
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
                        <span className="text-sm">{acc.ecosystem_head_email}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {acc.onboarding_completed ? (
                            <Badge variant="default" className="w-fit">Active</Badge>
                          ) : (
                            <Badge variant="secondary" className="w-fit">Pending</Badge>
                          )}
                          {acc.stripe_payment_id === "admin_bypass" && (
                            <Badge variant="outline" className="w-fit text-xs">Admin</Badge>
                          )}
                        </div>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/accelerator/dashboard`, "_blank")}
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
    </AdminLayout>
  );
}
