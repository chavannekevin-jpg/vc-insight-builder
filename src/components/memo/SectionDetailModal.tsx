import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  ExternalLink,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type SectionVerdict } from "@/lib/holisticVerdictGenerator";
import { useNavigate } from "react-router-dom";

interface SectionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: SectionVerdict | null;
  companyId: string;
  sectionIndex?: number;
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

// Map section names to their indices in the memo
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
  sectionIndex 
}: SectionDetailModalProps) => {
  const navigate = useNavigate();
  
  if (!section) return null;
  
  const config = STATUS_CONFIG[section.status];
  const Icon = config.icon;
  
  // Get the section index for navigation
  const navIndex = sectionIndex ?? SECTION_INDEX_MAP[section.section] ?? 0;
  
  const handleViewFullSection = () => {
    onOpenChange(false);
    navigate(`/analysis/section?companyId=${companyId}&section=${navIndex}`);
  };
  
  // Calculate score difference from benchmark
  const scoreDiff = section.score - section.benchmark;
  const diffLabel = scoreDiff >= 0 ? `+${scoreDiff}` : `${scoreDiff}`;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border/50">
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
        
        <div className="space-y-6 py-4">
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
          
          {/* Stage Context if available */}
          {section.stageContext && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Stage Context
                </h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {section.stageContext}
              </p>
            </div>
          )}
          
          {/* Status explanation */}
          <div className={cn(
            "p-4 rounded-lg border",
            config.bg,
            config.border
          )}>
            <div className="flex items-center gap-2">
              <Icon className={cn("w-5 h-5", config.color)} />
              <div>
                <p className={cn("font-semibold", config.color)}>{config.label}</p>
                <p className="text-sm text-muted-foreground">{config.description}</p>
              </div>
            </div>
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
