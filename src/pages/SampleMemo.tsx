import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Sparkles, Share2, Linkedin } from "lucide-react";
import { MemoSection } from "@/components/memo/MemoSection";
import { MemoParagraph } from "@/components/memo/MemoParagraph";
import { MemoHighlight } from "@/components/memo/MemoHighlight";
import { MemoKeyPoints } from "@/components/memo/MemoKeyPoints";
import { MemoVCReflection } from "@/components/memo/MemoVCReflection";
import { MemoVCQuestions } from "@/components/memo/MemoVCQuestions";
import { MemoBenchmarking } from "@/components/memo/MemoBenchmarking";
import { MemoAIConclusion } from "@/components/memo/MemoAIConclusion";
import { MemoVCQuickTake } from "@/components/memo/MemoVCQuickTake";
import { MemoVCScaleCard } from "@/components/memo/MemoVCScaleCard";
import { MemoTeamList, TeamMember } from "@/components/memo/MemoTeamList";
import { MemoMoatScoreCard } from "@/components/memo/MemoMoatScoreCard";
import { MemoTeamGapCard } from "@/components/memo/MemoTeamGapCard";
import { MemoExitPathCard } from "@/components/memo/MemoExitPathCard";
import { MemoUnitEconomicsCard } from "@/components/memo/MemoUnitEconomicsCard";
import { MemoPainValidatorCard } from "@/components/memo/MemoPainValidatorCard";
import { MemoActionPlan } from "@/components/memo/MemoActionPlan";
import { extractActionPlan } from "@/lib/actionPlanExtractor";
import { safeTitle, sanitizeMemoContent } from "@/lib/stringUtils";
import type { MemoStructuredContent, MemoVCQuickTake as MemoVCQuickTakeType, MemoParagraph as MemoParagraphType } from "@/types/memo";
import type { MoatScores, UnitEconomicsData, ExitPathData, ExtractedTeamMember } from "@/lib/memoDataExtractor";
import { DEMO_MEMOS } from "@/data/acceleratorDemo/demoMemos";

// Import new VC tools
import {
  SectionScoreCard,
  VCInvestmentLogicCard,
  Section90DayPlan,
  LeadInvestorCard,
  SectionBenchmarks,
  MicroCaseStudyCard,
  ProblemEvidenceThreshold,
  ProblemFounderBlindSpot,
  SolutionTechnicalDefensibility,
  SolutionCommoditizationTeardown,
  SolutionCompetitorBuildAnalysis,
  MarketTAMCalculator,
  MarketReadinessIndexCard,
  MarketVCNarrativeCard,
  CompetitionChessboardCard,
  CompetitionMoatDurabilityCard,
  TeamCredibilityGapCard,
  BusinessModelStressTestCard,
  TractionDepthTestCard,
  VisionMilestoneMapCard,
  VisionScenarioPlanningCard,
  VisionExitNarrativeCard
} from "@/components/memo/tools";

// Import sample tool data
import { SAMPLE_SECTION_TOOLS } from "@/data/sampleMemoTools";

// Sample team data for CarbonPrint demo
const SAMPLE_TEAM: TeamMember[] = [
  {
    name: "Sarah Chen",
    role: "CEO",
    equity: "45%",
    description: "Former sustainability lead at Google Cloud. MBA from Stanford. Built and sold climate analytics startup (acquired by Autodesk, 2021). Deep relationships with Fortune 500 sustainability officers."
  },
  {
    name: "Marcus Rodriguez",
    role: "CTO",
    equity: "35%",
    description: "Ex-Amazon principal engineer, 12 years building large-scale data infrastructure. PhD in Environmental Science from MIT. Holds 3 patents in carbon measurement algorithms."
  },
  {
    name: "Jennifer Liu",
    role: "COO",
    equity: "20%",
    description: "Former McKinsey partner specializing in sustainability practice. Scaled operations at two climate tech startups from seed to Series B. Expert in enterprise sales cycles."
  }
];

