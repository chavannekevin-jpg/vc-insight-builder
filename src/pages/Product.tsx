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
  Zap
} from "lucide-react";

const Product = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FileText,
      title: "Investment Memorandum",
      description: "Generate a professional, VC-grade investment memorandum that presents your startup through an investor lens."
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
      description: "Optional showcase to 100+ global investors once your memorandum is complete."
    },
    {
      icon: BarChart3,
      title: "Performance Metrics",
      description: "Understand which metrics matter most and how to position your traction effectively."
    }
  ];

  const futureFeatures = [
    { icon: "📊", title: "Pitch Deck Generator", status: "Coming Soon" },
    { icon: "🎤", title: "Pitch Script Writer", status: "Coming Soon" },
    { icon: "📁", title: "Data Room Builder", status: "Coming Soon" },
    { icon: "📈", title: "Financial Model Templates", status: "Coming Soon" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5">
            Built by Active Early-Stage VCs
          </Badge>
          <h1 className="text-5xl md:text-6xl font-serif mb-6">
            The Investment Memorandum
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Built from 10+ years of VC experience and hundreds of real deals, we've transformed our 
            cognitive work into a structured framework that helps you present your startup the way investors need to see it.
          </p>
          <div className="flex items-center justify-center gap-6 mb-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Active VCs</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Early-Stage Specialists</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>100+ European Investor Network</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/')}
              className="gradient-primary"
            >
              Get Started
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/about')}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif mb-4">What You Get</h2>
            <p className="text-lg text-muted-foreground">
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
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Four simple steps to your professional investment memorandum
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Answer Questions", desc: "Complete our structured questionnaire about your startup" },
              { step: "02", title: "Expert Framework", desc: "Your data is processed through our VC-calibrated framework built from 10+ years of experience" },
              { step: "03", title: "Review Output", desc: "Receive your memorandum with diagnostic feedback" },
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
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif mb-4">Why It Matters</h2>
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
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif mb-4">Coming Soon</h2>
            <p className="text-lg text-muted-foreground">
              More tools to support your fundraising journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {futureFeatures.map((feature, index) => (
              <ModernCard key={index} className="text-center">
                <div className="space-y-3">
                  <div className="text-4xl">{feature.icon}</div>
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {feature.status}
                  </Badge>
                </div>
              </ModernCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <ModernCard className="shadow-xl">
            <div className="space-y-6 py-8">
              <h2 className="text-3xl font-serif">Ready to Get Started?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
                Create Your Memorandum
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
