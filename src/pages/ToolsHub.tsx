import { Header } from "@/components/Header";
import { Footer } from "@/components/sections/Footer";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calculator, TrendingUp, ArrowRight, Lock, Sparkles, Zap, Mail } from "lucide-react";

export default function ToolsHub() {
  const navigate = useNavigate();

  const tools = [
    {
      name: "Raise Calculator",
      description: "Stop guessing. Calculate exactly how much cash you need before you run out of runway—because \"we'll figure it out\" isn't a strategy.",
      icon: Calculator,
      path: "/raise-calculator",
      available: true,
      color: "primary"
    },
    {
      name: "Valuation Calculator",
      description: "Find out what your startup is actually worth. Not your inflated dreams, not your competitor's fake valuation. Real numbers.",
      icon: TrendingUp,
      path: "/valuation-calculator",
      available: true,
      color: "secondary"
    },
    {
      name: "Venture Scale Diagnostic",
      description: "Think you're VC-scale? This brutal reality check will tell you if you're building a unicorn or just another lifestyle business.",
      icon: Zap,
      path: "/venture-scale-diagnostic",
      available: true,
      color: "primary"
    },
    {
      name: "Outreach Lab",
      description: "Cold email templates that don't sound like a robot wrote them. Requires your memo—because context matters more than your inbox spam tactics.",
      icon: Mail,
      path: "/investor-email-generator",
      available: true,
      color: "secondary"
    }
  ];

  const comingSoon = [
    {
      name: "Cap Table Simulator",
      description: "Model dilution scenarios across multiple funding rounds",
      icon: Lock
    },
    {
      name: "Pitch Deck Analyzer",
      description: "AI-powered feedback on your investor presentation",
      icon: Lock
    },
    {
      name: "Market Size Validator",
      description: "Verify your TAM/SAM/SOM calculations with real data",
      icon: Lock
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-serif mb-6">
            Stop <span className="neon-pink">Guessing</span>. Start Calculating.
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The tools VCs wish you'd use before wasting their time. <span className="text-primary font-semibold">Free, brutal, and better than your napkin math.</span>
          </p>
        </div>

        {/* Available Tools */}
        <div className="mb-16">
          <h2 className="text-2xl font-serif mb-6 text-neon">Your Reality Check Toolkit</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <ModernCard 
                  key={tool.name} 
                  className="hover:shadow-glow hover:border-primary/60 transition-all duration-300 group"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl gradient-${tool.color} flex items-center justify-center flex-shrink-0 shadow-glow group-hover:shadow-glow-strong transition-all duration-300`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-serif mb-2 group-hover:text-primary transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => navigate(tool.path)}
                      className="w-full gradient-primary shadow-glow hover:shadow-glow-strong border-0"
                    >
                      Use Tool
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </ModernCard>
              );
            })}
          </div>
        </div>

        {/* Coming Soon */}
        <div className="mb-16">
          <h2 className="text-2xl font-serif mb-6 text-muted-foreground">Coming Soon</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {comingSoon.map((tool) => {
              const Icon = tool.icon;
              return (
                <ModernCard key={tool.name} className="opacity-50 hover:opacity-70 transition-opacity">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted/50 border border-border flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-lg font-serif mb-1">{tool.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </ModernCard>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <ModernCard className="border-2 border-primary/40 shadow-glow hover:shadow-glow-strong transition-all duration-300">
          <div className="text-center space-y-6 py-8">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto shadow-glow pulse-glow">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-serif mb-4">
                Done Playing with <span className="text-neon">Calculators</span>?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                These tools get you started. But VCs don't invest in spreadsheets—they invest in <span className="text-primary font-semibold">stories</span>. 
                Build the investment memo that makes them say "tell me more" instead of "next."
              </p>
            </div>
            <Button 
              size="lg"
              className="gradient-primary shadow-glow hover:shadow-glow-strong border-0 text-lg px-8"
              onClick={() => navigate('/pricing')}
            >
              Get Your Investment Memo
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </ModernCard>
      </div>
      
      <Footer />
    </div>
  );
}
