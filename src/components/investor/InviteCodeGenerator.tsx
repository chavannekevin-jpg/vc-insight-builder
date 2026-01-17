import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Copy, Gift, Users, RefreshCw, Link as LinkIcon } from "lucide-react";

interface InviteCode {
  id: string;
  code: string;
  uses: number;
  max_uses: number | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface InviteCodeGeneratorProps {
  userId: string;
}

const InviteCodeGenerator = ({ userId }: InviteCodeGeneratorProps) => {
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchInviteCodes();
  }, [userId]);

  const fetchInviteCodes = async () => {
    try {
      const { data, error } = await (supabase
        .from("investor_invites") as any)
        .select("*")
        .eq("inviter_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInviteCodes(data || []);
    } catch (err) {
      console.error("Error fetching invite codes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCode = async () => {
    setIsGenerating(true);
    try {
      // Generate a random code
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let code = "";
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const { data, error } = await (supabase
        .from("investor_invites") as any)
        .insert({
          code,
          inviter_id: userId,
          max_uses: 5,
        })
        .select()
        .single();

      if (error) throw error;

      setInviteCodes([data, ...inviteCodes]);
      toast({
        title: "Invite code generated!",
        description: `Share "${code}" with fellow investors.`,
      });
    } catch (err: any) {
      toast({
        title: "Failed to generate code",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code copied!",
      description: "Share it with fellow investors.",
    });
  };

  const copyInviteLink = (code: string) => {
    const link = `${window.location.origin}/investor/auth?code=${code}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Invite link copied!",
      description: "Share this link to invite fellow investors.",
    });
  };

  const activeCode = inviteCodes.find(
    (c) => c.is_active && (!c.max_uses || c.uses < c.max_uses)
  );

  const totalInvitesUsed = inviteCodes.reduce((sum, c) => sum + c.uses, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Invite Investors
        </CardTitle>
        <CardDescription>
          Share your invite code with fellow investors to grow the network
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              <strong>{totalInvitesUsed}</strong> investors invited
            </span>
          </div>
        </div>

        {/* Active Code */}
        {activeCode ? (
          <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your invite code</span>
              <span className="text-xs text-muted-foreground">
                {activeCode.uses}/{activeCode.max_uses || "∞"} uses
              </span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-2xl font-mono font-bold tracking-wider text-center py-2 bg-background rounded">
                {activeCode.code}
              </code>
              <Button
                size="icon"
                variant="outline"
                onClick={() => copyCode(activeCode.code)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => copyInviteLink(activeCode.code)}
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Copy Invite Link
            </Button>
          </div>
        ) : (
          <div className="p-4 border border-dashed border-muted-foreground/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Generate an invite code to start inviting investors
            </p>
            <Button onClick={generateCode} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  Generate Invite Code
                </>
              )}
            </Button>
          </div>
        )}

        {/* Generate New */}
        {activeCode && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={generateCode}
            disabled={isGenerating}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
            Generate New Code
          </Button>
        )}

        {/* Previous Codes */}
        {inviteCodes.length > 1 && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Previous codes</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {inviteCodes.slice(1).map((code) => (
                <div
                  key={code.id}
                  className="flex items-center justify-between py-1 text-sm"
                >
                  <code className="font-mono text-muted-foreground">
                    {code.code}
                  </code>
                  <span className="text-xs text-muted-foreground">
                    {code.uses} uses
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InviteCodeGenerator;
