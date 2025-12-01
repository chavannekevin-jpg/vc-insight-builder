import { Header } from "@/components/Header";
import { Footer } from "@/components/sections/Footer";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calculator, TrendingUp, ArrowRight, Lock, Sparkles } from "lucide-react";

export default function ToolsHub() {
  const navigate = useNavigate();

  const tools = [
    {
      name: "Raise Calculator",
      description: "Calculate exactly how much you need to raise based on your burn rate, milestones, and market risk factors.",
      icon: Calculator,
      path: "/raise-calculator",
      available: true,
      color: "primary"
    },
    {
      name: "Valuation Calculator",
      description: "Estimate your pre-money valuation using industry benchmarks and comparable company analysis.",
      icon: TrendingUp,
      path: "/valuation-calculator",
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
            Your Fundraising <span className="text-primary">Toolkit</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Practical tools to plan your raise, understand your valuation, and prepare for investor conversations.
          </p>
        </div>

        {/* Available Tools */}
        <div className="mb-16">
          <h2 className="text-2xl font-serif mb-6">Available Now</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <ModernCard key={tool.name} className="hover:shadow-glow transition-all duration-300">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl gradient-${tool.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-serif mb-2">{tool.name}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => navigate(tool.path)}
                      className="w-full"
                      variant="outline"
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
          <h2 className="text-2xl font-serif mb-6">Coming Soon</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {comingSoon.map((tool) => {
              const Icon = tool.icon;
              return (
                <ModernCard key={tool.name} className="opacity-60">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
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
        <ModernCard className="border-2 border-primary/30 shadow-glow">
          <div className="text-center space-y-6 py-8">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-serif mb-4">Ready to Build Your Investment Memo?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Tools are helpful, but investors want to see the complete picture. 
                Generate your personalized investment memorandum and speak the language VCs understand.
              </p>
            </div>
            <Button 
              size="lg"
              className="gradient-primary shadow-glow hover:shadow-glow-strong"
              onClick={() => navigate('/pricing')}
            >
              Get Your Investment Memo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </ModernCard>
      </div>
      
      <Footer />
    </div>
  );
}
