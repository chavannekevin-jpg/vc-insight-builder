import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  Copy, 
  CheckCircle2, 
  Link as LinkIcon, 
  Loader2, 
  Share2,
  Eye,
  Trash2,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";

interface ShareLink {
  id: string;
  token: string;
  created_at: string;
  expires_at: string | null;
  views: number;
  is_active: boolean;
}

interface AdminMemoShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyName: string;
}

export function AdminMemoShareDialog({
  open,
  onOpenChange,
  companyId,
  companyName,
}: AdminMemoShareDialogProps) {
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [setExpiration, setSetExpiration] = useState(false);
  const [expirationDays, setExpirationDays] = useState(7);

  useEffect(() => {
    if (open) {
      fetchShareLinks();
    }
  }, [open, companyId]);

  const fetchShareLinks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("memo_share_links")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setShareLinks(data || []);
    } catch (error) {
      console.error("Error fetching share links:", error);
      toast({
        title: "Error",
        description: "Failed to load share links",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateToken = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let token = "";
    for (let i = 0; i < 24; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  };

  const createShareLink = async () => {
    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const token = generateToken();
      const expiresAt = setExpiration 
        ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { error } = await supabase
        .from("memo_share_links")
        .insert({
          company_id: companyId,
          token,
          created_by: user.id,
          expires_at: expiresAt,
        });

      if (error) throw error;

      toast({
        title: "Share link created",
        description: "You can now copy and share this link with partners",
      });

      fetchShareLinks();
    } catch (error) {
      console.error("Error creating share link:", error);
      toast({
        title: "Error",
        description: "Failed to create share link",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const toggleLinkActive = async (linkId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("memo_share_links")
        .update({ is_active: !isActive })
        .eq("id", linkId);

      if (error) throw error;

      setShareLinks(prev => 
        prev.map(link => 
          link.id === linkId ? { ...link, is_active: !isActive } : link
        )
      );

      toast({
        title: isActive ? "Link deactivated" : "Link reactivated",
        description: isActive 
          ? "This link will no longer work" 
          : "This link is now active again",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update link status",
        variant: "destructive",
      });
    }
  };

  const deleteShareLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from("memo_share_links")
        .delete()
        .eq("id", linkId);

      if (error) throw error;

      setShareLinks(prev => prev.filter(link => link.id !== linkId));

      toast({
        title: "Link deleted",
        description: "The share link has been permanently removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete link",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (token: string) => {
    const url = `${window.location.origin}/shared/memo/${token}`;
    await navigator.clipboard.writeText(url);
    setCopied(token);
    toast({
      title: "Link copied!",
      description: "Share link copied to clipboard",
    });
    setTimeout(() => setCopied(null), 2000);
  };

  const getShareUrl = (token: string) => `${window.location.origin}/shared/memo/${token}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share Analysis
          </DialogTitle>
          <DialogDescription>
            Create shareable links for <strong>{companyName}</strong>'s investment analysis.
            Partners can view the full memo without needing an account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Create New Link */}
          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            <h4 className="font-medium text-sm mb-3">Create New Share Link</h4>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="expiration"
                  checked={setExpiration}
                  onCheckedChange={setSetExpiration}
                />
                <Label htmlFor="expiration" className="text-sm">Set expiration</Label>
              </div>
              
              {setExpiration && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={expirationDays}
                    onChange={(e) => setExpirationDays(parseInt(e.target.value) || 7)}
                    className="w-16 h-8 text-center"
                  />
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
              )}
            </div>

            <Button
              onClick={createShareLink}
              disabled={creating}
              className="w-full"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <LinkIcon className="w-4 h-4 mr-2" />
              )}
              Generate Share Link
            </Button>
          </div>

          {/* Existing Links */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm">Active Links</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={fetchShareLinks}
                disabled={loading}
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : shareLinks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No share links yet. Create one above.
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {shareLinks.map((link) => (
                  <div
                    key={link.id}
                    className={`p-3 rounded-lg border ${
                      link.is_active 
                        ? 'bg-card border-border' 
                        : 'bg-muted/20 border-border/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={link.is_active ? "default" : "secondary"}>
                          {link.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {link.views} view{link.views !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(link.created_at), "MMM d, yyyy")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <code className="flex-1 text-xs bg-muted/50 px-2 py-1 rounded truncate">
                        {getShareUrl(link.token)}
                      </code>
                    </div>

                    {link.expires_at && (
                      <p className="text-xs text-muted-foreground mb-2">
                        Expires: {format(new Date(link.expires_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    )}

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(link.token)}
                        className="flex-1"
                      >
                        {copied === link.token ? (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        ) : (
                          <Copy className="w-3 h-3 mr-1" />
                        )}
                        {copied === link.token ? "Copied!" : "Copy"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(getShareUrl(link.token), "_blank")}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLinkActive(link.id, link.is_active)}
                      >
                        {link.is_active ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteShareLink(link.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