// Sample VC Quick Take for demo
const SAMPLE_VC_QUICK_TAKE: MemoVCQuickTakeType = {
  verdict: "CarbonPrint shows strong founder-market fit and addresses a genuine regulatory tailwind. The product demonstrates clear differentiation, but unit economics need validation at scale. Worth a deeper dive if the TAM assumptions hold.",
  concerns: [
    "Enterprise sales cycle may be longer than projected (9-12 months vs stated 3-6)",
    "Crowded market with well-funded competitors like Watershed and Persefoni",
    "Regulatory dependency - business model relies on continued ESG mandates"
  ],
  strengths: [
    "Exceptional team pedigree with direct domain expertise",
    "Strong early traction with recognizable logos (Disney, Unilever)",
    "Proprietary data moat from supply chain integrations"
  ],
  readinessLevel: "MEDIUM",
  readinessRationale: "Strong fundamentals but needs to prove enterprise sales velocity and competitive differentiation before Series A."
};

// Sample Moat Scores for CarbonPrint demo
const SAMPLE_MOAT_SCORES: MoatScores = {
  networkEffects: { score: 4, evidence: '"...supply chain data creates marketplace dynamics..."' },
  switchingCosts: { score: 8, evidence: '"...deep ERP integrations and workflow embedding..."' },
  dataAdvantage: { score: 9, evidence: '"...proprietary carbon measurement algorithms..."' },
  brandTrust: { score: 6, evidence: '"...enterprise certifications and Fortune 500 logos..."' },
  costAdvantage: { score: 3, evidence: 'Not emphasized' },
  overallScore: 60
};

// Sample Unit Economics for CarbonPrint demo
const SAMPLE_UNIT_ECONOMICS: UnitEconomicsData = {
  ltv: 45000,
  cac: 12000,
  ltvCacRatio: 3.75,
  paybackMonths: 9,
  grossMargin: 78,
  monthlyChurn: 1.8
};

// Sample Exit Path Data for CarbonPrint demo
const SAMPLE_EXIT_DATA: ExitPathData = {
  currentARR: 96600, // $8,050 MRR * 12
  category: "Climate Tech",
  revenueMultiple: { low: 6, mid: 10, high: 15 }
};

// Sample Team Members for Team Gap Card
const SAMPLE_TEAM_EXTRACTED: ExtractedTeamMember[] = [
  { name: "Sarah Chen", role: "CEO" },
  { name: "Marcus Rodriguez", role: "CTO" },
  { name: "Jennifer Liu", role: "COO" }
];

// Sample company info for CarbonPrint demo
const SAMPLE_COMPANY_INFO = {
  id: 'demo-carbonprint',
  name: 'CarbonPrint',
  stage: 'Pre-seed',
  category: 'Climate Tech',
  description: 'AI-powered carbon footprint tracking for enterprise supply chains'
};

