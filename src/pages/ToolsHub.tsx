import { Header } from "@/components/Header";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Calculator, 
  TrendingUp, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Mail, 
  Flame, 
  FlaskConical,
  FileSearch,
  Users,
  Telescope,
  Brain,
  Target,
  BarChart3,
  Shield,
  Lightbulb,
  MessageSquare,
  BookOpen,
  CheckCircle2,
  LineChart,
  PieChart,
  Crosshair,
  TrendingDown,
  DollarSign,
  Building2,
  Map
} from "lucide-react";

export default function ToolsHub() {
  const navigate = useNavigate();

  const standaloneTools = [
    {
      name: "Raise Calculator",
      description: "Calculate exactly how much cash you need before you run out of runway.",
      icon: Calculator,
      path: "/raise-calculator"
    },
    {
      name: "Valuation Calculator",
      description: "Find out what your startup is actually worth. Real numbers, not dreams.",
      icon: TrendingUp,
      path: "/valuation-calculator"
    },
    {
      name: "Venture Scale Diagnostic",
      description: "Are you building a unicorn or a lifestyle business? Find out.",
      icon: Zap,
      path: "/venture-scale-diagnostic"
    }
  ];

  const auditDimensions = [
    { name: "Problem", desc: "Is the pain real, urgent, and expensive enough to solve?", icon: Target },
    { name: "Solution", desc: "Does your product actually solve it better than alternatives?", icon: Lightbulb },
    { name: "Market", desc: "Is the TAM large enough to build a venture-scale outcome?", icon: BarChart3 },
    { name: "Competition", desc: "What's your moat? Can you defend your position?", icon: Shield },
    { name: "Team", desc: "Do you have the unfair advantage to execute on this?", icon: Users },
    { name: "Business Model", desc: "Do the unit economics work at scale?", icon: PieChart },
    { name: "Traction", desc: "Is there evidence that the market wants this?", icon: TrendingUp },
    { name: "Vision", desc: "Is this a venture-scale opportunity with clear exit paths?", icon: Crosshair }
  ];

  const strategicTools = [
    { name: "TAM/SAM/SOM Calculator", desc: "Bottom-up market sizing with VC-grade methodology" },
    { name: "Unit Economics Model", desc: "LTV, CAC, payback periods—the metrics VCs actually care about" },
    { name: "Competitive Chessboard", desc: "Map your competitive landscape and positioning" },
    { name: "MOAT Assessment", desc: "Evaluate your defensibility across 7 dimensions" },
    { name: "90-Day Action Plan", desc: "Prioritized roadmap to close your biggest gaps" },
    { name: "Evidence Threshold", desc: "What proof do you need at your stage?" },
    { name: "Pain Validator", desc: "Score the severity and urgency of the problem you're solving" },
    { name: "VC Scale Test", desc: "Can this realistically become a $100M+ business?" },
    { name: "Burn Rate Analyzer", desc: "Runway projections and cash management" },
    { name: "Traction Benchmarks", desc: "Compare your metrics to stage-appropriate peers" },
    { name: "Case Studies", desc: "Learn from comparable companies in your space" },
    { name: "VC Investment Logic", desc: "Understand exactly why a VC would (or wouldn't) invest" }
  ];

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
      
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20 pt-8">
          <Badge className="mb-6 px-5 py-2 bg-primary/10 border-primary/20 text-primary backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5 mr-1.5" />
            The Complete Founder Arsenal
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
              Everything You Need to
            </span>
            <br />
            <span className="text-primary" style={{ textShadow: '0 0 30px hsl(var(--primary) / 0.5)' }}>
              Think Like a VC
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Most founders fail not from bad ideas, but from not understanding how VCs evaluate deals.
            UglyBaby gives you the exact methodology, tools, and intelligence that VCs use internally.
          </p>
        </div>

        {/* Try These Now */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-primary">Try These Now</h2>
            <Badge variant="outline" className="border-primary/30 text-primary">Standalone</Badge>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {standaloneTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div 
                  key={tool.name}
                  className="group relative rounded-2xl p-6 bg-card/40 backdrop-blur-sm border border-border/30 hover:border-primary/40 hover:bg-card/60 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">{tool.name}</h3>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                    </div>
                    <Button 
                      onClick={() => navigate(tool.path)}
                      variant="outline"
                      className="group w-full rounded-xl border-2 border-primary/30 hover:border-amber-500/80 hover:bg-card/80 transition-all duration-300 hover:shadow-[0_0_20px_hsl(45_100%_50%/0.3)]"
                    >
                      <span className="text-foreground group-hover:text-foreground transition-colors">
                        Use Tool
                      </span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* The 8-Dimension Investment Audit */}
        <div className="mb-20">
          <div className="relative group mb-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-lg opacity-50" />
            <div className="relative bg-card/50 backdrop-blur-xl rounded-3xl p-8 border border-border/50">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
                  <FileSearch className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">The 8-Dimension Investment Audit</h2>
                  <p className="text-muted-foreground">
                    The exact analysis VCs run behind closed doors. Every deal gets scored across these dimensions—now you see yours before they do.
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {auditDimensions.map((dim) => {
                  const Icon = dim.icon;
                  return (
                    <div key={dim.name} className="p-4 rounded-xl bg-muted/30 border border-border/30">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-foreground">{dim.name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">{dim.desc}</p>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm text-foreground/80">
                  <span className="font-semibold text-primary">The output:</span> A scored breakdown with benchmarks, red flags, and a VC perspective on each dimension—plus a prioritized action plan to close your gaps.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 23+ Strategic Tools */}
        <div className="mb-20">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Brain className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">23+ Strategic Diagnostic Tools</h2>
              <p className="text-muted-foreground max-w-2xl">
                Every tool is auto-populated with your company data. No manual entry—just insights. These are the same frameworks top VCs use to evaluate deals.
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {strategicTools.map((tool) => (
              <div key={tool.name} className="flex items-start gap-3 p-4 rounded-xl bg-card/30 border border-border/30 hover:border-primary/30 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{tool.name}</h3>
                  <p className="text-xs text-muted-foreground">{tool.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Intelligence */}
        <div className="mb-20">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-lg opacity-50" />
            <div className="relative bg-card/50 backdrop-blur-xl rounded-3xl p-8 border border-border/50">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                      <Telescope className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h2 className="text-2xl font-bold">Market Intelligence</h2>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    50+ industry reports synthesized into a personalized briefing for your specific sector, stage, and geography. No more drowning in generic market research.
                  </p>
                  <div className="space-y-3">
                    {[
                      { label: "Tailwinds", desc: "Market forces working in your favor" },
                      { label: "Headwinds", desc: "Challenges and risks to address" },
                      { label: "Funding Landscape", desc: "Who's investing in your space and at what terms" },
                      { label: "Exit Precedents", desc: "Comparable exits and what they tell VCs" }
                    ].map((item) => (
                      <div key={item.label} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2" />
                        <div>
                          <span className="font-semibold text-foreground text-sm">{item.label}:</span>
                          <span className="text-muted-foreground text-sm ml-1">{item.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: LineChart, label: "Funding Trends" },
                    { icon: TrendingDown, label: "Risk Signals" },
                    { icon: Building2, label: "Sector Dynamics" },
                    { icon: Map, label: "Geographic Intel" }
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-center">
                        <Icon className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                        <span className="text-xs text-muted-foreground">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Investor Network */}
        <div className="mb-20">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-lg opacity-50" />
            <div className="relative bg-card/50 backdrop-blur-xl rounded-3xl p-8 border border-border/50">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="text-3xl font-bold text-emerald-400">800+</div>
                      <div className="text-xs text-muted-foreground">Investors</div>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="text-3xl font-bold text-emerald-400">760+</div>
                      <div className="text-xs text-muted-foreground">Funds</div>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="text-3xl font-bold text-emerald-400">AI</div>
                      <div className="text-xs text-muted-foreground">Matching</div>
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <Users className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold">Curated Investor Network</h2>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    No more spray-and-pray. AI-powered matching scores each fund by stage, sector, geography, and thesis fit. Focus your energy on investors who actually invest in companies like yours.
                  </p>
                  <div className="space-y-2">
                    {[
                      "Stage-appropriate filtering (Pre-seed to Series A)",
                      "Sector and thesis alignment scoring",
                      "Geographic focus matching",
                      "Recent investment activity signals"
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Execution Tools */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold mb-8">Execution & Preparation</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Outreach Lab */}
            <div className="relative group rounded-2xl p-6 bg-card/40 backdrop-blur-sm border border-border/30 hover:border-primary/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">Outreach Lab</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Generate personalized investor emails that don't sound like a robot wrote them. Context-aware messaging based on your audit and their thesis.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-violet-400" />
                  <span>Personalized to each investor's focus</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-violet-400" />
                  <span>Highlights your strongest signals</span>
                </div>
              </div>
            </div>

            {/* Roast Your Baby */}
            <div className="relative group rounded-2xl p-6 bg-card/40 backdrop-blur-sm border border-border/30 hover:border-primary/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-center mb-4">
                <Flame className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">Roast Your Baby</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Survive brutal VC questions in a live-fire simulation. Practice the tough questions before they cost you the deal.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-orange-400" />
                  <span>Questions tailored to your weak spots</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-orange-400" />
                  <span>Answer frameworks and coaching</span>
                </div>
              </div>
            </div>

            {/* Dilution Lab */}
            <div className="relative group rounded-2xl p-6 bg-card/40 backdrop-blur-sm border border-border/30 hover:border-primary/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                <FlaskConical className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">Dilution Lab</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Build your cap table, simulate funding rounds with SAFE/CLA/Equity, and understand how your ownership evolves.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-blue-400" />
                  <span>Multiple round scenarios</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-blue-400" />
                  <span>SAFE, CLA, and equity modeling</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VC Brain / Knowledge */}
        <div className="mb-20">
          <div className="relative group rounded-2xl p-8 bg-card/40 backdrop-blur-sm border border-border/30">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">VC Brain: 60+ Tactical Guides</h2>
                <p className="text-muted-foreground">
                  The playbook that teaches you to think like a VC. From pitch structure to negotiation tactics, 
                  these guides distill a decade of VC experience into actionable frameworks.
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-4 gap-3">
              {[
                "How VCs Score Deals",
                "The Perfect Pitch Structure",
                "Negotiating Term Sheets",
                "Building Your Data Room",
                "Traction Metrics That Matter",
                "When to Raise (And Not)",
                "VC Red Flags to Avoid",
                "Follow-up Strategies"
              ].map((guide) => (
                <div key={guide} className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <MessageSquare className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">{guide}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-[40px] blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
          
          <div className="relative bg-card/50 backdrop-blur-2xl rounded-3xl p-10 md:p-14 border border-border/50 shadow-2xl">
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto shadow-lg shadow-primary/30">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Done Playing with{" "}
                  <span className="text-primary" style={{ textShadow: '0 0 20px hsl(var(--primary) / 0.4)' }}>
                    Calculators
                  </span>?
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                  These standalone tools get you started. But building a VC-grade investment case requires the full ecosystem—
                  the audit, the methodology, the tools, and the intelligence.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={() => navigate('/pricing')}
                  className="h-14 px-10 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Get Your Full Audit
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
              <p className="text-xs text-muted-foreground">
                One payment • Full platform access • No subscription
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
