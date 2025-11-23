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
  CheckCircle2,
  Circle,
  Target,
  Zap,
  Award,
  DollarSign,
  BarChart3
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
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const totalQuestions = Object.values(questionSections).flat().reduce((acc, section) => acc + section.questions.length, 0);
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
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4">
        {Object.entries(questionSections).map(([sectionTitle, section]) => {
          const Icon = section.icon;
          const sectionAnswered = section.questions.filter((q) =>
            responses[q.key]?.trim()
          ).length;
          const sectionTotal = section.questions.length;
          const isComplete = sectionAnswered === sectionTotal;
          const isOpen = selectedSection === sectionTitle;
          const sectionProgress = Math.round((sectionAnswered / sectionTotal) * 100);

          return (
            <div
              key={sectionTitle}
              className={`bg-card border-2 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 animate-fade-in ${
                isComplete 
                  ? 'border-green-500/50 bg-gradient-to-r from-green-500/5 to-transparent' 
                  : isOpen 
                    ? 'border-primary/50 shadow-glow' 
                    : 'border-border'
              }`}
            >
              {/* Section Header */}
              <button
                onClick={() =>
                  setSelectedSection(isOpen ? null : sectionTitle)
                }
                className="w-full p-6 flex items-center justify-between hover:bg-accent/30 transition-all group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 group-hover:scale-110 transition-transform shadow-lg ${
                    isComplete 
                      ? 'bg-green-500/20 border-green-500/50' 
                      : 'bg-primary/10 border-primary/30'
                  }`}>
                    <Icon className={`w-7 h-7 ${isComplete ? 'text-green-500' : section.color}`} />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {sectionTitle}
                    </h3>
                    <div className="flex items-center gap-3 mt-2">
                      {isComplete ? (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-5 h-5 text-green-500 animate-scale-in" />
                          <span className="text-sm font-bold text-green-500">
                            Completed! 🎉
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-primary">
                              {sectionAnswered} / {sectionTotal}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              questions
                            </span>
                          </div>
                          <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-pink-500 transition-all duration-500"
                              style={{ width: `${sectionProgress}%` }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight 
                  className={`w-6 h-6 transition-all duration-300 ${
                    isOpen 
                      ? 'rotate-90 text-primary' 
                      : 'text-muted-foreground'
                  }`}
                />
              </button>

              {/* Section Content */}
              {isOpen && (
                <div className="border-t-2 border-border bg-muted/20 p-6 space-y-6 animate-accordion-down">
                  {section.questions.map((q, idx) => {
                    const hasAnswer = responses[q.key]?.trim();
                    return (
                      <div 
                        key={q.key} 
                        className={`space-y-3 p-4 rounded-lg transition-all animate-fade-in ${
                          hasAnswer 
                            ? 'bg-green-500/5 border-2 border-green-500/20' 
                            : 'bg-background/50 border-2 border-dashed border-muted'
                        }`}
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex items-start gap-3">
                          {hasAnswer ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-1 animate-scale-in" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                          )}
                          <label className="block text-sm font-bold text-foreground flex-1">
                            {q.question}
                          </label>
                        </div>
                        <Textarea
                          value={responses[q.key] || ""}
                          onChange={(e) =>
                            handleAnswerChange(q.key, e.target.value)
                          }
                          placeholder={q.placeholder}
                          className="min-h-[120px] bg-background border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Generate Button */}
        <div className="pt-8 pb-12 text-center">
          <div className="inline-block space-y-4">
            {progressPercentage === 100 ? (
              <div className="space-y-4 animate-scale-in">
                <div className="text-4xl animate-bounce">🎉</div>
                <Button
                  size="lg"
                  className="text-xl px-16 py-8 gradient-primary shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                >
                  <Rocket className="w-6 h-6 mr-3" />
                  Generate My Investment Memo
                </Button>
                <p className="text-sm text-green-500 font-bold">
                  ✨ All questions answered! Let's create something amazing.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Button
                  size="lg"
                  disabled
                  className="text-lg px-12 py-6 opacity-50 cursor-not-allowed"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Generate Investment Memo
                </Button>
                <p className="text-sm text-muted-foreground">
                  📝 Answer all {totalQuestions} questions to unlock your memo
                </p>
                <p className="text-xs text-muted-foreground">
                  {totalQuestions - answeredQuestions} questions remaining
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
