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

      <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 py-24 space-y-20">
        <Button variant="ghost" onClick={() => navigate("/hub")} className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back to Hub
        </Button>

        <article className="space-y-24 mx-auto">
          {/* Article Header */}
          <header className="space-y-10 mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary/80 uppercase tracking-wide">
                Learning
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] tracking-tight">
              {article.title}
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              {article.description}
            </p>
          </header>

          {/* Article Content */}
          <div className="max-w-3xl">
            <div className="prose prose-lg dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-32
              prose-h1:text-4xl prose-h1:mb-12 prose-h1:mt-24 prose-h1:leading-[1.2]
              prose-h2:text-3xl prose-h2:mb-10 prose-h2:mt-24 prose-h2:text-primary prose-h2:leading-[1.3]
              prose-h3:text-2xl prose-h3:mb-8 prose-h3:mt-20 prose-h3:leading-[1.35]
              prose-p:text-lg prose-p:leading-[1.9] prose-p:mb-10 prose-p:text-foreground/85
              prose-strong:text-foreground prose-strong:font-semibold
              prose-em:text-foreground/75 prose-em:italic
              prose-ul:my-12 prose-ul:space-y-5 prose-ul:pl-2
              prose-ol:my-12 prose-ol:space-y-5 prose-ol:pl-2
              prose-li:text-lg prose-li:leading-[1.9] prose-li:text-foreground/85 prose-li:my-4
              prose-blockquote:border-l-4 prose-blockquote:border-primary/40 prose-blockquote:bg-primary/5 
              prose-blockquote:py-10 prose-blockquote:px-12 prose-blockquote:my-16 prose-blockquote:rounded-r-lg
              prose-blockquote:italic prose-blockquote:text-xl prose-blockquote:leading-[1.8] prose-blockquote:text-foreground/75
              prose-code:text-primary prose-code:bg-primary/10 prose-code:px-2.5 prose-code:py-1 
              prose-code:rounded prose-code:text-base prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-muted prose-pre:border prose-pre:border-border/50 prose-pre:p-8 prose-pre:my-16 prose-pre:rounded-lg
              prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-4 prose-a:decoration-2
              prose-img:rounded-lg prose-img:shadow-lg prose-img:my-16"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>

          {/* Call to Action */}
          <div className="max-w-2xl pt-12">
            <div className="bg-gradient-to-br from-primary/5 to-background/50 
              border border-primary/10 rounded-xl p-10 space-y-6">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold leading-tight">
                Ready to create your investment memo?
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Apply what you've learned and build a professional memo that will impress investors.
              </p>
              <Button 
                size="lg" 
                onClick={() => navigate("/portal")} 
                className="mt-2"
              >
                Start Building Your Memo
              </Button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
