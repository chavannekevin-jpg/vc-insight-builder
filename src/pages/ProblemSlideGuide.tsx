import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ModernCard } from "@/components/ModernCard";
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
  Quote
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
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 gradient-hero -z-10" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse opacity-50" />
        
        <div className="max-w-7xl mx-auto px-8 py-20">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/pre-seed-guide")}
            className="mb-8 hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pre-Seed Guide
          </Button>
          
          <div className="max-w-4xl space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                Building a Great<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-destructive">
                  Problem Slide
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl">
                The first real test of your pitch. If investors don't immediately understand what's broken, why it matters, and why it must be solved now—they will stop paying attention.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-8 py-20 space-y-16">
        
        {/* What Is The Problem Slide */}
        <section>
          <ModernCard className="p-8 border-primary/30">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/30">
                <AlertTriangle className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-3">What Is the Problem Slide?</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Your problem slide exists to answer one fundamental question:
                </p>
                <p className="text-2xl font-bold text-foreground mt-4">
                  Is there a pain that is real, urgent, and worth paying to solve?
                </p>
              </div>
            </div>
            
            <div className="space-y-4 mt-8">
              <div className="p-5 rounded-xl bg-background/60 border border-border/50">
                <h3 className="font-bold text-lg mb-2">State the core problem clearly</h3>
                <p className="text-muted-foreground">No jargon. No fluff. One focused pain point.</p>
              </div>
              
              <div className="p-5 rounded-xl bg-background/60 border border-border/50">
                <h3 className="font-bold text-lg mb-2">Show why this problem matters now</h3>
                <p className="text-muted-foreground">What has changed in the market, customer behavior, or technology that makes this urgent?</p>
              </div>
              
              <div className="p-5 rounded-xl bg-background/60 border border-border/50">
                <h3 className="font-bold text-lg mb-2">Ground the problem in real-world evidence</h3>
                <p className="text-muted-foreground">Use data points, anecdotes, or examples that demonstrate the pain actually exists.</p>
              </div>
              
              <div className="p-5 rounded-xl bg-background/60 border border-border/50">
                <h3 className="font-bold text-lg mb-2">Hint at the opportunity</h3>
                <p className="text-muted-foreground">When the pain is quantified—revenue lost, time wasted, cost incurred—the business potential becomes obvious.</p>
              </div>
            </div>

            <div className="mt-6 p-6 bg-destructive/5 border border-destructive/20 rounded-xl">
              <p className="text-foreground font-medium">
                Avoid general industry rants or aspirational statements. This slide is not about the future you imagine. <span className="text-destructive font-bold">It is about the pain happening today.</span>
              </p>
            </div>
          </ModernCard>
        </section>

        {/* What Investors Look For */}
        <section>
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-3">What Investors Look For</h2>
            <p className="text-lg text-muted-foreground">
              When reviewing problem slides, investors assess four things:
            </p>
          </div>
          
          <div className="grid gap-6">
            {investorCriteria.map((item, index) => {
              const Icon = item.icon;
              return (
                <ModernCard 
                  key={index} 
                  className="p-6 border-primary/20"
                  hover
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </ModernCard>
              );
            })}
          </div>

          <ModernCard className="mt-8 p-6 border-destructive/30 bg-destructive/5">
            <p className="text-foreground font-medium text-lg">
              If any of these four elements are missing, investors will assume the opportunity is <span className="text-destructive font-bold">weak or unvalidated.</span>
            </p>
          </ModernCard>
        </section>

        {/* Good vs Bad Examples */}
        <section>
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-3">Good vs. Bad Examples</h2>
          </div>

          <div className="space-y-6">
            {/* Good Example */}
            <ModernCard className="p-8 border-success/30 bg-success/5">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-xl bg-success/20 border border-success/40">
                  <CheckCircle2 className="w-7 h-7 text-success" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-4 text-success">Strong Example</h3>
                  <div className="p-6 bg-background/80 rounded-xl border border-success/20 mb-6">
                    <Quote className="w-6 h-6 text-success mb-3" />
                    <p className="text-foreground text-lg italic leading-relaxed">
                      "Product-led SaaS companies lose up to 40% of users during onboarding. Most rely on generic walkthroughs or support tickets. Mid-market CS teams lack the time, tools, and insights to intervene effectively."
                    </p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-foreground font-semibold">Why it works:</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">Clear segment (product-led SaaS)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">Real data (40% churn)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">Urgency (manual processes waste time and money)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ModernCard>

            {/* Bad Example */}
            <ModernCard className="p-8 border-destructive/30 bg-destructive/5">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-xl bg-destructive/20 border border-destructive/40">
                  <XCircle className="w-7 h-7 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-4 text-destructive">Weak Example</h3>
                  <div className="p-6 bg-background/80 rounded-xl border border-destructive/20 mb-6">
                    <Quote className="w-6 h-6 text-destructive mb-3" />
                    <p className="text-foreground text-lg italic leading-relaxed">
                      "Customer success is outdated. AI is changing everything."
                    </p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-foreground font-semibold">Why it fails:</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">Vague — no specific segment or pain</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">No proof — just assertions</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">No urgency — why does this matter now?</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">Nothing concrete or actionable</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ModernCard>
          </div>
        </section>

        {/* Common Mistakes */}
        <section>
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-3">Common Mistakes Founders Make</h2>
          </div>
          
          <div className="space-y-4">
            {mistakes.map((mistake, index) => (
              <ModernCard 
                key={index}
                className="p-6 border-destructive/20 bg-destructive/5"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-destructive/20">
                    <XCircle className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">{index + 1}. {mistake.title}</h3>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-background/60 border border-destructive/20">
                        <p className="text-sm text-muted-foreground mb-1">Example of what NOT to do:</p>
                        <p className="text-foreground italic">{mistake.bad}</p>
                      </div>
                      <p className="text-muted-foreground">{mistake.why}</p>
                    </div>
                  </div>
                </div>
              </ModernCard>
            ))}
          </div>
        </section>

        {/* Best Practices */}
        <section>
          <ModernCard className="p-8 border-success/30 bg-success/5">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-success/20 border border-success/40">
                <TrendingUp className="w-7 h-7 text-success" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-3">Best Practices For a High-Impact Problem Slide</h2>
              </div>
            </div>
            
            <div className="space-y-4 mt-6">
              {bestPractices.map((practice, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg bg-background/60 border border-success/20 hover:bg-background/80 transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-foreground leading-relaxed">{practice}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-background/80 rounded-xl border border-success/20">
              <p className="text-foreground text-xl font-bold text-center">
                If your problem slide triggers the reaction: <span className="text-success">"Yes, this is real, and it sounds painful"</span>—the rest of your deck becomes much easier to believe.
              </p>
            </div>
          </ModernCard>
        </section>

        {/* Conclusion */}
        <section>
          <ModernCard className="p-10 border-primary/30">
            <div className="text-center space-y-6">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-primary shadow-lg">
                <Target className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-bold">The Foundation of Your Pitch</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                The problem slide is not a formality—it is the foundation of your entire pitch. When the problem is specific, urgent, and backed by evidence, investors immediately understand the opportunity.
              </p>
              <div className="p-6 bg-primary/5 rounded-xl border border-primary/20 max-w-2xl mx-auto">
                <p className="text-foreground text-xl font-bold">
                  Start with a real pain. Prove it exists. Make it feel expensive.
                </p>
                <p className="text-muted-foreground mt-3">
                  Do that, and your pitch becomes dramatically stronger.
                </p>
              </div>
              <div className="flex gap-4 justify-center pt-4">
                <Button 
                  size="lg"
                  className="gradient-primary shadow-glow hover-neon-pulse font-bold"
                  onClick={() => navigate("/pre-seed-guide")}
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Guide
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-primary/30 hover:bg-primary/10"
                  onClick={() => navigate("/hub")}
                >
                  Go to Hub
                </Button>
              </div>
            </div>
          </ModernCard>
        </section>

      </div>
    </div>
  );
}
