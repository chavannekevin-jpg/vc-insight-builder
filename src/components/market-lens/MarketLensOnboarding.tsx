import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Database, 
  ArrowRight, 
  Globe, 
  Target, 
  Clock, 
  MessageSquare,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketLensPreferences {
  region: "europe" | "us" | "other";
  targetMarket: "same" | "different_us" | "different_eu" | "global";
  fundraisingTimeline: "active" | "6months" | "exploring";
  keyConcerns: string;
}

interface MarketLensOnboardingProps {
  open: boolean;
  onComplete: (preferences: MarketLensPreferences) => void;
  companyName: string;
}

export function MarketLensOnboarding({ open, onComplete, companyName }: MarketLensOnboardingProps) {
  const [step, setStep] = useState(0);
  const [preferences, setPreferences] = useState<MarketLensPreferences>({
    region: "europe",
    targetMarket: "same",
    fundraisingTimeline: "exploring",
    keyConcerns: ""
  });

  const handleComplete = () => {
    onComplete(preferences);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden [&>button]:hidden">
        {step === 0 && (
          <MethodologyStep onNext={() => setStep(1)} />
        )}
        {step === 1 && (
          <RegionStep 
            value={preferences.region}
            onChange={(region) => setPreferences(p => ({ ...p, region }))}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <TargetMarketStep 
            value={preferences.targetMarket}
            region={preferences.region}
            onChange={(targetMarket) => setPreferences(p => ({ ...p, targetMarket }))}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <TimelineStep 
            value={preferences.fundraisingTimeline}
            onChange={(fundraisingTimeline) => setPreferences(p => ({ ...p, fundraisingTimeline }))}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <ConcernsStep 
            value={preferences.keyConcerns}
            onChange={(keyConcerns) => setPreferences(p => ({ ...p, keyConcerns }))}
            onComplete={handleComplete}
            onBack={() => setStep(3)}
            companyName={companyName}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function MethodologyStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Database className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Welcome to Market Lens</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Personalized market intelligence for your fundraise
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg bg-muted/30 p-4 space-y-3">
          <h3 className="font-medium text-sm text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            How it works
          </h3>
          <p className="text-sm text-muted-foreground">
            Market Lens analyzes a curated database of VC reports, funding data, and market research 
            — then synthesizes <span className="text-foreground font-medium">only the insights relevant to your specific company</span>.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Real market data</p>
              <p className="text-xs text-muted-foreground">From reports by leading VCs and research firms</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Stage & sector filtered</p>
              <p className="text-xs text-muted-foreground">Benchmarks matched to your company profile</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Actionable for investor conversations</p>
              <p className="text-xs text-muted-foreground">Every insight explains why it matters for you</p>
            </div>
          </div>
        </div>
      </div>

      <Button onClick={onNext} className="w-full">
        Let's personalize your briefing
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}

interface OptionCardProps {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}

function OptionCard({ selected, onClick, icon, title, description, badge }: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-lg border text-left transition-all",
        selected 
          ? "border-primary bg-primary/5" 
          : "border-border hover:border-muted-foreground/50 hover:bg-muted/30"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
          selected ? "bg-primary/20" : "bg-muted"
        )}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm text-foreground">{title}</p>
            {badge && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                {badge}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        <div className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
          selected ? "border-primary bg-primary" : "border-muted-foreground/30"
        )}>
          {selected && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
        </div>
      </div>
    </button>
  );
}

