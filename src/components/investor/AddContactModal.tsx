import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
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
import { UserPlus, Upload, Building2, CheckCircle } from "lucide-react";

// Major cities with coordinates
const MAJOR_CITIES = [
  // USA
  { name: "San Francisco", lat: 37.7749, lng: -122.4194, country: "USA" },
  { name: "New York", lat: 40.7128, lng: -74.0060, country: "USA" },
  { name: "Los Angeles", lat: 34.0522, lng: -118.2437, country: "USA" },
  { name: "Boston", lat: 42.3601, lng: -71.0589, country: "USA" },
  { name: "Miami", lat: 25.7617, lng: -80.1918, country: "USA" },
  { name: "Austin", lat: 30.2672, lng: -97.7431, country: "USA" },
  { name: "Seattle", lat: 47.6062, lng: -122.3321, country: "USA" },
  { name: "Chicago", lat: 41.8781, lng: -87.6298, country: "USA" },
  { name: "Denver", lat: 39.7392, lng: -104.9903, country: "USA" },
  { name: "Atlanta", lat: 33.7490, lng: -84.3880, country: "USA" },
  { name: "Washington DC", lat: 38.9072, lng: -77.0369, country: "USA" },
  // Europe - Western
  { name: "London", lat: 51.5074, lng: -0.1278, country: "UK" },
  { name: "Paris", lat: 48.8566, lng: 2.3522, country: "France" },
  { name: "Berlin", lat: 52.5200, lng: 13.4050, country: "Germany" },
  { name: "Munich", lat: 48.1351, lng: 11.5820, country: "Germany" },
  { name: "Frankfurt", lat: 50.1109, lng: 8.6821, country: "Germany" },
  { name: "Amsterdam", lat: 52.3676, lng: 4.9041, country: "Netherlands" },
  { name: "Brussels", lat: 50.8503, lng: 4.3517, country: "Belgium" },
  { name: "Zurich", lat: 47.3769, lng: 8.5417, country: "Switzerland" },
  { name: "Geneva", lat: 46.2044, lng: 6.1432, country: "Switzerland" },
  { name: "Vienna", lat: 48.2082, lng: 16.3738, country: "Austria" },
  { name: "Dublin", lat: 53.3498, lng: -6.2603, country: "Ireland" },
  { name: "Edinburgh", lat: 55.9533, lng: -3.1883, country: "UK" },
  { name: "Manchester", lat: 53.4808, lng: -2.2426, country: "UK" },
  // Europe - Southern
  { name: "Barcelona", lat: 41.3874, lng: 2.1686, country: "Spain" },
  { name: "Madrid", lat: 40.4168, lng: -3.7038, country: "Spain" },
  { name: "Milan", lat: 45.4642, lng: 9.1900, country: "Italy" },
  { name: "Rome", lat: 41.9028, lng: 12.4964, country: "Italy" },
  { name: "Lisbon", lat: 38.7223, lng: -9.1393, country: "Portugal" },
  { name: "Athens", lat: 37.9838, lng: 23.7275, country: "Greece" },
  // Europe - Nordic & Baltic
  { name: "Stockholm", lat: 59.3293, lng: 18.0686, country: "Sweden" },
  { name: "Copenhagen", lat: 55.6761, lng: 12.5683, country: "Denmark" },
  { name: "Oslo", lat: 59.9139, lng: 10.7522, country: "Norway" },
  { name: "Helsinki", lat: 60.1699, lng: 24.9384, country: "Finland" },
  { name: "Tallinn", lat: 59.4370, lng: 24.7536, country: "Estonia" },
  { name: "Riga", lat: 56.9496, lng: 24.1052, country: "Latvia" },
  { name: "Vilnius", lat: 54.6872, lng: 25.2797, country: "Lithuania" },
  // Europe - Central & Eastern
  { name: "Warsaw", lat: 52.2297, lng: 21.0122, country: "Poland" },
  { name: "Krakow", lat: 50.0647, lng: 19.9450, country: "Poland" },
  { name: "Prague", lat: 50.0755, lng: 14.4378, country: "Czech Republic" },
  { name: "Budapest", lat: 47.4979, lng: 19.0402, country: "Hungary" },
  { name: "Bucharest", lat: 44.4268, lng: 26.1025, country: "Romania" },
  { name: "Kyiv", lat: 50.4501, lng: 30.5234, country: "Ukraine" },
  // Asia
  { name: "Singapore", lat: 1.3521, lng: 103.8198, country: "Singapore" },
  { name: "Hong Kong", lat: 22.3193, lng: 114.1694, country: "China" },
  { name: "Tokyo", lat: 35.6762, lng: 139.6503, country: "Japan" },
  { name: "Shanghai", lat: 31.2304, lng: 121.4737, country: "China" },
  { name: "Beijing", lat: 39.9042, lng: 116.4074, country: "China" },
  { name: "Seoul", lat: 37.5665, lng: 126.9780, country: "South Korea" },
  { name: "Bangalore", lat: 12.9716, lng: 77.5946, country: "India" },
  { name: "Mumbai", lat: 19.0760, lng: 72.8777, country: "India" },
  { name: "New Delhi", lat: 28.6139, lng: 77.2090, country: "India" },
  { name: "Jakarta", lat: -6.2088, lng: 106.8456, country: "Indonesia" },
  { name: "Bangkok", lat: 13.7563, lng: 100.5018, country: "Thailand" },
  // Middle East
  { name: "Tel Aviv", lat: 32.0853, lng: 34.7818, country: "Israel" },
  { name: "Dubai", lat: 25.2048, lng: 55.2708, country: "UAE" },
  { name: "Abu Dhabi", lat: 24.4539, lng: 54.3773, country: "UAE" },
  { name: "Riyadh", lat: 24.7136, lng: 46.6753, country: "Saudi Arabia" },
  // Oceania
  { name: "Sydney", lat: -33.8688, lng: 151.2093, country: "Australia" },
  { name: "Melbourne", lat: -37.8136, lng: 144.9631, country: "Australia" },
  { name: "Auckland", lat: -36.8509, lng: 174.7645, country: "New Zealand" },
  // Americas
  { name: "Toronto", lat: 43.6532, lng: -79.3832, country: "Canada" },
  { name: "Vancouver", lat: 49.2827, lng: -123.1207, country: "Canada" },
  { name: "Montreal", lat: 45.5017, lng: -73.5673, country: "Canada" },
  { name: "São Paulo", lat: -23.5505, lng: -46.6333, country: "Brazil" },
  { name: "Mexico City", lat: 19.4326, lng: -99.1332, country: "Mexico" },
  { name: "Buenos Aires", lat: -34.6037, lng: -58.3816, country: "Argentina" },
  { name: "Santiago", lat: -33.4489, lng: -70.6693, country: "Chile" },
  { name: "Bogotá", lat: 4.7110, lng: -74.0721, country: "Colombia" },
  // Africa
  { name: "Cape Town", lat: -33.9249, lng: 18.4241, country: "South Africa" },
  { name: "Lagos", lat: 6.5244, lng: 3.3792, country: "Nigeria" },
  { name: "Nairobi", lat: -1.2921, lng: 36.8219, country: "Kenya" },
  { name: "Cairo", lat: 30.0444, lng: 31.2357, country: "Egypt" },
];

