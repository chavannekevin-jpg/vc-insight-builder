import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Briefcase, TrendingUp, Clock, CheckCircle, XCircle, FileUp, Rocket, Gift, Loader2, FileText, Star } from "lucide-react";
import { useDealflow, useUpdateDealStatus, DealStatus, DealflowItem } from "@/hooks/useDealflow";
import StartupInviteGenerator from "../StartupInviteGenerator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_CONFIG = {
  reviewing: { label: "Reviewing", icon: Clock, color: "text-yellow-500 bg-yellow-500/10" },
  due_diligence: { label: "Due Diligence", icon: TrendingUp, color: "text-blue-500 bg-blue-500/10" },
  term_sheet: { label: "Term Sheet", icon: Briefcase, color: "text-purple-500 bg-purple-500/10" },
  closed: { label: "Closed", icon: CheckCircle, color: "text-green-500 bg-green-500/10" },
  passed: { label: "Passed", icon: XCircle, color: "text-muted-foreground bg-muted" },
};

const SOURCE_BADGES = {
  invite: { label: "Invited", icon: Gift, color: "bg-primary/10 text-primary border-primary/30" },
  deck_upload: { label: "Deck", icon: FileUp, color: "bg-blue-500/10 text-blue-500 border-blue-500/30" },
  manual: { label: "Manual", icon: FileText, color: "bg-muted text-muted-foreground border-border" },
};

interface DealflowViewProps {
  onUploadDeck: () => void;
  userId?: string | null;
}

const DealflowView = ({ onUploadDeck, userId }: DealflowViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  
  const { data: deals = [], isLoading } = useDealflow(userId || null);
  const updateStatus = useUpdateDealStatus(userId || null);

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) =>
      deal.company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.company?.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [deals, searchQuery]);

  const groupedDeals = useMemo(() => ({
    reviewing: filteredDeals.filter((d) => d.status === "reviewing"),
    due_diligence: filteredDeals.filter((d) => d.status === "due_diligence"),
    term_sheet: filteredDeals.filter((d) => d.status === "term_sheet"),
    closed: filteredDeals.filter((d) => d.status === "closed"),
    passed: filteredDeals.filter((d) => d.status === "passed"),
  }), [filteredDeals]);

  const handleStatusChange = (dealId: string, newStatus: DealStatus) => {
    updateStatus.mutate({ dealId, status: newStatus });
  };

  const getVerdictScore = (deal: DealflowItem): number | null => {
    if (deal.company?.vc_verdict_json) {
      const verdict = deal.company.vc_verdict_json as any;
      return verdict?.overall_score || verdict?.score || null;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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

          <Button 
            size="sm" 
            variant={showInvitePanel ? "secondary" : "outline"}
            className="gap-1.5" 
            onClick={() => setShowInvitePanel(!showInvitePanel)}
          >
            <Rocket className="w-4 h-4" />
            <span className="hidden sm:inline">Invite Startup</span>
          </Button>

          <Button size="sm" className="gap-1.5" onClick={onUploadDeck}>
            <FileUp className="w-4 h-4" />
            <span className="hidden sm:inline">Upload Deck</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="flex gap-4">
          {/* Main dealflow board */}
          <div className={`flex-1 ${showInvitePanel ? '' : ''}`}>
            {deals.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Rocket className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Build your dealflow</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Invite startups to get them analyzed and added to your pipeline automatically.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" className="gap-2" onClick={onUploadDeck}>
                    <FileUp className="w-4 h-4" />
                    Upload Deck
                  </Button>
                  <Button className="gap-2" onClick={() => setShowInvitePanel(true)}>
                    <Rocket className="w-4 h-4" />
                    Invite Startup
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-4 min-w-max h-full">
                {(["reviewing", "due_diligence", "term_sheet", "closed", "passed"] as const).map(
                  (status) => {
                    const config = STATUS_CONFIG[status];
                    const Icon = config.icon;

                    return (
                      <div key={status} className="w-64 bg-muted/30 rounded-lg flex flex-col min-h-[400px]">
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
                          {groupedDeals[status].map((deal) => {
                            const sourceConfig = SOURCE_BADGES[deal.source];
                            const SourceIcon = sourceConfig.icon;
                            const score = getVerdictScore(deal);

                            return (
                              <DropdownMenu key={deal.id}>
                                <DropdownMenuTrigger asChild>
                                  <div className="bg-card border border-border rounded-lg p-3 cursor-pointer hover:border-primary/50 transition-colors">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                      <p className="font-medium text-sm line-clamp-1">
                                        {deal.company?.name || "Unknown"}
                                      </p>
                                      <Badge 
                                        variant="outline" 
                                        className={`text-[10px] px-1.5 py-0 h-5 shrink-0 ${sourceConfig.color}`}
                                      >
                                        <SourceIcon className="w-3 h-3 mr-1" />
                                        {sourceConfig.label}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {deal.company?.stage || "Unknown stage"}
                                      {deal.company?.category && ` • ${deal.company.category}`}
                                    </p>
                                    {deal.company?.description && (
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {deal.company.description}
                                      </p>
                                    )}
                                    <div className="flex items-center justify-between mt-2">
                                      {score !== null && (
                                        <div className="flex items-center gap-1 text-xs">
                                          <Star className="w-3 h-3 text-yellow-500" />
                                          <span className="font-medium">{score}/100</span>
                                        </div>
                                      )}
                                      {deal.company?.memo_content_generated && (
                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                                          <FileText className="w-3 h-3 mr-1" />
                                          Memo
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  {(["reviewing", "due_diligence", "term_sheet", "closed", "passed"] as const)
                                    .filter(s => s !== status)
                                    .map(newStatus => {
                                      const cfg = STATUS_CONFIG[newStatus];
                                      const StatusIcon = cfg.icon;
                                      return (
                                        <DropdownMenuItem 
                                          key={newStatus}
                                          onClick={() => handleStatusChange(deal.id, newStatus)}
                                        >
                                          <StatusIcon className={`w-4 h-4 mr-2 ${cfg.color.split(" ")[0]}`} />
                                          Move to {cfg.label}
                                        </DropdownMenuItem>
                                      );
                                    })
                                  }
                                </DropdownMenuContent>
                              </DropdownMenu>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* Invite panel */}
          {showInvitePanel && userId && (
            <div className="w-80 shrink-0">
              <StartupInviteGenerator userId={userId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealflowView;
