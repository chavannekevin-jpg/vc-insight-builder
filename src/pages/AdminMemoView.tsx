import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { MemoLoadingScreen } from "@/components/MemoLoadingScreen";
import { MemoSection } from "@/components/memo/MemoSection";
import { MemoCollapsibleOverview } from "@/components/memo/MemoCollapsibleOverview";
import { MemoCollapsibleVC } from "@/components/memo/MemoCollapsibleVC";
import { MemoVCQuickTake } from "@/components/memo/MemoVCQuickTake";
import { MemoActionPlan } from "@/components/memo/MemoActionPlan";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MemoStructuredContent } from "@/types/memo";
import { safeTitle, sanitizeMemoContent } from "@/lib/stringUtils";
import { extractActionPlan } from "@/lib/actionPlanExtractor";

export default function AdminMemoView() {
  const navigate = useNavigate();
  const { companyId } = useParams<{ companyId: string }>();
  
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [memoContent, setMemoContent] = useState<MemoStructuredContent | null>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/");
          return;
        }

        // Check admin role
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

        if (!companyId) {
          navigate("/admin/memos");
          return;
        }

        // Fetch company info
        const { data: company, error: companyError } = await supabase
          .from("companies")
          .select("*, profiles!companies_founder_id_fkey(email)")
          .eq("id", companyId)
          .maybeSingle();

        if (companyError || !company) {
          toast({
            title: "Error",
            description: "Company not found",
            variant: "destructive",
          });
          navigate("/admin/memos");
          return;
        }

        setCompanyInfo({
          ...company,
          founder_email: (company.profiles as any)?.email || "N/A"
        });

        // Fetch memo
        const { data: memo, error: memoError } = await supabase
          .from("memos")
          .select("structured_content")
          .eq("company_id", companyId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (memoError || !memo?.structured_content) {
          toast({
            title: "No Memo Found",
            description: "This company doesn't have a generated memo yet",
            variant: "destructive",
          });
          navigate("/admin/memos");
          return;
        }

        setMemoContent(sanitizeMemoContent(memo.structured_content));
      } catch (error) {
        console.error("Error loading memo:", error);
        toast({
          title: "Error",
          description: "Failed to load memo",
          variant: "destructive",
        });
        navigate("/admin/memos");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoad();
  }, [companyId, navigate]);

  if (loading) {
    return <MemoLoadingScreen />;
  }

  if (!isAdmin || !memoContent || !companyInfo) {
    return null;
  }

  const vcQuickTake = memoContent.vcQuickTake;
  const actionPlan = vcQuickTake ? extractActionPlan(memoContent, vcQuickTake) : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Admin Indicator Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/30">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">
              Admin View: {companyInfo.name} ({companyInfo.founder_email})
            </span>
            <span className="text-xs text-amber-500/70">• Read-only • User not notified</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/admin/memos")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to User Memos
            </Button>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Eye className="w-4 h-4" />
              Viewing: {companyInfo.name}
            </div>
          </div>
        </div>
      </div>

      {/* Memo Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* VC Quick Take */}
        {vcQuickTake && (
          <div className="mb-8">
            <MemoVCQuickTake 
              quickTake={vcQuickTake} 
              showTeaser={false}
            />
          </div>
        )}

        {/* Action Plan */}
        {actionPlan && actionPlan.items.length > 0 && (
          <div className="mt-8">
            <MemoActionPlan actionPlan={actionPlan} companyName={companyInfo.name} />
          </div>
        )}

        {/* Memo Sections */}
        <div className="space-y-8 mt-12">
          {memoContent.sections.map((section, index) => (
            <MemoSection
              key={index}
              title={safeTitle(section.title)}
              index={index}
            >
              <MemoCollapsibleOverview
                paragraphs={section.narrative?.paragraphs || section.paragraphs}
                highlights={section.narrative?.highlights || section.highlights}
                keyPoints={section.narrative?.keyPoints || section.keyPoints}
                defaultOpen={true}
              />
              
              {section.vcReflection && (
                <MemoCollapsibleVC 
                  vcReflection={section.vcReflection}
                  defaultOpen={false}
                />
              )}
            </MemoSection>
          ))}
        </div>
      </div>
    </div>
  );
}
