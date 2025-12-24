import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Building2,
  Crown,
  RefreshCw,
  Plus,
  Eye,
  UserCheck,
  Loader2,
  Calendar,
  Mail,
  FileText,
  ExternalLink,
  Zap,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface CompanyDetails {
  id: string;
  name: string;
  stage: string;
  created_at: string;
  has_premium: boolean;
  generations_available: number;
  generations_used: number;
  founder_id: string;
  founder_email: string;
  has_memo: boolean;
  memo_status: string | null;
  memo_created_at: string | null;
  responses_count: number;
}

interface AdminCompanyQuickActionsProps {
  companyId: string;
  onClose: () => void;
  onDataChanged?: () => void;
}

export const AdminCompanyQuickActions = ({ 
  companyId, 
  onClose,
  onDataChanged 
}: AdminCompanyQuickActionsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [creditsToAdd, setCreditsToAdd] = useState(1);
  const [addingCredits, setAddingCredits] = useState(false);
  const [togglingPremium, setTogglingPremium] = useState(false);
  const [generatingMemo, setGeneratingMemo] = useState(false);
  const [impersonating, setImpersonating] = useState(false);

  useEffect(() => {
    fetchCompanyDetails();
  }, [companyId]);

  const fetchCompanyDetails = async () => {
    setLoading(true);
    try {
      // Fetch company with profile
      const { data: companyData, error } = await supabase
        .from("companies")
        .select(`
          id, name, stage, created_at, has_premium,
          generations_available, generations_used, founder_id,
          profiles!companies_founder_id_fkey(email)
        `)
        .eq("id", companyId)
        .single();

      if (error) throw error;

      // Fetch memo status
      const { data: memoData } = await supabase
        .from("memos")
        .select("status, created_at")
        .eq("company_id", companyId)
        .eq("status", "generated")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Fetch responses count
      const { count: responsesCount } = await supabase
        .from("memo_responses")
        .select("id", { count: "exact", head: true })
        .eq("company_id", companyId)
        .not("answer", "is", null);

      setCompany({
        id: companyData.id,
        name: companyData.name,
        stage: companyData.stage,
        created_at: companyData.created_at,
        has_premium: companyData.has_premium || false,
        generations_available: companyData.generations_available || 0,
        generations_used: companyData.generations_used || 0,
        founder_id: companyData.founder_id,
        founder_email: (companyData.profiles as any)?.email || "N/A",
        has_memo: !!memoData,
        memo_status: memoData?.status || null,
        memo_created_at: memoData?.created_at || null,
        responses_count: responsesCount || 0,
      });
    } catch (error) {
      console.error("Error fetching company:", error);
      toast({
        title: "Error",
        description: "Failed to load company details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCredits = async () => {
    if (!company || creditsToAdd < 1) return;
    
    setAddingCredits(true);
    try {
      const newCredits = company.generations_available + creditsToAdd;
      
      const { error } = await supabase
        .from("companies")
        .update({ generations_available: newCredits })
        .eq("id", company.id);
      
      if (error) throw error;
      
      setCompany(prev => prev ? { ...prev, generations_available: newCredits } : null);
      setCreditsToAdd(1);
      onDataChanged?.();
      
      toast({
        title: "Credits added",
        description: `Added ${creditsToAdd} regeneration credit${creditsToAdd > 1 ? 's' : ''} to ${company.name}`,
      });
    } catch (error) {
      toast({
        title: "Failed to add credits",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setAddingCredits(false);
    }
  };

  const handleTogglePremium = async () => {
    if (!company) return;
    
    setTogglingPremium(true);
    try {
      const newStatus = !company.has_premium;
      
      const { error } = await supabase
        .from("companies")
        .update({ has_premium: newStatus })
        .eq("id", company.id);
      
      if (error) throw error;
      
      setCompany(prev => prev ? { ...prev, has_premium: newStatus } : null);
      onDataChanged?.();
      
      toast({
        title: "Premium access updated",
        description: `Premium access ${newStatus ? "granted" : "revoked"} for ${company.name}`,
      });
    } catch (error) {
      toast({
        title: "Failed to update premium",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setTogglingPremium(false);
    }
  };

  const handleGenerateMemo = async () => {
    if (!company) return;
    
    setGeneratingMemo(true);
    try {
      toast({ title: "Starting analysis generation", description: `Generating analysis for ${company.name}...` });

      const { data, error } = await supabase.functions.invoke("admin-generate-memo", {
        body: { companyId: company.id },
      });

      if (error) throw error;

      const jobId = data?.jobId;
      if (!jobId) throw new Error("No job ID returned");

      // Poll for job completion
      const pollInterval = setInterval(async () => {
        const { data: jobData } = await supabase
          .from("memo_generation_jobs")
          .select("status, error_message")
          .eq("id", jobId)
          .single();

        if (jobData?.status === "completed") {
          clearInterval(pollInterval);
          setGeneratingMemo(false);
          toast({ title: "Analysis generated!", description: `${company.name}'s analysis is ready` });
          fetchCompanyDetails();
          onDataChanged?.();
        } else if (jobData?.status === "failed") {
          clearInterval(pollInterval);
          setGeneratingMemo(false);
          toast({ title: "Generation failed", description: jobData.error_message || "Unknown error", variant: "destructive" });
        }
      }, 3000);

      // Timeout after 5 minutes
      setTimeout(() => clearInterval(pollInterval), 300000);
    } catch (error: any) {
      setGeneratingMemo(false);
      toast({ title: "Error", description: error.message || "Failed to start generation", variant: "destructive" });
    }
  };

  const handleImpersonate = async () => {
    if (!company || company.founder_email === "N/A") return;
    
    setImpersonating(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-impersonate-user", {
        body: { userEmail: company.founder_email, redirectTo: `${window.location.origin}/portal` },
      });

      if (error) throw error;

      if (data?.magicLink) {
        window.open(data.magicLink, "_blank");
        toast({ title: "Success", description: `Opened ${company.name}'s account in a new tab` });
      } else {
        throw new Error(data?.error || "No login link returned");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to generate login link", variant: "destructive" });
    } finally {
      setImpersonating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Company not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Company Header */}
      <div className="p-4 rounded-lg bg-muted/30 border border-border">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">{company.name}</h3>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <Badge variant="outline">{company.stage}</Badge>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span>Created {format(new Date(company.created_at), "MMM d, yyyy")}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {company.has_premium && (
              <Badge className="bg-primary text-primary-foreground">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 mt-3 text-sm text-muted-foreground">
          <Mail className="w-3.5 h-3.5" />
          <span>{company.founder_email}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-card border border-border text-center">
          <FileText className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-sm font-semibold text-foreground">
            {company.has_memo ? "Generated" : "None"}
          </p>
          <p className="text-xs text-muted-foreground">Memo Status</p>
        </div>
        <div className="p-3 rounded-lg bg-card border border-border text-center">
          <RefreshCw className="w-5 h-5 text-chart-2 mx-auto mb-1" />
          <p className="text-sm font-semibold text-foreground">
            {company.generations_available} / {company.generations_used + company.generations_available}
          </p>
          <p className="text-xs text-muted-foreground">Credits (avail/total)</p>
        </div>
        <div className="p-3 rounded-lg bg-card border border-border text-center">
          <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <p className="text-sm font-semibold text-foreground">{company.responses_count}</p>
          <p className="text-xs text-muted-foreground">Answers</p>
        </div>
      </div>

      <Separator />

      {/* Premium Toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-primary" />
          <span className="font-medium">Premium Access</span>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            checked={company.has_premium}
            onCheckedChange={handleTogglePremium}
            disabled={togglingPremium}
          />
          <span className="text-sm text-muted-foreground min-w-[60px]">
            {company.has_premium ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Add Credits */}
      <div className="p-3 rounded-lg bg-card border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-chart-2" />
            <span className="font-medium">Regeneration Credits</span>
            <Badge variant="secondary">{company.generations_available} available</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={10}
              value={creditsToAdd}
              onChange={(e) => setCreditsToAdd(parseInt(e.target.value) || 1)}
              className="w-16 h-8 text-center"
            />
            <Button
              size="sm"
              onClick={handleAddCredits}
              disabled={addingCredits}
              className="h-8"
            >
              {addingCredits ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={handleGenerateMemo}
          disabled={generatingMemo}
          className="w-full"
        >
          {generatingMemo ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <FileText className="w-4 h-4 mr-2" />
          )}
          {company.has_memo ? "Regenerate Memo" : "Generate Memo"}
        </Button>

        {company.has_memo && (
          <Button
            variant="outline"
            onClick={() => {
              navigate(`/admin/memos/${company.id}`);
              onClose();
            }}
            className="w-full"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Memo
          </Button>
        )}

        <Button
          variant="outline"
          onClick={handleImpersonate}
          disabled={impersonating || company.founder_email === "N/A"}
          className="w-full"
        >
          {impersonating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <UserCheck className="w-4 h-4 mr-2" />
          )}
          Sneak In
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            navigate(`/admin/companies/${company.id}`);
            onClose();
          }}
          className="w-full"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Full Details
        </Button>
      </div>

      {/* Memo info if exists */}
      {company.memo_created_at && (
        <p className="text-xs text-muted-foreground text-center">
          Memo generated {formatDistanceToNow(new Date(company.memo_created_at), { addSuffix: true })}
        </p>
      )}
    </div>
  );
};
