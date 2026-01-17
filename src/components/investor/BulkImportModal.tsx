import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle, X, Check, Pencil, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Major cities for matching
const MAJOR_CITIES: Record<string, { lat: number; lng: number; country: string }> = {
  // USA
  "san francisco": { lat: 37.7749, lng: -122.4194, country: "USA" },
  "new york": { lat: 40.7128, lng: -74.0060, country: "USA" },
  "boston": { lat: 42.3601, lng: -71.0589, country: "USA" },
  "los angeles": { lat: 34.0522, lng: -118.2437, country: "USA" },
  "miami": { lat: 25.7617, lng: -80.1918, country: "USA" },
  "austin": { lat: 30.2672, lng: -97.7431, country: "USA" },
  "seattle": { lat: 47.6062, lng: -122.3321, country: "USA" },
  "chicago": { lat: 41.8781, lng: -87.6298, country: "USA" },
  // UK & Ireland
  "london": { lat: 51.5074, lng: -0.1278, country: "UK" },
  "dublin": { lat: 53.3498, lng: -6.2603, country: "Ireland" },
  // Western Europe
  "paris": { lat: 48.8566, lng: 2.3522, country: "France" },
  "berlin": { lat: 52.5200, lng: 13.4050, country: "Germany" },
  "munich": { lat: 48.1351, lng: 11.5820, country: "Germany" },
  "frankfurt": { lat: 50.1109, lng: 8.6821, country: "Germany" },
  "amsterdam": { lat: 52.3676, lng: 4.9041, country: "Netherlands" },
  "brussels": { lat: 50.8503, lng: 4.3517, country: "Belgium" },
  "luxembourg": { lat: 49.6116, lng: 6.1319, country: "Luxembourg" },
  "zurich": { lat: 47.3769, lng: 8.5417, country: "Switzerland" },
  "geneva": { lat: 46.2044, lng: 6.1432, country: "Switzerland" },
  "bern": { lat: 46.9480, lng: 7.4474, country: "Switzerland" },
  "vienna": { lat: 48.2082, lng: 16.3738, country: "Austria" },
  // Southern Europe
  "lisbon": { lat: 38.7223, lng: -9.1393, country: "Portugal" },
  "madrid": { lat: 40.4168, lng: -3.7038, country: "Spain" },
  "barcelona": { lat: 41.3851, lng: 2.1734, country: "Spain" },
  "rome": { lat: 41.9028, lng: 12.4964, country: "Italy" },
  "milan": { lat: 45.4642, lng: 9.1900, country: "Italy" },
  "athens": { lat: 37.9838, lng: 23.7275, country: "Greece" },
  "nicosia": { lat: 35.1856, lng: 33.3823, country: "Cyprus" },
  "valletta": { lat: 35.8989, lng: 14.5146, country: "Malta" },
  // Scandinavia
  "stockholm": { lat: 59.3293, lng: 18.0686, country: "Sweden" },
  "copenhagen": { lat: 55.6761, lng: 12.5683, country: "Denmark" },
  "oslo": { lat: 59.9139, lng: 10.7522, country: "Norway" },
  "helsinki": { lat: 60.1699, lng: 24.9384, country: "Finland" },
  "reykjavik": { lat: 64.1466, lng: -21.9426, country: "Iceland" },
  // Baltic states
  "vilnius": { lat: 54.6872, lng: 25.2797, country: "Lithuania" },
  "kaunas": { lat: 54.8985, lng: 23.9036, country: "Lithuania" },
  "riga": { lat: 56.9496, lng: 24.1052, country: "Latvia" },
  "tallinn": { lat: 59.4370, lng: 24.7536, country: "Estonia" },
  // Central Europe
  "warsaw": { lat: 52.2297, lng: 21.0122, country: "Poland" },
  "prague": { lat: 50.0755, lng: 14.4378, country: "Czech Republic" },
  "budapest": { lat: 47.4979, lng: 19.0402, country: "Hungary" },
  "bratislava": { lat: 48.1486, lng: 17.1077, country: "Slovakia" },
  // Eastern Europe
  "bucharest": { lat: 44.4268, lng: 26.1025, country: "Romania" },
  "kyiv": { lat: 50.4501, lng: 30.5234, country: "Ukraine" },
  "kiev": { lat: 50.4501, lng: 30.5234, country: "Ukraine" },
  "sofia": { lat: 42.6977, lng: 23.3219, country: "Bulgaria" },
  "minsk": { lat: 53.9006, lng: 27.5590, country: "Belarus" },
  "chisinau": { lat: 47.0105, lng: 28.8638, country: "Moldova" },
  // Balkans
  "belgrade": { lat: 44.7866, lng: 20.4489, country: "Serbia" },
  "zagreb": { lat: 45.8150, lng: 15.9819, country: "Croatia" },
  "ljubljana": { lat: 46.0569, lng: 14.5058, country: "Slovenia" },
  "sarajevo": { lat: 43.8563, lng: 18.4131, country: "Bosnia and Herzegovina" },
  "skopje": { lat: 41.9973, lng: 21.4280, country: "North Macedonia" },
  "tirana": { lat: 41.3275, lng: 19.8187, country: "Albania" },
  "podgorica": { lat: 42.4304, lng: 19.2594, country: "Montenegro" },
  "pristina": { lat: 42.6629, lng: 21.1655, country: "Kosovo" },
  // Caucasus
  "tbilisi": { lat: 41.7151, lng: 44.8271, country: "Georgia" },
  "yerevan": { lat: 40.1792, lng: 44.4991, country: "Armenia" },
  "baku": { lat: 40.4093, lng: 49.8671, country: "Azerbaijan" },
  // Russia/Turkey
  "moscow": { lat: 55.7558, lng: 37.6173, country: "Russia" },
  "istanbul": { lat: 41.0082, lng: 28.9784, country: "Turkey" },
  "ankara": { lat: 39.9334, lng: 32.8597, country: "Turkey" },
  // Asia
  "singapore": { lat: 1.3521, lng: 103.8198, country: "Singapore" },
  "tokyo": { lat: 35.6762, lng: 139.6503, country: "Japan" },
  "hong kong": { lat: 22.3193, lng: 114.1694, country: "China" },
  "shanghai": { lat: 31.2304, lng: 121.4737, country: "China" },
  "mumbai": { lat: 19.0760, lng: 72.8777, country: "India" },
  "bangalore": { lat: 12.9716, lng: 77.5946, country: "India" },
  // Middle East
  "tel aviv": { lat: 32.0853, lng: 34.7818, country: "Israel" },
  "dubai": { lat: 25.2048, lng: 55.2708, country: "UAE" },
  // Other
  "sydney": { lat: -33.8688, lng: 151.2093, country: "Australia" },
  "toronto": { lat: 43.6532, lng: -79.3832, country: "Canada" },
};

