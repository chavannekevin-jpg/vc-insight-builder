import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ModernCard } from "@/components/ModernCard";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Zap,
  Target,
  Users,
  TrendingUp,
  FileText,
  Rocket
} from "lucide-react";

export default function PreSeedGuide() {
  const navigate = useNavigate();

  const deckSlides = [
    { number: 1, title: "Executive Summary", description: "Clear 2 to 3 sentence pitch." },
    { number: 2, title: "Problem", description: "A real, urgent, and focused pain." },
    { number: 3, title: "Solution", description: "How you're approaching it, what's different, and why now." },
    { number: 4, title: "Product", description: "Even a prototype or Notion demo works." },
    { number: 5, title: "Market", description: "Who's this for, why they care, and how big it can get." },
    { number: 6, title: "Go to Market", description: "What you've tried and what's next." },
    { number: 7, title: "Team", description: "Who's building this and relevant backgrounds." },
    { number: 8, title: "Vision", description: "Clear direction. Not a side project." },
    { number: 9, title: "Ask", description: "" }
  ];

  const goodSignals = [
    "10–15 interviews with quotes and a simple cost‑of‑pain estimate.",
    "Prototype demo with a short flow; ≥60% complete the key steps.",
    "Waitlist or beta signups with source tags; basic funnel math (visit→signup→demo).",
    "Two GTM tests with results (e.g., CTR, reply, demo rates) and next step."
  ];

  const rejectionReasons = [
    "Generic problem statements",
    "Solutions in search of a problem",
    "Market slides with made-up TAMs",
    "Slides overloaded with filler",
    "No clear ask or plan for the next 12 months"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 gradient-hero -z-10" />
        <div className="absolute top-20 left-10 w-96 h-96 bg-destructive/5 rounded-full blur-3xl animate-pulse opacity-50" />
        
        <div className="max-w-7xl mx-auto px-8 py-20">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/hub")}
            className="mb-8 hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
          
          <div className="max-w-4xl space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                Pre-Seed Decks:<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-destructive">
                  Stop the Theater
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl">
                At pre-seed, you're not proving scale. You're proving there's something real to build—and that you're the team to build it.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-8 py-20 space-y-16">
        
        {/* What Pre-Seed Is For */}
        <section>
          <ModernCard className="p-8 border-primary/30">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/30">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-3">What Pre-Seed Is Actually For</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  At pre‑seed you win with <span className="text-foreground font-semibold">insight</span> and <span className="text-foreground font-semibold">evidence you can move fast</span>. Show you understand a specific user pain and can test your way to product truth.
                </p>
              </div>
            </div>
            
            <div className="pl-4 border-l-4 border-primary/30 space-y-4 mt-6">
              <p className="text-muted-foreground leading-relaxed">
                <span className="text-foreground font-semibold">Useful signals now:</span> 10–15 user interviews across 2–3 clear segments surfacing the same top‑2 pains; a prototype or scripted demo; one or two acquisition experiments with basic conversion math.
              </p>
              <p className="text-foreground font-medium text-lg">
                You are not proving scale. You are proving there is something real to build and that you are the right team to build it.
              </p>
            </div>
          </ModernCard>
        </section>

        {/* Slides You Actually Need */}
        <section>
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-3">Slides You Actually Need</h2>
            <p className="text-lg text-muted-foreground">
              At pre-seed, the goal is to show vision, thought process, and momentum. Here's what matters:
            </p>
          </div>
          
          <div className="grid gap-4">
            {deckSlides.map((slide, index) => (
              <ModernCard 
                key={index} 
                className="p-6 hover:border-primary/40 transition-all duration-300"
                hover
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                    <span className="text-primary-foreground font-bold text-xl">{slide.number}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{slide.title}</h3>
                    {slide.description && (
                      <p className="text-muted-foreground">{slide.description}</p>
                    )}
                  </div>
                </div>
              </ModernCard>
            ))}
          </div>
        </section>

        {/* What Good Looks Like */}
        <section>
          <ModernCard className="p-8 border-success/30 bg-success/5">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-success/20 border border-success/40">
                <CheckCircle2 className="w-7 h-7 text-success" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-3">What Good Looks Like</h2>
                <p className="text-lg text-muted-foreground">
                  These are the signals that reduce investor doubt:
                </p>
              </div>
            </div>
            
            <div className="space-y-4 mt-6">
              {goodSignals.map((signal, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg bg-background/60 border border-success/20 hover:bg-background/80 transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-foreground leading-relaxed">{signal}</p>
                </div>
              ))}
            </div>
          </ModernCard>
        </section>

        {/* What Investors Reject */}
        <section>
          <ModernCard className="p-8 border-destructive/30 bg-destructive/5">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-destructive/20 border border-destructive/40">
                <XCircle className="w-7 h-7 text-destructive" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-3">What Investors Reject at Pre-Seed</h2>
                <p className="text-lg text-muted-foreground">
                  These are the red flags that kill your chances:
                </p>
              </div>
            </div>
            
            <div className="space-y-3 mt-6">
              {rejectionReasons.map((reason, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg bg-background/60 border border-destructive/20 hover:bg-background/80 transition-colors"
                >
                  <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-foreground leading-relaxed">{reason}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-6 bg-background/80 rounded-xl border border-destructive/20">
              <p className="text-foreground text-lg font-medium leading-relaxed">
                Investors know the risk. Your job is to reduce doubt by showing <span className="text-destructive font-bold">real thinking</span>, not deck theater.
              </p>
            </div>
          </ModernCard>
        </section>

        {/* CTA */}
        <section className="text-center">
          <ModernCard className="p-10">
            <div className="space-y-6">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-primary shadow-lg">
                <Rocket className="w-10 h-10 text-primary-foreground" />
              </div>
              <h3 className="text-3xl font-bold">Ready to Build Your Deck?</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Use our VC Memo tool to validate your thinking and identify gaps before you pitch.
              </p>
              <div className="flex gap-4 justify-center pt-4">
                <Button 
                  size="lg"
                  className="gradient-primary shadow-glow hover-neon-pulse font-bold"
                  onClick={() => navigate("/hub")}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Go to Hub
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-primary/30 hover:bg-primary/10"
                  onClick={() => navigate("/portal")}
                >
                  Get Full Access
                </Button>
              </div>
            </div>
          </ModernCard>
        </section>

      </div>
    </div>
  );
}
