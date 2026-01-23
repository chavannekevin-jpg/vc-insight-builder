import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { 
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Circle,
  PartyPopper,
  Eye,
  LogOut,
  Home
} from "lucide-react";
import { FounderScoreDisplay } from "@/components/FounderScoreDisplay";
import { LevelCard } from "@/components/LevelCard";
import { resolveIcon } from "@/lib/iconResolver";
import { AIInsightCard } from "@/components/AIInsightCard";
import { AnswerOptimizerWizard } from "@/components/AnswerOptimizerWizard";
import { WelcomeDisclaimer } from "@/components/WelcomeDisclaimer";
import { MemoLoadingScreen } from "@/components/MemoLoadingScreen";

// Dynamic interfaces for database-driven questions
interface Section {
  id: string;
  name: string;
  display_title: string;
  icon: string;
  color: string;
  sort_order: number;
}

interface Question {
  id: string;
  section_id: string;
  question_key: string;
  title: string;
  tldr: string | null;
  question: string;
  placeholder: string | null;
  icon: string;
  sort_order: number;
}

export default function Portal() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [founderScore, setFounderScore] = useState(0);
  const [showNeonFlash, setShowNeonFlash] = useState(false);
  const [memoSubmitted, setMemoSubmitted] = useState(false);
  const [isAdminViewing, setIsAdminViewing] = useState(false);
  const [showAIInsight, setShowAIInsight] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isGeneratingMemo, setIsGeneratingMemo] = useState(false);
  
  // Dynamic data from database
  const [sections, setSections] = useState<Section[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Build questions grouped by section dynamically
  const questionsBySections = sections.map(section => ({
    section,
    questions: questions.filter(q => q.section_id === section.id)
  })).filter(group => group.questions.length > 0);

  const allQuestions = questionsBySections.flatMap(group =>
    group.questions.map(q => ({
      ...q,
      sectionTitle: group.section.name,
      sectionData: group.section
    }))
  );

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session and load data
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session?.user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to access the portal.",
          variant: "destructive",
        });
        navigate("/auth?redirect=/portal");
        setLoading(false);
        return;
      }

      // Fetch sections and questions from database
      const { data: sectionsData } = await supabase
        .from("questionnaire_sections")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      const { data: questionsData } = await supabase
        .from("questionnaire_questions")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (sectionsData) setSections(sectionsData);
      if (questionsData) setQuestions(questionsData);

      // Check if viewing as admin
      const viewCompanyId = searchParams.get('viewCompanyId');
      
      if (viewCompanyId) {
        // Check if user is admin
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (roleData) {
          setIsAdminViewing(true);
          loadCompanyDataById(viewCompanyId);
          return;
        }
      }

      // Check if pre-triggered generation from 100% discount flow
      const generatingParam = searchParams.get('generating');
      const jobIdParam = searchParams.get('jobId');
      
      if (generatingParam === 'true' && jobIdParam) {
        console.log("Portal: Detected pre-triggered generation, starting poll for job:", jobIdParam);
        setIsGeneratingMemo(true);
        // Load company data first, then start polling
        await loadCompanyData(session.user.id);
        pollJobUntilComplete(jobIdParam);
        return;
      }

      // Load company and responses from database
      loadCompanyData(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast, searchParams]);


  const loadCompanyData = async (userId: string) => {
    try {
      // Get company - get most recent if multiple exist
      const { data: companiesArray, error: companyError } = await supabase
        .from("companies")
        .select("id, name, stage")
        .eq("founder_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (companyError) throw companyError;

      // If no company exists, keep companyId null and show creation UI
      if (!companiesArray || companiesArray.length === 0) {
        setLoading(false);
        return;
      }

      const companies = companiesArray[0];
      setCompanyId(companies.id);
      setCompanyName(companies.name);

      // Load existing responses
      const { data: existingResponses, error: responsesError } = await supabase
        .from("memo_responses")
        .select("question_key, answer")
        .eq("company_id", companies.id);

      if (responsesError) throw responsesError;

      const responsesMap: Record<string, string> = {};
      existingResponses?.forEach((r) => {
        if (r.answer) {
          responsesMap[r.question_key] = r.answer;
        }
      });

      setResponses(responsesMap);
    } catch (error: any) {
      console.error("Error loading company data:", error);
      toast({
        title: "Error",
        description: "Could not load your company data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyDataById = async (companyId: string) => {
    try {
      // Get company by ID (admin view)
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("id, name, stage")
        .eq("id", companyId)
        .maybeSingle();

      if (companyError) throw companyError;

      if (!company) {
        toast({
          title: "Company Not Found",
          description: "Could not find the requested company",
          variant: "destructive",
        });
        navigate("/admin");
        return;
      }

      setCompanyId(company.id);
      setCompanyName(company.name);

      // Load existing responses
      const { data: existingResponses, error: responsesError } = await supabase
        .from("memo_responses")
        .select("question_key, answer")
        .eq("company_id", company.id);

      if (responsesError) throw responsesError;

      const responsesMap: Record<string, string> = {};
      existingResponses?.forEach((r) => {
        if (r.answer) {
          responsesMap[r.question_key] = r.answer;
        }
      });

      setResponses(responsesMap);
    } catch (error: any) {
      console.error("Error loading company data:", error);
      toast({
        title: "Error",
        description: "Could not load company data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleAnswerChange = async (questionKey: string, answer: string) => {
    // Don't save if admin is viewing
    if (isAdminViewing) {
      return;
    }
    
    const updatedResponses = { ...responses, [questionKey]: answer };
    setResponses(updatedResponses);

    // Show AI insights for specific questions
    if (questionKey === 'target_customer' && answer.trim().length > 100) {
      setShowAIInsight('target_customer');
    } else if (questionKey === 'competitive_moat' && answer.trim().length > 100) {
      setShowAIInsight('competitive_moat');
    }

    const currentQuestion = allQuestions[currentStep];
    // Check if section is completed
    const currentSectionQuestions = allQuestions.filter(q => q.sectionTitle === currentQuestion.sectionTitle);
    const sectionAnswered = currentSectionQuestions.filter(q => 
      (q.question_key === questionKey ? answer.trim() : responses[q.question_key]?.trim())
    ).length;
    
    if (sectionAnswered === currentSectionQuestions.length && !completedSections.has(currentQuestion.sectionTitle)) {
      setCompletedSections(new Set(completedSections).add(currentQuestion.sectionTitle));
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
      toast({
        title: `${currentQuestion.sectionTitle} Complete`,
        description: "Section saved. Moving to next.",
      });
    }

    if (!companyId) return;

    try {
      // Save to database
      await supabase
        .from("memo_responses")
        .upsert({
          company_id: companyId,
          question_key: questionKey,
          answer: answer,
        }, {
          onConflict: "company_id,question_key",
        });
    } catch (error: any) {
      console.error("Error saving response:", error);
      toast({
        title: "Save Error",
        description: "Could not save your response",
        variant: "destructive",
      });
    }
  };

  const totalQuestions = allQuestions.length;
  // Only count answers for current questions (ignore old/deleted questions)
  const currentQuestionKeys = allQuestions.map(q => q.question_key);
  const answeredQuestions = Object.keys(responses).filter(
    (key) => currentQuestionKeys.includes(key) && responses[key]?.trim()
  ).length;

  const progressPercentage = Math.round(
    (answeredQuestions / totalQuestions) * 100
  );

  // Calculate Founder Score
  useEffect(() => {
    const completionScore = (answeredQuestions / totalQuestions) * 60;
    const qualityBonus = calculateQualityBonus();
    const newScore = Math.round(completionScore + qualityBonus);
    setFounderScore(newScore);
  }, [responses, totalQuestions, answeredQuestions, progressPercentage]);

  const calculateQualityBonus = () => {
    let bonus = 0;
    Object.entries(responses).forEach(([key, answer]) => {
      if (!answer || answer.trim().length === 0) return;
      
      const wordCount = answer.trim().split(/\s+/).length;
      if (wordCount < 20) bonus += 0; // Too short
      else if (wordCount < 50) bonus += 0.5; // Minimal
      else if (wordCount < 100) bonus += 0.8; // Good
      else bonus += 1.1; // Excellent
    });
    return Math.min(bonus, 40); // Cap at 40 points
  };

  // Show welcome disclaimer for new users or when coming from deck import
  useEffect(() => {
    if (!loading && companyId && allQuestions.length > 0) {
      const welcomeKey = `portal_welcomed_${companyId}`;
      const hasSeenWelcome = localStorage.getItem(welcomeKey);
      const fromDeckImport = searchParams.get('fromDeck') === 'true';
      
      // Show welcome if never seen, or if coming from deck import
      if (!hasSeenWelcome || fromDeckImport) {
        setShowWelcome(true);
        // Clear the URL param without triggering navigation
        if (fromDeckImport) {
          window.history.replaceState({}, '', '/portal');
        }
      }
    }
  }, [loading, companyId, allQuestions.length, searchParams]);

  const handleWelcomeComplete = () => {
    if (companyId) {
      localStorage.setItem(`portal_welcomed_${companyId}`, 'true');
    }
    setShowWelcome(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleNext = () => {
    if (currentStep < allQuestions.length - 1) {
      // Trigger neon flash
      setShowNeonFlash(true);
      setTimeout(() => setShowNeonFlash(false), 200);
      
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handleGenerateMemo = async () => {
    if (!companyId || !user) return;
    
    setIsGeneratingMemo(true);
    setMemoSubmitted(true);
    
    try {
      console.log("Portal: Starting memo generation...");
      
      // Invoke the edge function to start memo generation
      const { data: startData, error: startError } = await supabase.functions.invoke('generate-full-memo', {
        body: { companyId, force: false }
      });

      if (startError) {
        console.error("Portal: Edge function error:", startError);
        throw new Error(
          startError.message === "Not Found" || startError.status === 404
            ? "Memo generation service is currently unavailable. Please try again in a moment."
            : startError.message || "Failed to start memo generation"
        );
      }

      if (!startData?.jobId) {
        throw new Error("No job ID returned from generation");
      }

      const jobId = startData.jobId;
      console.log(`Portal: Memo generation job started: ${jobId}`);

      // Poll for job completion
      await pollJobUntilComplete(jobId);
      
    } catch (error: any) {
      console.error("Portal: Error generating memo:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to generate memo.",
        variant: "destructive"
      });
      setIsGeneratingMemo(false);
    }
  };

  const pollJobUntilComplete = useCallback(async (jobId: string) => {
    const maxAttempts = 120; // 10 minutes max
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const { data: job, error } = await supabase
          .from("memo_generation_jobs")
          .select("status, error_message, company_id")
          .eq("id", jobId)
          .maybeSingle();

        if (error) {
          console.error("Portal: Error polling job:", error);
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }

        if (job?.status === "completed") {
          console.log("Portal: Job marked completed, checking full dashboard readiness...");
          
          // Import the readiness checker
          const { checkDashboardReadiness } = await import("@/lib/dashboardReadiness");
          
          // CRITICAL: Wait for FULL dashboard readiness, not just structured_content
          // This ensures all 8 section scores + vcQuickTake are written before redirect
          const targetCompanyId = job.company_id || companyId;
          let dashboardReady = false;
          let readinessCheckAttempts = 0;
          const maxReadinessChecks = 40; // Up to ~2 minutes for all tools to write
          
          while (!dashboardReady && readinessCheckAttempts < maxReadinessChecks) {
            const readiness = await checkDashboardReadiness(targetCompanyId);
            
            console.log(`Portal: Readiness check ${readinessCheckAttempts + 1}/${maxReadinessChecks}:`, {
              isReady: readiness.isReady,
              sectionScores: `${readiness.sectionScoreCount}/8`,
              missingSections: readiness.missingSections,
              hasVcQuickTake: readiness.hasVcQuickTake,
              hasMemoContent: readiness.hasMemoContent
            });
            
            if (readiness.isReady) {
              console.log("Portal: Dashboard fully ready, redirecting...");
              dashboardReady = true;
              handleMemoReady();
              return;
            }
            
            readinessCheckAttempts++;
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
          
          // If still not ready after all checks, redirect anyway (Hub will handle gracefully with its own polling)
          console.log("Portal: Dashboard readiness timeout after max attempts, redirecting to Hub...");
          handleMemoReady();
          return;
        }

        if (job?.status === "failed") {
          throw new Error(job.error_message || "Memo generation failed");
        }

        // Still processing, wait and try again
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error("Portal: Polling error:", error);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // Timeout - redirect to Hub which will handle gracefully
    console.log("Portal: Polling timeout, redirecting to Hub...");
    handleMemoReady();
  }, [companyId]);

  const handleMemoReady = async () => {
    console.log("Portal: Memo ready, invalidating all caches for hub refresh...");
    setIsGeneratingMemo(false);
    
    // Invalidate ALL relevant caches to ensure hub shows paid version with full data
    // Company caches (both by userId and by companyId patterns)
    await queryClient.invalidateQueries({ queryKey: ["company"] });
    await queryClient.invalidateQueries({ queryKey: ["company", "byId", companyId] });
    
    // Payment/premium status
    await queryClient.invalidateQueries({ queryKey: ["payment", companyId] });
    await queryClient.invalidateQueries({ queryKey: ["payment"] });
    
    // Memo and content data
    await queryClient.invalidateQueries({ queryKey: ["memo", companyId] });
    await queryClient.invalidateQueries({ queryKey: ["memo"] });
    await queryClient.invalidateQueries({ queryKey: ["memo-content", companyId] });
    
    // Dashboard data (section tools, VC quick take)
    await queryClient.invalidateQueries({ queryKey: ["vc-quick-take", companyId] });
    await queryClient.invalidateQueries({ queryKey: ["sectionTools", companyId] });
    await queryClient.invalidateQueries({ queryKey: ["dashboard-responses", companyId] });
    
    console.log("Portal: All caches invalidated, navigating to hub...");
    navigate(`/hub?companyId=${companyId}`, { state: { freshPurchase: true } });
  };

  const handleCheckStatus = async () => {
    // Manual check - just navigate to hub which will show results if ready
    navigate(`/hub?companyId=${companyId}`);
  };

  const currentQuestion = allQuestions[currentStep];

  // Show loading screen while generating memo
  if (isGeneratingMemo) {
    return (
      <MemoLoadingScreen 
        analyzing={false}
        companyId={companyId || undefined}
        onMemoReady={handleMemoReady}
        onCheckStatus={handleCheckStatus}
      />
    );
  }

  if (loading || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground animate-pulse">Loading your workspace...</p>
      </div>
    );
  }

  const QuestionIcon = resolveIcon(currentQuestion.icon);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Welcome Disclaimer for new users */}
      <WelcomeDisclaimer open={showWelcome} onComplete={handleWelcomeComplete} />
      
      {showNeonFlash && (
        <div className="fixed inset-0 bg-primary/20 pointer-events-none z-50 animate-pulse" />
      )}
      
      {showCelebration && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <PartyPopper className="w-32 h-32 text-primary animate-bounce" />
        </div>
      )}

      {/* Admin Viewing Banner */}
      {isAdminViewing && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/30 p-3 text-center">
          <div className="flex items-center justify-center gap-2 text-yellow-600 dark:text-yellow-400">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">Viewing as Admin - Changes will not be saved</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate("/hub")}
                variant="ghost"
                size="sm"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <h1 className="text-xl font-bold text-primary">{companyName || "My Startup"}</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <FounderScoreDisplay score={founderScore} />
              <Button onClick={handleLogout} variant="ghost" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progress: {answeredQuestions}/{totalQuestions} questions</span>
              <span>{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Section Progress */}
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Section: {currentQuestion?.sectionTitle || "Getting Started"}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content - Centered Single Column */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Section indicator */}
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground">
              {currentQuestion?.sectionTitle || "Getting Started"}
            </p>
          </div>

          <div className={`transition-all duration-200 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              <LevelCard
                levelNumber={currentStep + 1}
                totalLevels={totalQuestions}
                title={currentQuestion.title}
                tldr={currentQuestion.tldr || "Complete this question to progress"}
                icon={QuestionIcon}
              >
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {currentQuestion.question}
                    </label>
                    <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/60"></span>
                      The more detailed and thorough your answer, the higher quality your memo will be
                    </p>
                    <Textarea
                      value={responses[currentQuestion.question_key] || ""}
                      onChange={(e) => handleAnswerChange(currentQuestion.question_key, e.target.value)}
                      placeholder={currentQuestion.placeholder || "Type your answer here..."}
                      className="min-h-[200px] text-base resize-none"
                      disabled={isAdminViewing}
                    />
                    
                    {/* Answer Quality Optimizer with AI Co-Pilot */}
                    {!isAdminViewing && companyId && (
                      <AnswerOptimizerWizard
                        answer={responses[currentQuestion.question_key] || ""}
                        questionKey={currentQuestion.question_key}
                        companyId={companyId}
                        allResponses={responses}
                        onSuggestionApply={(addition) => {
                          const currentAnswer = responses[currentQuestion.question_key] || "";
                          handleAnswerChange(currentQuestion.question_key, currentAnswer + addition);
                        }}
                        onNavigateToField={(field) => {
                          // Find the question index for this field and navigate to it
                          const targetIndex = allQuestions.findIndex(q => q.question_key === field);
                          if (targetIndex >= 0) {
                            setIsAnimating(true);
                            setTimeout(() => {
                              setCurrentStep(targetIndex);
                              setIsAnimating(false);
                            }, 150);
                          }
                        }}
                      />
                    )}
                  </div>

                  {/* AI Insights */}
                  {showAIInsight === 'target_customer' && currentQuestion.question_key === 'target_customer' && (
                    <AIInsightCard 
                      title="🤖 AI Market Analysis"
                      insights={[
                        "We'll automatically estimate your TAM based on this customer profile",
                        "Our AI will identify key market timing drivers (\"Why Now?\")",
                        "You'll see detailed buyer persona analysis in your memo"
                      ]}
                    />
                  )}
                  
                  {(showAIInsight === 'competitive_moat' && currentQuestion.question_key === 'competitive_moat') && (
                    <AIInsightCard 
                      title="🤖 AI Competitive Analysis"
                      insights={[
                        "We'll analyze your defensibility and identify specific moats",
                        "Our AI will assess barriers to entry and sustainability",
                        "You'll get a comprehensive competitive positioning analysis"
                      ]}
                    />
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-border/30">
                  <Button
                    onClick={handlePrevious}
                    variant="outline"
                    disabled={currentStep === 0}
                    className="hover:border-primary/50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    {allQuestions.map((_, idx) => (
                      idx === currentStep ? (
                        <CheckCircle2 key={idx} className="w-4 h-4 text-neon-pink animate-pulse" />
                      ) : responses[allQuestions[idx].question_key]?.trim() ? (
                        <CheckCircle2 key={idx} className="w-4 h-4 text-primary/50" />
                      ) : (
                        <Circle key={idx} className="w-4 h-4 text-muted-foreground/30" />
                      )
                    ))}
                  </div>

                  <div className="flex gap-2">
                    {currentStep < allQuestions.length - 1 && (
                      <Button
                        onClick={() => {
                          setIsAnimating(true);
                          setTimeout(() => {
                            setCurrentStep(allQuestions.length - 1);
                            setIsAnimating(false);
                          }, 150);
                        }}
                        variant="ghost"
                        className="text-muted-foreground hover:text-primary"
                      >
                        Skip to Build
                      </Button>
                    )}
                    
                    {currentStep < allQuestions.length - 1 ? (
                      <Button 
                        onClick={handleNext}
                        className="bg-gradient-to-r from-neon-pink to-neon-purple hover:opacity-90 transition-opacity"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleGenerateMemo}
                        disabled={progressPercentage < 60 || isAdminViewing}
                        className="bg-gradient-to-r from-neon-pink to-neon-purple hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        Build Analysis
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </LevelCard>
            </div>
        </div>
      </main>
    </div>
  );
}
