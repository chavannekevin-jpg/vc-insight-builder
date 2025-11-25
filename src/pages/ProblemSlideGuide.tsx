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
      title: "Clear Problem Statement",
      description: "Is the problem described in simple, specific, concrete terms? If an investor cannot summarize the problem in one sentence, the slide has failed."
    },
    {
      icon: Zap,
      title: "Urgency — Why Now?",
      description: "Has something shifted that makes solving this problem timely? Without 'why now,' your company can look like a 'nice to have' rather than a must-have."
    },
    {
      icon: MessageSquare,
      title: "Specific Evidence",
      description: "Data points, customer quotes, examples, operator insights. Evidence is what differentiates a real pain point from a founder's opinion."
    },
    {
      icon: DollarSign,
      title: "Quantified Impact",
      description: "What is the tangible cost of not solving this? Investors want to see numbers—lost revenue, churn, inefficiency, operational drag."
    }
  ];

  const mistakes = [
    {
      title: "Being Too General",
      bad: "\"Hiring is hard\"",
      why: "Who struggles? How? Why? What is the actual pain? This says nothing."
    },
    {
      title: "Fluff Instead of Proof",
      bad: "\"Customers hate this\" or \"The market is huge\"",
      why: "Replace vague claims with real stats or quotes. These statements are meaningless."
    },
    {
      title: "Overloading With Jargon",
      bad: "Industry buzzwords and complex terminology",
      why: "If someone outside your industry cannot understand the slide, it's a problem. Clarity > complexity."
    },
    {
      title: "Too Many Minor Problems",
      bad: "A laundry list of issues",
      why: "Focus on one core pain that is severe and expensive. Everything else distracts from the narrative."
    }
  ];

  const bestPractices = [
    "Anchor the problem in urgency — Why is this painful right now?",
    "Use the customer's voice — Quotes feel real. Artificial summaries feel invented.",
    "Stay laser-focused — Pick the single problem your company exists to solve.",
    "Aim for an investor reaction of: \"Yes, this is real, and it sounds painful.\""
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
                The first real test of your pitch. If investors don't immediately understand what's broken, why it matters, and why it must be solved now—they will stop paying attention.
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
                    Your problem slide exists to answer one fundamental question:
                  </p>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/20">
                    <p className="text-2xl font-bold text-foreground leading-relaxed">
                      Is there a pain that is real, urgent, and worth paying to solve?
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mt-10">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">State the core problem clearly</h3>
                  <p className="text-muted-foreground leading-relaxed">No jargon. No fluff. One focused pain point.</p>
                </div>
                
                <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Show why this problem matters now</h3>
                  <p className="text-muted-foreground leading-relaxed">What has changed in the market, customer behavior, or technology that makes this urgent?</p>
                </div>
                
                <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Ground the problem in real-world evidence</h3>
                  <p className="text-muted-foreground leading-relaxed">Use data points, anecdotes, or examples that demonstrate the pain actually exists.</p>
                </div>
                
                <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Hint at the opportunity</h3>
                  <p className="text-muted-foreground leading-relaxed">When the pain is quantified—revenue lost, time wasted, cost incurred—the business potential becomes obvious.</p>
                </div>
              </div>

              <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-destructive/10 via-destructive/5 to-transparent border border-destructive/20">
                <p className="text-foreground leading-relaxed text-lg">
                  Avoid general industry rants or aspirational statements. This slide is not about the future you imagine. <span className="text-destructive font-bold">It is about the pain happening today.</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What Investors Look For */}
        <section>
          <div className="mb-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What Investors Look For</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              When reviewing problem slides, investors assess four things:
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
              If any of these four elements are missing, investors will assume the opportunity is <span className="text-destructive font-bold">weak or unvalidated.</span>
            </p>
          </div>
        </section>

        {/* Good vs Bad Examples */}
        <section>
          <div className="mb-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Good vs. Bad Examples</h2>
            <p className="text-xl text-muted-foreground">See the difference that clarity and evidence make</p>
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
                  <h3 className="text-2xl font-bold text-success">Strong Example</h3>
                </div>
                
                <div className="p-6 rounded-2xl bg-background/90 backdrop-blur-sm border border-success/20 mb-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-success to-success/50" />
                  <Quote className="w-6 h-6 text-success/50 mb-4" />
                  <p className="text-foreground text-lg leading-relaxed pl-4">
                    "Early-stage hardware startups burn 55% of their first capital raise on prototype iteration. Most rely on generalist manufacturers who lack expertise in low-volume production. Founders waste 6-9 months finding the right partners while competitors move faster."
                  </p>
                </div>
                
                <div className="space-y-4">
                  <p className="text-sm font-bold text-success uppercase tracking-wider">Why it works:</p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">Clear segment (early-stage hardware startups)</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">Quantified pain (55% of capital, 6-9 months wasted)</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">Urgency (competitors moving faster creates time pressure)</span>
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
                  <h3 className="text-2xl font-bold text-destructive">Weak Example</h3>
                </div>
                
                <div className="p-6 rounded-2xl bg-background/90 backdrop-blur-sm border border-destructive/20 mb-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-destructive to-destructive/50" />
                  <Quote className="w-6 h-6 text-destructive/50 mb-4" />
                  <p className="text-foreground text-lg leading-relaxed pl-4">
                    "Manufacturing is broken. Traditional supply chains don't work anymore. The future is digital and companies need to adapt."
                  </p>
                </div>
                
                <div className="space-y-4">
                  <p className="text-sm font-bold text-destructive uppercase tracking-wider">Why it fails:</p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">Vague — who exactly is affected?</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">No evidence — just broad claims</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">No urgency — why solve this now?</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">Nothing concrete — no data or specifics</span>
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
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Common Mistakes Founders Make</h2>
            <p className="text-xl text-muted-foreground">Avoid these pitfalls that kill investor interest</p>
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
                  <h2 className="text-4xl font-bold">Best Practices</h2>
                  <p className="text-lg text-muted-foreground mt-1">For a High-Impact Problem Slide</p>
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
                  If your problem slide triggers: <span className="text-transparent bg-clip-text bg-gradient-to-r from-success to-success/70">"Yes, this is real, and it sounds painful"</span>
                </p>
                <p className="text-muted-foreground text-lg mt-3">
                  The rest of your deck becomes much easier to believe.
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
                <h2 className="text-4xl md:text-5xl font-bold">The Foundation of Your Pitch</h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  The problem slide is not a formality—it is the foundation of your entire pitch. When the problem is specific, urgent, and backed by evidence, investors immediately understand the opportunity.
                </p>
              </div>
              
              <div className="max-w-3xl mx-auto p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <p className="text-foreground text-2xl md:text-3xl font-bold leading-relaxed mb-4">
                  Start with a real pain.<br />
                  Prove it exists.<br />
                  Make it feel expensive.
                </p>
                <p className="text-muted-foreground text-lg">
                  Do that, and your pitch becomes dramatically stronger.
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
