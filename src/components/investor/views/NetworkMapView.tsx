import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, List, Map as MapIcon, Users, Globe } from "lucide-react";
import InvestorWorldMap from "@/components/investor/InvestorWorldMap";
import GlobalNetworkMap from "@/components/investor/GlobalNetworkMap";
import ContactListView from "@/components/investor/ContactListView";
import { useGlobalNetwork } from "@/hooks/useGlobalNetwork";
import type { InvestorContact } from "@/pages/investor/InvestorDashboard";

interface CityGroup {
  city: string;
  lat: number | null;
  lng: number | null;
  count: number;
  contacts: InvestorContact[];
}

interface NetworkMapViewProps {
  contacts: InvestorContact[];
  cityGroups: Record<string, CityGroup>;
  isLoading: boolean;
  onContactClick: (contact: InvestorContact) => void;
  onAddContact: () => void;
  userId: string;
}

const NetworkMapView = ({
  contacts,
  cityGroups,
  isLoading,
  onContactClick,
  onAddContact,
  userId,
}: NetworkMapViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [networkMode, setNetworkMode] = useState<"my" | "global">("my");

  // Get IDs of user's contacts for highlighting in global view
  const myContactGlobalIds = contacts
    .filter((c) => c.global_contact_id)
    .map((c) => c.global_contact_id as string);

  const { cityGroups: globalCityGroups, stats, isLoading: isLoadingGlobal } = useGlobalNetwork(
    userId,
    myContactGlobalIds
  );

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

  const handleCityClick = (city: string) => {
    setSearchQuery(city);
  };

  const displayStats = networkMode === "my" 
    ? `${contacts.length} contacts • ${Object.keys(cityGroups).length} cities`
    : `${stats.activeUsers} active • ${stats.globalContacts + stats.myContacts} contacts`;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-4 border-b border-border/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Network Map</h2>
          <div className="text-sm text-muted-foreground hidden sm:block">
            {displayStats}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Network Toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setNetworkMode("my")}
              className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors text-sm ${
                networkMode === "my"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">My Network</span>
            </button>
            <button
              onClick={() => setNetworkMode("global")}
              className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors text-sm ${
                networkMode === "global"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Ugly Baby Network</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="pl-9 w-48 h-9"
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
            </button>
          </div>

          <Button onClick={onAddContact} size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Contact</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative">
        {viewMode === "map" ? (
          networkMode === "my" ? (
            <InvestorWorldMap
              contacts={filteredContacts}
              cityGroups={cityGroups}
              onCityClick={handleCityClick}
              onContactClick={onContactClick}
              searchQuery={searchQuery}
            />
          ) : (
            <GlobalNetworkMap
              cityGroups={globalCityGroups}
              searchQuery={searchQuery}
            />
          )
        ) : (
          <ContactListView
            contacts={filteredContacts}
            isLoading={isLoading || isLoadingGlobal}
            onContactClick={onContactClick}
          />
        )}
      </div>
    </div>
  );
};

export default NetworkMapView;
