import { memo, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowRight, AlertTriangle, ShieldAlert, Target, TrendingDown, 
  Users, DollarSign, Zap, Eye, CheckCircle2, Lock, Sparkles, 
  FileText, Lightbulb, AlertCircle, CheckCircle, Scale
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Concern {
  text: string;
  category: string;
  caseStudyReference?: string;
}

interface Strength {
  text: string;
  category: string;
}

interface VCVerdict {
  verdict: string;
  readinessLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  readinessRationale: string;
  concerns: Concern[];
  strengths: Strength[];
  marketInsight: string;
  vcFrameworkCheck: string;
}

interface VCVerdictCardProps {
  companyId: string;
  companyName: string;
  companyDescription?: string | null;
  companyStage: string;
  companyCategory?: string | null;
  responses: Array<{ question_key: string; answer: string | null }>;
  memoGenerated: boolean;
  hasPaid: boolean;
  deckParsed?: boolean;
  cachedVerdict?: VCVerdict | null;
  onVerdictGenerated?: (verdict: VCVerdict) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'traction': return Zap;
    case 'market': return TrendingDown;
    case 'team': return Users;
    case 'product': return Target;
    case 'business_model': return DollarSign;
    case 'competition': return ShieldAlert;
    default: return AlertTriangle;
  }
};

const getReadinessConfig = (level: string) => {
  switch (level) {
    case 'LOW':
      return { 
        text: 'NEEDS WORK', 
        className: 'bg-destructive/20 text-destructive border-destructive/30',
        color: 'text-destructive'
      };
    case 'MEDIUM':
      return { 
        text: 'GETTING THERE', 
        className: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
        color: 'text-amber-500'
      };
    case 'HIGH':
      return { 
        text: 'PROMISING', 
        className: 'bg-primary/20 text-primary border-primary/30',
        color: 'text-primary'
      };
    default:
      return { 
        text: 'ANALYZING', 
        className: 'bg-muted text-muted-foreground border-border',
        color: 'text-muted-foreground'
      };
  }
};

