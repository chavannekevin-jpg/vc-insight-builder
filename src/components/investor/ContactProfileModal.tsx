import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { 
  Building, 
  MapPin, 
  User, 
  ExternalLink, 
  DollarSign,
  Calendar,
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
import type { InvestorContact } from "@/pages/investor/InvestorDashboard";

const RELATIONSHIP_STATUSES = [
  { value: "prospect", label: "Prospect" },
  { value: "warm", label: "Warm" },
  { value: "connected", label: "Connected" },
  { value: "invested", label: "Invested Together" },
];

interface ContactProfileModalProps {
  contact: InvestorContact;
  onClose: () => void;
  onUpdate: () => void;
}

const ContactProfileModal = ({ contact, onClose, onUpdate }: ContactProfileModalProps) => {
  const [notes, setNotes] = useState(contact.local_notes || "");
  const [relationshipStatus, setRelationshipStatus] = useState<string>(
    contact.relationship_status || "prospect"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const name = contact.local_name || contact.global_contact?.name || "Unknown";
  const organization = contact.local_organization || contact.global_contact?.organization_name;
  const city = contact.global_contact?.city;
  const country = contact.global_contact?.country;
  const entityType = contact.global_contact?.entity_type;
  const fundSize = contact.global_contact?.fund_size;
  const stages = contact.global_contact?.stages || [];
  const ticketMin = contact.global_contact?.ticket_size_min;
  const ticketMax = contact.global_contact?.ticket_size_max;
  const linkedinUrl = contact.global_contact?.linkedin_url;

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return null;
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}K`;
    return `€${value}`;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("investor_contacts")
        .update({
          local_notes: notes.trim() || null,
          relationship_status: relationshipStatus,
          last_contact_date: new Date().toISOString(),
        })
        .eq("id", contact.id);

      if (error) throw error;

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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              {entityType === "fund" ? (
                <Building className="w-6 h-6 text-primary" />
              ) : (
                <User className="w-6 h-6 text-primary" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{name}</h2>
              {organization && (
                <p className="text-sm text-muted-foreground font-normal">{organization}</p>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Location */}
          {(city || country) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{[city, country].filter(Boolean).join(", ")}</span>
            </div>
          )}

          {/* Fund Size */}
          {fundSize && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              <span>Fund Size: {formatCurrency(fundSize)}</span>
            </div>
          )}

          {/* Ticket Range */}
          {(ticketMin || ticketMax) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              <span>
                Ticket: {formatCurrency(ticketMin)} - {formatCurrency(ticketMax)}
              </span>
            </div>
          )}

          {/* LinkedIn */}
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              <span>LinkedIn Profile</span>
            </a>
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

          {/* Relationship Status */}
          <div>
            <Label className="mb-2 block">Relationship Status</Label>
            <Select
              value={relationshipStatus}
              onValueChange={(value) => {
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
          <div className="flex justify-end gap-3 pt-4">
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
      </DialogContent>
    </Dialog>
  );
};

export default ContactProfileModal;
