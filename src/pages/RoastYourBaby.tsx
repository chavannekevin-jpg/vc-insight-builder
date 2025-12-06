import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/sections/Footer";
import { RoastEntryScreen } from "@/components/roast/RoastEntryScreen";
import { RoastGameLoop } from "@/components/roast/RoastGameLoop";
import { RoastResults } from "@/components/roast/RoastResults";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lock, AlertCircle, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type GameState = 'loading' | 'access-denied' | 'entry' | 'playing' | 'results';

interface Question {
  id: number;
  question: string;
  category: string;
  difficulty: string;
  context?: string;
}

interface AnswerResult {
  question: string;
  answer: string;
  score: number;
  baseScore: number;
  category: string;
  roast: string;
  hint: string;
  speedBonus: boolean;
  timeElapsed: number;
}

export default function RoastYourBaby() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>('loading');
  const [accessError, setAccessError] = useState<string>("");
  const [company, setCompany] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [companyContext, setCompanyContext] = useState<string>("");
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [verdict, setVerdict] = useState<any>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isLoadingVerdict, setIsLoadingVerdict] = useState(false);

  useEffect(() => {
    // Set up auth state listener to properly wait for session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          // Defer the access check to avoid Supabase deadlock
          setTimeout(() => {
            checkAccessWithUser(session.user);
          }, 0);
        } else if (event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
          if (!session) {
            setAccessError("Please sign in to play Roast Your Baby.");
            setGameState('access-denied');
          }
        }
      }
    );

    // Also check current session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkAccessWithUser(session.user);
      } else {
        setAccessError("Please sign in to play Roast Your Baby.");
        setGameState('access-denied');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAccessWithUser = async (user: any) => {
    try {
      // Fetch user's company
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .eq('founder_id', user.id)
        .limit(1);

      if (companiesError) throw companiesError;

      if (!companies || companies.length === 0) {
        setAccessError("You need to create a company profile first.");
        setGameState('access-denied');
        return;
      }

      const userCompany = companies[0];
      setCompany(userCompany);

      // Check premium status
      if (!userCompany.has_premium) {
        setAccessError("Roast Your Baby is a premium feature. Generate your memo to unlock it!");
        setGameState('access-denied');
        return;
      }

      // Check if they have enough data
      const { data: responses, error: responsesError } = await supabase
        .from('memo_responses')
        .select('question_key, answer')
        .eq('company_id', userCompany.id);

      if (responsesError) throw responsesError;

      const filledResponses = responses?.filter(r => r.answer && r.answer.trim().length > 0) || [];
      
      if (filledResponses.length < 5) {
        setAccessError("You need to fill out at least 5 questions in your memo builder before playing.");
        setGameState('access-denied');
        return;
      }

      setGameState('entry');

    } catch (error) {
      console.error('Error checking access:', error);
      setAccessError("Something went wrong. Please try again.");
      setGameState('access-denied');
    }
  };

  const startGame = async () => {
    setIsLoadingQuestions(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-roast-questions', {
        body: { companyId: company.id }
      });

      if (error) throw error;

      setQuestions(data.questions);
      setCompanyContext(data.companyContext);
      setGameState('playing');

    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error("Failed to generate questions. Please try again.");
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleGameComplete = async (gameResults: AnswerResult[], totalTime: number) => {
    setResults(gameResults);
    setIsLoadingVerdict(true);
    setGameState('results');

    try {
      const { data, error } = await supabase.functions.invoke('generate-roast-verdict', {
        body: {
          results: gameResults,
          companyName: company.name,
          totalTime,
        }
      });

      if (error) throw error;
      setVerdict(data);

    } catch (error) {
      console.error('Error generating verdict:', error);
      // Create fallback verdict
      const totalScore = gameResults.reduce((sum, r) => sum + r.score, 0);
      setVerdict({
        totalScore,
        categoryBreakdown: [],
        verdictTitle: totalScore >= 70 ? "Well Done!" : "Keep Practicing",
        verdictEmoji: totalScore >= 70 ? "🔥" : "💪",
        assessment: `You scored ${totalScore}/100. Review your answers and try again!`,
        recommendations: [
          "Practice articulating your value proposition",
          "Be more specific with numbers and metrics",
          "Address potential weaknesses head-on"
        ],
        shareableQuote: `Just got roasted by VCs and scored ${totalScore}/100! 🔥`,
        investorReadiness: totalScore >= 70 ? "almost_ready" : "getting_there"
      });
    } finally {
      setIsLoadingVerdict(false);
    }
  };

  const handlePlayAgain = () => {
    setQuestions([]);
    setResults([]);
    setVerdict(null);
    setGameState('entry');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        {gameState === 'loading' && (
          <div className="max-w-3xl mx-auto px-4 py-16">
            <Skeleton className="h-48 w-full mb-4" />
            <Skeleton className="h-8 w-1/2 mx-auto mb-4" />
            <Skeleton className="h-4 w-2/3 mx-auto" />
          </div>
        )}

        {gameState === 'access-denied' && (
          <div className="max-w-lg mx-auto px-4 py-16">
            <ModernCard className="text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Access Required</h2>
              <p className="text-muted-foreground mb-6">{accessError}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={() => navigate('/hub')} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Hub
                </Button>
                {accessError.includes("memo") && (
                  <Button onClick={() => navigate('/memo-builder')}>
                    Go to Memo Builder
                  </Button>
                )}
                {accessError.includes("sign in") && (
                  <Button onClick={() => navigate('/auth')}>
                    Sign In
                  </Button>
                )}
              </div>
            </ModernCard>
          </div>
        )}

        {gameState === 'entry' && company && (
          <RoastEntryScreen
            companyName={company.name}
            onStart={startGame}
            isLoading={isLoadingQuestions}
          />
        )}

        {gameState === 'playing' && questions.length > 0 && (
          <RoastGameLoop
            questions={questions}
            companyContext={companyContext}
            onComplete={handleGameComplete}
          />
        )}

        {gameState === 'results' && (
          isLoadingVerdict ? (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center">
              <div className="animate-pulse">
                <div className="text-6xl mb-4">🔥</div>
                <h2 className="text-2xl font-semibold mb-2">Calculating Your Verdict...</h2>
                <p className="text-muted-foreground">The VC is reviewing your answers...</p>
              </div>
            </div>
          ) : verdict && (
            <RoastResults verdict={verdict} onPlayAgain={handlePlayAgain} />
          )
        )}
      </main>

      <Footer />
    </div>
  );
}
