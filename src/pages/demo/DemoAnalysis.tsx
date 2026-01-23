import { useNavigate } from "react-router-dom";
import { DemoLayout } from "@/components/demo/DemoLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";

// Core memo components
import { MemoSection } from "@/components/memo/MemoSection";
import { MemoHeroStatement } from "@/components/memo/MemoHeroStatement";
import { MemoCollapsibleOverview } from "@/components/memo/MemoCollapsibleOverview";
import { VCFramingExplainerCard } from "@/components/memo/VCFramingExplainerCard";
import { MemoVCQuickTake } from "@/components/memo/MemoVCQuickTake";
import { MemoNavigation } from "@/components/memo/MemoNavigation";
import { MemoScoreRadar } from "@/components/memo/MemoScoreRadar";
import { MemoActionPlan } from "@/components/memo/MemoActionPlan";
import { ARCClassificationCard } from "@/components/memo/ARCClassificationCard";

// VC Perspective components
import { MemoVCReflection } from "@/components/memo/MemoVCReflection";
import { MemoVCQuestions } from "@/components/memo/MemoVCQuestions";
import { MemoBenchmarking } from "@/components/memo/MemoBenchmarking";
import { MemoAIConclusion } from "@/components/memo/MemoAIConclusion";

// Section-specific cards
import { MemoPainValidatorCard } from "@/components/memo/MemoPainValidatorCard";
import { MemoDifferentiationCard } from "@/components/memo/MemoDifferentiationCard";
import { MemoMoatScoreCard } from "@/components/memo/MemoMoatScoreCard";
import { MemoVCScaleCard } from "@/components/memo/MemoVCScaleCard";
import { MemoTeamList } from "@/components/memo/MemoTeamList";
import { MemoTeamGapCard } from "@/components/memo/MemoTeamGapCard";
import { MemoUnitEconomicsCard } from "@/components/memo/MemoUnitEconomicsCard";
import { MemoMomentumCard } from "@/components/memo/MemoMomentumCard";
import { MemoExitPathCard } from "@/components/memo/MemoExitPathCard";

