import { useState, memo, useMemo } from "react";

// Simplified world map path - much lighter than full GeoJSON
const WORLD_PATH = "M570 280L565 275L555 278L545 283L535 278L528 270L520 275L510 272L502 268L495 262L488 258L480 260L472 255L465 250L458 248L450 252L442 258L435 255L428 248L420 245L412 248L405 255L398 250L390 245L382 242L375 238L368 235L360 238L352 242L345 248L338 252L330 255L322 252L315 248L308 245L300 242L292 238L285 235L278 238L270 242L262 248L255 252L248 255L240 258L232 262L225 265L218 268L210 272L202 275L195 278L188 282L180 285L172 288L165 292L158 295L150 298L142 302L135 305L128 308L120 312L112 315L105 318L98 322L90 325L82 328L75 332L68 335L60 338L52 342L45 345L38 348L30 352L22 355L15 358L8 362L0 365L0 175L15 172L30 168L45 165L60 162L75 158L90 155L105 152L120 148L135 145L150 142L165 138L180 135L195 132L210 128L225 125L240 122L255 118L270 115L285 112L300 115L315 118L330 122L345 125L360 122L375 118L390 115L405 112L420 115L435 118L450 122L465 125L480 128L495 132L510 135L525 138L540 142L555 145L570 148L570 280Z M600 320L595 315L588 310L580 308L572 312L565 318L558 322L550 325L542 328L535 332L528 335L520 338L512 342L505 345L498 348L490 352L482 355L475 358L468 362L460 365L452 368L445 372L438 375L430 378L422 382L415 385L408 388L400 392L392 395L385 398L378 402L370 405L362 408L355 412L348 415L340 418L332 422L325 425L318 428L310 432L302 435L295 438L288 442L280 445L272 448L265 452L258 455L250 458L242 462L235 465L228 468L220 472L212 475L205 478L198 482L190 485L182 488L175 492L168 495L160 498L152 502L145 505L138 508L130 512L122 515L115 518L108 522L100 525L100 415L115 412L130 408L145 405L160 402L175 398L190 395L205 392L220 388L235 385L250 382L265 378L280 375L295 372L310 368L325 365L340 362L355 358L370 355L385 352L400 348L415 345L430 342L445 338L460 335L475 332L490 328L505 325L520 322L535 318L550 315L565 312L580 308L595 305L600 302L600 320Z";

// Additional continent shapes for better detail
const CONTINENTS = {
  northAmerica: "M150 120L180 115L210 120L240 130L260 145L270 165L265 185L250 200L230 210L200 215L170 210L145 195L130 175L125 155L135 135L150 120Z",
  southAmerica: "M230 280L250 275L270 285L280 310L275 340L260 370L240 390L220 395L200 385L190 360L195 330L210 300L230 280Z",
  europe: "M480 100L510 95L540 100L560 115L565 135L555 155L535 165L510 170L485 165L465 150L460 130L470 110L480 100Z",
  africa: "M450 200L480 195L510 205L530 230L535 260L525 290L500 315L470 325L440 315L420 290L415 260L425 230L450 200Z",
  asia: "M550 80L600 75L650 85L690 105L710 135L705 170L680 200L640 220L590 225L545 215L510 190L500 155L515 120L550 80Z",
  oceania: "M680 300L710 295L740 305L755 325L750 350L730 365L700 370L675 360L660 340L665 315L680 300Z",
};

interface Marker {
  id: string;
  lat: number;
  lng: number;
  count: number;
  label: string;
  color?: string;
}

interface LightweightWorldMapProps {
  markers: Marker[];
  onMarkerClick?: (marker: Marker) => void;
  onMarkerHover?: (marker: Marker | null) => void;
  className?: string;
}

// Convert lat/lng to SVG coordinates (simple equirectangular projection)
const latLngToSvg = (lat: number, lng: number, width: number, height: number) => {
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
};

