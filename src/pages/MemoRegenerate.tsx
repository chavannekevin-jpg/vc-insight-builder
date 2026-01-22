import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { FounderLayout } from "@/components/founder/FounderLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ArrowLeft, ChevronDown, ChevronUp, Loader2, RotateCcw, Pencil, Check, 
  Sparkles, User, AlertCircle, Target, Lightbulb, Users, Shield, 
  UserCircle, Wallet, TrendingUp, Rocket, LucideIcon, CreditCard, Gift,
  Zap, Clock
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

interface SectionConfig {
  key: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const SECTIONS: SectionConfig[] = [
  { key: "problem_core", title: "Problem", description: "What problem are you solving?", icon: Target },
  { key: "solution_core", title: "Solution", description: "How does your product solve this?", icon: Lightbulb },
  { key: "target_customer", title: "Target Customer", description: "Who is your ideal customer?", icon: Users },
  { key: "competitive_moat", title: "Competition", description: "What's your competitive edge?", icon: Shield },
  { key: "team_story", title: "Team", description: "Why are you the right team?", icon: UserCircle },
  { key: "business_model", title: "Business Model", description: "How do you make money?", icon: Wallet },
  { key: "traction_proof", title: "Traction", description: "What progress have you made?", icon: TrendingUp },
  { key: "vision_ask", title: "Vision & Ask", description: "Where are you going and what do you need?", icon: Rocket }
];

interface ResponseData {
  id: string;
  question_key: string;
  answer: string | null;
  source: string | null;
  updated_at: string;
}

// Store for improvement question answers
interface ImprovementAnswer {
  sectionKey: string;
  sectionTitle: string;
  questionId: string;
  question: string;
  answer: string;
  suggestionTitle: string;
}

export default function MemoRegenerate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");
  const { isAdmin } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [generationsAvailable, setGenerationsAvailable] = useState(0);
  const [generationsUsed, setGenerationsUsed] = useState(0);
  const [responses, setResponses] = useState<Record<string, ResponseData>>({});
  const [editedData, setEditedData] = useState<Record<string, string>>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [editingSections, setEditingSections] = useState<Set<string>>(new Set());
  
  // AI Improvements per section
  const [sectionImprovements, setSectionImprovements] = useState<Record<string, AIImprovements | null>>({});
  const [loadingImprovements, setLoadingImprovements] = useState<Record<string, boolean>>({});
  
  // Improvement question answers - stored inline, not queued
  const [improvementAnswers, setImprovementAnswers] = useState<Record<string, string>>({});
  
  // All section scores for context
  const allSectionScores: Record<string, { score: number; benchmark: number }> = {};

