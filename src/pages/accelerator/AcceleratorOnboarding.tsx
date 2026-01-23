import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Target, Users, Calendar, Rocket, ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const FOCUS_AREAS = [
  "B2B SaaS", "Consumer Tech", "FinTech", "HealthTech", "CleanTech",
  "DeepTech", "AI/ML", "Web3/Crypto", "E-commerce", "EdTech",
  "PropTech", "FoodTech", "Mobility", "Gaming", "Enterprise",
];

interface OnboardingData {
  name: string;
  description: string;
  cohortName: string;
  programLengthWeeks: number;
  focusAreas: string[];
  cohortSizeTarget: number;
  demoDayDate: string;
}

export default function AcceleratorOnboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [step, setStep] = useState(0);
  const [isVerifying, setIsVerifying] = useState(true);
  const [acceleratorId, setAcceleratorId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  
  const [formData, setFormData] = useState<OnboardingData>({
    name: "",
    description: "",
    cohortName: "",
    programLengthWeeks: 12,
    focusAreas: [],
    cohortSizeTarget: 10,
    demoDayDate: "",
  });

  const sessionId = searchParams.get("session_id");

  // Verify payment on mount
  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !isAuthenticated || authLoading) return;

      try {
        const { data, error } = await supabase.functions.invoke("verify-accelerator-payment", {
          body: { sessionId },
        });

        if (error) throw error;
        if (!data?.success) throw new Error("Payment verification failed");

        setAcceleratorId(data.acceleratorId);

        // If already exists, check if onboarding is complete
        if (data.alreadyExists) {
          const { data: accData } = await supabase
            .from("accelerators")
            .select("name, onboarding_completed")
            .eq("id", data.acceleratorId)
            .single();

          if (accData?.onboarding_completed) {
            navigate("/accelerator");
            return;
          }
          
          if (accData?.name) {
            setFormData(prev => ({ ...prev, name: accData.name }));
          }
        }
      } catch (error: any) {
        console.error("Verification error:", error);
        toast.error(error.message || "Payment verification failed");
        navigate("/accelerator/signup");
      } finally {
        setIsVerifying(false);
      }
    };

    if (!authLoading) {
      verifyPayment();
    }
  }, [sessionId, isAuthenticated, authLoading, navigate]);

  const updateField = <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleFocusArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area],
    }));
  };

  const handleComplete = async () => {
    if (!acceleratorId) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("accelerators")
        .update({
          name: formData.name,
          description: formData.description,
          program_length_weeks: formData.programLengthWeeks,
          focus_areas: formData.focusAreas,
          cohort_size_target: formData.cohortSizeTarget,
          demo_day_date: formData.demoDayDate || null,
          onboarding_completed: true,
        })
        .eq("id", acceleratorId);

      if (error) throw error;

      // Create initial cohort if name provided
      if (formData.cohortName.trim()) {
        await supabase
          .from("accelerator_cohorts")
          .insert({
            accelerator_id: acceleratorId,
            name: formData.cohortName.trim(),
            demo_day_date: formData.demoDayDate || null,
          });
      }

      // Show entrance animation
      setShowAnimation(true);
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save settings");
      setIsSaving(false);
    }
  };

  // Entrance Animation
  if (showAnimation) {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Animated background */}
          <motion.div
            className="absolute inset-0"
            initial={{ background: "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.1) 0%, transparent 50%)" }}
            animate={{ 
              background: [
                "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.3) 0%, transparent 70%)",
                "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.1) 0%, transparent 50%)",
              ]
            }}
            transition={{ duration: 2, repeat: 1 }}
          />

          {/* Content */}
          <motion.div
            className="text-center z-10"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <motion.div
              className="w-24 h-24 mx-auto mb-8 rounded-2xl gradient-primary flex items-center justify-center shadow-glow"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Rocket className="w-12 h-12 text-primary-foreground" />
            </motion.div>

            <motion.h1
              className="text-4xl font-bold text-foreground mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              Your Ecosystem is Ready
            </motion.h1>

            <motion.p
              className="text-xl text-muted-foreground mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              Welcome to {formData.name}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              onAnimationComplete={() => {
                setTimeout(() => navigate("/accelerator"), 1000);
              }}
            >
              <div className="flex items-center justify-center gap-2 text-primary">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Entering dashboard...</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Loading state
  if (isVerifying || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  const steps = [
    {
      title: "Accelerator Identity",
      description: "Let's start with the basics",
      icon: Building2,
      content: (
        <div className="space-y-6">
          <div>
            <Label htmlFor="name">Accelerator Name</Label>
            <Input
              id="name"
              placeholder="e.g., TechStars London"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Briefly describe your accelerator program..."
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>
        </div>
      ),
      isValid: () => formData.name.trim().length > 0,
    },
    {
      title: "Focus Areas",
      description: "What sectors do you focus on?",
      icon: Target,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Select all that apply</p>
          <div className="flex flex-wrap gap-2">
            {FOCUS_AREAS.map((area) => (
              <button
                key={area}
                onClick={() => toggleFocusArea(area)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  formData.focusAreas.includes(area)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>
      ),
      isValid: () => true, // Optional
    },
    {
      title: "Program Details",
      description: "Tell us about your program structure",
      icon: Users,
      content: (
        <div className="space-y-6">
          <div>
            <Label htmlFor="cohortName">Current Cohort Name</Label>
            <Input
              id="cohortName"
              placeholder="e.g., Winter 2025 Batch"
              value={formData.cohortName}
              onChange={(e) => updateField("cohortName", e.target.value)}
              className="mt-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="programLength">Program Length (weeks)</Label>
              <Input
                id="programLength"
                type="number"
                min={1}
                max={52}
                value={formData.programLengthWeeks}
                onChange={(e) => updateField("programLengthWeeks", parseInt(e.target.value) || 12)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="cohortSize">Target Cohort Size</Label>
              <Input
                id="cohortSize"
                type="number"
                min={1}
                max={100}
                value={formData.cohortSizeTarget}
                onChange={(e) => updateField("cohortSizeTarget", parseInt(e.target.value) || 10)}
                className="mt-2"
              />
            </div>
          </div>
        </div>
      ),
      isValid: () => true, // Optional
    },
    {
      title: "Demo Day",
      description: "When is your next demo day?",
      icon: Calendar,
      content: (
        <div className="space-y-6">
          <div>
            <Label htmlFor="demoDay">Demo Day Date (optional)</Label>
            <Input
              id="demoDay"
              type="date"
              value={formData.demoDayDate}
              onChange={(e) => updateField("demoDayDate", e.target.value)}
              className="mt-2"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            You can always update this later from your settings.
          </p>
        </div>
      ),
      isValid: () => true, // Optional
    },
  ];

  const currentStep = steps[step];
  const StepIcon = currentStep.icon;
  const canProceed = currentStep.isValid();
  const isLastStep = step === steps.length - 1;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Progress Sidebar */}
      <div className="hidden md:flex w-72 bg-card border-r border-border p-8 flex-col">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">Setup</span>
        </div>

        <div className="space-y-4 flex-1">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isComplete = i < step;
            const isCurrent = i === step;
            return (
              <div
                key={s.title}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  isCurrent ? "bg-primary/10" : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isComplete
                      ? "bg-success text-success-foreground"
                      : isCurrent
                      ? "gradient-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isComplete ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={`text-sm font-medium ${
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Progress */}
        <div className="md:hidden p-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {step + 1} of {steps.length}
            </span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-lg"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
                <StepIcon className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{currentStep.title}</h2>
                <p className="text-muted-foreground">{currentStep.description}</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 mb-8">
              {currentStep.content}
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                disabled={step === 0}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              {isLastStep ? (
                <Button
                  onClick={handleComplete}
                  disabled={!canProceed || isSaving}
                  className="gap-2 gradient-primary text-primary-foreground"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Launch Ecosystem
                      <Rocket className="w-4 h-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed}
                  className="gap-2"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
