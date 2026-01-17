import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

// Major cities for matching
const MAJOR_CITIES: Record<string, { lat: number; lng: number; country: string }> = {
  "san francisco": { lat: 37.7749, lng: -122.4194, country: "USA" },
  "new york": { lat: 40.7128, lng: -74.0060, country: "USA" },
  "london": { lat: 51.5074, lng: -0.1278, country: "UK" },
  "paris": { lat: 48.8566, lng: 2.3522, country: "France" },
  "berlin": { lat: 52.5200, lng: 13.4050, country: "Germany" },
  "singapore": { lat: 1.3521, lng: 103.8198, country: "Singapore" },
  "tokyo": { lat: 35.6762, lng: 139.6503, country: "Japan" },
  "tel aviv": { lat: 32.0853, lng: 34.7818, country: "Israel" },
  "dubai": { lat: 25.2048, lng: 55.2708, country: "UAE" },
  "sydney": { lat: -33.8688, lng: 151.2093, country: "Australia" },
  "toronto": { lat: 43.6532, lng: -79.3832, country: "Canada" },
  "boston": { lat: 42.3601, lng: -71.0589, country: "USA" },
  "los angeles": { lat: 34.0522, lng: -118.2437, country: "USA" },
  "miami": { lat: 25.7617, lng: -80.1918, country: "USA" },
  "austin": { lat: 30.2672, lng: -97.7431, country: "USA" },
  "seattle": { lat: 47.6062, lng: -122.3321, country: "USA" },
  "chicago": { lat: 41.8781, lng: -87.6298, country: "USA" },
  "amsterdam": { lat: 52.3676, lng: 4.9041, country: "Netherlands" },
  "stockholm": { lat: 59.3293, lng: 18.0686, country: "Sweden" },
  "mumbai": { lat: 19.0760, lng: 72.8777, country: "India" },
  "bangalore": { lat: 12.9716, lng: 77.5946, country: "India" },
  "hong kong": { lat: 22.3193, lng: 114.1694, country: "China" },
  "shanghai": { lat: 31.2304, lng: 121.4737, country: "China" },
};

interface ExtractedContact {
  name: string;
  organization_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  stages?: string[];
  linkedin_url?: string;
  fund_size?: number;
  ticket_min?: number;
  ticket_max?: number;
  notes?: string;
  selected?: boolean;
}

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

type ImportStep = "upload" | "processing" | "review" | "importing" | "complete";

