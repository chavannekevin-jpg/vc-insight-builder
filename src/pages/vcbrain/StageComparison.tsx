import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Callout } from "@/components/vcbrain/ContentBlock";

export default function StageComparison() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/tools/stages");
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
          Stage Comparison: Know Where You Actually Are
        </h1>
        <p className="text-xl text-muted-foreground">
          Most founders overestimate their stage by 6-12 months. This is why you get rejected.
        </p>
      </div>

      <Callout type="danger">
        <strong>Reality Check:</strong> If you're pre-revenue, you're not raising seed. If you have no product, 
        you're not raising pre-seed. Stop lying to yourself about what stage you're at.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">Angel Stage vs. Pre-Seed vs. Seed</h2>
        
        <div className="space-y-8 my-8">
          {/* Angel Stage */}
          <div className="p-6 bg-card/50 border-2 border-primary/30 rounded-xl">
            <h3 className="text-2xl font-bold text-primary mb-4">Angel Stage</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-bold mb-2">What You Have:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Idea or prototype</li>
                  <li>• Domain expertise</li>
                  <li>• Maybe a co-founder</li>
                  <li>• Early customer conversations</li>
                </ul>
              </div>
              <div>
                <p className="font-bold mb-2">What You Need:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Proof of concept</li>
                  <li>• Initial validation</li>
                  <li>• Time to build MVP</li>
                  <li>• $25K-$150K</li>
                </ul>
              </div>
              <div>
                <p className="font-bold mb-2">What Investors Want:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Founder obsession</li>
                  <li>• Domain expertise</li>
                  <li>• Execution velocity</li>
                  <li>• Coachability</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Pre-Seed Stage */}
          <div className="p-6 bg-card/50 border-2 border-primary/30 rounded-xl">
            <h3 className="text-2xl font-bold text-primary mb-4">Pre-Seed Stage</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-bold mb-2">What You Have:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Live product</li>
                  <li>• Early users/customers</li>
                  <li>• Initial traction signals</li>
                  <li>• $5K-$20K MRR (or equivalent)</li>
                </ul>
              </div>
              <div>
                <p className="font-bold mb-2">What You Need:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Prove PMF</li>
                  <li>• Hit $50K+ MRR</li>
                  <li>• Build repeatable growth</li>
                  <li>• $300K-$1M</li>
                </ul>
              </div>
              <div>
                <p className="font-bold mb-2">What Investors Want:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Real traction</li>
                  <li>• Retention proof</li>
                  <li>• Unit economics</li>
                  <li>• Clear seed plan</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Seed Stage */}
          <div className="p-6 bg-card/50 border-2 border-primary/30 rounded-xl">
            <h3 className="text-2xl font-bold text-primary mb-4">Seed Stage</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-bold mb-2">What You Have:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• $50K+ MRR</li>
                  <li>• Proven PMF</li>
                  <li>• Strong unit economics</li>
                  <li>• Multiple acquisition channels</li>
                </ul>
              </div>
              <div>
                <p className="font-bold mb-2">What You Need:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Scale to $1M ARR</li>
                  <li>• Build defensibility</li>
                  <li>• Hit Series A metrics</li>
                  <li>• $1M-$5M</li>
                </ul>
              </div>
              <div>
                <p className="font-bold mb-2">What Investors Want:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Scalable growth</li>
                  <li>• Defensible moat</li>
                  <li>• Repeatable model</li>
                  <li>• Series A trajectory</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4 mt-12">Red Flags for Each Stage</h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <h4 className="font-bold text-red-500 mb-2">Angel Stage Red Flags:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Asking for $500K+ before you've built anything</li>
              <li>• No domain expertise in the problem space</li>
              <li>• Can't articulate founder-market fit</li>
              <li>• Still working full-time elsewhere</li>
            </ul>
          </div>

          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <h4 className="font-bold text-red-500 mb-2">Pre-Seed Red Flags:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Product is still in beta 12 months later</li>
              <li>• All traction came from Product Hunt launch</li>
              <li>• Can't show retention cohorts</li>
              <li>• Raising to "figure out monetization"</li>
            </ul>
          </div>

          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <h4 className="font-bold text-red-500 mb-2">Seed Red Flags:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Revenue growth is flat or declining</li>
              <li>• Unit economics are broken (negative margins)</li>
              <li>• No clear path to $100K+ MRR</li>
              <li>• Raising to "buy time" instead of scale</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-card border-2 border-primary/30 rounded-xl p-8 text-center space-y-4 mt-12">
        <h3 className="text-2xl font-bold text-foreground">
          Know Your Stage, Raise Accordingly
        </h3>
        <p className="text-muted-foreground">
          The Investment Memorandum shows you exactly what metrics, milestones, and positioning 
          you need for each stage—no guessing, no over-optimism.
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
