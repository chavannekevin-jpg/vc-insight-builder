import { useState, memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import type { InvestorContact } from "@/pages/investor/InvestorDashboard";

// Europe-focused map from Natural Earth via unpkg - reliable CDN
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

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
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [position, setPosition] = useState({ coordinates: [15, 54] as [number, number], zoom: 1 });

  const handleMoveEnd = (position: { coordinates: [number, number]; zoom: number }) => {
    setPosition(position);
  };

  // Calculate marker size based on count and zoom
  const getMarkerSize = (count: number, zoom: number) => {
    const baseSize = 1.5 + Math.log2(count + 1) * 1.2;
    const cappedSize = Math.min(baseSize, 6);
    return cappedSize / Math.pow(zoom, 0.5);
  };

  // Filter city groups based on search
  const filteredCityGroups = Object.entries(cityGroups).filter(([city]) => {
    if (!searchQuery) return true;
    return city.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full h-full min-h-[500px] bg-background relative">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 700,
          center: [15, 54],
        }}
        className="w-full h-full"
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
          minZoom={0.5}
          maxZoom={8}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--border))"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: "hsl(var(--muted-foreground) / 0.3)" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {/* City Markers */}
          {filteredCityGroups.map(([city, group]) => {
            if (!group.lat || !group.lng) return null;

            const isHovered = hoveredCity === city;
            const markerSize = getMarkerSize(group.count, position.zoom);

            return (
              <Marker
                key={city}
                coordinates={[group.lng, group.lat]}
                onMouseEnter={() => setHoveredCity(city)}
                onMouseLeave={() => setHoveredCity(null)}
                onClick={() => {
                  if (group.count === 1) {
                    onContactClick(group.contacts[0]);
                  } else {
                    onCityClick(city, group.contacts);
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                {/* Outer glow */}
                <circle
                  r={markerSize * 1.5}
                  fill="hsl(var(--primary) / 0.2)"
                  className="transition-all duration-200"
                />
                {/* Main dot */}
                <circle
                  r={isHovered ? markerSize * 1.15 : markerSize}
                  fill="hsl(var(--primary))"
                  className="transition-all duration-200"
                  style={{ filter: isHovered ? "drop-shadow(0 0 4px hsl(var(--primary)))" : "none" }}
                />
                {/* Count label for cities with multiple contacts */}
                {group.count > 1 && position.zoom > 2 && (
                  <text
                    textAnchor="middle"
                    y={markerSize * 0.35}
                    style={{
                      fontSize: `${markerSize * 0.8}px`,
                      fill: "hsl(var(--primary-foreground))",
                      fontWeight: 600,
                    }}
                  >
                    {group.count}
                  </text>
                )}
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Hover Tooltip */}
      {hoveredCity && cityGroups[hoveredCity] && (
        <div className="absolute bottom-4 left-4 bg-card border border-border rounded-lg p-4 shadow-lg z-10 max-w-xs">
          <h3 className="font-semibold text-lg">{hoveredCity}</h3>
          <p className="text-sm text-muted-foreground mb-2">
            {cityGroups[hoveredCity].count} contact{cityGroups[hoveredCity].count !== 1 ? "s" : ""}
          </p>
          <div className="space-y-1">
            {cityGroups[hoveredCity].contacts.slice(0, 3).map((contact) => (
              <div key={contact.id} className="text-sm">
                <span className="font-medium">
                  {contact.local_name || contact.global_contact?.name}
                </span>
                {(contact.local_organization || contact.global_contact?.organization_name) && (
                  <span className="text-muted-foreground">
                    {" "}
                    @ {contact.local_organization || contact.global_contact?.organization_name}
                  </span>
                )}
              </div>
            ))}
            {cityGroups[hoveredCity].count > 3 && (
              <p className="text-xs text-muted-foreground">
                +{cityGroups[hoveredCity].count - 3} more
              </p>
            )}
          </div>
          <p className="text-xs text-primary mt-2">Click to view details</p>
        </div>
      )}

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-1 z-10">
        <button
          onClick={() => setPosition((prev) => ({ ...prev, zoom: Math.min(prev.zoom * 1.5, 8) }))}
          className="w-8 h-8 bg-card border border-border rounded flex items-center justify-center hover:bg-muted transition-colors"
        >
          +
        </button>
        <button
          onClick={() => setPosition((prev) => ({ ...prev, zoom: Math.max(prev.zoom / 1.5, 0.5) }))}
          className="w-8 h-8 bg-card border border-border rounded flex items-center justify-center hover:bg-muted transition-colors"
        >
          −
        </button>
      </div>

      {/* Region Label */}
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 z-10">
        <p className="text-xs font-medium text-muted-foreground">Europe</p>
      </div>

      {/* Empty State */}
      {Object.keys(cityGroups).length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center p-8 bg-card/80 backdrop-blur-sm rounded-lg border border-border">
            <p className="text-lg font-medium mb-2">No contacts yet</p>
            <p className="text-muted-foreground">
              Add your first contact to see them on the map
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

InvestorWorldMap.displayName = "InvestorWorldMap";

export default InvestorWorldMap;
