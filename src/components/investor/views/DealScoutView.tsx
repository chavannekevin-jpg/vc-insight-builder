import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Compass, 
  Search, 
  Plus, 
  Eye, 
  Building2, 
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Filter,
  Star,
  UserPlus
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ScoreboardCompany {
  id: string;
  name: string;
  stage: string;
  category: string | null;
  description: string | null;
  public_score: number;
  scoreboard_anonymous: boolean;
  vc_verdict_json: any;
}

interface DealScoutViewProps {
  userId: string | null;
}

const SCORE_THRESHOLD = 60;

const DealScoutView = ({ userId }: DealScoutViewProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [scoreFilter, setScoreFilter] = useState<string>("all");
  const [selectedCompany, setSelectedCompany] = useState<ScoreboardCompany | null>(null);
  const [addingToDealflow, setAddingToDealflow] = useState<string | null>(null);

  // Fetch scoreboard companies
  const { data: companies = [], isLoading, refetch } = useQuery({
    queryKey: ["scoreboard-companies", stageFilter, scoreFilter],
    queryFn: async () => {
      let query = supabase
        .from("companies")
        .select("id, name, stage, category, description, public_score, scoreboard_anonymous, vc_verdict_json")
        .eq("scoreboard_opt_in", true)
        .eq("memo_content_generated", true)
        .gte("public_score", SCORE_THRESHOLD)
        .order("public_score", { ascending: false })
        .limit(50);

      if (stageFilter !== "all") {
        query = query.eq("stage", stageFilter);
      }

      if (scoreFilter === "85+") {
        query = query.gte("public_score", 85);
      } else if (scoreFilter === "75-84") {
        query = query.gte("public_score", 75).lt("public_score", 85);
      } else if (scoreFilter === "60-74") {
        query = query.gte("public_score", 60).lt("public_score", 75);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ScoreboardCompany[];
    },
    enabled: !!userId,
  });

  // Fetch existing dealflow to check which companies are already added
  const { data: existingDealflow = [] } = useQuery({
    queryKey: ["investor-dealflow-ids", userId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("investor_dealflow") as any)
        .select("company_id")
        .eq("investor_id", userId);
      
      if (error) throw error;
      return data.map((d: any) => d.company_id);
    },
    enabled: !!userId,
  });

  const filteredCompanies = useMemo(() => {
    if (!searchTerm) return companies;
    const term = searchTerm.toLowerCase();
    return companies.filter(c => 
      (!c.scoreboard_anonymous && c.name.toLowerCase().includes(term)) ||
      c.category?.toLowerCase().includes(term) ||
      c.stage.toLowerCase().includes(term)
    );
  }, [companies, searchTerm]);

  const handleAddToDealflow = async (companyId: string) => {
    if (!userId) return;
    
    setAddingToDealflow(companyId);
    try {
      const { error } = await (supabase
        .from("investor_dealflow") as any)
        .insert({
          investor_id: userId,
          company_id: companyId,
          source: "scout",
          status: "reviewing"
        });

      if (error) throw error;

      toast({ title: "Added to your dealflow!" });
      refetch();
    } catch (err: any) {
      console.error("Error adding to dealflow:", err);
      toast({
        title: "Failed to add",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setAddingToDealflow(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-500";
    if (score >= 75) return "text-emerald-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return "bg-green-500/10 border-green-500/30";
    if (score >= 75) return "bg-emerald-500/10 border-emerald-500/30";
    if (score >= 60) return "bg-yellow-500/10 border-yellow-500/30";
    return "bg-red-500/10 border-red-500/30";
  };

  const getStageBadge = (stage: string) => {
    const colors: Record<string, string> = {
      "Pre-Seed": "bg-purple-500/10 text-purple-500",
      "Seed": "bg-blue-500/10 text-blue-500",
      "Series A": "bg-cyan-500/10 text-cyan-500",
    };
    return colors[stage] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Compass className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Scout Deals</h1>
            <p className="text-sm text-muted-foreground">
              Discover high-scoring startups looking for investment
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          {companies.length} companies available
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
            <SelectItem value="Seed">Seed</SelectItem>
            <SelectItem value="Series A">Series A</SelectItem>
          </SelectContent>
        </Select>

        <Select value={scoreFilter} onValueChange={setScoreFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Score" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Scores</SelectItem>
            <SelectItem value="85+">85+ (Excellent)</SelectItem>
            <SelectItem value="75-84">75-84 (Strong)</SelectItem>
            <SelectItem value="60-74">60-74 (Promising)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Company Grid */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Compass className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No companies match your filters</p>
            <Button 
              variant="link" 
              onClick={() => {
                setSearchTerm("");
                setStageFilter("all");
                setScoreFilter("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
            {filteredCompanies.map((company, index) => {
              const isInDealflow = existingDealflow.includes(company.id);
              
              return (
                <Card 
                  key={company.id} 
                  className="hover:border-primary/30 transition-colors"
                >
                  <CardContent className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {index < 3 && (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          )}
                          <h3 className="font-semibold truncate">
                            {company.scoreboard_anonymous 
                              ? "Anonymous Startup" 
                              : company.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStageBadge(company.stage)}>
                            {company.stage}
                          </Badge>
                          {company.category && (
                            <span className="text-xs text-muted-foreground truncate">
                              {company.category}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Score */}
                      <div className={`flex items-center justify-center w-12 h-12 rounded-xl border-2 ${getScoreBg(company.public_score)}`}>
                        <span className={`text-lg font-bold ${getScoreColor(company.public_score)}`}>
                          {company.public_score}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    {company.description && !company.scoreboard_anonymous && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {company.description}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5"
                        onClick={() => setSelectedCompany(company)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Analysis
                      </Button>
                      
                      {isInDealflow ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled
                          className="flex-1 gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          In Dealflow
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="flex-1 gap-1.5"
                          onClick={() => handleAddToDealflow(company.id)}
                          disabled={addingToDealflow === company.id}
                        >
                          {addingToDealflow === company.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" />
                          )}
                          Add to Dealflow
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Company Detail Modal */}
      <Dialog open={!!selectedCompany} onOpenChange={() => setSelectedCompany(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {selectedCompany?.scoreboard_anonymous 
                ? "Anonymous Startup" 
                : selectedCompany?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedCompany && (
            <div className="space-y-4">
              {/* Score & Stage */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Badge className={getStageBadge(selectedCompany.stage)}>
                    {selectedCompany.stage}
                  </Badge>
                  {selectedCompany.category && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedCompany.category}
                    </p>
                  )}
                </div>
                <div className={`flex flex-col items-center p-3 rounded-xl border-2 ${getScoreBg(selectedCompany.public_score)}`}>
                  <span className={`text-2xl font-bold ${getScoreColor(selectedCompany.public_score)}`}>
                    {selectedCompany.public_score}
                  </span>
                  <span className="text-xs text-muted-foreground">Score</span>
                </div>
              </div>

              {/* Description */}
              {selectedCompany.description && !selectedCompany.scoreboard_anonymous && (
                <div>
                  <h4 className="text-sm font-medium mb-1">About</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedCompany.description}
                  </p>
                </div>
              )}

              {/* VC Verdict Highlights */}
              {selectedCompany.vc_verdict_json && (
                <>
                  {/* Strengths */}
                  {selectedCompany.vc_verdict_json.strengths?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Key Strengths
                      </h4>
                      <ul className="space-y-1">
                        {selectedCompany.vc_verdict_json.strengths.slice(0, 3).map((s: any, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">•</span>
                            {s.text || s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Concerns */}
                  {selectedCompany.vc_verdict_json.concerns?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        Areas to Explore
                      </h4>
                      <ul className="space-y-1">
                        {selectedCompany.vc_verdict_json.concerns.slice(0, 3).map((c: any, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-yellow-500 mt-0.5">•</span>
                            {c.text || c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {existingDealflow.includes(selectedCompany.id) ? (
                  <Button variant="secondary" className="flex-1" disabled>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Already in Dealflow
                  </Button>
                ) : (
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      handleAddToDealflow(selectedCompany.id);
                      setSelectedCompany(null);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Dealflow
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DealScoutView;
