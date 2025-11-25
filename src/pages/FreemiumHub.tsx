import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompanyBadge } from "@/components/CompanyBadge";
import { CompanyReadinessScore } from "@/components/CompanyReadinessScore";
import { marked } from "marked";
import { 
  FileText, 
  ChevronRight,
  Sparkles,
  GraduationCap,
  Calculator,
  Layers,
  PresentationIcon,
  AlertTriangle,
  Wrench,
  TrendingUp,
  Shield,
  Edit,
  Euro
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  description: string;
  category: string;
  stage: string;
  biggest_challenge: string;
}

interface Memo {
  id: string;
  company_id: string;
  content: string;
  status: string;
}

interface EducationalArticle {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  published: boolean;
}

const MEMO_CONCEPT = {
  title: "The Investment Memorandum",
  subtitle: "The Internal Doc VCs Write About You",
  tagline: "I've taken the cognitive process used inside Investment Committees and turned it into a methodology you can access.",
  pitch: "Answer a few simple questions about your startup. My framework does the rest—generating a complete Investment Memorandum exactly how a VC would write it. It exposes weaknesses, highlights strengths, and shows what needs fixing before fundraising. Precise. Objective. Critical. Written in the language VCs actually use to make funding decisions."
};

const VC_BRAIN_SECTIONS = [
  {
    id: "stage-guides",
    title: "Stage Guides",
    icon: Layers,
    description: "Angel, Pre-Seed, Seed—what VCs expect",
    items: [
      { label: "Angel Stage", path: "/vcbrain/angel" },
      { label: "Pre-Seed Stage", path: "/vcbrain/pre-seed" },
      { label: "Seed Stage", path: "/vcbrain/seed" },
    ]
  },
  {
    id: "pitch-deck",
    title: "Pitch Deck Library",
    icon: PresentationIcon,
    description: "Every slide dissected",
    items: [
      { label: "Problem Slide", path: "/vcbrain/deck/problem" },
      { label: "Solution Slide", path: "/vcbrain/deck/solution" },
      { label: "Product Slide", path: "/vcbrain/deck/product" },
      { label: "Market Slide", path: "/vcbrain/deck/market" },
      { label: "Traction Slide", path: "/vcbrain/deck/traction" },
      { label: "Team Slide", path: "/vcbrain/deck/team" },
    ]
  },
  {
    id: "tactical",
    title: "Tactical Guides",
    icon: AlertTriangle,
    description: "Real advice, no fluff",
    items: [
      { label: "What Angels Really Want", path: "/vcbrain/guides/angels" },
      { label: "Early Traction That Matters", path: "/vcbrain/guides/traction" },
      { label: "Fake TAMs Exposed", path: "/vcbrain/guides/tam" },
      { label: "Why Startups Die", path: "/vcbrain/guides/death" },
    ]
  },
  {
    id: "resources",
    title: "Resources",
    icon: Wrench,
    description: "Checklists, scorecards, databases",
    items: [
      { label: "VC Glossary", path: "/vcbrain/tools/glossary" },
      { label: "Red Flag Database", path: "/vcbrain/tools/red-flags" },
      { label: "Pitch Readiness Checklist", path: "/vcbrain/tools/checklist" },
    ]
  }
];

