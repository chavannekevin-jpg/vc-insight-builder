import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { DeckUploader } from './DeckUploader';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Edit2, 
  ChevronRight,
  FileText,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExtractedSection {
  content: string | null;
  confidence: number;
}

export interface ExtractedData {
  companyInfo: {
    name: string | null;
    description: string | null;
    stage: string | null;
    category: string | null;
  };
  extractedSections: Record<string, ExtractedSection>;
  summary: string;
}

interface DeckImportWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId?: string;
  companyName?: string;
  companyDescription?: string;
  onImportComplete: (data: ExtractedData) => void;
}

// Labels matching the CURRENT 8-question questionnaire keys
const SECTION_LABELS: Record<string, { label: string; section: string }> = {
  problem_core: { label: "The Problem You're Solving", section: "Problem" },
  solution_core: { label: "Your Solution", section: "Solution" },
  target_customer: { label: "Who Pays You?", section: "Market" },
  competitive_moat: { label: "Your Edge & Competition", section: "Competition" },
  business_model: { label: "How You Make Money", section: "Business Model" },
  traction_proof: { label: "Proof of Progress", section: "Traction" },
  team_story: { label: "Your Team's Unfair Advantage", section: "Team" },
  vision_ask: { label: "Where You're Going", section: "Vision" },
};

// Confidence threshold for pre-filling
const CONFIDENCE_THRESHOLD = 0.6;
const PROCESSING_TIMEOUT_MS = 120000; // 2 minute timeout

type WizardStep = 'upload' | 'processing' | 'review' | 'complete';

