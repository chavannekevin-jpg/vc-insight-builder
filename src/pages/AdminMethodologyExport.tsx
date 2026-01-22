import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ModernCard } from "@/components/ModernCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Download, RefreshCw } from "lucide-react";

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function AdminMethodologyExport() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [markdown, setMarkdown] = useState<string>("");

  useEffect(() => {
    // AdminLayout enforces auth; this avoids a flash.
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) navigate("/");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const filename = useMemo(() => {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    return `investment-analysis-methodology-${stamp}.md`;
  }, []);

  const generate = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-methodology-export", {
        body: { format: "markdown" },
      });
      if (error) throw error;
      if (!data?.markdown) throw new Error("No markdown returned");
      setMarkdown(data.markdown);
      toast({ title: "Export generated", description: "The methodology document is ready." });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Export failed", description: e.message ?? "Unknown error", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      toast({ title: "Copied", description: "Markdown copied to clipboard." });
    } catch (e) {
      toast({ title: "Copy failed", description: "Your browser blocked clipboard access.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <AdminLayout title="Methodology Export">
      <div className="space-y-6">
        <ModernCard>
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Single document export</h2>
              <p className="text-sm text-muted-foreground">
                Generates a comprehensive, reproducible specification of the end-to-end investment analysis pipeline,
                including current section prompts.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={generate} disabled={generating} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                {generating ? "Generating…" : "Generate export"}
              </Button>
              <Button
                variant="secondary"
                onClick={copy}
                disabled={!markdown}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              <Button
                variant="secondary"
                onClick={() => downloadTextFile(filename, markdown)}
                disabled={!markdown}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download .md
              </Button>
            </div>
          </div>
        </ModernCard>

        <ModernCard>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">Export content (Markdown)</h3>
            <Textarea
              value={markdown}
              readOnly
              className="min-h-[60vh] font-mono text-xs"
              placeholder="Click “Generate export” to produce the full methodology document…"
            />
          </div>
        </ModernCard>
      </div>
    </AdminLayout>
  );
}
