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
  ChevronRight
} from "lucide-react";

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
    <div className="min-h-screen">
      <Header />
      
      {/* Upgrade banner */}
      <div className="bg-primary/10 border-b border-primary/30 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <p className="text-sm font-medium">
              Ready to see how VCs evaluate {company?.name}?{" "}
              <span className="text-primary font-bold">Get your investment memo →</span>
            </p>
          </div>
          <Button size="sm" className="gradient-primary" onClick={() => navigate("/portal")}>
            Get Your Memo
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Welcome section */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold">
            Welcome to Your VC Learning Hub
          </h1>
          {company && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-base px-4 py-2">
                {company.name}
              </Badge>
              <Badge variant="outline" className="text-base px-4 py-2">
                {company.category || "N/A"}
              </Badge>
              <Badge variant="outline" className="text-base px-4 py-2">
                {company.stage}
              </Badge>
            </div>
          )}
          <p className="text-lg text-muted-foreground max-w-3xl">
            Learn the frameworks that VCs use every day to evaluate startups. Once you understand how they think, 
            you'll see exactly why getting your own investment memo is essential before you pitch.
          </p>
        </div>

        {/* My Company Section */}
        {company && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">My Company</h2>
                  <p className="text-sm text-muted-foreground">
                    View your investment memo
                  </p>
                </div>
              </div>
              <Button onClick={() => navigate("/company")} className="gap-2">
                View Memo
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Educational content - Unlocked */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Free Educational Content</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {articles.map((item) => {
              // Dynamically import icon
              const getIcon = (iconName: string) => {
                const icons: Record<string, any> = {
                  BookOpen,
                  Target,
                  Users,
                  TrendingUp,
                  Shield,
                  FileText,
                  XCircle
                };
                return icons[iconName] || BookOpen;
              };
              
              const Icon = getIcon(item.icon);
              
              return (
                <div key={item.id} onClick={() => navigate(`/hub/${item.slug}`)}>
                  <ModernCard 
                    hover 
                    className="p-6 cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground">{item.description}</p>
                        <div className="flex items-center gap-2 text-primary font-medium pt-2">
                          <span>Read now</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </ModernCard>
                </div>
              );
            })}
          </div>
        </div>

        {/* What You Get With The Memo */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">What You Get With Your Investment Memo</h2>
          </div>
          
          <ModernCard className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/30">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {MEMO_BENEFITS.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="space-y-3">
                    <div className="p-3 rounded-lg bg-primary/10 inline-block">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold">{item.title}</h3>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="border-t border-border pt-8 space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Your Investment Memo Includes:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Complete VC Analysis</p>
                      <p className="text-sm text-muted-foreground">Market, team, traction, and competitive positioning</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Risk Assessment</p>
                      <p className="text-sm text-muted-foreground">What investors will question and worry about</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Investment Thesis</p>
                      <p className="text-sm text-muted-foreground">Why a VC would (or wouldn't) invest in you</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Action Items</p>
                      <p className="text-sm text-muted-foreground">Specific steps to strengthen your position</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center pt-4">
                <Button 
                  size="lg"
                  className="gradient-primary shadow-glow hover-neon-pulse font-bold"
                  onClick={() => navigate("/portal")}
                >
                  Get Your Investment Memo →
                </Button>
              </div>
            </div>
          </ModernCard>
        </div>

        {/* CTA section */}
        <ModernCard className="p-8 text-center space-y-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/30">
          <div className="space-y-3">
            <h2 className="text-3xl font-serif font-bold">Ready to See the VC Perspective on {company?.name}?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get a complete investment memo written from a VC's point of view. 
              See your startup through the eyes of the investors you're trying to convince.
            </p>
          </div>
          <Button 
            size="lg"
            className="text-lg px-10 py-6 gradient-primary shadow-glow hover-neon-pulse transition-all duration-300 font-bold uppercase tracking-wider"
            onClick={() => navigate("/portal")}
          >
            Get My Investment Memo →
          </Button>
        </ModernCard>
      </div>

      {/* Floating bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-4 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Get your personalized VC investment memo for {company?.name}</span>
          </div>
          <Button className="gradient-primary" onClick={() => navigate("/portal")}>
            Get Your Memo
          </Button>
        </div>
      </div>
    </div>
  );
}
