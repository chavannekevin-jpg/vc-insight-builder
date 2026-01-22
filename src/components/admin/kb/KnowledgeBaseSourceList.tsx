import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Eye, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useKnowledgeBaseSources, type KnowledgeBaseSourceWithCounts } from "@/hooks/useKnowledgeBaseSources";
import { KnowledgeBaseSourceDetailsDialog } from "@/components/admin/kb/KnowledgeBaseSourceDetailsDialog";
import { useToast } from "@/hooks/use-toast";

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

function contentKindLabel(kind: KnowledgeBaseSourceWithCounts["content_kind"]) {
  return kind === "framework" ? "Framework" : "Report";
}

export function KnowledgeBaseSourceList() {
  const { data, isLoading, error, refetch, isFetching } = useKnowledgeBaseSources({ limit: 50 });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [view, setView] = useState<"active" | "all">("active");
  const [openSourceId, setOpenSourceId] = useState<string | null>(null);
  const [deleteSourceId, setDeleteSourceId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const items = data ?? [];
    if (view === "active") return items.filter((s) => s.status === "active");
    return items;
  }, [data, view]);

  const pendingDelete = useMemo(() => {
    if (!deleteSourceId) return null;
    return (data ?? []).find((s) => s.id === deleteSourceId) ?? null;
  }, [data, deleteSourceId]);

  const handleDelete = async () => {
    if (!pendingDelete) return;

    setIsDeleting(true);
    try {
      // Best-effort: remove stored PDF first (if present) to avoid orphaned storage.
      if (pendingDelete.storage_path) {
        const { error: storageErr } = await supabase.storage
          .from("kb-reports")
          .remove([pendingDelete.storage_path]);
        if (storageErr) throw storageErr;
      }

      // Benchmarks/market notes are ON DELETE CASCADE.
      const { error: deleteErr } = await supabase.from("kb_sources").delete().eq("id", pendingDelete.id);
      if (deleteErr) throw deleteErr;

      toast({
        title: "Deleted",
        description: "The source (and extracted items) were removed.",
      });

      // Close details dialog if we just deleted the open source.
      if (openSourceId === pendingDelete.id) setOpenSourceId(null);

      await queryClient.invalidateQueries({ queryKey: ["kb-sources"] });
    } catch (e) {
      toast({
        title: "Delete failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteSourceId(null);
    }
  };

  const handleToggleActive = async (source: KnowledgeBaseSourceWithCounts, nextActive: boolean) => {
    setTogglingId(source.id);
    try {
      const nextStatus: KnowledgeBaseSourceWithCounts["status"] = nextActive ? "active" : "archived";
      const { error: updErr } = await supabase
        .from("kb_sources")
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq("id", source.id);
      if (updErr) throw updErr;

      toast({
        title: nextActive ? "Activated" : "Deactivated",
        description: nextActive
          ? "This source will be used by the AI."
          : "This source will no longer be used by the AI.",
      });

      await queryClient.invalidateQueries({ queryKey: ["kb-sources"] });
    } catch (e) {
      toast({
        title: "Update failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setTogglingId(null);
    }
  };

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
          <TooltipProvider>
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

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1">
                          <span className="text-xs font-medium text-muted-foreground">Use</span>
                          <Switch
                            checked={s.status === "active"}
                            disabled={togglingId === s.id || isDeleting}
                            onCheckedChange={(checked) => void handleToggleActive(s, checked)}
                            aria-label="Toggle source active"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {s.status === "active" ? "Active (used by AI)" : "Off (not used by AI)"}
                      </TooltipContent>
                    </Tooltip>

                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      onClick={() => setDeleteSourceId(s.id)}
                      title="Delete source"
                    >
                      <Trash2 />
                    </Button>

                    <Badge variant="outline">{contentKindLabel(s.content_kind)}</Badge>
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
          </TooltipProvider>
        )}
      </div>

      <KnowledgeBaseSourceDetailsDialog
        sourceId={openSourceId}
        open={Boolean(openSourceId)}
        onOpenChange={(open) => setOpenSourceId(open ? openSourceId : null)}
      />

      <AlertDialog
        open={Boolean(deleteSourceId)}
        onOpenChange={(open) => {
          if (!open) setDeleteSourceId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this source?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the source and any extracted benchmarks/market notes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn("bg-destructive text-destructive-foreground hover:bg-destructive/90")}
              onClick={(e) => {
                e.preventDefault();
                void handleDelete();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ModernCard>
  );
}
