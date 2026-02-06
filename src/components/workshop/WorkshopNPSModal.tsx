import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, CheckCircle2, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useWorkshopNpsResponse, useSaveWorkshopNps } from "@/hooks/useWorkshopNps";
import { toast } from "@/hooks/use-toast";

interface WorkshopNPSModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string | null;
  acceleratorInviteId?: string | null;
}

const NPS_QUESTIONS = [
  {
    key: "recommend_lecture",
    question: "How likely are you to recommend the lecture?",
    shortLabel: "Recommend",
  },
  {
    key: "investor_understanding",
    question: "How clearly do you understand how professional investors actually think about your startup?",
    shortLabel: "Investor Mindset",
  },
  {
    key: "strengths_weaknesses",
    question: "How much better do you understand your own startup's strengths and weaknesses from an investor perspective?",
    shortLabel: "Self-Awareness",
  },
  {
    key: "actionable_confidence",
    question: "How confident are you that you can translate what you learned today into concrete changes?",
    shortLabel: "Actionable",
  },
  {
    key: "mini_memo_usefulness",
    question: "How useful was the \"mini memo\" exercise?",
    shortLabel: "Mini Memo",
  },
  {
    key: "mentoring_usefulness",
    question: "How useful was the \"1-on-1 mentoring session\"?",
    shortLabel: "Mentoring",
  },
] as const;

type QuestionKey = typeof NPS_QUESTIONS[number]["key"];

function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 86) return { label: "Excellent", color: "text-primary" };
  if (score >= 71) return { label: "Good", color: "text-success" };
  if (score >= 51) return { label: "Average", color: "text-warning" };
  if (score >= 31) return { label: "Below Average", color: "text-orange-500" };
  return { label: "Poor", color: "text-destructive" };
}

export function WorkshopNPSModal({
  open,
  onOpenChange,
  companyId,
  acceleratorInviteId,
}: WorkshopNPSModalProps) {
  const { data: existingResponse, isLoading } = useWorkshopNpsResponse(companyId);
  const saveNps = useSaveWorkshopNps();
  
  const [scores, setScores] = useState<Record<QuestionKey, number>>({
    recommend_lecture: 50,
    investor_understanding: 50,
    strengths_weaknesses: 50,
    actionable_confidence: 50,
    mini_memo_usefulness: 50,
    mentoring_usefulness: 50,
  });
  const [additionalFeedback, setAdditionalFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Load existing response if available
  useEffect(() => {
    if (existingResponse) {
      setScores({
        recommend_lecture: existingResponse.recommend_lecture ?? 50,
        investor_understanding: existingResponse.investor_understanding ?? 50,
        strengths_weaknesses: existingResponse.strengths_weaknesses ?? 50,
        actionable_confidence: existingResponse.actionable_confidence ?? 50,
        mini_memo_usefulness: existingResponse.mini_memo_usefulness ?? 50,
        mentoring_usefulness: existingResponse.mentoring_usefulness ?? 50,
      });
      setAdditionalFeedback(existingResponse.additional_feedback || "");
      if (existingResponse.submitted_at) {
        setSubmitted(true);
      }
    }
  }, [existingResponse]);

  const handleScoreChange = (key: QuestionKey, value: number[]) => {
    setScores(prev => ({ ...prev, [key]: value[0] }));
  };

  const handleSubmit = async () => {
    if (!companyId) return;
    
    try {
      await saveNps.mutateAsync({
        company_id: companyId,
        accelerator_invite_id: acceleratorInviteId,
        ...scores,
        additional_feedback: additionalFeedback || null,
      });
      
      setSubmitted(true);
      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted successfully.",
      });
    } catch (error) {
      console.error("Error saving NPS:", error);
      toast({
        title: "Error",
        description: "Failed to save your feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  const averageScore = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length
  );

  const progress = ((currentStep + 1) / (NPS_QUESTIONS.length + 1)) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-card/95 to-card border-border/50 backdrop-blur-xl">
        <DialogHeader className="relative">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-medium text-primary uppercase tracking-wider">
              Workshop Feedback
            </span>
          </div>
          
          <DialogTitle className="text-xl font-semibold text-foreground relative z-10">
            {submitted ? "Thank You!" : "Rate Your Workshop Experience"}
          </DialogTitle>
          
          {!submitted && (
            <div className="mt-4">
              <Progress value={progress} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-2">
                {currentStep < NPS_QUESTIONS.length 
                  ? `Question ${currentStep + 1} of ${NPS_QUESTIONS.length}`
                  : "Additional Feedback"
                }
              </p>
            </div>
          )}
        </DialogHeader>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 border border-success/20 flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10 text-success" />
              </motion.div>
              
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Feedback Received!
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Your insights help us improve future workshops and create better learning experiences.
              </p>
              
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
                <span className="text-sm text-muted-foreground">Average Score:</span>
                <span className={cn("text-lg font-bold", getScoreLabel(averageScore).color)}>
                  {averageScore}%
                </span>
              </div>
              
              <Button
                onClick={() => onOpenChange(false)}
                className="mt-8 w-full max-w-xs"
              >
                Close
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 py-4"
            >
              {currentStep < NPS_QUESTIONS.length ? (
                // Question step
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-muted/30 border border-border/50">
                    <p className="text-base font-medium text-foreground leading-relaxed">
                      {NPS_QUESTIONS[currentStep].question}
                    </p>
                  </div>
                  
                  <div className="px-2 space-y-4">
                    <Slider
                      value={[scores[NPS_QUESTIONS[currentStep].key]]}
                      onValueChange={(value) => handleScoreChange(NPS_QUESTIONS[currentStep].key, value)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Not at all</span>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-2xl font-bold",
                          getScoreLabel(scores[NPS_QUESTIONS[currentStep].key]).color
                        )}>
                          {scores[NPS_QUESTIONS[currentStep].key]}%
                        </span>
                        <span className={cn(
                          "text-xs font-medium",
                          getScoreLabel(scores[NPS_QUESTIONS[currentStep].key]).color
                        )}>
                          {getScoreLabel(scores[NPS_QUESTIONS[currentStep].key]).label}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">Absolutely</span>
                    </div>
                  </div>
                  
                  {/* Quick overview of all scores */}
                  <div className="grid grid-cols-6 gap-2 pt-4 border-t border-border/50">
                    {NPS_QUESTIONS.map((q, idx) => (
                      <button
                        key={q.key}
                        onClick={() => setCurrentStep(idx)}
                        className={cn(
                          "p-2 rounded-lg text-center transition-all",
                          idx === currentStep
                            ? "bg-primary/15 border-primary/30 border"
                            : "bg-muted/30 border border-transparent hover:border-border/50"
                        )}
                      >
                        <span className="text-xs text-muted-foreground block truncate">
                          {q.shortLabel}
                        </span>
                        <span className={cn(
                          "text-sm font-bold",
                          getScoreLabel(scores[q.key]).color
                        )}>
                          {scores[q.key]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                // Additional feedback step
                <div className="space-y-4">
                  <p className="text-base font-medium text-foreground">
                    Anything else you'd like to share?
                  </p>
                  <Textarea
                    value={additionalFeedback}
                    onChange={(e) => setAdditionalFeedback(e.target.value)}
                    placeholder="Share any additional thoughts, suggestions, or feedback..."
                    className="min-h-[150px] resize-none"
                  />
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="flex-1"
                  >
                    Previous
                  </Button>
                )}
                
                {currentStep < NPS_QUESTIONS.length ? (
                  <Button
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    className="flex-1"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={saveNps.isPending}
                    className="flex-1 gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {saveNps.isPending ? "Submitting..." : "Submit Feedback"}
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
