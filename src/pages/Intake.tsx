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
      const { data: companies, error } = await supabase
        .from("companies")
        .select("*")
        .eq("founder_id", session.user.id);

      console.log("Company check:", { companies, error, userId: session.user.id });

      if (error) {
        console.error("Error checking companies:", error);
      }

      if (companies && companies.length > 0) {
        console.log("Found existing company, redirecting to hub");
        navigate("/hub");
      } else {
        console.log("No existing company found");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleNext = async () => {
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

    // If we're on step 3 (the last step), save and redirect to hub
    if (currentStep === 3) {
      await handleComplete();
    } else if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = async () => {
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
        description: formData.problemSolution,
        category: null,
        stage: formData.stage,
        biggest_challenge: null
      });

      if (error) throw error;

      toast({ title: "Welcome to UglyBaby!", description: "Your profile has been created." });
      navigate("/hub");
    } catch (error: any) {
      toast({ title: "Error saving your information", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
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

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 gradient-hero -z-10 opacity-30" />
      
      <div className="w-full max-w-2xl space-y-8 animate-fade-in">
        {/* Save & Exit button */}
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

        {/* Progress indicator */}
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

        <ModernCard className="p-8">
          {renderStep()}
          
          <div className="flex justify-between pt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1 || loading}
            >
              Back
            </Button>
            <Button onClick={handleNext} disabled={loading} className="gap-2">
              {loading ? "Saving..." : currentStep === 3 ? "Complete" : "Next"} 
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </ModernCard>
      </div>
    </div>
  );
}
