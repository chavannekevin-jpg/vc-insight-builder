import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  Building2, Search, MapPin, Users, DollarSign, 
  Target, ArrowLeft, X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModernCard } from "@/components/ModernCard";
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
];

export default function FundDiscovery() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { company, isLoading: companyLoading } = useCompany(user?.id);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("All Stages");
  const [sectorFilter, setSectorFilter] = useState("All Sectors");
  const [selectedFund, setSelectedFund] = useState<FundData | null>(null);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [authLoading, user, navigate]);

  // Check premium access
  const hasPremium = company?.has_premium === true;

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
          // Merge stages and focus
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
          // Merge stages and focus
          const stagesArr = toStringArray(ip.preferred_stages);
          if (stagesArr) {
            existing.stages = [...new Set([...(existing.stages || []), ...stagesArr])];
          }
          const focusArr = toStringArray(ip.primary_sectors);
          if (focusArr) {
            existing.investment_focus = [...new Set([...(existing.investment_focus || []), ...focusArr])];
          }
          // Update ticket size if not set
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

      return Array.from(fundMap.values()).sort((a, b) => 
        a.organization_name.localeCompare(b.organization_name)
      );
    },
    enabled: hasPremium,
  });

  // Filter funds
  const filteredFunds = useMemo(() => {
    if (!funds) return [];
    
    return funds.filter(fund => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = fund.organization_name.toLowerCase().includes(query);
        const matchesCity = fund.city?.toLowerCase().includes(query);
        const matchesCountry = fund.country?.toLowerCase().includes(query);
        const matchesFocus = fund.investment_focus?.some(f => 
          f.toLowerCase().includes(query)
        );
        if (!matchesName && !matchesCity && !matchesCountry && !matchesFocus) {
          return false;
        }
      }

      // Stage filter
      if (stageFilter !== "All Stages") {
        const hasStage = fund.stages?.some(s => 
          s.toLowerCase().includes(stageFilter.toLowerCase())
        );
        if (!hasStage) return false;
      }

      // Sector filter
      if (sectorFilter !== "All Sectors") {
        const hasSector = fund.investment_focus?.some(f =>
          f.toLowerCase().includes(sectorFilter.toLowerCase())
        );
        if (!hasSector) return false;
      }

      return true;
    });
  }, [funds, searchQuery, stageFilter, sectorFilter]);

  const isLoading = companyLoading || fundsLoading;

  // Premium access gate
  if (!companyLoading && !hasPremium) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-4">VC Network Discovery</h1>
          <p className="text-muted-foreground mb-8">
            Unlock access to our network of {funds?.length || "100+"}  venture capital funds, 
            angels, and family offices. Discover the right investors for your stage and sector.
          </p>
          <Button onClick={() => navigate('/checkout-memo')} size="lg">
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
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/portal')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-display font-bold">VC Network</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredFunds.length} funds in our network
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search & Filters */}
      <div className="border-b bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by fund name, location, or sector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGE_OPTIONS.map(stage => (
                    <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTOR_OPTIONS.map(sector => (
                    <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(stageFilter !== "All Stages" || sectorFilter !== "All Sectors" || searchQuery) && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    setSearchQuery("");
                    setStageFilter("All Stages");
                    setSectorFilter("All Sectors");
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fund Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : filteredFunds.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No funds found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFunds.map(fund => (
              <FundCard 
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
        <SheetContent className="overflow-y-auto">
          {selectedFund && (
            <>
              <SheetHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <SheetTitle className="text-2xl">
                  {selectedFund.organization_name}
                </SheetTitle>
                {(selectedFund.city || selectedFund.country) && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {[selectedFund.city, selectedFund.country].filter(Boolean).join(", ")}
                  </div>
                )}
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Investment Details */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Investment Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Ticket Size</p>
                      <p className="font-semibold">
                        {selectedFund.ticket_size_min || selectedFund.ticket_size_max
                          ? `${formatCurrency(selectedFund.ticket_size_min)} - ${formatCurrency(selectedFund.ticket_size_max)}`
                          : "Not specified"}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Fund Size</p>
                      <p className="font-semibold">
                        {formatCurrency(selectedFund.fund_size)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stages */}
                {selectedFund.stages && selectedFund.stages.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Investment Stages
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedFund.stages.map((stage, i) => (
                        <Badge key={i} variant="secondary">
                          {stage}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Focus Areas */}
                {selectedFund.investment_focus && selectedFund.investment_focus.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Focus Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedFund.investment_focus.map((focus, i) => (
                        <Badge key={i} variant="outline">
                          {focus}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Keywords */}
                {selectedFund.thesis_keywords && selectedFund.thesis_keywords.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Thesis Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedFund.thesis_keywords.map((keyword, i) => (
                        <Badge key={i} variant="outline" className="bg-primary/5">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notable Investments */}
                {selectedFund.notable_investments && selectedFund.notable_investments.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Notable Investments</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedFund.notable_investments.map((inv, i) => (
                        <span key={i} className="text-sm text-muted-foreground">
                          {inv}{i < selectedFund.notable_investments!.length - 1 ? " • " : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Team Info */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {selectedFund.team_count} team member{selectedFund.team_count !== 1 ? 's' : ''} on platform
                    </span>
                  </div>
                </div>

                {/* Future: Request Intro */}
                <div className="pt-4 border-t">
                  <Button className="w-full" disabled>
                    Request Intro (Coming Soon)
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    We're building warm intro features for our network
                  </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Fund Card Component
function FundCard({ fund, onClick }: { fund: FundData; onClick: () => void }) {
  return (
    <ModernCard hover onClick={onClick} className="cursor-pointer">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{fund.organization_name}</h3>
            {(fund.city || fund.country) && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {[fund.city, fund.country].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Stages */}
        {fund.stages && fund.stages.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {fund.stages.slice(0, 3).map((stage, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {stage}
              </Badge>
            ))}
            {fund.stages.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{fund.stages.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Focus */}
        {fund.investment_focus && fund.investment_focus.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {fund.investment_focus.slice(0, 2).map((focus, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {focus}
              </Badge>
            ))}
            {fund.investment_focus.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{fund.investment_focus.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
          <span>
            {fund.ticket_size_min || fund.ticket_size_max
              ? `${formatCurrency(fund.ticket_size_min)} - ${formatCurrency(fund.ticket_size_max)}`
              : "Ticket: N/A"}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {fund.team_count}
          </span>
        </div>
      </div>
    </ModernCard>
  );
}
