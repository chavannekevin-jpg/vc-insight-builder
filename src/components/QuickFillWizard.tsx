import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Loader2, 
  ChevronRight, 
  ChevronLeft, 
  SkipForward,
  Lightbulb,
  Target,
  Users,
  Swords,
  UserCheck,
  DollarSign,
  TrendingUp,
  PartyPopper
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WizardStep {
  key: string;
  section: string;
  title: string;
  icon: React.ReactNode;
  question: string;
  tip: string;
  example: string;
  placeholder: string;
}

const WIZARD_STEPS: WizardStep[] = [
  {
    key: "problem_description",
    section: "Problem",
    title: "What Makes People Suffer?",
    icon: <Target className="w-6 h-6" />,
    question: "What specific problem does your startup solve? Who experiences this pain?",
    tip: "VCs look for founders who deeply understand the problem. Be specific about who suffers and how much it costs them.",
    example: "Small business owners waste 10+ hours/week on manual invoicing. This leads to late payments, cash flow issues, and even business failures. 67% of small businesses cite this as their #1 operational headache.",
    placeholder: "Describe the specific pain point your customers face. Include who suffers, how they suffer, and the cost of this problem..."
  },
  {
    key: "solution_description",
    section: "Solution",
    title: "Your Killer Solution",
    icon: <Lightbulb className="w-6 h-6" />,
    question: "How does your product solve this problem? What makes it unique?",
    tip: "Focus on the outcome, not features. VCs want to know the transformation you deliver.",
    example: "We built an AI-powered invoicing system that auto-generates, sends, and follows up on invoices. Our customers get paid 47% faster and save 8 hours per week. Unlike competitors, we integrate with any accounting software in under 5 minutes.",
    placeholder: "Explain your solution and why it's 10x better than alternatives. What's the unique insight that makes this work?"
  },
  {
    key: "target_customer",
    section: "Target Customer",
    title: "Who Pays You?",
    icon: <Users className="w-6 h-6" />,
    question: "Who is your ideal customer? How big is this market?",
    tip: "Be specific! 'Small businesses' is too broad. 'Solo accountants with 10-50 clients in the US' is better.",
    example: "Our beachhead market is solo accountants in the US with 10-50 small business clients (120K people, $2B TAM). They're active on LinkedIn, attend AICPA conferences, and decide quickly. Expansion: accounting firms with 5-20 employees ($8B TAM).",
    placeholder: "Describe your ideal customer profile, where to find them, and the market size (TAM/SAM/SOM)..."
  },
  {
    key: "competitive_advantage",
    section: "Competition",
    title: "Your Competitive Edge",
    icon: <Swords className="w-6 h-6" />,
    question: "Who are your competitors? What's your unfair advantage?",
    tip: "Every startup has competition. Showing you understand the landscape proves market awareness.",
    example: "Direct competitors: FreshBooks (SMB focus, no AI), QuickBooks (enterprise, complex). Indirect: spreadsheets, manual processes. Our edge: proprietary AI trained on 500K invoices + fastest integration time (5 min vs 2 weeks). Defensible via data network effects.",
    placeholder: "List your competitors and explain why you'll win. What's your unfair advantage or moat?"
  },
  {
    key: "founder_background",
    section: "Team",
    title: "Why You?",
    icon: <UserCheck className="w-6 h-6" />,
    question: "Why is your team uniquely positioned to solve this problem?",
    tip: "Founder-market fit matters. Connect your background directly to why you'll win.",
    example: "I spent 8 years as a CPA at Deloitte, managing invoicing for 200+ clients. I lived this pain daily. My co-founder built ML systems at Stripe for 5 years. Together, we have the domain expertise + technical chops to dominate this space.",
    placeholder: "Share your relevant experience, domain expertise, and why your team is uniquely qualified..."
  },
  {
    key: "revenue_model",
    section: "Business Model",
    title: "Show Me The Money",
    icon: <DollarSign className="w-6 h-6" />,
    question: "How do you make money? What's your pricing strategy?",
    tip: "Simple, scalable business models win. SaaS with clear pricing tiers is usually best.",
    example: "SaaS subscription: $49/mo (starter, up to 50 invoices), $149/mo (pro, unlimited + AI features), $499/mo (team, multi-user). Current ARPU: $89. 85% gross margin. Upsell path: payments processing at 1.5% per transaction.",
    placeholder: "Explain your pricing model, revenue streams, and unit economics if available..."
  },
  {
    key: "current_traction",
    section: "Traction",
    title: "Proof of Life",
    icon: <TrendingUp className="w-6 h-6" />,
    question: "What progress have you made? What metrics prove demand?",
    tip: "Show momentum! Early-stage traction can be waitlist signups, pilots, LOIs, or revenue.",
    example: "Launched MVP 4 months ago. 127 paying customers ($11K MRR). 23% MoM growth. NPS of 72. 3 enterprise pilots with Fortune 500 companies. 2,400 people on waitlist. Featured in TechCrunch.",
    placeholder: "Share your key metrics: users, revenue, growth rate, retention, waitlist size, press, partnerships..."
  }
];

