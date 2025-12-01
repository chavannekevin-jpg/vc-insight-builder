import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, DollarSign, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WaitlistSignup {
  id: string;
  user_id: string;
  company_id: string;
  pricing_tier: string;
  discount_amount: number;
  has_paid: boolean;
  signed_up_at: string;
  profiles?: {
    email: string;
  };
  companies?: {
    name: string;
  };
}

export default function AdminWaitlist() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [waitlistActive, setWaitlistActive] = useState(true);
  const [signups, setSignups] = useState<WaitlistSignup[]>([]);
  const [updatingSignupId, setUpdatingSignupId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    revenue: 0,
  });

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have admin permissions",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      await Promise.all([
        fetchWaitlistSettings(),
        fetchSignups(),
      ]);
    } catch (error) {
      console.error("Error:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchWaitlistSettings = async () => {
    const { data, error } = await supabase
      .from("waitlist_settings")
      .select("is_active")
      .maybeSingle();
    
    if (error) {
      console.error("Error loading waitlist settings:", error);
    }
    
    if (data) {
      setWaitlistActive(data.is_active);
    }
  };

  const fetchSignups = async () => {
    const { data, error } = await supabase
      .from("waitlist_signups")
      .select(`
        *,
        profiles!waitlist_signups_user_id_fkey (email),
        companies!waitlist_signups_company_id_fkey (name)
      `)
      .order("signed_up_at", { ascending: false });

    if (error) {
      console.error("Error fetching signups:", error);
      return;
    }

    setSignups(data || []);

    // Calculate stats
    const total = data?.length || 0;
    const paid = data?.filter(s => s.has_paid).length || 0;
    const revenue = data?.reduce((sum, s) => sum + (s.has_paid ? s.discount_amount : 0), 0) || 0;
    
    setStats({ total, paid, revenue });
  };

  const toggleWaitlistMode = async () => {
    try {
      const { error } = await supabase
        .from("waitlist_settings")
        .update({ is_active: !waitlistActive })
        .eq("id", (await supabase.from("waitlist_settings").select("id").single()).data?.id);

      if (error) throw error;

      setWaitlistActive(!waitlistActive);
      
      toast({
        title: "Success",
        description: `Waitlist mode ${!waitlistActive ? "activated" : "deactivated"}`,
      });
    } catch (error) {
      console.error("Error toggling waitlist:", error);
      toast({
        title: "Error",
        description: "Failed to update waitlist mode",
        variant: "destructive",
      });
    }
  };

  const togglePremiumAccess = async (signupId: string, currentStatus: boolean) => {
    setUpdatingSignupId(signupId);
    
    try {
      const newStatus = !currentStatus;
      
      const { error } = await supabase
        .from("waitlist_signups")
        .update({ 
          has_paid: newStatus,
          paid_at: newStatus ? new Date().toISOString() : null 
        })
        .eq("id", signupId);

      if (error) {
        console.error("Update error:", error);
        throw error;
      }

      // Update local state immediately for better UX
      setSignups(prevSignups => 
        prevSignups.map(signup => 
          signup.id === signupId 
            ? { ...signup, has_paid: newStatus, paid_at: newStatus ? new Date().toISOString() : null }
            : signup
        )
      );

      // Recalculate stats
      const updatedSignups = signups.map(signup => 
        signup.id === signupId 
          ? { ...signup, has_paid: newStatus }
          : signup
      );
      const paid = updatedSignups.filter(s => s.has_paid).length;
      const revenue = updatedSignups.reduce((sum, s) => sum + (s.has_paid ? s.discount_amount : 0), 0);
      setStats(prev => ({ ...prev, paid, revenue }));
      
      toast({
        title: "Success",
        description: `Premium access ${newStatus ? "granted" : "revoked"}`,
      });
    } catch (error: any) {
      console.error("Error toggling premium access:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update premium access",
        variant: "destructive",
      });
    } finally {
      setUpdatingSignupId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin
        </Button>

        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Waitlist Management</h1>
            <p className="text-muted-foreground">
              Control memo generator access and track early adopters
            </p>
          </div>

          {/* Waitlist Toggle Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Waitlist Mode Control
              </CardTitle>
              <CardDescription>
                When active, users must join waitlist and pre-pay before accessing memo generator
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium mb-1">Waitlist Mode</p>
                  <p className="text-sm text-muted-foreground">
                    {waitlistActive 
                      ? "Memo generator requires waitlist signup" 
                      : "Memo generator is publicly available"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={waitlistActive ? "default" : "secondary"}>
                    {waitlistActive ? "Active" : "Inactive"}
                  </Badge>
                  <Switch
                    checked={waitlistActive}
                    onCheckedChange={toggleWaitlistMode}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Signups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Paid Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.paid}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">€{stats.revenue.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Signups Table */}
          <Card>
            <CardHeader>
              <CardTitle>Waitlist Signups & Premium Access</CardTitle>
              <CardDescription>
                Manage user access - grant premium to any user regardless of payment status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Premium Access</TableHead>
                    <TableHead>Signed Up</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signups.map((signup) => (
                    <TableRow key={signup.id}>
                      <TableCell className="font-medium">
                        {signup.profiles?.email || "N/A"}
                      </TableCell>
                      <TableCell>{signup.companies?.name || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{signup.pricing_tier}</Badge>
                      </TableCell>
                      <TableCell>€{signup.discount_amount}</TableCell>
                      <TableCell>
                        <Badge variant={signup.has_paid ? "default" : "outline"}>
                          {signup.has_paid ? "Paid" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={signup.has_paid}
                          onCheckedChange={() => togglePremiumAccess(signup.id, signup.has_paid)}
                          disabled={updatingSignupId === signup.id}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(signup.signed_up_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