  useEffect(() => {
    if (!companyId) {
      navigate("/hub");
      return;
    }
    loadData();
  }, [companyId]);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/hub");
        return;
      }

      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("id, name, description, has_premium, generations_available, generations_used")
        .eq("id", companyId)
        .eq("founder_id", session.user.id)
        .single();

      if (companyError || !company) {
        toast({ title: "Error", description: "Company not found", variant: "destructive" });
        navigate("/hub");
        return;
      }

      if (!company.has_premium) {
        toast({ title: "Access Denied", description: "Premium access required", variant: "destructive" });
        navigate("/hub");
        return;
      }

      setCompanyName(company.name);
      setCompanyDescription(company.description || "");
      setGenerationsAvailable((company as any).generations_available || 0);
      setGenerationsUsed((company as any).generations_used || 0);

      const { data: memoResponses, error: responsesError } = await supabase
        .from("memo_responses")
        .select("id, question_key, answer, source, updated_at")
        .eq("company_id", companyId);

      if (responsesError) {
        console.error("Error loading responses:", responsesError);
      }

      const responsesMap: Record<string, ResponseData> = {};
      const editedMap: Record<string, string> = {};
      
      memoResponses?.forEach((r) => {
        responsesMap[r.question_key] = r;
        editedMap[r.question_key] = r.answer || "";
      });

      setResponses(responsesMap);
      setEditedData(editedMap);
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Load AI improvements for a section
  const loadSectionImprovements = async (sectionTitle: string) => {
    if (sectionImprovements[sectionTitle] || loadingImprovements[sectionTitle]) return;
    
    setLoadingImprovements(prev => ({ ...prev, [sectionTitle]: true }));
    
    try {
      const { data, error } = await supabase.functions.invoke('suggest-section-improvements', {
        body: {
          sectionName: sectionTitle,
          sectionScore: { score: 50, benchmark: 65 },
          sectionVerdict: "Analysis pending",
          companyContext: companyDescription,
          allSectionScores
        }
      });
      
      if (error) throw error;
      
      if (data?.suggestions) {
        setSectionImprovements(prev => ({ ...prev, [sectionTitle]: data }));
      }
    } catch (err) {
      console.error(`Failed to load improvements for ${sectionTitle}:`, err);
    } finally {
      setLoadingImprovements(prev => ({ ...prev, [sectionTitle]: false }));
    }
  };

  // Load improvements for all sections on mount
  useEffect(() => {
    if (!loading && companyId) {
      SECTIONS.forEach(section => {
        loadSectionImprovements(section.title);
      });
    }
  }, [loading, companyId]);

  // Handle improvement answer change
  const handleImprovementAnswer = (questionId: string, answer: string) => {
    setImprovementAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const startEditing = (key: string) => {
    setEditingSections(prev => new Set(prev).add(key));
    setExpandedSections(prev => new Set(prev).add(key));
  };

  const stopEditing = (key: string) => {
    setEditingSections(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const handleChange = (key: string, value: string) => {
    setEditedData(prev => ({ ...prev, [key]: value }));
  };

  const hasChanges = () => {
    // Check for section changes
    const sectionChanges = SECTIONS.some(section => {
      const original = responses[section.key]?.answer || "";
      const edited = editedData[section.key] || "";
      return original !== edited;
    });
    
    // Check for improvement answers
    const hasImprovementAnswers = Object.values(improvementAnswers).some(a => a.trim());
    
    return sectionChanges || hasImprovementAnswers;
  };

  const getChangedSections = () => {
    return SECTIONS.filter(section => {
      const original = responses[section.key]?.answer || "";
      const edited = editedData[section.key] || "";
      return original !== edited;
    });
  };

  // Get improvement answers grouped by section
  const getImprovementsBySection = () => {
    const grouped: Record<string, { question: string; answer: string; suggestionTitle: string }[]> = {};
    
    SECTIONS.forEach(section => {
      const improvements = sectionImprovements[section.title];
      if (!improvements) return;
      
      improvements.suggestions.forEach(suggestion => {
        suggestion.questions?.forEach(q => {
          const fullId = `${section.key}_${q.id}`;
          const answer = improvementAnswers[fullId];
          if (answer?.trim()) {
            if (!grouped[section.key]) grouped[section.key] = [];
            grouped[section.key].push({
              question: q.question,
              answer: answer.trim(),
              suggestionTitle: suggestion.title
            });
          }
        });
      });
    });
    
    return grouped;
  };

  const handleSaveAndRegenerate = async () => {
    setSaving(true);
    try {
      const changedSections = getChangedSections();
      const improvementsBySection = getImprovementsBySection();
      
      // Save changed sections with improvement answers merged
      for (const section of SECTIONS) {
        const sectionEdited = editedData[section.key]?.trim() || "";
        const existing = responses[section.key];
        const sectionImprovementAnswers = improvementsBySection[section.key] || [];
        
        // Build additional context from improvement answers
        let additionalContext = "";
        if (sectionImprovementAnswers.length > 0) {
          additionalContext = "\n\n--- Additional Context from Improvement Questions ---\n" +
            sectionImprovementAnswers.map(ia => `Q: ${ia.question}\nA: ${ia.answer}`).join('\n\n');
        }
        
        const finalAnswer = sectionEdited + additionalContext;
        const originalAnswer = existing?.answer || "";
        
        // Only update if there are changes or improvement answers
        if (finalAnswer !== originalAnswer || additionalContext) {
          if (existing) {
            await supabase
              .from("memo_responses")
              .update({ 
                answer: finalAnswer.trim() || null, 
                updated_at: new Date().toISOString(), 
                source: "manual" 
              })
              .eq("id", existing.id);
          } else if (finalAnswer.trim()) {
            await supabase
              .from("memo_responses")
              .insert({
                company_id: companyId,
                question_key: section.key,
                answer: finalAnswer.trim(),
                source: "manual"
              });
          }
        }
      }

      // Decrement generation credit (skip for admins)
      if (!isAdmin) {
        await supabase
          .from("companies")
          .update({ 
            generations_available: generationsAvailable - 1,
            generations_used: generationsUsed + 1
          })
          .eq("id", companyId);
      }

      const improvementCount = Object.values(improvementsBySection).flat().length;
      
      toast({
        title: "Changes Saved",
        description: `${changedSections.length} section(s) updated${improvementCount > 0 ? `, ${improvementCount} improvement answer(s) added` : ''}. Regenerating memo...`
      });

      navigate(`/analysis?companyId=${companyId}&regenerate=true`);
    } catch (error) {
      console.error("Error saving:", error);
      toast({ title: "Error", description: "Failed to save changes", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handlePurchaseCredit = async () => {
    setPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-regeneration-checkout', {
        body: { companyId }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast({ 
        title: "Error", 
        description: "Failed to start checkout. Please try again.",
        variant: "destructive" 
      });
      setPurchasing(false);
    }
  };

  const getSourceBadge = (source: string | null) => {
    if (source === "deck" || source === "ai") {
      return (
        <Badge variant="secondary" className="text-xs gap-1">
          <Sparkles className="w-3 h-3" />
          AI Generated
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-xs gap-1">
        <User className="w-3 h-3" />
        You wrote
      </Badge>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Count answered improvement questions
  const answeredImprovementCount = Object.values(improvementAnswers).filter(a => a.trim()).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const changedCount = getChangedSections().length;

  return (
    <FounderLayout>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/hub")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
        </div>

        <div className="space-y-6">
          {/* Title Section */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Review & Regenerate</h1>
            <p className="text-muted-foreground">
              Review your answers and answer improvement questions below. Then regenerate your memo with updated context.
            </p>
          </div>

          {/* Company Name */}
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">Regenerating memo for</p>
              <p className="text-lg font-semibold">{companyName}</p>
            </CardContent>
          </Card>

          {/* Generation Credits Card */}
          <Card className={`border-2 ${isAdmin || generationsAvailable > 0 ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'}`}>
            <CardContent className="py-4 flex items-center justify-between gap-4">
              {isAdmin ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/20">
                    <RotateCcw className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      ∞ Unlimited Credits
                      <Badge variant="outline" className="text-xs">Admin</Badge>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Admin accounts have unlimited regenerations
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${generationsAvailable > 0 ? 'bg-success/20' : 'bg-warning/20'}`}>
                      <RotateCcw className={`w-5 h-5 ${generationsAvailable > 0 ? 'text-success' : 'text-warning'}`} />
                    </div>
                    <div>
                      <p className="font-medium">
                        {generationsAvailable > 0 
                          ? `${generationsAvailable} Generation Credit${generationsAvailable !== 1 ? 's' : ''} Available`
                          : 'No Generation Credits'
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {generationsUsed > 0 ? `${generationsUsed} used so far` : 'First generation included with purchase'}
                      </p>
                    </div>
                  </div>
                  {generationsAvailable === 0 && (
                    <Button 
                      onClick={handlePurchaseCredit}
                      disabled={purchasing}
                      className="gap-2"
                    >
                      {purchasing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          Buy Credit - €8.99
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Tip Card */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-4 flex gap-3">
              <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Pro Tip</p>
                <p className="text-sm text-muted-foreground">
                  Answer the AI-suggested improvement questions below each section to significantly boost your score.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Free Credits Tip */}
          {!isAdmin && (
            <Card className="bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/30">
              <CardContent className="py-4 flex gap-3">
                <Gift className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Earn Free Credits</p>
                  <p className="text-sm text-muted-foreground">
                    Invite other founders to get <span className="font-semibold text-primary">free regeneration credits</span>. 
                    Each signup from your referral link gives you +1 credit.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sections */}
          <div className="space-y-3">
            {SECTIONS.map((section) => {
              const response = responses[section.key];
              const isExpanded = expandedSections.has(section.key);
              const isEditing = editingSections.has(section.key);
              const currentValue = editedData[section.key] || "";
              const originalValue = response?.answer || "";
              const hasChanged = currentValue !== originalValue;
              const isEmpty = !currentValue.trim();
              const improvements = sectionImprovements[section.title];
              const isLoadingImprovements = loadingImprovements[section.title];

              return (
                <Collapsible key={section.key} open={isExpanded} onOpenChange={() => toggleSection(section.key)}>
                  <Card className={`transition-all ${hasChanged ? "ring-2 ring-primary/50" : ""} ${isEmpty ? "opacity-70" : ""}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CollapsibleTrigger asChild>
                          <button className="flex items-center gap-3 text-left flex-1 hover:opacity-80 transition-opacity">
                            <section.icon className="w-5 h-5 text-primary" />
                            <div className="flex-1">
                              <CardTitle className="text-base flex items-center gap-2">
                                {section.title}
                                {hasChanged && (
                                  <Badge variant="default" className="text-xs">Modified</Badge>
                                )}
                                {isEmpty && (
                                  <Badge variant="outline" className="text-xs text-muted-foreground gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Empty
                                  </Badge>
                                )}
                              </CardTitle>
                              {!isExpanded && currentValue && (
                                <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                  {currentValue.slice(0, 100)}...
                                </p>
                              )}
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                        </CollapsibleTrigger>
                        {!isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(section.key);
                            }}
                            className="ml-2"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-2 space-y-4">
                        {/* Meta info */}
                        {response && (
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {getSourceBadge(response.source)}
                            <span>Last updated: {formatDate(response.updated_at)}</span>
                          </div>
                        )}
                        
                        {/* Content */}
                        {isEditing ? (
                          <div className="space-y-3">
                            <Textarea
                              value={currentValue}
                              onChange={(e) => handleChange(section.key, e.target.value)}
                              placeholder={section.description}
                              className="min-h-[150px]"
                              maxLength={2000}
                            />
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground">
                                {currentValue.length} / 2000 characters
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => stopEditing(section.key)}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Done
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="text-sm whitespace-pre-wrap cursor-pointer hover:bg-muted/50 p-3 rounded-md transition-colors"
                            onClick={() => startEditing(section.key)}
                          >
                            {currentValue || (
                              <span className="text-muted-foreground italic">
                                Click to add content for this section...
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* AI Improvement Suggestions - Always visible */}
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                              How to Improve This Section
                            </span>
                            {isLoadingImprovements && (
                              <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                            )}
                          </div>
                          
                          {improvements ? (
                            <>
                              {improvements.keyInsight && (
                                <div className="p-3 rounded-lg bg-warning/5 border border-warning/20 mb-3">
                                  <div className="flex items-start gap-2">
                                    <Zap className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                                    <p className="text-xs text-foreground">
                                      <span className="font-semibold text-warning">Key Insight: </span>
                                      {improvements.keyInsight}
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              <div className="space-y-4">
                                {improvements.suggestions.map((suggestion, i) => (
                                  <div key={i} className="rounded-lg border border-border/40 overflow-hidden">
                                    <div className="p-3 bg-muted/20">
                                      <div className="flex items-start justify-between gap-2 mb-1">
                                        <h5 className="text-sm font-medium text-foreground">{suggestion.title}</h5>
                                        <div className="flex items-center gap-2 shrink-0">
                                          {suggestion.impact === 'high' && (
                                            <Badge className="text-[10px] bg-success/10 text-success border-success/20">
                                              High Impact
                                            </Badge>
                                          )}
                                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            {suggestion.timeframe}
                                          </span>
                                        </div>
                                      </div>
                                      <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                                    </div>
                                    
                                    {suggestion.questions && suggestion.questions.length > 0 && (
                                      <div className="p-3 pt-2 bg-background/50 space-y-3">
                                        {suggestion.questions.map((q) => {
                                          const fullId = `${section.key}_${q.id}`;
                                          const answer = improvementAnswers[fullId] || "";
                                          return (
                                            <div key={q.id} className="space-y-2">
                                              <p className="text-xs font-medium text-foreground">{q.question}</p>
                                              <Textarea
                                                value={answer}
                                                onChange={(e) => handleImprovementAnswer(fullId, e.target.value)}
                                                placeholder={q.placeholder || "Type your answer to improve this section..."}
                                                className="min-h-[80px] text-sm"
                                                maxLength={1000}
                                              />
                                              <div className="flex items-center justify-between">
                                                <span className="text-xs text-muted-foreground">
                                                  {answer.length} / 1000 characters
                                                </span>
                                                {answer.trim() && (
                                                  <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">
                                                    ✓ Will be included
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : isLoadingImprovements ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Loading improvement suggestions...
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground italic py-2">
                              No improvement suggestions available for this section.
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>

          {/* Summary & Action */}
          <Card className="sticky bottom-4 border-2 border-primary/30 bg-background/95 backdrop-blur shadow-lg">
            <CardContent className="py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm">
                  {changedCount > 0 || answeredImprovementCount > 0 ? (
                    <span className="text-foreground">
                      <span className="font-semibold text-primary">{changedCount}</span> section{changedCount !== 1 ? 's' : ''} modified
                      {answeredImprovementCount > 0 && (
                        <>, <span className="font-semibold text-primary">{answeredImprovementCount}</span> improvement{answeredImprovementCount !== 1 ? 's' : ''} answered</>
                      )}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No changes yet</span>
                  )}
                </div>
                <Button
                  onClick={handleSaveAndRegenerate}
                  disabled={saving || (!hasChanges()) || (generationsAvailable === 0 && !isAdmin)}
                  className="gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      Save & Regenerate
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </FounderLayout>
  );
}
