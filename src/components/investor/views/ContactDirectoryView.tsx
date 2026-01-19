import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
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
  Building2,
  Sparkles,
  Loader2,
  Target
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { InvestorContact } from "@/pages/investor/InvestorDashboard";
import { calculateAffinity, getMatchColor, type UserProfile } from "@/lib/affinityCalculator";

interface ContactDirectoryViewProps {
  contacts: InvestorContact[];
  isLoading: boolean;
  onContactClick: (contact: InvestorContact) => void;
  onAddContact: () => void;
  onBulkImport?: () => void;
  onAddToCRM: (contact: InvestorContact) => void;
  onRefresh?: () => void;
  userProfile?: UserProfile | null;
}

type ViewMode = "list" | "grid";
type SortField = "name" | "organization" | "city" | "recent" | "match";

const ContactDirectoryView = ({
  contacts,
  isLoading,
  onContactClick,
  onAddContact,
  onBulkImport,
  onAddToCRM,
  onRefresh,
  userProfile,
}: ContactDirectoryViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortField, setSortField] = useState<SortField>("name");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [isResearchingAll, setIsResearchingAll] = useState(false);
  const [researchProgress, setResearchProgress] = useState({ current: 0, total: 0 });

  // Calculate affinity for all contacts
  const contactsWithAffinity = useMemo(() => {
    return contacts.map(contact => {
      const affinity = calculateAffinity(userProfile, {
        city: contact.global_contact?.city,
        stages: contact.global_contact?.stages,
        investment_focus: contact.global_contact?.investment_focus,
      });
      return { contact, affinity };
    });
  }, [contacts, userProfile]);

  const countries = Array.from(
    new Set(contacts.map((c) => c.global_contact?.country).filter(Boolean) as string[])
  ).sort();

  const filteredContacts = contacts.filter((contact) => {
    const name = contact.local_name || contact.global_contact?.name || "";
    const org = contact.local_organization || contact.global_contact?.organization_name || "";
    const city = contact.global_contact?.city || "";
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = countryFilter === "all" || contact.global_contact?.country === countryFilter;
    return matchesSearch && matchesCountry;
  });

  const getContactAffinity = (contact: InvestorContact) => {
    return contactsWithAffinity.find(c => c.contact.id === contact.id)?.affinity;
  };

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    switch (sortField) {
      case "name":
        return (a.local_name || a.global_contact?.name || "").localeCompare(b.local_name || b.global_contact?.name || "");
      case "organization":
        return (a.local_organization || a.global_contact?.organization_name || "").localeCompare(b.local_organization || b.global_contact?.organization_name || "");
      case "city":
        return (a.global_contact?.city || "").localeCompare(b.global_contact?.city || "");
      case "recent":
        return new Date(b.last_contact_date || 0).getTime() - new Date(a.last_contact_date || 0).getTime();
      case "match":
        return (getContactAffinity(b)?.percentage || 0) - (getContactAffinity(a)?.percentage || 0);
      default:
        return 0;
    }
  });

  const isInCRM = (contact: InvestorContact) => contact.relationship_status !== null;
  const inCRMCount = contacts.filter(c => c.relationship_status !== null).length;
  const getInvestmentFocus = (contact: InvestorContact): string[] => (contact.global_contact?.investment_focus as string[]) || [];

  const contactsNeedingResearch = contacts.filter(c => {
    const focus = getInvestmentFocus(c);
    const hasResearchData = (c.global_contact as any)?.focus_last_researched_at;
    return c.global_contact_id && focus.length === 0 && !hasResearchData;
  });

  const handleResearchAll = async () => {
    if (contactsNeedingResearch.length === 0) {
      toast({ title: "All contacts researched", description: "All contacts already have investment focus data." });
      return;
    }
    setIsResearchingAll(true);
    setResearchProgress({ current: 0, total: contactsNeedingResearch.length });
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < contactsNeedingResearch.length; i++) {
      const contact = contactsNeedingResearch[i];
      setResearchProgress({ current: i + 1, total: contactsNeedingResearch.length });
      try {
        const response = await supabase.functions.invoke("research-contact", {
          body: {
            name: contact.local_name || contact.global_contact?.name,
            organization_name: contact.local_organization || contact.global_contact?.organization_name,
            linkedin_url: contact.global_contact?.linkedin_url || undefined,
            global_contact_id: contact.global_contact_id,
          },
        });
        if (response.error) errorCount++; else successCount++;
        if (i < contactsNeedingResearch.length - 1) await new Promise(resolve => setTimeout(resolve, 500));
      } catch { errorCount++; }
    }

    setIsResearchingAll(false);
    setResearchProgress({ current: 0, total: 0 });
    toast({ title: "Batch research complete", description: `Successfully researched ${successCount} contacts. ${errorCount > 0 ? `${errorCount} failed.` : ''}` });
    onRefresh?.();
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="p-5 border-b border-border/30 bg-gradient-to-r from-card/80 to-card/40 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold tracking-tight">Contact Directory</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground/80 font-medium px-3 py-1 rounded-full bg-muted/50 border border-border/30">{filteredContacts.length} contacts</span>
              {inCRMCount > 0 && <Badge variant="secondary" className="text-xs border border-border/30">{inCRMCount} in CRM</Badge>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {contactsNeedingResearch.length > 0 && (
              <Button onClick={handleResearchAll} variant="outline" size="sm" className="gap-1.5" disabled={isResearchingAll}>
                {isResearchingAll ? <><Loader2 className="w-4 h-4 animate-spin" /><span className="hidden sm:inline">{researchProgress.current}/{researchProgress.total}</span></> : <><Sparkles className="w-4 h-4" /><span className="hidden sm:inline">Research {contactsNeedingResearch.length}</span></>}
              </Button>
            )}
            {onBulkImport && <Button onClick={onBulkImport} variant="outline" size="sm" className="gap-1.5"><Upload className="w-4 h-4" /><span className="hidden sm:inline">Import</span></Button>}
            <Button onClick={onAddContact} size="sm" className="gap-1.5"><Plus className="w-4 h-4" /><span className="hidden sm:inline">Add Contact</span></Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name, organization, or city..." className="pl-9" />
          </div>
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-40"><Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Country" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((country) => <SelectItem key={country} value={country}>{country}</SelectItem>)}
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5"><ArrowUpDown className="w-4 h-4" />{sortField === "match" ? "Best Match" : "Sort"}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {userProfile && <DropdownMenuItem onClick={() => setSortField("match")}><Target className="w-4 h-4 mr-2" />Best Match {sortField === "match" && "✓"}</DropdownMenuItem>}
              <DropdownMenuItem onClick={() => setSortField("name")}>By Name {sortField === "name" && "✓"}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortField("organization")}>By Organization {sortField === "organization" && "✓"}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortField("city")}>By City {sortField === "city" && "✓"}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortField("recent")}>By Recent Contact {sortField === "recent" && "✓"}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center border border-border rounded-md">
            <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="sm" className="rounded-r-none" onClick={() => setViewMode("list")}><List className="w-4 h-4" /></Button>
            <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="sm" className="rounded-l-none" onClick={() => setViewMode("grid")}><LayoutGrid className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full"><div className="animate-pulse text-muted-foreground">Loading contacts...</div></div>
        ) : sortedContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4"><Search className="w-8 h-8 text-muted-foreground" /></div>
            <p className="text-lg font-medium mb-2">No contacts found</p>
            <p className="text-sm text-muted-foreground mb-4">{searchQuery || countryFilter !== "all" ? "Try adjusting your search or filters" : "Add your first contact to get started"}</p>
            <Button onClick={onAddContact} className="gap-1.5"><Plus className="w-4 h-4" />Add Contact</Button>
          </div>
        ) : viewMode === "list" ? (
          <TooltipProvider>
            <div className="space-y-2">
              {sortedContacts.map((contact) => {
                const focus = getInvestmentFocus(contact);
                const affinity = getContactAffinity(contact);
                const matchColors = affinity ? getMatchColor(affinity.percentage) : null;
                return (
                  <div key={contact.id} className="flex items-center gap-4 p-3 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors group">
                    {userProfile && affinity && affinity.percentage > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold ${matchColors?.bg} ${matchColors?.text} border ${matchColors?.border}`}>{affinity.percentage}%</div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-[200px]">
                          <p className="font-medium mb-1">Match reasons:</p>
                          <ul className="text-xs space-y-0.5">
                            {affinity.reasons.map((reason, idx) => (
                              <li key={idx} className="flex items-center gap-1">
                                {reason.type === "location" && <MapPin className="w-3 h-3" />}
                                {reason.type === "stage" && <Target className="w-3 h-3" />}
                                {reason.type === "sector" && <Building2 className="w-3 h-3" />}
                                {reason.type === "geo" && <Sparkles className="w-3 h-3" />}
                                {reason.label}
                              </li>
                            ))}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onContactClick(contact)}>
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{contact.local_name || contact.global_contact?.name}</p>
                        {contact.global_contact?.linked_investor_id && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-green-500/10 text-green-600 border-green-500/20 shrink-0"><UserCheck className="w-3 h-3 mr-0.5" />On Platform</Badge>}
                        {isInCRM(contact) && <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 capitalize">{contact.relationship_status}</Badge>}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                        {(contact.local_organization || contact.global_contact?.organization_name) && <span className="flex items-center gap-1 truncate"><Building2 className="w-3 h-3" />{contact.local_organization || contact.global_contact?.organization_name}</span>}
                        {contact.global_contact?.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{contact.global_contact.city}</span>}
                      </div>
                      {focus.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {focus.slice(0, 3).map((f) => <span key={f} className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/50 text-accent-foreground">{f}</span>)}
                          {focus.length > 3 && <span className="text-[10px] text-muted-foreground">+{focus.length - 3} more</span>}
                        </div>
                      )}
                    </div>
                    {!isInCRM(contact) && <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={(e) => { e.stopPropagation(); onAddToCRM(contact); }}>Add to CRM</Button>}
                  </div>
                );
              })}
            </div>
          </TooltipProvider>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedContacts.map((contact) => {
              const focus = getInvestmentFocus(contact);
              const affinity = getContactAffinity(contact);
              const matchColors = affinity ? getMatchColor(affinity.percentage) : null;
              return (
                <div key={contact.id} className="flex flex-col p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer group relative" onClick={() => onContactClick(contact)}>
                  {userProfile && affinity && affinity.percentage > 0 && <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${matchColors?.bg} ${matchColors?.text} border ${matchColors?.border} shadow-sm`}>{affinity.percentage}%</div>}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-medium truncate">{contact.local_name || contact.global_contact?.name}</p>
                    <div className="flex flex-col gap-1 shrink-0">
                      {contact.global_contact?.linked_investor_id && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-green-500/10 text-green-600 border-green-500/20"><UserCheck className="w-3 h-3" /></Badge>}
                      {isInCRM(contact) && <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">{contact.relationship_status}</Badge>}
                    </div>
                  </div>
                  {(contact.local_organization || contact.global_contact?.organization_name) && <p className="text-sm text-muted-foreground truncate mb-1">{contact.local_organization || contact.global_contact?.organization_name}</p>}
                  {contact.global_contact?.city && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{contact.global_contact.city}{contact.global_contact.country && `, ${contact.global_contact.country}`}</p>}
                  {focus.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {focus.slice(0, 2).map((f) => <span key={f} className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/50 text-accent-foreground">{f}</span>)}
                      {focus.length > 2 && <span className="text-[10px] text-muted-foreground">+{focus.length - 2}</span>}
                    </div>
                  )}
                  {!isInCRM(contact) && <Button variant="outline" size="sm" className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity w-full" onClick={(e) => { e.stopPropagation(); onAddToCRM(contact); }}>Add to CRM</Button>}
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
