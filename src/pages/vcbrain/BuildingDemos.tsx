import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContentBlock, Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";
import { Button } from "@/components/ui/button";

export default function BuildingDemos() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/guides/demos");
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
      <h1 className="text-4xl font-bold text-foreground mb-2">Building Demos That Sell</h1>
      <p className="text-xl text-muted-foreground mb-8">
        A great demo makes VCs imagine using your product. A bad one makes them check email.
      </p>

      <Callout type="warning">
        Most founders demo like they're training a new employee: "Here's the dashboard, here's 
        the settings, here are the features..." VCs don't care about features. They care about 
        outcomes. Show the transformation, not the tool.
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">The Demo Structure That Converts</h2>
      
      <div className="bg-card border border-border rounded-lg p-6 my-6 space-y-4">
        <div className="border-b border-border pb-3">
          <span className="font-bold text-primary">1. The Setup (30 seconds)</span>
          <p className="text-muted-foreground text-sm mt-1">Set up the scenario: "Imagine you're a [customer type] dealing with [problem]..."</p>
        </div>
        <div className="border-b border-border pb-3">
          <span className="font-bold text-primary">2. The Pain (30 seconds)</span>
          <p className="text-muted-foreground text-sm mt-1">Show how it's done today: slow, painful, error-prone. Make them feel the frustration.</p>
        </div>
        <div className="border-b border-border pb-3">
          <span className="font-bold text-primary">3. The Magic Moment (60 seconds)</span>
          <p className="text-muted-foreground text-sm mt-1">Show your solution doing its core thing. One workflow, done beautifully.</p>
        </div>
        <div>
          <span className="font-bold text-primary">4. The Impact (30 seconds)</span>
          <p className="text-muted-foreground text-sm mt-1">"What took 2 hours now takes 2 minutes" — quantify the improvement.</p>
        </div>
      </div>

      <ComparisonTable
        good={[
          "Story-driven: 'Let me show you Sarah's workflow...'",
          "One core use case done perfectly",
          "Shows outcome, not just features",
          "Has a clear 'wow' moment",
          "Ends with quantified impact"
        ]}
        bad={[
          "Feature tour: 'Here's the dashboard, here's settings...'",
          "Trying to show everything",
          "Generic demo environment with fake data",
          "Reading text on screen",
          "No clear narrative arc"
        ]}
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Live Demo vs Recorded: When to Use Each</h2>
      
      <div className="grid md:grid-cols-2 gap-4 my-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-bold text-foreground mb-2">🎥 Recorded Demo</h4>
          <p className="text-sm text-muted-foreground mb-2">Best when:</p>
          <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-sm">
            <li>Sending ahead of meetings</li>
            <li>Complex setup required</li>
            <li>Internet reliability concerns</li>
            <li>You need perfect pacing</li>
          </ul>
          <p className="text-xs text-primary mt-3">Tip: Keep under 3 minutes. Add captions.</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-bold text-foreground mb-2">🎤 Live Demo</h4>
          <p className="text-sm text-muted-foreground mb-2">Best when:</p>
          <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-sm">
            <li>Building trust and credibility</li>
            <li>Answering real-time questions</li>
            <li>Showing product stability</li>
            <li>Customizing to their interests</li>
          </ul>
          <p className="text-xs text-primary mt-3">Tip: Have a backup recording ready.</p>
        </div>
      </div>

      <Callout type="danger">
        Live demos fail. It's not if, it's when. Always have a backup: recorded video, screenshots, 
        or a "let me show you on this test account" fallback. Never say "it usually works."
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Handling Demo Failures Gracefully</h2>
      <p className="text-muted-foreground mb-4">
        When (not if) something breaks:
      </p>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 my-6 space-y-3">
        <p className="text-foreground font-semibold">The Professional Response:</p>
        <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
          <li><strong>Acknowledge immediately:</strong> "Looks like we're having a connectivity issue"</li>
          <li><strong>Don't panic or apologize excessively:</strong> One "sorry about that" is enough</li>
          <li><strong>Pivot smoothly:</strong> "Let me switch to the recorded version / backup account"</li>
          <li><strong>Turn it into a positive:</strong> "This is actually a good test of our error handling..."</li>
        </ol>
      </div>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">The 3-Minute vs 10-Minute Demo</h2>

      <div className="space-y-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-bold text-foreground mb-2">3-Minute Demo (First Meeting)</h4>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
            <li>One user story, one workflow</li>
            <li>Your single most impressive feature</li>
            <li>Clear before/after contrast</li>
            <li>Leave them wanting more</li>
          </ul>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-bold text-foreground mb-2">10-Minute Demo (Deep Dive)</h4>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
            <li>Full workflow end-to-end</li>
            <li>Show integrations and data flow</li>
            <li>Address technical questions</li>
            <li>Multiple user personas if relevant</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Demo Environment Best Practices</h2>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
        <li><strong>Use realistic data:</strong> Generic "Lorem ipsum" kills credibility. Use data that looks real.</li>
        <li><strong>Pre-load everything:</strong> Nobody wants to watch you type or wait for pages to load.</li>
        <li><strong>Clear browser state:</strong> Close tabs, clear history, hide bookmarks bar.</li>
        <li><strong>Test on the same setup:</strong> Same browser, same screen size, same connection you'll use live.</li>
        <li><strong>Have multiple accounts:</strong> If one breaks, seamlessly switch to another.</li>
      </ul>

      <ConversionBanner 
        message="Want to learn how VCs evaluate your product demonstration? The Investment Memo Template includes a Product section showing exactly what investors look for."
        buttonText="Get the Template"
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Demo Checklist</h2>
      <Checklist
        items={[
          "Story-driven narrative (not feature tour)",
          "One clear 'wow' moment",
          "Shows outcome, not just functionality",
          "Under 3 minutes for first meetings",
          "Backup plan ready for failures",
          "Realistic demo data (not Lorem ipsum)",
          "Quantified impact at the end",
          "Tested on exact same setup you'll use"
        ]}
      />

      <Callout type="success">
        The best demos make VCs think: "I can see why customers love this." Focus on the 
        transformation your product creates, not the features that enable it.
      </Callout>

      <div className="mt-10 flex justify-center">
        <Button 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Perfect Your Product Story
        </Button>
      </div>
    </ContentBlock>
  );
}
