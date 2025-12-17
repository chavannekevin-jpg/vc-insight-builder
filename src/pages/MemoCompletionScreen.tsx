import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, BookOpen, Printer, ArrowRight, 
  Target, Lightbulb, Users, TrendingUp, Rocket 
} from "lucide-react";

export default function MemoCompletionScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");
  const [loading, setLoading] = useState(true);
  const [hasPremium, setHasPremium] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (!companyId) {
        navigate("/portal");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const returnTo = `${window.location.pathname}${window.location.search}`;
        navigate(`/auth?redirect=${encodeURIComponent(returnTo)}`, { replace: true });
        return;
      }

      // Check premium status
      const { data: company } = await supabase
        .from("companies")
        .select("has_premium, founder_id")
        .eq("id", companyId)
        .maybeSingle();

      // Verify ownership and premium status
      if (!company || company.founder_id !== user.id) {
        navigate("/portal");
        return;
      }

      if (!company.has_premium) {
        // Non-premium users shouldn't access completion screen for full memo
        navigate(`/checkout-analysis?companyId=${companyId}`, { replace: true });
        return;
      }

      setHasPremium(true);
      setLoading(false);
    };

    checkAccess();
  }, [companyId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const keyTakeaways = [
    { icon: Target, label: "Problem clearly defined" },
    { icon: Lightbulb, label: "Solution differentiated" },
    { icon: Users, label: "Team gaps identified" },
    { icon: TrendingUp, label: "Traction analyzed" },
    { icon: Rocket, label: "Investment thesis reviewed" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Success Animation */}
        <div className="text-center mb-12">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-display font-bold mt-8 mb-4 text-foreground">
            Memo Complete!
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            You've reviewed all sections of your investment memo. Here's what we covered:
          </p>
        </div>

        {/* Key Takeaways */}
        <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Sections Reviewed</h2>
          <div className="space-y-3">
            {keyTakeaways.map((item, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                <CheckCircle className="w-4 h-4 text-primary ml-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Button 
            variant="default" 
            size="lg"
            className="w-full gap-2"
            onClick={() => navigate(`/analysis?companyId=${companyId}&view=full`)}
          >
            <BookOpen className="w-5 h-5" />
            View Full Analysis
          </Button>
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.print()}
              className="gap-2"
            >
              <Printer className="w-4 h-4" />
              Print / PDF
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate(`/analysis/overview?companyId=${companyId}`)}
              className="gap-2"
            >
              Overview
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={() => navigate("/portal")}
          >
            Back to Portal
          </Button>
        </div>
      </div>
    </div>
  );
}
