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
          <Sparkles className="w-12 h-12 neon-pink pulse-glow mx-auto" />
          <p className="text-lg font-medium neon-pink">Loading sample memo...</p>
        </div>
      </div>
    );
  }

  if (!memoContent || !companyInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg text-foreground">Unable to load sample memo</p>
          <Button className="gradient-primary shadow-glow" onClick={() => navigate('/vcbrain')}>Back to Hub</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/80 backdrop-blur-md sticky top-0 z-10 shadow-glow">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/vcbrain')}
              className="gap-2 hover:bg-primary/10 transition-colors neon-pink"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Hub</span>
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shadow-glow">
                <FileText className="w-4 h-4 neon-pink" />
              </div>
              <span className="text-sm font-medium neon-pink">Sample Investment Memo</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Psychological Framing Block */}
        <div className="mb-12 animate-fade-in">
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 border-2 border-primary/30 rounded-3xl p-10 shadow-glow-strong hover-lift">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />
            <div className="relative z-10 text-center space-y-3">
              <p className="text-2xl md:text-3xl font-bold text-foreground leading-relaxed">
                This is the document written about you after the partner meeting.
              </p>
              <p className="text-xl md:text-2xl text-muted-foreground font-medium">
                Not the deck you present — the document VCs debate without you in the room.
              </p>
            </div>
          </div>
        </div>

        {/* Company Header */}
        <div className="mb-16 space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold neon-pink tracking-tight hover-neon-pulse inline-block">{companyInfo.name}</h1>
            <div className="flex flex-wrap gap-3 items-center">
              <span className="px-4 py-1.5 gradient-primary text-primary-foreground rounded-full font-bold text-sm shadow-glow hover-punch">
                {companyInfo.stage}
              </span>
              <span className="text-foreground font-medium neon-pink">{companyInfo.category}</span>
            </div>
            <p className="text-xl text-foreground leading-relaxed max-w-3xl">{companyInfo.description}</p>
          </div>

          {/* Note about sample */}
          <div className="relative overflow-hidden gradient-accent border border-primary/20 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="relative flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                <Sparkles className="w-6 h-6 text-primary-foreground animate-pulse" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold neon-pink uppercase tracking-wide">✨ Sample Preview - Limited Content Unlocked</p>
                <p className="text-sm text-foreground leading-relaxed">
                  This is a <strong className="neon-pink">partial sample</strong> with fictional data. Premium analysis elements are blurred to protect our proprietary methodology 
                  (including market benchmarking, VC perspectives, and investor questions). Your full personalized memo includes <strong className="neon-pink">8+ comprehensive sections</strong> 
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
                  <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-lg rounded-3xl flex items-center justify-center">
                    <div className="bg-card/95 border-2 border-primary/50 rounded-2xl p-6 shadow-glow-strong text-center max-w-md mx-auto hover-lift">
                      <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow pulse-glow">
                        <svg className="w-7 h-7 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold neon-pink mb-2">🔒 Unlock Full Analysis</h3>
                      <p className="text-sm text-foreground mb-4">
                        This section is available in your personalized memo
                      </p>
                      <Button size="sm" className="gradient-primary hover:shadow-glow-strong transition-all" onClick={() => navigate('/memo-builder')}>
                        <Sparkles className="w-4 h-4 mr-2" />
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
                          <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <div className="bg-card/95 border-2 border-primary/50 rounded-xl px-4 py-3 shadow-glow text-center hover-punch">
                              <p className="text-xs font-bold neon-pink mb-1">🔒 Premium Analysis</p>
                              <p className="text-xs text-foreground">Available in your personalized memo</p>
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
                            <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
                              <div className="bg-card/95 border-2 border-primary/50 rounded-xl px-4 py-3 shadow-glow text-center hover-punch">
                                <p className="text-xs font-bold neon-pink mb-1">🔒 Premium Analysis</p>
                                <p className="text-xs text-foreground">Available in your personalized memo</p>
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
                            <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
                              <div className="bg-card/95 border-2 border-primary/50 rounded-xl px-4 py-3 shadow-glow text-center hover-punch">
                                <p className="text-xs font-bold neon-pink mb-1">🔒 Premium Analysis</p>
                                <p className="text-xs text-foreground">Available in your personalized memo</p>
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

          {/* Mid-page CTA - appears after viewing some sections */}
          <div className="my-16 relative overflow-hidden gradient-primary rounded-3xl p-8 border-2 border-primary/30 shadow-glow-strong animate-fade-in hover-lift">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-foreground/10 rounded-full blur-2xl" />
            <div className="relative z-10 text-center space-y-4">
              <h3 className="text-3xl font-bold text-primary-foreground">Ready to Unlock Your Full Memo?</h3>
              <p className="text-primary-foreground/90 text-lg max-w-2xl mx-auto">
                Get all 8+ sections with complete analysis, VC perspectives, market benchmarking, and investor questions tailored to your startup.
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                className="mt-4 text-lg font-bold px-10 py-6 shadow-xl hover:scale-105 transition-transform"
                onClick={() => navigate('/memo-builder')}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Create Your Personalized Memo
              </Button>
            </div>
          </div>

            {/* Placeholder Locked Sections */}
            {['USP & Competitive Moats', 'Go-to-Market Strategy', 'Funding & Investment Thesis'].map((title, idx) => (
              <MemoSection key={`locked-${idx}`} title={title} index={memoContent.sections.length + idx}>
                <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-lg rounded-3xl flex items-center justify-center">
                  <div className="bg-card/95 border-2 border-primary/50 rounded-2xl p-6 shadow-glow-strong text-center max-w-md mx-auto hover-lift">
                    <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow pulse-glow">
                      <svg className="w-7 h-7 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold neon-pink mb-2">🔒 Unlock Full Analysis</h3>
                    <p className="text-sm text-foreground mb-4">
                      This section is available in your personalized memo
                    </p>
                    <Button size="sm" className="gradient-primary hover:shadow-glow-strong transition-all" onClick={() => navigate('/memo-builder')}>
                      <Sparkles className="w-4 h-4 mr-2" />
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
          <div className="mt-24 relative overflow-hidden rounded-3xl border-2 border-primary/40 shadow-glow-strong animate-fade-in hover-neon-pulse" style={{ animationDelay: '0.5s' }}>
            <div className="absolute inset-0 gradient-accent" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            
            <div className="relative p-12 text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-glow mb-4 pulse-glow">
                <Sparkles className="w-8 h-8 text-primary-foreground animate-pulse" />
              </div>
              <h2 className="text-4xl font-bold neon-pink mb-2">Ready to Create Your Memo?</h2>
              <p className="text-foreground max-w-2xl mx-auto text-lg leading-relaxed">
                Get the same depth of VC-focused analysis tailored to your startup. Our AI-powered platform 
                helps you craft a compelling investment memorandum that resonates with investors.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto my-8 text-sm">
                <div className="flex items-center justify-center gap-2 text-foreground">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Complete in Minutes</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-foreground">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>VC-Grade Analysis</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-foreground">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Impress Investors</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/memo-builder')}
                  className="gradient-primary hover:shadow-glow-strong px-10 py-7 text-xl font-bold shadow-glow transition-all duration-300 hover-punch"
                >
                  <Sparkles className="w-6 h-6 mr-2 pulse-glow" />
                  Create Your Memo Now
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/pricing')}
                  className="px-8 py-7 text-lg border-2 border-primary/40 hover:bg-primary/10 hover:border-primary neon-pink font-semibold transition-all"
                >
                  View Pricing
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom CTA Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t-2 border-primary/30 shadow-glow-strong animate-fade-in">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="hidden md:block">
                <p className="text-sm font-bold neon-pink">Impressed by what you see?</p>
                <p className="text-xs text-muted-foreground">Create your complete memo with all sections unlocked</p>
              </div>
              <div className="flex gap-3 ml-auto">
                <Button 
                  size="lg" 
                  className="gradient-primary hover:shadow-glow-strong transition-all font-bold px-8 shadow-glow whitespace-nowrap"
                  onClick={() => navigate('/memo-builder')}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Your Memo
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
