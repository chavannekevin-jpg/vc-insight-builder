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

// Demo data
import { DEMO_COMPANY } from "@/data/demo/demoSignalFlow";
import { DEMO_SECTION_TOOLS, DEMO_HOLISTIC_VERDICTS } from "@/data/demo/demoSignalFlowTools";
import { getDemoMemo } from "@/data/acceleratorDemo/demoMemos";

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

// Demo VC Reflection data for each section
const DEMO_VC_REFLECTIONS: Record<string, { analysis: string; questions: string[]; benchmarking: string; conclusion: string }> = {
  "Problem": {
    analysis: "The problem framing is sophisticated and shows deep customer understanding. Quantifying revenue leakage at $2.1M per 50-person team gives investors a clear ROI narrative. The 67% 'no decision' statistic is memorable and creates urgency. This is above-average problem articulation for Seed stage.",
    questions: [
      "How does the problem intensity vary by industry vertical?",
      "What's the buying trigger that makes companies prioritize this now?",
      "How does this problem manifest differently in mid-market vs enterprise?"
    ],
    benchmarking: "Top quartile for customer discovery depth. Most Seed companies have 20-30 interviews; SignalFlow has 85. The quantified impact ($2.1M) puts this above typical 'nice-to-have' positioning.",
    conclusion: "Strong problem validation with clear market evidence. The customer discovery depth and quantified pain point provide solid foundation for investment consideration."
  },
  "Solution": {
    analysis: "The 'prediction vs. recording' positioning is smart differentiation in a crowded market. Having 28 paying customers with 89% prediction accuracy demonstrates execution. The 5-minute integration claim needs validation but if true, removes major adoption friction.",
    questions: [
      "What's the baseline for 89% accuracy - random chance or manager intuition?",
      "How does accuracy degrade with different deal types or industries?",
      "What's the technical moat preventing Gong from adding this feature?"
    ],
    benchmarking: "NPS of 74 is exceptional - typical B2B is 30-50. Time to first value (5 minutes) would be best-in-class if validated. Product market fit signals are strong.",
    conclusion: "Solid product execution with strong customer satisfaction signals. The differentiation angle is credible but technical moat needs reinforcement through IP protection."
  },
  "Market": {
    analysis: "The €2.5B TAM is credible with bottom-up methodology - a sign of analytical rigor. Mid-market focus is a smart wedge strategy given Gong's enterprise dominance. Market timing is favorable with AI adoption accelerating across sales organizations.",
    questions: [
      "How defensible is the mid-market position if Gong launches 'Essentials' tier?",
      "What's the expansion path beyond revenue intelligence?",
      "How does the European market differ from US in adoption patterns?"
    ],
    benchmarking: "Bottom-up TAM methodology puts this in top 15% of pitches. The €2.5B TAM comfortably supports €100M+ outcomes required for venture returns.",
    conclusion: "Market size and methodology are solid. The mid-market wedge strategy is credible, but long-term defensibility against incumbent expansion remains the key question."
  },
  "Competition": {
    analysis: "Competitive landscape is well-understood but the moat story needs work. Gong's $7B valuation and announced mid-market push is a real threat. The 'prediction vs. recording' differentiation is good but may not hold if incumbents add features.",
    questions: [
      "What's your win rate in direct competitive deals against Gong?",
      "How long would it take Gong to add prediction features?",
      "What structural advantages prevent feature parity catch-up?"
    ],
    benchmarking: "45% competitive win rate is encouraging but sample size is small. Most Seed companies struggle to win any competitive deals.",
    conclusion: "Competitive awareness is good but moat articulation needs improvement. Execution velocity will determine whether differentiation holds."
  },
  "Team": {
    analysis: "Exceptional founder-market fit. CEO's 8 years at Salesforce provides deep domain expertise and enterprise relationships. CTO's Datadog ML experience and Stanford PhD brings rare technical credibility. This is a team that can execute.",
    questions: [
      "How will you scale beyond founder-led sales?",
      "What's your VP Marketing hiring timeline?",
      "Who are the first 5 hires after fundraise?"
    ],
    benchmarking: "Top 5% for founder domain experience. The CEO-CTO combination of sales domain + ML technical depth is rare and valuable.",
    conclusion: "Team is a significant strength and de-risks execution considerably. The founder-market fit here is genuinely exceptional for the stage."
  },
  "Business Model": {
    analysis: "Unit economics are healthy: 4.9x LTV:CAC exceeds 3x benchmark, 7-month payback enables aggressive acquisition. 82% gross margin is healthy for SaaS. The model is proven and predictable.",
    questions: [
      "Will these metrics hold as you move beyond early adopters?",
      "What's the expansion revenue contribution?",
      "How do enterprise deals change the unit economics?"
    ],
    benchmarking: "LTV:CAC of 4.9x is top 20%. Payback of 7 months is top 15%. These metrics suggest efficient growth potential.",
    conclusion: "Business model is solid and de-risked. Focus should be on scaling what works rather than model experimentation."
  },
  "Traction": {
    analysis: "€32K MRR with 15% MoM growth for 8 consecutive months demonstrates product-market fit. 28 customers with 94% retention and NPS 74 are strong engagement signals. Ready for acceleration with capital.",
    questions: [
      "What's driving the 6% monthly churn - product or market?",
      "How much of growth is inbound vs outbound?",
      "What's the pipeline for next quarter?"
    ],
    benchmarking: "€384K ARR run-rate is solid for Seed. 15% MoM growth is healthy but not exceptional. NPS 74 is top 10%.",
    conclusion: "Traction demonstrates clear PMF and readiness for scaling. The question is whether growth can accelerate beyond founder-led sales."
  },
  "Vision": {
    analysis: "Clear 18-month roadmap from €32K to €150K MRR with defined milestones. Use of funds is specific and realistic. Exit scenarios through strategic acquisition are well-mapped with Chorus.ai precedent.",
    questions: [
      "What's the contingency if you don't hit €150K MRR by month 18?",
      "How are you building relationships with potential acquirers?",
      "What triggers Series A timeline - milestones or runway?"
    ],
    benchmarking: "Milestone clarity is top 20%. Most Seed companies lack specific 18-month targets. Use of funds breakdown shows operational maturity.",
    conclusion: "Vision is credible and well-articulated. Path to Series A is realistic given current trajectory."
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
  const memoData = getDemoMemo("demo-signalflow");

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
    paragraphs: [{ text: s.narrative, emphasis: "normal" as const }],
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
            const vcReflection = DEMO_VC_REFLECTIONS[section.title];

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
                    paragraphs={[{ text: section.narrative, emphasis: "normal" as const }]}
                    keyPoints={section.keyPoints}
                    defaultOpen={true}
                  />

                  {/* ========== PROBLEM SECTION TOOLS ========== */}
                  {isProblemSection && (
                    <div className="space-y-6">
                      <MemoPainValidatorCard 
                        problemText={section.narrative} 
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
                        solutionText={section.narrative} 
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
                        tractionText={section.narrative}
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

                  {/* ========== SECTION BENCHMARKS ========== */}
                  {tools?.benchmarks && tools.benchmarks.length > 0 && (
                    <SectionBenchmarks
                      sectionName={section.title}
                      benchmarks={tools.benchmarks}
                    />
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

                  {/* ========== LEAD INVESTOR REQUIREMENTS ========== */}
                  {tools?.leadInvestorRequirements && (
                    <LeadInvestorCard
                      sectionName={section.title}
                      requirements={tools.leadInvestorRequirements}
                    />
                  )}
                </MemoSection>
              </div>
            );
          })}
        </div>
      </div>
    </DemoLayout>
  );
}
