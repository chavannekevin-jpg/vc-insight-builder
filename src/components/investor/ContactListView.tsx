import { Building, MapPin, User } from "lucide-react";
import type { InvestorContact } from "@/pages/investor/InvestorDashboard";

interface ContactListViewProps {
  contacts: InvestorContact[];
  isLoading: boolean;
  onContactClick: (contact: InvestorContact) => void;
}

const ContactListView = ({ contacts, isLoading, onContactClick }: ContactListViewProps) => {
  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-pulse text-muted-foreground">Loading contacts...</div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg font-medium mb-2">No contacts yet</p>
        <p className="text-muted-foreground">
          Click the + button to add your first contact
        </p>
      </div>
    );
  }

  // Group contacts by first letter of name
  const groupedContacts = contacts.reduce((acc, contact) => {
    const name = contact.local_name || contact.global_contact?.name || "Unknown";
    const firstLetter = name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(contact);
    return acc;
  }, {} as Record<string, InvestorContact[]>);

  const sortedLetters = Object.keys(groupedContacts).sort();

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {sortedLetters.map((letter) => (
        <div key={letter} className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 sticky top-0 bg-background py-1">
            {letter}
          </h3>
          <div className="space-y-2">
            {groupedContacts[letter].map((contact) => {
              const name = contact.local_name || contact.global_contact?.name || "Unknown";
              const organization = contact.local_organization || contact.global_contact?.organization_name;
              const city = contact.global_contact?.city;
              const entityType = contact.global_contact?.entity_type;

              return (
                <button
                  key={contact.id}
                  onClick={() => onContactClick(contact)}
                  className="w-full p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors text-left flex items-start gap-4"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {entityType === "fund" ? (
                      <Building className="w-5 h-5 text-primary" />
                    ) : (
                      <User className="w-5 h-5 text-primary" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{name}</h4>
                      {contact.relationship_status && contact.relationship_status !== "prospect" && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          contact.relationship_status === "connected" 
                            ? "bg-green-500/10 text-green-500" 
                            : contact.relationship_status === "warm"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-blue-500/10 text-blue-500"
                        }`}>
                          {contact.relationship_status}
                        </span>
                      )}
                    </div>
                    {organization && (
                      <p className="text-sm text-muted-foreground truncate">{organization}</p>
                    )}
                    {city && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{city}</span>
                      </div>
                    )}
                  </div>

                  {/* Stages */}
                  {contact.global_contact?.stages && contact.global_contact.stages.length > 0 && (
                    <div className="hidden sm:flex flex-wrap gap-1 max-w-[150px]">
                      {contact.global_contact.stages.slice(0, 2).map((stage) => (
                        <span
                          key={stage}
                          className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                        >
                          {stage}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactListView;
