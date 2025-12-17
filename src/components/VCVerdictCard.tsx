import { memo, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, AlertTriangle, ShieldAlert, Target, TrendingDown, Users, DollarSign, Zap, Skull, Eye, CheckCircle2, Lock, Sparkles, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface HarshObservation {
  text: string;
  severity: 'fatal' | 'critical' | 'warning';
  category: string;
}

interface VCVerdict {
  verdict_severity: 'HIGH_RISK' | 'MODERATE_RISK' | 'NEEDS_WORK' | 'PROMISING';
  harsh_observations: HarshObservation[];
  key_weakness: string;
  verdict_summary: string;
  blind_spots_count: number;
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

const getSeverityStyles = (severity: string) => {
  switch (severity) {
    case 'fatal':
      return 'border-l-destructive bg-destructive/5';
    case 'critical':
      return 'border-l-amber-500 bg-amber-500/5';
    case 'warning':
      return 'border-l-muted-foreground bg-muted/30';
    default:
      return 'border-l-muted-foreground bg-muted/30';
  }
};

const getVerdictColor = (severity: string) => {
  switch (severity) {
    case 'HIGH_RISK': return 'text-destructive';
    case 'MODERATE_RISK': return 'text-amber-500';
    case 'NEEDS_WORK': return 'text-amber-400';
    case 'PROMISING': return 'text-primary';
    default: return 'text-muted-foreground';
  }
};

const getVerdictBadge = (severity: string) => {
  switch (severity) {
    case 'HIGH_RISK': return { text: 'HIGH RISK', className: 'bg-destructive/20 text-destructive border-destructive/30' };
    case 'MODERATE_RISK': return { text: 'MODERATE RISK', className: 'bg-amber-500/20 text-amber-600 border-amber-500/30' };
    case 'NEEDS_WORK': return { text: 'NEEDS WORK', className: 'bg-amber-400/20 text-amber-500 border-amber-400/30' };
    case 'PROMISING': return { text: 'PROMISING', className: 'bg-primary/20 text-primary border-primary/30' };
    default: return { text: 'ANALYZING', className: 'bg-muted text-muted-foreground border-border' };
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
      return; // Don't generate verdict if memo already exists
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
      <div className="relative bg-card border-2 border-destructive/30 rounded-3xl p-8 animate-fade-in">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-destructive/5 rounded-3xl -z-10" />
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-6 w-24 mb-3" />
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-80" />
          </div>
          <div className="relative">
            <Skull className="w-12 h-12 text-destructive/30 animate-pulse" />
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="pl-4 border-l-2 border-destructive/30 py-3">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>

        <div className="text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Eye className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-medium">Analyzing through VC eyes...</span>
          </div>
          <p className="text-xs">This takes a few seconds</p>
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

  const verdictBadge = getVerdictBadge(verdict.verdict_severity);

  return (
    <div className="relative bg-card border-2 border-destructive/30 rounded-3xl p-8 animate-fade-in overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-destructive/5 rounded-3xl -z-10" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-destructive/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10" />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Badge className={verdictBadge.className}>
              <AlertTriangle className="w-3 h-3 mr-1" />
              {verdictBadge.text}
            </Badge>
            {verdict.blind_spots_count > 0 && (
              <span className="text-xs text-destructive font-medium">
                {verdict.blind_spots_count} blind spot{verdict.blind_spots_count !== 1 ? 's' : ''} detected
              </span>
            )}
          </div>
          <h2 className="text-3xl font-display font-bold mb-2">Your VC Verdict</h2>
          <p className="text-muted-foreground">What partners say when you leave the room</p>
        </div>
        <Skull className={`w-12 h-12 ${getVerdictColor(verdict.verdict_severity)}`} />
      </div>

      {/* Summary - the "hook" */}
      <div className="bg-background/50 border border-border/50 rounded-xl p-4 mb-6">
        <p className="text-sm italic text-muted-foreground">
          "{verdict.verdict_summary}"
        </p>
      </div>

      {/* Harsh Observations */}
      <div className="space-y-3 mb-6">
        {verdict.harsh_observations.map((observation, index) => {
          const Icon = getCategoryIcon(observation.category);
          return (
            <div 
              key={index} 
              className={`pl-4 border-l-4 ${getSeverityStyles(observation.severity)} rounded-r-lg py-3 pr-4`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  observation.severity === 'fatal' ? 'text-destructive' : 
                  observation.severity === 'critical' ? 'text-amber-500' : 'text-muted-foreground'
                }`} />
                <p className="text-sm text-foreground/90">
                  {observation.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Key Weakness Callout */}
      <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-destructive mb-1">Critical Blind Spot</p>
            <p className="text-sm text-muted-foreground">{verdict.key_weakness}</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Button 
        size="lg" 
        className="w-full text-lg font-semibold bg-primary hover:bg-primary/90"
        onClick={navigateToPortal}
      >
        Remove Blind Spots
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          Average founder spends 6–9 months fundraising. One wrong narrative can kill a round permanently.
        </p>
      </div>
    </div>
  );
});

VCVerdictCard.displayName = "VCVerdictCard";
