import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle, X, Check, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
}

interface ReviewedContact extends ExtractedContact {
  status: "pending" | "accepted" | "rejected";
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
  const [contacts, setContacts] = useState<ReviewedContact[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<ExtractedContact | null>(null);
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
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!hasValidExtension) {
      toast({
        title: "Invalid file type",
        description: "Please upload an Excel (.xlsx, .xls) or CSV file",
        variant: "destructive",
      });
      return;
    }

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

      const reviewContacts: ReviewedContact[] = data.contacts.map((c: ExtractedContact) => ({
        ...c,
        status: "pending" as const,
      }));

      setContacts(reviewContacts);
      setCurrentIndex(0);
      setStep("review");

    } catch (error: any) {
      console.error("Error processing file:", error);
      setErrorMessage(error.message || "Failed to process file");
      setStep("upload");
    }
  };

  const currentContact = contacts[currentIndex];
  const pendingContacts = contacts.filter(c => c.status === "pending");
  const acceptedContacts = contacts.filter(c => c.status === "accepted");
  const rejectedContacts = contacts.filter(c => c.status === "rejected");

  const handleAccept = () => {
    if (!currentContact) return;
    
    setContacts(prev => prev.map((c, i) => 
      i === currentIndex ? { ...c, status: "accepted" as const } : c
    ));
    
    moveToNextPending();
  };

  const handleReject = () => {
    if (!currentContact) return;
    
    setContacts(prev => prev.map((c, i) => 
      i === currentIndex ? { ...c, status: "rejected" as const } : c
    ));
    
    moveToNextPending();
  };

  const handleEdit = () => {
    if (!currentContact) return;
    setEditForm({ ...currentContact });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editForm) return;
    
    setContacts(prev => prev.map((c, i) => 
      i === currentIndex ? { ...c, ...editForm, status: "accepted" as const } : c
    ));
    
    setIsEditing(false);
    setEditForm(null);
    moveToNextPending();
  };

  const moveToNextPending = () => {
    const nextPendingIndex = contacts.findIndex((c, i) => i > currentIndex && c.status === "pending");
    if (nextPendingIndex !== -1) {
      setCurrentIndex(nextPendingIndex);
    } else {
      const firstPendingIndex = contacts.findIndex(c => c.status === "pending");
      if (firstPendingIndex !== -1 && firstPendingIndex !== currentIndex) {
        setCurrentIndex(firstPendingIndex);
      }
    }
  };

  const navigateCard = (direction: "prev" | "next") => {
    if (direction === "prev" && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (direction === "next" && currentIndex < contacts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const acceptAll = () => {
    setContacts(prev => prev.map(c => 
      c.status === "pending" ? { ...c, status: "accepted" as const } : c
    ));
  };

  const importContacts = async () => {
    const toImport = contacts.filter(c => c.status === "accepted");
    if (toImport.length === 0) {
      toast({ title: "No contacts to import", variant: "destructive" });
      return;
    }

    setStep("importing");
    setImportProgress(0);
    setImportedCount(0);

    let successCount = 0;

    for (let i = 0; i < toImport.length; i++) {
      const contact = toImport[i];
      
      try {
        const cityKey = contact.city?.toLowerCase().trim();
        const cityData = cityKey ? MAJOR_CITIES[cityKey] : null;

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

      setImportProgress(Math.round(((i + 1) / toImport.length) * 100));
      setImportedCount(successCount);
    }

    setStep("complete");
  };

  const handleClose = () => {
    setStep("upload");
    setContacts([]);
    setCurrentIndex(0);
    setImportProgress(0);
    setImportedCount(0);
    setErrorMessage(null);
    setIsEditing(false);
    setEditForm(null);
    if (step === "complete") {
      onSuccess();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Contacts
          </DialogTitle>
          <DialogDescription>
            Upload an Excel or CSV file with investor contacts
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
                    <span className="cursor-pointer">Choose File</span>
                  </Button>
                </label>
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

          {/* Review Step - Card Stack */}
          {step === "review" && !isEditing && (
            <div className="space-y-4">
              {/* Stats Bar */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex gap-4">
                  <span className="text-muted-foreground">
                    {pendingContacts.length} pending
                  </span>
                  <span className="text-green-600">
                    {acceptedContacts.length} accepted
                  </span>
                  <span className="text-red-500">
                    {rejectedContacts.length} rejected
                  </span>
                </div>
                <span className="text-muted-foreground">
                  {currentIndex + 1} / {contacts.length}
                </span>
              </div>

              {/* Card Stack */}
              {pendingContacts.length > 0 && currentContact?.status === "pending" ? (
                <div className="relative">
                  {/* Background cards for stack effect */}
                  {pendingContacts.length > 2 && (
                    <div className="absolute inset-x-4 top-2 h-full bg-card border border-border rounded-xl opacity-30" />
                  )}
                  {pendingContacts.length > 1 && (
                    <div className="absolute inset-x-2 top-1 h-full bg-card border border-border rounded-xl opacity-60" />
                  )}
                  
                  {/* Current Card */}
                  <div className="relative bg-card border border-border rounded-xl p-6 shadow-lg">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold">{currentContact.name}</h3>
                        {currentContact.organization_name && (
                          <p className="text-muted-foreground">@ {currentContact.organization_name}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {currentContact.email && (
                          <div>
                            <span className="text-muted-foreground">Email:</span>
                            <p className="truncate">{currentContact.email}</p>
                          </div>
                        )}
                        {currentContact.phone && (
                          <div>
                            <span className="text-muted-foreground">Phone:</span>
                            <p>{currentContact.phone}</p>
                          </div>
                        )}
                        {currentContact.city && (
                          <div>
                            <span className="text-muted-foreground">Location:</span>
                            <p>{currentContact.city}{currentContact.country ? `, ${currentContact.country}` : ""}</p>
                          </div>
                        )}
                        {currentContact.stages && currentContact.stages.length > 0 && (
                          <div>
                            <span className="text-muted-foreground">Stages:</span>
                            <p>{currentContact.stages.join(", ")}</p>
                          </div>
                        )}
                        {currentContact.fund_size && (
                          <div>
                            <span className="text-muted-foreground">Fund Size:</span>
                            <p>${currentContact.fund_size}M</p>
                          </div>
                        )}
                        {currentContact.linkedin_url && (
                          <div>
                            <span className="text-muted-foreground">LinkedIn:</span>
                            <p className="truncate text-primary">View Profile</p>
                          </div>
                        )}
                      </div>

                      {currentContact.notes && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Notes:</span>
                          <p className="mt-1">{currentContact.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-center gap-4 mt-6">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-14 w-14 rounded-full border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-500"
                      onClick={handleReject}
                    >
                      <X className="h-6 w-6" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-full"
                      onClick={handleEdit}
                    >
                      <Pencil className="h-5 w-5" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-14 w-14 rounded-full border-green-500/50 text-green-500 hover:bg-green-500/10 hover:text-green-500"
                      onClick={handleAccept}
                    >
                      <Check className="h-6 w-6" />
                    </Button>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateCard("prev")}
                      disabled={currentIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateCard("next")}
                      disabled={currentIndex === contacts.length - 1}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <h3 className="font-medium mb-2">All contacts reviewed!</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {acceptedContacts.length} contacts ready to import
                  </p>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="ghost" size="sm" onClick={acceptAll}>
                  Accept All Remaining
                </Button>
                <Button
                  onClick={importContacts}
                  disabled={acceptedContacts.length === 0}
                >
                  Import {acceptedContacts.length} Contacts
                </Button>
              </div>
            </div>
          )}

          {/* Edit Mode */}
          {step === "review" && isEditing && editForm && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Edit Contact</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Organization</Label>
                  <Input
                    value={editForm.organization_name || ""}
                    onChange={(e) => setEditForm({ ...editForm, organization_name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={editForm.email || ""}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={editForm.phone || ""}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>City</Label>
                    <Input
                      value={editForm.city || ""}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Country</Label>
                    <Input
                      value={editForm.country || ""}
                      onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>LinkedIn URL</Label>
                  <Input
                    value={editForm.linkedin_url || ""}
                    onChange={(e) => setEditForm({ ...editForm, linkedin_url: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveEdit}>
                  Save & Accept
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
                  {importedCount} of {acceptedContacts.length} imported
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
