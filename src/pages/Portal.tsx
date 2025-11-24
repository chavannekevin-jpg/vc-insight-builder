import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
  Flame,
  Star,
  PartyPopper,
  TrendingUp as TrendingUpIcon,
  Eye,
  Shield,
  Crown,
  ThumbsUp,
  Network,
  Lock,
  Database,
  Trophy,
  Heart,
  Brain,
  LogOut
} from "lucide-react";
import { SectionBadge } from "@/components/SectionBadge";
import { FounderScoreDisplay } from "@/components/FounderScoreDisplay";
import { LevelCard } from "@/components/LevelCard";

const questionSections = {
  "Problem": {
    icon: AlertCircle,
    color: "text-red-500",
    questions: [
      { 
        key: "problem_description",
        title: "What Makes People Suffer?",
        tldr: "Define the pain point that keeps your customers up at night",
        icon: AlertCircle,
        question: "Describe the problem", 
        placeholder: "What's the pain point your customers face? Make it real, make it hurt." 
      },
      { 
        key: "problem_workflow",
        title: "Show Us The Broken System",
        tldr: "How do people struggle through this problem today?",
        icon: Target,
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
        title: "Your Weapon of Choice",
        tldr: "The solution that changes the game",
        icon: Zap,
        question: "Description of your product/service", 
        placeholder: "What have you built? Get specific about what it does." 
      },
      { 
        key: "solution_features",
        title: "Unlock Your Arsenal",
        tldr: "Key features that make magic happen",
        icon: Sparkles,
        question: "Describe the key features and brief explanations of how they work / why they matter", 
        placeholder: "Break down 3-5 core features. What makes each one powerful?" 
      },
      { 
        key: "solution_social_proof",
        title: "Show Me You Have Believers",
        tldr: "Who's already singing your praises?",
        icon: ThumbsUp,
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
        title: "Who's Paying The Bills?",
        tldr: "Your ideal customer in crystal clear detail",
        icon: Users,
        question: "Who is your target customer?", 
        placeholder: "Get specific. Company size, industry, geography. Paint the picture." 
      },
      { 
        key: "market_buying_persona",
        title: "The Money Person",
        tldr: "Who actually signs the checks?",
        icon: Crown,
        question: "Who is your buying persona?", 
        placeholder: "Who signs the check? Title, priorities, pain points." 
      },
      { 
        key: "market_current_acv",
        title: "Your Price Tag Today",
        tldr: "What customers pay you right now",
        icon: DollarSign,
        question: "What is your current pricing ideally ACV?", 
        placeholder: "What are you charging today? Be transparent." 
      },
      { 
        key: "market_projected_acv",
        title: "Your Future Price Tag",
        tldr: "Where the money's heading",
        icon: TrendingUp,
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
        title: "Your Battle Cry",
        tldr: "Why you exist beyond making money",
        icon: Heart,
        question: "What is your company mission / product / core value proposition?", 
        placeholder: "Why do you exist? What's your North Star?" 
      },
      { 
        key: "competition_competitors",
        title: "Name Your Enemies",
        tldr: "Who you're fighting against",
        icon: Shield,
        question: "List the competitors you know", 
        placeholder: "Who else is in the ring? Direct and indirect." 
      },
      { 
        key: "competition_strength",
        title: "Your Secret Weapon",
        tldr: "Why you'll win this fight",
        icon: Flame,
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
        title: "Headcount Power",
        tldr: "Size of your army",
        icon: Users,
        question: "Number of full-time employees / team structure", 
        placeholder: "How many people? How are you organized?" 
      },
      { 
        key: "team_functions",
        title: "Who's In Your Elite Squad?",
        tldr: "What roles cover your bases",
        icon: Award,
        question: "Key team functions / outsourced support", 
        placeholder: "Who does what? What's in-house vs. outsourced?" 
      },
      { 
        key: "team_founders",
        title: "Meet The Founding Legends",
        tldr: "The people who started this",
        icon: Crown,
        question: "Founders (name, role, % ownership, background)", 
        placeholder: "Introduce the founding team. Why are they perfect for this?" 
      },
      { 
        key: "team_history",
        title: "Team Chemistry Check",
        tldr: "How long you've been rolling together",
        icon: Heart,
        question: "Prior collaboration or history among team members", 
        placeholder: "Have you worked together before? What's the chemistry?" 
      },
      { 
        key: "team_ownership",
        title: "Skin In The Game",
        tldr: "Who owns what",
        icon: Award,
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
        title: "Your Unfair Advantages",
        tldr: "What others can't copy",
        icon: Star,
        question: "Key differentiators you already have or want to emphasize (3–5 max)", 
        placeholder: "What makes you different? List your secret weapons." 
      },
      { 
        key: "usp_distribution",
        title: "Network Effect Unlocked?",
        tldr: "How you reach and keep customers",
        icon: Network,
        question: "Distribution or network advantages", 
        placeholder: "Do you have special access? Partnerships? Network effects?" 
      },
      { 
        key: "usp_business_model",
        title: "The Money Machine Design",
        tldr: "How you capture value differently",
        icon: Zap,
        question: "Business model advantages (e.g., revenue share, SaaS, upsell, capital-efficient)", 
        placeholder: "What's smart about how you make money?" 
      },
      { 
        key: "usp_compliance",
        title: "Your Regulatory Moat",
        tldr: "Barriers that protect you",
        icon: Lock,
        question: "Compliance / regulatory or local-market advantages (if relevant)", 
        placeholder: "Any regulatory moats? Local advantages?" 
      },
      { 
        key: "usp_data",
        title: "Data Gold Mine?",
        tldr: "Proprietary data that gives you power",
        icon: Database,
        question: "Data or insights layer potential", 
        placeholder: "Do you collect unique data? Can it become a moat?" 
      },
      { 
        key: "usp_customer_rationale",
        title: "Why Customers Choose You",
        tldr: "The real reasons they switched",
        icon: ThumbsUp,
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
        title: "How You Print Money",
        tldr: "Your revenue model explained",
        icon: DollarSign,
        question: "Business model type (SaaS / Marketplace / etc.)", 
        placeholder: "How does the business work? SaaS, marketplace, transaction-based?" 
      },
      { 
        key: "business_model_revenue",
        title: "Revenue Breakdown",
        tldr: "Where the money comes from",
        icon: BarChart3,
        question: "Revenue sources & pricing details", 
        placeholder: "Where does money come from? Break down revenue streams." 
      },
      { 
        key: "business_model_acv_growth",
        title: "Growth Trajectory",
        tldr: "How fast you're scaling",
        icon: TrendingUp,
        question: "ACV range or growth potential", 
        placeholder: "What's the ACV range? How does it expand over time?" 
      },
      { 
        key: "business_model_gtm",
        title: "Sales War Room Strategy",
        tldr: "How you capture market share",
        icon: Target,
        question: "GTM strategy (direct / partner / hybrid)", 
        placeholder: "How do you sell? Sales team, partners, self-serve?" 
      },
      { 
        key: "business_model_margins",
        title: "Margin Magic",
        tldr: "The unit economics that matter",
        icon: Sparkles,
        question: "Margins or cost drivers", 
        placeholder: "What are your gross margins? What drives costs?" 
      },
      { 
        key: "business_model_future",
        title: "Future Money Moves",
        tldr: "New ways to monetize",
        icon: Rocket,
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
        title: "Launch & First Wins",
        tldr: "When you first entered the arena",
        icon: Rocket,
        question: "Launch date and initial milestones", 
        placeholder: "When did you launch? What have you hit so far?" 
      },
      { 
        key: "traction_revenue",
        title: "Show Me You Have Momentum",
        tldr: "Revenue numbers that speak volumes",
        icon: DollarSign,
        question: "Current ARR / MRR and past values (for comparison)", 
        placeholder: "Show us the revenue trajectory. Where were you? Where are you now?" 
      },
      { 
        key: "traction_customers",
        title: "Army Size",
        tldr: "How many are in your customer base",
        icon: Users,
        question: "Number of customers, users, or partners", 
        placeholder: "How many customers? How many users? Growing how fast?" 
      },
      { 
        key: "traction_key_customers",
        title: "Name Drop Your Stars",
        tldr: "The logos that matter",
        icon: Star,
        question: "Key customer names or use cases", 
        placeholder: "Any notable customers? Compelling use cases?" 
      },
      { 
        key: "traction_efficiency",
        title: "Unit Economics Flex",
        tldr: "Proof your model works",
        icon: BarChart3,
        question: "Efficiency metrics (CAC, retention, margins)", 
        placeholder: "What's your CAC? Retention rate? Unit economics looking good?" 
      },
      { 
        key: "traction_funding",
        title: "Who Believes In You?",
        tldr: "The investors who backed you",
        icon: Trophy,
        question: "Funding, investors, or advisors", 
        placeholder: "Who's backed you? Any notable angels or advisors?" 
      },
      { 
        key: "traction_milestones",
        title: "Major Victory Lap",
        tldr: "Wins that prove you're for real",
        icon: Crown,
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
  const [microFeedback, setMicroFeedback] = useState<string>("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [isFetchingFeedback, setIsFetchingFeedback] = useState(false);
  const [feedbackTimeoutId, setFeedbackTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [founderScore, setFounderScore] = useState(0);
  const [showNeonFlash, setShowNeonFlash] = useState(false);
  const [memoSubmitted, setMemoSubmitted] = useState(false);
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

  // Load AI feedback for current question when responses are loaded or question changes
  useEffect(() => {
    if (!loading && currentQuestion && responses[currentQuestion.key]) {
      const existingAnswer = responses[currentQuestion.key];
      if (existingAnswer.trim().length > 0) {
        fetchAIFeedback(currentQuestion.key, currentQuestion.question, existingAnswer);
      }
    }
  }, [currentStep, loading]);

  const loadCompanyData = async (userId: string) => {
    try {
      // Get company
      const { data: companies, error: companyError } = await supabase
        .from("companies")
        .select("id, name, stage")
        .eq("founder_id", userId)
        .maybeSingle();

      if (companyError) throw companyError;

      // If no company exists, keep companyId null and show creation UI
      if (!companies) {
        setLoading(false);
        return;
      }

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

  // Fetch AI VC coach feedback
  const fetchAIFeedback = async (questionKey: string, question: string, answer: string) => {
    if (!answer || answer.trim().length === 0) {
      setMicroFeedback("");
      return;
    }

    setIsFetchingFeedback(true);
    try {
      const { data, error } = await supabase.functions.invoke('vc-coach-feedback', {
        body: { question, answer, questionKey }
      });

      if (error) throw error;
      
      if (data?.feedback) {
        setMicroFeedback(data.feedback);
      }
    } catch (error: any) {
      console.error("Error fetching AI feedback:", error);
      // Fallback to simple feedback
      const length = answer.trim().length;
      if (length < 100) {
        setMicroFeedback("Keep going... investors need more detail here.");
      } else {
        setMicroFeedback("Good start. Can you add more specifics?");
      }
    } finally {
      setIsFetchingFeedback(false);
    }
  };

  const handleAnswerChange = async (questionKey: string, answer: string) => {
    const updatedResponses = { ...responses, [questionKey]: answer };
    setResponses(updatedResponses);

    // Clear previous timeout
    if (feedbackTimeoutId) {
      clearTimeout(feedbackTimeoutId);
    }

    // Debounce AI feedback call
    const timeoutId = setTimeout(() => {
      const question = allQuestions.find(q => q.key === questionKey)?.question || "";
      fetchAIFeedback(questionKey, question, answer);
    }, 1500);
    
    setFeedbackTimeoutId(timeoutId);

    // Check if section is completed
    const currentSectionQuestions = allQuestions.filter(q => q.sectionTitle === currentQuestion.sectionTitle);
    const sectionAnswered = currentSectionQuestions.filter(q => 
      (q.key === questionKey ? answer.trim() : responses[q.key]?.trim())
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
  const answeredQuestions = Object.keys(responses).filter(
    (key) => responses[key]?.trim()
  ).length;

  const progressPercentage = Math.round(
    (answeredQuestions / totalQuestions) * 100
  );

  // Calculate Founder Score
  useEffect(() => {
    const completionScore = (answeredQuestions / totalQuestions) * 60;
    const qualityBonus = calculateQualityBonus();
    setFounderScore(Math.round(completionScore + qualityBonus));
  }, [responses]);

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
      setMicroFeedback("");
      setIsFetchingFeedback(false);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
        // Fetch AI feedback for existing answer
        const nextQ = allQuestions[currentStep + 1];
        const existingAnswer = responses[nextQ.key];
        if (existingAnswer && existingAnswer.trim().length > 0) {
          fetchAIFeedback(nextQ.key, nextQ.question, existingAnswer);
        }
      }, 150);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setMicroFeedback("");
      setIsFetchingFeedback(false);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
        // Fetch AI feedback for existing answer
        const prevQ = allQuestions[currentStep - 1];
        const existingAnswer = responses[prevQ.key];
        if (existingAnswer && existingAnswer.trim().length > 0) {
          fetchAIFeedback(prevQ.key, prevQ.question, existingAnswer);
        }
      }, 150);
    }
  };

  const currentQuestion = allQuestions[currentStep];
  const isLastQuestion = currentStep === allQuestions.length - 1;
  const currentAnswer = responses[currentQuestion?.key] || "";
  const hasAnswer = currentAnswer.trim().length > 0;
  
  // Get next section for curiosity hook
  const nextQuestion = currentStep < allQuestions.length - 1 ? allQuestions[currentStep + 1] : null;
  const isChangingSection = nextQuestion && nextQuestion.sectionTitle !== currentQuestion?.sectionTitle;

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

  // Show company creation UI if no company exists
  if (!companyId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <Flame className="w-16 h-16 text-pink-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-white mb-2">Create Your Company Profile</h2>
            <p className="text-white/70 text-sm">Let's get started with your investment memo</p>
          </div>
          
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const name = formData.get('companyName') as string;
            const stage = formData.get('stage') as string;
            
            if (!name || !stage) {
              toast({
                title: "Missing information",
                description: "Please fill in all fields",
                variant: "destructive",
              });
              return;
            }

            try {
              const { data, error } = await supabase
                .from("companies")
                .insert({
                  name,
                  founder_id: user.id,
                  stage,
                })
                .select()
                .single();

              if (error) throw error;

              setCompanyId(data.id);
              setCompanyName(data.name);
              
              toast({
                title: "Company Created! 🎉",
                description: "Let's build your investment memo",
              });
            } catch (error: any) {
              console.error("Error creating company:", error);
              toast({
                title: "Error",
                description: error.message || "Could not create company",
                variant: "destructive",
              });
            }
          }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Company Name
                </label>
                <Input
                  name="companyName"
                  placeholder="Your amazing startup"
                  className="bg-black/40 border-white/20 text-white placeholder:text-white/40"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Stage
                </label>
                <select
                  name="stage"
                  className="w-full px-3 py-2 bg-black/40 border-2 border-white/20 rounded-lg text-white focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/20 transition-all"
                  required
                >
                  <option value="idea">Idea</option>
                  <option value="mvp">MVP</option>
                  <option value="early">Early Stage</option>
                  <option value="growth">Growth</option>
                </select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-6 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white shadow-[0_0_30px_rgba(236,72,153,0.5)] hover:shadow-[0_0_40px_rgba(236,72,153,0.7)] hover:scale-105 transition-all"
            >
              Create Company
            </Button>
          </form>

          <button
            onClick={handleLogout}
            className="w-full mt-4 text-white/60 hover:text-white hover:brightness-125 transition-all duration-300 cursor-pointer font-semibold text-sm flex items-center justify-center gap-2 py-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Neon Flash Effect */}
      {showNeonFlash && (
        <div className="fixed inset-0 bg-neon-pink/20 pointer-events-none animate-pulse z-50" />
      )}

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
            <div className="relative flex-1">
              <h1 className="text-2xl md:text-3xl font-serif font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(236,72,153,0.5)] flex items-center gap-3">
                <Flame className="w-8 h-8 text-pink-500 animate-pulse drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
                Build Your Memo
              </h1>
              <p className="text-sm text-white/60 mt-1">
                Level {currentStep + 1} of {totalQuestions} • {companyName}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <FounderScoreDisplay score={founderScore} className="text-white" />
              <button
                onClick={handleLogout}
                className="text-white/90 hover:text-white hover:brightness-125 transition-all duration-300 cursor-pointer font-semibold text-sm flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
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
                : progressPercentage >= 75
                  ? "Almost complete"
                  : progressPercentage >= 50
                    ? "Halfway through"
                    : progressPercentage >= 25
                      ? "Good progress"
                      : `${progressPercentage}% complete`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 md:p-8 min-h-[calc(100vh-12rem)] relative">
        {/* Section Completion Celebration */}
        {showCelebration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none animate-fade-in">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl animate-scale-in">
              <div className="flex items-center gap-3 text-white">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
                <div>
                  <h3 className="text-xl font-semibold">Section Complete</h3>
                  <p className="text-sm text-white/70">Moving to next section</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
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
            <LevelCard
              levelNumber={currentStep + 1}
              title={currentQuestion.title}
              tldr={currentQuestion.tldr}
              icon={currentQuestion.icon}
            >
              <div className="space-y-6">
                <Textarea
                  value={currentAnswer}
                  onChange={(e) => handleAnswerChange(currentQuestion.key, e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  className="min-h-[200px] md:min-h-[250px] text-base bg-black/40 border-2 border-white/20 focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/20 transition-all resize-none text-white placeholder:text-white/40 backdrop-blur-sm shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]"
                  autoFocus
                />

                {/* AI VC Coach Feedback */}
                {isFetchingFeedback && (
                  <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium animate-fade-in">
                    <Brain className="w-4 h-4 animate-pulse" />
                    <span className="drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">AI Coach analyzing...</span>
                  </div>
                )}
                
                {!isFetchingFeedback && microFeedback && (
                  <div className="flex items-start gap-3 text-blue-400 text-sm bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <Brain className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{microFeedback}</span>
                  </div>
                )}

                {hasAnswer && !microFeedback && !isFetchingFeedback && (
                  <div className="flex items-center gap-2 text-green-400 text-sm font-medium animate-fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="drop-shadow-[0_0_8px_rgba(74,222,128,0.6)]">Saved</span>
                  </div>
                )}
              </div>
            </LevelCard>

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
                      setMicroFeedback("");
                      setIsFetchingFeedback(false);
                      setTimeout(() => {
                        setCurrentStep(idx);
                        setIsAnimating(false);
                        // Fetch AI feedback for existing answer
                        const targetQ = allQuestions[idx];
                        const existingAnswer = responses[targetQ.key];
                        if (existingAnswer && existingAnswer.trim().length > 0) {
                          fetchAIFeedback(targetQ.key, targetQ.question, existingAnswer);
                        }
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
                <div className="flex flex-col items-end gap-4">
                  <div className="text-right">
                    <p className="text-white/90 mb-2">
                      Your Founder Score: <span className={`text-2xl font-bold ${
                        founderScore >= 86 ? "text-neon-pink" :
                        founderScore >= 71 ? "text-green-400" :
                        founderScore >= 41 ? "text-yellow-400" : "text-red-400"
                      }`}>{founderScore}</span>
                    </p>
                    <p className="text-sm text-white/60 italic">
                      {founderScore >= 96 ? "🔥 LEGENDARY. Go raise that money!" :
                       founderScore >= 86 ? "Impressive. Top 10% territory." :
                       founderScore >= 71 ? "Strong! You've got a real shot here." :
                       founderScore >= 51 ? "Solid. VCs won't slam the door on you." :
                       "Needs work. But you finished!"}
                    </p>
                  </div>
                  <Button
                    onClick={async () => {
                      if (progressPercentage === 100) {
                        try {
                          // Create memo record
                          const { error } = await supabase
                            .from("memos")
                            .insert({
                              company_id: companyId,
                              status: "submitted",
                              content: null,
                            });

                          if (error) throw error;

                          toast({
                            title: "Memo Submitted! 🎉",
                            description: "Your memo is getting ready. Let's see what VCs have to say about you.",
                          });
                          
                          setMemoSubmitted(true);
                        } catch (error: any) {
                          console.error("Error creating memo:", error);
                          toast({
                            title: "Error",
                            description: "Could not submit memo. Your answers are still saved.",
                            variant: "destructive",
                          });
                        }
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
                    Generate My VC-Ready Memo
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 border-0 text-white shadow-[0_0_30px_rgba(236,72,153,0.5)] hover:shadow-[0_0_40px_rgba(236,72,153,0.7)] hover:scale-105 transition-all"
                >
                  {hasAnswer ? "Next" : "Skip"}
                  <ChevronRight className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Curiosity Hook - Show when changing sections */}
            {isChangingSection && hasAnswer && (
              <div className="mt-6 p-6 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 border-2 border-purple-500/30 rounded-2xl backdrop-blur-sm animate-fade-in">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Eye className="w-8 h-8 text-purple-400 animate-pulse drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                      Coming Up Next: {nextQuestion?.sectionTitle}
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                    </h3>
                    <p className="text-white/80 text-sm">
                      {nextQuestion?.sectionTitle === "Market" && "Dive into your target market and pricing strategy..."}
                      {nextQuestion?.sectionTitle === "Competition" && "Show us why you'll dominate the competition..."}
                      {nextQuestion?.sectionTitle === "Team" && "Introduce the dream team behind your vision..."}
                      {nextQuestion?.sectionTitle === "USP" && "Reveal your secret weapons and unique advantages..."}
                      {nextQuestion?.sectionTitle === "Business Model" && "Break down how you'll make money and scale..."}
                      {nextQuestion?.sectionTitle === "Traction" && "Show the traction that proves you're onto something big..."}
                    </p>
                  </div>
                </div>
              </div>
            )}

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
        
        {/* Premium Upgrade Section - Show after memo submission */}
        {memoSubmitted && (
          <div className="mt-12 space-y-8 animate-fade-in">
            <div className="text-center space-y-4 mb-8">
              <PartyPopper className="w-16 h-16 mx-auto text-pink-500 animate-pulse drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]" />
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">
                Want Your Memo Faster + Investor Network Access?
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Skip the wait and get your memo delivered within one week. Or get the VIP treatment with direct introductions to Kevin's investor network.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Express Service - €159.99 */}
              <div className="bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-8 space-y-6 hover:border-purple-500/50 transition-all">
                <div>
                  <h3 className="text-2xl font-serif font-bold text-white mb-2">Express Service</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold text-purple-400">€159.99</span>
                  </div>
                </div>
                
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">Expert-crafted memo delivered within one week</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">Personally reviewed by Kevin during early access</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">Full automation coming soon—get priority access now</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">Company profile shared to Kevin's VC network (optional)</span>
                  </li>
                </ul>

                <Button 
                  onClick={() => navigate("/auth?plan=Express Service&price=€159.99")}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 border-0 shadow-[0_0_30px_rgba(168,85,247,0.5)]"
                  size="lg"
                >
                  Fast Track to Clarity →
                </Button>
              </div>

              {/* VIP Package - €399 */}
              <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 backdrop-blur-sm border-2 border-pink-500/50 rounded-2xl p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <Crown className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]" />
                </div>
                
                <div>
                  <div className="inline-block bg-pink-500/20 text-pink-400 text-xs font-bold px-3 py-1 rounded-full border border-pink-500/30 mb-3">
                    MOST EXCLUSIVE
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-white mb-2">VIP Package</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold text-pink-400">€399</span>
                  </div>
                </div>
                
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">Express memo delivered within one week</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">Memo pushed to Kevin's network of 100+ global investors</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">Direct introductions from Kevin to VCs/investors if they show interest</span>
                  </li>
                </ul>

                <Button 
                  onClick={() => navigate("/auth?plan=VIP Package&price=€399")}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 border-0 shadow-[0_0_30px_rgba(236,72,153,0.5)]"
                  size="lg"
                >
                  Get VIP Access →
                </Button>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-white/50">
                Your €29.99 memo will be ready when the platform launches. These upgrades give you immediate access + more.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