export default function FreemiumHub() {
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [memo, setMemo] = useState<Memo | null>(null);
  const [articles, setArticles] = useState<EducationalArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>("stage-guides");
  const [tagline, setTagline] = useState<string>("");
  const [taglineLoading, setTaglineLoading] = useState(false);
  const [profileReadiness, setProfileReadiness] = useState<Array<{ name: string; completed: boolean }>>([]);

  useEffect(() => {
    const loadCompany = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/hub");
        return;
      }

      const { data: companies } = await supabase
        .from("companies")
        .select("*")
        .eq("founder_id", session.user.id)
        .limit(1);

      if (!companies || companies.length === 0) {
        navigate("/intake");
        return;
      }

      setCompany(companies[0]);
      
      // Check if memo exists for this company - get the most recent one
      const { data: memoData } = await supabase
        .from("memos")
        .select("*")
        .eq("company_id", companies[0].id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (memoData) {
        setMemo(memoData);
      }
      
      // Calculate profile readiness
      const { data: responses } = await supabase
        .from("memo_responses")
        .select("question_key")
        .eq("company_id", companies[0].id);
      
      const sectionKeys = ["problem", "solution", "market", "competition", "team", "usp", "business", "traction"];
      const readiness = sectionKeys.map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        completed: responses?.some(r => r.question_key.startsWith(key)) || false
      }));
      
      setProfileReadiness(readiness);
      
      // Load published articles
      const { data: articlesData } = await supabase
        .from("educational_articles")
        .select("id, slug, title, description, icon, published")
        .eq("published", true)
        .order("created_at", { ascending: true });
      
      if (articlesData) {
        setArticles(articlesData);
      }
      
      setLoading(false);
      
      // Generate AI tagline
      if (companies[0]) {
        setTaglineLoading(true);
        try {
          const { data: taglineData, error: taglineError } = await supabase.functions.invoke(
            'generate-company-tagline',
            {
              body: {
                companyName: companies[0].name,
                description: companies[0].description,
                stage: companies[0].stage
              }
            }
          );
          
          if (taglineError) throw taglineError;
          if (taglineData?.tagline) {
            setTagline(taglineData.tagline);
          }
        } catch (error) {
          console.error('Error generating tagline:', error);
        } finally {
          setTaglineLoading(false);
        }
      }
    };

    loadCompany();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5 -z-10" />
        <div className="absolute top-20 right-10 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl opacity-40" />
        
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="max-w-4xl space-y-8">
            {company && (
              <CompanyBadge 
                name={company.name}
                sector={company.category || "Tech"}
                tagline={tagline}
                isLoading={taglineLoading}
              />
            )}
            
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight">
                Inside the<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-primary/70">
                  Investor's Brain
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl font-light">
                Master the frameworks VCs use to evaluate startups. Learn how they think, what they look for, and why they say no.
              </p>
              
              {/* Investment Memo Concept */}
              <div className="pt-6 space-y-4 max-w-3xl">
                <div className="p-6 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl space-y-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-primary" />
                    <div>
                      <h2 className="text-2xl font-bold">{MEMO_CONCEPT.title}</h2>
                      <p className="text-sm text-muted-foreground">{MEMO_CONCEPT.subtitle}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {MEMO_CONCEPT.tagline}
                  </p>
                  
                  <p className="text-sm text-foreground leading-relaxed">
                    {MEMO_CONCEPT.pitch}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={() => company && navigate(`/memo?companyId=${company.id}`)}
                      className="flex-1 gradient-primary shadow-glow hover-neon-pulse font-bold"
                      size="lg"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {memo ? "View My Memo" : "Generate My Memo"}
                    </Button>
                    <Button 
                      onClick={() => navigate("/sample-memo")}
                      variant="outline"
                      className="relative flex-1 border-2 border-primary/50 hover:bg-primary/10 hover:border-primary transition-all duration-300 group overflow-hidden"
                      size="lg"
                    >
                      {/* Animated background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* NEW badge */}
                      <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold rounded-full shadow-lg">
                        PREVIEW
                      </div>
                      
                      <div className="relative flex items-center justify-center">
                        <FileText className="w-4 h-4 mr-2 text-primary" />
                        <span className="font-semibold">See Sample First</span>
                      </div>
                    </Button>
                  </div>
                  
                  {/* Benefit callout for sample */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                    <div className="w-1 h-1 rounded-full bg-primary/50" />
                    <span>Preview the AI-powered analysis before creating yours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Panels */}
      <div className="max-w-[1800px] mx-auto px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT PANEL: Company Overview */}
          <div className="space-y-6">
            <div className="sticky top-6 space-y-4">
              {company && (
                <div className="p-6 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-primary shadow-lg">
                      <Sparkles className="w-6 h-6 text-foreground" />
                    </div>
                    <h2 className="text-xl font-bold">Company Profile</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Company Name</h3>
                      <p className="text-sm font-medium">{company.name}</p>
                    </div>
                    
                    {company.category && (
                      <div>
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Category</h3>
                        <Badge variant="secondary" className="text-xs">{company.category}</Badge>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Stage</h3>
                      <Badge variant="outline" className="text-xs">{company.stage}</Badge>
                    </div>
                    
                    {company.description && (
                      <div>
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Description</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{company.description}</p>
                      </div>
                    )}
                    
                    {company.biggest_challenge && (
                      <div>
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Biggest Challenge</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{company.biggest_challenge}</p>
                      </div>
                    )}
                    
                    <div className="pt-4 border-t border-border/50">
                      <CompanyReadinessScore 
                        sections={profileReadiness}
                        variant="compact"
                      />
                    </div>
                    
                    <Button 
                      onClick={() => navigate('/company/profile/edit')}
                      className="w-full mt-2"
                      variant="outline"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Company Profile
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CENTER PANEL: PlayBook */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Knowledge Library</h2>
                  <p className="text-sm text-muted-foreground">Everything you need to think like a VC</p>
                </div>
              </div>
            </div>

            {/* VC Brain Sections - Collapsible */}
            <div className="space-y-3">
              {VC_BRAIN_SECTIONS.map((section) => {
                const SectionIcon = section.icon;
                const isExpanded = expandedSection === section.id;
                
                return (
                  <div key={section.id} className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                      className="w-full p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-primary/10">
                        <SectionIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-base font-bold">{section.title}</h3>
                        <p className="text-xs text-muted-foreground">{section.description}</p>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                    
                    {isExpanded && (
                      <div className="border-t border-border/50 px-4 py-2 bg-card/30">
                        {section.items.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => navigate(item.path)}
                            className="w-full text-left px-3 py-2.5 text-sm hover:bg-primary/10 rounded-lg transition-colors flex items-center justify-between group"
                          >
                            <span className="text-foreground group-hover:text-primary">{item.label}</span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

          {/* RIGHT PANEL: Tools & Templates */}
          <div className="space-y-6">
            <div className="sticky top-6 space-y-6">
              {/* Featured: Sample Memo Preview Card */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-primary/30 shadow-xl">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 rounded-full blur-3xl animate-pulse" />
                
                {/* Featured badge */}
                <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold rounded-full shadow-lg">
                  ✨ FEATURED
                </div>
                
                <div className="relative p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 shadow-lg">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-1">See a Sample Memo</h3>
                      <p className="text-sm text-muted-foreground">Preview before you create</p>
                    </div>
                  </div>
                  
                  {/* Value props */}
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <p className="text-sm text-foreground leading-snug">See VC-focused analysis in action</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <p className="text-sm text-foreground leading-snug">8+ comprehensive sections with AI insights</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <p className="text-sm text-foreground leading-snug">Understand the full memo structure</p>
                    </div>
                  </div>
                  
                  {/* CTA */}
                  <Button
                    onClick={() => navigate("/sample-memo")}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                    size="lg"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    View Sample Memo
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground italic">
                    No signup required • Takes 2 minutes to review
                  </p>
                </div>
              </div>
              
              {/* Tools Section */}
              <div className="p-6 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                    <Calculator className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Tools</h2>
                    <p className="text-sm text-muted-foreground">Practical calculators</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/raise-education')}
                    className="w-full p-4 bg-card border border-primary/30 rounded-lg hover:border-primary hover:bg-primary/5 transition-all group shadow-glow hover:shadow-glow-strong"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/20 flex-shrink-0 group-hover:bg-primary/30 transition-colors shadow-[0_0_15px_rgba(255,51,153,0.3)]">
                        <Calculator className="w-4 h-4 text-primary" />
                      </div>
                      <div className="text-left space-y-1 flex-1">
                        <h3 className="text-sm font-bold text-primary">Raise Estimator</h3>
                        <p className="text-xs text-muted-foreground">Calculate how much to raise based on milestones, burn, and market risk</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                  
                  <button
                    onClick={() => navigate('/valuation-calculator')}
                    className="w-full p-4 bg-card border border-primary/30 rounded-lg hover:border-primary hover:bg-primary/5 transition-all group shadow-glow hover:shadow-glow-strong"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/20 flex-shrink-0 group-hover:bg-primary/30 transition-colors shadow-[0_0_15px_rgba(255,51,153,0.3)]">
                        <Euro className="w-4 h-4 text-primary" />
                      </div>
                      <div className="text-left space-y-1 flex-1">
                        <h3 className="text-sm font-bold text-primary">Valuation Calculator</h3>
                        <p className="text-xs text-muted-foreground">Understand what your startup is really worth</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                  
                  <div className="p-4 bg-card/50 border border-border/50 rounded-lg opacity-60">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold">Pitch Deck Template</h3>
                        <p className="text-xs text-muted-foreground">VC-approved structure</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-card/50 border border-border/50 rounded-lg opacity-60">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                        <TrendingUp className="w-4 h-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold">Financial Model</h3>
                        <p className="text-xs text-muted-foreground">5-year projections</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-card/50 border border-border/50 rounded-lg opacity-60">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                        <Shield className="w-4 h-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold">DD Checklist</h3>
                        <p className="text-xs text-muted-foreground">Prepare for investors</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              {company && (
                <div className="p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl mt-6">
                  <h3 className="text-sm font-bold mb-4 text-muted-foreground uppercase tracking-wider">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button 
                      variant="outline"
                      className="w-full justify-start text-sm"
                      onClick={() => navigate("/intake")}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Edit Company Details
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full justify-start text-sm"
                      onClick={() => navigate("/portal")}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get Full Access
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
