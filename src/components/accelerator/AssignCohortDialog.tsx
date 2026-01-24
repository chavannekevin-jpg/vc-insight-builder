import { useState, useEffect } from "react";
import { Layers, Loader2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Cohort {
  id: string;
  name: string;
  invite_id: string | null;
  is_active: boolean;
}

interface AssignCohortDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyName: string;
  acceleratorId: string;
  currentCohortName?: string | null;
  onAssigned: () => void;
}

export function AssignCohortDialog({
  open,
  onOpenChange,
  companyId,
  companyName,
  acceleratorId,
  currentCohortName,
  onAssigned,
}: AssignCohortDialogProps) {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);

  useEffect(() => {
    if (open && acceleratorId) {
      fetchCohorts();
    }
  }, [open, acceleratorId]);

  const fetchCohorts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("accelerator_cohorts")
        .select("id, name, invite_id, is_active")
        .eq("accelerator_id", acceleratorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCohorts(data || []);
    } catch (error) {
      console.error("Error fetching cohorts:", error);
      toast.error("Failed to load cohorts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedCohortId) {
      toast.error("Please select a cohort");
      return;
    }

    setIsAssigning(true);
    try {
      // Find the cohort's invite_id
      const cohort = cohorts.find(c => c.id === selectedCohortId);
      
      if (!cohort) {
        toast.error("Cohort not found");
        return;
      }

      let inviteId = cohort.invite_id;

      // If cohort doesn't have an invite_id, create one
      if (!inviteId) {
        // First get the accelerator details
        const { data: acc } = await supabase
          .from("accelerators")
          .select("name, slug")
          .eq("id", acceleratorId)
          .single();

        if (!acc) {
          toast.error("Accelerator not found");
          return;
        }

        // Create a new invite for this cohort
        const { data: newInvite, error: inviteError } = await supabase
          .from("accelerator_invites")
          .insert({
            accelerator_name: acc.name,
            accelerator_slug: acc.slug,
            code: `${acc.slug.toUpperCase()}-${cohort.name.replace(/\s+/g, '').toUpperCase().slice(0, 6)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
            linked_accelerator_id: acceleratorId,
            cohort_name: cohort.name,
            discount_percent: 0,
            is_active: true,
          })
          .select("id")
          .single();

        if (inviteError) throw inviteError;
        inviteId = newInvite.id;

        // Update the cohort with the new invite_id
        await supabase
          .from("accelerator_cohorts")
          .update({ invite_id: inviteId })
          .eq("id", selectedCohortId);
      }

      // Update the company's accelerator_invite_id to the cohort's invite
      const { error: updateError } = await supabase
        .from("companies")
        .update({ accelerator_invite_id: inviteId })
        .eq("id", companyId);

      if (updateError) throw updateError;

      toast.success(`${companyName} assigned to ${cohort.name}`);
      onOpenChange(false);
      onAssigned();
    } catch (error: any) {
      console.error("Error assigning to cohort:", error);
      toast.error(error.message || "Failed to assign to cohort");
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-white/[0.08] max-w-md"
        style={{
          background: 'linear-gradient(135deg, hsl(330 20% 12%) 0%, hsl(330 20% 8%) 100%)',
          backdropFilter: 'blur(40px)',
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-secondary" />
            </div>
            Assign to Cohort
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Assign <span className="font-semibold text-foreground">{companyName}</span> to a cohort
            {currentCohortName && (
              <span className="block mt-1">
                Currently in: <span className="text-primary">{currentCohortName}</span>
              </span>
            )}
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : cohorts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Layers className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
              <p>No cohorts created yet</p>
              <p className="text-sm mt-1">Create a cohort first from the Cohorts section</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {cohorts.map((cohort) => (
                <button
                  key={cohort.id}
                  onClick={() => setSelectedCohortId(cohort.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all duration-200 ${
                    selectedCohortId === cohort.id
                      ? "border-secondary bg-secondary/10"
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                        <Layers className="w-4 h-4 text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{cohort.name}</p>
                        {cohort.is_active ? (
                          <span className="text-xs text-success">Active</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Archived</span>
                        )}
                      </div>
                    </div>
                    {selectedCohortId === cohort.id && (
                      <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/[0.08]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={isAssigning || !selectedCohortId || cohorts.length === 0}
            style={{
              background: 'linear-gradient(135deg, hsl(280 100% 65%) 0%, hsl(330 100% 70%) 100%)',
            }}
          >
            {isAssigning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              "Assign to Cohort"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
