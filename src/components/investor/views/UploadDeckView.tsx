import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, Upload, FileText, Loader2, ExternalLink, ChevronDown, ChevronUp, Building2, Calendar, Users, DollarSign, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

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

interface ParsedMemo {
  company_name: string;
  tagline: string;
  stage: string;
  sector: string;
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

const UploadDeckView = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedMemo, setParsedMemo] = useState<ParsedMemo | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["executive_summary"]));

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

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix to get just the base64 string
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
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
    setProcessingStatus("Preparing deck for analysis...");

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to upload decks");
      }

      setProcessingStatus("Uploading and analyzing deck with AI...");
      
      // Convert file to base64
      const fileBase64 = await fileToBase64(file);

      // Call the edge function to generate the memo
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-investor-memo`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            fileBase64,
            fileName: file.name,
            fileType: file.type,
          }),
        }
      );

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
      setProcessingStatus("");
    }
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

  const getStageBadgeColor = (stage: string) => {
    switch (stage?.toLowerCase()) {
      case "pre-seed": return "bg-purple-500/20 text-purple-600 border-purple-500/30";
      case "seed": return "bg-green-500/20 text-green-600 border-green-500/30";
      case "series a": return "bg-blue-500/20 text-blue-600 border-blue-500/30";
      case "series b": return "bg-orange-500/20 text-orange-600 border-orange-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="p-5 border-b border-border/30 bg-gradient-to-r from-card/80 to-card/40 backdrop-blur-sm">
        <h2 className="text-xl font-bold tracking-tight">Upload Deck</h2>
        <p className="text-sm text-muted-foreground/80 mt-1">
          Upload a pitch deck and get an instant AI-generated investment memo
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
            className={`h-full min-h-[400px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Drop your pitch deck here</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-sm">
              Upload a PDF pitch deck and our AI will generate a comprehensive VC-style investment memo
            </p>
            <label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button asChild className="gap-2 cursor-pointer">
                <span>
                  <Upload className="w-4 h-4" />
                  Select File
                </span>
              </Button>
            </label>
            <p className="text-xs text-muted-foreground mt-4">Supports PDF files up to 15MB</p>
          </div>
        ) : isProcessing ? (
          /* Processing State */
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <h3 className="text-lg font-semibold mb-2">Generating Investment Memo...</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-2">
              {processingStatus}
            </p>
            <p className="text-xs text-muted-foreground text-center max-w-sm">
              This may take 30-60 seconds for detailed analysis
            </p>
            <div className="flex items-center gap-2 mt-6 text-sm text-muted-foreground">
              <FileText className="w-4 h-4" />
              {uploadedFile.name}
            </div>
          </div>
        ) : parsedMemo ? (
          /* Parsed Memo */
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold">{parsedMemo.company_name}</h3>
                    <Badge variant="outline" className={getStageBadgeColor(parsedMemo.stage)}>
                      {parsedMemo.stage}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">{parsedMemo.tagline}</p>
                  <Badge variant="secondary">{parsedMemo.sector}</Badge>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={resetUpload}>
                    Upload Another
                  </Button>
                  <Button size="sm" className="gap-1.5">
                    <ExternalLink className="w-4 h-4" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Quick Facts */}
              {parsedMemo.quick_facts && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-border">
                  <QuickFactItem 
                    icon={Building2} 
                    label="HQ" 
                    value={parsedMemo.quick_facts.headquarters} 
                  />
                  <QuickFactItem 
                    icon={Calendar} 
                    label="Founded" 
                    value={parsedMemo.quick_facts.founded} 
                  />
                  <QuickFactItem 
                    icon={Users} 
                    label="Team" 
                    value={parsedMemo.quick_facts.employees} 
                  />
                  <QuickFactItem 
                    icon={DollarSign} 
                    label="Raised" 
                    value={parsedMemo.quick_facts.funding_raised} 
                  />
                  <QuickFactItem 
                    icon={TrendingUp} 
                    label="Raising" 
                    value={parsedMemo.quick_facts.current_raise} 
                  />
                </div>
              )}

              {/* Key Metrics */}
              {parsedMemo.quick_facts?.key_metrics && parsedMemo.quick_facts.key_metrics.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {parsedMemo.quick_facts.key_metrics.map((metric, i) => (
                    <Badge key={i} variant="outline" className="bg-primary/5">
                      {metric}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Expand/Collapse Controls */}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={expandAll}>
                Expand All
              </Button>
              <Button variant="ghost" size="sm" onClick={collapseAll}>
                Collapse All
              </Button>
            </div>

            {/* Memo Sections */}
            <div className="space-y-3">
              {Object.entries(parsedMemo.sections).map(([key, section]) => (
                <MemoSectionCard
                  key={key}
                  sectionKey={key}
                  section={section}
                  isExpanded={expandedSections.has(key)}
                  onToggle={() => toggleSection(key)}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground py-4">
              Generated by AI • Review and verify all information before making investment decisions
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const QuickFactItem = ({ 
  icon: Icon, 
  label, 
  value 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string;
}) => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-muted-foreground" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium truncate">{value || "Unknown"}</p>
    </div>
  </div>
);

const MemoSectionCard = ({ 
  sectionKey,
  section, 
  isExpanded, 
  onToggle 
}: { 
  sectionKey: string;
  section: MemoSection; 
  isExpanded: boolean; 
  onToggle: () => void;
}) => {
  const getSectionIcon = (key: string) => {
    switch (key) {
      case "executive_summary": return "📋";
      case "problem": return "🎯";
      case "solution": return "💡";
      case "market": return "📊";
      case "business_model": return "💰";
      case "traction": return "📈";
      case "competition": return "⚔️";
      case "team": return "👥";
      case "financials": return "💵";
      case "risks": return "⚠️";
      case "recommendation": return "✅";
      default: return "📌";
    }
  };

  const getSectionStyle = (key: string) => {
    if (key === "recommendation") {
      return "bg-primary/5 border-primary/20";
    }
    if (key === "risks") {
      return "bg-yellow-500/5 border-yellow-500/20";
    }
    return "bg-card border-border";
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div className={`border rounded-xl overflow-hidden ${getSectionStyle(sectionKey)}`}>
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors text-left">
            <div className="flex items-center gap-3">
              <span className="text-xl">{getSectionIcon(sectionKey)}</span>
              <h4 className="font-semibold">{section.title}</h4>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-0">
            <div className="prose prose-sm max-w-none text-muted-foreground">
              {section.content.split('\n\n').map((paragraph, i) => (
                <p key={i} className="mb-3 last:mb-0 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default UploadDeckView;
