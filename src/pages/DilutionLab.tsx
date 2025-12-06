import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/sections/Footer";
import { ModernCard } from "@/components/ModernCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lock, ArrowLeft, FlaskConical, RotateCcw } from "lucide-react";
import { CapTableBuilder } from "@/components/dilution/CapTableBuilder";
import { RoundSimulator } from "@/components/dilution/RoundSimulator";
import { DilutionComparison } from "@/components/dilution/DilutionComparison";
import { OwnershipChart } from "@/components/dilution/OwnershipChart";
import { 
  CapTable, 
  FundingRound, 
  DilutionResult,
  createDefaultCapTable,
  calculateOwnership,
  simulateRound
} from "@/lib/dilutionCalculator";

type PageState = 'loading' | 'access-denied' | 'builder' | 'results';

export default function DilutionLab() {
  const navigate = useNavigate();
  const [pageState, setPageState] = useState<PageState>('loading');
  const [accessError, setAccessError] = useState<string>("");
  const [company, setCompany] = useState<any>(null);
  
  // Cap table state
  const [capTable, setCapTable] = useState<CapTable>(createDefaultCapTable());
  const [lastRound, setLastRound] = useState<FundingRound | null>(null);
  const [simulationResult, setSimulationResult] = useState<DilutionResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    let accessCheckCompleted = false;

    const performAccessCheck = async (user: any) => {
      if (accessCheckCompleted) return;
      accessCheckCompleted = true;
      await checkAccessWithUser(user);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setTimeout(() => performAccessCheck(session.user), 0);
        } else if (event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
          if (!session) {
            setAccessError("Please sign in to access Dilution Lab.");
            setPageState('access-denied');
          }
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        performAccessCheck(session.user);
      } else {
        setAccessError("Please sign in to access Dilution Lab.");
        setPageState('access-denied');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAccessWithUser = async (user: any) => {
    try {
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .eq('founder_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (companiesError) throw companiesError;

      if (!companies || companies.length === 0) {
        setAccessError("You need to create a company profile first.");
        setPageState('access-denied');
        return;
      }

      const userCompany = companies[0];
      setCompany(userCompany);

      if (!userCompany.has_premium) {
        setAccessError("Dilution Lab is a premium feature. Generate your memo to unlock it!");
        setPageState('access-denied');
        return;
      }

      setPageState('builder');

    } catch (error) {
      console.error('Error checking access:', error);
      setAccessError("Something went wrong. Please try again.");
      setPageState('access-denied');
    }
  };

  const handleSimulate = (round: FundingRound) => {
    setIsSimulating(true);
    
    // Simulate with a small delay for UX
    setTimeout(() => {
      const result = simulateRound(capTable, round);
      setSimulationResult(result);
      setLastRound(round);
      setPageState('results');
      setIsSimulating(false);
    }, 500);
  };

  const handleReset = () => {
    setSimulationResult(null);
    setLastRound(null);
    setPageState('builder');
  };

  const handleApplyRound = () => {
    if (!simulationResult) return;
    
    // Apply the round results to the cap table
    setCapTable({
      totalShares: simulationResult.postRound.totalShares,
      stakeholders: simulationResult.postRound.stakeholders,
      esopPool: simulationResult.postRound.esopPool
    });
    
    setSimulationResult(null);
    setLastRound(null);
    setPageState('builder');
    toast.success("Round applied to cap table!");
  };

  const stakeholdersWithOwnership = calculateOwnership(capTable.stakeholders, capTable.totalShares);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        {pageState === 'loading' && (
          <div className="max-w-6xl mx-auto px-4 py-16">
            <Skeleton className="h-48 w-full mb-4" />
            <Skeleton className="h-8 w-1/2 mx-auto mb-4" />
            <Skeleton className="h-4 w-2/3 mx-auto" />
          </div>
        )}

        {pageState === 'access-denied' && (
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

        {pageState === 'builder' && (
          <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center mx-auto mb-4 shadow-glow">
                <FlaskConical className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Dilution Lab</h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Build your cap table and simulate funding rounds to see how dilution impacts ownership
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cap Table Builder */}
              <div className="lg:col-span-1">
                <ModernCard className="!p-5">
                  <h3 className="text-lg font-semibold mb-4">Current Cap Table</h3>
                  <CapTableBuilder 
                    capTable={capTable}
                    onChange={setCapTable}
                  />
                </ModernCard>
              </div>

              {/* Chart + Simulator */}
              <div className="lg:col-span-2 space-y-6">
                {/* Current Ownership Chart */}
                <ModernCard className="!p-5">
                  <h3 className="text-lg font-semibold mb-4">Current Ownership</h3>
                  <OwnershipChart
                    stakeholders={stakeholdersWithOwnership}
                    esopPool={capTable.esopPool}
                  />
                </ModernCard>

                {/* Round Simulator */}
                <ModernCard className="!p-5">
                  <h3 className="text-lg font-semibold mb-4">Simulate Funding Round</h3>
                  <RoundSimulator
                    onSimulate={handleSimulate}
                    isSimulating={isSimulating}
                  />
                </ModernCard>
              </div>
            </div>
          </div>
        )}

        {pageState === 'results' && simulationResult && lastRound && (
          <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  {lastRound.name} Simulation Results
                </h1>
                <p className="text-muted-foreground">
                  See how this round affects your cap table
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleReset} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  New Simulation
                </Button>
                <Button onClick={handleApplyRound}>
                  Apply Round
                </Button>
              </div>
            </div>

            <DilutionComparison 
              result={simulationResult}
              roundName={lastRound.name}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
