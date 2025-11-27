import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function GenerateMemo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"checking" | "generating" | "complete" | "error">("checking");
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Initializing...");

  useEffect(() => {
    startMemoGeneration();
  }, []);

  const startMemoGeneration = async () => {
    try {
      const companyId = searchParams.get("companyId");
      if (!companyId) {
        toast.error("No company ID provided");
        navigate("/hub");
        return;
      }

      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/hub");
        return;
      }

      setStatusMessage("Verifying permissions...");
      setProgress(10);

      // Check if user is admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      const isAdmin = !!roleData;

      // Verify company ownership
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .maybeSingle();

      if (companyError || !company) {
        toast.error("Company not found");
        navigate("/hub");
        return;
      }

      if (!isAdmin && company.founder_id !== session.user.id) {
        toast.error("You don't have permission to access this company");
        navigate("/hub");
        return;
      }

      setStatusMessage("Checking payment status...");
      setProgress(20);

      // Check payment status (skip for admins)
      if (!isAdmin) {
        const { data: waitlistSignup } = await supabase
          .from("waitlist_signups")
          .select("has_paid")
          .eq("user_id", session.user.id)
          .eq("company_id", companyId)
          .maybeSingle();

        if (!waitlistSignup?.has_paid) {
          toast.error("Payment required to generate memo");
          navigate(`/waitlist-checkout?companyId=${companyId}`);
          return;
        }
      }

      setStatusMessage("Verifying questionnaire completion...");
      setProgress(30);

      // Verify all required sections are complete
      const { data: responses } = await supabase
        .from("memo_responses")
        .select("question_key, answer")
        .eq("company_id", companyId);

      const requiredSections = [
        "problem_description",
        "solution_description",
        "market_target_customer",
        "competition_mission",
        "team_founders",
        "usp_differentiators",
        "business_model_type",
        "traction_revenue"
      ];

      const completedSections = requiredSections.filter(section =>
        responses?.some(r => r.question_key === section && r.answer?.trim())
      );

      if (completedSections.length < requiredSections.length) {
        toast.error(`Please complete all sections (${completedSections.length}/${requiredSections.length} done)`);
        navigate("/company/profile/edit");
        return;
      }

      setStatus("generating");
      setStatusMessage("Analyzing your startup data...");
      setProgress(40);

      // Check if memo already exists
      const { data: existingMemo } = await supabase
        .from("memos")
        .select("id")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingMemo) {
        setStatusMessage("Loading existing memo...");
        setProgress(100);
        setStatus("complete");
        setTimeout(() => {
          navigate(`/memo?id=${existingMemo.id}`);
        }, 1000);
        return;
      }

      // Generate new memo
      setStatusMessage("Generating investment memorandum...");
      setProgress(50);

      const { data: memoData, error: memoError } = await supabase.functions.invoke(
        "generate-full-memo",
        {
          body: { companyId }
        }
      );

      if (memoError) throw memoError;

      setStatusMessage("Finalizing your memo...");
      setProgress(90);

      if (memoData?.memoId) {
        setProgress(100);
        setStatus("complete");
        setStatusMessage("Memo generated successfully!");
        
        toast.success("Your investment memo is ready!");
        
        setTimeout(() => {
          navigate(`/memo?id=${memoData.memoId}`);
        }, 1500);
      } else {
        throw new Error("Failed to generate memo");
      }

    } catch (error: any) {
      console.error("Error generating memo:", error);
      setStatus("error");
      setStatusMessage("Failed to generate memo");
      toast.error(error.message || "An error occurred while generating your memo");
      
      setTimeout(() => {
        navigate("/hub");
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Icon */}
        <div className="flex justify-center">
          {status === "complete" ? (
            <CheckCircle2 className="w-20 h-20 text-green-500 animate-bounce" />
          ) : status === "error" ? (
            <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center">
              <span className="text-4xl">⚠️</span>
            </div>
          ) : (
            <div className="relative">
              <Sparkles className="w-20 h-20 text-primary animate-pulse" />
              <Loader2 className="w-20 h-20 text-primary/50 animate-spin absolute inset-0" />
            </div>
          )}
        </div>

        {/* Status Message */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            {status === "complete" 
              ? "✨ Memo Ready!" 
              : status === "error"
              ? "Something Went Wrong"
              : "Creating Your Investment Memo"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {statusMessage}
          </p>
        </div>

        {/* Progress Bar */}
        {status !== "error" && (
          <div className="space-y-2">
            <div className="w-full bg-border rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">{progress}% complete</p>
          </div>
        )}

        {/* Additional Info */}
        {status === "generating" && (
          <div className="text-sm text-muted-foreground space-y-2 pt-4">
            <p>This may take 30-60 seconds...</p>
            <p className="text-xs">Please don't close this window</p>
          </div>
        )}

        {status === "error" && (
          <p className="text-sm text-muted-foreground">
            Redirecting you back to the hub...
          </p>
        )}
      </div>
    </div>
  );
}
