import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const FollowOnCapital = () => {
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
            How Follow-On Capital Decisions Actually Get Made
          </h1>
          <p className="text-xl text-muted-foreground">
            Why today's "yes" doesn't guarantee tomorrow's check.
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <p className="text-lg text-foreground leading-relaxed m-0">
              One of the most dangerous assumptions founders make: "Our existing investors will obviously support the next round." <strong>Nothing in venture capital is obvious. And follow-on decisions are far more complex than initial investments.</strong>
            </p>
          </div>

          <p>
            Let me tell you about "DataStack," a company in our portfolio. We led their <Link to="/vcbrain/stages/seed" className="text-primary hover:underline">Seed round</Link> — €2M at €8M post. Great founder named Nina, solid product, promising early metrics.
          </p>

          <p>
            Eighteen months later, Nina was raising her Series A. She assumed we'd follow on. We'd been supportive, attended board meetings, made intros. The relationship was strong.
          </p>

          <p>
            We passed on the A.
          </p>

          <p>
            Nina was blindsided. And honestly? She had every right to be. From the outside, our pass looked like betrayal. From the inside, it was cold portfolio math.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <RefreshCw className="h-6 w-6 text-primary" />
            The Follow-On Framework
          </h2>

          <p>
            When we evaluate follow-on investments, we're asking different questions than at initial investment:
          </p>

          <div className="space-y-4 my-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Initial Investment Question</h4>
              <p className="text-muted-foreground m-0">
                "Is this company worth betting on at these terms?"
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Follow-On Investment Question</h4>
              <p className="text-muted-foreground m-0">
                "Given what we now know, would we invest in this company today if we weren't already investors — and is doubling down better than deploying capital elsewhere?"
              </p>
            </div>
          </div>

          <p>
            That second question is much harder. Because now we have real data, not just projections. And sometimes that data doesn't support doubling down.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <TrendingUp className="h-6 w-6 text-primary" />
            What We Actually Evaluate
          </h2>

          <p>
            Here's the internal checklist most funds use for follow-on decisions:
          </p>

          <div className="bg-card border border-border rounded-xl overflow-hidden my-8">
            <div className="bg-muted/50 px-6 py-4 border-b border-border">
              <h4 className="font-semibold text-foreground m-0">Follow-On Evaluation Matrix</h4>
            </div>
            <div className="divide-y divide-border">
              <div className="px-6 py-4">
                <p className="font-medium text-foreground">Progress vs. Plan</p>
                <p className="text-sm text-muted-foreground">Did they hit the milestones they promised at the last round? Not "did they try hard" — did they deliver results?</p>
              </div>
              <div className="px-6 py-4">
                <p className="font-medium text-foreground">Market Validation</p>
                <p className="text-sm text-muted-foreground">Is the market thesis proving true? Are customers paying, retaining, expanding? Or are we learning that our initial assumptions were wrong?</p>
              </div>
              <div className="px-6 py-4">
                <p className="font-medium text-foreground">Competitive Position</p>
                <p className="text-sm text-muted-foreground">Has their position strengthened or weakened? New competitors? Lost deals to alternatives?</p>
              </div>
              <div className="px-6 py-4">
                <p className="font-medium text-foreground">Capital Efficiency</p>
                <p className="text-sm text-muted-foreground">How was the last round's capital deployed? Did they get good ROI on spend? Or did we fund learning through burning?</p>
              </div>
              <div className="px-6 py-4">
                <p className="font-medium text-foreground">Updated <Link to="/vcbrain/insider/return-profile" className="text-primary hover:underline">Return Profile</Link></p>
                <p className="text-sm text-muted-foreground">At the new valuation, with updated projections, what's the realistic return? Does this still fit <Link to="/vcbrain/insider/power-laws" className="text-primary hover:underline">power law</Link> requirements?</p>
              </div>
              <div className="px-6 py-4">
                <p className="font-medium text-foreground">Opportunity Cost</p>
                <p className="text-sm text-muted-foreground">Is this the best use of our remaining follow-on reserves? Could we deploy this capital in a better opportunity?</p>
              </div>
            </div>
          </div>

          <p>
            Back to DataStack. Nina had grown from €100K ARR to €600K ARR — solid, but not exceptional. Her burn had increased 3x. The Series A was priced at €25M, meaning we'd need to invest more at a higher price into a company that was performing "fine but not great."
          </p>

          <p>
            Meanwhile, another portfolio company was raising their Series A at €20M and had grown from €50K to €1.2M ARR in the same period. Limited follow-on reserves meant choosing.
          </p>

          <p>
            We chose the stronger performer. It felt brutal, but it was the right decision for fund returns.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <AlertTriangle className="h-6 w-6 text-primary" />
            The Signals That Trigger "No"
          </h2>

          <p>
            Certain patterns make follow-on investment unlikely:
          </p>

          <div className="space-y-4 my-8">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Missed Milestones Without Good Explanations</h4>
              <p className="text-muted-foreground m-0">
                "We were supposed to hit €1M ARR and we're at €400K" can be okay if there's a compelling story about pivots, learnings, and new direction. "We were supposed to hit €1M ARR and we're at €400K because sales is hard" is a red flag.
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Valuation Running Ahead of Progress</h4>
              <p className="text-muted-foreground m-0">
                If you raised at €15M and want to raise at €40M but have only grown 50%, the math doesn't work. We'd be paying more for less relative progress.
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Market Thesis Disproven</h4>
              <p className="text-muted-foreground m-0">
                Sometimes the market just isn't what we hoped. Customers won't pay what we projected. Competition commoditized the space. Regulation changed the landscape.
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Team Concerns Emerge</h4>
              <p className="text-muted-foreground m-0">
                Eighteen months of working with a founder reveals things the initial <Link to="/vcbrain/insider/managed-pessimists" className="text-primary hover:underline">diligence</Link> couldn't. Can't hire? Can't retain? Can't make hard decisions? These compound into follow-on hesitation.
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Better Opportunities in Portfolio</h4>
              <p className="text-muted-foreground m-0">
                Follow-on reserves are finite. Sometimes it's not about you being bad — it's about other portfolio companies being better. Triage is painful but necessary.
              </p>
            </div>
          </div>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <CheckCircle className="h-6 w-6 text-primary" />
            How to Maximize Follow-On Likelihood
          </h2>

          <p>
            Understanding this process helps you optimize for follow-on support:
          </p>

          <div className="space-y-4 my-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">1. Set Realistic Milestones</h4>
              <p className="text-muted-foreground m-0">
                Overcommitting at seed to justify a high valuation creates impossible expectations. I'd rather invest at a lower seed valuation and see you crush milestones than invest high and see you miss.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">2. Communicate Early and Honestly</h4>
              <p className="text-muted-foreground m-0">
                Don't wait until you're raising to update me on problems. If you're missing targets, tell me at the board meeting. Let me help. Surprises at fundraise time destroy trust.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">3. Show Learning, Not Just Results</h4>
              <p className="text-muted-foreground m-0">
                If you pivoted, explain what you learned and why the new direction is better. Thoughtful pivots can be more impressive than straight-line execution in uncertain markets.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">4. Maintain Capital Efficiency</h4>
              <p className="text-muted-foreground m-0">
                If you raised €2M and burned it all with nothing to show, follow-on is hard. If you raised €2M, burned €1M, and have strong metrics, I'm more confident in your next deployment.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">5. Build Relationship Beyond the Board Deck</h4>
              <p className="text-muted-foreground m-0">
                Partners are more likely to fight for founders they have genuine relationships with. Don't just update us quarterly — keep us engaged, ask for help, make us feel invested beyond capital.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">6. Create External Validation</h4>
              <p className="text-muted-foreground m-0">
                Having a strong external lead for your next round makes follow-on easier. It validates the company externally and creates FOMO internally. "If [Top Tier VC] wants to lead, we should follow."
              </p>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 my-8">
            <h4 className="font-semibold text-foreground mb-3">Your Analysis Evolves Too</h4>
            <p className="text-muted-foreground mb-4">
              The VC analysis you build for your Series A should explicitly address progress since seed. Show me the milestones we agreed to, what happened, what we learned, and why the next phase is even more compelling.
            </p>
            <p className="text-muted-foreground m-0">
              The best founders treat follow-on as a new investment decision — because that's exactly what it is. They don't assume support; they earn it with clear evidence and updated thesis.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-6">
            What Happened to Nina?
          </h2>

          <p>
            DataStack found a Series A lead from a different fund — one that loved the category and saw potential we'd become skeptical of. Nina was understandably hurt by our pass, but she was professional about it.
          </p>

          <p>
            Two years later, DataStack sold for €65M. Decent outcome — not a fund-maker for her new investors, and our seed stake returned about 4x after dilution. The company we followed on instead returned 18x.
          </p>

          <p>
            Were we right to pass? Mathematically, yes. But I still think about Nina and whether we communicated our concerns early enough.
          </p>

          <p>
            The lesson: follow-on is never guaranteed, and the earlier you understand the evaluation framework, the better you can position yourself for continued support — or have backup plans ready if it doesn't come.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Continue Reading</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/vcbrain/insider/ownership-vs-valuation" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
              <h4 className="font-medium text-foreground">Ownership vs. Valuation</h4>
              <p className="text-sm text-muted-foreground">Why VCs care more about one</p>
            </Link>
            <Link to="/vcbrain/vc-mechanics/fundraising-cycles" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
              <h4 className="font-medium text-foreground">VC Fundraising Cycles</h4>
              <p className="text-sm text-muted-foreground">Understanding the fund lifecycle</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowOnCapital;
