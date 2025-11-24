import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Loader2, BookOpen } from "lucide-react";
import { marked } from "marked";

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

  const htmlContent = useMemo(() => {
    if (!article) return "";
    return marked(article.content, { breaks: true, gfm: true });
  }, [article]);

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

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <Button variant="outline" onClick={() => navigate("/hub")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Learning Hub
        </Button>

        <article className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
          {/* Article Header */}
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-12 border-b border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-primary/20 backdrop-blur-sm">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary uppercase tracking-wide">
                Educational Content
              </span>
            </div>
            <h1 className="text-5xl font-bold mb-4 leading-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
              {article.title}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
              {article.description}
            </p>
          </div>

          {/* Article Content */}
          <div className="p-12">
            <div className="prose prose-lg prose-slate dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-12 prose-h1:pb-4 prose-h1:border-b prose-h1:border-border
              prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-10 prose-h2:text-primary
              prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-8
              prose-p:text-base prose-p:leading-relaxed prose-p:mb-4 prose-p:text-foreground/90
              prose-strong:text-foreground prose-strong:font-semibold
              prose-ul:my-6 prose-ul:space-y-2
              prose-ol:my-6 prose-ol:space-y-2
              prose-li:text-foreground/90 prose-li:leading-relaxed
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 
              prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:my-6 prose-blockquote:rounded-r-lg
              prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              prose-pre:bg-muted prose-pre:border prose-pre:border-border
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-lg prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-br from-primary/5 to-background p-12 border-t border-border text-center">
            <div className="max-w-2xl mx-auto space-y-6">
              <h3 className="text-2xl font-bold">Ready to create your investment memo?</h3>
              <p className="text-muted-foreground text-lg">
                Apply what you've learned and build a professional memo that will impress investors.
              </p>
              <Button size="lg" onClick={() => navigate("/portal")} className="gradient-primary text-lg px-8 py-6">
                Start Building Your Memo →
              </Button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
