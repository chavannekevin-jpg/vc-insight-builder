import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  Building2, Search, MapPin, Users, DollarSign, 
  Target, ArrowLeft, X, SlidersHorizontal, Sparkles,
  TrendingUp, ChevronRight, Briefcase, Hash,
  CheckCircle, Lightbulb, Info
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";
import { useAuth } from "@/hooks/useAuth";
import { useStartupMatchingProfile } from "@/hooks/useStartupMatchingProfile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  calculateStartupAffinity, 
  getMatchTierStyle, 
  StartupAffinityResult 
} from "@/lib/startupAffinityCalculator";

interface FundData {
  id: string;
  organization_name: string;
  city: string | null;
  country: string | null;
  fund_size: number | null;
  stages: string[] | null;
  investment_focus: string[] | null;
  ticket_size_min: number | null;
  ticket_size_max: number | null;
  thesis_keywords: string[] | null;
  notable_investments: string[] | null;
  team_count: number;
  source: 'global_contact' | 'investor_profile';
}

interface FundWithMatch extends FundData {
  matchResult: StartupAffinityResult;
}

const formatCurrency = (amount: number | null): string => {
  if (!amount) return "N/A";
  if (amount >= 1000000000) return `€${(amount / 1000000000).toFixed(1)}B`;
  if (amount >= 1000000) return `€${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `€${(amount / 1000).toFixed(0)}K`;
  return `€${amount}`;
};

const STAGE_OPTIONS = [
  "All Stages",
  "Pre-Seed",
  "Seed", 
  "Series A",
  "Series B",
  "Series C+",
  "Growth",
];

const SECTOR_OPTIONS = [
  "All Sectors",
  "SaaS",
  "Fintech",
  "HealthTech",
  "AI/ML",
  "Climate",
  "Consumer",
  "B2B",
  "Marketplace",
  "DeepTech",
  "EdTech",
  "PropTech",
  "Mobility",
];

const MATCH_FILTER_OPTIONS = [
  { value: "all", label: "All Investors" },
  { value: "strong", label: "Strong Matches" },
  { value: "good", label: "Good+ Matches" },
  { value: "any", label: "Any Match" },
];

export default function FundDiscovery() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { company, isLoading: companyLoading } = useCompany(user?.id);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("All Stages");
  const [sectorFilter, setSectorFilter] = useState("All Sectors");
  const [matchFilter, setMatchFilter] = useState("all");
  const [selectedFund, setSelectedFund] = useState<FundWithMatch | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"match" | "name" | "size">("match");

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [authLoading, user, navigate]);

  // Check premium access
  const hasPremium = company?.has_premium === true;

  // Fetch enriched startup profile from memo_responses
  const { data: enrichedProfile, isLoading: profileLoading } = useStartupMatchingProfile(
    company?.id || null,
    company ? { stage: company.stage, category: company.category } : null
  );

  // Build startup profile for matching using enriched data
  const startupProfile = useMemo(() => ({
    stage: enrichedProfile?.stage || company?.stage,
    category: enrichedProfile?.category || company?.category,
    sector: enrichedProfile?.sectors || (company?.category ? [company.category] : []),
    keywords: enrichedProfile?.keywords || [],
    location: null,
    fundingAsk: enrichedProfile?.fundingAsk || null,
    hasRevenue: enrichedProfile?.hasRevenue || false,
    hasCustomers: enrichedProfile?.hasCustomers || false,
    currentARR: enrichedProfile?.currentARR || null,
  }), [company, enrichedProfile]);

  // Fetch aggregated fund data
  const { data: funds, isLoading: fundsLoading } = useQuery({
    queryKey: ['fund-discovery'],
    queryFn: async (): Promise<FundData[]> => {
      // Fetch from global_contacts
      const { data: globalContacts, error: gcError } = await supabase
        .from('global_contacts')
        .select('id, organization_name, city, country, fund_size, stages, investment_focus, ticket_size_min, ticket_size_max, thesis_keywords, notable_investments')
        .not('organization_name', 'is', null);

      if (gcError) throw gcError;

      // Fetch from investor_profiles
      const { data: investorProfiles, error: ipError } = await supabase
        .from('investor_profiles')
        .select('id, organization_name, city, preferred_stages, primary_sectors, ticket_size_min, ticket_size_max')
        .eq('onboarding_completed', true)
        .not('organization_name', 'is', null);

      if (ipError) throw ipError;

      // Aggregate by organization name
      const fundMap = new Map<string, FundData>();

      // Helper to safely convert Json to string[]
      const toStringArray = (val: unknown): string[] | null => {
        if (!val) return null;
        if (Array.isArray(val)) return val.map(v => String(v));
        return [String(val)];
      };

      // Process global contacts
      globalContacts?.forEach(gc => {
        const orgName = gc.organization_name?.trim();
        if (!orgName) return;

        const existing = fundMap.get(orgName.toLowerCase());
        if (existing) {
          existing.team_count += 1;
          const stagesArr = toStringArray(gc.stages);
          if (stagesArr) {
            existing.stages = [...new Set([...(existing.stages || []), ...stagesArr])];
          }
          const focusArr = toStringArray(gc.investment_focus);
          if (focusArr) {
            existing.investment_focus = [...new Set([...(existing.investment_focus || []), ...focusArr])];
          }
        } else {
          fundMap.set(orgName.toLowerCase(), {
            id: gc.id,
            organization_name: orgName,
            city: gc.city,
            country: gc.country,
            fund_size: gc.fund_size,
            stages: toStringArray(gc.stages),
            investment_focus: toStringArray(gc.investment_focus),
            ticket_size_min: gc.ticket_size_min,
            ticket_size_max: gc.ticket_size_max,
            thesis_keywords: toStringArray(gc.thesis_keywords),
            notable_investments: toStringArray(gc.notable_investments),
            team_count: 1,
            source: 'global_contact',
          });
        }
      });

      // Process investor profiles
      investorProfiles?.forEach(ip => {
        const orgName = ip.organization_name?.trim();
        if (!orgName) return;

        const existing = fundMap.get(orgName.toLowerCase());
        if (existing) {
          existing.team_count += 1;
          const stagesArr = toStringArray(ip.preferred_stages);
          if (stagesArr) {
            existing.stages = [...new Set([...(existing.stages || []), ...stagesArr])];
          }
          const focusArr = toStringArray(ip.primary_sectors);
          if (focusArr) {
            existing.investment_focus = [...new Set([...(existing.investment_focus || []), ...focusArr])];
          }
          if (!existing.ticket_size_min && ip.ticket_size_min) {
            existing.ticket_size_min = ip.ticket_size_min;
          }
          if (!existing.ticket_size_max && ip.ticket_size_max) {
            existing.ticket_size_max = ip.ticket_size_max;
          }
        } else {
          fundMap.set(orgName.toLowerCase(), {
            id: ip.id,
            organization_name: orgName,
            city: ip.city,
            country: null,
            fund_size: null,
            stages: toStringArray(ip.preferred_stages),
            investment_focus: toStringArray(ip.primary_sectors),
            ticket_size_min: ip.ticket_size_min,
            ticket_size_max: ip.ticket_size_max,
            thesis_keywords: null,
            notable_investments: null,
            team_count: 1,
            source: 'investor_profile',
          });
        }
      });

      return Array.from(fundMap.values());
    },
    enabled: hasPremium,
  });

  // Calculate matches and filter
  const fundsWithMatches = useMemo((): FundWithMatch[] => {
    if (!funds) return [];
    
    return funds.map(fund => ({
      ...fund,
      matchResult: calculateStartupAffinity(startupProfile, {
        stages: fund.stages,
        investment_focus: fund.investment_focus,
        thesis_keywords: fund.thesis_keywords,
        ticket_size_min: fund.ticket_size_min,
        ticket_size_max: fund.ticket_size_max,
        city: fund.city,
      }),
    }));
  }, [funds, startupProfile]);

  // Filter and sort
  const filteredFunds = useMemo(() => {
    let result = fundsWithMatches;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(fund => {
        const matchesName = fund.organization_name.toLowerCase().includes(query);
        const matchesCity = fund.city?.toLowerCase().includes(query);
        const matchesCountry = fund.country?.toLowerCase().includes(query);
        const matchesFocus = fund.investment_focus?.some(f => 
          f.toLowerCase().includes(query)
        );
        const matchesKeywords = fund.thesis_keywords?.some(k =>
          k.toLowerCase().includes(query)
        );
        return matchesName || matchesCity || matchesCountry || matchesFocus || matchesKeywords;
      });
    }

    // Stage filter
    if (stageFilter !== "All Stages") {
      result = result.filter(fund => 
        fund.stages?.some(s => 
          s.toLowerCase().includes(stageFilter.toLowerCase())
        )
      );
    }

    // Sector filter
    if (sectorFilter !== "All Sectors") {
      result = result.filter(fund =>
        fund.investment_focus?.some(f =>
          f.toLowerCase().includes(sectorFilter.toLowerCase())
        )
      );
    }

    // Match filter
    if (matchFilter === "strong") {
      result = result.filter(f => f.matchResult.tier === 'strong');
    } else if (matchFilter === "good") {
      result = result.filter(f => f.matchResult.tier === 'strong' || f.matchResult.tier === 'good');
    } else if (matchFilter === "any") {
      result = result.filter(f => f.matchResult.percentage > 0);
    }

    // Sort
    if (sortBy === "match") {
      result.sort((a, b) => b.matchResult.percentage - a.matchResult.percentage);
    } else if (sortBy === "name") {
      result.sort((a, b) => a.organization_name.localeCompare(b.organization_name));
    } else if (sortBy === "size") {
      result.sort((a, b) => (b.fund_size || 0) - (a.fund_size || 0));
    }

    return result;
  }, [fundsWithMatches, searchQuery, stageFilter, sectorFilter, matchFilter, sortBy]);

  const strongMatches = fundsWithMatches.filter(f => f.matchResult.tier === 'strong').length;
  const goodMatches = fundsWithMatches.filter(f => f.matchResult.tier === 'good').length;
  const isLoading = companyLoading || fundsLoading || profileLoading;
  const hasActiveFilters = stageFilter !== "All Stages" || sectorFilter !== "All Sectors" || matchFilter !== "all" || searchQuery;
  const dataCompleteness = enrichedProfile?.dataCompleteness || 10;

  // Premium access gate
  if (!companyLoading && !hasPremium) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
            <Building2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-4">VC Network Discovery</h1>
          <p className="text-muted-foreground mb-8">
            Unlock access to our network of {funds?.length || "100+"} venture capital funds, 
            angels, and family offices. Get AI-powered matching to find the right investors for your stage and sector.
          </p>
          <Button onClick={() => navigate('/checkout-memo')} size="lg" className="shadow-[0_0_20px_rgba(236,72,153,0.3)]">
            Unlock Full Analysis
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/portal')} 
            className="ml-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/portal')}
                className="hover:bg-muted/50"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-display font-bold flex items-center gap-2">
                  Investor Discovery
                  <Sparkles className="w-4 h-4 text-primary" />
                </h1>
                <p className="text-sm text-muted-foreground">
                  {filteredFunds.length} investors • 
                  <span className="text-primary ml-1">{strongMatches} strong matches</span>
                </p>
              </div>
            </div>
            
            {company?.stage && (
              <div className="hidden md:flex items-center gap-2 text-sm">
                <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary">
                  <Target className="w-3 h-3 mr-1" />
                  {company.stage}
                </Badge>
                {company.category && (
                  <Badge variant="outline" className="bg-muted/50">
                    {company.category}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* AI Matching Banner */}
      <div className="border-b border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium">
                    AI Matching based on your profile
                  </p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-help">
                          <Info className="w-3 h-3" />
                          <span>{dataCompleteness}% data</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p className="text-xs">
                          Match quality improves with more profile data. 
                          {dataCompleteness < 50 && " Complete your questionnaire or upload a deck to improve matches."}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground mt-1">
                  {startupProfile.stage && (
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-primary/10 border-primary/30 text-primary">
                      {startupProfile.stage}
                    </Badge>
                  )}
                  {startupProfile.sector?.slice(0, 2).map((s, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] py-0 px-1.5">
                      {s}
                    </Badge>
                  ))}
                  {startupProfile.fundingAsk && (
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-green-500/10 border-green-500/30 text-green-400">
                      €{formatCurrency(startupProfile.fundingAsk).replace('€', '')} ask
                    </Badge>
                  )}
                  {startupProfile.hasRevenue && (
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-green-500/10 border-green-500/30 text-green-400">
                      <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                      Revenue
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {strongMatches > 0 && (
                <Badge className="bg-primary/20 text-primary border border-primary/30 shrink-0">
                  {strongMatches} strong match{strongMatches !== 1 ? 'es' : ''}
                </Badge>
              )}
              {goodMatches > 0 && (
                <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 shrink-0">
                  {goodMatches} good
                </Badge>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="border-primary/30 text-primary hover:bg-primary/10 shrink-0"
                onClick={() => {
                  setMatchFilter("strong");
                  setSortBy("match");
                }}
              >
                Top Matches
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="border-b border-border/50 bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            {/* Main Search Row */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search investors by name, location, sector, or thesis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 focus:border-primary/50"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={showFilters ? "secondary" : "outline"}
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                  className="relative"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                  )}
                </Button>
                
                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setSearchQuery("");
                      setStageFilter("All Stages");
                      setSectorFilter("All Sectors");
                      setMatchFilter("all");
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Expandable Filters */}
            <Collapsible open={showFilters} onOpenChange={setShowFilters}>
              <CollapsibleContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Match Quality</label>
                    <Select value={matchFilter} onValueChange={setMatchFilter}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MATCH_FILTER_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Stage</label>
                    <Select value={stageFilter} onValueChange={setStageFilter}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STAGE_OPTIONS.map(stage => (
                          <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Sector</label>
                    <Select value={sectorFilter} onValueChange={setSectorFilter}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SECTOR_OPTIONS.map(sector => (
                          <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Sort By</label>
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="match">Best Match</SelectItem>
                        <SelectItem value="name">Name A-Z</SelectItem>
                        <SelectItem value="size">Fund Size</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : filteredFunds.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No investors found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                setStageFilter("All Stages");
                setSectorFilter("All Sectors");
                setMatchFilter("all");
              }}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFunds.map(fund => (
              <InvestorRow 
                key={fund.id} 
                fund={fund} 
                onClick={() => setSelectedFund(fund)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fund Detail Sheet */}
      <Sheet open={!!selectedFund} onOpenChange={() => setSelectedFund(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          {selectedFund && (
            <FundDetailPanel fund={selectedFund} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Investor Row Component
function InvestorRow({ fund, onClick }: { fund: FundWithMatch; onClick: () => void }) {
  const tierStyle = getMatchTierStyle(fund.matchResult.tier);
  
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 hover:border-primary/30 hover:bg-muted/30 group ${
        fund.matchResult.tier === 'strong' 
          ? 'border-primary/20 bg-primary/5' 
          : 'border-border/50 bg-card/50'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Match Score */}
        <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 ${tierStyle.bg} ${tierStyle.glow}`}>
          <span className={`text-lg font-bold ${tierStyle.text}`}>
            {fund.matchResult.percentage}%
          </span>
        </div>
        
        {/* Fund Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
              {fund.organization_name}
            </h3>
            {fund.matchResult.tier === 'strong' && (
              <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] px-1.5 py-0">
                Top Match
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
            {(fund.city || fund.country) && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {[fund.city, fund.country].filter(Boolean).join(", ")}
              </span>
            )}
            {fund.fund_size && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {formatCurrency(fund.fund_size)}
              </span>
            )}
            {fund.team_count > 1 && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {fund.team_count}
              </span>
            )}
          </div>

          {/* Match Signals */}
          {fund.matchResult.matchSignals.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {fund.matchResult.matchSignals.slice(0, 4).map((signal, i) => (
                <Badge 
                  key={i} 
                  variant="outline" 
                  className={`text-[10px] py-0 ${
                    signal.strength === 'high' ? 'border-primary/30 text-primary' : 'border-border'
                  }`}
                >
                  {signal.type === 'stage' && <Target className="w-2.5 h-2.5 mr-1" />}
                  {signal.type === 'sector' && <Briefcase className="w-2.5 h-2.5 mr-1" />}
                  {signal.type === 'keyword' && <Hash className="w-2.5 h-2.5 mr-1" />}
                  {signal.type === 'theme' && <Lightbulb className="w-2.5 h-2.5 mr-1" />}
                  {signal.type === 'ticket' && <DollarSign className="w-2.5 h-2.5 mr-1" />}
                  {signal.type === 'traction' && <TrendingUp className="w-2.5 h-2.5 mr-1" />}
                  {signal.label}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Tags Preview */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {fund.stages?.slice(0, 2).map((stage, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {stage}
            </Badge>
          ))}
        </div>

        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
      </div>
    </button>
  );
}

// Fund Detail Panel
function FundDetailPanel({ fund }: { fund: FundWithMatch }) {
  const tierStyle = getMatchTierStyle(fund.matchResult.tier);
  
  return (
    <>
      <SheetHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center ${tierStyle.bg} ${tierStyle.glow}`}>
            <span className={`text-xl font-bold ${tierStyle.text}`}>
              {fund.matchResult.percentage}%
            </span>
            <span className="text-[9px] text-muted-foreground">match</span>
          </div>
          <div className="flex-1">
            <SheetTitle className="text-xl mb-1">{fund.organization_name}</SheetTitle>
            {(fund.city || fund.country) && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                {[fund.city, fund.country].filter(Boolean).join(", ")}
              </div>
            )}
          </div>
        </div>
      </SheetHeader>

      <div className="space-y-6">
        {/* Why You Match */}
        {fund.matchResult.matchSignals.length > 0 && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-3 text-primary">
              <Sparkles className="w-4 h-4" />
              Why You Match
            </h4>
            <div className="space-y-2">
              {fund.matchResult.matchSignals.map((signal, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {signal.type === 'stage' && <Target className={`w-4 h-4 ${signal.strength === 'high' ? 'text-primary' : 'text-muted-foreground'}`} />}
                  {signal.type === 'sector' && <Briefcase className={`w-4 h-4 ${signal.strength === 'high' ? 'text-primary' : 'text-muted-foreground'}`} />}
                  {signal.type === 'theme' && <Lightbulb className={`w-4 h-4 ${signal.strength === 'high' ? 'text-primary' : 'text-muted-foreground'}`} />}
                  {signal.type === 'keyword' && <Hash className={`w-4 h-4 ${signal.strength === 'high' ? 'text-primary' : 'text-muted-foreground'}`} />}
                  {signal.type === 'ticket' && <DollarSign className={`w-4 h-4 ${signal.strength === 'high' ? 'text-primary' : 'text-muted-foreground'}`} />}
                  {signal.type === 'traction' && <TrendingUp className={`w-4 h-4 ${signal.strength === 'high' ? 'text-primary' : 'text-muted-foreground'}`} />}
                  <span className="capitalize font-medium">{signal.type}:</span>
                  <span className="text-muted-foreground">{signal.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Investment Details */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Investment Details
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Ticket Size</p>
              <p className="font-semibold text-sm">
                {fund.ticket_size_min || fund.ticket_size_max
                  ? `${formatCurrency(fund.ticket_size_min)} - ${formatCurrency(fund.ticket_size_max)}`
                  : "Not specified"}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Fund Size</p>
              <p className="font-semibold text-sm">
                {formatCurrency(fund.fund_size)}
              </p>
            </div>
          </div>
        </div>

        {/* Stages */}
        {fund.stages && fund.stages.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Target className="w-4 h-4" />
              Investment Stages
            </h4>
            <div className="flex flex-wrap gap-2">
              {fund.stages.map((stage, i) => (
                <Badge key={i} variant="secondary">{stage}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Focus Areas */}
        {fund.investment_focus && fund.investment_focus.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Focus Areas
            </h4>
            <div className="flex flex-wrap gap-2">
              {fund.investment_focus.map((focus, i) => (
                <Badge key={i} variant="outline">{focus}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Keywords */}
        {fund.thesis_keywords && fund.thesis_keywords.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Thesis Keywords
            </h4>
            <div className="flex flex-wrap gap-2">
              {fund.thesis_keywords.map((keyword, i) => (
                <Badge key={i} variant="outline" className="bg-primary/5 border-primary/20">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Notable Investments */}
        {fund.notable_investments && fund.notable_investments.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Notable Investments
            </h4>
            <div className="flex flex-wrap gap-2">
              {fund.notable_investments.slice(0, 8).map((inv, i) => (
                <Badge key={i} variant="outline" className="bg-muted/50">{inv}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Team */}
        {fund.team_count > 1 && (
          <div className="p-3 rounded-lg bg-muted/30 flex items-center gap-3">
            <Users className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{fund.team_count} team members</p>
              <p className="text-xs text-muted-foreground">in our network from this fund</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
