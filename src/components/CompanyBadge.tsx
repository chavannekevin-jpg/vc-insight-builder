import { Building2, Target, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CompanyBadgeProps {
  name: string;
  sector?: string;
  tagline?: string;
  isLoading?: boolean;
}

export function CompanyBadge({ name, sector, tagline, isLoading }: CompanyBadgeProps) {
  return (
    <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-full border border-primary/30 shadow-lg backdrop-blur-sm animate-fade-in">
      {/* Company Name */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40 shadow-neon">
          <Building2 className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm font-bold text-foreground tracking-wide">
          {name}
        </span>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent" />

      {/* Sector */}
      {sector && (
        <>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40 shadow-neon">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <Badge 
              variant="secondary" 
              className="text-xs font-semibold bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 transition-colors"
            >
              {sector}
            </Badge>
          </div>
          <div className="h-6 w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent" />
        </>
      )}

      {/* AI-Generated Tagline */}
      <div className="flex items-center gap-2 max-w-md">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40 shadow-neon">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
        </div>
        {isLoading ? (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse [animation-delay:0.2s]" />
            <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse [animation-delay:0.4s]" />
          </div>
        ) : tagline ? (
          <span className="text-xs italic text-muted-foreground font-medium leading-tight">
            "{tagline}"
          </span>
        ) : null}
      </div>
    </div>
  );
}