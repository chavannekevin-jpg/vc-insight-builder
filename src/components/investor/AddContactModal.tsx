import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { X } from "lucide-react";
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

// Major cities with coordinates
const MAJOR_CITIES = [
  { name: "San Francisco", lat: 37.7749, lng: -122.4194, country: "USA" },
  { name: "New York", lat: 40.7128, lng: -74.0060, country: "USA" },
  { name: "London", lat: 51.5074, lng: -0.1278, country: "UK" },
  { name: "Paris", lat: 48.8566, lng: 2.3522, country: "France" },
  { name: "Berlin", lat: 52.5200, lng: 13.4050, country: "Germany" },
  { name: "Barcelona", lat: 41.3874, lng: 2.1686, country: "Spain" },
  { name: "Amsterdam", lat: 52.3676, lng: 4.9041, country: "Netherlands" },
  { name: "Singapore", lat: 1.3521, lng: 103.8198, country: "Singapore" },
  { name: "Hong Kong", lat: 22.3193, lng: 114.1694, country: "China" },
  { name: "Tokyo", lat: 35.6762, lng: 139.6503, country: "Japan" },
  { name: "Sydney", lat: -33.8688, lng: 151.2093, country: "Australia" },
  { name: "Tel Aviv", lat: 32.0853, lng: 34.7818, country: "Israel" },
  { name: "Dubai", lat: 25.2048, lng: 55.2708, country: "UAE" },
  { name: "Mumbai", lat: 19.0760, lng: 72.8777, country: "India" },
  { name: "São Paulo", lat: -23.5505, lng: -46.6333, country: "Brazil" },
  { name: "Mexico City", lat: 19.4326, lng: -99.1332, country: "Mexico" },
  { name: "Toronto", lat: 43.6532, lng: -79.3832, country: "Canada" },
  { name: "Los Angeles", lat: 34.0522, lng: -118.2437, country: "USA" },
  { name: "Boston", lat: 42.3601, lng: -71.0589, country: "USA" },
  { name: "Miami", lat: 25.7617, lng: -80.1918, country: "USA" },
  { name: "Austin", lat: 30.2672, lng: -97.7431, country: "USA" },
  { name: "Seattle", lat: 47.6062, lng: -122.3321, country: "USA" },
  { name: "Chicago", lat: 41.8781, lng: -87.6298, country: "USA" },
  { name: "Denver", lat: 39.7392, lng: -104.9903, country: "USA" },
  { name: "Stockholm", lat: 59.3293, lng: 18.0686, country: "Sweden" },
  { name: "Zurich", lat: 47.3769, lng: 8.5417, country: "Switzerland" },
  { name: "Munich", lat: 48.1351, lng: 11.5820, country: "Germany" },
  { name: "Milan", lat: 45.4642, lng: 9.1900, country: "Italy" },
  { name: "Madrid", lat: 40.4168, lng: -3.7038, country: "Spain" },
  { name: "Lisbon", lat: 38.7223, lng: -9.1393, country: "Portugal" },
];

const ENTITY_TYPES = [
  { value: "investor", label: "Investor" },
  { value: "fund", label: "Fund" },
];

const STAGES = ["Pre-Seed", "Seed", "Series A", "Series B+"];

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

