import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
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
  Trophy, 
  Search, 
  Medal,
  Target,
  Rocket,
  TrendingUp,
  ArrowRight,
  Loader2,
  Star,
  EyeOff
} from "lucide-react";

interface ScoreboardEntry {
  id: string;
  name: string;
  stage: string;
  category: string | null;
  public_score: number;
  scoreboard_anonymous: boolean;
}

const SCORE_THRESHOLD = 60;

const Scoreboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");

  // Fetch scoreboard entries
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["public-scoreboard", stageFilter],
    queryFn: async () => {
      let query = supabase
        .from("companies")
        .select("id, name, stage, category, public_score, scoreboard_anonymous")
        .eq("scoreboard_opt_in", true)
        .eq("memo_content_generated", true)
        .gte("public_score", SCORE_THRESHOLD)
        .order("public_score", { ascending: false })
        .limit(50);

      if (stageFilter !== "all") {
        query = query.eq("stage", stageFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ScoreboardEntry[];
    },
  });

  const filteredEntries = useMemo(() => {
    if (!searchTerm) return entries;
    const term = searchTerm.toLowerCase();
    return entries.filter(e => 
      (!e.scoreboard_anonymous && e.name.toLowerCase().includes(term)) ||
      e.category?.toLowerCase().includes(term) ||
      e.stage.toLowerCase().includes(term)
    );
  }, [entries, searchTerm]);

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

  const getRankBadge = (index: number) => {
    if (index === 0) return <Medal className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>;
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => navigate('/')}
            >
              <span className="text-xl font-bold">👶 UglyBaby</span>
            </div>
            <Button onClick={() => navigate('/auth')}>
              Get Your Score
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Startup Scoreboard</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Investment Readiness
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> Leaderboard</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Top-scoring startups based on VC analysis. Get your company analyzed to join the rankings.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
          <div className="text-center p-4 bg-card rounded-xl border">
            <p className="text-3xl font-bold text-primary">{entries.length}</p>
            <p className="text-sm text-muted-foreground">Companies</p>
          </div>
          <div className="text-center p-4 bg-card rounded-xl border">
            <p className="text-3xl font-bold text-green-500">
              {entries.length > 0 ? Math.max(...entries.map(e => e.public_score)) : 0}
            </p>
            <p className="text-sm text-muted-foreground">Top Score</p>
          </div>
          <div className="text-center p-4 bg-card rounded-xl border">
            <p className="text-3xl font-bold text-muted-foreground">
              {entries.length > 0 
                ? Math.round(entries.reduce((sum, e) => sum + e.public_score, 0) / entries.length)
                : 0}
            </p>
            <p className="text-sm text-muted-foreground">Avg Score</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
              <SelectItem value="Seed">Seed</SelectItem>
              <SelectItem value="Series A">Series A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Scoreboard */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No companies on the leaderboard yet</p>
            <Button onClick={() => navigate('/auth')}>
              Be the first to rank
            </Button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-3">
            {filteredEntries.map((entry, index) => (
              <Card 
                key={entry.id}
                className={`transition-all hover:shadow-md ${
                  index < 3 ? 'border-primary/20 bg-gradient-to-r from-primary/5 to-transparent' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="w-10 flex justify-center">
                      {getRankBadge(index)}
                    </div>

                    {/* Company Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {entry.scoreboard_anonymous ? (
                          <>
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-muted-foreground">Anonymous Startup</span>
                          </>
                        ) : (
                          <span className="font-semibold truncate">{entry.name}</span>
                        )}
                        {index < 3 && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getStageBadge(entry.stage)}>
                          {entry.stage}
                        </Badge>
                        {entry.category && !entry.scoreboard_anonymous && (
                          <span className="text-xs text-muted-foreground">
                            {entry.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <div className={`flex items-center justify-center w-14 h-14 rounded-xl border-2 ${getScoreBg(entry.public_score)}`}>
                      <span className={`text-xl font-bold ${getScoreColor(entry.public_score)}`}>
                        {entry.public_score}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-8">
              <Rocket className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Get Your Score</h2>
              <p className="text-muted-foreground mb-6">
                Find out how investment-ready your startup is and join the leaderboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" onClick={() => navigate('/auth')}>
                  Start Free Analysis
                  <TrendingUp className="w-4 h-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/')}>
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} UglyBaby. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Scoreboard;
