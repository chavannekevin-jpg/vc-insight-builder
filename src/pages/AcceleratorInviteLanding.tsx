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
  MessageCircle,
  ArrowLeft
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
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        {/* Animated mesh gradient background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 -left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 -right-1/4 w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <div className="relative z-10 text-foreground flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="text-muted-foreground">Loading your invite...</span>
        </div>
      </div>
    );
  }

  // If already authenticated
  if (session && user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 -left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 -right-1/4 w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <div className="relative z-10 text-foreground flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <span className="text-muted-foreground">Redirecting to your portal...</span>
        </div>
      </div>
    );
  }

  // Invalid or missing invite code
  if (!inviteCode || !inviteInfo?.isValid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated mesh gradient background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 -left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 -right-1/4 w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '4s' }} />
        </div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        <div className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center backdrop-blur-xl">
            <Gift className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold mb-3 text-foreground">Invalid Invite Link</h1>
          <p className="text-muted-foreground mb-8">
            This accelerator invite link is invalid, expired, or has reached its usage limit.
          </p>
          <Button 
            onClick={() => navigate('/auth')}
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
          >
            Continue to Sign Up
          </Button>
        </div>
      </div>
    );
  }

  const isFreeAccess = inviteInfo.discountPercent === 100;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
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

      <div className="container mx-auto px-4 py-12 lg:py-20 relative z-10">
        {/* Top invitation banner */}
        <div className="text-center mb-10 lg:mb-14 animate-fade-in">
          {/* Accelerator badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-xl mb-6 shadow-lg shadow-primary/5">
            <Rocket className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">
              {inviteInfo.acceleratorName}
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5">
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

                <div className="relative text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2 text-foreground">
                    {isSignUp ? "Create Your Account" : "Welcome Back"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isSignUp ? "Start your VC analysis journey" : "Sign in to continue"}
                  </p>
                </div>

                <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="relative space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground/80">
                      Email Address
                    </Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-foreground/80">
                      Password
                    </Label>
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

                  {/* Discount/Free access banner */}
                  <div className={`flex items-center gap-3 p-4 rounded-xl backdrop-blur-xl ${
                    isFreeAccess 
                      ? 'bg-success/10 border border-success/20' 
                      : 'bg-primary/10 border border-primary/20'
                  }`}>
                    <Gift className={`w-5 h-5 ${isFreeAccess ? 'text-success' : 'text-primary'} flex-shrink-0`} />
                    <span className={`text-sm ${isFreeAccess ? 'text-success' : 'text-primary'} font-medium`}>
                      {isFreeAccess 
                        ? "Full access included — no payment required!"
                        : `Your ${inviteInfo.discountPercent}% discount will be applied at checkout`}
                    </span>
                  </div>

                  {/* Custom message from accelerator */}
                  {inviteInfo.customMessage && (
                    <div className="flex gap-3 p-4 rounded-xl bg-muted/30 border border-border/30 backdrop-blur-xl">
                      <MessageCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground italic">
                        "{inviteInfo.customMessage}"
                      </p>
                    </div>
                  )}

                  <div className="pt-2">
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
                        isSignUp ? "Get Started" : "Sign In"
                      )}
                    </Button>
                  </div>

                  {/* Security badge */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground/60" />
                    <p className="text-xs text-muted-foreground/60">
                      Secure & encrypted
                    </p>
                  </div>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/30" />
                  </div>
                </div>

                {/* Toggle auth mode */}
                <div className="text-center">
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
          </div>

          {/* Right side: What you get */}
          <div className="order-1 lg:order-2 space-y-6">
            <div className="relative group">
              {/* Subtle border glow on hover */}
              <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
              
              <div className="relative bg-card/40 backdrop-blur-2xl border border-border/50 rounded-3xl p-8 shadow-2xl overflow-hidden">
                {/* Top highlight */}
                <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                
                <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-foreground">What You Get</span>
                </h3>
                
                <TooltipProvider delayDuration={200}>
                  <div className="space-y-4">
                    {ACCELERATOR_PERKS.map((perk, index) => {
                      const Icon = perk.icon;
                      return (
                        <Tooltip key={index}>
                          <TooltipTrigger asChild>
                            <div className="flex gap-4 p-3 -m-3 rounded-2xl cursor-help group/perk hover:bg-primary/5 transition-all duration-300">
                              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover/perk:bg-primary/20 group-hover/perk:border-primary/30 transition-all duration-300">
                                <Icon className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-foreground text-sm">{perk.title}</h4>
                                  <Info className="w-3 h-3 text-muted-foreground/40" />
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">{perk.description}</p>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-xs bg-card/95 backdrop-blur-xl border-border/50">
                            <p className="text-sm">{perk.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </TooltipProvider>
              </div>
            </div>

            {/* Accelerator trust badge */}
            <div className="relative bg-card/30 backdrop-blur-2xl border border-border/30 rounded-2xl p-5 text-center overflow-hidden">
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              <p className="text-sm text-muted-foreground">
                Provided by <span className="font-semibold text-foreground">{inviteInfo.acceleratorName}</span>
              </p>
              {inviteInfo.remainingUses !== null && (
                <p className="text-xs text-muted-foreground/70 mt-1.5">
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
