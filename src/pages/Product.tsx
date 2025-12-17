import { Header } from "@/components/Header";
import { Footer } from "@/components/sections/Footer";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  Users,
  BarChart3,
  MessageSquare,
  Zap,
  Presentation,
  Mic,
  FolderOpen,
  Calculator
} from "lucide-react";

const Product = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FileText,
      title: "Investment Analysis",
      description: "Generate a professional, VC-grade investment analysis that presents your startup through an investor lens."
    },
    {
      icon: Target,
      title: "Built by VCs, For Founders",
      description: "We're active early-stage investors who've codified our evaluation framework from pre-seed to Series A deals worldwide."
    },
    {
      icon: MessageSquare,
      title: "Diagnostic Feedback",
      description: "Receive critical questions VCs would ask and identify weaknesses in your business model."
    },
    {
      icon: Lightbulb,
      title: "Strategic Insights",
      description: "Get actionable recommendations to strengthen your narrative and improve your investment model."
    },
    {
      icon: Users,
      title: "Investor Network Access",
      description: "Optional showcase to 100+ global investors once your analysis is complete."
    },
    {
      icon: BarChart3,
      title: "Performance Metrics",
      description: "Understand which metrics matter most and how to position your traction effectively."
    }
  ];

  const futureFeatures = [
    { icon: Presentation, title: "Pitch Deck Generator", status: "Coming Soon", color: "blue" as const },
    { icon: Mic, title: "Pitch Script Writer", status: "Coming Soon", color: "purple" as const },
    { icon: FolderOpen, title: "Data Room Builder", status: "Coming Soon", color: "green" as const },
    { icon: Calculator, title: "Financial Model Templates", status: "Coming Soon", color: "pink" as const }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header />

      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 gradient-hero -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-6xl mx-auto text-center relative">
          <div className="animate-fade-in">
            <Badge 
              variant="secondary" 
              className="mb-6 px-6 py-2 text-sm font-bold border-2 border-primary/30 bg-primary/10 shadow-glow backdrop-blur-sm text-foreground"
            >
              <Zap className="w-3 h-3 mr-2 inline-block text-primary" />
              Built by Active Early-Stage VCs
            </Badge>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 animate-fade-in bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">
            The Investment Analysis
          </h1>
          
          <p className="text-xl md:text-2xl text-foreground/80 max-w-4xl mx-auto mb-10 leading-relaxed animate-fade-in font-medium">
            Built from 10+ years of VC experience and hundreds of real deals, we've transformed our 
            cognitive work into a structured framework that helps you present your startup the way investors need to see it.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-12 animate-fade-in">
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-card/80 border border-primary/20 backdrop-blur-sm shadow-lg">
              <div className="p-1.5 rounded-lg bg-primary/20">
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">Active VCs</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-card/80 border border-primary/20 backdrop-blur-sm shadow-lg">
              <div className="p-1.5 rounded-lg bg-primary/20">
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">Early-Stage Specialists</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-card/80 border border-primary/20 backdrop-blur-sm shadow-lg">
              <div className="p-1.5 rounded-lg bg-primary/20">
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">100+ Global Investor Network</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button 
              size="lg"
              onClick={() => navigate('/')}
              className="gradient-primary hover-neon-pulse text-lg px-8 py-6 font-bold shadow-glow"
            >
              Get Started →
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/about')}
              className="text-lg px-8 py-6 font-semibold border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-xl mb-6">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Your Complete Package</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              What You Get
            </h2>
            <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto font-medium">
              A comprehensive toolkit to transform your fundraising approach
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <ModernCard key={index} hover>
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </ModernCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-xl mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Simple Process</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto font-medium">
              Four simple steps to your professional investment analysis
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Answer Questions", desc: "Complete our structured questionnaire about your startup" },
              { step: "02", title: "Expert Framework", desc: "Your data is processed through our VC-calibrated framework built from 10+ years of experience" },
              { step: "03", title: "Review Output", desc: "Receive your analysis with diagnostic feedback" },
              { step: "04", title: "Refine & Use", desc: "Iterate based on insights and present to investors" }
            ].map((item, index) => (
              <ModernCard key={index} hover>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">{item.step}</span>
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </ModernCard>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-xl mb-6">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Key Benefits</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Why It Matters
            </h2>
          </div>

          <ModernCard className="shadow-xl">
            <div className="space-y-6">
              {[
                { icon: Zap, title: "Stop Getting Rejected Without Clarity", desc: "Understand exactly why VCs say no and how to fix it" },
                { icon: Target, title: "Speak the VC Language", desc: "Present your startup the way investors need to see it" },
                { icon: TrendingUp, title: "Build the Right Model", desc: "Focus on metrics and milestones that actually matter" },
                { icon: CheckCircle2, title: "Save Time & Money", desc: "Avoid costly mistakes and wasted pitches" }
              ].map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ModernCard>
        </div>
      </section>

      {/* Future Products */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-xl mb-6">
              <Lightbulb className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Future Features</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Coming Soon
            </h2>
            <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto font-medium">
              More tools to support your fundraising journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {futureFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <ModernCard key={index} hover className="text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl gradient-accent flex items-center justify-center shadow-glow group-hover:shadow-glow-strong transition-all duration-300 group-hover:scale-110">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-bold text-base text-foreground">{feature.title}</h3>
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-3 py-1 bg-primary/10 text-primary border border-primary/30"
                    >
                      {feature.status}
                    </Badge>
                  </div>
                </ModernCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <ModernCard className="shadow-xl">
            <div className="space-y-6 py-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-xl mb-6">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Take Action</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Ready to Get Started?
              </h2>
              <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
                Join founders who are transforming their fundraising with frameworks built by active VCs who deploy capital at pre-seed and seed stage.
              </p>
              <div className="flex items-center justify-center gap-6 py-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Active Investors</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Early-Stage Focus</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Real Deal Experience</span>
                </div>
              </div>
              <Button 
                size="lg"
                onClick={() => navigate('/')}
                className="gradient-primary px-8"
              >
                Create Your Analysis
              </Button>
            </div>
          </ModernCard>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Product;
