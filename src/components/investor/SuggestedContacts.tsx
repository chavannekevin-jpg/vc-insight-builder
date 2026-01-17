import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Users,
  MapPin,
  Briefcase,
  Target,
  Plus,
  Check,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
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
  const [isCollapsed, setIsCollapsed] = useState(false);
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
        // Check if contact is in a region the user focuses on
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
        .slice(0, 8);

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
      // Nordic
      stockholm: "Nordic", copenhagen: "Nordic", oslo: "Nordic", helsinki: "Nordic",
      // DACH
      berlin: "DACH", munich: "DACH", zurich: "DACH", vienna: "DACH", frankfurt: "DACH",
      // UK
      london: "UK & Ireland", dublin: "UK & Ireland", edinburgh: "UK & Ireland",
      // Benelux
      amsterdam: "Benelux", brussels: "Benelux", rotterdam: "Benelux",
      // France
      paris: "France", lyon: "France",
      // Baltics
      tallinn: "Baltics", riga: "Baltics", vilnius: "Baltics",
      // Southern Europe
      barcelona: "Southern Europe", madrid: "Southern Europe", lisbon: "Southern Europe", milan: "Southern Europe", rome: "Southern Europe",
      // CEE
      warsaw: "CEE", prague: "CEE", budapest: "CEE", bucharest: "CEE",
    };
    
    return cityRegionMap[cityLower] || null;
  };

  const matchesRegion = (contactRegion: string, userRegion: string): boolean => {
    if (contactRegion === userRegion) return true;
    // Handle legacy "Europe" matching any European sub-region
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
      onContactAdded();
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

  if (isLoading) {
    return (
      <div className="p-4 border-b border-border/50 bg-muted/30">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Finding suggested contacts...
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null; // Don't show anything if no suggestions
  }

  return (
    <div className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full p-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Suggested Contacts</span>
          <Badge variant="secondary" className="text-xs">
            {suggestions.filter((s) => !addedIds.has(s.id)).length} matches
          </Badge>
        </div>
        {isCollapsed ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      {!isCollapsed && (
        <div className="px-3 pb-3">
          <p className="text-xs text-muted-foreground mb-3">
            Based on your location, stages, and sectors
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {suggestions.map((contact) => {
              const isAdded = addedIds.has(contact.id);
              const isAdding = addingId === contact.id;

              return (
                <div
                  key={contact.id}
                  className={`flex-shrink-0 w-56 p-3 rounded-lg border transition-all ${
                    isAdded
                      ? "bg-primary/5 border-primary/20"
                      : "bg-card border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{contact.name}</p>
                      {contact.organization_name && (
                        <p className="text-xs text-muted-foreground truncate">
                          {contact.organization_name}
                        </p>
                      )}
                    </div>
                    {!isAdded && (
                      <button
                        onClick={() => dismissSuggestion(contact.id)}
                        className="text-muted-foreground hover:text-foreground p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Affinity reasons */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {contact.affinityReasons.slice(0, 2).map((reason, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 flex items-center gap-1"
                      >
                        {getAffinityIcon(reason.type)}
                        <span className="truncate max-w-[80px]">{reason.label}</span>
                      </Badge>
                    ))}
                  </div>

                  {/* Add button */}
                  <Button
                    size="sm"
                    variant={isAdded ? "secondary" : "default"}
                    className="w-full h-7 text-xs"
                    onClick={() => addContact(contact)}
                    disabled={isAdded || isAdding}
                  >
                    {isAdding ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : isAdded ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Added
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3 mr-1" />
                        Add to Network
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuggestedContacts;