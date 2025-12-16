import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/sections/Footer";
import { 
  Users, 
  Target, 
  TrendingUp, 
  Eye, 
  Zap, 
  CheckCircle2, 
  BookOpen, 
  Wrench,
  Brain,
  BarChart3,
  ArrowRight,
  Sparkles,
  Calendar,
  FileText,
  ChevronDown,
  Clock,
  Award,
  Linkedin,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import kevinPhoto from "@/assets/profile-photo.jpg";

const AcceleratorLanding = () => {
  const navigate = useNavigate();
  const [frameworkOpen, setFrameworkOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  const outcomes = [
    {
      icon: Eye,
      title: "Cohort-wide fundability map in week 1",
      description: "See which startups are Demo Day-ready before the first mentor session."
    },
    {
      icon: Clock,
      title: "Focused mentor time",
      description: "Route hours to startups that can absorb them. Stop guessing who needs what."
    },
    {
      icon: TrendingUp,
      title: "Stronger Demo Days",
      description: "Stress-tested pitches mean fewer blind spots surfacing on stage."
    },
    {
      icon: Award,
      title: "Protected program reputation",
      description: "Weak pitches no longer drag down your best companies by association."
    }
  ];

  const howItWorks = [
    {
      week: "Week 1",
      title: "Founders complete diagnostic",
      description: "30-minute structured questionnaire covering problem, solution, market, traction, team, and business model."
    },
    {
      week: "Week 2",
      title: "Program receives cohort map",
      description: "Section-by-section scores, fundability gaps, and specific intervention points for each startup."
    },
    {
      week: "Ongoing",
      title: "Mentors work from insights",
      description: "Specific, scored analysis means mentors know exactly where to focus—not general impressions."
    },
    {
      week: "Demo Day",
      title: "Stress-tested pitches",
      description: "Startups have addressed the hard questions. Fewer surprises, better investor conversations."
    }
  ];

  const beforeAfter = [
    {
      before: "\"I think they need to work on their pitch...\"",
      after: "\"Their market section scored 42/100—timing narrative is weak, TAM calculation uses top-down assumptions.\""
    },
    {
      before: "\"The team seems good but something feels off.\"",
      after: "\"Credibility gap analysis shows missing technical cofounder for AI-heavy roadmap.\""
    },
    {
      before: "\"They should probably raise less money.\"",
      after: "\"Milestone mapping shows 18-month runway request but only 9 months of milestones defined.\""
    }
  ];

  const whatFoundersGet = [
    {
      icon: BookOpen,
      title: "Full Investment Analysis",
      description: "8 sections of VC-grade analysis covering problem, solution, market, competition, traction, team, business model, and the ask."
    },
    {
      icon: Wrench,
      title: "22+ Analytical Tools",
      description: "TAM calculators, moat durability scores, unit economics breakdowns, 90-day action plans, competitive teardowns."
    },
    {
      icon: Brain,
      title: "VC Brain Knowledge Hub",
      description: "60+ articles on how VCs actually think. The education most accelerators can't provide."
    },
    {
      icon: BarChart3,
      title: "Founder Tools Suite",
      description: "Raise calculators, valuation models, dilution labs, investor email generators."
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
      
      {/* Hero Section - Outcome-Focused */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-xs font-medium text-muted-foreground">
              <Building2 className="w-3.5 h-3.5" />
              For Accelerators & Incubators
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
              Know which startups are
              <br />
              <span className="text-primary">Demo Day-ready in week one.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              VC-grade fundability diagnosis for your entire cohort. Applied consistently. Early enough to matter.
            </p>

            {/* Immediate Value Props */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Cohort-wide diagnosis
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Focused mentor time
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Fewer blind spots on stage
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Button
                size="lg"
                className="gap-2"
                onClick={() => navigate('/sample-memo')}
              >
                <FileText className="w-4 h-4" />
                Preview a real cohort analysis
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="text-muted-foreground"
                onClick={() => window.location.href = 'mailto:chavanne.kevin@gmail.com?subject=How%20would%20my%20cohort%20be%20mapped?'}
              >
                See how your cohort would be mapped →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Outcomes Grid - What Visibly Improves */}
      <section className="py-16 px-6 border-t border-border/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm text-primary font-medium mb-2">What changes for your program</p>
            <h2 className="text-2xl md:text-3xl font-bold">
              Outcomes you'll see in the first 30 days
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {outcomes.map((outcome, idx) => {
              const Icon = outcome.icon;
              return (
                <div key={idx} className="text-center space-y-3 p-5 rounded-xl border border-border/50 bg-card/30">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">{outcome.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{outcome.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social Proof - Why This Framework */}
      <section className="py-16 px-6 bg-muted/20 border-y border-border/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 items-center">
            {/* Photo */}
            <div className="md:col-span-2">
              <div className="rounded-xl overflow-hidden border border-border/50 bg-card/30">
                <div className="aspect-square relative">
                  <img 
                    src={kevinPhoto} 
                    alt="Kevin Chavanne - Nordic VC at Tenity" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="md:col-span-3 space-y-5">
              <div>
                <p className="text-sm text-primary font-medium mb-2">Built by an active investor</p>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                  10 years reviewing pitches. These are the actual frameworks we use.
                </h2>
              </div>
              
              <p className="text-muted-foreground text-sm leading-relaxed">
                I'm <strong className="text-foreground">Kevin Chavanne</strong>. I lead <strong className="text-foreground">Tenity's Nordic branch</strong>, investing in early-stage fintech. Before this, I scaled Funderbeam across Iberia and Scandinavia, and deployed capital at Blast Club. I've mentored hundreds of founders at <strong className="text-foreground">Plug & Play</strong> and other accelerators.
              </p>

              <p className="text-muted-foreground text-sm leading-relaxed">
                This isn't theoretical. It's the same decision framework I use when evaluating deals—now applied consistently to your entire cohort, in week one, while there's still time to fix what's broken.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3 pt-2">
                {[
                  { number: "10+", label: "Years in VC" },
                  { number: "3000+", label: "Pitches" },
                  { number: "Dozens", label: "Invested" },
                  { number: "Active", label: "Mentor" }
                ].map((stat, idx) => (
                  <div key={idx} className="text-center p-3 rounded-lg border border-border/50 bg-card/30">
                    <div className="text-lg font-bold text-primary">{stat.number}</div>
                    <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>

              <a 
                href="https://www.linkedin.com/in/kevin-chavanne-1b8a368a/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Linkedin className="w-4 h-4" />
                Connect on LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How Accelerators Use It - Clear Mental Model */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm text-primary font-medium mb-2">A tool, a report, and a process</p>
            <h2 className="text-2xl md:text-3xl font-bold">
              How accelerators use it
            </h2>
            <p className="text-muted-foreground text-sm mt-3 max-w-lg mx-auto">
              Not another optional layer. It's infrastructure that plugs into your existing program flow.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {howItWorks.map((step, idx) => (
              <div key={idx} className="p-5 rounded-xl border border-border/50 bg-card/30 space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">{step.week}</span>
                </div>
                <h3 className="font-semibold text-sm">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After - What Mentors Guess vs Know */}
      <section className="py-16 px-6 bg-muted/20 border-y border-border/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              From impressions to insights
            </h2>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              What mentors guess vs. what they now know
            </p>
          </div>

          <div className="space-y-4">
            {beforeAfter.map((item, idx) => (
              <div key={idx} className="grid md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl border border-destructive/20 bg-destructive/5">
                  <div className="text-xs font-medium text-destructive/70 mb-2">Without Ugly Baby</div>
                  <p className="text-sm text-muted-foreground italic">{item.before}</p>
                </div>
                <div className="p-5 rounded-xl border border-primary/30 bg-primary/5">
                  <div className="text-xs font-medium text-primary/70 mb-2">With Ugly Baby</div>
                  <p className="text-sm text-muted-foreground">{item.after}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Each Startup Gets */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">What each startup receives</h2>
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

      {/* Collapsible VC Framework Details */}
      <section className="py-12 px-6 bg-muted/10 border-y border-border/30">
        <div className="max-w-4xl mx-auto">
          <Collapsible open={frameworkOpen} onOpenChange={setFrameworkOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/30 hover:border-primary/30 transition-colors">
                <div className="text-left">
                  <h3 className="font-semibold">The VC framework behind the analysis</h3>
                  <p className="text-xs text-muted-foreground mt-1">8 sections of investment-grade analysis. Click to see details.</p>
                </div>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${frameworkOpen ? 'rotate-180' : ''}`} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                {[
                  { num: 1, title: "Problem", desc: "Is the pain real and quantified? VCs look for evidence of burning problems people are already paying to solve—badly." },
                  { num: 2, title: "Solution", desc: "Can this be copied in 6 months? Is there technical depth, proprietary data, or network effects that create real moats?" },
                  { num: 3, title: "Market", desc: "Beyond inflated TAMs: Is this market big enough to return a fund? Is timing right? Are there structural tailwinds?" },
                  { num: 4, title: "Competition", desc: "Who else is solving this? What will well-funded competitors do in 12 months? Where's the defensible position?" },
                  { num: 5, title: "Traction", desc: "Revenue isn't always signal. Distinguishes vanity metrics from proof of repeatable demand." },
                  { num: 6, title: "Team", desc: "Why this team, for this problem, at this moment? What unfair advantage do they bring?" },
                  { num: 7, title: "Business Model", desc: "Do the unit economics work at scale? What's the path to profitability?" },
                  { num: 8, title: "The Ask", desc: "Is the raise amount justified? Is the valuation reasonable? Does the use of funds make sense?" }
                ].map((section) => (
                  <div key={section.num} className="p-4 rounded-xl border border-border/50 bg-card/30">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{section.num}</span>
                      {section.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{section.desc}</p>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={toolsOpen} onOpenChange={setToolsOpen} className="mt-4">
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/30 hover:border-primary/30 transition-colors">
                <div className="text-left">
                  <h3 className="font-semibold">22+ analytical tools in every analysis</h3>
                  <p className="text-xs text-muted-foreground mt-1">Scoring, benchmarks, action plans, and more. Click to see details.</p>
                </div>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                {[
                  { title: "Section Scores & Benchmarks", desc: "0-100 scores benchmarked against what VCs expect at Seed and Series A." },
                  { title: "VC Investment Logic", desc: "PASS, CAUTIOUS, INTERESTED, or STRONG INTEREST—plus the reasoning." },
                  { title: "90-Day Action Plans", desc: "Prioritized tasks, specific timelines, measurable metrics." },
                  { title: "Lead Investor Requirements", desc: "What a lead investor needs to see before writing a check." },
                  { title: "Comparable Case Studies", desc: "Real examples of companies that faced similar challenges." },
                  { title: "TAM Calculator", desc: "Bottoms-up market sizing with verifiable assumptions." }
                ].map((tool, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-border/50 bg-card/30">
                    <h4 className="font-semibold text-sm mb-1">{tool.title}</h4>
                    <p className="text-xs text-muted-foreground">{tool.desc}</p>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </section>

      {/* Pricing with Value Anchoring */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Cohort Pricing</h2>
            
            {/* Value Anchoring */}
            <div className="max-w-xl mx-auto p-4 rounded-xl bg-muted/30 border border-border/50 mb-6">
              <p className="text-sm text-muted-foreground">
                One weak Demo Day can cost months of relationship-building with investors.
                <br />
                <strong className="text-foreground">€129/startup is less than a single hour of mentor time per founder.</strong>
              </p>
            </div>

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
              Retail users get 1 analysis and pay €8.99 for each regeneration. Program startups can regenerate as often as needed—after mentor feedback, after pivots, before Demo Day. The analysis becomes a living document that evolves with the company.
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

      {/* Final CTA - Partner Positioning */}
      <section className="py-20 px-6 bg-muted/20 border-t border-border/30">
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
              <FileText className="w-4 h-4" />
              Preview a real cohort analysis
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.location.href = 'mailto:chavanne.kevin@gmail.com?subject=How%20would%20my%20cohort%20be%20mapped?'}
            >
              See how your cohort would be mapped
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AcceleratorLanding;
