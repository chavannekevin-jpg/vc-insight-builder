import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";

export default function ProblemSlide() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/deck/problem");
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Problem Slide: Most Founders Get This Catastrophically Wrong
        </h1>
        <p className="text-xl text-muted-foreground">
          Your problem slide isn't about explaining the problem. It's about proving you understand it better than anyone else.
        </p>
      </div>

      <Callout type="danger">
        <strong>The Brutal Truth:</strong> If your problem slide could apply to any startup in your category, 
        you don't understand the problem. VCs will sniff this out in 30 seconds.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">What VCs Actually Look For</h2>
        <p>
          VCs don't want generic market pain points. They want proof that you've lived this problem and 
          understand its nuances better than anyone else. Here's what actually works:
        </p>
        <ul className="space-y-2 my-4">
          <li><strong>Specificity:</strong> Name the exact persona who has this problem</li>
          <li><strong>Current behavior:</strong> What terrible solution are they using today?</li>
          <li><strong>Cost of the problem:</strong> What does it cost them in time, money, or opportunity?</li>
          <li><strong>Why now:</strong> Why hasn't this been solved before?</li>
        </ul>
      </div>

      <ComparisonTable
        good={[
          "Sales teams waste 14 hours/week manually updating CRMs because data entry tools don't integrate with video calls",
          "Founders spend $50k on bad hires because traditional recruiting doesn't test for startup skills",
          "CFOs lose 2-3 days/month reconciling payroll across 5 systems",
        ]}
        bad={[
          "Collaboration is hard",
          "Hiring is broken",
          "Financial tools are outdated",
          "Communication needs improvement",
          "X market is inefficient",
        ]}
      />

      <ConversionBanner message="Struggling to nail your problem statement? The VC Analysis shows you how VCs evaluate problem slides—and the exact framework to make yours stand out." />

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">Common Problem Slide Disasters</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">1. Solution in Disguise</h3>
            <p>
              "Problem: There's no AI-powered tool for X." That's not a problem, that's your solution. 
              The problem is what happens WITHOUT your tool.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">2. Market Size Theater</h3>
            <p>
              Starting with "$500B market opportunity" tells VCs you don't understand the problem. 
              Start with the human pain.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">3. Generic Corporate Speak</h3>
            <p>
              "Enterprises need better visibility into workflows." Which enterprises? What workflows? 
              Better how? This is consultant-speak, not founder conviction.
            </p>
          </div>
        </div>
      </div>

      <Checklist
        items={[
          "My problem is specific to a named persona",
          "I can describe the terrible workaround they use today",
          "I have a number for what this costs them (time/money/opportunity)",
          "I can explain why this hasn't been solved before",
          "I've talked to 20+ people who have this exact problem",
          "The problem is urgent, not just 'nice to have'",
        ]}
      />

      <Callout type="warning">
        <strong>What Happens If You Get This Wrong:</strong> VCs will nod politely, then pass. 
        A weak problem slide signals you're building a solution looking for a problem. That's a death sentence.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">What Great Founders Do Instead</h2>
        <p>They make the problem visceral:</p>
        <ul className="space-y-2 my-4">
          <li>Use a real customer quote that captures the pain</li>
          <li>Show before/after time or cost comparison</li>
          <li>Include a specific scenario that makes VCs go "oh shit, yeah"</li>
          <li>Connect the problem to a bigger trend (but don't lead with it)</li>
        </ul>
      </div>

      <div className="bg-card border-2 border-primary/30 rounded-xl p-8 text-center space-y-4">
        <h3 className="text-2xl font-bold text-foreground">
          Master Every Slide in Your Deck
        </h3>
        <p className="text-muted-foreground">
          The VC Analysis breaks down all 12 critical slides—what VCs look for, 
          what kills your chances, and exactly how to fix it.
        </p>
        <Button 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Get the Full Framework
        </Button>
      </div>
    </div>
  );
}
