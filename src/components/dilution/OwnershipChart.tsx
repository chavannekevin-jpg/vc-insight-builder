import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Stakeholder, getStakeholderColor, formatPercentage, calculateOwnership } from '@/lib/dilutionCalculator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

interface OwnershipChartProps {
  stakeholders: Stakeholder[];
  esopPool: number;
  esopAllocated?: number;
  title?: string;
  showLegend?: boolean;
  showViewToggle?: boolean;
  totalShares?: number;
}

export function OwnershipChart({ 
  stakeholders, 
  esopPool, 
  esopAllocated = 0,
  title, 
  showLegend = true,
  showViewToggle = false,
  totalShares = 0
}: OwnershipChartProps) {
  const [view, setView] = useState<'fully-diluted' | 'outstanding'>('fully-diluted');

  // Recalculate ownership based on view
  const displayStakeholders = showViewToggle && totalShares > 0
    ? calculateOwnership(stakeholders, totalShares, view === 'fully-diluted', esopPool)
    : stakeholders;

  // Prepare data for chart based on view
  const chartData = view === 'fully-diluted' 
    ? [
        ...displayStakeholders.map((s, index) => ({
          name: s.name,
          value: s.ownership || 0,
          color: getStakeholderColor(s.type, index),
          type: s.type
        })),
        {
          name: 'ESOP Pool (Unallocated)',
          value: Math.max(0, esopPool - esopAllocated),
          color: 'hsl(var(--muted))',
          type: 'esop' as const
        },
        ...(esopAllocated > 0 ? [{
          name: 'ESOP (Allocated)',
          value: esopAllocated,
          color: 'hsl(280, 60%, 50%)',
          type: 'esop-allocated' as const
        }] : [])
      ].filter(d => d.value > 0)
    : [
        ...displayStakeholders
          .filter(s => s.isOutstanding !== false)
          .map((s, index) => ({
            name: s.name,
            value: s.ownership || 0,
            color: getStakeholderColor(s.type, index),
            type: s.type
          })),
        ...(esopAllocated > 0 ? [{
          name: 'ESOP (Granted)',
          value: esopAllocated,
          color: 'hsl(280, 60%, 50%)',
          type: 'esop-allocated' as const
        }] : [])
      ].filter(d => d.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
          <p className="text-sm font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatPercentage(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show label for small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="hsl(var(--foreground))"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-semibold"
        style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="w-full">
      {(title || showViewToggle) && (
        <div className="flex items-center justify-between mb-2">
          {title && (
            <h4 className="text-sm font-semibold text-muted-foreground">
              {title}
            </h4>
          )}
          {showViewToggle && (
            <Tabs value={view} onValueChange={(v) => setView(v as typeof view)} className="h-8">
              <TabsList className="h-8">
                <TabsTrigger value="fully-diluted" className="text-xs px-2 h-6">
                  Fully Diluted
                </TabsTrigger>
                <TabsTrigger value="outstanding" className="text-xs px-2 h-6">
                  Outstanding
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
      )}
      
      {showViewToggle && (
        <p className="text-xs text-muted-foreground mb-2 text-center">
          {view === 'fully-diluted' 
            ? 'Includes all shares, options, and unissued ESOP pool'
            : 'Only issued shares (excludes unallocated ESOP & unconverted instruments)'
          }
        </p>
      )}

      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={100}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                stroke="hsl(var(--background))"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              layout="horizontal"
              align="center"
              verticalAlign="bottom"
              formatter={(value) => (
                <span className="text-xs text-muted-foreground">{value}</span>
              )}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
