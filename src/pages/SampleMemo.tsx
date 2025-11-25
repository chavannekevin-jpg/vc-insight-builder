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
  const [generating, setGenerating] = useState(false);
  const [memoContent, setMemoContent] = useState<MemoStructuredContent | null>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);

  useEffect(() => {
    fetchOrGenerateMemo();
  }, []);

  const fetchOrGenerateMemo = async () => {
    try {
      setLoading(true);

      // Try to fetch existing memo
      const { data: existingMemo, error: fetchError } = await supabase
        .from('memos')
        .select('structured_content, company:companies(*)')
        .eq('company_id', DEMO_COMPANY_ID)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingMemo && existingMemo.structured_content) {
        setMemoContent(existingMemo.structured_content as unknown as MemoStructuredContent);
        setCompanyInfo(existingMemo.company);
        setLoading(false);
        return;
      }

      // If no memo exists, generate it
      setGenerating(true);
      const { data: generatedData, error: generateError } = await supabase.functions.invoke('generate-full-memo', {
        body: { companyId: DEMO_COMPANY_ID }
      });

      if (generateError) throw generateError;

      if (generatedData?.structuredContent) {
        setMemoContent(generatedData.structuredContent);
        setCompanyInfo(generatedData.company);
      }
    } catch (error: any) {
      console.error('Error loading sample memo:', error);
      toast.error('Failed to load sample memo');
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  if (loading || generating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Sparkles className="w-12 h-12 text-primary animate-pulse mx-auto" />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {generating ? 'Generating sample memo with AI...' : 'Loading sample memo...'}
            </p>
            <p className="text-sm text-muted-foreground">
              This showcases the actual memo generation process
            </p>
          </div>
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
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/vcbrain')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Hub
            </Button>
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span className="text-sm">Sample Investment Memo</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Company Header */}
        <div className="mb-12 space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">{companyInfo.name}</h1>
            <div className="flex flex-wrap gap-3 items-center text-sm">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                {companyInfo.stage}
              </span>
              <span className="text-muted-foreground">{companyInfo.category}</span>
            </div>
            <p className="text-lg text-muted-foreground">{companyInfo.description}</p>
          </div>

          {/* Note about sample */}
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
            <p className="text-sm text-foreground">
              <strong>Sample Memo:</strong> This memo was generated using our actual AI methodology with fictional company data. 
              Your memo will follow this exact format, depth of analysis, and VC-focused insights tailored to your startup.
            </p>
          </div>
        </div>

        {/* Memo Sections */}
        <div className="space-y-12">
          {memoContent.sections.map((section, index) => (
            <MemoSection key={index} title={section.title}>
              {/* Narrative Content */}
              {(section.narrative || section.paragraphs || section.highlights || section.keyPoints) && (
                <div className="space-y-6">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
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
                <div className="mt-8 space-y-6">
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
          <div className="mt-16 p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Ready to Create Your Personalized Memo?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get the same depth of VC-focused analysis for your own startup. Our AI will help you craft a compelling 
                investment memorandum that resonates with investors.
              </p>
              <Button
                size="lg"
                onClick={() => navigate('/memo-builder')}
                className="mt-4"
              >
                Create Your Memo
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SampleMemo;
