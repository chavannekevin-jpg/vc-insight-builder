import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Check, 
  Sparkles, 
  TrendingUp, 
  FileSearch, 
  Wrench, 
  Users, 
  Telescope, 
  MessageSquare,
  Target,
  Brain,
  ArrowRight,
  Zap,
  ChevronDown,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Value breakdown data - what consultants would charge
const VALUE_BREAKDOWN = [
  { 
    label: "8-Dimension Investment Audit", 
    value: "€2,500", 
    icon: FileSearch,
    description: "The complete VC evaluation framework",
    details: [
      "Scorecard across Team, Market, Product, Traction, Financials, Narrative, Defensibility & Venture Fit",
      "Each dimension rated exactly how VCs score you internally",
      "Investment thesis: the story a partner would pitch to their IC",
      "Red flags surfaced before they kill your deal",
      "Prioritized action plan to fix weaknesses fast"
    ]
  },
  { 
    label: "23+ Strategic Diagnostic Tools", 
    value: "€2,000", 
    icon: Wrench,
    description: "Every analysis tool a VC analyst uses",
    details: [
      "TAM/SAM/SOM Calculator with market sizing logic",
      "Unit Economics breakdown (LTV, CAC, payback period)",
      "Competitor positioning matrix",
      "Team gap analysis & hiring roadmap",
      "Evidence threshold assessment",
      "Differentiation matrix & moat builder",
      "And 17 more specialized tools..."
    ]
  },
  { 
    label: "Investor Database + Matching", 
    value: "€1,500", 
    icon: Users,
    description: "800+ VCs filtered to your exact profile",
    details: [
      "Pre-filtered by stage, sector, geography, and check size",
      "Each investor matched to your specific company profile",
      "Fund thesis summaries and recent investments",
      "Direct contact paths and warm intro suggestions",
      "Network visualization showing investor clusters"
    ]
  },
  { 
    label: "Market Intelligence Briefing", 
    value: "€1,200", 
    icon: Telescope,
    description: "50+ industry reports distilled for your context",
    details: [
      "Tailwinds: macro trends working in your favor",
      "Headwinds: challenges to address or position around",
      "Funding landscape: what's getting funded in your space",
      "Exit precedents: comparable acquisitions and IPOs",
      "All filtered through your specific sector, stage & geography"
    ]
  },
  { 
    label: "Outreach Generation Suite", 
    value: "€800", 
    icon: MessageSquare,
    description: "Personalized investor emails that get replies",
    details: [
      "Cold outreach templates tailored to your narrative",
      "Warm intro request scripts for your network",
      "Follow-up sequences for different scenarios",
      "Pitch meeting preparation guides",
      "Objection handling frameworks"
    ]
  },
  { 
    label: "VC Q&A Simulation", 
    value: "€500", 
    icon: Brain,
    description: "The tough questions VCs will ask—answered",
    details: [
      "50+ likely questions based on your profile",
      "Each question with VC rationale (why they ask)",
      "Suggested answer frameworks",
      "Red flag questions specific to your weaknesses",
      "Practice mode to prepare before real meetings"
    ]
  },
];

const TOTAL_VALUE = "€8,500+";

// Everything included
const FEATURES = [
  "Complete 8-dimension VC scorecard",
  "Investment thesis & IC meeting simulation",
  "Every red flag surfaced before your pitch",
  "23+ diagnostic tools (TAM, unit economics, competitor matrix...)",
  "Personalized 90-day action plan",
  "Market intelligence briefing for your sector",
  "800+ investor database with matching",
  "Outreach email generation",
  "VC Q&A practice mode",
  "Unlimited access to your analysis",
];

