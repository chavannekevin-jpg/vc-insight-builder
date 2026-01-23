import { useNavigate } from "react-router-dom";
import { ArrowRight, X, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

export function DemoFloatingCTA() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative group">
        {/* Golden glow effect on hover */}
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/50 via-yellow-400/40 to-amber-500/50 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Main card */}
        <div className="relative bg-card/95 backdrop-blur-xl border-2 border-border/50 group-hover:border-amber-500/70 rounded-2xl shadow-2xl shadow-black/20 group-hover:shadow-amber-500/20 p-5 max-w-xs overflow-hidden transition-all duration-300">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          
          {/* Dismiss button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-muted/50 hover:bg-muted border border-border/30 hover:border-border/50 transition-all duration-200 hover:scale-110"
            aria-label="Dismiss"
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
          
          <div className="relative space-y-4">
            {/* Header with icon */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Like what you see?</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Get your personalized analysis and access 800+ matched investors.
                </p>
              </div>
            </div>
            
            {/* CTA Button */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full group/btn relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/90 px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Create Your Analysis
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </span>
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
