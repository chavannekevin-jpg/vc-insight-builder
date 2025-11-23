import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { 
  AlertCircle,
  Lightbulb, 
  TrendingUp, 
  Users, 
  Rocket,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Circle,
  Target,
  Zap,
  Award,
  DollarSign,
  BarChart3,
  Sparkles
} from "lucide-react";

const questionSections = {
  "🎯 Problem": {
    icon: AlertCircle,
    color: "text-red-500",
    questions: [
      { 
        key: "problem_description", 
        question: "Describe the problem", 
        placeholder: "What's the pain point your customers face? Make it real, make it hurt." 
      },
      { 
        key: "problem_workflow", 
        question: "What is the main process, task, or workflow your product improves, replaces, or simplifies?", 
        placeholder: "Walk us through the broken workflow. How does it work today vs. how it should work?" 
      },
    ]
  },
  "💡 Solution": {
    icon: Lightbulb,
    color: "text-yellow-500",
    questions: [
      { 
        key: "solution_description", 
        question: "Description of your product/service", 
        placeholder: "What have you built? Get specific about what it does." 
      },
      { 
        key: "solution_features", 
        question: "Describe the key features and brief explanations of how they work / why they matter", 
        placeholder: "Break down 3-5 core features. What makes each one powerful?" 
      },
      { 
        key: "solution_social_proof", 
        question: "Social proof (early adoption, pilot results, churn, testimonials, metrics)", 
        placeholder: "Show us the love. Who's using it? What results have you seen?" 
      },
    ]
  },
  "🎪 Market": {
    icon: Target,
    color: "text-blue-500",
    questions: [
      { 
        key: "market_target_customer", 
        question: "Who is your target customer?", 
        placeholder: "Get specific. Company size, industry, geography. Paint the picture." 
      },
      { 
        key: "market_buying_persona", 
        question: "Who is your buying persona?", 
        placeholder: "Who signs the check? Title, priorities, pain points." 
      },
      { 
        key: "market_current_acv", 
        question: "What is your current pricing ideally ACV?", 
        placeholder: "What are you charging today? Be transparent." 
      },
      { 
        key: "market_projected_acv", 
        question: "What is your projected ACV?", 
        placeholder: "Where do you see pricing going as you scale?" 
      },
    ]
  },
  "⚔️ Competition": {
    icon: Zap,
    color: "text-purple-500",
    questions: [
      { 
        key: "competition_mission", 
        question: "What is your company mission / product / core value proposition?", 
        placeholder: "Why do you exist? What's your North Star?" 
      },
      { 
        key: "competition_competitors", 
        question: "List the competitors you know", 
        placeholder: "Who else is in the ring? Direct and indirect." 
      },
      { 
        key: "competition_strength", 
        question: "What do you think your strength is facing your competition?", 
        placeholder: "What's your unfair advantage? Why will you win?" 
      },
    ]
  },
  "🚀 Team": {
    icon: Users,
    color: "text-green-500",
    questions: [
      { 
        key: "team_size", 
        question: "Number of full-time employees / team structure", 
        placeholder: "How many people? How are you organized?" 
      },
      { 
        key: "team_functions", 
        question: "Key team functions / outsourced support", 
        placeholder: "Who does what? What's in-house vs. outsourced?" 
      },
      { 
        key: "team_founders", 
        question: "Founders (name, role, % ownership, background)", 
        placeholder: "Introduce the founding team. Why are they perfect for this?" 
      },
      { 
        key: "team_history", 
        question: "Prior collaboration or history among team members", 
        placeholder: "Have you worked together before? What's the chemistry?" 
      },
      { 
        key: "team_ownership", 
        question: "Total team/founder ownership (% FD)", 
        placeholder: "What % of the company does the team own fully diluted?" 
      },
    ]
  },
  "🏆 USP": {
    icon: Award,
    color: "text-orange-500",
    questions: [
      { 
        key: "usp_differentiators", 
        question: "Key differentiators you already have or want to emphasize (3–5 max)", 
        placeholder: "What makes you different? List your secret weapons." 
      },
      { 
        key: "usp_distribution", 
        question: "Distribution or network advantages", 
        placeholder: "Do you have special access? Partnerships? Network effects?" 
      },
      { 
        key: "usp_business_model", 
        question: "Business model advantages (e.g., revenue share, SaaS, upsell, capital-efficient)", 
        placeholder: "What's smart about how you make money?" 
      },
      { 
        key: "usp_compliance", 
        question: "Compliance / regulatory or local-market advantages (if relevant)", 
        placeholder: "Any regulatory moats? Local advantages?" 
      },
      { 
        key: "usp_data", 
        question: "Data or insights layer potential", 
        placeholder: "Do you collect unique data? Can it become a moat?" 
      },
      { 
        key: "usp_customer_rationale", 
        question: "Customer rationale (why clients pick you over competitors)", 
        placeholder: "From the customer's mouth—why do they choose you?" 
      },
    ]
  },
  "💰 Business Model": {
    icon: DollarSign,
    color: "text-emerald-500",
    questions: [
      { 
        key: "business_model_type", 
        question: "Business model type (SaaS / Marketplace / etc.)", 
        placeholder: "How does the business work? SaaS, marketplace, transaction-based?" 
      },
      { 
        key: "business_model_revenue", 
        question: "Revenue sources & pricing details", 
        placeholder: "Where does money come from? Break down revenue streams." 
      },
      { 
        key: "business_model_acv_growth", 
        question: "ACV range or growth potential", 
        placeholder: "What's the ACV range? How does it expand over time?" 
      },
      { 
        key: "business_model_gtm", 
        question: "GTM strategy (direct / partner / hybrid)", 
        placeholder: "How do you sell? Sales team, partners, self-serve?" 
      },
      { 
        key: "business_model_margins", 
        question: "Margins or cost drivers", 
        placeholder: "What are your gross margins? What drives costs?" 
      },
      { 
        key: "business_model_future", 
        question: "Future monetization ideas", 
        placeholder: "What other ways could you make money down the line?" 
      },
    ]
  },
  "📈 Traction": {
    icon: BarChart3,
    color: "text-pink-500",
    questions: [
      { 
        key: "traction_launch", 
        question: "Launch date and initial milestones", 
        placeholder: "When did you launch? What have you hit so far?" 
      },
      { 
        key: "traction_revenue", 
        question: "Current ARR / MRR and past values (for comparison)", 
        placeholder: "Show us the revenue trajectory. Where were you? Where are you now?" 
      },
      { 
        key: "traction_customers", 
        question: "Number of customers, users, or partners", 
        placeholder: "How many customers? How many users? Growing how fast?" 
      },
      { 
        key: "traction_key_customers", 
        question: "Key customer names or use cases", 
        placeholder: "Any notable customers? Compelling use cases?" 
      },
      { 
        key: "traction_efficiency", 
        question: "Efficiency metrics (CAC, retention, margins)", 
        placeholder: "What's your CAC? Retention rate? Unit economics looking good?" 
      },
      { 
        key: "traction_funding", 
        question: "Funding, investors, or advisors", 
        placeholder: "Who's backed you? Any notable angels or advisors?" 
      },
      { 
        key: "traction_milestones", 
        question: "Notable milestones (expansion, regulation, product releases)", 
        placeholder: "Any big wins? New markets? Product launches? Partnerships?" 
      },
    ]
  },
};

