import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SectionTool {
  sectionScore?: any;
  [key: string]: any;
}

/**
 * Hook to fetch and cache VC Quick Take data for paid users.
 * Uses React Query for persistent caching across navigation.
 */
export const useVcQuickTake = (companyId: string | null, hasPaid: boolean) => {
  return useQuery({
    queryKey: ["vc-quick-take", companyId],
    queryFn: async () => {
      if (!companyId) return null;
      
      const { data: memoData } = await supabase
        .from("memos")
        .select("structured_content")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (memoData?.structured_content) {
        const content = memoData.structured_content as any;
        return content.vcQuickTake || null;
      }
      return null;
    },
    enabled: !!companyId && hasPaid,
    staleTime: 1000 * 60 * 10, // 10 minutes - longer cache for dashboard data
    gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
  });
};

/**
 * Hook to fetch and cache section tools data for the dashboard scorecard.
 * Uses React Query for persistent caching across navigation.
 */
export const useSectionTools = (
  companyId: string | null, 
  hasPaid: boolean, 
  memoHasContent: boolean
) => {
  return useQuery({
    // Standardized key: use "sectionTools" consistently (not "section-tools")
    queryKey: ["sectionTools", companyId],
    queryFn: async (): Promise<Record<string, SectionTool> | null> => {
      if (!companyId) return null;
      
      const { data: toolData } = await supabase
        .from("memo_tool_data")
        .select("section_name, tool_name, ai_generated_data, user_overrides")
        .eq("company_id", companyId);
      
      if (toolData && toolData.length > 0) {
        const tools: Record<string, SectionTool> = {};
        toolData.forEach((row: any) => {
          if (!tools[row.section_name]) {
            tools[row.section_name] = {};
          }
          const data = row.user_overrides || row.ai_generated_data;
          if (row.tool_name === 'sectionScore') {
            tools[row.section_name].sectionScore = data;
          } else {
            tools[row.section_name][row.tool_name] = data;
          }
        });
        return tools;
      }
      return null;
    },
    enabled: !!companyId && hasPaid && memoHasContent,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

/**
 * Hook to fetch and cache responses for the dashboard.
 * Uses React Query for persistent caching across navigation.
 */
export const useDashboardResponses = (companyId: string | null) => {
  return useQuery({
    queryKey: ["dashboard-responses", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from("memo_responses")
        .select("question_key, answer")
        .eq("company_id", companyId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
};
