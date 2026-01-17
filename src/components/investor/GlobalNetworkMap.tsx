import { memo, useMemo } from "react";
import type { NetworkMarker } from "@/hooks/useGlobalNetwork";
import LightweightWorldMap from "./LightweightWorldMap";

interface CityGroup {
  city: string;
  lat: number | null;
  lng: number | null;
  count: number;
  markers: NetworkMarker[];
  dominantType: "active_user" | "global_contact" | "my_contact";
}

interface GlobalNetworkMapProps {
  cityGroups: Record<string, CityGroup>;
  searchQuery: string;
  onCityClick?: (city: string, markers: NetworkMarker[]) => void;
}

const TYPE_COLORS = {
  active_user: "hsl(142, 76%, 45%)", // Green
  global_contact: "hsl(217, 91%, 60%)", // Blue  
  my_contact: "hsl(330, 81%, 60%)", // Pink
};

const GlobalNetworkMap = memo(({
  cityGroups,
  searchQuery,
  onCityClick,
}: GlobalNetworkMapProps) => {
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
        color: TYPE_COLORS[group.dominantType],
        networkMarkers: group.markers,
      }));
  }, [cityGroups, searchQuery]);

  const handleMarkerClick = (marker: { id: string; networkMarkers?: NetworkMarker[] }) => {
    const group = cityGroups[marker.id];
    if (!group || !onCityClick) return;
    onCityClick(marker.id, group.markers);
  };

  // Empty state
  if (Object.keys(cityGroups).length === 0) {
    return (
      <div className="w-full min-h-[500px] bg-card flex items-center justify-center">
        <div className="text-center p-8 bg-card/80 backdrop-blur-sm rounded-lg border border-border">
          <p className="text-lg font-medium mb-2">No investors found</p>
          <p className="text-muted-foreground">
            Be the first to add contacts to the network
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[500px] bg-card relative">
      <LightweightWorldMap
        markers={markers}
        onMarkerClick={handleMarkerClick}
        className="h-full"
      />
      
      {/* Legend */}
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 z-10">
        <p className="text-xs font-medium mb-2 text-muted-foreground">Legend</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: TYPE_COLORS.active_user }} />
            <span>Active Investors</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: TYPE_COLORS.global_contact }} />
            <span>Community Added</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: TYPE_COLORS.my_contact }} />
            <span>My Contacts</span>
          </div>
        </div>
      </div>
    </div>
  );
});

GlobalNetworkMap.displayName = "GlobalNetworkMap";

export default GlobalNetworkMap;
