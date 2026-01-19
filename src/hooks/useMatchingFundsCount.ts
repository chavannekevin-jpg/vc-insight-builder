import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useStartupMatchingProfile } from "./useStartupMatchingProfile";
import { calculateStartupAffinity } from "@/lib/startupAffinityCalculator";

interface MatchingFundsResult {
  totalFunds: number;
  matchingFunds: number;
  strongMatches: number;
  goodMatches: number;
  isLoading: boolean;
}

export function useMatchingFundsCount(
  companyId: string | null,
  company: { stage?: string; category?: string } | null
): MatchingFundsResult {
  const { data: enrichedProfile, isLoading: profileLoading } = useStartupMatchingProfile(
    companyId,
    company
  );

  const startupProfile = {
    stage: enrichedProfile?.stage || company?.stage,
    category: enrichedProfile?.category || company?.category,
    sector: enrichedProfile?.sectors || (company?.category ? [company.category] : []),
    keywords: enrichedProfile?.keywords || [],
    location: null,
    fundingAsk: enrichedProfile?.fundingAsk || null,
    hasRevenue: enrichedProfile?.hasRevenue || false,
    hasCustomers: enrichedProfile?.hasCustomers || false,
    currentARR: enrichedProfile?.currentARR || null,
  };

  const { data, isLoading: fundsLoading } = useQuery({
    queryKey: ['matching-funds-count', companyId],
    queryFn: async () => {
      // Fetch all funds
      const { data: globalContacts, error: gcError } = await supabase
        .from('global_contacts')
        .select('id, organization_name, stages, investment_focus, thesis_keywords, ticket_size_min, ticket_size_max, city')
        .not('organization_name', 'is', null);

      if (gcError) throw gcError;

      const { data: investorProfiles, error: ipError } = await supabase
        .from('investor_profiles')
        .select('id, organization_name, preferred_stages, primary_sectors, ticket_size_min, ticket_size_max, city')
        .eq('onboarding_completed', true)
        .not('organization_name', 'is', null);

      if (ipError) throw ipError;

      const toStringArray = (val: unknown): string[] | null => {
        if (!val) return null;
        if (Array.isArray(val)) return val.map(v => String(v));
        return [String(val)];
      };

      // Combine and dedupe by org name
      const fundMap = new Map<string, any>();

      globalContacts?.forEach(gc => {
        const orgName = gc.organization_name?.trim();
        if (!orgName) return;
        
        const key = orgName.toLowerCase();
        if (!fundMap.has(key)) {
          fundMap.set(key, {
            stages: toStringArray(gc.stages),
            investment_focus: toStringArray(gc.investment_focus),
            thesis_keywords: toStringArray(gc.thesis_keywords),
            ticket_size_min: gc.ticket_size_min,
            ticket_size_max: gc.ticket_size_max,
            city: gc.city,
          });
        }
      });

      investorProfiles?.forEach(ip => {
        const orgName = ip.organization_name?.trim();
        if (!orgName) return;
        
        const key = orgName.toLowerCase();
        if (!fundMap.has(key)) {
          fundMap.set(key, {
            stages: toStringArray(ip.preferred_stages),
            investment_focus: toStringArray(ip.primary_sectors),
            thesis_keywords: null,
            ticket_size_min: ip.ticket_size_min,
            ticket_size_max: ip.ticket_size_max,
            city: ip.city,
          });
        }
      });

      // Calculate matches
      let strongMatches = 0;
      let goodMatches = 0;
      let matchingFunds = 0;

      fundMap.forEach(fund => {
        const result = calculateStartupAffinity(startupProfile, fund);
        
        if (result.percentage >= 20) {
          matchingFunds++;
          if (result.tier === 'strong') strongMatches++;
          else if (result.tier === 'good') goodMatches++;
        }
      });

      return {
        totalFunds: fundMap.size,
        matchingFunds,
        strongMatches,
        goodMatches,
      };
    },
    enabled: !!companyId || !!company,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    totalFunds: data?.totalFunds || 0,
    matchingFunds: data?.matchingFunds || 0,
    strongMatches: data?.strongMatches || 0,
    goodMatches: data?.goodMatches || 0,
    isLoading: profileLoading || fundsLoading,
  };
}
