import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Copy, Plus, Loader2, Link, Trash2, ExternalLink, Rocket, Users, Percent } from "lucide-react";
import { format } from "date-fns";

interface AcceleratorInvite {
  id: string;
  code: string;
  accelerator_name: string;
  accelerator_slug: string;
  discount_percent: number;
  uses: number;
  max_uses: number | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export default function AdminAcceleratorInvites() {
  const [invites, setInvites] = useState<AcceleratorInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form state
  const [acceleratorName, setAcceleratorName] = useState("");
  const [acceleratorSlug, setAcceleratorSlug] = useState("");
  const [discountPercent, setDiscountPercent] = useState(100);
  const [maxUses, setMaxUses] = useState<string>("15");
  const [expiresAt, setExpiresAt] = useState("");

  useEffect(() => {
    fetchInvites();
  }, []);

  // Auto-generate slug from name
  useEffect(() => {
    const slug = acceleratorName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    setAcceleratorSlug(slug);
  }, [acceleratorName]);

  const fetchInvites = async () => {
    try {
      const { data, error } = await (supabase
        .from("accelerator_invites" as any)
        .select("*")
        .order("created_at", { ascending: false }) as any);

      if (error) throw error;
      setInvites((data as AcceleratorInvite[]) || []);
    } catch (error) {
      console.error("Error fetching accelerator invites:", error);
      toast({
        title: "Error",
        description: "Failed to load accelerator invites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCode = (slug: string): string => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let randomPart = "";
    for (let i = 0; i < 6; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${slug.toUpperCase().slice(0, 6)}-${randomPart}`;
  };

  const handleCreate = async () => {
    if (!acceleratorName.trim() || !acceleratorSlug.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter accelerator name",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const code = generateCode(acceleratorSlug);
      
      const { error } = await (supabase.from("accelerator_invites" as any).insert({
        code,
        accelerator_name: acceleratorName.trim(),
        accelerator_slug: acceleratorSlug.trim(),
        discount_percent: discountPercent,
        max_uses: maxUses ? parseInt(maxUses) : null,
        expires_at: expiresAt || null,
        is_active: true,
      }) as any);

      if (error) throw error;

      toast({
        title: "Invite created!",
        description: `Created invite link for ${acceleratorName}`,
      });

      // Reset form
      setAcceleratorName("");
      setAcceleratorSlug("");
      setDiscountPercent(100);
      setMaxUses("15");
      setExpiresAt("");
      setDialogOpen(false);
      fetchInvites();
    } catch (error: any) {
      toast({
        title: "Failed to create invite",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (invite: AcceleratorInvite) => {
    try {
      const { error } = await (supabase
        .from("accelerator_invites" as any)
        .update({ is_active: !invite.is_active })
        .eq("id", invite.id) as any);

      if (error) throw error;

      toast({
        title: invite.is_active ? "Invite deactivated" : "Invite activated",
      });
      fetchInvites();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteInvite = async (invite: AcceleratorInvite) => {
    if (!confirm(`Delete invite for ${invite.accelerator_name}? This cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await (supabase
        .from("accelerator_invites" as any)
        .delete()
        .eq("id", invite.id) as any);

      if (error) throw error;

      toast({ title: "Invite deleted" });
      fetchInvites();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyLink = (invite: AcceleratorInvite) => {
    const link = `${window.location.origin}/accelerator/invite?code=${invite.code}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "Share this link with accelerator startups",
    });
  };

  const getStatusBadge = (invite: AcceleratorInvite) => {
    if (!invite.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (invite.max_uses && invite.uses >= invite.max_uses) {
      return <Badge variant="destructive">Exhausted</Badge>;
    }
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    return <Badge variant="default" className="bg-success">Active</Badge>;
  };

  // Stats
  const activeInvites = invites.filter(i => i.is_active).length;
  const totalUses = invites.reduce((acc, i) => acc + i.uses, 0);
  const fullDiscountInvites = invites.filter(i => i.discount_percent === 100).length;

  return (
    <AdminLayout title="Accelerator Invites">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Rocket className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeInvites}</p>
                <p className="text-sm text-muted-foreground">Active Programs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Users className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUses}</p>
                <p className="text-sm text-muted-foreground">Total Signups</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Percent className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{fullDiscountInvites}</p>
                <p className="text-sm text-muted-foreground">100% Discount Links</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Accelerator Invite Links</CardTitle>
            <CardDescription>
              Create customizable discount links for accelerator programs
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Invite
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Accelerator Invite</DialogTitle>
                <DialogDescription>
                  Generate a custom discount link for an accelerator program
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Accelerator Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Horizon Ventures Batch 7"
                    value={acceleratorName}
                    onChange={(e) => setAcceleratorName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    placeholder="Auto-generated from name"
                    value={acceleratorSlug}
                    onChange={(e) => setAcceleratorSlug(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used in the invite code: {acceleratorSlug.toUpperCase().slice(0, 6) || 'XXX'}-XXXXXX
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount">Discount Percentage</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-24"
                    />
                    <span className="text-muted-foreground">%</span>
                    <div className="flex gap-1 ml-auto">
                      {[20, 50, 100].map((p) => (
                        <Button
                          key={p}
                          type="button"
                          variant={discountPercent === p ? "default" : "outline"}
                          size="sm"
                          onClick={() => setDiscountPercent(p)}
                        >
                          {p}%
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxUses">Max Uses</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="1"
                    placeholder="Leave empty for unlimited"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of startups that can use this link
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expires">Expiration Date (optional)</Label>
                  <Input
                    id="expires"
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={creating} className="gap-2">
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Invite
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : invites.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Rocket className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No accelerator invites yet</p>
              <p className="text-sm">Create your first invite link above</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Accelerator</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-center">Discount</TableHead>
                  <TableHead className="text-center">Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell className="font-medium">
                      {invite.accelerator_name}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {invite.code}
                      </code>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={invite.discount_percent === 100 ? "default" : "secondary"}>
                        {invite.discount_percent}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {invite.uses} / {invite.max_uses || "∞"}
                    </TableCell>
                    <TableCell>{getStatusBadge(invite)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(invite.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyLink(invite)}
                          title="Copy invite link"
                        >
                          <Link className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`${window.location.origin}/accelerator/invite?code=${invite.code}`, '_blank')}
                          title="Preview link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Switch
                          checked={invite.is_active}
                          onCheckedChange={() => toggleActive(invite)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteInvite(invite)}
                          className="text-destructive hover:text-destructive"
                          title="Delete invite"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
