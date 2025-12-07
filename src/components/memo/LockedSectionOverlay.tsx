import { ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock } from "lucide-react";

interface LockedSectionOverlayProps {
  children: ReactNode;
  sectionTitle: string;
}

export function LockedSectionOverlay({ children, sectionTitle }: LockedSectionOverlayProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");

  const handleClick = () => {
    if (companyId) {
      navigate(`/checkout-memo?companyId=${companyId}`);
    }
  };

  return (
    <div 
      className="relative cursor-pointer group"
      onClick={handleClick}
    >
      {/* Blurred content */}
      <div className="blur-md select-none pointer-events-none opacity-60">
        {children}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/40 backdrop-blur-sm rounded-2xl border border-border/50 transition-all group-hover:bg-background/50">
        <div className="text-center space-y-3 p-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="font-display font-semibold text-foreground">{sectionTitle}</p>
            <p className="text-sm text-muted-foreground">
              This is what VCs see. You don't. Yet.
            </p>
          </div>
          <p className="text-xs text-primary font-medium group-hover:underline">
            Click to unlock →
          </p>
        </div>
      </div>
    </div>
  );
}
