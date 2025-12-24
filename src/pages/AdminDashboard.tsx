import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { safeLower } from "@/lib/stringUtils";
import { AdminLayout } from "@/components/admin/AdminLayout";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Eye, Trash2 } from "lucide-react";
import { AdminStatsCard } from "@/components/admin/AdminStatsCard";
import { AdminRevenueCard } from "@/components/admin/AdminRevenueCard";
import { AdminFunnelCard } from "@/components/admin/AdminFunnelCard";
import { AdminCompanyQuickActions } from "@/components/admin/AdminCompanyQuickActions";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CompanyData {
  id: string;
  name: string;
  stage: string;
  founder_id: string;
  created_at: string;
  founder_email: string;
  responses_count: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [orphanedCount, setOrphanedCount] = useState(0);
  const [cleaningUp, setCleaningUp] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
    countOrphanedResponses();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data: activeQuestions } = await supabase
        .from("questionnaire_questions")
        .select("question_key")
        .eq("is_active", true);

      const activeQuestionKeys = (activeQuestions || []).map(q => q.question_key);

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

      const companiesWithCounts = await Promise.all(
        (companiesData || []).map(async (company) => {
          const { data: responses } = await supabase
            .from("memo_responses")
            .select("question_key, answer")
            .eq("company_id", company.id);

          const activeResponsesCount = (responses || []).filter(
            r => activeQuestionKeys.includes(r.question_key) && r.answer?.trim()
          ).length;

          return {
            id: company.id,
            name: company.name,
            stage: company.stage,
            founder_id: company.founder_id,
            created_at: company.created_at,
            founder_email: (company.profiles as any)?.email || "N/A",
            responses_count: activeResponsesCount,
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

  const countOrphanedResponses = async () => {
    try {
      const { data: activeQuestions } = await supabase
        .from("questionnaire_questions")
        .select("question_key")
        .eq("is_active", true);

      const activeQuestionKeys = (activeQuestions || []).map(q => q.question_key);

      const { data: allResponses } = await supabase
        .from("memo_responses")
        .select("question_key");

      const orphaned = (allResponses || []).filter(
        r => !activeQuestionKeys.includes(r.question_key)
      );

      setOrphanedCount(orphaned.length);
    } catch (error) {
      console.error("Error counting orphaned responses:", error);
    }
  };

  const cleanupOrphanedResponses = async () => {
    setCleaningUp(true);
    try {
      const { data: activeQuestions } = await supabase
        .from("questionnaire_questions")
        .select("question_key")
        .eq("is_active", true);

      const activeQuestionKeys = (activeQuestions || []).map(q => q.question_key);

      const { data: allResponses } = await supabase
        .from("memo_responses")
        .select("id, question_key");

      const orphanedIds = (allResponses || [])
        .filter(r => !activeQuestionKeys.includes(r.question_key))
        .map(r => r.id);

      if (orphanedIds.length > 0) {
        const { error } = await supabase
          .from("memo_responses")
          .delete()
          .in("id", orphanedIds);

        if (error) throw error;

        toast({
          title: "Cleanup Complete",
          description: `Deleted ${orphanedIds.length} orphaned responses`,
        });

        setOrphanedCount(0);
        fetchCompanies();
      }
    } catch (error) {
      console.error("Error cleaning up orphaned responses:", error);
      toast({
        title: "Error",
        description: "Failed to cleanup orphaned responses",
        variant: "destructive",
      });
    } finally {
      setCleaningUp(false);
    }
  };

  const handleViewDetails = (companyId: string) => {
    navigate(`/hub?viewCompanyId=${companyId}`);
  };

  const filteredCompanies = companies.filter((company) => {
    const searchLower = safeLower(searchTerm, "Admin.search");
    const matchesSearch = safeLower(company.name, "Admin.name").includes(searchLower) ||
      safeLower(company.founder_email, "Admin.email").includes(searchLower);
    const matchesStage = stageFilter === "all" || company.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Statistics Cards */}
        <AdminStatsCard />
        <AdminRevenueCard />
        <AdminFunnelCard />

        {/* Orphaned Data Cleanup */}
        {orphanedCount > 0 && (
          <ModernCard className="border-destructive/50 bg-destructive/5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Cleanup Orphaned Data
                </h2>
                <p className="text-muted-foreground">
                  {orphanedCount} responses for inactive questions found
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={cleaningUp}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {cleaningUp ? "Cleaning..." : "Cleanup"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete orphaned responses?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete {orphanedCount} responses for questions that are no longer active. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={cleanupOrphanedResponses}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </ModernCard>
        )}

        {/* Founder Submissions Section */}
        <ModernCard>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Founder Submissions
          </h2>
          <p className="text-muted-foreground">
            View and manage all founder questionnaire submissions
          </p>
        </ModernCard>

        {/* Filters */}
        <ModernCard>
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
                    <TableHead>Stage</TableHead>
                    <TableHead>Founder</TableHead>
                    <TableHead>Responses</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
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
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {company.stage}
                        </Badge>
                      </TableCell>
                      <TableCell>{company.founder_email}</TableCell>
                      <TableCell>
                        <Badge variant={company.responses_count > 0 ? "default" : "secondary"}>
                          {company.responses_count}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(company.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(company.id)}
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
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
