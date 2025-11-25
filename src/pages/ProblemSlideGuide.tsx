import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Target,
  TrendingUp,
  MessageSquare,
  DollarSign,
  Zap,
  Quote,
  Sparkles
} from "lucide-react";

export default function ProblemSlideGuide() {
  const navigate = useNavigate();

  const investorCriteria = [
    {
      icon: Target,
      title: "Crystal Clear Problem",
      description: "Can you say it in 10 words? If an investor needs to re-read your problem statement, you've already lost them. Simplicity wins. Complexity kills."
    },
    {
      icon: Zap,
      title: "Urgent Timing",
      description: "Something just changed. The market shifted. Tech enabled it. Behavior evolved. Without urgency, you're pitching a solution to yesterday's problem."
    },
    {
      icon: MessageSquare,
      title: "Real Evidence",
      description: "Stop telling. Start showing. Numbers, quotes, case studies—anything that proves this isn't just your theory. Evidence separates founders from dreamers."
    },
    {
      icon: DollarSign,
      title: "Expensive Pain",
      description: "How much does inaction cost? Time? Money? Growth? Make the pain quantifiable. If it's not expensive enough to fix, it's not worth building a company around."
    }
  ];

  const mistakes = [
    {
      title: "Vague Bullshit",
      bad: "\"Hiring is hard\"",
      why: "Hard for who? Small businesses? Fortune 500s? Engineers? Baristas? Generic statements make investors tune out instantly."
    },
    {
      title: "Marketing Speak",
      bad: "\"Everyone wants this\" or \"Revolutionary disruption\"",
      why: "Buzzwords and hype don't replace data. Show proof or expect skepticism."
    },
    {
      title: "Insider Language",
      bad: "\"Leveraging ML pipelines for cross-functional synergy\"",
      why: "Your mom should understand your problem slide. If she can't, neither can most investors. Speak human."
    },
    {
      title: "Kitchen Sink Syndrome",
      bad: "Eight different problems across three slides",
      why: "Pick ONE painful problem. Master it. Everything else is noise that dilutes your message and confuses your story."
    }
  ];

  const bestPractices = [
    "Make timing obvious — What changed? Why does this problem hurt more today than last year? Urgency creates value.",
    "Let customers speak — One real quote beats ten slides of your interpretation. Authenticity can't be faked.",
    "One problem, obsessively — Multi-problem decks signal unfocused founders. Pick your battle. Own it completely.",
    "Trigger recognition — When investors think 'damn, that IS painful,' you've won. That's the only reaction that matters."
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5 -z-10" />
        <div className="absolute top-20 right-10 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl opacity-30" />
        
        <div className="max-w-6xl mx-auto px-8 py-24 relative">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/pre-seed-guide")}
            className="mb-12 hover:bg-primary/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pre-Seed Guide
          </Button>
          
          <div className="max-w-4xl space-y-10">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-primary/10 rounded-full border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Slide #2 Deep Dive</span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                Building a Great<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-primary/70">
                  Problem Slide
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl font-light">
                This is where 80% of founders lose the room. If investors don't instantly feel the pain you're describing, nothing else in your deck matters. Period.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-8 py-24 space-y-24">
        
        {/* What Is The Problem Slide */}
        <section>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl blur-2xl opacity-50" />
            
            <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-10 shadow-xl">
              <div className="flex items-start gap-6 mb-8">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                  <AlertTriangle className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-4xl font-bold mb-4">What Is the Problem Slide?</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    Strip away the bullshit. Your problem slide answers one question:
                  </p>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/20">
                    <p className="text-2xl font-bold text-foreground leading-relaxed">
                      Is this pain expensive enough that someone will actually pay to make it go away?
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mt-10">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Name the enemy</h3>
                  <p className="text-muted-foreground leading-relaxed">One sentence. No buzzwords. No abstractions. If a 10-year-old can't understand it, rewrite it.</p>
                </div>
                
                <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Prove why now</h3>
                  <p className="text-muted-foreground leading-relaxed">Markets shift. Tech enables. Behavior changes. Show what's different today that wasn't possible or urgent 18 months ago.</p>
                </div>
                
                <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Show receipts</h3>
                  <p className="text-muted-foreground leading-relaxed">Data. Quotes. Examples. Anything that proves this problem exists outside your head. Opinions don't fund companies. Evidence does.</p>
                </div>
                
                <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Quantify the damage</h3>
                  <p className="text-muted-foreground leading-relaxed">Put a dollar sign or time cost on the pain. Lost revenue. Wasted hours. Failed conversions. Make it feel expensive.</p>
                </div>
              </div>

              <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-destructive/10 via-destructive/5 to-transparent border border-destructive/20">
                <p className="text-foreground leading-relaxed text-lg">
                  Stop selling vision. Start selling pain. This isn't about what could be. <span className="text-destructive font-bold">It's about what's broken right now.</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What Investors Look For */}
        <section>
          <div className="mb-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What Investors Actually Check</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Forget the fluff. Here's what they're really looking for:
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {investorCriteria.map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={index} 
                  className="group relative"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative p-8 rounded-3xl bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 h-full">
                    <div className="flex items-start gap-5 mb-4">
                      <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-primary mb-2">#{index + 1}</div>
                        <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-lg">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent border border-destructive/20 text-center">
            <p className="text-foreground font-semibold text-xl leading-relaxed">
              Miss even ONE of these? <span className="text-destructive font-bold">Your deck gets archived.</span> Investors see hundreds of decks. They're looking for reasons to say no.
            </p>
          </div>
        </section>

        {/* Good vs Bad Examples */}
        <section>
          <div className="mb-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Real vs. Bullshit</h2>
            <p className="text-xl text-muted-foreground">The difference between getting funded and getting ghosted</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Good Example */}
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-br from-success/20 to-success/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-8 rounded-3xl bg-gradient-to-br from-success/10 to-success/5 border border-success/30 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-2xl bg-success/20 border border-success/40">
                    <CheckCircle2 className="w-7 h-7 text-success" />
                  </div>
                  <h3 className="text-2xl font-bold text-success">What Works</h3>
                </div>
                
                <div className="p-6 rounded-2xl bg-background/90 backdrop-blur-sm border border-success/20 mb-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-success to-success/50" />
                  <Quote className="w-6 h-6 text-success/50 mb-4" />
                  <p className="text-foreground text-lg leading-relaxed pl-4">
                    "Early-stage hardware startups burn 55% of their first capital raise on prototype iteration. Most rely on generalist manufacturers who lack expertise in low-volume production. Founders waste 6-9 months finding the right partners while competitors move faster."
                  </p>
                </div>
                
                <div className="space-y-4">
                  <p className="text-sm font-bold text-success uppercase tracking-wider">Why this kills:</p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">Specific target (not "startups"—early-stage HARDWARE startups)</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">Hard numbers (55% capital burn, 6-9 months delay)</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">Competitive urgency (speed = survival)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bad Example */}
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-br from-destructive/20 to-destructive/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-8 rounded-3xl bg-gradient-to-br from-destructive/10 to-destructive/5 border border-destructive/30 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-2xl bg-destructive/20 border border-destructive/40">
                    <XCircle className="w-7 h-7 text-destructive" />
                  </div>
                  <h3 className="text-2xl font-bold text-destructive">What Gets Ignored</h3>
                </div>
                
                <div className="p-6 rounded-2xl bg-background/90 backdrop-blur-sm border border-destructive/20 mb-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-destructive to-destructive/50" />
                  <Quote className="w-6 h-6 text-destructive/50 mb-4" />
                  <p className="text-foreground text-lg leading-relaxed pl-4">
                    "Manufacturing is broken. Traditional supply chains don't work anymore. The future is digital and companies need to adapt."
                  </p>
                </div>
                
                <div className="space-y-4">
                  <p className="text-sm font-bold text-destructive uppercase tracking-wider">Why this dies:</p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">Zero specificity — "manufacturing" could mean anything</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">Pure assertion — no proof anything is actually broken</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">Buzzword soup — "digital" and "adapt" mean nothing</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">No urgency — why does this need solving TODAY?</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Common Mistakes */}
        <section>
          <div className="mb-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How Founders Kill Their Own Decks</h2>
            <p className="text-xl text-muted-foreground">Stop doing these four things immediately</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {mistakes.map((mistake, index) => (
              <div 
                key={index}
                className="group relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-br from-destructive/10 to-transparent rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative p-6 rounded-3xl bg-card/80 backdrop-blur-sm border border-destructive/20 hover:border-destructive/30 transition-all duration-300 h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center border border-destructive/20">
                      <XCircle className="w-5 h-5 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-destructive mb-1">Mistake #{index + 1}</div>
                      <h3 className="text-xl font-bold mb-3">{mistake.title}</h3>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/20">
                      <p className="text-sm text-destructive/80 mb-2 font-semibold">What NOT to do:</p>
                      <p className="text-foreground italic leading-relaxed">{mistake.bad}</p>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{mistake.why}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Best Practices */}
        <section>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-success/20 via-success/5 to-transparent rounded-3xl blur-3xl opacity-40" />
            
            <div className="relative p-10 rounded-3xl bg-gradient-to-br from-success/10 to-success/5 border border-success/30 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-10">
                <div className="p-4 rounded-2xl bg-success/20 border border-success/40">
                  <TrendingUp className="w-8 h-8 text-success" />
                </div>
                <div>
                  <h2 className="text-4xl font-bold">How to Actually Win</h2>
                  <p className="text-lg text-muted-foreground mt-1">Four rules that separate funded founders from the rest</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {bestPractices.map((practice, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-4 p-5 rounded-2xl bg-background/60 backdrop-blur-sm border border-success/20 hover:border-success/40 hover:bg-background/80 transition-all duration-300 group"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center border border-success/30 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    </div>
                    <p className="text-foreground leading-relaxed text-lg pt-1.5">{practice}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-8 rounded-2xl bg-background/90 backdrop-blur-sm border border-success/30 text-center">
                <p className="text-foreground text-2xl font-bold leading-relaxed">
                  When investors think: <span className="text-transparent bg-clip-text bg-gradient-to-r from-success to-success/70">"Fuck, that IS painful"</span>
                </p>
                <p className="text-muted-foreground text-lg mt-3">
                  Everything else gets easier. That's the only reaction that matters.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Conclusion */}
        <section className="relative">
          <div className="absolute -inset-8 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 rounded-[3rem] blur-3xl opacity-50" />
          
          <div className="relative p-12 rounded-3xl bg-card/50 backdrop-blur-xl border border-border/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl opacity-30" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl opacity-20" />
            
            <div className="relative text-center space-y-8">
              <div className="inline-flex p-5 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                <Target className="w-12 h-12 text-primary" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold">This Slide Makes or Breaks You</h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Get the problem slide right and everything else clicks. Get it wrong and it doesn't matter how brilliant your solution is—investors have already moved on.
                </p>
              </div>
              
              <div className="max-w-3xl mx-auto p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <p className="text-foreground text-2xl md:text-3xl font-bold leading-relaxed mb-4">
                  Pick ONE brutal problem.<br />
                  Prove it's costing real money.<br />
                  Show why it's urgent.
                </p>
                <p className="text-muted-foreground text-lg">
                  Nail this, and the rest writes itself.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center pt-6">
                <Button 
                  size="lg"
                  className="gradient-primary shadow-glow hover-neon-pulse font-bold px-8"
                  onClick={() => navigate("/pre-seed-guide")}
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Guide
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-primary/30 hover:bg-primary/10 px-8"
                  onClick={() => navigate("/hub")}
                >
                  Go to Hub
                </Button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
