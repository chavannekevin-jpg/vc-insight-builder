import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  Filter, 
  Upload, 
  UserCheck, 
  LayoutGrid, 
  List,
  ArrowUpDown,
  MapPin,
  Building2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { InvestorContact } from "@/pages/investor/InvestorDashboard";

interface ContactDirectoryViewProps {
  contacts: InvestorContact[];
  isLoading: boolean;
  onContactClick: (contact: InvestorContact) => void;
  onAddContact: () => void;
  onBulkImport?: () => void;
  onAddToCRM: (contact: InvestorContact) => void;
}

type ViewMode = "list" | "grid";
type SortField = "name" | "organization" | "city" | "recent";

const ContactDirectoryView = ({
  contacts,
  isLoading,
  onContactClick,
  onAddContact,
  onBulkImport,
  onAddToCRM,
}: ContactDirectoryViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortField, setSortField] = useState<SortField>("name");
  const [countryFilter, setCountryFilter] = useState<string>("all");

  // Get unique countries for filter
  const countries = Array.from(
    new Set(
      contacts
        .map((c) => c.global_contact?.country)
        .filter(Boolean) as string[]
    )
  ).sort();

  // Filter contacts
  const filteredContacts = contacts.filter((contact) => {
    const name = contact.local_name || contact.global_contact?.name || "";
    const org = contact.local_organization || contact.global_contact?.organization_name || "";
    const city = contact.global_contact?.city || "";
    
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCountry =
      countryFilter === "all" || contact.global_contact?.country === countryFilter;
    
    return matchesSearch && matchesCountry;
  });

  // Sort contacts
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    switch (sortField) {
      case "name":
        return (a.local_name || a.global_contact?.name || "").localeCompare(
          b.local_name || b.global_contact?.name || ""
        );
      case "organization":
        return (a.local_organization || a.global_contact?.organization_name || "").localeCompare(
          b.local_organization || b.global_contact?.organization_name || ""
        );
      case "city":
        return (a.global_contact?.city || "").localeCompare(
          b.global_contact?.city || ""
        );
      case "recent":
        return new Date(b.last_contact_date || 0).getTime() - 
               new Date(a.last_contact_date || 0).getTime();
      default:
        return 0;
    }
  });

  // Check if contact is in CRM
  const isInCRM = (contact: InvestorContact) => {
    return contact.relationship_status !== null;
  };

  // Count contacts in CRM
  const inCRMCount = contacts.filter(c => c.relationship_status !== null).length;

  // Get investment focus array safely
  const getInvestmentFocus = (contact: InvestorContact): string[] => {
    return (contact.global_contact?.investment_focus as string[]) || [];
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Contact Directory</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{filteredContacts.length} contacts</span>
              {inCRMCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {inCRMCount} in CRM
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onBulkImport && (
              <Button onClick={onBulkImport} variant="outline" size="sm" className="gap-1.5">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Import</span>
              </Button>
            )}
            <Button onClick={onAddContact} size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Contact</span>
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, organization, or city..."
              className="pl-9"
            />
          </div>

          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowUpDown className="w-4 h-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortField("name")}>
                By Name {sortField === "name" && "✓"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortField("organization")}>
                By Organization {sortField === "organization" && "✓"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortField("city")}>
                By City {sortField === "city" && "✓"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortField("recent")}>
                By Recent Contact {sortField === "recent" && "✓"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center border border-border rounded-md">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-r-none"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-l-none"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Contact List/Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-muted-foreground">Loading contacts...</div>
          </div>
        ) : sortedContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-2">No contacts found</p>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || countryFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Add your first contact to get started"}
            </p>
            <Button onClick={onAddContact} className="gap-1.5">
              <Plus className="w-4 h-4" />
              Add Contact
            </Button>
          </div>
        ) : viewMode === "list" ? (
          <div className="space-y-2">
            {sortedContacts.map((contact) => {
              const focus = getInvestmentFocus(contact);
              return (
                <div
                  key={contact.id}
                  className="flex items-center gap-4 p-3 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors group"
                >
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => onContactClick(contact)}
                  >
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {contact.local_name || contact.global_contact?.name}
                      </p>
                      {contact.global_contact?.linked_investor_id && (
                        <Badge 
                          variant="secondary" 
                          className="text-[10px] px-1.5 py-0 bg-green-500/10 text-green-600 border-green-500/20 shrink-0"
                        >
                          <UserCheck className="w-3 h-3 mr-0.5" />
                          On Platform
                        </Badge>
                      )}
                      {isInCRM(contact) && (
                        <Badge 
                          variant="outline" 
                          className="text-[10px] px-1.5 py-0 shrink-0 capitalize"
                        >
                          {contact.relationship_status}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                      {(contact.local_organization || contact.global_contact?.organization_name) && (
                        <span className="flex items-center gap-1 truncate">
                          <Building2 className="w-3 h-3" />
                          {contact.local_organization || contact.global_contact?.organization_name}
                        </span>
                      )}
                      {contact.global_contact?.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {contact.global_contact.city}
                        </span>
                      )}
                    </div>
                    {/* Investment Focus Tags */}
                    {focus.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {focus.slice(0, 3).map((f) => (
                          <span
                            key={f}
                            className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/50 text-accent-foreground"
                          >
                            {f}
                          </span>
                        ))}
                        {focus.length > 3 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{focus.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {!isInCRM(contact) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCRM(contact);
                      }}
                    >
                      Add to CRM
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedContacts.map((contact) => {
              const focus = getInvestmentFocus(contact);
              return (
                <div
                  key={contact.id}
                  className="flex flex-col p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer group"
                  onClick={() => onContactClick(contact)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-medium truncate">
                      {contact.local_name || contact.global_contact?.name}
                    </p>
                    <div className="flex flex-col gap-1 shrink-0">
                      {contact.global_contact?.linked_investor_id && (
                        <Badge 
                          variant="secondary" 
                          className="text-[10px] px-1.5 py-0 bg-green-500/10 text-green-600 border-green-500/20"
                        >
                          <UserCheck className="w-3 h-3" />
                        </Badge>
                      )}
                      {isInCRM(contact) && (
                        <Badge 
                          variant="outline" 
                          className="text-[10px] px-1.5 py-0 capitalize"
                        >
                          {contact.relationship_status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {(contact.local_organization || contact.global_contact?.organization_name) && (
                    <p className="text-sm text-muted-foreground truncate mb-1">
                      {contact.local_organization || contact.global_contact?.organization_name}
                    </p>
                  )}
                  
                  {contact.global_contact?.city && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {contact.global_contact.city}
                      {contact.global_contact.country && `, ${contact.global_contact.country}`}
                    </p>
                  )}

                  {/* Investment Focus Tags for Grid View */}
                  {focus.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {focus.slice(0, 2).map((f) => (
                        <span
                          key={f}
                          className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/50 text-accent-foreground"
                        >
                          {f}
                        </span>
                      ))}
                      {focus.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{focus.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {!isInCRM(contact) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCRM(contact);
                      }}
                    >
                      Add to CRM
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactDirectoryView;
