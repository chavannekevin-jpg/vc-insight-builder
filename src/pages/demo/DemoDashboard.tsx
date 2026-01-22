import { useNavigate } from "react-router-dom";
import { DemoLayout } from "@/components/demo/DemoLayout";
import { DashboardScorecard } from "@/components/memo/DashboardScorecard";
import { MemoVCQuickTake } from "@/components/memo/MemoVCQuickTake";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DEMO_COMPANY } from "@/data/demo/demoSignalFlow";
import { DEMO_SECTION_TOOLS, DEMO_HOLISTIC_VERDICTS } from "@/data/demo/demoSignalFlowTools";
import { getDemoMemo } from "@/data/acceleratorDemo/demoMemos";
import { TrendingUp, Users, Lightbulb, ArrowRight } from "lucide-react";
import type { MemoStructuredContent, MemoVCQuickTake as VCQuickTakeType } from "@/types/memo";

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

// Get VC Quick Take from the memo data
const getVCQuickTake = (): VCQuickTakeType | null => {
  const memo = getDemoMemo("demo-signalflow");
  return memo?.vcQuickTake || null;
};

// Build memo content structure for VC Quick Take component
const buildMemoContent = (): MemoStructuredContent => {
  const memo = getDemoMemo("demo-signalflow");
  
  if (memo) {
    return {
      vcQuickTake: memo.vcQuickTake,
      sections: memo.sections.map(section => ({
        title: section.title,
        paragraphs: [{ text: section.narrative, emphasis: "narrative" as const }],
        keyPoints: section.keyPoints
      }))
    };
  }

  // Fallback - should not happen
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
};

export default function DemoDashboard() {
  const navigate = useNavigate();
  const sectionTools = buildSectionToolsFromSignalFlow();
  const memoContent = buildMemoContent();
  const vcQuickTake = getVCQuickTake();

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
    <DemoLayout currentPage="dashboard">
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Investment Readiness Scorecard - with FULL tool data */}
          <DashboardScorecard
            sectionTools={sectionTools}
            companyName={DEMO_COMPANY.name}
            companyDescription={DEMO_COMPANY.description}
            stage={DEMO_COMPANY.stage}
            category={DEMO_COMPANY.category}
            companyId={DEMO_COMPANY.id}
            onNavigate={handleNavigate}
            memoContent={memoContent}
          />

          {/* VC Quick Take (IC Room) */}
          <div className="-mt-4">
            <MemoVCQuickTake 
              quickTake={vcQuickTake} 
              showTeaser={false}
            />
          </div>

          {/* Premium Tools Showcase */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Market Lens Card */}
            <Card 
              className="border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent cursor-pointer hover:border-primary/40 transition-all group"
              onClick={() => navigate('/demo/market-lens')}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">Market Lens</h3>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
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
              className="border border-accent/20 bg-gradient-to-br from-accent/5 via-transparent to-transparent cursor-pointer hover:border-accent/40 transition-all group"
              onClick={() => navigate('/demo/fund-discovery')}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">VC Network</h3>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent/20 text-accent-foreground">
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
          <Card className="border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-transparent overflow-hidden relative">
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
