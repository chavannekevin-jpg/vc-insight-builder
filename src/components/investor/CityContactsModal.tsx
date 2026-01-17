import { X, MapPin, Building2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
}

const CityContactsModal = ({
  city,
  contacts,
  isOpen,
  onClose,
  onContactClick,
}: CityContactsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {city}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground -mt-2">
          {contacts.length} contact{contacts.length !== 1 ? "s" : ""} in this city
        </p>

        <div className="flex-1 overflow-y-auto space-y-2 mt-4">
          {contacts.map((contact) => {
            const name = contact.local_name || contact.global_contact?.name || "Unknown";
            const org = contact.local_organization || contact.global_contact?.organization_name;
            const status = contact.relationship_status || "prospect";
            const linkedinUrl = contact.global_contact?.linkedin_url;

            return (
              <div
                key={contact.id}
                onClick={() => {
                  onContactClick(contact);
                  onClose();
                }}
                className="p-3 border border-border rounded-lg hover:border-primary/50 cursor-pointer transition-colors group"
              >
                <div className="flex items-start justify-between gap-3">
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

                  {linkedinUrl && (
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

        <div className="pt-4 border-t border-border mt-auto">
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CityContactsModal;
