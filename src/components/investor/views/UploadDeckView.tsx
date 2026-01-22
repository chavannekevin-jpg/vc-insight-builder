import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
  FileUp, 
  Upload, 
  FileText, 
  Loader2, 
  ChevronDown, 
  ChevronUp,
  FileSearch,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  LayoutGrid
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { convertPDFToImages } from "@/lib/pdfToImages";

// Import new enhanced components
import { InvestorMemoHeader } from "../memo/InvestorMemoHeader";
import { InvestorQuickTake } from "../memo/InvestorQuickTake";
import { InvestorMatchCard } from "../memo/InvestorMatchCard";
import { InvestorMiniRadar } from "../memo/InvestorMiniRadar";
import { InvestorQuickFacts } from "../memo/InvestorQuickFacts";
import { InvestorSectionCard } from "../memo/InvestorSectionCard";

interface MemoSection {
  title: string;
  content: string;
}

interface QuickFacts {
  headquarters: string;
  founded: string;
  employees: string;
  funding_raised: string;
  current_raise: string;
  key_metrics: string[];
}

interface Concern {
  category: string;
  text: string;
  severity: 'critical' | 'warning' | 'minor';
}

interface Strength {
  category: string;
  text: string;
}

interface QuickAnalysis {
  overall_score: number;
  readiness_level: 'LOW' | 'MEDIUM' | 'HIGH';
  one_liner_verdict: string;
  section_scores: {
    team: number;
    market: number;
    traction: number;
    product: number;
    business_model: number;
    competition: number;
  };
}

interface MatchingSignals {
  stage: string;
  sector: string;
  secondary_sectors?: string[];
  keywords?: string[];
  ask_amount?: number;
  has_revenue?: boolean;
  has_customers?: boolean;
  geography?: string;
}

interface ParsedMemo {
  company_name: string;
  tagline: string;
  stage: string;
  sector: string;
  quick_analysis?: QuickAnalysis;
  concerns?: Concern[];
  strengths?: Strength[];
  matching_signals?: MatchingSignals;
  sections: {
    executive_summary: MemoSection;
    problem: MemoSection;
    solution: MemoSection;
    market: MemoSection;
    business_model: MemoSection;
    traction: MemoSection;
    competition: MemoSection;
    team: MemoSection;
    financials: MemoSection;
    risks: MemoSection;
    recommendation: MemoSection;
  };
  quick_facts: QuickFacts;
}

// Processing steps for animated loading
const PROCESSING_STEPS = [
  { id: 'convert', label: 'Converting PDF...', icon: FileText },
  { id: 'extract', label: 'Extracting data...', icon: FileSearch },
  { id: 'analyze', label: 'Analyzing investment potential...', icon: Sparkles },
  { id: 'match', label: 'Calculating match score...', icon: LayoutGrid },
];

