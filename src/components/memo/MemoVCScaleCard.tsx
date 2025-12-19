import { useState } from "react";
import { Calculator, TrendingUp, Target, AlertTriangle, Info, Lightbulb, DollarSign, Users, Layers, Zap, ArrowUpRight, Edit2, Save, Building, Landmark, ShoppingCart, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BusinessModelType, Currency } from "@/lib/memoDataExtractor";

export interface ScaleStrategy {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  icon: "pricing" | "expansion" | "upsell" | "efficiency" | "partnership";
  benchmark?: string;
}

interface MemoVCScaleCardProps {
  avgMonthlyRevenue?: number;
  currentCustomers?: number;
  currentMRR?: number;
  companyName?: string;
  category?: string;
  strategies?: ScaleStrategy[];
  // Enhanced props for full personalization
  currency?: Currency;
  businessModelType?: BusinessModelType;
  ltv?: number;
  avgDealSize?: number;
  aumFeePercent?: number;
  aumTotal?: number;
  setupFee?: number;
  transactionFeePercent?: number;
  avgTransactionValue?: number;
  isB2C?: boolean;
  isTransactionBased?: boolean;
}

// Currency symbols and formatters
const currencyConfig: Record<Currency, { symbol: string; position: 'before' | 'after' }> = {
  USD: { symbol: '$', position: 'before' },
  EUR: { symbol: '€', position: 'before' },
  GBP: { symbol: '£', position: 'before' },
  SEK: { symbol: 'kr', position: 'after' },
  NOK: { symbol: 'kr', position: 'after' },
  DKK: { symbol: 'kr', position: 'after' },
};

const formatCurrency = (value: number, currency: Currency = 'USD'): string => {
  const config = currencyConfig[currency];
  const formatted = value.toLocaleString();
  return config.position === 'before' 
    ? `${config.symbol}${formatted}` 
    : `${formatted} ${config.symbol}`;
};

const formatLargeNumber = (value: number, currency: Currency = 'USD'): string => {
  const config = currencyConfig[currency];
  let formatted: string;
  
  if (value >= 1000000000) {
    formatted = `${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    formatted = `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    formatted = `${(value / 1000).toFixed(0)}k`;
  } else {
    formatted = value.toLocaleString();
  }
  
  return config.position === 'before' 
    ? `${config.symbol}${formatted}` 
    : `${formatted} ${config.symbol}`;
};

// Business model labels and icons
const businessModelLabels: Record<BusinessModelType, { label: string; customerLabel: string; revenueLabel: string; icon: typeof Building }> = {
  b2c: { label: 'B2C Subscription', customerLabel: 'Users', revenueLabel: 'Avg Revenue Per User (ARPU)', icon: Users },
  saas: { label: 'SaaS', customerLabel: 'Customers', revenueLabel: 'Avg Monthly Revenue', icon: Building },
  enterprise: { label: 'Enterprise SaaS', customerLabel: 'Enterprise Clients', revenueLabel: 'Avg Contract Value (ACV)', icon: Briefcase },
  marketplace: { label: 'Marketplace', customerLabel: 'Active Users', revenueLabel: 'Revenue Per User', icon: ShoppingCart },
  aum: { label: 'AUM-Based', customerLabel: 'Clients/Issuers', revenueLabel: 'Avg Revenue Per Client', icon: Landmark },
  project: { label: 'Project/Deal-Based', customerLabel: 'Clients', revenueLabel: 'Avg Deal Value', icon: Briefcase },
};

