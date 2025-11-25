import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";

export default function SolutionSlide() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/deck/solution");
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
          Solution Slide: Stop Explaining Features. Show the Magic.
        </h1>
        <p className="text-xl text-muted-foreground">
          Your solution isn't what your product does. It's why anyone gives a damn.
        </p>
      </div>

      <Callout type="danger">
        <strong>The Brutal Truth:</strong> If your solution slide looks like a product roadmap, 
        you've already lost. VCs don't invest in features. They invest in behavior change.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">What VCs Actually Look For</h2>
        <p>
          Your solution slide has one job: make investors believe you've built something 10x better 
          than the status quo. Not 20% better. 10x. Here's how:
        </p>
        <ul className="space-y-2 my-4">
          <li><strong>Show the transformation:</strong> Before vs. after. Pain vs. relief. Old way vs. new way.</li>
          <li><strong>Be visceral, not abstract:</strong> Don't say "we streamline workflows." Say "we turn 4 hours into 10 minutes."</li>
          <li><strong>Prove it's not vaporware:</strong> Screenshots, demos, or real user testimonials. Something tangible.</li>
          <li><strong>Explain the "why now":</strong> Why is this possible today and not 5 years ago?</li>
        </ul>
      </div>

      <ComparisonTable
        good={[
          "Manual data entry takes 14 hours/week. We automate it in real-time with 99% accuracy.",
          "Before: $50K/month on recruiting fees. After: $5K with our AI sourcing tool.",
          "Traditional tools require 3 engineers and 6 months. We ship in 2 weeks with one PM.",
        ]}
        bad={[
          "We use AI to improve efficiency",
          "Our platform makes things easier",
          "We're building the next-generation solution for X",
          "Our product has these 12 features...",
          "We leverage cutting-edge technology",
        ]}
      />

      <ConversionBanner message="Struggling to distill your solution into something investors actually care about? The Investment Memo shows you exactly how to position value, not features." />

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">Solution Slide Disasters</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">1. Feature Vomit</h3>
            <p>
              12 bullet points describing every button in your product. Investors don't care about 
              your feature set. They care about the outcome.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">2. Buzzword Bingo</h3>
            <p>
              "We're a blockchain-powered, AI-enabled, Web3-native platform leveraging machine learning 
              to disrupt..." This tells me you don't know what you actually do.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">3. No Proof It Works</h3>
            <p>
              You pitch the vision but show zero evidence anyone is using it. Mockups aren't proof. 
              Screenshots with real data are.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">4. Unclear Differentiation</h3>
            <p>
              Your solution sounds exactly like 10 other companies. If you can't explain in one sentence 
              why you're different, investors won't figure it out for you.
            </p>
          </div>
        </div>
      </div>

      <Checklist
        items={[
          "My solution is framed as a transformation, not a feature list",
          "I have concrete before/after numbers (time saved, cost reduced, etc.)",
          "I can show the product working (demo, screenshots, or real user proof)",
          "I explain why this is possible now and wasn't before",
          "My differentiation is obvious and defensible",
          "I avoid buzzwords and actually explain what I do",
        ]}
      />

      <Callout type="warning">
        <strong>What Happens If You Get This Wrong:</strong> VCs will think you're building a feature, 
        not a company. They'll assume someone bigger will copy you in 6 months. And they won't invest.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">What Great Founders Do Instead</h2>
        <p>They make the solution feel inevitable:</p>
        <ul className="space-y-2 my-4">
          <li>Use a powerful before/after visual (not just text)</li>
          <li>Include a real customer quote that captures the transformation</li>
          <li>Show the product in action—even if it's just a 10-second video</li>
          <li>Explain the "aha moment" when users realize your solution is 10x better</li>
        </ul>
      </div>

      <div className="bg-card border-2 border-primary/30 rounded-xl p-8 text-center space-y-4">
        <h3 className="text-2xl font-bold text-foreground">
          Nail Every Slide in Your Deck
        </h3>
        <p className="text-muted-foreground">
          The Investment Memorandum Template deconstructs all 12 critical slides—what works, what kills deals, 
          and how to position your solution for maximum impact.
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
