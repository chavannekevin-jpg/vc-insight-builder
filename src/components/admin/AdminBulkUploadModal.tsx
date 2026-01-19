import { useState, useCallback } from "react";
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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ParsedContact {
  name: string;
  organization_name: string | null;
  entity_type: "investor" | "fund";
  city: string | null;
  country: string | null;
  city_lat: number | null;
  city_lng: number | null;
  email: string | null;
  linkedin_url: string | null;
  stages: string[];
  investment_focus: string[];
  ticket_size_min: number | null;
  ticket_size_max: number | null;
  fund_size: number | null;
  thesis_keywords: string[];
  notable_investments: string[];
}

interface AdminBulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminBulkUploadModal({
  isOpen,
  onClose,
  onSuccess,
}: AdminBulkUploadModalProps) {
  const [importMode, setImportMode] = useState<"file" | "screenshot">("file");
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedContacts, setParsedContacts] = useState<ParsedContact[]>([]);
  const [step, setStep] = useState<"upload" | "review" | "importing">("upload");
  const [importProgress, setImportProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const resetState = () => {
    setParsedContacts([]);
    setStep("upload");
    setImportProgress(0);
    setIsProcessing(false);
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
        setStep("review");
        toast({
          title: `Parsed ${formattedContacts.length} contacts`,
          description: "Review them before importing",
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
        setStep("review");
        toast({
          title: `Parsed ${formattedContacts.length} contacts`,
          description: "Review them before importing",
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
    [importMode]
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

  const handleImport = async () => {
    if (parsedContacts.length === 0) return;
    
    setStep("importing");
    setImportProgress(0);
    
    try {
      let successCount = 0;
      
      for (let i = 0; i < parsedContacts.length; i++) {
        const contact = parsedContacts[i];
        
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
          contributor_count: 1, // Admin upload counts as 1 contributor
        });
        
        if (!error) {
          successCount++;
        } else {
          console.error(`Failed to insert contact ${contact.name}:`, error);
        }
        
        setImportProgress(Math.round(((i + 1) / parsedContacts.length) * 100));
      }
      
      toast({
        title: "Import complete",
        description: `Successfully added ${successCount} of ${parsedContacts.length} contacts to the network`,
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

  const formatTicketSize = (min: number | null, max: number | null) => {
    if (!min && !max) return null;
    const format = (n: number) => (n >= 1000 ? `${n / 1000}M` : `${n}K`);
    if (min && max) return `€${format(min)} - €${format(max)}`;
    if (min) return `€${format(min)}+`;
    if (max) return `Up to €${format(max)}`;
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Bulk Upload Investors to Network
          </DialogTitle>
          <DialogDescription>
            Upload a CSV/Excel file or screenshot to populate the global VC network database
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
          </div>
        )}

        {step === "review" && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="font-medium">{parsedContacts.length} contacts parsed</span>
              </div>
              <Button variant="ghost" size="sm" onClick={resetState}>
                <X className="w-4 h-4 mr-1" />
                Start Over
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto border border-border/50 rounded-lg">
              <div className="divide-y divide-border/50">
                {parsedContacts.map((contact, idx) => (
                  <div key={idx} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium truncate">
                            {contact.organization_name || contact.name}
                          </span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {contact.entity_type}
                          </Badge>
                        </div>
                        
                        {(contact.city || contact.country) && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                            <MapPin className="w-3 h-3" />
                            {[contact.city, contact.country].filter(Boolean).join(", ")}
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {contact.stages.slice(0, 3).map((stage) => (
                            <Badge key={stage} variant="secondary" className="text-xs">
                              {stage}
                            </Badge>
                          ))}
                          {contact.stages.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{contact.stages.length - 3}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5">
                          {contact.investment_focus.slice(0, 3).map((focus) => (
                            <Badge key={focus} variant="outline" className="text-xs">
                              {focus}
                            </Badge>
                          ))}
                          {contact.investment_focus.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{contact.investment_focus.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right text-sm flex-shrink-0">
                        {formatTicketSize(contact.ticket_size_min, contact.ticket_size_max) && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <DollarSign className="w-3 h-3" />
                            {formatTicketSize(contact.ticket_size_min, contact.ticket_size_max)}
                          </div>
                        )}
                        {contact.fund_size && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Target className="w-3 h-3" />
                            €{contact.fund_size >= 1000 ? `${contact.fund_size / 1000}B` : `${contact.fund_size}M`}
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
              <Button onClick={handleImport} className="gap-2">
                <Upload className="w-4 h-4" />
                Import {parsedContacts.length} Contacts
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
  );
}
