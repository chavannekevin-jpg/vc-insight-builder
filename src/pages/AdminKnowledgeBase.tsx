import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { KnowledgeBaseIntro } from "@/components/admin/kb/KnowledgeBaseIntro";
import { KnowledgeBaseUploadPdfCard } from "@/components/admin/kb/KnowledgeBaseUploadPdfCard";
import { KnowledgeBaseAddUrlCard } from "@/components/admin/kb/KnowledgeBaseAddUrlCard";
import { KnowledgeBaseSourceList } from "@/components/admin/kb/KnowledgeBaseSourceList";

export default function AdminKnowledgeBase() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

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
        <KnowledgeBaseIntro />
        <KnowledgeBaseUploadPdfCard />
        <KnowledgeBaseAddUrlCard />
        <KnowledgeBaseSourceList />
      </div>
    </AdminLayout>
  );
}
