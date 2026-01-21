import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Trophy, 
  Medal,
  Loader2,
  Lock,
  CheckCircle2,
  Star
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ScoreboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId?: string;
  companyName?: string;
  userScore?: number;
  currentOptIn?: boolean;
}

interface ScoreboardEntry {
  id: string;
  name: string;
  public_score: number;
  scoreboard_anonymous: boolean;
}

const SCORE_THRESHOLD = 60;

const ScoreboardModal = ({
  open,
  onOpenChange,
  companyId,
  companyName = "Your Company",
  userScore = 0,
  currentOptIn = false,
}: ScoreboardModalProps) => {
  const queryClient = useQueryClient();
  const [optIn, setOptIn] = useState(currentOptIn);
  const [isSaving, setIsSaving] = useState(false);

  const isEligible = userScore >= SCORE_THRESHOLD;

  // Fetch scoreboard entries
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["scoreboard-entries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, public_score, scoreboard_anonymous")
        .eq("scoreboard_opt_in", true)
        .eq("memo_content_generated", true)
        .gte("public_score", SCORE_THRESHOLD)
        .order("public_score", { ascending: false })
        .limit(25);

      if (error) throw error;
      return data as ScoreboardEntry[];
    },
    enabled: open,
  });

  const handleOptInChange = async (checked: boolean) => {
    if (!companyId) return;
    
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
          public_score: checked ? userScore : null
        })
        .eq("id", companyId);

      if (error) throw error;

      setOptIn(checked);
      queryClient.invalidateQueries({ queryKey: ["scoreboard-entries"] });
      queryClient.invalidateQueries({ queryKey: ["company"] });
      
      toast({
        title: checked ? "You're on the scoreboard!" : "Removed from scoreboard",
        description: checked 
          ? "Your company is now visible to other founders."
          : "Your company is no longer on the scoreboard."
      });
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

  const getRankBadge = (index: number) => {
    if (index === 0) return <Medal className="w-4 h-4 text-yellow-500" />;
    if (index === 1) return <Medal className="w-4 h-4 text-gray-400" />;
    if (index === 2) return <Medal className="w-4 h-4 text-amber-600" />;
    return <span className="text-xs font-medium text-muted-foreground w-4 text-center">#{index + 1}</span>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-500";
    if (score >= 75) return "text-emerald-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Founder Scoreboard
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Opt-in Toggle */}
          <div className="bg-muted/30 rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium flex items-center gap-2">
                  Join Scoreboard
                  {isEligible ? (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/30 text-[10px]">
                      <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                      Eligible
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground text-[10px]">
                      <Lock className="w-2.5 h-2.5 mr-0.5" />
                      {SCORE_THRESHOLD}+ required
                    </Badge>
                  )}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {isEligible 
                    ? "Compete with other founders on the platform"
                    : `Need ${SCORE_THRESHOLD - userScore} more points to join`}
                </p>
              </div>
              <Switch
                checked={optIn}
                onCheckedChange={handleOptInChange}
                disabled={isSaving || !isEligible || !companyId}
              />
            </div>
            
            {optIn && (
              <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Your ranking:</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{companyName}</span>
                  <span className={`font-bold ${getScoreColor(userScore)}`}>{userScore}</span>
                </div>
              </div>
            )}
          </div>

          {/* Scoreboard List */}
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">
              Top Founders
            </h4>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No entries yet. Be the first!</p>
              </div>
            ) : (
              <ScrollArea className="h-[280px]">
                <div className="space-y-2 pr-2">
                  {entries.map((entry, index) => {
                    const isCurrentUser = entry.id === companyId;
                    return (
                      <div
                        key={entry.id}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                          isCurrentUser 
                            ? "bg-primary/10 border-primary/30" 
                            : index < 3 
                              ? "bg-gradient-to-r from-primary/5 to-transparent border-primary/10"
                              : "bg-card border-border/50"
                        }`}
                      >
                        <div className="w-6 flex justify-center">
                          {getRankBadge(index)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-medium truncate text-sm ${
                              entry.scoreboard_anonymous ? "text-muted-foreground italic" : ""
                            }`}>
                              {entry.scoreboard_anonymous ? "Anonymous" : entry.name}
                            </span>
                            {index < 3 && (
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 shrink-0" />
                            )}
                            {isCurrentUser && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0">You</Badge>
                            )}
                          </div>
                        </div>
                        
                        <span className={`font-bold text-lg ${getScoreColor(entry.public_score)}`}>
                          {entry.public_score}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScoreboardModal;
