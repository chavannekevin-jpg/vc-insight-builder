import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Session, User } from "@supabase/supabase-js";
import { 
  Lock, 
  Sparkles, 
  Gift, 
  FileText, 
  Users, 
  Brain, 
  Target,
  TrendingUp,
  Shield,
  Loader2,
  Rocket,
  Info,
  MessageCircle
} from "lucide-react";
import { useAcceleratorInvite, incrementAcceleratorInviteUsage } from "@/hooks/useAcceleratorInvite";

const ACCELERATOR_PERKS = [
  {
    icon: FileText,
    title: "Full VC Audit",
    description: "The internal memo partners use to pass or pursue — see what VCs will say before you pitch",
    tooltip: "A comprehensive 9-page investment analysis covering Problem, Solution, Market, Competition, Team, Business Model, Traction, and Vision."
  },
  {
    icon: Users,
    title: "800+ Curated Investors",
    description: "AI-matched VCs, angels & family offices filtered by stage, sector, and thesis fit",
    tooltip: "Our database includes 760+ funds and 800+ individual investors across Europe and the US."
  },
  {
    icon: Target,
    title: "Investment Readiness Score",
    description: "Scored across 8 dimensions — know exactly where you stand before reaching out",
    tooltip: "Get scored on Problem-Solution Fit, Market Opportunity, Competitive Positioning, Team Strength, Business Model, Traction Quality, Financial Projections, and Vision Clarity."
  },
  {
    icon: TrendingUp,
    title: "30+ Prepared VC Questions",
    description: "The exact questions investors will ask — with draft answers you can refine",
    tooltip: "Each section includes the specific questions VCs will ask, with rationale and preparation tips."
  },
  {
    icon: Brain,
    title: "Market Lens & Sector Briefings",
    description: "Tailwinds, headwinds, and funding landscape for your specific market",
    tooltip: "Curated from 50+ industry reports and funding benchmarks for your exact vertical."
  },
  {
    icon: Shield,
    title: "Red Flag Detection",
    description: "Surface deal-breakers before VCs find them. Fix issues before they cost you meetings",
    tooltip: "AI-powered analysis identifies coherence gaps, narrative inconsistencies, and common deal-breakers."
  }
];

export default function AcceleratorInviteLanding() {
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

  const inviteCode = searchParams.get('code');
  const { inviteInfo, isLoading: isValidatingInvite } = useAcceleratorInvite(inviteCode);

  // Store invite code in sessionStorage for use in Intake/Checkout
  useEffect(() => {
    if (inviteCode && inviteInfo?.isValid) {
      sessionStorage.setItem('accelerator_invite_code', inviteCode);
      sessionStorage.setItem('accelerator_discount_percent', String(inviteInfo.discountPercent));
    }
  }, [inviteCode, inviteInfo]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Increment usage and redirect
          if (inviteCode) {
            await incrementAcceleratorInviteUsage(inviteCode);
          }
          navigate('/hub', { replace: true });
          return;
        }
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event === 'SIGNED_IN') {
          if (inviteCode) {
            await incrementAcceleratorInviteUsage(inviteCode);
          }
          navigate('/hub', { replace: true });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, inviteCode]);

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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

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

  // Invalid or missing invite code
  if (!inviteCode || !inviteInfo?.isValid) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <Gift className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Invalid Invite Link</h1>
          <p className="text-muted-foreground mb-6">
            This accelerator invite link is invalid, expired, or has reached its usage limit.
          </p>
          <Button onClick={() => navigate('/auth')}>
            Continue to Sign Up
          </Button>
        </div>
      </div>
    );
  }

  const isFreeAccess = inviteInfo.discountPercent === 100;

  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse opacity-30" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse opacity-30" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl opacity-20 transform -translate-x-1/2 -translate-y-1/2" />
      
      <div className="container mx-auto px-4 py-8 lg:py-16 relative z-10">
        {/* Top invitation banner */}
        <div className="text-center mb-8 lg:mb-12 animate-fade-in">
          {/* Accelerator badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Rocket className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {inviteInfo.acceleratorName}
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">Welcome to </span>
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">UglyBaby</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isFreeAccess 
              ? "Your accelerator has provided you with complimentary access to our full VC analysis platform."
              : `Your accelerator has unlocked a ${inviteInfo.discountPercent}% discount on our VC analysis tools.`}
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

                  {/* Discount/Free access banner */}
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${isFreeAccess ? 'bg-success/10 border border-success/20' : 'bg-primary/10 border border-primary/20'}`}>
                    <Gift className={`w-4 h-4 ${isFreeAccess ? 'text-success' : 'text-primary'} flex-shrink-0`} />
                    <span className={`text-sm ${isFreeAccess ? 'text-success' : 'text-primary'} font-medium`}>
                      {isFreeAccess 
                        ? "Full access included — no payment required!"
                        : `Your ${inviteInfo.discountPercent}% discount will be applied at checkout`}
                    </span>
                  </div>

                  {/* Custom message from accelerator */}
                  {inviteInfo.customMessage && (
                    <div className="flex gap-3 p-4 rounded-lg bg-muted/30 border border-border/30">
                      <MessageCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground italic">
                        "{inviteInfo.customMessage}"
                      </p>
                    </div>
                  )}

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
                      isSignUp ? "Get Started" : "Sign In"
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
              
              <TooltipProvider delayDuration={200}>
                <div className="space-y-4">
                  {ACCELERATOR_PERKS.map((perk, index) => {
                    const Icon = perk.icon;
                    return (
                      <Tooltip key={index}>
                        <TooltipTrigger asChild>
                          <div className="flex gap-3 p-2 -m-2 rounded-xl cursor-help group hover:bg-primary/5 transition-colors">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-semibold text-foreground text-sm">{perk.title}</h4>
                                <Info className="w-3 h-3 text-muted-foreground opacity-50" />
                              </div>
                              <p className="text-sm text-muted-foreground">{perk.description}</p>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-xs">
                          <p className="text-sm">{perk.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </TooltipProvider>
            </div>

            {/* Accelerator trust badge */}
            <div className="bg-card/30 backdrop-blur-xl border border-border/30 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Provided by <span className="font-semibold text-foreground">{inviteInfo.acceleratorName}</span>
              </p>
              {inviteInfo.remainingUses !== null && (
                <p className="text-xs text-muted-foreground mt-1">
                  {inviteInfo.remainingUses} spots remaining
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
