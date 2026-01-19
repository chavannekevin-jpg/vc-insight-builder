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
  competition: string | null;
  financials: string | null;
  risks: string | null;
  askUse: string | null;
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
          competition: null,
          financials: null,
          risks: null,
          askUse: null,
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
        summary: getAnswer(["ai_company_summary", "company_description", "executive_summary"]),
        problem: getAnswer(["problem_validation", "problem_core", "problem_description", "problem"]),
        solution: getAnswer(["solution_core", "solution_description", "solution_validation", "solution"]),
        businessModel: getAnswer(["business_model", "revenue_model", "monetization", "business_model_description"]),
        traction: getAnswer(["traction_revenue", "traction_milestones", "traction_validation", "traction", "traction_description"]),
        market: getAnswer(["market_size", "market_tam", "market_validation", "market", "market_description"]),
        team: getAnswer(["team_background", "team_why_us", "team_validation", "team", "team_description"]),
        vision: getAnswer(["vision_outcome", "vision_exit", "vision_validation", "vision", "vision_description"]),
        competition: getAnswer(["competition", "competition_description", "competitors", "competitive_landscape"]),
        financials: getAnswer(["financials", "financial_projections", "unit_economics", "financials_description"]),
        risks: getAnswer(["risks", "risk_factors", "challenges", "risks_description"]),
        askUse: getAnswer(["ask", "ask_use", "funding_ask", "use_of_funds", "ask_description"]),
      };
    },
    enabled: !!companyId,
  });
}
