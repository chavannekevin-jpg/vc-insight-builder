import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  Search,
  Merge,
  Trash2,
  Check,
  Building2,
  MapPin,
  Mail,
  Linkedin,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Sparkles,
  SkipForward,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  normalizeOrgName,
  normalizeName,
  stringSimilarity,
  mergeContacts,
  ExistingContact,
  ParsedContact,
} from "@/lib/fundDeduplication";

interface DuplicateGroup {
  key: string;
  contacts: ExistingContact[];
  suggestedMerge: ParsedContact;
  confidence: number;
}

interface DuplicateCleanupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DuplicateCleanupModal({
  isOpen,
  onClose,
  onSuccess,
}: DuplicateCleanupModalProps) {
  const [step, setStep] = useState<"scanning" | "review" | "processing">("scanning");
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [decisions, setDecisions] = useState<Map<number, "merge" | "skip" | "delete_duplicates">>(new Map());
  const [progress, setProgress] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      scanForDuplicates();
    }
  }, [isOpen]);

  const scanForDuplicates = async () => {
    setStep("scanning");
    setScanProgress(0);
    
    try {
      // Fetch all global contacts
      const { data: contacts, error } = await supabase
        .from("global_contacts")
        .select("id, name, organization_name, entity_type, city, country, city_lat, city_lng, email, linkedin_url, stages, investment_focus, ticket_size_min, ticket_size_max, fund_size, thesis_keywords, notable_investments, contributor_count")
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      const allContacts: ExistingContact[] = (contacts || []).map(c => ({
        id: c.id,
        name: c.name || '',
        organization_name: c.organization_name || null,
        entity_type: (c.entity_type as "investor" | "fund") || "fund",
        city: c.city || null,
        country: c.country || null,
        city_lat: c.city_lat || null,
        city_lng: c.city_lng || null,
        email: c.email || null,
        linkedin_url: c.linkedin_url || null,
        stages: Array.isArray(c.stages) ? c.stages as string[] : [],
        investment_focus: Array.isArray(c.investment_focus) ? c.investment_focus as string[] : [],
        ticket_size_min: c.ticket_size_min || null,
        ticket_size_max: c.ticket_size_max || null,
        fund_size: c.fund_size || null,
        thesis_keywords: Array.isArray(c.thesis_keywords) ? c.thesis_keywords as string[] : [],
        notable_investments: Array.isArray(c.notable_investments) ? c.notable_investments as string[] : [],
        contributor_count: c.contributor_count || 1,
      }));

      setScanProgress(20);

      // Group by normalized organization name
      const orgGroups = new Map<string, ExistingContact[]>();
      
      for (const contact of allContacts) {
        const normalizedOrg = normalizeOrgName(contact.organization_name);
        if (!normalizedOrg || normalizedOrg.length < 2) continue;
        
        // Find existing group with similar name
        let foundGroup = false;
        for (const [key, group] of orgGroups.entries()) {
          const similarity = stringSimilarity(key, normalizedOrg);
          if (similarity >= 85) {
            group.push(contact);
            foundGroup = true;
            break;
          }
        }
        
        if (!foundGroup) {
          orgGroups.set(normalizedOrg, [contact]);
        }
      }

      setScanProgress(60);

      // Filter to only groups with 2+ contacts (potential duplicates)
      const duplicates: DuplicateGroup[] = [];
      
      for (const [key, contacts] of orgGroups.entries()) {
        if (contacts.length >= 2) {
          // Check if they're actually duplicates (same org) vs team members (different people)
          const byName = new Map<string, ExistingContact[]>();
          
          for (const contact of contacts) {
            const normalizedName = normalizeName(contact.name);
            
            let foundNameGroup = false;
            for (const [nameKey, nameGroup] of byName.entries()) {
              const nameSimilarity = stringSimilarity(nameKey, normalizedName);
              if (nameSimilarity >= 70) {
                nameGroup.push(contact);
                foundNameGroup = true;
                break;
              }
            }
            
            if (!foundNameGroup) {
              byName.set(normalizedName, [contact]);
            }
          }
          
          // Create duplicate groups for name matches
          for (const [nameKey, nameContacts] of byName.entries()) {
            if (nameContacts.length >= 2) {
              // Sort by contributor_count (keep richest data) and created_at (prefer older)
              const sorted = [...nameContacts].sort((a, b) => {
                const contribDiff = (b.contributor_count || 1) - (a.contributor_count || 1);
                if (contribDiff !== 0) return contribDiff;
                return 0; // Keep original order (older first)
              });
              
              // Create merged suggestion from all contacts
              let merged = sorted[0];
              for (let i = 1; i < sorted.length; i++) {
                merged = mergeContacts(merged as ExistingContact, sorted[i]) as ExistingContact;
              }
              
              // Calculate confidence based on how similar the records are
              const orgSimilarities = nameContacts.map((c, i) => 
                nameContacts.slice(i + 1).map(c2 => 
                  stringSimilarity(normalizeOrgName(c.organization_name), normalizeOrgName(c2.organization_name))
                )
              ).flat();
              
              const avgOrgSimilarity = orgSimilarities.length > 0 
                ? orgSimilarities.reduce((a, b) => a + b, 0) / orgSimilarities.length 
                : 100;
              
              duplicates.push({
                key: `${key}-${nameKey}`,
                contacts: nameContacts,
                suggestedMerge: merged,
                confidence: Math.round(avgOrgSimilarity),
              });
            }
          }
        }
      }

      setScanProgress(100);
      
      // Sort by confidence (highest first)
      duplicates.sort((a, b) => b.confidence - a.confidence);
      
      setDuplicateGroups(duplicates);
      setCurrentGroupIndex(0);
      setDecisions(new Map());
      setStep("review");
      
      if (duplicates.length === 0) {
        toast({
          title: "No duplicates found",
          description: "Your database is clean! No duplicate funds detected.",
        });
      } else {
        toast({
          title: `Found ${duplicates.length} duplicate groups`,
          description: "Review and decide how to handle each group",
        });
      }
    } catch (error: any) {
      console.error("Error scanning for duplicates:", error);
      toast({
        title: "Scan failed",
        description: error.message || "Failed to scan for duplicates",
        variant: "destructive",
      });
      onClose();
    }
  };

  const handleDecision = (decision: "merge" | "skip" | "delete_duplicates") => {
    setDecisions(prev => new Map(prev).set(currentGroupIndex, decision));
    
    if (currentGroupIndex < duplicateGroups.length - 1) {
      setCurrentGroupIndex(prev => prev + 1);
    }
  };

  const handleMergeAll = () => {
    const newDecisions = new Map(decisions);
    for (let i = 0; i < duplicateGroups.length; i++) {
      if (!newDecisions.has(i)) {
        newDecisions.set(i, "merge");
      }
    }
    setDecisions(newDecisions);
  };

  const handleProcessDecisions = async () => {
    setStep("processing");
    setProgress(0);
    
    let mergedCount = 0;
    let deletedCount = 0;
    const totalGroups = duplicateGroups.length;
    
    try {
      for (let i = 0; i < duplicateGroups.length; i++) {
        const group = duplicateGroups[i];
        const decision = decisions.get(i) || "skip";
        
        if (decision === "merge") {
          // Keep the first contact (oldest/richest) and update it with merged data
          const keepId = group.contacts[0].id;
          const deleteIds = group.contacts.slice(1).map(c => c.id);
          
          // Update the kept contact with merged data
          const { error: updateError } = await supabase
            .from("global_contacts")
            .update({
              name: group.suggestedMerge.name,
              organization_name: group.suggestedMerge.organization_name,
              city: group.suggestedMerge.city,
              country: group.suggestedMerge.country,
              city_lat: group.suggestedMerge.city_lat,
              city_lng: group.suggestedMerge.city_lng,
              email: group.suggestedMerge.email,
              linkedin_url: group.suggestedMerge.linkedin_url,
              stages: group.suggestedMerge.stages,
              investment_focus: group.suggestedMerge.investment_focus,
              ticket_size_min: group.suggestedMerge.ticket_size_min,
              ticket_size_max: group.suggestedMerge.ticket_size_max,
              fund_size: group.suggestedMerge.fund_size,
              thesis_keywords: group.suggestedMerge.thesis_keywords,
              notable_investments: group.suggestedMerge.notable_investments,
              contributor_count: group.contacts.reduce((sum, c) => sum + (c.contributor_count || 1), 0),
              updated_at: new Date().toISOString(),
            })
            .eq("id", keepId);
          
          if (updateError) {
            console.error("Error updating contact:", updateError);
            continue;
          }
          
          // Update investor_contacts to point to the kept contact
          for (const deleteId of deleteIds) {
            await supabase
              .from("investor_contacts")
              .update({ global_contact_id: keepId })
              .eq("global_contact_id", deleteId);
          }
          
          // Delete the duplicate contacts
          for (const deleteId of deleteIds) {
            await supabase.from("global_contacts").delete().eq("id", deleteId);
            deletedCount++;
          }
          
          mergedCount++;
        } else if (decision === "delete_duplicates") {
          // Delete all but the first contact
          const deleteIds = group.contacts.slice(1).map(c => c.id);
          
          for (const deleteId of deleteIds) {
            // Update investor_contacts to point to the kept contact
            await supabase
              .from("investor_contacts")
              .update({ global_contact_id: group.contacts[0].id })
              .eq("global_contact_id", deleteId);
            
            await supabase.from("global_contacts").delete().eq("id", deleteId);
            deletedCount++;
          }
        }
        
        setProgress(Math.round(((i + 1) / totalGroups) * 100));
      }
      
      toast({
        title: "Cleanup complete",
        description: `Merged ${mergedCount} groups, deleted ${deletedCount} duplicate records`,
      });
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error processing decisions:", error);
      toast({
        title: "Processing failed",
        description: error.message || "Failed to process cleanup",
        variant: "destructive",
      });
      setStep("review");
    }
  };

  const currentGroup = duplicateGroups[currentGroupIndex];
  const undecidedCount = duplicateGroups.length - decisions.size;
  const mergeCount = Array.from(decisions.values()).filter(d => d === "merge").length;
  const skipCount = Array.from(decisions.values()).filter(d => d === "skip").length;
  const deleteCount = Array.from(decisions.values()).filter(d => d === "delete_duplicates").length;

  const handleClose = () => {
    setStep("scanning");
    setDuplicateGroups([]);
    setCurrentGroupIndex(0);
    setDecisions(new Map());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Clean Up Duplicate Funds
          </DialogTitle>
          <DialogDescription>
            Scan your database for duplicate fund entries and merge them into consolidated profiles
          </DialogDescription>
        </DialogHeader>

        {step === "scanning" && (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium mb-4">Scanning for duplicates...</p>
            <div className="w-full max-w-xs">
              <Progress value={scanProgress} className="h-2" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {scanProgress < 20 && "Fetching contacts..."}
              {scanProgress >= 20 && scanProgress < 60 && "Grouping by organization..."}
              {scanProgress >= 60 && scanProgress < 100 && "Analyzing duplicates..."}
              {scanProgress >= 100 && "Complete!"}
            </p>
          </div>
        )}

        {step === "review" && duplicateGroups.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <Check className="w-16 h-16 text-primary mb-4" />
            <p className="text-xl font-medium mb-2">No Duplicates Found!</p>
            <p className="text-muted-foreground mb-6">Your global contacts database is clean.</p>
            <Button onClick={handleClose}>Close</Button>
          </div>
        )}

        {step === "review" && duplicateGroups.length > 0 && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-3 py-2">
              <div className="bg-muted/30 border border-border/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{duplicateGroups.length}</div>
                <div className="text-xs text-muted-foreground">Duplicate Groups</div>
              </div>
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary">{mergeCount}</div>
                <div className="text-xs text-muted-foreground">To Merge</div>
              </div>
              <div className="bg-muted/30 border border-border/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{skipCount}</div>
                <div className="text-xs text-muted-foreground">To Skip</div>
              </div>
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-destructive">{deleteCount}</div>
                <div className="text-xs text-muted-foreground">Delete Only</div>
              </div>
            </div>

            {/* Current Group Review */}
            <div className="flex-1 overflow-hidden flex flex-col border border-border/50 rounded-lg">
              <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="font-medium">
                    Group {currentGroupIndex + 1} of {duplicateGroups.length}
                  </span>
                  <Badge variant="outline" className="text-amber-600 border-amber-600/50">
                    {currentGroup?.confidence}% match
                  </Badge>
                  {decisions.has(currentGroupIndex) && (
                    <Badge variant={
                      decisions.get(currentGroupIndex) === "merge" ? "default" :
                      decisions.get(currentGroupIndex) === "skip" ? "secondary" : "destructive"
                    }>
                      {decisions.get(currentGroupIndex)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentGroupIndex === 0}
                    onClick={() => setCurrentGroupIndex(prev => prev - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {currentGroupIndex + 1} / {duplicateGroups.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentGroupIndex === duplicateGroups.length - 1}
                    onClick={() => setCurrentGroupIndex(prev => prev + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {currentGroup && (
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {/* Duplicate Records */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        {currentGroup.contacts.length} DUPLICATE RECORDS
                      </h4>
                      <div className="grid gap-3">
                        {currentGroup.contacts.map((contact, idx) => (
                          <div 
                            key={contact.id} 
                            className={`border rounded-lg p-4 ${
                              idx === 0 ? "border-primary/50 bg-primary/5" : "border-border/50"
                            }`}
                          >
                            {idx === 0 && (
                              <Badge variant="secondary" className="mb-2 text-xs">
                                Primary (will be kept)
                              </Badge>
                            )}
                            <ContactDisplay contact={contact} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Merged Preview */}
                    <div className="border border-primary/30 rounded-lg overflow-hidden">
                      <div className="px-4 py-2 bg-primary/10 border-b border-primary/30 flex items-center gap-2">
                        <Merge className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                          MERGED RESULT (if you choose merge)
                        </span>
                      </div>
                      <div className="p-4">
                        <ContactDisplay contact={currentGroup.suggestedMerge as ExistingContact} />
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              )}

              {/* Decision Buttons */}
              <div className="p-4 border-t border-border/50 flex gap-3">
                <Button
                  variant={decisions.get(currentGroupIndex) === "merge" ? "default" : "outline"}
                  className="flex-1 gap-2"
                  onClick={() => handleDecision("merge")}
                >
                  <Merge className="w-4 h-4" />
                  Merge All
                </Button>
                <Button
                  variant={decisions.get(currentGroupIndex) === "delete_duplicates" ? "destructive" : "outline"}
                  className="flex-1 gap-2"
                  onClick={() => handleDecision("delete_duplicates")}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Duplicates
                </Button>
                <Button
                  variant={decisions.get(currentGroupIndex) === "skip" ? "secondary" : "outline"}
                  className="flex-1 gap-2"
                  onClick={() => handleDecision("skip")}
                >
                  <SkipForward className="w-4 h-4" />
                  Skip
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-border/50 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {undecidedCount > 0 ? (
                  <span className="text-amber-500">{undecidedCount} groups undecided</span>
                ) : (
                  <span className="text-primary">All groups reviewed</span>
                )}
              </div>
              
              <div className="flex gap-2">
                {undecidedCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleMergeAll}>
                    Merge All Remaining
                  </Button>
                )}
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleProcessDecisions} 
                  disabled={mergeCount + deleteCount === 0}
                  className="gap-2"
                >
                  <Check className="w-4 h-4" />
                  Apply Changes ({mergeCount + deleteCount} groups)
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "processing" && (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium mb-4">Processing cleanup...</p>
            <div className="w-full max-w-xs">
              <Progress value={progress} className="h-2" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">{progress}% complete</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Helper component for displaying contact details
function ContactDisplay({ contact }: { contact: ExistingContact }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Building2 className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium">{contact.organization_name || contact.name}</span>
        <Badge variant="outline" className="text-xs capitalize">{contact.entity_type}</Badge>
        {contact.contributor_count && contact.contributor_count > 1 && (
          <Badge variant="secondary" className="text-xs">
            {contact.contributor_count} sources
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <span className="font-medium">{contact.name}</span>
      </div>

      {(contact.city || contact.country) && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="w-3 h-3" />
          {[contact.city, contact.country].filter(Boolean).join(", ")}
        </div>
      )}

      {contact.email && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Mail className="w-3 h-3" />
          {contact.email}
        </div>
      )}

      {contact.linkedin_url && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Linkedin className="w-3 h-3" />
          <span className="truncate max-w-[200px]">{contact.linkedin_url}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {contact.stages.slice(0, 4).map((stage) => (
          <Badge key={stage} variant="secondary" className="text-xs">{stage}</Badge>
        ))}
        {contact.stages.length > 4 && (
          <Badge variant="secondary" className="text-xs">+{contact.stages.length - 4}</Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {contact.investment_focus.slice(0, 4).map((focus) => (
          <Badge key={focus} variant="outline" className="text-xs">{focus}</Badge>
        ))}
        {contact.investment_focus.length > 4 && (
          <Badge variant="outline" className="text-xs">+{contact.investment_focus.length - 4}</Badge>
        )}
      </div>

      {contact.fund_size && (
        <div className="text-sm text-muted-foreground">
          Fund Size: €{contact.fund_size >= 1000 ? `${contact.fund_size / 1000}B` : `${contact.fund_size}M`}
        </div>
      )}
    </div>
  );
}
