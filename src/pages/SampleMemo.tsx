import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MemoSection } from "@/components/memo/MemoSection";
import { MemoParagraph } from "@/components/memo/MemoParagraph";
import { MemoHighlight } from "@/components/memo/MemoHighlight";
import { MemoKeyPoints } from "@/components/memo/MemoKeyPoints";
import { MemoVCReflection } from "@/components/memo/MemoVCReflection";
import { MemoVCQuestions } from "@/components/memo/MemoVCQuestions";
import { MemoBenchmarking } from "@/components/memo/MemoBenchmarking";
import { MemoAIConclusion } from "@/components/memo/MemoAIConclusion";
import type { MemoStructuredContent } from "@/types/memo";

const DEMO_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

const SampleMemo = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [memoContent, setMemoContent] = useState<MemoStructuredContent | null>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);

  useEffect(() => {
    fetchMemo();
  }, []);

  const fetchMemo = async () => {
    try {
      setLoading(true);

      // Fetch the pre-generated demo memo
      const { data: existingMemo, error: fetchError } = await supabase
        .from('memos')
        .select('structured_content, company:companies(*)')
        .eq('company_id', DEMO_COMPANY_ID)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingMemo && existingMemo.structured_content) {
        setMemoContent(existingMemo.structured_content as unknown as MemoStructuredContent);
        setCompanyInfo(existingMemo.company);
      } else {
        toast.error('Sample memo not yet generated. Please contact support.');
      }
    } catch (error: any) {
      console.error('Error loading sample memo:', error);
      toast.error('Failed to load sample memo');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Sparkles className="w-12 h-12 text-primary animate-pulse mx-auto" />
          <p className="text-lg font-medium">Loading sample memo...</p>
        </div>
      </div>
    );
  }

  if (!memoContent || !companyInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg">Unable to load sample memo</p>
          <Button onClick={() => navigate('/vcbrain')}>Back to Hub</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/vcbrain')}
              className="gap-2 hover:bg-primary/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Hub</span>
            </Button>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium">Sample Investment Memo</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Company Header */}
        <div className="mb-16 space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-foreground tracking-tight">{companyInfo.name}</h1>
            <div className="flex flex-wrap gap-3 items-center">
              <span className="px-4 py-1.5 bg-primary/15 text-primary rounded-full font-medium text-sm border border-primary/30">
                {companyInfo.stage}
              </span>
              <span className="text-muted-foreground font-medium">{companyInfo.category}</span>
            </div>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">{companyInfo.description}</p>
          </div>

          {/* Note about sample */}
          <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-6 shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="relative flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-amber-600 uppercase tracking-wide">Sample Preview - Limited Content Unlocked</p>
                <p className="text-sm text-foreground leading-relaxed">
                  This is a <strong>partial sample</strong> with fictional data. Premium analysis elements are blurred to protect our proprietary methodology 
                  (including market benchmarking, VC perspectives, and investor questions). Your full personalized memo includes <strong>8+ comprehensive sections</strong> 
                  with complete, unblurred insights: Problem, Solution, Market, Competition, Team, USP, Business Model, Traction, Go-to-Market, and Investment Thesis.
                </p>
                <p className="text-xs text-muted-foreground italic pt-1">
                  🔒 Several sections and premium subsections are locked to showcase structure while protecting IP.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Memo Sections */}
        <div className="space-y-16">
          {memoContent.sections.map((section, index) => {
            const shouldBlurEntireSection = ['Solution', 'Competition'].includes(section.title);
            const shouldBlurBenchmarking = section.title === 'Problem';
            const shouldBlurVCReflection = section.title === 'Market';
            const shouldBlurQuestions = section.title === 'Traction';
            
            return (
              <MemoSection key={index} title={section.title} index={index}>
                {shouldBlurEntireSection && (
                  <div className="absolute inset-0 z-10 bg-background/40 backdrop-blur-md rounded-3xl flex items-center justify-center">
                    <div className="bg-card/95 border-2 border-primary/30 rounded-2xl p-6 shadow-xl text-center max-w-md mx-auto">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">Unlock Full Analysis</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        This section is available in your personalized memo
                      </p>
                      <Button size="sm" onClick={() => navigate('/memo-builder')}>
                        Create Your Memo
                      </Button>
                    </div>
                  </div>
                )}
                <div className={shouldBlurEntireSection ? 'blur-sm pointer-events-none select-none' : ''}>
                  {/* Narrative Content */}
                  {(section.narrative || section.paragraphs || section.highlights || section.keyPoints) && (
                    <div className="space-y-8">
                      {/* Paragraphs */}
                      {(section.narrative?.paragraphs || section.paragraphs)?.map((para, pIndex) => (
                        <MemoParagraph
                          key={pIndex}
                          text={para.text}
                          emphasis={para.emphasis}
                        />
                      ))}

                      {/* Highlights */}
                      {(section.narrative?.highlights || section.highlights) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
                          {(section.narrative?.highlights || section.highlights)?.map((highlight, hIndex) => (
                            <MemoHighlight
                              key={hIndex}
                              metric={highlight.metric}
                              label={highlight.label}
                            />
                          ))}
                        </div>
                      )}

                      {/* Key Points */}
                      {(section.narrative?.keyPoints || section.keyPoints) && (
                        <MemoKeyPoints points={section.narrative?.keyPoints || section.keyPoints || []} />
                      )}
                    </div>
                  )}

                  {/* VC Reflection */}
                  {section.vcReflection && (
                    <div className="mt-10 space-y-8 pt-8 border-t border-border/50">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">Investor Perspective</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                      </div>
                      
                      {/* VC Analysis - blur for Market section */}
                      <div className={shouldBlurVCReflection ? 'relative' : ''}>
                        {shouldBlurVCReflection && (
                          <div className="absolute inset-0 z-10 bg-background/40 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <div className="bg-card/95 border border-primary/30 rounded-xl px-4 py-3 shadow-lg text-center">
                              <p className="text-xs font-semibold text-primary mb-1">🔒 Premium Analysis</p>
                              <p className="text-xs text-muted-foreground">Available in your personalized memo</p>
                            </div>
                          </div>
                        )}
                        <div className={shouldBlurVCReflection ? 'blur-sm select-none' : ''}>
                          <MemoVCReflection text={section.vcReflection.analysis} />
                        </div>
                      </div>
                      
                      {/* Investor Questions - blur for Traction section */}
                      {section.vcReflection.questions && section.vcReflection.questions.length > 0 && (
                        <div className={shouldBlurQuestions ? 'relative' : ''}>
                          {shouldBlurQuestions && (
                            <div className="absolute inset-0 z-10 bg-background/40 backdrop-blur-sm rounded-xl flex items-center justify-center">
                              <div className="bg-card/95 border border-primary/30 rounded-xl px-4 py-3 shadow-lg text-center">
                                <p className="text-xs font-semibold text-primary mb-1">🔒 Premium Analysis</p>
                                <p className="text-xs text-muted-foreground">Available in your personalized memo</p>
                              </div>
                            </div>
                          )}
                          <div className={shouldBlurQuestions ? 'blur-sm select-none' : ''}>
                            <MemoVCQuestions questions={section.vcReflection.questions} />
                          </div>
                        </div>
                      )}
                      
                      {/* Benchmarking - blur for Problem section */}
                      {section.vcReflection.benchmarking && (
                        <div className={shouldBlurBenchmarking ? 'relative' : ''}>
                          {shouldBlurBenchmarking && (
                            <div className="absolute inset-0 z-10 bg-background/40 backdrop-blur-sm rounded-xl flex items-center justify-center">
                              <div className="bg-card/95 border border-primary/30 rounded-xl px-4 py-3 shadow-lg text-center">
                                <p className="text-xs font-semibold text-primary mb-1">🔒 Premium Analysis</p>
                                <p className="text-xs text-muted-foreground">Available in your personalized memo</p>
                              </div>
                            </div>
                          )}
                          <div className={shouldBlurBenchmarking ? 'blur-sm select-none' : ''}>
                            <MemoBenchmarking text={section.vcReflection.benchmarking} />
                          </div>
                        </div>
                      )}
                      
                      <MemoAIConclusion text={section.vcReflection.conclusion} />
                    </div>
                  )}
                </div>
              </MemoSection>
            );
          })}

          {/* Placeholder Locked Sections */}
          {['USP & Competitive Moats', 'Go-to-Market Strategy', 'Funding & Investment Thesis'].map((title, idx) => (
            <MemoSection key={`locked-${idx}`} title={title} index={memoContent.sections.length + idx}>
              <div className="absolute inset-0 z-10 bg-background/40 backdrop-blur-md rounded-3xl flex items-center justify-center">
                <div className="bg-card/95 border-2 border-primary/30 rounded-2xl p-6 shadow-xl text-center max-w-md mx-auto">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Unlock Full Analysis</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    This section is available in your personalized memo
                  </p>
                  <Button size="sm" onClick={() => navigate('/memo-builder')}>
                    Create Your Memo
                  </Button>
                </div>
              </div>
              <div className="blur-sm pointer-events-none select-none">
                {/* Placeholder content */}
                <div className="space-y-8">
                  <MemoParagraph 
                    text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                    emphasis="high"
                  />
                  <MemoParagraph 
                    text="Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
                    emphasis="normal"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
                    <MemoHighlight metric="XX%" label="Sample metric" />
                    <MemoHighlight metric="€XXM" label="Sample value" />
                    <MemoHighlight metric="XX" label="Sample count" />
                  </div>
                  <MemoKeyPoints points={[
                    "Sample key point for demonstration purposes",
                    "Another sample takeaway showing structure",
                    "Third sample point illustrating format"
                  ]} />
                </div>
                <div className="mt-10 space-y-8 pt-8 border-t border-border/50">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Investor Perspective</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                  </div>
                  <MemoVCReflection text="Sample VC reflection text that demonstrates the format and structure of our investor analysis. This section provides deep insights into how VCs would evaluate this aspect of your business." />
                  <MemoVCQuestions questions={[
                    "Sample investor question about your business?",
                    "Another critical question VCs would ask?",
                    "Third important question for validation?"
                  ]} />
                  <MemoAIConclusion text="Sample investment synopsis showing how we synthesize the analysis into actionable insights for founders and investors." />
                </div>
              </div>
            </MemoSection>
          ))}

          {/* Call to Action */}
          <div className="mt-24 relative overflow-hidden rounded-3xl border border-primary/30 shadow-2xl animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            
            <div className="relative p-12 text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">Ready to Create Your Memo?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
                Get the same depth of VC-focused analysis tailored to your startup. Our AI-powered platform 
                helps you craft a compelling investment memorandum that resonates with investors.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/memo-builder')}
                  className="group relative overflow-hidden px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <span className="relative z-10">Create Your Memo</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/vcbrain')}
                  className="px-8 py-6 text-lg border-2 hover:bg-primary/5"
                >
                  Explore Resources
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SampleMemo;
