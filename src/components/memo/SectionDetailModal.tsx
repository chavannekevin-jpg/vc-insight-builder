import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  Sparkles,
  Clock,
  Zap,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Eye,
  HelpCircle,
  Target,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Lightbulb,
  ListChecks
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type SectionVerdict } from "@/lib/holisticVerdictGenerator";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MemoStructuredSection } from "@/types/memo";
import { renderMarkdownText } from "@/lib/markdownParser";
import { ImprovementQuestionCard } from "./ImprovementQuestionCard";
import { useImprovementQueue } from "@/hooks/useImprovementQueue";

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

interface ImprovementQuestion {
  id: string;
  question: string;
  placeholder?: string;
}

interface Suggestion {
  title: string;
  description: string;
  impact: 'high' | 'medium';
  timeframe: string;
  questions?: ImprovementQuestion[];
}

interface AIImprovements {
  suggestions: Suggestion[];
  keyInsight: string;
}

const STATUS_CONFIG = {
  critical: {
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
    icon: XCircle,
    label: 'Critical',
    accentColor: 'hsl(var(--destructive))'
  },
  weak: {
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    icon: AlertTriangle,
    label: 'Needs Work',
    accentColor: 'hsl(var(--warning))'
  },
  passing: {
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/20',
    icon: CheckCircle2,
    label: 'Passing',
    accentColor: 'hsl(var(--success))'
  },
  strong: {
    color: 'text-success',
    bg: 'bg-success/15',
    border: 'border-success/30',
    icon: TrendingUp,
    label: 'Strong',
    accentColor: 'hsl(var(--success))'
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
  const [inlineAnswers, setInlineAnswers] = useState<Record<string, string>>({});
  
  const { 
    queue, 
    addQuestion, 
    isInQueue, 
    queueCount 
  } = useImprovementQueue(companyId);
  
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
      setInlineAnswers({});
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

  const handleGoToRegenerate = () => {
    onOpenChange(false);
    navigate(`/analysis/regenerate?companyId=${companyId}&mode=improvements`);
  };

  const handleAddQuestionToQueue = (question: ImprovementQuestion, suggestionTitle: string, impact: 'high' | 'medium') => {
    addQuestion({
      id: `${section.section.toLowerCase().replace(/\s/g, '_')}_${question.id}`,
      section: section.section,
      question: question.question,
      placeholder: question.placeholder,
      suggestionTitle,
      impact
    });
  };

  const handleAnswerInline = (questionId: string, answer: string) => {
    setInlineAnswers(prev => ({ ...prev, [questionId]: answer }));
    // Also add to queue with the answer
    const fullId = `${section.section.toLowerCase().replace(/\s/g, '_')}_${questionId}`;
    // Find the question in improvements
    improvements?.suggestions.forEach(suggestion => {
      suggestion.questions?.forEach(q => {
        if (q.id === questionId) {
          addQuestion({
            id: fullId,
            section: section.section,
            question: q.question,
            placeholder: q.placeholder,
            suggestionTitle: suggestion.title,
            impact: suggestion.impact
          });
        }
      });
    });
  };
  
  const scoreDiff = section.score - section.benchmark;
  const diffLabel = scoreDiff >= 0 ? `+${scoreDiff}` : `${scoreDiff}`;

  // Extract content from narrative
  const paragraphs = sectionNarrative?.narrative?.paragraphs || sectionNarrative?.paragraphs || [];
  const highlights = sectionNarrative?.narrative?.highlights || sectionNarrative?.highlights || [];
  const keyPoints = sectionNarrative?.narrative?.keyPoints || sectionNarrative?.keyPoints || [];
  const vcReflection = sectionNarrative?.vcReflection;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 bg-background border-border/30 flex flex-col overflow-hidden gap-0">
        
        {/* Elegant Header */}
        <div className="relative px-8 py-6 border-b border-border/20 bg-gradient-to-b from-muted/30 to-transparent">
          {/* Section Number Badge */}
          <div className="absolute top-6 left-8 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">{navIndex + 1}</span>
          </div>
          
          <div className="pl-12">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  {section.section}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Investment analysis section
                </p>
              </div>
              
              {/* Score Display */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-baseline gap-1.5 justify-end">
                    <span className={cn(
                      "text-4xl font-bold tabular-nums tracking-tight",
                      section.score >= section.benchmark ? "text-success" : 
                      section.score >= section.benchmark - 15 ? "text-warning" : "text-destructive"
                    )}>
                      {section.score}
                    </span>
                    <span className="text-lg text-muted-foreground font-medium">/100</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 justify-end">
                    <span className="text-xs text-muted-foreground">Benchmark: {section.benchmark}</span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-bold",
                      scoreDiff >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    )}>
                      {diffLabel}
                    </span>
                  </div>
                </div>
                
                {/* Status Badge */}
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl",
                  config.bg, config.border, "border"
                )}>
                  <Icon className={cn("w-5 h-5", config.color)} />
                  <span className={cn("font-semibold text-sm", config.color)}>
                    {config.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="px-8 py-6 space-y-8">
            
            {/* Main Narrative - Clean Typography */}
            {paragraphs.length > 0 && (
              <article className="prose prose-sm max-w-none">
                <div className="space-y-4">
                  {paragraphs.map((paragraph, index) => (
                    <p 
                      key={index} 
                      className={cn(
                        "leading-relaxed",
                        paragraph.emphasis === 'high' || paragraph.emphasis === 'hero' 
                          ? "text-lg font-medium text-foreground" 
                          : paragraph.emphasis === 'quote'
                          ? "italic border-l-2 border-primary/40 pl-4 text-muted-foreground py-1"
                          : "text-base text-foreground/85"
                      )}
                    >
                      {paragraph.text}
                    </p>
                  ))}
                </div>
              </article>
            )}

            {/* Key Metrics - Elegant Cards */}
            {highlights.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">
                    Key Metrics
                  </h3>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {highlights.map((highlight, i) => (
                    <div 
                      key={i}
                      className="relative overflow-hidden p-4 rounded-xl border border-primary/15 bg-gradient-to-br from-primary/5 via-transparent to-transparent"
                    >
                      <div className="text-2xl font-bold text-primary tracking-tight mb-1">
                        {safeString(highlight.metric)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {safeString(highlight.label)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Key Takeaways */}
            {keyPoints.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <h3 className="text-xs font-semibold text-success uppercase tracking-wider">
                    Key Takeaways
                  </h3>
                </div>
                <div className="space-y-2">
                  {keyPoints.map((point, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/10"
                    >
                      <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                      <p className="text-sm text-foreground/90 leading-relaxed">
                        {renderMarkdownText(safeString(point))}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* VC Perspective - Premium Card */}
            {vcReflection && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-accent" />
                  <h3 className="text-xs font-semibold text-accent uppercase tracking-wider">
                    VC Perspective
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {/* Analysis Quote */}
                  {vcReflection.analysis && (
                    <div className="relative overflow-hidden rounded-xl border border-accent/20 bg-gradient-to-br from-accent/5 via-background to-background p-5">
                      <div className="absolute top-0 left-0 w-1 h-full bg-accent/50" />
                      <p className="text-base text-foreground/90 leading-relaxed italic pl-4">
                        "{safeString(vcReflection.analysis)}"
                      </p>
                    </div>
                  )}

                  {/* VC Questions - Collapsible */}
                  {vcReflection.questions && vcReflection.questions.length > 0 && (
                    <Collapsible open={showVCQuestions} onOpenChange={setShowVCQuestions}>
                      <CollapsibleTrigger asChild>
                        <button className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <HelpCircle className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-sm text-foreground">
                              Questions VCs Will Ask
                            </span>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              {vcReflection.questions.length}
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
                              className="p-4 rounded-lg bg-muted/20 border border-border/30"
                            >
                              <p className="text-sm font-medium text-foreground">
                                {safeString(questionText)}
                              </p>
                              {isEnhanced && q.vcRationale && (
                                <p className="text-xs text-muted-foreground mt-2 pl-3 border-l border-muted">
                                  <span className="font-medium">Why VCs ask:</span> {safeString(q.vcRationale)}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {/* Bottom Line */}
                  {vcReflection.conclusion && (
                    <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
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
              </section>
            )}
            
            {/* How to Improve - Collapsible */}
            <section className="space-y-4">
              <Collapsible open={showImprovements} onOpenChange={setShowImprovements}>
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 hover:from-primary/15 hover:via-primary/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Lightbulb className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <span className="font-semibold text-foreground block">
                          How to Improve This Score
                        </span>
                        <span className="text-xs text-muted-foreground">
                          AI-powered recommendations
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
                    <div className="p-8 rounded-xl bg-muted/20 border border-border/30 flex flex-col items-center justify-center gap-3">
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
                      
                      <div className="space-y-5">
                        {improvements.suggestions.map((suggestion, i) => (
                          <div 
                            key={i}
                            className="rounded-xl border border-border/40 overflow-hidden"
                          >
                            {/* Suggestion Header */}
                            <div className="p-4 bg-muted/20">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <h5 className="font-medium text-foreground">{suggestion.title}</h5>
                                <div className="flex items-center gap-2 shrink-0">
                                  {suggestion.impact === 'high' && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/10 text-success uppercase">
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
                            
                            {/* Actionable Questions */}
                            {suggestion.questions && suggestion.questions.length > 0 && (
                              <div className="p-4 pt-2 space-y-2 bg-background/50">
                                <p className="text-xs font-medium text-primary flex items-center gap-1.5 mb-3">
                                  <Sparkles className="w-3 h-3" />
                                  Answer to improve your score
                                </p>
                                {suggestion.questions.map((question) => {
                                  const fullId = `${section.section.toLowerCase().replace(/\s/g, '_')}_${question.id}`;
                                  return (
                                    <ImprovementQuestionCard
                                      key={question.id}
                                      question={question}
                                      section={section.section}
                                      suggestionTitle={suggestion.title}
                                      impact={suggestion.impact}
                                      isInQueue={isInQueue(fullId)}
                                      onAddToQueue={(q) => handleAddQuestionToQueue(q, suggestion.title, suggestion.impact)}
                                      onAnswerInline={handleAnswerInline}
                                      inlineAnswer={inlineAnswers[question.id]}
                                    />
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl bg-muted/20 border border-border/30 text-center">
                      <p className="text-sm text-muted-foreground">
                        Suggestions unavailable. View full section for detailed analysis.
                      </p>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </section>
          </div>
        </ScrollArea>
        
        {/* Footer with Queue CTA */}
        <div className="px-8 py-4 border-t border-border/20 bg-muted/10">
          {/* Queue Status Bar */}
          {queueCount > 0 && (
            <div className="mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <ListChecks className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {queueCount} question{queueCount !== 1 ? 's' : ''} queued for regeneration
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Answer them to improve your analysis score
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleGoToRegenerate}
                size="sm"
                className="gradient-primary shadow-glow gap-2"
              >
                Review & Regenerate
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <div className="flex items-center justify-between gap-4">
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <Button 
              onClick={handleViewFullSection}
              size="sm"
              variant="outline"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Full Page View
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
