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
  Sparkles,
  Flame
} from "lucide-react";
import { SectionBadge } from "@/components/SectionBadge";

const questionSections = {
  "Problem": {
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
  "Solution": {
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
  "Market": {
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
  "Competition": {
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
  "Team": {
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
  "USP": {
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
  "Business Model": {
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
  "Traction": {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-50 shadow-[0_0_50px_rgba(236,72,153,0.3)]">
        <div className="max-w-4xl mx-auto p-4 md:p-6 relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative">
              <h1 className="text-2xl md:text-3xl font-serif font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(236,72,153,0.5)] flex items-center gap-3">
                <Flame className="w-8 h-8 text-pink-500 animate-pulse drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
                Build Your Memo
              </h1>
              <p className="text-sm text-white/60 mt-1">
                {companyName} • {user.email}
              </p>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              size="sm"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm"
            >
              Logout
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-white/90">
                {progressPercentage === 100 ? 'Complete' : 'Progress'}
              </span>
              <span className="text-sm font-mono text-pink-400 font-bold bg-pink-500/20 px-3 py-1 rounded-full border border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                {answeredQuestions} / {totalQuestions}
              </span>
            </div>
            <div className="relative h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/20">
              <div 
                className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 transition-all duration-500 shadow-[0_0_20px_rgba(236,72,153,0.6)]"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
              </div>
            </div>
            <p className="text-xs text-white/50 mt-2">
              {progressPercentage === 100 
                ? "Ready to generate your memo"
                : `${progressPercentage}% complete`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 md:p-8 min-h-[calc(100vh-12rem)] relative">
        {currentQuestion && (
          <div 
            key={currentStep}
            className={`transition-all duration-300 ${
              isAnimating ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'
            }`}
          >
            {/* Section Badge */}
            <div className="flex items-center gap-4 mb-8 animate-fade-in">
              <SectionBadge 
                icon={currentQuestion.sectionIcon}
                title={currentQuestion.sectionTitle}
                isComplete={hasAnswer}
              />
              <div>
                <p className="text-base font-bold text-white/90">
                  {currentQuestion.sectionTitle}
                </p>
                <p className="text-xs text-white/50">
                  Question {currentStep + 1} of {totalQuestions}
                </p>
              </div>
            </div>

            {/* Question Card */}
            <div className="relative group">
              {/* Card glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
              
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 rounded-3xl shadow-2xl p-8 md:p-12 backdrop-blur-xl animate-scale-in">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    {hasAnswer ? (
                      <CheckCircle2 className="w-10 h-10 text-green-400 flex-shrink-0 mt-1 animate-scale-in drop-shadow-[0_0_10px_rgba(74,222,128,0.6)]" />
                    ) : (
                      <Sparkles className="w-10 h-10 text-pink-400 flex-shrink-0 mt-1 animate-pulse drop-shadow-[0_0_10px_rgba(236,72,153,0.6)]" />
                    )}
                    <div className="flex-1">
                      <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                        {currentQuestion.question}
                      </h2>
                    </div>
                  </div>

                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => handleAnswerChange(currentQuestion.key, e.target.value)}
                    placeholder={currentQuestion.placeholder}
                    className="min-h-[200px] md:min-h-[250px] text-base bg-black/40 border-2 border-white/20 focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/20 transition-all resize-none text-white placeholder:text-white/40 backdrop-blur-sm shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]"
                    autoFocus
                  />

                  {hasAnswer && (
                    <div className="flex items-center gap-2 text-green-400 text-sm font-medium animate-fade-in">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="drop-shadow-[0_0_8px_rgba(74,222,128,0.6)]">Locked in</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 gap-4">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                variant="outline"
                size="lg"
                className="gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm disabled:opacity-30"
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
                    className={`h-2 rounded-full transition-all ${
                      idx === currentStep 
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 w-8 shadow-[0_0_10px_rgba(236,72,153,0.6)]' 
                        : responses[allQuestions[idx].key]?.trim() 
                          ? 'bg-green-500 w-2 shadow-[0_0_8px_rgba(74,222,128,0.4)]' 
                          : 'bg-white/20 w-2'
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
                        title: "Ready to Generate!",
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
                  className="gap-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 border-0 text-white shadow-[0_0_30px_rgba(236,72,153,0.5)] hover:shadow-[0_0_40px_rgba(236,72,153,0.7)] hover:scale-105 transition-all disabled:opacity-30 disabled:hover:scale-100"
                >
                  <Rocket className="w-5 h-5" />
                  Generate
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 border-0 text-white shadow-[0_0_30px_rgba(236,72,153,0.5)] hover:shadow-[0_0_40px_rgba(236,72,153,0.7)] hover:scale-105 transition-all"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Quick Jump Sections */}
            <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <p className="text-sm font-bold text-white/90 mb-4">Jump to Section:</p>
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
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 ${
                        isComplete
                          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-2 border-green-500/30 shadow-[0_0_15px_rgba(74,222,128,0.3)]'
                          : currentQuestion.sectionTitle === sectionTitle
                            ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 border-2 border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                            : 'bg-white/5 text-white/60 border-2 border-white/10 hover:border-white/30'
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
