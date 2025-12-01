import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useWaitlistMode = () => {
  return useQuery({
    queryKey: ['waitlist-mode'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('waitlist_settings')
        .select('is_active')
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching waitlist mode:', error);
        return { isActive: true }; // Default to active for safety
      }
      
      return { isActive: data?.is_active ?? true };
    },
  });
};

export const useUserWaitlistStatus = (userId?: string, companyId?: string) => {
  return useQuery({
    queryKey: ['user-waitlist-status', userId, companyId],
    queryFn: async () => {
      if (!userId || !companyId) return null;

      const { data, error } = await supabase
        .from('waitlist_signups')
        .select('*')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching waitlist status:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!userId && !!companyId,
  });
};
