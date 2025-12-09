import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { MemoLoadingScreen } from "@/components/MemoLoadingScreen";
import { MemoVCQuickTake } from "@/components/memo/MemoVCQuickTake";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, ArrowRight, Printer, RefreshCw, BookOpen, 
  AlertTriangle, Target, Lightbulb, Users, TrendingUp, 
  DollarSign, Shield, Rocket, Eye
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MemoStructuredContent } from "@/types/memo";

const sectionIcons: Record<string, React.ReactNode> = {
  'problem': <AlertTriangle className="w-5 h-5" />,
  'solution': <Lightbulb className="w-5 h-5" />,
  'market': <Target className="w-5 h-5" />,
  'business': <DollarSign className="w-5 h-5" />,
  'traction': <TrendingUp className="w-5 h-5" />,
  'competition': <Shield className="w-5 h-5" />,
  'team': <Users className="w-5 h-5" />,
  'vision': <Rocket className="w-5 h-5" />,
  'thesis': <BookOpen className="w-5 h-5" />,
};

const sectionColors: Record<string, string> = {
  'problem': 'from-red-500/20 to-orange-500/10 border-red-500/30',
  'solution': 'from-blue-500/20 to-cyan-500/10 border-blue-500/30',
  'market': 'from-green-500/20 to-emerald-500/10 border-green-500/30',
  'business': 'from-purple-500/20 to-violet-500/10 border-purple-500/30',
  'traction': 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30',
  'competition': 'from-indigo-500/20 to-blue-500/10 border-indigo-500/30',
  'team': 'from-pink-500/20 to-rose-500/10 border-pink-500/30',
  'vision': 'from-cyan-500/20 to-teal-500/10 border-cyan-500/30',
  'thesis': 'from-emerald-500/20 to-green-500/10 border-emerald-500/30',
};

function getSectionMeta(title: string): { icon: React.ReactNode; color: string } {
  const titleLower = title.toLowerCase();
  
  for (const [key, icon] of Object.entries(sectionIcons)) {
    if (titleLower.includes(key)) {
      return { icon, color: sectionColors[key] || 'from-muted/20 to-muted/10 border-border' };
    }
  }
  
  return { icon: <BookOpen className="w-5 h-5" />, color: 'from-muted/20 to-muted/10 border-border' };
}

function getSectionSummary(section: any): string {
  const paragraphs = section.narrative?.paragraphs || section.paragraphs || [];
  const firstParagraph = paragraphs.find((p: any) => p.emphasis === 'high') || paragraphs[0];
  
  if (firstParagraph?.text) {
    return firstParagraph.text.length > 150 
      ? firstParagraph.text.substring(0, 150) + '...'
      : firstParagraph.text;
  }
  
  return 'Explore this section for detailed analysis...';
}

export default function MemoOverview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");
  
  const [loading, setLoading] = useState(true);
  const [memoContent, setMemoContent] = useState<MemoStructuredContent | null>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [hasPremium, setHasPremium] = useState(false);

  useEffect(() => {
    const loadMemo = async () => {
      if (!companyId) {
        navigate("/portal");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      try {
        const { data: company } = await supabase
          .from("companies")
          .select("*")
          .eq("id", companyId)
          .maybeSingle();

        if (!company) {
          navigate("/portal");
          return;
        }

        setCompanyInfo(company);
        setHasPremium(company.has_premium || false);

        const { data: memo } = await supabase
          .from("memos")
          .select("structured_content")
          .eq("company_id", companyId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (memo?.structured_content) {
          setMemoContent(memo.structured_content as unknown as MemoStructuredContent);
        } else {
          // No memo exists, redirect to generate
          navigate(`/memo?companyId=${companyId}`);
          return;
        }
      } catch (error) {
        console.error("Error loading memo:", error);
        toast({
          title: "Error",
          description: "Failed to load memo overview",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadMemo();
  }, [companyId, navigate]);

  if (loading) {
    return <MemoLoadingScreen />;
  }

  if (!memoContent || !companyInfo) {
    return null;
  }

  const totalSections = memoContent.sections.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        {/* Back Button & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate("/portal")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portal
          </Button>
          
          <div className="flex gap-3">
            <Button 
              variant="default" 
              onClick={() => navigate(`/memo/section?companyId=${companyId}&section=0`)}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Start Reading
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate(`/memo?companyId=${companyId}&view=full`)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Full Memo
            </Button>
          </div>
        </div>

        {/* Company Header */}
        <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-6 md:p-8 shadow-lg mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 text-foreground">
            {companyInfo.name}
          </h1>
          <p className="text-muted-foreground mb-4">{companyInfo.description}</p>
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {companyInfo.stage}
            </span>
            {companyInfo.category && (
              <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium">
                {companyInfo.category}
              </span>
            )}
          </div>
        </div>

        {/* Quick Take */}
        {memoContent.vcQuickTake && (
          <div className="mb-8">
            <MemoVCQuickTake quickTake={memoContent.vcQuickTake} showTeaser={!hasPremium} />
          </div>
        )}

        {/* Section Progress */}
        <div className="bg-card/50 border border-border/50 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Memo Sections</span>
            <span className="text-sm font-semibold text-primary">{totalSections} sections</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>

        {/* Section Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {memoContent.sections.map((section, index) => {
            const { icon, color } = getSectionMeta(section.title);
            const summary = getSectionSummary(section);
            const isLocked = !hasPremium && index > 0;
            
            return (
              <Link
                key={section.title}
                to={isLocked ? `/checkout-memo?companyId=${companyId}` : `/memo/section?companyId=${companyId}&section=${index}`}
                className={`group relative bg-gradient-to-br ${color} rounded-xl p-5 border transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${isLocked ? 'opacity-60' : ''}`}
              >
                {isLocked && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                    <span className="text-sm font-medium text-primary">🔒 Unlock Premium</span>
                  </div>
                )}
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-background/80 flex items-center justify-center text-primary shrink-0">
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground font-medium">Section {index + 1}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {section.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {summary}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-card/50 border border-border/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button 
              variant="default" 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate(`/memo/section?companyId=${companyId}&section=0`)}
            >
              <ArrowRight className="w-5 h-5" />
              <span>Start Section-by-Section</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate(`/memo?companyId=${companyId}&view=full`)}
            >
              <BookOpen className="w-5 h-5" />
              <span>View Full Memo</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => window.print()}
            >
              <Printer className="w-5 h-5" />
              <span>Print / Export PDF</span>
            </Button>
            {!hasPremium && (
              <Button 
                variant="default" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => navigate(`/checkout-memo?companyId=${companyId}`)}
              >
                <Rocket className="w-5 h-5" />
                <span>Unlock Premium</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
