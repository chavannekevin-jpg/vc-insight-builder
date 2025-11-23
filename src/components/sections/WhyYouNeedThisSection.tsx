import { ModernCard } from "../ModernCard";
import { Target, Brain, Shield, TrendingUp, AlertTriangle, Zap } from "lucide-react";

export const WhyYouNeedThisSection = () => {
  const benefits = [
    {
      icon: Target,
      title: "The Exact Structure VCs Use",
      description: "Stop guessing. Get the framework investors actually use to judge your company."
    },
    {
      icon: Brain,
      title: "Sharpen Your Narrative",
      description: "Transform your pitch from founder rambling to investor-grade storytelling."
    },
    {
      icon: Shield,
      title: "Blueprint for Everything",
      description: "Your memo becomes the foundation for your deck, pitch, and entire fundraising story."
    },
    {
      icon: AlertTriangle,
      title: "Expose Weaknesses Early",
      description: "Find and fix the holes in your model before a VC finds them for you."
    },
    {
      icon: TrendingUp,
      title: "Get Taken Seriously",
      description: "Speak the VC language from slide one. Stop sounding like an amateur."
    },
    {
      icon: Zap,
      title: "Replace Guesswork with Clarity",
      description: "Build with investor-grade thinking instead of hoping your story makes sense."
    }
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 gradient-hero -z-10" />
      
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Why You Actually Need This Memo
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-foreground leading-relaxed mb-4 font-semibold">
              Most founders have no idea how investors actually evaluate their startup. They build pitch decks in the dark, hope the story makes sense, and get rejected without understanding why.
            </p>
            <p className="text-lg text-foreground leading-relaxed font-semibold">
              A proper Investment Memorandum forces clarity. It organizes your thinking the same way a VC analyzes companies — <span className="text-primary font-bold">market, traction, economics, defensibility, strategy, risks, and narrative</span>. When you build your memo, you're literally building the backbone of your pitch.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <ModernCard key={index} hover className="animate-slide-up">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg gradient-accent flex items-center justify-center border-2 border-primary/30 shadow-md">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-base">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>
              </ModernCard>
            );
          })}
        </div>

        <div className="max-w-4xl mx-auto">
          <ModernCard className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/30 shadow-xl">
            <div className="text-center space-y-4 p-4">
              <h3 className="text-2xl font-serif font-bold text-foreground">
                Follow the Memo. Score Higher. Get Funded.
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                If you use this memo as the foundation for your deck and pitch, you'll instantly score higher with investors because <span className="font-bold text-foreground">you're speaking the VC language from slide one</span>. No more guessing what they want to see. No more generic founder pitches that get ignored.
              </p>
              <div className="pt-2">
                <p className="text-sm font-bold text-primary">
                  → This is the difference between sounding like a founder and sounding like an investment.
                </p>
              </div>
            </div>
          </ModernCard>
        </div>
      </div>
    </section>
  );
};
