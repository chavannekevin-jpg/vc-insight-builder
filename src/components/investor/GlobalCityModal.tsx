import { useState } from "react";
import { X, MapPin, Building2, ExternalLink, UserPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { NetworkMarker } from "@/hooks/useGlobalNetwork";

const TYPE_LABELS = {
  active_user: "Active Investor",
  global_contact: "Community Added",
  my_contact: "In My Network",
};

const TYPE_COLORS = {
  active_user: "bg-green-500/20 text-green-600",
  global_contact: "bg-blue-500/20 text-blue-600",
  my_contact: "bg-pink-500/20 text-pink-600",
};

interface GlobalCityModalProps {
  city: string;
  markers: NetworkMarker[];
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onContactAdded: () => void;
}

const GlobalCityModal = ({
  city,
  markers,
  isOpen,
  onClose,
  userId,
  onContactAdded,
}: GlobalCityModalProps) => {
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());

  const handleAddToNetwork = async (marker: NetworkMarker) => {
    if (marker.type === "my_contact") return;

    setAddingIds((prev) => new Set(prev).add(marker.id));

    try {
      if (marker.type === "global_contact") {
        // Add existing global contact to user's network
        const { error } = await supabase.from("investor_contacts").insert({
          investor_id: userId,
          global_contact_id: marker.id,
          relationship_status: "prospect",
        });

        if (error) throw error;
      } else if (marker.type === "active_user") {
        // For active users, we create a global contact entry first, then link it
        // Check if a global contact already exists for this user
        const { data: existing } = await supabase
          .from("global_contacts")
          .select("id")
          .eq("name", marker.name)
          .eq("city", marker.city)
          .maybeSingle();

        let globalContactId: string;

        if (existing) {
          globalContactId = existing.id;
        } else {
          // Create a new global contact
          const { data: newContact, error: createError } = await supabase
            .from("global_contacts")
            .insert({
              entity_type: "investor",
              name: marker.name,
              organization_name: marker.organization_name,
              city: marker.city,
              city_lat: marker.city_lat,
              city_lng: marker.city_lng,
              country: marker.country,
            })
            .select()
            .single();

          if (createError) throw createError;
          globalContactId = newContact.id;
        }

        // Link to user's network
        const { error: linkError } = await supabase.from("investor_contacts").insert({
          investor_id: userId,
          global_contact_id: globalContactId,
          relationship_status: "prospect",
        });

        if (linkError) throw linkError;
      }

      toast({ title: `${marker.name} added to your network!` });
      onContactAdded();
    } catch (error: any) {
      console.error("Error adding to network:", error);
      toast({
        title: "Error adding contact",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAddingIds((prev) => {
        const next = new Set(prev);
        next.delete(marker.id);
        return next;
      });
    }
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

        <p className="text-sm text-muted-foreground -mt-2">
          {markers.length} investor{markers.length !== 1 ? "s" : ""} in this city
        </p>

        <div className="flex-1 overflow-y-auto space-y-2 mt-4">
          {markers.map((marker) => {
            const isAdding = addingIds.has(marker.id);
            const isInNetwork = marker.type === "my_contact";

            return (
              <div
                key={marker.id}
                className="p-3 border border-border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{marker.name}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[marker.type]}`}
                      >
                        {TYPE_LABELS[marker.type]}
                      </span>
                    </div>
                    {marker.organization_name && (
                      <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                        <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{marker.organization_name}</span>
                      </div>
                    )}
                  </div>

                  {isInNetwork ? (
                    <Button variant="ghost" size="sm" disabled className="gap-1.5 text-green-600">
                      <Check className="w-4 h-4" />
                      Added
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddToNetwork(marker)}
                      disabled={isAdding}
                      className="gap-1.5 flex-shrink-0"
                    >
                      <UserPlus className="w-4 h-4" />
                      {isAdding ? "Adding..." : "Add"}
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

export default GlobalCityModal;
