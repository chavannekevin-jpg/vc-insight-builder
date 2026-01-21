import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { 
  Zap, 
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Target,
  Gift,
  ArrowRight,
  Sparkles,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { buildHolisticScorecard, type SectionVerdict } from "@/lib/holisticVerdictGenerator";

const STATUS_CONFIG = {
  critical: { color: 'text-destructive', icon: XCircle },
  weak: { color: 'text-warning', icon: AlertTriangle },
  passing: { color: 'text-success', icon: CheckCircle2 },
  strong: { color: 'text-success', icon: TrendingUp }
};

const READINESS_CONFIG = {
  'NOT_READY': { color: 'text-destructive', bg: 'bg-destructive/10', label: 'Not Ready' },
  'CONDITIONAL': { color: 'text-warning', bg: 'bg-warning/10', label: 'Conditional' },
  'READY': { color: 'text-success', bg: 'bg-success/10', label: 'Ready' }
};

interface CompanyData {
  id: string;
  name: string;
  stage: string;
  category: string | null;
  scoreboard_opt_in: boolean;
  scoreboard_anonymous: boolean;
  public_score: number | null;
}

export default function PublicScorecard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const companyId = searchParams.get('id');
  const referralCode = searchParams.get('ref');
  
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [sectionTools, setSectionTools] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!companyId) {
      setError('No scorecard found');
      setLoading(false);
      return;
    }
    
    loadScorecard();
  }, [companyId]);
  
  const loadScorecard = async () => {
    try {
      // Fetch company with public scorecard opt-in
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id, name, stage, category, scoreboard_opt_in, scoreboard_anonymous, public_score')
        .eq('id', companyId)
        .eq('scoreboard_opt_in', true)
        .single();
      
      if (companyError || !companyData) {
        setError('This scorecard is not publicly available');
        setLoading(false);
        return;
      }
      
      setCompany(companyData);
      
      // Fetch section scores from memo_tool_data
      const { data: toolsData } = await supabase
        .from('memo_tool_data')
        .select('section_name, tool_name, ai_generated_data')
        .eq('company_id', companyId)
        .eq('tool_name', 'sectionScore');
      
      if (toolsData) {
        const tools: Record<string, any> = {};
        toolsData.forEach(tool => {
          if (!tools[tool.section_name]) {
            tools[tool.section_name] = {};
          }
          tools[tool.section_name].sectionScore = tool.ai_generated_data as any;
        });
        setSectionTools(tools);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load scorecard');
      setLoading(false);
    }
  };
  
  const scorecard = useMemo(() => {
    if (!company || Object.keys(sectionTools).length === 0) return null;
    return buildHolisticScorecard(
      sectionTools, 
      company.scoreboard_anonymous ? 'Anonymous Startup' : company.name, 
      company.stage, 
      company.category || undefined
    );
  }, [sectionTools, company]);
  
  const radarData = useMemo(() => {
    if (!scorecard) return [];
    return scorecard.sections.map(s => ({
      section: s.section.substring(0, 3).toUpperCase(),
      score: s.score,
      benchmark: s.benchmark,
      fullMark: 100
    }));
  }, [scorecard]);
  
  const handleGetStarted = () => {
    const url = referralCode 
      ? `/invite?founder=${referralCode}` 
      : '/auth';
    navigate(url);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  if (error || !company || !scorecard) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <Lock className="w-12 h-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-bold">Scorecard Not Available</h2>
            <p className="text-muted-foreground">{error || 'This scorecard is private or does not exist.'}</p>
            <Button onClick={() => navigate('/auth')} className="gradient-primary">
              Create Your Own Analysis
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const readinessConfig = READINESS_CONFIG[scorecard.investmentReadiness];
  const displayName = company.scoreboard_anonymous ? 'Anonymous Startup' : company.name;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">Investment Readiness</h1>
              <p className="text-xs text-muted-foreground">Powered by UglyBaby</p>
            </div>
          </div>
          
          {referralCode && (
            <Badge variant="secondary" className="bg-success/10 text-success border-success/30">
              <Gift className="w-3 h-3 mr-1.5" />
              20% Discount Available
            </Badge>
          )}
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Company Header */}
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-4">{company.stage}</Badge>
          <h1 className="text-3xl font-bold text-foreground mb-2">{displayName}</h1>
          <p className="text-muted-foreground">Investment Readiness Scorecard</p>
        </div>
        
        {/* Scorecard */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 shadow-glow mb-10">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Score + Radar */}
              <div className="space-y-6">
                {/* Score Circle */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className={cn(
                      "w-28 h-28 rounded-full flex items-center justify-center",
                      "bg-gradient-to-br from-card to-muted border-2",
                      scorecard.overallScore >= 65 ? "border-success shadow-[0_0_30px_rgba(34,197,94,0.3)]" :
                      scorecard.overallScore >= 50 ? "border-warning shadow-[0_0_30px_rgba(234,179,8,0.3)]" :
                      "border-destructive shadow-[0_0_30px_rgba(239,68,68,0.3)]"
                    )}>
                      <div className="text-center">
                        <span className="text-4xl font-bold text-foreground">{scorecard.overallScore}</span>
                        <span className="text-sm text-muted-foreground block">/100</span>
                      </div>
                    </div>
                    <div className={cn(
                      "absolute inset-0 rounded-full opacity-20 animate-ping",
                      scorecard.overallScore >= 65 ? "bg-success" :
                      scorecard.overallScore >= 50 ? "bg-warning" : "bg-destructive"
                    )} style={{ animationDuration: '3s' }} />
                  </div>
                  
                  <div>
                    <div className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-2",
                      readinessConfig.bg,
                      readinessConfig.color
                    )}>
                      <Shield className="w-4 h-4" />
                      {readinessConfig.label}
                    </div>
                    <p className="text-sm text-muted-foreground max-w-[200px]">
                      Based on VC evaluation criteria
                    </p>
                  </div>
                </div>
                
                {/* Radar Chart */}
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} margin={{ top: 15, right: 30, bottom: 15, left: 30 }}>
                      <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.4} />
                      <PolarAngleAxis 
                        dataKey="section" 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 500 }}
                      />
                      <Radar
                        name="Benchmark"
                        dataKey="benchmark"
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth={1}
                        strokeDasharray="4 4"
                        fill="transparent"
                      />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                        style={{ filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.4))' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Section Cards (Preview) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    Section Breakdown
                  </h3>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {scorecard.sections.slice(0, 4).map((section) => {
                    const config = STATUS_CONFIG[section.status];
                    const Icon = config.icon;
                    return (
                      <div 
                        key={section.section}
                        className="p-3 rounded-lg bg-muted/30 border border-border/50"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-foreground truncate">
                            {section.section}
                          </span>
                          <Icon className={cn("w-3.5 h-3.5", config.color)} />
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className={cn(
                            "text-xl font-bold tabular-nums",
                            section.score >= section.benchmark ? "text-success" : 
                            section.score >= section.benchmark - 15 ? "text-warning" : "text-destructive"
                          )}>
                            {section.score}
                          </span>
                          <span className="text-xs text-muted-foreground">/{section.benchmark}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Blurred preview of remaining sections */}
                <div className="relative">
                  <div className="grid grid-cols-2 gap-2 blur-sm">
                    {scorecard.sections.slice(4, 8).map((section) => (
                      <div 
                        key={section.section}
                        className="p-3 rounded-lg bg-muted/30 border border-border/50"
                      >
                        <div className="h-8" />
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground bg-background/80 px-3 py-1 rounded-full">
                      +{scorecard.sections.length - 4} more sections
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <CardContent className="p-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              {referralCode ? 'Exclusive 20% Discount' : 'Get Your Own Analysis'}
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-3">
              How Investment Ready is Your Startup?
            </h2>
            
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Get a comprehensive VC-style analysis of your business in minutes. 
              Understand exactly how investors will evaluate your pitch.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button onClick={handleGetStarted} size="lg" className="gradient-primary shadow-glow gap-2">
                Get Your Scorecard
                <ArrowRight className="w-4 h-4" />
              </Button>
              
              {referralCode && (
                <p className="text-sm text-success flex items-center gap-1.5">
                  <Gift className="w-4 h-4" />
                  20% off with referral code
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Powered by UglyBaby • Investment Readiness Analysis</p>
        </div>
      </main>
    </div>
  );
}
