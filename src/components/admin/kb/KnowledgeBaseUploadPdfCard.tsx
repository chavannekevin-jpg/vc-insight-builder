import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export function KnowledgeBaseUploadPdfCard({
  onImported,
}: {
  onImported?: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfPublisher, setPdfPublisher] = useState("");
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  const canUploadPdf = useMemo(() => {
    if (!pdfFile) return false;
    if (isUploadingPdf) return false;
    if (pdfFile.type !== "application/pdf") return false;
    if (pdfFile.size > 20 * 1024 * 1024) return false;
    return true;
  }, [pdfFile, isUploadingPdf]);

  const handlePdfSelect = (file: File | null) => {
    if (!file) {
      setPdfFile(null);
      return;
    }
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file",
        description: "Please choose a PDF file.",
        variant: "destructive",
      });
      setPdfFile(null);
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Max file size is 20MB.",
        variant: "destructive",
      });
      setPdfFile(null);
      return;
    }
    setPdfFile(file);
    if (!pdfTitle.trim()) setPdfTitle(file.name.replace(/\.pdf$/i, ""));
  };

  const handleUploadPdfAndParse = async () => {
    if (!pdfFile) return;
    setIsUploadingPdf(true);

    try {
      // 1) Create draft source
      const { data: sourceRow, error: insertErr } = await supabase
        .from("kb_sources")
        .insert({
          source_type: "pdf_upload",
          title: pdfTitle.trim() || null,
          publisher: pdfPublisher.trim() || null,
          geography_scope: "Europe",
          status: "draft",
        })
        .select("id")
        .single();

      if (insertErr || !sourceRow?.id) {
        throw new Error(insertErr?.message || "Failed to create source record");
      }

      const sourceId = sourceRow.id as string;

      // 2) Upload file to private storage
      const safeName = pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const objectPath = `kb/${sourceId}/${Date.now()}-${safeName}`;

      const { error: uploadErr } = await supabase.storage
        .from("kb-reports")
        .upload(objectPath, pdfFile, {
          contentType: "application/pdf",
          upsert: false,
        });
      if (uploadErr) throw new Error(uploadErr.message);

      // 3) Attach storage path
      const { error: updateErr } = await supabase
        .from("kb_sources")
        .update({ storage_path: objectPath })
        .eq("id", sourceId);
      if (updateErr) throw new Error(updateErr.message);

      // 4) Parse + auto-publish
      const { data: parseData, error: parseErr } = await supabase.functions.invoke(
        "kb-parse-report",
        { body: { sourceId } },
      );
      if (parseErr) throw new Error(parseErr.message);
      if (!parseData?.success) throw new Error(parseData?.error || "Parse failed");

      toast({
        title: "Imported",
        description: "Benchmarks + market notes extracted and published (Active).",
      });

      setPdfFile(null);
      setPdfTitle("");
      setPdfPublisher("");
      queryClient.invalidateQueries({ queryKey: ["kb-sources"] });
      onImported?.();
    } catch (e) {
      toast({
        title: "Import failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsUploadingPdf(false);
    }
  };

  return (
    <ModernCard>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Upload report PDF (Europe)</h2>
        <p className="text-sm text-muted-foreground">
          Upload a PDF report; we’ll extract benchmarks + market notes and mark it <span className="font-medium text-foreground">Active</span> so it can be used in memo generation.
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Title (optional)</p>
          <Input
            value={pdfTitle}
            onChange={(e) => setPdfTitle(e.target.value)}
            placeholder="e.g., European Seed Benchmark Report"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Publisher (optional)</p>
          <Input
            value={pdfPublisher}
            onChange={(e) => setPdfPublisher(e.target.value)}
            placeholder="e.g., Change Ventures"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input type="file" accept="application/pdf" onChange={(e) => handlePdfSelect(e.target.files?.[0] ?? null)} />
        <Button onClick={handleUploadPdfAndParse} disabled={!canUploadPdf}>
          {isUploadingPdf ? "Importing…" : "Upload & extract"}
        </Button>
      </div>

      {pdfFile && (
        <p className="mt-2 text-xs text-muted-foreground">
          Selected: {pdfFile.name} ({Math.round(pdfFile.size / 1024 / 1024)}MB)
        </p>
      )}
    </ModernCard>
  );
}
