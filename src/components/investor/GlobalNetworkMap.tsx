import { memo } from "react";
import type { NetworkMarker } from "@/hooks/useGlobalNetwork";
import { Globe } from "lucide-react";

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

const TYPE_STYLES = {
  active_user: { bg: "bg-green-500", label: "Active Investors" },
  global_contact: { bg: "bg-blue-500", label: "Community Added" },
  my_contact: { bg: "bg-pink-500", label: "My Contacts" },
};

/**
 * Lightweight map placeholder - replaces heavy react-simple-maps dependency
 * Shows city list grouped by type instead of interactive SVG world map
 */
const GlobalNetworkMap = memo(({
  cityGroups,
  searchQuery,
  onCityClick,
}: GlobalNetworkMapProps) => {
  const filteredCityGroups = Object.entries(cityGroups).filter(([city]) => {
    if (!searchQuery) return true;
    return city.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sortedCities = filteredCityGroups.sort((a, b) => b[1].count - a[1].count);

  const totalInvestors = Object.values(cityGroups).reduce((sum, g) => sum + g.count, 0);

  return (
    <div className="w-full h-full min-h-[500px] bg-background relative overflow-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Global Network
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {Object.keys(cityGroups).length} cities · {totalInvestors} investors
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 p-3 bg-muted/50 rounded-lg">
        {Object.entries(TYPE_STYLES).map(([type, style]) => (
          <div key={type} className="flex items-center gap-2 text-xs">
            <span className={`w-3 h-3 rounded-full ${style.bg}`} />
            <span>{style.label}</span>
          </div>
        ))}
      </div>

      {/* City Grid */}
      {sortedCities.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {sortedCities.map(([city, group]) => {
            const typeStyle = TYPE_STYLES[group.dominantType];
            return (
              <button
                key={city}
                onClick={() => onCityClick?.(city, group.markers)}
                className="p-4 bg-card border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${typeStyle.bg}`} />
                  <span className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                    {city}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {group.count} investor{group.count !== 1 ? "s" : ""}
                </p>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-center p-8 bg-card/80 backdrop-blur-sm rounded-lg border border-border">
            <p className="text-lg font-medium mb-2">No investors found</p>
            <p className="text-muted-foreground">
              Be the first to add contacts to the network
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

GlobalNetworkMap.displayName = "GlobalNetworkMap";

export default GlobalNetworkMap;
