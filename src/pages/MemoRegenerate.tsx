import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ArrowLeft, ChevronDown, ChevronUp, Loader2, RotateCcw, Pencil, Check, 
  Sparkles, User, AlertCircle, Target, Lightbulb, Users, Shield, 
  UserCircle, Wallet, TrendingUp, Rocket, LucideIcon, CreditCard
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

export default function MemoRegenerate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [generationsAvailable, setGenerationsAvailable] = useState(0);
  const [generationsUsed, setGenerationsUsed] = useState(0);
  const [responses, setResponses] = useState<Record<string, ResponseData>>({});
  const [editedData, setEditedData] = useState<Record<string, string>>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [editingSections, setEditingSections] = useState<Set<string>>(new Set());

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

      // Load company
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("id, name, has_premium, generations_available, generations_used")
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
      setGenerationsAvailable((company as any).generations_available || 0);
      setGenerationsUsed((company as any).generations_used || 0);

      // Load responses
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
    return SECTIONS.some(section => {
      const original = responses[section.key]?.answer || "";
      const edited = editedData[section.key] || "";
      return original !== edited;
    });
  };

  const getChangedSections = () => {
    return SECTIONS.filter(section => {
      const original = responses[section.key]?.answer || "";
      const edited = editedData[section.key] || "";
      return original !== edited;
    });
  };

  const handleSaveAndRegenerate = async () => {
    // Check if user has generation credits
    if (generationsAvailable <= 0) {
      toast({ 
        title: "No Generation Credits", 
        description: "Purchase additional generation credits to regenerate your memo.",
        variant: "destructive" 
      });
      return;
    }

    setSaving(true);
    try {
      const changedSections = getChangedSections();
      
      // Save all changed sections
      for (const section of changedSections) {
        const answer = editedData[section.key]?.trim() || "";
        const existing = responses[section.key];

        if (existing) {
          await supabase
            .from("memo_responses")
            .update({ answer, updated_at: new Date().toISOString(), source: "manual" })
            .eq("id", existing.id);
        } else if (answer) {
          await supabase
            .from("memo_responses")
            .insert({
              company_id: companyId,
              question_key: section.key,
              answer,
              source: "manual"
            });
        }
      }

      // Decrement generation credit
      await supabase
        .from("companies")
        .update({ 
          generations_available: generationsAvailable - 1,
          generations_used: generationsUsed + 1
        })
        .eq("id", companyId);

      toast({
        title: "Changes Saved",
        description: `${changedSections.length} section(s) updated. Regenerating memo...`
      });

      // Navigate to regenerate
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const changedCount = getChangedSections().length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
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
              Review your answers below. Make any improvements, then regenerate your memo with updated context.
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
          <Card className={`border-2 ${generationsAvailable > 0 ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'}`}>
            <CardContent className="py-4 flex items-center justify-between gap-4">
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
            </CardContent>
          </Card>

          {/* Tip Card */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-4 flex gap-3">
              <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Pro Tip</p>
                <p className="text-sm text-muted-foreground">
                  Adding more specific metrics, customer quotes, or recent milestones will help generate a stronger memo.
                </p>
              </div>
            </CardContent>
          </Card>

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
                      <CardContent className="pt-2 space-y-3">
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
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-6 flex items-center justify-between gap-4 bg-background/95 backdrop-blur-sm p-4 rounded-lg border shadow-lg">
            <div className="text-sm text-muted-foreground">
              {changedCount > 0 ? (
                <span className="text-primary font-medium">{changedCount} section(s) modified</span>
              ) : (
                "No changes made"
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/hub")}>
                Cancel
              </Button>
              {generationsAvailable > 0 ? (
                <Button
                  onClick={handleSaveAndRegenerate}
                  disabled={saving}
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
                      {hasChanges() ? "Save & Regenerate" : "Regenerate Memo"}
                    </>
                  )}
                </Button>
              ) : (
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
                      Buy Credit to Regenerate - €8.99
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