const SampleMemo = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const viewMode = searchParams.get("view"); // 'full' for full memo, otherwise redirect to wizard
  
  const [loading, setLoading] = useState(true);
  const [memoContent, setMemoContent] = useState<MemoStructuredContent | null>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);

  useEffect(() => {
    // If not in full view mode, redirect once to wizard
    if (viewMode !== 'full') {
      navigate('/sample-analysis/section?section=0', { replace: true });
      return;
    }
    
    // Load the demo data
    const demoData = DEMO_MEMOS["demo-carbonprint"];
    
    if (demoData) {
      const structuredContent: MemoStructuredContent = {
        vcQuickTake: demoData.vcQuickTake,
        sections: demoData.sections.map(section => ({
          title: section.title,
          paragraphs: [{ text: section.narrative, emphasis: "narrative" as const }],
          keyPoints: section.keyPoints
        }))
      };
      
      setMemoContent(structuredContent);
      setCompanyInfo(SAMPLE_COMPANY_INFO);
    }
    
    setLoading(false);
  }, [viewMode, navigate]);

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
          <Button className="gradient-primary shadow-glow" onClick={() => navigate('/')}>Back to Home</Button>
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
              onClick={() => navigate('/')}
              className="gap-2 hover:bg-primary/10 transition-colors neon-pink"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Home</span>
            </Button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shadow-glow">
                  <FileText className="w-4 h-4 neon-pink" />
                </div>
                <span className="text-sm font-medium neon-pink">Sample Investment Memo</span>
              </div>
              
              {/* LinkedIn Share Button */}
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-[#0A66C2]/30 hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/50 text-[#0A66C2] transition-all"
                onClick={() => {
                  const shareUrl = encodeURIComponent('https://uglybaby.co/sample-memo?view=full');
                  window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
                    'linkedin-share',
                    'width=600,height=600'
                  );
                }}
              >
                <Linkedin className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Psychological Framing Block */}
        <div className="mb-16 animate-fade-in">
          <div className="relative overflow-hidden bg-gradient-to-br from-card via-card to-primary/5 border border-border/40 rounded-3xl p-12 md:p-16 shadow-xl">
            {/* Background decoration */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/8 rounded-full blur-3xl" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              {/* Icon cluster */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="h-px w-16 bg-gradient-to-r from-primary/40 to-transparent" />
                <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center -rotate-6">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
              </div>

              {/* Main message */}
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight text-center mb-6 tracking-tight">
                This is the document written about you<br />
                <span className="text-primary">after the partner meeting</span>
              </h2>

              {/* Divider */}
              <div className="flex items-center gap-4 my-8">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <div className="w-2 h-2 rounded-full bg-primary/40" />
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>

              {/* Secondary text */}
              <p className="text-lg md:text-xl text-muted-foreground text-center font-medium">
                Not the deck you present — the document VCs debate <span className="text-foreground font-semibold">without you in the room.</span>
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
                <p className="text-sm font-bold neon-pink uppercase tracking-wide">✨ Full Sample Memo - CarbonPrint</p>
                <p className="text-sm text-foreground leading-relaxed">
                  This is a <strong className="neon-pink">complete sample memo</strong> for a fictional climate tech startup. See exactly what you'll get: 
                  honest VC analysis, critical questions investors would ask, market benchmarking, and the full investment thesis.
                  <strong className="neon-pink"> Your memo will be personalized to your startup.</strong>
                </p>
                <p className="text-xs text-muted-foreground italic pt-1">
                  📊 Only the Competition section is previewed to protect our competitive analysis methodology.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* VC Quick Take - Green/Red flags summary */}
        <MemoVCQuickTake quickTake={memoContent.vcQuickTake || SAMPLE_VC_QUICK_TAKE} showTeaser={false} />

        {/* Action Plan - extracted from memo content */}
        {(() => {
          const quickTake = memoContent.vcQuickTake || SAMPLE_VC_QUICK_TAKE;
          const actionPlan = extractActionPlan(memoContent, quickTake);
          return actionPlan && actionPlan.items.length > 0 && (
            <MemoActionPlan actionPlan={actionPlan} companyName={companyInfo?.name} />
          );
        })()}

        {/* Memo Sections */}
        <div className="space-y-16">
          {(() => {
            let exitPathShown = false;
            
            return memoContent.sections.map((section, index) => {
              // Section type detection
              const titleLower = safeTitle(section.title).toLowerCase();
              const isProblemSection = titleLower.includes('problem');
              const isCompetitionSection = safeTitle(section.title) === 'Competition' || titleLower.includes('competition');
              const isTeamSection = safeTitle(section.title) === 'Team' || titleLower.includes('team');
              const isMarketSection = safeTitle(section.title) === 'Market' || titleLower.includes('market');
              const isBusinessSection = titleLower.includes('business');
              const isThesisSection = titleLower.includes('thesis');
              const isVisionSection = titleLower.includes('vision');
              
              // Get section text for Pain Validator
              const sectionParagraphs = section.narrative?.paragraphs || section.paragraphs || [];
              const sectionText = sectionParagraphs.map((p: MemoParagraphType) => p.text).join(' ');
              
              // Determine if we should show exit path (only once, prefer thesis over vision)
              const showExitPath = !exitPathShown && (isThesisSection || isVisionSection);
              if (showExitPath) exitPathShown = true;
              
              // Get section-specific tools data
              const sectionToolsKey = safeTitle(section.title);
              const sectionTools = SAMPLE_SECTION_TOOLS[sectionToolsKey];
              const isTractionSection = titleLower.includes('traction');
              const isSolutionSection = titleLower.includes('solution');
              
              return (
                <MemoSection key={index} title={section.title} index={index}>
                  <div className="space-y-8">
                    {/* Section Score Card - Shows for all sections with tools */}
                    {sectionTools?.sectionScore && (
                      <SectionScoreCard
                        sectionName={section.title}
                        score={sectionTools.sectionScore}
                      />
                    )}

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

                        {/* Team List - show structured founder list for team section */}
                        {isTeamSection && (
                          <>
                            <MemoTeamList members={SAMPLE_TEAM} showEquity={true} />
                            <MemoTeamGapCard 
                              teamMembers={SAMPLE_TEAM_EXTRACTED}
                              stage="Seed"
                              companyName="CarbonPrint"
                            />
                          </>
                        )}
                      </div>
                    )}

                    {/* Problem Section Tools */}
                    {isProblemSection && sectionTools && (
                      <div className="space-y-6">
                        <MemoPainValidatorCard 
                          problemText={sectionText}
                          companyName="CarbonPrint"
                        />
                        {sectionTools.evidenceThreshold && (
                          <ProblemEvidenceThreshold data={sectionTools.evidenceThreshold} />
                        )}
                        {sectionTools.founderBlindSpot && (
                          <ProblemFounderBlindSpot data={sectionTools.founderBlindSpot} />
                        )}
                      </div>
                    )}

                    {/* Solution Section Tools */}
                    {isSolutionSection && sectionTools && (
                      <div className="space-y-6">
                        {sectionTools.technicalDefensibility && (
                          <SolutionTechnicalDefensibility data={sectionTools.technicalDefensibility} />
                        )}
                        {sectionTools.commoditizationTeardown && (
                          <SolutionCommoditizationTeardown data={sectionTools.commoditizationTeardown} />
                        )}
                        {sectionTools.competitorBuildAnalysis && (
                          <SolutionCompetitorBuildAnalysis data={sectionTools.competitorBuildAnalysis} />
                        )}
                      </div>
                    )}

                    {/* Market Section Tools */}
                    {isMarketSection && sectionTools && (
                      <div className="space-y-6">
                        <MemoVCScaleCard 
                          avgMonthlyRevenue={350}
                          currentCustomers={23}
                          currentMRR={8050}
                          companyName="CarbonPrint"
                          category="Climate Tech"
                        />
                        {sectionTools.bottomsUpTAM && (
                          <MarketTAMCalculator data={sectionTools.bottomsUpTAM} />
                        )}
                        {sectionTools.marketReadinessIndex && (
                          <MarketReadinessIndexCard data={sectionTools.marketReadinessIndex} />
                        )}
                        {sectionTools.vcMarketNarrative && (
                          <MarketVCNarrativeCard data={sectionTools.vcMarketNarrative} />
                        )}
                      </div>
                    )}

                    {/* Competition Section Tools */}
                    {isCompetitionSection && sectionTools && (
                      <div className="space-y-6">
                        <MemoMoatScoreCard 
                          moatScores={SAMPLE_MOAT_SCORES}
                          companyName="CarbonPrint"
                        />
                        {sectionTools.competitorChessboard && (
                          <CompetitionChessboardCard data={sectionTools.competitorChessboard} />
                        )}
                        {sectionTools.moatDurability && (
                          <CompetitionMoatDurabilityCard data={sectionTools.moatDurability} />
                        )}
                      </div>
                    )}

                    {/* Team Section Tools */}
                    {isTeamSection && sectionTools && (
                      <div className="space-y-6">
                        {sectionTools.credibilityGapAnalysis && (
                          <TeamCredibilityGapCard data={sectionTools.credibilityGapAnalysis} />
                        )}
                      </div>
                    )}

                    {/* Business Model Section Tools */}
                    {isBusinessSection && sectionTools && (
                      <div className="space-y-6">
                        <MemoUnitEconomicsCard 
                          unitEconomics={SAMPLE_UNIT_ECONOMICS}
                          companyName="CarbonPrint"
                        />
                        {sectionTools.modelStressTest && (
                          <BusinessModelStressTestCard data={sectionTools.modelStressTest} />
                        )}
                      </div>
                    )}

                    {/* Traction Section Tools */}
                    {isTractionSection && sectionTools && (
                      <div className="space-y-6">
                        {sectionTools.tractionDepthTest && (
                          <TractionDepthTestCard data={sectionTools.tractionDepthTest} />
                        )}
                      </div>
                    )}

                    {/* Vision Section Tools */}
                    {isVisionSection && sectionTools && (
                      <div className="space-y-6">
                        {sectionTools.vcMilestoneMap && (
                          <VisionMilestoneMapCard data={sectionTools.vcMilestoneMap} />
                        )}
                        {sectionTools.scenarioPlanning && (
                          <VisionScenarioPlanningCard data={sectionTools.scenarioPlanning} />
                        )}
                        {sectionTools.exitNarrative && (
                          <VisionExitNarrativeCard data={sectionTools.exitNarrative} />
                        )}
                      </div>
                    )}

                    {/* Exit Path Card - show ONCE after Investment Thesis or Vision section */}
                    {showExitPath && (
                      <MemoExitPathCard 
                        exitData={SAMPLE_EXIT_DATA}
                        companyName="CarbonPrint"
                      />
                    )}

                    {/* Section Benchmarks - Shows for all sections with benchmarks */}
                    {sectionTools?.benchmarks && (
                      <SectionBenchmarks
                        sectionName={section.title}
                        benchmarks={sectionTools.benchmarks}
                      />
                    )}

                    {/* Micro Case Study - Shows for all sections with case study */}
                    {sectionTools?.caseStudy && (
                      <MicroCaseStudyCard caseStudy={sectionTools.caseStudy} />
                    )}

                    {/* VC Reflection - Now fully visible for all sections */}
                    {section.vcReflection && (
                      <div className="mt-10 space-y-8 pt-8 border-t border-border/50">
                        <div className="flex items-center gap-2 mb-6">
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Investor Perspective</span>
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                        </div>
                        
                        {/* VC Analysis - fully visible */}
                        <MemoVCReflection text={section.vcReflection.analysis} />
                        
                        {/* Investor Questions - fully visible with all expanded */}
                        {section.vcReflection.questions && section.vcReflection.questions.length > 0 && (
                          <MemoVCQuestions questions={section.vcReflection.questions} defaultAllOpen={true} />
                        )}
                        
                        {/* Benchmarking - fully visible */}
                        {section.vcReflection.benchmarking && (
                          <MemoBenchmarking text={section.vcReflection.benchmarking} />
                        )}
                        
                        {/* Conclusion - fully visible */}
                        <MemoAIConclusion text={section.vcReflection.conclusion} />
                      </div>
                    )}

                    {/* VC Investment Logic Card - At the end of each section */}
                    {sectionTools?.vcInvestmentLogic && (
                      <VCInvestmentLogicCard
                        sectionName={section.title}
                        logic={sectionTools.vcInvestmentLogic}
                      />
                    )}

                    {/* 90-Day Action Plan - At the end of each section */}
                    {sectionTools?.actionPlan90Day && (
                      <Section90DayPlan
                        sectionName={section.title}
                        plan={sectionTools.actionPlan90Day}
                      />
                    )}

                    {/* Lead Investor Requirements - At the end of each section */}
                    {sectionTools?.leadInvestorRequirements && (
                      <LeadInvestorCard
                        sectionName={section.title}
                        requirements={sectionTools.leadInvestorRequirements}
                      />
                    )}
                  </div>
                </MemoSection>
              );
            });
          })()}

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
            {/* Investment Thesis section - shown if present in data, or add a teaser */}
            {!memoContent.sections.some(s => safeTitle(s.title).toLowerCase().includes('thesis') || safeTitle(s.title).toLowerCase().includes('investment')) && (
              <MemoSection key="investment-thesis" title="Investment Thesis" index={memoContent.sections.length}>
                <div className="space-y-8">
                  <MemoParagraph 
                    text="The Investment Thesis section synthesizes all previous analysis into a clear verdict: should VCs invest? This includes risk-adjusted assessment, key assumptions that must prove true, and specific conditions for success."
                    emphasis="high"
                  />
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                    <p className="text-sm text-muted-foreground text-center">
                      Your personalized memo will include a complete investment thesis tailored to your startup's specific strengths, weaknesses, and market opportunity.
                    </p>
                  </div>
                </div>
              </MemoSection>
            )}

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
                Get the same depth of VC-focused analysis tailored to your startup. Our platform 
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
