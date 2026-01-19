import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, UserCheck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InvestorContact } from "@/pages/investor/InvestorDashboard";

interface CRMViewProps {
  contacts: InvestorContact[];
  isLoading: boolean;
  onContactClick: (contact: InvestorContact) => void;
  onAddContact: () => void;
  onBulkImport?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  prospect: "bg-muted text-muted-foreground",
  warm: "bg-yellow-500/20 text-yellow-600",
  connected: "bg-green-500/20 text-green-600",
  invested: "bg-primary/20 text-primary",
};

const CRMView = ({ contacts, isLoading, onContactClick, onAddContact }: CRMViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredContacts = contacts.filter((contact) => {
    const name = contact.local_name || contact.global_contact?.name || "";
    const org = contact.local_organization || contact.global_contact?.organization_name || "";
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || contact.relationship_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Group contacts by status for kanban-style view
  const groupedByStatus = {
    prospect: filteredContacts.filter((c) => c.relationship_status === "prospect"),
    warm: filteredContacts.filter((c) => c.relationship_status === "warm"),
    connected: filteredContacts.filter((c) => c.relationship_status === "connected"),
    invested: filteredContacts.filter((c) => c.relationship_status === "invested"),
  };

  // Count total contacts for empty state messaging
  const totalContacts = Object.values(groupedByStatus).flat().length;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-4 border-b border-border/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">CRM Pipeline</h2>
          <div className="text-sm text-muted-foreground">
            {filteredContacts.length} tracked contacts
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="pl-9 w-48 h-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-9">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="warm">Warm</SelectItem>
              <SelectItem value="connected">Connected</SelectItem>
              <SelectItem value="invested">Invested</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={onAddContact} variant="outline" size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add from Directory</span>
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-4 min-w-max h-full">
          {(["prospect", "warm", "connected", "invested"] as const).map((status) => (
            <div
              key={status}
              className="w-72 bg-muted/30 rounded-lg flex flex-col"
            >
              {/* Column Header */}
              <div className="p-3 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      status === "prospect"
                        ? "bg-muted-foreground"
                        : status === "warm"
                        ? "bg-yellow-500"
                        : status === "connected"
                        ? "bg-green-500"
                        : "bg-primary"
                    }`}
                  />
                  <span className="font-medium capitalize">{status}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {groupedByStatus[status].length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {groupedByStatus[status].map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => onContactClick(contact)}
                    className="bg-card border border-border rounded-lg p-3 cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm truncate">
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
                    </div>
                    {(contact.local_organization || contact.global_contact?.organization_name) && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {contact.local_organization || contact.global_contact?.organization_name}
                      </p>
                    )}
                    {contact.global_contact?.city && (
                      <p className="text-xs text-muted-foreground mt-1">
                        📍 {contact.global_contact.city}
                      </p>
                    )}
                    {contact.last_contact_date && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last: {new Date(contact.last_contact_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}

                {groupedByStatus[status].length === 0 && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No contacts
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CRMView;
