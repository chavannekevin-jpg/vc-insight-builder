import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Users, BarChart3, Zap, Check, ArrowRight, Sparkles, ArrowLeft, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { GoogleSignInButton, AuthDivider } from "@/components/auth/GoogleSignInButton";
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
  
  // Auth form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const [authError, setAuthError] = useState("");

  // Check if user already has an accelerator with completed onboarding
  useEffect(() => {
    const checkExistingAccelerator = async () => {
      if (!isAuthenticated || authLoading || !user) return;

      try {
        // Check if user has accelerator role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "accelerator")
          .maybeSingle();

        if (roleData) {
          // Check if they have an accelerator with completed onboarding
          const { data: accData } = await supabase
            .from("accelerators")
            .select("id, onboarding_completed")
            .eq("ecosystem_head_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (accData?.onboarding_completed) {
            // Redirect to dashboard
            navigate("/accelerator/dashboard");
            return;
          } else if (accData && !accData.onboarding_completed) {
            // Redirect to onboarding
            navigate("/accelerator/onboarding?bypassed=true");
            return;
          }
        }
      } catch (error) {
        console.error("Error checking existing accelerator:", error);
      }
    };

    checkExistingAccelerator();
  }, [isAuthenticated, authLoading, user, navigate]);
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    
    if (!email || !password) {
      setAuthError("Please enter email and password");
      return;
    }

    if (isSignUp && password.length < 6) {
      setAuthError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/accelerator/signup`,
          },
        });

        if (error) throw error;
        if (data.user) {
          toast.success("Account created!");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        toast.success("Signed in!");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      if (error.message?.includes("already registered")) {
        setAuthError("This email is already registered. Try signing in instead.");
        setIsSignUp(false);
      } else {
        setAuthError(error.message || "Authentication failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Admin emails that bypass paywall
  const ADMIN_EMAILS = ["chavanne.kevin@gmail.com"];
  const isAdminUser = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());

  const handleCheckout = async () => {
    if (!acceleratorName.trim()) {
      toast.error("Please enter your accelerator name");
      return;
    }

    setIsLoading(true);
    try {
      // Admin bypass - skip Stripe entirely
      if (isAdminUser) {
        const { data, error } = await supabase.functions.invoke("create-accelerator-admin-bypass", {
          body: {
            acceleratorName: acceleratorName.trim(),
          },
        });

        if (error) throw error;
        if (data?.success) {
          toast.success("Ecosystem created!");
          navigate("/accelerator/onboarding?bypassed=true");
          return;
        }
      }

      // Normal checkout flow
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

      {/* Back to Home */}
      <Link
        to="/accelerator/auth"
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back</span>
      </Link>

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

              {/* Step 1: Accelerator Name */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    1
                  </div>
                  <Label htmlFor="acceleratorName" className="text-foreground font-medium">
                    Your Accelerator Name
                  </Label>
                </div>
                <Input
                  id="acceleratorName"
                  placeholder="e.g., TechStars London"
                  value={acceleratorName}
                  onChange={(e) => setAcceleratorName(e.target.value)}
                  className="bg-background"
                />
              </div>

              {/* Step 2: Account (if not authenticated) */}
              <AnimatePresence mode="wait">
                {!isAuthenticated && !authLoading && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                        2
                      </div>
                      <span className="text-foreground font-medium">Create Your Account</span>
                    </div>

                    {/* Toggle Tabs */}
                    <div className="flex gap-1 p-1 rounded-lg bg-muted mb-4">
                      <button
                        onClick={() => setIsSignUp(true)}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                          isSignUp
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="flex items-center justify-center gap-1.5">
                          <UserPlus className="w-3.5 h-3.5" />
                          New Account
                        </span>
                      </button>
                      <button
                        onClick={() => setIsSignUp(false)}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                          !isSignUp
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="flex items-center justify-center gap-1.5">
                          <LogIn className="w-3.5 h-3.5" />
                          Sign In
                        </span>
                      </button>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-3">
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-background"
                      />
                      <Input
                        type="password"
                        placeholder={isSignUp ? "Create password (min 6 chars)" : "Password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-background"
                      />
                      
                      {authError && (
                        <p className="text-sm text-destructive">{authError}</p>
                      )}

                      <Button
                        type="submit"
                        disabled={isLoading}
                        variant="secondary"
                        className="w-full"
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                            {isSignUp ? "Creating..." : "Signing in..."}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                            {isSignUp ? "Create Account" : "Sign In"}
                          </span>
                        )}
                      </Button>

                      {/* Google Sign In */}
                      <AuthDivider />
                      <GoogleSignInButton 
                        redirectTo="/accelerator/signup" 
                        disabled={isLoading}
                      />
                    </form>
                  </motion.div>
                )}

                {isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6 p-3 rounded-lg bg-success/10 border border-success/30"
                  >
                    <div className="flex items-center gap-2 text-success">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Signed in as {user?.email}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA Button */}
              <Button
                onClick={handleCheckout}
                disabled={isLoading || authLoading || !isAuthenticated || !acceleratorName.trim()}
                className="w-full h-12 text-lg font-semibold gradient-primary text-primary-foreground shadow-glow"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {isAuthenticated ? "Proceed to Payment" : "Complete Steps Above"}
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>

              {!isAuthenticated && !authLoading && acceleratorName.trim() && (
                <p className="text-center text-xs text-muted-foreground mt-3">
                  Create an account above to proceed to payment
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
