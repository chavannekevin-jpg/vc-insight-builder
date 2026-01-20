import { useState, memo, useRef, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import type { NetworkMarker } from "@/hooks/useGlobalNetwork";
import RegionSelector from "./RegionSelector";
import { REGION_CONFIG, CITY_COORDINATES, normalizeCityKey, type MapRegion } from "@/lib/location";

// World map from Natural Earth via CDN
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
  selectedRegion: MapRegion;
  onRegionChange: (region: MapRegion) => void;
}

interface TooltipPosition {
  x: number;
  y: number;
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
  selectedRegion,
  onRegionChange,
}: GlobalNetworkMapProps) => {
  const regionConfig = REGION_CONFIG[selectedRegion];
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const [position, setPosition] = useState({ 
    coordinates: regionConfig.center as [number, number], 
    zoom: regionConfig.zoom 
  });
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Update position when region changes
  useEffect(() => {
    const config = REGION_CONFIG[selectedRegion];
    setPosition({ coordinates: config.center, zoom: config.zoom });
  }, [selectedRegion]);

  const handleMoveEnd = (pos: { coordinates: [number, number]; zoom: number }) => {
    setPosition(pos);
  };

  // Calculate marker size based on count and zoom
  const getMarkerSize = (count: number, zoom: number) => {
    const minSize = 1.2;
    const maxSize = 22;

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

  // Filter city groups based on search AND region
  const filteredCityGroups = Object.entries(cityGroups).filter(([city]) => {
    // Check search query
    if (searchQuery && !city.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Check region - look up the city in CITY_COORDINATES
    const cityKey = normalizeCityKey(city);
    const cityData = CITY_COORDINATES[cityKey];
    if (cityData && cityData.region !== selectedRegion) {
      return false;
    }
    return true;
  });

  const handleMarkerHover = (city: string, event: React.MouseEvent) => {
    setHoveredCity(city);
    if (mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
  };

  const handleMarkerLeave = () => {
    setHoveredCity(null);
    setTooltipPosition(null);
  };

  return (
    <div ref={mapContainerRef} className="w-full h-full min-h-[500px] bg-background relative">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: regionConfig.scale,
          center: regionConfig.center,
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
                onMouseEnter={(e) => handleMarkerHover(city, e as unknown as React.MouseEvent)}
                onMouseLeave={handleMarkerLeave}
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

      {/* Minimal Hover Tooltip */}
      {hoveredCity && cityGroups[hoveredCity] && tooltipPosition && (
        <div 
          className="absolute z-50 pointer-events-none animate-fade-in"
          style={{
            left: tooltipPosition.x + 12,
            top: tooltipPosition.y - 4,
            transform: tooltipPosition.x > (mapContainerRef.current?.clientWidth || 0) / 2 
              ? 'translateX(-100%) translateX(-24px)' 
              : 'translateX(0)',
          }}
        >
          <div className="bg-card/80 backdrop-blur-sm border border-border/30 rounded-lg px-3 py-2.5 shadow-lg">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm font-medium text-foreground">{hoveredCity}</span>
              <span className="text-xs text-muted-foreground/60">·</span>
              <span className="text-xs text-muted-foreground/60">{cityGroups[hoveredCity].count}</span>
            </div>
            <div className="space-y-0.5">
              {cityGroups[hoveredCity].markers.slice(0, 4).map((marker) => (
                <p key={marker.id} className="text-xs text-muted-foreground/70 truncate max-w-[180px]">
                  {marker.name}
                </p>
              ))}
              {cityGroups[hoveredCity].count > 4 && (
                <p className="text-xs text-muted-foreground/50">+{cityGroups[hoveredCity].count - 4} more</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legend with Region Selector */}
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 z-10">
        <div className="mb-2">
          <RegionSelector 
            selectedRegion={selectedRegion} 
            onRegionChange={onRegionChange}
            className="!bg-transparent !border-0 !p-0 hover:!bg-transparent"
          />
        </div>
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
      {filteredCityGroups.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center p-8 bg-card/80 backdrop-blur-sm rounded-lg border border-border">
            <p className="text-lg font-medium mb-2">No investors in {regionConfig.label}</p>
            <p className="text-muted-foreground">
              Be the first to add contacts in this region
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

GlobalNetworkMap.displayName = "GlobalNetworkMap";

export default GlobalNetworkMap;
