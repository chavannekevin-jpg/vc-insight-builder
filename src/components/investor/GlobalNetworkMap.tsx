import { useState, memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import type { NetworkMarker } from "@/hooks/useGlobalNetwork";

// Europe-focused map from Natural Earth via unpkg - reliable CDN
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

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
  active_user: "hsl(142, 76%, 45%)", // Green - active investors
  global_contact: "hsl(217, 91%, 60%)", // Blue - contacts added by others
  my_contact: "hsl(330, 81%, 60%)", // Pink - contacts added by user
};

const GlobalNetworkMap = memo(({
  cityGroups,
  searchQuery,
  onCityClick,
}: GlobalNetworkMapProps) => {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [position, setPosition] = useState({ coordinates: [15, 54] as [number, number], zoom: 1 });

  const handleMoveEnd = (position: { coordinates: [number, number]; zoom: number }) => {
    setPosition(position);
  };

  // Calculate marker size based on count and zoom
  // Very tiny for 1, scales up dramatically for more contacts
  const getMarkerSize = (count: number, zoom: number) => {
    const minSize = 1.2;
    const maxSize = 11; // Doubled from 5.5

    let size: number;
    if (count === 1) {
      size = minSize;
    } else if (count <= 3) {
      size = minSize + (count - 1) * 0.8;
    } else if (count <= 10) {
      size = 2.8 + Math.sqrt(count - 3) * 1.2;
    } else if (count <= 50) {
      size = 5.5 + Math.sqrt(count - 10) * 0.8;
    } else {
      size = 8 + Math.log10(count) * 1.5;
    }

    const cappedSize = Math.min(size, maxSize);
    return cappedSize / Math.pow(zoom, 0.4);
  };

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

          {filteredCityGroups.map(([city, group]) => {
            if (group.lat == null || group.lng == null) return null;

            const isHovered = hoveredCity === city;
            const markerSize = getMarkerSize(group.count, position.zoom);
            const color = TYPE_COLORS[group.dominantType];

            return (
              <Marker
                key={city}
                coordinates={[group.lng, group.lat]}
                onMouseEnter={() => setHoveredCity(city)}
                onMouseLeave={() => setHoveredCity(null)}
                onClick={() => {
                  if (onCityClick) {
                    onCityClick(city, group.markers);
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                <circle
                  r={markerSize * 1.5}
                  fill={`${color}33`}
                  className="transition-all duration-200"
                />
                <circle
                  r={isHovered ? markerSize * 1.15 : markerSize}
                  fill={color}
                  className="transition-all duration-200"
                  style={{ filter: isHovered ? `drop-shadow(0 0 4px ${color})` : "none" }}
                />
                {group.count > 1 && position.zoom > 2 && (
                  <text
                    textAnchor="middle"
                    y={markerSize * 0.35}
                    style={{
                      fontSize: `${markerSize * 0.8}px`,
                      fill: "white",
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
            {cityGroups[hoveredCity].count} investor{cityGroups[hoveredCity].count !== 1 ? "s" : ""}
          </p>
          <div className="space-y-1">
            {cityGroups[hoveredCity].markers.slice(0, 5).map((marker) => (
              <div key={marker.id} className="text-sm flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: TYPE_COLORS[marker.type] }}
                />
                <span className="font-medium truncate">{marker.name}</span>
                {marker.organization_name && (
                  <span className="text-muted-foreground truncate">
                    @ {marker.organization_name}
                  </span>
                )}
              </div>
            ))}
            {cityGroups[hoveredCity].count > 5 && (
              <p className="text-xs text-muted-foreground">
                +{cityGroups[hoveredCity].count - 5} more
              </p>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 z-10">
        <p className="text-xs font-medium mb-2 text-muted-foreground">Europe Network</p>
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

      {/* Empty State */}
      {Object.keys(cityGroups).length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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
