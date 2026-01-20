import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type OpportunityStatus = "lead" | "contacted" | "negotiating" | "won" | "lost";
export type CurrencyCode = "USD" | "EUR" | "CHF";

export interface BusinessOpportunity {
  id: string;
  investor_id: string;
  name: string;
  description: string | null;
  company_name: string | null;
  contact_name: string | null;
  contact_email: string | null;
  value_estimate: number | null;
  currency: CurrencyCode;
  status: OpportunityStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useBusinessOpportunities(investorId: string | null) {
  return useQuery({
    queryKey: ["businessOpportunities", investorId],
    queryFn: async () => {
      if (!investorId) return [];

      const { data, error } = await supabase
        .from("business_opportunities")
        .select("*")
        .eq("investor_id", investorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as BusinessOpportunity[];
    },
    enabled: !!investorId,
  });
}

export function useCreateOpportunity(investorId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (opportunity: Omit<BusinessOpportunity, "id" | "investor_id" | "created_at" | "updated_at">) => {
      if (!investorId) throw new Error("No investor ID");

      const { data, error } = await supabase
        .from("business_opportunities")
        .insert({
          investor_id: investorId,
          ...opportunity,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Opportunity created");
      queryClient.invalidateQueries({ queryKey: ["businessOpportunities", investorId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create opportunity");
    },
  });
}

export function useUpdateOpportunity(investorId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BusinessOpportunity> & { id: string }) => {
      const { error } = await supabase
        .from("business_opportunities")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessOpportunities", investorId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update opportunity");
    },
  });
}

export function useDeleteOpportunity(investorId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("business_opportunities")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Opportunity deleted");
      queryClient.invalidateQueries({ queryKey: ["businessOpportunities", investorId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete opportunity");
    },
  });
}
