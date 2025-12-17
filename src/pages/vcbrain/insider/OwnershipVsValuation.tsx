import { Link } from "react-router-dom";
import { ArrowLeft, PieChart, Calculator, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const OwnershipVsValuation = () => {
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
            Why VCs Care More About Ownership than Valuation
          </h1>
          <p className="text-xl text-muted-foreground">
            Math beats ego.
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <p className="text-lg text-foreground leading-relaxed m-0">
              Founders obsess over valuation. VCs obsess over ownership. These are related but different metrics, and understanding the distinction will change how you negotiate. <strong>A high valuation with low ownership can be worse for a VC than a lower valuation with higher ownership — even though it sounds counterintuitive.</strong>
            </p>
          </div>

          <p>
            Let me introduce you to my favorite mental model in VC: the ownership math that drives every decision we make.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <Calculator className="h-6 w-6 text-primary" />
            The Basic Math
          </h2>

          <p>
            Here's a simple comparison that illustrates why ownership trumps valuation:
          </p>

          <div className="bg-card border border-border rounded-xl p-6 my-8">
            <h4 className="font-semibold text-foreground mb-4">Scenario A: High Valuation</h4>
            <ul className="text-muted-foreground space-y-1">
              <li>Investment: €3M at €30M post-money valuation</li>
              <li>Ownership: 10%</li>
              <li>If company exits at €300M: €30M return (10x)</li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 my-8">
            <h4 className="font-semibold text-foreground mb-4">Scenario B: Lower Valuation</h4>
            <ul className="text-muted-foreground space-y-1">
              <li>Investment: €3M at €15M post-money valuation</li>
              <li>Ownership: 20%</li>
              <li>If company exits at €300M: €60M return (20x)</li>
            </ul>
          </div>

          <p>
            Same investment amount. Same exit. Wildly different returns.
          </p>

          <p>
            Now here's the thing founders miss: the €300M exit is <em>more likely</em> in Scenario B. Why? Because the company raised at a lower valuation, which means:
          </p>

          <ul>
            <li>Less dilution needed in future rounds to reach the same ownership structure</li>
            <li>Easier to show "up rounds" (valuation increases) which builds momentum</li>
            <li>More room for the company to grow into its valuation</li>
            <li>Lower expectations, easier to exceed them</li>
          </ul>

          <p>
            A company that raises at €30M valuation needs to grow into a €100M+ valuation at Series A to show progress. A company that raises at €15M just needs €40M.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <PieChart className="h-6 w-6 text-primary" />
            The Ownership Threshold
          </h2>

          <p>
            Most funds have ownership thresholds — minimum percentages they need to make deals "worthwhile."
          </p>

          <p>
            For a typical seed fund: 10-15% minimum ownership.
          </p>

          <p>
            For a typical Series A fund: 15-20% minimum ownership.
          </p>

          <p>
            Here's why this matters so much for <Link to="/vcbrain/insider/power-laws" className="text-primary hover:underline">power law returns</Link>:
          </p>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 my-8">
            <h4 className="font-semibold text-foreground mb-3">The Fund Return Math</h4>
            <p className="text-muted-foreground mb-4">
              Let's say I have a €100M fund and need to return €300M to my <Link to="/vcbrain/vc-mechanics/limited-partners" className="text-primary hover:underline">LPs</Link>.
            </p>
            <p className="text-muted-foreground mb-4">
              If my best company exits for €500M and I own 15%, I get €75M. That's 75% of my fund returned from one deal. Good.
            </p>
            <p className="text-muted-foreground m-0">
              If I only own 5%? I get €25M. I need two more companies of the same caliber just to return the fund. That's much harder.
            </p>
          </div>

          <p>
            This is why VCs will often walk away from "hot" companies at sky-high valuations. The ownership math just doesn't work for fund returns.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <Target className="h-6 w-6 text-primary" />
            The Dilution Factor
          </h2>

          <p>
            It gets more complicated when you factor in future dilution.
          </p>

          <p>
            Let me walk you through "CloudBase," a real example from my portfolio. We invested at Seed, and here's what happened to our ownership:
          </p>

          <div className="bg-card border border-border rounded-xl overflow-hidden my-8">
            <div className="bg-muted/50 px-6 py-4 border-b border-border">
              <h4 className="font-semibold text-foreground m-0">CloudBase Ownership Over Time</h4>
            </div>
            <div className="divide-y divide-border">
              <div className="px-6 py-4 flex justify-between">
                <span className="text-muted-foreground">Seed (Our investment)</span>
                <span className="font-medium text-foreground">18% ownership</span>
              </div>
              <div className="px-6 py-4 flex justify-between">
                <span className="text-muted-foreground">After Series A (20% dilution)</span>
                <span className="font-medium text-foreground">14.4% ownership</span>
              </div>
              <div className="px-6 py-4 flex justify-between">
                <span className="text-muted-foreground">After Series B (18% dilution)</span>
                <span className="font-medium text-foreground">11.8% ownership</span>
              </div>
              <div className="px-6 py-4 flex justify-between">
                <span className="text-muted-foreground">After Series C (15% dilution)</span>
                <span className="font-medium text-foreground">10.0% ownership</span>
              </div>
              <div className="px-6 py-4 flex justify-between">
                <span className="text-muted-foreground">After employee pool refresh (5%)</span>
                <span className="font-medium text-foreground">9.5% ownership</span>
              </div>
              <div className="px-6 py-4 flex justify-between bg-primary/5">
                <span className="text-foreground font-medium">At Exit</span>
                <span className="font-bold text-primary">~9% final ownership</span>
              </div>
            </div>
          </div>

          <p>
            Our 18% seed stake became 9% at exit — we were diluted by 50%. This is <em>normal</em>. This is <em>expected</em>. And we model for this when we invest.
          </p>

          <p>
            If we'd started with only 10% ownership at Seed, we'd own maybe 4.5% at exit. At €500M exit, that's €22.5M vs €45M. Meaningful difference.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <TrendingUp className="h-6 w-6 text-primary" />
            The Negotiation Implications
          </h2>

          <p>
            Understanding ownership math should change how you approach fundraising:
          </p>

          <div className="space-y-4 my-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Know Their Minimum</h4>
              <p className="text-muted-foreground m-0">
                Research what ownership targets a fund typically seeks. If they usually take 15%+ and you're offering 8%, you're wasting everyone's time. They literally can't make the math work.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Valuation Is a Means, Not an End</h4>
              <p className="text-muted-foreground m-0">
                A €50M valuation means nothing if it scares away investors or sets unrealistic expectations for your Series A. Lower valuation with a committed investor who'll support you may beat a higher valuation with an uncommitted one.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Pro-Rata Is About Ownership Maintenance</h4>
              <p className="text-muted-foreground m-0">
                When VCs fight for pro-rata rights (the right to invest in future rounds to maintain ownership), it's because they're protecting their ownership from dilution. This signals they believe in the <Link to="/vcbrain/insider/return-profile" className="text-primary hover:underline">return profile</Link>.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Multiple Investors = More Dilution</h4>
              <p className="text-muted-foreground m-0">
                If you take money from 5 seed investors who each want 5%, you've given away 25% of your company. One investor taking 20% gives away less and creates a cleaner cap table.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-6">
            A Tale of Two Raises
          </h2>

          <p>
            Let me tell you about two founders — "Erik" and "Margot" — who pitched me the same quarter with similar companies.
          </p>

          <p>
            <strong>Erik's approach:</strong> Pushed for maximum valuation. He'd seen another company get a €25M seed valuation and wanted the same. He ended up raising €3M at €25M, giving away 12%.
          </p>

          <p>
            <strong>Margot's approach:</strong> Focused on finding the right partner at a reasonable valuation. She raised €3M at €15M, giving away 20%.
          </p>

          <p>
            Erik's valuation headline was better. His LinkedIn announcement got more likes. He felt like he'd "won."
          </p>

          <p>
            But here's what happened:
          </p>

          <ul>
            <li>Erik's Series A had to be a €75M+ valuation to show meaningful progress. He raised at €60M — technically a "down flat round" that spooked later investors.</li>
            <li>Margot's Series A at €45M was a clear 3x step-up. Momentum story. Easy narrative.</li>
            <li>Erik's investors, with only 12% ownership, had less incentive to help heavily. Margot's investor with 20% was deeply committed to her success.</li>
          </ul>

          <p>
            Five years later, Margot sold her company for €200M. Her seed investor made €40M (13x). Erik's company struggled to raise a Series B and eventually sold in an acqui-hire for €15M. His seed investor recovered their capital but nothing more.
          </p>

          <p>
            The valuation "win" was pyrrhic.
          </p>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 my-8">
            <h4 className="font-semibold text-foreground mb-3">Building Your Valuation Narrative</h4>
            <p className="text-muted-foreground mb-4">
              Your VC analysis should justify your valuation with comps, milestones, and future financing logic — not just "comparable companies raised at X."
            </p>
            <p className="text-muted-foreground m-0">
              Show investors you understand the ownership math. Demonstrate that you've thought about their <Link to="/vcbrain/insider/return-profile" className="text-primary hover:underline">return profile</Link>, not just your own dilution. This signals sophistication and makes negotiation easier.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-6">
            The Founder's Counterbalance
          </h2>

          <p>
            I'm not saying founders should accept lowball valuations. Founder dilution matters too — you need to own enough of your company to stay motivated through the hard years.
          </p>

          <p>
            The goal is finding the optimal balance:
          </p>

          <ul>
            <li>Enough ownership for your investors to be highly motivated</li>
            <li>Enough ownership for you to build generational wealth if it works</li>
            <li>Reasonable valuation that creates room for "up rounds" and momentum</li>
            <li>Enough capital to hit meaningful milestones before the next raise</li>
          </ul>

          <p>
            This optimization is an art, not a science. But understanding that VCs optimize for ownership — not just valuation — gives you a more sophisticated approach to the negotiation.
          </p>

          <p>
            The best deals leave both founders and investors feeling like the math works.
          </p>

          <p>
            When it doesn't work for one side, it usually doesn't work for either in the end.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Continue Reading</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/vcbrain/insider/power-laws" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
              <h4 className="font-medium text-foreground">VCs Pick Power Laws</h4>
              <p className="text-sm text-muted-foreground">Not companies</p>
            </Link>
            <Link to="/vcbrain/insider/return-profile" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
              <h4 className="font-medium text-foreground">You're Pitching a Return Profile</h4>
              <p className="text-sm text-muted-foreground">Not a company</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnershipVsValuation;
