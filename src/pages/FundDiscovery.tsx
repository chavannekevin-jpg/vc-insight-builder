import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  Building2, Search, MapPin, Users, DollarSign, 
  Target, ArrowLeft, X, Sparkles,
  TrendingUp, ChevronRight, Briefcase, Hash,
  Lightbulb, Zap, Filter, Globe, ArrowUpRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";
import { useAuth } from "@/hooks/useAuth";
import { useStartupMatchingProfile } from "@/hooks/useStartupMatchingProfile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
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

const STAGE_OPTIONS = ["All Stages", "Pre-Seed", "Seed", "Series A", "Series B", "Series C+", "Growth"];
const SECTOR_OPTIONS = ["All Sectors", "SaaS", "Fintech", "HealthTech", "AI/ML", "Climate", "Consumer", "B2B", "Marketplace", "DeepTech", "EdTech", "PropTech", "Mobility"];

export default function FundDiscovery() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { company, isLoading: companyLoading } = useCompany(user?.id);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("All Stages");
  const [sectorFilter, setSectorFilter] = useState("All Sectors");
  const [showOnlyMatches, setShowOnlyMatches] = useState(true);
  const [selectedFund, setSelectedFund] = useState<FundWithMatch | null>(null);
  const [sortBy, setSortBy] = useState<"match" | "name" | "size">("match");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [authLoading, user, navigate]);

  const hasPremium = company?.has_premium === true;

  const { data: enrichedProfile, isLoading: profileLoading } = useStartupMatchingProfile(
    company?.id || null,
    company ? { stage: company.stage, category: company.category } : null
  );

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

  const { data: funds, isLoading: fundsLoading } = useQuery({
    queryKey: ['fund-discovery'],
    queryFn: async (): Promise<FundData[]> => {
      const { data: globalContacts, error: gcError } = await supabase
        .from('global_contacts')
        .select('id, organization_name, city, country, fund_size, stages, investment_focus, ticket_size_min, ticket_size_max, thesis_keywords, notable_investments')
        .not('organization_name', 'is', null);

      if (gcError) throw gcError;

      const { data: investorProfiles, error: ipError } = await supabase
        .from('investor_profiles')
        .select('id, organization_name, city, preferred_stages, primary_sectors, ticket_size_min, ticket_size_max')
        .eq('onboarding_completed', true)
        .not('organization_name', 'is', null);

      if (ipError) throw ipError;

      const fundMap = new Map<string, FundData>();

      const toStringArray = (val: unknown): string[] | null => {
        if (!val) return null;
        if (Array.isArray(val)) return val.map(v => String(v));
        return [String(val)];
      };

      globalContacts?.forEach(gc => {
        const orgName = gc.organization_name?.trim();
        if (!orgName) return;

        const existing = fundMap.get(orgName.toLowerCase());
        if (existing) {
          existing.team_count += 1;
          const stagesArr = toStringArray(gc.stages);
          if (stagesArr) existing.stages = [...new Set([...(existing.stages || []), ...stagesArr])];
          const focusArr = toStringArray(gc.investment_focus);
          if (focusArr) existing.investment_focus = [...new Set([...(existing.investment_focus || []), ...focusArr])];
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

      investorProfiles?.forEach(ip => {
        const orgName = ip.organization_name?.trim();
        if (!orgName) return;

        const existing = fundMap.get(orgName.toLowerCase());
        if (existing) {
          existing.team_count += 1;
          const stagesArr = toStringArray(ip.preferred_stages);
          if (stagesArr) existing.stages = [...new Set([...(existing.stages || []), ...stagesArr])];
          const focusArr = toStringArray(ip.primary_sectors);
          if (focusArr) existing.investment_focus = [...new Set([...(existing.investment_focus || []), ...focusArr])];
          if (!existing.ticket_size_min && ip.ticket_size_min) existing.ticket_size_min = ip.ticket_size_min;
          if (!existing.ticket_size_max && ip.ticket_size_max) existing.ticket_size_max = ip.ticket_size_max;
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

  const filteredFunds = useMemo(() => {
    let result = fundsWithMatches;
    
    if (showOnlyMatches) {
      result = result.filter(f => f.matchResult.percentage >= 20);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(fund => {
        return fund.organization_name.toLowerCase().includes(query) ||
          fund.city?.toLowerCase().includes(query) ||
          fund.country?.toLowerCase().includes(query) ||
          fund.investment_focus?.some(f => f.toLowerCase().includes(query)) ||
          fund.thesis_keywords?.some(k => k.toLowerCase().includes(query));
      });
    }

    if (stageFilter !== "All Stages") {
      result = result.filter(fund => fund.stages?.some(s => s.toLowerCase().includes(stageFilter.toLowerCase())));
    }

    if (sectorFilter !== "All Sectors") {
      result = result.filter(fund => fund.investment_focus?.some(f => f.toLowerCase().includes(sectorFilter.toLowerCase())));
    }

    if (sortBy === "match") result.sort((a, b) => b.matchResult.percentage - a.matchResult.percentage);
    else if (sortBy === "name") result.sort((a, b) => a.organization_name.localeCompare(b.organization_name));
    else if (sortBy === "size") result.sort((a, b) => (b.fund_size || 0) - (a.fund_size || 0));

    return result;
  }, [fundsWithMatches, searchQuery, stageFilter, sectorFilter, showOnlyMatches, sortBy]);

  const matchingCount = fundsWithMatches.filter(f => f.matchResult.percentage >= 20).length;
  const strongCount = fundsWithMatches.filter(f => f.matchResult.tier === 'strong').length;
  const isLoading = companyLoading || fundsLoading || profileLoading;

  if (!companyLoading && !hasPremium) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-[0_0_30px_rgba(236,72,153,0.2)]">
            <Building2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-4">Investor Discovery</h1>
          <p className="text-muted-foreground mb-8">
            Find VCs, angels, and family offices that match your startup profile. 
            AI-powered matching based on stage, sector, and investment thesis.
          </p>
          <Button onClick={() => navigate('/checkout-memo')} size="lg" className="shadow-[0_0_20px_rgba(236,72,153,0.3)]">
            <Zap className="w-4 h-4 mr-2" />
            Unlock Full Access
          </Button>
          <Button variant="ghost" onClick={() => navigate('/portal')} className="ml-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/portal')} className="h-8 w-8 p-0">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-lg font-bold flex items-center gap-2">
                  Investor Discovery
                </h1>
                <p className="text-xs text-muted-foreground">
                  {filteredFunds.length} of {fundsWithMatches.length} investors
                </p>
              </div>
            </div>
            
            {/* Profile Pills */}
            <div className="hidden md:flex items-center gap-1.5">
              {startupProfile.stage && (
                <Badge className="bg-primary/15 text-primary border-0 text-xs">
                  {startupProfile.stage}
                </Badge>
              )}
              {startupProfile.sector?.slice(0, 1).map((s, i) => (
                <Badge key={i} variant="secondary" className="text-xs border-0">
                  {s}
                </Badge>
              ))}
              {startupProfile.hasRevenue && (
                <Badge className="bg-green-500/15 text-green-500 border-0 text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Revenue
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Search & Toolbar */}
      <div className="border-b border-border/40 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex flex-col gap-3">
            {/* Search Row */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, city, or focus area..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-background border-border/50 focus:border-primary/50 text-sm"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Row */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Left: Match Toggle */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <Switch
                    checked={showOnlyMatches}
                    onCheckedChange={setShowOnlyMatches}
                    className="data-[state=checked]:bg-primary"
                  />
                  <span className="text-sm font-medium flex items-center gap-1.5 group-hover:text-primary transition-colors">
                    <Sparkles className="w-3.5 h-3.5" />
                    My Matches
                    {matchingCount > 0 && (
                      <Badge className="bg-primary/15 text-primary border-0 text-[10px] px-1.5 py-0 ml-1">
                        {matchingCount}
                      </Badge>
                    )}
                  </span>
                </label>
                
                {strongCount > 0 && (
                  <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                    <Zap className="w-3 h-3 text-primary" />
                    <span><span className="text-primary font-medium">{strongCount}</span> strong</span>
                  </div>
                )}
              </div>

              {/* Right: Filters */}
              <div className="flex items-center gap-2">
                <Select value={stageFilter} onValueChange={setStageFilter}>
                  <SelectTrigger className="h-8 w-[110px] text-xs bg-background border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGE_OPTIONS.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={sectorFilter} onValueChange={setSectorFilter}>
                  <SelectTrigger className="h-8 w-[110px] text-xs bg-background border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTOR_OPTIONS.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                  <SelectTrigger className="h-8 w-[100px] text-xs bg-background border-border/50">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="match" className="text-xs">Best Match</SelectItem>
                    <SelectItem value="name" className="text-xs">Name A-Z</SelectItem>
                    <SelectItem value="size" className="text-xs">Fund Size</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : filteredFunds.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No investors found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {showOnlyMatches ? "Try turning off 'My Matches' filter" : "Try different search terms"}
            </p>
            <Button variant="outline" size="sm" onClick={() => {
              setSearchQuery("");
              setStageFilter("All Stages");
              setSectorFilter("All Sectors");
              setShowOnlyMatches(false);
            }}>
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {/* List Header */}
            <div className="hidden md:grid md:grid-cols-[auto_1fr_120px_100px_80px_32px] gap-4 px-3 py-2 text-xs text-muted-foreground font-medium border-b border-border/30 mb-2">
              <div className="w-12">Match</div>
              <div>Investor</div>
              <div>Location</div>
              <div>Stages</div>
              <div>Size</div>
              <div></div>
            </div>
            
            {filteredFunds.map(fund => (
              <InvestorListItem 
                key={fund.id} 
                fund={fund} 
                onClick={() => setSelectedFund(fund)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedFund} onOpenChange={() => setSelectedFund(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          {selectedFund && <FundDetailPanel fund={selectedFund} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Compact List Item
function InvestorListItem({ fund, onClick }: { fund: FundWithMatch; onClick: () => void }) {
  const tierStyle = getMatchTierStyle(fund.matchResult.tier);
  const isMatch = fund.matchResult.percentage >= 20;
  
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all duration-150 hover:bg-muted/50 group ${
        fund.matchResult.tier === 'strong' 
          ? 'border-primary/25 bg-primary/5 hover:border-primary/40' 
          : 'border-transparent hover:border-border/50'
      }`}
    >
      <div className="flex items-center gap-3 md:grid md:grid-cols-[auto_1fr_120px_100px_80px_32px] md:gap-4">
        {/* Match Score */}
        <div className={`w-11 h-11 md:w-10 md:h-10 rounded-lg flex flex-col items-center justify-center shrink-0 ${tierStyle.bg} ${tierStyle.glow}`}>
          <span className={`text-sm font-bold ${tierStyle.text}`}>
            {fund.matchResult.percentage}%
          </span>
        </div>
        
        {/* Name & Signals */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
              {fund.organization_name}
            </h3>
            {fund.matchResult.tier === 'strong' && (
              <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
            )}
          </div>
          {/* Mobile: Show signals */}
          <div className="md:hidden flex items-center gap-2 mt-1 flex-wrap">
            {fund.matchResult.matchSignals.slice(0, 2).map((signal, i) => (
              <span key={i} className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                {signal.type === 'stage' && <Target className="w-2.5 h-2.5" />}
                {signal.type === 'sector' && <Briefcase className="w-2.5 h-2.5" />}
                {signal.label}
              </span>
            ))}
          </div>
          {/* Desktop: Show tags */}
          <div className="hidden md:flex items-center gap-1.5 mt-0.5">
            {fund.matchResult.matchSignals.slice(0, 2).map((signal, i) => (
              <Badge key={i} variant="outline" className="text-[9px] py-0 px-1 border-border/50">
                {signal.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Location - Desktop */}
        <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground truncate">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{fund.city || fund.country || '—'}</span>
        </div>

        {/* Stages - Desktop */}
        <div className="hidden md:block text-xs text-muted-foreground truncate">
          {fund.stages?.slice(0, 2).join(', ') || '—'}
        </div>

        {/* Size - Desktop */}
        <div className="hidden md:block text-xs text-muted-foreground">
          {formatCurrency(fund.fund_size)}
        </div>

        {/* Arrow */}
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
      </div>
    </button>
  );
}

// Detail Panel
function FundDetailPanel({ fund }: { fund: FundWithMatch }) {
  const tierStyle = getMatchTierStyle(fund.matchResult.tier);
  
  return (
    <>
      <SheetHeader className="pb-4">
        <div className="flex items-start gap-3">
          <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center ${tierStyle.bg} ${tierStyle.glow}`}>
            <span className={`text-lg font-bold ${tierStyle.text}`}>
              {fund.matchResult.percentage}%
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <SheetTitle className="text-lg mb-0.5">{fund.organization_name}</SheetTitle>
            {(fund.city || fund.country) && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                {[fund.city, fund.country].filter(Boolean).join(", ")}
              </div>
            )}
          </div>
        </div>
      </SheetHeader>

      <div className="space-y-5">
        {/* Match Reasons */}
        {fund.matchResult.matchSignals.length > 0 && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <h4 className="text-xs font-semibold flex items-center gap-1.5 mb-2 text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              Why You Match
            </h4>
            <div className="space-y-1.5">
              {fund.matchResult.matchSignals.map((signal, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {signal.type === 'stage' && <Target className={`w-3.5 h-3.5 ${signal.strength === 'high' ? 'text-primary' : 'text-muted-foreground'}`} />}
                  {signal.type === 'sector' && <Briefcase className={`w-3.5 h-3.5 ${signal.strength === 'high' ? 'text-primary' : 'text-muted-foreground'}`} />}
                  {signal.type === 'theme' && <Lightbulb className={`w-3.5 h-3.5 ${signal.strength === 'high' ? 'text-primary' : 'text-muted-foreground'}`} />}
                  {signal.type === 'keyword' && <Hash className={`w-3.5 h-3.5 ${signal.strength === 'high' ? 'text-primary' : 'text-muted-foreground'}`} />}
                  {signal.type === 'ticket' && <DollarSign className={`w-3.5 h-3.5 ${signal.strength === 'high' ? 'text-primary' : 'text-muted-foreground'}`} />}
                  {signal.type === 'traction' && <TrendingUp className={`w-3.5 h-3.5 ${signal.strength === 'high' ? 'text-primary' : 'text-muted-foreground'}`} />}
                  <span className="text-muted-foreground">{signal.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Investment Details */}
        <div>
          <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            Investment
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/40 rounded-lg p-2.5">
              <p className="text-[10px] text-muted-foreground mb-0.5">Ticket</p>
              <p className="font-medium text-sm">
                {fund.ticket_size_min || fund.ticket_size_max
                  ? `${formatCurrency(fund.ticket_size_min)} - ${formatCurrency(fund.ticket_size_max)}`
                  : "—"}
              </p>
            </div>
            <div className="bg-muted/40 rounded-lg p-2.5">
              <p className="text-[10px] text-muted-foreground mb-0.5">Fund Size</p>
              <p className="font-medium text-sm">{formatCurrency(fund.fund_size)}</p>
            </div>
          </div>
        </div>

        {/* Stages */}
        {fund.stages && fund.stages.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              Stages
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {fund.stages.map((stage, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{stage}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Focus */}
        {fund.investment_focus && fund.investment_focus.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              Focus Areas
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {fund.investment_focus.map((f, i) => (
                <Badge key={i} variant="outline" className="text-xs">{f}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Keywords */}
        {fund.thesis_keywords && fund.thesis_keywords.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" />
              Thesis Keywords
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {fund.thesis_keywords.map((kw, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-primary/5 border-primary/20">{kw}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Notable Investments */}
        {fund.notable_investments && fund.notable_investments.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              Portfolio
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {fund.notable_investments.slice(0, 6).map((inv, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-muted/50">{inv}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Team */}
        {fund.team_count > 1 && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>{fund.team_count} team members in network</span>
          </div>
        )}
      </div>
    </>
  );
}
