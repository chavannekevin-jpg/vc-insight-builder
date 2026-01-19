import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DealShare {
  id: string;
  to_investor_id: string;
  message: string | null;
  created_at: string;
  to_investor: {
    id: string;
    full_name: string;
    organization_name: string | null;
  } | null;
}

export function useDealShares(companyId: string | null, fromInvestorId: string | null) {
  return useQuery({
    queryKey: ["dealShares", companyId, fromInvestorId],
    queryFn: async (): Promise<DealShare[]> => {
      if (!companyId || !fromInvestorId) return [];

      const { data, error } = await supabase
        .from("dealflow_shares")
        .select(`
          id,
          to_investor_id,
          message,
          created_at,
          to_investor:investor_profiles!to_investor_id (
            id,
            full_name,
            organization_name
          )
        `)
        .eq("company_id", companyId)
        .eq("from_investor_id", fromInvestorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as DealShare[];
    },
    enabled: !!companyId && !!fromInvestorId,
  });
}
