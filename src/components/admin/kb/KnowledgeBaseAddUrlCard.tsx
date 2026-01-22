import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export function KnowledgeBaseAddUrlCard({
  onSaved,
}: {
  onSaved?: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");

  const handleSaveDraft = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    const { error } = await supabase.from("kb_sources").insert({
      source_type: "web",
      source_url: trimmed,
      geography_scope: "Europe",
      status: "draft",
    });

    if (error) {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setUrl("");
    toast({
      title: "Saved",
      description: "Added as a draft source. Draft sources are not used by the AI until activated.",
    });
    queryClient.invalidateQueries({ queryKey: ["kb-sources"] });
    onSaved?.();
  };

  return (
    <ModernCard>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Add public report URL</h2>
        <p className="text-sm text-muted-foreground">
          Paste a public Europe-focused report URL. For now, we store it as <span className="font-medium text-foreground">Draft</span> (not used by the AI) until we add URL extraction.
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
        <Button onClick={handleSaveDraft} disabled={!url.trim()}>
          Save draft
        </Button>
      </div>
    </ModernCard>
  );
}
