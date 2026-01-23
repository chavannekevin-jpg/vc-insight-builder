import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Users, BarChart3, Zap, Check, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const features = [
  {
    icon: Users,
    title: "Unified Cohort Management",
    description: "Invite unlimited team members to collaboratively manage and support your startups.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Access live performance signals, fundability scores, and cohort-wide insights.",
  },
  {
    icon: Zap,
    title: "Founder Reports On-Demand",
    description: "View the same rich scorecards founders see—spider matrices, VC Quick Takes, and strategic tools.",
  },
  {
    icon: Building2,
    title: "Multi-Cohort Architecture",
    description: "Manage multiple batches, programs, and cohorts from a single unified dashboard.",
  },
];

const benefits = [
  "Unlimited cohorts and batches",
  "Unlimited team members",
  "Full access to all founder reports",
  "Cohort-wide analytics and benchmarking",
  "Mentor and advisor collaboration tools",
  "Priority support",
];

export default function AcceleratorSignup() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [acceleratorName, setAcceleratorName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error("Please create an account first");
      navigate("/accelerator/auth");
      return;
    }

    if (!acceleratorName.trim()) {
      toast.error("Please enter your accelerator name");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-accelerator-checkout", {
        body: {
          acceleratorName: acceleratorName.trim(),
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Failed to start checkout");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Accelerator Operating System</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Build Your Startup Ecosystem
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The operating system for accelerators. Manage cohorts, track performance, 
            and support founders—all from one unified platform.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex gap-4 p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm"
              >
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Pricing Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="sticky top-8"
          >
            <div className="rounded-2xl bg-card border-2 border-primary/30 p-8 shadow-xl shadow-primary/5">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <Building2 className="w-4 h-4" />
                  Ecosystem License
                </div>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-5xl font-bold text-foreground">€1,000</span>
                  <span className="text-muted-foreground">/one-time</span>
                </div>
                <p className="text-muted-foreground">Lifetime access to your ecosystem</p>
              </div>

              {/* Benefits List */}
              <div className="space-y-3 mb-8">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-success" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Name Input */}
              <div className="mb-6">
                <Label htmlFor="acceleratorName" className="text-foreground mb-2 block">
                  Your Accelerator Name
                </Label>
                <Input
                  id="acceleratorName"
                  placeholder="e.g., TechStars London"
                  value={acceleratorName}
                  onChange={(e) => setAcceleratorName(e.target.value)}
                  className="bg-background"
                />
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleCheckout}
                disabled={isLoading || authLoading}
                className="w-full h-12 text-lg font-semibold gradient-primary text-primary-foreground shadow-glow"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Your Ecosystem
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>

              {!isAuthenticated && !authLoading && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  You'll need to{" "}
                  <button
                    onClick={() => navigate("/auth?redirect=/accelerator/signup")}
                    className="text-primary hover:underline"
                  >
                    sign in
                  </button>{" "}
                  to continue
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
