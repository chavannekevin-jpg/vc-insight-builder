import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Save, Euro, Percent, Tag, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePricingSettings, useUpdatePricingSettings, MemoPricing, NetworkPricing } from "@/hooks/usePricingSettings";

interface DiscountCode {
  id: string;
  code: string;
  discount_percent: number;
  is_active: boolean;
  uses: number;
  max_uses: number | null;
  expires_at: string | null;
  created_at: string;
}

const AdminCommerce = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state for discount codes
  const [newCode, setNewCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("30");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const { data: pricingSettings, isLoading: pricingLoading } = usePricingSettings();
  const updatePricing = useUpdatePricingSettings();

  const [memoPricing, setMemoPricing] = useState<MemoPricing>({
    base_price: 100,
    currency: "EUR",
    early_access_discount: 0,
    early_access_enabled: false,
    original_price: 100,
    show_original_price: false,
  });

  const [networkPricing, setNetworkPricing] = useState<NetworkPricing>({
    base_price: 159.99,
    currency: "EUR",
  });

  const activeTab = searchParams.get("tab") || "pricing";

  useEffect(() => {
    if (pricingSettings) {
      setMemoPricing(pricingSettings.memo_pricing);
      setNetworkPricing(pricingSettings.network_pricing);
    }
  }, [pricingSettings]);

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      const { data, error } = await supabase
        .from("discount_codes" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCodes((data as any[]) || []);
    } catch (error) {
      console.error("Error fetching discount codes:", error);
    }
  };

  const handleSavePricing = async () => {
    setSaving(true);
    try {
      await updatePricing.mutateAsync({ key: "memo_pricing", value: memoPricing });
      await updatePricing.mutateAsync({ key: "network_pricing", value: networkPricing });
      toast({ title: "Settings saved", description: "Pricing settings have been updated successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save pricing settings.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const calculateFinalPrice = () => {
    if (memoPricing.early_access_enabled) {
      return memoPricing.base_price * (1 - memoPricing.early_access_discount / 100);
    }
    return memoPricing.base_price;
  };

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCode(code);
  };

  const handleCreateCode = async () => {
    if (!newCode.trim()) {
      toast({ title: "Invalid code", description: "Please enter a code", variant: "destructive" });
      return;
    }

    const discount = parseInt(discountPercent);
    if (isNaN(discount) || discount < 1 || discount > 100) {
      toast({ title: "Invalid discount", description: "Discount must be between 1 and 100", variant: "destructive" });
      return;
    }

    setIsCreating(true);

    try {
      const insertData: any = {
        code: newCode.toUpperCase().trim(),
        discount_percent: discount,
        is_active: true,
      };

      if (maxUses) {
        const maxUsesNum = parseInt(maxUses);
        if (!isNaN(maxUsesNum) && maxUsesNum > 0) {
          insertData.max_uses = maxUsesNum;
        }
      }

      if (expiresAt) {
        insertData.expires_at = new Date(expiresAt).toISOString();
      }

      const { error } = await supabase.from("discount_codes" as any).insert(insertData);

      if (error) throw error;

      toast({ title: "Code created! 🎉", description: `Discount code ${insertData.code} has been created` });

      setNewCode("");
      setDiscountPercent("30");
      setMaxUses("");
      setExpiresAt("");
      setDialogOpen(false);
      
      fetchCodes();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create discount code", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const toggleCodeStatus = async (codeId: string, currentStatus: boolean) => {
    try {
      await supabase.from("discount_codes" as any).update({ is_active: !currentStatus }).eq("id", codeId);
      toast({ title: "Status updated", description: `Code has been ${!currentStatus ? "activated" : "deactivated"}` });
      fetchCodes();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update code status", variant: "destructive" });
    }
  };

  const deleteCode = async (codeId: string) => {
    if (!confirm("Are you sure you want to delete this discount code?")) return;

    try {
      await supabase.from("discount_codes" as any).delete().eq("id", codeId);
      toast({ title: "Code deleted", description: "Discount code has been removed" });
      fetchCodes();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete discount code", variant: "destructive" });
    }
  };

  if (pricingLoading) {
    return (
      <AdminLayout title="Commerce">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Commerce">
      <Tabs value={activeTab} onValueChange={(v) => setSearchParams({ tab: v })}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="pricing">Pricing Settings</TabsTrigger>
          <TabsTrigger value="discounts">Discount Codes</TabsTrigger>
        </TabsList>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          {/* Investment Memo Pricing */}
          <ModernCard>
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                    <Euro className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Investment Analysis Pricing</h2>
                    <p className="text-sm text-muted-foreground">Configure pricing for the investment analysis product</p>
                  </div>
                </div>
                <Button onClick={handleSavePricing} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="base_price">Base Price (€)</Label>
                    <Input
                      id="base_price"
                      type="number"
                      step="0.01"
                      value={memoPricing.base_price}
                      onChange={(e) => setMemoPricing({ ...memoPricing, base_price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="original_price">Original/Strikethrough Price (€)</Label>
                    <Input
                      id="original_price"
                      type="number"
                      step="0.01"
                      value={memoPricing.original_price}
                      onChange={(e) => setMemoPricing({ ...memoPricing, original_price: parseFloat(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Displayed as crossed-out price for comparison</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show_original">Show Original Price</Label>
                      <p className="text-xs text-muted-foreground">Display strikethrough price on pricing pages</p>
                    </div>
                    <Switch
                      id="show_original"
                      checked={memoPricing.show_original_price}
                      onCheckedChange={(checked) => setMemoPricing({ ...memoPricing, show_original_price: checked })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="early_access">Early Access Discount</Label>
                      <p className="text-xs text-muted-foreground">Enable special early access pricing</p>
                    </div>
                    <Switch
                      id="early_access"
                      checked={memoPricing.early_access_enabled}
                      onCheckedChange={(checked) => setMemoPricing({ ...memoPricing, early_access_enabled: checked })}
                    />
                  </div>

                  {memoPricing.early_access_enabled && (
                    <div>
                      <Label htmlFor="discount_percent">Discount Percentage (%)</Label>
                      <div className="relative">
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="discount_percent"
                          type="number"
                          min="0"
                          max="100"
                          value={memoPricing.early_access_discount}
                          onChange={(e) => setMemoPricing({ ...memoPricing, early_access_discount: parseInt(e.target.value) || 0 })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Live Preview
                </h3>
                <div className="flex items-baseline gap-3">
                  {memoPricing.show_original_price && (
                    <span className="text-lg line-through text-muted-foreground">€{memoPricing.original_price.toFixed(2)}</span>
                  )}
                  {memoPricing.early_access_enabled && (
                    <span className="text-lg line-through text-muted-foreground">€{memoPricing.base_price.toFixed(2)}</span>
                  )}
                  <span className="text-3xl font-bold text-primary">€{calculateFinalPrice().toFixed(2)}</span>
                  {memoPricing.early_access_enabled && (
                    <span className="text-sm text-success font-medium">({memoPricing.early_access_discount}% off)</span>
                  )}
                </div>
              </div>
            </div>
          </ModernCard>

          {/* Network Access Pricing */}
          <ModernCard>
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center">
                  <Euro className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Network Access Pricing</h2>
                  <p className="text-sm text-muted-foreground">Configure pricing for network/VIP access</p>
                </div>
              </div>

              <div className="max-w-md">
                <Label htmlFor="network_price">Price (€)</Label>
                <Input
                  id="network_price"
                  type="number"
                  step="0.01"
                  value={networkPricing.base_price}
                  onChange={(e) => setNetworkPricing({ ...networkPricing, base_price: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Live Preview
                </h3>
                <span className="text-3xl font-bold text-primary">€{networkPricing.base_price.toFixed(2)}</span>
              </div>
            </div>
          </ModernCard>
        </TabsContent>

        {/* Discounts Tab */}
        <TabsContent value="discounts">
          <ModernCard>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Manage Discount Codes</h2>
                <p className="text-sm text-muted-foreground">Create and manage discount codes for purchases</p>
              </div>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Code
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Discount Code</DialogTitle>
                    <DialogDescription>Generate a new discount code for purchases</DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Code</Label>
                      <div className="flex gap-2">
                        <Input
                          id="code"
                          placeholder="DISCOUNT30"
                          value={newCode}
                          onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                        />
                        <Button onClick={generateRandomCode} variant="outline">Generate</Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discount">Discount Percentage</Label>
                      <Input
                        id="discount"
                        type="number"
                        min="1"
                        max="100"
                        placeholder="30"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxUses">Max Uses (Optional)</Label>
                      <Input
                        id="maxUses"
                        type="number"
                        min="1"
                        placeholder="Unlimited"
                        value={maxUses}
                        onChange={(e) => setMaxUses(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expires">Expiration Date (Optional)</Label>
                      <Input
                        id="expires"
                        type="datetime-local"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button onClick={handleCreateCode} disabled={isCreating} className="w-full gradient-primary">
                    {isCreating ? "Creating..." : "Create Discount Code"}
                  </Button>
                </DialogContent>
              </Dialog>
            </div>

            {codes.length === 0 ? (
              <div className="text-center py-12">
                <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No discount codes yet</p>
                <p className="text-sm text-muted-foreground mt-2">Create your first discount code to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Uses</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {codes.map((code) => (
                      <TableRow key={code.id}>
                        <TableCell className="font-mono font-bold">{code.code}</TableCell>
                        <TableCell>
                          <Badge variant={code.discount_percent === 100 ? "default" : "secondary"}>
                            {code.discount_percent}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {code.uses}
                          {code.max_uses && ` / ${code.max_uses}`}
                        </TableCell>
                        <TableCell>
                          {code.expires_at ? new Date(code.expires_at).toLocaleDateString() : "Never"}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={code.is_active}
                            onCheckedChange={() => toggleCodeStatus(code.id, code.is_active)}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => deleteCode(code.id)}
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </ModernCard>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminCommerce;