export const DeckImportWizard = ({
  open,
  onOpenChange,
  companyId,
  companyName,
  companyDescription,
  onImportComplete
}: DeckImportWizardProps) => {
  const [step, setStep] = useState<WizardStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const [highConfidenceCount, setHighConfidenceCount] = useState(0);
  const [isCancelled, setIsCancelled] = useState(false);
  
  // Refs for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount or dialog close
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const resetWizard = () => {
    // Cancel any ongoing operations
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setStep('upload');
    setSelectedFile(null);
    setIsProcessing(false);
    setProcessingProgress(0);
    setProcessingStage('');
    setExtractedData(null);
    setEditingSection(null);
    setEditedContent({});
    setHighConfidenceCount(0);
    setIsCancelled(false);
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
  };

  const handleCancel = () => {
    console.log('[DeckImport] Cancel requested');
    setIsCancelled(true);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    toast.info('Import cancelled');
    resetWizard();
  };

  const processUpload = async () => {
    if (!selectedFile) return;

    // Reset cancelled state and create new abort controller
    setIsCancelled(false);
    abortControllerRef.current = new AbortController();
    
    setStep('processing');
    setIsProcessing(true);
    setProcessingProgress(5);
    setProcessingStage('Authenticating...');

    // Set up timeout
    timeoutRef.current = setTimeout(() => {
      console.error('[DeckImport] Processing timeout after 2 minutes');
      toast.error('Processing timed out. Try uploading a smaller file.');
      handleCancel();
    }, PROCESSING_TIMEOUT_MS);

    try {
      console.log('[DeckImport] Starting upload process for:', selectedFile.name);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }
      console.log('[DeckImport] User authenticated:', user.id);

      if (isCancelled) return;
      
      setProcessingProgress(10);
      setProcessingStage('Uploading deck...');

      // Upload file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      console.log('[DeckImport] Uploading to:', fileName);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pitch-decks')
        .upload(fileName, selectedFile);

      if (uploadError) {
        console.error('[DeckImport] Upload error:', uploadError);
        throw new Error('Failed to upload file: ' + uploadError.message);
      }
      console.log('[DeckImport] Upload successful:', uploadData);

      if (isCancelled) return;
      
      setProcessingProgress(25);
      setProcessingStage('Preparing for analysis...');

      // Get signed URL for the uploaded file
      const { data: urlData } = await supabase.storage
        .from('pitch-decks')
        .createSignedUrl(fileName, 3600); // 1 hour expiry

      if (!urlData?.signedUrl) {
        console.error('[DeckImport] Failed to get signed URL');
        throw new Error('Failed to get file URL');
      }
      console.log('[DeckImport] Got signed URL');

      if (isCancelled) return;
      
      setProcessingProgress(30);
      setProcessingStage('AI is reading your deck...');

      // Animate progress while waiting for AI
      progressIntervalRef.current = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 85) return prev;
          return prev + Math.random() * 5;
        });
      }, 2000);

      console.log('[DeckImport] Calling parse-pitch-deck function');
      
      // Call the parse function
      const { data: parseResult, error: parseError } = await supabase.functions.invoke('parse-pitch-deck', {
        body: {
          deckUrl: urlData.signedUrl,
          companyName,
          companyDescription
        }
      });

      // Clear progress interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      if (parseError) {
        console.error('[DeckImport] Parse error:', parseError);
        
        // Check for file too large error (413)
        if (parseError.message?.includes('413') || parseError.message?.includes('too large')) {
          toast.error(
            'File too large for analysis. Please compress your deck to under 8MB.',
            {
              description: 'Try ilovepdf.com/compress_pdf or smallpdf.com/compress-pdf',
              duration: 8000,
            }
          );
          throw new Error('File too large. Please compress your deck to under 8MB.');
        }
        
        throw new Error('Failed to analyze deck: ' + parseError.message);
      }
      console.log('[DeckImport] Parse result:', parseResult);

      if (isCancelled) return;
      
      setProcessingProgress(95);
      setProcessingStage('Finalizing extraction...');

      if (parseResult?.data) {
        setExtractedData(parseResult.data);
        setHighConfidenceCount(parseResult.highConfidenceCount || 0);
        setProcessingProgress(100);
        setStep('review');
        console.log('[DeckImport] Successfully extracted data');
      } else {
        throw new Error('No data extracted from deck');
      }

    } catch (error) {
      if (isCancelled) {
        console.log('[DeckImport] Operation was cancelled');
        return;
      }
      console.error('[DeckImport] Processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process deck';
      toast.error(errorMessage);
      setStep('upload');
    } finally {
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsProcessing(false);
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return <Badge variant="default" className="bg-green-500/20 text-green-600 border-green-500/30">High confidence</Badge>;
    }
    if (confidence >= CONFIDENCE_THRESHOLD) {
      return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">Good confidence</Badge>;
    }
    return <Badge variant="outline" className="text-muted-foreground">Low confidence - won't auto-fill</Badge>;
  };

  const handleSectionEdit = (key: string, value: string) => {
    setEditedContent(prev => ({ ...prev, [key]: value }));
  };

  const getSectionContent = (key: string): string => {
    if (editedContent[key] !== undefined) return editedContent[key];
    return extractedData?.extractedSections[key]?.content || '';
  };

  const handleConfirmImport = () => {
    if (!extractedData) return;

    // Merge edited content with extracted data
    const finalData: ExtractedData = {
      ...extractedData,
      extractedSections: Object.fromEntries(
        Object.entries(extractedData.extractedSections).map(([key, section]) => [
          key,
          {
            ...section,
            content: editedContent[key] !== undefined ? editedContent[key] : section.content
          }
        ])
      )
    };

    // Show completion step with smooth transition
    setStep('complete');
    
    // Wait briefly to show success, then trigger import and navigation
    setTimeout(() => {
      onImportComplete(finalData);
      // Parent will navigate, wizard will close when component unmounts
    }, 1200);
  };

  // Group sections by category for better display
  const groupedSections = extractedData 
    ? Object.entries(extractedData.extractedSections)
        .filter(([_, section]) => section.content)
        .reduce((acc, [key, section]) => {
          const sectionInfo = SECTION_LABELS[key];
          const group = sectionInfo?.section || 'Other';
          if (!acc[group]) acc[group] = [];
          acc[group].push({ key, section, label: sectionInfo?.label || key });
          return acc;
        }, {} as Record<string, Array<{ key: string; section: ExtractedSection; label: string }>>)
    : {};

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetWizard();
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Import from Pitch Deck
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Upload your pitch deck to automatically extract company information'}
            {step === 'processing' && 'Analyzing your deck with AI...'}
            {step === 'review' && `Found ${highConfidenceCount} high-confidence sections to auto-fill`}
            {step === 'complete' && 'Import complete!'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {/* Step: Upload */}
          {step === 'upload' && (
            <div className="space-y-6">
              <DeckUploader 
                onFileSelect={handleFileSelect}
                isUploading={isProcessing}
                maxSizeMB={20}
              />

              {selectedFile && (
                <div className="flex justify-end">
                  <Button onClick={processUpload} disabled={isProcessing}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze Deck
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step: Processing */}
          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-primary animate-pulse" />
                </div>
                <Loader2 className="absolute -top-2 -right-2 w-8 h-8 text-primary animate-spin" />
              </div>

              <div className="text-center space-y-2">
                <p className="font-medium">{processingStage || 'Analyzing your pitch deck...'}</p>
                <p className="text-sm text-muted-foreground">
                  This may take 30-60 seconds for larger decks
                </p>
              </div>

              <Progress value={processingProgress} className="w-64" />
              
              <p className="text-xs text-muted-foreground/60">
                {Math.round(processingProgress)}% complete
              </p>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCancel}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}

          {/* Step: Review */}
          {step === 'review' && extractedData && (
            <div className="space-y-6">
              {/* Company Info Section */}
              <div className="p-4 rounded-lg border bg-muted/30">
                <h3 className="font-semibold mb-3">Company Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Name</label>
                    <Input 
                      value={editedContent['company_name'] ?? extractedData.companyInfo.name ?? ''}
                      onChange={(e) => handleSectionEdit('company_name', e.target.value)}
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Stage</label>
                    <Input 
                      value={editedContent['company_stage'] ?? extractedData.companyInfo.stage ?? ''}
                      onChange={(e) => handleSectionEdit('company_stage', e.target.value)}
                      placeholder="Funding stage"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Category</label>
                    <Input 
                      value={editedContent['company_category'] ?? extractedData.companyInfo.category ?? ''}
                      onChange={(e) => handleSectionEdit('company_category', e.target.value)}
                      placeholder="Industry/sector"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Description</label>
                    <Input 
                      value={editedContent['company_description'] ?? extractedData.companyInfo.description ?? ''}
                      onChange={(e) => handleSectionEdit('company_description', e.target.value)}
                      placeholder="One-liner description"
                    />
                  </div>
                </div>
                {extractedData.summary && (
                  <div className="mt-4">
                    <label className="text-sm text-muted-foreground">AI Summary</label>
                    <p className="text-sm mt-1 p-2 bg-background rounded border">{extractedData.summary}</p>
                  </div>
                )}
              </div>

              {/* Extracted Sections by Group */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Extracted Questionnaire Answers</h3>
                  <Badge variant="secondary">
                    {highConfidenceCount} will be auto-filled
                  </Badge>
                </div>
                
                {Object.entries(groupedSections).map(([group, items]) => (
                  <div key={group} className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{group}</h4>
                    {items.map(({ key, section, label }) => (
                      <div 
                        key={key}
                        className={cn(
                          "p-4 rounded-lg border transition-all",
                          editingSection === key ? "border-primary" : "border-border",
                          section.confidence < CONFIDENCE_THRESHOLD && "opacity-60"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{label}</span>
                            {getConfidenceBadge(section.confidence)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingSection(editingSection === key ? null : key)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {editingSection === key ? (
                          <Textarea
                            value={getSectionContent(key)}
                            onChange={(e) => handleSectionEdit(key, e.target.value)}
                            rows={4}
                            className="mt-2"
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {getSectionContent(key)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ))}

                {Object.keys(groupedSections).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No content could be extracted from this deck.</p>
                    <p className="text-sm">Try uploading a clearer image or PDF.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step: Complete */}
          {step === 'complete' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <p className="font-medium">Import successful!</p>
              <p className="text-sm text-muted-foreground">Taking you to review your answers...</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {step === 'review' && (
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setStep('upload')}>
              Upload Different Deck
            </Button>
            <Button onClick={handleConfirmImport}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirm & Import
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