// Country capitals as fallback for unknown cities
const COUNTRY_CAPITALS: Record<string, { lat: number; lng: number }> = {
  "lithuania": { lat: 54.6872, lng: 25.2797 },
  "latvia": { lat: 56.9496, lng: 24.1052 },
  "estonia": { lat: 59.4370, lng: 24.7536 },
  "finland": { lat: 60.1699, lng: 24.9384 },
  "sweden": { lat: 59.3293, lng: 18.0686 },
  "norway": { lat: 59.9139, lng: 10.7522 },
  "denmark": { lat: 55.6761, lng: 12.5683 },
  "poland": { lat: 52.2297, lng: 21.0122 },
  "germany": { lat: 52.5200, lng: 13.4050 },
  "france": { lat: 48.8566, lng: 2.3522 },
  "uk": { lat: 51.5074, lng: -0.1278 },
  "united kingdom": { lat: 51.5074, lng: -0.1278 },
  "usa": { lat: 40.7128, lng: -74.0060 },
  "united states": { lat: 40.7128, lng: -74.0060 },
  "netherlands": { lat: 52.3676, lng: 4.9041 },
  "belgium": { lat: 50.8503, lng: 4.3517 },
  "switzerland": { lat: 47.3769, lng: 8.5417 },
  "austria": { lat: 48.2082, lng: 16.3738 },
  "czech republic": { lat: 50.0755, lng: 14.4378 },
  "czechia": { lat: 50.0755, lng: 14.4378 },
  "hungary": { lat: 47.4979, lng: 19.0402 },
  "ireland": { lat: 53.3498, lng: -6.2603 },
  "portugal": { lat: 38.7223, lng: -9.1393 },
  "spain": { lat: 40.4168, lng: -3.7038 },
  "italy": { lat: 41.9028, lng: 12.4964 },
  "greece": { lat: 37.9838, lng: 23.7275 },
  "romania": { lat: 44.4268, lng: 26.1025 },
  "ukraine": { lat: 50.4501, lng: 30.5234 },
  "russia": { lat: 55.7558, lng: 37.6173 },
  "israel": { lat: 32.0853, lng: 34.7818 },
  "uae": { lat: 25.2048, lng: 55.2708 },
  "united arab emirates": { lat: 25.2048, lng: 55.2708 },
  "singapore": { lat: 1.3521, lng: 103.8198 },
  "japan": { lat: 35.6762, lng: 139.6503 },
  "china": { lat: 39.9042, lng: 116.4074 },
  "india": { lat: 28.6139, lng: 77.2090 },
  "australia": { lat: -33.8688, lng: 151.2093 },
  "canada": { lat: 43.6532, lng: -79.3832 },
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
  isDuplicate?: boolean;
  duplicateMatch?: string;
}

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

