import { Link } from "react-router-dom";
import { ArrowLeft, Calculator, Target, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const ReturnProfile = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/vcbrain">
          <Button variant="ghost" className="mb-8 -ml-4 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to VC Brain
          </Button>
        </Link>

        <div className="mb-8">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Insider Take
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            You're Not Pitching a Company. You're Pitching a Return Profile.
          </h1>
          <p className="text-xl text-muted-foreground">
            The difference changes everything.
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <p className="text-lg text-foreground leading-relaxed m-0">
              I remember sitting in our Monday partner meeting, and my colleague said something that changed how I think about this entire business: <strong>"We don't invest in companies. We invest in return profiles with company-shaped wrappers."</strong>
            </p>
          </div>

          <p>
            It sounds cynical. It's not. It's just honest about what venture capital actually is.
          </p>

          <p>
            Let me introduce you to "Layla" and "Stefan." Both pitched me the same week. Both were building developer tools. Both had similar traction — about €80K MRR.
          </p>

          <p>
            Layla's pitch was all about the product. Beautiful demos. Happy customers. Technical elegance. She spent 35 minutes showing us how the software worked.
          </p>

          <p>
            Stefan's pitch was different. He opened with: "There are 28 million developers worldwide. By 2030, there will be 45 million. Every single one needs what we're building. Here's why we'll own this category, and here's what that means for your fund."
          </p>

          <p>
            We invested in Stefan.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <Calculator className="h-6 w-6 text-primary" />
            The Return Profile Framework
          </h2>

          <p>
            A return profile is the mathematical story of how your company becomes a <Link to="/vcbrain/insider/power-laws" className="text-primary hover:underline">power law outcome</Link>. It answers:
          </p>

          <ul>
            <li><strong>Entry point:</strong> What am I paying today? (Valuation × ownership)</li>
            <li><strong>Exit magnitude:</strong> How big could this get? (TAM × market share × revenue multiple)</li>
            <li><strong>Time horizon:</strong> How long until liquidity? (Affects IRR dramatically)</li>
            <li><strong>Dilution path:</strong> How much will I own at exit? (Future rounds matter)</li>
            <li><strong>Probability weighting:</strong> What's the realistic chance of each scenario?</li>
          </ul>

          <div className="bg-card border border-border rounded-xl p-6 my-8">
            <h4 className="font-semibold text-foreground mb-4">A Real Return Profile Calculation</h4>
            <p className="text-muted-foreground mb-4">
              Let's say I invest €3M at a €15M post-money valuation (20% ownership) at <Link to="/vcbrain/stages/seed" className="text-primary hover:underline">Seed stage</Link>.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">If company exits at €50M:</span>
                <span className="text-foreground">€10M return (3.3x) — after dilution to ~10%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">If company exits at €200M:</span>
                <span className="text-foreground">€16M return (5.3x) — after dilution to ~8%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">If company exits at €1B:</span>
                <span className="text-foreground">€60M return (20x) — after dilution to ~6%</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">If company fails:</span>
                <span className="text-foreground">€0 return (total loss)</span>
              </div>
            </div>
          </div>

          <p>
            Now I weight these by probability. If I think there's a 60% chance of failure, 25% chance of modest exit, 10% chance of €200M exit, and 5% chance of €1B exit, my expected value calculation determines whether this is a good investment.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <Target className="h-6 w-6 text-primary" />
            Why Founders Miss This
          </h2>

          <p>
            Most founders pitch like Layla. They're in love with their product (as they should be). They want to show us every feature, every customer testimonial, every technical decision.
          </p>

          <p>
            But here's the thing: <strong>Product quality is table stakes.</strong> By the time you're in my office, I assume your product is good enough. What I'm trying to figure out is the return profile.
          </p>

          <p>
            The questions running through my head aren't:
          </p>

          <ul>
            <li>"Is this a good product?" ✓ (assumed)</li>
            <li>"Do customers like it?" ✓ (assumed)</li>
            <li>"Is the team smart?" ✓ (assumed)</li>
          </ul>

          <p>
            They're:
          </p>

          <ul>
            <li>"Can this reach €100M+ ARR?"</li>
            <li>"How fast can it get there?"</li>
            <li>"What exit multiples does this category command?"</li>
            <li>"Will this need 2 or 5 more funding rounds?"</li>
            <li>"Who will buy this company or take it public?"</li>
          </ul>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <Users className="h-6 w-6 text-primary" />
            Speaking Our Language
          </h2>

          <p>
            Stefan understood this intuitively. His deck included:
          </p>

          <div className="space-y-4 my-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Exit Comparables</h4>
              <p className="text-muted-foreground m-0">
                He showed 5 developer tool companies that had exited in the last 5 years, their exit multiples, and why his trajectory was similar. He made the <Link to="/vcbrain/how-vcs-work/investment-committee" className="text-primary hover:underline">Investment Committee's</Link> job easy.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Ownership Math</h4>
              <p className="text-muted-foreground m-0">
                He explicitly said: "At our proposed valuation, if you invest €2M and we hit our target exit range of €400-600M, you're looking at 15-25x. Here's the dilution model."
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Time-to-Exit Estimate</h4>
              <p className="text-muted-foreground m-0">
                He said: "Based on our growth rate and the typical timeline in this category, we expect exit optionality in 5-7 years. That fits your fund cycle." (He'd clearly read about <Link to="/vcbrain/vc-mechanics/fundraising-cycles" className="text-primary hover:underline">VC fund cycles</Link>.)
              </p>
            </div>
          </div>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <TrendingUp className="h-6 w-6 text-primary" />
            The Uncomfortable Corollary
          </h2>

          <p>
            This framework also explains why VCs sometimes invest in "worse" companies over "better" ones.
          </p>

          <p>
            I once passed on a beautifully profitable €5M ARR SaaS company (let's call it "CleanMetrics") to invest in a pre-revenue marketplace (let's call it "TradeLoop").
          </p>

          <p>
            CleanMetrics was objectively a better business that day. Better margins. Actual customers. Proven model.
          </p>

          <p>
            But CleanMetrics' return profile topped out at maybe 8x for us. The category was mature, multiples were compressed, and the market wasn't big enough for a massive outcome.
          </p>

          <p>
            TradeLoop's return profile, despite being early and risky, had a realistic path to 50x. Different category dynamics, network effects, and a massive underlying market.
          </p>

          <p>
            TradeLoop could return our fund. CleanMetrics couldn't.
          </p>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 my-8">
            <h4 className="font-semibold text-foreground mb-3">Making Your Return Profile Crystal Clear</h4>
            <p className="text-muted-foreground mb-4">
              This is exactly why your investment memo needs a section that explicitly models the return profile for investors. Not just your projections — but the math that shows how an investment in your company could return a meaningful portion of their fund.
            </p>
            <p className="text-muted-foreground m-0">
              When I champion a deal internally, I need ammunition. Give me the comparable exits. Give me the market size math. Give me the ownership model. Our memo builder helps you structure exactly this narrative.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-6">
            The Founder's Advantage
          </h2>

          <p>
            Here's the good news: most founders don't pitch this way. Which means if you do, you immediately stand out.
          </p>

          <p>
            You don't need to be a finance expert. You just need to show you understand that VCs are buying a financial instrument, not just believing in a dream.
          </p>

          <p>
            The dream matters — it's what drives the financial instrument's value. But the pitch needs to connect that dream to the math.
          </p>

          <p>
            Stefan didn't have a better product than Layla. He had a better understanding of what we were actually buying.
          </p>

          <p>
            And that made all the difference.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Continue Reading</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/vcbrain/insider/good-business-bad-vc" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
              <h4 className="font-medium text-foreground">Good Businesses, Bad VC Investments</h4>
              <p className="text-sm text-muted-foreground">Why great company ≠ great VC outcome</p>
            </Link>
            <Link to="/vcbrain/insider/ownership-vs-valuation" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
              <h4 className="font-medium text-foreground">Ownership vs. Valuation</h4>
              <p className="text-sm text-muted-foreground">Why VCs care more about one</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnProfile;
