import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { DemoLayout } from "@/components/demo/DemoLayout";
import { DashboardScorecard } from "@/components/memo/DashboardScorecard";
import { MemoVCQuickTake } from "@/components/memo/MemoVCQuickTake";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DEMO_COMPANY } from "@/data/demo/demoSignalFlow";
import { DEMO_SECTION_TOOLS, DEMO_HOLISTIC_VERDICTS } from "@/data/demo/demoSignalFlowTools";
import { getSignalFlowFullMemo, type FullFidelityMemoSection } from "@/data/demo/demoSignalFlowMemo";
import { TrendingUp, Users, Lightbulb, ArrowRight } from "lucide-react";
import type { MemoStructuredContent, MemoStructuredSection } from "@/types/memo";
import type { ARCClassification } from "@/components/memo/DashboardScorecard";
import { DemoWelcomeModal, useDemoWelcome } from "@/components/demo/DemoWelcomeModal";
import { DemoSectionHelper } from "@/components/demo/DemoSectionHelper";
import { useProductTour } from "@/hooks/useProductTour";
import { ProductTourSpotlight } from "@/components/tour/ProductTourSpotlight";

// ARC Classification for SignalFlow - matches the demo analysis
const DEMO_ARC_CLASSIFICATION: ARCClassification = {
  type: "Hair on Fire",
  reasoning: "is solving an urgent, quantifiable pain point (67% of deals lost to 'no decision') that sales leaders are actively trying to fix. The $2.1M revenue leakage creates immediate buying motivation.",
  implications: "Speed wins. Out-execute competitors with superior distribution and product velocity.",
  confidence: 85
};

