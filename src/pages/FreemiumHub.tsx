import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Target, 
  Users, 
  TrendingUp, 
  Shield, 
  FileText, 
  XCircle,
  ChevronRight,
  ChevronDown,
  Sparkles,
  GraduationCap
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Company {
  id: string;
  name: string;
  description: string;
  category: string;
  stage: string;
  biggest_challenge: string;
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
  const [articles, setArticles] = useState<EducationalArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [playbookOpen, setPlaybookOpen] = useState(false);

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
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 gradient-hero -z-10" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse opacity-50" />
        
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="max-w-4xl space-y-8">
            <div className="flex items-center gap-3">
              {company && (
                <Badge variant="outline" className="text-sm px-4 py-1.5 border-primary/30">
                  {company.name}
                </Badge>
              )}
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                Your VC Learning Hub
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl">
                Master the frameworks VCs use to evaluate startups. Learn how they think, what they look for, and why they say no.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Button 
                size="lg"
                className="gradient-primary shadow-glow hover-neon-pulse font-bold text-lg px-8 py-6"
                onClick={() => navigate("/portal")}
              >
                Get Your Investment Memo
              </Button>
              {company && (
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-primary/30 hover:bg-primary/10 text-lg px-8 py-6"
                  onClick={() => navigate("/company")}
                >
                  View My Memo
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-16">
            
            {/* PlayBook Section - Collapsible */}
            <section className="space-y-6">
              <Collapsible open={playbookOpen} onOpenChange={setPlaybookOpen}>
                <CollapsibleTrigger asChild>
                  <button className="w-full group">
                    <div className="flex items-center justify-between p-6 bg-card border border-border rounded-2xl hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-primary shadow-lg">
                          <GraduationCap className="w-7 h-7 text-primary-foreground" />
                        </div>
                        <div className="text-left">
                          <h2 className="text-3xl font-bold group-hover:text-primary transition-colors">
                            PlayBook
                          </h2>
                          <p className="text-muted-foreground mt-1">
                            {articles.length} essential guides to VC thinking
                          </p>
                        </div>
                      </div>
                      <ChevronDown 
                        className={`w-6 h-6 text-muted-foreground transition-transform duration-300 ${
                          playbookOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="pt-6">
                  <div className="space-y-4">
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
                          className="group cursor-pointer p-6 bg-card/50 border border-border/50 rounded-xl hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-start gap-5">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <span className="text-lg font-bold text-primary">{index + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0 space-y-2">
                              <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                                {item.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {item.description}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </section>

            {/* Benefits Section */}
            <section className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-xl">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-sm font-bold text-primary uppercase tracking-wider">
                    What You Get
                  </span>
                </div>
                <h2 className="text-4xl font-bold">
                  Your Investment Memo Advantage
                </h2>
              </div>
              
              <div className="grid gap-6">
                {MEMO_BENEFITS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={item.id}
                      className="p-6 bg-card border border-border/50 rounded-2xl hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start gap-5">
                        <div className="p-3 rounded-xl bg-gradient-primary shadow-lg flex-shrink-0">
                          <Icon className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold">{item.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Access Card */}
            {company && (
              <div className="p-6 bg-card border border-border/50 rounded-2xl sticky top-24 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">Quick Access</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-4 bg-background/50 rounded-xl space-y-2">
                      <p className="text-sm text-muted-foreground">Your Company</p>
                      <p className="font-bold text-lg">{company.name}</p>
                      <div className="flex gap-2 pt-2">
                        <Badge variant="outline" className="text-xs">
                          {company.stage}
                        </Badge>
                        {company.category && (
                          <Badge variant="outline" className="text-xs">
                            {company.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full gradient-primary shadow-glow"
                      onClick={() => navigate("/company")}
                    >
                      View My Memo
                    </Button>
                  </div>
                </div>
                
                <div className="border-t border-border pt-6 space-y-4">
                  <h4 className="font-bold">What's Included:</h4>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">Complete VC Analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">Risk Assessment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">Investment Thesis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">Action Items</span>
                    </li>
                  </ul>
                  
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => navigate("/portal")}
                  >
                    Get Your Memo
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
