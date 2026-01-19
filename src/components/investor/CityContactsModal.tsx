import { useState } from "react";
import { MapPin, Building2, ExternalLink, Share2, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import type { InvestorContact } from "@/pages/investor/InvestorDashboard";

const STATUS_COLORS: Record<string, string> = {
  prospect: "bg-muted text-muted-foreground",
  warm: "bg-yellow-500/20 text-yellow-600",
  connected: "bg-green-500/20 text-green-600",
  invested: "bg-primary/20 text-primary",
};

interface CityContactsModalProps {
  city: string;
  contacts: InvestorContact[];
  isOpen: boolean;
  onClose: () => void;
  onContactClick: (contact: InvestorContact) => void;
  investorSlug?: string | null;
}

const CityContactsModal = ({
  city,
  contacts,
  isOpen,
  onClose,
  onContactClick,
  investorSlug,
}: CityContactsModalProps) => {
  const [isShareMode, setIsShareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const toggleContact = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const selectAll = () => {
    const allIds = contacts
      .filter((c) => c.global_contact_id)
      .map((c) => c.global_contact_id as string);
    setSelectedIds(new Set(allIds));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const generateShareLink = () => {
    if (!investorSlug) {
      toast({
        title: "Cannot share",
        description: "Set up your profile URL in Calendar Settings first.",
        variant: "destructive",
      });
      return null;
    }
    
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      toast({
        title: "Select contacts",
        description: "Please select at least one contact to share.",
        variant: "destructive",
      });
      return null;
    }

    const encodedCity = encodeURIComponent(city);
    const encodedIds = ids.join(",");
    return `${window.location.origin}/n/${investorSlug}/city/${encodedCity}?contacts=${encodedIds}`;
  };

  const handleCopyLink = async () => {
    const link = generateShareLink();
    if (!link) return;
    
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast({ title: "Share link copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnterShareMode = () => {
    setIsShareMode(true);
    selectAll(); // Pre-select all by default
  };

  const handleExitShareMode = () => {
    setIsShareMode(false);
    setSelectedIds(new Set());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {city}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between -mt-2">
          <p className="text-sm text-muted-foreground">
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""} in this city
          </p>
          
          {!isShareMode ? (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-primary"
              onClick={handleEnterShareMode}
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll}>
                All
              </Button>
              <Button variant="ghost" size="sm" onClick={deselectAll}>
                None
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 mt-4">
          {contacts.map((contact) => {
            const name = contact.local_name || contact.global_contact?.name || "Unknown";
            const org = contact.local_organization || contact.global_contact?.organization_name;
            const status = contact.relationship_status || "prospect";
            const linkedinUrl = contact.global_contact?.linkedin_url;
            const globalId = contact.global_contact_id;
            const isSelected = globalId ? selectedIds.has(globalId) : false;

            return (
              <div
                key={contact.id}
                onClick={() => {
                  if (isShareMode && globalId) {
                    toggleContact(globalId);
                  } else {
                    onContactClick(contact);
                    onClose();
                  }
                }}
                className={`p-3 border rounded-lg cursor-pointer transition-colors group ${
                  isShareMode && isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {isShareMode && (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => globalId && toggleContact(globalId)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1"
                    />
                  )}
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{name}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[status]}`}
                      >
                        {status}
                      </span>
                    </div>
                    {org && (
                      <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                        <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{org}</span>
                      </div>
                    )}
                    {contact.global_contact?.stages && contact.global_contact.stages.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {contact.global_contact.stages.slice(0, 3).map((stage: string) => (
                          <span
                            key={stage}
                            className="text-xs px-2 py-0.5 bg-muted rounded"
                          >
                            {stage}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {!isShareMode && linkedinUrl && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(linkedinUrl, "_blank");
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-border mt-auto space-y-2">
          {isShareMode ? (
            <>
              <Button onClick={handleCopyLink} className="w-full gap-2">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : `Copy link (${selectedIds.size} selected)`}
              </Button>
              <Button variant="outline" onClick={handleExitShareMode} className="w-full">
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose} className="w-full">
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CityContactsModal;
