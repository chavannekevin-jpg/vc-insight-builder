import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Lock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId?: string;
}

export const WaitlistModal = ({ open, onOpenChange, companyId }: WaitlistModalProps) => {
  const navigate = useNavigate();

  const handleJoinWaitlist = () => {
    onOpenChange(false);
    navigate(`/waitlist-checkout${companyId ? `?companyId=${companyId}` : ''}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-5 w-5 text-primary" />
            <Badge variant="secondary" className="font-semibold">
              Pre-Launch Access
            </Badge>
          </div>
          <DialogTitle className="text-2xl">
            The Memo Generator Launches Soon
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            We're putting the finishing touches on the Investment Memorandum Generator. 
            It will be released at full launch.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/30">
            <div className="flex items-start gap-3">
              <Sparkles className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Lock In 50% Early Access Discount
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Join the waitlist now and pay only <span className="font-bold text-primary">€29.99</span> instead of €59.99
                </p>
                <ul className="space-y-1.5 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Immediate access when we launch</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>50% discount locked in forever</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Priority support at launch</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Your memo delivered within 24 hours of launch</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1 px-1">
            <p>
              <strong>How it works:</strong> Pre-pay now at the discounted rate. Your payment secures your spot. 
              The memo will be generated and delivered as soon as we launch (expected within 2 weeks).
            </p>
            <p>
              <strong>Refund Policy:</strong> Full refund available if you change your mind before launch.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button 
            onClick={handleJoinWaitlist}
            className="w-full"
            size="lg"
          >
            Join Waitlist & Pay €29.99
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            onClick={() => onOpenChange(false)}
            variant="ghost"
            size="sm"
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
