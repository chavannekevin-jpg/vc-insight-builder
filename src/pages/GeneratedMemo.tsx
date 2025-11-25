import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { WaitlistModal } from "@/components/WaitlistModal";
import { useWaitlistMode, useUserWaitlistStatus } from "@/hooks/useWaitlistMode";
import { Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function GeneratedMemo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");
  
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);

  const { data: waitlistMode } = useWaitlistMode();
  const { data: userWaitlistStatus } = useUserWaitlistStatus(userId || undefined, companyId || undefined);

  useEffect(() => {
    const init = async () => {
      if (!companyId) {
        toast({
          title: "Error",
          description: "No company ID provided",
          variant: "destructive"
        });
        navigate("/hub");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      // Check waitlist mode
      if (waitlistMode?.isActive && (!userWaitlistStatus || !userWaitlistStatus.has_paid)) {
        setShowWaitlistModal(true);
      }
      
      setLoading(false);
    };
    init();
  }, [companyId, waitlistMode, userWaitlistStatus]);

  if (showWaitlistModal || (waitlistMode?.isActive && (!userWaitlistStatus || !userWaitlistStatus.has_paid))) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <WaitlistModal 
          open={true} 
          onOpenChange={(open) => {
            setShowWaitlistModal(open);
            if (!open) navigate("/portal");
          }}
          companyId={companyId || undefined}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-muted-foreground">Memo content will load here when waitlist is disabled.</p>
      </div>
    </div>
  );
}
