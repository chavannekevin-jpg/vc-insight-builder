import { useState, useMemo } from "react";
import { DemoModeBanner } from "@/components/acceleratorDemo/DemoModeBanner";
import { AcceleratorDemoHeader } from "@/components/acceleratorDemo/AcceleratorDemoHeader";
import { CohortStatsBar } from "@/components/acceleratorDemo/CohortStatsBar";
import { StartupCard } from "@/components/acceleratorDemo/StartupCard";
import { DEMO_STARTUPS, DemoStartup } from "@/data/acceleratorDemo/demoStartups";
import { Search, SlidersHorizontal, ArrowUpDown, Grid3X3, List } from "lucide-react";
import { Input } from "@/components/ui/input";
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

const CohortOverview = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("score-desc");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const filteredAndSortedStartups = useMemo(() => {
    let result = [...DEMO_STARTUPS];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.tagline.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      result = result.filter((s) => s.status === filterStatus);
    }

    // Sort
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
    <div className="min-h-screen bg-background">
      <DemoModeBanner />
      <AcceleratorDemoHeader />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Cohort Overview</h1>
          <p className="text-muted-foreground">
            View and manage all {DEMO_STARTUPS.length} startups in your cohort
          </p>
        </div>

        {/* Stats Bar */}
        <div className="mb-8">
          <CohortStatsBar />
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search startups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
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

          {/* Sort & View Controls */}
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy("score-desc")}>
                  Score: High to Low
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("score-asc")}>
                  Score: Low to High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("name")}>
                  Name: A-Z
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("progress")}>
                  Weekly Progress
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground mb-4">
          Showing {filteredAndSortedStartups.length} of {DEMO_STARTUPS.length} startups
        </div>

        {/* Startups Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedStartups.map((startup) => (
              <StartupCard key={startup.id} startup={startup} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedStartups.map((startup) => (
              <StartupListItem key={startup.id} startup={startup} />
            ))}
          </div>
        )}

        {/* Empty State */}
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
      </main>
    </div>
  );
};

// List view item component
const StartupListItem = ({ startup }: { startup: DemoStartup }) => {
  const navigate = (path: string) => {
    window.location.href = path;
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-success";
    if (score >= 60) return "text-primary";
    if (score >= 45) return "text-warning";
    return "text-destructive";
  };

  return (
    <div
      onClick={() => navigate(`/accelerator-demo/startup/${startup.id}`)}
      className="bg-card/50 border border-border/50 rounded-xl p-4 cursor-pointer hover:border-primary/40 transition-all flex items-center gap-6"
    >
      <div className={cn("text-2xl font-bold w-16 text-center", getScoreColor(startup.fundabilityScore))}>
        {startup.fundabilityScore}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="font-semibold">{startup.name}</h3>
          <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
            {startup.category}
          </span>
        </div>
        <p className="text-sm text-muted-foreground truncate">{startup.tagline}</p>
      </div>
      <div className="hidden md:flex items-center gap-4">
        {Object.entries(startup.sectionScores).slice(0, 4).map(([section, score]) => (
          <div key={section} className="text-center">
            <div className={cn("text-sm font-medium", getScoreColor(score))}>{score}</div>
            <div className="text-[10px] text-muted-foreground capitalize">{section.slice(0, 4)}</div>
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground">
        {startup.founders.length} founder{startup.founders.length > 1 ? "s" : ""}
      </div>
    </div>
  );
};

export default CohortOverview;
