import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Check,
  X,
  AlertTriangle,
  ArrowRight,
  Building2,
  MapPin,
  Mail,
  Linkedin,
  Users,
  Merge,
  Plus,
  SkipForward,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  MatchResult,
  DeduplicationSummary,
  ParsedContact,
  ExistingContact,
} from "@/lib/fundDeduplication";

interface DuplicateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: DeduplicationSummary;
  onConfirmImport: (
    toCreate: ParsedContact[],
    toUpdate: { id: string; data: ParsedContact }[]
  ) => void;
}

export function DuplicateReviewModal({
  isOpen,
  onClose,
  summary,
  onConfirmImport,
}: DuplicateReviewModalProps) {
  const [currentMergeIndex, setCurrentMergeIndex] = useState(0);
  const [mergeDecisions, setMergeDecisions] = useState<Map<number, 'merge' | 'skip' | 'create_new'>>(
    new Map()
  );

  const currentMerge = summary.mergeCandidates[currentMergeIndex];
  const totalMergeCandidates = summary.mergeCandidates.length;

  const handleMergeDecision = (decision: 'merge' | 'skip' | 'create_new') => {
    setMergeDecisions(prev => new Map(prev).set(currentMergeIndex, decision));
    
    if (currentMergeIndex < totalMergeCandidates - 1) {
      setCurrentMergeIndex(prev => prev + 1);
    }
  };

  const handleAcceptAllMerges = () => {
    const newDecisions = new Map(mergeDecisions);
    for (let i = 0; i < totalMergeCandidates; i++) {
      if (!newDecisions.has(i)) {
        newDecisions.set(i, 'merge');
      }
    }
    setMergeDecisions(newDecisions);
  };

  const handleConfirmImport = () => {
    const toCreate: ParsedContact[] = [];
    const toUpdate: { id: string; data: ParsedContact }[] = [];

    // Add all new contacts
    toCreate.push(...summary.newContacts.map(r => r.incoming));
    
    // Add all related contacts (team members at same org)
    toCreate.push(...summary.relatedContacts.map(r => r.incoming));

    // Process merge decisions
    summary.mergeCandidates.forEach((result, index) => {
      const decision = mergeDecisions.get(index) || 'skip';
      
      if (decision === 'merge' && result.mergedData && result.existingMatch) {
        toUpdate.push({
          id: result.existingMatch.id,
          data: result.mergedData,
        });
      } else if (decision === 'create_new') {
        toCreate.push(result.incoming);
      }
      // 'skip' = do nothing
    });

    onConfirmImport(toCreate, toUpdate);
  };

  const getDecisionCount = (decision: 'merge' | 'skip' | 'create_new') => {
    let count = 0;
    mergeDecisions.forEach(d => {
      if (d === decision) count++;
    });
    return count;
  };

  const undecidedCount = totalMergeCandidates - mergeDecisions.size;

  const formatTicketSize = (min: number | null, max: number | null) => {
    if (!min && !max) return null;
    const format = (n: number) => (n >= 1000 ? `${n / 1000}M` : `${n}K`);
    if (min && max) return `€${format(min)} - €${format(max)}`;
    if (min) return `€${format(min)}+`;
    if (max) return `Up to €${format(max)}`;
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Merge className="w-5 h-5 text-primary" />
            Review Import Analysis
          </DialogTitle>
          <DialogDescription>
            We found existing records that may match your upload. Review merge candidates below.
          </DialogDescription>
        </DialogHeader>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-3 py-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
            <Plus className="w-5 h-5 mx-auto text-green-500 mb-1" />
            <div className="text-2xl font-bold text-green-500">{summary.newContacts.length}</div>
            <div className="text-xs text-muted-foreground">New Records</div>
          </div>
          
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-center">
            <Merge className="w-5 h-5 mx-auto text-amber-500 mb-1" />
            <div className="text-2xl font-bold text-amber-500">{summary.mergeCandidates.length}</div>
            <div className="text-xs text-muted-foreground">Merge Candidates</div>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
            <SkipForward className="w-5 h-5 mx-auto text-red-500 mb-1" />
            <div className="text-2xl font-bold text-red-500">{summary.exactDuplicates.length}</div>
            <div className="text-xs text-muted-foreground">Duplicates (Skip)</div>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
            <Users className="w-5 h-5 mx-auto text-blue-500 mb-1" />
            <div className="text-2xl font-bold text-blue-500">{summary.relatedContacts.length}</div>
            <div className="text-xs text-muted-foreground">Team Members</div>
          </div>
        </div>

        {/* Merge Review Section */}
        {totalMergeCandidates > 0 && (
          <div className="flex-1 overflow-hidden flex flex-col border border-border/50 rounded-lg">
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border/50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="font-medium">
                  Merge Candidate {currentMergeIndex + 1} of {totalMergeCandidates}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentMergeIndex === 0}
                  onClick={() => setCurrentMergeIndex(prev => prev - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentMergeIndex === totalMergeCandidates - 1}
                  onClick={() => setCurrentMergeIndex(prev => prev + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {currentMerge && (
              <ScrollArea className="flex-1 p-4">
                {/* Match info */}
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="text-amber-500 border-amber-500/50">
                    {currentMerge.confidence}% match confidence
                  </Badge>
                  {currentMerge.matchReasons.map((reason, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {reason}
                    </Badge>
                  ))}
                </div>

                {/* Side by side comparison */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Existing Record */}
                  <div className="border border-border/50 rounded-lg overflow-hidden">
                    <div className="px-4 py-2 bg-muted/30 border-b border-border/50">
                      <span className="text-sm font-medium text-muted-foreground">
                        EXISTING RECORD
                      </span>
                    </div>
                    <div className="p-4">
                      <ContactCard contact={currentMerge.existingMatch!} formatTicketSize={formatTicketSize} />
                    </div>
                  </div>

                  {/* Incoming Record */}
                  <div className="border border-border/50 rounded-lg overflow-hidden">
                    <div className="px-4 py-2 bg-primary/10 border-b border-primary/30">
                      <span className="text-sm font-medium text-primary">
                        INCOMING RECORD
                      </span>
                    </div>
                    <div className="p-4">
                      <ContactCard contact={currentMerge.incoming} formatTicketSize={formatTicketSize} />
                    </div>
                  </div>
                </div>

                {/* Merged Preview */}
                {currentMerge.mergedData && (
                  <div className="mt-4 border border-green-500/30 rounded-lg overflow-hidden">
                    <div className="px-4 py-2 bg-green-500/10 border-b border-green-500/30 flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-500">
                        MERGED RESULT (if you choose merge)
                      </span>
                    </div>
                    <div className="p-4">
                      <ContactCard 
                        contact={currentMerge.mergedData} 
                        formatTicketSize={formatTicketSize}
                        highlightChanges={currentMerge.existingMatch!}
                      />
                    </div>
                  </div>
                )}

                {/* Decision buttons */}
                <div className="flex gap-3 mt-6">
                  <Button
                    variant={mergeDecisions.get(currentMergeIndex) === 'merge' ? 'default' : 'outline'}
                    className="flex-1 gap-2"
                    onClick={() => handleMergeDecision('merge')}
                  >
                    <Merge className="w-4 h-4" />
                    Merge Records
                  </Button>
                  <Button
                    variant={mergeDecisions.get(currentMergeIndex) === 'create_new' ? 'default' : 'outline'}
                    className="flex-1 gap-2"
                    onClick={() => handleMergeDecision('create_new')}
                  >
                    <Plus className="w-4 h-4" />
                    Create New
                  </Button>
                  <Button
                    variant={mergeDecisions.get(currentMergeIndex) === 'skip' ? 'destructive' : 'outline'}
                    className="flex-1 gap-2"
                    onClick={() => handleMergeDecision('skip')}
                  >
                    <SkipForward className="w-4 h-4" />
                    Skip
                  </Button>
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-border/50 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {undecidedCount > 0 ? (
              <span className="text-amber-500">{undecidedCount} merge candidates undecided</span>
            ) : (
              <span className="text-green-500">All merge candidates reviewed</span>
            )}
            {' • '}
            <span>{getDecisionCount('merge')} to merge</span>
            {' • '}
            <span>{getDecisionCount('create_new')} to create</span>
            {' • '}
            <span>{getDecisionCount('skip')} to skip</span>
          </div>
          
          <div className="flex gap-2">
            {undecidedCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleAcceptAllMerges}>
                Accept All Merges
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirmImport} className="gap-2">
              <Check className="w-4 h-4" />
              Confirm Import ({summary.newContacts.length + summary.relatedContacts.length + getDecisionCount('merge') + getDecisionCount('create_new')} records)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for displaying contact details
function ContactCard({ 
  contact, 
  formatTicketSize,
  highlightChanges,
}: { 
  contact: ParsedContact | ExistingContact;
  formatTicketSize: (min: number | null, max: number | null) => string | null;
  highlightChanges?: ParsedContact | ExistingContact;
}) {
  const isChanged = (field: keyof ParsedContact) => {
    if (!highlightChanges) return false;
    const oldVal = highlightChanges[field];
    const newVal = contact[field];
    
    if (Array.isArray(oldVal) && Array.isArray(newVal)) {
      return JSON.stringify(oldVal.sort()) !== JSON.stringify(newVal.sort());
    }
    return oldVal !== newVal;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Building2 className="w-4 h-4 text-muted-foreground" />
        <span className={`font-medium ${isChanged('organization_name') ? 'text-green-500' : ''}`}>
          {contact.organization_name || contact.name}
        </span>
        <Badge variant="outline" className="text-xs capitalize">
          {contact.entity_type}
        </Badge>
      </div>

      {(contact.city || contact.country) && (
        <div className={`flex items-center gap-1 text-sm ${isChanged('city') || isChanged('country') ? 'text-green-500' : 'text-muted-foreground'}`}>
          <MapPin className="w-3 h-3" />
          {[contact.city, contact.country].filter(Boolean).join(", ")}
        </div>
      )}

      {contact.email && (
        <div className={`flex items-center gap-1 text-sm ${isChanged('email') ? 'text-green-500' : 'text-muted-foreground'}`}>
          <Mail className="w-3 h-3" />
          {contact.email}
        </div>
      )}

      {contact.linkedin_url && (
        <div className={`flex items-center gap-1 text-sm ${isChanged('linkedin_url') ? 'text-green-500' : 'text-muted-foreground'}`}>
          <Linkedin className="w-3 h-3" />
          {contact.linkedin_url}
        </div>
      )}

      <div className={`flex flex-wrap gap-1.5 ${isChanged('stages') ? 'ring-1 ring-green-500 rounded p-1' : ''}`}>
        {contact.stages.map((stage) => (
          <Badge key={stage} variant="secondary" className="text-xs">
            {stage}
          </Badge>
        ))}
      </div>

      <div className={`flex flex-wrap gap-1.5 ${isChanged('investment_focus') ? 'ring-1 ring-green-500 rounded p-1' : ''}`}>
        {contact.investment_focus.slice(0, 5).map((focus) => (
          <Badge key={focus} variant="outline" className="text-xs">
            {focus}
          </Badge>
        ))}
        {contact.investment_focus.length > 5 && (
          <Badge variant="outline" className="text-xs">
            +{contact.investment_focus.length - 5}
          </Badge>
        )}
      </div>

      {(contact.ticket_size_min || contact.ticket_size_max) && (
        <div className={`text-sm ${isChanged('ticket_size_min') || isChanged('ticket_size_max') ? 'text-green-500' : 'text-muted-foreground'}`}>
          Ticket: {formatTicketSize(contact.ticket_size_min, contact.ticket_size_max)}
        </div>
      )}

      {contact.fund_size && (
        <div className={`text-sm ${isChanged('fund_size') ? 'text-green-500' : 'text-muted-foreground'}`}>
          Fund Size: €{contact.fund_size >= 1000 ? `${contact.fund_size / 1000}B` : `${contact.fund_size}M`}
        </div>
      )}
    </div>
  );
}
