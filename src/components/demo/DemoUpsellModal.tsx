import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight, Sparkles, TrendingUp, Users, FileText } from "lucide-react";

interface DemoUpsellModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
  description?: string;
}

export function DemoUpsellModal({ 
  open, 
  onOpenChange, 
  feature = "this feature",
  description = "Unlock the full ecosystem with your personalized analysis."
}: DemoUpsellModalProps) {
  const navigate = useNavigate();

  const handleUnlock = () => {
    onOpenChange(false);
    navigate('/checkout');
  };

  const benefits = [
    { icon: FileText, label: "Personalized VC Analysis", description: "38 strategic tools tailored to your startup" },
    { icon: TrendingUp, label: "Market Intelligence", description: "Real-time market lens briefings" },
    { icon: Users, label: "Investor Matching", description: "800+ VCs matched to your profile" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center">This is a Demo</DialogTitle>
          <DialogDescription className="text-center">
            {feature} is available in the full analysis. {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <benefit.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{benefit.label}</p>
                <p className="text-xs text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={handleUnlock} className="w-full gap-2">
            <Sparkles className="w-4 h-4" />
            Get Your Own Analysis
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full">
            Continue Exploring Demo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
