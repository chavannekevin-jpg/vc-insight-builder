import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModernCard } from "@/components/ModernCard";
import { ArrowRight, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const CATEGORIES = [
  "SaaS",
  "Fintech",
  "Marketplace",
  "Consumer",
  "AI/ML",
  "Healthcare",
  "Education",
  "E-commerce",
  "Other"
];

const STAGES = [
  "Pre-product",
  "MVP",
  "Early traction",
  "Scaling"
];

export default function Intake() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    stage: "",
    biggestChallenge: ""
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
    if (currentStep === 1 && !formData.name) {
      toast({ title: "Please enter your startup name", variant: "destructive" });
      return;
    }
    if (currentStep === 2 && !formData.description) {
      toast({ title: "Please describe what your startup does", variant: "destructive" });
      return;
    }
    if (currentStep === 3 && !formData.category) {
      toast({ title: "Please select a category", variant: "destructive" });
      return;
    }
    if (currentStep === 4 && !formData.stage) {
      toast({ title: "Please select your current stage", variant: "destructive" });
      return;
    }
    if (currentStep === 5 && !formData.biggestChallenge) {
      toast({ title: "Please share your biggest challenge", variant: "destructive" });
      return;
    }

    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async () => {
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
        description: formData.description,
        category: formData.category,
        stage: formData.stage,
        biggest_challenge: formData.biggestChallenge
      });

      if (error) throw error;

      toast({ title: "Welcome aboard! 🚀" });
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
              <h2 className="text-3xl font-serif font-bold">What does {formData.name} do?</h2>
              <p className="text-muted-foreground">One sentence is perfect</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Startup Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., We help small businesses automate their invoicing"
                className="text-lg min-h-[120px]"
                autoFocus
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-serif font-bold">Which category describes you best?</h2>
              <p className="text-muted-foreground">This helps us understand your market</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="text-lg">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4:
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

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-serif font-bold">What's your biggest current challenge?</h2>
              <p className="text-muted-foreground">This will help us tailor content for you</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="challenge">Biggest Challenge</Label>
              <Textarea
                id="challenge"
                value={formData.biggestChallenge}
                onChange={(e) => setFormData({ ...formData, biggestChallenge: e.target.value })}
                placeholder="e.g., Finding product-market fit, hiring the right team, raising funding..."
                className="text-lg min-h-[120px]"
                autoFocus
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <Sparkles className="w-16 h-16 text-primary animate-pulse" />
            </div>
            <h2 className="text-4xl font-serif font-bold">Great — you're in.</h2>
            <p className="text-xl text-muted-foreground">Let's level you up.</p>
            <div className="pt-4">
              <Button 
                size="lg" 
                onClick={handleSubmit}
                disabled={loading}
                className="text-lg px-10 py-6 gradient-primary shadow-glow hover-neon-pulse transition-all duration-300 font-bold uppercase tracking-wider"
              >
                {loading ? "Setting things up..." : "Enter Freemium Hub →"}
              </Button>
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
        {/* Progress indicator */}
        {currentStep < 6 && (
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((step) => (
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
          
          {currentStep < 6 && (
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
