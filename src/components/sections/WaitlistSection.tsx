import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ModernCard } from "../ModernCard";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Lock } from "lucide-react";

export const WaitlistSection = () => {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [stage, setStage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Welcome to the platform!",
        description: "You're now registered. Let's set up your company profile.",
      });
      
      // Store registration data and redirect to portal
      localStorage.setItem('founderEmail', email);
      localStorage.setItem('companyName', companyName);
      localStorage.setItem('companyStage', stage);
      
      navigate('/portal');
    }, 1000);
  };

  return (
    <section id="waitlist-form" className="py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif mb-4">Get Your Investment Memo</h2>
          <p className="text-lg text-muted-foreground">
            Join early for the discounted rate, or skip the line and get your memo within a week.
          </p>
        </div>

        <ModernCard className="shadow-2xl border-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@startup.com"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-bold">
                Company Name *
              </Label>
              <Input
                id="company"
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your Startup Inc."
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stage" className="text-sm font-bold">
                Stage *
              </Label>
              <select
                id="stage"
                required
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full h-11 px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Select stage...</option>
                <option value="idea">Idea Stage</option>
                <option value="mvp">MVP</option>
                <option value="pre-seed">Pre-Seed</option>
                <option value="seed">Seed</option>
                <option value="series-a">Series A</option>
                <option value="series-b+">Series B+</option>
              </select>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="w-full gradient-primary shadow-lg hover:shadow-glow-strong"
              >
                {isSubmitting ? "Processing..." : "Join Waitlist"}
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-muted/50 border border-border">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Your information is secure and will only be used for waitlist purposes
              </p>
            </div>
          </form>
        </ModernCard>
      </div>
    </section>
  );
};
