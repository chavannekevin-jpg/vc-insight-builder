import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  ArrowLeft,
  Building2
} from "lucide-react";

interface AcceleratorInfo {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  defaultDiscount: number;
  inviteId: string;
}

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

export default function AcceleratorJoinLanding() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [acceleratorInfo, setAcceleratorInfo] = useState<AcceleratorInfo | null>(null);
  const [isLoadingAccelerator, setIsLoadingAccelerator] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { slug } = useParams<{ slug: string }>();

  // Fetch accelerator by slug and get/create default invite
  useEffect(() => {
    const fetchAccelerator = async () => {
      if (!slug) {
        setNotFound(true);
        setIsLoadingAccelerator(false);
        return;
      }

      try {
        console.log("Starting accelerator lookup for slug:", slug);
        
        // First, find the accelerator by slug
        const { data: accelerator, error: accError } = await supabase
          .from("accelerators")
          .select("id, name, slug, description, default_discount_percent, max_discounted_startups")
          .eq("slug", slug)
          .eq("is_active", true)
          .maybeSingle();

        console.log("Accelerator lookup result:", { accelerator, accError });

        if (accError) {
          console.error("Accelerator fetch error:", accError);
          // Don't set notFound for permission errors, might be a temporary issue
          setNotFound(true);
          setIsLoadingAccelerator(false);
          return;
        }

        if (!accelerator) {
          console.log("No accelerator found for slug:", slug);
          setNotFound(true);
          setIsLoadingAccelerator(false);
          return;
        }
        
        console.log("Found accelerator:", accelerator.name);

        // Check if discount cap has been reached
        let effectiveDiscount = accelerator.default_discount_percent || 0;
        
        if (accelerator.max_discounted_startups !== null) {
          // First get all invite IDs for this accelerator
          const { data: invites } = await supabase
            .from("accelerator_invites")
            .select("id")
            .eq("linked_accelerator_id", accelerator.id);
          
          if (invites && invites.length > 0) {
            const inviteIds = invites.map(i => i.id);
            
            // Count companies linked to these invites
            const { count } = await supabase
              .from("companies")
              .select("id", { count: "exact", head: true })
              .in("accelerator_invite_id", inviteIds);
            
            // If cap reached, set discount to 0
            if (count !== null && count >= accelerator.max_discounted_startups) {
              effectiveDiscount = 0;
            }
          }
        }

        // Look for an existing default invite for this accelerator
        let { data: existingInvite } = await supabase
          .from("accelerator_invites")
          .select("id, code, discount_percent")
          .eq("linked_accelerator_id", accelerator.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        let inviteId = existingInvite?.id;

        // If no invite exists, try to create one (may fail for anon users - that's OK)
        if (!inviteId) {
          const inviteCode = `${accelerator.slug.toUpperCase().replace(/-/g, "")}-${Date.now().toString(36).toUpperCase()}`;
          
          const { data: newInvite, error: createError } = await supabase
            .from("accelerator_invites")
            .insert({
              code: inviteCode,
              accelerator_name: accelerator.name,
              accelerator_slug: accelerator.slug,
              linked_accelerator_id: accelerator.id,
              discount_percent: effectiveDiscount,
              is_active: true,
            })
            .select("id")
            .single();

          if (createError) {
            // For anon users, insert will fail due to RLS - that's OK
            // The invite will be created after they sign up
            console.log("Could not create invite (expected for anon users):", createError.message);
          } else {
            inviteId = newInvite.id;
          }
        }

        setAcceleratorInfo({
          id: accelerator.id,
          name: accelerator.name,
          slug: accelerator.slug,
          description: accelerator.description,
          defaultDiscount: effectiveDiscount,
          inviteId: inviteId || null, // Only store valid invite ID, null otherwise
        });
      } catch (error) {
        console.error("Error fetching accelerator:", error);
        setNotFound(true);
      } finally {
        setIsLoadingAccelerator(false);
      }
    };

    fetchAccelerator();
  }, [slug]);

  // Store accelerator info in sessionStorage for use in Intake
  useEffect(() => {
    if (acceleratorInfo) {
      // Store accelerator ID always (needed to create invite after auth)
      sessionStorage.setItem('accelerator_id', acceleratorInfo.id);
      sessionStorage.setItem('accelerator_name', acceleratorInfo.name);
      sessionStorage.setItem('accelerator_slug', acceleratorInfo.slug);
      sessionStorage.setItem('accelerator_discount_percent', String(acceleratorInfo.defaultDiscount));
      
      // Only store invite ID if we have a valid one
      if (acceleratorInfo.inviteId) {
        sessionStorage.setItem('accelerator_invite_id', acceleratorInfo.inviteId);
      } else {
        // Clear any stale invite ID
        sessionStorage.removeItem('accelerator_invite_id');
      }
    }
  }, [acceleratorInfo]);

  // Auth state handling
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Increment usage and redirect
          if (acceleratorInfo?.inviteId) {
            await incrementInviteUsage(acceleratorInfo.inviteId);
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
          if (acceleratorInfo?.inviteId) {
            await incrementInviteUsage(acceleratorInfo.inviteId);
          }
          navigate('/hub', { replace: true });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, acceleratorInfo]);

  const incrementInviteUsage = async (inviteId: string) => {
    try {
      const { data: invite } = await supabase
        .from("accelerator_invites")
        .select("uses")
        .eq("id", inviteId)
        .single();
      
      if (invite) {
        await supabase
          .from("accelerator_invites")
          .update({ uses: (invite.uses || 0) + 1 })
          .eq("id", inviteId);
      }
    } catch (error) {
      console.error("Error incrementing invite usage:", error);
    }
  };

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
  if (isCheckingAuth || isLoadingAccelerator) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 -left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 -right-1/4 w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <div className="relative z-10 text-foreground flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="text-muted-foreground">Loading accelerator...</span>
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

  // Accelerator not found
  if (notFound || !acceleratorInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 -left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 -right-1/4 w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '4s' }} />
        </div>
        
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        <div className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center backdrop-blur-xl">
            <Building2 className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold mb-3 text-foreground">Accelerator Not Found</h1>
          <p className="text-muted-foreground mb-8">
            This accelerator link is invalid or the program is no longer active.
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

  const isFreeAccess = acceleratorInfo.defaultDiscount === 100;

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
      
      {/* Back button */}
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
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {acceleratorInfo.name}
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5">
            <span className="text-foreground">Welcome to </span>
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">UglyBaby</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isFreeAccess 
              ? `${acceleratorInfo.name} has provided you with complimentary access to our full VC analysis platform.`
              : acceleratorInfo.defaultDiscount > 0
                ? `${acceleratorInfo.name} has unlocked a ${acceleratorInfo.defaultDiscount}% discount on our VC analysis tools.`
                : `Join ${acceleratorInfo.name}'s ecosystem and get access to our VC analysis tools.`}
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
                      className="h-12 bg-muted/50 border-border/40 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 placeholder:text-muted-foreground/50 text-foreground"
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
                      placeholder="••••••••"
                      className="h-12 bg-muted/50 border-border/40 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 placeholder:text-muted-foreground/50 text-foreground"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isSignUp ? (
                      <>
                        <Rocket className="w-4 h-4 mr-2" />
                        Create Account
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </Button>
                </form>

                {/* Discount reminder */}
                {acceleratorInfo.defaultDiscount > 0 && (
                  <div className="relative mt-6 p-4 rounded-xl bg-success/5 border border-success/20">
                    <div className="flex items-center gap-3">
                      <Gift className="w-5 h-5 text-success" />
                      <p className="text-sm text-success font-medium">
                        {isFreeAccess 
                          ? "Full access included with your accelerator program!"
                          : `${acceleratorInfo.defaultDiscount}% discount will be applied at checkout`}
                      </p>
                    </div>
                  </div>
                )}

                <div className="relative text-center mt-6">
                  <p className="text-sm text-muted-foreground">
                    {isSignUp ? "Already have an account? " : "Don't have an account? "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-primary hover:underline font-medium transition-colors"
                    >
                      {isSignUp ? "Sign in" : "Create one"}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Features */}
          <div className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-8">
              <h3 className="text-xl font-semibold mb-6 text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                What You Get
              </h3>
              
              <TooltipProvider>
                <div className="space-y-4">
                  {ACCELERATOR_PERKS.map((perk, index) => (
                    <Tooltip key={perk.title}>
                      <TooltipTrigger asChild>
                        <div 
                          className="group relative p-4 rounded-2xl bg-card/30 backdrop-blur-xl border border-border/30 hover:border-primary/30 hover:bg-card/50 transition-all duration-300 cursor-pointer"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                              <perk.icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-foreground">{perk.title}</h4>
                                <Info className="w-3.5 h-3.5 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{perk.description}</p>
                            </div>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs bg-card border-border/50 backdrop-blur-xl">
                        <p className="text-sm">{perk.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
