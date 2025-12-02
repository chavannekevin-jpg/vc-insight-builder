import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Euro, Percent, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePricingSettings, useUpdatePricingSettings, MemoPricing, NetworkPricing } from "@/hooks/usePricingSettings";

const AdminPricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { data: pricingSettings, isLoading: pricingLoading } = usePricingSettings();
  const updatePricing = useUpdatePricingSettings();

  const [memoPricing, setMemoPricing] = useState<MemoPricing>({
    base_price: 59.99,
    currency: "EUR",
    early_access_discount: 50,
    early_access_enabled: true,
    original_price: 119.99,
    show_original_price: true,
  });

  const [networkPricing, setNetworkPricing] = useState<NetworkPricing>({
    base_price: 159.99,
    currency: "EUR",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (pricingSettings) {
      setMemoPricing(pricingSettings.memo_pricing);
      setNetworkPricing(pricingSettings.network_pricing);
    }
  }, [pricingSettings]);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/");
        return;
      }

      setUser(user);

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleError || !roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have admin permissions",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Auth error:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePricing.mutateAsync({ key: "memo_pricing", value: memoPricing });
      await updatePricing.mutateAsync({ key: "network_pricing", value: networkPricing });

      toast({
        title: "Settings saved",
        description: "Pricing settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save pricing settings.",
        variant: "destructive",
      });
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

  if (loading || pricingLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/admin")} variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-primary">Pricing Settings</h1>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Investment Memo Pricing */}
        <ModernCard>
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Euro className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Investment Memo Pricing</h2>
                <p className="text-sm text-muted-foreground">Configure pricing for the investment memo product</p>
              </div>
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

            {/* Preview */}
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Live Preview
              </h3>
              <span className="text-3xl font-bold text-primary">€{networkPricing.base_price.toFixed(2)}</span>
            </div>
          </div>
        </ModernCard>

        {/* Info */}
        <ModernCard className="bg-muted/30">
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Note:</strong> Changes to pricing will be reflected immediately across:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Pricing page (/pricing)</li>
              <li>Homepage pricing section</li>
              <li>Checkout page</li>
              <li>Stripe checkout sessions (new sessions only)</li>
            </ul>
            <p className="mt-4 text-xs">Make sure your Stripe product prices match these settings for accurate billing.</p>
          </div>
        </ModernCard>
      </main>
    </div>
  );
};

export default AdminPricing;
