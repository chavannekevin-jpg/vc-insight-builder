import { useNavigate } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function DemoFloatingCTA() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 300px
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="relative bg-card border border-border rounded-xl shadow-2xl shadow-primary/10 p-4 max-w-xs">
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute -top-2 -right-2 p-1.5 rounded-full bg-muted border border-border hover:bg-accent transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-3 h-3" />
        </button>
        
        <div className="space-y-3">
          <div>
            <p className="font-semibold text-sm text-foreground">Like what you see?</p>
            <p className="text-xs text-muted-foreground mt-1">
              Get your own personalized analysis and unlock access to 800+ matched investors.
            </p>
          </div>
          
          <Button
            onClick={() => navigate('/checkout')}
            className="w-full gap-2 text-sm"
            size="sm"
          >
            Create Your Analysis
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
