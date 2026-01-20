import { ChevronDown, Globe2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { REGION_CONFIG, type MapRegion } from "@/lib/location";

interface RegionSelectorProps {
  selectedRegion: MapRegion;
  onRegionChange: (region: MapRegion) => void;
  className?: string;
}

const RegionSelector = ({ selectedRegion, onRegionChange, className = "" }: RegionSelectorProps) => {
  const regions: MapRegion[] = ["europe", "asia"];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className={`flex items-center gap-2 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors ${className}`}
        >
          <Globe2 className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">
            {REGION_CONFIG[selectedRegion].label}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[140px]">
        {regions.map((region) => (
          <DropdownMenuItem
            key={region}
            onClick={() => onRegionChange(region)}
            className={`text-sm cursor-pointer ${selectedRegion === region ? "bg-muted" : ""}`}
          >
            {REGION_CONFIG[region].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RegionSelector;
