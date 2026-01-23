import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Book, TrendingUp, AlertTriangle, Wrench, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VCBrainHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain");
        return;
      }
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const sections = [
    {
      icon: TrendingUp,
      title: "Stage Guides",
      description: "Angel, Pre-Seed, Seed—what VCs actually expect at each stage",
      path: "/vcbrain/angel",
    },
    {
      icon: Book,
      title: "Pitch Deck Library",
      description: "Every slide, dissected. Good examples, bad examples, what investors really look for.",
      path: "/vcbrain/deck/problem",
    },
    {
      icon: AlertTriangle,
      title: "Tactical Guides",
      description: "What angels want, fake TAMs, building demos that sell—real advice, no fluff.",
      path: "/vcbrain/guides/angels",
    },
    {
      icon: Wrench,
      title: "Tools & Resources",
      description: "Checklists, scorecards, glossaries—everything you need to self-assess.",
      path: "/vcbrain/tools/glossary",
    },
  ];

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4 py-12">
        <h1 className="text-5xl font-bold text-foreground">
          Welcome to the VC Brain
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          This isn't motivational garbage. It's the unfiltered truth about how venture capital actually works. 
          Everything here is designed to make you think like an investor—so you can raise like a pro.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <button
            key={section.title}
            onClick={() => navigate(section.path)}
            className="bg-card/60 backdrop-blur-xl border border-border/40 rounded-2xl p-6 text-left hover:border-primary/30 hover:bg-card/80 hover:shadow-[0_20px_50px_-12px_hsl(var(--primary)/0.2)] transition-all group"
          >
            <section.icon className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
              {section.title}
            </h3>
            <p className="text-muted-foreground mb-4">{section.description}</p>
            <div className="flex items-center text-primary font-semibold text-sm">
              Explore <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>

      <div className="bg-card/60 backdrop-blur-2xl border border-primary/20 rounded-2xl p-8 text-center space-y-4 shadow-[0_20px_50px_-12px_hsl(var(--primary)/0.15)]">
        <h2 className="text-3xl font-bold text-foreground">
          Stop Learning. Start Executing.
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          You've read enough articles. The VC Analysis gives you the exact framework 
          VCs use to evaluate your startup. Every section. Every metric. Every red flag.
        </p>
        <Button 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl"
          onClick={() => navigate('/pricing')}
        >
          Get Your VC Analysis
        </Button>
        <p className="text-xs text-muted-foreground">
          If this feels overwhelming, that's because fundraising is hard. The analysis makes it clear.
        </p>
      </div>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">How to Use This Hub</h2>
        <p>
          This isn't a blog. It's not "content marketing." It's a structured roadmap to thinking like an investor. 
          Here's how to approach it:
        </p>
        <ol className="space-y-3 my-4">
          <li>
            <strong>Start with your stage.</strong> Don't skip ahead. If you're pre-revenue, you're not ready for 
            the Seed stage guide. Start with Angel.
          </li>
          <li>
            <strong>Read the Pitch Deck Library.</strong> Every slide matters. Every slide has traps. Learn them now.
          </li>
          <li>
            <strong>Use the tools.</strong> Checklists, scorecards, red flag databases—these aren't optional. 
            They're how you avoid wasting months.
          </li>
          <li>
            <strong>Get the analysis.</strong> Everything here is free, but it's incomplete. The VC Analysis 
            is the full framework. It's how you actually prepare.
          </li>
        </ol>
      </div>
    </div>
  );
}
