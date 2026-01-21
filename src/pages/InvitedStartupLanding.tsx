import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Session, User } from "@supabase/supabase-js";
import { 
  Lock, 
  Sparkles, 
  Gift, 
  CheckCircle2, 
  FileText, 
  Users, 
  Brain, 
  Target,
  TrendingUp,
  Shield,
  Loader2,
  UserPlus
} from "lucide-react";
import { useStartupReferral } from "@/hooks/useStartupReferral";
import { useFounderReferral, processFounderReferral } from "@/hooks/useFounderReferral";

// Condensed perks for the invited landing page
const INVITED_PERKS = [
  {
    icon: FileText,
    title: "9-Page VC Investment Memo",
    description: "Professional analysis of your startup the way VCs evaluate deals internally"
  },
  {
    icon: Users,
    title: "800+ Curated Investors",
    description: "AI-matched VCs, angels & family offices filtered by stage, sector, and thesis fit"
  },
  {
    icon: Brain,
    title: "VC Brain: 60+ Guides",
    description: "Insider knowledge on what VCs actually look for and how they make decisions"
  },
  {
    icon: Target,
    title: "Investment Readiness Score",
    description: "See exactly where you stand across 8 dimensions, benchmarked against funded companies"
  },
  {
    icon: TrendingUp,
    title: "30+ Prepared VC Questions",
    description: "The exact questions investors will ask — with draft answers you can refine"
  },
  {
    icon: Shield,
    title: "Red Flag Detection",
    description: "Surface deal-breakers before VCs find them. Fix issues before they cost you meetings"
  }
];

export default function InvitedStartupLanding() {
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

  // Support both investor invite (?code=) and founder referral (?founder=)
  const investorInviteCode = searchParams.get('code');
  const founderReferralCode = searchParams.get('founder');
  
  // Determine which type of referral we're dealing with
  const isFounderReferral = !!founderReferralCode;
  const referralCode = founderReferralCode || investorInviteCode;
  
  // Validate startup invite code (investor referral)
  const { inviteInfo: investorInviteInfo, isLoading: isValidatingInvestorInvite } = useStartupReferral(investorInviteCode);
  
  // Validate founder referral code
  const { referralInfo: founderReferralInfo, isLoading: isValidatingFounderReferral } = useFounderReferral(founderReferralCode);
  
  // Unified invite info
  const inviteInfo = isFounderReferral 
    ? { isValid: founderReferralInfo?.isValid || false, discountPercent: founderReferralInfo?.discountPercent || 20 }
    : investorInviteInfo;
  
  const isValidatingInvite = isFounderReferral ? isValidatingFounderReferral : isValidatingInvestorInvite;

  // Store invite code in sessionStorage for use in Intake
  useEffect(() => {
    if (referralCode && inviteInfo?.isValid) {
      if (isFounderReferral) {
        sessionStorage.setItem('founder_referral_code', founderReferralCode!);
      } else {
        sessionStorage.setItem('startup_invite_code', investorInviteCode!);
      }
    }
  }, [referralCode, inviteInfo, isFounderReferral, founderReferralCode, investorInviteCode]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            navigate('/hub', { replace: true });
          }, 0);
          return;
        }
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event === 'SIGNED_IN') {
          navigate('/hub', { replace: true });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

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
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/intake`,
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

  // Loading state
  if (isCheckingAuth || isValidatingInvite) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-foreground flex items-center gap-2">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span>Loading your invite...</span>
        </div>
      </div>
    );
  }

  // If already authenticated
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

  // Invalid or missing invite code - redirect to regular auth
  if (!referralCode || !inviteInfo?.isValid) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <Gift className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Invalid Invite Link</h1>
          <p className="text-muted-foreground mb-6">
            This invite link is invalid, expired, or has reached its usage limit.
          </p>
          <Button onClick={() => navigate('/auth')}>
            Continue to Sign Up
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse opacity-30" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse opacity-30" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl opacity-20 transform -translate-x-1/2 -translate-y-1/2" />
      
      <div className="container mx-auto px-4 py-8 lg:py-16 relative z-10">
        {/* Top invitation banner */}
        <div className="text-center mb-8 lg:mb-12 animate-fade-in">
          {/* Referrer type indicator */}
          {isFounderReferral && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <UserPlus className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Referred by a fellow founder</span>
            </div>
          )}
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">You've Been Invited to Join </span>
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">UglyBaby</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isFounderReferral 
              ? "Another founder thought you'd benefit from our VC analysis tools — and you get a discount!"
              : "Get your professional VC analysis and access 800+ investors — with an exclusive discount from your network."}
          </p>
        </div>

        {/* Main content: side by side on desktop */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto items-start">
          
          {/* Left side: Sign up form */}
          <div className="order-2 lg:order-1">
            <div className="relative group">
              <div className="absolute inset-0 gradient-primary opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300" />
              <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 lg:p-8 shadow-glow">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">
                    {isSignUp ? "Create Your Account" : "Welcome Back"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isSignUp ? "Start your VC analysis journey" : "Sign in to continue"}
                  </p>
                </div>

                <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-5">
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

                  {/* Discount reminder */}
                  {(() => {
                    const baseDiscount = 50;
                    const referralDiscount = inviteInfo.discountPercent || 0;
                    const totalDiscount = Math.min(baseDiscount + referralDiscount, 90);
                    return (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
                        <Gift className="w-4 h-4 text-success flex-shrink-0" />
                        <span className="text-sm text-success font-medium">
                          Your {totalDiscount}% discount will be applied at checkout
                        </span>
                      </div>
                    );
                  })()}

                  <Button
                    type="submit"
                    disabled={loading}
                    size="lg"
                    className="w-full h-12 gradient-primary shadow-glow hover:shadow-glow-strong transition-all duration-300 font-bold uppercase tracking-wider"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      isSignUp ? "Create Account" : "Sign In"
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/30">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Your information is secure and encrypted
                    </p>
                  </div>
                </form>

                <div className="mt-5 text-center">
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

          {/* Right side: What you get */}
          <div className="order-1 lg:order-2 space-y-6">
            <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 lg:p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                What You Get
              </h3>
              
              <div className="space-y-4">
                {INVITED_PERKS.map((perk, index) => {
                  const Icon = perk.icon;
                  return (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">{perk.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{perk.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-card/30 border border-border/30">
                <div className="text-xl font-bold text-primary">760+</div>
                <div className="text-xs text-muted-foreground">Funds</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-card/30 border border-border/30">
                <div className="text-xl font-bold text-primary">800+</div>
                <div className="text-xs text-muted-foreground">Investors</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-card/30 border border-border/30">
                <div className="text-xl font-bold text-primary">38+</div>
                <div className="text-xs text-muted-foreground">Tools</div>
              </div>
            </div>

            {/* Quote */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
              <p className="text-sm text-muted-foreground italic">
                "Most founders don't understand how VCs actually evaluate startups. This analysis forces clarity by organizing your thinking around what VCs actually care about."
              </p>
              <p className="text-xs text-primary mt-2 font-medium">— Built from 10+ years of VC experience</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
