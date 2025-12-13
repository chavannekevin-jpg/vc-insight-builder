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
  Mail,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const AcceleratorLanding = () => {
  const navigate = useNavigate();

  const programBenefits = [
    {
      icon: Eye,
      title: "See the Cohort Through VC Eyes",
      description: "Identify which startups are fundable, which need work, and which are wasting everyone's time—before Demo Day embarrasses you."
    },
    {
      icon: Target,
      title: "Stop Mentor Misallocation",
      description: "Stop sending your best mentors into founders who can't articulate their value prop. Route resources to startups that can actually absorb them."
    },
    {
      icon: TrendingUp,
      title: "Raise Demo Day Outcomes",
      description: "When every startup has been stress-tested against real VC criteria, fewer bomb on stage. Your reputation compounds."
    },
    {
      icon: AlertTriangle,
      title: "Surface Blind Spots Early",
      description: "Most founders don't know what they don't know. We surface the gaps in week 1, not week 12 when it's too late to fix anything."
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
    { size: "5-10 startups", pricePerStartup: "€49", total: "~€490" },
    { size: "11-25 startups", pricePerStartup: "€39", total: "~€780" },
    { size: "25+ startups", pricePerStartup: "€29-35", total: "Custom" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background/95 to-muted/20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-destructive/5 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 backdrop-blur-sm">
              <Users className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">For Accelerators & Incubators</span>
            </div>

            {/* Main headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.15]">
              <span className="inline-block">Half Your Cohort Isn't Fundable.</span>
              <br />
              <span 
                className="text-primary font-bold inline-block"
                style={{ 
                  textShadow: '0 0 10px hsl(var(--primary) / 0.6), 0 0 20px hsl(var(--primary) / 0.4)'
                }}
              >
                You Just Don't Know Which Half.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Ugly Baby gives your entire cohort the same brutal analysis VCs run internally. 
              Surface the weak ones before Demo Day. Fix what's fixable. Stop wasting mentor time on startups going nowhere.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                size="lg"
                className="px-8 py-6 text-lg gap-2"
                onClick={() => navigate('/sample-memo')}
              >
                <Eye className="w-5 h-5" />
                See What It Looks Like
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-6 text-lg"
                onClick={() => window.location.href = 'mailto:accelerators@uglybaby.dev?subject=Cohort%20Inquiry'}
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-20 px-6 sm:px-8 lg:px-12 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/30 backdrop-blur-xl mb-6">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-semibold text-destructive">The Uncomfortable Truth</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Demo Day is a Reputation Game.
              <br />
              <span className="text-muted-foreground">You're Playing It Blind.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card/80 backdrop-blur-xl border-2 border-destructive/30 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-destructive mb-4">What Usually Happens</h3>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-destructive mt-1">✗</span>
                  <span>Mentors spend 20 hours with a startup that can't answer basic VC questions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive mt-1">✗</span>
                  <span>Founders pitch with blind spots you discover on stage, in front of investors</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive mt-1">✗</span>
                  <span>The cohort "average" drags down your best companies by association</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive mt-1">✗</span>
                  <span>VCs stop showing up because too many pitches waste their time</span>
                </li>
              </ul>
            </div>

            <div className="bg-card/80 backdrop-blur-xl border-2 border-primary/30 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-primary mb-4">What Changes with Ugly Baby</h3>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Every startup gets a VC-grade analysis in week 1—problems surface when they're still fixable</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Mentors know exactly where each founder needs help before the first session</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Program managers see fundability gaps across the cohort at a glance</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Demo Day becomes a signal, not a gamble</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Program Benefits */}
      <section className="py-20 px-6 sm:px-8 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              For Program Managers Who Are Tired of
              <br />
              <span className="text-primary">Guessing Which Startups Will Bomb</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {programBenefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={idx} 
                  className="relative group bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What Each Startup Gets */}
      <section className="py-20 px-6 sm:px-8 lg:px-12 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-xl mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Per Startup Deliverables</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Each Founder Gets a Complete
              <br />
              <span className="text-primary">VC Analysis Toolkit</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Not a 10-minute feedback session. A permanent resource they can work from for months.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {whatFoundersGet.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx} 
                  className="bg-card/80 backdrop-blur-xl border-2 border-primary/20 rounded-2xl p-8 hover:border-primary/40 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 flex-shrink-0">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 sm:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Cohort Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Retail is €59.99/startup. Cohorts get program-level pricing because you're buying signal at scale, not one-off vanity metrics.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {cohortPricing.map((tier, idx) => (
              <div 
                key={idx}
                className={`bg-card/80 backdrop-blur-xl border-2 rounded-2xl p-8 text-center ${
                  idx === 1 ? 'border-primary/50 shadow-glow' : 'border-border/50'
                }`}
              >
                <div className="text-muted-foreground text-sm mb-2">{tier.size}</div>
                <div className="text-4xl font-bold text-primary mb-1">{tier.pricePerStartup}</div>
                <div className="text-sm text-muted-foreground">per startup</div>
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="text-sm text-muted-foreground">Cohort total: {tier.total}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-muted/50 rounded-2xl p-8 text-center">
            <p className="text-muted-foreground mb-6">
              This isn't a discount mechanism. Cohort pricing reflects the program-level value: 
              a shared analytical baseline that makes mentoring sharper, Demo Days stronger, 
              and your fund relationships more valuable.
            </p>
            <Button
              size="lg"
              className="gap-2"
              onClick={() => navigate('/sample-memo')}
            >
              See What It Looks Like
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Value Explanation Section */}
      <section className="py-20 px-6 sm:px-8 lg:px-12 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4">What Actually Happens</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Each founder in your cohort fills out a structured questionnaire about their business—problem, solution, market, traction, team, business model, and fundraising ask. This isn't a pitch deck review. It's a deep diagnostic built on the exact questions VCs ask themselves when deciding whether to pursue a deal.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                From those answers, Ugly Baby generates a full investment memorandum: the same document that would be written internally at a VC fund before a partner meeting. Founders see how they'd be scored, where their gaps are, and what needs to change—while there's still time to change it.
              </p>
            </div>

            <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4">Why This Matters for Your Program</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Most accelerators run on intuition. Mentors form impressions in the first meeting. Program managers allocate resources based on gut feel. Demo Day outcomes depend on which founders happened to get the right advice at the right time.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Ugly Baby changes the baseline. Every startup gets the same rigorous analysis, applied consistently, at the start of the program. You can see—at a glance—which companies are fundable, which need specific interventions, and which are fundamentally misaligned with what VCs look for.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This isn't about being harsh. It's about being honest early enough that honesty is still useful.
              </p>
            </div>

            <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4">What You Get as a Program</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Cohort-wide visibility:</strong> See fundability gaps across all startups, not just the ones that speak up</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Mentor efficiency:</strong> Every mentor session starts with context, not discovery</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Founder accountability:</strong> Founders can't hide behind vague pitches—the memo exposes what's missing</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Demo Day confidence:</strong> When every pitch has been stress-tested, fewer bomb on stage</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 sm:px-8 lg:px-12 bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            One Investor Lens.
            <br />
            <span className="text-primary">Applied Consistently. Early Enough to Matter.</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Ugly Baby doesn't replace your mentors, workshops, or coaching. It gives them a clear, objective starting point—so they can do their job better.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="px-8 py-6 text-lg gap-2"
              onClick={() => navigate('/sample-memo')}
            >
              <Eye className="w-5 h-5" />
              See What It Looks Like
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg"
              onClick={() => window.location.href = 'mailto:accelerators@uglybaby.dev?subject=Cohort%20Inquiry'}
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
