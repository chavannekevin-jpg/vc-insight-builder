import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NetworkMarker {
  id: string;
  name: string;
  organization_name: string | null;
  city: string | null;
  city_lat: number | null;
  city_lng: number | null;
  country: string | null;
  type: "active_user" | "global_contact" | "my_contact";
}

export const useGlobalNetwork = (userId: string | null, myContactIds: string[]) => {
  // Fetch all investor profiles (active users - green dots)
  const { data: activeUsers = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["global-investor-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investor_profiles")
        .select("id, full_name, organization_name, city, city_lat, city_lng")
        .eq("onboarding_completed", true);

      if (error) {
        console.error("Error fetching investor profiles:", error);
        return [];
      }

      return (data || []).map((profile): NetworkMarker => ({
        id: profile.id,
        name: profile.full_name,
        organization_name: profile.organization_name,
        city: profile.city,
        city_lat: profile.city_lat ? Number(profile.city_lat) : null,
        city_lng: profile.city_lng ? Number(profile.city_lng) : null,
        country: null,
        type: "active_user",
      }));
    },
    enabled: !!userId,
  });

  // Fetch all global contacts (blue dots, or pink if user's own)
  const { data: globalContacts = [], isLoading: isLoadingContacts } = useQuery({
    queryKey: ["global-all-contacts", myContactIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("global_contacts")
        .select("id, name, organization_name, city, city_lat, city_lng, country");

      if (error) {
        console.error("Error fetching global contacts:", error);
        return [];
      }

      return (data || []).map((contact): NetworkMarker => ({
        id: contact.id,
        name: contact.name,
        organization_name: contact.organization_name,
        city: contact.city,
        city_lat: contact.city_lat ? Number(contact.city_lat) : null,
        city_lng: contact.city_lng ? Number(contact.city_lng) : null,
        country: contact.country,
        type: myContactIds.includes(contact.id) ? "my_contact" : "global_contact",
      }));
    },
    enabled: !!userId,
  });

  // Combine and deduplicate by city for map display
  const allMarkers = [...activeUsers, ...globalContacts];

  // Group by city
  const cityGroups: Record<string, {
    city: string;
    lat: number | null;
    lng: number | null;
    count: number;
    markers: NetworkMarker[];
    dominantType: "active_user" | "global_contact" | "my_contact";
  }> = {};

  allMarkers.forEach((marker) => {
    if (marker.city && marker.city_lat && marker.city_lng) {
      if (!cityGroups[marker.city]) {
        cityGroups[marker.city] = {
          city: marker.city,
          lat: marker.city_lat,
          lng: marker.city_lng,
          count: 0,
          markers: [],
          dominantType: marker.type,
        };
      }
      cityGroups[marker.city].count++;
      cityGroups[marker.city].markers.push(marker);

      // Priority: my_contact > active_user > global_contact
      const typePriority = { my_contact: 3, active_user: 2, global_contact: 1 };
      if (typePriority[marker.type] > typePriority[cityGroups[marker.city].dominantType]) {
        cityGroups[marker.city].dominantType = marker.type;
      }
    }
  });

  return {
    allMarkers,
    cityGroups,
    isLoading: isLoadingUsers || isLoadingContacts,
    stats: {
      activeUsers: activeUsers.length,
      globalContacts: globalContacts.filter(c => c.type === "global_contact").length,
      myContacts: globalContacts.filter(c => c.type === "my_contact").length,
    },
  };
};
