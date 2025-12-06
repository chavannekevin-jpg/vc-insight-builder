import { useState } from 'react';
import { DollarSign, Percent, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { FundingRound, formatCurrency } from '@/lib/dilutionCalculator';

interface RoundSimulatorProps {
  onSimulate: (round: FundingRound) => void;
  isSimulating: boolean;
}

const presetRounds = [
  { name: 'Pre-Seed', preMoney: 2000000, investment: 500000, esop: 10 },
  { name: 'Seed', preMoney: 8000000, investment: 2000000, esop: 12 },
  { name: 'Series A', preMoney: 25000000, investment: 8000000, esop: 15 }
];

export function RoundSimulator({ onSimulate, isSimulating }: RoundSimulatorProps) {
  const [roundName, setRoundName] = useState('Seed');
  const [preMoney, setPreMoney] = useState(8000000);
  const [investment, setInvestment] = useState(2000000);
  const [newEsopPool, setNewEsopPool] = useState(12);

  const handlePresetClick = (preset: typeof presetRounds[0]) => {
    setRoundName(preset.name);
    setPreMoney(preset.preMoney);
    setInvestment(preset.investment);
    setNewEsopPool(preset.esop);
  };

  const handleSimulate = () => {
    onSimulate({
      name: roundName,
      preMoney,
      investment,
      newEsopPool
    });
  };

  const postMoney = preMoney + investment;
  const investorOwnership = (investment / postMoney) * 100;

  return (
    <div className="space-y-6">
      {/* Quick Presets */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Quick Presets</Label>
        <div className="flex flex-wrap gap-2">
          {presetRounds.map((preset) => (
            <Button
              key={preset.name}
              variant={roundName === preset.name ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePresetClick(preset)}
              className="text-xs"
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Round Name */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Round Name</Label>
        <Input
          value={roundName}
          onChange={(e) => setRoundName(e.target.value)}
          placeholder="e.g., Seed, Series A"
          className="bg-background"
        />
      </div>

      {/* Pre-Money Valuation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            Pre-Money Valuation
          </Label>
          <span className="text-sm font-medium text-primary">
            {formatCurrency(preMoney)}
          </span>
        </div>
        <Slider
          value={[preMoney]}
          onValueChange={(v) => setPreMoney(v[0])}
          min={500000}
          max={100000000}
          step={500000}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>$500K</span>
          <span>$100M</span>
        </div>
      </div>

      {/* Investment Amount */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-secondary" />
            Investment Amount
          </Label>
          <span className="text-sm font-medium text-secondary">
            {formatCurrency(investment)}
          </span>
        </div>
        <Slider
          value={[investment]}
          onValueChange={(v) => setInvestment(v[0])}
          min={100000}
          max={Math.min(preMoney, 50000000)}
          step={100000}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>$100K</span>
          <span>{formatCurrency(Math.min(preMoney, 50000000))}</span>
        </div>
      </div>

      {/* New ESOP Pool */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Percent className="w-4 h-4 text-accent" />
            Post-Round ESOP Pool
          </Label>
          <span className="text-sm font-medium text-accent">
            {newEsopPool}%
          </span>
        </div>
        <Slider
          value={[newEsopPool]}
          onValueChange={(v) => setNewEsopPool(v[0])}
          min={0}
          max={25}
          step={1}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          VCs often require 10-15% ESOP pool post-round
        </p>
      </div>

      {/* Summary Preview */}
      <div className="p-4 bg-muted/30 rounded-lg border border-border/50 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Post-Money Valuation</span>
          <span className="font-semibold">{formatCurrency(postMoney)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Investor Ownership</span>
          <span className="font-semibold text-primary">{investorOwnership.toFixed(1)}%</span>
        </div>
      </div>

      {/* Simulate Button */}
      <Button 
        onClick={handleSimulate}
        disabled={isSimulating || !roundName.trim()}
        className="w-full"
        size="lg"
      >
        {isSimulating ? 'Simulating...' : 'Simulate Round'}
      </Button>
    </div>
  );
}