// Generate strategies based on business model type
const generateModelSpecificStrategies = (
  businessModelType: BusinessModelType,
  avgMonthlyRevenue: number,
  customersNeeded: number,
  currency: Currency
): ScaleStrategy[] => {
  const strategies: ScaleStrategy[] = [];

  switch (businessModelType) {
    case 'aum':
      strategies.push({
        title: "Launch Fund-of-Funds Product",
        description: `Aggregate smaller investors into a fund structure, increasing AUM without proportional client acquisition costs.`,
        impact: "high",
        icon: "expansion",
        benchmark: "PE firms using fund-of-funds grow AUM 3x faster"
      });
      strategies.push({
        title: "Premium Service Tier",
        description: `Introduce enhanced services (quarterly reviews, bespoke reporting) at 0.75-1% fee vs. standard 0.5%.`,
        impact: "high",
        icon: "pricing",
        benchmark: "Premium tiers can increase effective fee rate by 50%+"
      });
      strategies.push({
        title: "Secondary Market Revenue",
        description: `Add transaction fees for secondary market trades between token holders. New revenue stream with high margins.`,
        impact: "medium",
        icon: "upsell",
        benchmark: "Secondary market fees add 20-30% to platform revenue"
      });
      strategies.push({
        title: "Geographic Expansion",
        description: `Expand to new markets (GCC, Asia-Pacific) where tokenization demand is growing rapidly.`,
        impact: "medium",
        icon: "expansion",
        benchmark: "Middle East tokenization market growing 40% CAGR"
      });
      break;

    case 'project':
      strategies.push({
        title: "Recurring Add-On Services",
        description: `Bundle ongoing services (maintenance, reporting, compliance) as annual retainers alongside project fees.`,
        impact: "high",
        icon: "upsell",
        benchmark: "Services companies with retainers valued 2-3x higher"
      });
      strategies.push({
        title: "Increase Deal Velocity",
        description: `Streamline delivery to handle 2-3x more deals per year. Productize common elements to reduce per-deal effort.`,
        impact: "high",
        icon: "efficiency",
        benchmark: "Top advisory firms close 50+ deals/year vs. 10-20 typical"
      });
      strategies.push({
        title: "Upmarket Movement",
        description: `Target larger deals with higher fees. A 2x increase in avg deal size halves the clients needed.`,
        impact: "high",
        icon: "pricing",
        benchmark: "Enterprise deals avg ${formatCurrency(100000, currency)}+ vs ${formatCurrency(30000, currency)} SMB"
      });
      strategies.push({
        title: "White-Label Partnerships",
        description: `License your methodology to larger firms who bring the deals. Revenue share on their volume.`,
        impact: "medium",
        icon: "partnership",
        benchmark: "White-label can add 40% revenue without direct sales"
      });
      break;

    case 'marketplace':
      strategies.push({
        title: "Increase Take Rate",
        description: `Add premium placement, featured listings, or priority matching at higher commission rates.`,
        impact: "high",
        icon: "pricing",
        benchmark: "Top marketplaces earn 15-20% blended vs. 5-10% base"
      });
      strategies.push({
        title: "Value-Added Services",
        description: `Offer payments, logistics, insurance, or financing. Each service adds 2-5% of GMV.`,
        impact: "high",
        icon: "upsell",
        benchmark: "Shopify Payments is 75% of revenue, not subscriptions"
      });
      strategies.push({
        title: "Increase Transaction Frequency",
        description: `Gamification, subscriptions, or bundles to drive repeat purchases from existing users.`,
        impact: "medium",
        icon: "efficiency",
        benchmark: "Amazon Prime members purchase 4x more than non-Prime"
      });
      strategies.push({
        title: "Supply-Side Monetization",
        description: `Charge suppliers for analytics, ads, or premium tools. B2B revenue at higher margins.`,
        impact: "medium",
        icon: "expansion",
        benchmark: "DoorDash's merchant tools add 30% to unit economics"
      });
      break;

    case 'enterprise':
      strategies.push({
        title: "Land-and-Expand Motion",
        description: `Start with single team/department, expand to enterprise-wide deployment with 10x ACV potential.`,
        impact: "high",
        icon: "expansion",
        benchmark: "Snowflake's NRR >150% from expansion within accounts"
      });
      strategies.push({
        title: "Platform Play",
        description: `Add modules, integrations, and an app marketplace. Multi-product enterprises have 2-3x valuations.`,
        impact: "high",
        icon: "upsell",
        benchmark: "Salesforce derives 30% of revenue from platform ecosystem"
      });
      strategies.push({
        title: "Strategic Channel Partnerships",
        description: `Partner with system integrators (Accenture, Deloitte) who bring enterprise deals at lower CAC.`,
        impact: "medium",
        icon: "partnership",
        benchmark: "ServiceNow's partner channel drives 80% of enterprise deals"
      });
      strategies.push({
        title: "Industry-Specific Solutions",
        description: `Build vertical-specific features for high-value industries (finance, healthcare). Premium pricing justified.`,
        impact: "medium",
        icon: "pricing",
        benchmark: "Veeva's life sciences focus = $30B valuation"
      });
      break;

    case 'b2c':
      strategies.push({
        title: "Premium/Family Tiers",
        description: `Launch premium tier at 2-3x base price with exclusive features. Even 10% adoption dramatically improves ARPU.`,
        impact: "high",
        icon: "pricing",
        benchmark: "Spotify Premium is 90% of revenue despite <50% of users"
      });
      strategies.push({
        title: "Product-Led Growth",
        description: `Virality mechanics, referrals, and social features to acquire users at near-zero CAC.`,
        impact: "high",
        icon: "efficiency",
        benchmark: "Duolingo's PLG = 500M users with minimal paid marketing"
      });
      strategies.push({
        title: "Cross-Sell Digital Products",
        description: `Courses, merchandise, events, or premium content. High-margin revenue from engaged users.`,
        impact: "medium",
        icon: "upsell",
        benchmark: "Peloton's apparel/accessories = 15% of revenue"
      });
      strategies.push({
        title: "B2B2C Channel",
        description: `Sell to employers, insurers, or institutions who pay for user access. Enterprise economics, consumer scale.`,
        impact: "medium",
        icon: "partnership",
        benchmark: "Headspace's B2B is growing faster than consumer"
      });
      break;

    default: // SaaS
      if (avgMonthlyRevenue < 500) {
        strategies.push({
          title: "Enterprise Tier Expansion",
          description: `Introduce a premium enterprise tier at ${formatCurrency(2000, currency)}-${formatCurrency(5000, currency)}/month. Converting just 5% of customers to enterprise would reduce the customer count needed by 40-60%.`,
          impact: "high",
          icon: "pricing",
          benchmark: "Top SaaS companies derive 60%+ revenue from enterprise tiers"
        });
      } else {
        strategies.push({
          title: "Usage-Based Pricing Layer",
          description: `Add consumption-based pricing on top of base subscription. Companies using hybrid pricing see 20-30% higher expansion revenue.`,
          impact: "high",
          icon: "pricing",
          benchmark: "Snowflake, Datadog, Twilio all use hybrid pricing models"
        });
      }
      strategies.push({
        title: "Adjacent Product Cross-Sell",
        description: `Expand into complementary offerings: analytics dashboards, compliance reporting, or API access. Each additional product increases LTV by 30-50%.`,
        impact: "high",
        icon: "upsell",
        benchmark: "Multi-product companies have 2-3x higher valuations at exit"
      });
      strategies.push({
        title: "Channel Partnership Acceleration",
        description: `Partner with established players for distribution. Channel partners can 3-5x customer acquisition velocity with lower CAC.`,
        impact: "medium",
        icon: "partnership",
        benchmark: "HubSpot's partner program drives 40% of new revenue"
      });
      strategies.push({
        title: "Vertical Market Expansion",
        description: `Customize solution for high-value verticals (finance, healthcare, enterprise). Vertical-specific solutions command 2-3x premium pricing.`,
        impact: "medium",
        icon: "expansion",
        benchmark: "Veeva built $30B business on vertical SaaS for life sciences"
      });
  }

  return strategies.slice(0, 4);
};

