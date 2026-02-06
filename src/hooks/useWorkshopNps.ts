import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WorkshopNpsResponse {
  id: string;
  company_id: string;
  accelerator_invite_id: string | null;
  recommend_lecture: number | null;
  investor_understanding: number | null;
  strengths_weaknesses: number | null;
  actionable_confidence: number | null;
  mini_memo_usefulness: number | null;
  mentoring_usefulness: number | null;
  additional_feedback: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SaveWorkshopNpsInput {
  company_id: string;
  accelerator_invite_id?: string | null;
  recommend_lecture?: number | null;
  investor_understanding?: number | null;
  strengths_weaknesses?: number | null;
  actionable_confidence?: number | null;
  mini_memo_usefulness?: number | null;
  mentoring_usefulness?: number | null;
  additional_feedback?: string | null;
}

export function useWorkshopNpsResponse(companyId: string | null) {
  return useQuery({
    queryKey: ["workshop-nps", companyId],
    queryFn: async () => {
      if (!companyId) return null;
      
      const { data, error } = await supabase
        .from("workshop_nps_responses")
        .select("*")
        .eq("company_id", companyId)
        .maybeSingle();
      
      if (error) throw error;
      return data as WorkshopNpsResponse | null;
    },
    enabled: !!companyId,
  });
}

export function useSaveWorkshopNps() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: SaveWorkshopNpsInput) => {
      // Check if response already exists
      const { data: existing } = await supabase
        .from("workshop_nps_responses")
        .select("id")
        .eq("company_id", input.company_id)
        .maybeSingle();
      
      if (existing) {
        // Update existing response
        const { data, error } = await supabase
          .from("workshop_nps_responses")
          .update({
            ...input,
            submitted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("company_id", input.company_id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Insert new response
        const { data, error } = await supabase
          .from("workshop_nps_responses")
          .insert({
            ...input,
            submitted_at: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workshop-nps", variables.company_id] });
    },
  });
}

// Hook for accelerator managers to get aggregated NPS data
export function useAcceleratorNpsResponses(acceleratorId: string | null) {
  return useQuery({
    queryKey: ["accelerator-nps", acceleratorId],
    queryFn: async () => {
      if (!acceleratorId) return [];
      
      // Get all NPS responses for companies linked to this accelerator
      const { data, error } = await supabase
        .from("workshop_nps_responses")
        .select(`
          *,
          companies!inner (
            id,
            name,
            accelerator_invite_id,
            accelerator_invites!inner (
              linked_accelerator_id
            )
          )
        `)
        .eq("companies.accelerator_invites.linked_accelerator_id", acceleratorId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!acceleratorId,
  });
}
