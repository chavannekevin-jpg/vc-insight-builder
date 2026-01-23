import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, Layers, Calendar, Users, ArrowRight, 
  MoreHorizontal, Edit2, Trash2, ExternalLink 
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

interface Cohort {
  id: string;
  name: string;
  invite_id: string | null;
  start_date: string | null;
  end_date: string | null;
  demo_day_date: string | null;
  is_active: boolean;
  company_count?: number;
}

interface AcceleratorCohortsProps {
  cohorts: Cohort[];
  acceleratorId: string;
  onRefresh: () => void;
}

export function AcceleratorCohorts({ cohorts, acceleratorId, onRefresh }: AcceleratorCohortsProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCohort, setNewCohort] = useState({
    name: "",
    startDate: "",
    endDate: "",
    demoDayDate: "",
  });

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cohorts</h1>
          <p className="text-muted-foreground">Manage your program batches and cohorts</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Cohort
        </Button>
      </div>

      {cohorts.length === 0 ? (
        <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-12 text-center">
          <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No cohorts yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first cohort to start organizing your startups.
          </p>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create First Cohort
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cohorts.map((cohort, i) => (
            <motion.div
              key={cohort.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-5 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{cohort.name}</h3>
                    {cohort.is_active ? (
                      <span className="text-xs text-success">Active</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Archived</span>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleToggleActive(cohort.id, cohort.is_active)}>
                      {cohort.is_active ? "Archive" : "Activate"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2 text-sm">
                {cohort.start_date && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Starts {new Date(cohort.start_date).toLocaleDateString()}</span>
                  </div>
                )}
                {cohort.demo_day_date && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ArrowRight className="w-4 h-4" />
                    <span>Demo Day {new Date(cohort.demo_day_date).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{cohort.company_count || 0} startups</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Cohort Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Cohort</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cohortName">Cohort Name</Label>
              <Input
                id="cohortName"
                placeholder="e.g., Winter 2024 Batch"
                value={newCohort.name}
                onChange={(e) => setNewCohort(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newCohort.startDate}
                  onChange={(e) => setNewCohort(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newCohort.endDate}
                  onChange={(e) => setNewCohort(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="demoDayDate">Demo Day Date</Label>
              <Input
                id="demoDayDate"
                type="date"
                value={newCohort.demoDayDate}
                onChange={(e) => setNewCohort(prev => ({ ...prev, demoDayDate: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCohort} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Cohort"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
