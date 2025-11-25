import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ArrowLeft, Sparkles, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { marked } from "marked";

interface MemoSection {
  title: string;
  content: string;
}

interface CompanyInfo {
  name: string;
  stage: string;
  category: string;
  description: string;
}

export default function GeneratedMemo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sections, setSections] = useState<MemoSection[]>([]);
  const [company, setCompany] = useState<CompanyInfo | null>(null);

  useEffect(() => {
    const loadOrGenerateMemo = async () => {
      if (!companyId) {
        toast({
          title: "Error",
          description: "No company ID provided",
          variant: "destructive"
        });
        navigate("/hub");
        return;
      }

      try {
        // First check if memo already exists in database - get the most recent one
        const { data: existingMemo, error: memoError } = await supabase
          .from("memos")
          .select("content")
          .eq("company_id", companyId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (memoError) {
          console.error("Error fetching memo:", memoError);
        }

        // If memo exists, load it
        if (existingMemo && existingMemo.content) {
          const parsedContent = JSON.parse(existingMemo.content);
          const formattedSections: MemoSection[] = Object.entries(parsedContent.sections).map(
            ([title, content]) => ({
              title,
              content: content as string
            })
          );
          setSections(formattedSections);

          // Fetch company info
          const { data: companyData } = await supabase
            .from("companies")
            .select("name, stage, category, description")
            .eq("id", companyId)
            .single();

          if (companyData) {
            setCompany(companyData);
          }
          
          setLoading(false);
          return;
        }

        // If no memo exists, generate it
        setGenerating(true);
        const { data, error } = await supabase.functions.invoke("generate-full-memo", {
          body: { companyId }
        });

        if (error) throw error;

        if (data.enhanced) {
          const formattedSections: MemoSection[] = Object.entries(data.enhanced).map(
            ([title, content]) => ({
              title,
              content: content as string
            })
          );
          setSections(formattedSections);
        }

        if (data.company) {
          setCompany(data.company);
        }
      } catch (error: any) {
        console.error("Error with memo:", error);
        toast({
          title: "Failed to load memo",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
        setGenerating(false);
      }
    };

    loadOrGenerateMemo();
  }, [companyId, navigate]);

  const handleDownloadPDF = () => {
    toast({
      title: "PDF Export",
      description: "PDF export will be available soon",
    });
  };

  const handleDownloadDOCX = () => {
    toast({
      title: "DOCX Export",
      description: "DOCX export will be available soon",
    });
  };

  if (loading || generating) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 animate-pulse">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">
                {generating ? "Generating Your Investment Memo" : "Loading Your Memo"}
              </h2>
              <p className="text-muted-foreground">
                {generating ? "This may take a minute as we analyze each section..." : "Please wait..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section with Dramatic Gradient */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 gradient-hero -z-10" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20 relative">
          <Button
            variant="ghost"
            className="mb-8 hover:bg-card/50 transition-all group"
            onClick={() => navigate("/hub")}
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Hub
          </Button>
          
          <div className="space-y-8 animate-fade-in">
            {/* Company Badges */}
            <div className="flex items-center gap-3 flex-wrap">
              {company && (
                <>
                  <Badge className="text-sm px-5 py-2 bg-gradient-primary border-0 text-primary-foreground shadow-glow font-semibold">
                    {company.name}
                  </Badge>
                  <Badge variant="outline" className="text-sm px-5 py-2 border-primary/40 bg-card/50 backdrop-blur-sm">
                    {company.stage}
                  </Badge>
                  {company.category && (
                    <Badge variant="outline" className="text-sm px-5 py-2 border-accent/40 bg-card/50 backdrop-blur-sm">
                      {company.category}
                    </Badge>
                  )}
                </>
              )}
            </div>
            
            {/* Title with Neon Effect */}
            <div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-4">
                Investment Memorandum
              </h1>
              <div className="h-1.5 w-32 gradient-primary rounded-full shadow-glow" />
            </div>
            
            {/* Export Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                variant="outline"
                className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all hover:shadow-glow"
                onClick={handleDownloadPDF}
              >
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                className="gap-2 border-accent/30 hover:bg-accent/10 hover:border-accent/50 transition-all"
                onClick={handleDownloadDOCX}
              >
                <FileText className="w-4 h-4" />
                Export DOCX
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Memo Content with Beautiful Cards */}
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-24">
        {sections.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
              <FileText className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-xl mb-8">
              No content generated. Please complete your company profile first.
            </p>
            <Button
              size="lg"
              className="gradient-primary shadow-glow hover-neon-pulse"
              onClick={() => navigate("/company")}
            >
              Complete Profile
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Executive Summary Card */}
            {company?.description && (
              <section className="relative group animate-fade-in">
                <div className="absolute inset-0 gradient-primary opacity-5 rounded-3xl blur-xl group-hover:opacity-10 transition-opacity" />
                <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-3xl p-8 md:p-10 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-glow">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-primary text-primary-foreground font-bold text-xl shadow-glow">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Executive Summary</h2>
                  </div>
                  <p className="text-lg md:text-xl leading-relaxed text-foreground/90 pl-[72px]">
                    {company.description}
                  </p>
                </div>
              </section>
            )}
            
            {/* Memo Sections as Beautiful Cards */}
            {sections.map((section, index) => (
              <section 
                key={index} 
                className="relative group animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 gradient-accent opacity-0 rounded-3xl blur-xl group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-3xl p-8 md:p-10 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-glow">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-primary text-primary-foreground font-bold text-2xl shadow-glow shrink-0">
                      {index + 1}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{section.title}</h2>
                  </div>
                  
                  <div className="pl-0 md:pl-[72px]">
                    <div 
                      className="prose prose-lg prose-slate dark:prose-invert max-w-none
                        prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
                        prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8 first:prose-h3:mt-0
                        prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:text-lg prose-p:mb-5
                        prose-strong:text-foreground prose-strong:font-semibold prose-strong:text-primary
                        prose-ul:my-5 prose-ul:list-disc prose-ul:pl-6
                        prose-ol:my-5 prose-ol:list-decimal prose-ol:pl-6
                        prose-li:text-foreground/90 prose-li:my-2 prose-li:text-lg
                        prose-a:text-primary prose-a:no-underline hover:prose-a:text-primary/80 hover:prose-a:underline prose-a:underline-offset-4
                        prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic
                        prose-code:text-primary prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded"
                      dangerouslySetInnerHTML={{ 
                        __html: marked(section.content, { 
                          breaks: true,
                          gfm: true 
                        }) 
                      }}
                    />
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Footer CTA with Gradient Background */}
      <section className="relative border-t border-border/50 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/20 rounded-full blur-[120px]" />
        
        <div className="relative max-w-6xl mx-auto px-6 md:px-8 py-20 md:py-24 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">Ready to Iterate?</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Update your company profile to refine your investment memo and strengthen your narrative.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              onClick={() => navigate("/company")}
              className="gradient-primary shadow-glow hover-neon-pulse font-bold text-lg px-8 py-6"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Update Profile
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/hub")}
              className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 text-lg px-8 py-6"
            >
              Back to Hub
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}