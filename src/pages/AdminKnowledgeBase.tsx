import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function AdminKnowledgeBase() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");

  useEffect(() => {
    // AdminLayout will also enforce auth; we keep this light check to prevent a flash.
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/");
          return;
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

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
      description: "Added as a draft source. Next: extraction + review UI.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <AdminLayout title="Knowledge Base">
      <div className="space-y-6">
        <ModernCard>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Add public report URL</h2>
            <p className="text-sm text-muted-foreground">
              Paste a public Europe-focused report URL. For now we store it as a draft source; extraction pipeline comes next.
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
            <Button onClick={handleSaveDraft} disabled={!url.trim()}>
              Save draft
            </Button>
          </div>
        </ModernCard>
      </div>
    </AdminLayout>
  );
}
