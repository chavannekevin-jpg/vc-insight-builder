import { Info, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const DemoModeBanner = () => {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  if (dismissed) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/30 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Info className="w-4 h-4 text-primary" />
          <span className="text-foreground/80">
            <span className="font-semibold text-primary">Demo Mode</span> — You're viewing a fictional accelerator cohort. 
            <button 
              onClick={() => navigate("/accelerators")}
              className="ml-1 text-primary hover:underline"
            >
              Apply this to your cohort →
            </button>
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="h-6 w-6 p-0 hover:bg-primary/20"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};
