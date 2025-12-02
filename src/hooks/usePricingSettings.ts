import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MemoPricing {
  base_price: number;
  currency: string;
  early_access_discount: number;
  early_access_enabled: boolean;
  original_price: number;
  show_original_price: boolean;
}

export interface NetworkPricing {
  base_price: number;
  currency: string;
}

export interface PricingSettings {
  memo_pricing: MemoPricing;
  network_pricing: NetworkPricing;
}

const defaultPricing: PricingSettings = {
  memo_pricing: {
    base_price: 59.99,
    currency: "EUR",
    early_access_discount: 50,
    early_access_enabled: true,
    original_price: 119.99,
    show_original_price: true,
  },
  network_pricing: {
    base_price: 159.99,
    currency: "EUR",
  },
};

export const usePricingSettings = () => {
  return useQuery({
    queryKey: ["pricing-settings"],
    queryFn: async (): Promise<PricingSettings> => {
      const { data, error } = await supabase
        .from("pricing_settings")
        .select("setting_key, setting_value");

      if (error) {
        console.error("Error fetching pricing settings:", error);
        return defaultPricing;
      }

      const settings: PricingSettings = { ...defaultPricing };
      
      data?.forEach((row: { setting_key: string; setting_value: any }) => {
        if (row.setting_key === "memo_pricing") {
          settings.memo_pricing = row.setting_value as MemoPricing;
        } else if (row.setting_key === "network_pricing") {
          settings.network_pricing = row.setting_value as NetworkPricing;
        }
      });

      return settings;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

export const useUpdatePricingSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase
        .from("pricing_settings")
        .update({ setting_value: value })
        .eq("setting_key", key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-settings"] });
    },
  });
};