const ENTITY_TYPES = [
  { value: "investor", label: "Investor" },
  { value: "fund", label: "Fund" },
];

const STAGES = ["Pre-Seed", "Seed", "Series A", "Series B+"];

interface FundSuggestion {
  id: string;
  organization_name: string;
  city: string | null;
  country: string | null;
  fund_size: number | null;
  stages: string[] | null;
  ticket_size_min: number | null;
  ticket_size_max: number | null;
  city_lat: number | null;
  city_lng: number | null;
}

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onBulkImport?: () => void;
  userId: string;
}

type ModalMode = "choose" | "manual";

const AddContactModal = ({ isOpen, onClose, onSuccess, onBulkImport, userId }: AddContactModalProps) => {
  const [mode, setMode] = useState<ModalMode>("choose");
  const [isLoading, setIsLoading] = useState(false);
  const [entityType, setEntityType] = useState("investor");
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fundSize, setFundSize] = useState("");
  const [city, setCity] = useState("");
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [ticketMin, setTicketMin] = useState("");
  const [ticketMax, setTicketMax] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<typeof MAJOR_CITIES>([]);
  const [selectedCity, setSelectedCity] = useState<typeof MAJOR_CITIES[0] | null>(null);
  
  // Fund suggestions state
  const [fundSuggestions, setFundSuggestions] = useState<FundSuggestion[]>([]);
  const [selectedFund, setSelectedFund] = useState<FundSuggestion | null>(null);
  const [isSearchingFunds, setIsSearchingFunds] = useState(false);

  // Debounced fund search
  const searchFunds = useCallback(async (query: string) => {
    if (query.length < 2) {
      setFundSuggestions([]);
      return;
    }

    setIsSearchingFunds(true);
    try {
      // Search for funds with matching organization name
      const { data, error } = await supabase
        .from("global_contacts")
        .select("id, organization_name, city, country, fund_size, stages, ticket_size_min, ticket_size_max, city_lat, city_lng")
        .not("organization_name", "is", null)
        .ilike("organization_name", `%${query}%`)
        .limit(10);

      if (error) {
        console.error("Error in fund search query:", error);
        throw error;
      }

      console.log("Fund search results for", query, ":", data);

      // Remove duplicates by organization name (keep first occurrence with most data)
      const uniqueFunds = (data || []).reduce((acc: FundSuggestion[], curr: any) => {
        const existingIndex = acc.findIndex(
          f => f.organization_name?.toLowerCase() === curr.organization_name?.toLowerCase()
        );
        if (existingIndex === -1) {
          acc.push(curr as FundSuggestion);
        }
        return acc;
      }, []);

      setFundSuggestions(uniqueFunds.slice(0, 5));
    } catch (error) {
      console.error("Error searching funds:", error);
      setFundSuggestions([]);
    } finally {
      setIsSearchingFunds(false);
    }
  }, []);

  // Debounce the fund search
  useEffect(() => {
    if (selectedFund) return; // Don't search if fund is already selected
    
    const timer = setTimeout(() => {
      searchFunds(organizationName);
    }, 300);

    return () => clearTimeout(timer);
  }, [organizationName, searchFunds, selectedFund]);

  const selectFund = (fund: FundSuggestion) => {
    setSelectedFund(fund);
    setOrganizationName(fund.organization_name);
    setFundSuggestions([]);
    
    // Auto-fill fund data
    if (fund.city) {
      setCity(fund.city);
      if (fund.city_lat && fund.city_lng) {
        const matchingCity = MAJOR_CITIES.find(c => c.name.toLowerCase() === fund.city?.toLowerCase());
        if (matchingCity) {
          setSelectedCity(matchingCity);
        } else {
          setSelectedCity({
            name: fund.city,
            lat: fund.city_lat,
            lng: fund.city_lng,
            country: fund.country || ""
          });
        }
      }
    }
    if (fund.fund_size) {
      setFundSize(String(fund.fund_size / 1000000));
    }
    if (fund.stages && Array.isArray(fund.stages)) {
      setSelectedStages(fund.stages);
    }
    if (fund.ticket_size_min) {
      setTicketMin(String(fund.ticket_size_min / 1000));
    }
    if (fund.ticket_size_max) {
      setTicketMax(String(fund.ticket_size_max / 1000));
    }

    toast({
      title: "Fund data loaded",
      description: `Pre-filled data from ${fund.organization_name}`,
    });
  };

  const clearSelectedFund = () => {
    setSelectedFund(null);
  };

  const handleOrganizationChange = (value: string) => {
    setOrganizationName(value);
    if (selectedFund && value !== selectedFund.organization_name) {
      setSelectedFund(null);
    }
  };

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
    setEmail("");
    setPhone("");
    setFundSize("");
    setCity("");
    setSelectedCity(null);
    setSelectedStages([]);
    setTicketMin("");
    setTicketMax("");
    setLinkedinUrl("");
    setNotes("");
    setFundSuggestions([]);
    setSelectedFund(null);
  };

  const handleClose = () => {
    resetForm();
    setMode("choose");
    onClose();
  };

  const handleBulkImportClick = () => {
    handleClose();
    onBulkImport?.();
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
      const { data: existingContacts } = await (supabase
        .from("global_contacts") as any)
        .select("*")
        .ilike("name", `%${name.trim()}%`)
        .ilike("organization_name", `%${organizationName.trim()}%`)
        .limit(1);

      let globalContactId: string;

      if (existingContacts && existingContacts.length > 0) {
        // Use existing global contact
        globalContactId = existingContacts[0].id;
        
        // Increment contributor count
        await (supabase
          .from("global_contacts") as any)
          .update({ contributor_count: (existingContacts[0].contributor_count || 1) + 1 })
          .eq("id", globalContactId);
      } else {
        // Create new global contact
        const { data: newContact, error: globalError } = await (supabase
          .from("global_contacts") as any)
          .insert({
            entity_type: entityType as "investor" | "fund",
            name: name.trim(),
            organization_name: organizationName.trim() || null,
            email: email.trim() || null,
            phone: phone.trim() || null,
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
      const { error: contactError } = await (supabase
        .from("investor_contacts") as any)
        .insert({
          investor_id: userId,
          global_contact_id: globalContactId,
          local_notes: notes.trim() || null,
          local_email: email.trim() || null,
          local_phone: phone.trim() || null,
          relationship_status: "prospect",
        });

      if (contactError) throw contactError;

      resetForm();
      setMode("choose");
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "choose" ? "Add Contacts" : "Add New Contact"}
          </DialogTitle>
        </DialogHeader>

        {mode === "choose" ? (
          <div className="grid grid-cols-2 gap-4 py-4">
            <button
              onClick={() => setMode("manual")}
              className="flex flex-col items-center gap-3 p-6 border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium">Add Manually</p>
                <p className="text-sm text-muted-foreground">
                  Enter contact details one by one
                </p>
              </div>
            </button>

            {onBulkImport && (
              <button
                onClick={handleBulkImportClick}
                className="flex flex-col items-center gap-3 p-6 border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Import from File</p>
                  <p className="text-sm text-muted-foreground">
                    Upload Excel or CSV file
                  </p>
                </div>
              </button>
            )}
          </div>
        ) : (
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
          <div className="relative">
            <Label htmlFor="organization">Fund / Organization</Label>
            <div className="relative mt-1">
              <Input
                id="organization"
                value={organizationName}
                onChange={(e) => handleOrganizationChange(e.target.value)}
                placeholder="Acme Ventures"
                autoComplete="off"
              />
              {selectedFund && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  <span>Linked</span>
                </div>
              )}
            </div>
            
            {/* Fund suggestions dropdown */}
            {fundSuggestions.length > 0 && !selectedFund && (
              <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-md shadow-lg overflow-hidden">
                <div className="px-3 py-1.5 bg-muted/50 border-b border-border">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    Existing funds in database
                  </span>
                </div>
                {fundSuggestions.map((fund) => (
                  <button
                    key={fund.id}
                    type="button"
                    onClick={() => selectFund(fund)}
                    className="w-full px-4 py-2.5 text-left hover:bg-muted transition-colors flex items-start gap-3 border-b border-border last:border-b-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{fund.organization_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {fund.city && `${fund.city}${fund.country ? `, ${fund.country}` : ''}`}
                        {fund.fund_size && ` • €${(fund.fund_size / 1000000).toFixed(0)}M fund`}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {isSearchingFunds && organizationName.length >= 2 && !selectedFund && (
              <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-md shadow-lg px-4 py-3">
                <span className="text-sm text-muted-foreground">Searching funds...</span>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="mt-1"
            />
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 123 4567"
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
            <Button type="button" variant="outline" onClick={() => setMode("choose")}>
              Back
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-primary">
              {isLoading ? "Adding..." : "Add Contact"}
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddContactModal;
