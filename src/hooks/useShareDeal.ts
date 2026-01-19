import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ShareDealParams {
  fromInvestorId: string;
  toInvestorId: string;
  companyId: string;
  message?: string;
}

export function useShareDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fromInvestorId, toInvestorId, companyId, message }: ShareDealParams) => {
      // First, check if the deal already exists in target's dealflow
      const { data: existingDeal } = await supabase
        .from("investor_dealflow")
        .select("id")
        .eq("investor_id", toInvestorId)
        .eq("company_id", companyId)
        .maybeSingle();

      if (existingDeal) {
        throw new Error("This company is already in their dealflow");
      }

      // Record the share
      const { error: shareError } = await supabase.from("dealflow_shares").insert({
        from_investor_id: fromInvestorId,
        to_investor_id: toInvestorId,
        company_id: companyId,
        message: message || null,
      });

      if (shareError) {
        if (shareError.code === "23505") {
          throw new Error("You've already shared this deal with them");
        }
        throw shareError;
      }

      // Add to target investor's dealflow
      const { error: dealflowError } = await supabase.from("investor_dealflow").insert({
        investor_id: toInvestorId,
        company_id: companyId,
        source: "manual", // Using existing source type
        shared_by_investor_id: fromInvestorId,
        shared_at: new Date().toISOString(),
        status: "reviewing",
      });

      if (dealflowError) throw dealflowError;

      return { success: true };
    },
    onSuccess: () => {
      toast.success("Deal shared successfully!");
      queryClient.invalidateQueries({ queryKey: ["dealflow"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to share deal");
    },
  });
}