const UploadDeckView = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedMemo, setParsedMemo] = useState<ParsedMemo | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["executive_summary"]));
  const [isSavingToDealflow, setIsSavingToDealflow] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      handleFileUpload(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };


  const handleFileUpload = async (file: File) => {
    // Check file size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 15MB",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    setIsProcessing(true);
    setProcessingStep(0);

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to upload decks");
      }

      setProcessingStep(0); // Converting PDF
      
      // Convert PDF to images client-side.
      // Speed optimization: fewer pages + smaller images are usually enough for an investor snapshot.
      const result = await convertPDFToImages(file, undefined, {
        maxPages: 6,
        maxDimension: 1200,
        quality: 0.65,
      });

      if (result.images.length === 0) {
        throw new Error("Could not extract any pages from the PDF");
      }

      setProcessingStep(1); // Extracting data

      // Convert blobs to base64 data URLs
      const imageDataUrls: string[] = await Promise.all(
        result.images.map(blob => new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }))
      );

      setProcessingStep(2); // Analyzing investment potential

      // Call the edge function with image URLs instead of PDF
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-investor-memo`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            imageUrls: imageDataUrls,
            fileName: file.name,
          }),
        }
      );

      setProcessingStep(3); // Calculating match score

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate memo");
      }

      const data = await response.json();
      
      if (data.success && data.memo) {
        setParsedMemo(data.memo);
        toast({ 
          title: "Memo generated successfully!",
          description: `Analyzed in ${Math.round(data.processingTime / 1000)}s`
        });
      } else {
        throw new Error("Invalid response from memo generator");
      }

    } catch (error) {
      console.error("Error processing deck:", error);
      toast({
        title: "Failed to analyze deck",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      setUploadedFile(null);
    } finally {
      setIsProcessing(false);
      setProcessingStep(0);
    }
  };

  const handleSaveToDealflow = async () => {
    if (!parsedMemo) return;

    setIsSavingToDealflow(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1) Persist the deck snapshot as an investor-owned record
      const { data: deckCompany, error: deckCompanyError } = await supabase
        .from("investor_deck_companies")
        // Supabase TS typings often model insert as array-only; insert a single row as a 1-item array.
        .insert([
          {
            investor_id: user.id,
            name: parsedMemo.company_name || "Unknown",
            stage: parsedMemo.stage || "Seed",
            // One-liner shown on dealflow cards
            description: parsedMemo.tagline || parsedMemo.sections?.executive_summary?.content || null,
            category: parsedMemo.sector || null,
            memo_json: parsedMemo as any,
          } as any,
        ])
        .select("id")
        .single();

      if (deckCompanyError) throw deckCompanyError;
      if (!deckCompany?.id) throw new Error("Failed to create deck company");

      // 2) Add to dealflow
      const { error: dealflowError } = await supabase.from("investor_dealflow").insert({
        investor_id: user.id,
        deck_company_id: deckCompany.id,
        company_id: null,
        source: "deck_upload",
        status: "reviewing",
      } as any);

      if (dealflowError) throw dealflowError;

      toast({
        title: "Added to dealflow",
        description: "Saved as a deal with the memo snapshot.",
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save",
        variant: "destructive",
      });
    } finally {
      setIsSavingToDealflow(false);
    }
  };

  const handleShare = () => {
    toast({
      title: "Coming Soon",
      description: "Share feature will be available soon",
    });
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setParsedMemo(null);
    setExpandedSections(new Set(["executive_summary"]));
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionKey)) {
        newSet.delete(sectionKey);
      } else {
        newSet.add(sectionKey);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    if (parsedMemo) {
      setExpandedSections(new Set(Object.keys(parsedMemo.sections)));
    }
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  const getSectionIcon = (key: string) => {
    switch (key) {
      case "executive_summary": return <FileText className="w-4 h-4" />;
      case "problem": return <AlertTriangle className="w-4 h-4" />;
      case "solution": return <Sparkles className="w-4 h-4" />;
      case "market": return <LayoutGrid className="w-4 h-4" />;
      case "business_model": return <FileSearch className="w-4 h-4" />;
      case "traction": return <CheckCircle2 className="w-4 h-4" />;
      case "competition": return <AlertTriangle className="w-4 h-4" />;
      case "team": return <FileText className="w-4 h-4" />;
      case "financials": return <FileSearch className="w-4 h-4" />;
      case "risks": return <AlertTriangle className="w-4 h-4" />;
      case "recommendation": return <CheckCircle2 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getSectionVariant = (key: string): 'default' | 'success' | 'warning' | 'danger' => {
    if (key === "recommendation") return 'success';
    if (key === "risks") return 'warning';
    return 'default';
  };

  const getSectionScore = (key: string): number | undefined => {
    if (!parsedMemo?.quick_analysis?.section_scores) return undefined;
    
    const scoreMap: Record<string, keyof typeof parsedMemo.quick_analysis.section_scores> = {
      team: 'team',
      market: 'market',
      traction: 'traction',
      solution: 'product',
      business_model: 'business_model',
      competition: 'competition',
      problem: 'market', // Use market as proxy for problem
    };
    
    const scoreKey = scoreMap[key];
    return scoreKey ? parsedMemo.quick_analysis.section_scores[scoreKey] : undefined;
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="p-5 border-b border-border/30 bg-gradient-to-r from-card/80 to-card/40 backdrop-blur-sm">
        <h2 className="text-xl font-bold tracking-tight">Upload Deck</h2>
        <p className="text-sm text-muted-foreground/80 mt-1">
          Upload a pitch deck and get a fast investor snapshot (not a full diligence memo)
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {!uploadedFile ? (
          /* Upload Zone */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`h-full min-h-[400px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${
              isDragging
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-border hover:border-primary/50 hover:bg-muted/20"
            }`}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 shadow-lg shadow-primary/10">
              <FileUp className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Drop your pitch deck here</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md px-4">
              Upload a PDF pitch deck and our AI will generate a lightweight snapshot: what it is, why it might win, biggest risks, and a quick score.
            </p>
            <label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button asChild size="lg" className="gap-2 cursor-pointer shadow-lg shadow-primary/20">
                <span>
                  <Upload className="w-5 h-5" />
                  Select PDF File
                </span>
              </Button>
            </label>
            <p className="text-xs text-muted-foreground mt-4">Supports PDF files up to 15MB</p>
          </div>
        ) : isProcessing ? (
          /* Enhanced Processing State */
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mb-8 animate-pulse">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              </div>
              <div className="absolute -inset-4 rounded-full border-2 border-primary/20 animate-ping" />
            </div>
            
            <h3 className="text-xl font-semibold mb-4">Generating Investment Memo...</h3>
            
            {/* Processing Steps */}
            <div className="space-y-3 mb-6">
              {PROCESSING_STEPS.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === processingStep;
                const isComplete = index < processingStep;
                
                return (
                  <div 
                    key={step.id}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : isComplete 
                          ? 'text-green-400' 
                          : 'text-muted-foreground'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <StepIcon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                    )}
                    <span className="text-sm font-medium">{step.label}</span>
                  </div>
                );
              })}
            </div>
            
            <p className="text-xs text-muted-foreground text-center max-w-sm">
              This is optimized for speed (typically 10-25 seconds). Larger decks can take longer.
            </p>
            
            <div className="flex items-center gap-2 mt-6 px-4 py-2 rounded-lg bg-muted/30">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{uploadedFile.name}</span>
            </div>
          </div>
        ) : parsedMemo ? (
          /* Enhanced Parsed Memo */
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header with Score Ring */}
            <InvestorMemoHeader
              companyName={parsedMemo.company_name}
              tagline={parsedMemo.tagline}
              stage={parsedMemo.stage}
              sector={parsedMemo.sector}
              quickAnalysis={parsedMemo.quick_analysis}
              onSaveToDealflow={handleSaveToDealflow}
              onShare={handleShare}
              onUploadAnother={resetUpload}
              isSaving={isSavingToDealflow}
            />

            {/* Quick Take: Concerns & Strengths */}
            {(parsedMemo.concerns || parsedMemo.strengths) && (
              <InvestorQuickTake
                concerns={parsedMemo.concerns || []}
                strengths={parsedMemo.strengths || []}
              />
            )}

            {/* Analysis Grid: Radar + Match Card */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {parsedMemo.quick_analysis?.section_scores && (
                <InvestorMiniRadar 
                  sectionScores={parsedMemo.quick_analysis.section_scores}
                />
              )}
              
              {parsedMemo.matching_signals && (
                <InvestorMatchCard
                  matchingSignals={parsedMemo.matching_signals}
                />
              )}
            </div>

            {/* Quick Facts */}
            {parsedMemo.quick_facts && (
              <InvestorQuickFacts quickFacts={parsedMemo.quick_facts} />
            )}

            {/* Expand/Collapse Controls */}
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h3 className="text-lg font-semibold text-foreground">Detailed Analysis</h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={expandAll}>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Expand All
                </Button>
                <Button variant="ghost" size="sm" onClick={collapseAll}>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Collapse All
                </Button>
              </div>
            </div>

            {/* Memo Sections */}
            <div className="space-y-3">
              {Object.entries(parsedMemo.sections).map(([key, section]) => (
                <InvestorSectionCard
                  key={key}
                  title={section.title}
                  content={section.content}
                  icon={getSectionIcon(key)}
                  score={getSectionScore(key)}
                  isExpanded={expandedSections.has(key)}
                  onToggle={() => toggleSection(key)}
                  variant={getSectionVariant(key)}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="text-center py-6 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-3">
                Generated by AI • Review and verify all information before making investment decisions
              </p>
              <Button variant="outline" onClick={resetUpload} className="gap-2">
                <Upload className="w-4 h-4" />
                Analyze Another Deck
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default UploadDeckView;