// Demo Investment Thesis data for the dashboard
const DEMO_INVESTMENT_THESIS_SECTION: FullFidelityMemoSection = {
  title: "Investment Thesis",
  paragraphs: [
    {
      emphasis: "high",
      text: "SignalFlow represents a compelling Seed investment opportunity in the revenue intelligence category. The company has demonstrated clear product-market fit signals: €32K MRR growing 15% month-over-month, NPS of 74 (exceptional for B2B), and 94% customer retention at Month 6. The founder-market fit is exceptional — CEO with 8 years at Salesforce and CTO with ML leadership at Datadog and Stanford PhD creates a rare combination of domain expertise and technical credibility."
    },
    {
      emphasis: "normal",
      text: "The core investment thesis centers on three pillars: (1) Category Timing — revenue intelligence is a validated €10B+ category (Gong, Clari) with clear mid-market whitespace, (2) Technical Differentiation — 'prediction vs. recording' positioning creates sustainable advantage as long as execution velocity is maintained, and (3) Capital Efficiency — 4.9x LTV:CAC and 7-month payback demonstrate efficient growth economics that can scale with investment."
    },
    {
      emphasis: "normal",
      text: "Key risks are manageable but real: Gong's announced mid-market expansion requires defensive velocity; founder-led sales needs to prove scalability through initial AE hires; and the €2M raise at €10M pre-money is contingent on continued 15%+ MoM growth. The risk-reward profile is attractive for investors who believe execution speed can outpace incumbent response."
    },
    {
      emphasis: "high",
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
    analysis: "This deal presents a classic 'execution bet' opportunity. The category is validated (Gong proved it), the team is credible (rare founder-market fit), and the early metrics are encouraging (LTV:CAC, retention, NPS all above benchmarks). The question isn't 'is this a good market?' or 'can this team build product?' — those are answered. The question is: 'Can this team out-execute well-funded incumbents in a race for mid-market ownership?' My assessment: yes, with capital and focus.",
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
    benchmarking: "For our Seed portfolio, SignalFlow ranks in the top quartile on founder quality and unit economics. Compared to recent Seed investments: stronger team than average, comparable traction, and better market timing. The €10M pre-money is at the higher end of our Seed range but justified by metrics and team quality.",
    conclusion: "SignalFlow meets our investment criteria for Seed stage. Proceed to partner meeting with recommendation to lead or co-lead the round. Key diligence items: (1) Reference calls with Salesforce and Datadog colleagues for founder validation, (2) Customer calls to verify retention and NPS claims, (3) Competitive landscape deep-dive with Gong ecosystem contacts."
  }
};

// Build section tools structure for DashboardScorecard using SignalFlow tools
const buildSectionToolsFromSignalFlow = () => {
  const result: Record<string, any> = {};
  
  const sectionMapping: Record<string, string> = {
    'Problem': 'Problem',
    'Solution': 'Solution', 
    'Market': 'Market',
    'Competition': 'Competition',
    'Team': 'Team',
    'Business Model': 'Business Model',
    'Traction': 'Traction',
    'Vision': 'Vision'
  };

  Object.entries(sectionMapping).forEach(([key, toolKey]) => {
    const tools = DEMO_SECTION_TOOLS[toolKey];
    if (tools) {
      result[key] = { ...tools };
    }
  });

  return result;
};

// Build memo content structure with full-fidelity data for SectionDetailModal
const buildMemoContent = (): MemoStructuredContent => {
  const memoData = getSignalFlowFullMemo();
  
  if (!memoData) {
    return {
      vcQuickTake: {
        verdict: "",
        readinessLevel: "MEDIUM",
        readinessRationale: "",
        concerns: [],
        strengths: []
      },
      sections: []
    };
  }

  // Transform full-fidelity sections to MemoStructuredSection format
  // Including vcReflection so the modal can display VC perspective
  const sections: MemoStructuredSection[] = memoData.sections.map(section => ({
    title: section.title,
    paragraphs: section.paragraphs,
    highlights: section.highlights,
    keyPoints: section.keyPoints,
    vcReflection: section.vcReflection,
    // Also provide narrative object for backward compatibility
    narrative: {
      paragraphs: section.paragraphs,
      highlights: section.highlights,
      keyPoints: section.keyPoints
    }
  }));

  // Add Investment Thesis as a section
  sections.push({
    title: DEMO_INVESTMENT_THESIS_SECTION.title,
    paragraphs: DEMO_INVESTMENT_THESIS_SECTION.paragraphs,
    highlights: DEMO_INVESTMENT_THESIS_SECTION.highlights,
    keyPoints: DEMO_INVESTMENT_THESIS_SECTION.keyPoints,
    vcReflection: DEMO_INVESTMENT_THESIS_SECTION.vcReflection,
    narrative: {
      paragraphs: DEMO_INVESTMENT_THESIS_SECTION.paragraphs,
      highlights: DEMO_INVESTMENT_THESIS_SECTION.highlights,
      keyPoints: DEMO_INVESTMENT_THESIS_SECTION.keyPoints
    }
  });

  return {
    vcQuickTake: memoData.vcQuickTake,
    sections
  };
};

export default function DemoDashboard() {
  const navigate = useNavigate();
  const { showWelcome, showSectionHelper, isChecked, completeWelcome, dismissSectionHelper } = useDemoWelcome();
  const tour = useProductTour(true); // true = demo mode
  const sectionTools = buildSectionToolsFromSignalFlow();
  const memoContent = buildMemoContent();

  // Start tour after welcome modal completes
  useEffect(() => {
    if (isChecked && !showWelcome && !tour.hasCompletedTour && !tour.isActive) {
      // Small delay to let the page settle after welcome modal closes
      const timer = setTimeout(() => {
        tour.startTour();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isChecked, showWelcome, tour.hasCompletedTour, tour.isActive]);

  // Handler to restart tour from welcome modal
  const handleRestartTour = () => {
    tour.resetTour();
    // Navigate to demo dashboard if not already there, then start tour
    navigate('/demo');
    setTimeout(() => tour.startTour(), 300);
  };

  // Custom navigation handler for demo - redirects internal links to demo versions
  const handleNavigate = (path: string) => {
    // Redirect Market Lens and Fund Discovery to demo versions
    if (path === '/market-lens') {
      navigate('/demo/market-lens');
    } else if (path === '/fund-discovery') {
      navigate('/demo/fund-discovery');
    } else if (path.includes('/analysis')) {
      // Redirect all analysis links to demo analysis
      navigate('/demo/analysis');
    } else {
      navigate(path);
    }
  };

  return (
    <DemoLayout currentPage="dashboard" onRestartTour={handleRestartTour}>
      {/* Welcome modal for first-time visitors */}
      {isChecked && <DemoWelcomeModal open={showWelcome} onComplete={completeWelcome} />}
      
      {/* Product Tour */}
      <ProductTourSpotlight
        isActive={tour.isActive}
        currentStep={tour.currentStep}
        currentStepIndex={tour.currentStepIndex}
        totalSteps={tour.totalSteps}
        onNext={tour.nextStep}
        onPrev={tour.prevStep}
        onSkip={tour.skipTour}
      />
      
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Investment Readiness Scorecard - with FULL tool data and ARC */}
          <DashboardScorecard
            sectionTools={sectionTools}
            companyName={DEMO_COMPANY.name}
            companyDescription={DEMO_COMPANY.description}
            stage={DEMO_COMPANY.stage}
            category={DEMO_COMPANY.category}
            companyId={DEMO_COMPANY.id}
            onNavigate={handleNavigate}
            memoContent={memoContent}
            arcClassification={DEMO_ARC_CLASSIFICATION}
            isDemo={true}
            onSectionClick={dismissSectionHelper}
          />

          {/* VC Quick Take (IC Room) */}
          <div className="-mt-4">
            <MemoVCQuickTake 
              quickTake={memoContent.vcQuickTake} 
              showTeaser={false}
            />
          </div>

          {/* Premium Tools Showcase */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Market Lens Card */}
            <Card 
              className="border border-primary/25 bg-gradient-to-br from-primary/10 via-card/50 to-card/30 backdrop-blur-sm cursor-pointer hover:border-primary/40 hover:shadow-[0_20px_50px_-12px_hsl(var(--primary)/0.2)] transition-all group"
              onClick={() => navigate('/demo/market-lens')}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 backdrop-blur-sm border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">Market Lens</h3>
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/15 backdrop-blur-sm text-primary">
                        AI-Powered
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Real-time market intelligence tailored to B2B SaaS AI at Seed stage.
                    </p>
                    <div className="flex items-center gap-1 text-xs text-primary font-medium group-hover:gap-2 transition-all">
                      Explore Market Intel
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* VC Network Card */}
            <Card 
              className="border border-accent/25 bg-gradient-to-br from-accent/10 via-card/50 to-card/30 backdrop-blur-sm cursor-pointer hover:border-accent/40 hover:shadow-[0_20px_50px_-12px_hsl(var(--accent)/0.2)] transition-all group"
              onClick={() => navigate('/demo/fund-discovery')}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/15 backdrop-blur-sm border border-accent/20 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">VC Network</h3>
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-accent/20 backdrop-blur-sm text-accent-foreground">
                        15 Matches
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      B2B SaaS investors matched to SignalFlow's profile.
                    </p>
                    <div className="flex items-center gap-1 text-xs text-primary font-medium group-hover:gap-2 transition-all">
                      Browse Investors
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insider Take Preview */}
          <Card className="border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-card/30 backdrop-blur-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Insider Take of the Day</span>
                  </div>
                  <h3 className="text-lg font-serif font-bold">Why "Good Business" ≠ "Good VC Investment"</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    Learn why VCs pass on profitable companies and what "venture scale" really means for your fundraise.
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/vcbrain/insider/good-business-bad-vc')}
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 -ml-2"
                  >
                    Read Insight
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </DemoLayout>
  );
}
