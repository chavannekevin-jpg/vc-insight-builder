import { useState, useEffect } from "react";
import { DemoLayout } from "@/components/demo/DemoLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  Lightbulb, 
  TrendingUp, 
  Users, 
  Target,
  CheckCircle,
  Sparkles,
  DollarSign,
  Clock,
  BarChart3
} from "lucide-react";
import { 
  DEMO_COMPANY 
} from "@/data/demo/demoSignalFlow";
import { 
  DEMO_PROFILE_COMPLETION, 
  DEMO_UNIT_ECONOMICS,
  DEMO_PROFILE_RESPONSES,
  DEMO_PROFILE_SECTIONS
} from "@/data/demo/demoSignalFlowProfile";
import { ProfileExplainer, useProfileExplainer } from "@/components/explainers/ProfileExplainer";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Lightbulb,
  TrendingUp,
  Users,
  Target
};

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `€${(value / 1000).toFixed(0)}K`;
  return `€${value}`;
};

export default function DemoProfile() {
  // Profile explainer modal - use demo-specific key
  const [showExplainer, setShowExplainer] = useState(false);
  const [explainerChecked, setExplainerChecked] = useState(false);
  
  useEffect(() => {
    const seen = localStorage.getItem("demo_profile_explainer_seen");
    setShowExplainer(!seen);
    setExplainerChecked(true);
  }, []);
  
  const completeExplainer = () => {
    localStorage.setItem("demo_profile_explainer_seen", "true");
    setShowExplainer(false);
  };

  return (
    <>
    {/* Profile Explainer Modal */}
    {explainerChecked && (
      <ProfileExplainer 
        open={showExplainer} 
        onComplete={completeExplainer} 
      />
    )}
    <DemoLayout currentPage="profile">
      <div className="px-6 py-8 bg-gradient-to-b from-transparent to-muted/10">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-display font-bold">Company Profile</h1>
            <p className="text-sm text-muted-foreground">
              Complete profile inputs for <span className="font-medium text-foreground">{DEMO_COMPANY.name}</span>
            </p>
          </div>

          {/* Demo Notice */}
          <Card className="border-primary/20 bg-card/60 backdrop-blur-2xl">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-primary/20">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">This is the input that generated a ~70 score</p>
                  <p className="text-xs text-muted-foreground">
                    See exactly what depth of information is needed to generate a comprehensive investment analysis. 
                    The quality of your input directly impacts the quality of insights you receive.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completion Status */}
          <Card className="bg-card/60 backdrop-blur-xl border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Profile Completion</CardTitle>
              <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 backdrop-blur-sm">
                <CheckCircle className="w-3 h-3 mr-1" />
                {DEMO_PROFILE_COMPLETION.overall}% Complete
              </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={DEMO_PROFILE_COMPLETION.overall} className="h-2" />
              <div className="grid grid-cols-5 gap-2 mt-3">
                {Object.entries(DEMO_PROFILE_COMPLETION.sections).map(([section, value]) => (
                  <div key={section} className="text-center">
                    <div className="text-xs text-muted-foreground truncate capitalize">
                      {section.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-sm font-medium text-emerald-500">{value}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Unit Economics Dashboard */}
          <Card className="bg-card/60 backdrop-blur-xl border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Unit Economics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-xl bg-muted/40 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <DollarSign className="w-3 h-3" />
                    MRR
                  </div>
                  <div className="text-lg font-semibold">{formatCurrency(DEMO_UNIT_ECONOMICS.mrr)}</div>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Users className="w-3 h-3" />
                    Customers
                  </div>
                  <div className="text-lg font-semibold">{DEMO_UNIT_ECONOMICS.customers}</div>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <TrendingUp className="w-3 h-3" />
                    LTV:CAC
                  </div>
                  <div className="text-lg font-semibold">{DEMO_UNIT_ECONOMICS.ltvCacRatio}x</div>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Clock className="w-3 h-3" />
                    Runway
                  </div>
                  <div className="text-lg font-semibold">{DEMO_UNIT_ECONOMICS.runway} mo</div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-center">
                <div>
                  <div className="text-xs text-muted-foreground">ACV</div>
                  <div className="text-sm font-medium">{formatCurrency(DEMO_UNIT_ECONOMICS.acv)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">CAC</div>
                  <div className="text-sm font-medium">{formatCurrency(DEMO_UNIT_ECONOMICS.cac)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">LTV</div>
                  <div className="text-sm font-medium">{formatCurrency(DEMO_UNIT_ECONOMICS.ltv)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Payback</div>
                  <div className="text-sm font-medium">{DEMO_UNIT_ECONOMICS.paybackMonths} mo</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Gross Margin</div>
                  <div className="text-sm font-medium">{DEMO_UNIT_ECONOMICS.grossMargin}%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">NRR</div>
                  <div className="text-sm font-medium">{DEMO_UNIT_ECONOMICS.nrr}%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Sections */}
          {DEMO_PROFILE_SECTIONS.map((section) => {
            const IconComponent = iconMap[section.icon];
            return (
              <Card key={section.id} className="bg-card/60 backdrop-blur-xl border-border/40">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    {IconComponent && <IconComponent className="w-5 h-5 text-primary" />}
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.fields.map((field) => {
                    const value = DEMO_PROFILE_RESPONSES[field.key as keyof typeof DEMO_PROFILE_RESPONSES];
                    if (!value) return null;
                    
                    return (
                      <div key={field.key} className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{field.label}</span>
                          {field.type === 'badge' && (
                            <Badge variant="secondary" className="text-xs bg-muted/40 backdrop-blur-sm">{value as string}</Badge>
                          )}
                        </div>
                        {field.type === 'text' && (
                          <p className="text-sm text-muted-foreground">{value as string}</p>
                        )}
                        {field.type === 'longtext' && (
                          <div className="text-sm text-muted-foreground bg-muted/30 backdrop-blur-sm rounded-xl p-3 whitespace-pre-wrap">
                            {value as string}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}

        </div>
      </div>
    </DemoLayout>
    </>
  );
}
