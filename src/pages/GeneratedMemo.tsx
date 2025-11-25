import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { WaitlistModal } from "@/components/WaitlistModal";
import { useWaitlistMode, useUserWaitlistStatus } from "@/hooks/useWaitlistMode";
import { MemoSection } from "@/components/memo/MemoSection";
import { MemoParagraph } from "@/components/memo/MemoParagraph";
import { MemoKeyPoints } from "@/components/memo/MemoKeyPoints";
import { MemoHighlight } from "@/components/memo/MemoHighlight";
import { MemoVCReflection } from "@/components/memo/MemoVCReflection";
import { MemoVCQuestions } from "@/components/memo/MemoVCQuestions";
import { MemoBenchmarking } from "@/components/memo/MemoBenchmarking";
import { MemoAIConclusion } from "@/components/memo/MemoAIConclusion";
import { Sparkles, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MemoStructuredContent } from "@/types/memo";
import { Button } from "@/components/ui/button";

export default function GeneratedMemo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");
  
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [memoContent, setMemoContent] = useState<MemoStructuredContent | null>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);

  const { data: waitlistMode } = useWaitlistMode();
  const { data: userWaitlistStatus } = useUserWaitlistStatus(userId || undefined, companyId || undefined);

  useEffect(() => {
    const init = async () => {
      if (!companyId) {
        toast({
          title: "Error",
          description: "No company ID provided",
          variant: "destructive"
        });
        navigate("/portal");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      // Check waitlist mode
      if (waitlistMode?.isActive && (!userWaitlistStatus || !userWaitlistStatus.has_paid)) {
        setShowWaitlistModal(true);
        setLoading(false);
        return;
      }

      // Fetch the memo
      try {
        const { data: memo, error: memoError } = await supabase
          .from("memos")
          .select("structured_content, company_id")
          .eq("company_id", companyId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (memoError) throw memoError;

        if (!memo || !memo.structured_content) {
          // No memo exists, generate one
          const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-full-memo', {
            body: { companyId }
          });

          if (functionError) throw functionError;

          setMemoContent(functionData.structuredContent);
          setCompanyInfo(functionData.company);
        } else {
          // Memo exists, fetch company info
          const { data: company, error: companyError } = await supabase
            .from("companies")
            .select("*")
            .eq("id", companyId)
            .single();

          if (companyError) throw companyError;

          setMemoContent(memo.structured_content as unknown as MemoStructuredContent);
          setCompanyInfo(company);
        }
      } catch (error) {
        console.error("Error loading memo:", error);
        toast({
          title: "Error",
          description: "Failed to load memo",
          variant: "destructive"
        });
      }
      
      setLoading(false);
    };
    init();
  }, [companyId, waitlistMode, userWaitlistStatus, navigate]);

  if (showWaitlistModal || (waitlistMode?.isActive && (!userWaitlistStatus || !userWaitlistStatus.has_paid))) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <WaitlistModal 
          open={true} 
          onOpenChange={(open) => {
            setShowWaitlistModal(open);
            if (!open) navigate("/portal");
          }}
          companyId={companyId || undefined}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  if (!memoContent || !companyInfo) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">No memo content available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header Section */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/portal")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portal
          </Button>

          <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-lg">
            <h1 className="text-4xl font-display font-bold mb-4 text-foreground">
              {companyInfo.name}
            </h1>
            {companyInfo.description && (
              <p className="text-lg text-muted-foreground mb-4">{companyInfo.description}</p>
            )}
            <div className="flex gap-3">
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
        </div>

        {/* Memo Sections */}
        <div className="space-y-8">
          {memoContent.sections.map((section, index) => {
            // Support both new format (narrative/vcReflection) and legacy format (direct properties)
            const narrative = section.narrative || {
              paragraphs: section.paragraphs,
              highlights: section.highlights,
              keyPoints: section.keyPoints
            };

            return (
              <MemoSection key={section.title} title={section.title} index={index}>
                {/* Narrative Content */}
                <div className="space-y-4">
                  {narrative.paragraphs?.map((para, i) => (
                    <MemoParagraph key={i} text={para.text} emphasis={para.emphasis} />
                  ))}
                </div>

                {narrative.highlights && narrative.highlights.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {narrative.highlights.map((highlight, i) => (
                      <MemoHighlight key={i} metric={highlight.metric} label={highlight.label} />
                    ))}
                  </div>
                )}

                {narrative.keyPoints && narrative.keyPoints.length > 0 && (
                  <MemoKeyPoints points={narrative.keyPoints} />
                )}

                {/* VC Reflection Content */}
                {section.vcReflection && (
                  <>
                    {section.vcReflection.analysis && (
                      <MemoVCReflection text={section.vcReflection.analysis} />
                    )}
                    {section.vcReflection.questions && section.vcReflection.questions.length > 0 && (
                      <MemoVCQuestions questions={section.vcReflection.questions} />
                    )}
                    {section.vcReflection.benchmarking && (
                      <MemoBenchmarking text={section.vcReflection.benchmarking} />
                    )}
                    {section.vcReflection.conclusion && (
                      <MemoAIConclusion text={section.vcReflection.conclusion} />
                    )}
                  </>
                )}
              </MemoSection>
            );
          })}
        </div>
      </div>
    </div>
  );
}
