import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ModernCard } from "@/components/ModernCard";
import { DeckImportWizard, ExtractedData } from "@/components/DeckImportWizard";
import { ArrowRight, Upload, Zap, FileText, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Intake() {
  const navigate = useNavigate();
  const [deckWizardOpen, setDeckWizardOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

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

  const handleDeckImportComplete = async (data: ExtractedData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please sign in first", variant: "destructive" });
        navigate("/auth");
        return;
      }

      // Create company from deck data
      const companyName = data.companyInfo.name || "My Company";
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
          has_premium: false,
          deck_parsed_at: new Date().toISOString()
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 gradient-hero -z-10 opacity-30" />
      
      <div className="w-full max-w-2xl space-y-8 animate-fade-in">
        <ModernCard className="p-8">
          <div className="space-y-6">
            <div className="text-center space-y-3 mb-8">
              <h2 className="text-3xl font-serif font-bold">Upload Your Pitch Deck</h2>
              <p className="text-muted-foreground">
                We'll analyze it through VC eyes and show you exactly what partners say when you leave the room.
              </p>
            </div>

            {/* Main Upload CTA */}
            <div 
              onClick={() => setDeckWizardOpen(true)}
              className="cursor-pointer group"
            >
              <div className="relative p-8 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="p-4 rounded-2xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
                    <Upload className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Select Your Deck</h3>
                    <p className="text-muted-foreground mb-4">
                      PDF, PNG, or JPG — we'll extract your company info automatically
                    </p>
                    <div className="flex items-center justify-center gap-2 text-primary font-medium">
                      <Zap className="w-4 h-4" />
                      Takes less than 30 seconds
                    </div>
                  </div>
                  <Button size="lg" className="mt-4 gap-2">
                    Upload Deck
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* What happens next */}
            <div className="pt-6 border-t border-border/50">
              <h4 className="text-sm font-semibold text-muted-foreground mb-4 text-center">What happens next?</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">AI extracts your company info</p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  </div>
                  <p className="text-xs text-muted-foreground">See your VC verdict instantly</p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">Fix blind spots before VCs see them</p>
                </div>
              </div>
            </div>

            {/* Why we need this */}
            <div className="bg-muted/30 rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold">Why deck upload?</span> Your deck contains the story you're telling VCs. 
                We need to see it to give you honest feedback on how it lands.
              </p>
            </div>
          </div>
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
