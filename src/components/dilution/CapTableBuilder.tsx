import { useState } from 'react';
import { Plus, Trash2, Users, Briefcase, UserCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ModernCard } from '@/components/ModernCard';
import { 
  Stakeholder, 
  CapTable, 
  generateId, 
  calculateOwnership,
  formatPercentage 
} from '@/lib/dilutionCalculator';

interface CapTableBuilderProps {
  capTable: CapTable;
  onChange: (capTable: CapTable) => void;
}

const stakeholderTypeIcons = {
  founder: Users,
  employee: Briefcase,
  advisor: UserCircle,
  investor: TrendingUp
};

const stakeholderTypeLabels = {
  founder: 'Founder',
  employee: 'Employee',
  advisor: 'Advisor',
  investor: 'Investor'
};

export function CapTableBuilder({ capTable, onChange }: CapTableBuilderProps) {
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<Stakeholder['type']>('founder');
  const [newEquity, setNewEquity] = useState('');

  const stakeholdersWithOwnership = calculateOwnership(capTable.stakeholders, capTable.totalShares);

  // Calculate remaining equity
  const totalAllocated = stakeholdersWithOwnership.reduce((sum, s) => sum + (s.ownership || 0), 0);
  const esopAllocated = capTable.esopPool;
  const remainingEquity = Math.max(0, 100 - totalAllocated - esopAllocated);

  const handleAddStakeholder = () => {
    if (!newName.trim() || !newEquity) return;

    const equityPercent = parseFloat(newEquity);
    if (isNaN(equityPercent) || equityPercent <= 0 || equityPercent > remainingEquity) {
      return;
    }

    const shares = Math.round((equityPercent / 100) * capTable.totalShares);
    
    const newStakeholder: Stakeholder = {
      id: generateId(),
      name: newName.trim(),
      type: newType,
      shares
    };

    onChange({
      ...capTable,
      stakeholders: [...capTable.stakeholders, newStakeholder]
    });

    setNewName('');
    setNewEquity('');
  };

  const handleRemoveStakeholder = (id: string) => {
    onChange({
      ...capTable,
      stakeholders: capTable.stakeholders.filter(s => s.id !== id)
    });
  };

  const handleEsopChange = (value: number[]) => {
    onChange({
      ...capTable,
      esopPool: value[0]
    });
  };

  const handleSharesChange = (id: string, newShares: number) => {
    onChange({
      ...capTable,
      stakeholders: capTable.stakeholders.map(s => 
        s.id === id ? { ...s, shares: newShares } : s
      )
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Stakeholders */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Stakeholders</Label>
          <span className="text-xs text-muted-foreground">
            {formatPercentage(totalAllocated)} allocated
          </span>
        </div>
        
        {stakeholdersWithOwnership.map((stakeholder) => {
          const Icon = stakeholderTypeIcons[stakeholder.type];
          return (
            <div 
              key={stakeholder.id} 
              className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{stakeholder.name}</p>
                <p className="text-xs text-muted-foreground">
                  {stakeholderTypeLabels[stakeholder.type]}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-primary">
                  {formatPercentage(stakeholder.ownership || 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stakeholder.shares.toLocaleString()} shares
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemoveStakeholder(stakeholder.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          );
        })}

        {stakeholdersWithOwnership.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No stakeholders added yet
          </p>
        )}
      </div>

      {/* ESOP Pool Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">ESOP Pool</Label>
          <span className="text-sm font-medium text-primary">
            {capTable.esopPool}%
          </span>
        </div>
        <Slider
          value={[capTable.esopPool]}
          onValueChange={handleEsopChange}
          min={0}
          max={25}
          step={1}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Reserved for future employee equity grants
        </p>
      </div>

      {/* Add New Stakeholder */}
      <ModernCard className="!p-4">
        <Label className="text-sm font-semibold mb-3 block">Add Stakeholder</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <Input
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Select value={newType} onValueChange={(v) => setNewType(v as Stakeholder['type'])}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="founder">Founder</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="advisor">Advisor</SelectItem>
                <SelectItem value="investor">Investor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="relative">
              <Input
                type="number"
                placeholder="Equity %"
                value={newEquity}
                onChange={(e) => setNewEquity(e.target.value)}
                max={remainingEquity}
                min={0}
                step={0.1}
                className="bg-background pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                %
              </span>
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Button 
              onClick={handleAddStakeholder}
              disabled={!newName.trim() || !newEquity || parseFloat(newEquity) > remainingEquity}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </div>
        {remainingEquity < 100 && (
          <p className="text-xs text-muted-foreground mt-3">
            {formatPercentage(remainingEquity)} remaining to allocate
          </p>
        )}
      </ModernCard>
    </div>
  );
}
