import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Send, Building2, MapPin, Check } from "lucide-react";
import { useInvestorList } from "@/hooks/useInvestorList";
import { useShareDeal } from "@/hooks/useShareDeal";
import { cn } from "@/lib/utils";

interface ShareDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  currentInvestorId: string;
}

export function ShareDealModal({
  isOpen,
  onClose,
  companyId,
  companyName,
  currentInvestorId,
}: ShareDealModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvestorId, setSelectedInvestorId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const { data: investors = [], isLoading } = useInvestorList(currentInvestorId);
  const shareDeal = useShareDeal();

  const filteredInvestors = investors.filter(
    (inv) =>
      inv.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.organization_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShare = async () => {
    if (!selectedInvestorId) return;

    await shareDeal.mutateAsync({
      fromInvestorId: currentInvestorId,
      toInvestorId: selectedInvestorId,
      companyId,
      message: message.trim() || undefined,
    });

    setSelectedInvestorId(null);
    setMessage("");
    onClose();
  };

  const getInvestorTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      vc: "VC",
      business_angel: "Angel",
      family_office: "Family Office",
      corporate_vc: "Corporate VC",
      lp: "LP",
      other: "Other",
    };
    return labels[type] || type;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{companyName}"</DialogTitle>
          <DialogDescription>
            Select an investor to share this deal with
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search investors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Investor List */}
          <ScrollArea className="h-[200px] border rounded-lg">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">Loading investors...</div>
            ) : filteredInvestors.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {searchQuery ? "No investors found" : "No other investors on platform yet"}
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredInvestors.map((investor) => (
                  <button
                    key={investor.id}
                    onClick={() => setSelectedInvestorId(investor.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                      selectedInvestorId === investor.id
                        ? "bg-primary/10 border border-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {investor.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{investor.full_name}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {investor.organization_name && (
                          <span className="flex items-center gap-1 truncate">
                            <Building2 className="h-3 w-3" />
                            {investor.organization_name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {investor.city}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {getInvestorTypeLabel(investor.investor_type)}
                      </Badge>
                      {selectedInvestorId === investor.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Optional Message */}
          {selectedInvestorId && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Add a note (optional)</label>
              <Textarea
                placeholder="Why you're sharing this deal..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              disabled={!selectedInvestorId || shareDeal.isPending}
              className="flex-1 gap-2"
            >
              <Send className="h-4 w-4" />
              {shareDeal.isPending ? "Sharing..." : "Share Deal"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
