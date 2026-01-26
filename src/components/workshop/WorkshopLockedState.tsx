import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, GraduationCap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function WorkshopLockedState() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="max-w-md w-full border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Workshop</h2>
          </div>
          
          <p className="text-muted-foreground mb-6">
            This feature is available for startups participating in an accelerator program.
          </p>
          
          <p className="text-sm text-muted-foreground mb-6">
            If you've been invited to a program, please use your invitation link to gain access.
          </p>
          
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/company-profile")}
            >
              Go to My Profile
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
