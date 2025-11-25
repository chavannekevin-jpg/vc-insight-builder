import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Shield
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
  subtitle: "Your startup, analyzed through the VC lens",
  description: [
    "I've taken the cognitive process I use as a VC—the exact mental model and internal evaluation workflow used inside Investment Committees—and translated it into a structured methodology founders can access.",
    "This methodology enables you to generate your own Investment Memorandum, built the same way a VC would structure and justify a deal.",
    "This memo becomes your most powerful asset: a presentation-ready, investor-grade narrative written in VC language. It exposes the real weaknesses in your company, highlights strengths, outlines the investment case, and identifies the areas that need improvement before fundraising.",
    "When you purchase the memo, you're essentially receiving the internal document a VC would write about you if they were preparing to pitch your startup to their partners. It is precise, objective, critical, and aligned with how funding decisions are actually made."
  ]
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
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">{company.name}</span>
              </div>
            )}
            
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight">
                Inside the<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-primary/70">
                  Investor's Brain
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl font-light">
                Master the frameworks VCs use to evaluate startups. Learn how they think, what they look for, and why they say no.
              </p>
              <div className="pt-4">
                <Button 
                  onClick={() => company && navigate(`/memo?companyId=${company.id}`)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                  size="lg"
                >
                  Generate My Memo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Panels */}
      <div className="max-w-[1800px] mx-auto px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT PANEL: Investment Memo Concept */}
          <div className="space-y-6">
            <div className="sticky top-6">
              <div className="p-6 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-primary shadow-lg">
                    <FileText className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{MEMO_CONCEPT.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{MEMO_CONCEPT.subtitle}</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* The Transformation */}
                  <div className="space-y-4">
                    {MEMO_CONCEPT.description.map((paragraph, idx) => (
                      <p key={idx} className="text-sm text-foreground leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  
                  {/* CTA */}
                  {company && (
                    <div className="pt-4 border-t border-border/50">
                      <Button 
                        onClick={() => navigate(`/memo?companyId=${company.id}`)}
                        className="w-full gradient-primary shadow-glow hover-neon-pulse font-bold"
                        size="lg"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {memo ? "View My Memo" : "Generate My Memo"}
                      </Button>
                      
                      {memo && (
                        <div className="mt-4 space-y-3">
                          {(() => {
                            try {
                              const parsedContent = JSON.parse(memo.content);
                              const sections = Object.entries(parsedContent.sections).slice(0, 2);
                              return sections.map(([title, content]: [string, any], index: number) => (
                                <div
                                  key={index}
                                  className="p-3 bg-card/50 border border-border/50 rounded-lg hover:border-primary/20 transition-all cursor-pointer"
                                  onClick={() => navigate(`/memo?companyId=${company.id}`)}
                                >
                                  <h3 className="text-xs font-bold mb-1 text-primary">
                                    {title}
                                  </h3>
                                  <div 
                                    className="text-xs text-muted-foreground prose prose-sm max-w-none line-clamp-2"
                                    dangerouslySetInnerHTML={{ 
                                      __html: marked(content as string, { breaks: true, gfm: true })
                                    }}
                                  />
                                </div>
                              ));
                            } catch (e) {
                              return null;
                            }
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
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
            <div className="sticky top-6">
              <div className="p-6 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                    <Calculator className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Tools</h2>
                    <p className="text-sm text-muted-foreground">Coming soon</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="p-4 bg-card/50 border border-border/50 rounded-lg opacity-60">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                        <Calculator className="w-4 h-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold">Valuation Calculator</h3>
                        <p className="text-xs text-muted-foreground">Pre/post-money & dilution</p>
                      </div>
                    </div>
                  </div>
                  
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