export default function Portal() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Flatten all questions into a single array with metadata
  const allQuestions = Object.entries(questionSections).flatMap(([sectionTitle, section]) => 
    section.questions.map(q => ({
      ...q,
      sectionTitle,
      sectionIcon: section.icon,
      sectionColor: section.color
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
    supabase.auth.getSession().then(({ data: { session } }) => {
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

      // Load company and responses from database
      loadCompanyData(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const loadCompanyData = async (userId: string) => {
    try {
      // Get company
      const { data: companies, error: companyError } = await supabase
        .from("companies")
        .select("id, name, stage")
        .eq("founder_id", userId)
        .single();

      if (companyError) throw companyError;

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

  const handleAnswerChange = async (questionKey: string, answer: string) => {
    const updatedResponses = { ...responses, [questionKey]: answer };
    setResponses(updatedResponses);

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
  const answeredQuestions = Object.keys(responses).filter(
    (key) => responses[key]?.trim()
  ).length;

  const progressPercentage = Math.round(
    (answeredQuestions / totalQuestions) * 100
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleNext = () => {
    if (currentStep < allQuestions.length - 1) {
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

  const currentQuestion = allQuestions[currentStep];
  const isLastQuestion = currentStep === allQuestions.length - 1;
  const currentAnswer = responses[currentQuestion?.key] || "";
  const hasAnswer = currentAnswer.trim().length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-lg animate-pulse">Loading your workspace...</div>
      </div>
    );
  }

  if (!session || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                🚀 Build Your Investment Memo
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {companyName} • {user.email}
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Logout
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-foreground">
                {progressPercentage === 100 ? '🎉 All Done!' : '⚡ Overall Progress'}
              </span>
              <span className="text-sm font-mono text-primary font-bold bg-primary/10 px-3 py-1 rounded-full">
                {answeredQuestions} / {totalQuestions}
              </span>
            </div>
            <div className="relative">
              <Progress 
                value={progressPercentage} 
                className="h-4 bg-muted shadow-inner"
              />
              {progressPercentage === 100 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white drop-shadow-lg">
                    READY TO LAUNCH! 🎊
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {progressPercentage === 100 
                ? "You're ready to generate your investment memo!"
                : `${progressPercentage}% complete - Keep going! 💪`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 md:p-8 min-h-[calc(100vh-12rem)]">
        {currentQuestion && (
          <div 
            key={currentStep}
            className={`transition-all duration-300 ${
              isAnimating ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'
            }`}
          >
            {/* Section Badge */}
            <div className="flex items-center gap-3 mb-8 animate-fade-in">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 shadow-lg ${
                hasAnswer 
                  ? 'bg-green-500/20 border-green-500/50' 
                  : 'bg-primary/10 border-primary/30'
              }`}>
                <currentQuestion.sectionIcon className={`w-6 h-6 ${hasAnswer ? 'text-green-500' : currentQuestion.sectionColor}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-muted-foreground">
                  {currentQuestion.sectionTitle}
                </p>
                <p className="text-xs text-muted-foreground">
                  Question {currentStep + 1} of {totalQuestions}
                </p>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-card border-2 border-border rounded-2xl shadow-2xl p-8 md:p-12 animate-scale-in">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  {hasAnswer ? (
                    <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0 mt-1 animate-scale-in" />
                  ) : (
                    <Sparkles className="w-8 h-8 text-primary flex-shrink-0 mt-1 animate-pulse" />
                  )}
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                      {currentQuestion.question}
                    </h2>
                  </div>
                </div>

                <Textarea
                  value={currentAnswer}
                  onChange={(e) => handleAnswerChange(currentQuestion.key, e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  className="min-h-[200px] md:min-h-[250px] text-base bg-background border-2 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all resize-none text-foreground"
                  autoFocus
                />

                {hasAnswer && (
                  <div className="flex items-center gap-2 text-green-500 text-sm font-medium animate-fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Looking good! ✨</span>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 gap-4">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </Button>

              <div className="flex gap-2">
                {allQuestions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setIsAnimating(true);
                      setTimeout(() => {
                        setCurrentStep(idx);
                        setIsAnimating(false);
                      }, 150);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentStep 
                        ? 'bg-primary w-8' 
                        : responses[allQuestions[idx].key]?.trim() 
                          ? 'bg-green-500' 
                          : 'bg-muted-foreground/30'
                    }`}
                    aria-label={`Go to question ${idx + 1}`}
                  />
                ))}
              </div>

              {isLastQuestion ? (
                <Button
                  onClick={() => {
                    if (progressPercentage === 100) {
                      toast({
                        title: "🎉 Ready to Generate!",
                        description: "All questions answered. Generating your investment memo...",
                      });
                    } else {
                      toast({
                        title: "Almost there!",
                        description: `Please answer all questions (${answeredQuestions}/${totalQuestions} complete)`,
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={progressPercentage < 100}
                  size="lg"
                  className="gap-2 gradient-primary shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  <Rocket className="w-5 h-5" />
                  Generate Memo
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="gap-2 gradient-primary shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Quick Jump Sections */}
            <div className="mt-12 p-6 bg-muted/30 rounded-xl border border-border">
              <p className="text-sm font-bold text-foreground mb-4">Jump to Section:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(questionSections).map(([sectionTitle, section]) => {
                  const sectionQuestions = allQuestions.filter(q => q.sectionTitle === sectionTitle);
                  const firstQuestionIndex = allQuestions.findIndex(q => q.sectionTitle === sectionTitle);
                  const sectionAnswered = sectionQuestions.filter(q => responses[q.key]?.trim()).length;
                  const sectionTotal = sectionQuestions.length;
                  const isComplete = sectionAnswered === sectionTotal;
                  
                  return (
                    <button
                      key={sectionTitle}
                      onClick={() => {
                        setIsAnimating(true);
                        setTimeout(() => {
                          setCurrentStep(firstQuestionIndex);
                          setIsAnimating(false);
                        }, 150);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 ${
                        isComplete
                          ? 'bg-green-500/20 text-green-500 border-2 border-green-500/30'
                          : currentQuestion.sectionTitle === sectionTitle
                            ? 'bg-primary/20 text-primary border-2 border-primary/30'
                            : 'bg-background text-muted-foreground border-2 border-border hover:border-primary/30'
                      }`}
                    >
                      {isComplete && '✓ '}
                      {sectionTitle}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
