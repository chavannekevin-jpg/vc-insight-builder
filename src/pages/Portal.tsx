import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  LogOut,
  Home
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
        question: "What painful problem do your customers face?", 
        placeholder: "Describe the frustration, inefficiency, or failure they experience today. Make it real, make it hurt." 
      },
      { 
        key: "problem_workflow",
        title: "Show Us The Broken System",
        tldr: "How do people struggle through this problem today?",
        icon: Target,
        question: "How do people currently handle this problem?", 
        placeholder: "Walk through the existing process or workaround. Explain what's broken about it." 
      },
      { 
        key: "problem_quantification",
        title: "The Cost of Pain",
        tldr: "Quantify the damage this problem causes",
        icon: DollarSign,
        question: "How much does this problem cost your customers?", 
        placeholder: "Estimate in time, money, errors, or missed revenue. Use real numbers if possible." 
      },
      { 
        key: "problem_urgency",
        title: "Why Now? Why This Matters",
        tldr: "What makes this problem urgent today",
        icon: Flame,
        question: "Why is this problem getting worse?", 
        placeholder: "Mention regulations, market shifts, technology changes, or trends making it more urgent." 
      },
    ]
  },
  "Solution": {
    icon: Lightbulb,
    color: "text-yellow-500",
    questions: [
      { 
        key: "solution_oneliner",
        title: "Your One-Liner",
        tldr: "The elevator pitch in one sentence",
        icon: Zap,
        question: "In one sentence, what does your product do and for whom?", 
        placeholder: "We help [who] do [what] by [how]. Keep it crisp." 
      },
      { 
        key: "solution_mechanism",
        title: "How It Actually Works",
        tldr: "The core technology or process",
        icon: Brain,
        question: "How does your solution actually work?", 
        placeholder: "Explain the core technology, process, or approach that makes it effective." 
      },
      { 
        key: "solution_features",
        title: "Your Key Features",
        tldr: "The 2-3 features that make magic happen",
        icon: Sparkles,
        question: "What are your 2-3 key features?", 
        placeholder: "For each, explain what it does and why it matters. Focus on value, not tech specs." 
      },
      { 
        key: "solution_roi",
        title: "Tangible Results",
        tldr: "What customers actually get",
        icon: TrendingUp,
        question: "What tangible results do customers get?", 
        placeholder: "Quantify: time saved, cost reduced, revenue gained, or risk avoided. Use real numbers." 
      },
      { 
        key: "solution_validation",
        title: "Proof It Works",
        tldr: "Evidence that validates your solution",
        icon: ThumbsUp,
        question: "What proof do you have that it works?", 
        placeholder: "Pilots, retention rates, testimonials, early revenues, or partnerships." 
      },
    ]
  },
  "Market": {
    icon: Target,
    color: "text-blue-500",
    questions: [
      { 
        key: "market_icp",
        title: "Your Ideal Customer Profile",
        tldr: "Define who you're selling to",
        icon: Users,
        question: "Who is your ideal customer?", 
        placeholder: "Define by industry, company size, geography, and specific characteristics." 
      },
      { 
        key: "market_buyer",
        title: "Who Signs The Check?",
        tldr: "The actual decision maker",
        icon: Crown,
        question: "Who makes the buying decision?", 
        placeholder: "Job title, their main priorities, and what pain they feel most." 
      },
      { 
        key: "market_size",
        title: "How Big Is This?",
        tldr: "Total addressable market",
        icon: BarChart3,
        question: "How big is your market?", 
        placeholder: "Estimate # of potential customers × your ACV. Show your math." 
      },
      { 
        key: "market_pricing",
        title: "Your Price Point",
        tldr: "Current and target pricing",
        icon: DollarSign,
        question: "What is your current and target pricing?", 
        placeholder: "Current ACV and where you expect it to grow as you add features or move upmarket." 
      },
      { 
        key: "market_path_to_scale",
        title: "Path to €100M ARR",
        tldr: "How you'll actually scale",
        icon: Rocket,
        question: "What's your path to €100M ARR?", 
        placeholder: "Who do you sell to first? What expansion levers exist? How does the market grow?" 
      },
    ]
  },
  "Competition": {
    icon: Zap,
    color: "text-purple-500",
    questions: [
      { 
        key: "competition_landscape",
        title: "The Battlefield",
        tldr: "Who you're competing against",
        icon: Shield,
        question: "Who are your competitors?", 
        placeholder: "List direct competitors, adjacent solutions, and incumbent players." 
      },
      { 
        key: "competition_strengths",
        title: "Where They're Strong",
        tldr: "What competitors do well",
        icon: Award,
        question: "What do your competitors do well?", 
        placeholder: "Be honest—where are they strong? What have they figured out?" 
      },
      { 
        key: "competition_weaknesses",
        title: "Where They Fail",
        tldr: "The gaps you exploit",
        icon: AlertCircle,
        question: "Where do competitors fall short?", 
        placeholder: "Gaps in their product, pricing, UX, speed, or market fit. What leaves customers frustrated?" 
      },
      { 
        key: "competition_advantage",
        title: "Why You'll Win",
        tldr: "Your unfair advantage",
        icon: Flame,
        question: "Why will you win?", 
        placeholder: "What's your unfair advantage over all of them? Why can't they copy you?" 
      },
    ]
  },
  "Team": {
    icon: Users,
    color: "text-green-500",
    questions: [
      { 
        key: "team_overview",
        title: "Your Army Structure",
        tldr: "How the team is organized",
        icon: Users,
        question: "How is your team structured?", 
        placeholder: "# of employees, key functions, in-house vs outsourced." 
      },
      { 
        key: "team_founders",
        title: "The Founding Squad",
        tldr: "Who started this and why they're perfect",
        icon: Crown,
        question: "Who are the founders?", 
        placeholder: "For each: Name, Role, Ownership %, and relevant background (1 sentence each)." 
      },
      { 
        key: "team_history",
        title: "Team Chemistry",
        tldr: "Prior collaboration and shared experience",
        icon: Heart,
        question: "Have you worked together before?", 
        placeholder: "Prior collaboration or shared experience that proves you can work together." 
      },
      { 
        key: "team_ownership",
        title: "Skin In The Game",
        tldr: "Total founder/team equity",
        icon: Award,
        question: "What is total founder/team ownership?", 
        placeholder: "Combined equity % fully diluted. How much skin in the game?" 
      },
      { 
        key: "team_gaps",
        title: "Missing Pieces",
        tldr: "Key hires you need next",
        icon: AlertCircle,
        question: "What key hires do you need next?", 
        placeholder: "Roles missing to reach your next growth stage. What functions need strengthening?" 
      },
    ]
  },
  "USP": {
    icon: Award,
    color: "text-orange-500",
    questions: [
      { 
        key: "usp_core",
        title: "Your Single Biggest Edge",
        tldr: "The one thing that sets you apart",
        icon: Star,
        question: "What is your single biggest differentiator?", 
        placeholder: "The one thing competitors can't easily copy. Your core unfair advantage." 
      },
      { 
        key: "usp_differentiators",
        title: "Other Key Advantages",
        tldr: "Secondary differentiators that matter",
        icon: Sparkles,
        question: "What are your other key advantages?", 
        placeholder: "List 3-5 across product, distribution, data, compliance, or business model." 
      },
      { 
        key: "usp_moat",
        title: "Your Defensive Moat",
        tldr: "What creates long-term defensibility",
        icon: Lock,
        question: "What creates defensibility?", 
        placeholder: "Network effects, data, integrations, regulatory barriers, or switching costs." 
      },
      { 
        key: "usp_customer_choice",
        title: "Why Customers Choose You",
        tldr: "The real reasons they switched",
        icon: ThumbsUp,
        question: "Why do customers choose you over alternatives?", 
        placeholder: "In their words. What do they say when they explain why they picked you?" 
      },
    ]
  },
  "Business Model": {
    icon: DollarSign,
    color: "text-emerald-500",
    questions: [
      { 
        key: "business_model_type",
        title: "How You Make Money",
        tldr: "Your core revenue model",
        icon: DollarSign,
        question: "What is your business model?", 
        placeholder: "SaaS, marketplace, usage-based, revenue share, hybrid, etc." 
      },
      { 
        key: "business_model_revenue",
        title: "Revenue Sources",
        tldr: "Where money comes from",
        icon: BarChart3,
        question: "What are your revenue sources?", 
        placeholder: "For each: how it works and why it matters. Break down the revenue streams." 
      },
      { 
        key: "business_model_expansion",
        title: "Customer Expansion Path",
        tldr: "How customers grow with you",
        icon: TrendingUp,
        question: "How do customers expand over time?", 
        placeholder: "Describe the typical journey from initial contract to full deployment." 
      },
      { 
        key: "business_model_gtm",
        title: "Go-To-Market Strategy",
        tldr: "How you acquire customers",
        icon: Target,
        question: "How do you sell?", 
        placeholder: "Direct sales, partnerships, self-serve, or hybrid approach. What's working?" 
      },
      { 
        key: "business_model_margins",
        title: "Unit Economics",
        tldr: "Margins and cost structure",
        icon: Sparkles,
        question: "What are your gross margins and cost drivers?", 
        placeholder: "Include what makes the model scalable. Where do costs go as you grow?" 
      },
    ]
  },
  "Traction": {
    icon: BarChart3,
    color: "text-pink-500",
    questions: [
      { 
        key: "traction_timeline",
        title: "Your Journey So Far",
        tldr: "Key milestones to date",
        icon: Rocket,
        question: "What are your key milestones?", 
        placeholder: "Launch date, pivots, product releases, market expansions. Tell the story." 
      },
      { 
        key: "traction_revenue_progression",
        title: "Revenue Growth Story",
        tldr: "Show the momentum with dates",
        icon: DollarSign,
        question: "Show your revenue growth.", 
        placeholder: "ARR/MRR at different points in time (e.g., Jan: €50K → June: €150K → Now: €300K)." 
      },
      { 
        key: "traction_customers",
        title: "Customer Base Size",
        tldr: "How many people you're serving",
        icon: Users,
        question: "How many customers/users do you have?", 
        placeholder: "Include growth rate and geographies. What does the trend look like?" 
      },
      { 
        key: "traction_key_customers",
        title: "Notable Customer Logos",
        tldr: "The names that matter",
        icon: Star,
        question: "Name your most notable customers.", 
        placeholder: "Logos or case studies that validate your product. Who's singing your praises?" 
      },
      { 
        key: "traction_efficiency",
        title: "Efficiency Metrics",
        tldr: "Unit economics that prove it works",
        icon: BarChart3,
        question: "What are your efficiency metrics?", 
        placeholder: "CAC, retention rate, gross margins, or other unit economics. Show the model works." 
      },
      { 
        key: "traction_pipeline",
        title: "Sales Pipeline",
        tldr: "What's coming next",
        icon: Trophy,
        question: "What does your sales pipeline look like?", 
        placeholder: "Qualified opportunities and estimated value. What deals are in motion?" 
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
  const [isAdminViewing, setIsAdminViewing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

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

      // Load company and responses from database
      loadCompanyData(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast, searchParams]);

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
    // Don't save if admin is viewing
    if (isAdminViewing) {
      return;
    }
    
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

          <div className="flex gap-2">
            <button
              onClick={() => navigate('/hub')}
              className="flex-1 text-white/60 hover:text-white hover:brightness-125 transition-all duration-300 cursor-pointer font-semibold text-sm flex items-center justify-center gap-2 py-2"
            >
              <Home className="w-4 h-4" />
              Hub
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 text-white/60 hover:text-white hover:brightness-125 transition-all duration-300 cursor-pointer font-semibold text-sm flex items-center justify-center gap-2 py-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
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
              {isAdminViewing && (
                <Button
                  onClick={() => navigate('/admin')}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10"
                >
                  ← Back to Admin
                </Button>
              )}
              <FounderScoreDisplay score={founderScore} className="text-white" />
              <button
                onClick={() => navigate('/hub')}
                className="text-white/90 hover:text-white hover:brightness-125 transition-all duration-300 cursor-pointer font-semibold text-sm flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Hub
              </button>
              <button
                onClick={handleLogout}
                className="text-white/90 hover:text-white hover:brightness-125 transition-all duration-300 cursor-pointer font-semibold text-sm flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Admin Viewing Banner */}
          {isAdminViewing && (
            <div className="mt-4 bg-yellow-500/20 border border-yellow-500/40 rounded-lg p-3 flex items-center gap-2">
              <Eye className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-yellow-200 font-medium">
                Viewing as Admin - Read Only Mode
              </span>
            </div>
          )}

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
                  autoFocus={!isAdminViewing}
                  disabled={isAdminViewing}
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
                !isAdminViewing && (
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
                            title: "Questionnaire Complete! 🎉",
                            description: "Now choose your plan to get your VC memo.",
                          });
                          
                          // Navigate to checkout page
                          navigate("/checkout");
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
                    Choose Your Plan →
                  </Button>
                </div>
                )
              ) : (
                !isAdminViewing && (
                  <Button
                  onClick={handleNext}
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 border-0 text-white shadow-[0_0_30px_rgba(236,72,153,0.5)] hover:shadow-[0_0_40px_rgba(236,72,153,0.7)] hover:scale-105 transition-all"
                >
                  {hasAnswer ? "Next" : "Skip"}
                  <ChevronRight className="w-5 h-5" />
                </Button>
                )
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
      </div>
    </div>
  );
}
