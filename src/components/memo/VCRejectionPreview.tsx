import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Sparkles } from "lucide-react";

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

// Clean a concern string for use in prose
const cleanConcern = (concern: string): string => {
  return concern
    .replace(/^[-•]\s*/, '')
    .replace(/^[A-Z]/, (c) => c.toLowerCase())
    .replace(/\.+$/, '')
    .trim();
};

// Generate natural email body based on concerns and readiness
const generateEmailBody = (
  companyName: string,
  concerns: string[],
  readinessLevel: "LOW" | "MEDIUM" | "HIGH"
): { mainParagraph: string; passStatement: string; closing: string } => {
  const cleanedConcerns = concerns.slice(0, 3).map(cleanConcern);
  
  let mainParagraph = "";
  let passStatement = "";
  let closing = "";

  if (readinessLevel === "LOW") {
    // More direct rejection for LOW readiness
    if (cleanedConcerns.length >= 3) {
      mainParagraph = `After reviewing internally, the team felt that ${cleanedConcerns[0]}. We also had concerns around ${cleanedConcerns[1]}, and questions about ${cleanedConcerns[2]}.`;
    } else if (cleanedConcerns.length === 2) {
      mainParagraph = `After reviewing internally, the team felt that ${cleanedConcerns[0]}. We also had questions around ${cleanedConcerns[1]}.`;
    } else if (cleanedConcerns.length === 1) {
      mainParagraph = `After reviewing internally, the team felt that ${cleanedConcerns[0]}.`;
    } else {
      mainParagraph = `After reviewing internally, the team didn't see a clear path to venture-scale outcomes at this stage.`;
    }
    
    passStatement = "For these reasons, we won't be moving forward.";
    closing = "We appreciate your transparency and wish you the best in the next steps.";
    
  } else {
    // Softer, more encouraging tone for MEDIUM/HIGH readiness
    if (cleanedConcerns.length >= 2) {
      mainParagraph = `While we find the space interesting, we're not yet convinced that ${cleanedConcerns[0]}. We'd also want to see clearer signals around ${cleanedConcerns[1]}.`;
    } else if (cleanedConcerns.length === 1) {
      mainParagraph = `While we find the space interesting, we're not yet convinced that ${cleanedConcerns[0]}.`;
    } else {
      mainParagraph = `While we find the space interesting, we'd want to see stronger signals of market pull before moving forward.`;
    }
    
    passStatement = "We'll follow along and would be happy to re-evaluate as things evolve.";
    closing = "All the best,";
  }

  return { mainParagraph, passStatement, closing };
};

export function VCRejectionPreview({
  open,
  onOpenChange,
  companyName,
  vcQuickTake,
  onPreviewMemo,
  onGetFullMemo,
}: VCRejectionPreviewProps) {
  const { concerns, readinessLevel } = vcQuickTake;
  const { mainParagraph, passStatement, closing } = generateEmailBody(
    companyName,
    concerns,
    readinessLevel
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 border-border/50 bg-card overflow-hidden">
        {/* Email Header */}
        <div className="bg-muted/50 border-b border-border px-6 py-4">
          <div className="space-y-1 text-sm">
            <div className="flex gap-2">
              <span className="text-muted-foreground w-16">From:</span>
              <span className="text-foreground">Sarah Chen, Partner</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground w-16">To:</span>
              <span className="text-foreground">Founder</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground w-16">Subject:</span>
              <span className="text-foreground">Re: {companyName} — Following Up</span>
            </div>
          </div>
        </div>
        
        {/* Email Body */}
        <div className="px-6 py-6 space-y-4">
          <p className="text-sm text-foreground leading-relaxed">
            Thank you for walking us through {companyName}.
          </p>
          
          <p className="text-sm text-foreground leading-relaxed">
            {mainParagraph}
          </p>
          
          <p className="text-sm text-foreground leading-relaxed">
            {passStatement}
          </p>
          
          <p className="text-sm text-foreground leading-relaxed">
            {closing}
          </p>
          
          {/* Signature */}
          <div className="pt-4">
            <p className="text-sm text-foreground">Best regards,</p>
            <p className="text-sm text-foreground font-medium mt-2">Sarah Chen</p>
            <p className="text-xs text-muted-foreground">Partner, Apex Ventures</p>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="border-t border-border bg-muted/30 px-6 py-5">
          <p className="text-xs text-center text-muted-foreground mb-4">
            See the full analysis behind this feedback — and how to address it.
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
