import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModernCard } from "@/components/ModernCard";
import { ArrowRight, Sparkles, Home } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const STAGES = [
  "Pre Seed",
  "Seed",
  "Series A"
];

export default function Intake() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    stage: "",
    problemSolution: ""
  });

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if they already have a company
      const { data: companies, error: companiesError } = await supabase
        .from("companies")
        .select("*")
        .eq("founder_id", session.user.id)
        .order("created_at", { ascending: false });

      if (companiesError) {
        console.error("Error checking existing companies:", companiesError);
      }

      if (companies && companies.length > 0) {
        navigate("/hub");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleNext = () => {
    if (currentStep === 1 && !formData.name) {
      toast({ title: "Please enter your startup name", variant: "destructive" });
      return;
    }
    if (currentStep === 2 && !formData.stage) {
      toast({ title: "Please select your current stage", variant: "destructive" });
      return;
    }
    if (currentStep === 3 && !formData.problemSolution) {
      toast({ title: "Please describe your problem and solution", variant: "destructive" });
      return;
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSaveAndExit = async () => {
    if (!formData.name) {
      toast({ title: "Please enter at least your startup name before saving", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please sign in first", variant: "destructive" });
        navigate("/auth");
        return;
      }

      const { error } = await supabase.from("companies").insert({
        founder_id: session.user.id,
        name: formData.name,
        description: formData.problemSolution || null,
        category: null,
        stage: formData.stage || null,
        biggest_challenge: null
      });

      if (error) throw error;

      toast({ title: "Progress saved! You can continue later." });
      navigate("/hub");
    } catch (error: any) {
      toast({ title: "Error saving your information", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please sign in first", variant: "destructive" });
        navigate("/auth");
        return;
      }

      // Store questionnaire data in sessionStorage to be saved after payment
      sessionStorage.setItem('pendingCompanyData', JSON.stringify({
        name: formData.name,
        description: formData.problemSolution,
        stage: formData.stage,
        founder_id: session.user.id
      }));

      // Navigate to payment page
      navigate("/waitlist-checkout");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-serif font-bold">What's your startup called?</h2>
              <p className="text-muted-foreground">Let's start with the basics</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Startup Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Acme Inc."
                className="text-lg"
                autoFocus
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-serif font-bold">What stage are you at?</h2>
              <p className="text-muted-foreground">Be honest — we're here to help</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage">Current Stage</Label>
              <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}>
                <SelectTrigger className="text-lg">
                  <SelectValue placeholder="Select your stage" />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-serif font-bold">Describe your problem and solution</h2>
              <p className="text-muted-foreground">What problem are you solving and how?</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="problemSolution">Problem & Solution</Label>
              <Textarea
                id="problemSolution"
                value={formData.problemSolution}
                onChange={(e) => setFormData({ ...formData, problemSolution: e.target.value })}
                placeholder="e.g., Small businesses waste hours on manual invoicing. We automate the entire process with AI, saving them 10+ hours per week."
                className="text-lg min-h-[150px]"
                autoFocus
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <Sparkles className="w-16 h-16 text-primary animate-pulse" />
            </div>
            <h2 className="text-4xl font-serif font-bold">Almost there!</h2>
            <p className="text-xl text-muted-foreground">Secure your spot with our early access discount</p>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 space-y-3">
              <p className="text-2xl font-bold text-primary">
                <span className="line-through text-muted-foreground text-xl mr-2">€59.99</span>
                €29.99
              </p>
              <Badge variant="secondary" className="text-sm">
                <Sparkles className="w-3 h-3 mr-1" />
                50% OFF Pre-Launch
              </Badge>
              <p className="text-sm text-muted-foreground">
                Complete your profile and get instant access to the Investment Memorandum Generator
              </p>
            </div>
            <div className="pt-4">
              <Button 
                size="lg" 
                onClick={handleProceedToPayment}
                disabled={loading}
                className="text-lg px-10 py-6 gradient-primary shadow-glow hover-neon-pulse transition-all duration-300 font-bold uppercase tracking-wider"
              >
                {loading ? "Processing..." : "Proceed to Payment →"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your information will be saved after payment confirmation
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 gradient-hero -z-10 opacity-30" />
      
      <div className="w-full max-w-2xl space-y-8 animate-fade-in">
        {/* Save & Exit button */}
        {currentStep < 4 && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={handleSaveAndExit}
              disabled={loading}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Home className="w-4 h-4" />
              Save & Return to Hub
            </Button>
          </div>
        )}

        {/* Progress indicator */}
        {currentStep < 4 && (
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step === currentStep 
                    ? "w-12 bg-primary" 
                    : step < currentStep 
                    ? "w-8 bg-primary/50" 
                    : "w-8 bg-border"
                }`}
              />
            ))}
          </div>
        )}

        <ModernCard className="p-8">
          {renderStep()}
          
          {currentStep < 4 && (
            <div className="flex justify-between pt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Back
              </Button>
              <Button onClick={handleNext} className="gap-2">
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </ModernCard>
      </div>
    </div>
  );
}
