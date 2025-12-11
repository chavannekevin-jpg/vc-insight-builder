import { Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, Target, PieChart, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

const PowerLaws = () => {
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
            VCs Don't Pick Companies. They Pick Power Laws.
          </h1>
          <p className="text-xl text-muted-foreground">
            Why portfolio math matters more than your startup story.
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <p className="text-lg text-foreground leading-relaxed m-0">
              After a decade in this industry, I've sat through thousands of pitches. And here's what most founders don't understand: <strong>VCs aren't trying to find the best company. They're trying to construct a portfolio that has a mathematical chance of returning the fund.</strong>
            </p>
          </div>

          <p>
            Let me tell you about "Marcus." Marcus founded a B2B SaaS company in Munich — solid product, growing 40% year-over-year, profitable from day one. By any normal business standard, Marcus had built something exceptional.
          </p>

          <p>
            We passed.
          </p>

          <p>
            Marcus was furious. "You just invested in a company burning €500K/month with no revenue!" he said. He was right. We did. And three years later, that "burning" company was worth €400M. Marcus's company? Still profitable. Still growing at 40%. Worth maybe €15M.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <TrendingUp className="h-6 w-6 text-primary" />
            The Math That Rules Everything
          </h2>

          <p>
            Here's the brutal reality of VC fund economics. A typical fund needs to return 3x to its <Link to="/vcbrain/vc-mechanics/limited-partners" className="text-primary hover:underline">Limited Partners</Link> to be considered successful. If I'm managing a €100M fund, I need to return €300M.
          </p>

          <p>
            Now, venture capital follows a power law distribution. This means:
          </p>

          <ul>
            <li><strong>50% of investments</strong> will return 0-1x (losses or break-even)</li>
            <li><strong>30% of investments</strong> will return 1-3x (modest wins)</li>
            <li><strong>15% of investments</strong> will return 3-10x (good outcomes)</li>
            <li><strong>5% of investments</strong> will return 10x+ (fund-makers)</li>
          </ul>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 my-8">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-foreground mb-2">The Fund-Maker Reality</h4>
                <p className="text-muted-foreground m-0">
                  In most successful VC funds, a single company returns more than the rest of the portfolio combined. That's not an accident — it's the entire strategy.
                </p>
              </div>
            </div>
          </div>

          <p>
            This is why we passed on Marcus. His company was a "3x" — a solid outcome that would return a nice multiple but wouldn't move the needle on fund performance. We needed companies that could return 30x, 50x, 100x.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <Target className="h-6 w-6 text-primary" />
            What This Means for Your Pitch
          </h2>

          <p>
            Every time you walk into a pitch room, the VC is unconsciously asking: <em>"Could this company single-handedly return my fund?"</em>
          </p>

          <p>
            Let me give you the math. If I invest €2M at <Link to="/vcbrain/stages/seed" className="text-primary hover:underline">Seed</Link> and own 15% of a company that exits for €20M, I get €3M back. Nice! But if my fund is €100M, that €3M represents 3% of fund size. I need about 10 of those just to return the original capital — before any profit.
          </p>

          <p>
            But if that same €2M investment is in a company that exits for €500M? Now I'm returning €75M — 75% of the entire fund from a single bet.
          </p>

          <p>
            This is why VCs seem to make "irrational" decisions. They're not irrational. They're playing a different game than you think.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <PieChart className="h-6 w-6 text-primary" />
            How to Use This to Your Advantage
          </h2>

          <p>
            Understanding power law thinking should change how you pitch:
          </p>

          <div className="space-y-4 my-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">1. Show Massive Market Potential</h4>
              <p className="text-muted-foreground m-0">
                Don't just prove you can build a good business. Prove you can build a category-defining company. VCs need to believe the ceiling is €1B+, even if the floor is zero.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">2. Embrace the "Why Now?"</h4>
              <p className="text-muted-foreground m-0">
                Power law outcomes require timing. Uber couldn't exist before smartphones. Show why this moment creates a unique window for exponential growth.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">3. Don't Apologize for Ambition</h4>
              <p className="text-muted-foreground m-0">
                I've seen founders undersell their vision because they think it sounds "more realistic." VCs don't want realistic. They want moonshots with credible paths.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-6">
            The Uncomfortable Truth
          </h2>

          <p>
            Here's what I tell founders over coffee, after the pitch is done:
          </p>

          <p>
            <strong>Not every great business is a VC-backable business.</strong> And that's okay. Marcus went on to bootstrap his company to €30M in revenue and sold for €45M — a life-changing outcome that made him wealthy and happy.
          </p>

          <p>
            But if you want VC money, you need to understand you're auditioning for a very specific role: the power law outlier. You're not just proving you can build a business. You're proving you can build <em>the</em> business that makes their entire fund.
          </p>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 my-8">
            <h4 className="font-semibold text-foreground mb-3">Why Your Investment Memo Matters</h4>
            <p className="text-muted-foreground mb-4">
              When VCs discuss your company in their <Link to="/vcbrain/how-vcs-work/investment-committee" className="text-primary hover:underline">Investment Committee</Link>, they need ammunition to argue you're a power law candidate. Your investment memo should explicitly address: market size ceiling, path to dominance, and why this company — not competitors — will capture the lion's share.
            </p>
            <p className="text-muted-foreground m-0">
              This is exactly why founders who build their memo with us tend to have more productive conversations with VCs — they're speaking the fund's language from day one.
            </p>
          </div>

          <p>
            The next time a VC passes on your "great business," don't take it personally. They might genuinely like what you're building. They just can't make the math work for their portfolio.
          </p>

          <p>
            And honestly? Sometimes that's the best outcome for everyone.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Continue Reading</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/vcbrain/insider/return-profile" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
              <h4 className="font-medium text-foreground">You're Not Pitching a Company</h4>
              <p className="text-sm text-muted-foreground">You're pitching a return profile</p>
            </Link>
            <Link to="/vcbrain/insider/asymmetry" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
              <h4 className="font-medium text-foreground">VCs Don't Bet on Ideas</h4>
              <p className="text-sm text-muted-foreground">They bet on asymmetry</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerLaws;
