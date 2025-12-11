import { Link } from "react-router-dom";
import { ArrowLeft, Building, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const GoodBusinessBadVC = () => {
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
            Why Good Businesses Don't Always Make Good VC Investments
          </h1>
          <p className="text-xl text-muted-foreground">
            Great company ≠ great VC outcome.
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <p className="text-lg text-foreground leading-relaxed m-0">
              This might be the most counterintuitive thing about venture capital: <strong>the quality of your business and its suitability for VC are two completely different evaluations.</strong>
            </p>
          </div>

          <p>
            I want to tell you about three companies I've encountered over my career. All three were objectively excellent businesses. Only one was a good VC investment.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <Building className="h-6 w-6 text-primary" />
            Three Founders, Three Paths
          </h2>

          <div className="space-y-6 my-8">
            <div className="bg-card border border-border rounded-xl p-6">
              <h4 className="font-semibold text-foreground mb-3">Elena — The Consulting Goldmine</h4>
              <p className="text-muted-foreground mb-3">
                Elena built a specialized AI consulting firm in Berlin. €3M revenue in year two. 45% net margins. Zero churn. Her clients were Fortune 500 companies who paid premium rates.
              </p>
              <p className="text-muted-foreground m-0">
                <strong>Business quality:</strong> A+ | <strong>VC fit:</strong> D
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h4 className="font-semibold text-foreground mb-3">Jonas — The Niche SaaS King</h4>
              <p className="text-muted-foreground mb-3">
                Jonas built accounting software for German dental practices. €2M ARR, 95% gross margins, -2% net churn (expansion revenue). Growing 30% annually.
              </p>
              <p className="text-muted-foreground m-0">
                <strong>Business quality:</strong> A | <strong>VC fit:</strong> C
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h4 className="font-semibold text-foreground mb-3">Priya — The Chaotic Marketplace</h4>
              <p className="text-muted-foreground mb-3">
                Priya built a B2B marketplace for industrial equipment. €400K GMV, burning €150K/month, unit economics "improving but not proven." Complete chaos operationally.
              </p>
              <p className="text-muted-foreground m-0">
                <strong>Business quality:</strong> C | <strong>VC fit:</strong> A
              </p>
            </div>
          </div>

          <p>
            We invested in Priya. Not Elena. Not Jonas.
          </p>

          <p>
            And here's the thing: I would've personally invested my own money in Elena's business before Priya's any day of the week. But I wasn't investing my money. I was investing the fund's money — and those are different games with different rules.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <TrendingDown className="h-6 w-6 text-primary" />
            The Ceiling Problem
          </h2>

          <p>
            Elena's consulting firm had an inherent ceiling. To grow revenue, she needed to hire more consultants. Each consultant could maybe handle €300K in billings. To reach €30M, she'd need 100+ consultants. To reach €100M, she'd need 350+.
          </p>

          <p>
            This is what we call a "linear" business — revenue scales linearly with headcount. Great for building wealth (Elena took home €800K/year in profits). Terrible for <Link to="/vcbrain/insider/power-laws" className="text-primary hover:underline">power law outcomes</Link>.
          </p>

          <p>
            Jonas had a different ceiling — market size. There are about 35,000 dental practices in Germany. Even if he captured 50% of the market at €2K/year average contract value, that's €35M ARR max. Nice business! But his <Link to="/vcbrain/insider/return-profile" className="text-primary hover:underline">return profile</Link> couldn't justify venture investment.
          </p>

          <p>
            Priya? Her marketplace, if it worked, could process €10B+ in industrial equipment transactions annually in Europe alone. At a 3% take rate, that's €300M in revenue potential. And marketplaces have natural winner-take-most dynamics.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <AlertTriangle className="h-6 w-6 text-primary" />
            The Five Disqualifiers for VC
          </h2>

          <p>
            Over the years, I've identified patterns in businesses that are excellent but not VC-appropriate:
          </p>

          <div className="space-y-4 my-8">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">1. Service-Based Revenue</h4>
              <p className="text-muted-foreground m-0">
                If your revenue requires human time to fulfill, you have a scaling problem. Agencies, consultancies, studios — all can be wonderful businesses that put millions in founders' pockets. But they can't 100x.
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">2. Capped Markets</h4>
              <p className="text-muted-foreground m-0">
                If your total addressable market is less than €1B, even 100% market share can't generate venture returns. The <Link to="/vcbrain/deck-building/market-slide" className="text-primary hover:underline">market slide</Link> in your deck isn't just about impressing investors — it determines your eligibility.
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">3. No Network Effects or Moats</h4>
              <p className="text-muted-foreground m-0">
                A business that's easy to replicate won't command exit multiples. Jonas's dental software could be copied by any well-funded competitor. No switching costs, no network effects, no moat.
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">4. Linear Cost Structures</h4>
              <p className="text-muted-foreground m-0">
                If your cost of goods sold (COGS) rises proportionally with revenue, your margins don't improve with scale. VCs want to see operational leverage — where incremental revenue costs almost nothing to serve.
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">5. Exit Path Opacity</h4>
              <p className="text-muted-foreground m-0">
                If there's no clear acquirer universe or IPO path, VCs struggle to model returns. "Who will buy this?" is a question we ask in every <Link to="/vcbrain/how-vcs-work/investment-committee" className="text-primary hover:underline">Investment Committee</Link>.
              </p>
            </div>
          </div>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <CheckCircle className="h-6 w-6 text-primary" />
            The Honest Conversation
          </h2>

          <p>
            Here's what I wish more founders understood: <strong>not being VC-backable isn't a criticism.</strong> It's a categorization.
          </p>

          <p>
            Elena sold her consulting firm four years later for €12M. She kept €8M after taxes. She now angel invests and works 20 hours a week. Was that a failure? God no.
          </p>

          <p>
            Jonas merged his company with a larger dental software provider. He made €4M and became their Chief Product Officer. Happy ending.
          </p>

          <p>
            Priya? Still fighting. Raised three more rounds. Company is now worth €200M on paper. She owns 12%. It might still fail. Or she might be a centimillionaire in 5 years.
          </p>

          <p>
            Three excellent entrepreneurs. Three different games. Only Priya was playing the VC game.
          </p>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 my-8">
            <h4 className="font-semibold text-foreground mb-3">Know Which Game You're Playing</h4>
            <p className="text-muted-foreground mb-4">
              Before you spend months fundraising, honestly assess whether your business model fits VC criteria. If it doesn't, that's valuable information — it might save you from a frustrating process and point you toward more appropriate capital sources.
            </p>
            <p className="text-muted-foreground m-0">
              Our investment memo process forces this analysis. Better to know before you're in the pitch room than to learn it from a dozen polite rejections.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-6">
            The Questions to Ask Yourself
          </h2>

          <p>
            Before pursuing VC funding, honestly answer:
          </p>

          <ul>
            <li>Can this business reach €100M+ in revenue without a fundamental model change?</li>
            <li>Does revenue scale faster than costs?</li>
            <li>Is there a clear category of acquirers or a realistic IPO path?</li>
            <li>Will growth accelerate with capital, or just continue linearly?</li>
            <li>Is the market big enough that capturing 5% would create a €500M+ company?</li>
          </ul>

          <p>
            If you answered "no" to more than one, you might have an excellent business that isn't a VC-appropriate business.
          </p>

          <p>
            And there's absolutely nothing wrong with that.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Continue Reading</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/vcbrain/insider/managed-pessimists" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
              <h4 className="font-medium text-foreground">VCs Aren't Optimists</h4>
              <p className="text-sm text-muted-foreground">They're managed pessimists</p>
            </Link>
            <Link to="/vcbrain/insider/liquidity-not-customer" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
              <h4 className="font-medium text-foreground">A VC Is Not Your Customer</h4>
              <p className="text-sm text-muted-foreground">Liquidity is</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoodBusinessBadVC;
