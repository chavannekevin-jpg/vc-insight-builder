import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Search, 
  Network, 
  Users, 
  Globe,
  Ticket,
  Eye,
  Trash2,
  UserCheck,
  Building2,
  MapPin,
  TrendingUp,
  Link2,
  RefreshCw,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  Upload,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { safeLower } from "@/lib/stringUtils";
import { AdminBulkUploadModal } from "@/components/admin/AdminBulkUploadModal";

interface InvestorProfile {
  id: string;
  full_name: string;
  organization_name: string | null;
  investor_type: string;
  city: string;
  preferred_stages: string[];
  primary_sectors: string[];
  geographic_focus: string[];
  ticket_size_min: number | null;
  ticket_size_max: number | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
  invited_by_code: string | null;
  email?: string;
  contacts_count?: number;
  invites_created?: number;
  invites_used?: number;
}

interface GlobalContact {
  id: string;
  name: string;
  organization_name: string | null;
  entity_type: string;
  city: string | null;
  country: string | null;
  email: string | null;
  stages: string[];
  investment_focus: string[];
  contributor_count: number;
  created_at: string;
}

interface InvestorInvite {
  id: string;
  code: string;
  inviter_id: string;
  inviter_name?: string;
  uses: number;
  max_uses: number | null;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
}

