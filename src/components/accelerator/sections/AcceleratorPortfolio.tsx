import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Users, ArrowRight, CheckCircle2, Clock, Sparkles, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
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

  const getScoreGradient = (score: number | null) => {
    if (!score) return "from-muted/30 to-muted/10";
    if (score >= 75) return "from-success/20 to-success/5";
    if (score >= 60) return "from-primary/20 to-primary/5";
    if (score >= 45) return "from-warning/20 to-warning/5";
    return "from-destructive/20 to-destructive/5";
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
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 md:p-8"
        style={{
          background: 'linear-gradient(135deg, hsl(330 20% 12% / 0.9) 0%, hsl(330 20% 8% / 0.8) 100%)',
          backdropFilter: 'blur(40px)',
        }}
      >
        <div className="absolute inset-0 rounded-2xl border border-white/[0.06]" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-primary/15 via-secondary/10 to-transparent rounded-full blur-3xl opacity-50" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Portfolio</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Your Startups</h1>
            <p className="text-muted-foreground mt-1">{companies.length} startups in your ecosystem</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-success/10 border border-success/20">
              <span className="text-sm font-medium text-success">{companies.filter(c => c.memo_content_generated).length} Ready</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-muted/30 border border-white/[0.06]">
              <span className="text-sm font-medium text-muted-foreground">{companies.filter(c => !c.memo_content_generated).length} Pending</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 rounded-xl border-white/[0.06] bg-card/40 backdrop-blur-sm focus:border-primary/30"
            style={{ background: 'hsl(330 20% 10% / 0.6)' }}
          />
        </div>
        <div className="flex gap-2">
          <div 
            className="flex rounded-xl overflow-hidden border border-white/[0.06]"
            style={{ background: 'hsl(330 20% 10% / 0.6)' }}
          >
            {(["all", "ready", "pending"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "px-4 py-3 text-sm font-medium transition-all duration-300",
                  filterStatus === status
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                )}
              >
                {status === "all" ? "All" : status === "ready" ? "Ready" : "Pending"}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-3 rounded-xl border border-white/[0.06] text-sm font-medium cursor-pointer transition-colors hover:border-white/[0.12]"
            style={{ background: 'hsl(330 20% 10% / 0.6)' }}
          >
            <option value="date">Newest First</option>
            <option value="name">Name A-Z</option>
            <option value="score">Highest Score</option>
          </select>
        </div>
      </motion.div>

      {/* Company List */}
      {filteredCompanies.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-12 text-center border border-white/[0.06]"
          style={{
            background: 'linear-gradient(135deg, hsl(330 20% 12% / 0.6) 0%, hsl(330 20% 8% / 0.4) 100%)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg text-foreground mb-2">
            {companies.length === 0 ? "No startups yet" : "No matches found"}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {companies.length === 0 
              ? "Startups will appear here once they join using your invite code."
              : "Try adjusting your search or filters."
            }
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {filteredCompanies.map((company, i) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.03 }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              onClick={() => onViewStartup(company.id)}
              className="group relative rounded-2xl p-5 cursor-pointer transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, hsl(330 20% 12% / 0.6) 0%, hsl(330 20% 8% / 0.4) 100%)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Border */}
              <div className="absolute inset-0 rounded-2xl border border-white/[0.06] group-hover:border-primary/30 transition-colors" />
              
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-5 min-w-0 flex-1">
                  {/* Avatar with score gradient */}
                  <div className="relative">
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold border border-white/[0.08] bg-gradient-to-br",
                      getScoreGradient(company.public_score)
                    )}>
                      <span className="text-foreground">{company.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                    {company.memo_content_generated && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success flex items-center justify-center border-2 border-card shadow-lg">
                        <CheckCircle2 className="w-3 h-3 text-success-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                        {company.name}
                      </h3>
                      {company.memo_content_generated ? (
                        <span className="px-2.5 py-1 rounded-full bg-success/15 text-success text-xs font-medium border border-success/20">
                          Ready
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-muted/30 text-muted-foreground text-xs font-medium border border-white/[0.06] flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {company.category || "Uncategorized"} • {company.stage}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  {company.public_score ? (
                    <div className="text-right">
                      <div className={cn("text-3xl font-bold", getScoreColor(company.public_score))}>
                        {company.public_score}
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Fundability</p>
                    </div>
                  ) : (
                    <div className="text-right">
                      <div className="text-3xl font-bold text-muted-foreground/50">—</div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Not scored</p>
                    </div>
                  )}
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
