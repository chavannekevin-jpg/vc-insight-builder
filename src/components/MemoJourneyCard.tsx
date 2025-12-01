import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Lock, CheckCircle2, Target, FileText, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MemoJourneyCardProps {
  completedQuestions: number;
  totalQuestions: number;
  memoGenerated: boolean;
  hasPaid: boolean;
  nextSection?: string;
  companyId: string;
}

export const MemoJourneyCard = ({
  completedQuestions,
  totalQuestions,
  memoGenerated,
  hasPaid,
  nextSection = "your profile",
  companyId
}: MemoJourneyCardProps) => {
  const navigate = useNavigate();
  const percentage = (completedQuestions / totalQuestions) * 100;
  
  const getStatus = () => {
    if (memoGenerated) {
      return hasPaid ? "complete" : "preview";
    }
    return percentage === 100 ? "ready" : "building";
  };

  const status = getStatus();

  const renderContent = () => {
    switch (status) {
      case "building":
        return (
          <>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-display font-bold mb-2">Your Investment Memo Journey</h2>
                <p className="text-muted-foreground mb-2">The strategic document that becomes the backbone of your company</p>
                <p className="text-sm text-muted-foreground/80">Answer key questions about your business, and we'll generate a comprehensive Investment Memorandum—the same type of document VCs write internally when evaluating startups.</p>
              </div>
              <Target className="w-12 h-12 text-primary/30" />
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Profile Completion</span>
                <span className="text-muted-foreground">{completedQuestions} of {totalQuestions} questions</span>
              </div>
              <Progress value={percentage} className="h-3" />
            </div>

            <div className="bg-muted/30 border border-border/50 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium mb-1">Next Step</p>
                  <p className="text-sm text-muted-foreground">
                    Complete {nextSection} to unlock more AI insights
                  </p>
                </div>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full text-lg font-semibold"
              onClick={() => navigate("/portal")}
            >
              Continue Building Your Memo
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            {/* FOMO Preview */}
            <div className="mt-6 pt-6 border-t border-border/50">
              <p className="text-sm font-medium mb-3 text-muted-foreground">What you'll unlock:</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>VC-grade analysis</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Risk assessment</span>
                </div>
                <div className="flex items-center gap-2 text-sm opacity-50">
                  <Lock className="w-4 h-4" />
                  <span>Market positioning</span>
                </div>
                <div className="flex items-center gap-2 text-sm opacity-50">
                  <Lock className="w-4 h-4" />
                  <span>Financial projections</span>
                </div>
              </div>
            </div>
          </>
        );

      case "ready":
        return (
          <>
            <div className="flex items-start justify-between mb-6">
              <div>
                <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Profile Complete
                </Badge>
                <h2 className="text-3xl font-display font-bold mb-2">Ready to Generate Your Memo</h2>
                <p className="text-muted-foreground">All questions answered — let AI create your investment memo</p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 rounded-xl p-6 mb-6">
              <p className="text-lg font-medium mb-2">Your memo will include:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Executive summary with strategic insights
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Market analysis and competitive positioning
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Risk assessment and mitigation strategies
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Investor-ready formatting and structure
                </li>
              </ul>
            </div>

            <Button 
              size="lg" 
              className="w-full text-lg font-semibold bg-primary hover:bg-primary/90"
              onClick={() => navigate(`/memo?companyId=${companyId}`)}
            >
              Generate Investment Memo
              <Sparkles className="ml-2 w-5 h-5" />
            </Button>
          </>
        );

      case "preview":
        return (
          <>
            <div className="flex items-start justify-between mb-6">
              <div>
                <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
                  <FileText className="w-3 h-3 mr-1" />
                  Memo Generated
                </Badge>
                <h2 className="text-3xl font-display font-bold mb-2">Your Memo is Ready</h2>
                <p className="text-muted-foreground">Preview available — unlock full access with purchase</p>
              </div>
              <FileText className="w-12 h-12 text-primary/30" />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => navigate("/generated-memo")}
              >
                <Lock className="w-5 h-5" />
                <span>View Preview</span>
              </Button>
              <Button 
                className="h-auto py-4 flex-col gap-2 bg-primary hover:bg-primary/90"
                onClick={() => navigate(`/checkout?companyId=${companyId}`)}
              >
                <Sparkles className="w-5 h-5" />
                <span>Unlock Full Memo</span>
              </Button>
            </div>

            <div className="bg-muted/30 border border-border/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground text-center">
                Preview includes summary and highlights. Full memo unlocks complete analysis, all sections, and download.
              </p>
            </div>
          </>
        );

      case "complete":
        return (
          <>
            <div className="flex items-start justify-between mb-6">
              <div>
                <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Full Access
                </Badge>
                <h2 className="text-3xl font-display font-bold mb-2">Your Investment Memo</h2>
                <p className="text-muted-foreground">Complete access unlocked — ready to share with investors</p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>

            <Button 
              size="lg" 
              className="w-full text-lg font-semibold"
              onClick={() => navigate("/generated-memo")}
            >
              View Your Memo
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <div className="mt-6 pt-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground text-center">
                Need to update your information?{" "}
                <button 
                  onClick={() => navigate("/portal")}
                  className="text-primary hover:underline"
                >
                  Edit your profile
                </button>
              </p>
            </div>
          </>
        );
    }
  };

  return (
    <div className="relative bg-card border-2 border-primary/30 rounded-3xl p-8 shadow-glow animate-fade-in hover:shadow-glow-strong transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 rounded-3xl -z-10" />
      {renderContent()}
    </div>
  );
};