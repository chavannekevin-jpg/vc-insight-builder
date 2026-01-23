import { Header } from "@/components/Header";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Calculator, 
  TrendingUp, 
  ArrowRight, 
  Lock, 
  Sparkles, 
  Zap, 
  Mail, 
  Flame, 
  FlaskConical,
  FileSearch,
  Users,
  Telescope,
  Brain
} from "lucide-react";

export default function ToolsHub() {
  const navigate = useNavigate();

  const freeTools = [
    {
      name: "Raise Calculator",
      description: "Calculate exactly how much cash you need before you run out of runway—because \"we'll figure it out\" isn't a strategy.",
      icon: Calculator,
      path: "/raise-calculator",
      color: "primary"
    },
    {
      name: "Valuation Calculator",
      description: "Find out what your startup is actually worth. Not your inflated dreams, not your competitor's fake valuation. Real numbers.",
      icon: TrendingUp,
      path: "/valuation-calculator",
      color: "secondary"
    },
    {
      name: "Venture Scale Diagnostic",
      description: "Think you're VC-scale? This brutal reality check will tell you if you're building a unicorn or just another lifestyle business.",
      icon: Zap,
      path: "/venture-scale-diagnostic",
      color: "primary"
    }
  ];

  const premiumTools = [
    {
      name: "8-Dimension Investment Audit",
      description: "The exact analysis VCs run behind closed doors—scores across Team, Market, Product, Traction, and 4 more dimensions.",
      icon: FileSearch
    },
    {
      name: "23+ Strategic Tools",
      description: "TAM calculators, moat assessments, unit economics models, competitive matrices—all auto-populated with your data.",
      icon: Brain
    },
    {
      name: "Market Intelligence",
      description: "50+ industry reports synthesized into a personalized briefing. Tailwinds, headwinds, and funding trends for your sector.",
      icon: Telescope
    },
    {
      name: "800+ Investor Database",
      description: "AI-powered matching scores each fund by stage, sector, and thesis fit. No more spray-and-pray outreach.",
      icon: Users
    },
    {
      name: "Outreach Lab",
      description: "Generate personalized investor emails that don't sound like a robot wrote them. Context-aware, not inbox spam.",
      icon: Mail
    },
    {
      name: "Roast Your Baby",
      description: "Survive brutal VC questions in a live-fire simulation. Practice the tough questions before they cost you the deal.",
      icon: Flame
    },
    {
      name: "Dilution Lab",
      description: "Build your cap table, simulate funding rounds with SAFE/CLA/Equity, and watch your ownership evolve in real-time.",
      icon: FlaskConical
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Header />
      
      {/* Fixed animated mesh gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 -right-1/4 w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Subtle grid pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 pt-8">
          <Badge className="mb-6 px-5 py-2 bg-primary/10 border-primary/20 text-primary backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5 mr-1.5" />
            Founder Tools
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
              Stop
            </span>{" "}
            <span className="text-primary" style={{ textShadow: '0 0 30px hsl(var(--primary) / 0.5)' }}>
              Guessing
            </span>
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
              . Start Calculating.
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The tools VCs wish you'd use before wasting their time.{" "}
            <span className="text-primary font-semibold">Brutal, and better than your napkin math.</span>
          </p>
        </div>

        {/* Standalone Tools */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="text-primary">Your Reality Check Toolkit</span>
            <Badge variant="outline" className="border-primary/30 text-primary">Try Now</Badge>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {freeTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div 
                  key={tool.name}
                  className="group relative rounded-2xl p-6 bg-card/40 backdrop-blur-sm border border-border/30 hover:border-primary/40 hover:bg-card/60 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10 space-y-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center group-hover:scale-105 group-hover:border-primary/40 transition-all duration-300">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                    <Button 
                      onClick={() => navigate(tool.path)}
                      className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/20"
                    >
                      Use Tool
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* The Full Platform */}
        <div className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-3 flex items-center gap-3">
              <span className="text-foreground">The Full Investment Audit</span>
              <Badge className="bg-primary/20 text-primary border-primary/40">Full Platform</Badge>
            </h2>
            <p className="text-muted-foreground max-w-3xl">
              Most founders fail not from bad ideas, but from not understanding how VCs evaluate deals. 
              UglyBaby runs the same methodology VCs use internally—so you can build an investment case that actually resonates.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {premiumTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div 
                  key={tool.name}
                  className="group p-5 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/30 hover:border-primary/30 hover:bg-card/50 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-[40px] blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
          
          <div className="relative bg-card/50 backdrop-blur-2xl rounded-3xl p-10 md:p-14 border border-border/50 shadow-2xl">
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto shadow-lg shadow-primary/30">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Done Playing with{" "}
                  <span className="text-primary" style={{ textShadow: '0 0 20px hsl(var(--primary) / 0.4)' }}>
                    Calculators
                  </span>?
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                  These tools get you started. But VCs don't invest in spreadsheets—they invest in{" "}
                  <span className="text-primary font-semibold">VC-grade cases</span>. 
                  Get the full investment audit, 23+ diagnostic tools, and access to 800+ investors.
                </p>
              </div>
              <Button 
                size="lg"
                onClick={() => navigate('/pricing')}
                className="h-14 px-10 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                Get Your Full Audit
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-xs text-muted-foreground">
                One payment • Full platform access • No subscription
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
