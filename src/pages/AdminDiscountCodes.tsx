import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ArrowLeft, Plus, Trash2, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

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

const AdminDiscountCodes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [newCode, setNewCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("30");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

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
      fetchCodes();
    } catch (error) {
      console.error("Auth error:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

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
      toast({
        title: "Error",
        description: "Failed to load discount codes",
        variant: "destructive",
      });
    }
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
      toast({
        title: "Invalid code",
        description: "Please enter a code",
        variant: "destructive",
      });
      return;
    }

    const discount = parseInt(discountPercent);
    if (isNaN(discount) || discount < 1 || discount > 100) {
      toast({
        title: "Invalid discount",
        description: "Discount must be between 1 and 100",
        variant: "destructive",
      });
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

      const { error } = await supabase
        .from("discount_codes" as any)
        .insert(insertData);

      if (error) throw error;

      toast({
        title: "Code created! 🎉",
        description: `Discount code ${insertData.code} has been created`,
      });

      // Reset form
      setNewCode("");
      setDiscountPercent("30");
      setMaxUses("");
      setExpiresAt("");
      setDialogOpen(false);
      
      fetchCodes();
    } catch (error: any) {
      console.error("Error creating discount code:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create discount code",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const toggleCodeStatus = async (codeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("discount_codes" as any)
        .update({ is_active: !currentStatus })
        .eq("id", codeId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Code has been ${!currentStatus ? "activated" : "deactivated"}`,
      });

      fetchCodes();
    } catch (error) {
      console.error("Error updating code status:", error);
      toast({
        title: "Error",
        description: "Failed to update code status",
        variant: "destructive",
      });
    }
  };

  const deleteCode = async (codeId: string) => {
    if (!confirm("Are you sure you want to delete this discount code?")) return;

    try {
      const { error } = await supabase
        .from("discount_codes" as any)
        .delete()
        .eq("id", codeId);

      if (error) throw error;

      toast({
        title: "Code deleted",
        description: "Discount code has been removed",
      });

      fetchCodes();
    } catch (error) {
      console.error("Error deleting code:", error);
      toast({
        title: "Error",
        description: "Failed to delete discount code",
        variant: "destructive",
      });
    }
  };

  if (loading) {
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
            <h1 className="text-2xl font-bold text-primary">Discount Codes</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <ModernCard className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Manage Discount Codes
              </h2>
              <p className="text-muted-foreground">
                Create and manage discount codes for memo purchases
              </p>
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
                  <DialogDescription>
                    Generate a new discount code for memo purchases
                  </DialogDescription>
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
                      <Button onClick={generateRandomCode} variant="outline">
                        Generate
                      </Button>
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

                <Button
                  onClick={handleCreateCode}
                  disabled={isCreating}
                  className="w-full gradient-primary"
                >
                  {isCreating ? "Creating..." : "Create Discount Code"}
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </ModernCard>

        <ModernCard>
          {codes.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No discount codes yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Create your first discount code to get started
              </p>
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
                      <TableCell className="font-mono font-bold">
                        {code.code}
                      </TableCell>
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
                        {code.expires_at 
                          ? new Date(code.expires_at).toLocaleDateString()
                          : "Never"
                        }
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
      </main>
    </div>
  );
};

export default AdminDiscountCodes;
