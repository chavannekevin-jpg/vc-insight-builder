import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { MemoLoadingScreen } from "@/components/MemoLoadingScreen";
import { MemoSection } from "@/components/memo/MemoSection";
import { MemoHeroStatement } from "@/components/memo/MemoHeroStatement";
import { MemoCollapsibleOverview } from "@/components/memo/MemoCollapsibleOverview";
import { MemoCollapsibleVC } from "@/components/memo/MemoCollapsibleVC";
import { MemoVCReflection } from "@/components/memo/MemoVCReflection";
import { MemoVCQuestions } from "@/components/memo/MemoVCQuestions";
import { MemoBenchmarking } from "@/components/memo/MemoBenchmarking";
import { MemoAIConclusion } from "@/components/memo/MemoAIConclusion";
import { MemoTeamList } from "@/components/memo/MemoTeamList";
import { MemoTeamGapCard } from "@/components/memo/MemoTeamGapCard";
import { MemoMoatScoreCard } from "@/components/memo/MemoMoatScoreCard";
import { MemoUnitEconomicsCard } from "@/components/memo/MemoUnitEconomicsCard";
import { MemoExitPathCard } from "@/components/memo/MemoExitPathCard";
import { MemoVCScaleCard } from "@/components/memo/MemoVCScaleCard";
import { MemoPainValidatorCard } from "@/components/memo/MemoPainValidatorCard";
import { MemoMomentumCard } from "@/components/memo/MemoMomentumCard";
import { MemoDifferentiationCard } from "@/components/memo/MemoDifferentiationCard";
import { LockedSectionOverlay } from "@/components/memo/LockedSectionOverlay";
import { extractMoatScores, extractTeamMembers, extractUnitEconomics } from "@/lib/memoDataExtractor";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Grid, BookOpen } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MemoStructuredContent, MemoParagraph } from "@/types/memo";

