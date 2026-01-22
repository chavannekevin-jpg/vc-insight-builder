import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface KnowledgeBaseSourceDetails {
  source: {
    id: string;
    title: string | null;
    publisher: string | null;
    source_type: "web" | "pdf_upload";
    content_kind: "report" | "framework";
    source_url: string | null;
    storage_path: string | null;
    geography_scope: string;
    status: "draft" | "active" | "archived";
    extraction_confidence: "high" | "medium" | "low" | null;
    publication_date: string | null;
    extracted_json: any;
    updated_at: string;
  };
  benchmarks: Array<{
    id: string;
    stage: string;
    sector: string | null;
    business_model: string | null;
    timeframe_label: string | null;
    metric_key: string;
    metric_label: string | null;
    median_value: number | null;
    p25_value: number | null;
    p75_value: number | null;
    unit: string | null;
    currency: string;
    sample_size: number | null;
    notes: string | null;
  }>;
  marketNotes: Array<{
    id: string;
    headline: string | null;
    summary: string;
    sector: string | null;
    timeframe_label: string | null;
    key_points: any;
  }>;

  frameworks: Array<{
    id: string;
    geography_scope: string;
    region: string | null;
    sector: string | null;
    title: string | null;
    summary: string;
    key_points: any;
    tags: any;
  }>;
}

export function useKnowledgeBaseSourceDetails(sourceId: string | null, opts?: { enabled?: boolean }) {
  const enabled = Boolean(sourceId) && (opts?.enabled ?? true);

  return useQuery({
    queryKey: ["kb-source-details", sourceId],
    enabled,
    queryFn: async (): Promise<KnowledgeBaseSourceDetails> => {
      if (!sourceId) throw new Error("Missing sourceId");

      const { data: source, error: sourceErr } = await supabase
        .from("kb_sources")
        .select(
          "id,title,publisher,source_type,content_kind,source_url,storage_path,geography_scope,status,extraction_confidence,publication_date,extracted_json,updated_at",
        )
        .eq("id", sourceId)
        .single();

      if (sourceErr) throw sourceErr;

      const [benchRes, notesRes, frameworksRes] = await Promise.all([
        supabase
          .from("kb_benchmarks")
          .select(
            "id,stage,sector,business_model,timeframe_label,metric_key,metric_label,median_value,p25_value,p75_value,unit,currency,sample_size,notes",
          )
          .eq("source_id", sourceId)
          .order("updated_at", { ascending: false })
          .limit(80),
        supabase
          .from("kb_market_notes")
          .select("id,headline,summary,sector,timeframe_label,key_points")
          .eq("source_id", sourceId)
          .order("updated_at", { ascending: false })
          .limit(50),
        supabase
          .from("kb_frameworks")
          .select("id,geography_scope,region,sector,title,summary,key_points,tags")
          .eq("source_id", sourceId)
          .order("updated_at", { ascending: false })
          .limit(50),
      ]);

      if (benchRes.error) throw benchRes.error;
      if (notesRes.error) throw notesRes.error;
      if (frameworksRes.error) throw frameworksRes.error;

      const normalizedSource: KnowledgeBaseSourceDetails["source"] = {
        id: source.id,
        title: source.title,
        publisher: source.publisher,
        source_type: source.source_type as KnowledgeBaseSourceDetails["source"]["source_type"],
        content_kind: (source as any).content_kind as KnowledgeBaseSourceDetails["source"]["content_kind"],
        source_url: source.source_url,
        storage_path: source.storage_path,
        geography_scope: source.geography_scope,
        status: source.status as KnowledgeBaseSourceDetails["source"]["status"],
        extraction_confidence:
          (source.extraction_confidence as KnowledgeBaseSourceDetails["source"]["extraction_confidence"]) ?? null,
        publication_date: source.publication_date,
        extracted_json: source.extracted_json,
        updated_at: source.updated_at,
      };

      return {
        source: normalizedSource,
        benchmarks: benchRes.data ?? [],
        marketNotes: notesRes.data ?? [],
        frameworks: frameworksRes.data ?? [],
      };
    },
    staleTime: 10_000,
  });
}
