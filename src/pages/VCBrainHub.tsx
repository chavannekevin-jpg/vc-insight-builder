import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Search, Book, TrendingUp, AlertTriangle, Wrench, ChevronRight, ChevronDown, Home } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
interface NavSection {
  title: string;
  items: {
    label: string;
    path: string;
  }[];
}
const navigationSections: NavSection[] = [{
  title: "Insider Takes",
  items: [{
    label: "VCs Pick Power Laws",
    path: "/vcbrain/insider/power-laws"
  }, {
    label: "Pitching a Return Profile",
    path: "/vcbrain/insider/return-profile"
  }, {
    label: "Good Business ≠ Good VC Bet",
    path: "/vcbrain/insider/good-business-bad-vc"
  }, {
    label: "VCs Are Managed Pessimists",
    path: "/vcbrain/insider/managed-pessimists"
  }, {
    label: "VCs Bet on Asymmetry",
    path: "/vcbrain/insider/asymmetry"
  }, {
    label: "Liquidity Is Your Customer",
    path: "/vcbrain/insider/liquidity-not-customer"
  }, {
    label: "After the Pitch Room",
    path: "/vcbrain/insider/after-pitch-room"
  }, {
    label: "Scored When You're Not There",
    path: "/vcbrain/insider/scored-not-in-room"
  }, {
    label: "One Partner Can Kill You",
    path: "/vcbrain/insider/one-partner-kill"
  }, {
    label: "Why VCs Ghost Founders",
    path: "/vcbrain/insider/why-vcs-ghost"
  }, {
    label: "Follow-On Capital Decisions",
    path: "/vcbrain/insider/follow-on-capital"
  }, {
    label: "Ownership vs. Valuation",
    path: "/vcbrain/insider/ownership-vs-valuation"
  }]
}, {
  title: "How VCs Work",
  items: [{
    label: "VC Firm Structure",
    path: "/vcbrain/how-vcs-work/structure"
  }, {
    label: "Dealflow & Sourcing",
    path: "/vcbrain/how-vcs-work/dealflow"
  }, {
    label: "Selection & Due Diligence",
    path: "/vcbrain/how-vcs-work/selection-process"
  }, {
    label: "Investment Committee",
    path: "/vcbrain/how-vcs-work/investment-committee"
  }, {
    label: "Building a Data Room",
    path: "/vcbrain/how-vcs-work/data-room"
  }]
}, {
  title: "VC Fund Dynamics",
  items: [{
    label: "Limited Partners (LPs)",
    path: "/vcbrain/vc-mechanics/limited-partners"
  }, {
    label: "VC Fundraising Cycles",
    path: "/vcbrain/vc-mechanics/fundraising-cycles"
  }]
}, {
  title: "Stage Guides",
  items: [{
    label: "Angel Stage",
    path: "/vcbrain/stages/angel"
  }, {
    label: "Pre-Seed Stage",
    path: "/vcbrain/stages/pre-seed"
  }, {
    label: "Seed Stage",
    path: "/vcbrain/stages/seed"
  }, {
    label: "Stage Comparison",
    path: "/vcbrain/stages/comparison"
  }, {
    label: "SPVs & Syndication",
    path: "/vcbrain/stages/spv-syndication"
  }]
}, {
  title: "Pitch Deck Library",
  items: [{
    label: "Executive Summary",
    path: "/vcbrain/deck-building/executive-summary"
  }, {
    label: "Problem Slide",
    path: "/vcbrain/deck-building/problem"
  }, {
    label: "Solution Slide",
    path: "/vcbrain/deck-building/solution"
  }, {
    label: "Product Slide",
    path: "/vcbrain/deck-building/product"
  }, {
    label: "Market Slide",
    path: "/vcbrain/deck-building/market"
  }, {
    label: "Competition Slide",
    path: "/vcbrain/deck-building/competition"
  }, {
    label: "Traction Slide",
    path: "/vcbrain/deck-building/traction"
  }, {
    label: "Financials Slide",
    path: "/vcbrain/deck-building/financials"
  }, {
    label: "Team Slide",
    path: "/vcbrain/deck-building/team"
  }, {
    label: "GTM Slide",
    path: "/vcbrain/deck-building/gtm"
  }, {
    label: "Vision Slide",
    path: "/vcbrain/deck-building/vision"
  }, {
    label: "Ask Slide",
    path: "/vcbrain/deck-building/ask"
  }]
}, {
  title: "Term Sheets & Deals",
  items: [{
    label: "Funding Instruments",
    path: "/vcbrain/deals/instruments"
  }, {
    label: "Key Terms Explained",
    path: "/vcbrain/deals/terms"
  }, {
    label: "Negotiation Tactics",
    path: "/vcbrain/deals/negotiation"
  }]
}, {
  title: "Tactical Guides",
  items: [{
    label: "What Angels Really Want",
    path: "/vcbrain/guides/angels"
  }, {
    label: "Early Traction That Matters",
    path: "/vcbrain/guides/traction"
  }, {
    label: "Fake TAMs Exposed",
    path: "/vcbrain/guides/tam"
  }, {
    label: "Building Demos That Sell",
    path: "/vcbrain/guides/demos"
  }, {
    label: "Pitching Without Hype",
    path: "/vcbrain/guides/pitching"
  }, {
    label: "Founder-Market Fit",
    path: "/vcbrain/guides/founder-fit"
  }, {
    label: "Fundraising Timeline Reality",
    path: "/vcbrain/guides/timeline"
  }, {
    label: "Why Startups Actually Die",
    path: "/vcbrain/guides/death"
  }]
}, {
  title: "Founder Mistakes",
  items: [{
    label: "Top 10 Fatal Errors",
    path: "/vcbrain/mistakes/fatal"
  }, {
    label: "Red Flags VCs Spot",
    path: "/vcbrain/mistakes/red-flags"
  }, {
    label: "Deck Disasters",
    path: "/vcbrain/mistakes/deck-disasters"
  }, {
    label: "Email Pitch Fails",
    path: "/vcbrain/mistakes/email-fails"
  }]
}, {
  title: "Tools & Resources",
  items: [{
    label: "VC Glossary",
    path: "/vcbrain/tools/glossary"
  }, {
    label: "Red Flag Database",
    path: "/vcbrain/tools/red-flags"
  }, {
    label: "Pitch Readiness Checklist",
    path: "/vcbrain/tools/checklist"
  }, {
    label: "Investor Scorecard",
    path: "/vcbrain/tools/scorecard"
  }]
}];
export default function VCBrainHub() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>(navigationSections.map(s => s.title));
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain");
        return;
      }
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);
  const toggleSection = (title: string) => {
    setExpandedSections(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);
  };
  const isActive = (path: string) => location.pathname === path;
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>;
  }
  return <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/hub')}
              className="border-primary/30 hover:bg-primary/10 hover:border-primary transition-all"
              title="Back to Hub"
            >
              <Home className="w-5 h-5 text-primary" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">VC Brain Hub</h1>
              <p className="text-sm text-muted-foreground">The Brutally Honest Founder Roadmap</p>
            </div>
          </div>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold" onClick={() => navigate('/pricing')}> Get Your Investment Memo</Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <aside className="w-72 border-r border-border bg-card/50 backdrop-blur-sm overflow-y-auto sticky top-[73px] h-[calc(100vh-73px)]">
          <div className="p-4 space-y-6">
            {navigationSections.map(section => <div key={section.title}>
                <button onClick={() => toggleSection(section.title)} className="w-full flex items-center justify-between text-sm font-semibold text-foreground hover:text-primary transition-colors mb-2">
                  <span>{section.title}</span>
                  {expandedSections.includes(section.title) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {expandedSections.includes(section.title) && <div className="space-y-1 ml-2">
                    {section.items.map(item => <button key={item.path} onClick={() => navigate(item.path)} className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all ${isActive(item.path) ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
                        {item.label}
                      </button>)}
                  </div>}
              </div>)}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex">
          <div className="flex-1 max-w-4xl mx-auto p-8">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input type="text" placeholder="What startup truth do you want to face today?" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 h-12 text-base bg-card border-border" />
              </div>
            </div>

            {/* Content Outlet */}
            <Outlet />
          </div>

          {/* Right Sticky Conversion Card */}
          <aside className="w-80 p-6 sticky top-[73px] h-[calc(100vh-73px)] hidden xl:block">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-xl p-6 space-y-4">
              <div className="text-sm font-bold text-primary uppercase tracking-wider">
                Stop Guessing
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Get the Investment Memorandum Template
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Everything VCs look for in a single document. No fluff. No "maybe this matters." 
                Just the exact framework used to evaluate your startup.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <span className="text-foreground">Complete VC evaluation framework</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <span className="text-foreground">Section-by-section breakdown</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <span className="text-foreground">Real examples of what works</span>
                </li>
              </ul>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold" onClick={() => navigate('/pricing')}>
                Get the Template
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                If this feels confusing, that's exactly why you need the memo.
              </p>
            </div>
          </aside>
        </main>
      </div>
    </div>;
}