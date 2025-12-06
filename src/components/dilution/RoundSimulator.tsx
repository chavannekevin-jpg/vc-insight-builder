import { useState } from 'react';
import { DollarSign, Percent, TrendingUp, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FundingRound, InstrumentType, formatCurrency, instrumentLabels } from '@/lib/dilutionCalculator';

interface RoundSimulatorProps {
  onSimulate: (round: FundingRound) => void;
  isSimulating: boolean;
}

const presetRounds = [
  { name: 'Pre-Seed', preMoney: 2000000, investment: 500000, esop: 10, instrument: 'safe' as InstrumentType },
  { name: 'Seed', preMoney: 8000000, investment: 2000000, esop: 12, instrument: 'safe' as InstrumentType },
  { name: 'Series A', preMoney: 25000000, investment: 8000000, esop: 15, instrument: 'equity' as InstrumentType }
];

export function RoundSimulator({ onSimulate, isSimulating }: RoundSimulatorProps) {
  const [roundName, setRoundName] = useState('Seed');
  const [instrument, setInstrument] = useState<InstrumentType>('safe');
  const [preMoney, setPreMoney] = useState(8000000);
  const [investment, setInvestment] = useState(2000000);
  const [newEsopPool, setNewEsopPool] = useState(12);
  const [valuationCap, setValuationCap] = useState(10000000);
  const [discount, setDiscount] = useState(20);

  const handlePresetClick = (preset: typeof presetRounds[0]) => {
    setRoundName(preset.name);
    setPreMoney(preset.preMoney);
    setInvestment(preset.investment);
    setNewEsopPool(preset.esop);
    setInstrument(preset.instrument);
  };

  const handleSimulate = () => {
    const round: FundingRound = {
      name: roundName,
      instrument,
      preMoney,
      investment,
      newEsopPool,
      ...(instrument !== 'equity' && {
        valuationCap,
        discount
      })
    };
    onSimulate(round);
  };

  const postMoney = preMoney + investment;
  
  // Calculate effective investor ownership based on instrument
  let effectivePreMoney = preMoney;
  if (instrument !== 'equity') {
    if (valuationCap < preMoney) {
      effectivePreMoney = valuationCap;
    }
    const discountedPreMoney = preMoney * (1 - discount / 100);
    effectivePreMoney = Math.min(effectivePreMoney, discountedPreMoney);
  }
  const investorOwnership = (investment / (effectivePreMoney + investment)) * 100;

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

      {/* Round Name & Instrument */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Round Name</Label>
          <Input
            value={roundName}
            onChange={(e) => setRoundName(e.target.value)}
            placeholder="e.g., Seed, Series A"
            className="bg-background"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Instrument
          </Label>
          <Select value={instrument} onValueChange={(v) => setInstrument(v as InstrumentType)}>
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equity">{instrumentLabels.equity}</SelectItem>
              <SelectItem value="safe">{instrumentLabels.safe}</SelectItem>
              <SelectItem value="cla">{instrumentLabels.cla}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pre-Money Valuation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            {instrument === 'equity' ? 'Pre-Money Valuation' : 'Current Valuation'}
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

      {/* SAFE/CLA specific fields */}
      {instrument !== 'equity' && (
        <>
          {/* Valuation Cap */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Valuation Cap</Label>
              <span className="text-sm font-medium text-warning">
                {formatCurrency(valuationCap)}
              </span>
            </div>
            <Slider
              value={[valuationCap]}
              onValueChange={(v) => setValuationCap(v[0])}
              min={500000}
              max={Math.max(preMoney * 2, 50000000)}
              step={500000}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Maximum valuation for conversion (protects early investors)
            </p>
          </div>

          {/* Discount */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Discount Rate</Label>
              <span className="text-sm font-medium text-accent">
                {discount}%
              </span>
            </div>
            <Slider
              value={[discount]}
              onValueChange={(v) => setDiscount(v[0])}
              min={0}
              max={30}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Discount applied at conversion (typical: 15-25%)
            </p>
          </div>
        </>
      )}

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
          <span className="text-muted-foreground">Instrument</span>
          <span className="font-semibold">{instrumentLabels[instrument]}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Post-Money Valuation</span>
          <span className="font-semibold">{formatCurrency(postMoney)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Investor Ownership {instrument !== 'equity' && '(at conversion)'}
          </span>
          <span className="font-semibold text-primary">{investorOwnership.toFixed(1)}%</span>
        </div>
        {instrument !== 'equity' && effectivePreMoney < preMoney && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Effective Valuation</span>
            <span className="font-semibold text-warning">{formatCurrency(effectivePreMoney)}</span>
          </div>
        )}
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
