import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Rocket, X } from "lucide-react";

interface FloatingDemoCTAProps {
  onContactClick: () => void;
}

export const FloatingDemoCTA = ({ onContactClick }: FloatingDemoCTAProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300 && !isDismissed) {
        setIsVisible(true);
      } else if (window.scrollY <= 300) {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDismissed]);

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="relative bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-4 shadow-xl border border-primary/20">
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute -top-2 -right-2 bg-background rounded-full p-1 shadow-md hover:bg-muted transition-colors"
        >
          <X className="h-3 w-3 text-muted-foreground" />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="bg-primary-foreground/20 rounded-full p-2">
            <Rocket className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="text-primary-foreground">
            <p className="font-semibold text-sm">Like what you see?</p>
            <p className="text-xs opacity-90">Get this for your accelerator</p>
          </div>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={onContactClick}
            className="ml-2 whitespace-nowrap"
          >
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
};
