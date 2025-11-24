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

      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-16 space-y-12">
        <Button variant="outline" onClick={() => navigate("/hub")} className="gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Learning Hub
        </Button>

        <article className="space-y-16">
          {/* Article Header */}
          <header className="space-y-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary uppercase tracking-wider">
                Educational Content
              </span>
            </div>
            
            <div className="space-y-6 max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                {article.title}
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                {article.description}
              </p>
            </div>
            
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto" />
          </header>

          {/* Article Content */}
          <div className="max-w-2xl mx-auto">
            <div className="prose prose-lg sm:prose-xl dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-24
              prose-h1:text-4xl prose-h1:mb-10 prose-h1:mt-20 prose-h1:leading-[1.3] prose-h1:pb-6
              prose-h2:text-3xl prose-h2:mb-8 prose-h2:mt-20 prose-h2:text-primary prose-h2:leading-[1.35] prose-h2:pt-4
              prose-h3:text-2xl prose-h3:mb-6 prose-h3:mt-16 prose-h3:leading-[1.4]
              prose-p:text-lg prose-p:leading-[2] prose-p:mb-8 prose-p:text-foreground/90
              prose-strong:text-foreground prose-strong:font-semibold
              prose-em:text-foreground/80 prose-em:italic
              prose-ul:my-10 prose-ul:space-y-4 prose-ul:pl-6
              prose-ol:my-10 prose-ol:space-y-4 prose-ol:pl-6
              prose-li:text-lg prose-li:leading-[2] prose-li:text-foreground/90 prose-li:my-3 prose-li:pl-2
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 
              prose-blockquote:py-8 prose-blockquote:px-10 prose-blockquote:my-12 prose-blockquote:rounded-r-xl
              prose-blockquote:italic prose-blockquote:text-xl prose-blockquote:leading-[1.9]
              prose-code:text-primary prose-code:bg-primary/10 prose-code:px-2.5 prose-code:py-1.5 
              prose-code:rounded-md prose-code:text-base prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:p-8 prose-pre:my-12 prose-pre:rounded-xl
              prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-4
              prose-img:rounded-xl prose-img:shadow-lg prose-img:my-14 prose-img:border prose-img:border-border/50"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>

          {/* Call to Action */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-background 
              border border-primary/20 rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-lg">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold leading-tight">
                Ready to create your investment memo?
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-xl mx-auto">
                Apply what you've learned and build a professional memo that will impress investors.
              </p>
              <Button 
                size="lg" 
                onClick={() => navigate("/portal")} 
                className="gradient-primary text-lg px-10 py-6 h-auto mt-4 shadow-lg hover:shadow-xl transition-shadow"
              >
                Start Building Your Memo →
              </Button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
