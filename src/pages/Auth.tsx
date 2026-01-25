import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Session, User } from "@supabase/supabase-js";
import { Lock, Sparkles, ArrowLeft, Gift } from "lucide-react";
import { useStartupReferral } from "@/hooks/useStartupReferral";
import { GoogleSignInButton, AuthDivider } from "@/components/auth/GoogleSignInButton";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const selectedPlan = searchParams.get('plan');
  const selectedPrice = searchParams.get('price');
  const startupInviteCode = searchParams.get('startup_invite');
  
  // Redirect to dedicated invite page if startup_invite param is present
  useEffect(() => {
    if (startupInviteCode) {
      navigate(`/invite?code=${startupInviteCode}`, { replace: true });
    }
  }, [startupInviteCode, navigate]);
  
  // Validate startup invite code (kept for backwards compatibility)
  const { inviteInfo, isLoading: isValidatingInvite } = useStartupReferral(startupInviteCode);

  useEffect(() => {
    // Check for existing session once on mount
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check if user is admin - admins can access startup hub without a company
          const { data: adminRole } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .eq("role", "admin")
            .maybeSingle();

          const redirect = searchParams.get('redirect') || '/hub';
          // Use setTimeout to ensure navigation happens after state updates
          setTimeout(() => {
            navigate(redirect, { replace: true });
          }, 0);
          return; // Don't set isCheckingAuth to false, we're redirecting
        }
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkSession();

    // Set up auth state listener for future changes (only for external auth like OAuth)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only redirect on sign-in if not already navigating (prevents double navigation)
        if (session?.user && event === 'SIGNED_IN' && !isNavigating) {
          const redirect = searchParams.get('redirect') || '/hub';
          setIsNavigating(true);
          navigate(redirect, { replace: true });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, searchParams]); // Include dependencies

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const redirectPath = searchParams.get('redirect');
      const emailRedirectTo =
        redirectPath && redirectPath.startsWith('/')
          ? `${window.location.origin}${redirectPath}`
          : `${window.location.origin}/intake`;
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo,
        },
      });

      if (signUpError) throw signUpError;

      if (signUpData.user) {
        toast({
          title: "Welcome to UglyBaby!",
          description: "Complete your profile in the next step...",
        });
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please enter email and password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Track sign-in in profiles table
      if (data.user) {
        supabase
          .from('profiles')
          .update({ 
            last_sign_in_at: new Date().toISOString(),
            sign_in_count: (await supabase.from('profiles').select('sign_in_count').eq('id', data.user.id).single()).data?.sign_in_count + 1 || 1
          })
          .eq('id', data.user.id)
          .then(() => {});
      }

      toast({
        title: "Welcome back!",
        description: "Redirecting to portal...",
      });

      // Direct navigation after successful login (don't rely on auth listener)
      const redirect = searchParams.get('redirect') || '/hub';
      setIsNavigating(true);
      navigate(redirect, { replace: true });
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (session && user) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <span>Redirecting to your portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 -right-1/4 w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      {/* Back button - fixed top-left */}
      <Button
        variant="ghost"
        className="fixed top-4 left-4 z-20 text-muted-foreground hover:text-foreground backdrop-blur-sm bg-card/30 border border-border/30 rounded-full px-4 py-2 hover:bg-card/50 transition-all duration-300"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="w-full max-w-md relative z-10">

        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          {/* Referral badge */}
          {inviteInfo?.isValid && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/30 backdrop-blur-xl mb-4">
              <Gift className="w-4 h-4 text-success" />
              <span className="text-sm font-semibold text-success">
                {inviteInfo.discountPercent}% discount from {inviteInfo.investorName || 'an investor'}
              </span>
            </div>
          )}
          
          {/* Floating badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-xl mb-6 shadow-lg shadow-primary/5">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">
              {selectedPlan ? selectedPlan.replace('_', ' ') : 'Get Started'}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            {isSignUp ? "Create Your Account" : "Welcome Back"}
          </h1>
          
          {selectedPrice && (
            <p className="text-2xl font-bold text-foreground mb-2">
              {selectedPrice}
            </p>
          )}
          
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            {isSignUp ? "Join the revolution of transparent startup feedback" : "Sign in to continue your journey"}
          </p>
        </div>

        {/* Form Card - Modern Glassmorphism */}
        <div className="relative group">
          {/* Animated border glow */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-3xl opacity-50" />
          
          {/* Glass card */}
          <div className="relative bg-card/40 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-border/50 overflow-hidden">
            {/* Top highlight */}
            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-tl-3xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-secondary/10 to-transparent rounded-br-3xl" />

            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="relative space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground/80">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="founder@startup.com"
                    className="h-12 bg-muted/50 border-border/40 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 placeholder:text-muted-foreground/50 text-foreground [&:-webkit-autofill]:bg-muted/50 [&:-webkit-autofill]:[-webkit-text-fill-color:hsl(var(--foreground))] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground/80">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="h-12 bg-muted/50 border-border/40 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 placeholder:text-muted-foreground/50 text-foreground [&:-webkit-autofill]:bg-muted/50 [&:-webkit-autofill]:[-webkit-text-fill-color:hsl(var(--foreground))] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
                    required
                  />
                </div>
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="w-full h-13 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground rounded-xl font-semibold text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    isSignUp ? "Create Account" : "Sign In"
                  )}
                </Button>
              </div>

              {/* Security badge */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <Lock className="w-3.5 h-3.5 text-muted-foreground/60" />
                <p className="text-xs text-muted-foreground/60">
                  Secure & encrypted
                </p>
              </div>
            </form>

            {/* Google Sign In */}
            <AuthDivider />
            <GoogleSignInButton 
              redirectTo={searchParams.get('redirect') || '/hub'} 
              disabled={loading}
            />

            {/* Toggle auth mode */}
            <div className="text-center mt-6">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                {isSignUp
                  ? <>Already have an account? <span className="font-semibold text-primary">Sign in</span></>
                  : <>Don't have an account? <span className="font-semibold text-primary">Sign up</span></>}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom floating indicator */}
        <div className="flex justify-center mt-8">
          <div className="flex gap-1.5">
            <div className={`w-8 h-1 rounded-full transition-colors duration-300 ${isSignUp ? 'bg-primary' : 'bg-border'}`} />
            <div className={`w-8 h-1 rounded-full transition-colors duration-300 ${!isSignUp ? 'bg-primary' : 'bg-border'}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
