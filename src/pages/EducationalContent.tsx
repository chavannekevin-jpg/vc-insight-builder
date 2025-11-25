import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, BookOpen, Sparkles } from "lucide-react";

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

  const sections = useMemo(() => {
    if (!article) return [];
    
    // Parse HTML content and split by <h2> tags
    const parser = new DOMParser();
    const doc = parser.parseFromString(article.content, 'text/html');
    const h2Elements = doc.querySelectorAll('h2');
    
    if (h2Elements.length === 0) {
      // No H2 sections found, treat entire content as intro
      return [{
        title: 'intro',
        html: article.content
      }];
    }
    
    const parsed: { title: string; html: string }[] = [];
    
    // Get intro content (everything before first h2)
    const firstH2 = h2Elements[0];
    let introContent = '';
    let node = doc.body.firstChild;
    
    while (node && node !== firstH2) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        introContent += (node as Element).outerHTML;
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        introContent += node.textContent;
      }
      node = node.nextSibling;
    }
    
    if (introContent.trim()) {
      parsed.push({ title: 'intro', html: introContent });
    }
    
    // Process each H2 section
    h2Elements.forEach((h2) => {
      const title = h2.textContent?.trim() || '';
      let sectionContent = '';
      let nextNode = h2.nextSibling;
      
      // Collect all content until the next h2 or end
      while (nextNode && nextNode.nodeName.toLowerCase() !== 'h2') {
        if (nextNode.nodeType === Node.ELEMENT_NODE) {
          sectionContent += (nextNode as Element).outerHTML;
        } else if (nextNode.nodeType === Node.TEXT_NODE && nextNode.textContent?.trim()) {
          sectionContent += nextNode.textContent;
        }
        nextNode = nextNode.nextSibling;
      }
      
      parsed.push({ title, html: sectionContent });
    });
    
    return parsed;
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

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center px-6 sm:px-8 lg:px-12 py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-hero -z-10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse opacity-50" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse opacity-50" style={{ animationDelay: '1s' }} />
        
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in">
          <Button 
            variant="outline" 
            onClick={() => navigate("/hub")} 
            className="gap-2 mb-8 border-primary/30 hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Learning Hub
          </Button>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/95 backdrop-blur-sm border border-primary/30 rounded-lg shadow-lg">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary uppercase tracking-wider">
              Educational Content
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
            {article.title}
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            {article.description}
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16 space-y-12">
        {/* Intro Content */}
        {sections.find(s => s.title === 'intro') && (
          <div className="relative overflow-hidden bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 md:p-12 shadow-lg hover:border-primary/30 transition-all duration-300">
            <div className="prose prose-lg md:prose-xl dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-6
              prose-p:text-lg prose-p:leading-relaxed prose-p:mb-6 prose-p:text-foreground/90
              prose-strong:text-primary prose-strong:font-bold
              prose-ul:my-6 prose-ul:space-y-2
              prose-ol:my-6 prose-ol:space-y-2
              prose-li:text-lg prose-li:leading-relaxed prose-li:text-foreground/90"
              dangerouslySetInnerHTML={{ __html: sections.find(s => s.title === 'intro')?.html || '' }}
            />
          </div>
        )}

        {/* Main Content Sections */}
        {sections.filter(s => s.title !== 'intro').map((section, index) => (
          <div 
            key={index}
            className="relative overflow-hidden bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 md:p-12 shadow-lg hover:border-primary/30 transition-all duration-300 hover:shadow-glow group"
          >
            <div className="flex items-start gap-6 mb-8">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300">
                <span className="text-2xl font-bold text-primary-foreground">{index + 1}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 group-hover:text-primary transition-colors">
                  {section.title}
                </h2>
              </div>
            </div>
            
            <div className="prose prose-lg md:prose-xl dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-6
              prose-p:text-lg prose-p:leading-relaxed prose-p:mb-6 prose-p:text-foreground/90
              prose-strong:text-primary prose-strong:font-bold
              prose-ul:my-6 prose-ul:space-y-2
              prose-ol:my-6 prose-ol:space-y-2
              prose-li:text-lg prose-li:leading-relaxed prose-li:text-foreground/90
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 
              prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:my-6 prose-blockquote:rounded-r-xl
              prose-code:text-primary prose-code:bg-primary/10 prose-code:px-2 prose-code:py-1 
              prose-code:rounded-md prose-code:text-sm
              prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: section.html }}
            />
          </div>
        ))}
      </section>

      {/* Call to Action */}
      <section className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
        <div className="relative overflow-hidden gradient-accent border border-primary/20 rounded-3xl p-12 md:p-16 text-center shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
          <div className="absolute top-10 right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-secondary/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 space-y-8">
            <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-3xl md:text-5xl font-bold leading-tight">
                Ready to Build Your Memo?
              </h3>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Apply what you've learned and create a professional investment memo that stands out.
              </p>
            </div>
            
            <Button 
              size="lg" 
              onClick={() => navigate("/portal")} 
              className="gradient-primary text-lg px-12 py-7 h-auto shadow-glow hover-neon-pulse font-bold uppercase tracking-wider"
            >
              Start Building Now →
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
