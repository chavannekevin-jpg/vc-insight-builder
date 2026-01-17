import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Network, ArrowLeft, Lock, Sparkles } from "lucide-react";

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
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user has investor role and completed onboarding
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "investor")
          .maybeSingle();

        if (roleData) {
          // Check if onboarding is completed
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
      }
      setCheckingSession(false);
    };

    checkSession();
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

      if (error) throw error;

      if (data.user) {
        // Add investor role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: data.user.id, role: "investor" });

        if (roleError) {
          console.error("Error adding investor role:", roleError);
        }

        // Increment the invite code usage - fetch current uses first and increment
        const { data: currentInvite } = await (supabase
          .from("investor_invites") as any)
          .select("uses")
          .eq("code", inviteCode.toUpperCase())
          .single();
        
        if (currentInvite) {
          await (supabase
            .from("investor_invites") as any)
            .update({ uses: currentInvite.uses + 1 })
            .eq("code", inviteCode.toUpperCase());
        }

        // Store the invite code in session storage for onboarding
        sessionStorage.setItem("investor_invite_code", inviteCode.toUpperCase());

        toast({
          title: "Welcome to the network!",
          description: `You've been invited by ${codeValidation.inviterName}.`,
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
        // Check if user has investor role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .eq("role", "investor")
          .maybeSingle();

        if (!roleData) {
          // User doesn't have investor role - they can't access this area
          await supabase.auth.signOut();
          toast({
            title: "Access denied",
            description: "This area is for invited investors only. Please use the main platform.",
            variant: "destructive",
          });
          return;
        }

        // Check onboarding status
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate("/investor")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg p-8">
            {/* Logo/Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Network className="w-5 h-5 text-primary" />
                <span className="text-sm text-primary font-medium">Investor Network</span>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center mb-2">
              {isSignUp ? "Join the Network" : "Welcome Back"}
            </h1>
            <p className="text-muted-foreground text-center mb-8">
              {isSignUp
                ? "An exclusive invite-only network for investors"
                : "Sign in to access your investor dashboard"}
            </p>

            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
              {isSignUp && (
                <div>
                  <Label htmlFor="inviteCode" className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" />
                    Invite Code *
                  </Label>
                  <Input
                    id="inviteCode"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="XXXXXXXX"
                    className={`mt-1 font-mono tracking-wider ${
                      codeValidation?.valid 
                        ? "border-green-500 focus:ring-green-500" 
                        : codeValidation?.valid === false 
                          ? "border-red-500 focus:ring-red-500" 
                          : ""
                    }`}
                    maxLength={12}
                  />
                  {isValidatingCode && (
                    <p className="text-xs text-muted-foreground mt-1">Validating code...</p>
                  )}
                  {codeValidation?.valid && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Invited by {codeValidation.inviterName}
                    </p>
                  )}
                  {codeValidation?.valid === false && inviteCode.length >= 6 && (
                    <p className="text-xs text-red-500 mt-1">Invalid or expired invite code</p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90" 
                disabled={isLoading || (isSignUp && !codeValidation?.valid)}
              >
                {isLoading ? "Loading..." : isSignUp ? "Join the Network" : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
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
              <div className="mt-6 pt-6 border-t border-border text-center">
                <p className="text-xs text-muted-foreground">
                  Don't have an invite code? Ask an existing member of the network to invite you.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorAuth;
