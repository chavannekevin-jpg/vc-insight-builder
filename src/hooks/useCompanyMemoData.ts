import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CompanyMemoData {
  summary: string | null;
  problem: string | null;
  solution: string | null;
  businessModel: string | null;
  traction: string | null;
  market: string | null;
  team: string | null;
  vision: string | null;
}

export function useCompanyMemoData(companyId: string | null) {
  return useQuery({
    queryKey: ["companyMemoData", companyId],
    queryFn: async (): Promise<CompanyMemoData> => {
      if (!companyId) {
        return {
          summary: null,
          problem: null,
          solution: null,
          businessModel: null,
          traction: null,
          market: null,
          team: null,
          vision: null,
        };
      }

      const { data, error } = await supabase
        .from("memo_responses")
        .select("question_key, answer")
        .eq("company_id", companyId);

      if (error) throw error;

      const responses = data || [];
      const getAnswer = (keys: string[]): string | null => {
        for (const key of keys) {
          const response = responses.find((r) => r.question_key === key);
          if (response?.answer) return response.answer;
        }
        return null;
      };

      return {
        summary: getAnswer(["ai_company_summary", "company_description"]),
        problem: getAnswer(["problem_validation", "problem_core", "problem_description"]),
        solution: getAnswer(["solution_core", "solution_description", "solution_validation"]),
        businessModel: getAnswer(["business_model", "revenue_model", "monetization"]),
        traction: getAnswer(["traction_revenue", "traction_milestones", "traction_validation"]),
        market: getAnswer(["market_size", "market_tam", "market_validation"]),
        team: getAnswer(["team_background", "team_why_us", "team_validation"]),
        vision: getAnswer(["vision_outcome", "vision_exit", "vision_validation"]),
      };
    },
    enabled: !!companyId,
  });
}
