import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Eye } from "lucide-react";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useKnowledgeBaseSources, type KnowledgeBaseSourceWithCounts } from "@/hooks/useKnowledgeBaseSources";
import { KnowledgeBaseSourceDetailsDialog } from "@/components/admin/kb/KnowledgeBaseSourceDetailsDialog";

function statusBadgeVariant(status: KnowledgeBaseSourceWithCounts["status"]) {
  if (status === "active") return "default" as const;
  if (status === "archived") return "secondary" as const;
  return "outline" as const;
}

function confidenceBadgeVariant(conf: KnowledgeBaseSourceWithCounts["extraction_confidence"]) {
  if (conf === "high") return "default" as const;
  if (conf === "medium") return "secondary" as const;
  if (conf === "low") return "destructive" as const;
  return "outline" as const;
}

function sourceLabel(source: KnowledgeBaseSourceWithCounts) {
  if (source.title?.trim()) return source.title;
  if (source.source_type === "web" && source.source_url) return source.source_url;
  if (source.storage_path) return source.storage_path;
  return "Untitled source";
}

export function KnowledgeBaseSourceList() {
  const { data, isLoading, error, refetch, isFetching } = useKnowledgeBaseSources({ limit: 50 });
  const [view, setView] = useState<"active" | "all">("active");
  const [openSourceId, setOpenSourceId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const items = data ?? [];
    if (view === "active") return items.filter((s) => s.status === "active");
    return items;
  }, [data, view]);

  return (
    <ModernCard>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">Sources used by the AI</h2>
          <p className="text-sm text-muted-foreground">
            Only sources marked <span className="font-medium text-foreground">Active</span> are injected into memo prompts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-border/60 p-1">
            <Button
              type="button"
              size="sm"
              variant={view === "active" ? "default" : "secondary"}
              onClick={() => setView("active")}
            >
              Active
            </Button>
            <Button
              type="button"
              size="sm"
              variant={view === "all" ? "default" : "secondary"}
              onClick={() => setView("all")}
            >
              All
            </Button>
          </div>
          <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading sources…</p>
        ) : error ? (
          <p className="text-sm text-destructive">Failed to load sources.</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sources yet.</p>
        ) : (
          <div className="space-y-3">
            {rows.map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-border/60 bg-card/60 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{sourceLabel(s)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {s.publisher ? `${s.publisher} · ` : ""}
                      {s.geography_scope} · {s.source_type === "pdf_upload" ? "PDF" : "URL"}
                      {s.publication_date ? ` · Published ${s.publication_date}` : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      onClick={() => setOpenSourceId(s.id)}
                      title="View extracted bullets"
                    >
                      <Eye />
                    </Button>
                    <Badge variant={statusBadgeVariant(s.status)}>{s.status.toUpperCase()}</Badge>
                    <Badge
                      variant={confidenceBadgeVariant(s.extraction_confidence)}
                      className={cn(!s.extraction_confidence && "opacity-70")}
                      title="Extraction confidence"
                    >
                      {s.extraction_confidence ? `CONF: ${s.extraction_confidence.toUpperCase()}` : "CONF: —"}
                    </Badge>
                    <Badge variant="outline">Benchmarks: {s.benchmarks_count}</Badge>
                    <Badge variant="outline">Notes: {s.market_notes_count}</Badge>
                  </div>
                </div>

                <div className="mt-3 text-xs text-muted-foreground">
                  Updated {formatDistanceToNow(new Date(s.updated_at), { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <KnowledgeBaseSourceDetailsDialog
        sourceId={openSourceId}
        open={Boolean(openSourceId)}
        onOpenChange={(open) => setOpenSourceId(open ? openSourceId : null)}
      />
    </ModernCard>
  );
}
