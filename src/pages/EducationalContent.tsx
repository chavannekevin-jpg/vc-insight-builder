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

      <div className="w-full">
        {/* Back Button */}
        <div className="max-w-[680px] mx-auto px-6 pt-12 pb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/hub")} 
            className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Article */}
        <article className="max-w-[680px] mx-auto px-6 pb-32">
          {/* Header */}
          <header className="mb-16 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-balance">
              {article.title}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {article.description}
            </p>
          </header>

          {/* Content */}
          <div className="prose dark:prose-invert prose-lg max-w-none
            prose-headings:font-bold prose-headings:text-foreground
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:leading-tight
            prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4
            prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:mb-6
            prose-strong:text-foreground prose-strong:font-semibold
            prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
            prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
            prose-li:text-foreground/90 prose-li:my-2 prose-li:leading-relaxed
            prose-blockquote:border-l-4 prose-blockquote:border-primary/30 
            prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-foreground/80 prose-blockquote:my-8
            prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 
            prose-code:rounded prose-code:text-sm prose-code:font-mono
            prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:p-6 prose-pre:my-8 prose-pre:rounded-lg
            prose-a:text-primary prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-primary/80
            prose-img:rounded-lg prose-img:my-8"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* CTA */}
          <div className="mt-16 pt-12 border-t border-border">
            <div className="bg-muted/50 rounded-lg p-8 space-y-4">
              <h3 className="text-2xl font-bold">Ready to build your memo?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Apply what you learned and create a professional investment memo.
              </p>
              <Button 
                size="lg" 
                onClick={() => navigate("/portal")} 
                className="mt-4"
              >
                Start Building
              </Button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