const Pricing = () => {
  const navigate = useNavigate();
  const [selectedValue, setSelectedValue] = useState<typeof VALUE_BREAKDOWN[0] | null>(null);
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Header />
      
      {/* Animated mesh gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 -right-1/4 w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Subtle grid pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 px-5 py-2 bg-primary/10 border-primary/20 text-primary backdrop-blur-sm">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              No BS Pricing
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">
              €8,500 in Value.
              <br />
              <span className="text-primary">€100. Done.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              What consultants charge €8,500+ for, UglyBaby delivers for a flat hundred. 
              No subscriptions. No hidden fees. One payment. Full access.
            </p>

            <Button 
              size="lg"
              onClick={() => navigate('/auth')}
              className="h-14 px-10 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              Get Started for €100
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </section>

        {/* Value Breakdown Section */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What You'd Pay a Consultant
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                What takes consultants weeks and costs thousands—UglyBaby delivers in minutes.
              </p>
            </div>

            {/* Glass card container */}
            <div className="relative group">
              {/* Animated border glow */}
              <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 rounded-3xl blur-sm opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative bg-card/40 backdrop-blur-2xl rounded-3xl p-8 md:p-10 shadow-2xl border border-border/50 overflow-hidden">
                {/* Top highlight */}
                <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-tl-3xl" />
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-secondary/10 to-transparent rounded-br-3xl" />

                <div className="relative grid md:grid-cols-2 gap-4">
                  {VALUE_BREAKDOWN.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button 
                        key={index}
                        onClick={() => setSelectedValue(item)}
                        className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/30 backdrop-blur-sm hover:bg-muted/50 hover:border-primary/30 transition-all cursor-pointer group text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">{item.label}</span>
                            <span className="text-xs text-muted-foreground">{item.description}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-success">{item.value}</span>
                          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Total value row */}
                <div className="relative mt-6 p-6 rounded-2xl bg-gradient-to-r from-success/10 via-success/5 to-success/10 border border-success/20">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-6 h-6 text-success" />
                      <span className="text-lg font-bold text-foreground">Total Consultant Value</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-bold text-success line-through opacity-60">{TOTAL_VALUE}</span>
                      <ArrowRight className="w-5 h-5 text-muted-foreground hidden md:block" />
                      <span className="text-4xl font-black text-primary">€100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything. No Upsells.
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                One price. Full platform. Every tool. UglyBaby doesn't nickel-and-dime you.
              </p>
            </div>

            {/* Features grid in glass card */}
            <div className="relative group">
              <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/20 via-transparent to-secondary/20 rounded-3xl opacity-50" />
              
              <div className="relative bg-card/30 backdrop-blur-xl rounded-3xl p-8 border border-border/50">
                <div className="grid sm:grid-cols-2 gap-4">
                  {FEATURES.map((feature, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-success" />
                      </div>
                      <span className="text-foreground/90">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Pitch Section */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-[40px] blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
              
              <div className="relative bg-card/50 backdrop-blur-2xl rounded-3xl p-10 md:p-14 border border-border/50 shadow-2xl">
                {/* Top highlight */}
                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                
                <Sparkles className="w-12 h-12 text-primary mx-auto mb-6 animate-pulse" />
                
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Stop Guessing.
                  <br />
                  <span className="text-primary">Start Knowing.</span>
                </h2>
                
                <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                  VCs have frameworks for evaluating you. Now you have access to those same frameworks—before you walk into the room.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg"
                    onClick={() => navigate('/auth')}
                    className="h-14 px-10 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Get the Analysis — €100
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/demo')}
                    className="h-14 px-8 rounded-2xl border-border/50 hover:bg-card/50 backdrop-blur-sm"
                  >
                    <Target className="w-5 h-5 mr-2" />
                    See Demo First
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-6">
                  Instant access • No subscription • One payment, full platform
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Questions?</h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "Why €100 and not some SaaS subscription?",
                  a: "Because UglyBaby respects your time and money. You pay once, you get everything. No monthly fees bleeding you dry while you're bootstrapping."
                },
                {
                  q: "What makes this worth €100?",
                  a: "It's the analysis VCs actually run on you—delivered before your pitch. Most founders spend €5k+ on pitch coaching that misses the mark. This is the framework that decides if you get funded."
                },
                {
                  q: "Can I try before I buy?",
                  a: "Yes. The demo shows exactly what you'll get, built on a fictional startup. Explore every tool, every insight, every score before you commit a cent."
                },
                {
                  q: "What if it's not what I expected?",
                  a: "The demo shows exactly what you'll get. Explore every tool, every insight, every score before you commit. No surprises."
                }
              ].map((faq, index) => (
                <div 
                  key={index}
                  className="p-6 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/30 hover:bg-card/50 transition-colors"
                >
                  <h3 className="font-bold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Value Detail Dialog */}
      <Dialog open={!!selectedValue} onOpenChange={(open) => !open && setSelectedValue(null)}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 bg-card/90 backdrop-blur-2xl border-border/50 overflow-hidden rounded-3xl shadow-2xl">
          {/* Background gradient orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-1/4 -left-1/4 w-[200px] h-[200px] bg-primary/10 rounded-full blur-[60px]" />
            <div className="absolute -bottom-1/4 -right-1/4 w-[200px] h-[200px] bg-secondary/10 rounded-full blur-[60px]" />
          </div>
          
          {selectedValue && (
            <div className="relative">
              {/* Header */}
              <DialogHeader className="px-6 pt-6 pb-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <selectedValue.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-xl font-bold text-foreground mb-1">
                      {selectedValue.label}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">{selectedValue.description}</p>
                  </div>
                  <Badge className="bg-success/10 text-success border-success/20 font-bold">
                    {selectedValue.value}
                  </Badge>
                </div>
              </DialogHeader>
              
              {/* Content */}
              <div className="px-6 pb-6">
                <div className="space-y-3">
                  {selectedValue.details.map((detail, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/30"
                    >
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm text-foreground/90">{detail}</span>
                    </div>
                  ))}
                </div>
                
                {/* CTA */}
                <div className="mt-6 pt-4 border-t border-border/30">
                  <Button 
                    onClick={() => {
                      setSelectedValue(null);
                      navigate('/auth');
                    }}
                    className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/25"
                  >
                    Get All This for €100
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Pricing;
