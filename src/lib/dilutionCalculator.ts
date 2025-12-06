// Types for cap table simulation
export interface Stakeholder {
  id: string;
  name: string;
  type: 'founder' | 'employee' | 'advisor' | 'investor' | 'convertible';
  shares: number;
  ownership?: number; // calculated percentage
  isOutstanding?: boolean; // true for issued shares, false for options/convertibles
}

export interface CapTable {
  totalShares: number;
  stakeholders: Stakeholder[];
  esopPool: number; // percentage reserved
  esopAllocated: number; // percentage actually granted (outstanding)
}

export type InstrumentType = 'equity' | 'safe' | 'cla';

export interface FundingRound {
  name: string;
  instrument: InstrumentType;
  preMoney: number;
  investment: number;
  newEsopPool: number; // target pool post-round (percentage)
  // SAFE/CLA specific
  valuationCap?: number;
  discount?: number; // percentage discount (e.g., 20 for 20%)
}

export interface DilutionResult {
  preRound: {
    stakeholders: Stakeholder[];
    totalShares: number;
    esopPool: number;
  };
  postRound: {
    stakeholders: Stakeholder[];
    totalShares: number;
    esopPool: number;
    newInvestorShares: number;
    newInvestorOwnership: number;
    postMoney: number;
    pricePerShare: number;
    instrument: InstrumentType;
  };
  dilutionPercentages: Record<string, number>;
}

// Calculate ownership percentages for all stakeholders
export function calculateOwnership(
  stakeholders: Stakeholder[], 
  totalShares: number,
  fullyDiluted: boolean = true,
  esopPool: number = 0
): Stakeholder[] {
  if (fullyDiluted) {
    // Include everything: all shares + unissued ESOP
    const esopShares = Math.round((esopPool / 100) * totalShares);
    const fullyDilutedTotal = totalShares + esopShares;
    return stakeholders.map(s => ({
      ...s,
      ownership: fullyDilutedTotal > 0 ? (s.shares / fullyDilutedTotal) * 100 : 0
    }));
  } else {
    // Outstanding only: only issued shares
    const outstandingStakeholders = stakeholders.filter(s => s.isOutstanding !== false);
    const outstandingShares = outstandingStakeholders.reduce((sum, s) => sum + s.shares, 0);
    return stakeholders.map(s => ({
      ...s,
      ownership: outstandingShares > 0 && s.isOutstanding !== false 
        ? (s.shares / outstandingShares) * 100 
        : 0
    }));
  }
}

// Generate a unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Calculate round simulation
export function simulateRound(
  capTable: CapTable,
  round: FundingRound
): DilutionResult {
  const { totalShares, stakeholders, esopPool } = capTable;
  const { preMoney, investment, newEsopPool, instrument, valuationCap, discount } = round;

  let effectivePreMoney = preMoney;
  let pricePerShare: number;

  // Handle different instruments
  if (instrument === 'safe' || instrument === 'cla') {
    // For SAFE/CLA, use the lower of valuation cap or discounted price
    if (valuationCap && valuationCap < preMoney) {
      effectivePreMoney = valuationCap;
    }
    if (discount && discount > 0) {
      const discountedPreMoney = preMoney * (1 - discount / 100);
      effectivePreMoney = Math.min(effectivePreMoney, discountedPreMoney);
    }
  }

  // Calculate post-money valuation
  const postMoney = preMoney + investment;

  // Calculate price per share based on effective pre-money (for investor)
  pricePerShare = effectivePreMoney / totalShares;

  // Calculate new shares for investor
  const newInvestorShares = Math.round(investment / pricePerShare);

  // Calculate ESOP pool increase (option pool shuffle)
  const currentEsopShares = Math.round((esopPool / 100) * totalShares);
  const postRoundTotalShares = totalShares + newInvestorShares;
  const targetEsopShares = Math.round((newEsopPool / 100) * postRoundTotalShares);
  const additionalEsopShares = Math.max(0, targetEsopShares - currentEsopShares);

  // Final total shares after round
  const finalTotalShares = postRoundTotalShares + additionalEsopShares;

  // Calculate pre-round ownership
  const preRoundStakeholders = calculateOwnership(stakeholders, totalShares, true, esopPool);

  // Create post-round stakeholders (same shares, new ownership)
  const postRoundStakeholders = calculateOwnership(stakeholders, finalTotalShares, true, newEsopPool);

  // Add new investor to post-round
  const instrumentLabel = instrument === 'safe' ? 'SAFE' : instrument === 'cla' ? 'CLA' : '';
  const newInvestor: Stakeholder = {
    id: generateId(),
    name: `${round.name} Investor${instrumentLabel ? ` (${instrumentLabel})` : ''}`,
    type: instrument === 'equity' ? 'investor' : 'convertible',
    shares: newInvestorShares,
    ownership: (newInvestorShares / finalTotalShares) * 100,
    isOutstanding: instrument === 'equity' // SAFE/CLA not outstanding until conversion
  };

  // Calculate dilution percentages
  const dilutionPercentages: Record<string, number> = {};
  preRoundStakeholders.forEach(pre => {
    const post = postRoundStakeholders.find(p => p.id === pre.id);
    if (post && pre.ownership && post.ownership) {
      dilutionPercentages[pre.id] = ((pre.ownership - post.ownership) / pre.ownership) * 100;
    }
  });

  return {
    preRound: {
      stakeholders: preRoundStakeholders,
      totalShares,
      esopPool
    },
    postRound: {
      stakeholders: [...postRoundStakeholders, newInvestor],
      totalShares: finalTotalShares,
      esopPool: newEsopPool,
      newInvestorShares,
      newInvestorOwnership: (newInvestorShares / finalTotalShares) * 100,
      postMoney,
      pricePerShare,
      instrument
    },
    dilutionPercentages
  };
}

// Format currency
export function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

// Format percentage
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

// Default cap table for new users
export function createDefaultCapTable(): CapTable {
  return {
    totalShares: 10000000, // 10M shares
    stakeholders: [
      {
        id: generateId(),
        name: 'Founder 1',
        type: 'founder',
        shares: 5000000, // 50%
        isOutstanding: true
      },
      {
        id: generateId(),
        name: 'Founder 2',
        type: 'founder',
        shares: 3000000, // 30%
        isOutstanding: true
      }
    ],
    esopPool: 10, // 10% reserved
    esopAllocated: 2 // 2% granted
  };
}

// Get color for stakeholder type
export function getStakeholderColor(type: Stakeholder['type'], index: number): string {
  const colors = {
    founder: ['hsl(330, 100%, 65%)', 'hsl(330, 100%, 55%)', 'hsl(330, 100%, 45%)'],
    employee: ['hsl(280, 100%, 70%)', 'hsl(280, 100%, 60%)', 'hsl(280, 100%, 50%)'],
    advisor: ['hsl(200, 100%, 60%)', 'hsl(200, 100%, 50%)', 'hsl(200, 100%, 40%)'],
    investor: ['hsl(140, 100%, 50%)', 'hsl(140, 100%, 40%)', 'hsl(140, 100%, 30%)'],
    convertible: ['hsl(45, 100%, 50%)', 'hsl(45, 100%, 40%)', 'hsl(45, 100%, 30%)']
  };
  return colors[type][index % 3] || colors.founder[0];
}

// Instrument display names
export const instrumentLabels: Record<InstrumentType, string> = {
  equity: 'Priced Equity',
  safe: 'SAFE',
  cla: 'Convertible Note (CLA)'
};
