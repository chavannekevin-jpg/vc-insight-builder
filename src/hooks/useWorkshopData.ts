import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface WorkshopTemplate {
  id: string;
  section_key: string;
  section_title: string;
  sort_order: number;
  guidance_text: string | null;
  prompt_question: string | null;
  benchmark_example: string | null;
  benchmark_tips: string[] | null;
  is_active: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  preseed_evidence_items: any[] | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  discovery_prompts: any[] | null;
}

export interface WorkshopResponse {
  id: string;
  company_id: string;
  section_key: string;
  answer: string | null;
  completed_at: string | null;
}

export interface WorkshopCompletion {
  id: string;
  company_id: string;
  completed_at: string | null;
  mini_memo_content: string | null;
  mapped_to_profile: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validation_report: any | null;
  regeneration_count: number;
}

export const MAX_WORKSHOP_REGENERATIONS = 5;

export interface ValidationReport {
  grade: { overall: string; label: string; description: string };
  dimensions: Array<{ name: string; score: number; label: string; feedback: string }>;
  strengths: string[];
  gaps: string[];
  nextSteps: string[];
  generatedAt: string;
}

// Fetch all active workshop templates
export const useWorkshopTemplates = () => {
  return useQuery({
    queryKey: ["workshop-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workshop_templates")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      
      if (error) throw error;
      return data as WorkshopTemplate[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Fetch all templates for admin (including inactive)
export const useAllWorkshopTemplates = () => {
  return useQuery({
    queryKey: ["workshop-templates-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workshop_templates")
        .select("*")
        .order("sort_order", { ascending: true });
      
      if (error) throw error;
      return data as WorkshopTemplate[];
    },
    staleTime: 1000 * 60 * 2,
  });
};

// Fetch workshop responses for a company
export const useWorkshopResponses = (companyId: string | undefined) => {
  return useQuery({
    queryKey: ["workshop-responses", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from("workshop_responses")
        .select("*")
        .eq("company_id", companyId);
      
      if (error) throw error;
      return data as WorkshopResponse[];
    },
    enabled: !!companyId,
    staleTime: 1000 * 60 * 1,
  });
};

// Fetch workshop completion for a company
export const useWorkshopCompletion = (companyId: string | undefined) => {
  return useQuery({
    queryKey: ["workshop-completion", companyId],
    queryFn: async () => {
      if (!companyId) return null;
      
      const { data, error } = await supabase
        .from("workshop_completions")
        .select("*")
        .eq("company_id", companyId)
        .maybeSingle();
      
      if (error) throw error;
      return data as WorkshopCompletion | null;
    },
    enabled: !!companyId,
    staleTime: 1000 * 60 * 1,
  });
};

// Save/update a workshop response
export const useSaveWorkshopResponse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      companyId, 
      sectionKey, 
      answer 
    }: { 
      companyId: string; 
      sectionKey: string; 
      answer: string;
    }) => {
      const { data, error } = await supabase
        .from("workshop_responses")
        .upsert({
          company_id: companyId,
          section_key: sectionKey,
          answer,
          completed_at: answer.trim().length > 0 ? new Date().toISOString() : null,
        }, {
          onConflict: "company_id,section_key"
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["workshop-responses", variables.companyId] 
      });
    },
    onError: (error) => {
      console.error("Failed to save workshop response:", error);
      toast({
        title: "Failed to save",
        description: "Your response couldn't be saved. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Update a workshop template (admin)
export const useUpdateWorkshopTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<WorkshopTemplate>;
    }) => {
      const { data, error } = await supabase
        .from("workshop_templates")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workshop-templates"] });
      queryClient.invalidateQueries({ queryKey: ["workshop-templates-all"] });
      toast({ title: "Template updated successfully" });
    },
    onError: (error) => {
      console.error("Failed to update template:", error);
      toast({
        title: "Failed to update template",
        variant: "destructive",
      });
    },
  });
};

// Compile workshop into mini-memo (calls edge function with AI enhancement)
export const useCompileWorkshopMemo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (companyId: string) => {
      const { data, error } = await supabase.functions.invoke("compile-workshop-memo", {
        body: { companyId },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, companyId) => {
      queryClient.invalidateQueries({ queryKey: ["workshop-completion", companyId] });
      // Also invalidate memo-responses since they're auto-mapped now
      queryClient.invalidateQueries({ queryKey: ["memo-responses", companyId] });
      queryClient.invalidateQueries({ queryKey: ["memoContent", companyId] });
      
      const message = data?.mappedToProfile 
        ? "Mini-memo compiled and synced to your profile!" 
        : "Mini-memo compiled successfully!";
      toast({ title: message });
    },
    onError: (error) => {
      console.error("Failed to compile memo:", error);
      toast({
        title: "Failed to compile memo",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Map workshop to profile (memo_responses)
export const useMapWorkshopToProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (companyId: string) => {
      // Mapping: workshop section_key -> memo_responses question_key
      const sectionMapping: Record<string, string> = {
        problem: "problem_description",
        solution: "solution_description", 
        market: "market_size",
        business_model: "revenue_model",
        gtm: "go_to_market",
        team: "team_background",
        funding_strategy: "funding_plan",
        investment_thesis: "investment_ask",
      };
      
      // Fetch workshop responses
      const { data: responses, error: fetchError } = await supabase
        .from("workshop_responses")
        .select("*")
        .eq("company_id", companyId);
      
      if (fetchError) throw fetchError;
      
      // Upsert to memo_responses
      const memoResponses = responses
        .filter(r => r.answer && sectionMapping[r.section_key])
        .map(r => ({
          company_id: companyId,
          question_key: sectionMapping[r.section_key],
          answer: r.answer,
          source: "workshop",
        }));
      
      if (memoResponses.length > 0) {
        const { error: upsertError } = await supabase
          .from("memo_responses")
          .upsert(memoResponses, { onConflict: "company_id,question_key" });
        
        if (upsertError) throw upsertError;
      }
      
      // Update workshop_completions.mapped_to_profile
      const { error: updateError } = await supabase
        .from("workshop_completions")
        .update({ mapped_to_profile: true })
        .eq("company_id", companyId);
      
      if (updateError) throw updateError;
      
      return { mapped: memoResponses.length };
    },
    onSuccess: (result, companyId) => {
      queryClient.invalidateQueries({ queryKey: ["workshop-completion", companyId] });
      queryClient.invalidateQueries({ queryKey: ["memo-responses", companyId] });
      toast({ 
        title: "Saved to profile!", 
        description: `${result.mapped} sections mapped to your company profile.` 
      });
    },
    onError: (error) => {
      console.error("Failed to map to profile:", error);
      toast({
        title: "Failed to save to profile",
        variant: "destructive",
      });
    },
  });
};
