import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Copy, Link, Rocket, Users, Gift, Loader2 } from "lucide-react";

interface StartupInvite {
  id: string;
  code: string;
  discount_percent: number;
  uses: number;
  max_uses: number | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface StartupInviteGeneratorProps {
  userId: string;
}

const StartupInviteGenerator = ({ userId }: StartupInviteGeneratorProps) => {
  const [inviteCodes, setInviteCodes] = useState<StartupInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dealflowCount, setDealflowCount] = useState(0);

  useEffect(() => {
    fetchInviteCodes();
    fetchDealflowStats();
  }, [userId]);

  const fetchInviteCodes = async () => {
    try {
      const { data, error } = await supabase
        .from("startup_invites")
        .select("*")
        .eq("investor_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInviteCodes((data as StartupInvite[]) || []);
    } catch (error) {
      console.error("Error fetching startup invite codes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDealflowStats = async () => {
    try {
      const { count, error } = await supabase
        .from("investor_dealflow")
        .select("*", { count: "exact", head: true })
        .eq("investor_id", userId);

      if (!error && count !== null) {
        setDealflowCount(count);
      }
    } catch (error) {
      console.error("Error fetching dealflow stats:", error);
    }
  };

  const generateCode = async () => {
    setIsGenerating(true);
    try {
      // Generate a random code: STARTUP-XXXXXX
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let code = "INV-";
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const { error } = await supabase.from("startup_invites").insert({
        code,
        investor_id: userId,
        discount_percent: 20,
        max_uses: 10,
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: "Invite code created!",
        description: "Share this code with startups to add them to your dealflow.",
      });

      fetchInviteCodes();
    } catch (error: any) {
      toast({
        title: "Failed to generate code",
        description: error.message,
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
      description: "Paste it anywhere to share.",
    });
  };

  const copyInviteLink = (code: string) => {
    const link = `${window.location.origin}/auth?startup_invite=${code}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Invite link copied!",
      description: "Share this link with startups.",
    });
  };

  const activeCode = inviteCodes.find((c) => c.is_active);
  const totalStartupsInvited = inviteCodes.reduce((acc, c) => acc + c.uses, 0);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Rocket className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Invite Startups</CardTitle>
            <CardDescription>
              Share your code to get discounted deals in your pipeline
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats row */}
        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 text-sm">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{totalStartupsInvited}</span>
            <span className="text-muted-foreground">invited</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5">
            <Gift className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{dealflowCount}</span>
            <span className="text-muted-foreground">in dealflow</span>
          </div>
        </div>

        {activeCode ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Input
                value={activeCode.code}
                readOnly
                className="font-mono text-center font-semibold tracking-wider"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyCode(activeCode.code)}
                title="Copy code"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <Button
              variant="secondary"
              className="w-full gap-2"
              onClick={() => copyInviteLink(activeCode.code)}
            >
              <Link className="w-4 h-4" />
              Copy Invite Link
            </Button>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {activeCode.discount_percent}% discount for startups
              </span>
              <span>
                {activeCode.uses}/{activeCode.max_uses || "∞"} used
              </span>
            </div>
          </div>
        ) : (
          <Button
            className="w-full gap-2"
            onClick={generateCode}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                Generate Invite Code
              </>
            )}
          </Button>
        )}

        <p className="text-xs text-muted-foreground text-center">
          When startups sign up with your code, they get a discount and are automatically added to your dealflow.
        </p>
      </CardContent>
    </Card>
  );
};

export default StartupInviteGenerator;
