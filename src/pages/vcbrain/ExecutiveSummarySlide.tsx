import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContentBlock, Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";
import { Button } from "@/components/ui/button";

export default function ExecutiveSummarySlide() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/deck/executive-summary");
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
      <h1 className="text-4xl font-bold text-foreground mb-2">The Executive Summary</h1>
      <p className="text-xl text-muted-foreground mb-8">
        30 seconds to capture attention—or lose it forever.
      </p>

      <Callout type="warning">
        The executive summary is often the only slide that gets read. VCs receive hundreds of 
        decks. If your summary doesn't immediately communicate what you do, why it matters, 
        and why they should care—they won't read the rest.
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">What to Include (In Order)</h2>
      
      <div className="bg-card border border-border rounded-lg p-6 my-6 space-y-4">
        <div className="border-b border-border pb-3">
          <span className="font-bold text-primary">1. One-Line Description</span>
          <p className="text-muted-foreground text-sm mt-1">What you do in 10 words or less. "We help X do Y."</p>
        </div>
        <div className="border-b border-border pb-3">
          <span className="font-bold text-primary">2. Problem</span>
          <p className="text-muted-foreground text-sm mt-1">The pain point you're solving (1-2 sentences)</p>
        </div>
        <div className="border-b border-border pb-3">
          <span className="font-bold text-primary">3. Solution</span>
          <p className="text-muted-foreground text-sm mt-1">How you solve it differently (1-2 sentences)</p>
        </div>
        <div className="border-b border-border pb-3">
          <span className="font-bold text-primary">4. Traction</span>
          <p className="text-muted-foreground text-sm mt-1">Your strongest proof point (revenue, users, growth rate)</p>
        </div>
        <div className="border-b border-border pb-3">
          <span className="font-bold text-primary">5. Market</span>
          <p className="text-muted-foreground text-sm mt-1">How big the opportunity is (TAM or specific segment)</p>
        </div>
        <div>
          <span className="font-bold text-primary">6. The Ask</span>
          <p className="text-muted-foreground text-sm mt-1">What you're raising and what you'll achieve</p>
        </div>
      </div>

      <ComparisonTable
        good={[
          "Clear, jargon-free explanation of the business",
          "Specific numbers (revenue, growth, users)",
          "One compelling 'hook' that makes them curious",
          "Answers 'why now' and 'why this team'",
          "Fits on one slide, readable in 30 seconds"
        ]}
        bad={[
          "Buzzword soup ('AI-powered blockchain synergy')",
          "No numbers or metrics",
          "Three paragraphs of text",
          "Requires context from other slides to understand",
          "Generic claims that could apply to any startup"
        ]}
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Examples: Punchy vs Terrible</h2>

      <div className="space-y-4 my-6">
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <span className="text-green-400 font-bold text-sm uppercase">✓ Good Example</span>
          <p className="text-foreground mt-2 font-medium">
            "Lattice helps growing companies manage performance reviews. 2,500 companies pay us 
            $36M ARR (140% NRR). HR software market is $15B. Raising $25M Series B to expand 
            into compensation and analytics."
          </p>
        </div>

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <span className="text-red-400 font-bold text-sm uppercase">✗ Bad Example</span>
          <p className="text-foreground mt-2 font-medium">
            "We're building the next generation of human capital management solutions leveraging 
            AI and machine learning to transform how enterprises think about their most valuable 
            asset—their people. Our innovative platform enables digital transformation of HR workflows."
          </p>
        </div>
      </div>

      <Callout type="danger">
        If someone reads your executive summary and says "but what do you actually DO?"—you've 
        failed. Clarity beats cleverness every single time.
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">The "Hook" That Works</h2>
      <p className="text-muted-foreground mb-4">
        The best summaries have one element that makes VCs lean in. Options:
      </p>

      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
        <li><strong>Impressive traction:</strong> "$2M ARR, 5x YoY growth" - numbers that are clearly exceptional for your stage</li>
        <li><strong>Unique insight:</strong> A counterintuitive take on the market that makes them think</li>
        <li><strong>Founder-market fit:</strong> "Former head of X at [impressive company] solving problem they lived"</li>
        <li><strong>Timing proof:</strong> "Market shift X makes this possible now when it wasn't before"</li>
        <li><strong>Customer proof:</strong> "[Recognizable company] is already paying $X/year"</li>
      </ul>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Common Summary Mistakes</h2>
      
      <div className="space-y-3 mb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <span className="font-semibold text-foreground">Too long:</span>
          <span className="text-muted-foreground ml-2">If it takes more than 30 seconds to read, it's too long. Ruthlessly cut.</span>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <span className="font-semibold text-foreground">Too vague:</span>
          <span className="text-muted-foreground ml-2">"We help businesses grow" tells me nothing. Be specific about who and how.</span>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <span className="font-semibold text-foreground">No numbers:</span>
          <span className="text-muted-foreground ml-2">Qualitative claims are ignorable. Quantitative claims demand attention.</span>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <span className="font-semibold text-foreground">Buried lede:</span>
          <span className="text-muted-foreground ml-2">Your most impressive fact should be prominent, not hidden in paragraph 3.</span>
        </div>
      </div>

      <ConversionBanner 
        message="Want to see how to structure a compelling executive summary? The VC Analysis shows exactly how VCs want information presented."
        buttonText="Get Your Analysis"
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Executive Summary Checklist</h2>
      <Checklist
        items={[
          "Readable in 30 seconds or less",
          "Clear one-liner explaining what you do",
          "At least one impressive metric or proof point",
          "Problem and solution clearly stated",
          "Market size mentioned",
          "Ask amount and use of funds",
          "One 'hook' that makes them want to read more",
          "Zero jargon or buzzwords"
        ]}
      />

      <Callout type="success">
        Write your executive summary last—after you know exactly what your strongest points are. 
        Then lead with your best stuff. Every word should earn its place.
      </Callout>

      <div className="mt-10 flex justify-center">
        <Button 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Craft Your Summary
        </Button>
      </div>
    </ContentBlock>
  );
}
