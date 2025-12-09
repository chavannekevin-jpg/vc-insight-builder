import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Rocket, BookOpen, ArrowRight, Sparkles } from "lucide-react";

export default function SampleMemoCompletionScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        {/* Success Animation */}
        <div className="text-center mb-12">
          <div className="relative inline-flex items-center justify-center mb-8">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Sample Complete!
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            You've seen what a VC-quality investment memo looks like for CarbonPrint.
          </p>
        </div>

        {/* Key Takeaways */}
        <div className="bg-card border border-border/50 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            What You Just Experienced
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Honest VC Analysis</p>
                <p className="text-sm text-muted-foreground">The unfiltered perspective VCs have when reviewing your startup</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">2</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Strategic Tools</p>
                <p className="text-sm text-muted-foreground">Pain Validator, Moat Score, Unit Economics, and Exit Path analysis</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">3</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Critical Questions</p>
                <p className="text-sm text-muted-foreground">The exact questions VCs will ask in partner meetings</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-3">
            Ready for Your Own Memo?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Get the same level of VC analysis personalized to your startup. Know exactly how investors will evaluate you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/auth')}
              className="gap-2"
            >
              <Rocket className="w-4 h-4" />
              Create Your Memo
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              onClick={() => navigate('/sample-memo?view=full')}
              className="gap-2"
            >
              <BookOpen className="w-4 h-4" />
              View Full Sample
            </Button>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Button 
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-muted-foreground"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