interface QuickFillWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyName: string;
  companyDescription: string;
  companyStage: string;
  existingResponses: { question_key: string; answer: string }[];
  onComplete: (responses: { question_key: string; answer: string }[]) => void;
}

export function QuickFillWizard({
  open,
  onOpenChange,
  companyId,
  companyName,
  companyDescription,
  companyStage,
  existingResponses,
  onComplete
}: QuickFillWizardProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    existingResponses.forEach(r => {
      initial[r.question_key] = r.answer || "";
    });
    return initial;
  });
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);

  const step = WIZARD_STEPS[currentStep];
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;
  const currentAnswer = answers[step?.key] || "";

  const handleAIFill = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("auto-generate-profile", {
        body: {
          companyName,
          description: companyDescription,
          stage: companyStage,
          sectionKey: step.key
        }
      });

      if (error) throw error;
      
      if (data?.prefilled?.[step.key]) {
        setAnswers(prev => ({
          ...prev,
          [step.key]: data.prefilled[step.key]
        }));
        toast({
          title: "AI generated content!",
          description: "Feel free to edit and personalize it.",
        });
      } else {
        toast({
          title: "Couldn't generate content",
          description: "Try adding more detail to your company description.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Generation failed",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const saveCurrentStep = async () => {
    if (!currentAnswer.trim()) return;
    
    setSaving(true);
    try {
      const existing = existingResponses.find(r => r.question_key === step.key);
      
      if (existing) {
        await supabase
          .from("memo_responses")
          .update({ answer: currentAnswer })
          .eq("company_id", companyId)
          .eq("question_key", step.key);
      } else {
        await supabase
          .from("memo_responses")
          .insert({
            company_id: companyId,
            question_key: step.key,
            answer: currentAnswer
          });
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    await saveCurrentStep();
    
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete wizard
      const finalResponses = WIZARD_STEPS.map(s => ({
        question_key: s.key,
        answer: answers[s.key] || ""
      })).filter(r => r.answer.trim());
      
      setCompleted(true);
      onComplete(finalResponses);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      const finalResponses = WIZARD_STEPS.map(s => ({
        question_key: s.key,
        answer: answers[s.key] || ""
      })).filter(r => r.answer.trim());
      
      setCompleted(true);
      onComplete(finalResponses);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setCompleted(false);
    onOpenChange(false);
  };

  const filledCount = WIZARD_STEPS.filter(s => answers[s.key]?.trim()).length;

  if (completed) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-xl">
          <div className="py-12 text-center space-y-6">
            <div className="relative">
              <PartyPopper className="w-20 h-20 mx-auto text-primary animate-bounce" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-primary/10 rounded-full animate-ping" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-serif font-bold">Profile Complete!</h2>
              <p className="text-muted-foreground text-lg">
                You filled {filledCount} of 7 sections. You're ready to build your memo!
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-4">
              <Button variant="outline" onClick={handleClose}>
                View Profile
              </Button>
              <Button onClick={() => window.location.href = "/portal"} className="gap-2">
                <Sparkles className="w-4 h-4" />
                Build My Memo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <span className="p-2 bg-primary/10 rounded-lg text-primary">
                {step.icon}
              </span>
              <div>
                <p className="text-sm text-muted-foreground font-normal">{step.section}</p>
                <p className="text-xl font-serif">{step.title}</p>
              </div>
            </DialogTitle>
            <Badge variant="secondary" className="text-sm">
              {currentStep + 1} / {WIZARD_STEPS.length}
            </Badge>
          </div>
        </DialogHeader>

        <Progress value={progress} className="h-2" />

        <div className="space-y-6 py-4">
          {/* Question */}
          <div>
            <p className="text-lg font-medium mb-2">{step.question}</p>
            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg border border-border">
              <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">{step.tip}</p>
            </div>
          </div>

          {/* Example */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-xs font-bold text-primary uppercase tracking-wide mb-2">Example Answer</p>
            <p className="text-sm text-foreground/80 italic">"{step.example}"</p>
          </div>

          {/* Answer Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Your Answer</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAIFill}
                disabled={generating}
                className="gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    AI Fill
                  </>
                )}
              </Button>
            </div>
            <Textarea
              value={currentAnswer}
              onChange={(e) => setAnswers(prev => ({ ...prev, [step.key]: e.target.value }))}
              placeholder={step.placeholder}
              className="min-h-[160px] text-base"
            />
            <p className="text-xs text-muted-foreground text-right">
              {currentAnswer.length} characters
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <Button
            variant="ghost"
            onClick={handleSkip}
            className="gap-2 text-muted-foreground"
          >
            Skip
            <SkipForward className="w-4 h-4" />
          </Button>

          <Button
            onClick={handleNext}
            disabled={saving}
            className="gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : currentStep === WIZARD_STEPS.length - 1 ? (
              "Complete"
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