type ImportStep = "upload" | "processing" | "review" | "importing" | "complete";

type EditableField = "name" | "organization_name" | "email" | "phone" | "city" | "country" | "linkedin_url" | "fund_size" | "notes";

// Inline editable field component
const EditableField = ({ 
  label, 
  value, 
  fieldKey,
  editingField,
  editValue,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditValueChange,
  placeholder = "Not set"
}: {
  label: string;
  value: string | number | undefined | null;
  fieldKey: EditableField;
  editingField: EditableField | null;
  editValue: string;
  onStartEdit: (field: EditableField, currentValue: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditValueChange: (value: string) => void;
  placeholder?: string;
}) => {
  const isEditing = editingField === fieldKey;
  const displayValue = value !== undefined && value !== null && value !== "" ? String(value) : placeholder;
  
  if (isEditing) {
    return (
      <div className="space-y-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className="flex items-center gap-1">
          <Input
            value={editValue}
            onChange={(e) => onEditValueChange(e.target.value)}
            className="h-7 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") onSaveEdit();
              if (e.key === "Escape") onCancelEdit();
            }}
          />
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onSaveEdit}>
            <Check className="h-3 w-3 text-green-500" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onCancelEdit}>
            <X className="h-3 w-3 text-red-500" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div 
        className="flex items-center gap-1 group cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1"
        onClick={() => onStartEdit(fieldKey, value !== undefined && value !== null ? String(value) : "")}
      >
        <p className={`text-sm truncate flex-1 ${!value ? "text-muted-foreground italic" : ""}`}>
          {displayValue}
        </p>
        <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </div>
    </div>
  );
};

