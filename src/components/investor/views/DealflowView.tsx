import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Briefcase, TrendingUp, Clock, CheckCircle, XCircle, FileUp } from "lucide-react";

interface Deal {
  id: string;
  company_name: string;
  stage: string;
  status: "reviewing" | "due_diligence" | "term_sheet" | "closed" | "passed";
  amount?: number;
  date_added: string;
}

// Placeholder data - will be replaced with real data
const SAMPLE_DEALS: Deal[] = [];

const STATUS_CONFIG = {
  reviewing: { label: "Reviewing", icon: Clock, color: "text-yellow-500 bg-yellow-500/10" },
  due_diligence: { label: "Due Diligence", icon: TrendingUp, color: "text-blue-500 bg-blue-500/10" },
  term_sheet: { label: "Term Sheet", icon: Briefcase, color: "text-purple-500 bg-purple-500/10" },
  closed: { label: "Closed", icon: CheckCircle, color: "text-green-500 bg-green-500/10" },
  passed: { label: "Passed", icon: XCircle, color: "text-muted-foreground bg-muted" },
};

interface DealflowViewProps {
  onUploadDeck: () => void;
}

const DealflowView = ({ onUploadDeck }: DealflowViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deals] = useState<Deal[]>(SAMPLE_DEALS);

  const filteredDeals = deals.filter((deal) =>
    deal.company_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedDeals = {
    reviewing: filteredDeals.filter((d) => d.status === "reviewing"),
    due_diligence: filteredDeals.filter((d) => d.status === "due_diligence"),
    term_sheet: filteredDeals.filter((d) => d.status === "term_sheet"),
    closed: filteredDeals.filter((d) => d.status === "closed"),
    passed: filteredDeals.filter((d) => d.status === "passed"),
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-4 border-b border-border/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Dealflow</h2>
          <div className="text-sm text-muted-foreground">{deals.length} deals</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deals..."
              className="pl-9 w-48 h-9"
            />
          </div>

          <Button size="sm" className="gap-1.5" onClick={onUploadDeck}>
            <FileUp className="w-4 h-4" />
            <span className="hidden sm:inline">Upload Deck</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {deals.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No deals yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Upload a pitch deck to add it to your dealflow pipeline. Our AI will analyze it and create a summary.
            </p>
            <Button className="gap-2" onClick={onUploadDeck}>
              <FileUp className="w-4 h-4" />
              Upload Your First Deck
            </Button>
          </div>
        ) : (
          <div className="flex gap-4 min-w-max h-full">
            {(["reviewing", "due_diligence", "term_sheet", "closed", "passed"] as const).map(
              (status) => {
                const config = STATUS_CONFIG[status];
                const Icon = config.icon;

                return (
                  <div key={status} className="w-64 bg-muted/30 rounded-lg flex flex-col">
                    <div className="p-3 border-b border-border/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${config.color.split(" ")[0]}`} />
                        <span className="font-medium text-sm">{config.label}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {groupedDeals[status].length}
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                      {groupedDeals[status].map((deal) => (
                        <div
                          key={deal.id}
                          className="bg-card border border-border rounded-lg p-3 cursor-pointer hover:border-primary/50 transition-colors"
                        >
                          <p className="font-medium text-sm">{deal.company_name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{deal.stage}</p>
                          {deal.amount && (
                            <p className="text-xs font-medium text-primary mt-1">
                              ${(deal.amount / 1000).toFixed(0)}K
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DealflowView;
