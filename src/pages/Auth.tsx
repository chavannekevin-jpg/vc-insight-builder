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

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const selectedPlan = searchParams.get('plan');
  const selectedPrice = searchParams.get('price');
  const startupInviteCode = searchParams.get('startup_invite');
  
  // Validate startup invite code
  const { inviteInfo, isLoading: isValidatingInvite } = useStartupReferral(startupInviteCode);

  // Store invite code in sessionStorage for use in Intake
  useEffect(() => {
    if (startupInviteCode && inviteInfo?.isValid) {
      sessionStorage.setItem('startup_invite_code', startupInviteCode);
    }
  }, [startupInviteCode, inviteInfo]);

  useEffect(() => {
    // Check for existing session once on mount
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
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

    // Set up auth state listener for future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Redirect on sign-in events
        if (session?.user && event === 'SIGNED_IN') {
          const redirect = searchParams.get('redirect') || '/hub';
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
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse opacity-30" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse opacity-30" style={{ animationDelay: '1s' }} />
      
      <div className="w-full max-w-lg relative z-10">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Button>

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          {/* Referral badge */}
          {inviteInfo?.isValid && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 backdrop-blur-xl mb-3">
              <Gift className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold text-green-500">
                {inviteInfo.discountPercent}% discount from {inviteInfo.investorName || 'an investor'}
              </span>
            </div>
          )}
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-xl mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              {selectedPlan ? selectedPlan.replace('_', ' ') : 'Get Started'}
            </span>
          </div>
          
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            {isSignUp ? "Create Your Account" : "Welcome Back"}
          </h1>
          
          {selectedPrice && (
            <p className="text-2xl font-bold text-foreground mb-2">
              {selectedPrice}
            </p>
          )}
          
          <p className="text-muted-foreground">
            {isSignUp ? "Join the revolution of transparent startup feedback" : "Sign in to continue your journey"}
          </p>
        </div>

        {/* Form Card */}
        <div className="relative group">
          <div className="absolute inset-0 gradient-primary opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300" />
          <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-glow">
            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-6">
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-bold text-foreground">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="founder@startup.com"
                  className="h-12 bg-background/50 border-border/50 focus:border-primary transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-bold text-foreground">
                  Password *
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="h-12 bg-background/50 border-border/50 focus:border-primary transition-colors"
                  required
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="w-full h-12 gradient-primary shadow-glow hover:shadow-glow-strong transition-all duration-300 font-bold uppercase tracking-wider"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    isSignUp ? "Create Account" : "Sign In"
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-muted/30 border border-border/30">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Your information is secure and encrypted
                </p>
              </div>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-primary hover:text-primary-glow transition-colors font-semibold"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
