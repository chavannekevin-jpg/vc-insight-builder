import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Search, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ManagedPessimists = () => {
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
            VCs Aren't Optimists. They're Managed Pessimists.
          </h1>
          <p className="text-xl text-muted-foreground">
            What diligence actually feels like inside the fund.
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <p className="text-lg text-foreground leading-relaxed m-0">
              Founders think VCs are looking for reasons to say yes. In reality, <strong>after the first meeting, we spend most of our time looking for reasons to say no.</strong> That's not cynicism — it's portfolio construction discipline.
            </p>
          </div>

          <p>
            Let me walk you through what happens after you leave our office feeling great about that pitch.
          </p>

          <p>
            You nailed the presentation. We were nodding along. Someone said "this is really interesting." You got the "we'll circle back next week" response that felt positive.
          </p>

          <p>
            Here's what you didn't see: the moment you walked out, we opened our laptops and started the systematic process of trying to kill your deal.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <Search className="h-6 w-6 text-primary" />
            The Diligence Gauntlet
          </h2>

          <p>
            After a promising first meeting, our process looks like this:
          </p>

          <div className="space-y-6 my-8">
            <div className="bg-card border border-border rounded-xl p-6">
              <h4 className="font-semibold text-foreground mb-3">Week 1: Reference Warfare</h4>
              <p className="text-muted-foreground m-0">
                We're calling everyone. Not just the references you gave us — we're doing "back-channel" references. Former colleagues, people who know people, anyone who's worked with or competed against you. We're specifically asking: "What would make this founder fail?"
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h4 className="font-semibold text-foreground mb-3">Week 2: Market Stress Testing</h4>
              <p className="text-muted-foreground m-0">
                We're talking to potential customers you haven't sold to yet. "Would you buy this? At what price? What would stop you?" We're also calling your existing customers: "Would you churn if a better option came along? What's missing?"
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h4 className="font-semibold text-foreground mb-3">Week 3: Competitive Deep Dive</h4>
              <p className="text-muted-foreground m-0">
                We're often talking to your competitors. Yes, really. Sometimes we're actively meeting with them too. We want to understand: is your advantage real or perceived? What do they see that you don't?
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h4 className="font-semibold text-foreground mb-3">Week 4: Internal Devil's Advocate</h4>
              <p className="text-muted-foreground m-0">
                Before <Link to="/vcbrain/how-vcs-work/investment-committee" className="text-primary hover:underline">Investment Committee</Link>, the partner championing your deal has to present to colleagues whose job is to find holes. Every partner will ask: "What kills this company?"
              </p>
            </div>
          </div>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <AlertCircle className="h-6 w-6 text-primary" />
            The "Kill List" Is Real
          </h2>

          <p>
            Internally, we maintain what some funds literally call a "kill list" — a running document of concerns that could disqualify the deal. This isn't malicious; it's the <Link to="/vcbrain/how-vcs-work/selection-process" className="text-primary hover:underline">selection process</Link> working as designed.
          </p>

          <p>
            Let me tell you about "Compass Labs." Beautiful company. Founder named Viktor — ex-Google, Stanford AI PhD, charismatic as hell. First meeting was electric. Everyone was excited.
          </p>

          <p>
            Then we started diligence.
          </p>

          <ul>
            <li><strong>Reference #1</strong> (former Google manager): "Brilliant, but struggles to delegate. Will try to do everything himself."</li>
            <li><strong>Reference #2</strong> (co-founder of his last startup): "We had strategic disagreements. He has a my-way-or-highway streak."</li>
            <li><strong>Customer #1</strong>: "We love the product but their support is slow. Feels like a one-man show."</li>
            <li><strong>Competitor intel</strong>: "Google is building something similar internally. Announcement expected in 6 months."</li>
          </ul>

          <p>
            Each data point added to the kill list. None was fatal alone. Together, they created a pattern: founder risk (can't scale himself) + market risk (Google entering) + execution risk (already showing support issues).
          </p>

          <p>
            We passed. Viktor was devastated — and angry. "But the product is amazing!" he said.
          </p>

          <p>
            He was right. The product was amazing. But our job isn't to find amazing products. It's to find <Link to="/vcbrain/insider/return-profile" className="text-primary hover:underline">amazing return profiles</Link> with manageable risk.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <Shield className="h-6 w-6 text-primary" />
            Why We're Wired This Way
          </h2>

          <p>
            The managed pessimism isn't about being negative. It's about portfolio math and <Link to="/vcbrain/vc-mechanics/limited-partners" className="text-primary hover:underline">LP accountability</Link>.
          </p>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 my-8">
            <h4 className="font-semibold text-foreground mb-3">The Base Rate Reality</h4>
            <p className="text-muted-foreground m-0">
              Most startups fail. Not some — most. Even well-funded startups with good teams fail. Our job is to find the 10% that won't, while knowing that statistical base rates are working against every deal. Optimism without discipline is just gambling.
            </p>
          </div>

          <p>
            Here's the emotional landscape inside a VC's head during diligence:
          </p>

          <ul>
            <li><strong>Hope:</strong> "This could be the one. I'm excited about this."</li>
            <li><strong>Fear:</strong> "But what if I'm wrong? What if I'm missing something?"</li>
            <li><strong>Duty:</strong> "My LPs trust me to be rigorous. I owe them diligence."</li>
            <li><strong>Pattern recognition:</strong> "I've seen this movie before. How did it end?"</li>
          </ul>

          <p>
            The best VCs hold all four simultaneously. They're excited about your company while systematically trying to destroy the thesis.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            How to Survive the Pessimism Filter
          </h2>

          <p>
            Knowing this process exists gives you an advantage. Here's how to use it:
          </p>

          <div className="space-y-4 my-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">1. Preempt the Kill List</h4>
              <p className="text-muted-foreground m-0">
                Address concerns before we find them. "You're probably wondering about competitor X. Here's why they won't beat us." This shows self-awareness and builds trust.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">2. Prepare Your References</h4>
              <p className="text-muted-foreground m-0">
                Tell your references we'll call and coach them on the key messages. Not to lie — but to emphasize the right things. Also: assume we'll do back-channel references you don't control.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">3. Have a <Link to="/vcbrain/how-vcs-work/data-room" className="text-primary hover:underline">Data Room</Link> Ready</h4>
              <p className="text-muted-foreground m-0">
                When we ask for customer metrics, contracts, or financial details, delays raise flags. Instant access signals "nothing to hide" and keeps momentum.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">4. Acknowledge Weaknesses</h4>
              <p className="text-muted-foreground m-0">
                Founders who say "we have no weaknesses" trigger alarm bells. We know that's not true. Show us you understand your risks and have mitigation plans.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">5. Help Your Champion</h4>
              <p className="text-muted-foreground m-0">
                The partner who likes you will have to defend you internally. Give them ammunition. "Here's why the competitive concern isn't real" should be a pre-packaged argument they can make.
              </p>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 my-8">
            <h4 className="font-semibold text-foreground mb-3">Your Investment Memo as a Diligence Shield</h4>
            <p className="text-muted-foreground mb-4">
              A well-crafted investment memo anticipates and addresses the kill list before we even start. When I see a founder who has already wrestled with the hard questions — competition, market risk, execution challenges — it signals maturity and raises my confidence.
            </p>
            <p className="text-muted-foreground m-0">
              This is why building a rigorous memo isn't just about the pitch. It's about surviving the 30 days of systematic pessimism that follow.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-6">
            The Good News
          </h2>

          <p>
            If you make it through diligence, something shifts. The pessimism inverts.
          </p>

          <p>
            Once we've tried to kill your deal and failed, we become your biggest advocates. We've stress-tested the thesis. We've looked for problems and couldn't find fatal ones. Now we're believers — not optimists, but converts.
          </p>

          <p>
            And converts are more valuable than optimists. We've seen the risks and chosen to proceed anyway. That conviction carries through to IC, to the term sheet, and to how we support you post-investment.
          </p>

          <p>
            The pessimism isn't personal. It's the crucible that creates conviction.
          </p>

          <p>
            Survive it, and you'll have a true partner.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Continue Reading</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/vcbrain/insider/asymmetry" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
              <h4 className="font-medium text-foreground">VCs Don't Bet on Ideas</h4>
              <p className="text-sm text-muted-foreground">They bet on asymmetry</p>
            </Link>
            <Link to="/vcbrain/insider/after-pitch-room" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
              <h4 className="font-medium text-foreground">What Happens After the Pitch Room</h4>
              <p className="text-sm text-muted-foreground">Internal partner meetings revealed</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagedPessimists;
