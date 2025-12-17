import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModernCard } from "@/components/ModernCard";
import { DeckImportWizard, ExtractedData } from "@/components/DeckImportWizard";
import { ArrowRight, Home, Upload, Sparkles, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const STAGES = [
  "Pre Seed",
  "Seed",
  "Series A"
];

export default function Intake() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0); // 0 = deck option, 1-3 = regular steps
  const [loading, setLoading] = useState(false);
  const [deckWizardOpen, setDeckWizardOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    stage: "",
    problemSolution: ""
  });

  useEffect(() => {
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
  }, [navigate]);

  const handleNext = () => {
    if (currentStep === 0) {
      // Skip deck option and go to name step
      setCurrentStep(1);
      return;
    }
    
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

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinalSubmit();
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

  const handleFinalSubmit = async () => {
    if (!formData.name || !formData.stage || !formData.problemSolution) {
      toast({ title: "Please complete all fields", variant: "destructive" });
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
        description: formData.problemSolution,
        category: null,
        stage: formData.stage,
        biggest_challenge: null,
        has_premium: false
      });

      if (error) throw error;

      toast({ title: "Company created successfully!" });
      navigate("/hub");
    } catch (error: any) {
      toast({ title: "Error creating company", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeckImportComplete = async (data: ExtractedData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please sign in first", variant: "destructive" });
        navigate("/auth");
        return;
      }

      // Create company from deck data
      const companyName = data.companyInfo.name || formData.name || "My Company";
      const companyDescription = data.companyInfo.description || "";
      const companyStage = data.companyInfo.stage || "Pre Seed";

      const { data: newCompany, error: companyError } = await supabase
        .from("companies")
        .insert({
          founder_id: session.user.id,
          name: companyName,
          description: companyDescription,
          stage: companyStage,
          category: data.companyInfo.category || null,
          has_premium: false
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Save high-confidence responses
      const highConfidenceResponses = Object.entries(data.extractedSections)
        .filter(([_, section]) => section.confidence >= 0.6 && section.content)
        .map(([key, section]) => ({
          company_id: newCompany.id,
          question_key: key,
          answer: section.content,
          source: 'deck_import',
          confidence_score: section.confidence
        }));

      if (highConfidenceResponses.length > 0) {
        const { error: insertError } = await supabase
          .from("memo_responses")
          .insert(highConfidenceResponses);

        if (insertError) {
          console.error("Error saving responses:", insertError);
        }
      }

      toast({
        title: "Deck imported successfully!",
        description: `Created ${companyName}. Your VC verdict is being generated.`
      });

      // Navigate to hub to see the alarming VC verdict
      navigate("/hub");
    } catch (error: any) {
      console.error("Deck import error:", error);
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-serif font-bold">Let's get started</h2>
              <p className="text-muted-foreground">How would you like to set up your profile?</p>
            </div>

            {/* Fast Track Option */}
            <div 
              onClick={() => setDeckWizardOpen(true)}
              className="cursor-pointer group"
            >
              <div className="relative p-6 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 text-xs font-bold bg-primary text-primary-foreground rounded-full">
                    FASTEST
                  </span>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Upload Your Pitch Deck</h3>
                    <p className="text-muted-foreground mb-3">
                      AI extracts your company info and pre-fills the questionnaire. 
                      <span className="text-primary font-medium"> Save 15+ minutes.</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground">PDF</span>
                      <span className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground">PNG</span>
                      <span className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground">JPG</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Manual Option */}
            <div 
              onClick={() => setCurrentStep(1)}
              className="cursor-pointer group"
            >
              <div className="p-6 rounded-2xl border border-border hover:border-muted-foreground/50 hover:bg-muted/30 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-muted group-hover:bg-muted/80 transition-colors">
                    <Sparkles className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">Start from Scratch</h3>
                    <p className="text-sm text-muted-foreground">
                      Answer a few questions manually. Takes about 10-15 minutes.
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </div>
        );

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

  const totalSteps = 4; // 0 (deck option) + 3 regular steps

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 gradient-hero -z-10 opacity-30" />
      
      <div className="w-full max-w-2xl space-y-8 animate-fade-in">
        {/* Save & Exit button */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={handleSaveAndExit}
            disabled={loading || currentStep === 0}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <Home className="w-4 h-4" />
            Save & Return to Hub
          </Button>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2, 3].map((step) => (
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
          
          {currentStep > 0 && (
            <div className="flex justify-between pt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Back
              </Button>
              <Button onClick={handleNext} className="gap-2" disabled={loading}>
                {currentStep === 3 ? (loading ? "Creating..." : "Complete") : "Next"} <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </ModernCard>
      </div>

      {/* Deck Import Wizard */}
      <DeckImportWizard
        open={deckWizardOpen}
        onOpenChange={setDeckWizardOpen}
        onImportComplete={handleDeckImportComplete}
      />
    </div>
  );
}