// Strategic tools - full suite
import {
  SectionScoreCard,
  VCInvestmentLogicCard,
  Section90DayPlan,
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

// Demo data
import { DEMO_COMPANY } from "@/data/demo/demoSignalFlow";
import { DEMO_SECTION_TOOLS, DEMO_HOLISTIC_VERDICTS } from "@/data/demo/demoSignalFlowTools";
import { getSignalFlowFullMemo } from "@/data/demo/demoSignalFlowMemo";

// Types
import type { MemoStructuredSection } from "@/types/memo";
import type { ActionPlanData } from "@/lib/actionPlanExtractor";

// Demo team members
const DEMO_TEAM_MEMBERS = [
  { name: "Elena Vasquez", role: "CEO", equity: "52%", description: "8 years at Salesforce, led enterprise sales strategy. Previously VP Sales at a $50M ARR startup." },
  { name: "Marcus Chen", role: "CTO", equity: "48%", description: "ML Lead at Datadog (3 years), Stanford PhD in ML. Built production systems serving 10K+ customers." },
];

// Demo exit path data
const DEMO_EXIT_DATA = {
  currentARR: 384000,
  category: "B2B SaaS / Revenue Intelligence",
  revenueMultiple: { low: 8, mid: 15, high: 25 },
  comparableExits: [
    { company: "Chorus.ai", exitValue: "575M", acquirer: "ZoomInfo", year: "2021" },
    { company: "InsideSales.com", exitValue: "100M", acquirer: "Aurea", year: "2020" },
  ],
  potentialAcquirers: ["Salesforce", "HubSpot", "ZoomInfo", "Microsoft"]
};

// Demo moat scores for competition section
const DEMO_MOAT_SCORES = {
  networkEffects: { score: 3, evidence: "Limited network effects currently; data improves with usage" },
  switchingCosts: { score: 4, evidence: "Deep CRM integrations create moderate switching friction" },
  dataAdvantage: { score: 4, evidence: "2M+ deal outcomes in training dataset" },
  brandTrust: { score: 3, evidence: "Growing reputation in mid-market segment" },
  costAdvantage: { score: 2, evidence: "No significant cost advantages yet" },
  overallScore: 58
};

// Demo unit economics for business model section
const DEMO_UNIT_ECONOMICS = {
  ltv: 42000,
  cac: 8570,
  ltvCacRatio: 4.9,
  paybackMonths: 7,
  grossMargin: 82,
  monthlyChurn: 2.1
};

// Demo pricing data source for market section
const DEMO_PRICING_DATA_SOURCE = {
  avgMonthlyRevenue: 'questionnaire' as const,
  currentCustomers: 'questionnaire' as const,
  currentMRR: 'calculated' as const,
  calculation: 'MRR calculated from 28 customers × €1,142 avg monthly revenue'
};

// Demo pricing metrics for market section
const DEMO_PRICING_METRICS = {
  avgMonthlyRevenue: 1142,
  currentCustomers: 28,
  currentMRR: 32000,
  currency: 'EUR' as const,
  businessModelType: 'saas' as const,
  ltv: 42000,
};

// Demo ARC classification
const DEMO_ARC_CLASSIFICATION = {
  type: "Hair on Fire" as const,
  reasoning: "is solving an urgent, quantifiable pain point (67% of deals lost to 'no decision') that sales leaders are actively trying to fix. The $2.1M revenue leakage creates immediate buying motivation.",
  implications: "Speed wins. Out-execute competitors with superior distribution and product velocity.",
  confidence: 85
};

// Demo Investment Thesis section data
const DEMO_INVESTMENT_THESIS = {
  title: "Investment Thesis",
  paragraphs: [
    {
      emphasis: "high" as const,
      text: "SignalFlow represents a compelling Seed investment opportunity in the revenue intelligence category. The company has demonstrated clear product-market fit signals: €32K MRR growing 15% month-over-month, NPS of 74 (exceptional for B2B), and 94% customer retention at Month 6. The founder-market fit is exceptional — CEO with 8 years at Salesforce and CTO with ML leadership at Datadog and Stanford PhD creates a rare combination of domain expertise and technical credibility."
    },
    {
      emphasis: "normal" as const,
      text: "The core investment thesis centers on three pillars: (1) Category Timing — revenue intelligence is a validated €10B+ category (Gong, Clari) with clear mid-market whitespace, (2) Technical Differentiation — 'prediction vs. recording' positioning creates sustainable advantage as long as execution velocity is maintained, and (3) Capital Efficiency — 4.9x LTV:CAC and 7-month payback demonstrate efficient growth economics that can scale with investment."
    },
    {
      emphasis: "normal" as const,
      text: "Key risks are manageable but real: Gong's announced mid-market expansion requires defensive velocity; founder-led sales needs to prove scalability through initial AE hires; and the €2M raise at €10M pre-money is contingent on continued 15%+ MoM growth. The risk-reward profile is attractive for investors who believe execution speed can outpace incumbent response."
    },
    {
      emphasis: "high" as const,
      text: "Recommendation: Proceed to partner meeting. SignalFlow clears our Seed investment bar with strong team, validated traction, and credible market thesis. The primary diligence focus should be (1) competitive moat durability and (2) evidence that sales motion transfers to non-founders. If both questions resolve positively, this is a fundable opportunity in a category with proven €1B+ exit precedents (Chorus.ai: €575M, Gong: €7B valuation)."
    }
  ],
  highlights: [
    { label: "Investment Grade", metric: "Seed-Ready" },
    { label: "Risk Profile", metric: "Moderate" },
    { label: "Exit Potential", metric: "€500M-1B+" },
    { label: "Recommendation", metric: "Proceed to Partner Meeting" }
  ],
  keyPoints: [
    "Strong founder-market fit with domain expertise and technical credibility",
    "Validated PMF: €32K MRR, 15% MoM, NPS 74, 94% retention",
    "Category timing favorable — mid-market whitespace in validated €10B+ category",
    "Primary risks: competitive response and sales scalability — both manageable with execution"
  ],
  vcReflection: {
    analysis: "This deal presents a classic 'execution bet' opportunity. The category is validated (Gong proved it), the team is credible (rare founder-market fit), and the early metrics are encouraging (LTV:CAC, retention, NPS all above benchmarks). The question isn't 'is this a good market?' or 'can this team build product?' — those are answered. The question is: 'Can this team out-execute well-funded incumbents in a race for mid-market ownership?' My assessment: yes, with capital and focus. The €2M Seed at €10M pre-money provides good entry point with meaningful upside in all exit scenarios.",
    questions: [
      {
        question: "What's our ownership target and pro-rata expectations for Series A?",
        vcRationale: "At €10M pre-money, €2M gives us ~17% ownership. Need to understand if we can maintain 15%+ through Series A with pro-rata.",
        whatToPrepare: "Model ownership scenarios across different Series A raise sizes and pre-money valuations."
      },
      {
        question: "How does this fit our portfolio construction and sector exposure?",
        vcRationale: "We have existing investments in sales tech — need to assess overlap, conflict, and portfolio synergy opportunities.",
        whatToPrepare: "Portfolio mapping against SignalFlow positioning, potential intro opportunities from existing portfolio."
      },
      {
        question: "What's our value-add thesis beyond capital?",
        vcRationale: "Competitive deals require differentiated investor value. Need to articulate specific ways we help SignalFlow win.",
        whatToPrepare: "List of specific value-add: customer intros, hiring network, operational playbooks from portfolio."
      }
    ],
    benchmarking: "For our Seed portfolio, SignalFlow ranks in the top quartile on founder quality and unit economics. Compared to recent Seed investments: stronger team than average, comparable traction, and better market timing. The €10M pre-money is at the higher end of our Seed range but justified by metrics and team quality. Expected IRR modeling suggests 5-8x return potential in base case (€500M exit) and 15-25x in upside case (€1B+ exit or category leadership).",
    conclusion: "SignalFlow meets our investment criteria for Seed stage. Proceed to partner meeting with recommendation to lead or co-lead the round. Key diligence items: (1) Reference calls with Salesforce and Datadog colleagues for founder validation, (2) Customer calls to verify retention and NPS claims, (3) Competitive landscape deep-dive with Gong ecosystem contacts. Target decision timeline: 2-3 weeks from partner meeting."
  }
};

function transformActionPlan(memoActionPlan: any): ActionPlanData | undefined {
  if (!memoActionPlan) return undefined;
  return {
    items: (memoActionPlan.items || []).map((item: any, index: number) => ({
      id: item.id || `action-${index}`,
      priority: typeof item.priority === 'number' ? item.priority : index + 1,
      category: item.category || "General",
      problem: item.problem || "",
      impact: item.impact || "",
      howToFix: item.howToFix || "",
      badExample: item.badExample,
      goodExample: item.goodExample,
    })),
    overallUrgency: memoActionPlan.overallUrgency || "medium",
    summaryLine: memoActionPlan.summaryLine || "Focus on these key improvements.",
  };
}

// Helper to wrap raw tool data in EditableTool shape
function wrapInEditableToolShape<T>(data: T): { aiGenerated: T; userOverrides: Partial<T>; dataSource: "ai-complete" | "ai-partial" | "user-input" } {
  return {
    aiGenerated: data,
    userOverrides: {},
    dataSource: "ai-complete"
  };
}

export default function DemoAnalysis() {
  const navigate = useNavigate();
  const memoData = getSignalFlowFullMemo();

  if (!memoData) {
    return (
      <DemoLayout currentPage="analysis">
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Memo data not found.</p>
        </div>
      </DemoLayout>
    );
  }

  const structuredSections: MemoStructuredSection[] = memoData.sections.map(s => ({
    title: s.title,
    paragraphs: s.paragraphs,
    keyPoints: s.keyPoints,
  }));

  const actionPlan = transformActionPlan(memoData.aiActionPlan);

  return (
    <DemoLayout currentPage="analysis">
      <MemoNavigation sections={structuredSections} hasQuickTake={!!memoData.vcQuickTake} />

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl pb-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center gap-4 mb-6">
            <Button variant="ghost" onClick={() => navigate("/demo")} className="no-print">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button variant="default" onClick={() => window.print()} size="sm" className="no-print">
              <Printer className="w-4 h-4 mr-2" />
              Print / Export
            </Button>
          </div>

          <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-6 md:p-8 shadow-lg">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">{DEMO_COMPANY.name}</h1>
            <p className="text-muted-foreground mb-4">{DEMO_COMPANY.description}</p>
            <div className="flex gap-3">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">{DEMO_COMPANY.stage}</span>
              <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">{DEMO_COMPANY.category}</span>
            </div>
          </div>
        </div>

        {/* ARC Classification Card */}
        <ARCClassificationCard 
          classification={DEMO_ARC_CLASSIFICATION}
          companyName={DEMO_COMPANY.name}
        />

        {/* VC Quick Take */}
        <div data-section="quick-take" className="mt-8">
          <MemoVCQuickTake quickTake={memoData.vcQuickTake} showTeaser={false} />
        </div>

        {/* Score Radar */}
        <div className="my-8">
          <MemoScoreRadar
            sectionTools={DEMO_SECTION_TOOLS}
            companyName={DEMO_COMPANY.name}
            stage={DEMO_COMPANY.stage}
            category={DEMO_COMPANY.category}
            holisticVerdicts={DEMO_HOLISTIC_VERDICTS}
            onSectionClick={(name) => {
              document.querySelector(`[data-section="${name.toLowerCase()}"]`)?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>

        {/* Action Plan */}
        {actionPlan && <MemoActionPlan actionPlan={actionPlan} companyName={DEMO_COMPANY.name} />}

        {/* All Sections with Full Tool Suite */}
        <div className="space-y-8">
          {memoData.sections.map((section, index) => {
            const titleLower = section.title.toLowerCase();
            const tools = DEMO_SECTION_TOOLS[section.title] || {};
            const verdict = DEMO_HOLISTIC_VERDICTS[section.title];
            // Use vcReflection from the section itself (full-fidelity data with structured questions)
            const vcReflection = section.vcReflection;

            // Section type detection
            const isProblemSection = titleLower.includes('problem');
            const isSolutionSection = titleLower.includes('solution');
            const isMarketSection = titleLower.includes('market');
            const isCompetitionSection = titleLower.includes('competition');
            const isTeamSection = titleLower.includes('team');
            const isBusinessSection = titleLower.includes('business');
            const isTractionSection = titleLower.includes('traction');
            const isVisionSection = titleLower.includes('vision');

            return (
              <div key={section.title} data-section={titleLower}>
                <MemoSection title={section.title} index={index}>
                  {/* Section Score Card */}
                  {tools?.sectionScore && (
                    <SectionScoreCard sectionName={section.title} score={tools.sectionScore} />
                  )}

                  {/* Hero Statement - first section only */}
                  {index === 0 && memoData.heroStatement && (
                    <MemoHeroStatement text={memoData.heroStatement} />
                  )}

                  {/* VC Framing Explanation */}
                  <VCFramingExplainerCard sectionTitle={section.title} />

                  {/* Narrative Overview */}
                  <MemoCollapsibleOverview
                    paragraphs={section.paragraphs}
                    highlights={section.highlights}
                    keyPoints={section.keyPoints}
                    defaultOpen={true}
                  />

                  {/* ========== PROBLEM SECTION TOOLS ========== */}
                  {isProblemSection && (
                    <div className="space-y-6">
                      <MemoPainValidatorCard 
                        problemText={section.paragraphs.map(p => p.text).join(' ')} 
                        companyName={DEMO_COMPANY.name} 
                      />
                      {tools?.evidenceThreshold && (
                        <ProblemEvidenceThreshold data={wrapInEditableToolShape(tools.evidenceThreshold)} />
                      )}
                      {tools?.founderBlindSpot && (
                        <ProblemFounderBlindSpot data={wrapInEditableToolShape(tools.founderBlindSpot)} />
                      )}
                    </div>
                  )}

                  {/* ========== SOLUTION SECTION TOOLS ========== */}
                  {isSolutionSection && (
                    <div className="space-y-6">
                      <MemoDifferentiationCard 
                        solutionText={section.paragraphs.map(p => p.text).join(' ')} 
                        companyName={DEMO_COMPANY.name} 
                      />
                      {tools?.technicalDefensibility && (
                        <SolutionTechnicalDefensibility data={wrapInEditableToolShape(tools.technicalDefensibility)} />
                      )}
                      {tools?.commoditizationTeardown && (
                        <SolutionCommoditizationTeardown data={wrapInEditableToolShape(tools.commoditizationTeardown)} />
                      )}
                      {tools?.competitorBuildAnalysis && (
                        <SolutionCompetitorBuildAnalysis data={wrapInEditableToolShape(tools.competitorBuildAnalysis)} />
                      )}
                    </div>
                  )}

                  {/* ========== MARKET SECTION TOOLS ========== */}
                  {isMarketSection && (
                    <div className="space-y-6">
                      <MemoVCScaleCard 
                        avgMonthlyRevenue={DEMO_PRICING_METRICS.avgMonthlyRevenue}
                        currentCustomers={DEMO_PRICING_METRICS.currentCustomers}
                        currentMRR={DEMO_PRICING_METRICS.currentMRR}
                        companyName={DEMO_COMPANY.name}
                        category={DEMO_COMPANY.category}
                        currency={DEMO_PRICING_METRICS.currency}
                        businessModelType={DEMO_PRICING_METRICS.businessModelType}
                        ltv={DEMO_PRICING_METRICS.ltv}
                        dataSource={DEMO_PRICING_DATA_SOURCE}
                      />
                      {tools?.bottomsUpTAM && (
                        <MarketTAMCalculator data={wrapInEditableToolShape(tools.bottomsUpTAM)} />
                      )}
                      {tools?.marketReadinessIndex && (
                        <MarketReadinessIndexCard data={wrapInEditableToolShape(tools.marketReadinessIndex)} />
                      )}
                      {tools?.vcMarketNarrative && (
                        <MarketVCNarrativeCard data={wrapInEditableToolShape(tools.vcMarketNarrative)} />
                      )}
                    </div>
                  )}

                  {/* ========== COMPETITION SECTION TOOLS ========== */}
                  {isCompetitionSection && (
                    <div className="space-y-6">
                      <MemoMoatScoreCard 
                        moatScores={DEMO_MOAT_SCORES}
                        companyName={DEMO_COMPANY.name}
                      />
                      {tools?.competitorChessboard && (
                        <CompetitionChessboardCard data={wrapInEditableToolShape(tools.competitorChessboard)} />
                      )}
                      {tools?.moatDurability && (
                        <CompetitionMoatDurabilityCard data={wrapInEditableToolShape(tools.moatDurability)} />
                      )}
                    </div>
                  )}

                  {/* ========== TEAM SECTION TOOLS ========== */}
                  {isTeamSection && (
                    <div className="space-y-6">
                      <MemoTeamList 
                        members={DEMO_TEAM_MEMBERS} 
                        showEquity={true} 
                      />
                      <MemoTeamGapCard 
                        teamMembers={DEMO_TEAM_MEMBERS.map(m => ({ name: m.name, role: m.role }))}
                        stage={DEMO_COMPANY.stage}
                        companyName={DEMO_COMPANY.name}
                      />
                      {tools?.credibilityGapAnalysis && (
                        <TeamCredibilityGapCard data={wrapInEditableToolShape(tools.credibilityGapAnalysis)} />
                      )}
                    </div>
                  )}

                  {/* ========== BUSINESS MODEL SECTION TOOLS ========== */}
                  {isBusinessSection && (
                    <div className="space-y-6">
                      <MemoUnitEconomicsCard 
                        unitEconomics={DEMO_UNIT_ECONOMICS}
                        companyName={DEMO_COMPANY.name}
                      />
                      {tools?.modelStressTest && (
                        <BusinessModelStressTestCard data={wrapInEditableToolShape(tools.modelStressTest)} />
                      )}
                    </div>
                  )}

                  {/* ========== TRACTION SECTION TOOLS ========== */}
                  {isTractionSection && (
                    <div className="space-y-6">
                      <MemoMomentumCard 
                        tractionText={section.paragraphs.map(p => p.text).join(' ')}
                        companyName={DEMO_COMPANY.name}
                        stage={DEMO_COMPANY.stage}
                      />
                      {tools?.tractionDepthTest && (
                        <TractionDepthTestCard data={wrapInEditableToolShape(tools.tractionDepthTest)} />
                      )}
                    </div>
                  )}

                  {/* ========== VISION SECTION TOOLS ========== */}
                  {isVisionSection && (
                    <div className="space-y-6">
                      {tools?.vcMilestoneMap && (
                        <VisionMilestoneMapCard data={wrapInEditableToolShape(tools.vcMilestoneMap)} />
                      )}
                      {tools?.scenarioPlanning && (
                        <VisionScenarioPlanningCard data={wrapInEditableToolShape(tools.scenarioPlanning)} />
                      )}
                      {tools?.exitNarrative && (
                        <VisionExitNarrativeCard data={wrapInEditableToolShape(tools.exitNarrative)} />
                      )}
                      <MemoExitPathCard 
                        exitData={DEMO_EXIT_DATA} 
                        companyName={DEMO_COMPANY.name} 
                      />
                    </div>
                  )}

                  {/* ========== MICRO CASE STUDY ========== */}
                  {tools?.caseStudy && (
                    <MicroCaseStudyCard caseStudy={tools.caseStudy} />
                  )}

                  {/* ========== VC PERSPECTIVE (FULL VERSION) ========== */}
                  {vcReflection && (
                    <div className="mt-10 space-y-8 pt-8 border-t border-border/50">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">Investor Perspective</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                      </div>
                      
                      <MemoVCReflection text={vcReflection.analysis} />
                      
                      {vcReflection.questions && vcReflection.questions.length > 0 && (
                        <MemoVCQuestions questions={vcReflection.questions} defaultAllOpen={true} />
                      )}
                      
                      {vcReflection.benchmarking && (
                        <MemoBenchmarking text={vcReflection.benchmarking} />
                      )}
                      
                      <MemoAIConclusion text={vcReflection.conclusion} />
                    </div>
                  )}

                  {/* ========== VC INVESTMENT LOGIC CARD ========== */}
                  {tools?.vcInvestmentLogic && (
                    <VCInvestmentLogicCard
                      sectionName={section.title}
                      logic={tools.vcInvestmentLogic}
                    />
                  )}

                  {/* ========== 90-DAY ACTION PLAN ========== */}
                  {tools?.actionPlan90Day && (
                    <Section90DayPlan
                      sectionName={section.title}
                      plan={tools.actionPlan90Day}
                    />
                  )}
                </MemoSection>
              </div>
            );
          })}

          {/* ========== INVESTMENT THESIS SECTION ========== */}
          <div data-section="investment-thesis">
            <MemoSection title={DEMO_INVESTMENT_THESIS.title} index={memoData.sections.length}>
              {/* VC Framing Explanation */}
              <VCFramingExplainerCard sectionTitle={DEMO_INVESTMENT_THESIS.title} />

              {/* Narrative Overview with Key Takeaways */}
              <MemoCollapsibleOverview
                paragraphs={DEMO_INVESTMENT_THESIS.paragraphs}
                highlights={DEMO_INVESTMENT_THESIS.highlights}
                keyPoints={DEMO_INVESTMENT_THESIS.keyPoints}
                defaultOpen={true}
              />

              {/* Investment Thesis VC Perspective */}
              <div className="mt-10 space-y-8 pt-8 border-t border-border/50">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Investment Committee Perspective</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                </div>
                
                <MemoVCReflection text={DEMO_INVESTMENT_THESIS.vcReflection.analysis} />
                
                <MemoVCQuestions questions={DEMO_INVESTMENT_THESIS.vcReflection.questions} defaultAllOpen={true} />
                
                <MemoBenchmarking text={DEMO_INVESTMENT_THESIS.vcReflection.benchmarking} />
                
                <MemoAIConclusion text={DEMO_INVESTMENT_THESIS.vcReflection.conclusion} />
              </div>
            </MemoSection>
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}
