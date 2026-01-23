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
import { MemoCollapsibleVC } from "@/components/memo/MemoCollapsibleVC";

// Section-specific cards
import { MemoPainValidatorCard } from "@/components/memo/MemoPainValidatorCard";
import { MemoDifferentiationCard } from "@/components/memo/MemoDifferentiationCard";
import { MemoTeamList } from "@/components/memo/MemoTeamList";
import { MemoExitPathCard } from "@/components/memo/MemoExitPathCard";

// Strategic tools
import {
  SectionScoreCard,
  ProblemEvidenceThreshold,
  ProblemFounderBlindSpot,
  SolutionTechnicalDefensibility,
  SolutionCommoditizationTeardown,
  MarketTAMCalculator,
  MarketReadinessIndexCard,
  CompetitionChessboardCard,
  CompetitionMoatDurabilityCard,
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
  { name: "Elena Vasquez", role: "CEO", equity: "52%", description: "8 years at Salesforce" },
  { name: "Marcus Chen", role: "CTO", equity: "48%", description: "ML Lead at Datadog, Stanford PhD" },
];

// Exit path data
const DEMO_EXIT_DATA = {
  currentARR: 384000,
  category: "B2B SaaS / Revenue Intelligence",
  revenueMultiple: { low: 8, mid: 15, high: 25 },
  comparableExits: [
    { company: "Chorus.ai", exitValue: "575M", acquirer: "ZoomInfo", year: "2021" },
  ],
  potentialAcquirers: ["Salesforce", "HubSpot", "ZoomInfo"]
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
              Print
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

        {/* VC Quick Take */}
        <div data-section="quick-take">
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

        {/* Sections */}
        <div className="space-y-8">
          {memoData.sections.map((section, index) => {
            const titleLower = section.title.toLowerCase();
            const tools = DEMO_SECTION_TOOLS[section.title] || {};
            const verdict = DEMO_HOLISTIC_VERDICTS[section.title];

            return (
              <div key={section.title} data-section={titleLower}>
                <MemoSection title={section.title} index={index}>
                  {tools?.sectionScore && <SectionScoreCard sectionName={section.title} score={tools.sectionScore} />}
                  {index === 0 && memoData.heroStatement && <MemoHeroStatement text={memoData.heroStatement} />}
                  <VCFramingExplainerCard sectionTitle={section.title} />
                  <MemoCollapsibleOverview
                    paragraphs={[{ text: section.narrative, emphasis: "normal" as const }]}
                    keyPoints={section.keyPoints}
                    defaultOpen={true}
                  />

                  {/* Section-specific tools */}
                  {titleLower.includes('problem') && (
                    <div className="space-y-6">
                      <MemoPainValidatorCard problemText={section.narrative} companyName={DEMO_COMPANY.name} />
                      {tools?.evidenceThreshold && <ProblemEvidenceThreshold data={tools.evidenceThreshold} />}
                      {tools?.founderBlindSpot && <ProblemFounderBlindSpot data={tools.founderBlindSpot} />}
                    </div>
                  )}

                  {titleLower.includes('solution') && (
                    <div className="space-y-6">
                      <MemoDifferentiationCard solutionText={section.narrative} companyName={DEMO_COMPANY.name} />
                      {tools?.technicalDefensibility && <SolutionTechnicalDefensibility data={tools.technicalDefensibility} />}
                      {tools?.commoditizationTeardown && <SolutionCommoditizationTeardown data={tools.commoditizationTeardown} />}
                    </div>
                  )}

                  {titleLower.includes('market') && (
                    <div className="space-y-6">
                      {tools?.bottomsUpTAM && <MarketTAMCalculator data={tools.bottomsUpTAM} />}
                      {tools?.marketReadinessIndex && <MarketReadinessIndexCard data={tools.marketReadinessIndex} />}
                    </div>
                  )}

                  {titleLower.includes('competition') && (
                    <div className="space-y-6">
                      {tools?.competitorChessboard && <CompetitionChessboardCard data={tools.competitorChessboard} />}
                      {tools?.moatDurability && <CompetitionMoatDurabilityCard data={tools.moatDurability} />}
                    </div>
                  )}

                  {titleLower.includes('team') && <MemoTeamList members={DEMO_TEAM_MEMBERS} showEquity={true} />}

                  {titleLower.includes('vision') && <MemoExitPathCard exitData={DEMO_EXIT_DATA} companyName={DEMO_COMPANY.name} />}

                  {verdict && (
                    <MemoCollapsibleVC
                      vcReflection={{
                        analysis: verdict.stageContext,
                        questions: tools?.vcInvestmentLogic?.keyCondition ? [tools.vcInvestmentLogic.keyCondition] : [],
                        conclusion: verdict.verdict
                      }}
                      defaultOpen={false}
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
