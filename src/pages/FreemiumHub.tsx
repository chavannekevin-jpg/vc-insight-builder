import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { marked } from "marked";
import { 
  BookOpen, 
  Target, 
  Users, 
  TrendingUp, 
  Shield, 
  FileText, 
  XCircle,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Calculator,
  BarChart3,
  Lightbulb,
  CheckCircle2
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

const MEMO_BENEFITS = [
  {
    id: "what-vcs-see",
    title: "See What VCs See",
    description: "Understand exactly how investors evaluate your startup",
    icon: Target
  },
  {
    id: "identify-gaps",
    title: "Identify Your Gaps",
    description: "Discover weaknesses before investors do",
    icon: Shield
  },
  {
    id: "strengthen-pitch",
    title: "Strengthen Your Pitch",
    description: "Build a compelling narrative that resonates with VCs",
    icon: TrendingUp
  }
];

export default function FreemiumHub() {
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [memo, setMemo] = useState<Memo | null>(null);
  const [articles, setArticles] = useState<EducationalArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompany = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
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
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Panels */}
      <div className="max-w-[1800px] mx-auto px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT PANEL: My Memo */}
          <div className="space-y-6">
            <div className="sticky top-6">
              <div className="p-6 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-primary shadow-lg">
                    <FileText className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold">My Memo</h2>
                </div>
                
                {company && (
                  <div className="space-y-4">
                    <Button 
                      onClick={() => navigate(`/memo?companyId=${company.id}`)}
                      className="w-full gradient-primary shadow-glow hover-neon-pulse font-bold"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {memo ? "View Memo" : "Generate Memo"}
                    </Button>
                    
                    {memo ? (
                      <div className="space-y-4 pt-4">
                        <div className="space-y-3">
                          {(() => {
                            try {
                              const parsedContent = JSON.parse(memo.content);
                              const sections = Object.entries(parsedContent.sections).slice(0, 3);
                              return sections.map(([title, content]: [string, any], index: number) => (
                                <div
                                  key={index}
                                  className="p-4 bg-card/50 border border-border/50 rounded-lg hover:border-primary/20 transition-all"
                                >
                                  <h3 className="text-sm font-bold mb-2 text-primary">
                                    {title}
                                  </h3>
                                  <div 
                                    className="text-xs text-muted-foreground prose prose-sm max-w-none line-clamp-3"
                                    dangerouslySetInnerHTML={{ 
                                      __html: marked(content as string, { breaks: true, gfm: true })
                                    }}
                                  />
                                </div>
                              ));
                            } catch (e) {
                              return (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                  Your memo is ready. Click above to view.
                                </p>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    ) : (
                      <div className="pt-4 space-y-4 border-t border-border/50">
                        <p className="text-sm text-muted-foreground">
                          Get a detailed investment memo analyzing your startup through a VC's lens.
                        </p>
                        
                        <div className="space-y-3">
                          {MEMO_BENEFITS.map((item) => {
                            const Icon = item.icon;
                            return (
                              <div key={item.id} className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0 mt-0.5">
                                  <Icon className="w-4 h-4 text-primary" />
                                </div>
                                <div className="space-y-1">
                                  <h4 className="text-sm font-bold">{item.title}</h4>
                                  <p className="text-xs text-muted-foreground">{item.description}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
                  <h2 className="text-2xl font-bold">PlayBook</h2>
                  <p className="text-sm text-muted-foreground">{articles.length + 1} essential guides</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Pre-Seed Guide as first card */}
              <div
                onClick={() => navigate("/pre-seed-guide")}
                className="group cursor-pointer p-6 bg-card/80 backdrop-blur-sm border border-primary/30 rounded-xl hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 group-hover:scale-105 transition-transform">
                    <Lightbulb className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                        Pre-Seed Deck Guide
                      </h3>
                      <Badge variant="secondary" className="text-xs">Featured</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      Stop the deck theater. Learn what to include (and brutally exclude) when building your pre-seed pitch.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <CheckCircle2 className="w-3 h-3 text-success" />
                      <span className="text-xs text-muted-foreground">9 slides • Problem & Solution deep dives</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </div>

              {/* Regular articles */}
              {articles.map((item, index) => {
                const getIcon = (iconName: string) => {
                  const icons: Record<string, any> = {
                    BookOpen, Target, Users, TrendingUp, Shield, FileText, XCircle
                  };
                  return icons[iconName] || BookOpen;
                };
                
                const Icon = getIcon(item.icon);
                
                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/hub/${item.slug}`)}
                    className="group cursor-pointer p-5 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl hover:border-primary/30 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <span className="text-sm font-bold text-primary">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <h3 className="text-base font-bold group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progress Stats */}
            <div className="p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl mt-8">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">My Progress</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Articles Read</p>
                  <p className="text-2xl font-bold">0 / {articles.length}</p>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                    <div className="bg-gradient-primary h-1.5 rounded-full" style={{ width: '0%' }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Learning Streak</p>
                  <p className="text-2xl font-bold">0 days</p>
                  <p className="text-xs text-muted-foreground mt-2">Start learning</p>
                </div>
              </div>
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
