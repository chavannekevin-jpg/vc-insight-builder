import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { InvestorSnapshot } from "@/types/investorSnapshot";
import { cn } from "@/lib/utils";

function formatMoney(amount: number | null, currency: string | null) {
  if (amount == null || Number.isNaN(amount)) return null;
  const c = currency ?? "";
  try {
    // If amount is a big integer (e.g., 2000000), display compact.
    const abs = Math.abs(amount);
    const compact = abs >= 1_000_000
      ? `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
      : abs >= 1_000
        ? `${(amount / 1_000).toFixed(1).replace(/\.0$/, "")}k`
        : `${amount}`;
    return `${c}${compact}`.trim();
  } catch {
    return `${c}${amount}`.trim();
  }
}

function splitParagraphs(text: string): string[] {
  return String(text || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function InvestorSnapshotModal({
  isOpen,
  onClose,
  snapshot,
  onSave,
  onUploadAnother,
  isSaving,
}: {
  isOpen: boolean;
  onClose: () => void;
  snapshot: InvestorSnapshot | null;
  onSave: () => void;
  onUploadAnother: () => void;
  isSaving?: boolean;
}) {
  const score = snapshot?.deal_quality?.score_0_100;
  const verdict = snapshot?.deal_quality?.verdict;
  const tags = snapshot?.tags;

  const revenueLabel = (() => {
    const r = tags?.revenue;
    if (!r) return null;
    if (r.is_pre_revenue) return "Pre-revenue";
    const amt = formatMoney(r.amount ?? null, r.currency);
    if (amt) return `${amt} ${r.metric || "Revenue"}`.trim();
    return "Revenue";
  })();

  const askLabel = (() => {
    const a = tags?.ask;
    if (!a) return null;
    const amt = formatMoney(a.amount ?? null, a.currency);
    if (!amt && !a.round_type) return null;
    if (amt && a.round_type) return `Raising ${amt} ${a.round_type}`;
    if (amt) return `Raising ${amt}`;
    return `Raising (${a.round_type})`;
  })();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b bg-muted/30">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-xl truncate">{snapshot?.company_name ?? "Investor Snapshot"}</DialogTitle>
              {snapshot?.tagline ? (
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {snapshot.tagline}
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {typeof score === "number" ? (
                <Badge variant="outline" className="font-semibold">
                  {Math.round(score)}/100
                </Badge>
              ) : null}
              {verdict ? (
                <Badge variant="secondary" className="max-w-[260px] truncate">
                  {verdict}
                </Badge>
              ) : null}
            </div>
          </div>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {tags?.stage ? <Badge variant="secondary">{tags.stage}</Badge> : null}
            {tags?.sector ? <Badge variant="outline">{tags.sector}</Badge> : null}
            {tags?.geography ? <Badge variant="outline">{tags.geography}</Badge> : null}
            {revenueLabel ? <Badge variant="secondary">{revenueLabel}</Badge> : null}
            {askLabel ? <Badge variant="secondary">{askLabel}</Badge> : null}

            {(tags?.traction_tags ?? []).slice(0, 10).map((t) => (
              <Badge key={t} variant="outline" className="whitespace-nowrap">
                {t}
              </Badge>
            ))}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[55vh]">
          <div className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Debrief</h3>
            <Separator className="my-3" />

            <div className="space-y-3">
              {splitParagraphs(snapshot?.debrief ?? "").map((p, idx) => (
                <p key={idx} className="text-sm leading-relaxed whitespace-pre-wrap">
                  {p}
                </p>
              ))}
            </div>

            {(snapshot?.key_strengths?.length || snapshot?.key_risks?.length) ? (
              <>
                <Separator className="my-5" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {snapshot?.key_strengths?.length ? (
                    <div className="rounded-lg border bg-card p-4">
                      <p className="text-sm font-medium">Strengths</p>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc pl-5">
                        {snapshot.key_strengths.slice(0, 3).map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {snapshot?.key_risks?.length ? (
                    <div className="rounded-lg border bg-card p-4">
                      <p className="text-sm font-medium">Risks</p>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc pl-5">
                        {snapshot.key_risks.slice(0, 3).map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>
        </ScrollArea>

        <div className={cn("p-4 border-t bg-muted/30 flex items-center justify-between gap-3 flex-wrap")}>
          <Button variant="outline" onClick={onUploadAnother}>
            Upload another
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button onClick={onSave} disabled={!snapshot || isSaving}>
              {isSaving ? "Saving…" : "Save to Dealflow"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