const AdminInvestors = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [investors, setInvestors] = useState<InvestorProfile[]>([]);
  const [globalContacts, setGlobalContacts] = useState<GlobalContact[]>([]);
  const [invites, setInvites] = useState<InvestorInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvestor, setSelectedInvestor] = useState<InvestorProfile | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  const activeTab = searchParams.get("tab") || "investors";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchInvestors(), fetchGlobalContacts(), fetchInvites()]);
    setLoading(false);
  };

  const fetchInvestors = async () => {
    try {
      // Fetch investor profiles
      const { data: profiles, error } = await supabase
        .from("investor_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get emails from auth profiles table
      const { data: authProfiles } = await supabase
        .from("profiles")
        .select("id, email");

      const emailMap = new Map((authProfiles || []).map(p => [p.id, p.email]));

      // Get contacts count per investor
      const { data: contacts } = await supabase
        .from("investor_contacts")
        .select("investor_id");

      const contactsCountMap: Record<string, number> = {};
      (contacts || []).forEach(c => {
        contactsCountMap[c.investor_id] = (contactsCountMap[c.investor_id] || 0) + 1;
      });

      // Get invites data per investor
      const { data: invitesData } = await supabase
        .from("investor_invites")
        .select("inviter_id, uses");

      const invitesMap: Record<string, { created: number; used: number }> = {};
      (invitesData || []).forEach(i => {
        if (!invitesMap[i.inviter_id]) {
          invitesMap[i.inviter_id] = { created: 0, used: 0 };
        }
        invitesMap[i.inviter_id].created += 1;
        invitesMap[i.inviter_id].used += i.uses;
      });

      const enrichedProfiles: InvestorProfile[] = (profiles || []).map(p => ({
        ...p,
        preferred_stages: Array.isArray(p.preferred_stages) ? (p.preferred_stages as string[]) : [],
        primary_sectors: Array.isArray(p.primary_sectors) ? (p.primary_sectors as string[]) : [],
        geographic_focus: Array.isArray(p.geographic_focus) ? (p.geographic_focus as string[]) : [],
        email: emailMap.get(p.id) || "Unknown",
        contacts_count: contactsCountMap[p.id] || 0,
        invites_created: invitesMap[p.id]?.created || 0,
        invites_used: invitesMap[p.id]?.used || 0,
      }));

      setInvestors(enrichedProfiles);
    } catch (error) {
      console.error("Error fetching investors:", error);
      toast({ title: "Error", description: "Failed to fetch investors", variant: "destructive" });
    }
  };

  const fetchGlobalContacts = async () => {
    try {
      const { data, error } = await supabase
        .from("global_contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedContacts: GlobalContact[] = (data || []).map(c => ({
        ...c,
        stages: Array.isArray(c.stages) ? (c.stages as string[]) : [],
        investment_focus: Array.isArray(c.investment_focus) ? (c.investment_focus as string[]) : [],
      }));

      setGlobalContacts(formattedContacts);
    } catch (error) {
      console.error("Error fetching global contacts:", error);
    }
  };

  const fetchInvites = async () => {
    try {
      const { data, error } = await supabase
        .from("investor_invites")
        .select(`
          *,
          investor_profiles!investor_invites_inviter_id_fkey(full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedInvites: InvestorInvite[] = (data || []).map(i => ({
        ...i,
        inviter_name: (i.investor_profiles as any)?.full_name || "Unknown",
      }));

      setInvites(formattedInvites);
    } catch (error) {
      console.error("Error fetching invites:", error);
    }
  };

  const handleDeleteInvestor = async (investorId: string) => {
    try {
      // Delete investor contacts first
      await supabase.from("investor_contacts").delete().eq("investor_id", investorId);
      
      // Delete investor invites
      await supabase.from("investor_invites").delete().eq("inviter_id", investorId);
      
      // Delete investor referrals (as invitee)
      await supabase.from("investor_referrals").delete().eq("invitee_id", investorId);
      
      // Delete investor profile
      const { error } = await supabase.from("investor_profiles").delete().eq("id", investorId);
      
      if (error) throw error;

      // Delete investor role
      await supabase.from("user_roles").delete().eq("user_id", investorId).eq("role", "investor");

      toast({ title: "Investor deleted", description: "The investor account has been removed" });
      setDeletingId(null);
      fetchInvestors();
    } catch (error: any) {
      console.error("Error deleting investor:", error);
      toast({ title: "Error", description: error.message || "Failed to delete investor", variant: "destructive" });
    }
  };

  const handleDeleteGlobalContact = async (contactId: string) => {
    try {
      // First delete any investor_contacts that reference this global contact
      await supabase.from("investor_contacts").delete().eq("global_contact_id", contactId);
      
      // Then delete the global contact
      const { error } = await supabase.from("global_contacts").delete().eq("id", contactId);
      
      if (error) throw error;

      toast({ title: "Contact deleted", description: "The global contact has been removed" });
      fetchGlobalContacts();
    } catch (error: any) {
      console.error("Error deleting contact:", error);
      toast({ title: "Error", description: error.message || "Failed to delete contact", variant: "destructive" });
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatInvestorType = (type: string) => {
    const typeMap: Record<string, string> = {
      vc: "VC",
      family_office: "Family Office",
      business_angel: "Angel",
      corporate_vc: "Corporate VC",
      lp: "LP",
      other: "Other",
    };
    return typeMap[type] || type;
  };

  const formatTicketSize = (min: number | null, max: number | null) => {
    if (!min && !max) return "-";
    const formatNum = (n: number) => n >= 1000 ? `${n / 1000}M` : `${n}K`;
    if (min && max) return `€${formatNum(min)} - €${formatNum(max)}`;
    if (min) return `€${formatNum(min)}+`;
    if (max) return `Up to €${formatNum(max)}`;
    return "-";
  };

  const filteredInvestors = investors.filter(inv => 
    safeLower(inv.full_name, "").includes(safeLower(searchTerm, "")) ||
    safeLower(inv.organization_name || "", "").includes(safeLower(searchTerm, "")) ||
    safeLower(inv.email || "", "").includes(safeLower(searchTerm, "")) ||
    safeLower(inv.city, "").includes(safeLower(searchTerm, ""))
  );

  const filteredContacts = globalContacts.filter(c => 
    safeLower(c.name, "").includes(safeLower(searchTerm, "")) ||
    safeLower(c.organization_name || "", "").includes(safeLower(searchTerm, "")) ||
    safeLower(c.city || "", "").includes(safeLower(searchTerm, ""))
  );

  const filteredInvites = invites.filter(inv => 
    safeLower(inv.code, "").includes(safeLower(searchTerm, "")) ||
    safeLower(inv.inviter_name || "", "").includes(safeLower(searchTerm, ""))
  );

  // Stats
  const totalInvestors = investors.length;
  const onboardedInvestors = investors.filter(i => i.onboarding_completed).length;
  const totalContacts = globalContacts.length;
  const activeInvites = invites.filter(i => i.is_active).length;
  const totalInviteUses = invites.reduce((sum, i) => sum + i.uses, 0);

  return (
    <AdminLayout title="Investor Ecosystem">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <ModernCard className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Network className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total Investors</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalInvestors}</p>
          </ModernCard>
          <ModernCard className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Onboarded</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{onboardedInvestors}</p>
          </ModernCard>
          <ModernCard className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Global Contacts</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalContacts}</p>
          </ModernCard>
          <ModernCard className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Ticket className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Active Invites</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{activeInvites}</p>
          </ModernCard>
          <ModernCard className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-chart-2" />
              <span className="text-xs text-muted-foreground">Invite Uses</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalInviteUses}</p>
          </ModernCard>
        </div>

        {/* Search & Actions */}
        <ModernCard>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search investors, contacts, or invite codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={fetchData} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
            <Button onClick={() => setIsBulkUploadOpen(true)} className="gap-2">
              <Upload className="w-4 h-4" />
              Bulk Upload
            </Button>
          </div>
        </ModernCard>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setSearchParams({ tab: v })}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="investors" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Investors ({filteredInvestors.length})
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Global Contacts ({filteredContacts.length})
            </TabsTrigger>
            <TabsTrigger value="invites" className="flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              Invite Codes ({filteredInvites.length})
            </TabsTrigger>
          </TabsList>

          {/* Investors Tab */}
          <TabsContent value="investors">
            <ModernCard>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredInvestors.length === 0 ? (
                <div className="text-center py-12">
                  <Network className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No investors found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Contacts</TableHead>
                        <TableHead>Invites</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvestors.map((investor) => (
                        <TableRow key={investor.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{investor.full_name}</p>
                              <p className="text-xs text-muted-foreground">{investor.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {investor.organization_name || (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {formatInvestorType(investor.investor_type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              {investor.city}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{investor.contacts_count}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {investor.invites_used}/{investor.invites_created} used
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(investor.created_at), { addSuffix: true })}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedInvestor(investor)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingId(investor.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </ModernCard>
          </TabsContent>

          {/* Global Contacts Tab */}
          <TabsContent value="contacts">
            <ModernCard>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-12">
                  <Globe className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No global contacts found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Stages</TableHead>
                        <TableHead>Contributors</TableHead>
                        <TableHead>Added</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContacts.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{contact.name}</p>
                              {contact.email && (
                                <p className="text-xs text-muted-foreground">{contact.email}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {contact.organization_name || (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {contact.entity_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {contact.city && contact.country ? (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-muted-foreground" />
                                {contact.city}, {contact.country}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {contact.stages.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {contact.stages.slice(0, 2).map((stage) => (
                                  <Badge key={stage} variant="secondary" className="text-xs">
                                    {stage}
                                  </Badge>
                                ))}
                                {contact.stages.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{contact.stages.length - 2}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{contact.contributor_count}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(contact.created_at), { addSuffix: true })}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteGlobalContact(contact.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </ModernCard>
          </TabsContent>

          {/* Invites Tab */}
          <TabsContent value="invites">
            <ModernCard>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredInvites.length === 0 ? (
                <div className="text-center py-12">
                  <Ticket className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No invite codes found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Uses</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvites.map((invite) => (
                        <TableRow key={invite.id}>
                          <TableCell>
                            <code className="px-2 py-1 bg-muted rounded font-mono text-sm">
                              {invite.code}
                            </code>
                          </TableCell>
                          <TableCell>{invite.inviter_name}</TableCell>
                          <TableCell>
                            {invite.uses} / {invite.max_uses || "∞"}
                          </TableCell>
                          <TableCell>
                            {invite.is_active ? (
                              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(invite.created_at), { addSuffix: true })}
                            </span>
                          </TableCell>
                          <TableCell>
                            {invite.expires_at ? (
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(invite.expires_at), "MMM d, yyyy")}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Never</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyInviteCode(invite.code)}
                            >
                              {copiedCode === invite.code ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </ModernCard>
          </TabsContent>
        </Tabs>
      </div>

      {/* Investor Detail Dialog */}
      <Dialog open={!!selectedInvestor} onOpenChange={() => setSelectedInvestor(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Network className="w-5 h-5 text-primary" />
              {selectedInvestor?.full_name}
            </DialogTitle>
            <DialogDescription>
              {selectedInvestor?.organization_name || "Independent Investor"} • {selectedInvestor?.city}
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvestor && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Email</label>
                  <p className="font-medium">{selectedInvestor.email}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Type</label>
                  <p className="font-medium">{formatInvestorType(selectedInvestor.investor_type)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Ticket Size</label>
                  <p className="font-medium">
                    {formatTicketSize(selectedInvestor.ticket_size_min, selectedInvestor.ticket_size_max)}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Onboarding</label>
                  <p className="font-medium">
                    {selectedInvestor.onboarding_completed ? (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Completed</Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </p>
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Stages</label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedInvestor.preferred_stages.length > 0 ? (
                      selectedInvestor.preferred_stages.map((stage) => (
                        <Badge key={stage} variant="secondary">{stage}</Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">None specified</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Sectors</label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedInvestor.primary_sectors.length > 0 ? (
                      selectedInvestor.primary_sectors.map((sector) => (
                        <Badge key={sector} variant="outline">{sector}</Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">None specified</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Geographic Focus</label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedInvestor.geographic_focus.length > 0 ? (
                      selectedInvestor.geographic_focus.map((geo) => (
                        <Badge key={geo} variant="outline">{geo}</Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">None specified</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{selectedInvestor.contacts_count}</p>
                  <p className="text-xs text-muted-foreground">Contacts</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{selectedInvestor.invites_created}</p>
                  <p className="text-xs text-muted-foreground">Invites Created</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{selectedInvestor.invites_used}</p>
                  <p className="text-xs text-muted-foreground">Invites Used</p>
                </div>
              </div>

              {/* Dates */}
              <div className="text-xs text-muted-foreground pt-4 border-t border-border">
                <p>Joined: {format(new Date(selectedInvestor.created_at), "PPP")}</p>
                {selectedInvestor.invited_by_code && (
                  <p>Invited with code: <code className="px-1 py-0.5 bg-muted rounded">{selectedInvestor.invited_by_code}</code></p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Investor Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this investor's profile, all their contacts, and invite codes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDeleteInvestor(deletingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Upload Modal */}
      <AdminBulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onSuccess={() => {
          fetchGlobalContacts();
          setIsBulkUploadOpen(false);
        }}
      />
    </AdminLayout>
  );
};

export default AdminInvestors;
