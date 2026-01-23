import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Plus, LogIn, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AcceleratorAuth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"choose" | "signin">("choose");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Check if already authenticated with accelerator role
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Check if user has accelerator role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "accelerator")
          .maybeSingle();

        if (roleData) {
          // Check if they have an accelerator
          const { data: accelerator } = await supabase
            .from("accelerators")
            .select("id, onboarding_completed")
            .eq("ecosystem_head_id", session.user.id)
            .maybeSingle();

          if (accelerator) {
            if (accelerator.onboarding_completed) {
              navigate("/accelerator/dashboard");
            } else {
              navigate("/accelerator/onboarding");
            }
            return;
          }
        }
      }
      setCheckingSession(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        // Check accelerator role after sign in
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "accelerator")
          .maybeSingle();

        if (roleData) {
          const { data: accelerator } = await supabase
            .from("accelerators")
            .select("id, onboarding_completed")
            .eq("ecosystem_head_id", session.user.id)
            .maybeSingle();

          if (accelerator) {
            if (accelerator.onboarding_completed) {
              navigate("/accelerator/dashboard");
            } else {
              navigate("/accelerator/onboarding");
            }
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user has accelerator role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "accelerator")
        .maybeSingle();

      if (!roleData) {
        toast.error("This account is not registered as an accelerator");
        await supabase.auth.signOut();
        return;
      }

      // Check for accelerator
      const { data: accelerator } = await supabase
        .from("accelerators")
        .select("id, onboarding_completed")
        .eq("ecosystem_head_id", data.user.id)
        .maybeSingle();

      if (!accelerator) {
        toast.error("No accelerator found for this account");
        return;
      }

      toast.success("Welcome back!");
      if (accelerator.onboarding_completed) {
        navigate("/accelerator/dashboard");
      } else {
        navigate("/accelerator/onboarding");
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(error.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* Back to Home */}
      <Link
        to="/"
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Accelerator Portal</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Accelerator Access
            </h1>
            <p className="text-muted-foreground">
              {mode === "choose" 
                ? "Create a new ecosystem or sign in to an existing one"
                : "Sign in to your accelerator dashboard"
              }
            </p>
          </div>

          {mode === "choose" ? (
            /* Choice Cards */
            <div className="space-y-4">
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => navigate("/accelerator/signup")}
                className="w-full p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 hover:border-primary/50 transition-all group text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/30 transition-colors">
                    <Plus className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Create an Ecosystem</h3>
                    <p className="text-muted-foreground text-sm">
                      Start fresh with a new accelerator. Set up cohorts, invite founders, and track performance.
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 text-primary text-sm font-medium">
                      Get started for €1,000
                      <span className="text-muted-foreground">• One-time payment</span>
                    </div>
                  </div>
                </div>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => setMode("signin")}
                className="w-full p-6 rounded-2xl bg-card border border-border/50 hover:border-border transition-all group text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-muted/80 transition-colors">
                    <LogIn className="w-7 h-7 text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Sign In to Ecosystem</h3>
                    <p className="text-muted-foreground text-sm">
                      Access your existing accelerator dashboard, manage cohorts, and view startup analytics.
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 text-foreground text-sm font-medium">
                      Continue to your dashboard →
                    </div>
                  </div>
                </div>
              </motion.button>
            </div>
          ) : (
            /* Sign In Form */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-2xl border border-border/50 p-8"
            >
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@accelerator.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-base font-semibold"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Sign In to Dashboard
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-border">
                <button
                  onClick={() => setMode("choose")}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back to options
                </button>
              </div>
            </motion.div>
          )}

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            Need help? Contact{" "}
            <a href="mailto:support@uglybaby.io" className="text-primary hover:underline">
              support@uglybaby.io
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
