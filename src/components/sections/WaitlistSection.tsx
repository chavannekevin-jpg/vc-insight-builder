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

    // Store temporarily for auth page
    sessionStorage.setItem("pendingEmail", email);
    sessionStorage.setItem("pendingCompany", companyName);
    sessionStorage.setItem("pendingStage", stage);

    toast({
      title: "Create Your Account",
      description: "Sign up to get started with UglyBaby",
    });
    
    navigate('/auth');
  };

  return (
    <section id="waitlist-form" className="py-24 px-6 sm:px-8 lg:px-12">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-serif mb-6 font-bold tracking-tight">Get Your UglyBaby Memo</h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Join early for the discounted rate, or skip the line and get your memo within a week.
          </p>
        </div>

        <ModernCard className="shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-7">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@startup.com"
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="company" className="text-sm font-semibold">
                Company Name *
              </Label>
              <Input
                id="company"
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your Startup Inc."
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="stage" className="text-sm font-semibold">
                Stage *
              </Label>
              <select
                id="stage"
                required
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
              >
                <option value="">Select stage...</option>
                <option value="pre-seed">Pre-Seed (Building team, early traction)</option>
                <option value="seed">Seed (Product-market fit, scaling)</option>
                <option value="series-a">Series A (Scaling operations)</option>
                <option value="series-b+">Series B+ (Growth stage)</option>
                <option value="mvp">MVP/Idea Stage</option>
              </select>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="w-full h-14 gradient-primary shadow-lg hover:shadow-xl transition-all duration-500 font-semibold text-base rounded-2xl hover:scale-105"
              >
                {isSubmitting ? "Processing..." : "Join Waitlist"}
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-muted/30 border border-border/50">
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
