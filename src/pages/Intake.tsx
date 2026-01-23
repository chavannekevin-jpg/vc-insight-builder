import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModernCard } from "@/components/ModernCard";
import { DeckImportWizard, ExtractedData } from "@/components/DeckImportWizard";
import { FounderEntranceAnimation } from "@/components/FounderEntranceAnimation";
import { ArrowRight, Upload, Zap, FileText, AlertTriangle, PenLine, Target, Search, ArrowLeft, Gift } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { processStartupReferral, useStartupReferral } from "@/hooks/useStartupReferral";

type IntakeMode = "choose" | "deck" | "manual";

export default function Intake() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<IntakeMode>("choose");
  const [deckWizardOpen, setDeckWizardOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Entrance animation state
  const [showEntranceAnimation, setShowEntranceAnimation] = useState(false);
  const [createdCompanyName, setCreatedCompanyName] = useState<string | null>(null);
  
  // Manual form state
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [stage, setStage] = useState("Pre Seed");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Referral tracking
  const startupInviteCode = sessionStorage.getItem('startup_invite_code');
  const { inviteInfo } = useStartupReferral(startupInviteCode);

  useEffect(() => {
    // Skip auth check if entrance animation is about to show
    // This prevents a race condition where the company is created,
    // the auth check finds it, and navigates to /hub before the animation renders
    if (showEntranceAnimation) return;
    
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      setUserId(session.user.id);

      const { data: companies } = await supabase
        .from("companies")
        .select("*")
        .eq("founder_id", session.user.id);

      if (companies && companies.length > 0) {
        navigate("/hub");
      }
    };

    checkAuth();
  }, [navigate, showEntranceAnimation]);

  const handleDeckImportComplete = async (data: ExtractedData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please sign in first", variant: "destructive" });
        navigate("/auth");
        return;
      }

      // Create company from deck data - company name is extracted
      const extractedName = data.companyInfo.name || "My Company";
      const companyDescription = data.companyInfo.description || "";
      const companyStage = data.companyInfo.stage || "Pre Seed";

      const { data: newCompany, error: companyError } = await supabase
        .from("companies")
        .insert({
          founder_id: session.user.id,
          name: extractedName,
          description: companyDescription,
          stage: companyStage,
          category: data.companyInfo.category || null,
          has_premium: false,
          deck_parsed_at: new Date().toISOString(),
          // Add referral tracking if present
          ...(inviteInfo?.isValid && {
            referred_by_investor: inviteInfo.investorId,
            referral_code: startupInviteCode,
          }),
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Process referral to add to investor dealflow
      if (inviteInfo?.isValid && startupInviteCode) {
        await processStartupReferral(newCompany.id, startupInviteCode);
        sessionStorage.removeItem('startup_invite_code');
      }

      // Save ALL sections that have content (user edits should always be saved)
      // User-edited sections get a boosted confidence score to ensure they persist
      const allResponses = Object.entries(data.extractedSections)
        .filter(([_, section]) => section.content && section.content.trim().length > 0)
        .map(([key, section]) => ({
          company_id: newCompany.id,
          question_key: key,
          answer: section.content,
          source: 'deck_import',
          // Boost confidence for all saved sections to ensure they show in questionnaire
          confidence_score: Math.max(section.confidence, 0.7)
        }));

      if (allResponses.length > 0) {
        // Small delay to ensure company insert is fully committed
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { error: insertError } = await supabase
          .from("memo_responses")
          .insert(allResponses);

        if (insertError) {
          // Log but don't fail - responses can be regenerated later
          console.error("Error saving responses (non-critical):", insertError);
        }
        
        console.log(`Saved ${allResponses.length} deck-extracted responses`);
      }

      // Invalidate company query cache before showing animation
      await queryClient.invalidateQueries({ queryKey: ["company"] });

      // Close the wizard first, then trigger entrance animation
      setDeckWizardOpen(false);
      
      // Small delay for wizard exit animation, then trigger entrance
      setTimeout(() => {
        setCreatedCompanyName(extractedName);
        setShowEntranceAnimation(true);
      }, 300);
    } catch (error: any) {
      console.error("Deck import error:", error);
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName.trim()) {
      toast({ title: "Company name required", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please sign in first", variant: "destructive" });
        navigate("/auth");
        return;
      }

      const { data: newCompany, error: companyError } = await supabase
        .from("companies")
        .insert({
          founder_id: session.user.id,
          name: companyName.trim(),
          description: description.trim() || null,
          stage: stage,
          has_premium: false,
          // Add referral tracking if present
          ...(inviteInfo?.isValid && {
            referred_by_investor: inviteInfo.investorId,
            referral_code: startupInviteCode,
          }),
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Process referral to add to investor dealflow
      if (inviteInfo?.isValid && startupInviteCode) {
        await processStartupReferral(newCompany.id, startupInviteCode);
        sessionStorage.removeItem('startup_invite_code');
      }

      // Invalidate company query cache before navigation
      await queryClient.invalidateQueries({ queryKey: ["company"] });

      toast({
        title: "Company created!",
        description: "Generating your VC verdict..."
      });

      navigate("/hub", { state: { freshCompany: true } });
    } catch (error: any) {
      console.error("Manual create error:", error);
      toast({
        title: "Failed to create company",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle entrance animation completion
  const handleEntranceComplete = () => {
    toast({
      title: "Deck imported!",
      description: `${createdCompanyName || 'Your company'} created. Generating your VC verdict...`
    });
    navigate("/hub", { state: { freshCompany: true } });
  };

  // Show entrance animation if triggered
  if (showEntranceAnimation) {
    return (
      <FounderEntranceAnimation
        onComplete={handleEntranceComplete}
        companyName={createdCompanyName || undefined}
      />
    );
  }

  // Choose mode screen
  if (mode === "choose") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8 lg:px-6 lg:py-12">
        <div className="absolute inset-0 gradient-hero -z-10 opacity-30" />
        
        <div className="w-full max-w-2xl space-y-6 lg:space-y-8 animate-fade-in">
          <ModernCard className="p-5 lg:p-8">
            <div className="space-y-5 lg:space-y-6">
              {/* Referral banner */}
              {inviteInfo?.isValid && (
                <div className="flex items-center gap-3 p-3 lg:p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                  <Gift className="w-5 h-5 lg:w-6 lg:h-6 text-green-500 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm lg:text-base text-green-600 dark:text-green-400">
                      You've been invited by {inviteInfo.investorName || 'an investor'}!
                    </p>
                    <p className="text-xs lg:text-sm text-muted-foreground">
                      Get {inviteInfo.discountPercent}% off when you generate your VC memo.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="text-center space-y-2 lg:space-y-3 mb-6 lg:mb-8">
                <h2 className="text-2xl lg:text-3xl font-display font-bold">Let's Analyze Your Startup</h2>
                <p className="text-sm lg:text-base text-muted-foreground">
                  We'll show you exactly what VCs say when you leave the room — and how to fix it.
                </p>
              </div>

              {/* Option 1: Upload Deck */}
              <div 
                onClick={() => setDeckWizardOpen(true)}
                className="cursor-pointer group"
              >
                <div className="relative p-4 lg:p-6 rounded-xl lg:rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="p-2.5 lg:p-3 rounded-lg lg:rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors flex-shrink-0">
                      <Upload className="w-6 h-6 lg:w-8 lg:h-8 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base lg:text-lg font-bold mb-0.5 lg:mb-1">Upload Your Pitch Deck</h3>
                      <p className="text-xs lg:text-sm text-muted-foreground">
                        PDF, PNG, or JPG — we extract your company info automatically
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                  </div>
                  <div className="mt-2 lg:mt-3 flex items-center gap-2 text-xs text-primary font-medium">
                    <Zap className="w-3 h-3" />
                    Recommended • Takes 30 seconds
                  </div>
                </div>
              </div>

              {/* Option 2: No Deck */}
              <div 
                onClick={() => setMode("manual")}
                className="cursor-pointer group"
              >
                <div className="relative p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-border/50 bg-muted/20 hover:border-border hover:bg-muted/40 transition-all duration-300">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="p-2.5 lg:p-3 rounded-lg lg:rounded-xl bg-muted flex-shrink-0">
                      <PenLine className="w-6 h-6 lg:w-8 lg:h-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base lg:text-lg font-bold mb-0.5 lg:mb-1">I don't have a deck yet</h3>
                      <p className="text-xs lg:text-sm text-muted-foreground">
                        Tell us about your startup — our AI figures out the rest
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                  </div>
                </div>
              </div>

              {/* What happens next */}
              <div className="pt-5 lg:pt-6 border-t border-border/50">
                <h4 className="text-xs lg:text-sm font-semibold text-muted-foreground mb-3 lg:mb-4 text-center">What happens next?</h4>
                <div className="grid grid-cols-3 gap-3 lg:gap-4 text-center">
                  <div className="space-y-1.5 lg:space-y-2">
                    <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                      <AlertTriangle className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-destructive" />
                    </div>
                    <p className="text-[10px] lg:text-xs text-muted-foreground">Instant VC verdict on your case</p>
                  </div>
                  <div className="space-y-1.5 lg:space-y-2">
                    <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Search className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-primary" />
                    </div>
                    <p className="text-[10px] lg:text-xs text-muted-foreground">Deep-dive analysis of your startup</p>
                  </div>
                  <div className="space-y-1.5 lg:space-y-2">
                    <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Target className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-primary" />
                    </div>
                    <p className="text-[10px] lg:text-xs text-muted-foreground">Actionable plan to improve VC odds</p>
                  </div>
                </div>
              </div>
            </div>
          </ModernCard>
        </div>

        <DeckImportWizard
          open={deckWizardOpen}
          onOpenChange={setDeckWizardOpen}
          onImportComplete={handleDeckImportComplete}
        />
      </div>
    );
  }

  // Manual form mode
  if (mode === "manual") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
        <div className="absolute inset-0 gradient-hero -z-10 opacity-30" />
        
        <div className="w-full max-w-lg space-y-6 animate-fade-in">
          <Button 
            variant="ghost" 
            onClick={() => setMode("choose")}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <ModernCard className="p-8">
            <form onSubmit={handleManualSubmit} className="space-y-6">
              <div className="text-center space-y-2 mb-6">
                <h2 className="text-2xl font-display font-bold">Tell Us About Your Startup</h2>
                <p className="text-sm text-muted-foreground">
                  Our AI will analyze your case and show what VCs really think.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Stripe, Airbnb, Notion"
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stage">Stage</Label>
                <Select value={stage} onValueChange={setStage}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pre Seed">Pre-Seed</SelectItem>
                    <SelectItem value="Seed">Seed</SelectItem>
                    <SelectItem value="Series A">Series A</SelectItem>
                    <SelectItem value="Series B+">Series B+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">What does your startup do?</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your product, target market, and what makes you different..."
                  className="min-h-[120px] resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  The more detail, the better our analysis. But even a sentence helps.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 gap-2" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Get My VC Verdict"}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>
          </ModernCard>
        </div>
      </div>
    );
  }

  return null;
}
