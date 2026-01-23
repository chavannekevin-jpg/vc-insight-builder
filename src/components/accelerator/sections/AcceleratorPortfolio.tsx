import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Users, ArrowRight, Filter, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Company {
  id: string;
  name: string;
  category: string | null;
  stage: string;
  public_score: number | null;
  memo_content_generated: boolean;
  created_at: string;
}

interface AcceleratorPortfolioProps {
  companies: Company[];
  onViewStartup: (id: string) => void;
}

export function AcceleratorPortfolio({ companies, onViewStartup }: AcceleratorPortfolioProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "score" | "date">("date");
  const [filterStatus, setFilterStatus] = useState<"all" | "ready" | "pending">("all");

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 75) return "text-success";
    if (score >= 60) return "text-primary";
    if (score >= 45) return "text-warning";
    return "text-destructive";
  };

  const filteredCompanies = companies
    .filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (filterStatus === "ready") return matchesSearch && c.memo_content_generated;
      if (filterStatus === "pending") return matchesSearch && !c.memo_content_generated;
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "score") return (b.public_score || 0) - (a.public_score || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Portfolio</h1>
          <p className="text-muted-foreground">{companies.length} startups in your ecosystem</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/60"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-border/50 overflow-hidden">
            {(["all", "ready", "pending"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-colors",
                  filterStatus === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-card/60 text-muted-foreground hover:text-foreground"
                )}
              >
                {status === "all" ? "All" : status === "ready" ? "Ready" : "Pending"}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-border/50 bg-card/60 text-sm"
          >
            <option value="date">Newest First</option>
            <option value="name">Name A-Z</option>
            <option value="score">Highest Score</option>
          </select>
        </div>
      </div>

      {/* Company List */}
      {filteredCompanies.length === 0 ? (
        <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">
            {companies.length === 0 ? "No startups yet" : "No matches found"}
          </h3>
          <p className="text-muted-foreground">
            {companies.length === 0 
              ? "Startups will appear here once they join using your invite code."
              : "Try adjusting your search or filters."
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredCompanies.map((company, i) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onViewStartup(company.id)}
              className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-4 cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold">
                    {company.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground truncate">{company.name}</h3>
                      {company.memo_content_generated ? (
                        <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium whitespace-nowrap">
                          Report Ready
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium whitespace-nowrap">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {company.category || "Uncategorized"} • {company.stage}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {company.public_score ? (
                    <div className="text-right">
                      <div className={cn("text-2xl font-bold", getScoreColor(company.public_score))}>
                        {company.public_score}
                      </div>
                      <p className="text-xs text-muted-foreground">Fundability</p>
                    </div>
                  ) : (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-muted-foreground">—</div>
                      <p className="text-xs text-muted-foreground">Not scored</p>
                    </div>
                  )}
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
