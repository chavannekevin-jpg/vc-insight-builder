import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Network, ArrowLeft, ArrowRight, Check, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InviterContactsStep from "@/components/investor/onboarding/InviterContactsStep";
import { InvestorEntranceAnimation } from "@/components/investor/InvestorEntranceAnimation";

// Session key to indicate fresh onboarding completion
const ONBOARDING_ENTRANCE_KEY = "investor_onboarding_entrance";
const INVESTOR_TYPES = [
  { value: "vc", label: "Venture Capital" },
  { value: "family_office", label: "Family Office" },
  { value: "business_angel", label: "Business Angel" },
  { value: "corporate_vc", label: "Corporate VC" },
  { value: "lp", label: "Limited Partner (LP)" },
  { value: "other", label: "Other" },
];

const STAGES = [
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B+",
];

const SECTORS = [
  "AI / Machine Learning",
  "Fintech",
  "SaaS / Enterprise",
  "Healthcare / Biotech",
  "Climate / Cleantech",
  "Consumer",
  "Marketplaces",
  "Crypto / Web3",
  "DeepTech / Hardware",
  "Cybersecurity",
  "EdTech",
  "PropTech / Real Estate",
  "FoodTech / AgTech",
  "Mobility / Transportation",
  "Gaming / Entertainment",
  "HR Tech / Future of Work",
  "LegalTech",
  "InsurTech",
  "Space Tech",
  "Robotics / Automation",
  "Media / Creator Economy",
  "B2B Services",
  "eCommerce / D2C",
  "Social Impact",
];

const REGIONS = [
  // Europe broken down
  { label: "Nordic", value: "Nordic" },
  { label: "DACH (DE/AT/CH)", value: "DACH" },
  { label: "UK & Ireland", value: "UK & Ireland" },
  { label: "Benelux", value: "Benelux" },
  { label: "France", value: "France" },
  { label: "CEE (Central/Eastern Europe)", value: "CEE" },
  { label: "Southern Europe", value: "Southern Europe" },
  { label: "Baltics", value: "Baltics" },
  // Other regions
  { label: "North America", value: "North America" },
  { label: "Latin America", value: "Latin America" },
  { label: "Middle East & Africa", value: "Middle East & Africa" },
  { label: "Asia Pacific", value: "Asia Pacific" },
  { label: "Global", value: "Global" },
];