const AddContactModal = ({ isOpen, onClose, onSuccess, userId }: AddContactModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [entityType, setEntityType] = useState("investor");
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [fundSize, setFundSize] = useState("");
  const [city, setCity] = useState("");
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [ticketMin, setTicketMin] = useState("");
  const [ticketMax, setTicketMax] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<typeof MAJOR_CITIES>([]);
  const [selectedCity, setSelectedCity] = useState<typeof MAJOR_CITIES[0] | null>(null);

  const handleCityChange = (value: string) => {
    setCity(value);
    setSelectedCity(null);
    if (value.length >= 2) {
      const filtered = MAJOR_CITIES.filter((c) =>
        c.name.toLowerCase().includes(value.toLowerCase())
      );
      setCitySuggestions(filtered.slice(0, 5));
    } else {
      setCitySuggestions([]);
    }
  };

  const selectCity = (cityData: typeof MAJOR_CITIES[0]) => {
    setCity(cityData.name);
    setSelectedCity(cityData);
    setCitySuggestions([]);
  };

  const toggleStage = (stage: string) => {
    setSelectedStages((prev) =>
      prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage]
    );
  };

  const resetForm = () => {
    setEntityType("investor");
    setName("");
    setOrganizationName("");
    setFundSize("");
    setCity("");
    setSelectedCity(null);
    setSelectedStages([]);
    setTicketMin("");
    setTicketMax("");
    setLinkedinUrl("");
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      // First, check if a similar global contact exists
      const { data: existingContacts } = await supabase
        .from("global_contacts")
        .select("*")
        .ilike("name", `%${name.trim()}%`)
        .ilike("organization_name", `%${organizationName.trim()}%`)
        .limit(1);

      let globalContactId: string;

      if (existingContacts && existingContacts.length > 0) {
        // Use existing global contact
        globalContactId = existingContacts[0].id;
        
        // Increment contributor count
        await supabase
          .from("global_contacts")
          .update({ contributor_count: (existingContacts[0].contributor_count || 1) + 1 })
          .eq("id", globalContactId);
      } else {
        // Create new global contact
        const { data: newContact, error: globalError } = await supabase
          .from("global_contacts")
          .insert({
            entity_type: entityType as "investor" | "fund",
            name: name.trim(),
            organization_name: organizationName.trim() || null,
            fund_size: fundSize ? parseInt(fundSize) * 1000000 : null,
            stages: selectedStages,
            ticket_size_min: ticketMin ? parseInt(ticketMin) * 1000 : null,
            ticket_size_max: ticketMax ? parseInt(ticketMax) * 1000 : null,
            city: selectedCity?.name || city.trim() || null,
            city_lat: selectedCity?.lat || null,
            city_lng: selectedCity?.lng || null,
            country: selectedCity?.country || null,
            linkedin_url: linkedinUrl.trim() || null,
          })
          .select()
          .single();

        if (globalError) throw globalError;
        globalContactId = newContact.id;
      }

      // Create investor contact (personal relationship)
      const { error: contactError } = await supabase
        .from("investor_contacts")
        .insert({
          investor_id: userId,
          global_contact_id: globalContactId,
          local_notes: notes.trim() || null,
          relationship_status: "prospect",
        });

      if (contactError) throw contactError;

      resetForm();
      onSuccess();
    } catch (error: any) {
      console.error("Error adding contact:", error);
      toast({
        title: "Error adding contact",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Entity Type */}
          <div>
            <Label>Type</Label>
            <Select value={entityType} onValueChange={setEntityType}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
              className="mt-1"
            />
          </div>

          {/* Organization */}
          <div>
            <Label htmlFor="organization">Fund / Organization</Label>
            <Input
              id="organization"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="Acme Ventures"
              className="mt-1"
            />
          </div>

          {/* Fund Size */}
          <div>
            <Label htmlFor="fundSize">Fund Size (M€)</Label>
            <Input
              id="fundSize"
              type="number"
              value={fundSize}
              onChange={(e) => setFundSize(e.target.value)}
              placeholder="100"
              className="mt-1"
            />
          </div>

          {/* City */}
          <div className="relative">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => handleCityChange(e.target.value)}
              placeholder="Start typing a city..."
              className="mt-1"
              autoComplete="off"
            />
            {citySuggestions.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-md shadow-lg">
                {citySuggestions.map((suggestion) => (
                  <button
                    key={suggestion.name}
                    type="button"
                    onClick={() => selectCity(suggestion)}
                    className="w-full px-4 py-2 text-left hover:bg-muted transition-colors"
                  >
                    {suggestion.name}, {suggestion.country}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stages */}
          <div>
            <Label className="mb-2 block">Investment Stages</Label>
            <div className="flex flex-wrap gap-2">
              {STAGES.map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => toggleStage(stage)}
                  className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                    selectedStages.includes(stage)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket Size */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ticketMin">Min Ticket (K€)</Label>
              <Input
                id="ticketMin"
                type="number"
                value={ticketMin}
                onChange={(e) => setTicketMin(e.target.value)}
                placeholder="25"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="ticketMax">Max Ticket (K€)</Label>
              <Input
                id="ticketMax"
                type="number"
                value={ticketMax}
                onChange={(e) => setTicketMax(e.target.value)}
                placeholder="500"
                className="mt-1"
              />
            </div>
          </div>

          {/* LinkedIn */}
          <div>
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="mt-1"
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Private Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any private notes about this contact..."
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-primary">
              {isLoading ? "Adding..." : "Add Contact"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddContactModal;
