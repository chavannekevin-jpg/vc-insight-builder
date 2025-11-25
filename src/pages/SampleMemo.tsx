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
          <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/30 rounded-2xl p-6 shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="relative flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-primary">AI-Generated Sample</p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  This memo showcases our actual AI methodology using fictional data. Your personalized memo will follow 
                  this exact format with VC-focused insights tailored to your startup.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Memo Sections */}
        <div className="space-y-16">
          {memoContent.sections.map((section, index) => (
            <MemoSection key={index} title={section.title} index={index}>
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
                  
                  <MemoVCReflection text={section.vcReflection.analysis} />
                  
                  {section.vcReflection.questions && section.vcReflection.questions.length > 0 && (
                    <MemoVCQuestions questions={section.vcReflection.questions} />
                  )}
                  
                  {section.vcReflection.benchmarking && (
                    <MemoBenchmarking text={section.vcReflection.benchmarking} />
                  )}
                  
                  <MemoAIConclusion text={section.vcReflection.conclusion} />
                </div>
              )}
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
