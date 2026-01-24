import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AcceleratorDemoLayout } from "@/components/acceleratorDemo/AcceleratorDemoLayout";
import { DEMO_STARTUPS, DemoStartup } from "@/data/acceleratorDemo/demoStartups";
import { Search, ArrowUpDown, Grid3X3, List, FileText, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { safeLower } from "@/lib/stringUtils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type SortOption = "score-desc" | "score-asc" | "name" | "progress";
type FilterStatus = "all" | DemoStartup["status"];
type ViewMode = "grid" | "list";

const getScoreColor = (score: number) => {
  if (score >= 75) return "text-emerald-400";
  if (score >= 60) return "text-primary";
  if (score >= 45) return "text-amber-400";
  return "text-rose-400";
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "demo-ready":
      return <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Ready</span>;
    case "on-track":
      return <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">On Track</span>;
    case "needs-work":
      return <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Needs Work</span>;
    case "at-risk":
      return <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">At Risk</span>;
    default:
      return null;
  }
};

const CohortOverview = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("score-desc");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const filteredAndSortedStartups = useMemo(() => {
    let result = [...DEMO_STARTUPS];

    if (searchQuery) {
      const query = safeLower(searchQuery, "CohortOverview.search");
      result = result.filter(
        (s) =>
          safeLower(s.name, "CohortOverview.name").includes(query) ||
          safeLower(s.tagline, "CohortOverview.tagline").includes(query) ||
          safeLower(s.category, "CohortOverview.category").includes(query)
      );
    }

    if (filterStatus !== "all") {
      result = result.filter((s) => s.status === filterStatus);
    }

    switch (sortBy) {
      case "score-desc":
        result.sort((a, b) => b.fundabilityScore - a.fundabilityScore);
        break;
      case "score-asc":
        result.sort((a, b) => a.fundabilityScore - b.fundabilityScore);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "progress":
        result.sort((a, b) => b.weeklyProgress - a.weeklyProgress);
        break;
    }

    return result;
  }, [searchQuery, sortBy, filterStatus]);

  const statusFilters: { value: FilterStatus; label: string; count: number }[] = [
    { value: "all", label: "All", count: DEMO_STARTUPS.length },
    { value: "demo-ready", label: "Demo Ready", count: DEMO_STARTUPS.filter((s) => s.status === "demo-ready").length },
    { value: "on-track", label: "On Track", count: DEMO_STARTUPS.filter((s) => s.status === "on-track").length },
    { value: "needs-work", label: "Needs Work", count: DEMO_STARTUPS.filter((s) => s.status === "needs-work").length },
    { value: "at-risk", label: "At Risk", count: DEMO_STARTUPS.filter((s) => s.status === "at-risk").length },
  ];

  return (
    <AcceleratorDemoLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Full Portfolio</h1>
          <p className="text-sm text-muted-foreground">
            View and manage all {DEMO_STARTUPS.length} startups in your cohort
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search startups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/60 border-white/[0.06]"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {statusFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={filterStatus === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(filter.value)}
                className="text-xs"
              >
                {filter.label}
                <span className="ml-1.5 text-xs opacity-70">({filter.count})</span>
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy("score-desc")}>Score: High to Low</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("score-asc")}>Score: Low to High</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("name")}>Name: A-Z</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("progress")}>Weekly Progress</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex border border-white/[0.06] rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-white/[0.04]"
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-white/[0.04]"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-xs text-muted-foreground mb-4">
          Showing {filteredAndSortedStartups.length} of {DEMO_STARTUPS.length} startups
        </div>

        {/* Startups Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedStartups.map((startup) => (
              <div
                key={startup.id}
                className="group p-4 rounded-xl bg-card/40 backdrop-blur-xl border border-white/[0.06] hover:border-primary/30 transition-all cursor-pointer"
                onClick={() => navigate(`/accelerator-demo/startup/${startup.id}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{startup.name}</h3>
                  <span className={cn("text-sm font-bold", getScoreColor(startup.fundabilityScore))}>
                    {startup.fundabilityScore}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{startup.tagline}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">{startup.category}</span>
                  {getStatusBadge(startup.status)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAndSortedStartups.map((startup) => (
              <div
                key={startup.id}
                onClick={() => navigate(`/accelerator-demo/startup/${startup.id}`)}
                className="group p-4 rounded-xl bg-card/40 backdrop-blur-xl border border-white/[0.06] hover:border-primary/30 transition-all cursor-pointer flex items-center gap-4"
              >
                <div className={cn("text-xl font-bold w-12 text-center", getScoreColor(startup.fundabilityScore))}>
                  {startup.fundabilityScore}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">{startup.name}</h3>
                    {getStatusBadge(startup.status)}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{startup.tagline}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            ))}
          </div>
        )}

        {filteredAndSortedStartups.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No startups match your filters</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("all");
              }}
              className="mt-2"
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </AcceleratorDemoLayout>
  );
};

export default CohortOverview;
