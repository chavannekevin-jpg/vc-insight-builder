import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Building2, Users, BarChart3 } from "lucide-react";

interface DemoContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DemoContactModal = ({ open, onOpenChange }: DemoContactModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success("Thanks! We'll be in touch soon.");
    
    setTimeout(() => {
      onOpenChange(false);
      setIsSubmitted(false);
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
            <p className="text-muted-foreground">
              We'll reach out within 24 hours to discuss how MemoReadyVC can help your accelerator.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Get MemoReadyVC for Your Accelerator</DialogTitle>
          <DialogDescription>
            Join leading accelerators using AI-powered founder readiness tools
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 py-4">
          <div className="flex flex-col items-center text-center p-3 bg-muted/50 rounded-lg">
            <Building2 className="h-6 w-6 text-primary mb-2" />
            <span className="text-xs text-muted-foreground">White-label Platform</span>
          </div>
          <div className="flex flex-col items-center text-center p-3 bg-muted/50 rounded-lg">
            <Users className="h-6 w-6 text-primary mb-2" />
            <span className="text-xs text-muted-foreground">Cohort Management</span>
          </div>
          <div className="flex flex-col items-center text-center p-3 bg-muted/50 rounded-lg">
            <BarChart3 className="h-6 w-6 text-primary mb-2" />
            <span className="text-xs text-muted-foreground">Analytics Dashboard</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" placeholder="Jane Smith" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <Input id="email" type="email" placeholder="jane@accelerator.com" required />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="organization">Organization Name</Label>
            <Input id="organization" placeholder="Your Accelerator / VC Firm" required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cohort-size">Typical Cohort Size</Label>
            <Input id="cohort-size" placeholder="e.g., 10-15 startups per batch" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">What are you looking to achieve?</Label>
            <Textarea 
              id="message" 
              placeholder="Tell us about your program and how you'd like to use MemoReadyVC..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Request Demo"}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            We'll respond within 24 hours with pricing and next steps.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
