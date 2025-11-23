import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { 
  Building2, 
  Lightbulb, 
  TrendingUp, 
  Users, 
  Rocket,
  ChevronRight,
  CheckCircle2,
  Circle
} from "lucide-react";

const questionSections = {
  "Company Basics & Problem": {
    icon: Building2,
    questions: [
      { key: "company_name", question: "What is your company name?", placeholder: "Enter your company name" },
      { key: "problem", question: "What problem are you solving?", placeholder: "Describe the core problem your target customers face..." },
      { key: "target_customer", question: "Who is your target customer?", placeholder: "Define your ideal customer profile (company size, industry, role, pain points)..." },
      { key: "why_now", question: "Why now? What has changed in the market?", placeholder: "Market timing, trends, regulatory changes, or technology shifts that make this the right time..." },
    ]
  },
  "Solution & Product": {
    icon: Lightbulb,
    questions: [
      { key: "solution", question: "Describe your solution", placeholder: "How does your product/service solve the problem? What does it do?" },
      { key: "product_status", question: "What is your current product status?", placeholder: "Development stage: MVP, Beta, Live, Scaling... Include key features." },
      { key: "unique_value", question: "What makes your solution unique?", placeholder: "Your competitive advantage, moat, or defensibility..." },
      { key: "tech_stack", question: "Key technology or IP", placeholder: "Proprietary tech, patents, unique data, or technical advantages..." },
    ]
  },
  "Business Model & Market": {
    icon: TrendingUp,
    questions: [
      { key: "business_model", question: "How do you make money?", placeholder: "Revenue model: SaaS, marketplace, transaction fees, licensing..." },
      { key: "pricing", question: "What is your pricing strategy?", placeholder: "Price points, tiers, average deal size, contract length..." },
      { key: "market_size", question: "What is your addressable market size?", placeholder: "TAM, SAM, SOM with sources. Be specific about your wedge market..." },
      { key: "competition", question: "Who are your main competitors?", placeholder: "Direct and indirect competitors. How do you differentiate?" },
      { key: "unit_economics", question: "What are your unit economics?", placeholder: "CAC, LTV, LTV:CAC ratio, gross margins, payback period..." },
    ]
  },
  "Traction & Team": {
    icon: Users,
    questions: [
      { key: "traction", question: "What traction do you have?", placeholder: "Revenue, users, growth rate, key metrics, partnerships, LOIs..." },
      { key: "team", question: "Tell us about your founding team", placeholder: "Founders' backgrounds, relevant experience, why you're uniquely positioned to win..." },
      { key: "advisors", question: "Do you have advisors or key hires?", placeholder: "Strategic advisors, board members, or critical team members..." },
      { key: "customers", question: "Key customers or case studies", placeholder: "Notable customers, use cases, or testimonials that validate your solution..." },
    ]
  },
  "Financials & Vision": {
    icon: Rocket,
    questions: [
      { key: "funding", question: "How much are you raising?", placeholder: "Target raise amount and current round stage..." },
      { key: "use_of_funds", question: "How will you use the funds?", placeholder: "Allocation: product, sales, team, marketing... Be specific." },
      { key: "previous_funding", question: "Previous funding raised", placeholder: "Angels, pre-seed, seed... with amounts and investors if any..." },
      { key: "vision", question: "What is your 5-year vision?", placeholder: "Where will the company be in 5 years? Revenue, scale, market position..." },
      { key: "risks", question: "What are the key risks?", placeholder: "Market, execution, competitive, regulatory risks and how you'll mitigate them..." },
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
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary">
                Build Your Investment Memo
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
              <span className="text-sm font-semibold text-foreground">
                Overall Progress
              </span>
              <span className="text-sm font-mono text-primary font-bold">
                {answeredQuestions} / {totalQuestions}
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-3 bg-muted shadow-inner"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {progressPercentage}% complete
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

          return (
            <div
              key={sectionTitle}
              className="bg-card border-2 border-border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in"
              style={{
                boxShadow: isOpen ? '0 0 20px rgba(236, 72, 153, 0.2)' : undefined
              }}
            >
              {/* Section Header */}
              <button
                onClick={() =>
                  setSelectedSection(isOpen ? null : sectionTitle)
                }
                className="w-full p-6 flex items-center justify-between hover:bg-accent/30 transition-all group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border-2 border-primary/30 group-hover:scale-110 transition-transform shadow-md">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {sectionTitle}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {isComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        {sectionAnswered} / {sectionTotal} completed
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight 
                  className={`w-6 h-6 text-muted-foreground transition-transform duration-300 ${
                    isOpen ? 'rotate-90' : ''
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
                        className="space-y-3 animate-fade-in"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex items-start gap-3">
                          {hasAnswer ? (
                            <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-1" />
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
                          className="min-h-[120px] bg-background border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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
            <Button
              size="lg"
              disabled={progressPercentage < 100}
              className="text-lg px-12 py-6 gradient-primary shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Generate Investment Memo
            </Button>
            {progressPercentage < 100 && (
              <p className="text-sm text-muted-foreground">
                Complete all sections to generate your memo
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
