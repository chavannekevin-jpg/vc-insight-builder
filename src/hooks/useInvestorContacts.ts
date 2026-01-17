import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
      const { data: investorContacts, error } = await supabase
        .from("investor_contacts")
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
        (investorContacts || []).map(async (contact) => {
          if (contact.global_contact_id) {
            const { data: globalContact } = await supabase
              .from("global_contacts")
              .select("*")
              .eq("id", contact.global_contact_id)
              .maybeSingle();

            return {
              ...contact,
              global_contact: globalContact ? {
                ...globalContact,
                investment_focus: (globalContact.investment_focus as string[]) || [],
                stages: (globalContact.stages as string[]) || [],
              } : undefined,
            };
          }
          return contact;
        })
      );

      return contactsWithGlobal;
    },
    enabled: !!userId,
  });

  // Group contacts by city
  const cityGroups: Record<string, CityGroup> = {};
  
  contacts.forEach((contact) => {
    const city = contact.global_contact?.city;
    if (city) {
      if (!cityGroups[city]) {
        cityGroups[city] = {
          city,
          lat: contact.global_contact?.city_lat || null,
          lng: contact.global_contact?.city_lng || null,
          count: 0,
          contacts: [],
        };
      }
      cityGroups[city].count++;
      cityGroups[city].contacts.push(contact);
    }
  });

  return {
    contacts,
    isLoading,
    refetch,
    cityGroups,
  };
};
