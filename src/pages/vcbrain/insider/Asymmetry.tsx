import { Link } from "react-router-dom";
import { ArrowLeft, Scale, Zap, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const Asymmetry = () => {
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
            VCs Don't Bet on Ideas — They Bet on Asymmetry
          </h1>
          <p className="text-xl text-muted-foreground">
            How outsized outcomes justify irrational-seeming decisions.
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <p className="text-lg text-foreground leading-relaxed m-0">
              Every founder thinks VCs are evaluating whether their idea will work. That's only half the story. <strong>We're actually evaluating: if this works, how big is the upside relative to the downside?</strong>
            </p>
          </div>

          <p>
            Let me introduce you to the concept that changed how I think about every investment: <em>asymmetric payoffs</em>.
          </p>

          <p>
            In 2019, I made what colleagues thought was one of my worst investments. A two-person team, no product yet, just a PowerPoint and conviction. The idea seemed crazy — a marketplace for something that had never been sold online before. Everyone in our partnership meeting raised eyebrows.
          </p>

          <p>
            I invested €500K at a €3M valuation. Three years later, the company was acquired for €180M. My fund's ownership stake returned €9M on that €500K check. 18x.
          </p>

          <p>
            That wasn't because the idea was obviously good. Most people thought it was bad. It was because the asymmetry was beautiful: if it failed, I lost €500K. If it worked, I made €9M.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <Scale className="h-6 w-6 text-primary" />
            The Asymmetry Framework
          </h2>

          <p>
            In venture capital, the downside is always capped: you can lose 100% of your investment, but no more. The upside, however, is theoretically unlimited.
          </p>

          <p>
            This creates a mathematical reality that makes VC decision-making look irrational to outsiders:
          </p>

          <div className="bg-card border border-border rounded-xl p-6 my-8">
            <h4 className="font-semibold text-foreground mb-4">Investment A vs. Investment B</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="font-medium text-foreground">Investment A (The "Safe" Bet)</p>
                <ul className="text-sm text-muted-foreground m-0">
                  <li>70% chance of 2x return</li>
                  <li>20% chance of 1x (break even)</li>
                  <li>10% chance of total loss</li>
                  <li><strong>Expected value: 1.5x</strong></li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-foreground">Investment B (The "Crazy" Bet)</p>
                <ul className="text-sm text-muted-foreground m-0">
                  <li>5% chance of 50x return</li>
                  <li>15% chance of 3x return</li>
                  <li>80% chance of total loss</li>
                  <li><strong>Expected value: 2.95x</strong></li>
                </ul>
              </div>
            </div>
          </div>

          <p>
            Most rational people would choose Investment A. It's "safer." It'll probably work out.
          </p>

          <p>
            But VCs choose Investment B — because in a <Link to="/vcbrain/insider/power-laws" className="text-primary hover:underline">power law portfolio</Link>, expected value beats probability. And Investment B has nearly double the expected value.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <Zap className="h-6 w-6 text-primary" />
            What Creates Asymmetry
          </h2>

          <p>
            Not all startups have good asymmetric profiles. Here's what makes certain opportunities "asymmetric gold":
          </p>

          <div className="space-y-4 my-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">1. New Category Creation</h4>
              <p className="text-muted-foreground m-0">
                When a company can define and own an entirely new category, the upside is unpredictable in the best way. Airbnb didn't win the "hotel booking" market — they created "home sharing." The ceiling on new categories is almost impossible to estimate, which is why VCs love them.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">2. Network Effects</h4>
              <p className="text-muted-foreground m-0">
                Businesses with network effects don't grow linearly — they hockey-stick. And they create winner-take-most dynamics. If you're the winner, you don't get 20% of the market; you get 80%. That's massive upside asymmetry.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">3. Optionality</h4>
              <p className="text-muted-foreground m-0">
                Companies that could pivot into adjacent, massive markets have "free options" embedded in them. Amazon started with books. The book business alone was never going to be a €1T company — but the optionality was.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">4. Technical Breakthrough Potential</h4>
              <p className="text-muted-foreground m-0">
                Companies working on hard problems that, if solved, unlock enormous value. The probability of success might be low, but the magnitude of success is enormous. OpenAI was considered a crazy bet until it wasn't.
              </p>
            </div>
          </div>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <Target className="h-6 w-6 text-primary" />
            A Tale of Two Pitches
          </h2>

          <p>
            Let me tell you about "DataSolve" and "Quantum Supply" — two companies that pitched me the same quarter.
          </p>

          <p>
            DataSolve had an analytics product for mid-market companies. Strong team, good traction, clear path to €20M ARR. The CEO, Mikhail, was methodical and credible. Realistic exit: €100-150M acquisition by a larger player.
          </p>

          <p>
            Quantum Supply was building supply chain software using ML in a novel way. Almost no traction, team had never built a company before, and the technology was unproven. The founder, Clara, was a first-time CEO with a PhD in operations research.
          </p>

          <p>
            Here's the asymmetry math I ran:
          </p>

          <div className="bg-card border border-border rounded-xl p-6 my-8">
            <div className="space-y-4">
              <div>
                <p className="font-medium text-foreground">DataSolve</p>
                <ul className="text-sm text-muted-foreground">
                  <li>Investment: €3M at €15M valuation (20% ownership)</li>
                  <li>Likely outcome range: €80M - €200M exit</li>
                  <li>Best case return: €40M (13x)</li>
                  <li>Probability-weighted expected return: ~5x</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground">Quantum Supply</p>
                <ul className="text-sm text-muted-foreground">
                  <li>Investment: €2M at €8M valuation (25% ownership)</li>
                  <li>If it fails (70% chance): €0</li>
                  <li>If it works: €500M - €2B potential (supply chain is massive)</li>
                  <li>Best case return: €250M+ (125x)</li>
                  <li>Probability-weighted expected return: ~8x</li>
                </ul>
              </div>
            </div>
          </div>

          <p>
            DataSolve was a better business at that moment. Quantum Supply was a better investment.
          </p>

          <p>
            We invested in Clara. (Mikhail ended up doing great with a different investor — his company sold for €140M. A good outcome for everyone, just not our kind of outcome.)
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <TrendingUp className="h-6 w-6 text-primary" />
            How to Pitch Asymmetry
          </h2>

          <p>
            Understanding asymmetry should change how you pitch:
          </p>

          <div className="space-y-4 my-8">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Don't Minimize the Upside</h4>
              <p className="text-muted-foreground m-0">
                Founders often pitch conservative projections to seem "realistic." But VCs are looking for outlier potential. Show us the path to €1B, even if the probability is low. That's the asymmetry we're buying.
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Show Multiple Ways to Win</h4>
              <p className="text-muted-foreground m-0">
                The best asymmetric investments have multiple paths to massive outcomes. "If this works, we're worth €X. If we pivot to that adjacent market, we're worth €Y. And if we get acquired by BigCo, we're worth €Z."
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Demonstrate Category-Defining Potential</h4>
              <p className="text-muted-foreground m-0">
                Are you competing for an existing pie, or baking a new one? Category creators have uncapped upside. Feature companies have capped upside. Position accordingly.
              </p>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 my-8">
            <h4 className="font-semibold text-foreground mb-3">Asymmetry in Your Investment Memo</h4>
            <p className="text-muted-foreground mb-4">
              When VCs discuss your deal at <Link to="/vcbrain/how-vcs-work/investment-committee" className="text-primary hover:underline">Investment Committee</Link>, one of the first questions is: "What's the upside case?" Your memo should paint that picture vividly — not as fantasy, but as calculated possibility.
            </p>
            <p className="text-muted-foreground m-0">
              The memo should also acknowledge the risks (we'll find them anyway). But the ratio of upside narrative to risk discussion should be weighted toward the former. Give us the asymmetry story.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-6">
            The Counter-Intuitive Takeaway
          </h2>

          <p>
            Sometimes VCs will invest in a company that's clearly riskier and less proven than another option. That's not because we're crazy. It's because we understand something that looks irrational from the outside:
          </p>

          <p>
            <strong>In venture capital, the magnitude of being right matters more than the frequency of being right.</strong>
          </p>

          <p>
            I can be wrong 8 out of 10 times and still outperform the market — if the 2 times I'm right are asymmetric wins.
          </p>

          <p>
            Understand this, and you'll understand why we make the decisions we make. Show us the asymmetry in your company, and you'll speak our language.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Continue Reading</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/vcbrain/insider/liquidity-not-customer" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
              <h4 className="font-medium text-foreground">A VC Is Not Your Customer</h4>
              <p className="text-sm text-muted-foreground">Liquidity is</p>
            </Link>
            <Link to="/vcbrain/insider/power-laws" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
              <h4 className="font-medium text-foreground">VCs Pick Power Laws</h4>
              <p className="text-sm text-muted-foreground">Not companies</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Asymmetry;