function StepHeader({ step, title, description }: { step: number; title: string; description: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">Step {step} of 4</p>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function StepNavigation({ onBack, onNext, nextLabel = "Continue" }: { 
  onBack: () => void; 
  onNext: () => void;
  nextLabel?: string;
}) {
  return (
    <div className="flex gap-3 pt-2">
      <Button variant="outline" onClick={onBack} className="flex-1">
        Back
      </Button>
      <Button onClick={onNext} className="flex-1">
        {nextLabel}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}

function RegionStep({ 
  value, 
  onChange, 
  onNext, 
  onBack 
}: { 
  value: string; 
  onChange: (v: "europe" | "us" | "other") => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="p-6 space-y-5">
      <StepHeader 
        step={1}
        title="Where are you based?"
        description="This determines which regional benchmarks and currency we use."
      />
      
      <div className="space-y-2">
        <OptionCard
          selected={value === "europe"}
          onClick={() => onChange("europe")}
          icon={<Globe className="w-4 h-4 text-primary" />}
          title="Europe"
          description="EUR currency, European VC benchmarks"
          badge="€"
        />
        <OptionCard
          selected={value === "us"}
          onClick={() => onChange("us")}
          icon={<Globe className="w-4 h-4 text-muted-foreground" />}
          title="United States"
          description="USD currency, US VC benchmarks"
          badge="$"
        />
        <OptionCard
          selected={value === "other"}
          onClick={() => onChange("other")}
          icon={<Globe className="w-4 h-4 text-muted-foreground" />}
          title="Other Region"
          description="USD currency, global benchmarks"
          badge="$"
        />
      </div>

      <StepNavigation onBack={onBack} onNext={onNext} />
    </div>
  );
}

function TargetMarketStep({ 
  value, 
  region,
  onChange, 
  onNext, 
  onBack 
}: { 
  value: string;
  region: string;
  onChange: (v: "same" | "different_us" | "different_eu" | "global") => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="p-6 space-y-5">
      <StepHeader 
        step={2}
        title="What's your target market?"
        description="Some companies target markets different from their HQ location."
      />
      
      <div className="space-y-2">
        <OptionCard
          selected={value === "same"}
          onClick={() => onChange("same")}
          icon={<Target className="w-4 h-4 text-primary" />}
          title="Same as my region"
          description={region === "europe" ? "Targeting European customers" : "Targeting US customers"}
        />
        {region === "europe" && (
          <OptionCard
            selected={value === "different_us"}
            onClick={() => onChange("different_us")}
            icon={<Target className="w-4 h-4 text-muted-foreground" />}
            title="Targeting US market"
            description="European company expanding to/focused on US"
          />
        )}
        {region === "us" && (
          <OptionCard
            selected={value === "different_eu"}
            onClick={() => onChange("different_eu")}
            icon={<Target className="w-4 h-4 text-muted-foreground" />}
            title="Targeting European market"
            description="US company expanding to/focused on Europe"
          />
        )}
        <OptionCard
          selected={value === "global"}
          onClick={() => onChange("global")}
          icon={<Target className="w-4 h-4 text-muted-foreground" />}
          title="Global / Multi-region"
          description="Targeting customers across multiple regions"
        />
      </div>

      <StepNavigation onBack={onBack} onNext={onNext} />
    </div>
  );
}

function TimelineStep({ 
  value, 
  onChange, 
  onNext, 
  onBack 
}: { 
  value: string; 
  onChange: (v: "active" | "6months" | "exploring") => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="p-6 space-y-5">
      <StepHeader 
        step={3}
        title="When are you fundraising?"
        description="This helps us prioritize the most relevant insights."
      />
      
      <div className="space-y-2">
        <OptionCard
          selected={value === "active"}
          onClick={() => onChange("active")}
          icon={<Clock className="w-4 h-4 text-primary" />}
          title="Actively raising now"
          description="Currently in conversations with investors"
        />
        <OptionCard
          selected={value === "6months"}
          onClick={() => onChange("6months")}
          icon={<Clock className="w-4 h-4 text-muted-foreground" />}
          title="Planning in next 6 months"
          description="Preparing materials and strategy"
        />
        <OptionCard
          selected={value === "exploring"}
          onClick={() => onChange("exploring")}
          icon={<Clock className="w-4 h-4 text-muted-foreground" />}
          title="Just exploring"
          description="Understanding the landscape for future reference"
        />
      </div>

      <StepNavigation onBack={onBack} onNext={onNext} />
    </div>
  );
}

function ConcernsStep({ 
  value, 
  onChange, 
  onComplete, 
  onBack,
  companyName
}: { 
  value: string; 
  onChange: (v: string) => void;
  onComplete: () => void;
  onBack: () => void;
  companyName: string;
}) {
  return (
    <div className="p-6 space-y-5">
      <StepHeader 
        step={4}
        title="Any specific concerns?"
        description="Optional: Tell us what you want to understand most about your market."
      />
      
      <div className="space-y-3">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`E.g., "How does our valuation compare to similar companies?" or "What are the biggest risks VCs see in our sector?"`}
          className="min-h-[100px] resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Leave empty to get a general market briefing for {companyName}.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={onComplete} className="flex-1">
          Generate My Briefing
          <Sparkles className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
