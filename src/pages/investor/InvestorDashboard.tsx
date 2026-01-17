import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Plus, Search, List, Map as MapIcon, LogOut, User } from "lucide-react";
import InvestorWorldMap from "@/components/investor/InvestorWorldMap";
import AddContactModal from "@/components/investor/AddContactModal";
import ContactListView from "@/components/investor/ContactListView";
import ContactProfileModal from "@/components/investor/ContactProfileModal";
import { useInvestorContacts } from "@/hooks/useInvestorContacts";

export interface InvestorContact {
  id: string;
  global_contact_id: string | null;
  local_name: string | null;
  local_organization: string | null;
  local_notes: string | null;
  relationship_status: string;
  last_contact_date: string | null;
  // From global_contacts join
  global_contact?: {
    id: string;
    name: string;
    organization_name: string | null;
    entity_type: string;
    fund_size: number | null;
    investment_focus: string[];
    stages: string[];
    ticket_size_min: number | null;
    ticket_size_max: number | null;
    city: string | null;
    city_lat: number | null;
    city_lng: number | null;
    country: string | null;
    linkedin_url: string | null;
  };
}

const InvestorDashboard = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<InvestorContact | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const { contacts, isLoading, refetch, cityGroups } = useInvestorContacts(userId);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/investor/auth");
        return;
      }
      setUserId(session.user.id);

      // Fetch investor profile
      const { data: profile } = await supabase
        .from("investor_profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!profile?.onboarding_completed) {
        navigate("/investor/onboarding");
        return;
      }

      setUserProfile(profile);
    };

    checkAuth();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/investor");
  };

  const handleContactAdded = () => {
    refetch();
    setIsAddContactOpen(false);
    toast({ title: "Contact added successfully!" });
  };

  const handleCityClick = (city: string) => {
    setSelectedCity(city);
    // Could open a city-specific modal here
  };

  const filteredContacts = contacts.filter((contact) => {
    const name = contact.local_name || contact.global_contact?.name || "";
    const org = contact.local_organization || contact.global_contact?.organization_name || "";
    const city = contact.global_contact?.city || "";
    const query = searchQuery.toLowerCase();
    return (
      name.toLowerCase().includes(query) ||
      org.toLowerCase().includes(query) ||
      city.toLowerCase().includes(query)
    );
  });

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">Investor Network</h1>
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span>{contacts.length} contacts</span>
              <span>•</span>
              <span>{Object.keys(cityGroups).length} cities</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contacts or cities..."
                className="pl-9 w-64 h-9"
              />
            </div>

            {/* View Toggle */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setViewMode("map")}
                className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors ${
                  viewMode === "map"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <MapIcon className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Map</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors ${
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">List</span>
              </button>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search */}
      <div className="md:hidden p-3 border-b border-border/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts or cities..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        {viewMode === "map" ? (
          <InvestorWorldMap
            contacts={filteredContacts}
            cityGroups={cityGroups}
            onCityClick={handleCityClick}
            onContactClick={setSelectedContact}
            searchQuery={searchQuery}
          />
        ) : (
          <ContactListView
            contacts={filteredContacts}
            isLoading={isLoading}
            onContactClick={setSelectedContact}
          />
        )}

        {/* Floating Add Button */}
        <Button
          onClick={() => setIsAddContactOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Modals */}
      <AddContactModal
        isOpen={isAddContactOpen}
        onClose={() => setIsAddContactOpen(false)}
        onSuccess={handleContactAdded}
        userId={userId}
      />

      {selectedContact && (
        <ContactProfileModal
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onUpdate={refetch}
        />
      )}
    </div>
  );
};

export default InvestorDashboard;
