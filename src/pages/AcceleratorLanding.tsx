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
      title: "Full Investment Analysis",
      description: "8 sections of VC-grade analysis covering problem, solution, market, competition, traction, team, business model, and the ask. Written like the internal document that decides their fate."
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
    { 
      size: "5-10", 
      pricePerStartup: "€149", 
      label: "Small Cohort", 
      perks: ["Unlimited analyses", "Full tool suite"]
    },
    { 
      size: "11-25", 
      pricePerStartup: "€129", 
      label: "Standard", 
      featured: true,
      perks: ["Unlimited analyses", "Full tool suite", "Cohort analytics"]
    },
    { 
      size: "25+", 
      pricePerStartup: "€99", 
      label: "Large Cohort",
      perks: ["Unlimited analyses", "Full tool suite", "Cohort analytics"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
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

      {/* Problem/Solution */}
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

      {/* The VC Framework Section */}
      <section className="py-16 px-6 bg-muted/20 border-y border-border/30">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              The VC framework behind the analysis
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              This isn't pitch deck feedback. It's the same decision framework used inside VC funds when partners evaluate whether to pursue a deal—or pass. Each section of the analysis applies a specific analytical lens that investors use internally.
            </p>
          </div>

          {/* 8 Sections Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="p-5 rounded-xl border border-border/50 bg-card/30">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">1</span>
                Problem
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Is the pain real and quantified? VCs look for evidence of burning problems people are already paying to solve—badly.
              </p>
              <div className="text-xs text-primary/70 space-y-1">
                <div>→ Evidence Threshold Tool: grades proof quality A-F</div>
                <div>→ Founder Blind Spot Detector: surfaces assumptions</div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-border/50 bg-card/30">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">2</span>
                Solution
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Can this be copied in 6 months? Is there technical depth, proprietary data, or network effects that create real moats?
              </p>
              <div className="text-xs text-primary/70 space-y-1">
                <div>→ Technical Defensibility Score: rates moat strength</div>
                <div>→ Commoditization Teardown: feature-by-feature clone risk</div>
                <div>→ Competitor Build Analysis: time/cost to replicate</div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-border/50 bg-card/30">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">3</span>
                Market
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Beyond inflated TAMs: Is this market big enough to return a fund? Is timing right? Are there structural tailwinds?
              </p>
              <div className="text-xs text-primary/70 space-y-1">
                <div>→ Bottoms-Up TAM Calculator: verifiable market sizing</div>
                <div>→ Market Readiness Index: regulatory/urgency/WTP scores</div>
                <div>→ VC Narrative Builder: how to pitch to investment committee</div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-border/50 bg-card/30">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">4</span>
                Competition
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Who else is solving this? What will well-funded competitors do in 12 months? Where's the defensible position?
              </p>
              <div className="text-xs text-primary/70 space-y-1">
                <div>→ Competitor Chessboard: predicts competitor moves</div>
                <div>→ Moat Durability Score: how long before erosion</div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-border/50 bg-card/30">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">5</span>
                Traction
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Revenue isn't always signal. Distinguishes vanity metrics from proof of repeatable demand.
              </p>
              <div className="text-xs text-primary/70 space-y-1">
                <div>→ Traction Depth Test: quality vs. quantity analysis</div>
                <div>→ Stage Benchmarks: how you compare to funded peers</div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-border/50 bg-card/30">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">6</span>
                Team
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Why this team, for this problem, at this moment? What unfair advantage do they bring?
              </p>
              <div className="text-xs text-primary/70 space-y-1">
                <div>→ Credibility Gap Analysis: skills vs. requirements</div>
                <div>→ Founder-Market Fit Mapping: comparison to successful exits</div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-border/50 bg-card/30">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">7</span>
                Business Model
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Do the unit economics work at scale? What's the path to profitability—or is growth just accelerating losses?
              </p>
              <div className="text-xs text-primary/70 space-y-1">
                <div>→ Model Stress Test: survival under adverse scenarios</div>
                <div>→ Cash Efficiency Benchmark: burn multiple vs. peers</div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-border/50 bg-card/30">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">8</span>
                The Ask
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Is the raise amount justified? Is the valuation reasonable? Does the use of funds make sense?
              </p>
              <div className="text-xs text-primary/70 space-y-1">
                <div>→ Milestone Mapping: what this capital should achieve</div>
                <div>→ Scenario Planning: upside/base/downside paths</div>
                <div>→ Exit Narrative: how this becomes a VC-returnable outcome</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Tools Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              22+ analytical tools embedded in every analysis
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The analysis isn't just narrative—it's structured insight. Each section includes specific tools that turn VC logic into actionable insights.
            </p>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-border/50 bg-card/30">
              <h3 className="font-semibold mb-3">Scoring & Benchmarking</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Every section gets a 0-100 score benchmarked against what VCs expect at Seed and Series A. Founders see exactly where they stand relative to funded peers—not abstract feedback, but percentile rankings based on real investment criteria.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs rounded bg-primary/10 text-primary">Section Scores</span>
                <span className="px-2 py-1 text-xs rounded bg-primary/10 text-primary">VC Benchmarks</span>
                <span className="px-2 py-1 text-xs rounded bg-primary/10 text-primary">Percentile Rankings</span>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-border/50 bg-card/30">
              <h3 className="font-semibold mb-3">VC Investment Logic</h3>
              <p className="text-sm text-muted-foreground mb-4">
                For each section, founders see the actual decision a VC would make: PASS, CAUTIOUS, INTERESTED, or STRONG INTEREST. Plus the reasoning and specific conditions required to move the needle. No more wondering "what do investors think?"—it's written explicitly.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs rounded bg-primary/10 text-primary">Decision Signals</span>
                <span className="px-2 py-1 text-xs rounded bg-primary/10 text-primary">Key Conditions</span>
                <span className="px-2 py-1 text-xs rounded bg-primary/10 text-primary">IC Reasoning</span>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-border/50 bg-card/30">
              <h3 className="font-semibold mb-3">90-Day Action Plans</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Every section generates a prioritized action plan: critical vs. important tasks, specific timelines, measurable metrics. Founders leave with a roadmap to fix what's broken—not just awareness that something is wrong.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs rounded bg-primary/10 text-primary">Prioritized Actions</span>
                <span className="px-2 py-1 text-xs rounded bg-primary/10 text-primary">Week-by-Week Timeline</span>
                <span className="px-2 py-1 text-xs rounded bg-primary/10 text-primary">Success Metrics</span>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-border/50 bg-card/30">
              <h3 className="font-semibold mb-3">Lead Investor Requirements</h3>
              <p className="text-sm text-muted-foreground mb-4">
                What would a lead investor need to see before writing a check? Each section includes explicit requirements, dealbreakers, and a paragraph written from the investor's perspective explaining their concerns and conditions.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs rounded bg-primary/10 text-primary">Must-Haves</span>
                <span className="px-2 py-1 text-xs rounded bg-primary/10 text-primary">Dealbreakers</span>
                <span className="px-2 py-1 text-xs rounded bg-primary/10 text-primary">Investor Perspective</span>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-border/50 bg-card/30">
              <h3 className="font-semibold mb-3">Comparable Case Studies</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Real examples of companies that faced similar challenges and how they solved them. Each case study includes the problem, the fix, the outcome, and the timeframe—so founders can learn from relevant precedent.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs rounded bg-primary/10 text-primary">Similar Companies</span>
                <span className="px-2 py-1 text-xs rounded bg-primary/10 text-primary">What They Fixed</span>
                <span className="px-2 py-1 text-xs rounded bg-primary/10 text-primary">Outcomes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Analysis > Feedback */}
      <section className="py-16 px-6 bg-muted/20 border-y border-border/30">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Why this beats typical feedback
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
                <li className="flex items-start gap-2">
                  <span className="text-destructive/60 mt-0.5">→</span>
                  No structured methodology or benchmarks
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-primary/80">Ugly Baby analysis</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary/70 mt-0.5 flex-shrink-0" />
                  Built on actual VC decision frameworks
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary/70 mt-0.5 flex-shrink-0" />
                  Applied consistently across every startup
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary/70 mt-0.5 flex-shrink-0" />
                  Designed to surface hard truths, not preserve feelings
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary/70 mt-0.5 flex-shrink-0" />
                  Evaluates investment potential, not pitch polish
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary/70 mt-0.5 flex-shrink-0" />
                  Quantified scores and stage-specific benchmarks
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 p-6 rounded-xl bg-card/50 border border-border/50">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">The uncomfortable reality:</strong> Most founders get rejected for reasons they never understand. VCs rarely explain their real concerns—it's not worth the awkwardness or potential conflict. Ugly Baby surfaces those concerns explicitly, in writing, while there's still time to address them.
            </p>
          </div>
        </div>
      </section>

      {/* Program Benefits */}
      <section className="py-16 px-6">
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

      {/* What Each Startup Gets */}
      <section className="py-16 px-6 bg-muted/20 border-y border-border/30">
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

      {/* How It Works */}
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
                <h3 className="font-semibold mb-2">Ugly Baby generates the investment analysis</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  From those answers, Ugly Baby generates a full investment analysis: the same document that would be written internally at a VC fund before a partner meeting. Founders see how they'd be scored, where their gaps are, and what needs to change—while there's still time to change it.
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

      {/* Pricing */}
      <section className="py-16 px-6 bg-muted/20 border-y border-border/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Cohort Pricing</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Retail: €29.99/analysis + €8.99 per regeneration. Program pricing includes <strong className="text-foreground">unlimited analyses per startup</strong>—no regeneration fees, ever.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 max-w-3xl mx-auto mb-8">
            {cohortPricing.map((tier, idx) => (
              <div 
                key={idx}
                className={`p-6 rounded-xl text-center transition-all ${
                  tier.featured 
                    ? 'bg-primary/5 border-2 border-primary/30 relative' 
                    : 'bg-card/50 border border-border/50'
                }`}
              >
                {tier.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="text-xs text-muted-foreground mb-2">{tier.label}</div>
                <div className="text-3xl font-bold text-primary">{tier.pricePerStartup}</div>
                <div className="text-xs text-muted-foreground mt-1">per startup</div>
                <div className="text-xs text-muted-foreground/60 mt-0.5">{tier.size} startups</div>
                
                
                <div className="mt-4 pt-4 border-t border-border/30 space-y-1.5">
                  {tier.perks.map((perk, perkIdx) => (
                    <div key={perkIdx} className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-primary/70" />
                      {perk}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-card/30 border border-border/50 rounded-xl p-5 max-w-2xl mx-auto mb-8">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Why unlimited analyses matter
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Retail users get 1 analysis and pay €8.99 for each regeneration. Program startups can regenerate as often as needed—after mentor feedback, after pivots, before Demo Day. The analysis becomes a living document that evolves with the company, not a one-time snapshot.
            </p>
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => navigate('/sample-memo')}
            >
              Preview a full analysis
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
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