const BulkImportModal = ({ isOpen, onClose, onSuccess, userId }: BulkImportModalProps) => {
  const [step, setStep] = useState<ImportStep>("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [extractedContacts, setExtractedContacts] = useState<ExtractedContact[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    if (file) processFile(file);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = async (file: File) => {
    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv',
    ];
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!validTypes.includes(file.type) && !hasValidExtension) {
      toast({
        title: "Invalid file type",
        description: "Please upload an Excel (.xlsx, .xls) or CSV file",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      });
      return;
    }

    setStep("processing");
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('parse-contacts-file', {
        body: formData,
      });

      if (error) throw error;

      if (!data.contacts || data.contacts.length === 0) {
        setErrorMessage("No investor contacts found in the file. Make sure your file contains investor information.");
        setStep("upload");
        return;
      }

      // Mark all contacts as selected by default
      const contactsWithSelection = data.contacts.map((c: ExtractedContact) => ({
        ...c,
        selected: true,
      }));

      setExtractedContacts(contactsWithSelection);
      setStep("review");

    } catch (error: any) {
      console.error("Error processing file:", error);
      setErrorMessage(error.message || "Failed to process file");
      setStep("upload");
    }
  };

  const toggleContact = (index: number) => {
    setExtractedContacts(prev => 
      prev.map((c, i) => i === index ? { ...c, selected: !c.selected } : c)
    );
  };

  const toggleAll = (selected: boolean) => {
    setExtractedContacts(prev => prev.map(c => ({ ...c, selected })));
  };

  const importContacts = async () => {
    const selectedContacts = extractedContacts.filter(c => c.selected);
    if (selectedContacts.length === 0) {
      toast({ title: "No contacts selected", variant: "destructive" });
      return;
    }

    setStep("importing");
    setImportProgress(0);
    setImportedCount(0);

    let successCount = 0;

    for (let i = 0; i < selectedContacts.length; i++) {
      const contact = selectedContacts[i];
      
      try {
        // Get city coordinates if available
        const cityKey = contact.city?.toLowerCase().trim();
        const cityData = cityKey ? MAJOR_CITIES[cityKey] : null;

        // Create global contact
        const { data: newContact, error: globalError } = await (supabase
          .from("global_contacts") as any)
          .insert({
            entity_type: "investor",
            name: contact.name,
            organization_name: contact.organization_name || null,
            email: contact.email || null,
            phone: contact.phone || null,
            fund_size: contact.fund_size ? contact.fund_size * 1000000 : null,
            stages: contact.stages || [],
            ticket_size_min: contact.ticket_min ? contact.ticket_min * 1000 : null,
            ticket_size_max: contact.ticket_max ? contact.ticket_max * 1000 : null,
            city: contact.city || null,
            city_lat: cityData?.lat || null,
            city_lng: cityData?.lng || null,
            country: contact.country || cityData?.country || null,
            linkedin_url: contact.linkedin_url || null,
          })
          .select()
          .single();

        if (globalError) {
          console.error("Error creating global contact:", globalError);
          continue;
        }

        // Create investor contact
        const { error: contactError } = await (supabase
          .from("investor_contacts") as any)
          .insert({
            investor_id: userId,
            global_contact_id: newContact.id,
            local_notes: contact.notes || null,
            local_email: contact.email || null,
            local_phone: contact.phone || null,
            relationship_status: "prospect",
          });

        if (!contactError) successCount++;

      } catch (err) {
        console.error("Error importing contact:", contact.name, err);
      }

      setImportProgress(Math.round(((i + 1) / selectedContacts.length) * 100));
      setImportedCount(successCount);
    }

    setStep("complete");
  };

  const handleClose = () => {
    setStep("upload");
    setExtractedContacts([]);
    setImportProgress(0);
    setImportedCount(0);
    setErrorMessage(null);
    if (step === "complete") {
      onSuccess();
    }
    onClose();
  };

  const selectedCount = extractedContacts.filter(c => c.selected).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Import Contacts
          </DialogTitle>
          <DialogDescription>
            Upload an Excel or CSV file with investor contacts. AI will extract and organize the data.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {/* Upload Step */}
          {step === "upload" && (
            <div className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{errorMessage}</p>
                </div>
              )}

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">Drop your file here</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports Excel (.xlsx, .xls) and CSV files
                </p>
                <label>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button variant="outline" asChild>
                    <span className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </span>
                  </Button>
                </label>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Tips for best results:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Include columns for name, organization, email, city</li>
                  <li>• Investment stages and fund info will be auto-detected</li>
                  <li>• Max 100 contacts per import</li>
                </ul>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {step === "processing" && (
            <div className="py-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <h3 className="font-medium mb-2">Analyzing your file...</h3>
              <p className="text-sm text-muted-foreground">
                AI is extracting investor information
              </p>
            </div>
          )}

          {/* Review Step */}
          {step === "review" && (
            <div className="space-y-4 flex flex-col h-full">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Found {extractedContacts.length} contacts • {selectedCount} selected
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleAll(true)}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleAll(false)}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 max-h-[400px] pr-4">
                <div className="space-y-2">
                  {extractedContacts.map((contact, index) => (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg transition-colors ${
                        contact.selected
                          ? "border-primary/50 bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={contact.selected}
                          onCheckedChange={() => toggleContact(index)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">
                              {contact.name}
                            </span>
                            {contact.organization_name && (
                              <span className="text-sm text-muted-foreground truncate">
                                @ {contact.organization_name}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                            {contact.email && <span>{contact.email}</span>}
                            {contact.city && <span>{contact.city}</span>}
                            {contact.stages && contact.stages.length > 0 && (
                              <span>{contact.stages.join(", ")}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={importContacts}
                  disabled={selectedCount === 0}
                >
                  Import {selectedCount} Contacts
                </Button>
              </div>
            </div>
          )}

          {/* Importing Step */}
          {step === "importing" && (
            <div className="py-8 space-y-4">
              <div className="text-center mb-6">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
                <h3 className="font-medium">Importing contacts...</h3>
                <p className="text-sm text-muted-foreground">
                  {importedCount} of {selectedCount} imported
                </p>
              </div>
              <Progress value={importProgress} className="h-2" />
            </div>
          )}

          {/* Complete Step */}
          {step === "complete" && (
            <div className="py-12 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="font-medium mb-2">Import Complete!</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Successfully imported {importedCount} contacts
              </p>
              <Button onClick={handleClose}>Done</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportModal;