export default function MemoSectionView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");
  const sectionIndex = parseInt(searchParams.get("section") || "0");
  
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
          navigate(`/memo?companyId=${companyId}`);
          return;
        }
      } catch (error) {
        console.error("Error loading memo:", error);
        toast({
          title: "Error",
          description: "Failed to load section",
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
  const currentSection = memoContent.sections[sectionIndex];
  
  if (!currentSection) {
    navigate(`/memo/overview?companyId=${companyId}`);
    return null;
  }

  const isLocked = !hasPremium && sectionIndex > 0;
  const progressPercent = ((sectionIndex + 1) / totalSections) * 100;

  const goToSection = (index: number) => {
    if (index >= 0 && index < totalSections) {
      navigate(`/memo/section?companyId=${companyId}&section=${index}`);
    }
  };

  // Section type detection
  const titleLower = currentSection.title.toLowerCase();
  const isProblemSection = titleLower.includes('problem');
  const isSolutionSection = titleLower.includes('solution');
  const isTeamSection = titleLower.includes('team');
  const isMarketSection = titleLower.includes('market');
  const isCompetitionSection = titleLower.includes('competition');
  const isBusinessSection = titleLower.includes('business');
  const isTractionSection = titleLower.includes('traction');
  const isThesisSection = titleLower.includes('thesis');
  const isVisionSection = titleLower.includes('vision');

  const narrative = currentSection.narrative || {
    paragraphs: currentSection.paragraphs,
    highlights: currentSection.highlights,
    keyPoints: currentSection.keyPoints
  };

  const sectionText = narrative.paragraphs?.map((p: MemoParagraph) => p.text).join(' ') || '';
  const extractedTeamMembers = isTeamSection ? extractTeamMembers(sectionText) : [];
  const extractedMoatScores = isCompetitionSection ? extractMoatScores(sectionText) : null;
  const extractedUnitEconomics = isBusinessSection ? extractUnitEconomics(sectionText, '') : null;

  const heroParagraph = narrative.paragraphs?.find((p: MemoParagraph) => p.emphasis === "high");
  const otherParagraphs = narrative.paragraphs?.filter((p: MemoParagraph) => p.emphasis !== "high") || [];

  // Get problem text for differentiation card
  const problemSection = memoContent.sections.find(s => s.title.toLowerCase().includes('problem'));
  const problemText = problemSection?.narrative?.paragraphs?.map((p: MemoParagraph) => p.text).join(' ') || 
                     problemSection?.paragraphs?.map((p: MemoParagraph) => p.text).join(' ') || '';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Sticky Navigation Bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-3 max-w-5xl">
          <div className="flex items-center justify-between gap-4">
            {/* Section Title & Progress */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full whitespace-nowrap">
                  {sectionIndex + 1} of {totalSections}
                </span>
              </div>
              <div className="flex-1 max-w-xs">
                <Progress value={progressPercent} className="h-1.5" />
              </div>
            </div>
            
            {/* Escape Hatch - View Full Memo */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(`/memo?companyId=${companyId}&view=full`)}
              className="text-muted-foreground hover:text-foreground"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Full Memo</span>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Locked Overlay for Premium Sections */}
        {isLocked ? (
          <LockedSectionOverlay sectionTitle={currentSection.title}>
            <MemoSection title={currentSection.title} index={sectionIndex}>
              {heroParagraph && <MemoHeroStatement text={heroParagraph.text} />}
              <MemoCollapsibleOverview
                paragraphs={otherParagraphs}
                highlights={narrative.highlights}
                keyPoints={narrative.keyPoints}
                defaultOpen={true}
              />
            </MemoSection>
          </LockedSectionOverlay>
        ) : (
          <MemoSection title={currentSection.title} index={sectionIndex}>
            {/* Hero Statement */}
            {heroParagraph && <MemoHeroStatement text={heroParagraph.text} />}

            {/* Company Overview */}
            <MemoCollapsibleOverview
              paragraphs={otherParagraphs}
              highlights={narrative.highlights}
              keyPoints={narrative.keyPoints}
              defaultOpen={true}
            />

            {/* Section-Specific Strategic Cards - Premium Only */}
            {hasPremium && (
              <>
                {/* Problem Section - Pain Validator */}
                {isProblemSection && (
                  <MemoPainValidatorCard 
                    problemText={sectionText}
                    companyName={companyInfo?.name || 'Company'}
                  />
                )}

                {/* Solution Section - Differentiation Matrix */}
                {isSolutionSection && (
                  <MemoDifferentiationCard 
                    solutionText={sectionText}
                    problemText={problemText}
                    companyName={companyInfo?.name || 'Company'}
                  />
                )}

                {/* Market Section - VC Scale Card */}
                {isMarketSection && (
                  <MemoVCScaleCard 
                    avgMonthlyRevenue={100}
                    currentCustomers={0}
                    currentMRR={0}
                    companyName={companyInfo?.name || 'Company'}
                    category={companyInfo?.category || 'Technology'}
                  />
                )}

                {/* Traction Section - Momentum Scorecard */}
                {isTractionSection && (
                  <MemoMomentumCard 
                    tractionText={sectionText}
                    companyName={companyInfo?.name || 'Company'}
                    stage={companyInfo?.stage || 'Pre-seed'}
                  />
                )}

                {/* Team Section */}
                {isTeamSection && extractedTeamMembers.length > 0 && (
                  <>
                    <MemoTeamList 
                      members={extractedTeamMembers.map(tm => ({
                        name: tm.name,
                        role: tm.role,
                        equity: tm.equity,
                        description: ''
                      }))} 
                      showEquity={extractedTeamMembers.some(tm => tm.equity)} 
                    />
                    <MemoTeamGapCard 
                      teamMembers={extractedTeamMembers}
                      stage={companyInfo?.stage || 'Pre-seed'}
                      companyName={companyInfo?.name || 'Company'}
                    />
                  </>
                )}

                {/* Competition Section - Moat Score Card */}
                {isCompetitionSection && extractedMoatScores && (
                  <MemoMoatScoreCard 
                    moatScores={extractedMoatScores}
                    companyName={companyInfo?.name || 'Company'}
                  />
                )}

                {/* Business Model Section - Unit Economics Card */}
                {isBusinessSection && extractedUnitEconomics && (
                  <MemoUnitEconomicsCard 
                    unitEconomics={extractedUnitEconomics}
                    companyName={companyInfo?.name || 'Company'}
                  />
                )}

                {/* Vision/Thesis Section - Exit Path Card */}
                {(isThesisSection || isVisionSection) && (
                  <MemoExitPathCard 
                    exitData={{
                      category: companyInfo?.category || 'Technology',
                      revenueMultiple: { low: 5, mid: 10, high: 15 }
                    }}
                    companyName={companyInfo?.name || 'Company'}
                  />
                )}
              </>
            )}

            {/* VC Perspective */}
            {currentSection.vcReflection && (
              hasPremium ? (
                <div className="mt-10 space-y-8 pt-8 border-t border-border/50">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Investor Perspective</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                  </div>
                  
                  <MemoVCReflection text={currentSection.vcReflection.analysis} />
                  
                  {currentSection.vcReflection.questions && currentSection.vcReflection.questions.length > 0 && (
                    <MemoVCQuestions questions={currentSection.vcReflection.questions} defaultAllOpen={true} />
                  )}
                  
                  {currentSection.vcReflection.benchmarking && (
                    <MemoBenchmarking text={currentSection.vcReflection.benchmarking} />
                  )}
                  
                  <MemoAIConclusion text={currentSection.vcReflection.conclusion} />
                </div>
              ) : (
                <MemoCollapsibleVC vcReflection={currentSection.vcReflection} defaultOpen={true} />
              )
            )}
          </MemoSection>
        )}

        {/* Bottom Navigation */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col gap-4">
            {/* Main Navigation - Next/Previous */}
            <div className="flex items-center justify-between">
              <Button 
                variant="outline"
                onClick={() => goToSection(sectionIndex - 1)}
                disabled={sectionIndex === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              
              {/* Progress Dots */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalSections }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSection(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === sectionIndex 
                        ? 'bg-primary w-6' 
                        : idx < sectionIndex 
                          ? 'bg-primary/50' 
                          : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              
              <Button 
                variant={sectionIndex === totalSections - 1 ? "default" : "default"}
                onClick={() => {
                  if (sectionIndex === totalSections - 1) {
                    navigate(`/memo/complete?companyId=${companyId}`);
                  } else {
                    goToSection(sectionIndex + 1);
                  }
                }}
                className="gap-2"
              >
                <span className="hidden sm:inline">
                  {sectionIndex === totalSections - 1 ? 'Complete Review' : 'Next Section'}
                </span>
                <span className="sm:hidden">
                  {sectionIndex === totalSections - 1 ? 'Done' : 'Next'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Secondary Actions */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/memo/overview?companyId=${companyId}`)}
                className="text-muted-foreground"
              >
                <Grid className="w-4 h-4 mr-2" />
                All Sections
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/memo?companyId=${companyId}&view=full`)}
                className="text-muted-foreground"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                View Full Memo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
