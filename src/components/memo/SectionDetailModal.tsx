import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  ExternalLink,
  Sparkles,
  Clock,
  Zap,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Eye,
  HelpCircle,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type SectionVerdict } from "@/lib/holisticVerdictGenerator";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { MemoStructuredSection, EnhancedSectionTools } from "@/types/memo";
import { renderMarkdownText } from "@/lib/markdownParser";

interface SectionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: SectionVerdict | null;
  companyId: string;
  companyDescription?: string;
  allSectionScores?: Record<string, { score: number; benchmark: number }>;
  sectionIndex?: number;
  sectionNarrative?: MemoStructuredSection | null;
  sectionTools?: Record<string, unknown> | null;
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
    gradient: 'from-destructive/20 via-destructive/10 to-transparent'
  },
  weak: {
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    icon: AlertTriangle,
    label: 'NEEDS WORK',
    gradient: 'from-warning/20 via-warning/10 to-transparent'
  },
  passing: {
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/30',
    icon: CheckCircle2,
    label: 'PASSING',
    gradient: 'from-success/20 via-success/10 to-transparent'
  },
  strong: {
    color: 'text-success',
    bg: 'bg-success/15',
    border: 'border-success/40',
    icon: TrendingUp,
    label: 'STRONG',
    gradient: 'from-success/25 via-success/15 to-transparent'
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

// Helper to safely convert to string
const safeString = (text: unknown) => typeof text === 'string' ? text : String(text || '');

export const SectionDetailModal = ({ 
  open, 
  onOpenChange, 
  section, 
  companyId,
  companyDescription,
  allSectionScores,
  sectionIndex,
  sectionNarrative,
  sectionTools
}: SectionDetailModalProps) => {
  const navigate = useNavigate();
  const [improvements, setImprovements] = useState<AIImprovements | null>(null);
  const [loadingImprovements, setLoadingImprovements] = useState(false);
  const [showImprovements, setShowImprovements] = useState(false);
  const [showVCQuestions, setShowVCQuestions] = useState(false);
  
  useEffect(() => {
    if (open && section && !improvements) {
      loadImprovements();
    }
  }, [open, section]);
  
  useEffect(() => {
    if (!open) {
      setImprovements(null);
      setShowImprovements(false);
      setShowVCQuestions(false);
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

  // Extract content from narrative (handle both legacy and new structures)
  const paragraphs = sectionNarrative?.narrative?.paragraphs || sectionNarrative?.paragraphs || [];
  const highlights = sectionNarrative?.narrative?.highlights || sectionNarrative?.highlights || [];
  const keyPoints = sectionNarrative?.narrative?.keyPoints || sectionNarrative?.keyPoints || [];
  const vcReflection = sectionNarrative?.vcReflection;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[85vh] p-0 bg-card border-border/50 flex flex-col overflow-hidden">
        {/* Header with gradient */}
        <div className={cn(
          "relative px-6 py-5 border-b border-border/30",
          `bg-gradient-to-r ${config.gradient}`
        )}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-display font-bold flex items-center gap-3">
                {section.section}
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold",
                  config.bg,
                  config.color
                )}>
                  <Icon className="w-3.5 h-3.5" />
                  {config.label}
                </div>
              </DialogTitle>
            </div>
          </DialogHeader>
          
          {/* Score Display - integrated into header */}
          <div className="flex items-center gap-6 mt-4">
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
            <div className="h-8 w-px bg-border/50" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">VC Benchmark:</span>
              <span className="text-lg font-semibold text-muted-foreground">{section.benchmark}</span>
              <span className={cn(
                "px-2 py-0.5 rounded text-xs font-bold",
                scoreDiff >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
              )}>
                {diffLabel}
              </span>
            </div>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <ScrollArea className="flex-1 px-6">
          <div className="py-6 space-y-6">
            
            {/* Narrative Section */}
            {paragraphs.length > 0 && (
              <div className="space-y-4">
                {paragraphs.map((paragraph, index) => (
                  <p 
                    key={index} 
                    className={cn(
                      "text-base leading-relaxed",
                      paragraph.emphasis === 'high' || paragraph.emphasis === 'hero' 
                        ? "font-semibold text-foreground text-lg" 
                        : paragraph.emphasis === 'quote'
                        ? "italic border-l-2 border-primary/50 pl-4 text-muted-foreground"
                        : "text-foreground/90"
                    )}
                  >
                    {paragraph.text}
                  </p>
                ))}
              </div>
            )}

            {/* Key Metrics */}
            {highlights.length > 0 && (
              <div className="pt-4 border-t border-border/30">
                <h4 className="text-xs font-semibold text-primary mb-4 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Key Metrics
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {highlights.map((highlight, i) => (
                    <div 
                      key={i}
                      className="p-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
                    >
                      <div className="text-2xl font-bold text-primary mb-1">
                        {safeString(highlight.metric)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {safeString(highlight.label)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Takeaways */}
            {keyPoints.length > 0 && (
              <div className="pt-4 border-t border-border/30">
                <h4 className="text-xs font-semibold text-primary mb-4 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Key Takeaways
                </h4>
                <div className="space-y-2">
                  {keyPoints.map((point, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <p className="text-sm text-foreground leading-relaxed">
                        {renderMarkdownText(safeString(point))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VC Reflection */}
            {vcReflection && (
              <div className="pt-4 border-t border-border/30 space-y-4">
                {/* VC Analysis */}
                {vcReflection.analysis && (
                  <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Eye className="w-4 h-4 text-primary" />
                      <h4 className="text-sm font-semibold text-foreground">VC Perspective</h4>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed italic">
                      "{safeString(vcReflection.analysis)}"
                    </p>
                  </div>
                )}

                {/* VC Questions - Collapsible */}
                {vcReflection.questions && vcReflection.questions.length > 0 && (
                  <Collapsible open={showVCQuestions} onOpenChange={setShowVCQuestions}>
                    <CollapsibleTrigger asChild>
                      <button className="w-full flex items-center justify-between p-3 rounded-lg bg-accent/5 border border-accent/20 hover:bg-accent/10 transition-colors">
                        <div className="flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-accent" />
                          <span className="font-semibold text-sm text-foreground">
                            Key Investor Questions
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({vcReflection.questions.length})
                          </span>
                        </div>
                        {showVCQuestions ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-3 space-y-2">
                      {vcReflection.questions.map((q, i) => {
                        const isEnhanced = typeof q === 'object' && 'question' in q;
                        const questionText = isEnhanced ? q.question : q;
                        return (
                          <div 
                            key={i}
                            className="p-3 rounded-lg bg-accent/5 border border-accent/20"
                          >
                            <p className="text-sm font-medium text-foreground">
                              {safeString(questionText)}
                            </p>
                            {isEnhanced && q.vcRationale && (
                              <p className="text-xs text-muted-foreground mt-2">
                                <span className="font-semibold">Why VCs ask:</span> {safeString(q.vcRationale)}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Conclusion */}
                {vcReflection.conclusion && (
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Bottom Line
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {safeString(vcReflection.conclusion)}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* How to Improve - Collapsible */}
            <div className="pt-4 border-t border-border/30">
              <Collapsible open={showImprovements} onOpenChange={setShowImprovements}>
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 hover:from-primary/15 hover:to-primary/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Sparkles className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <span className="font-semibold text-foreground block">
                          How to Improve This Score
                        </span>
                        <span className="text-xs text-muted-foreground">
                          AI-powered suggestions based on your analysis
                        </span>
                      </div>
                      {loadingImprovements && (
                        <RefreshCw className="w-4 h-4 animate-spin text-primary ml-2" />
                      )}
                    </div>
                    {showImprovements ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="pt-4">
                  {loadingImprovements ? (
                    <div className="p-8 rounded-xl bg-muted/30 border border-border/50 flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Analyzing your data...</p>
                    </div>
                  ) : improvements ? (
                    <div className="space-y-4">
                      {improvements.keyInsight && (
                        <div className="p-4 rounded-xl bg-warning/5 border border-warning/20">
                          <div className="flex items-start gap-3">
                            <Zap className="w-5 h-5 text-warning mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-warning uppercase tracking-wide mb-1">
                                Key Insight
                              </p>
                              <p className="text-sm text-foreground">{improvements.keyInsight}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        {improvements.suggestions.map((suggestion, i) => (
                          <div 
                            key={i}
                            className="p-4 rounded-xl bg-muted/30 border border-border/50"
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <h5 className="font-semibold text-foreground">{suggestion.title}</h5>
                              <div className="flex items-center gap-2 shrink-0">
                                {suggestion.impact === 'high' && (
                                  <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-success/10 text-success uppercase">
                                    High Impact
                                  </span>
                                )}
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  {suggestion.timeframe}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {suggestion.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl bg-muted/30 border border-border/50 text-center">
                      <p className="text-sm text-muted-foreground">
                        Suggestions unavailable. View full section for detailed analysis.
                      </p>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </ScrollArea>
        
        {/* Footer Action */}
        <div className="px-6 py-4 border-t border-border/30 bg-muted/20">
          <Button 
            onClick={handleViewFullSection}
            variant="outline"
            className="w-full border-primary/30 hover:bg-primary/10"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in Full Page View
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
