import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Share2,
  ChevronDown,
  Sparkles,
  Target,
  Lightbulb,
  TrendingUp,
  Users,
  Building2,
  FileText,
  StickyNote,
  ExternalLink,
  Loader2,
  Clock,
  Globe,
  Swords,
  DollarSign,
  AlertTriangle,
  Rocket,
  CheckCircle,
} from "lucide-react";
import { DealflowItem, DealStatus, useUpdateDealStatus, useUpdateDealNotes } from "@/hooks/useDealflow";
import { useCompanyMemoData } from "@/hooks/useCompanyMemoData";
import { useDealShares } from "@/hooks/useDealShares";
import { ShareDealModal } from "./ShareDealModal";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface DealDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: DealflowItem | null;
  currentInvestorId: string;
}

const STATUS_CONFIG: Record<DealStatus, { label: string; color: string }> = {
  reviewing: { label: "Reviewing", color: "bg-blue-500/10 text-blue-500" },
  due_diligence: { label: "Due Diligence", color: "bg-purple-500/10 text-purple-500" },
  term_sheet: { label: "Term Sheet", color: "bg-amber-500/10 text-amber-500" },
  closed: { label: "Closed", color: "bg-green-500/10 text-green-500" },
  passed: { label: "Passed", color: "bg-muted text-muted-foreground" },
};

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  content: string | null;
  isLoading?: boolean;
}

function SectionCard({ icon, title, content, isLoading }: SectionCardProps) {
  if (!content && !isLoading) return null;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon}
        {title}
      </div>
      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      ) : (
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
      )}
    </div>
  );
}

