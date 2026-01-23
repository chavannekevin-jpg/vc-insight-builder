import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Zap, 
  Building2, 
  Users, 
  TrendingUp,
  FileSearch,
  Wrench,
  Telescope,
  MessageSquare,
  Brain,
  ClipboardList,
  Rocket,
  Linkedin,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import kevinPhoto from "@/assets/profile-photo.jpg";

const Index = () => {
  const navigate = useNavigate();

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

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <Badge className="mb-6 px-5 py-2 bg-primary/10 border-primary/20 text-primary backdrop-blur-sm">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              10 Years Inside VC Funds
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                The Analysis That Kills Your Deal
              </span>
              <br />
              <span className="text-primary" style={{ textShadow: '0 0 30px hsl(var(--primary) / 0.5)' }}>
                Happens Behind Closed Doors
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Every deal gets an internal analysis. Partners use it to pass or pursue. 
              After a decade of writing them, this is yours—fix what kills rounds before it costs you.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button 
                size="lg"
                onClick={() => navigate('/auth')}
                className="h-14 px-10 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                Get Your Analysis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate('/demo')}
                className="h-14 px-8 rounded-2xl border-border/50 hover:bg-card/50 backdrop-blur-sm"
              >
                Explore Demo First
              </Button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[
                { icon: FileSearch, value: "38+", label: "VC Tools" },
                { icon: Users, value: "800+", label: "Investors" },
                { icon: Building2, value: "760+", label: "Funds" }
              ].map((stat, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/30"
                >
                  <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary" style={{ textShadow: '0 0 10px hsl(var(--primary) / 0.4)' }}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What You Get Section */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything VCs Know About You—
                <span className="text-primary"> Before They Do</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                The complete founder ecosystem. One payment. Full access.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: FileSearch, title: "8-Dimension Audit", desc: "Scorecard across Team, Market, Product, Traction & more" },
                { icon: Wrench, title: "23+ Diagnostic Tools", desc: "TAM calculators, unit economics, competitor matrices" },
                { icon: Users, title: "800+ Investors", desc: "Matched to your stage, sector, and geography" },
                { icon: Telescope, title: "Market Intelligence", desc: "50+ reports distilled for your context" },
                { icon: MessageSquare, title: "Outreach Suite", desc: "Personalized emails that get replies" },
                { icon: Brain, title: "VC Q&A Prep", desc: "The tough questions—with answer frameworks" }
              ].map((item, idx) => (
                <div 
                  key={idx}
                  className="group p-5 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/30 hover:border-primary/30 hover:bg-card/50 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 px-4 py-1.5 bg-primary/10 border-primary/20 text-primary">
                Your Journey
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                From Profile to Investment-Ready
              </h2>
            </div>

            <div className="relative">
              {/* Vertical connecting line - desktop */}
              <div className="hidden md:block absolute left-1/2 top-8 bottom-8 w-px transform -translate-x-1/2">
                <div className="h-full w-full bg-gradient-to-b from-primary/60 via-primary/40 to-primary/60" />
                <div className="absolute inset-0 w-full bg-gradient-to-b from-primary/30 via-primary/20 to-primary/30 blur-sm" />
              </div>
              
              <div className="space-y-6 md:space-y-0">
                {[
                  { icon: ClipboardList, step: "01", title: "Build Your Profile", desc: "Create your profile in 30 seconds. Upload your deck—UglyBaby extracts the rest." },
                  { icon: FileSearch, step: "02", title: "Receive Your Audit", desc: "Get scores across 8 dimensions, red flags surfaced, and a prioritized action plan." },
                  { icon: Wrench, step: "03", title: "Unlock Tools", desc: "Access 23+ strategic tools auto-populated with your data." },
                  { icon: Rocket, step: "04", title: "Execute", desc: "Find matching investors, generate outreach, and pitch with confidence." }
                ].map((item, idx) => {
                  const isEven = idx % 2 === 0;
                  
                  return (
                    <div 
                      key={idx} 
                      className={`relative md:flex md:items-center md:gap-12 ${
                        isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                      }`}
                    >
                      {/* Card */}
                      <div className={`md:w-[calc(50%-3rem)] ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                        <div className="group relative rounded-2xl p-6 transition-all duration-300 bg-card/40 backdrop-blur-sm border border-border/30 hover:border-primary/40 hover:bg-card/60 hover:shadow-xl hover:shadow-primary/5">
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          {/* Mobile layout */}
                          <div className="flex gap-4 items-start md:hidden relative z-10">
                            <div className="flex-shrink-0">
                              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center group-hover:scale-105 group-hover:border-primary/40 transition-all duration-300">
                                <item.icon className="w-6 h-6 text-primary" />
                              </div>
                            </div>
                            <div className="flex-1 pt-1">
                              <div className="text-xs font-bold text-primary/80 mb-2 tracking-widest font-mono">
                                STEP {item.step}
                              </div>
                              <h3 className="font-semibold text-lg mb-2 text-foreground">{item.title}</h3>
                              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                            </div>
                          </div>
                          
                          {/* Desktop layout */}
                          <div className="hidden md:block relative z-10">
                            <div className="text-xs font-bold text-primary/80 mb-3 tracking-widest font-mono">
                              STEP {item.step}
                            </div>
                            <h3 className="font-semibold text-xl mb-2 text-foreground group-hover:text-primary/90 transition-colors">{item.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Center icon - desktop only */}
                      <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 z-10">
                        <div className="relative group/icon">
                          <div className="absolute inset-0 rounded-full bg-primary/30 blur-md group-hover/icon:bg-primary/50 transition-all duration-300" />
                          <div className="relative w-14 h-14 rounded-full bg-background border-2 border-primary/50 flex items-center justify-center group-hover/icon:border-primary group-hover/icon:scale-110 transition-all duration-300">
                            <item.icon className="w-6 h-6 text-primary" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Spacer for opposite side - desktop only */}
                      <div className="hidden md:block md:w-[calc(50%-3rem)]" />
                      
                      {/* Spacing for timeline */}
                      {idx < 3 && <div className="hidden md:block h-20" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Problem/Solution Section */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Problem */}
              <div className="relative group">
                <div className="absolute -inset-[1px] bg-destructive/20 rounded-3xl blur-sm opacity-50" />
                <div className="relative bg-card/40 backdrop-blur-xl rounded-3xl p-8 border border-destructive/30 h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-destructive" />
                    </div>
                    <h3 className="text-xl font-bold">The Problem</h3>
                  </div>
                  <p className="text-foreground/90 mb-4 font-medium">
                    You're pitching blind—no idea what VCs actually evaluate.
                  </p>
                  <ul className="space-y-2">
                    {[
                      "Measuring the wrong metrics",
                      "Focused on features, not market dynamics",
                      "Wasting months on wrong investors",
                      "Rejections feel random"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-destructive mt-0.5">✗</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Solution */}
              <div className="relative group">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/30 to-secondary/30 rounded-3xl blur-sm opacity-50" />
                <div className="relative bg-card/40 backdrop-blur-xl rounded-3xl p-8 border border-primary/30 h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">The Solution</h3>
                  </div>
                  <p className="text-foreground/90 mb-4 font-medium">
                    UglyBaby gives you the VC framework—before the meeting.
                  </p>
                  <ul className="space-y-2">
                    {[
                      "The exact evaluation criteria VCs use",
                      "See your company through investor eyes",
                      "Fix issues before they cost you rounds",
                      "Pitch to the right investors with the right story"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-0.5">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-3xl blur-sm opacity-50" />
              
              <div className="relative bg-card/40 backdrop-blur-2xl rounded-3xl p-8 md:p-12 border border-border/50 overflow-hidden">
                {/* Top highlight */}
                <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                
                <div className="grid md:grid-cols-5 gap-8 items-center">
                  {/* Photo */}
                  <div className="md:col-span-2">
                    <div className="aspect-square rounded-2xl overflow-hidden border border-border/50">
                      <img 
                        src={kevinPhoto} 
                        alt="Kevin Chavanne" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="md:col-span-3 space-y-6">
                    <h2 className="text-2xl md:text-3xl font-bold">
                      10 Years Reviewing Pitches.
                      <br />
                      <span className="text-primary">Now I'm Sharing Everything.</span>
                    </h2>
                    
                    <div className="space-y-4 text-foreground/80 text-sm leading-relaxed">
                      <p>
                        I'm <strong className="text-foreground">Kevin Chavanne</strong>. Over the past decade in VC, I've reviewed thousands of pitches and invested in dozens of startups across Europe.
                      </p>
                      <p>
                        Most founders spend 8+ months fundraising—not because their ideas are bad, but because they don't understand what VCs actually want.
                      </p>
                      <p className="text-primary font-medium">
                        I don't have time to teach all of you personally. So I built this platform.
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { value: "10+", label: "Years in VC" },
                        { value: "1000s", label: "Pitches" },
                        { value: "Dozens", label: "Invested" },
                        { value: "Active", label: "Mentor" }
                      ].map((stat, idx) => (
                        <div key={idx} className="text-center p-3 rounded-xl bg-muted/30 border border-border/30">
                          <div className="text-lg font-bold text-primary">{stat.value}</div>
                          <div className="text-xs text-muted-foreground">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    <a 
                      href="https://www.linkedin.com/in/kevin-chavanne-1b8a368a/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-xl hover:bg-primary/20 transition-colors"
                    >
                      <Linkedin className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-primary">Connect on LinkedIn</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-[40px] blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
              
              <div className="relative bg-card/50 backdrop-blur-2xl rounded-3xl p-10 md:p-14 border border-border/50 shadow-2xl">
                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Stop Guessing.
                  <br />
                  <span className="text-primary">Start Knowing.</span>
                </h2>
                
                <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                  The internal analysis that decides your fate—now in your hands.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg"
                    onClick={() => navigate('/auth')}
                    className="h-14 px-10 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Get the Analysis — €100
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/demo')}
                    className="h-14 px-8 rounded-2xl border-border/50 hover:bg-card/50 backdrop-blur-sm"
                  >
                    See Demo First
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-6">
                  Instant access • No subscription • One payment, full platform
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
