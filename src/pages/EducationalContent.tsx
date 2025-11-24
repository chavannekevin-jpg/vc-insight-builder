import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";

interface Article {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  icon: string;
  published: boolean;
}

export default function EducationalContent() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) {
        navigate("/hub");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("educational_articles")
          .select("*")
          .eq("slug", slug)
          .eq("published", true)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          navigate("/hub");
          return;
        }

        setArticle(data);
      } catch (error) {
        console.error("Error fetching article:", error);
        navigate("/hub");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <Button variant="outline" onClick={() => navigate("/hub")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Hub
        </Button>

        <ModernCard className="p-8">
          <div className="space-y-6">
            <div className="flex items-start gap-4 pb-6 border-b border-border">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-serif font-bold mb-3">
                  {article.title}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {article.description}
                </p>
              </div>
            </div>

            <div className="prose prose-slate max-w-none">
              <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                {article.content}
              </div>
            </div>

            <div className="pt-6 border-t border-border text-center space-y-4">
              <p className="text-lg font-medium">
                Ready to get YOUR investment memo?
              </p>
              <Button size="lg" onClick={() => navigate("/portal")} className="gradient-primary">
                Start Building Your Memo →
              </Button>
            </div>
          </div>
        </ModernCard>
      </div>
    </div>
  );
}
