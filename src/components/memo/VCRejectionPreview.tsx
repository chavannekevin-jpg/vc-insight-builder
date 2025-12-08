import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Eye, Sparkles } from "lucide-react";

interface VCQuickTake {
  verdict: string;
  concerns: string[];
  strengths: string[];
  readinessLevel: "LOW" | "MEDIUM" | "HIGH";
}

interface VCRejectionPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  vcQuickTake: VCQuickTake;
  onPreviewMemo: () => void;
  onGetFullMemo: () => void;
}

// Helper to create a redacted preview of a concern
const createRedactedText = (concern: string): { visible: string; redacted: boolean } => {
  const words = concern.split(' ');
  if (words.length <= 3) {
    return { visible: words[0], redacted: true };
  }
  return { visible: words.slice(0, 2).join(' '), redacted: true };
};

// Transform concern into VC-speak for the main rejection
const reframeAsVCSpeak = (concern: string): string => {
  // Add some VC flavor to the concern
  const prefixes = [
    "Frankly,",
    "To be direct:",
    "Our view:",
    "The issue is",
  ];
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  
  // Clean up the concern text
  let reframed = concern.replace(/^[-•]\s*/, '').trim();
  
  // Make sure it ends with a period
  if (!reframed.endsWith('.') && !reframed.endsWith('?') && !reframed.endsWith('!')) {
    reframed += '.';
  }
  
  return `${randomPrefix} ${reframed.charAt(0).toLowerCase() + reframed.slice(1)}`;
};

export function VCRejectionPreview({
  open,
  onOpenChange,
  companyName,
  vcQuickTake,
  onPreviewMemo,
  onGetFullMemo,
}: VCRejectionPreviewProps) {
  const { concerns, strengths, readinessLevel } = vcQuickTake;
  
  // Main rejection reason
  const mainConcern = concerns[0] 
    ? reframeAsVCSpeak(concerns[0])
    : "We couldn't identify a clear path to venture-scale returns at this stage.";
  
  // Additional redacted concerns
  const additionalConcerns = concerns.slice(1, 3).map(createRedactedText);
  
  // Acknowledge a strength if readiness is not LOW
  const acknowledgment = readinessLevel !== 'LOW' && strengths[0] 
    ? strengths[0].replace(/^[-•]\s*/, '').trim()
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 border-border/50 bg-card overflow-hidden">
        {/* Email Header */}
        <div className="bg-muted/50 border-b border-border px-6 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">This is what VCs see</p>
              <p className="text-sm font-medium text-foreground">Inbox Preview</p>
            </div>
          </div>
          
          <div className="space-y-1 text-sm">
            <div className="flex gap-2">
              <span className="text-muted-foreground w-12">From:</span>
              <span className="text-foreground">Sarah Chen, Partner</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground w-12">To:</span>
              <span className="text-foreground">Founder</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground w-12">Re:</span>
              <span className="text-foreground">{companyName} — Following Up</span>
            </div>
          </div>
        </div>
        
        {/* Email Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-foreground">Hi,</p>
          
          <p className="text-sm text-foreground">
            Thanks for walking us through {companyName}. The team reviewed your materials carefully.
          </p>
          
          <p className="text-sm text-foreground">
            I'll be direct: <span className="text-destructive font-medium">we're passing.</span>
          </p>
          
          {/* Main concern in quote style */}
          <div className="border-l-2 border-primary/50 pl-4 py-1">
            <p className="text-sm text-muted-foreground italic">
              "{mainConcern}"
            </p>
          </div>
          
          {/* Additional redacted concerns */}
          {additionalConcerns.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-foreground">We also flagged:</p>
              <ul className="space-y-1.5 text-sm">
                {additionalConcerns.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span className="text-foreground">{item.visible}</span>
                    {item.redacted && (
                      <span className="inline-flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span 
                            key={i} 
                            className="inline-block w-2 h-3.5 bg-muted-foreground/60 rounded-sm"
                          />
                        ))}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Strength acknowledgment */}
          {acknowledgment && (
            <div className="border-l-2 border-primary/30 pl-4 py-1 bg-primary/5 rounded-r">
              <p className="text-sm text-muted-foreground">
                That said, {acknowledgment.charAt(0).toLowerCase() + acknowledgment.slice(1)}
                {!acknowledgment.endsWith('.') && '.'}
              </p>
            </div>
          )}
          
          <p className="text-sm text-foreground">
            Best of luck with the raise.
          </p>
          
          {/* Signature */}
          <div className="pt-2 border-t border-border/50">
            <p className="text-sm text-foreground font-medium">— Sarah Chen</p>
            <p className="text-xs text-muted-foreground">Partner, Apex Ventures</p>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="border-t border-border bg-muted/30 px-6 py-5">
          <p className="text-xs text-center text-muted-foreground mb-4">
            See the full analysis behind this email — and how to fix it.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onPreviewMemo}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview your memo
            </Button>
            
            <Button
              className="flex-1 gap-2"
              onClick={onGetFullMemo}
            >
              <Sparkles className="w-4 h-4" />
              Get the full memo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
