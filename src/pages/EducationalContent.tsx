import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Loader2, BookOpen, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-16 space-y-16">
        <Button variant="outline" onClick={() => navigate("/hub")} className="gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Learning Hub
        </Button>

        <article className="space-y-20">
          {/* Article Header */}
          <header className="space-y-10 text-center pb-8 border-b border-border/30">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary uppercase tracking-wider">
                Educational Content
              </span>
            </div>
            
            <div className="space-y-8 max-w-4xl mx-auto">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                {article.title}
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                {article.description}
              </p>
            </div>
          </header>

          {/* Intro Content */}
          {sections.find(s => s.title === 'intro') && sections.filter(s => s.title !== 'intro').length === 0 ? (
            // If only intro (no H2 sections), show full content
            <div className="max-w-3xl mx-auto">
              <div className="prose prose-xl dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-24
                prose-h3:text-xl prose-h3:mb-6 prose-h3:mt-8 prose-h3:leading-[1.4]
                prose-p:text-xl prose-p:leading-[2] prose-p:mb-8 prose-p:text-foreground/90
                prose-strong:text-foreground prose-strong:font-semibold
                prose-em:text-foreground/80 prose-em:italic
                prose-ul:my-6 prose-ul:space-y-3 prose-ul:pl-6
                prose-ol:my-6 prose-ol:space-y-3 prose-ol:pl-6
                prose-li:text-xl prose-li:leading-[2] prose-li:text-foreground/90 prose-li:my-2 prose-li:pl-2
                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 
                prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:my-8 prose-blockquote:rounded-r-xl
                prose-blockquote:italic prose-blockquote:text-lg prose-blockquote:leading-[1.9]
                prose-code:text-primary prose-code:bg-primary/10 prose-code:px-2.5 prose-code:py-1.5 
                prose-code:rounded-md prose-code:text-base prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:p-6 prose-pre:my-8 prose-pre:rounded-xl
                prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-4
                prose-img:rounded-xl prose-img:shadow-lg prose-img:my-10 prose-img:border prose-img:border-border/50"
                dangerouslySetInnerHTML={{ __html: sections.find(s => s.title === 'intro')?.html || '' }}
              />
            </div>
          ) : sections.find(s => s.title === 'intro') ? (
            // If intro exists with sections, show just intro
            <div className="max-w-3xl mx-auto">
              <div className="prose prose-xl dark:prose-invert max-w-none
                prose-p:text-xl prose-p:leading-[2] prose-p:mb-8 prose-p:text-foreground/90
                prose-strong:text-foreground prose-strong:font-semibold"
                dangerouslySetInnerHTML={{ __html: sections.find(s => s.title === 'intro')?.html || '' }}
              />
            </div>
          ) : null}

          {/* Collapsible Sections (only if H2 sections exist) */}
          {sections.filter(s => s.title !== 'intro').length > 0 && (
            <div className="max-w-3xl mx-auto space-y-6">
              <Accordion type="multiple" className="space-y-6" defaultValue={sections.filter(s => s.title !== 'intro').map((_, i) => `section-${i}`)}>
                {sections
                  .filter(section => section.title !== 'intro')
                  .map((section, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`section-${index}`}
                    className="border border-border/50 rounded-2xl overflow-hidden bg-card/30 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                  >
                    <AccordionTrigger className="px-8 py-6 text-left hover:no-underline group">
                      <div className="flex items-center gap-4 w-full">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <span className="text-sm font-bold text-primary">{index + 1}</span>
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors flex-1">
                          {section.title}
                        </h2>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-8 pb-8 pt-2">
                      <div className="prose prose-lg dark:prose-invert max-w-none
                        prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-24
                        prose-h3:text-xl prose-h3:mb-6 prose-h3:mt-8 prose-h3:leading-[1.4]
                        prose-p:text-lg prose-p:leading-[2] prose-p:mb-8 prose-p:text-foreground/90
                        prose-strong:text-foreground prose-strong:font-semibold
                        prose-em:text-foreground/80 prose-em:italic
                        prose-ul:my-6 prose-ul:space-y-3 prose-ul:pl-6
                        prose-ol:my-6 prose-ol:space-y-3 prose-ol:pl-6
                        prose-li:text-lg prose-li:leading-[2] prose-li:text-foreground/90 prose-li:my-2 prose-li:pl-2
                        prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 
                        prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:my-8 prose-blockquote:rounded-r-xl
                        prose-blockquote:italic prose-blockquote:text-lg prose-blockquote:leading-[1.9]
                        prose-code:text-primary prose-code:bg-primary/10 prose-code:px-2.5 prose-code:py-1.5 
                        prose-code:rounded-md prose-code:text-base prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
                        prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:p-6 prose-pre:my-8 prose-pre:rounded-xl
                        prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-4
                        prose-img:rounded-xl prose-img:shadow-lg prose-img:my-10 prose-img:border prose-img:border-border/50"
                        dangerouslySetInnerHTML={{ __html: section.html }}
                      />
                    </AccordionContent>
                  </AccordionItem>
                  ))}
              </Accordion>
            </div>
          )}

          {/* Call to Action */}
          <div className="max-w-4xl mx-auto pt-12">
            <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-background 
              border border-primary/20 rounded-3xl p-12 sm:p-16 text-center space-y-8 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
              <div className="relative z-10 space-y-8">
                <div className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <BookOpen className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl sm:text-4xl font-bold leading-tight">
                    Ready to create your investment memo?
                  </h3>
                  <p className="text-muted-foreground text-xl leading-relaxed max-w-2xl mx-auto">
                    Apply what you've learned and build a professional memo that will impress investors.
                  </p>
                </div>
                <Button 
                  size="lg" 
                  onClick={() => navigate("/portal")} 
                  className="gradient-primary text-lg px-12 py-7 h-auto mt-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  Start Building Your Memo →
                </Button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
