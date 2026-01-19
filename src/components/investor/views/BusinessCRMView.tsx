import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Loader2,
  Briefcase,
  Phone,
  Handshake,
  Trophy,
  XCircle,
  MoreVertical,
  Trash2,
  Building2,
  User,
  Mail,
  DollarSign,
} from "lucide-react";
import {
  useBusinessOpportunities,
  useCreateOpportunity,
  useUpdateOpportunity,
  useDeleteOpportunity,
  BusinessOpportunity,
  OpportunityStatus,
} from "@/hooks/useBusinessOpportunities";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<OpportunityStatus, { label: string; icon: any; color: string }> = {
  lead: { label: "Lead", icon: Briefcase, color: "text-blue-500 bg-blue-500/10" },
  contacted: { label: "Contacted", icon: Phone, color: "text-purple-500 bg-purple-500/10" },
  negotiating: { label: "Negotiating", icon: Handshake, color: "text-amber-500 bg-amber-500/10" },
  won: { label: "Won", icon: Trophy, color: "text-green-500 bg-green-500/10" },
  lost: { label: "Lost", icon: XCircle, color: "text-muted-foreground bg-muted" },
};

interface BusinessCRMViewProps {
  userId?: string | null;
}

const BusinessCRMView = ({ userId }: BusinessCRMViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<BusinessOpportunity | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    company_name: "",
    contact_name: "",
    contact_email: "",
    value_estimate: "",
    status: "lead" as OpportunityStatus,
    notes: "",
  });

  const { data: opportunities = [], isLoading } = useBusinessOpportunities(userId || null);
  const createOpportunity = useCreateOpportunity(userId || null);
  const updateOpportunity = useUpdateOpportunity(userId || null);
  const deleteOpportunity = useDeleteOpportunity(userId || null);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(
      (opp) =>
        opp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.contact_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [opportunities, searchQuery]);

  const groupedOpportunities = useMemo(
    () => ({
      lead: filteredOpportunities.filter((o) => o.status === "lead"),
      contacted: filteredOpportunities.filter((o) => o.status === "contacted"),
      negotiating: filteredOpportunities.filter((o) => o.status === "negotiating"),
      won: filteredOpportunities.filter((o) => o.status === "won"),
      lost: filteredOpportunities.filter((o) => o.status === "lost"),
    }),
    [filteredOpportunities]
  );

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      company_name: "",
      contact_name: "",
      contact_email: "",
      value_estimate: "",
      status: "lead",
      notes: "",
    });
    setEditingOpportunity(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (opp: BusinessOpportunity) => {
    setFormData({
      name: opp.name,
      description: opp.description || "",
      company_name: opp.company_name || "",
      contact_name: opp.contact_name || "",
      contact_email: opp.contact_email || "",
      value_estimate: opp.value_estimate?.toString() || "",
      status: opp.status,
      notes: opp.notes || "",
    });
    setEditingOpportunity(opp);
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    const data = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      company_name: formData.company_name.trim() || null,
      contact_name: formData.contact_name.trim() || null,
      contact_email: formData.contact_email.trim() || null,
      value_estimate: formData.value_estimate ? parseFloat(formData.value_estimate) : null,
      status: formData.status,
      notes: formData.notes.trim() || null,
    };

    if (editingOpportunity) {
      await updateOpportunity.mutateAsync({ id: editingOpportunity.id, ...data });
    } else {
      await createOpportunity.mutateAsync(data);
    }

    setShowAddModal(false);
    resetForm();
  };

  const handleStatusChange = (id: string, status: OpportunityStatus) => {
    updateOpportunity.mutate({ id, status });
  };

  const handleDelete = (id: string) => {
    deleteOpportunity.mutate(id);
  };

  const formatValue = (value: number | null) => {
    if (!value) return null;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Toolbar */}
      <div className="p-5 border-b border-border/30 bg-gradient-to-r from-card/80 to-card/40 backdrop-blur-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold tracking-tight">Business CRM</h2>
          <div className="text-sm text-muted-foreground/80 font-medium px-3 py-1 rounded-full bg-muted/50 border border-border/30">{opportunities.length} opportunities</div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="pl-9 w-48 h-9"
            />
          </div>

          <Button size="sm" className="gap-1.5" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Opportunity</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {opportunities.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Track your business opportunities</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Add deals, partnerships, and other business opportunities to track their progress.
            </p>
            <Button className="gap-2" onClick={handleOpenAdd}>
              <Plus className="w-4 h-4" />
              Add First Opportunity
            </Button>
          </div>
        ) : (
          <div className="flex gap-4 min-w-max h-full">
            {(["lead", "contacted", "negotiating", "won", "lost"] as const).map((status) => {
              const config = STATUS_CONFIG[status];
              const Icon = config.icon;

              return (
                <div key={status} className="w-64 bg-muted/30 rounded-lg flex flex-col min-h-[400px]">
                  <div className="p-3 border-b border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${config.color.split(" ")[0]}`} />
                      <span className="font-medium text-sm">{config.label}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {groupedOpportunities[status].length}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {groupedOpportunities[status].map((opp) => (
                      <div
                        key={opp.id}
                        onClick={() => handleOpenEdit(opp)}
                        className="bg-card border border-border rounded-lg p-3 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-medium text-sm line-clamp-1">{opp.name}</p>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              {(["lead", "contacted", "negotiating", "won", "lost"] as const)
                                .filter((s) => s !== status)
                                .map((newStatus) => {
                                  const cfg = STATUS_CONFIG[newStatus];
                                  const StatusIcon = cfg.icon;
                                  return (
                                    <DropdownMenuItem
                                      key={newStatus}
                                      onClick={() => handleStatusChange(opp.id, newStatus)}
                                    >
                                      <StatusIcon className={`w-4 h-4 mr-2 ${cfg.color.split(" ")[0]}`} />
                                      Move to {cfg.label}
                                    </DropdownMenuItem>
                                  );
                                })}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(opp.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {opp.company_name && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Building2 className="w-3 h-3" />
                            {opp.company_name}
                          </div>
                        )}

                        {opp.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{opp.description}</p>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          {opp.value_estimate && (
                            <Badge variant="secondary" className="text-xs">
                              <DollarSign className="w-3 h-3 mr-0.5" />
                              {formatValue(opp.value_estimate)}
                            </Badge>
                          )}
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {formatDistanceToNow(new Date(opp.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingOpportunity ? "Edit Opportunity" : "Add Opportunity"}</DialogTitle>
            <DialogDescription>
              {editingOpportunity ? "Update the opportunity details" : "Track a new business opportunity"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Opportunity Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Partnership with Acme Corp"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> Company
                </label>
                <Input
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Company name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Value
                </label>
                <Input
                  type="number"
                  value={formData.value_estimate}
                  onChange={(e) => setFormData({ ...formData, value_estimate: e.target.value })}
                  placeholder="Estimated value"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <User className="w-3 h-3" /> Contact Name
                </label>
                <Input
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  placeholder="Contact person"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Contact Email
                </label>
                <Input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the opportunity..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.name.trim() || createOpportunity.isPending || updateOpportunity.isPending}
                className="flex-1"
              >
                {createOpportunity.isPending || updateOpportunity.isPending
                  ? "Saving..."
                  : editingOpportunity
                  ? "Save Changes"
                  : "Add Opportunity"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessCRMView;
