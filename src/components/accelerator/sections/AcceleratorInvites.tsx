import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Plus, Copy, Check, ExternalLink, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Invite {
  id: string;
  code: string;
  accelerator_name: string;
  cohort_name: string | null;
  custom_message: string | null;
  discount_percent: number;
  uses: number;
  max_uses: number | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface AcceleratorInvitesProps {
  acceleratorId: string;
  acceleratorName: string;
  acceleratorSlug: string;
}

export function AcceleratorInvites({ acceleratorId, acceleratorName, acceleratorSlug }: AcceleratorInvitesProps) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [newInvite, setNewInvite] = useState({
    cohortName: "",
    customMessage: "",
    discountPercent: 100,
    maxUses: "",
  });

  useEffect(() => {
    fetchInvites();
  }, [acceleratorId]);

  const fetchInvites = async () => {
    try {
      const { data, error } = await supabase
        .from("accelerator_invites")
        .select("*")
        .eq("linked_accelerator_id", acceleratorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvites(data || []);
    } catch (error) {
      console.error("Error fetching invites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  };

  const handleCreateInvite = async () => {
    setIsCreating(true);
    try {
      const code = generateCode();
      
      const { error } = await supabase
        .from("accelerator_invites")
        .insert({
          code,
          accelerator_name: acceleratorName,
          accelerator_slug: acceleratorSlug,
          cohort_name: newInvite.cohortName || null,
          custom_message: newInvite.customMessage || null,
          discount_percent: newInvite.discountPercent,
          max_uses: newInvite.maxUses ? parseInt(newInvite.maxUses) : null,
          linked_accelerator_id: acceleratorId,
          is_active: true,
        });

      if (error) throw error;

      toast.success("Invite code created!");
      setIsCreateOpen(false);
      setNewInvite({ cohortName: "", customMessage: "", discountPercent: 100, maxUses: "" });
      fetchInvites();
    } catch (error: any) {
      console.error("Create invite error:", error);
      toast.error(error.message || "Failed to create invite");
    } finally {
      setIsCreating(false);
    }
  };

  const copyInviteLink = (invite: Invite) => {
    const link = `${window.location.origin}/invite/${invite.code}`;
    navigator.clipboard.writeText(link);
    setCopiedId(invite.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Invite link copied!");
  };

  const toggleInviteActive = async (inviteId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("accelerator_invites")
        .update({ is_active: !currentStatus })
        .eq("id", inviteId);

      if (error) throw error;
      toast.success(currentStatus ? "Invite deactivated" : "Invite activated");
      fetchInvites();
    } catch (error) {
      toast.error("Failed to update invite");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invite Codes</h1>
          <p className="text-muted-foreground">Create and manage startup invite codes</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Invite
        </Button>
      </div>

      {invites.length === 0 ? (
        <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-12 text-center">
          <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No invite codes yet</h3>
          <p className="text-muted-foreground mb-4">
            Create invite codes for startups to join your accelerator ecosystem.
          </p>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create First Invite
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {invites.map((invite, i) => (
            <motion.div
              key={invite.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-5"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <code className="px-3 py-1 rounded-lg bg-primary/10 text-primary font-mono font-bold">
                      {invite.code}
                    </code>
                    {invite.is_active ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">Active</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Inactive</span>
                    )}
                    {invite.discount_percent === 100 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning">Free Access</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {invite.cohort_name && <span>Cohort: {invite.cohort_name}</span>}
                    <span>{invite.uses} / {invite.max_uses || "∞"} uses</span>
                    {invite.discount_percent < 100 && (
                      <span>{invite.discount_percent}% discount</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyInviteLink(invite)}
                    className="gap-2"
                  >
                    {copiedId === invite.id ? (
                      <>
                        <Check className="w-4 h-4 text-success" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Link
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleInviteActive(invite.id, invite.is_active)}
                  >
                    {invite.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
              {invite.custom_message && (
                <p className="mt-3 text-sm text-muted-foreground border-t border-border/30 pt-3">
                  "{invite.custom_message}"
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Invite Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Invite Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cohortName">Cohort Name (Optional)</Label>
              <Input
                id="cohortName"
                placeholder="e.g., Winter 2024 Batch"
                value={newInvite.cohortName}
                onChange={(e) => setNewInvite(prev => ({ ...prev, cohortName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customMessage">Welcome Message (Optional)</Label>
              <Textarea
                id="customMessage"
                placeholder="Welcome to our accelerator program..."
                value={newInvite.customMessage}
                onChange={(e) => setNewInvite(prev => ({ ...prev, customMessage: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountPercent">Discount %</Label>
                <Input
                  id="discountPercent"
                  type="number"
                  min="0"
                  max="100"
                  value={newInvite.discountPercent}
                  onChange={(e) => setNewInvite(prev => ({ ...prev, discountPercent: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxUses">Max Uses (empty = unlimited)</Label>
                <Input
                  id="maxUses"
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={newInvite.maxUses}
                  onChange={(e) => setNewInvite(prev => ({ ...prev, maxUses: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateInvite} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
