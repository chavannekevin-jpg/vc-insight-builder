import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus, Layers, Calendar, Users, ChevronRight, Sparkles,
  MoreHorizontal
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
import { CohortDetailDialog } from "@/components/accelerator/CohortDetailDialog";
import { AddStartupToCohortDialog } from "@/components/accelerator/AddStartupToCohortDialog";

interface Cohort {
  id: string;
  name: string;
  invite_id: string | null;
  start_date: string | null;
  end_date: string | null;
  demo_day_date: string | null;
  is_active: boolean;
}

interface AcceleratorCohortsViewProps {
  cohorts: Cohort[];
  acceleratorId: string;
  onRefresh: () => void;
  onViewStartup: (id: string) => void;
  isDemo?: boolean;
}

export function AcceleratorCohortsView({
  cohorts,
  acceleratorId,
  onRefresh,
  onViewStartup,
  isDemo = false,
}: AcceleratorCohortsViewProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null);
  const [cohortDetailOpen, setCohortDetailOpen] = useState(false);
  const [addStartupOpen, setAddStartupOpen] = useState(false);
  const [newCohort, setNewCohort] = useState({
    name: "",
    startDate: "",
    endDate: "",
    demoDayDate: "",
  });

  const handleCreateCohort = async () => {
    if (isDemo) {
      toast.info("This is a demo - creating cohorts is disabled");
      return;
    }
    
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
    if (isDemo) {
      toast.info("This is a demo - modifying cohorts is disabled");
      return;
    }
    
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

  const handleCohortClick = (cohort: Cohort) => {
    setSelectedCohort(cohort);
    setCohortDetailOpen(true);
  };

  const handleAddStartupFromDetail = () => {
    setCohortDetailOpen(false);
    setAddStartupOpen(true);
  };

  const handleStartupAdded = () => {
    setAddStartupOpen(false);
    // Reopen the cohort detail to show updated list
    setCohortDetailOpen(true);
    onRefresh();
  };

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
              onClick={() => handleCohortClick(cohort)}
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

      {/* Cohort Detail Dialog */}
      <CohortDetailDialog
        open={cohortDetailOpen}
        onOpenChange={setCohortDetailOpen}
        cohort={selectedCohort}
        onViewStartup={onViewStartup}
        onAddStartup={handleAddStartupFromDetail}
      />

      {/* Add Startup to Cohort Dialog */}
      <AddStartupToCohortDialog
        open={addStartupOpen}
        onOpenChange={setAddStartupOpen}
        cohort={selectedCohort}
        acceleratorId={acceleratorId}
        onAdded={handleStartupAdded}
      />

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
