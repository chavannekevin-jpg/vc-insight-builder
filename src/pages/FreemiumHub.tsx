import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lock, 
  BookOpen, 
  Target, 
  Users, 
  TrendingUp, 
  Shield, 
  FileText, 
  XCircle,
  Crown,
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

const EDUCATIONAL_CONTENT = [
  {
    id: "how-vcs-evaluate",
    title: "How VCs Evaluate Startups",
    description: "Learn the fundamental framework VCs use to assess every startup",
    icon: Target,
    locked: false,
    path: "/hub/how-vcs-evaluate"
  },
  {
    id: "four-pillars",
    title: "The 4 Pillars: Market, Traction, Team, Defensibility",
    description: "Deep dive into what VCs really care about",
    icon: BookOpen,
    locked: false,
    path: "/hub/four-pillars"
  },
  {
    id: "investment-committees",
    title: "How Investment Committees Work",
    description: "Inside the room where funding decisions happen",
    icon: Users,
    locked: false,
    path: "/hub/investment-committees"
  },
  {
    id: "vc-memos",
    title: "What Memos Are and Why They Matter",
    description: "The internal document that makes or breaks your deal",
    icon: FileText,
    locked: false,
    path: "/hub/vc-memos"
  },
  {
    id: "why-vcs-reject",
    title: "Why VCs Reject Founders",
    description: "Pattern recognition from 10+ years of rejections",
    icon: XCircle,
    locked: false,
    path: "/hub/why-vcs-reject"
  }
];

const PREMIUM_FEATURES = [
  {
    id: "personalized-memo",
    title: "Your Personalized VC Memo",
    description: "Get a complete investment memo written from a VC's perspective about your startup",
    icon: FileText,
    locked: true
  },
  {
    id: "founder-score",
    title: "Founder Score",
    description: "See how your startup stacks up across all key dimensions",
    icon: TrendingUp,
    locked: true
  },
  {
    id: "ai-feedback",
    title: "AI-Powered Personalized Feedback",
    description: "Real-time feedback as you build your pitch and memo",
    icon: Shield,
    locked: true
  }
];

export default function FreemiumHub() {
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
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
            <Crown className="w-5 h-5 text-primary" />
            <p className="text-sm font-medium">
              Ready for the real VC view of your startup?{" "}
              <span className="text-primary font-bold">Unlock your personalized memo →</span>
            </p>
          </div>
          <Button size="sm" className="gradient-primary" onClick={() => navigate("/pricing")}>
            Upgrade Now
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
                {company.category}
              </Badge>
              <Badge variant="outline" className="text-base px-4 py-2">
                {company.stage}
              </Badge>
            </div>
          )}
          <p className="text-lg text-muted-foreground max-w-3xl">
            Learn the frameworks that VCs use every day to evaluate startups. These are the same principles 
            that will be applied to your personalized memo when you upgrade.
          </p>
        </div>

        {/* Educational content - Unlocked */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Free Educational Content</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {EDUCATIONAL_CONTENT.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} onClick={() => navigate(item.path)}>
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

        {/* Premium features - Locked */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6 text-muted-foreground" />
            <h2 className="text-2xl font-bold">Premium Features</h2>
            <Badge className="gradient-primary">Upgrade Required</Badge>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {PREMIUM_FEATURES.map((item) => {
              const Icon = item.icon;
              return (
                <ModernCard key={item.id} className="p-6 relative overflow-hidden opacity-75">
                  <div className="absolute top-4 right-4">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-muted inline-block">
                      <Icon className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => navigate("/pricing")}
                    >
                      Unlock with Premium
                    </Button>
                  </div>
                </ModernCard>
              );
            })}
          </div>
        </div>

        {/* CTA section */}
        <ModernCard className="p-8 text-center space-y-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/30">
          <div className="space-y-3">
            <h2 className="text-3xl font-serif font-bold">Ready to See How VCs View Your Startup?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upgrade to get your personalized VC memo, Founder Score, and AI-powered feedback 
              tailored specifically for {company?.name}.
            </p>
          </div>
          <Button 
            size="lg"
            className="text-lg px-10 py-6 gradient-primary shadow-glow hover-neon-pulse transition-all duration-300 font-bold uppercase tracking-wider"
            onClick={() => navigate("/pricing")}
          >
            Upgrade to Generate Your Memo
          </Button>
        </ModernCard>
      </div>

      {/* Floating bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-4 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Want the full VC perspective on your startup?</span>
          </div>
          <Button className="gradient-primary" onClick={() => navigate("/pricing")}>
            Unlock Full Access
          </Button>
        </div>
      </div>
    </div>
  );
}
