import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Shield, Crown, UserMinus, Mail, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface AcceleratorTeamProps {
  acceleratorId: string;
  currentUserId: string;
}

const roleLabels: Record<string, { label: string; icon: any; color: string }> = {
  head: { label: "Ecosystem Head", icon: Crown, color: "text-warning" },
  admin: { label: "Admin", icon: Shield, color: "text-primary" },
  member: { label: "Member", icon: Users, color: "text-muted-foreground" },
  mentor: { label: "Mentor", icon: Users, color: "text-success" },
};

export function AcceleratorTeam({ acceleratorId, currentUserId }: AcceleratorTeamProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  useEffect(() => {
    fetchMembers();
  }, [acceleratorId]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("accelerator_members")
        .select("*")
        .eq("accelerator_id", acceleratorId)
        .order("joined_at", { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error("Error fetching team:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setIsInviting(true);
    try {
      // Generate invite token
      const inviteToken = crypto.randomUUID();

      const { error } = await supabase
        .from("accelerator_members")
        .insert({
          accelerator_id: acceleratorId,
          user_id: currentUserId, // Placeholder until they accept
          role: inviteRole,
          invite_email: inviteEmail.trim().toLowerCase(),
          invite_token: inviteToken,
          invited_at: new Date().toISOString(),
          invited_by: currentUserId,
        });

      if (error) throw error;

      toast.success(`Invitation sent to ${inviteEmail}`);
      setIsInviteOpen(false);
      setInviteEmail("");
      setInviteRole("member");
      fetchMembers();
    } catch (error: any) {
      console.error("Invite error:", error);
      toast.error(error.message || "Failed to send invitation");
    } finally {
      setIsInviting(false);
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
      fetchMembers();
    } catch (error) {
      toast.error("Failed to remove member");
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
          <h1 className="text-2xl font-bold text-foreground">Team</h1>
          <p className="text-muted-foreground">Manage your accelerator team members</p>
        </div>
        <Button onClick={() => setIsInviteOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Invite Member
        </Button>
      </div>

      {/* Team List */}
      <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden">
        {members.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No team members yet</h3>
            <p className="text-muted-foreground mb-4">
              Invite admins, mentors, and team members to help manage your ecosystem.
            </p>
            <Button onClick={() => setIsInviteOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Invite First Member
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {members.map((member, i) => {
              const roleInfo = roleLabels[member.role] || roleLabels.member;
              const isCurrentUser = member.user_id === currentUserId;
              const isPending = !member.joined_at && member.invite_email;

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      isPending ? "bg-muted" : "bg-primary/10"
                    )}>
                      {isPending ? (
                        <Mail className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <span className="text-primary font-semibold">
                          {(member.invite_email || "U").slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">
                          {member.invite_email || "Unknown"}
                        </p>
                        {isCurrentUser && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">You</span>
                        )}
                        {isPending && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning">Pending</span>
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

      {/* Invite Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="inviteEmail">Email Address</Label>
              <Input
                id="inviteEmail"
                type="email"
                placeholder="colleague@accelerator.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin - Full access</SelectItem>
                  <SelectItem value="member">Member - View access</SelectItem>
                  <SelectItem value="mentor">Mentor - Startup access</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={isInviting}>
              {isInviting ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
