import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Layers, Users, Clock, ChevronRight, Loader2, Sparkles, Calendar, UserPlus
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { checkDashboardReadiness } from "@/lib/dashboardReadiness";

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
  isReady?: boolean;
}

interface CohortDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cohort: Cohort | null;
  onViewStartup: (id: string) => void;
  onAddStartup?: () => void;
}

export function CohortDetailDialog({
  open,
  onOpenChange,
  cohort,
  onViewStartup,
  onAddStartup,
}: CohortDetailDialogProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && cohort?.invite_id) {
      fetchCompanies(cohort.invite_id);
    } else if (open && cohort && !cohort.invite_id) {
      setCompanies([]);
    }
  }, [open, cohort]);

  const fetchCompanies = async (inviteId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, category, stage, public_score, memo_content_generated, created_at, accelerator_invite_id")
        .eq("accelerator_invite_id", inviteId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Check actual readiness for each company
      const companiesWithReadiness = await Promise.all(
        (data || []).map(async (company) => {
          const readiness = await checkDashboardReadiness(company.id);
          return { ...company, isReady: readiness.isReady };
        })
      );
      
      setCompanies(companiesWithReadiness);
    } catch (error) {
      console.error("Error fetching cohort companies:", error);
      toast.error("Failed to load cohort startups");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 75) return "text-success";
    if (score >= 60) return "text-primary";
    if (score >= 45) return "text-warning";
    return "text-destructive";
  };

  if (!cohort) return null;

  const readyCount = companies.filter(c => c.isReady).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-white/[0.08] max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        style={{
          background: 'linear-gradient(135deg, hsl(330 20% 12%) 0%, hsl(330 20% 8%) 100%)',
          backdropFilter: 'blur(40px)',
        }}
      >
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-primary/10 flex items-center justify-center border border-white/[0.06]">
                <Layers className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <DialogTitle className="text-xl">{cohort.name}</DialogTitle>
                <div className="flex items-center gap-3 mt-1">
                  {cohort.is_active ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-success">
                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                      Active
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Archived</span>
                  )}
                  {cohort.demo_day_date && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Demo Day: {new Date(cohort.demo_day_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-success/10 border border-success/20">
                <span className="text-sm font-medium text-success">{readyCount} Ready</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-muted/30 border border-white/[0.06]">
                <span className="text-sm font-medium text-muted-foreground">{companies.length} Total</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 -mx-6 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/[0.08] rounded-xl">
              <Users className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
              <h3 className="font-medium text-foreground mb-1">No startups yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Assign startups to this cohort to see them here
              </p>
              {onAddStartup && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddStartup}
                  className="gap-2 border-white/[0.08]"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Startup
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {companies.map((company, i) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ x: 2 }}
                  onClick={() => {
                    onOpenChange(false);
                    onViewStartup(company.id);
                  }}
                  className="group flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border border-white/[0.06] hover:border-primary/30"
                  style={{
                    background: 'linear-gradient(135deg, hsl(330 20% 14% / 0.6) 0%, hsl(330 20% 10% / 0.4) 100%)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center border border-white/[0.06]">
                      <span className="text-sm font-bold text-foreground">
                        {company.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {company.name}
                        </h4>
                        {company.isReady ? (
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
                      <p className="text-xs text-muted-foreground">
                        {company.category || "Uncategorized"} • {company.stage}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={cn("text-xl font-bold", getScoreColor(company.public_score))}>
                      {company.public_score || "—"}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {companies.length > 0 && onAddStartup && (
          <div className="flex-shrink-0 pt-4 border-t border-white/[0.06]">
            <Button
              variant="outline"
              size="sm"
              onClick={onAddStartup}
              className="w-full gap-2 border-white/[0.08]"
            >
              <UserPlus className="w-4 h-4" />
              Add Startup to Cohort
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
