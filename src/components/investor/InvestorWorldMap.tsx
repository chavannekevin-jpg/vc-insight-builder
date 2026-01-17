import { memo } from "react";
import type { InvestorContact } from "@/pages/investor/InvestorDashboard";
import { MapPin } from "lucide-react";

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

/**
 * Lightweight map placeholder - replaces heavy react-simple-maps dependency
 * Shows city list instead of interactive SVG world map
 */
const InvestorWorldMap = memo(({
  cityGroups,
  onCityClick,
  onContactClick,
  searchQuery,
}: InvestorWorldMapProps) => {
  const filteredCityGroups = Object.entries(cityGroups).filter(([city]) => {
    if (!searchQuery) return true;
    return city.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sortedCities = filteredCityGroups.sort((a, b) => b[1].count - a[1].count);

  return (
    <div className="w-full h-full min-h-[500px] bg-background relative overflow-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Contact Locations
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {Object.keys(cityGroups).length} cities · {Object.values(cityGroups).reduce((sum, g) => sum + g.count, 0)} contacts
        </p>
      </div>

      {/* City Grid */}
      {sortedCities.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {sortedCities.map(([city, group]) => (
            <button
              key={city}
              onClick={() => {
                if (group.count === 1) {
                  onContactClick(group.contacts[0]);
                } else {
                  onCityClick(city, group.contacts);
                }
              }}
              className="p-4 bg-card border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left group"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                  {city}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {group.count} contact{group.count !== 1 ? "s" : ""}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-center p-8 bg-card/80 backdrop-blur-sm rounded-lg border border-border">
            <p className="text-lg font-medium mb-2">No contacts yet</p>
            <p className="text-muted-foreground">
              Add your first contact to see them here
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

InvestorWorldMap.displayName = "InvestorWorldMap";

export default InvestorWorldMap;
