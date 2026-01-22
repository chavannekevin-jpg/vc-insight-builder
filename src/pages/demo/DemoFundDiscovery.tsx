import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DemoLayout } from "@/components/demo/DemoLayout";
import { DemoUpsellModal } from "@/components/demo/DemoUpsellModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DEMO_COMPANY, DEMO_MATCHING_FUNDS } from "@/data/demo/demoSignalFlow";
import { 
  Search, 
  ArrowLeft, 
  MapPin, 
  Building2, 
  TrendingUp,
  ExternalLink,
  Mail,
  Sparkles,
  Filter,
  ArrowUpDown
} from "lucide-react";

// Helper to format currency
const formatCurrency = (amount: number): string => {
  if (amount >= 1000000000) return `€${(amount / 1000000000).toFixed(1)}B`;
  if (amount >= 1000000) return `€${(amount / 1000000).toFixed(0)}M`;
  if (amount >= 1000) return `€${(amount / 1000).toFixed(0)}K`;
  return `€${amount}`;
};

// Get match color based on score
const getMatchColor = (score: number) => {
  if (score >= 85) return "text-green-500 bg-green-500/10 border-green-500/30";
  if (score >= 70) return "text-amber-500 bg-amber-500/10 border-amber-500/30";
  return "text-muted-foreground bg-muted/50 border-border";
};

export default function DemoFundDiscovery() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFund, setSelectedFund] = useState<typeof DEMO_MATCHING_FUNDS[0] | null>(null);
  const [showMatches, setShowMatches] = useState(true);
  const [showUpsell, setShowUpsell] = useState(false);
  const [upsellContext, setUpsellContext] = useState({ feature: "", description: "" });

  // Filter and sort funds
  const filteredFunds = useMemo(() => {
    let funds = [...DEMO_MATCHING_FUNDS];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      funds = funds.filter(fund => 
        fund.name.toLowerCase().includes(query) ||
        fund.city?.toLowerCase().includes(query) ||
        fund.country?.toLowerCase().includes(query) ||
        fund.investment_focus?.some(f => f.toLowerCase().includes(query))
      );
    }

    if (showMatches) {
      funds = funds.filter(fund => fund.matchScore >= 70);
    }

    return funds.sort((a, b) => b.matchScore - a.matchScore);
  }, [searchQuery, showMatches]);

  const handleContactFund = () => {
    setUpsellContext({
      feature: "Contacting investors",
      description: "Get your own analysis to unlock direct contact with 800+ matched investors."
    });
    setShowUpsell(true);
  };

  return (
    <DemoLayout currentPage="fund-discovery">
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/demo')}
                  className="gap-1 -ml-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Dashboard
                </Button>
              </div>
              <h1 className="text-2xl font-serif font-bold">VC Network</h1>
              <p className="text-sm text-muted-foreground">
                Climate-focused investors matched to <span className="font-medium text-foreground">{DEMO_COMPANY.name}</span>
              </p>
            </div>
          </div>

          {/* Demo Notice */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Explore sample investor matches</p>
                  <p className="text-xs text-muted-foreground">
                    The full VC Network includes 800+ investors with detailed matching based on your startup's specific profile, stage, sector, and traction.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search funds, locations, focus areas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={showMatches ? "default" : "outline"}
                size="sm"
                onClick={() => setShowMatches(!showMatches)}
                className="gap-1.5"
              >
                <TrendingUp className="w-4 h-4" />
                My Matches
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowUpDown className="w-4 h-4" />
                Sort
              </Button>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredFunds.length} investor{filteredFunds.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Fund List */}
          <div className="space-y-3">
            {filteredFunds.map((fund) => (
              <Card 
                key={fund.id}
                className="cursor-pointer hover:border-primary/30 transition-all"
                onClick={() => setSelectedFund(fund)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Logo placeholder */}
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-muted-foreground" />
                    </div>
                    
                    {/* Fund info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-sm">{fund.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {fund.city}, {fund.country}
                            </div>
                          </div>
                        </div>
                        
                        {/* Match score */}
                        <div className={`px-2 py-1 rounded-md text-xs font-semibold border ${getMatchColor(fund.matchScore)}`}>
                          {fund.matchScore}% match
                        </div>
                      </div>
                      
                      {/* Focus areas */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {fund.investment_focus?.slice(0, 3).map((focus, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {focus}
                          </Badge>
                        ))}
                        {fund.stages?.slice(0, 2).map((stage, i) => (
                          <Badge key={`stage-${i}`} variant="outline" className="text-[10px] px-1.5 py-0">
                            {stage}
                          </Badge>
                        ))}
                      </div>

                      {/* Fund size */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Fund: {formatCurrency(fund.fund_size || 0)}</span>
                        <span>Ticket: {formatCurrency(fund.ticket_size_min || 0)} - {formatCurrency(fund.ticket_size_max || 0)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </div>

      {/* Fund Detail Sheet */}
      <Sheet open={!!selectedFund} onOpenChange={() => setSelectedFund(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selectedFund && (
            <>
              <SheetHeader className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <SheetTitle className="text-xl">{selectedFund.name}</SheetTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {selectedFund.city}, {selectedFund.country}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Match Score */}
                <div className={`p-3 rounded-lg border ${getMatchColor(selectedFund.matchScore)}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Match Strength</span>
                    <span className="text-lg font-bold">{selectedFund.matchScore}%</span>
                  </div>
                  <p className="text-xs mt-1 opacity-80">
                    Based on stage, sector, and thesis alignment
                  </p>
                </div>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Investment Details */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Investment Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Fund Size</p>
                      <p className="text-sm font-semibold mt-0.5">{formatCurrency(selectedFund.fund_size || 0)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ticket Size</p>
                      <p className="text-sm font-semibold mt-0.5">
                        {formatCurrency(selectedFund.ticket_size_min || 0)} - {formatCurrency(selectedFund.ticket_size_max || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Focus Areas */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Focus Areas</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedFund.investment_focus?.map((focus, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {focus}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Stages */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Investment Stages</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedFund.stages?.map((stage, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {stage}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Thesis Keywords */}
                {selectedFund.thesis_keywords && selectedFund.thesis_keywords.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">Thesis Keywords</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedFund.thesis_keywords.map((keyword, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-primary/5">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notable Investments */}
                {selectedFund.notable_investments && selectedFund.notable_investments.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">Notable Investments</h4>
                    <div className="space-y-2">
                      {selectedFund.notable_investments.map((inv, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                          <span className="text-sm">{inv.name}</span>
                          <Badge variant="secondary" className="text-[10px]">{inv.round}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2 pt-4 border-t">
                  <Button className="w-full gap-2" onClick={handleContactFund}>
                    <Mail className="w-4 h-4" />
                    Get Intro
                  </Button>
                  <Button variant="outline" className="w-full gap-2" onClick={handleContactFund}>
                    <ExternalLink className="w-4 h-4" />
                    View Full Profile
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <DemoUpsellModal
        open={showUpsell}
        onOpenChange={setShowUpsell}
        feature={upsellContext.feature}
        description={upsellContext.description}
      />
    </DemoLayout>
  );
}
