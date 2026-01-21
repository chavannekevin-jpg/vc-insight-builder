import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  ExternalLink,
  Target,
  Sparkles,
  Clock,
  Zap,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type SectionVerdict } from "@/lib/holisticVerdictGenerator";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SectionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: SectionVerdict | null;
  companyId: string;
  companyDescription?: string;
  allSectionScores?: Record<string, { score: number; benchmark: number }>;
  sectionIndex?: number;
}

interface Suggestion {
  title: string;
  description: string;
  impact: 'high' | 'medium';
  timeframe: string;
}

interface AIImprovements {
  suggestions: Suggestion[];
  keyInsight: string;
}

const STATUS_CONFIG = {
  critical: {
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    icon: XCircle,
    label: 'CRITICAL',
    description: 'Major blocker for investors'
  },
  weak: {
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    icon: AlertTriangle,
    label: 'NEEDS WORK',
    description: 'Below VC expectations'
  },
  passing: {
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/30',
    icon: CheckCircle2,
    label: 'PASSING',
    description: 'Meets investor bar'
  },
  strong: {
    color: 'text-success',
    bg: 'bg-success/15',
    border: 'border-success/40',
    icon: TrendingUp,
    label: 'STRONG',
    description: 'Exceeds expectations'
  }
};

const SECTION_INDEX_MAP: Record<string, number> = {
  'Problem': 0,
  'Solution': 1,
  'Market': 2,
  'Competition': 3,
  'Business Model': 4,
  'Traction': 5,
  'Team': 6,
  'Vision': 7
};

export const SectionDetailModal = ({ 
  open, 
  onOpenChange, 
  section, 
  companyId,
  companyDescription,
  allSectionScores,
  sectionIndex 
}: SectionDetailModalProps) => {
  const navigate = useNavigate();
  const [improvements, setImprovements] = useState<AIImprovements | null>(null);
  const [loadingImprovements, setLoadingImprovements] = useState(false);
  
  useEffect(() => {
    if (open && section && !improvements) {
      loadImprovements();
    }
  }, [open, section]);
  
  useEffect(() => {
    // Reset when section changes
    if (!open) {
      setImprovements(null);
    }
  }, [open]);
  
  const loadImprovements = async () => {
    if (!section) return;
    
    setLoadingImprovements(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-section-improvements', {
        body: {
          sectionName: section.section,
          sectionScore: { score: section.score, benchmark: section.benchmark },
          sectionVerdict: section.holisticVerdict,
          companyContext: companyDescription,
          allSectionScores
        }
      });
      
      if (error) throw error;
      
      if (data?.suggestions) {
        setImprovements(data);
      }
    } catch (err) {
      console.error('Failed to load improvements:', err);
      toast({
        title: "Couldn't load suggestions",
        description: "AI suggestions are temporarily unavailable",
        variant: "destructive"
      });
    } finally {
      setLoadingImprovements(false);
    }
  };
  
  if (!section) return null;
  
  const config = STATUS_CONFIG[section.status];
  const Icon = config.icon;
  const navIndex = sectionIndex ?? SECTION_INDEX_MAP[section.section] ?? 0;
  
  const handleViewFullSection = () => {
    onOpenChange(false);
    navigate(`/analysis/section?companyId=${companyId}&section=${navIndex}`);
  };
  
  const scoreDiff = section.score - section.benchmark;
  const diffLabel = scoreDiff >= 0 ? `+${scoreDiff}` : `${scoreDiff}`;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border/50">
        <DialogHeader className="pb-4 border-b border-border/30">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              {section.section}
              <div className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold",
                config.bg,
                config.color
              )}>
                <Icon className="w-3.5 h-3.5" />
                {config.label}
              </div>
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-5 py-4">
          {/* Score Display */}
          <div className="flex items-center justify-between p-5 rounded-xl bg-muted/30 border border-border/50">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Your Score</p>
              <div className="flex items-baseline gap-2">
                <span className={cn(
                  "text-4xl font-bold tabular-nums",
                  section.score >= section.benchmark ? "text-success" : 
                  section.score >= section.benchmark - 15 ? "text-warning" : "text-destructive"
                )}>
                  {section.score}
                </span>
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
            </div>
            
            <div className="text-right space-y-1">
              <p className="text-sm text-muted-foreground">VC Benchmark</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold text-muted-foreground">{section.benchmark}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded text-xs font-bold",
                  scoreDiff >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                )}>
                  {diffLabel}
                </span>
              </div>
            </div>
          </div>
          
          {/* VC Verdict */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                VC Assessment
              </h4>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm text-foreground leading-relaxed">
                "{section.holisticVerdict}"
              </p>
            </div>
          </div>
          
          {/* AI Improvement Suggestions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  How to Improve
                </h4>
              </div>
              {loadingImprovements && (
                <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
              )}
            </div>
            
            {loadingImprovements ? (
              <div className="p-6 rounded-lg bg-muted/30 border border-border/50 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Analyzing your data...</p>
              </div>
            ) : improvements ? (
              <div className="space-y-3">
                {/* Key Insight */}
                {improvements.keyInsight && (
                  <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                    <div className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                      <p className="text-sm text-foreground">{improvements.keyInsight}</p>
                    </div>
                  </div>
                )}
                
                {/* Suggestions */}
                <div className="space-y-2">
                  {improvements.suggestions.map((suggestion, i) => (
                    <div 
                      key={i}
                      className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-medium text-foreground text-sm">{suggestion.title}</h5>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {suggestion.impact === 'high' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-success/10 text-success uppercase">
                              High Impact
                            </span>
                          )}
                          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {suggestion.timeframe}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {suggestion.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50 text-center">
                <p className="text-sm text-muted-foreground">
                  Suggestions unavailable. View full section for detailed analysis.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Action */}
        <div className="pt-4 border-t border-border/30">
          <Button 
            onClick={handleViewFullSection}
            className="w-full gradient-primary"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Full Section Analysis
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
