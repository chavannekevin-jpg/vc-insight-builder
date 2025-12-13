import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/sections/Footer";
import { 
  Users, 
  Target, 
  AlertTriangle, 
  TrendingUp, 
  Eye, 
  Zap, 
  CheckCircle2, 
  BookOpen, 
  Wrench,
  Brain,
  BarChart3,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

const AcceleratorLanding = () => {
  const navigate = useNavigate();

  const programBenefits = [
    {
      icon: Eye,
      title: "VC-Grade Visibility",
      description: "See which startups are fundable before Demo Day."
    },
    {
      icon: Target,
      title: "Smart Mentor Allocation",
      description: "Route resources to startups that can absorb them."
    },
    {
      icon: TrendingUp,
      title: "Stronger Demo Days",
      description: "Stress-tested pitches mean fewer bombs on stage."
    },
    {
      icon: AlertTriangle,
      title: "Early Blind Spot Detection",
      description: "Surface gaps in week 1, not week 12."
    }
  ];

  const whatFoundersGet = [
    {
      icon: BookOpen,
      title: "Full Investment Memorandum",
      description: "8 sections of VC-grade analysis covering problem, solution, market, competition, traction, team, business model, and the ask. Written like the internal memo that decides their fate."
    },
    {
      icon: Wrench,
      title: "22+ Section-Specific Tools",
      description: "TAM calculators, moat durability scores, unit economics breakdowns, 90-day action plans, competitive teardowns—tools that turn analysis into action."
    },
    {
      icon: Brain,
      title: "VC Brain Knowledge Hub",
      description: "60+ articles on how VCs actually think, from insider takes to pitch mechanics. The education most accelerators can't provide because they've never sat on the other side."
    },
    {
      icon: BarChart3,
      title: "Founder Tools Suite",
      description: "Raise calculators, valuation models, dilution labs, investor email generators. The operational toolkit for fundraising execution."
    }
  ];

  const cohortPricing = [
    { size: "5-10", pricePerStartup: "€49", label: "Small Cohort" },
    { size: "11-25", pricePerStartup: "€39", label: "Standard", featured: true },
    { size: "25+", pricePerStartup: "€29-35", label: "Large Cohort" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section - Lighter, more spacious */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-xs font-medium text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              For Accelerators & Incubators
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
              Half Your Cohort
              <br />
              <span className="text-primary">Isn't Fundable.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              You just don't know which half. Ugly Baby gives your entire cohort the same brutal VC analysis—before Demo Day.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Button
                size="lg"
                className="gap-2"
                onClick={() => navigate('/sample-memo')}
              >
                <Eye className="w-4 h-4" />
                See What It Looks Like
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="text-muted-foreground"
                onClick={() => window.location.href = 'mailto:chavanne.kevin@gmail.com?subject=Accelerator%20Cohort%20Inquiry'}
              >
                Get in touch →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution - Clean two-column */}
      <section className="py-16 px-6 border-t border-border/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-destructive/80">
                <span className="w-8 h-px bg-destructive/40" />
                The Problem
              </div>
              <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                Demo Day is a reputation game. You're playing it blind.
              </h2>
              <ul className="space-y-3 text-muted-foreground text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-destructive/60 mt-0.5">✗</span>
                  Mentors waste hours on startups that can't answer basic VC questions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive/60 mt-0.5">✗</span>
                  Blind spots surface on stage, in front of investors
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive/60 mt-0.5">✗</span>
                  Weak pitches drag down your best companies by association
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-primary/80">
                <span className="w-8 h-px bg-primary/40" />
                The Solution
              </div>
              <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                One investor lens. Applied consistently. Week 1.
              </h2>
              <ul className="space-y-3 text-muted-foreground text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary/70 mt-0.5 flex-shrink-0" />
                  Every startup gets VC-grade analysis when problems are still fixable
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary/70 mt-0.5 flex-shrink-0" />
                  Mentors know exactly where to focus before the first session
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary/70 mt-0.5 flex-shrink-0" />
                  Program managers see fundability gaps across the entire cohort
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* The Analysis Deep Dive */}
      <section className="py-16 px-6 bg-muted/20 border-y border-border/30">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              What the analysis actually examines
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              This isn't pitch deck feedback. It's the same scrutiny applied inside VC funds when partners decide whether to pursue a deal—or pass.
            </p>
          </div>

          <div className="space-y-8">
            <div className="border-l-2 border-primary/30 pl-6">
              <h3 className="font-semibold mb-2">Problem Validity</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Is the problem real, or a solution looking for a problem? Is there evidence beyond founder conviction? VCs look for pain that people are already paying to solve—badly. The analysis surfaces whether founders have validated demand or are building on assumption.
              </p>
            </div>

            <div className="border-l-2 border-primary/30 pl-6">
              <h3 className="font-semibold mb-2">Solution Defensibility</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Can this be copied in six months by a well-funded competitor? Is there technical depth, proprietary data, or network effects? The analysis identifies whether the moat is real or imagined—and what it would take to build one.
              </p>
            </div>

            <div className="border-l-2 border-primary/30 pl-6">
              <h3 className="font-semibold mb-2">Market Logic</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Beyond inflated TAM slides: Is this market big enough to return a fund? Is timing right? Are there structural tailwinds? The analysis stress-tests market assumptions against what investors actually look for—not what founders want to believe.
              </p>
            </div>

            <div className="border-l-2 border-primary/30 pl-6">
              <h3 className="font-semibold mb-2">Traction Quality</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Revenue isn't always signal. The analysis distinguishes between vanity metrics and proof of repeatable demand. Are customers paying? Returning? Referring? Or is growth fueled by unsustainable spend and one-off deals?
              </p>
            </div>

            <div className="border-l-2 border-primary/30 pl-6">
              <h3 className="font-semibold mb-2">Team-Market Fit</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Why this team, for this problem, at this moment? VCs bet on founders who have an unfair advantage—domain expertise, network access, or a unique insight competitors can't replicate. The analysis surfaces whether that advantage exists or needs to be built.
              </p>
            </div>

            <div className="border-l-2 border-primary/30 pl-6">
              <h3 className="font-semibold mb-2">Unit Economics Viability</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Does the business model make sense at scale? What's the path to profitability? The analysis exposes whether current economics can improve with scale—or whether growth just accelerates losses.
              </p>
            </div>

            <div className="border-l-2 border-primary/30 pl-6">
              <h3 className="font-semibold mb-2">Fundability Assessment</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The honest question: Would a professional investor pursue this? Not "is this a good business," but "is this a venture-scale opportunity?" Some great companies aren't VC-fundable. Better to know now than after 50 rejections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Analysis > Feedback */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Why analysis beats feedback
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-destructive/80">Typical mentor feedback</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-destructive/60 mt-0.5">→</span>
                  Based on individual experience and pattern-matching
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive/60 mt-0.5">→</span>
                  Varies wildly depending on who you talk to
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive/60 mt-0.5">→</span>
                  Often filtered to be "constructive" rather than honest
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive/60 mt-0.5">→</span>
                  Focuses on presentation, not fundability
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-primary/80">VC-grade analysis</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary/70 mt-0.5 flex-shrink-0" />
                  Built on the actual decision framework VCs use internally
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary/70 mt-0.5 flex-shrink-0" />
                  Applied consistently across every startup in the cohort
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary/70 mt-0.5 flex-shrink-0" />
                  Designed to surface hard truths, not preserve feelings
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary/70 mt-0.5 flex-shrink-0" />
                  Evaluates investment potential, not pitch polish
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 p-6 rounded-xl bg-muted/30 border border-border/50">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">The uncomfortable reality:</strong> Most founders get rejected for reasons they never understand. VCs rarely explain their real concerns—it's not worth the awkwardness or potential conflict. Ugly Baby surfaces those concerns explicitly, in writing, while there's still time to address them.
            </p>
          </div>
        </div>
      </section>

      {/* Program Benefits - Minimal grid */}
      <section className="py-16 px-6 bg-muted/20 border-y border-border/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">
              For program managers tired of guessing
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {programBenefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx} className="text-center space-y-3">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">{benefit.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What Each Startup Gets - Fuller cards */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Each startup receives</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-8 max-w-2xl">
            Not a 10-minute feedback session. A permanent resource they can work from for months.
          </p>

          <div className="grid md:grid-cols-2 gap-5">
            {whatFoundersGet.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx} 
                  className="flex items-start gap-4 p-6 rounded-xl border border-border/50 bg-card/50 hover:border-primary/30 transition-colors"
                >
                  <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing - Clean inline */}
      <section className="py-16 px-6 bg-muted/20 border-y border-border/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Cohort Pricing</h2>
            <p className="text-sm text-muted-foreground">
              Retail is €59.99/startup. Program-level pricing reflects value at scale.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 max-w-2xl mx-auto">
            {cohortPricing.map((tier, idx) => (
              <div 
                key={idx}
                className={`flex-1 p-6 rounded-xl text-center transition-all ${
                  tier.featured 
                    ? 'bg-primary/5 border-2 border-primary/30' 
                    : 'bg-card/50 border border-border/50'
                }`}
              >
                <div className="text-xs text-muted-foreground mb-1">{tier.label}</div>
                <div className="text-3xl font-bold text-primary">{tier.pricePerStartup}</div>
                <div className="text-xs text-muted-foreground mt-1">{tier.size} startups</div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => navigate('/sample-memo')}
            >
              Preview a full memo
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works - Detailed flow */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">How it works</h2>
          </div>

          <div className="space-y-8">
            <div className="flex gap-5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-primary">1</div>
              <div>
                <h3 className="font-semibold mb-2">Founders complete the questionnaire</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Each founder fills out a structured questionnaire about their business—problem, solution, market, traction, team, business model, and fundraising ask. This isn't a pitch deck review. It's a deep diagnostic built on the exact questions VCs ask themselves when deciding whether to pursue a deal.
                </p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-primary">2</div>
              <div>
                <h3 className="font-semibold mb-2">Ugly Baby generates the investment memo</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  From those answers, Ugly Baby generates a full investment memorandum: the same document that would be written internally at a VC fund before a partner meeting. Founders see how they'd be scored, where their gaps are, and what needs to change—while there's still time to change it.
                </p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-primary">3</div>
              <div>
                <h3 className="font-semibold mb-2">Program gets cohort-wide visibility</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every startup gets the same rigorous analysis, applied consistently, at the start of the program. You can see—at a glance—which companies are fundable, which need specific interventions, and which are fundamentally misaligned with what VCs look for.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Matters - Detailed explanation */}
      <section className="py-16 px-6 bg-muted/20 border-y border-border/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold mb-8">Why this matters for your program</h2>
          
          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
            <p>
              Most accelerators run on intuition. Mentors form impressions in the first meeting. Program managers allocate resources based on gut feel. Demo Day outcomes depend on which founders happened to get the right advice at the right time.
            </p>
            <p>
              Ugly Baby changes the baseline. Every startup gets the same rigorous analysis, applied consistently, at the start of the program. You can see—at a glance—which companies are fundable, which need specific interventions, and which are fundamentally misaligned with what VCs look for.
            </p>
            <p>
              This isn't about being harsh. It's about being honest early enough that honesty is still useful.
            </p>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-border/50 bg-card/30">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Cohort-wide visibility
              </h3>
              <p className="text-xs text-muted-foreground">See fundability gaps across all startups, not just the ones that speak up.</p>
            </div>
            <div className="p-5 rounded-xl border border-border/50 bg-card/30">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Mentor efficiency
              </h3>
              <p className="text-xs text-muted-foreground">Every mentor session starts with context, not discovery.</p>
            </div>
            <div className="p-5 rounded-xl border border-border/50 bg-card/30">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Founder accountability
              </h3>
              <p className="text-xs text-muted-foreground">Founders can't hide behind vague pitches—the memo exposes what's missing.</p>
            </div>
            <div className="p-5 rounded-xl border border-border/50 bg-card/30">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Demo Day confidence
              </h3>
              <p className="text-xs text-muted-foreground">When every pitch has been stress-tested, fewer bomb on stage.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Minimal */}
      <section className="py-20 px-6 border-t border-border/30">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold">
            One investor lens.
            <br />
            <span className="text-muted-foreground font-normal">Applied consistently. Early enough to matter.</span>
          </h2>
          
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Ugly Baby doesn't replace mentors—it gives them a clear starting point so they can do their job better.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              className="gap-2"
              onClick={() => navigate('/sample-memo')}
            >
              <Eye className="w-4 h-4" />
              See What It Looks Like
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.location.href = 'mailto:chavanne.kevin@gmail.com?subject=Accelerator%20Cohort%20Inquiry'}
            >
              Contact for Pricing
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AcceleratorLanding;
