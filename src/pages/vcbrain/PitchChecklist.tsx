import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2 } from "lucide-react";

export default function PitchChecklist() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/tools/checklist");
        return;
      }
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const sections = [
    {
      title: "Pre-Fundraise Readiness",
      items: [
        "I have real traction (revenue, users, or undeniable usage)",
        "My retention metrics prove PMF (40%+ monthly retention)",
        "I know my unit economics (CAC, LTV, payback period)",
        "I have 18+ months runway or clear path to profitability",
        "My co-founder relationship is solid (clear roles, vesting)",
        "I've fixed major red flags (team, product, market)",
        "I know exactly what I'm raising and why"
      ]
    },
    {
      title: "Pitch Deck Essentials",
      items: [
        "Problem slide is specific and visceral (not generic)",
        "Solution slide shows transformation (not feature list)",
        "Product slide has real screenshots (not mockups)",
        "Market slide uses bottom-up TAM calculation",
        "Traction slide has real numbers (MRR, retention, growth)",
        "Team slide shows founder-market fit and execution proof",
        "Deck is under 15 slides (ideally 10-12)",
        "Ask slide is clear (amount, use of funds, milestones)"
      ]
    },
    {
      title: "Numbers You Must Know",
      items: [
        "MRR/ARR and month-over-month growth rate",
        "CAC (Customer Acquisition Cost)",
        "LTV (Lifetime Value) and LTV:CAC ratio",
        "Monthly churn rate",
        "Burn rate and runway",
        "Gross margins",
        "Cohort retention by month (30, 60, 90 days)",
        "Key engagement metrics (DAU, sessions, etc.)"
      ]
    },
    {
      title: "Questions You Must Be Ready For",
      items: [
        "Why you? (founder-market fit)",
        "Why now? (market timing and why this wasn't possible before)",
        "What's your unfair advantage?",
        "Who are your competitors and why will you win?",
        "What's your path to $100M revenue?",
        "What are your biggest risks?",
        "What happens if [big competitor] copies you?",
        "How will you use this money?",
        "What metrics will you hit in 12-18 months?"
      ]
    },
    {
      title: "Fundraising Process",
      items: [
        "I have a target list of 20-30 relevant investors",
        "I've researched what each investor cares about",
        "My intro emails are personalized (not mass spam)",
        "I have a clear timeline (6-8 weeks max)",
        "I'm running a parallel process (multiple investors at once)",
        "I have a lead investor in mind",
        "I'm prepared to negotiate terms",
        "I know my walk-away points"
      ]
    },
    {
      title: "Red Flags I've Eliminated",
      items: [
        "No co-founder drama or equity disputes",
        "Product is live and being used",
        "Not pitching multiple ideas at once",
        "Can explain business model in under 30 seconds",
        "Unit economics are defensible",
        "Not claiming 'no competitors'",
        "Team has relevant experience",
        "Asking for a reasonable amount (not $5M at pre-seed)"
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Pitch Readiness Checklist: Are You Actually Ready?
        </h1>
        <p className="text-xl text-muted-foreground">
          Most founders start fundraising 6 months too early. Don't be one of them.
        </p>
      </div>

      <div className="p-6 bg-primary/10 border-2 border-primary/30 rounded-xl">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-primary mb-2">How to Use This Checklist</h3>
            <p className="text-sm text-muted-foreground">
              Go through every section honestly. If you can't check off 80%+ of the items, you're not ready. 
              Fix what's missing before you start reaching out to investors.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={index} className="p-6 bg-card/50 border border-border/50 rounded-xl">
            <h3 className="text-xl font-bold text-foreground mb-4">{section.title}</h3>
            <ul className="space-y-3">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    className="mt-1 w-4 h-4 rounded border-border" 
                  />
                  <span className="text-sm text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-card border-2 border-primary/30 rounded-xl p-8 text-center space-y-4 mt-12">
        <h3 className="text-2xl font-bold text-foreground">
          Get the Complete Fundraising Playbook
        </h3>
        <p className="text-muted-foreground">
          The VC Analysis goes deeper than any checklist—it shows you exactly how to prepare, 
          pitch, and close investors at every stage.
        </p>
        <Button 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Get Your VC Analysis
        </Button>
      </div>
    </div>
  );
}
