import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  FileSpreadsheet,
  Camera,
  Loader2,
  Check,
  X,
  AlertCircle,
  Building2,
  MapPin,
  DollarSign,
  Target,
  Merge,
  Shield,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  ParsedContact,
  ExistingContact,
  DeduplicationSummary,
  deduplicateContacts,
  getDeduplicationSummary,
} from "@/lib/fundDeduplication";
import { DuplicateReviewModal } from "./DuplicateReviewModal";

interface AdminBulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ImportStep = "upload" | "analyzing" | "review" | "dedup_review" | "importing";

export function AdminBulkUploadModal({
  isOpen,
  onClose,
  onSuccess,
}: AdminBulkUploadModalProps) {
  const [importMode, setImportMode] = useState<"file" | "screenshot">("file");
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedContacts, setParsedContacts] = useState<ParsedContact[]>([]);
  const [step, setStep] = useState<ImportStep>("upload");
  const [importProgress, setImportProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  
  // Deduplication state
  const [existingContacts, setExistingContacts] = useState<ExistingContact[]>([]);
  const [dedupSummary, setDedupSummary] = useState<DeduplicationSummary | null>(null);
  const [showDedupModal, setShowDedupModal] = useState(false);

  // Fetch existing contacts when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchExistingContacts();
    }
  }, [isOpen]);

  const fetchExistingContacts = async () => {
    try {
      const { data, error } = await supabase
        .from("global_contacts")
        .select("id, name, organization_name, entity_type, city, country, city_lat, city_lng, email, linkedin_url, stages, investment_focus, ticket_size_min, ticket_size_max, fund_size, thesis_keywords, notable_investments, contributor_count")
        .limit(5000); // Get a good sample for matching

      if (error) throw error;
      
      const mapped: ExistingContact[] = (data || []).map(c => ({
        id: c.id,
        name: c.name || '',
        organization_name: c.organization_name || null,
        entity_type: (c.entity_type as "investor" | "fund") || "fund",
        city: c.city || null,
        country: c.country || null,
        city_lat: c.city_lat || null,
        city_lng: c.city_lng || null,
        email: c.email || null,
        linkedin_url: c.linkedin_url || null,
        stages: Array.isArray(c.stages) ? c.stages as string[] : [],
        investment_focus: Array.isArray(c.investment_focus) ? c.investment_focus as string[] : [],
        ticket_size_min: c.ticket_size_min || null,
        ticket_size_max: c.ticket_size_max || null,
        fund_size: c.fund_size || null,
        thesis_keywords: Array.isArray(c.thesis_keywords) ? c.thesis_keywords as string[] : [],
        notable_investments: Array.isArray(c.notable_investments) ? c.notable_investments as string[] : [],
        contributor_count: c.contributor_count || 1,
      }));
      
      setExistingContacts(mapped);
    } catch (error) {
      console.error("Error fetching existing contacts:", error);
    }
  };

  const resetState = () => {
    setParsedContacts([]);
    setStep("upload");
    setImportProgress(0);
    setIsProcessing(false);
    setDedupSummary(null);
    setShowDedupModal(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(",")[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke("parse-contacts-file", {
        body: {
          fileBase64: base64,
          fileName: file.name,
          fileType: file.type,
        },
      });

      if (error) throw error;

      if (data.contacts && Array.isArray(data.contacts)) {
        const formattedContacts: ParsedContact[] = data.contacts.map((c: any) => ({
          name: c.name || c.organization_name || "Unknown",
          organization_name: c.organization_name || null,
          entity_type: c.entity_type === "fund" ? "fund" : "investor",
          city: c.city || null,
          country: c.country || null,
          city_lat: c.city_lat || null,
          city_lng: c.city_lng || null,
          email: c.email || null,
          linkedin_url: c.linkedin_url || null,
          stages: Array.isArray(c.stages) ? c.stages : [],
          investment_focus: Array.isArray(c.investment_focus) ? c.investment_focus : [],
          ticket_size_min: c.ticket_size_min || null,
          ticket_size_max: c.ticket_size_max || null,
          fund_size: c.fund_size || null,
          thesis_keywords: Array.isArray(c.thesis_keywords) ? c.thesis_keywords : [],
          notable_investments: Array.isArray(c.notable_investments) ? c.notable_investments : [],
        }));

        setParsedContacts(formattedContacts);
        
        // Run deduplication
        setStep("analyzing");
        const summary = deduplicateContacts(formattedContacts, existingContacts);
        setDedupSummary(summary);
        
        // If there are merge candidates or duplicates, show dedup review
        if (summary.mergeCandidates.length > 0 || summary.exactDuplicates.length > 0) {
          setShowDedupModal(true);
          setStep("dedup_review");
        } else {
          setStep("review");
        }
        
        toast({
          title: `Parsed ${formattedContacts.length} contacts`,
          description: getDeduplicationSummary(summary),
        });
      }
    } catch (error: any) {
      console.error("Error processing file:", error);
      toast({
        title: "Error processing file",
        description: error.message || "Failed to parse the file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const processScreenshot = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(",")[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke("parse-contacts-screenshot", {
        body: {
          imageBase64: base64,
          mimeType: file.type,
        },
      });

      if (error) throw error;

      if (data.contacts && Array.isArray(data.contacts)) {
        const formattedContacts: ParsedContact[] = data.contacts.map((c: any) => ({
          name: c.name || c.organization_name || "Unknown",
          organization_name: c.organization_name || null,
          entity_type: c.entity_type === "fund" ? "fund" : "investor",
          city: c.city || null,
          country: c.country || null,
          city_lat: null,
          city_lng: null,
          email: c.email || null,
          linkedin_url: c.linkedin_url || null,
          stages: Array.isArray(c.stages) ? c.stages : [],
          investment_focus: Array.isArray(c.investment_focus) ? c.investment_focus : [],
          ticket_size_min: c.ticket_size_min || null,
          ticket_size_max: c.ticket_size_max || null,
          fund_size: c.fund_size || null,
          thesis_keywords: Array.isArray(c.thesis_keywords) ? c.thesis_keywords : [],
          notable_investments: Array.isArray(c.notable_investments) ? c.notable_investments : [],
        }));

        setParsedContacts(formattedContacts);
        
        // Run deduplication
        setStep("analyzing");
        const summary = deduplicateContacts(formattedContacts, existingContacts);
        setDedupSummary(summary);
        
        // If there are merge candidates or duplicates, show dedup review
        if (summary.mergeCandidates.length > 0 || summary.exactDuplicates.length > 0) {
          setShowDedupModal(true);
          setStep("dedup_review");
        } else {
          setStep("review");
        }
        
        toast({
          title: `Parsed ${formattedContacts.length} contacts`,
          description: getDeduplicationSummary(summary),
        });
      }
    } catch (error: any) {
      console.error("Error processing screenshot:", error);
      toast({
        title: "Error processing screenshot",
        description: error.message || "Failed to parse the image",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        if (importMode === "file") {
          processFile(file);
        } else {
          processScreenshot(file);
        }
      }
    },
    [importMode, existingContacts]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (importMode === "file") {
        processFile(file);
      } else {
        processScreenshot(file);
      }
    }
  };

  const handleDedupConfirm = async (
    toCreate: ParsedContact[],
    toUpdate: { id: string; data: ParsedContact }[]
  ) => {
    setShowDedupModal(false);
    setStep("importing");
    setImportProgress(0);
    
    const totalOperations = toCreate.length + toUpdate.length;
    let completed = 0;
    let successCount = 0;
    let mergeCount = 0;

    try {
      // Insert new contacts
      for (const contact of toCreate) {
        const { error } = await supabase.from("global_contacts").insert({
          name: contact.name,
          organization_name: contact.organization_name,
          entity_type: contact.entity_type,
          city: contact.city,
          country: contact.country,
          city_lat: contact.city_lat,
          city_lng: contact.city_lng,
          email: contact.email,
          linkedin_url: contact.linkedin_url,
          stages: contact.stages,
          investment_focus: contact.investment_focus,
          ticket_size_min: contact.ticket_size_min,
          ticket_size_max: contact.ticket_size_max,
          fund_size: contact.fund_size,
          thesis_keywords: contact.thesis_keywords,
          notable_investments: contact.notable_investments,
          contributor_count: 1,
        });
        
        if (!error) successCount++;
        completed++;
        setImportProgress(Math.round((completed / totalOperations) * 100));
      }

      // Update/merge existing contacts
      for (const { id, data } of toUpdate) {
        // Get current contributor count
        const { data: existing } = await supabase
          .from("global_contacts")
          .select("contributor_count")
          .eq("id", id)
          .single();
        
        const { error } = await supabase
          .from("global_contacts")
          .update({
            name: data.name,
            organization_name: data.organization_name,
            city: data.city,
            country: data.country,
            city_lat: data.city_lat,
            city_lng: data.city_lng,
            email: data.email,
            linkedin_url: data.linkedin_url,
            stages: data.stages,
            investment_focus: data.investment_focus,
            ticket_size_min: data.ticket_size_min,
            ticket_size_max: data.ticket_size_max,
            fund_size: data.fund_size,
            thesis_keywords: data.thesis_keywords,
            notable_investments: data.notable_investments,
            contributor_count: (existing?.contributor_count || 1) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
        
        if (!error) mergeCount++;
        completed++;
        setImportProgress(Math.round((completed / totalOperations) * 100));
      }
      
      toast({
        title: "Import complete",
        description: `Added ${successCount} new contacts, merged ${mergeCount} existing records`,
      });
      
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("Import error:", error);
      toast({
        title: "Import failed",
        description: error.message || "An error occurred during import",
        variant: "destructive",
      });
      setStep("review");
    }
  };

  // Simple import without deduplication (for when no duplicates found)
  const handleSimpleImport = async () => {
    if (!dedupSummary) return;
    
    const toCreate = [
      ...dedupSummary.newContacts.map(r => r.incoming),
      ...dedupSummary.relatedContacts.map(r => r.incoming),
    ];
    
    await handleDedupConfirm(toCreate, []);
  };

  const formatTicketSize = (min: number | null, max: number | null) => {
    if (!min && !max) return null;
    const format = (n: number) => (n >= 1000 ? `${n / 1000}M` : `${n}K`);
    if (min && max) return `€${format(min)} - €${format(max)}`;
    if (min) return `€${format(min)}+`;
    if (max) return `Up to €${format(max)}`;
    return null;
  };

  return (
    <>
      <Dialog open={isOpen && !showDedupModal} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Bulk Upload Investors to Network
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              Upload a CSV/Excel file or screenshot to populate the global VC network database
              <Badge variant="secondary" className="gap-1">
                <Shield className="w-3 h-3" />
                Smart Deduplication
              </Badge>
            </DialogDescription>
          </DialogHeader>

          {step === "upload" && (
            <div className="flex-1 overflow-y-auto">
              <Tabs value={importMode} onValueChange={(v) => setImportMode(v as "file" | "screenshot")}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="file" className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    Excel / CSV
                  </TabsTrigger>
                  <TabsTrigger value="screenshot" className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Screenshot
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="file">
                  <div
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                      dragOver
                        ? "border-primary bg-primary/5"
                        : "border-border/50 hover:border-primary/50"
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    {isProcessing ? (
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-muted-foreground">Analyzing your file...</p>
                      </div>
                    ) : (
                      <>
                        <FileSpreadsheet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-lg font-medium mb-2">Drop your file here</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Supports .xlsx, .xls, .csv files with investor/fund data
                        </p>
                        <label className="cursor-pointer">
                          <Button variant="outline" asChild>
                            <span>Choose File</span>
                          </Button>
                          <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </label>
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="screenshot">
                  <div
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                      dragOver
                        ? "border-primary bg-primary/5"
                        : "border-border/50 hover:border-primary/50"
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    {isProcessing ? (
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-muted-foreground">Analyzing your screenshot...</p>
                      </div>
                    ) : (
                      <>
                        <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-lg font-medium mb-2">Drop a screenshot here</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Upload an image of a database or spreadsheet with investor/fund info
                        </p>
                        <label className="cursor-pointer">
                          <Button variant="outline" asChild>
                            <span>Choose Image</span>
                          </Button>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </label>
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border/50">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Recommended columns
                </h4>
                <p className="text-sm text-muted-foreground">
                  Fund/Organization Name, City, Country, Investment Stages, Sectors/Focus,
                  Ticket Size (min/max), Fund Size, Notable Investments
                </p>
              </div>

              {existingContacts.length > 0 && (
                <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-medium mb-1 flex items-center gap-2 text-primary">
                    <Merge className="w-4 h-4" />
                    Smart Deduplication Active
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {existingContacts.length.toLocaleString()} existing contacts loaded. 
                    Duplicates will be detected and merged automatically.
                  </p>
                </div>
              )}
            </div>
          )}

          {step === "analyzing" && (
            <div className="flex-1 flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium mb-2">Analyzing for duplicates...</p>
              <p className="text-sm text-muted-foreground">
                Comparing {parsedContacts.length} contacts against {existingContacts.length} existing records
              </p>
            </div>
          )}

          {step === "review" && dedupSummary && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="font-medium">
                    {dedupSummary.newContacts.length + dedupSummary.relatedContacts.length} contacts ready to import
                  </span>
                  {dedupSummary.exactDuplicates.length > 0 && (
                    <Badge variant="secondary">
                      {dedupSummary.exactDuplicates.length} duplicates skipped
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={resetState}>
                  <X className="w-4 h-4 mr-1" />
                  Start Over
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto border border-border/50 rounded-lg">
                <div className="divide-y divide-border/50">
                  {[...dedupSummary.newContacts, ...dedupSummary.relatedContacts].map((result, idx) => (
                    <div key={idx} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium truncate">
                              {result.incoming.organization_name || result.incoming.name}
                            </span>
                            <Badge variant="outline" className="text-xs capitalize">
                              {result.incoming.entity_type}
                            </Badge>
                            {result.matchType === 'related' && (
                              <Badge variant="secondary" className="text-xs">
                                Team member
                              </Badge>
                            )}
                          </div>
                          
                          {(result.incoming.city || result.incoming.country) && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                              <MapPin className="w-3 h-3" />
                              {[result.incoming.city, result.incoming.country].filter(Boolean).join(", ")}
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {result.incoming.stages.slice(0, 3).map((stage) => (
                              <Badge key={stage} variant="secondary" className="text-xs">
                                {stage}
                              </Badge>
                            ))}
                            {result.incoming.stages.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{result.incoming.stages.length - 3}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-1.5">
                            {result.incoming.investment_focus.slice(0, 3).map((focus) => (
                              <Badge key={focus} variant="outline" className="text-xs">
                                {focus}
                              </Badge>
                            ))}
                            {result.incoming.investment_focus.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{result.incoming.investment_focus.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right text-sm flex-shrink-0">
                          {formatTicketSize(result.incoming.ticket_size_min, result.incoming.ticket_size_max) && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <DollarSign className="w-3 h-3" />
                              {formatTicketSize(result.incoming.ticket_size_min, result.incoming.ticket_size_max)}
                            </div>
                          )}
                          {result.incoming.fund_size && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Target className="w-3 h-3" />
                              €{result.incoming.fund_size >= 1000 ? `${result.incoming.fund_size / 1000}B` : `${result.incoming.fund_size}M`}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleSimpleImport} className="gap-2">
                  <Upload className="w-4 h-4" />
                  Import {dedupSummary.newContacts.length + dedupSummary.relatedContacts.length} Contacts
                </Button>
              </div>
            </div>
          )}

          {step === "importing" && (
            <div className="flex-1 flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium mb-4">Importing contacts...</p>
              <div className="w-full max-w-xs">
                <Progress value={importProgress} className="h-2" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">{importProgress}% complete</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Deduplication Review Modal */}
      {dedupSummary && (
        <DuplicateReviewModal
          isOpen={showDedupModal}
          onClose={() => {
            setShowDedupModal(false);
            setStep("review");
          }}
          summary={dedupSummary}
          onConfirmImport={handleDedupConfirm}
        />
      )}
    </>
  );
}
