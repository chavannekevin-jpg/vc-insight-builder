import { useState, memo, useRef, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import type { InvestorContact } from "@/pages/investor/InvestorDashboard";
import RegionSelector from "./RegionSelector";
import { REGION_CONFIG, CITY_COORDINATES, normalizeCityKey, type MapRegion } from "@/lib/location";

// World map from Natural Earth via CDN
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
  selectedRegion: MapRegion;
  onRegionChange: (region: MapRegion) => void;
}

interface TooltipPosition {
  x: number;
  y: number;
}

const InvestorWorldMap = memo(({
  cityGroups,
  onCityClick,
  onContactClick,
  searchQuery,
  selectedRegion,
  onRegionChange,
}: InvestorWorldMapProps) => {
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
    <div ref={mapContainerRef} className="w-full h-full min-h-[500px] bg-background relative overflow-hidden">
      {/* Static Controls Layer - Always visible above map */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="flex justify-between items-start p-4">
          {/* Region Selector */}
          <div className="pointer-events-auto">
            <RegionSelector 
              selectedRegion={selectedRegion} 
              onRegionChange={onRegionChange} 
            />
          </div>

          {/* Zoom Controls */}
          <div className="flex flex-col gap-1 pointer-events-auto">
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
        </div>
      </div>

      {/* Map Layer */}
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

          {/* City Markers */}
          {filteredCityGroups.map(([city, group]) => {
            if (group.lat == null || group.lng == null) return null;

            const isHovered = hoveredCity === city;
            const markerSize = getMarkerSize(group.count, position.zoom);

            return (
              <Marker
                key={city}
                coordinates={[group.lng, group.lat]}
                onMouseEnter={(e) => handleMarkerHover(city, e as unknown as React.MouseEvent)}
                onMouseLeave={handleMarkerLeave}
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
              {cityGroups[hoveredCity].contacts.slice(0, 4).map((contact) => (
                <p key={contact.id} className="text-xs text-muted-foreground/70 truncate max-w-[180px]">
                  {contact.local_name || contact.global_contact?.name}
                </p>
              ))}
              {cityGroups[hoveredCity].count > 4 && (
                <p className="text-xs text-muted-foreground/50">+{cityGroups[hoveredCity].count - 4} more</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredCityGroups.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center p-8 bg-card/80 backdrop-blur-sm rounded-lg border border-border">
            <p className="text-lg font-medium mb-2">No contacts in {regionConfig.label}</p>
            <p className="text-muted-foreground">
              Add contacts or switch regions to see them on the map
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

InvestorWorldMap.displayName = "InvestorWorldMap";

export default InvestorWorldMap;