export function DealDetailModal({
  isOpen,
  onClose,
  deal,
  currentInvestorId,
}: DealDetailModalProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");

  const { data: memoData, isLoading: isMemoLoading } = useCompanyMemoData(deal?.company?.id || null);
  const { data: shares = [] } = useDealShares(deal?.company?.id || null, currentInvestorId);
  const updateStatus = useUpdateDealStatus(currentInvestorId);
  const updateNotes = useUpdateDealNotes(currentInvestorId);

  if (!deal || !deal.company) return null;

  const company = deal.company;
  const vcVerdict = company.vc_verdict_json as any;
  const overallScore = vcVerdict?.overallScore || vcVerdict?.overall_score;
  const sharedBy = deal.shared_by;

  const handleStatusChange = async (status: DealStatus) => {
    await updateStatus.mutateAsync({ dealId: deal.id, status });
  };

  const handleSaveNotes = async () => {
    await updateNotes.mutateAsync({ dealId: deal.id, notes: notesValue });
    setIsEditingNotes(false);
  };

  const startEditingNotes = () => {
    setNotesValue(deal.notes || "");
    setIsEditingNotes(true);
  };

  const hasAnyMemoData = memoData && (
    memoData.summary || memoData.problem || memoData.solution || 
    memoData.traction || memoData.businessModel || memoData.market ||
    memoData.team || memoData.vision || memoData.competition ||
    memoData.financials || memoData.risks || memoData.askUse
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b bg-muted/30">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <DialogTitle className="text-xl">{company.name}</DialogTitle>
                  {overallScore && (
                    <Badge variant="outline" className="gap-1 font-semibold">
                      <Sparkles className="h-3 w-3" />
                      {overallScore}/100
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary">{company.stage}</Badge>
                  {company.category && <Badge variant="outline">{company.category}</Badge>}
                  {company.has_premium && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                      Premium Memo
                    </Badge>
                  )}
                </div>
              </div>
              <Badge className={cn("shrink-0", STATUS_CONFIG[deal.status as DealStatus]?.color)}>
                {STATUS_CONFIG[deal.status as DealStatus]?.label || deal.status}
              </Badge>
            </div>

            {/* Shared By Attribution */}
            {sharedBy && (
              <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                <Share2 className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">
                  Shared by <strong>{sharedBy.full_name}</strong>
                  {sharedBy.organization_name && ` (${sharedBy.organization_name})`}
                  {deal.shared_at && (
                    <span className="text-green-600/70">
                      {" "}• {formatDistanceToNow(new Date(deal.shared_at), { addSuffix: true })}
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* Shared With Section */}
            {shares.length > 0 && (
              <div className="mt-3 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    You shared this deal with {shares.length} investor{shares.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {shares.map((share) => (
                    <div 
                      key={share.id}
                      className="flex items-center gap-2 bg-white/50 px-2 py-1 rounded-md"
                    >
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[10px] bg-blue-500/20 text-blue-700">
                          {share.to_investor?.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-blue-700">
                        {share.to_investor?.full_name}
                        <span className="text-blue-600/60 ml-1">
                          • {formatDistanceToNow(new Date(share.created_at), { addSuffix: true })}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DialogHeader>

          <ScrollArea className="flex-1 max-h-[50vh]">
            <div className="p-6 space-y-4">
              {/* Company Description */}
              {company.description && (
                <div className="text-sm text-muted-foreground leading-relaxed">
                  {company.description}
                </div>
              )}

              {/* AI Summary */}
              <SectionCard
                icon={<Sparkles className="h-4 w-4 text-primary" />}
                title="Executive Summary"
                content={memoData?.summary}
                isLoading={isMemoLoading}
              />

              {/* Problem */}
              <SectionCard
                icon={<Target className="h-4 w-4 text-red-500" />}
                title="Problem"
                content={memoData?.problem}
                isLoading={isMemoLoading}
              />

              {/* Solution */}
              <SectionCard
                icon={<Lightbulb className="h-4 w-4 text-yellow-500" />}
                title="Solution"
                content={memoData?.solution}
                isLoading={isMemoLoading}
              />

              {/* Market */}
              <SectionCard
                icon={<Globe className="h-4 w-4 text-cyan-500" />}
                title="Market Opportunity"
                content={memoData?.market}
                isLoading={isMemoLoading}
              />

              {/* Traction */}
              <SectionCard
                icon={<TrendingUp className="h-4 w-4 text-green-500" />}
                title="Traction"
                content={memoData?.traction}
                isLoading={isMemoLoading}
              />

              {/* Business Model */}
              <SectionCard
                icon={<Building2 className="h-4 w-4 text-blue-500" />}
                title="Business Model"
                content={memoData?.businessModel}
                isLoading={isMemoLoading}
              />

              {/* Competition */}
              <SectionCard
                icon={<Swords className="h-4 w-4 text-orange-500" />}
                title="Competition"
                content={memoData?.competition}
                isLoading={isMemoLoading}
              />

              {/* Team */}
              <SectionCard
                icon={<Users className="h-4 w-4 text-purple-500" />}
                title="Team"
                content={memoData?.team}
                isLoading={isMemoLoading}
              />

              {/* Financials */}
              <SectionCard
                icon={<DollarSign className="h-4 w-4 text-emerald-500" />}
                title="Financials & Unit Economics"
                content={memoData?.financials}
                isLoading={isMemoLoading}
              />

              {/* Vision */}
              <SectionCard
                icon={<Rocket className="h-4 w-4 text-indigo-500" />}
                title="Vision"
                content={memoData?.vision}
                isLoading={isMemoLoading}
              />

              {/* Ask & Use of Funds */}
              <SectionCard
                icon={<DollarSign className="h-4 w-4 text-pink-500" />}
                title="The Ask & Use of Funds"
                content={memoData?.askUse}
                isLoading={isMemoLoading}
              />

              {/* Risks */}
              <SectionCard
                icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
                title="Risks & Challenges"
                content={memoData?.risks}
                isLoading={isMemoLoading}
              />

              {/* No Data State */}
              {!isMemoLoading && !hasAnyMemoData && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No analysis data available yet</p>
                  <p className="text-sm">The company hasn't completed their questionnaire</p>
                </div>
              )}

              <Separator />

              {/* Notes Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <StickyNote className="h-4 w-4" />
                    Your Notes
                  </div>
                  {!isEditingNotes && (
                    <Button variant="ghost" size="sm" onClick={startEditingNotes}>
                      {deal.notes ? "Edit" : "Add Note"}
                    </Button>
                  )}
                </div>
                {isEditingNotes ? (
                  <div className="space-y-2">
                    <Textarea
                      value={notesValue}
                      onChange={(e) => setNotesValue(e.target.value)}
                      placeholder="Add your notes about this deal..."
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveNotes}
                        disabled={updateNotes.isPending}
                      >
                        {updateNotes.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingNotes(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : deal.notes ? (
                  <p className="text-sm bg-muted/50 p-3 rounded-lg whitespace-pre-wrap">
                    {deal.notes}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No notes added</p>
                )}
              </div>

              {/* Timeline */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Added {formatDistanceToNow(new Date(deal.added_at), { addSuffix: true })}
                </span>
                {company.created_at && (
                  <span>
                    Company created{" "}
                    {formatDistanceToNow(new Date(company.created_at), { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>
          </ScrollArea>

          {/* Actions Footer */}
          <div className="p-4 border-t bg-muted/30 flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setShowShareModal(true)}
            >
              <Share2 className="h-4 w-4" />
              Share with Investor
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  Move to
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => handleStatusChange(status as DealStatus)}
                    disabled={deal.status === status}
                  >
                    <div className={cn("w-2 h-2 rounded-full mr-2", config.color.split(" ")[0])} />
                    {config.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {company.memo_content_generated && (
              <Button variant="ghost" className="gap-2 ml-auto" asChild>
                <a href={`/memo/${company.id}/overview`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  View Full Memo
                </a>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ShareDealModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        companyId={company.id}
        companyName={company.name}
        currentInvestorId={currentInvestorId}
      />
    </>
  );
}
