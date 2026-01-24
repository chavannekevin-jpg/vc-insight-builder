import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus, Layers, Calendar, Users, ChevronRight, Sparkles,
  MoreHorizontal, CheckCircle2, Clock, ArrowLeft, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Cohort {
  id: string;
  name: string;
  invite_id: string | null;
  start_date: string | null;
  end_date: string | null;
  demo_day_date: string | null;
  is_active: boolean;
}

interface Company {
  id: string;
  name: string;
  category: string | null;
  stage: string;
  public_score: number | null;
  memo_content_generated: boolean;
  created_at: string;
  accelerator_invite_id: string | null;
}

interface AcceleratorCohortsViewProps {
  cohorts: Cohort[];
  acceleratorId: string;
  onRefresh: () => void;
  onViewStartup: (id: string) => void;
}

export function AcceleratorCohortsView({
  cohorts,
  acceleratorId,
  onRefresh,
  onViewStartup,
}: AcceleratorCohortsViewProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null);
  const [cohortCompanies, setCohortCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [newCohort, setNewCohort] = useState({
    name: "",
    startDate: "",
    endDate: "",
    demoDayDate: "",
  });

  // Fetch companies when a cohort is selected
  useEffect(() => {
    if (selectedCohort?.invite_id) {
      fetchCohortCompanies(selectedCohort.invite_id);
    }
  }, [selectedCohort]);

  const fetchCohortCompanies = async (inviteId: string) => {
    setLoadingCompanies(true);
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, category, stage, public_score, memo_content_generated, created_at, accelerator_invite_id")
        .eq("accelerator_invite_id", inviteId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCohortCompanies(data || []);
    } catch (error) {
      console.error("Error fetching cohort companies:", error);
      toast.error("Failed to load cohort startups");
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleCreateCohort = async () => {
    if (!newCohort.name.trim()) {
      toast.error("Please enter a cohort name");
      return;
    }

    setIsCreating(true);
    try {
      const { error } = await supabase
        .from("accelerator_cohorts")
        .insert({
          accelerator_id: acceleratorId,
          name: newCohort.name.trim(),
          start_date: newCohort.startDate || null,
          end_date: newCohort.endDate || null,
          demo_day_date: newCohort.demoDayDate || null,
          is_active: true,
        });

      if (error) throw error;

      toast.success("Cohort created successfully");
      setIsCreateOpen(false);
      setNewCohort({ name: "", startDate: "", endDate: "", demoDayDate: "" });
      onRefresh();
    } catch (error: any) {
      console.error("Create cohort error:", error);
      toast.error(error.message || "Failed to create cohort");
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleActive = async (cohortId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("accelerator_cohorts")
        .update({ is_active: !currentStatus })
        .eq("id", cohortId);

      if (error) throw error;
      toast.success(currentStatus ? "Cohort archived" : "Cohort activated");
      onRefresh();
    } catch (error: any) {
      toast.error("Failed to update cohort");
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 75) return "text-success";
    if (score >= 60) return "text-primary";
    if (score >= 45) return "text-warning";
    return "text-destructive";
  };

  // Detail view for a selected cohort
  if (selectedCohort) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        {/* Back button and header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-6"
          style={{
            background: 'linear-gradient(135deg, hsl(330 20% 12% / 0.9) 0%, hsl(330 20% 8% / 0.8) 100%)',
            backdropFilter: 'blur(40px)',
          }}
        >
          <div className="absolute inset-0 rounded-2xl border border-white/[0.06]" />
          <div className="relative z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedCohort(null);
                setCohortCompanies([]);
              }}
              className="mb-4 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              All Cohorts
            </Button>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/10 flex items-center justify-center border border-white/[0.06]">
                  <Layers className="w-7 h-7 text-secondary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{selectedCohort.name}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    {selectedCohort.is_active ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-success">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        Active
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Archived</span>
                    )}
                    {selectedCohort.demo_day_date && (
                      <span className="text-xs text-muted-foreground">
                        Demo Day: {new Date(selectedCohort.demo_day_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-success/10 border border-success/20">
                  <span className="text-sm font-medium text-success">
                    {cohortCompanies.filter(c => c.memo_content_generated).length} Ready
                  </span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-muted/30 border border-white/[0.06]">
                  <span className="text-sm font-medium text-muted-foreground">
                    {cohortCompanies.length} Total
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Companies list */}
        {loadingCompanies ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : cohortCompanies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-12 text-center border border-white/[0.06]"
            style={{
              background: 'linear-gradient(135deg, hsl(330 20% 12% / 0.6) 0%, hsl(330 20% 8% / 0.4) 100%)',
            }}
          >
            <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-semibold text-lg text-foreground mb-2">No startups in this cohort</h3>
            <p className="text-muted-foreground">
              Assign startups to this cohort from the Portfolio section
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {cohortCompanies.map((company, i) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.03 }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                onClick={() => onViewStartup(company.id)}
                className="group relative rounded-2xl p-5 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, hsl(330 20% 12% / 0.6) 0%, hsl(330 20% 8% / 0.4) 100%)',
                }}
              >
                <div className="absolute inset-0 rounded-2xl border border-white/[0.06] group-hover:border-primary/30 transition-colors" />
                
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center border border-white/[0.06]">
                      <span className="text-lg font-bold text-foreground">
                        {company.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {company.name}
                        </h3>
                        {company.memo_content_generated ? (
                          <span className="px-2 py-0.5 rounded-full bg-success/15 text-success text-xs font-medium">
                            Ready
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-muted/30 text-muted-foreground text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {company.category || "Uncategorized"} • {company.stage}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className={cn("text-2xl font-bold", getScoreColor(company.public_score))}>
                      {company.public_score || "—"}
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Main cohorts grid view
  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 md:p-8"
        style={{
          background: 'linear-gradient(135deg, hsl(330 20% 12% / 0.9) 0%, hsl(330 20% 8% / 0.8) 100%)',
          backdropFilter: 'blur(40px)',
        }}
      >
        <div className="absolute inset-0 rounded-2xl border border-white/[0.06]" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-secondary/15 via-primary/10 to-transparent rounded-full blur-3xl opacity-50" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 mb-3">
              <Layers className="w-3.5 h-3.5 text-secondary" />
              <span className="text-xs font-medium text-secondary">Cohorts</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Program Batches</h1>
            <p className="text-muted-foreground mt-1">Manage your cohorts and view startups by batch</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, hsl(330 100% 65%) 0%, hsl(280 100% 70%) 100%)',
              boxShadow: '0 0 20px hsl(330 100% 65% / 0.3)',
            }}
          >
            <Plus className="w-4 h-4" />
            New Cohort
          </motion.button>
        </div>
      </motion.div>

      {cohorts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-12 text-center border border-white/[0.06]"
          style={{
            background: 'linear-gradient(135deg, hsl(330 20% 12% / 0.6) 0%, hsl(330 20% 8% / 0.4) 100%)',
          }}
        >
          <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8 text-secondary" />
          </div>
          <h3 className="font-semibold text-lg text-foreground mb-2">No cohorts yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first cohort to start organizing your startups by batch.
          </p>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="gap-2"
            style={{
              background: 'linear-gradient(135deg, hsl(330 100% 65%) 0%, hsl(280 100% 70%) 100%)',
            }}
          >
            <Plus className="w-4 h-4" />
            Create First Cohort
          </Button>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cohorts.map((cohort, i) => (
            <motion.div
              key={cohort.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.05 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              onClick={() => setSelectedCohort(cohort)}
              className="group relative rounded-2xl p-5 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, hsl(330 20% 12% / 0.6) 0%, hsl(330 20% 8% / 0.4) 100%)',
              }}
            >
              {/* Border */}
              <div className="absolute inset-0 rounded-2xl border border-white/[0.06] group-hover:border-secondary/30 transition-colors" />

              {/* Glow effect */}
              {cohort.is_active && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-secondary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              )}

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-primary/10 flex items-center justify-center border border-white/[0.06]">
                      <Layers className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-secondary transition-colors">
                        {cohort.name}
                      </h3>
                      {cohort.is_active ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-success">
                          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Archived</span>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="border-white/[0.08]"
                      style={{
                        background: 'linear-gradient(135deg, hsl(330 20% 14%) 0%, hsl(330 20% 10%) 100%)',
                      }}
                    >
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(cohort.id, cohort.is_active);
                        }}
                        className="cursor-pointer"
                      >
                        {cohort.is_active ? "Archive" : "Activate"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2.5">
                  {cohort.start_date && (
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 text-muted-foreground/60" />
                      <span>Starts {new Date(cohort.start_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {cohort.demo_day_date && (
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Sparkles className="w-4 h-4 text-primary/60" />
                      <span>Demo Day {new Date(cohort.demo_day_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Users className="w-4 h-4 text-muted-foreground/60" />
                    <span>Click to view startups</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">View cohort details</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-secondary transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Cohort Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent
          className="border-white/[0.08]"
          style={{
            background: 'linear-gradient(135deg, hsl(330 20% 12%) 0%, hsl(330 20% 8%) 100%)',
            backdropFilter: 'blur(40px)',
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl">Create New Cohort</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="cohortName">Cohort Name</Label>
              <Input
                id="cohortName"
                placeholder="e.g., Winter 2024 Batch"
                value={newCohort.name}
                onChange={(e) => setNewCohort((prev) => ({ ...prev, name: e.target.value }))}
                className="h-11 rounded-xl border-white/[0.08] bg-white/[0.04]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newCohort.startDate}
                  onChange={(e) => setNewCohort((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="h-11 rounded-xl border-white/[0.08] bg-white/[0.04]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newCohort.endDate}
                  onChange={(e) => setNewCohort((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="h-11 rounded-xl border-white/[0.08] bg-white/[0.04]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="demoDayDate">Demo Day Date</Label>
              <Input
                id="demoDayDate"
                type="date"
                value={newCohort.demoDayDate}
                onChange={(e) => setNewCohort((prev) => ({ ...prev, demoDayDate: e.target.value }))}
                className="h-11 rounded-xl border-white/[0.08] bg-white/[0.04]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="border-white/[0.08]">
              Cancel
            </Button>
            <Button
              onClick={handleCreateCohort}
              disabled={isCreating}
              style={{
                background: 'linear-gradient(135deg, hsl(330 100% 65%) 0%, hsl(280 100% 70%) 100%)',
              }}
            >
              {isCreating ? "Creating..." : "Create Cohort"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
