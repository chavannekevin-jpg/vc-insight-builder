import { useState, useEffect } from "react";
import { Loader2, UserPlus, Search, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Company {
  id: string;
  name: string;
  category: string | null;
  stage: string;
  accelerator_invite_id: string | null;
}

interface Cohort {
  id: string;
  name: string;
  invite_id: string | null;
}

interface AddStartupToCohortDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cohort: Cohort | null;
  acceleratorId: string;
  onAdded: () => void;
}

export function AddStartupToCohortDialog({
  open,
  onOpenChange,
  cohort,
  acceleratorId,
  onAdded,
}: AddStartupToCohortDialogProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open && acceleratorId) {
      fetchAvailableCompanies();
    }
    return () => {
      setSelectedCompanyId(null);
      setSearchQuery("");
    };
  }, [open, acceleratorId]);

  const fetchAvailableCompanies = async () => {
    setIsLoading(true);
    try {
      // Get ALL companies (not just those linked to this accelerator)
      // This allows adding any startup to the ecosystem
      // Companies that already have an accelerator_invite_id for a DIFFERENT accelerator will be filtered
      const { data: invites } = await supabase
        .from("accelerator_invites")
        .select("id")
        .eq("linked_accelerator_id", acceleratorId);

      const ourInviteIds = (invites || []).map(inv => inv.id);

      // Get all companies
      const { data: allCompanies, error } = await supabase
        .from("companies")
        .select("id, name, category, stage, accelerator_invite_id, memo_content_generated")
        .order("name");

      if (error) throw error;
      
      // Filter: show companies that either:
      // 1. Have no accelerator_invite_id (unassigned)
      // 2. Already belong to THIS accelerator (for reassignment between cohorts)
      const availableCompanies = (allCompanies || []).filter(c => 
        !c.accelerator_invite_id || ourInviteIds.includes(c.accelerator_invite_id)
      );
      
      setCompanies(availableCompanies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Failed to load startups");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!selectedCompanyId || !cohort) {
      toast.error("Please select a startup");
      return;
    }

    setIsAdding(true);
    try {
      let inviteId = cohort.invite_id;

      // If cohort doesn't have an invite, create one
      if (!inviteId) {
        const { data: acc } = await supabase
          .from("accelerators")
          .select("name, slug")
          .eq("id", acceleratorId)
          .single();

        if (!acc) {
          toast.error("Accelerator not found");
          return;
        }

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

        await supabase
          .from("accelerator_cohorts")
          .update({ invite_id: inviteId })
          .eq("id", cohort.id);
      }

      // Update company's accelerator_invite_id
      const { error: updateError } = await supabase
        .from("companies")
        .update({ accelerator_invite_id: inviteId })
        .eq("id", selectedCompanyId);

      if (updateError) throw updateError;

      const selectedCompany = companies.find(c => c.id === selectedCompanyId);
      toast.success(`${selectedCompany?.name || "Startup"} added to ${cohort.name}`);
      onOpenChange(false);
      onAdded();
    } catch (error: any) {
      console.error("Error adding to cohort:", error);
      toast.error(error.message || "Failed to add to cohort");
    } finally {
      setIsAdding(false);
    }
  };

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!cohort) return null;

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
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            Add to {cohort.name}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search startups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl border-white/[0.08] bg-white/[0.04]"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
              <p>{searchQuery ? "No matching startups" : "No startups available"}</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {filteredCompanies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => setSelectedCompanyId(company.id)}
                  className={cn(
                    "w-full p-4 rounded-xl border text-left transition-all duration-200",
                    selectedCompanyId === company.id
                      ? "border-primary bg-primary/10"
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-foreground">
                          {company.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{company.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {company.category || "Uncategorized"} • {company.stage}
                        </p>
                      </div>
                    </div>
                    {selectedCompanyId === company.id && (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
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
            onClick={handleAdd}
            disabled={isAdding || !selectedCompanyId}
            style={{
              background: 'linear-gradient(135deg, hsl(280 100% 65%) 0%, hsl(330 100% 70%) 100%)',
            }}
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              "Add to Cohort"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
