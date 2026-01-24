/**
 * AcceleratorFundDiscovery - Investor Network view for accelerators
 * 
 * Allows accelerators to browse and match investors for a specific startup
 * in their portfolio, using the startup's company context for matching.
 */

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Building2, Eye, Loader2, Search, Filter, Users, MapPin, Briefcase, DollarSign, Target, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Company {
  id: string;
  name: string;
  category: string | null;
  stage: string;
}

interface FundData {
  id: string;
  organization_name: string | null;
  city: string | null;
  country: string | null;
  fund_size: number | null;
  stages: string[] | null;
  investment_focus: string[] | null;
  ticket_size_min: number | null;
  ticket_size_max: number | null;
  thesis_keywords: string[] | null;
  notable_investments: string[] | null;
}

const STAGE_OPTIONS = ["All Stages", "Pre-Seed", "Seed", "Series A", "Series B", "Growth"];
const SECTOR_OPTIONS = ["All Sectors", "SaaS", "Fintech", "HealthTech", "AI/ML", "Climate", "Consumer", "B2B", "Marketplace", "DeepTech"];

export default function AcceleratorFundDiscovery() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("All Stages");
  const [sectorFilter, setSectorFilter] = useState("All Sectors");

  // Fetch company
  useEffect(() => {
    const fetchCompany = async () => {
      if (!id || !isAuthenticated || authLoading) return;

      try {
        const { data, error } = await supabase
          .from("companies")
          .select("id, name, category, stage")
          .eq("id", id)
          .single();

        if (error) throw error;
        setCompany(data);
      } catch (error: any) {
        console.error("Error fetching company:", error);
        toast.error("Failed to load startup data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompany();
  }, [id, isAuthenticated, authLoading]);

  // Fetch funds
  const { data: funds, isLoading: fundsLoading } = useQuery({
    queryKey: ['accelerator-fund-discovery', id],
    queryFn: async (): Promise<FundData[]> => {
      const { data, error } = await supabase
        .from('global_contacts')
        .select('id, organization_name, city, country, fund_size, stages, investment_focus, ticket_size_min, ticket_size_max, thesis_keywords, notable_investments')
        .not('organization_name', 'is', null);

      if (error) throw error;
      
      return (data || []).map(contact => ({
        id: contact.id,
        organization_name: contact.organization_name,
        city: contact.city,
        country: contact.country,
        fund_size: contact.fund_size,
        ticket_size_min: contact.ticket_size_min,
        ticket_size_max: contact.ticket_size_max,
        stages: Array.isArray(contact.stages) ? contact.stages.map(String) : [],
        investment_focus: Array.isArray(contact.investment_focus) ? contact.investment_focus.map(String) : [],
        thesis_keywords: Array.isArray(contact.thesis_keywords) ? contact.thesis_keywords.map(String) : [],
        notable_investments: Array.isArray(contact.notable_investments) ? contact.notable_investments.map(String) : [],
      }));
    },
    enabled: !!id && isAuthenticated
  });

  // Calculate match score based on company context
  const calculateMatchScore = (fund: FundData): number => {
    if (!company) return 0;
    let score = 0;

    // Stage match (40 points)
    if (fund.stages?.some(s => s.toLowerCase().includes(company.stage.toLowerCase()))) {
      score += 40;
    }

    // Sector match (40 points)
    if (company.category && fund.investment_focus?.some(f => 
      f.toLowerCase().includes(company.category!.toLowerCase()) ||
      company.category!.toLowerCase().includes(f.toLowerCase())
    )) {
      score += 40;
    }

    // Thesis keyword match (20 points)
    if (company.category && fund.thesis_keywords?.some(k =>
      k.toLowerCase().includes(company.category!.toLowerCase())
    )) {
      score += 20;
    }

    return Math.min(score, 100);
  };

  // Filter and sort funds
  const filteredFunds = useMemo(() => {
    if (!funds) return [];

    return funds
      .filter(fund => {
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesName = fund.organization_name?.toLowerCase().includes(query);
          const matchesLocation = fund.city?.toLowerCase().includes(query) || fund.country?.toLowerCase().includes(query);
          if (!matchesName && !matchesLocation) return false;
        }

        if (stageFilter !== "All Stages") {
          if (!fund.stages?.some(s => s.toLowerCase().includes(stageFilter.toLowerCase()))) {
            return false;
          }
        }

        if (sectorFilter !== "All Sectors") {
          if (!fund.investment_focus?.some(f => f.toLowerCase().includes(sectorFilter.toLowerCase()))) {
            return false;
          }
        }

        return true;
      })
      .map(fund => ({
        ...fund,
        matchScore: calculateMatchScore(fund)
      }))
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [funds, searchQuery, stageFilter, sectorFilter, company]);

  const formatTicketSize = (min: number | null, max: number | null) => {
    if (!min && !max) return "Undisclosed";
    const formatNum = (n: number) => {
      if (n >= 1000000) return `€${(n / 1000000).toFixed(1)}M`;
      if (n >= 1000) return `€${(n / 1000).toFixed(0)}K`;
      return `€${n}`;
    };
    if (min && max) return `${formatNum(min)} - ${formatNum(max)}`;
    if (min) return `${formatNum(min)}+`;
    if (max) return `Up to ${formatNum(max)}`;
    return "Undisclosed";
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading investor network...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Users className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">Startup Not Found</h2>
          <Button onClick={() => navigate("/accelerator")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(`/accelerator/startup/${id}/preview`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Ecosystem
              </Button>
              
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h1 className="font-semibold text-foreground">Investor Network</h1>
                  <p className="text-xs text-muted-foreground">Matching for {company.name}</p>
                </div>
              </div>
            </div>
            
            {/* Read-only badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/20 border border-secondary/30">
              <Eye className="w-4 h-4 text-secondary" />
              <span className="text-xs font-medium text-secondary">Read-Only</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Context Banner */}
        <Card className="border-emerald-500/20 bg-card/60 backdrop-blur-2xl mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                <Target className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Finding investors for {company.name}</p>
                <p className="text-xs text-muted-foreground">
                  Matching based on {company.stage} stage and {company.category || "general"} focus. Higher match scores indicate better alignment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search funds by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAGE_OPTIONS.map(stage => (
                <SelectItem key={stage} value={stage}>{stage}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SECTOR_OPTIONS.map(sector => (
                <SelectItem key={sector} value={sector}>{sector}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-4">
          {filteredFunds.length} investors found
        </p>

        {/* Fund Grid */}
        {fundsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filteredFunds.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No matching investors found</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredFunds.slice(0, 50).map(fund => (
              <Card key={fund.id} className="group hover:border-primary/30 transition-colors">
                <CardContent className="p-4 space-y-3">
                  {/* Header with match score */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {fund.organization_name || "Unknown Fund"}
                      </h3>
                      {(fund.city || fund.country) && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{[fund.city, fund.country].filter(Boolean).join(", ")}</span>
                        </div>
                      )}
                    </div>
                    <Badge 
                      variant="secondary"
                      className={cn(
                        "shrink-0",
                        fund.matchScore >= 60 && "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
                        fund.matchScore >= 40 && fund.matchScore < 60 && "bg-amber-500/15 text-amber-600 border-amber-500/30",
                        fund.matchScore < 40 && "bg-muted text-muted-foreground"
                      )}
                    >
                      {fund.matchScore}% match
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-xs">
                    {fund.stages && fund.stages.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">
                          {fund.stages.slice(0, 3).join(", ")}
                        </span>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">
                        {formatTicketSize(fund.ticket_size_min, fund.ticket_size_max)}
                      </span>
                    </div>
                  </div>

                  {/* Focus tags */}
                  {fund.investment_focus && fund.investment_focus.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {fund.investment_focus.slice(0, 3).map((focus, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">
                          {focus}
                        </Badge>
                      ))}
                      {fund.investment_focus.length > 3 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          +{fund.investment_focus.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
