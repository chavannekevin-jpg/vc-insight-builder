import { memo, useMemo } from "react";
import type { InvestorContact } from "@/pages/investor/InvestorDashboard";
import LightweightWorldMap from "./LightweightWorldMap";

interface CityGroup {
  city: string;
  lat: number | null;
  lng: number | null;
  count: number;
  contacts: InvestorContact[];
}

interface InvestorWorldMapProps {
  contacts: InvestorContact[];
  cityGroups: Record<string, CityGroup>;
  onCityClick: (city: string, contacts: InvestorContact[]) => void;
  onContactClick: (contact: InvestorContact) => void;
  searchQuery: string;
}

const InvestorWorldMap = memo(({
  cityGroups,
  onCityClick,
  onContactClick,
  searchQuery,
}: InvestorWorldMapProps) => {
  // Convert city groups to markers
  const markers = useMemo(() => {
    return Object.entries(cityGroups)
      .filter(([city]) => {
        if (!searchQuery) return true;
        return city.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .filter(([, group]) => group.lat && group.lng)
      .map(([city, group]) => ({
        id: city,
        lat: group.lat!,
        lng: group.lng!,
        count: group.count,
        label: city,
        contacts: group.contacts,
      }));
  }, [cityGroups, searchQuery]);

  const handleMarkerClick = (marker: { id: string; count: number; contacts?: InvestorContact[] }) => {
    const group = cityGroups[marker.id];
    if (!group) return;
    
    if (marker.count === 1) {
      onContactClick(group.contacts[0]);
    } else {
      onCityClick(marker.id, group.contacts);
    }
  };

  // Empty state
  if (Object.keys(cityGroups).length === 0) {
    return (
      <div className="w-full min-h-[500px] bg-card flex items-center justify-center">
        <div className="text-center p-8 bg-card/80 backdrop-blur-sm rounded-lg border border-border">
          <p className="text-lg font-medium mb-2">No contacts yet</p>
          <p className="text-muted-foreground">
            Add your first contact to see them on the map
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[500px] bg-card">
      <LightweightWorldMap
        markers={markers}
        onMarkerClick={handleMarkerClick}
        className="h-full"
      />
    </div>
  );
});

InvestorWorldMap.displayName = "InvestorWorldMap";

export default InvestorWorldMap;
