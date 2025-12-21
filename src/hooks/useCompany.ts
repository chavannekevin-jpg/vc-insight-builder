import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { safeLower } from "@/lib/stringUtils";

interface Company {
  id: string;
  name: string;
  stage: string;
  description?: string;
  category?: string;
  has_premium?: boolean;
  deck_url?: string;
  founder_id: string;
  generations_available?: number;
  generations_used?: number;
}

interface CompanyData {
  company: Company | null;
  hasMemo: boolean;
  memoHasContent: boolean;
  hasPaid: boolean;
  completedQuestions: number;
  totalQuestions: number;
  generationsAvailable: number;
  generationsUsed: number;
  isLoading: boolean;
}

export const useCompany = (userId: string | undefined): CompanyData => {
  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ["company", userId],
    queryFn: async () => {
      if (!userId) throw new Error("No user ID provided");
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("founder_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as Company | null;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    retry: 2,
    retryDelay: 1000,
  });

  const { data: memoData, isLoading: memoLoading } = useQuery({
    queryKey: ["memo", company?.id],
    queryFn: async () => {
      if (!company?.id) return { hasMemo: false, memoHasContent: false };
      const { data: memo } = await supabase
        .from("memos")
        .select("id, structured_content")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return {
        hasMemo: !!memo,
        memoHasContent: !!(memo?.structured_content),
      };
    },
    enabled: !!company?.id,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 15,
  });

  const { data: paymentData, isLoading: paymentLoading } = useQuery({
    queryKey: ["payment", company?.id],
    queryFn: async () => {
      if (!company?.id) return false;
      const { data } = await supabase
        .from("memo_purchases")
        .select("id")
        .eq("company_id", company.id)
        .limit(1)
        .maybeSingle();
      return !!data;
    },
    enabled: !!company?.id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  const { data: questionData, isLoading: questionsLoading } = useQuery({
    queryKey: ["questions-progress", company?.id],
    queryFn: async () => {
      if (!company?.id) return { completed: 0, total: 0 };
      
      const [responsesResult, questionsResult] = await Promise.all([
        supabase
          .from("memo_responses")
          .select("question_key, answer")
          .eq("company_id", company.id)
          .not("answer", "is", null),
        supabase
          .from("questionnaire_questions")
          .select("question_key")
          .eq("is_active", true),
      ]);
      
      const activeKeys = new Set(questionsResult.data?.map(q => q.question_key) ?? []);
      
      // Only count responses that:
      // 1. Match an active question key
      // 2. Have substantial content (not placeholder text)
      const validResponses = (responsesResult.data ?? []).filter(r => {
        if (!activeKeys.has(r.question_key)) return false;
        const answer = r.answer?.trim() ?? '';
        if (answer.length < 50) return false;
        // Filter out placeholder answers
        if (safeLower(answer, "useCompany.answer").startsWith('not specified yet')) return false;
        return true;
      });
      
      return {
        completed: validResponses.length,
        total: questionsResult.data?.length ?? 0,
      };
    },
    enabled: !!company?.id,
    staleTime: 1000 * 60 * 1, // 1 minute
    gcTime: 1000 * 60 * 10,
  });

  return {
    company,
    hasMemo: memoData?.hasMemo ?? false,
    memoHasContent: memoData?.memoHasContent ?? false,
    hasPaid: paymentData ?? false,
    completedQuestions: questionData?.completed ?? 0,
    totalQuestions: questionData?.total ?? 0,
    generationsAvailable: company?.generations_available ?? 0,
    generationsUsed: company?.generations_used ?? 0,
    isLoading: companyLoading || memoLoading || paymentLoading || questionsLoading,
  };
};