const LightweightWorldMap = memo(({
  markers,
  onMarkerClick,
  onMarkerHover,
  className = "",
}: LightweightWorldMapProps) => {
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 800, height: 450 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Calculate marker positions
  const markerPositions = useMemo(() => {
    return markers.map((marker) => ({
      ...marker,
      ...latLngToSvg(marker.lat, marker.lng, 800, 450),
    }));
  }, [markers]);

  // Calculate marker size based on count
  const getMarkerRadius = (count: number) => {
    return Math.min(4 + Math.log2(count + 1) * 2, 12);
  };

  // Zoom controls
  const handleZoomIn = () => {
    setViewBox((prev) => ({
      x: prev.x + prev.width * 0.125,
      y: prev.y + prev.height * 0.125,
      width: prev.width * 0.75,
      height: prev.height * 0.75,
    }));
  };

  const handleZoomOut = () => {
    setViewBox((prev) => ({
      x: Math.max(0, prev.x - prev.width * 0.25),
      y: Math.max(0, prev.y - prev.height * 0.25),
      width: Math.min(800, prev.width * 1.5),
      height: Math.min(450, prev.height * 1.5),
    }));
  };

  const handleReset = () => {
    setViewBox({ x: 0, y: 0, width: 800, height: 450 });
  };

  // Pan handling
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = (e.clientX - dragStart.x) * (viewBox.width / 800);
    const dy = (e.clientY - dragStart.y) * (viewBox.height / 450);
    setViewBox((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(800 - prev.width, prev.x - dx)),
      y: Math.max(0, Math.min(450 - prev.height, prev.y - dy)),
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMarkerEnter = (marker: Marker) => {
    setHoveredMarker(marker.id);
    onMarkerHover?.(marker);
  };

  const handleMarkerLeave = () => {
    setHoveredMarker(null);
    onMarkerHover?.(null);
  };

  return (
    <div className={`relative w-full h-full min-h-[400px] ${className}`}>
      <svg
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background */}
        <rect x="0" y="0" width="800" height="450" fill="hsl(var(--muted))" />

        {/* Ocean texture */}
        <rect x="0" y="0" width="800" height="450" fill="hsl(var(--background))" opacity="0.5" />

        {/* Continents */}
        {Object.entries(CONTINENTS).map(([name, path]) => (
          <path
            key={name}
            d={path}
            fill="hsl(var(--muted-foreground) / 0.2)"
            stroke="hsl(var(--border))"
            strokeWidth="1"
          />
        ))}

        {/* Grid lines for reference */}
        {[...Array(9)].map((_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={i * 50}
            x2="800"
            y2={i * 50}
            stroke="hsl(var(--border))"
            strokeWidth="0.5"
            opacity="0.3"
          />
        ))}
        {[...Array(17)].map((_, i) => (
          <line
            key={`v-${i}`}
            x1={i * 50}
            y1="0"
            x2={i * 50}
            y2="450"
            stroke="hsl(var(--border))"
            strokeWidth="0.5"
            opacity="0.3"
          />
        ))}

        {/* Markers */}
        {markerPositions.map((marker) => {
          const isHovered = hoveredMarker === marker.id;
          const radius = getMarkerRadius(marker.count);
          const color = marker.color || "hsl(var(--primary))";

          return (
            <g
              key={marker.id}
              onClick={() => onMarkerClick?.(marker)}
              onMouseEnter={() => handleMarkerEnter(marker)}
              onMouseLeave={handleMarkerLeave}
              style={{ cursor: "pointer" }}
            >
              {/* Outer glow */}
              <circle
                cx={marker.x}
                cy={marker.y}
                r={radius * 1.8}
                fill={color}
                opacity={isHovered ? 0.3 : 0.15}
                className="transition-opacity duration-200"
              />
              {/* Main marker */}
              <circle
                cx={marker.x}
                cy={marker.y}
                r={isHovered ? radius * 1.2 : radius}
                fill={color}
                stroke="white"
                strokeWidth="1"
                className="transition-all duration-200"
              />
              {/* Count label (when zoomed in enough) */}
              {marker.count > 1 && viewBox.width < 600 && (
                <text
                  x={marker.x}
                  y={marker.y + radius * 0.35}
                  textAnchor="middle"
                  fill="white"
                  fontSize={radius * 0.9}
                  fontWeight="600"
                >
                  {marker.count}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-1 z-10">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 bg-card border border-border rounded flex items-center justify-center hover:bg-muted transition-colors text-sm font-medium"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 bg-card border border-border rounded flex items-center justify-center hover:bg-muted transition-colors text-sm font-medium"
        >
          −
        </button>
        <button
          onClick={handleReset}
          className="w-8 h-8 bg-card border border-border rounded flex items-center justify-center hover:bg-muted transition-colors text-xs"
        >
          ⟲
        </button>
      </div>

      {/* Hovered marker tooltip */}
      {hoveredMarker && (
        <div className="absolute bottom-4 left-4 bg-card border border-border rounded-lg p-3 shadow-lg z-10">
          {markerPositions
            .filter((m) => m.id === hoveredMarker)
            .map((marker) => (
              <div key={marker.id}>
                <p className="font-semibold">{marker.label}</p>
                <p className="text-sm text-muted-foreground">
                  {marker.count} contact{marker.count !== 1 ? "s" : ""}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
});

LightweightWorldMap.displayName = "LightweightWorldMap";

export default LightweightWorldMap;
