import { AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { WaitlistModal } from "./WaitlistModal";
import { useWaitlistMode } from "@/hooks/useWaitlistMode";

export const WaitlistBanner = () => {
  const [showModal, setShowModal] = useState(false);
  const { data: waitlistMode } = useWaitlistMode();

  if (!waitlistMode?.isActive) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-b border-primary/30">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="font-medium">
                <strong>Pre-Launch Mode:</strong> Memo Generator launches soon
              </span>
            </div>
            <Button 
              onClick={() => setShowModal(true)}
              variant="outline"
              size="sm"
              className="border-primary/40 hover:bg-primary/20"
            >
              <Sparkles className="h-3 w-3 mr-2" />
              Get 50% Off - Early Access
            </Button>
          </div>
        </div>
      </div>
      <WaitlistModal open={showModal} onOpenChange={setShowModal} />
    </>
  );
};
