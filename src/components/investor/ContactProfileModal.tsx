import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { 
  Building, 
  MapPin, 
  User, 
  ExternalLink, 
  DollarSign,
  Calendar,
  Mail,
  Phone,
  Trash2,
  AlertTriangle,
  Pencil,
  Check,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { InvestorContact } from "@/pages/investor/InvestorDashboard";

const RELATIONSHIP_STATUSES = [
  { value: "prospect", label: "Prospect" },
  { value: "warm", label: "Warm" },
  { value: "connected", label: "Connected" },
  { value: "invested", label: "Invested Together" },
];

// City coordinates for location updates
const CITY_COORDINATES: Record<string, { lat: number; lng: number; country: string }> = {
  "vilnius": { lat: 54.6872, lng: 25.2797, country: "Lithuania" },
  "riga": { lat: 56.9496, lng: 24.1052, country: "Latvia" },
  "tallinn": { lat: 59.4370, lng: 24.7536, country: "Estonia" },
  "london": { lat: 51.5074, lng: -0.1278, country: "UK" },
  "paris": { lat: 48.8566, lng: 2.3522, country: "France" },
  "berlin": { lat: 52.5200, lng: 13.4050, country: "Germany" },
  "amsterdam": { lat: 52.3676, lng: 4.9041, country: "Netherlands" },
  "brussels": { lat: 50.8503, lng: 4.3517, country: "Belgium" },
  "vienna": { lat: 48.2082, lng: 16.3738, country: "Austria" },
  "zurich": { lat: 47.3769, lng: 8.5417, country: "Switzerland" },
  "stockholm": { lat: 59.3293, lng: 18.0686, country: "Sweden" },
  "copenhagen": { lat: 55.6761, lng: 12.5683, country: "Denmark" },
  "oslo": { lat: 59.9139, lng: 10.7522, country: "Norway" },
  "helsinki": { lat: 60.1699, lng: 24.9384, country: "Finland" },
  "warsaw": { lat: 52.2297, lng: 21.0122, country: "Poland" },
  "prague": { lat: 50.0755, lng: 14.4378, country: "Czech Republic" },
  "budapest": { lat: 47.4979, lng: 19.0402, country: "Hungary" },
  "bucharest": { lat: 44.4268, lng: 26.1025, country: "Romania" },
  "sofia": { lat: 42.6977, lng: 23.3219, country: "Bulgaria" },
  "belgrade": { lat: 44.7866, lng: 20.4489, country: "Serbia" },
  "zagreb": { lat: 45.8150, lng: 15.9819, country: "Croatia" },
  "ljubljana": { lat: 46.0569, lng: 14.5058, country: "Slovenia" },
  "athens": { lat: 37.9838, lng: 23.7275, country: "Greece" },
  "lisbon": { lat: 38.7223, lng: -9.1393, country: "Portugal" },
  "madrid": { lat: 40.4168, lng: -3.7038, country: "Spain" },
  "rome": { lat: 41.9028, lng: 12.4964, country: "Italy" },
  "milan": { lat: 45.4642, lng: 9.1900, country: "Italy" },
  "dublin": { lat: 53.3498, lng: -6.2603, country: "Ireland" },
  "new york": { lat: 40.7128, lng: -74.0060, country: "USA" },
  "san francisco": { lat: 37.7749, lng: -122.4194, country: "USA" },
  "singapore": { lat: 1.3521, lng: 103.8198, country: "Singapore" },
  "tokyo": { lat: 35.6762, lng: 139.6503, country: "Japan" },
  "tel aviv": { lat: 32.0853, lng: 34.7818, country: "Israel" },
  "dubai": { lat: 25.2048, lng: 55.2708, country: "UAE" },
};

interface ContactProfileModalProps {
  contact: InvestorContact;
  onClose: () => void;
  onUpdate: () => void;
}

const ContactProfileModal = ({ contact, onClose, onUpdate }: ContactProfileModalProps) => {
  const [notes, setNotes] = useState(contact.local_notes || "");
  const [email, setEmail] = useState((contact as any).local_email || (contact.global_contact as any)?.email || "");
  const [phone, setPhone] = useState((contact as any).local_phone || (contact.global_contact as any)?.phone || "");
  const [localName, setLocalName] = useState(contact.local_name || "");
  const [localOrganization, setLocalOrganization] = useState(contact.local_organization || "");
  const [city, setCity] = useState(contact.global_contact?.city || "");
  const [country, setCountry] = useState(contact.global_contact?.country || "");
  const [linkedinUrl, setLinkedinUrl] = useState(contact.global_contact?.linkedin_url || "");
  const [fundSize, setFundSize] = useState(contact.global_contact?.fund_size ? String(contact.global_contact.fund_size / 1000000) : "");
  const [ticketMin, setTicketMin] = useState(contact.global_contact?.ticket_size_min ? String(contact.global_contact.ticket_size_min / 1000) : "");
  const [ticketMax, setTicketMax] = useState(contact.global_contact?.ticket_size_max ? String(contact.global_contact.ticket_size_max / 1000) : "");
  const [relationshipStatus, setRelationshipStatus] = useState<"prospect" | "warm" | "connected" | "invested">(
    (contact.relationship_status as "prospect" | "warm" | "connected" | "invested") || "prospect"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingOrg, setIsEditingOrg] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isEditingLinkedin, setIsEditingLinkedin] = useState(false);
  const [isEditingFundSize, setIsEditingFundSize] = useState(false);
  const [isEditingTicket, setIsEditingTicket] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempOrg, setTempOrg] = useState("");
  const [tempCity, setTempCity] = useState("");
  const [tempCountry, setTempCountry] = useState("");
  const [tempLinkedin, setTempLinkedin] = useState("");
  const [tempFundSize, setTempFundSize] = useState("");
  const [tempTicketMin, setTempTicketMin] = useState("");
  const [tempTicketMax, setTempTicketMax] = useState("");

  const globalName = contact.global_contact?.name || "Unknown";
  const globalOrganization = contact.global_contact?.organization_name;
  const displayName = localName || globalName;
  const displayOrganization = localOrganization || globalOrganization;
  const entityType = contact.global_contact?.entity_type;
  const stages = contact.global_contact?.stages || [];


  const handleStartEditName = () => {
    setTempName(localName || globalName);
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    setLocalName(tempName);
    setIsEditingName(false);
    setIsEditing(true);
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setTempName("");
  };

  const handleStartEditOrg = () => {
    setTempOrg(localOrganization || globalOrganization || "");
    setIsEditingOrg(true);
  };

  const handleSaveOrg = () => {
    setLocalOrganization(tempOrg);
    setIsEditingOrg(false);
    setIsEditing(true);
  };

  const handleCancelEditOrg = () => {
    setIsEditingOrg(false);
    setTempOrg("");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update investor_contacts (local overrides)
      const { error: localError } = await (supabase
        .from("investor_contacts") as any)
        .update({
          local_name: localName.trim() || null,
          local_organization: localOrganization.trim() || null,
          local_notes: notes.trim() || null,
          local_email: email.trim() || null,
          local_phone: phone.trim() || null,
          relationship_status: relationshipStatus as "prospect" | "warm" | "connected" | "invested",
          last_contact_date: new Date().toISOString(),
        })
        .eq("id", contact.id);

      if (localError) throw localError;

      // Update global_contacts if we have a global_contact_id
      if (contact.global_contact_id) {
        // Get city coordinates if city was changed
        const cityKey = city.toLowerCase().trim();
        const cityCoords = CITY_COORDINATES[cityKey];
        
        const globalUpdate: Record<string, any> = {
          city: city.trim() || null,
          country: country.trim() || null,
          linkedin_url: linkedinUrl.trim() || null,
          fund_size: fundSize ? parseFloat(fundSize) * 1000000 : null,
          ticket_size_min: ticketMin ? parseFloat(ticketMin) * 1000 : null,
          ticket_size_max: ticketMax ? parseFloat(ticketMax) * 1000 : null,
        };

        // Add coordinates if we found a match
        if (cityCoords) {
          globalUpdate.city_lat = cityCoords.lat;
          globalUpdate.city_lng = cityCoords.lng;
          // Auto-fill country if not set
          if (!country.trim()) {
            globalUpdate.country = cityCoords.country;
            setCountry(cityCoords.country);
          }
        }

        const { error: globalError } = await (supabase
          .from("global_contacts") as any)
          .update(globalUpdate)
          .eq("id", contact.global_contact_id);

        if (globalError) {
          console.error("Error updating global contact:", globalError);
          // Don't throw - local update succeeded
        }
      }

      toast({ title: "Contact updated!" });
      setIsEditing(false);
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error updating contact",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await (supabase
        .from("investor_contacts") as any)
        .delete()
        .eq("id", contact.id);

      if (error) throw error;

      toast({ title: "Contact removed from your network" });
      onUpdate();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error removing contact",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {entityType === "fund" ? (
                  <Building className="w-6 h-6 text-primary" />
                ) : (
                  <User className="w-6 h-6 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {/* Editable Name */}
                {isEditingName ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="h-8 text-lg font-semibold"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveName();
                        if (e.key === "Escape") handleCancelEditName();
                      }}
                    />
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSaveName}>
                      <Check className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCancelEditName}>
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="group flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1"
                    onClick={handleStartEditName}
                  >
                    <h2 className="text-xl font-semibold truncate">{displayName}</h2>
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                )}
                
                {/* Editable Organization */}
                {isEditingOrg ? (
                  <div className="flex items-center gap-1 mt-1">
                    <Input
                      value={tempOrg}
                      onChange={(e) => setTempOrg(e.target.value)}
                      className="h-7 text-sm"
                      placeholder="Organization"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveOrg();
                        if (e.key === "Escape") handleCancelEditOrg();
                      }}
                    />
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSaveOrg}>
                      <Check className="h-3 w-3 text-green-500" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleCancelEditOrg}>
                      <X className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="group flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1 mt-0.5"
                    onClick={handleStartEditOrg}
                  >
                    <p className="text-sm text-muted-foreground font-normal truncate">
                      {displayOrganization || "Add organization"}
                    </p>
                    <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Editable Location */}
            {isEditingLocation ? (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  Location
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={tempCity}
                    onChange={(e) => setTempCity(e.target.value)}
                    placeholder="City"
                    className="flex-1"
                    autoFocus
                  />
                  <Input
                    value={tempCountry}
                    onChange={(e) => setTempCountry(e.target.value)}
                    placeholder="Country"
                    className="flex-1"
                  />
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => {
                    setCity(tempCity);
                    setCountry(tempCountry);
                    setIsEditingLocation(false);
                    setIsEditing(true);
                  }}>
                    <Check className="h-4 w-4 text-green-500 mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingLocation(false)}>
                    <X className="h-4 w-4 text-red-500 mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className="flex items-center gap-2 text-sm text-muted-foreground group cursor-pointer hover:bg-muted/50 rounded px-2 py-1 -mx-2"
                onClick={() => {
                  setTempCity(city);
                  setTempCountry(country);
                  setIsEditingLocation(true);
                }}
              >
                <MapPin className="w-4 h-4" />
                <span>{[city, country].filter(Boolean).join(", ") || "Add location"}</span>
                <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
              </div>
            )}

            {/* Editable Fund Size */}
            {isEditingFundSize ? (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5" />
                  Fund Size (in millions €)
                </Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    value={tempFundSize}
                    onChange={(e) => setTempFundSize(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-32"
                    autoFocus
                  />
                  <span className="text-sm text-muted-foreground">M</span>
                  <Button size="sm" variant="ghost" onClick={() => {
                    setFundSize(tempFundSize);
                    setIsEditingFundSize(false);
                    setIsEditing(true);
                  }}>
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingFundSize(false)}>
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className="flex items-center gap-2 text-sm text-muted-foreground group cursor-pointer hover:bg-muted/50 rounded px-2 py-1 -mx-2"
                onClick={() => {
                  setTempFundSize(fundSize);
                  setIsEditingFundSize(true);
                }}
              >
                <DollarSign className="w-4 h-4" />
                <span>Fund Size: {fundSize ? `€${fundSize}M` : "Not set"}</span>
                <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
              </div>
            )}

            {/* Editable Ticket Range */}
            {isEditingTicket ? (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5" />
                  Ticket Size (in K €)
                </Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    value={tempTicketMin}
                    onChange={(e) => setTempTicketMin(e.target.value)}
                    placeholder="Min"
                    className="w-24"
                    autoFocus
                  />
                  <span className="text-sm text-muted-foreground">-</span>
                  <Input
                    type="number"
                    value={tempTicketMax}
                    onChange={(e) => setTempTicketMax(e.target.value)}
                    placeholder="Max"
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">K</span>
                  <Button size="sm" variant="ghost" onClick={() => {
                    setTicketMin(tempTicketMin);
                    setTicketMax(tempTicketMax);
                    setIsEditingTicket(false);
                    setIsEditing(true);
                  }}>
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingTicket(false)}>
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className="flex items-center gap-2 text-sm text-muted-foreground group cursor-pointer hover:bg-muted/50 rounded px-2 py-1 -mx-2"
                onClick={() => {
                  setTempTicketMin(ticketMin);
                  setTempTicketMax(ticketMax);
                  setIsEditingTicket(true);
                }}
              >
                <DollarSign className="w-4 h-4" />
                <span>
                  Ticket: {ticketMin || ticketMax 
                    ? `€${ticketMin || "?"}K - €${ticketMax || "?"}K` 
                    : "Not set"}
                </span>
                <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
              </div>
            )}

            {/* Editable LinkedIn */}
            {isEditingLinkedin ? (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5" />
                  LinkedIn URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={tempLinkedin}
                    onChange={(e) => setTempLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="flex-1"
                    autoFocus
                  />
                  <Button size="sm" variant="ghost" onClick={() => {
                    setLinkedinUrl(tempLinkedin);
                    setIsEditingLinkedin(false);
                    setIsEditing(true);
                  }}>
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingLinkedin(false)}>
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className="flex items-center gap-2 text-sm group cursor-pointer hover:bg-muted/50 rounded px-2 py-1 -mx-2"
                onClick={() => {
                  setTempLinkedin(linkedinUrl);
                  setIsEditingLinkedin(true);
                }}
              >
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                {linkedinUrl ? (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    LinkedIn Profile
                  </a>
                ) : (
                  <span className="text-muted-foreground">Add LinkedIn</span>
                )}
                <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
              </div>
            )}

            {/* Stages */}
            {stages.length > 0 && (
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Investment Stages
                </Label>
                <div className="flex flex-wrap gap-1">
                  {stages.map((stage) => (
                    <span
                      key={stage}
                      className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                    >
                      {stage}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-border my-4" />

            {/* Email */}
            <div>
              <Label htmlFor="email" className="mb-2 block flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setIsEditing(true);
                }}
                placeholder="email@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="mb-2 block flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" />
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setIsEditing(true);
                }}
                placeholder="+1 555 123 4567"
              />
            </div>

            {/* Relationship Status */}
            <div>
              <Label className="mb-2 block">Relationship Status</Label>
              <Select
                value={relationshipStatus}
                onValueChange={(value: "prospect" | "warm" | "connected" | "invested") => {
                  setRelationshipStatus(value);
                  setIsEditing(true);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Private Notes */}
            <div>
              <Label htmlFor="notes" className="mb-2 block">
                Private Notes
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setIsEditing(true);
                }}
                placeholder="Add your private notes about this contact..."
                rows={4}
              />
            </div>

            {/* Last Contact */}
            {contact.last_contact_date && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>
                  Last updated:{" "}
                  {new Date(contact.last_contact_date).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Remove
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                {isEditing && (
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-primary"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Remove Contact
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{displayName}</strong> from your network? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Removing..." : "Remove Contact"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ContactProfileModal;
