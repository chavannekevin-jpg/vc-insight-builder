import { useState, memo, useRef } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import type { InvestorContact } from "@/pages/investor/InvestorDashboard";
import { MapPin, Building2, Users } from "lucide-react";

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

interface TooltipPosition {
  x: number;
  y: number;
}

const InvestorWorldMap = memo(({
  cityGroups,
  onCityClick,
  onContactClick,
  searchQuery,
}: InvestorWorldMapProps) => {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const [position, setPosition] = useState({ coordinates: [15, 54] as [number, number], zoom: 1 });
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const handleMoveEnd = (position: { coordinates: [number, number]; zoom: number }) => {
    setPosition(position);
  };

  // Calculate marker size based on count and zoom
  // Very tiny for 1, scales up dramatically for more contacts
  const getMarkerSize = (count: number, zoom: number) => {
    const minSize = 1.2;
    const maxSize = 22; // Doubled from 11

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

  // Filter city groups based on search
  const filteredCityGroups = Object.entries(cityGroups).filter(([city]) => {
    if (!searchQuery) return true;
    return city.toLowerCase().includes(searchQuery.toLowerCase());
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

      {/* Hover Tooltip - Positioned near the marker */}
      {hoveredCity && cityGroups[hoveredCity] && tooltipPosition && (
        <div 
          className="absolute z-50 pointer-events-none animate-fade-in"
          style={{
            left: tooltipPosition.x + 16,
            top: tooltipPosition.y - 8,
            transform: tooltipPosition.x > (mapContainerRef.current?.clientWidth || 0) / 2 
              ? 'translateX(-100%) translateX(-32px)' 
              : 'translateX(0)',
          }}
        >
          <div className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-xl p-4 shadow-2xl max-w-[280px] ring-1 ring-white/5">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center ring-1 ring-primary/20">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">{hoveredCity}</h3>
                <p className="text-xs text-muted-foreground/80">
                  {cityGroups[hoveredCity].count} contact{cityGroups[hoveredCity].count !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            
            {/* Contact List */}
            <div className="space-y-2">
              {cityGroups[hoveredCity].contacts.slice(0, 3).map((contact) => (
                <div 
                  key={contact.id} 
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/30 border border-border/30"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-primary">
                    {(contact.local_name || contact.global_contact?.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {contact.local_name || contact.global_contact?.name}
                    </p>
                    {(contact.local_organization || contact.global_contact?.organization_name) && (
                      <p className="text-[10px] text-muted-foreground/70 truncate flex items-center gap-1">
                        <Building2 className="w-2.5 h-2.5" />
                        {contact.local_organization || contact.global_contact?.organization_name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {cityGroups[hoveredCity].count > 3 && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 pl-1">
                  <Users className="w-3 h-3" />
                  +{cityGroups[hoveredCity].count - 3} more contacts
                </div>
              )}
            </div>
            
            {/* Footer CTA */}
            <div className="mt-3 pt-2.5 border-t border-border/30">
              <p className="text-[10px] text-primary font-medium flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                Click to view all
              </p>
            </div>
          </div>
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
