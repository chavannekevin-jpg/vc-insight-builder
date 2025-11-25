import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ArrowLeft, Sparkles, FileText, Target, TrendingUp, AlertCircle, Lightbulb, CheckCircle2, Zap, Building2, Cog } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { marked } from "marked";

interface MemoSection {
  title: string;
  content: string;
}

interface CompanyInfo {
  name: string;
  stage: string;
  category: string;
  description: string;
}

interface StructuredInfo {
  industry: string;
  processImproved: string;
  oneLiner: string;
}

interface InvestmentInsight {
  category: string;
  insight: string;
  sentiment: 'positive' | 'neutral' | 'concern';
  significance: 'high' | 'medium' | 'low';
}

interface NextStepRecommendation {
  action: string;
  rationale: string;
  priority: 'high' | 'medium' | 'low';
}

interface SectionRecommendation {
  recommendation: string;
  rationale: string;
  type: 'opportunity' | 'concern' | 'validation_needed';
}

interface AIAnalysis {
  structuredInfo: StructuredInfo;
  sectionRecommendations?: Record<string, SectionRecommendation[]>;
  investmentInsights: InvestmentInsight[];
  keyStrengths: string[];
  areasForImprovement: string[];
  nextStepRecommendations: NextStepRecommendation[];
}

