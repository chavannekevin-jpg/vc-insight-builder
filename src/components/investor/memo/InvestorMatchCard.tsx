import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  Target, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  MapPin,
  Layers,
  Tag,
  TrendingUp,
  DollarSign,
  Loader2
} from 'lucide-react';

interface MatchingSignals {
  stage: string;
  sector: string;
  secondary_sectors?: string[];
  keywords?: string[];
  ask_amount?: number;
  has_revenue?: boolean;
  has_customers?: boolean;
  geography?: string;
}

interface InvestorProfile {
  preferred_stages: unknown;
  primary_sectors: unknown;
  geographic_focus: unknown;
  ticket_size_min: number | null;
  ticket_size_max: number | null;
}

interface InvestorMatchCardProps {
  matchingSignals: MatchingSignals;
}

interface MatchReason {
  label: string;
  matched: boolean;
  icon: React.ReactNode;
  detail?: string;
}

const calculateMatchScore = (
  signals: MatchingSignals, 
  profile: InvestorProfile | null
): { score: number; reasons: MatchReason[] } => {
  if (!profile) {
    return { score: 0, reasons: [] };
  }

  const reasons: MatchReason[] = [];
  let totalPoints = 0;
  let earnedPoints = 0;

  // Stage match (30 points)
  const stages = profile.preferred_stages as string[] | null;
  if (stages && stages.length > 0) {
    totalPoints += 30;
    const stageMatched = stages.some(s => 
      s.toLowerCase().includes(signals.stage?.toLowerCase() || '') ||
      (signals.stage?.toLowerCase() || '').includes(s.toLowerCase())
    );
    if (stageMatched) {
      earnedPoints += 30;
      reasons.push({
        label: 'Stage Match',
        matched: true,
        icon: <Layers className="w-4 h-4" />,
        detail: signals.stage
      });
    } else {
      reasons.push({
        label: 'Stage Mismatch',
        matched: false,
        icon: <Layers className="w-4 h-4" />,
        detail: `You focus on ${stages.slice(0, 2).join(', ')}`
      });
    }
  }

  // Sector match (30 points)
  const sectors = profile.primary_sectors as string[] | null;
  if (sectors && sectors.length > 0) {
    totalPoints += 30;
    const allCompanySectors = [signals.sector, ...(signals.secondary_sectors || [])];
    const sectorMatched = sectors.some(s => 
      allCompanySectors.some(cs => 
        cs?.toLowerCase().includes(s.toLowerCase()) ||
        s.toLowerCase().includes(cs?.toLowerCase() || '')
      )
    );
    if (sectorMatched) {
      earnedPoints += 30;
      reasons.push({
        label: 'Sector Fit',
        matched: true,
        icon: <Target className="w-4 h-4" />,
        detail: signals.sector
      });
    } else {
      reasons.push({
        label: 'Sector Mismatch',
        matched: false,
        icon: <Target className="w-4 h-4" />,
        detail: `You focus on ${sectors.slice(0, 2).join(', ')}`
      });
    }
  }

  // Geographic match (20 points)
  const geoFocus = profile.geographic_focus as string[] | null;
  if (geoFocus && geoFocus.length > 0 && signals.geography) {
    totalPoints += 20;
    const geoMatched = geoFocus.some(g => 
      signals.geography?.toLowerCase().includes(g.toLowerCase()) ||
      g.toLowerCase().includes(signals.geography?.toLowerCase() || '')
    );
    if (geoMatched) {
      earnedPoints += 20;
      reasons.push({
        label: 'Geography Fit',
        matched: true,
        icon: <MapPin className="w-4 h-4" />,
        detail: signals.geography
      });
    } else {
      reasons.push({
        label: 'Geography Mismatch',
        matched: false,
        icon: <MapPin className="w-4 h-4" />,
        detail: `You focus on ${geoFocus.slice(0, 2).join(', ')}`
      });
    }
  }

  // Ticket size (20 points)
  if (profile.ticket_size_min && profile.ticket_size_max && signals.ask_amount) {
    totalPoints += 20;
    const withinRange = signals.ask_amount >= profile.ticket_size_min && 
                        signals.ask_amount <= profile.ticket_size_max;
    if (withinRange) {
      earnedPoints += 20;
      reasons.push({
        label: 'Check Size Fit',
        matched: true,
        icon: <DollarSign className="w-4 h-4" />,
        detail: `$${(signals.ask_amount / 1000000).toFixed(1)}M raise`
      });
    } else {
      reasons.push({
        label: 'Check Size Mismatch',
        matched: false,
        icon: <DollarSign className="w-4 h-4" />,
        detail: `Your range: $${(profile.ticket_size_min / 1000).toFixed(0)}K - $${(profile.ticket_size_max / 1000000).toFixed(1)}M`
      });
    }
  }

  // Bonus: Has traction signals
  if (signals.has_revenue || signals.has_customers) {
    reasons.push({
      label: 'Has Traction',
      matched: true,
      icon: <TrendingUp className="w-4 h-4" />,
      detail: signals.has_revenue ? 'Revenue generating' : 'Has customers'
    });
  }

  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 50;
  
  return { score, reasons };
};

const getMatchTier = (score: number) => {
  if (score >= 75) return { label: 'Strong Match', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/40' };
  if (score >= 50) return { label: 'Potential Fit', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/40' };
  return { label: 'Low Match', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/40' };
};

export const InvestorMatchCard: React.FC<InvestorMatchCardProps> = ({
  matchingSignals
}) => {
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('investor_profiles')
        .select('preferred_stages, primary_sectors, geographic_focus, ticket_size_min, ticket_size_max')
        .eq('id', user.id)
        .single();

      if (data) {
        setInvestorProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const { score, reasons } = calculateMatchScore(matchingSignals, investorProfile);
  const tier = getMatchTier(score);

  if (!investorProfile) {
    return (
      <Card className="border-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            Investor Match
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Complete your investor profile to see match scores
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${tier.border} border bg-gradient-to-br from-card to-card/80`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            Investor Match
          </CardTitle>
          <Badge className={`${tier.bg} ${tier.color} border ${tier.border}`}>
            {tier.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Match Score</span>
            <span className={`text-2xl font-bold ${tier.color}`}>{score}%</span>
          </div>
          <Progress value={score} className="h-2" />
        </div>

        {/* Match Reasons */}
        <div className="space-y-2 pt-2">
          {reasons.map((reason, index) => (
            <div 
              key={index}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                reason.matched ? 'bg-green-500/5' : 'bg-red-500/5'
              }`}
            >
              <div className={reason.matched ? 'text-green-400' : 'text-red-400'}>
                {reason.matched ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`${reason.matched ? 'text-green-400' : 'text-muted-foreground'}`}>
                    {reason.icon}
                  </span>
                  <span className="text-sm font-medium">{reason.label}</span>
                </div>
                {reason.detail && (
                  <p className="text-xs text-muted-foreground mt-0.5">{reason.detail}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Keywords */}
        {matchingSignals.keywords && matchingSignals.keywords.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Keywords</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {matchingSignals.keywords.slice(0, 6).map((keyword, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
