import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DealStatus = "reviewing" | "due_diligence" | "term_sheet" | "closed" | "passed";
export type DealSource = "invite" | "deck_upload" | "manual" | "data_room";

export interface DealflowItem {
  id: string;
  investor_id: string;
  company_id: string;
  status: DealStatus;
  source: DealSource;
  invited_via_code: string | null;
  notes: string | null;
  added_at: string;
  updated_at: string;
  shared_by_investor_id: string | null;
  shared_at: string | null;
  company: {
    id: string;
    name: string;
    stage: string;
    description: string | null;
    category: string | null;
    has_premium: boolean | null;
    vc_verdict_json: any;
    memo_content_generated: boolean | null;
    created_at: string;
  } | null;
  deck_company?: {
    id: string;
    investor_id: string;
    name: string;
    stage: string;
    description: string | null;
    category: string | null;
    memo_json: any;
    created_at: string;
  } | null;
  shared_by?: {
    id: string;
    full_name: string;
    organization_name: string | null;
  } | null;
}

export function useDealflow(investorId: string | null) {
  return useQuery({
    queryKey: ["dealflow", investorId],
    queryFn: async () => {
      if (!investorId) return [];

      const { data, error } = await supabase
        .from("investor_dealflow")
        .select(`
          *,
          company:companies (
            id,
            name,
            stage,
            description,
            category,
            has_premium,
            vc_verdict_json,
            memo_content_generated,
            created_at
          ),
          deck_company:investor_deck_companies!deck_company_id (
            id,
            investor_id,
            name,
            stage,
            description,
            category,
            memo_json,
            created_at
          ),
          shared_by:investor_profiles!shared_by_investor_id (
            id,
            full_name,
            organization_name
          )
        `)
        .eq("investor_id", investorId)
        .order("added_at", { ascending: false });

      if (error) throw error;
      return (data || []) as DealflowItem[];
    },
    enabled: !!investorId,
  });
}

export function useUpdateDealStatus(investorId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dealId, status }: { dealId: string; status: DealStatus }) => {
      const { error } = await supabase
        .from("investor_dealflow")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", dealId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealflow", investorId] });
    },
  });
}

export function useUpdateDealNotes(investorId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dealId, notes }: { dealId: string; notes: string }) => {
      const { error } = await supabase
        .from("investor_dealflow")
        .update({ notes, updated_at: new Date().toISOString() })
        .eq("id", dealId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealflow", investorId] });
    },
  });
}

export function useAddToDealflow(investorId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      companyId, 
      source = "manual",
      invitedViaCode 
    }: { 
      companyId: string; 
      source?: DealSource;
      invitedViaCode?: string;
    }) => {
      if (!investorId) throw new Error("No investor ID");

      const { error } = await supabase.from("investor_dealflow").insert({
        investor_id: investorId,
        company_id: companyId,
        source,
        invited_via_code: invitedViaCode || null,
        status: "reviewing",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealflow", investorId] });
    },
  });
}

export function useRemoveFromDealflow(investorId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dealId: string) => {
      const { error } = await supabase
        .from("investor_dealflow")
        .delete()
        .eq("id", dealId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealflow", investorId] });
    },
  });
}
