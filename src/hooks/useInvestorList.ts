import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface InvestorListItem {
  id: string;
  full_name: string;
  organization_name: string | null;
  city: string;
  investor_type: string;
}

export function useInvestorList(excludeId?: string | null) {
  return useQuery({
    queryKey: ["investorList", excludeId],
    queryFn: async (): Promise<InvestorListItem[]> => {
      const { data, error } = await supabase
        .from("investor_profiles")
        .select("id, full_name, organization_name, city, investor_type")
        .eq("onboarding_completed", true)
        .order("full_name");

      if (error) throw error;

      // Filter out the current investor
      return (data || []).filter((inv) => inv.id !== excludeId);
    },
    enabled: true,
  });
}
