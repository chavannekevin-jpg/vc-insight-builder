import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Crown, UserMinus, Loader2, Copy, Check, Link2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string | null;
  invite_email: string | null;
  email?: string;
}

interface TeamInvite {
  id: string;
  code: string;
  role: string;
  max_uses: number | null;
  uses: number;
  is_active: boolean;
  created_at: string;
}

interface AcceleratorTeamProps {
  acceleratorId: string;
  acceleratorName: string;
  currentUserId: string;
  isDemo?: boolean;
}

const roleLabels: Record<string, { label: string; icon: any; color: string }> = {
  head: { label: "Ecosystem Head", icon: Crown, color: "text-warning" },
  member: { label: "Team Member", icon: Users, color: "text-primary" },
};

export function AcceleratorTeam({ acceleratorId, acceleratorName, currentUserId, isDemo = false }: AcceleratorTeamProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [maxUses, setMaxUses] = useState("5");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [generatedInvite, setGeneratedInvite] = useState<{ code: string; link: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, [acceleratorId]);

  const fetchData = async () => {
    try {
      // Fetch members
      const { data: memberData, error: memberError } = await supabase
        .from("accelerator_members")
        .select("*")
        .eq("accelerator_id", acceleratorId)
        .not("joined_at", "is", null)
        .order("joined_at", { ascending: false });

      if (memberError) throw memberError;
      setMembers(memberData || []);

      // Fetch active invites
      const { data: inviteData, error: inviteError } = await supabase
        .from("accelerator_team_invites")
        .select("*")
        .eq("accelerator_id", acceleratorId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!inviteError) {
        setInvites(inviteData || []);
      }
    } catch (error) {
      console.error("Error fetching team:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateInvite = async () => {
    if (isDemo) {
      toast.info("This is a demo - creating invites is disabled");
      return;
    }
    
    setIsCreating(true);
    try {
      const code = generateCode();
      
      const { data, error } = await supabase
        .from("accelerator_team_invites")
        .insert({
          accelerator_id: acceleratorId,
          code,
          role: "member",
          inviter_id: currentUserId,
          max_uses: maxUses ? parseInt(maxUses) : null,
        })
        .select()
        .single();

      if (error) throw error;

      const inviteLink = `${window.location.origin}/accelerator/auth?code=${code}`;
      setGeneratedInvite({ code, link: inviteLink });
      
      toast.success("Invite code created!");
      fetchData();
    } catch (error: any) {
      console.error("Create invite error:", error);
      toast.error(error.message || "Failed to create invite");
    } finally {
      setIsCreating(false);
    }
  };

  const copyInviteLink = (code: string) => {
    const link = `${window.location.origin}/accelerator/auth?code=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
    toast.success("Invite link copied!");
  };

  const handleDeactivateInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from("accelerator_team_invites")
        .update({ is_active: false })
        .eq("id", inviteId);

      if (error) throw error;
      toast.success("Invite deactivated");
      fetchData();
    } catch (error) {
      toast.error("Failed to deactivate invite");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("accelerator_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
      toast.success("Member removed");
      fetchData();
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  const resetDialog = () => {
    setIsInviteOpen(false);
    setMaxUses("5");
    setGeneratedInvite(null);
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
          <h1 className="text-2xl font-bold text-foreground">Team</h1>
          <p className="text-muted-foreground">Manage your accelerator team members</p>
        </div>
        <Button onClick={() => setIsInviteOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Invite Code
        </Button>
      </div>

      {/* Active Invite Codes */}
      {invites.length > 0 && (
        <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" />
            Active Invite Codes
          </h3>
          <div className="space-y-2">
            {invites.map((invite) => {
              const roleInfo = roleLabels[invite.role] || roleLabels.member;
              return (
                <div key={invite.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <code className="px-2 py-1 rounded bg-primary/10 text-primary font-mono text-sm">
                      {invite.code}
                    </code>
                    <span className={cn("text-xs", roleInfo.color)}>{roleInfo.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {invite.uses}/{invite.max_uses || "∞"} uses
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyInviteLink(invite.code)}
                      className="gap-1"
                    >
                      {copiedCode === invite.code ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      Copy Link
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeactivateInvite(invite.id)}
                    >
                      Deactivate
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Team List */}
      <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden">
        {members.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No team members yet</h3>
            <p className="text-muted-foreground mb-4">
              Create an invite code and share it with admins, mentors, and team members to join your ecosystem.
            </p>
            <Button onClick={() => setIsInviteOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Invite Code
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {members.map((member, i) => {
              const roleInfo = roleLabels[member.role] || roleLabels.member;
              const isCurrentUser = member.user_id === currentUserId;

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {(member.invite_email || "U").slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">
                          {member.invite_email || "Team Member"}
                        </p>
                        {isCurrentUser && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">You</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm">
                        <roleInfo.icon className={cn("w-3.5 h-3.5", roleInfo.color)} />
                        <span className="text-muted-foreground">{roleInfo.label}</span>
                      </div>
                    </div>
                  </div>
                  {!isCurrentUser && member.role !== "head" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Invite Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={resetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Create Team Invite Code
            </DialogTitle>
            <DialogDescription>
              Generate an invite code to share with new team members. They can use this code to join {acceleratorName}.
            </DialogDescription>
          </DialogHeader>
          
          {!generatedInvite ? (
            <div className="space-y-4 py-4">
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <p className="text-sm text-muted-foreground">
                  Team members will have the same access as the ecosystem head, allowing them to view and manage all portfolio startups.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Max Uses (leave empty for unlimited)</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="5"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                />
              </div>
              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={resetDialog}>Cancel</Button>
                <Button onClick={handleCreateInvite} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Generate Code"
                  )}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-center gap-2 text-green-600 mb-3">
                  <Check className="w-5 h-5" />
                  <span className="font-semibold">Invite Code Created!</span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Invite Code</Label>
                    <div className="flex gap-2 mt-1">
                      <code className="flex-1 px-3 py-2 rounded-lg bg-background font-mono text-lg text-center">
                        {generatedInvite.code}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedInvite.code);
                          toast.success("Code copied!");
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground">Invite Link</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={generatedInvite.link}
                        readOnly
                        className="text-sm font-mono"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedInvite.link);
                          toast.success("Link copied!");
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Share this code or link with your team members. They'll be added as a <strong>Team Member</strong> when they sign up.
              </p>
              
              <Button variant="outline" className="w-full" onClick={resetDialog}>
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
