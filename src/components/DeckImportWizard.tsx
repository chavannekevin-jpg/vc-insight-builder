import { useState } from 'react';
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
  FileText
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

// Labels matching the ACTUAL questionnaire keys
const SECTION_LABELS: Record<string, { label: string; section: string }> = {
  problem_description: { label: "What Makes People Suffer?", section: "Problem" },
  problem_validation: { label: "How Do You Know This Hurts?", section: "Problem" },
  solution_description: { label: "Your Killer Solution", section: "Solution" },
  solution_demo: { label: "Show, Don't Tell", section: "Solution" },
  market_size: { label: "How Big Is This Thing?", section: "Market" },
  market_timing: { label: "Why Now?", section: "Market" },
  target_customer: { label: "Who Pays You?", section: "Market" },
  competitors: { label: "Who Else Wants This?", section: "Competition" },
  competitive_advantage: { label: "Your Competitive Edge", section: "Competition" },
  founder_background: { label: "Why You?", section: "Team" },
  team_composition: { label: "The Band", section: "Team" },
  revenue_model: { label: "Show Me The Money", section: "Business Model" },
  unit_economics: { label: "The Math", section: "Business Model" },
  current_traction: { label: "Proof of Life", section: "Traction" },
  key_milestones: { label: "What's Next?", section: "Traction" },
};

// Confidence threshold for pre-filling
const CONFIDENCE_THRESHOLD = 0.6;

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
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const [highConfidenceCount, setHighConfidenceCount] = useState(0);

  const resetWizard = () => {
    setStep('upload');
    setSelectedFile(null);
    setIsProcessing(false);
    setProcessingProgress(0);
    setExtractedData(null);
    setEditingSection(null);
    setEditedContent({});
    setHighConfidenceCount(0);
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
  };

  const processUpload = async () => {
    if (!selectedFile) return;

    setStep('processing');
    setIsProcessing(true);
    setProcessingProgress(10);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      setProcessingProgress(20);

      // Upload file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pitch-decks')
        .upload(fileName, selectedFile);

      if (uploadError) {
        throw new Error('Failed to upload file: ' + uploadError.message);
      }

      setProcessingProgress(40);

      // Get signed URL for the uploaded file
      const { data: urlData } = await supabase.storage
        .from('pitch-decks')
        .createSignedUrl(fileName, 3600); // 1 hour expiry

      if (!urlData?.signedUrl) {
        throw new Error('Failed to get file URL');
      }

      setProcessingProgress(50);

      // Call the parse function
      const { data: parseResult, error: parseError } = await supabase.functions.invoke('parse-pitch-deck', {
        body: {
          deckUrl: urlData.signedUrl,
          companyName,
          companyDescription
        }
      });

      if (parseError) {
        throw new Error('Failed to analyze deck: ' + parseError.message);
      }

      setProcessingProgress(90);

      if (parseResult?.data) {
        setExtractedData(parseResult.data);
        setHighConfidenceCount(parseResult.highConfidenceCount || 0);
        setStep('review');
      } else {
        throw new Error('No data extracted from deck');
      }

      setProcessingProgress(100);

    } catch (error) {
      console.error('Deck processing error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process deck');
      setStep('upload');
    } finally {
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

    onImportComplete(finalData);
    setStep('complete');
    
    setTimeout(() => {
      onOpenChange(false);
      resetWizard();
    }, 1500);
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
                <p className="font-medium">Analyzing your pitch deck...</p>
                <p className="text-sm text-muted-foreground">
                  Our AI is extracting company information and questionnaire answers
                </p>
              </div>

              <Progress value={processingProgress} className="w-64" />
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
              <p className="text-sm text-muted-foreground">Your profile and questionnaire have been updated</p>
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