// Major cities with coordinates for autocomplete
const MAJOR_CITIES = [
  { name: "San Francisco", lat: 37.7749, lng: -122.4194 },
  { name: "New York", lat: 40.7128, lng: -74.0060 },
  { name: "London", lat: 51.5074, lng: -0.1278 },
  { name: "Paris", lat: 48.8566, lng: 2.3522 },
  { name: "Berlin", lat: 52.5200, lng: 13.4050 },
  { name: "Barcelona", lat: 41.3874, lng: 2.1686 },
  { name: "Amsterdam", lat: 52.3676, lng: 4.9041 },
  { name: "Singapore", lat: 1.3521, lng: 103.8198 },
  { name: "Hong Kong", lat: 22.3193, lng: 114.1694 },
  { name: "Tokyo", lat: 35.6762, lng: 139.6503 },
  { name: "Sydney", lat: -33.8688, lng: 151.2093 },
  { name: "Tel Aviv", lat: 32.0853, lng: 34.7818 },
  { name: "Dubai", lat: 25.2048, lng: 55.2708 },
  { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
  { name: "São Paulo", lat: -23.5505, lng: -46.6333 },
  { name: "Mexico City", lat: 19.4326, lng: -99.1332 },
  { name: "Toronto", lat: 43.6532, lng: -79.3832 },
  { name: "Los Angeles", lat: 34.0522, lng: -118.2437 },
  { name: "Boston", lat: 42.3601, lng: -71.0589 },
  { name: "Miami", lat: 25.7617, lng: -80.1918 },
  { name: "Austin", lat: 30.2672, lng: -97.7431 },
  { name: "Seattle", lat: 47.6062, lng: -122.3321 },
  { name: "Chicago", lat: 41.8781, lng: -87.6298 },
  { name: "Denver", lat: 39.7392, lng: -104.9903 },
  { name: "Stockholm", lat: 59.3293, lng: 18.0686 },
  { name: "Zurich", lat: 47.3769, lng: 8.5417 },
  { name: "Munich", lat: 48.1351, lng: 11.5820 },
  { name: "Milan", lat: 45.4642, lng: 9.1900 },
  { name: "Madrid", lat: 40.4168, lng: -3.7038 },
  { name: "Lisbon", lat: 38.7223, lng: -9.1393 },
  { name: "Tallinn", lat: 59.4370, lng: 24.7536 },
];

const InvestorOnboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState("");
  const [investorType, setInvestorType] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [city, setCity] = useState("");
  const [cityLat, setCityLat] = useState<number | null>(null);
  const [cityLng, setCityLng] = useState<number | null>(null);
  const [ticketSizeMin, setTicketSizeMin] = useState("");
  const [ticketSizeMax, setTicketSizeMax] = useState("");
  const [preferredStages, setPreferredStages] = useState<string[]>([]);
  const [geographicFocus, setGeographicFocus] = useState<string[]>([]);
  const [primarySectors, setPrimarySectors] = useState<string[]>([]);
  const [customSector, setCustomSector] = useState("");
  const [sectorSuggestions, setSectorSuggestions] = useState<string[]>([]);

  // Organization suggestions from global database
  interface OrgSuggestion {
    name: string;
    city: string | null;
    stages: string[] | null;
    investment_focus: string[] | null;
  }
  const [orgSuggestions, setOrgSuggestions] = useState<OrgSuggestion[]>([]);
  const [selectedFromGlobal, setSelectedFromGlobal] = useState(false);

  // City suggestions
  const [citySuggestions, setCitySuggestions] = useState<typeof MAJOR_CITIES>([]);

  const TOTAL_STEPS = 5; // Added step 5 for inviter contacts

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/investor/auth");
        return;
      }
      setUserId(session.user.id);

      // Get invite code from session storage
      const storedCode = sessionStorage.getItem("investor_invite_code");
      if (storedCode) {
        setInviteCode(storedCode);
      }

      // Check if already onboarded
      const { data: profile } = await (supabase
        .from("investor_profiles") as any)
        .select("onboarding_completed")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profile?.onboarding_completed) {
        navigate("/investor/dashboard");
      }
    };

    checkAuth();
  }, [navigate]);

  // Search global_contacts for organization name matches
  const handleOrganizationChange = async (value: string) => {
    setOrganizationName(value);
    setSelectedFromGlobal(false);
    
    if (value.length >= 2) {
      try {
        const { data: orgs } = await (supabase
          .from("global_contacts") as any)
          .select("organization_name, city, stages, investment_focus")
          .ilike("organization_name", `%${value}%`)
          .limit(5);
        
        if (orgs) {
          // Deduplicate by organization name
          const uniqueOrgs = orgs.reduce((acc: OrgSuggestion[], curr: any) => {
            if (!acc.find(o => o.name === curr.organization_name)) {
              acc.push({
                name: curr.organization_name,
                city: curr.city,
                stages: curr.stages,
                investment_focus: curr.investment_focus,
              });
            }
            return acc;
          }, []);
          setOrgSuggestions(uniqueOrgs);
        }
      } catch (err) {
        console.error("Error searching organizations:", err);
      }
    } else {
      setOrgSuggestions([]);
    }
  };

  const selectOrganization = (org: OrgSuggestion) => {
    setOrganizationName(org.name);
    setOrgSuggestions([]);
    setSelectedFromGlobal(true);
    
    // Pre-fill other fields if available
    if (org.city) {
      const matchingCity = MAJOR_CITIES.find(c => 
        c.name.toLowerCase() === org.city?.toLowerCase()
      );
      if (matchingCity) {
        setCity(matchingCity.name);
        setCityLat(matchingCity.lat);
        setCityLng(matchingCity.lng);
      } else {
        setCity(org.city);
      }
    }
    
    if (org.stages && Array.isArray(org.stages)) {
      // Map stages to our format
      const mappedStages = org.stages.filter(s => STAGES.includes(s));
      if (mappedStages.length > 0) {
        setPreferredStages(mappedStages);
      }
    }
    
    if (org.investment_focus && Array.isArray(org.investment_focus)) {
      setPrimarySectors(org.investment_focus);
    }
    
    toast({
      title: "Organization found!",
      description: "We've pre-filled some information based on existing data.",
    });
  };

  const handleCityChange = (value: string) => {
    setCity(value);
    if (value.length >= 2) {
      const filtered = MAJOR_CITIES.filter((c) =>
        c.name.toLowerCase().includes(value.toLowerCase())
      );
      setCitySuggestions(filtered.slice(0, 5));
    } else {
      setCitySuggestions([]);
    }
  };

  const selectCity = (selectedCity: typeof MAJOR_CITIES[0]) => {
    setCity(selectedCity.name);
    setCityLat(selectedCity.lat);
    setCityLng(selectedCity.lng);
    setCitySuggestions([]);
  };

  const toggleStage = (stage: string) => {
    setPreferredStages((prev) =>
      prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage]
    );
  };

  const toggleRegion = (region: string) => {
    setGeographicFocus((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    );
  };

  const toggleSector = (sector: string) => {
    setPrimarySectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    );
  };

  const handleCustomSectorChange = (value: string) => {
    setCustomSector(value);
    if (value.length >= 2) {
      // Filter existing sectors that match
      const matchingSectors = SECTORS.filter(
        (s) => s.toLowerCase().includes(value.toLowerCase()) && !primarySectors.includes(s)
      );
      setSectorSuggestions(matchingSectors.slice(0, 5));
    } else {
      setSectorSuggestions([]);
    }
  };

  const addCustomSector = () => {
    const trimmed = customSector.trim();
    if (trimmed && !primarySectors.includes(trimmed)) {
      setPrimarySectors((prev) => [...prev, trimmed]);
      setCustomSector("");
      setSectorSuggestions([]);
    }
  };

  const selectSectorSuggestion = (sector: string) => {
    if (!primarySectors.includes(sector)) {
      setPrimarySectors((prev) => [...prev, sector]);
    }
    setCustomSector("");
    setSectorSuggestions([]);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return fullName.trim() && investorType;
      case 2:
        return city.trim();
      case 3:
        return preferredStages.length > 0;
      case 4:
        return primarySectors.length > 0;
      default:
        return true;
    }
  };

  const handleSaveProfile = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const { error } = await (supabase.from("investor_profiles") as any).upsert({
        id: userId,
        full_name: fullName.trim(),
        investor_type: investorType as any,
        organization_name: organizationName.trim() || null,
        city: city.trim(),
        city_lat: cityLat,
        city_lng: cityLng,
        ticket_size_min: ticketSizeMin ? parseInt(ticketSizeMin) * 1000 : null,
        ticket_size_max: ticketSizeMax ? parseInt(ticketSizeMax) * 1000 : null,
        preferred_stages: preferredStages,
        geographic_focus: geographicFocus,
        primary_sectors: primarySectors,
        invited_by_code: inviteCode,
        onboarding_completed: false, // Will be set to true after contacts step
      });

      if (error) throw error;

      // Create referral record if there's an invite code
      if (inviteCode) {
        const { data: invite } = await (supabase
          .from("investor_invites") as any)
          .select("inviter_id")
          .eq("code", inviteCode)
          .maybeSingle();

        if (invite?.inviter_id) {
          try {
            await (supabase.from("investor_referrals") as any).insert({
              inviter_id: invite.inviter_id,
              invitee_id: userId,
              invite_code: inviteCode,
            });
          } catch {
            // Ignore if already exists
          }
        }
      }

      // Move to contacts step
      setStep(5);
    } catch (error: any) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [showEntranceAnimation, setShowEntranceAnimation] = useState(false);

  const handleComplete = async () => {
    if (!userId) return;

    try {
      await (supabase
        .from("investor_profiles") as any)
        .update({ onboarding_completed: true })
        .eq("id", userId);

      // Clear the invite code from session storage
      sessionStorage.removeItem("investor_invite_code");

      // Mark that we're coming from onboarding for the dashboard entrance
      sessionStorage.setItem(ONBOARDING_ENTRANCE_KEY, "true");

      // Show the cinematic entrance animation
      setShowEntranceAnimation(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEntranceComplete = () => {
    toast({
      title: "Welcome to the network!",
      description: "Your profile is complete.",
    });
    navigate("/investor/dashboard");
  };

  // Show entrance animation when onboarding completes
  if (showEntranceAnimation) {
    return (
      <InvestorEntranceAnimation
        onComplete={handleEntranceComplete}
        companyName={fullName?.split(" ")[0]}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-primary" />
            <span className="font-semibold">Investor Network</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Step {step} of {TOTAL_STEPS}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1 bg-muted">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">Let's start with the basics</h1>
                <p className="text-muted-foreground">Tell us about yourself</p>
              </div>

              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Smith"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Investor Type *</Label>
                <Select value={investorType} onValueChange={setInvestorType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your investor type" />
                  </SelectTrigger>
                  <SelectContent>
                    {INVESTOR_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <Label htmlFor="organization">Fund / Organization Name</Label>
                <Input
                  id="organization"
                  value={organizationName}
                  onChange={(e) => handleOrganizationChange(e.target.value)}
                  placeholder="Start typing to search existing funds..."
                  className="mt-1"
                  autoComplete="off"
                />
                {orgSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg">
                    <div className="px-3 py-1.5 text-xs text-muted-foreground border-b border-border">
                      Organizations in our network
                    </div>
                    {orgSuggestions.map((org) => (
                      <button
                        key={org.name}
                        onClick={() => selectOrganization(org)}
                        className="w-full px-4 py-2 text-left hover:bg-muted transition-colors flex flex-col"
                      >
                        <span className="font-medium">{org.name}</span>
                        {org.city && (
                          <span className="text-sm text-muted-foreground">{org.city}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {selectedFromGlobal && (
                  <p className="mt-1 text-xs text-primary flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Found in network - some fields pre-filled
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">Where are you based?</h1>
                <p className="text-muted-foreground">Your personal location (not fund HQ)</p>
              </div>

              <div className="relative">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  placeholder="Start typing a city..."
                  className="mt-1"
                  autoComplete="off"
                />
                {citySuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg">
                    {citySuggestions.map((suggestion) => (
                      <button
                        key={suggestion.name}
                        onClick={() => selectCity(suggestion)}
                        className="w-full px-4 py-2 text-left hover:bg-muted transition-colors"
                      >
                        {suggestion.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ticketMin">Min Ticket (€K)</Label>
                  <Input
                    id="ticketMin"
                    type="number"
                    value={ticketSizeMin}
                    onChange={(e) => setTicketSizeMin(e.target.value)}
                    placeholder="25"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="ticketMax">Max Ticket (€K)</Label>
                  <Input
                    id="ticketMax"
                    type="number"
                    value={ticketSizeMax}
                    onChange={(e) => setTicketSizeMax(e.target.value)}
                    placeholder="250"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Investment Profile */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">Investment Profile</h1>
                <p className="text-muted-foreground">Select your preferences</p>
              </div>

              <div>
                <Label className="mb-3 block">Preferred Stages *</Label>
                <div className="flex flex-wrap gap-2">
                  {STAGES.map((stage) => (
                    <button
                      key={stage}
                      onClick={() => toggleStage(stage)}
                      className={`px-4 py-2 rounded-full border transition-colors ${
                        preferredStages.includes(stage)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Geographic Focus</Label>
                <p className="text-xs text-muted-foreground mb-3">Select all regions you invest in</p>
                <div className="flex flex-wrap gap-2">
                  {REGIONS.map((region) => (
                    <button
                      key={region.value}
                      onClick={() => toggleRegion(region.value)}
                      className={`px-4 py-2 rounded-full border transition-colors ${
                        geographicFocus.includes(region.value)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {region.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Sectors */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">Sector Focus</h1>
                <p className="text-muted-foreground">Select your primary sectors of interest or add custom ones</p>
              </div>

              {/* Custom Sector Input */}
              <div className="relative">
                <Label htmlFor="customSector" className="mb-2 block">Add Custom Sector</Label>
                <div className="flex gap-2">
                  <Input
                    id="customSector"
                    value={customSector}
                    onChange={(e) => handleCustomSectorChange(e.target.value)}
                    placeholder="Type a sector name..."
                    className="flex-1"
                    autoComplete="off"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomSector();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addCustomSector}
                    disabled={!customSector.trim()}
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                {sectorSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg">
                    {sectorSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => selectSectorSuggestion(suggestion)}
                        className="w-full px-4 py-2 text-left hover:bg-muted transition-colors text-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Sectors */}
              {primarySectors.length > 0 && (
                <div>
                  <Label className="mb-2 block text-sm text-muted-foreground">Selected ({primarySectors.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {primarySectors.map((sector) => (
                      <button
                        key={sector}
                        onClick={() => toggleSector(sector)}
                        className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground border border-primary flex items-center gap-1.5 text-sm"
                      >
                        {sector}
                        <span className="text-primary-foreground/70">×</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Preset Sectors */}
              <div>
                <Label className="mb-3 block">Popular Sectors</Label>
                <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto">
                  {SECTORS.filter(s => !primarySectors.includes(s)).map((sector) => (
                    <button
                      key={sector}
                      onClick={() => toggleSector(sector)}
                      className="px-3 py-1.5 rounded-full border border-border hover:border-primary/50 transition-colors text-sm"
                    >
                      {sector}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Inviter Contacts */}
          {step === 5 && userId && (
            <InviterContactsStep
              inviteCode={inviteCode}
              userId={userId}
              onComplete={handleComplete}
              onSkip={handleComplete}
            />
          )}

          {/* Navigation (only for steps 1-4) */}
          {step < 5 && (
            <div className="flex justify-between mt-10">
              <Button
                variant="outline"
                onClick={() => setStep((prev) => prev - 1)}
                disabled={step === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {step < 4 ? (
                <Button
                  onClick={() => setStep((prev) => prev + 1)}
                  disabled={!canProceed()}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSaveProfile}
                  disabled={!canProceed() || isLoading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isLoading ? "Saving..." : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Continue to Network
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestorOnboarding;
