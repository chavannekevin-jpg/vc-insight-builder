import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AcceleratorDiscount {
  discountPercent: number;
  acceleratorName: string;
  hasDiscount: boolean;
}

/**
 * Fetches accelerator invite discount info for a company
 */
export const useAcceleratorDiscount = (acceleratorInviteId: string | null | undefined): AcceleratorDiscount & { isLoading: boolean } => {
  const { data, isLoading } = useQuery({
    queryKey: ["accelerator-discount", acceleratorInviteId],
    queryFn: async () => {
      if (!acceleratorInviteId) return null;
      
      const { data: invite, error } = await supabase
        .from("accelerator_invites")
        .select("discount_percent, accelerator_name")
        .eq("id", acceleratorInviteId)
        .maybeSingle();
      
      if (error) throw error;
      return invite;
    },
    enabled: !!acceleratorInviteId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30,
  });

  return {
    discountPercent: data?.discount_percent ?? 0,
    acceleratorName: data?.accelerator_name ?? "",
    hasDiscount: (data?.discount_percent ?? 0) > 0 && (data?.discount_percent ?? 0) < 100,
    isLoading,
  };
};
