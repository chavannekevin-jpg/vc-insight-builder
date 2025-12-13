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
      title: "Investment Memorandum",
      description: "8-section VC analysis: problem, solution, market, competition, traction, team, business model, and ask."
    },
    {
      icon: Wrench,
      title: "22+ VC Tools",
      description: "TAM calculators, moat scores, unit economics, 90-day plans, competitive teardowns."
    },
    {
      icon: Brain,
      title: "VC Brain Hub",
      description: "60+ articles on how VCs actually think—insider knowledge most programs can't provide."
    },
    {
      icon: BarChart3,
      title: "Founder Toolkit",
      description: "Raise calculators, valuation models, dilution labs, investor email generators."
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

      {/* What Founders Get - Horizontal cards */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Each startup receives</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {whatFoundersGet.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx} 
                  className="flex items-start gap-4 p-5 rounded-xl border border-border/50 bg-card/50 hover:border-primary/30 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-primary/5 flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
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

      {/* How It Works - Simple flow */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">How it works</h2>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-primary">1</div>
              <div>
                <h3 className="font-semibold mb-1">Founders complete the questionnaire</h3>
                <p className="text-sm text-muted-foreground">Structured questions about problem, solution, market, traction, team, business model, and ask. Built on the exact questions VCs ask internally.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-primary">2</div>
              <div>
                <h3 className="font-semibold mb-1">Ugly Baby generates the memo</h3>
                <p className="text-sm text-muted-foreground">A full investment memorandum—the same document written internally at VC funds before partner meetings. Scores, gaps, and actionable insights.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-primary">3</div>
              <div>
                <h3 className="font-semibold mb-1">Program gets cohort-wide visibility</h3>
                <p className="text-sm text-muted-foreground">See fundability gaps across all startups. Route mentors effectively. Enter Demo Day with confidence, not hope.</p>
              </div>
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