export const VCVerdictCard = memo(({
  companyId,
  companyName,
  companyDescription,
  companyStage,
  companyCategory,
  responses,
  memoGenerated,
  hasPaid,
  deckParsed = false,
  cachedVerdict,
  onVerdictGenerated
}: VCVerdictCardProps) => {
  const navigate = useNavigate();
  const [verdict, setVerdict] = useState<VCVerdict | null>(cachedVerdict || null);
  const [loading, setLoading] = useState(!cachedVerdict);
  const [error, setError] = useState<string | null>(null);

  const generateVerdict = useCallback(async () => {
    if (memoGenerated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-vc-verdict', {
        body: {
          companyName,
          companyDescription,
          stage: companyStage,
          category: companyCategory,
          responses,
          deckParsed
        }
      });

      if (fnError) throw fnError;

      setVerdict(data);
      onVerdictGenerated?.(data);

      // Cache verdict in database
      await supabase
        .from('companies')
        .update({ 
          vc_verdict_json: data,
          verdict_generated_at: new Date().toISOString()
        })
        .eq('id', companyId);

    } catch (err) {
      console.error('Error generating verdict:', err);
      setError('Failed to generate verdict');
    } finally {
      setLoading(false);
    }
  }, [companyId, companyName, companyDescription, companyStage, companyCategory, responses, deckParsed, memoGenerated, onVerdictGenerated]);

  useEffect(() => {
    if (!cachedVerdict && !memoGenerated) {
      generateVerdict();
    }
  }, [cachedVerdict, memoGenerated, generateVerdict]);

  const navigateToPortal = useCallback(() => navigate("/portal"), [navigate]);
  const navigateToMemo = useCallback(() => navigate(`/memo?companyId=${companyId}`), [navigate, companyId]);
  const navigateToCheckout = useCallback(() => navigate(`/checkout-memo?companyId=${companyId}`), [navigate, companyId]);

  // If memo is generated, show different states
  if (memoGenerated) {
    return (
      <div className="relative bg-card border-2 border-primary/30 rounded-3xl p-8 shadow-glow animate-fade-in hover:shadow-glow-strong transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 rounded-3xl -z-10" />
        
        <div className="flex items-start justify-between mb-6">
          <div>
            <Badge className={`mb-3 ${hasPaid ? 'bg-primary/10 text-primary border-primary/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
              {hasPaid ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
              {hasPaid ? 'Full Access' : 'Verdict Ready'}
            </Badge>
            <h2 className="text-3xl font-display font-bold mb-2">Your VC Verdict</h2>
            <p className="text-muted-foreground">
              {hasPaid ? 'Complete access unlocked — now you know what VCs know' : 'Your VC verdict is ready. Unlock the full truth.'}
            </p>
          </div>
          {hasPaid ? <CheckCircle2 className="w-12 h-12 text-primary" /> : <FileText className="w-12 h-12 text-amber-500/50" />}
        </div>

        {hasPaid ? (
          <>
            <Button 
              size="lg" 
              className="w-full text-lg font-semibold"
              onClick={navigateToMemo}
            >
              View Your Verdict
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <div className="mt-6 pt-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground text-center">
                Need to update your information?{" "}
                <button 
                  onClick={navigateToPortal}
                  className="text-primary hover:underline"
                >
                  Edit your profile
                </button>
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={navigateToMemo}
              >
                <Lock className="w-5 h-5" />
                <span>See Preview</span>
              </Button>
              <Button 
                className="h-auto py-4 flex-col gap-2 bg-primary hover:bg-primary/90"
                onClick={navigateToCheckout}
              >
                <Sparkles className="w-5 h-5" />
                <span>Get the Full Truth</span>
              </Button>
            </div>

            <div className="bg-muted/30 border border-border/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground text-center">
                This analysis costs less than one rejected coffee meeting.
              </p>
            </div>
          </>
        )}
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="relative bg-card border-2 border-border rounded-3xl p-8 animate-fade-in">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/20 via-transparent to-muted/20 rounded-3xl -z-10" />
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-6 w-28 mb-3" />
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-80" />
          </div>
          <div className="relative">
            <Scale className="w-12 h-12 text-muted-foreground/30 animate-pulse" />
          </div>
        </div>

        <Skeleton className="h-20 w-full mb-6 rounded-xl" />

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>

        <div className="text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Eye className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-medium">Analyzing through VC eyes...</span>
          </div>
          <p className="text-xs">Researching your market and competitive landscape</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !verdict) {
    return (
      <div className="relative bg-card border-2 border-destructive/30 rounded-3xl p-8 animate-fade-in">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
          <p className="text-muted-foreground">{error || 'Unable to generate verdict'}</p>
          <Button onClick={generateVerdict} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const readinessConfig = getReadinessConfig(verdict.readinessLevel);

  return (
    <div className="relative bg-card border-2 border-border rounded-3xl p-8 animate-fade-in overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/10 via-transparent to-muted/10 rounded-3xl -z-10" />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Badge className={readinessConfig.className}>
            <Scale className="w-3 h-3 mr-1" />
            {readinessConfig.text}
          </Badge>
          <h2 className="text-3xl font-display font-bold mt-3 mb-2">Your VC Verdict</h2>
          <p className="text-muted-foreground">What partners say when you leave the room</p>
        </div>
        <Scale className={`w-10 h-10 ${readinessConfig.color}`} />
      </div>

      {/* Main Verdict Quote */}
      <div className="bg-background/50 border border-border/50 rounded-xl p-5 mb-6">
        <p className="text-lg font-medium text-foreground leading-relaxed">
          "{verdict.verdict}"
        </p>
        <p className="text-sm text-muted-foreground mt-3">
          {verdict.readinessRationale}
        </p>
      </div>

      {/* Market Insight */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground mb-1">Market Insight</p>
            <p className="text-sm text-muted-foreground">{verdict.marketInsight}</p>
          </div>
        </div>
      </div>

      {/* Concerns & Strengths Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Concerns */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span className="font-medium text-sm">Top Concerns</span>
          </div>
          <div className="space-y-3">
            {verdict.concerns.slice(0, 3).map((concern, index) => {
              const Icon = getCategoryIcon(concern.category);
              return (
                <div 
                  key={index} 
                  className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3"
                >
                  <div className="flex items-start gap-2">
                    <Icon className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-foreground/90">{concern.text}</p>
                      {concern.caseStudyReference && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {concern.caseStudyReference}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strengths */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">What's Working</span>
          </div>
          <div className="space-y-3">
            {verdict.strengths.slice(0, 3).map((strength, index) => {
              const Icon = getCategoryIcon(strength.category);
              return (
                <div 
                  key={index} 
                  className="bg-primary/5 border border-primary/20 rounded-lg p-3"
                >
                  <div className="flex items-start gap-2">
                    <Icon className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground/90">{strength.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* VC Framework Check */}
      <div className="bg-muted/30 border border-border/50 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground mb-1">VC Framework Check</p>
            <p className="text-sm text-muted-foreground">{verdict.vcFrameworkCheck}</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Button 
        size="lg" 
        className="w-full text-lg font-semibold"
        onClick={navigateToPortal}
      >
        Get the Full Analysis
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          This is a preview. Complete your profile to get specific, actionable feedback for your fundraise.
        </p>
      </div>
    </div>
  );
});

VCVerdictCard.displayName = "VCVerdictCard";
