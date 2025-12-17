import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContentBlock, Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";
import { Button } from "@/components/ui/button";

export default function FundraisingTimeline() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/guides/timeline");
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
    <ContentBlock>
      <h1 className="text-4xl font-bold text-foreground mb-2">Fundraising Timeline Reality</h1>
      <p className="text-xl text-muted-foreground mb-8">
        "I'll raise in 4 weeks" — said every first-time founder before it took 6 months.
      </p>

      <Callout type="danger">
        Fundraising takes longer than you think. Always. First-time founders consistently 
        underestimate by 2-3x. The most dangerous mistake: waiting until you're desperate 
        to start. Desperate founders get bad terms—or no terms at all.
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Realistic Timelines by Stage</h2>
      
      <div className="space-y-4 my-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-foreground text-lg">Pre-Seed</h3>
            <span className="text-primary font-bold">2-4 months typical</span>
          </div>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
            <li>Faster if you have warm intros and strong founder credibility</li>
            <li>Can be weeks for well-connected repeat founders</li>
            <li>Often angel-heavy, which means many small checks to coordinate</li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-foreground text-lg">Seed</h3>
            <span className="text-primary font-bold">3-6 months typical</span>
          </div>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
            <li>Institutional investors have longer diligence processes</li>
            <li>Need to find a lead investor before filling the round</li>
            <li>Legal and documentation takes 2-4 weeks after verbal commitment</li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-foreground text-lg">Series A</h3>
            <span className="text-primary font-bold">4-8 months typical</span>
          </div>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
            <li>Deep diligence: customer calls, financial modeling, reference checks</li>
            <li>Partner meetings and investment committee processes</li>
            <li>Term sheet negotiation can take weeks</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">The Fundraising Process Breakdown</h2>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 my-6">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
            <div>
              <p className="font-semibold text-foreground">Preparation (2-4 weeks)</p>
              <p className="text-muted-foreground text-sm">Deck, data room, target list, intro requests</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
            <div>
              <p className="font-semibold text-foreground">Initial Outreach (2-4 weeks)</p>
              <p className="text-muted-foreground text-sm">First meetings, sorting interested from not</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
            <div>
              <p className="font-semibold text-foreground">Deep Dives (3-6 weeks)</p>
              <p className="text-muted-foreground text-sm">Partner meetings, due diligence, customer references</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
            <div>
              <p className="font-semibold text-foreground">Term Sheet (1-2 weeks)</p>
              <p className="text-muted-foreground text-sm">Negotiation, final partner approval</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">5</span>
            <div>
              <p className="font-semibold text-foreground">Legal & Closing (2-4 weeks)</p>
              <p className="text-muted-foreground text-sm">Documentation, signatures, wire transfer</p>
            </div>
          </div>
        </div>
      </div>

      <ComparisonTable
        good={[
          "Start fundraising with 9+ months of runway",
          "Build investor relationships before you need them",
          "Create artificial urgency with parallel conversations",
          "Keep building while fundraising (show momentum)",
          "Have a 'Plan B' if fundraise takes longer"
        ]}
        bad={[
          "Wait until you have 3 months of runway",
          "Cold email investors when you're desperate",
          "Go sequentially: one meeting at a time",
          "Stop all other work to focus on fundraising",
          "Assume you'll close in the timeline you want"
        ]}
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Managing Burn While Fundraising</h2>
      <p className="text-muted-foreground mb-4">
        Fundraising is a full-time job—but your company still needs to run. Strategies:
      </p>

      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
        <li><strong>Batch meetings:</strong> Do all your VC meetings in 2-3 weeks, not spread over months</li>
        <li><strong>Divide and conquer:</strong> If you have co-founders, one focuses on fundraising while others run the business</li>
        <li><strong>Reduce burn proactively:</strong> Cut discretionary spend before you start, not when you're desperate</li>
        <li><strong>Maintain momentum:</strong> The best leverage in fundraising is a business that's growing during the process</li>
        <li><strong>Know your walk-away point:</strong> What's the minimum runway at which you'd accept worse terms vs keep looking?</li>
      </ul>

      <Callout type="warning">
        VCs talk to each other. If you're meeting with 50 investors over 6 months, word gets 
        around that you're struggling. Batch your outreach and create compressed timelines.
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">When to Start Raising</h2>
      
      <div className="bg-card border border-border rounded-lg p-6 my-6">
        <p className="font-semibold text-foreground mb-3">The Formula:</p>
        <p className="text-muted-foreground mb-4">
          Start raising when you have [expected fundraising time] + [3 month buffer] runway remaining.
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>If you expect 4 months to raise:</span>
            <span className="text-primary">Start with 7+ months runway</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>If you expect 6 months to raise:</span>
            <span className="text-primary">Start with 9+ months runway</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          This assumes you'll need buffer for things going wrong. They usually do.
        </p>
      </div>

      <ConversionBanner 
        message="Planning your fundraise? The VC Analysis helps you prepare everything VCs want to see—so you can move faster when the time comes."
        buttonText="Start Preparing"
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Fundraising Timeline Checklist</h2>
      <Checklist
        items={[
          "Starting with 6+ months runway (ideally 9+)",
          "All materials ready before first meeting (deck, data room)",
          "Target list of 50+ investors built",
          "Warm intros secured for top 20 targets",
          "Plan for running business during fundraise",
          "Burn reduction measures identified if needed",
          "Walk-away terms defined in advance",
          "Buffer built in for things taking longer"
        ]}
      />

      <Callout type="success">
        The founders who raise fastest are the ones who started preparing earliest. Build 
        relationships with investors before you need them. Have your materials ready. 
        And never, ever wait until you're desperate.
      </Callout>

      <div className="mt-10 flex justify-center">
        <Button 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Prepare Your Fundraise
        </Button>
      </div>
    </ContentBlock>
  );
}
