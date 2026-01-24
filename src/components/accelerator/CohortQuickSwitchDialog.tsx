/**
 * CohortQuickSwitchDialog - Popup for quickly switching between cohorts
 * 
 * Opens when clicking on "Active Cohorts" stat card
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layers, Users, ChevronRight, Loader2, Calendar, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Cohort {
  id: string;
  name: string;
  invite_id: string | null;
  start_date: string | null;
  demo_day_date: string | null;
  is_active: boolean;
  company_count: number;
}

interface CohortQuickSwitchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  acceleratorId: string | null;
  onSelectCohort: (cohort: Cohort) => void;
}

export function CohortQuickSwitchDialog({
  open,
  onOpenChange,
  acceleratorId,
  onSelectCohort,
}: CohortQuickSwitchDialogProps) {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && acceleratorId) {
      fetchCohorts();
    }
  }, [open, acceleratorId]);

  const fetchCohorts = async () => {
    if (!acceleratorId) return;
    setIsLoading(true);

    try {
      const { data: cohortData, error } = await supabase
        .from("accelerator_cohorts")
        .select("id, name, invite_id, start_date, demo_day_date, is_active")
        .eq("accelerator_id", acceleratorId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get company counts for each cohort
      const cohortsWithCounts = await Promise.all(
        (cohortData || []).map(async (cohort) => {
          let count = 0;
          if (cohort.invite_id) {
            const { count: companyCount } = await supabase
              .from("companies")
              .select("id", { count: "exact", head: true })
              .eq("accelerator_invite_id", cohort.invite_id);
            count = companyCount || 0;
          }
          return { ...cohort, company_count: count };
        })
      );

      setCohorts(cohortsWithCounts);
    } catch (error) {
      console.error("Error fetching cohorts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md border-white/[0.08]"
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
            Active Cohorts
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : cohorts.length === 0 ? (
            <div className="text-center py-12">
              <Layers className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No cohorts created yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {cohorts.map((cohort, i) => (
                <motion.button
                  key={cohort.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => {
                    onSelectCohort(cohort);
                    onOpenChange(false);
                  }}
                  className={cn(
                    "w-full p-4 rounded-xl border text-left transition-all duration-200",
                    "border-white/[0.06] bg-white/[0.02] hover:border-secondary/30 hover:bg-white/[0.04]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary/20 to-primary/10 flex items-center justify-center">
                        <Layers className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{cohort.name}</p>
                          {cohort.is_active && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-success">
                              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {cohort.company_count} startups
                          </span>
                          {cohort.demo_day_date && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-primary" />
                              Demo: {new Date(cohort.demo_day_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
