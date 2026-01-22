import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Briefcase, TrendingUp, Clock, CheckCircle, XCircle, FileUp, Rocket, Gift, Loader2, FileText, Star, Share2 } from "lucide-react";
import { useDealflow, DealStatus, DealflowItem } from "@/hooks/useDealflow";
import InviteStartupModal from "../InviteStartupModal";
import { DealDetailModal } from "../DealDetailModal";
import { formatDistanceToNow } from "date-fns";

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
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<DealflowItem | null>(null);
  
  const { data: deals = [], isLoading } = useDealflow(userId || null);

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) =>
      (deal.company?.name || deal.deck_company?.name)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (deal.company?.description || deal.deck_company?.description)?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [deals, searchQuery]);

  const groupedDeals = useMemo(() => ({
    reviewing: filteredDeals.filter((d) => d.status === "reviewing"),
    due_diligence: filteredDeals.filter((d) => d.status === "due_diligence"),
    term_sheet: filteredDeals.filter((d) => d.status === "term_sheet"),
    closed: filteredDeals.filter((d) => d.status === "closed"),
    passed: filteredDeals.filter((d) => d.status === "passed"),
  }), [filteredDeals]);

  const getVerdictScore = (deal: DealflowItem): number | null => {
    if (deal.company?.vc_verdict_json) {
      const verdict = deal.company.vc_verdict_json as any;
      return verdict?.overall_score || verdict?.score || null;
    }
    const deckMemo = deal.deck_company?.memo_json as any;
    const deckScore = deckMemo?.quick_analysis?.overall_score;
    if (typeof deckScore === "number") return deckScore;
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
    <div className="flex flex-col h-full animate-fade-in">
      {/* Toolbar */}
      <div className="p-5 border-b border-border/30 bg-gradient-to-r from-card/80 to-card/40 backdrop-blur-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Dealflow</h2>
          <div className="text-sm text-muted-foreground/80 font-medium px-3 py-1 rounded-full bg-muted/50 border border-border/30">{deals.length} deals</div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deals..."
              className="pl-9 w-48 h-9"
            />
          </div>

          {/* Primary CTA - Invite Startup */}
          <Button 
            size="sm" 
            className="gap-1.5 bg-primary hover:bg-primary/90" 
            onClick={() => setShowInviteModal(true)}
          >
            <Rocket className="w-4 h-4" />
            <span className="hidden sm:inline">Invite Startup</span>
          </Button>

          <Button size="sm" variant="outline" className="gap-1.5" onClick={onUploadDeck}>
            <FileUp className="w-4 h-4" />
            <span className="hidden sm:inline">Upload Deck</span>
          </Button>
        </div>
      </div>

      {/* Invite Modal */}
      {userId && (
        <InviteStartupModal
          open={showInviteModal}
          onOpenChange={setShowInviteModal}
          userId={userId}
        />
      )}

      {/* Deal Detail Modal */}
      {userId && (
        <DealDetailModal
          isOpen={!!selectedDeal}
          onClose={() => setSelectedDeal(null)}
          deal={selectedDeal}
          currentInvestorId={userId}
        />
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
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
              <Button className="gap-2" onClick={() => setShowInviteModal(true)}>
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
                        const isShared = !!deal.shared_by_investor_id;

                        const displayCompany = deal.company || deal.deck_company;

                        return (
                          <div 
                            key={deal.id}
                            onClick={() => setSelectedDeal(deal)}
                            className="bg-card border border-border rounded-lg p-3 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="font-medium text-sm line-clamp-1">
                                {displayCompany?.name || "Unknown"}
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
                              {displayCompany?.stage || "Unknown stage"}
                              {displayCompany?.category && ` • ${displayCompany.category}`}
                            </p>
                            {(displayCompany as any)?.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {(displayCompany as any).description}
                              </p>
                            )}
                            
                            {/* Shared By Badge */}
                            {isShared && deal.shared_by && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-green-600 bg-green-500/10 px-2 py-1 rounded-md">
                                <Share2 className="w-3 h-3" />
                                <span className="truncate">
                                  Shared by {deal.shared_by.full_name.split(' ')[0]}
                                  {deal.shared_at && (
                                    <span className="text-green-600/70">
                                      {' '}• {formatDistanceToNow(new Date(deal.shared_at), { addSuffix: true })}
                                    </span>
                                  )}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-2">
                              {score !== null && (
                                <div className="flex items-center gap-1 text-xs">
                                  <Star className="w-3 h-3 text-yellow-500" />
                                  <span className="font-medium">{score}/100</span>
                                </div>
                              )}
                              {(deal.company?.memo_content_generated || !!deal.deck_company?.memo_json) && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                                  <FileText className="w-3 h-3 mr-1" />
                                  Memo
                                </Badge>
                              )}
                            </div>
                          </div>
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
    </div>
  );
};

export default DealflowView;
