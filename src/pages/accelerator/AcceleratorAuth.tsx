import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Plus, LogIn, ArrowLeft, Sparkles, UserPlus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AcceleratorSelectDialog } from "@/components/accelerator/AcceleratorSelectDialog";

type AuthMode = "choose" | "create-auth" | "signin" | "claim";

interface Accelerator {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  onboarding_completed: boolean | null;
  created_at: string | null;
}

interface ClaimInfo {
  acceleratorName: string;
  pendingEmail: string | null;
}

export default function AcceleratorAuth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const claimToken = searchParams.get("claim");
  
  const [mode, setMode] = useState<AuthMode>(claimToken ? "claim" : "choose");
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Claim mode state
  const [claimInfo, setClaimInfo] = useState<ClaimInfo | null>(null);
  const [loadingClaimInfo, setLoadingClaimInfo] = useState(!!claimToken);
  const [claimError, setClaimError] = useState<string | null>(null);
  
  // Multi-ecosystem selection state
  const [userAccelerators, setUserAccelerators] = useState<Accelerator[]>([]);
  const [showSelectDialog, setShowSelectDialog] = useState(false);

  // Fetch claim info when token is present
  useEffect(() => {
    if (!claimToken) return;
    
    const fetchClaimInfo = async () => {
      setLoadingClaimInfo(true);
      try {
        // Find the pending member with this token
        const { data: member, error: memberError } = await supabase
          .from("accelerator_members")
          .select("accelerator_id, invite_email, joined_at")
          .eq("invite_token", claimToken)
          .eq("role", "head")
          .maybeSingle();

        if (memberError) throw memberError;
        
        if (!member) {
          setClaimError("This claim link is invalid or has expired.");
          return;
        }

        if (member.joined_at) {
          setClaimError("This ecosystem has already been claimed.");
          return;
        }

        // Get accelerator name
        const { data: acc, error: accError } = await supabase
          .from("accelerators")
          .select("name")
          .eq("id", member.accelerator_id)
          .single();

        if (accError || !acc) {
          setClaimError("Ecosystem not found.");
          return;
        }

        setClaimInfo({
          acceleratorName: acc.name,
          pendingEmail: member.invite_email,
        });
      } catch (error) {
        console.error("Error fetching claim info:", error);
        setClaimError("Failed to load claim information.");
      } finally {
        setLoadingClaimInfo(false);
      }
    };

    fetchClaimInfo();
  }, [claimToken]);

  // Helper function to check accelerators and navigate accordingly
  const checkAndNavigateToAccelerator = async (userId: string) => {
    // First check via ecosystem_head_id
    const { data: ownedAccelerators } = await supabase
      .from("accelerators")
      .select("id, name, slug, logo_url, description, onboarding_completed, created_at")
      .eq("ecosystem_head_id", userId);

    // Also check via accelerator_members for team access
    const { data: memberAccelerators } = await supabase
      .from("accelerator_members")
      .select(`
        accelerator_id,
        accelerators:accelerator_id (
          id, name, slug, logo_url, description, onboarding_completed, created_at
        )
      `)
      .eq("user_id", userId)
      .not("joined_at", "is", null);

    // Combine and deduplicate
    const allAccelerators: Accelerator[] = [];
    const seenIds = new Set<string>();

    if (ownedAccelerators) {
      for (const acc of ownedAccelerators) {
        if (!seenIds.has(acc.id)) {
          seenIds.add(acc.id);
          allAccelerators.push(acc);
        }
      }
    }

    if (memberAccelerators) {
      for (const member of memberAccelerators) {
        const acc = member.accelerators as unknown as Accelerator;
        if (acc && !seenIds.has(acc.id)) {
          seenIds.add(acc.id);
          allAccelerators.push(acc);
        }
      }
    }

    if (allAccelerators.length === 0) {
      return false;
    }

    if (allAccelerators.length === 1) {
      // Single accelerator - navigate directly
      const acc = allAccelerators[0];
      if (acc.onboarding_completed) {
        navigate(`/accelerator/dashboard?id=${acc.id}`);
      } else {
        navigate(`/accelerator/onboarding?id=${acc.id}`);
      }
      return true;
    }

    // Multiple accelerators - show selection dialog
    setUserAccelerators(allAccelerators);
    setShowSelectDialog(true);
    return true;
  };

  const handleAcceleratorSelect = (accelerator: Accelerator) => {
    setShowSelectDialog(false);
    if (accelerator.onboarding_completed) {
      navigate(`/accelerator/dashboard?id=${accelerator.id}`);
    } else {
      navigate(`/accelerator/onboarding?id=${accelerator.id}`);
    }
  };

  // Handle claiming after authentication
  const handleClaimEcosystem = async (userId: string) => {
    if (!claimToken) return false;
    
    try {
      const { data, error } = await supabase.functions.invoke("claim-accelerator-head", {
        body: { claimToken },
      });

      if (error) throw error;

      toast.success(`Welcome to ${data.acceleratorName}!`);
      
      // Navigate to appropriate page
      if (data.onboardingCompleted) {
        navigate(`/accelerator/dashboard?id=${data.acceleratorId}`);
      } else {
        navigate(`/accelerator/onboarding?id=${data.acceleratorId}`);
      }
      return true;
    } catch (error: any) {
      console.error("Claim error:", error);
      toast.error(error.message || "Failed to claim ecosystem");
      return false;
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
        
        // If in claim mode and authenticated, try to claim immediately
        if (claimToken && claimInfo && !claimError) {
          const claimed = await handleClaimEcosystem(session.user.id);
          if (claimed) {
            setCheckingSession(false);
            return;
          }
        }
        
        // Check if user has accelerator role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "accelerator")
          .maybeSingle();

        if (roleData) {
          const hasAccelerator = await checkAndNavigateToAccelerator(session.user.id);
          // If single accelerator, navigation happens inside the function
          // If multiple, dialog is shown - either way, stop checking
          setCheckingSession(false);
          return;
        }
      }
      setCheckingSession(false);
    };

    // Only check session after claim info is loaded (or if not in claim mode)
    if (!claimToken || (!loadingClaimInfo && (claimInfo || claimError))) {
      checkSession();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setIsAuthenticated(true);
        
        // If in claim mode, claim the ecosystem
        if (claimToken && claimInfo && !claimError) {
          await handleClaimEcosystem(session.user.id);
          return;
        }
        
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "accelerator")
          .maybeSingle();

        if (roleData) {
          await checkAndNavigateToAccelerator(session.user.id);
        }
      } else if (event === "SIGNED_OUT") {
        setIsAuthenticated(false);
        setUserAccelerators([]);
        setShowSelectDialog(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, claimToken, claimInfo, claimError, loadingClaimInfo]);

  // Handle sign up for new ecosystem creation
  const handleCreateSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/accelerator/signup`,
        },
      });

      if (error) throw error;

      if (data.user) {
        toast.success("Account created! Proceeding to setup...");
        // Navigate to signup page to enter accelerator name and pay
        navigate("/accelerator/signup");
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      if (error.message?.includes("already registered")) {
        toast.error("This email is already registered. Try signing in instead.");
        setIsSignUp(false);
      } else {
        toast.error(error.message || "Failed to create account");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sign in for new ecosystem creation (existing users)
  const handleCreateSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Signed in! Proceeding to setup...");
      // Navigate to signup page to enter accelerator name and pay
      navigate("/accelerator/signup");
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(error.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sign in for existing accelerator admins
  const handleAcceleratorSignIn = async (e: React.FormEvent) => {
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
        setIsLoading(false);
        return;
      }

      // Check for accelerator(s)
      const hasAccelerator = await checkAndNavigateToAccelerator(data.user.id);
      
      if (!hasAccelerator) {
        toast.error("No accelerator found for this account");
        setIsLoading(false);
        return;
      }

      toast.success("Welcome back!");
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(error.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle claim mode authentication
  const handleClaimAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    if (isSignUp && password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/accelerator/auth?claim=${claimToken}`,
          },
        });

        if (error) throw error;

        if (data.user) {
          // Auto-confirm should be on, so try claiming immediately
          const claimed = await handleClaimEcosystem(data.user.id);
          if (!claimed) {
            toast.success("Account created! Claiming ecosystem...");
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Claim the ecosystem
        await handleClaimEcosystem(data.user.id);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      if (error.message?.includes("already registered")) {
        toast.error("This email is already registered. Try signing in instead.");
        setIsSignUp(false);
      } else {
        toast.error(error.message || "Authentication failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle "Create an Ecosystem" click
  const handleCreateClick = () => {
    if (isAuthenticated) {
      // Already authenticated, go directly to signup
      navigate("/accelerator/signup");
    } else {
      // Need to authenticate first
      setMode("create-auth");
    }
  };

  if (checkingSession || loadingClaimInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getHeaderText = () => {
    switch (mode) {
      case "choose":
        return "Create a new ecosystem or sign in to an existing one";
      case "create-auth":
        return isSignUp ? "Create an account to get started" : "Sign in to continue";
      case "signin":
        return "Sign in to your accelerator dashboard";
      case "claim":
        return claimInfo 
          ? `Sign in or create an account to claim ${claimInfo.acceleratorName}`
          : "Claim your ecosystem";
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
              <span className="text-sm font-medium text-primary">
                {mode === "claim" ? "Ecosystem Invitation" : "Accelerator Portal"}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              {mode === "claim" && claimInfo 
                ? `Welcome to ${claimInfo.acceleratorName}`
                : mode === "create-auth" 
                  ? "Create Your Ecosystem" 
                  : "Accelerator Access"}
            </h1>
            <p className="text-muted-foreground">{getHeaderText()}</p>
          </div>

          {/* Claim Error State */}
          {mode === "claim" && claimError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-destructive/10 border border-destructive/30 rounded-2xl p-8 text-center"
            >
              <p className="text-destructive font-medium mb-4">{claimError}</p>
              <Button onClick={() => navigate("/accelerator/auth")} variant="outline">
                Go to Accelerator Portal
              </Button>
            </motion.div>
          )}

          {/* Claim Mode */}
          {mode === "claim" && claimInfo && !claimError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-2xl border border-border/50 p-8"
            >
              {/* Info Banner */}
              <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <Check className="w-5 h-5" />
                  <span className="font-semibold">You've been invited!</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {claimInfo.pendingEmail 
                    ? `This invitation is for ${claimInfo.pendingEmail}. Please use this email to claim the ecosystem.`
                    : "Create an account or sign in to become the ecosystem head."}
                </p>
              </div>

              {/* Toggle Tabs */}
              <div className="flex gap-2 p-1 rounded-xl bg-muted mb-6">
                <button
                  onClick={() => setIsSignUp(true)}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                    isSignUp
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    New Account
                  </span>
                </button>
                <button
                  onClick={() => setIsSignUp(false)}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                    !isSignUp
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Existing Account
                  </span>
                </button>
              </div>

              <form onSubmit={handleClaimAuth} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={claimInfo.pendingEmail || "you@accelerator.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background"
                  />
                  {claimInfo.pendingEmail && (
                    <p className="text-xs text-amber-600">
                      Please use {claimInfo.pendingEmail} to claim this ecosystem
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={isSignUp ? "Create a password (min 6 chars)" : "••••••••"}
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
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isSignUp ? "Creating account..." : "Signing in..."}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      {isSignUp ? "Create Account & Claim" : "Sign In & Claim"}
                    </span>
                  )}
                </Button>
              </form>
            </motion.div>
          )}

          {mode === "choose" && (
            /* Choice Cards */
            <div className="space-y-4">
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                onClick={handleCreateClick}
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
          )}

          {mode === "create-auth" && (
            /* Create Auth Form - Sign Up or Sign In */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-2xl border border-border/50 p-8"
            >
              {/* Toggle Tabs */}
              <div className="flex gap-2 p-1 rounded-xl bg-muted mb-6">
                <button
                  onClick={() => setIsSignUp(true)}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                    isSignUp
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    New Account
                  </span>
                </button>
                <button
                  onClick={() => setIsSignUp(false)}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                    !isSignUp
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Existing Account
                  </span>
                </button>
              </div>

              <form onSubmit={isSignUp ? handleCreateSignUp : handleCreateSignIn} className="space-y-5">
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
                    placeholder={isSignUp ? "Create a password (min 6 chars)" : "••••••••"}
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
                      {isSignUp ? "Creating account..." : "Signing in..."}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                      {isSignUp ? "Create Account & Continue" : "Sign In & Continue"}
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-border">
                <button
                  onClick={() => {
                    setMode("choose");
                    setEmail("");
                    setPassword("");
                  }}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back to options
                </button>
              </div>
            </motion.div>
          )}

          {mode === "signin" && (
            /* Sign In Form for Existing Accelerator Admins */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-2xl border border-border/50 p-8"
            >
              <form onSubmit={handleAcceleratorSignIn} className="space-y-5">
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
                  onClick={() => {
                    setMode("choose");
                    setEmail("");
                    setPassword("");
                  }}
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

      {/* Ecosystem Selection Dialog */}
      <AcceleratorSelectDialog
        open={showSelectDialog}
        onOpenChange={setShowSelectDialog}
        accelerators={userAccelerators}
        onSelect={handleAcceleratorSelect}
        isLoading={isLoading}
      />
    </div>
  );
}
