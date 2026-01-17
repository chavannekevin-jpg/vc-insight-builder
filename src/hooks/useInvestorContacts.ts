import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { resolveLocation } from "@/lib/location";
import type { InvestorContact } from "@/pages/investor/InvestorDashboard";

interface CityGroup {
  city: string;
  lat: number | null;
  lng: number | null;
  count: number;
  contacts: InvestorContact[];
}

export const useInvestorContacts = (userId: string | null) => {
  const { data: contacts = [], isLoading, refetch } = useQuery({
    queryKey: ["investor-contacts", userId],
    queryFn: async () => {
      if (!userId) return [];

      // Fetch investor contacts with global contact data
      const { data: investorContacts, error } = await (supabase
        .from("investor_contacts") as any)
        .select(`
          id,
          global_contact_id,
          local_name,
          local_organization,
          local_notes,
          relationship_status,
          last_contact_date
        `)
        .eq("investor_id", userId);

      if (error) {
        console.error("Error fetching contacts:", error);
        return [];
      }

      // For each contact, fetch the global contact data
      const contactsWithGlobal: InvestorContact[] = await Promise.all(
        (investorContacts || []).map(async (contact: any) => {
          if (contact.global_contact_id) {
            const { data: globalContact } = await (supabase
              .from("global_contacts") as any)
              .select("*")
              .eq("id", contact.global_contact_id)
              .maybeSingle();

            return {
              ...contact,
                global_contact: globalContact ? {
                  ...globalContact,
                  city_lat: globalContact.city_lat != null ? Number(globalContact.city_lat) : null,
                  city_lng: globalContact.city_lng != null ? Number(globalContact.city_lng) : null,
                  investment_focus: (globalContact.investment_focus as string[]) || [],
                  stages: (globalContact.stages as string[]) || [],
                  linked_investor_id: globalContact.linked_investor_id || null,
                } : undefined,
            } as InvestorContact;
          }
          return contact as InvestorContact;
        })
      );

      return contactsWithGlobal;
    },
    enabled: !!userId,
  });

  // Group contacts by city
  const cityGroups: Record<string, CityGroup> = {};

  contacts.forEach((contact) => {
    const city = contact.global_contact?.city?.trim();
    const country = contact.global_contact?.country ?? null;
    if (!city) return;

    const rawLat = contact.global_contact?.city_lat ?? null;
    const rawLng = contact.global_contact?.city_lng ?? null;
    const resolved = (rawLat == null || rawLng == null) ? resolveLocation({ city, country }) : null;

    const lat = rawLat ?? resolved?.lat ?? null;
    const lng = rawLng ?? resolved?.lng ?? null;

    if (!cityGroups[city]) {
      cityGroups[city] = {
        city,
        lat,
        lng,
        count: 0,
        contacts: [],
      };
    }

    cityGroups[city].count++;
    cityGroups[city].contacts.push(contact);
  });

  return {
    contacts,
    isLoading,
    refetch,
    cityGroups,
  };
};
