import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Check, Plus, User, Building2, MapPin, Loader2 } from "lucide-react";

interface InviterContact {
  id: string;
  global_contact_id: string | null;
  local_name: string | null;
  local_organization: string | null;
  global_contact: {
    id: string;
    name: string;
    organization_name: string | null;
    city: string | null;
    city_lat: number | null;
    city_lng: number | null;
    entity_type: string;
  } | null;
}

interface InviterContactsStepProps {
  inviteCode: string | null;
  userId: string;
  onComplete: () => void;
  onSkip: () => void;
}

const InviterContactsStep = ({
  inviteCode,
  userId,
  onComplete,
  onSkip,
}: InviterContactsStepProps) => {
  const [inviterContacts, setInviterContacts] = useState<InviterContact[]>([]);
  const [addedContactIds, setAddedContactIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [inviterName, setInviterName] = useState<string>("");

  useEffect(() => {
    if (inviteCode) {
      fetchInviterContacts();
    } else {
      setIsLoading(false);
    }
  }, [inviteCode]);

  const fetchInviterContacts = async () => {
    try {
      // Get the inviter from the invite code
      const { data: invite, error: inviteError } = await supabase
        .from("investor_invites")
        .select(`
          inviter_id,
          inviter:investor_profiles!investor_invites_inviter_id_fkey(full_name)
        `)
        .eq("code", inviteCode)
        .maybeSingle();

      if (inviteError || !invite) {
        console.error("Invite not found:", inviteError);
        setIsLoading(false);
        return;
      }

      setInviterName((invite.inviter as any)?.full_name || "Your inviter");

      // Get the inviter's contacts
      const { data: contacts, error: contactsError } = await supabase
        .from("investor_contacts")
        .select(`
          id,
          global_contact_id,
          local_name,
          local_organization,
          global_contact:global_contacts(
            id,
            name,
            organization_name,
            city,
            city_lat,
            city_lng,
            entity_type
          )
        `)
        .eq("investor_id", invite.inviter_id)
        .limit(20);

      if (contactsError) throw contactsError;
      setInviterContacts(contacts || []);
    } catch (err) {
      console.error("Error fetching inviter contacts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addContact = async (contact: InviterContact) => {
    if (addedContactIds.has(contact.id)) return;

    setAddingId(contact.id);
    try {
      // Add to user's contacts, referencing the global contact
      const { error } = await supabase.from("investor_contacts").insert({
        investor_id: userId,
        global_contact_id: contact.global_contact_id,
        local_name: contact.local_name || contact.global_contact?.name,
        local_organization: contact.local_organization || contact.global_contact?.organization_name,
      });

      if (error) throw error;

      setAddedContactIds((prev) => new Set([...prev, contact.id]));
      toast({
        title: "Contact added!",
        description: `${contact.local_name || contact.global_contact?.name} has been added to your network.`,
      });
    } catch (err: any) {
      // Handle duplicate
      if (err.code === "23505") {
        setAddedContactIds((prev) => new Set([...prev, contact.id]));
      } else {
        toast({
          title: "Failed to add contact",
          description: err.message,
          variant: "destructive",
        });
      }
    } finally {
      setAddingId(null);
    }
  };

  const addAllContacts = async () => {
    const contactsToAdd = inviterContacts.filter((c) => !addedContactIds.has(c.id));
    for (const contact of contactsToAdd) {
      await addContact(contact);
    }
    toast({
      title: "All contacts added!",
      description: `Added ${contactsToAdd.length} contacts to your network.`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading suggested contacts...</p>
      </div>
    );
  }

  if (!inviteCode || inviterContacts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          No suggested contacts available. You can add contacts manually after completing setup.
        </p>
        <Button onClick={onSkip}>Continue to Dashboard</Button>
      </div>
    );
  }

  const allAdded = inviterContacts.every((c) => addedContactIds.has(c.id));

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Start Building Your Network</h1>
        <p className="text-muted-foreground">
          {inviterName} has shared their network with you. Add contacts to get started!
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button
          onClick={addAllContacts}
          disabled={allAdded}
          className="flex-1"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add All ({inviterContacts.length - addedContactIds.size})
        </Button>
        <Button variant="outline" onClick={onSkip}>
          Skip for Now
        </Button>
      </div>

      {/* Contacts Grid */}
      <div className="grid gap-3 max-h-[400px] overflow-y-auto">
        {inviterContacts.map((contact) => {
          const name = contact.local_name || contact.global_contact?.name || "Unknown";
          const org = contact.local_organization || contact.global_contact?.organization_name;
          const city = contact.global_contact?.city;
          const isAdded = addedContactIds.has(contact.id);
          const isAdding = addingId === contact.id;

          return (
            <div
              key={contact.id}
              className={`p-4 border rounded-lg flex items-center gap-4 transition-colors ${
                isAdded ? "bg-primary/5 border-primary/20" : "border-border hover:bg-muted/50"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {org && (
                    <span className="flex items-center gap-1 truncate">
                      <Building2 className="w-3 h-3" />
                      {org}
                    </span>
                  )}
                  {city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {city}
                    </span>
                  )}
                </div>
              </div>

              <Button
                size="sm"
                variant={isAdded ? "secondary" : "default"}
                onClick={() => addContact(contact)}
                disabled={isAdded || isAdding}
              >
                {isAdding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isAdded ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Added
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Continue Button */}
      <div className="pt-4 border-t border-border">
        <Button onClick={onComplete} className="w-full" size="lg">
          Continue to Dashboard
          {addedContactIds.size > 0 && (
            <span className="ml-2 text-sm opacity-80">
              ({addedContactIds.size} contacts added)
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default InviterContactsStep;
