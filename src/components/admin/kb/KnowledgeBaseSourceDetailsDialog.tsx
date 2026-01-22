import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useKnowledgeBaseSourceDetails } from "@/hooks/useKnowledgeBaseSourceDetails";
import { useToast } from "@/hooks/use-toast";

function safeNumber(n: unknown) {
  if (typeof n === "number") return n;
  if (typeof n === "string") {
    const parsed = Number(n);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function formatMetricRow(row: {
  stage: string;
  sector: string | null;
  business_model: string | null;
  timeframe_label: string | null;
  metric_label: string | null;
  metric_key: string;
  median_value: number | null;
  p25_value: number | null;
  p75_value: number | null;
  unit: string | null;
  currency: string;
  sample_size: number | null;
}) {
  const label = row.metric_label || row.metric_key;
  const p25 = safeNumber(row.p25_value);
  const med = safeNumber(row.median_value);
  const p75 = safeNumber(row.p75_value);
  const unit = row.unit ? ` ${row.unit}` : "";
  const sector = row.sector ? ` · ${row.sector}` : "";
  const tf = row.timeframe_label ? ` · ${row.timeframe_label}` : "";
  const bm = row.business_model ? ` · ${row.business_model}` : "";
  const n = row.sample_size ? ` · n=${row.sample_size}` : "";

  const values = [
    p25 !== null ? `p25 ${p25}${unit}` : null,
    med !== null ? `median ${med}${unit}` : null,
    p75 !== null ? `p75 ${p75}${unit}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const head = `${label}: ${values || "(no numeric values)"}`;
  return `${head} · ${row.currency} · ${row.stage}${sector}${bm}${tf}${n}`;
}

export function KnowledgeBaseSourceDetailsDialog({
  sourceId,
  open,
  onOpenChange,
}: {
  sourceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isReExtracting, setIsReExtracting] = useState(false);
  const { data, isLoading, error } = useKnowledgeBaseSourceDetails(sourceId, { enabled: open });

  const bulletPoints = useMemo(() => {
    if (!data) return [] as string[];

    const bullets: string[] = [];
    const meta = data.source.extracted_json?.meta;
    if (meta?.title) bullets.push(`Detected title: ${meta.title}`);
    if (meta?.publisher) bullets.push(`Detected publisher: ${meta.publisher}`);
    if (meta?.publication_date) bullets.push(`Detected publication date: ${meta.publication_date}`);
    if (meta?.data_period_start || meta?.data_period_end) {
      bullets.push(
        `Detected data period: ${meta.data_period_start ?? "?"} → ${meta.data_period_end ?? "?"}`,
      );
    }

    const kind = data.source.content_kind;
    if (kind === "framework") {
      bullets.push(`Extracted framework entries: ${data.frameworks.length}`);
    } else {
      bullets.push(`Extracted benchmarks: ${data.benchmarks.length}`);
      bullets.push(`Extracted market notes: ${data.marketNotes.length}`);
    }

    if (kind === "framework") {
      const topFrameworks = data.frameworks.slice(0, 15).flatMap((f) => {
        const title = f.title?.trim() ? f.title.trim() : "Framework";
        const sector = f.sector ? ` · ${f.sector}` : "";
        const head = `${title}${sector}`;
        const summaryLines = f.summary
          .split(/\n+/)
          .map((l) => l.trim())
          .filter(Boolean)
          .slice(0, 6)
          .map((l) => `• ${l}`);

        const kps = Array.isArray(f.key_points)
          ? (f.key_points as unknown[])
              .map((kp) => (typeof kp === "string" ? kp.trim() : ""))
              .filter(Boolean)
              .slice(0, 6)
              .map((kp) => `• ${kp}`)
          : [];

        return [head, ...summaryLines, ...(kps.length ? ["• (key points)", ...kps] : [])];
      });

      return [...bullets, ...(topFrameworks.length ? ["— Framework summaries (sample)", ...topFrameworks] : [])];
    }

    const topBenchmarks = data.benchmarks.slice(0, 30).map(formatMetricRow);
    const topNotes = data.marketNotes.slice(0, 30).flatMap((n) => {
      const head = n.headline?.trim() ? n.headline.trim() : n.summary.slice(0, 80) + (n.summary.length > 80 ? "…" : "");
      const sector = n.sector ? ` · ${n.sector}` : "";
      const tf = n.timeframe_label ? ` · ${n.timeframe_label}` : "";
      const primary = `${head}${sector}${tf}`;
      const kps = Array.isArray(n.key_points)
        ? (n.key_points as unknown[])
            .map((kp) => (typeof kp === "string" ? kp.trim() : ""))
            .filter(Boolean)
            .slice(0, 6)
            .map((kp) => `• ${kp}`)
        : [];

      return [primary, ...kps];
    });

    return [
      ...bullets,
      ...(topBenchmarks.length ? ["— Key benchmarks (sample)", ...topBenchmarks] : []),
      ...(topNotes.length ? ["— Key market notes (sample)", ...topNotes] : []),
    ];
  }, [data]);

  const title = data?.source.title || "Extracted report overview";
  const publisher = data?.source.publisher;

  const canReExtract = Boolean(sourceId) && data?.source.source_type === "pdf_upload";

  const handleReExtract = async () => {
    if (!sourceId) return;
    setIsReExtracting(true);
    try {
      const fnName = data?.source.content_kind === "framework" ? "kb-parse-framework" : "kb-parse-report";
      const { data: resp, error: fnErr } = await supabase.functions.invoke(fnName, { body: { sourceId } });
      if (fnErr) throw fnErr;
      if (!resp?.success) throw new Error(resp?.error || "Re-extraction failed");

      toast({
        title: "Re-extracted",
        description:
          data?.source.content_kind === "framework"
            ? `Updated extraction (${resp?.inserted?.frameworks ?? 0} frameworks).`
            : `Updated extraction (${resp?.inserted?.benchmarks ?? 0} benchmarks, ${resp?.inserted?.market_notes ?? 0} notes).`,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["kb-sources"] }),
        queryClient.invalidateQueries({ queryKey: ["kb-source-details", sourceId] }),
      ]);
    } catch (e) {
      toast({
        title: "Re-extraction failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsReExtracting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <DialogTitle className="text-foreground">{title}</DialogTitle>
            <div className="flex flex-wrap items-center gap-2">
              {canReExtract && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={handleReExtract}
                  disabled={isReExtracting}
                  title="Run extraction again using the latest extraction settings"
                >
                  {isReExtracting ? "Re-extracting…" : "Re-extract"}
                </Button>
              )}
              {data?.source.status && <Badge variant={data.source.status === "active" ? "default" : "secondary"}>{data.source.status.toUpperCase()}</Badge>}
              <Badge variant={data?.source.extraction_confidence === "low" ? "destructive" : data?.source.extraction_confidence ? "secondary" : "outline"}>
                CONF: {data?.source.extraction_confidence ? data.source.extraction_confidence.toUpperCase() : "—"}
              </Badge>
            </div>
          </div>
          <DialogDescription>
            {publisher ? `${publisher} · ` : ""}
            {data?.source.geography_scope ?? "Europe"} · {data?.source.source_type === "pdf_upload" ? "PDF" : "URL"}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading extracted content…</p>
        ) : error ? (
          <p className="text-sm text-destructive">Failed to load extracted content.</p>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-card/60 p-4">
              <p className="text-sm font-semibold text-foreground">What the AI extracted (bullets)</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                {bulletPoints.map((b, idx) => (
                  <li key={idx} className={b.startsWith("—") ? "list-none -ml-5 font-medium text-foreground" : undefined}>
                    {b.startsWith("—") ? b.replace(/^—\s*/, "") : b}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-muted-foreground">
              This view is for QA: validate that extracted benchmarks + notes look correct before relying on them in memo generation.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
