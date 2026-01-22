import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type KnowledgeBaseSourceStatus = "draft" | "active" | "archived";
export type KnowledgeBaseSourceType = "web" | "pdf_upload";
export type KnowledgeBaseContentKind = "report" | "framework";
export type ExtractionConfidence = "high" | "medium" | "low" | null;

export interface KnowledgeBaseSourceWithCounts {
  id: string;
  source_type: KnowledgeBaseSourceType;
  content_kind: KnowledgeBaseContentKind;
  title: string | null;
  publisher: string | null;
  source_url: string | null;
  storage_path: string | null;
  geography_scope: string;
  status: KnowledgeBaseSourceStatus;
  extraction_confidence: ExtractionConfidence;
  publication_date: string | null;
  created_at: string;
  updated_at: string;
  benchmarks_count: number;
  market_notes_count: number;
}

async function fetchCountsForSource(sourceId: string) {
  const [bench, notes] = await Promise.all([
    supabase
      .from("kb_benchmarks")
      .select("id", { count: "exact", head: true })
      .eq("source_id", sourceId),
    supabase
      .from("kb_market_notes")
      .select("id", { count: "exact", head: true })
      .eq("source_id", sourceId),
  ]);

  return {
    benchmarks_count: bench.count ?? 0,
    market_notes_count: notes.count ?? 0,
  };
}

export function useKnowledgeBaseSources(opts?: { limit?: number }) {
  const limit = opts?.limit ?? 50;

  return useQuery({
    queryKey: ["kb-sources", { limit }],
    queryFn: async (): Promise<KnowledgeBaseSourceWithCounts[]> => {
      const { data, error } = await supabase
        .from("kb_sources")
        .select(
          "id, source_type, content_kind, title, publisher, source_url, storage_path, geography_scope, status, extraction_confidence, publication_date, created_at, updated_at",
        )
        .order("updated_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      const rows = data ?? [];

      const rowsWithCounts = await Promise.all(
        rows.map(async (row) => {
          const counts = await fetchCountsForSource(row.id);
          return {
            ...row,
            ...counts,
          } as KnowledgeBaseSourceWithCounts;
        }),
      );

      return rowsWithCounts;
    },
    staleTime: 10_000,
  });
}
