import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Network, ArrowLeft, Lock, Sparkles, Mail, KeyRound } from "lucide-react";
import { GoogleSignInButton, AuthDivider } from "@/components/auth/GoogleSignInButton";

const InvestorAuth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState(searchParams.get("code") || "");
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") !== "signin");
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [codeValidation, setCodeValidation] = useState<{ valid: boolean; inviterName?: string } | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST (per Supabase best practices)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          // Defer Supabase calls with setTimeout to prevent deadlock
          setTimeout(async () => {
            // Check if user is admin - admins can access investor hub without invite code
            const { data: adminRole } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id)
              .eq("role", "admin")
              .maybeSingle();

            if (adminRole) {
              // Admin bypass - check if they have investor profile, if not create minimal access
              const { data: profile } = await (supabase
                .from("investor_profiles") as any)
                .select("onboarding_completed")
                .eq("id", session.user.id)
                .maybeSingle();

              if (profile?.onboarding_completed) {
                navigate("/investor/dashboard");
              } else {
                navigate("/investor/onboarding");
              }
              return;
            }

            const { data: roleData } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id)
              .eq("role", "investor")
              .maybeSingle();

            if (roleData) {
              const { data: profile } = await (supabase
                .from("investor_profiles") as any)
                .select("onboarding_completed")
                .eq("id", session.user.id)
                .maybeSingle();

              if (profile?.onboarding_completed) {
                navigate("/investor/dashboard");
              } else {
                navigate("/investor/onboarding");
              }
            }
          }, 0);
        }
        setCheckingSession(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setCheckingSession(false);
      }
      // If session exists, onAuthStateChange will handle navigation
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Validate invite code when it changes
  useEffect(() => {
    const validateCode = async () => {
      if (!inviteCode || inviteCode.length < 6) {
        setCodeValidation(null);
        return;
      }

      setIsValidatingCode(true);
      try {
        const { data: invite, error } = await (supabase
          .from("investor_invites") as any)
          .select(`
            *,
            inviter:investor_profiles!investor_invites_inviter_id_fkey(full_name)
          `)
          .eq("code", inviteCode.toUpperCase())
          .eq("is_active", true)
          .maybeSingle();

        if (error || !invite) {
          setCodeValidation({ valid: false });
        } else {
          // Check if code has remaining uses and hasn't expired
          const hasUses = !invite.max_uses || invite.uses < invite.max_uses;
          const notExpired = !invite.expires_at || new Date(invite.expires_at) > new Date();
          
          if (hasUses && notExpired) {
            setCodeValidation({ 
              valid: true, 
              inviterName: (invite.inviter as any)?.full_name || "An investor" 
            });
          } else {
            setCodeValidation({ valid: false });
          }
        }
      } catch (err) {
        setCodeValidation({ valid: false });
      } finally {
        setIsValidatingCode(false);
      }
    };

    const debounce = setTimeout(validateCode, 500);
    return () => clearTimeout(debounce);
  }, [inviteCode]);

  // Add investor role using secure database function
  const addInvestorRoleWithInvite = async (userId: string, code: string): Promise<{ success: boolean; message: string; inviter_id?: string }> => {
    const { data, error } = await supabase
      .rpc('add_investor_role_with_invite', {
        p_user_id: userId,
        p_invite_code: code
      });
    
    if (error) {
      console.error('Failed to add investor role:', error);
      return { success: false, message: error.message };
    }
    
    return data as { success: boolean; message: string; inviter_id?: string };
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    if (!inviteCode || !codeValidation?.valid) {
      toast({ 
        title: "Valid invite code required", 
        description: "You need a valid invite code from an existing member to join.",
        variant: "destructive" 
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/investor/onboarding`,
        },
      });

      if (error) {
        // Check if error is because user already exists
        if (error.message?.toLowerCase().includes("already registered") || 
            error.message?.toLowerCase().includes("already exists") ||
            error.message?.toLowerCase().includes("user already")) {
          // User already has an account - try to sign them in and add investor role
          toast({
            title: "Account exists",
            description: "You already have an account. Signing you in and adding investor access...",
          });
          
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError) {
            toast({
              title: "Sign in failed",
              description: "Your account exists but the password is incorrect. Try signing in instead.",
              variant: "destructive",
            });
            setIsSignUp(false); // Switch to sign-in mode
            return;
          }

          if (signInData.user) {
            // Check if already has investor role
            const { data: existingRole } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", signInData.user.id)
              .eq("role", "investor")
              .maybeSingle();

            if (existingRole) {
              // Already an investor - check onboarding
              const { data: profile } = await (supabase
                .from("investor_profiles") as any)
                .select("onboarding_completed")
                .eq("id", signInData.user.id)
                .maybeSingle();

              if (profile?.onboarding_completed) {
                toast({ title: "Welcome back!", description: "You're already in the investor network." });
                navigate("/investor/dashboard");
              } else {
                navigate("/investor/onboarding");
              }
              return;
            }

            // Add investor role using secure database function
            const roleResult = await addInvestorRoleWithInvite(signInData.user.id, inviteCode);

            if (!roleResult.success) {
              console.error("Failed to add investor role:", roleResult.message);
              toast({
                title: "Failed to join investor network",
                description: roleResult.message || "Please try again or contact support.",
                variant: "destructive",
              });
              return;
            }

            sessionStorage.setItem("investor_invite_code", inviteCode.toUpperCase());

            toast({
              title: "Welcome to the Investor Network!",
              description: `You've been added by ${codeValidation?.inviterName || "an investor"}. Complete your investor profile.`,
            });
            navigate("/investor/onboarding");
          }
          return;
        }
        
        throw error;
      }

      if (data.user) {
        // CRITICAL: Add investor role using secure database function
        const roleResult = await addInvestorRoleWithInvite(data.user.id, inviteCode);

        if (!roleResult.success) {
          // Role insertion failed - this is critical
          console.error("Critical error: Failed to add investor role:", roleResult.message);
          
          // Sign out the user to prevent orphaned account
          await supabase.auth.signOut();
          
          toast({
            title: "Account setup failed",
            description: roleResult.message || "We couldn't complete your registration. Please try again or contact support.",
            variant: "destructive",
          });
          return;
        }

        // Store the invite code in session storage for onboarding
        sessionStorage.setItem("investor_invite_code", inviteCode.toUpperCase());

        toast({
          title: "Welcome to the network!",
          description: `You've been invited by ${codeValidation?.inviterName || "an investor"}.`,
        });
        navigate("/investor/onboarding");
      }
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Check if user is admin - admins can access without invite code
        const { data: adminRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (adminRole) {
          // Admin bypass - check if they have investor profile
          const { data: profile } = await (supabase
            .from("investor_profiles") as any)
            .select("onboarding_completed")
            .eq("id", data.user.id)
            .maybeSingle();

          if (profile?.onboarding_completed) {
            navigate("/investor/dashboard");
          } else {
            navigate("/investor/onboarding");
          }
          return;
        }

        // Check if user has investor role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .eq("role", "investor")
          .maybeSingle();

        if (!roleData) {
          // User doesn't have investor role yet
          // Check if they have a valid invite code to add the role
          if (inviteCode && codeValidation?.valid) {
            // Add investor role using secure database function
            const roleResult = await addInvestorRoleWithInvite(data.user.id, inviteCode);

            if (!roleResult.success) {
              console.error("Failed to add investor role:", roleResult.message);
              await supabase.auth.signOut();
              toast({
                title: "Failed to join investor network",
                description: roleResult.message || "Please try again or contact support.",
                variant: "destructive",
              });
              return;
            }

            // Store the invite code in session storage for onboarding
            sessionStorage.setItem("investor_invite_code", inviteCode.toUpperCase());

            toast({
              title: "Welcome to the Investor Network!",
              description: `You've been added by ${codeValidation?.inviterName || "an investor"}. Complete your investor profile to continue.`,
            });
            navigate("/investor/onboarding");
            return;
          } else {
            // No valid invite code - they can't access this area
            await supabase.auth.signOut();
            toast({
              title: "Access denied",
              description: "You need a valid invite code to join the investor network. Enter your invite code and try again.",
              variant: "destructive",
            });
            return;
          }
        }

        // User already has investor role - check onboarding status
        const { data: profile } = await (supabase
          .from("investor_profiles") as any)
          .select("onboarding_completed")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profile?.onboarding_completed) {
          navigate("/investor/dashboard");
        } else {
          navigate("/investor/onboarding");
        }
      }
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 -right-1/4 w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Back button - fixed top-left */}
      <button
        onClick={() => navigate("/investor")}
        className="fixed top-4 left-4 z-20 flex items-center gap-2 text-muted-foreground hover:text-foreground backdrop-blur-sm bg-card/30 border border-border/30 rounded-full px-4 py-2 hover:bg-card/50 transition-all duration-300"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
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

              {/* Logo/Badge */}
              <div className="relative flex justify-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                  <Network className="w-5 h-5 text-primary" />
                  <span className="text-sm text-primary font-medium">Investor Network</span>
                </div>
              </div>

              <h1 className="relative text-2xl font-bold text-center mb-2 text-foreground">
                {isSignUp ? "Join the Network" : "Welcome Back"}
              </h1>
              <p className="relative text-muted-foreground text-center mb-8">
                {isSignUp
                  ? "An exclusive invite-only network for investors"
                  : "Sign in to access your investor dashboard"}
              </p>

              <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="relative space-y-5">
                {/* Invite Code - show for signup, and optionally for signin */}
                <div className="space-y-2">
                  <Label htmlFor="inviteCode" className="flex items-center gap-2 text-foreground/80">
                    <Lock className="w-3.5 h-3.5" />
                    Invite Code {!isSignUp && <span className="text-xs text-muted-foreground">(if joining as new investor)</span>}
                  </Label>
                  <Input
                    id="inviteCode"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder={isSignUp ? "XXXXXXXX" : "Leave empty if already an investor"}
                    className={`h-12 bg-muted/50 border-border/40 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 placeholder:text-muted-foreground/50 text-foreground font-mono tracking-wider ${
                      codeValidation?.valid 
                        ? "border-green-500/50 focus:ring-green-500/20" 
                        : codeValidation?.valid === false 
                          ? "border-red-500/50 focus:ring-red-500/20" 
                          : ""
                    }`}
                    maxLength={12}
                  />
                  {isValidatingCode && (
                    <p className="text-xs text-muted-foreground">Validating code...</p>
                  )}
                  {codeValidation?.valid && (
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Invited by {codeValidation.inviterName}
                    </p>
                  )}
                  {codeValidation?.valid === false && inviteCode.length >= 6 && (
                    <p className="text-xs text-red-400">Invalid or expired invite code</p>
                  )}
                  {!isSignUp && !inviteCode && (
                    <p className="text-xs text-muted-foreground">
                      Already a founder? Enter your invite code to also join as an investor.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-foreground/80">
                    <Mail className="w-3.5 h-3.5" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-12 bg-muted/50 border-border/40 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 placeholder:text-muted-foreground/50 text-foreground [&:-webkit-autofill]:bg-muted/50 [&:-webkit-autofill]:[-webkit-text-fill-color:hsl(var(--foreground))] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2 text-foreground/80">
                    <KeyRound className="w-3.5 h-3.5" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 bg-muted/50 border-border/40 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 placeholder:text-muted-foreground/50 text-foreground"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-13 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground rounded-xl font-semibold text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5" 
                  disabled={isLoading || (isSignUp && !codeValidation?.valid)}
                >
                  {isLoading ? "Loading..." : isSignUp ? "Join the Network" : "Sign In"}
                </Button>
              </form>

              {/* Google Sign In */}
              <AuthDivider />
              <GoogleSignInButton 
                redirectTo="/investor/dashboard" 
                disabled={isLoading}
              />

              <div className="relative mt-6 text-center">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isSignUp
                    ? "Already have an account? Sign in"
                    : "Have an invite code? Sign up"}
                </button>
              </div>

              {isSignUp && (
                <div className="relative mt-6 pt-6 border-t border-border/30 text-center">
                  <p className="text-xs text-muted-foreground">
                    Don't have an invite code? Ask an existing member of the network to invite you.
                  </p>
                </div>
              )}

              {/* Bottom pill indicators */}
              <div className="flex justify-center gap-1.5 mt-8">
                <div className={`h-1.5 rounded-full transition-all duration-300 ${!isSignUp ? 'w-8 bg-primary' : 'w-4 bg-border/50'}`} />
                <div className={`h-1.5 rounded-full transition-all duration-300 ${isSignUp ? 'w-8 bg-primary' : 'w-4 bg-border/50'}`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorAuth;