export default function GeneratedMemo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [sections, setSections] = useState<MemoSection[]>([]);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);

  useEffect(() => {
    const loadMemoAndAnalyze = async () => {
      if (!companyId) {
        toast({
          title: "Error",
          description: "No company ID provided",
          variant: "destructive"
        });
        navigate("/hub");
        return;
      }

      try {
        const { data: existingMemo, error: memoError } = await supabase
          .from("memos")
          .select("content, id")
          .eq("company_id", companyId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (memoError) {
          console.error("Error fetching memo:", memoError);
        }

        if (existingMemo && existingMemo.content) {
          const parsedContent = JSON.parse(existingMemo.content);
          const formattedSections: MemoSection[] = Object.entries(parsedContent.sections).map(
            ([title, content]) => ({
              title,
              content: content as string
            })
          );
          setSections(formattedSections);

          const { data: companyData } = await supabase
            .from("companies")
            .select("name, stage, category, description")
            .eq("id", companyId)
            .single();

          if (companyData) {
            setCompany(companyData);
            
            // First, check if cached analysis exists
            const { data: cachedAnalysis } = await supabase
              .from("memo_analyses")
              .select("analysis")
              .eq("memo_id", existingMemo.id)
              .maybeSingle();

            if (cachedAnalysis?.analysis) {
              // Use cached analysis
              setAiAnalysis(cachedAnalysis.analysis as unknown as AIAnalysis);
            } else {
              // Generate new analysis if none exists
              setAnalyzing(true);
              try {
                const { data: analysisData, error: analysisError } = await supabase.functions.invoke("analyze-memo", {
                  body: {
                    memoContent: parsedContent.sections,
                    companyInfo: companyData,
                    memoId: existingMemo.id
                  }
                });

                if (analysisError) {
                  console.error("Analysis error:", analysisError);
                  toast({
                    title: "Analysis unavailable",
                    description: "Showing memo without AI insights",
                    variant: "destructive"
                  });
                } else if (analysisData) {
                  setAiAnalysis(analysisData);
                }
              } catch (analysisError) {
                console.error("Failed to analyze memo:", analysisError);
              } finally {
                setAnalyzing(false);
              }
            }
          }
          
          setLoading(false);
          return;
        }

        // If no memo exists, generate it
        setGenerating(true);
        const { data, error } = await supabase.functions.invoke("generate-full-memo", {
          body: { companyId }
        });

        if (error) throw error;

        if (data.enhanced && data.company) {
          const formattedSections: MemoSection[] = Object.entries(data.enhanced).map(
            ([title, content]) => ({
              title,
              content: content as string
            })
          );
          setSections(formattedSections);
          setCompany(data.company);
          
          // Analyze newly generated memo
          setAnalyzing(true);
          try {
            const { data: analysisData, error: analysisError } = await supabase.functions.invoke("analyze-memo", {
              body: {
                memoContent: data.enhanced,
                companyInfo: data.company,
                memoId: data.memoId
              }
            });

            if (!analysisError && analysisData) {
              setAiAnalysis(analysisData);
            }
          } catch (analysisError) {
            console.error("Failed to analyze memo:", analysisError);
          } finally {
            setAnalyzing(false);
          }
        }
      } catch (error: any) {
        console.error("Error with memo:", error);
        toast({
          title: "Failed to load memo",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
        setGenerating(false);
      }
    };

    loadMemoAndAnalyze();
  }, [companyId, navigate]);

  const handleDownloadPDF = () => {
    toast({
      title: "PDF Export",
      description: "PDF export will be available soon",
    });
  };

  const handleDownloadDOCX = () => {
    toast({
      title: "DOCX Export",
      description: "DOCX export will be available soon",
    });
  };

  if (loading || generating) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 animate-pulse">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-display font-bold">
                {generating ? "Generating Your Investment Memo" : "Loading Your Memo"}
              </h2>
              <p className="text-muted-foreground font-body">
                {generating ? "This may take a minute as we analyze each section..." : "Please wait..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Lighter Hero Section */}
      <section className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 gradient-hero opacity-30 -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-16 relative">
          <Button
            variant="ghost"
            className="mb-6 hover:bg-card/30 transition-all group font-body"
            onClick={() => navigate("/hub")}
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Hub
          </Button>
          
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3 flex-wrap">
                {company && (
                  <>
                    <Badge className="text-xs px-3 py-1 bg-gradient-primary border-0 text-primary-foreground font-body font-medium">
                      {company.name}
                    </Badge>
                    <Badge variant="outline" className="text-xs px-3 py-1 border-primary/30 bg-card/30 backdrop-blur-sm font-body">
                      {company.stage}
                    </Badge>
                    {company.category && (
                      <Badge variant="outline" className="text-xs px-3 py-1 border-accent/30 bg-card/30 backdrop-blur-sm font-body">
                        {company.category}
                      </Badge>
                    )}
                  </>
                )}
              </div>
              
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight tracking-tight">
                  Investment Memorandum
                </h1>
              </div>
            </div>
            
            <div className="flex lg:flex-col gap-3 lg:items-end">
              <Button
                size="sm"
                variant="outline"
                className="gap-2 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all font-body"
                onClick={handleDownloadPDF}
              >
                <Download className="w-3.5 h-3.5" />
                PDF
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-2 border-accent/20 hover:bg-accent/5 hover:border-accent/40 transition-all font-body"
                onClick={handleDownloadDOCX}
              >
                <FileText className="w-3.5 h-3.5" />
                DOCX
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-16">
        {sections.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-6">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg mb-6 font-body">
              No content generated. Please complete your company profile first.
            </p>
            <Button
              className="gradient-primary shadow-glow hover-neon-pulse font-body"
              onClick={() => navigate("/company")}
            >
              Complete Profile
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* AI Analysis Loading State */}
            {analyzing && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                <p className="text-sm font-body text-muted-foreground">
                  AI is analyzing the memo to generate investment insights...
                </p>
              </div>
            )}

            {/* Structured Company Info - From AI Analysis */}
            {aiAnalysis?.structuredInfo && (
              <section className="animate-fade-in">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-5 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground font-body uppercase tracking-wide">Industry</span>
                    </div>
                    <p className="text-lg font-display font-bold">{aiAnalysis.structuredInfo.industry}</p>
                  </div>
                  
                  <div className="p-5 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Cog className="w-4 h-4 text-accent" />
                      <span className="text-xs text-muted-foreground font-body uppercase tracking-wide">Process Improved</span>
                    </div>
                    <p className="text-sm font-body text-foreground/90">{aiAnalysis.structuredInfo.processImproved}</p>
                  </div>
                  
                  <div className="p-5 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm md:col-span-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-warning" />
                      <span className="text-xs text-muted-foreground font-body uppercase tracking-wide">One-Liner</span>
                    </div>
                    <p className="text-sm font-body font-medium text-foreground/90">{aiAnalysis.structuredInfo.oneLiner}</p>
                  </div>
                </div>
              </section>
            )}

            {/* AI Investment Insights */}
            {aiAnalysis?.investmentInsights && aiAnalysis.investmentInsights.length > 0 && (
              <section className="animate-fade-in">
                <h2 className="text-2xl md:text-3xl font-display font-bold mb-6">
                  Investment Analysis
                </h2>
                
                <div className="space-y-4">
                  {aiAnalysis.investmentInsights.map((insight, idx) => (
                    <div
                      key={idx}
                      className={`p-5 rounded-xl border transition-all ${
                        insight.sentiment === 'positive'
                          ? 'bg-success/5 border-success/30'
                          : insight.sentiment === 'concern'
                          ? 'bg-warning/5 border-warning/30'
                          : 'bg-card/30 border-border/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-body font-medium uppercase tracking-wide text-muted-foreground">
                            {insight.category}
                          </span>
                          {insight.significance === 'high' && (
                            <Badge variant="outline" className="text-xs px-2 py-0 border-primary/40 text-primary">
                              High Priority
                            </Badge>
                          )}
                        </div>
                        {insight.sentiment === 'positive' ? (
                          <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                        ) : insight.sentiment === 'concern' ? (
                          <AlertCircle className="w-4 h-4 text-warning shrink-0" />
                        ) : null}
                      </div>
                      <p className="font-body text-foreground/90 text-sm leading-relaxed">
                        {insight.insight}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Key Strengths & Areas for Improvement - Side by Side */}
            {aiAnalysis && (aiAnalysis.keyStrengths?.length > 0 || aiAnalysis.areasForImprovement?.length > 0) && (
              <section className="animate-fade-in">
                <div className="grid md:grid-cols-2 gap-6">
                  {aiAnalysis.keyStrengths && aiAnalysis.keyStrengths.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="w-5 h-5 text-success" />
                        <h3 className="text-xl font-display font-bold">Key Strengths</h3>
                      </div>
                      <ul className="space-y-3">
                        {aiAnalysis.keyStrengths.map((strength, idx) => (
                          <li key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-success/5 border border-success/20">
                            <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                            <span className="font-body text-sm text-foreground/90">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {aiAnalysis.areasForImprovement && aiAnalysis.areasForImprovement.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Lightbulb className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-display font-bold">Areas for Improvement</h3>
                      </div>
                      <ul className="space-y-3">
                        {aiAnalysis.areasForImprovement.map((area, idx) => (
                          <li key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span className="font-body text-sm text-foreground/90">{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Executive Summary */}
            {company?.description && (
              <section className="animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold">Executive Summary</h2>
                </div>
                <div className="pl-0 md:pl-[52px]">
                  <p className="text-base md:text-lg leading-relaxed text-foreground/80 font-body">
                    {company.description}
                  </p>
                </div>
              </section>
            )}
            
            {/* Memo Sections */}
            <div className="space-y-12">
              {sections.map((section, index) => {
                const sectionRecs = aiAnalysis?.sectionRecommendations?.[section.title] || [];
                
                return (
                  <section 
                    key={index} 
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-primary text-primary-foreground font-display font-bold text-lg shadow-glow">
                        {index + 1}
                      </div>
                      <h2 className="text-2xl md:text-3xl font-display font-bold">{section.title}</h2>
                    </div>
                    
                    <div className="pl-0 md:pl-[52px] space-y-4">
                      <div 
                        className="prose prose-base prose-slate dark:prose-invert max-w-none
                          prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
                          prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6 first:prose-h3:mt-0
                          prose-p:font-body prose-p:text-foreground/80 prose-p:leading-relaxed prose-p:text-base prose-p:mb-4
                          prose-strong:text-foreground prose-strong:font-semibold prose-strong:text-primary/90 prose-strong:font-body
                          prose-ul:my-4 prose-ul:list-disc prose-ul:pl-5
                          prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-5
                          prose-li:font-body prose-li:text-foreground/80 prose-li:my-1.5 prose-li:text-base
                          prose-a:text-primary prose-a:no-underline hover:prose-a:text-primary/80 hover:prose-a:underline prose-a:underline-offset-4
                          prose-blockquote:border-l-2 prose-blockquote:border-primary/40 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:font-body prose-blockquote:text-foreground/70
                          prose-code:text-primary prose-code:bg-muted/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono"
                        dangerouslySetInnerHTML={{ 
                          __html: marked(section.content, { 
                            breaks: true,
                            gfm: true 
                          }) 
                        }}
                      />
                      
                      {/* AI Section Recommendations */}
                      {sectionRecs.length > 0 && (
                        <div className="p-5 rounded-xl border border-border/50 bg-card/20 backdrop-blur-sm">
                          <div className="flex items-center gap-2 mb-4">
                            <Lightbulb className="w-4 h-4 text-primary" />
                            <h4 className="text-sm font-display font-bold text-foreground">AI Recommendations</h4>
                          </div>
                          <div className="space-y-3">
                            {sectionRecs.map((rec, idx) => (
                              <div key={idx} className="space-y-1.5">
                                <div className="flex items-start gap-2">
                                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-body font-medium shrink-0 ${
                                    rec.type === 'opportunity' ? 'bg-success/10 text-success' :
                                    rec.type === 'concern' ? 'bg-warning/10 text-warning' :
                                    'bg-primary/10 text-primary'
                                  }`}>
                                    {rec.type === 'validation_needed' ? 'Validation' : rec.type}
                                  </span>
                                  <p className="text-sm font-body text-foreground/90 leading-relaxed flex-1">
                                    {rec.recommendation}
                                  </p>
                                </div>
                                <p className="text-xs font-body text-muted-foreground leading-relaxed pl-[60px]">
                                  {rec.rationale}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>

            {/* AI-Generated Next Steps */}
            {aiAnalysis?.nextStepRecommendations && aiAnalysis.nextStepRecommendations.length > 0 && (
              <section className="animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
                    <Target className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold">Recommended Next Steps</h2>
                </div>
                
                <div className="pl-0 md:pl-[52px] space-y-4">
                  {aiAnalysis.nextStepRecommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`px-2 py-0.5 rounded text-xs font-body font-medium ${
                            rec.priority === 'high' 
                              ? 'bg-primary/20 text-primary' 
                              : rec.priority === 'medium'
                              ? 'bg-accent/20 text-accent'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {rec.priority}
                          </div>
                        </div>
                        <Lightbulb className="w-4 h-4 text-primary shrink-0" />
                      </div>
                      <h4 className="font-body font-semibold text-foreground mb-2">{rec.action}</h4>
                      <p className="font-body text-sm text-muted-foreground leading-relaxed">
                        {rec.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <section className="relative border-t border-border/30 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-20" />
        
        <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">Ready to Iterate?</h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto mb-8 font-body">
            Update your company profile to refine your investment memo and strengthen your narrative.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate("/company")}
              className="gradient-primary shadow-glow hover-neon-pulse font-body font-medium px-6"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Update Profile
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/hub")}
              className="border-primary/20 hover:bg-primary/5 hover:border-primary/40 font-body px-6"
            >
              Back to Hub
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}