const BulkImportModal = ({ isOpen, onClose, onSuccess, userId }: BulkImportModalProps) => {
  const [step, setStep] = useState<ImportStep>("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [contacts, setContacts] = useState<ReviewedContact[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [importProgress, setImportProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [existingContacts, setExistingContacts] = useState<Array<{ name: string; organization_name: string | null; email: string | null }>>([]);

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
      // Fetch existing contacts for duplicate detection
      const { data: investorContacts } = await (supabase
        .from("investor_contacts") as any)
        .select("global_contact_id")
        .eq("investor_id", userId);

      const existingGlobalIds = (investorContacts || []).map((c: any) => c.global_contact_id);
      
      if (existingGlobalIds.length > 0) {
        const { data: globalContacts } = await (supabase
          .from("global_contacts") as any)
          .select("name, organization_name, email")
          .in("id", existingGlobalIds);
        
        setExistingContacts(globalContacts || []);
      }

      // Read file as base64 and send as JSON (more reliable than FormData)
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke('parse-contacts-file', {
        body: {
          fileBase64: fileData,
          fileName: file.name,
          fileType: file.type,
        },
      });

      if (error) throw error;

      if (!data.contacts || data.contacts.length === 0) {
        setErrorMessage("No investor contacts found in the file. Make sure your file contains investor information.");
        setStep("upload");
        return;
      }

      // Check for duplicates
      const reviewContacts: ReviewedContact[] = data.contacts.map((c: ExtractedContact) => {
        const duplicate = existingContacts.find(existing => {
          const nameMatch = existing.name?.toLowerCase().trim() === c.name?.toLowerCase().trim();
          const emailMatch = c.email && existing.email && existing.email.toLowerCase() === c.email.toLowerCase();
          const orgMatch = c.organization_name && existing.organization_name && 
            existing.organization_name.toLowerCase().includes(c.organization_name.toLowerCase());
          return nameMatch || emailMatch || (nameMatch && orgMatch);
        });

        return {
          ...c,
          status: "pending" as const, // Always start as pending, even duplicates
          isDuplicate: !!duplicate,
          duplicateMatch: duplicate ? duplicate.name : undefined,
        };
      });

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
    
    // Auto advance to next pending or next card
    if (currentIndex < contacts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleReject = () => {
    if (!currentContact) return;
    
    setContacts(prev => prev.map((c, i) => 
      i === currentIndex ? { ...c, status: "rejected" as const } : c
    ));
    
    // Auto advance to next pending or next card
    if (currentIndex < contacts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleStartEdit = (field: EditableField, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleSaveEdit = () => {
    if (!editingField || !currentContact) return;
    
    const fieldKey = editingField;
    let newValue: string | number | undefined = editValue;
    
    // Handle fund_size as number
    if (fieldKey === "fund_size") {
      newValue = editValue ? parseFloat(editValue) : undefined;
    }
    
    setContacts(prev => prev.map((c, i) => 
      i === currentIndex ? { ...c, [fieldKey]: newValue || undefined } : c
    ));
    
    setEditingField(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue("");
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
        const countryKey = contact.country?.toLowerCase().trim();
        const cityData = cityKey ? MAJOR_CITIES[cityKey] : null;
        
        // Fallback to country capital if city not found but country exists
        const countryFallback = !cityData && countryKey ? COUNTRY_CAPITALS[countryKey] : null;
        
        const finalLat = cityData?.lat || countryFallback?.lat || null;
        const finalLng = cityData?.lng || countryFallback?.lng || null;

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
            city_lat: finalLat,
            city_lng: finalLng,
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
    setEditingField(null);
    setEditValue("");
    if (step === "complete") {
      onSuccess();
    }
    onClose();
  };

  const getStatusBadge = (status: "pending" | "accepted" | "rejected") => {
    switch (status) {
      case "accepted":
        return <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-600">Accepted</span>;
      case "rejected":
        return <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-600">Rejected</span>;
      default:
        return <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">Pending</span>;
    }
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
          {step === "review" && currentContact && (
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
              <div className="relative">
                {/* Background cards for stack effect */}
                {contacts.length - currentIndex > 2 && (
                  <div className="absolute inset-x-4 top-2 h-full bg-card border border-border rounded-xl opacity-30 pointer-events-none z-0" />
                )}
                {contacts.length - currentIndex > 1 && (
                  <div className="absolute inset-x-2 top-1 h-full bg-card border border-border rounded-xl opacity-60 pointer-events-none z-0" />
                )}

                <div className="relative z-10">
                  {/* Current Card */}
                  <div
                    className={`relative bg-card border rounded-xl p-5 shadow-lg ${
                      currentContact.isDuplicate
                        ? "border-yellow-500/50"
                        : currentContact.status === "accepted"
                          ? "border-green-500/50"
                          : currentContact.status === "rejected"
                            ? "border-red-500/50"
                            : "border-border"
                    }`}
                  >
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(currentContact.status)}
                    </div>

                    {currentContact.isDuplicate && (
                      <div className="mb-4 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2 text-yellow-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xs">
                          Possible duplicate of "{currentContact.duplicateMatch}"
                        </span>
                      </div>
                    )}

                    <div className="space-y-3">
                      {/* Name - Always visible */}
                      <EditableField
                        label="Name"
                        value={currentContact.name}
                        fieldKey="name"
                        editingField={editingField}
                        editValue={editValue}
                        onStartEdit={handleStartEdit}
                        onSaveEdit={handleSaveEdit}
                        onCancelEdit={handleCancelEdit}
                        onEditValueChange={setEditValue}
                      />

                      {/* Organization */}
                      <EditableField
                        label="Organization"
                        value={currentContact.organization_name}
                        fieldKey="organization_name"
                        editingField={editingField}
                        editValue={editValue}
                        onStartEdit={handleStartEdit}
                        onSaveEdit={handleSaveEdit}
                        onCancelEdit={handleCancelEdit}
                        onEditValueChange={setEditValue}
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <EditableField
                          label="Email"
                          value={currentContact.email}
                          fieldKey="email"
                          editingField={editingField}
                          editValue={editValue}
                          onStartEdit={handleStartEdit}
                          onSaveEdit={handleSaveEdit}
                          onCancelEdit={handleCancelEdit}
                          onEditValueChange={setEditValue}
                        />
                        <EditableField
                          label="Phone"
                          value={currentContact.phone}
                          fieldKey="phone"
                          editingField={editingField}
                          editValue={editValue}
                          onStartEdit={handleStartEdit}
                          onSaveEdit={handleSaveEdit}
                          onCancelEdit={handleCancelEdit}
                          onEditValueChange={setEditValue}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <EditableField
                          label="City"
                          value={currentContact.city}
                          fieldKey="city"
                          editingField={editingField}
                          editValue={editValue}
                          onStartEdit={handleStartEdit}
                          onSaveEdit={handleSaveEdit}
                          onCancelEdit={handleCancelEdit}
                          onEditValueChange={setEditValue}
                        />
                        <EditableField
                          label="Country"
                          value={currentContact.country}
                          fieldKey="country"
                          editingField={editingField}
                          editValue={editValue}
                          onStartEdit={handleStartEdit}
                          onSaveEdit={handleSaveEdit}
                          onCancelEdit={handleCancelEdit}
                          onEditValueChange={setEditValue}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <EditableField
                          label="Fund Size (M)"
                          value={currentContact.fund_size}
                          fieldKey="fund_size"
                          editingField={editingField}
                          editValue={editValue}
                          onStartEdit={handleStartEdit}
                          onSaveEdit={handleSaveEdit}
                          onCancelEdit={handleCancelEdit}
                          onEditValueChange={setEditValue}
                        />
                        <EditableField
                          label="LinkedIn"
                          value={currentContact.linkedin_url}
                          fieldKey="linkedin_url"
                          editingField={editingField}
                          editValue={editValue}
                          onStartEdit={handleStartEdit}
                          onSaveEdit={handleSaveEdit}
                          onCancelEdit={handleCancelEdit}
                          onEditValueChange={setEditValue}
                        />
                      </div>

                      {currentContact.stages && currentContact.stages.length > 0 && (
                        <div>
                          <span className="text-xs text-muted-foreground">Stages</span>
                          <p className="text-sm">{currentContact.stages.join(", ")}</p>
                        </div>
                      )}

                      <EditableField
                        label="Notes"
                        value={currentContact.notes}
                        fieldKey="notes"
                        editingField={editingField}
                        editValue={editValue}
                        onStartEdit={handleStartEdit}
                        onSaveEdit={handleSaveEdit}
                        onCancelEdit={handleCancelEdit}
                        onEditValueChange={setEditValue}
                      />
                    </div>
                  </div>

                  {/* Action Buttons - Tinder Style */}
                  <div className="flex items-center justify-center gap-6 mt-6">
                    <Button
                      variant="outline"
                      size="icon"
                      className={`h-16 w-16 rounded-full border-2 transition-all duration-200 ${
                        currentContact.status === "rejected"
                          ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30"
                          : "border-red-500/50 text-red-500 hover:bg-red-500 hover:border-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/30 hover:scale-110"
                      }`}
                      onClick={handleReject}
                      type="button"
                    >
                      <X className="h-7 w-7" />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className={`h-16 w-16 rounded-full border-2 transition-all duration-200 ${
                        currentContact.status === "accepted"
                          ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30"
                          : "border-green-500/50 text-green-500 hover:bg-green-500 hover:border-green-500 hover:text-white hover:shadow-lg hover:shadow-green-500/30 hover:scale-110"
                      }`}
                      onClick={handleAccept}
                      type="button"
                    >
                      <Check className="h-7 w-7" />
                    </Button>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateCard("prev")}
                      disabled={currentIndex === 0}
                      type="button"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateCard("next")}
                      disabled={currentIndex === contacts.length - 1}
                      type="button"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>


              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="ghost" size="sm" onClick={acceptAll} disabled={pendingContacts.length === 0}>
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

          {/* All reviewed state */}
          {step === "review" && !currentContact && contacts.length > 0 && (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="font-medium mb-2">All contacts reviewed!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {acceptedContacts.length} contacts ready to import
              </p>
              <Button onClick={importContacts} disabled={acceptedContacts.length === 0}>
                Import {acceptedContacts.length} Contacts
              </Button>
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
