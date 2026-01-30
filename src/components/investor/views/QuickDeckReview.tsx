import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
  FileUp, 
  Upload, 
  FileText, 
  Loader2, 
  FileSearch,
  Sparkles,
  CheckCircle2,
  LayoutGrid,
  Eye,
  ArrowLeft
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { convertPDFToImages } from "@/lib/pdfToImages";
import { InvestorSnapshotModal } from "../snapshot/InvestorSnapshotModal";
import type { InvestorSnapshot } from "@/types/investorSnapshot";

// Processing steps for animated loading
const PROCESSING_STEPS = [
  { id: 'convert', label: 'Converting PDF...', icon: FileText },
  { id: 'extract', label: 'Extracting data...', icon: FileSearch },
  { id: 'analyze', label: 'Analyzing investment potential...', icon: Sparkles },
  { id: 'match', label: 'Calculating match score...', icon: LayoutGrid },
];

interface QuickDeckReviewProps {
  onBack: () => void;
}

export function QuickDeckReview({ onBack }: QuickDeckReviewProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [snapshot, setSnapshot] = useState<InvestorSnapshot | null>(null);
  const [isSnapshotOpen, setIsSnapshotOpen] = useState(false);
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
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-investor-snapshot`,
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
      
      if (data.success && data.snapshot) {
        setSnapshot(data.snapshot as InvestorSnapshot);
        setIsSnapshotOpen(true);
        toast({ 
          title: "Snapshot ready",
          description: "Your quick debrief is ready to review."
        });
      } else {
        throw new Error("Invalid response from snapshot generator");
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
    if (!snapshot) return;

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
            name: snapshot.company_name || "Unknown",
            stage: snapshot.tags?.stage || "Seed",
            // One-liner shown on dealflow cards
            description: snapshot.tagline || snapshot.debrief || null,
            category: snapshot.tags?.sector || null,
            memo_json: snapshot as any,
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
        description: "Saved as a deal with the snapshot.",
      });

      setIsSnapshotOpen(false);
      
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

  const resetUpload = () => {
    setUploadedFile(null);
    setSnapshot(null);
    setIsSnapshotOpen(false);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <InvestorSnapshotModal
        isOpen={isSnapshotOpen}
        onClose={() => setIsSnapshotOpen(false)}
        snapshot={snapshot}
        onSave={handleSaveToDealflow}
        onUploadAnother={resetUpload}
        isSaving={isSavingToDealflow}
      />

      {/* Header */}
      <div className="p-5 border-b border-border/30 bg-gradient-to-r from-card/80 to-card/40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} disabled={isProcessing}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Quick Deck Review</h2>
            <p className="text-sm text-muted-foreground/80 mt-0.5">
              Upload a pitch deck and get a fast snapshot analysis.
            </p>
          </div>
        </div>
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
            
            <h3 className="text-xl font-semibold mb-4">Generating snapshot…</h3>
            
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
                          ? 'text-green-500' 
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
        ) : snapshot ? (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Snapshot ready</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {snapshot.company_name} — {snapshot.tagline}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsSnapshotOpen(true)}>
                  <Eye className="w-4 h-4" />
                  View
                </Button>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => setIsSnapshotOpen(true)} className="flex-1">
                  Open snapshot
                </Button>
                <Button variant="outline" onClick={resetUpload} className="flex-1">
                  Upload another
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Generated by AI • Verify details before making decisions.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
