import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eye, TrendingUp, Users, Target, Briefcase, DollarSign, BarChart3, Lightbulb, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const lockedSections = [
  { icon: Target, label: "Solution" },
  { icon: TrendingUp, label: "Market" },
  { icon: Lightbulb, label: "Product" },
  { icon: BarChart3, label: "Traction" },
  { icon: Users, label: "Team" },
  { icon: Briefcase, label: "Business Model" },
  { icon: DollarSign, label: "The Ask" },
];

export function UnlockMemoCTA() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");
  const [isChecking, setIsChecking] = useState(false);
  const [hasPremium, setHasPremium] = useState<boolean | null>(null);

  // Check if company already has premium access (granted by admin)
  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!companyId) return;
      
      const { data } = await supabase
        .from('companies')
        .select('has_premium')
        .eq('id', companyId)
        .single();
      
      setHasPremium(data?.has_premium ?? false);
    };
    
    checkPremiumStatus();
  }, [companyId]);

  const handleUnlock = () => {
    if (!companyId) return;
    
    setIsChecking(true);
    
    // If already has premium (admin granted), go directly to full analysis
    if (hasPremium) {
      navigate(`/analysis?companyId=${companyId}&view=full`);
    } else {
      // Otherwise, go to checkout
      navigate(`/checkout-analysis?companyId=${companyId}`);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 p-8 my-8">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative space-y-6">
        {/* Main headline */}
        <div className="space-y-3 max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            500 founders will pitch the same VCs this month.
          </h2>
          <p className="text-lg text-muted-foreground">
            Most have no idea what's in their blind spots. You could.
          </p>
        </div>

        {/* Locked sections grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {lockedSections.map(({ icon: Icon, label }) => (
            <div 
              key={label}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/60 border border-border/50 text-sm text-muted-foreground"
            >
              <Icon className="w-4 h-4 text-primary/60" />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button 
          size="lg" 
          onClick={handleUnlock}
          disabled={isChecking}
          className="gap-2 text-base px-8"
        >
          {isChecking ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
          {hasPremium ? "View Full Analysis →" : "See What VCs See →"}
        </Button>
      </div>
    </div>
  );
}
