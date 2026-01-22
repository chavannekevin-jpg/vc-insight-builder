import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Wallet, 
  Target, 
  TrendingUp 
} from 'lucide-react';

interface QuickFacts {
  headquarters: string;
  founded: string;
  employees: string;
  funding_raised: string;
  current_raise: string;
  key_metrics: string[];
}

interface InvestorQuickFactsProps {
  quickFacts: QuickFacts;
}

const FactItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
    <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground truncate">{value}</p>
    </div>
  </div>
);

export const InvestorQuickFacts: React.FC<InvestorQuickFactsProps> = ({
  quickFacts
}) => {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <FactItem 
            icon={<MapPin className="w-4 h-4" />}
            label="Headquarters"
            value={quickFacts.headquarters}
          />
          <FactItem 
            icon={<Calendar className="w-4 h-4" />}
            label="Founded"
            value={quickFacts.founded}
          />
          <FactItem 
            icon={<Users className="w-4 h-4" />}
            label="Team Size"
            value={quickFacts.employees}
          />
          <FactItem 
            icon={<Wallet className="w-4 h-4" />}
            label="Raised to Date"
            value={quickFacts.funding_raised}
          />
          <FactItem 
            icon={<Target className="w-4 h-4" />}
            label="Current Raise"
            value={quickFacts.current_raise}
          />
        </div>

        {/* Key Metrics */}
        {quickFacts.key_metrics && quickFacts.key_metrics.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Key Metrics</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickFacts.key_metrics.map((metric, index) => (
                <Badge 
                  key={index}
                  variant="secondary"
                  className="bg-primary/10 text-primary border border-primary/20"
                >
                  {metric}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
