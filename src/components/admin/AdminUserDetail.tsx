import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  FileText, 
  DollarSign, 
  Calendar,
  Tag,
  Clock,
  LogIn,
  Activity
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Company {
  id: string;
  name: string;
  stage: string;
  created_at: string;
  has_memo: boolean;
  responses_count: number;
}

interface Purchase {
  id: string;
  amount_paid: number;
  created_at: string;
  discount_code_used: string | null;
  company_name: string;
}

interface UserDetailProps {
  userId: string;
}

export const AdminUserDetail = ({ userId }: UserDetailProps) => {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [userCreatedAt, setUserCreatedAt] = useState<string | null>(null);
  const [lastSignInAt, setLastSignInAt] = useState<string | null>(null);
  const [signInCount, setSignInCount] = useState(0);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      // Fetch user profile with sign-in data
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, created_at, last_sign_in_at, sign_in_count")
        .eq("id", userId)
        .single();

      if (profile) {
        setUserEmail(profile.email);
        setUserCreatedAt(profile.created_at);
        setLastSignInAt(profile.last_sign_in_at);
        setSignInCount(profile.sign_in_count || 0);
      }

      // Fetch user's companies with memo status
      const { data: companiesData } = await supabase
        .from("companies")
        .select(`
          id,
          name,
          stage,
          created_at,
          memos(id, status)
        `)
        .eq("founder_id", userId)
        .order("created_at", { ascending: false });

      // Get response counts for each company
      const companiesWithDetails = await Promise.all(
        (companiesData || []).map(async (company: any) => {
          const { count } = await supabase
            .from("memo_responses")
            .select("id", { count: "exact", head: true })
            .eq("company_id", company.id)
            .not("answer", "is", null);

          const hasMemo = (company.memos || []).some((m: any) => m.status === "generated");

          return {
            id: company.id,
            name: company.name,
            stage: company.stage,
            created_at: company.created_at,
            has_memo: hasMemo,
            responses_count: count || 0,
          };
        })
      );

      setCompanies(companiesWithDetails);

      // Fetch purchases with company names
      const { data: purchasesData } = await supabase
        .from("memo_purchases")
        .select(`
          id,
          amount_paid,
          created_at,
          discount_code_used,
          companies(name)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      const purchasesWithNames = (purchasesData || []).map((p: any) => ({
        id: p.id,
        amount_paid: p.amount_paid,
        created_at: p.created_at,
        discount_code_used: p.discount_code_used,
        company_name: p.companies?.name || "Unknown",
      }));

      setPurchases(purchasesWithNames);
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3"></div>
        <div className="h-20 bg-muted rounded"></div>
        <div className="h-20 bg-muted rounded"></div>
      </div>
    );
  }

  const totalSpent = purchases.reduce((sum, p) => sum + Number(p.amount_paid), 0);

  return (
    <div className="space-y-6">
      {/* User Info Header */}
      <div className="p-4 rounded-lg bg-muted/30 border border-border">
        <p className="text-lg font-semibold text-foreground">{userEmail}</p>
        <div className="flex flex-wrap items-center gap-4 mt-2">
          {userCreatedAt && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>Joined {format(new Date(userCreatedAt), "MMMM d, yyyy")}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <LogIn className="w-3.5 h-3.5" />
            <span>{signInCount} sign-ins</span>
          </div>
          {lastSignInAt && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Activity className="w-3.5 h-3.5" />
              <span>Last seen {formatDistanceToNow(new Date(lastSignInAt), { addSuffix: true })}</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-center">
          <Building2 className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{companies.length}</p>
          <p className="text-xs text-muted-foreground">Companies</p>
        </div>
        <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10 text-center">
          <FileText className="w-5 h-5 text-green-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{purchases.length}</p>
          <p className="text-xs text-muted-foreground">Purchases</p>
        </div>
        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 text-center">
          <DollarSign className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">${totalSpent.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Total Spent</p>
        </div>
      </div>

      {/* Companies Section */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Companies ({companies.length})
        </h4>
        {companies.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No companies created</p>
        ) : (
          <div className="space-y-2">
            {companies.map((company) => (
              <div 
                key={company.id} 
                className="p-3 rounded-lg border border-border bg-card/50 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-foreground">{company.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{company.stage}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {company.responses_count} answers
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {company.has_memo ? (
                    <Badge variant="default" className="bg-green-500">Memo Generated</Badge>
                  ) : (
                    <Badge variant="secondary">No Memo</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Purchases Section */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Purchase History ({purchases.length})
        </h4>
        {purchases.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No purchases yet</p>
        ) : (
          <div className="space-y-2">
            {purchases.map((purchase) => (
              <div 
                key={purchase.id} 
                className="p-3 rounded-lg border border-border bg-card/50 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-foreground">{purchase.company_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(purchase.created_at), "MMM d, yyyy")}
                    </span>
                    {purchase.discount_code_used && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {purchase.discount_code_used}
                      </Badge>
                    )}
                  </div>
                </div>
                <span className="text-lg font-bold text-green-600">
                  ${Number(purchase.amount_paid).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
