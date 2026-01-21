import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Trophy, 
  Eye, 
  EyeOff, 
  Users, 
  Lock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ScoreboardOptInProps {
  companyId: string;
  companyName: string;
  score: number;
  currentOptIn: boolean;
  currentAnonymous: boolean;
  onUpdate?: () => void;
}

const SCORE_THRESHOLD = 60;

const ScoreboardOptIn = ({ 
  companyId, 
  companyName, 
  score,
  currentOptIn,
  currentAnonymous,
  onUpdate
}: ScoreboardOptInProps) => {
  const [optIn, setOptIn] = useState(currentOptIn);
  const [anonymous, setAnonymous] = useState(currentAnonymous);
  const [isSaving, setIsSaving] = useState(false);

  const isEligible = score >= SCORE_THRESHOLD;

  const handleOptInChange = async (checked: boolean) => {
    if (!isEligible && checked) {
      toast({
        title: "Score too low",
        description: `You need a score of ${SCORE_THRESHOLD}+ to join the scoreboard.`,
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("companies")
        .update({ 
          scoreboard_opt_in: checked,
          public_score: checked ? score : null
        })
        .eq("id", companyId);

      if (error) throw error;

      setOptIn(checked);
      toast({
        title: checked ? "You're on the scoreboard!" : "Removed from scoreboard",
        description: checked 
          ? "Your company is now visible to investors."
          : "Your company is no longer visible on the scoreboard."
      });
      onUpdate?.();
    } catch (err) {
      console.error("Error updating scoreboard opt-in:", err);
      toast({
        title: "Failed to update",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnonymousChange = async (checked: boolean) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("companies")
        .update({ scoreboard_anonymous: checked })
        .eq("id", companyId);

      if (error) throw error;

      setAnonymous(checked);
      toast({
        title: checked ? "Displaying anonymously" : "Displaying with company name",
      });
      onUpdate?.();
    } catch (err) {
      console.error("Error updating anonymous setting:", err);
      toast({
        title: "Failed to update",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className={`border ${isEligible ? 'border-primary/20' : 'border-muted'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Investor Visibility
          </CardTitle>
          {isEligible ? (
            <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Eligible
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              <Lock className="w-3 h-3 mr-1" />
              Score {SCORE_THRESHOLD}+ required
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isEligible && (
          <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">
                Improve your score to unlock
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                You need {SCORE_THRESHOLD - score} more points to be visible to investors.
              </p>
            </div>
          </div>
        )}

        {/* Opt-in Toggle */}
        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Show on Public Scoreboard
            </Label>
            <p className="text-xs text-muted-foreground">
              Let investors discover your company
            </p>
          </div>
          <Switch
            checked={optIn}
            onCheckedChange={handleOptInChange}
            disabled={isSaving || !isEligible}
          />
        </div>

        {/* Anonymous Toggle */}
        {optIn && (
          <div className="flex items-center justify-between py-2 border-t pt-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium flex items-center gap-2">
                {anonymous ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                Display Anonymously
              </Label>
              <p className="text-xs text-muted-foreground">
                Show score but hide company name
              </p>
            </div>
            <Switch
              checked={anonymous}
              onCheckedChange={handleAnonymousChange}
              disabled={isSaving}
            />
          </div>
        )}

        {/* Preview */}
        {optIn && (
          <div className="bg-background border rounded-lg p-4 space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Preview
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {anonymous ? "Anonymous Startup" : companyName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {anonymous ? "Identity hidden" : "Visible to investors"}
                </p>
              </div>
              <div className="text-2xl font-bold text-primary">{score}</div>
            </div>
          </div>
        )}

        {/* Benefits */}
        <div className="text-xs text-muted-foreground pt-2 border-t space-y-1">
          <p className="font-medium text-foreground">Benefits of visibility:</p>
          <ul className="space-y-1 ml-4">
            <li>• Get discovered by 800+ active investors</li>
            <li>• Receive inbound interest and intro requests</li>
            <li>• Build credibility with a verified score</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreboardOptIn;
