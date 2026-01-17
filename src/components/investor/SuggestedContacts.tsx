import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MapPin,
  Briefcase,
  Target,
  Plus,
  Check,
  Loader2,
  X,
  Sparkles,
  Users,
} from "lucide-react";

interface SuggestedContact {
  id: string;
  name: string;
  organization_name: string | null;
  city: string | null;
  stages: string[] | null;
  investment_focus: string[] | null;
  affinityScore: number;
  affinityReasons: { type: string; label: string }[];
}

interface SuggestedContactsProps {
  userId: string;
  userProfile: any;
  existingContactIds: string[];
  onContactAdded: () => void;
}

const SuggestedContacts = ({
  userId,
  userProfile,
  existingContactIds,
  onContactAdded,
}: SuggestedContactsProps) => {
  const [suggestions, setSuggestions] = useState<SuggestedContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (userId && userProfile) {
      fetchSuggestions();
    }
  }, [userId, userProfile, existingContactIds]);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      // Get all global contacts not already in user's network
      const { data: globalContacts, error } = await (supabase
        .from("global_contacts") as any)
        .select("*")
        .not("id", "in", `(${existingContactIds.length > 0 ? existingContactIds.join(",") : "00000000-0000-0000-0000-000000000000"})`)
        .limit(100);

      if (error) throw error;

      // Score each contact based on affinity
      const scored = (globalContacts || []).map((contact: any) => {
        const reasons: { type: string; label: string }[] = [];
        let score = 0;

        // Location affinity
        if (userProfile.city && contact.city?.toLowerCase() === userProfile.city.toLowerCase()) {
          score += 30;
          reasons.push({ type: "location", label: `Same city (${contact.city})` });
        }

        // Stage overlap
        const userStages = userProfile.preferred_stages || [];
        const contactStages = contact.stages || [];
        const stageOverlap = userStages.filter((s: string) => contactStages.includes(s));
        if (stageOverlap.length > 0) {
          score += stageOverlap.length * 15;
          reasons.push({ type: "stage", label: `${stageOverlap.join(", ")}` });
        }

        // Sector overlap
        const userSectors = userProfile.primary_sectors || [];
        const contactFocus = contact.investment_focus || [];
        const sectorOverlap = userSectors.filter((s: string) => 
          contactFocus.some((f: string) => f.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(f.toLowerCase()))
        );
        if (sectorOverlap.length > 0) {
          score += sectorOverlap.length * 20;
          reasons.push({ type: "sector", label: `${sectorOverlap.slice(0, 2).join(", ")}` });
        }

        // Geographic focus overlap
        const userGeo = userProfile.geographic_focus || [];
        const contactRegion = getRegionFromCity(contact.city);
        if (contactRegion && userGeo.some((g: string) => matchesRegion(contactRegion, g))) {
          score += 10;
          reasons.push({ type: "geo", label: "Geographic focus match" });
        }

        return {
          id: contact.id,
          name: contact.name,
          organization_name: contact.organization_name,
          city: contact.city,
          stages: contact.stages,
          investment_focus: contact.investment_focus,
          affinityScore: score,
          affinityReasons: reasons,
        };
      });

      // Filter to only show contacts with some affinity, sort by score
      const filtered = scored
        .filter((c: SuggestedContact) => c.affinityScore > 0 && !dismissedIds.has(c.id))
        .sort((a: SuggestedContact, b: SuggestedContact) => b.affinityScore - a.affinityScore)
        .slice(0, 10);

      setSuggestions(filtered);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getRegionFromCity = (city: string | null): string | null => {
    if (!city) return null;
    const cityLower = city.toLowerCase();
    
    const cityRegionMap: Record<string, string> = {
      stockholm: "Nordic", copenhagen: "Nordic", oslo: "Nordic", helsinki: "Nordic",
      berlin: "DACH", munich: "DACH", zurich: "DACH", vienna: "DACH", frankfurt: "DACH",
      london: "UK & Ireland", dublin: "UK & Ireland", edinburgh: "UK & Ireland",
      amsterdam: "Benelux", brussels: "Benelux", rotterdam: "Benelux",
      paris: "France", lyon: "France",
      tallinn: "Baltics", riga: "Baltics", vilnius: "Baltics",
      barcelona: "Southern Europe", madrid: "Southern Europe", lisbon: "Southern Europe", milan: "Southern Europe", rome: "Southern Europe",
      warsaw: "CEE", prague: "CEE", budapest: "CEE", bucharest: "CEE",
    };
    
    return cityRegionMap[cityLower] || null;
  };

  const matchesRegion = (contactRegion: string, userRegion: string): boolean => {
    if (contactRegion === userRegion) return true;
    if (userRegion === "Europe") {
      return ["Nordic", "DACH", "UK & Ireland", "Benelux", "France", "Baltics", "Southern Europe", "CEE"].includes(contactRegion);
    }
    return false;
  };

  const addContact = async (contact: SuggestedContact) => {
    setAddingId(contact.id);
    try {
      const { error } = await (supabase.from("investor_contacts") as any).insert({
        investor_id: userId,
        global_contact_id: contact.id,
        local_name: contact.name,
        local_organization: contact.organization_name,
      });

      if (error) throw error;

      setAddedIds((prev) => new Set([...prev, contact.id]));
      // Notify parent after a short delay to keep UI fluid
      setTimeout(() => onContactAdded(), 300);
      toast({
        title: "Contact added!",
        description: `${contact.name} has been added to your network.`,
      });
    } catch (err: any) {
      if (err.code === "23505") {
        setAddedIds((prev) => new Set([...prev, contact.id]));
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

  const dismissSuggestion = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
    setSuggestions((prev) => prev.filter((c) => c.id !== id));
  };

  const getAffinityIcon = (type: string) => {
    switch (type) {
      case "location":
        return <MapPin className="w-3 h-3" />;
      case "stage":
        return <Target className="w-3 h-3" />;
      case "sector":
        return <Briefcase className="w-3 h-3" />;
      case "geo":
        return <Users className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const pendingCount = suggestions.filter((s) => !addedIds.has(s.id)).length;

  // Always show the button, even when loading or empty (so users know feature exists)
  if (isLoading) {
    return (
      <button
        disabled
        className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-muted bg-muted/30 text-sm opacity-60"
      >
        <Sparkles className="w-4 h-4 text-muted-foreground" />
        <span className="text-muted-foreground font-medium">Suggestions</span>
      </button>
    );
  }

  return (
    <>
      {/* Compact notification badge in toolbar */}
      <button
        onClick={() => setIsModalOpen(true)}
        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors text-sm ${
          pendingCount > 0
            ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
            : "border-muted bg-muted/30 hover:bg-muted/50"
        }`}
      >
        <Sparkles className={`w-4 h-4 ${pendingCount > 0 ? "text-primary" : "text-muted-foreground"}`} />
        <span className={`font-medium ${pendingCount > 0 ? "text-primary" : "text-muted-foreground"}`}>
          Suggestions
        </span>
        {pendingCount > 0 && (
          <Badge 
            variant="default" 
            className="ml-1 h-5 min-w-[20px] px-1.5 text-xs bg-primary text-primary-foreground"
          >
            {pendingCount}
          </Badge>
        )}
      </button>

      {/* Suggestions Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Suggested Contacts
            </DialogTitle>
          </DialogHeader>
          
          <p className="text-sm text-muted-foreground">
            Based on your location, stages, and sectors
          </p>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {suggestions.length === 0 || pendingCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">
                  {suggestions.length === 0
                    ? "No suggestions available right now"
                    : "All suggestions reviewed!"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Check back later as more investors join the network
                </p>
              </div>
            ) : (
              suggestions.map((contact) => {
                const isAdded = addedIds.has(contact.id);
                const isAdding = addingId === contact.id;

                return (
                  <div
                    key={contact.id}
                    className={`p-3 rounded-lg border transition-all ${
                      isAdded
                        ? "bg-primary/5 border-primary/20"
                        : "bg-card border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{contact.name}</p>
                          {contact.city && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {contact.city}
                            </span>
                          )}
                        </div>
                        {contact.organization_name && (
                          <p className="text-sm text-muted-foreground truncate">
                            {contact.organization_name}
                          </p>
                        )}
                        
                        {/* Affinity reasons */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {contact.affinityReasons.map((reason, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 flex items-center gap-1"
                            >
                              {getAffinityIcon(reason.type)}
                              <span className="truncate max-w-[100px]">{reason.label}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {!isAdded && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => dismissSuggestion(contact.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant={isAdded ? "secondary" : "default"}
                          className="h-8"
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
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SuggestedContacts;