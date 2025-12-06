// Types for cap table simulation
export interface Stakeholder {
  id: string;
  name: string;
  type: 'founder' | 'employee' | 'advisor' | 'investor';
  shares: number;
  ownership?: number; // calculated percentage
}

export interface CapTable {
  totalShares: number;
  stakeholders: Stakeholder[];
  esopPool: number; // percentage reserved
}

export interface FundingRound {
  name: string;
  preMoney: number;
  investment: number;
  newEsopPool: number; // target pool post-round (percentage)
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
  };
  dilutionPercentages: Record<string, number>;
}

// Calculate ownership percentages for all stakeholders
export function calculateOwnership(stakeholders: Stakeholder[], totalShares: number): Stakeholder[] {
  return stakeholders.map(s => ({
    ...s,
    ownership: totalShares > 0 ? (s.shares / totalShares) * 100 : 0
  }));
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
  const { preMoney, investment, newEsopPool } = round;

  // Calculate post-money valuation
  const postMoney = preMoney + investment;

  // Calculate price per share based on pre-money
  const pricePerShare = preMoney / totalShares;

  // Calculate new shares for investor
  const newInvestorShares = Math.round(investment / pricePerShare);

  // Calculate ESOP pool increase (option pool shuffle)
  // The new ESOP pool is calculated on post-money, but comes from pre-money dilution
  const currentEsopShares = Math.round((esopPool / 100) * totalShares);
  const postRoundTotalShares = totalShares + newInvestorShares;
  const targetEsopShares = Math.round((newEsopPool / 100) * postRoundTotalShares);
  const additionalEsopShares = Math.max(0, targetEsopShares - currentEsopShares);

  // Final total shares after round
  const finalTotalShares = postRoundTotalShares + additionalEsopShares;

  // Calculate pre-round ownership
  const preRoundStakeholders = calculateOwnership(stakeholders, totalShares);

  // Create post-round stakeholders (same shares, new ownership)
  const postRoundStakeholders = calculateOwnership(stakeholders, finalTotalShares);

  // Add new investor to post-round
  const newInvestor: Stakeholder = {
    id: generateId(),
    name: `${round.name} Investor`,
    type: 'investor',
    shares: newInvestorShares,
    ownership: (newInvestorShares / finalTotalShares) * 100
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
      pricePerShare
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
        shares: 5000000 // 50%
      },
      {
        id: generateId(),
        name: 'Founder 2',
        type: 'founder',
        shares: 3000000 // 30%
      }
    ],
    esopPool: 10 // 10% reserved
  };
}

// Get color for stakeholder type
export function getStakeholderColor(type: Stakeholder['type'], index: number): string {
  const colors = {
    founder: ['hsl(330, 100%, 65%)', 'hsl(330, 100%, 55%)', 'hsl(330, 100%, 45%)'],
    employee: ['hsl(280, 100%, 70%)', 'hsl(280, 100%, 60%)', 'hsl(280, 100%, 50%)'],
    advisor: ['hsl(200, 100%, 60%)', 'hsl(200, 100%, 50%)', 'hsl(200, 100%, 40%)'],
    investor: ['hsl(140, 100%, 50%)', 'hsl(140, 100%, 40%)', 'hsl(140, 100%, 30%)']
  };
  return colors[type][index % 3] || colors.founder[0];
}
