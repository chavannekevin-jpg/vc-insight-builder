import { useState, useMemo } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { safeLower } from "@/lib/stringUtils";

interface BlindSpot {
  type: 'exaggeration' | 'assumption' | 'premature_scaling' | 'missing_fit' | 'vanity';
  severity: 'warning' | 'caution';
  message: string;
  suggestion: string;
  matchedText?: string;
}

interface WorkshopBlindSpotWarningProps {
  text: string;
  sectionKey: string;
  onDismiss?: () => void;
}

// Patterns that indicate potential blind spots for pre-seed companies
const BLIND_SPOT_PATTERNS: Record<string, Array<{
  pattern: RegExp | string[];
  type: BlindSpot['type'];
  severity: BlindSpot['severity'];
  message: string;
  suggestion: string;
}>> = {
  problem: [
    {
      pattern: ['everyone', 'all businesses', 'every company', 'universal'],
      type: 'exaggeration',
      severity: 'warning',
      message: 'Potential overgeneralization detected',
      suggestion: 'Narrow to a specific segment you have validated'
    },
    {
      pattern: ['we believe', 'we think', 'we assume', 'probably'],
      type: 'assumption',
      severity: 'warning',
      message: 'Sounds like an assumption',
      suggestion: 'Replace with evidence from customer interviews'
    },
  ],
  solution: [
    {
      pattern: ['scale', 'million users', 'global', 'worldwide', 'enterprise'],
      type: 'premature_scaling',
      severity: 'caution',
      message: 'Premature scaling language detected',
      suggestion: 'Focus on your first 10-100 customers first'
    },
    {
      pattern: ['revolutionary', 'disruptive', 'game-changing', 'unprecedented'],
      type: 'exaggeration',
      severity: 'caution',
      message: 'Buzzword detected',
      suggestion: 'Replace with specific, measurable benefits'
    },
  ],
  market: [
    {
      pattern: ['billion dollar', 'trillion', 'huge market', 'massive opportunity'],
      type: 'exaggeration',
      severity: 'caution',
      message: 'Large market claims need validation',
      suggestion: 'Focus on your serviceable addressable market (SAM)'
    },
  ],
  team: [
    {
      pattern: /^(?!.*(?:worked in|experience|built|founded|led|years))/i,
      type: 'missing_fit',
      severity: 'warning',
      message: 'Founder-market fit unclear',
      suggestion: 'Explain your unique insight or experience with this problem'
    },
  ],
  gtm: [
    {
      pattern: ['viral', 'word of mouth', 'organic growth', 'marketing will'],
      type: 'assumption',
      severity: 'warning',
      message: 'Acquisition strategy needs validation',
      suggestion: 'How specifically will you acquire your first 10 customers?'
    },
  ],
  business_model: [
    {
      pattern: ['freemium', 'free users', 'convert later'],
      type: 'vanity',
      severity: 'caution',
      message: 'Freemium is hard at pre-seed',
      suggestion: 'Consider starting with paid customers to validate willingness to pay'
    },
  ],
};

function detectBlindSpots(text: string, sectionKey: string): BlindSpot[] {
  const textLower = safeLower(text, "WorkshopBlindSpotWarning.detectBlindSpots");
  const patterns = BLIND_SPOT_PATTERNS[sectionKey] || [];
  const detected: BlindSpot[] = [];

  for (const patternDef of patterns) {
    let isMatch = false;
    let matchedText: string | undefined;

    if (Array.isArray(patternDef.pattern)) {
      for (const keyword of patternDef.pattern) {
        if (textLower.includes(keyword.toLowerCase())) {
          isMatch = true;
          matchedText = keyword;
          break;
        }
      }
    } else if (patternDef.pattern instanceof RegExp) {
      isMatch = patternDef.pattern.test(text);
    }

    if (isMatch) {
      detected.push({
        type: patternDef.type,
        severity: patternDef.severity,
        message: patternDef.message,
        suggestion: patternDef.suggestion,
        matchedText,
      });
    }
  }

  return detected;
}

export function WorkshopBlindSpotWarning({ 
  text, 
  sectionKey,
  onDismiss 
}: WorkshopBlindSpotWarningProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const blindSpots = useMemo(() => 
    detectBlindSpots(text, sectionKey).filter(
      spot => !dismissed.includes(spot.message)
    ), 
    [text, sectionKey, dismissed]
  );

  if (blindSpots.length === 0 || !text.trim()) {
    return null;
  }

  const warnings = blindSpots.filter(s => s.severity === 'warning');
  const cautions = blindSpots.filter(s => s.severity === 'caution');

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn(
        "rounded-lg border overflow-hidden",
        warnings.length > 0 
          ? "border-yellow-500/30 bg-yellow-500/5" 
          : "border-orange-500/20 bg-orange-500/5"
      )}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-2">
              <AlertTriangle className={cn(
                "w-4 h-4",
                warnings.length > 0 ? "text-yellow-500" : "text-orange-400"
              )} />
              <span className="text-sm font-medium">
                Blind Spot Check ({blindSpots.length})
              </span>
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )} />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-2 border-t border-border/50 pt-2">
            {blindSpots.map((spot, index) => (
              <div 
                key={index}
                className={cn(
                  "flex items-start gap-2 p-2 rounded-md",
                  spot.severity === 'warning' ? "bg-yellow-500/10" : "bg-orange-500/10"
                )}
              >
                <AlertTriangle className={cn(
                  "w-4 h-4 mt-0.5 flex-shrink-0",
                  spot.severity === 'warning' ? "text-yellow-500" : "text-orange-400"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{spot.message}</p>
                  {spot.matchedText && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Found: "{spot.matchedText}"
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    → {spot.suggestion}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 flex-shrink-0"
                  onClick={() => setDismissed(prev => [...prev, spot.message])}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
            
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDismissed(blindSpots.map(s => s.message))}
                className="text-xs"
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                I've Addressed These
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
