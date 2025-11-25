import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ArrowLeft, Sparkles, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
        // First check if memo already exists in database
        const { data: existingMemo, error: memoError } = await supabase
          .from("memos")
          .select("content")
          .eq("company_id", companyId)
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
      
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 gradient-hero -z-10" />
        
        <div className="max-w-5xl mx-auto px-8 py-12">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate("/hub")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              {company && (
                <>
                  <Badge variant="outline" className="text-sm px-4 py-1.5 border-primary/30">
                    {company.name}
                  </Badge>
                  <Badge variant="outline" className="text-sm px-4 py-1.5">
                    {company.stage}
                  </Badge>
                  {company.category && (
                    <Badge variant="outline" className="text-sm px-4 py-1.5">
                      {company.category}
                    </Badge>
                  )}
                </>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold">
              Investment Memorandum
            </h1>
            
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleDownloadPDF}
              >
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleDownloadDOCX}
              >
                <FileText className="w-4 h-4" />
                Export DOCX
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Memo Content */}
      <div className="max-w-5xl mx-auto px-8 py-16">
        {sections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No content generated. Please complete your company profile first.
            </p>
            <Button
              className="mt-6"
              onClick={() => navigate("/company")}
            >
              Complete Profile
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {company?.description && (
              <section className="pb-8 border-b border-border/50">
                <h2 className="text-2xl font-bold mb-4">Executive Summary</h2>
                <p className="text-lg leading-relaxed text-foreground/90">
                  {company.description}
                </p>
              </section>
            )}
            
            {sections.map((section, index) => (
              <section key={index} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                </div>
                
                <div className="pl-11">
                  <div className="prose prose-lg max-w-none">
                    {section.content.split('\n\n').map((paragraph, pIndex) => (
                      <p key={pIndex} className="text-foreground/90 leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <section className="border-t border-border/50 bg-card/30 py-16">
        <div className="max-w-5xl mx-auto px-8 text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Iterate?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Update your company profile to refine your investment memo and strengthen your narrative.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/company")}
              className="gradient-primary shadow-glow hover-neon-pulse"
            >
              Update Profile
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/hub")}
            >
              Back to Hub
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
