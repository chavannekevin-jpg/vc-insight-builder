import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Building2, 
  MapPin, 
  Users, 
  DollarSign, 
  Target,
  ChevronRight,
  Filter,
  X,
  Briefcase
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FundData {
  organization_name: string;
  city: string | null;
  country: string | null;
  fund_size: number | null;
  stages: string[];
  investment_focus: string[];
  investor_count: number;
  investors: Array<{
    id: string;
    name: string;
    type: string;
    is_platform_user: boolean;
    linked_investor_id: string | null;
  }>;
}

interface FundDirectoryViewProps {
  onSelectFund?: (fund: FundData) => void;
  onSelectInvestor?: (investorId: string) => void;
}

const STAGE_OPTIONS = ["Pre-Seed", "Seed", "Series A", "Series B", "Series C", "Growth"];

const FundDirectoryView = ({ onSelectFund, onSelectInvestor }: FundDirectoryViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [selectedFund, setSelectedFund] = useState<FundData | null>(null);

  // Fetch all global contacts with organization names
  const { data: contacts, isLoading } = useQuery({
    queryKey: ["fund-directory"],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("global_contacts") as any)
        .select("*")
        .not("organization_name", "is", null)
        .order("organization_name");

      if (error) throw error;
      return data;
    },
  });

  // Aggregate contacts by organization
  const funds = useMemo(() => {
    if (!contacts) return [];

    const fundMap = new Map<string, FundData>();

    contacts.forEach((contact: any) => {
      const orgName = contact.organization_name?.trim();
      if (!orgName) return;

      if (!fundMap.has(orgName)) {
        fundMap.set(orgName, {
          organization_name: orgName,
          city: contact.city,
          country: contact.country,
          fund_size: contact.fund_size,
          stages: [],
          investment_focus: [],
          investor_count: 0,
          investors: [],
        });
      }

      const fund = fundMap.get(orgName)!;
      fund.investor_count++;
      
      // Merge stages
      if (contact.stages && Array.isArray(contact.stages)) {
        contact.stages.forEach((stage: string) => {
          if (!fund.stages.includes(stage)) {
            fund.stages.push(stage);
          }
        });
      }

      // Merge investment focus
      if (contact.investment_focus && Array.isArray(contact.investment_focus)) {
        contact.investment_focus.forEach((focus: string) => {
          if (!fund.investment_focus.includes(focus)) {
            fund.investment_focus.push(focus);
          }
        });
      }

      // Take the largest fund size
      if (contact.fund_size && (!fund.fund_size || contact.fund_size > fund.fund_size)) {
        fund.fund_size = contact.fund_size;
      }

      // Add investor
      fund.investors.push({
        id: contact.id,
        name: contact.name,
        type: contact.entity_type,
        is_platform_user: !!contact.linked_investor_id,
        linked_investor_id: contact.linked_investor_id,
      });
    });

    return Array.from(fundMap.values()).sort((a, b) => 
      a.organization_name.localeCompare(b.organization_name)
    );
  }, [contacts]);

  // Get unique locations for filter
  const locations = useMemo(() => {
    const locs = new Set<string>();
    funds.forEach(fund => {
      if (fund.country) locs.add(fund.country);
    });
    return Array.from(locs).sort();
  }, [funds]);

  // Filter funds
  const filteredFunds = useMemo(() => {
    return funds.filter(fund => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesOrg = fund.organization_name.toLowerCase().includes(query);
        const matchesLocation = fund.city?.toLowerCase().includes(query) || 
                               fund.country?.toLowerCase().includes(query);
        const matchesInvestor = fund.investors.some(inv => 
          inv.name.toLowerCase().includes(query)
        );
        if (!matchesOrg && !matchesLocation && !matchesInvestor) return false;
      }

      // Stage filter
      if (stageFilter !== "all") {
        if (!fund.stages.includes(stageFilter)) return false;
      }

      // Location filter
      if (locationFilter !== "all") {
        if (fund.country !== locationFilter) return false;
      }

      return true;
    });
  }, [funds, searchQuery, stageFilter, locationFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setStageFilter("all");
    setLocationFilter("all");
  };

  const hasActiveFilters = searchQuery || stageFilter !== "all" || locationFilter !== "all";

  const formatFundSize = (size: number | null) => {
    if (!size) return null;
    if (size >= 1000000000) return `$${(size / 1000000000).toFixed(1)}B`;
    if (size >= 1000000) return `$${(size / 1000000).toFixed(0)}M`;
    if (size >= 1000) return `$${(size / 1000).toFixed(0)}K`;
    return `$${size}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Fund Directory</h2>
            <p className="text-sm text-muted-foreground">
              Explore {funds.length} funds and their investors
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search funds, investors, or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-[150px]">
            <Target className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {STAGE_OPTIONS.map(stage => (
              <SelectItem key={stage} value={stage}>{stage}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-[150px]">
            <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map(loc => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {filteredFunds.length} fund{filteredFunds.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Fund List */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Fund Cards */}
        <ScrollArea className={`flex-1 ${selectedFund ? "w-1/2" : "w-full"}`}>
          <div className="grid gap-3 pr-4">
            {filteredFunds.map((fund) => (
              <div
                key={fund.organization_name}
                onClick={() => setSelectedFund(fund)}
                className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                  selectedFund?.organization_name === fund.organization_name
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                      <h3 className="font-medium truncate">{fund.organization_name}</h3>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
                      {(fund.city || fund.country) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {[fund.city, fund.country].filter(Boolean).join(", ")}
                        </span>
                      )}
                      {fund.fund_size && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {formatFundSize(fund.fund_size)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {fund.investor_count} investor{fund.investor_count !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {fund.stages.slice(0, 3).map((stage) => (
                        <Badge key={stage} variant="secondary" className="text-xs">
                          {stage}
                        </Badge>
                      ))}
                      {fund.stages.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{fund.stages.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                </div>
              </div>
            ))}

            {filteredFunds.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-medium mb-1">No funds found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Fund Detail Panel */}
        {selectedFund && (
          <div className="w-1/2 border-l pl-4">
            <div className="sticky top-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{selectedFund.organization_name}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedFund(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Fund Details */}
              <div className="space-y-4 mb-6">
                {(selectedFund.city || selectedFund.country) && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{[selectedFund.city, selectedFund.country].filter(Boolean).join(", ")}</span>
                  </div>
                )}
                {selectedFund.fund_size && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>Fund Size: {formatFundSize(selectedFund.fund_size)}</span>
                  </div>
                )}
                {selectedFund.stages.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Investment Stages</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedFund.stages.map((stage) => (
                        <Badge key={stage} variant="secondary">{stage}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedFund.investment_focus.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Focus Areas</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedFund.investment_focus.map((focus) => (
                        <Badge key={focus} variant="outline">{focus}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Investors List */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Team Members ({selectedFund.investors.length})
                </h4>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {selectedFund.investors.map((investor) => (
                      <div
                        key={investor.id}
                        onClick={() => onSelectInvestor?.(investor.id)}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{investor.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {investor.type.replace("_", " ")}
                            </p>
                          </div>
                        </div>
                        {investor.is_platform_user && (
                          <Badge variant="default" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                            On Platform
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundDirectoryView;