const getStrategyIcon = (iconType: ScaleStrategy["icon"]) => {
  switch (iconType) {
    case "pricing": return DollarSign;
    case "expansion": return ArrowUpRight;
    case "upsell": return Layers;
    case "efficiency": return Zap;
    case "partnership": return Users;
    default: return Lightbulb;
  }
};

const getImpactColor = (impact: ScaleStrategy["impact"]) => {
  switch (impact) {
    case "high": return "bg-success/20 text-success border-success/30";
    case "medium": return "bg-warning/20 text-warning border-warning/30";
    case "low": return "bg-muted/30 text-muted-foreground border-border/30";
  }
};

export const MemoVCScaleCard = ({ 
  avgMonthlyRevenue: initialAvgMonthlyRevenue = 0, 
  currentCustomers: initialCurrentCustomers = 0,
  currentMRR: initialCurrentMRR = 0,
  companyName = "This company",
  category,
  strategies,
  currency = 'USD',
  businessModelType = 'saas',
  ltv,
  avgDealSize,
  aumFeePercent,
  aumTotal,
  setupFee,
  transactionFeePercent,
  avgTransactionValue,
  isB2C = false,
  isTransactionBased = false
}: MemoVCScaleCardProps) => {
  // Determine effective business model type from legacy props if not provided
  const effectiveModelType: BusinessModelType = businessModelType !== 'saas' 
    ? businessModelType 
    : (isB2C ? 'b2c' : (isTransactionBased ? 'marketplace' : 'saas'));
  
  const modelConfig = businessModelLabels[effectiveModelType];
  const ModelIcon = modelConfig.icon;
  
  const hasInitialData = initialAvgMonthlyRevenue > 0 || initialCurrentMRR > 0;
  
  const [isEditing, setIsEditing] = useState(!hasInitialData);
  const [editedValues, setEditedValues] = useState({
    avgMonthlyRevenue: initialAvgMonthlyRevenue > 0 ? initialAvgMonthlyRevenue.toString() : '',
    currentCustomers: initialCurrentCustomers > 0 ? initialCurrentCustomers.toString() : '',
    currentMRR: initialCurrentMRR > 0 ? initialCurrentMRR.toString() : ''
  });

  // Calculate values - use edited or initial, with smart defaults based on business model
  const getDefaultRevenue = () => {
    switch (effectiveModelType) {
      case 'b2c': return 10;
      case 'enterprise': return 5000;
      case 'aum': return 20000;
      case 'project': return avgDealSize || 35000;
      case 'marketplace': return 50;
      default: return 300;
    }
  };

  const avgMonthlyRevenue = parseFloat(editedValues.avgMonthlyRevenue) || initialAvgMonthlyRevenue || getDefaultRevenue();
  const currentCustomers = parseFloat(editedValues.currentCustomers) || initialCurrentCustomers || 0;
  const currentMRR = parseFloat(editedValues.currentMRR) || initialCurrentMRR || 0;

  // Target ARR in the user's currency (equivalent to $100M USD benchmark)
  const targetARR = 100_000_000;
  const annualValue = avgMonthlyRevenue * 12;
  const customersNeeded = Math.ceil(targetARR / annualValue);
  const progressPercent = currentCustomers > 0 
    ? Math.min((currentCustomers / customersNeeded) * 100, 100) 
    : 0;
  
  // For AUM model, also show AUM target
  const aumNeeded = aumFeePercent ? Math.ceil(targetARR / (aumFeePercent / 100)) : null;
  
  // Calculate years to target at various growth rates
  const yearsToTarget = (growthRate: number) => {
    if (currentMRR <= 0) return null;
    const currentARR = currentMRR * 12;
    if (currentARR >= targetARR) return 0;
    return Math.ceil(Math.log(targetARR / currentARR) / Math.log(1 + growthRate));
  };

  // Use provided strategies or generate model-specific defaults
  const displayStrategies = strategies || generateModelSpecificStrategies(effectiveModelType, avgMonthlyRevenue, customersNeeded, currency);

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="relative animate-fade-in my-10">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 rounded-3xl blur-2xl opacity-60" />
      
      <div className="relative bg-card border-2 border-primary/30 rounded-3xl overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg">
                <Calculator className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-foreground">The VC Scale Test</h3>
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground text-sm">Path to {formatCurrency(100000000, currency)} ARR</p>
                  <span className="px-2 py-0.5 bg-primary/10 rounded text-xs font-medium text-primary flex items-center gap-1">
                    <ModelIcon className="w-3 h-3" />
                    {modelConfig.label}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Edit Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Data Input Mode */}
          {isEditing && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
              <h4 className="text-sm font-semibold text-foreground mb-4">Enter Your Financial Data ({currency})</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    {modelConfig.revenueLabel} ({currencyConfig[currency].symbol}/mo)
                  </label>
                  <Input
                    type="number"
                    placeholder={`e.g., ${getDefaultRevenue()}`}
                    value={editedValues.avgMonthlyRevenue}
                    onChange={(e) => setEditedValues(prev => ({ ...prev, avgMonthlyRevenue: e.target.value }))}
                    className="bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Current {modelConfig.customerLabel}</label>
                  <Input
                    type="number"
                    placeholder="e.g., 50"
                    value={editedValues.currentCustomers}
                    onChange={(e) => setEditedValues(prev => ({ ...prev, currentCustomers: e.target.value }))}
                    className="bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Current MRR ({currencyConfig[currency].symbol})</label>
                  <Input
                    type="number"
                    placeholder="e.g., 15000"
                    value={editedValues.currentMRR}
                    onChange={(e) => setEditedValues(prev => ({ ...prev, currentMRR: e.target.value }))}
                    className="bg-background"
                  />
                </div>
              </div>
              
              {/* Model-specific tips */}
              <p className="text-xs text-muted-foreground mt-3 italic">
                {effectiveModelType === 'aum' && aumFeePercent && (
                  <>Detected: {aumFeePercent}% AUM fee. {aumTotal && `Total AUM: ${formatLargeNumber(aumTotal, currency)}.`}</>
                )}
                {effectiveModelType === 'project' && avgDealSize && (
                  <>Detected: Avg deal size {formatCurrency(avgDealSize, currency)}. {setupFee && `Setup fee: ${formatCurrency(setupFee, currency)}.`}</>
                )}
                {effectiveModelType === 'marketplace' && transactionFeePercent && (
                  <>Detected: {transactionFeePercent}% take rate. {avgTransactionValue && `Avg transaction: ${formatCurrency(avgTransactionValue, currency)}.`}</>
                )}
                {effectiveModelType === 'enterprise' && (
                  <>Tip: ACV = Annual Contract Value. Monthly shown here for consistency.</>
                )}
                {effectiveModelType === 'saas' && (
                  <>Tip: For annual contracts, divide ACV by 12 for monthly value.</>
                )}
                {effectiveModelType === 'b2c' && (
                  <>Tip: ARPU = Average Revenue Per User. Include in-app purchases and upgrades.</>
                )}
              </p>
            </div>
          )}

          {/* Why $100M Matters */}
          <div className="bg-muted/30 rounded-xl p-5 border border-border/50">
            <div className="flex items-start gap-3 mb-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <h4 className="font-semibold text-foreground">Why {formatCurrency(100000000, currency)} ARR Matters to VCs</h4>
            </div>
            <div className="pl-8 space-y-2 text-sm text-muted-foreground">
              <p>• VCs need portfolio companies that can <strong className="text-foreground">return their entire fund</strong></p>
              <p>• At typical 10-20% ownership, {formatCurrency(100000000, currency)} ARR ≈ <strong className="text-foreground">{formatCurrency(500000000, currency)}-{formatCurrency(1000000000, currency)} valuation</strong></p>
              <p>• This is the <strong className="text-primary">minimum bar</strong> for venture-scale opportunity</p>
            </div>
          </div>

          {/* The Math */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-secondary" />
              <h4 className="font-semibold text-foreground">The Math for {companyName}</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-background/60 rounded-xl p-4 border border-border/30 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  {modelConfig.revenueLabel}
                </p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(avgMonthlyRevenue, currency)}</p>
                <p className="text-xs text-muted-foreground">per {effectiveModelType === 'b2c' ? 'user' : 'customer'}/month</p>
              </div>
              <div className="bg-background/60 rounded-xl p-4 border border-border/30 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Annual Value</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(annualValue, currency)}</p>
                <p className="text-xs text-muted-foreground">per {effectiveModelType === 'b2c' ? 'user' : 'customer'}/year</p>
              </div>
              <div className="bg-primary/10 rounded-xl p-4 border border-primary/30 text-center">
                <p className="text-xs text-primary uppercase tracking-wider mb-1 font-semibold">
                  {modelConfig.customerLabel} Needed
                </p>
                <p className="text-2xl font-bold text-primary">{customersNeeded.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">for {formatLargeNumber(targetARR, currency)} ARR</p>
              </div>
            </div>

            {/* AUM-specific metric */}
            {effectiveModelType === 'aum' && aumNeeded && (
              <div className="bg-secondary/10 rounded-xl p-4 border border-secondary/30 text-center">
                <p className="text-xs text-secondary uppercase tracking-wider mb-1 font-semibold">
                  Total AUM Needed
                </p>
                <p className="text-2xl font-bold text-secondary">{formatLargeNumber(aumNeeded, currency)}</p>
                <p className="text-xs text-muted-foreground">at {aumFeePercent}% annual fee</p>
              </div>
            )}

            {/* Formula display */}
            <div className="bg-muted/20 rounded-lg p-4 text-center border border-border/30">
              <p className="text-sm font-mono text-muted-foreground">
                <span className="text-primary font-bold">{formatLargeNumber(targetARR, currency)}</span> ÷ (<span className="text-foreground">{formatCurrency(avgMonthlyRevenue, currency)}</span> × 12) = <span className="text-primary font-bold">{customersNeeded.toLocaleString()}</span> {modelConfig.customerLabel.toLowerCase()}
              </p>
            </div>
          </div>

          {/* Reality Check */}
          {currentCustomers > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                <h4 className="font-semibold text-foreground">Reality Check</h4>
              </div>
              
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current: <strong className="text-foreground">{currentCustomers.toLocaleString()}</strong> {modelConfig.customerLabel.toLowerCase()}</span>
                  <span className="text-primary font-semibold">{progressPercent.toFixed(2)}% of target</span>
                </div>
                <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000"
                    style={{ width: `${Math.max(progressPercent, 1)}%` }}
                  />
                </div>
              </div>

              {/* Growth scenarios */}
              {currentMRR > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { rate: 0.5, label: "50% YoY" },
                    { rate: 1.0, label: "100% YoY" },
                    { rate: 2.0, label: "3x YoY" }
                  ].map(({ rate, label }) => {
                    const years = yearsToTarget(rate);
                    return (
                      <div key={rate} className="bg-background/40 rounded-lg p-3 text-center border border-border/30">
                        <p className="text-xs text-muted-foreground">{label} growth</p>
                        <p className="text-lg font-bold text-foreground">
                          {years ? `${years} years` : "N/A"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VC Strategies to Accelerate */}
          <div className="space-y-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-warning" />
              <h4 className="font-semibold text-foreground">VC-Backed Strategies to Accelerate Scale</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Based on {modelConfig.label.toLowerCase()} benchmarks and successful scaling patterns:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayStrategies.map((strategy, index) => {
                const Icon = getStrategyIcon(strategy.icon);
                return (
                  <div
                    key={index}
                    className="bg-background/60 rounded-xl p-4 border border-border/30 hover:border-primary/30 transition-all duration-200 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-semibold text-foreground text-sm">{strategy.title}</h5>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getImpactColor(strategy.impact)}`}>
                            {strategy.impact.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                          {strategy.description}
                        </p>
                        {strategy.benchmark && (
                          <p className="text-xs text-primary/80 italic">
                            📊 {strategy.benchmark}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verdict */}
          <div className="bg-gradient-to-r from-warning/10 to-warning/5 rounded-xl p-4 border border-warning/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground mb-1">VC Perspective</p>
                <p className="text-sm text-muted-foreground">
                  {currentCustomers > 0 
                    ? `At current traction, the path to ${customersNeeded.toLocaleString()} ${modelConfig.customerLabel.toLowerCase()} requires either exponential growth, ${effectiveModelType === 'aum' ? 'AUM expansion' : 'ARPU expansion'}, or a combination. Smart VCs will ask which of these strategies you're prioritizing and how they map to your market dynamics.`
                    : `VCs will probe whether the market can support ${customersNeeded.toLocaleString()} ${modelConfig.customerLabel.toLowerCase()} and which combination of these strategies will get you there fastest. Having a clear POV on your scaling playbook is critical.`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};