import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle,
  Target,
  TrendingUp,
  Zap,
  Quote,
  Sparkles,
  Lightbulb,
  Code,
  Rocket,
  Scale
} from "lucide-react";

export default function SolutionSlideGuide() {
  const navigate = useNavigate();

  const investorCriteria = [
    {
      icon: Lightbulb,
      title: "Instant Clarity",
      description: "Can they explain your product to someone else after one read? If it takes two slides to understand what you're building, you've lost."
    },
    {
      icon: Zap,
      title: "Unique Value",
      description: "What makes this different? Faster? Better? If your answer is 'we execute better,' you don't have an answer. Differentiation must be structural, not aspirational."
    },
    {
      icon: Code,
      title: "Real Product",
      description: "Does this actually exist? Working prototype? Live beta? Paying users? Or is this still PowerPoint engineering? Show proof, not promises."
    },
    {
      icon: Scale,
      title: "Built to Scale",
      description: "Does this grow into a platform? Multiply through integrations? Expand to adjacent markets? Great solutions hint at 10x bigger futures."
    }
  ];

  const mistakes = [
    {
      title: "Tech Word Salad",
      bad: "\"AI-powered blockchain ML platform with quantum synergy\"",
      why: "Stop. If your description needs decoding, you're hiding behind buzzwords instead of explaining real value."
    },
    {
      title: "Feature Dump",
      bad: "\"We have 47 features including X, Y, Z, A, B, C...\"",
      why: "Features don't sell. Outcomes do. Nobody cares about your feature list. They care about what changes."
    },
    {
      title: "Vaporware Vibes",
      bad: "\"We're building a revolutionary platform that will...\"",
      why: "Future tense kills credibility. Present tense builds it. 'We have' beats 'we will' every single time."
    },
    {
      title: "Generic as Hell",
      bad: "\"We automate workflows with smart software\"",
      why: "This describes 10,000 companies. Specific beats generic. Always. What EXACTLY are you automating? How? Why is it better?"
    }
  ];

  const bestPractices = [
    "Show the product — Screenshots. Flows. Demos. Visual proof beats verbal description every time.",
    "Name your edge — Don't just be 'better.' Explain the architectural, technical, or strategic advantage that makes you defensibly different.",
    "Prove it's real — MVP launched? Beta users? Prototype working? Early traction validates everything. Reference it.",
    "Hint at the empire — Great solutions suggest platform potential. Show how this grows beyond version 1."
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
              <span className="text-sm font-semibold text-primary">Slide #3 Deep Dive</span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                Building a Great<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-primary/70">
                  Solution Slide
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl font-light">
                You just convinced them there's a problem worth solving. Now comes the real test: can you actually solve it?
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-8 py-24 space-y-24">
        
        {/* What Is The Solution Slide */}
        <section>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl blur-2xl opacity-50" />
            
            <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-10 shadow-xl">
              <div className="flex items-start gap-6 mb-8">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                  <Rocket className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-4xl font-bold mb-4">What Is the Solution Slide?</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    This is where talk becomes product. Your solution slide answers:
                  </p>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/20">
                    <p className="text-2xl font-bold text-foreground leading-relaxed">
                      What are you building, how does it work, and why is it better than everything else out there?
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mt-10">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Explain how it works</h3>
                  <p className="text-muted-foreground leading-relaxed">One read. That's all you get. No technical rabbit holes. No jargon mazes. Crystal clear.</p>
                </div>
                
                <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Show what makes it unique</h3>
                  <p className="text-muted-foreground leading-relaxed">The link between problem and solution should be tight, obvious, and defensible. Not vague hand-waving.</p>
                </div>
                
                <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Prove it can be built</h3>
                  <p className="text-muted-foreground leading-relaxed">MVP? Beta? Prototype? Show that this exists in some real form. Slide decks don't count as products.</p>
                </div>
                
                <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Suggest how it scales</h3>
                  <p className="text-muted-foreground leading-relaxed">Great products expand. Hint at the platform, the ecosystem, the network effects waiting behind version 1.</p>
                </div>
              </div>

              <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-destructive/10 via-destructive/5 to-transparent border border-destructive/20">
                <p className="text-foreground leading-relaxed text-lg">
                  Vague solutions kill momentum instantly. If it sounds magical or too good to be true, <span className="text-destructive font-bold">investors assume you're either lying or delusional.</span>
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
              Here's what separates real products from pitch deck theater:
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
              Fail any of these tests? <span className="text-destructive font-bold">Your solution sounds like vaporware.</span> And vaporware doesn't get funded.
            </p>
          </div>
        </section>

        {/* Good vs Bad Examples */}
        <section>
          <div className="mb-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Real Product vs. Pitch Theater</h2>
            <p className="text-xl text-muted-foreground">One gets funded. The other gets forgotten.</p>
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
                    "We built a plug-in SDK for fintech apps that handles compliance checks at transaction time. Our rules engine processes KYC/AML in under 200ms using pre-indexed regulatory data. Teams integrate in 3 hours instead of 3 months."
                  </p>
                </div>
                
                <div className="space-y-4">
                  <p className="text-sm font-bold text-success uppercase tracking-wider">Why this kills:</p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">Specific mechanism (SDK + rules engine + indexed data)</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">Quantified differentiation (200ms, 3 hours vs 3 months)</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">Technically credible (present tense = it exists)</span>
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
                    "We're building an AI-powered compliance platform that will revolutionize how fintech companies handle regulations using machine learning."
                  </p>
                </div>
                
                <div className="space-y-4">
                  <p className="text-sm font-bold text-destructive uppercase tracking-wider">Why this dies:</p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">Future tense screams vaporware</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">"AI-powered" is meaningless without context</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">Zero technical detail about HOW</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">"Revolutionize" = red flag buzzword</span>
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
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How Founders Destroy Credibility</h2>
            <p className="text-xl text-muted-foreground">These mistakes turn 'yes' meetings into 'no thanks' emails</p>
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
                      <p className="text-sm text-destructive/80 mb-2 font-semibold">Don't do this:</p>
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
                  <p className="text-lg text-muted-foreground mt-1">Build credibility, not hype</p>
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
                  When investors think: <span className="text-transparent bg-clip-text bg-gradient-to-r from-success to-success/70">"I get how this works—and I can see it getting big"</span>
                </p>
                <p className="text-muted-foreground text-lg mt-3">
                  You just earned their belief. Everything after gets easier.
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
                <h2 className="text-4xl md:text-5xl font-bold">Turn Pain Into Product</h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  The solution slide is where belief gets built or destroyed. Clear, credible, concrete solutions win. Vague promises lose.
                </p>
              </div>
              
              <div className="max-w-3xl mx-auto p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <p className="text-foreground text-2xl md:text-3xl font-bold leading-relaxed mb-4">
                  Show the product.<br />
                  Prove it's real.<br />
                  Make them believe.
                </p>
                <p className="text-muted-foreground text-lg">
                  Do this right, and funding follows.
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
