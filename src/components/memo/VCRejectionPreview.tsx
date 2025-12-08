import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Sparkles, BookOpen } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { highlightFrameworksInText } from "@/lib/frameworkUtils";

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

// Map concerns to VC framework language
const mapConcernToFramework = (concern: string, index: number): string => {
  const lowerConcern = concern.toLowerCase();
  
  // Market-related concerns
  if (lowerConcern.includes('market') || lowerConcern.includes('tam') || lowerConcern.includes('size')) {
    return `the TAM appears limited for Venture Scale outcomes`;
  }
  if (lowerConcern.includes('competition') || lowerConcern.includes('crowded')) {
    return `this feels like a Red Ocean market without clear Defensibility`;
  }
  
  // Traction concerns
  if (lowerConcern.includes('traction') || lowerConcern.includes('revenue') || lowerConcern.includes('customer')) {
    return `we'd need to see stronger Traction and Market Pull`;
  }
  
  // Problem/Solution concerns
  if (lowerConcern.includes('problem') || lowerConcern.includes('pain') || lowerConcern.includes('urgent')) {
    return `this doesn't feel like a Hair on Fire problem with urgent demand`;
  }
  if (lowerConcern.includes('vitamin') || lowerConcern.includes('nice to have')) {
    return `the solution feels more like a Vitamin than a Painkiller`;
  }
  
  // Unit economics concerns
  if (lowerConcern.includes('unit') || lowerConcern.includes('margin') || lowerConcern.includes('cac') || lowerConcern.includes('ltv')) {
    return `the Unit Economics need more validation`;
  }
  
  // Moat/Defensibility concerns
  if (lowerConcern.includes('moat') || lowerConcern.includes('defensib') || lowerConcern.includes('barrier')) {
    return `we didn't see clear Switching Costs or Defensibility`;
  }
  if (lowerConcern.includes('network') || lowerConcern.includes('flywheel')) {
    return `the path to Network Effects isn't clear`;
  }
  
  // Team concerns
  if (lowerConcern.includes('team') || lowerConcern.includes('founder')) {
    return `we had questions about founder-market fit`;
  }
  
  // Default: use the original concern with framework wrapper
  const frameworkTerms = ['Venture Scale', 'Market Pull', 'Traction', 'Unit Economics'];
  const randomTerm = frameworkTerms[index % frameworkTerms.length];
  return `${cleanConcern(concern)} — we'd want clearer signals of ${randomTerm}`;
};

// Generate natural email body based on concerns and readiness with framework language
const generateEmailBody = (
  companyName: string,
  concerns: string[],
  readinessLevel: "LOW" | "MEDIUM" | "HIGH"
): { mainParagraph: string; passStatement: string; closing: string } => {
  let mainParagraph = "";
  let passStatement = "";
  let closing = "";

  if (readinessLevel === "LOW") {
    // More direct rejection for LOW readiness with framework language
    if (concerns.length >= 2) {
      mainParagraph = `After reviewing internally, the team felt that ${mapConcernToFramework(concerns[0], 0)}. We also had concerns that ${mapConcernToFramework(concerns[1], 1)}.`;
    } else if (concerns.length === 1) {
      mainParagraph = `After reviewing internally, the team felt that ${mapConcernToFramework(concerns[0], 0)}.`;
    } else {
      mainParagraph = `After reviewing internally, the team didn't see a clear path to Venture Scale outcomes at this stage. The Unit Economics and Market Pull signals weren't strong enough for us to move forward.`;
    }
    
    passStatement = "Given the Power Law dynamics of venture investing, we need to see clearer evidence of outlier potential. We won't be moving forward at this time.";
    closing = "We appreciate your transparency and wish you the best in finding Product-Market Fit.";
    
  } else {
    // Softer, more encouraging tone for MEDIUM/HIGH readiness
    if (concerns.length >= 2) {
      mainParagraph = `While we find the space interesting, we're not yet convinced that ${mapConcernToFramework(concerns[0], 0)}. We'd also want to see ${mapConcernToFramework(concerns[1], 1)}.`;
    } else if (concerns.length === 1) {
      mainParagraph = `While we find the space interesting, we're not yet convinced that ${mapConcernToFramework(concerns[0], 0)}.`;
    } else {
      mainParagraph = `While we find the space interesting, we'd want to see stronger signals of Market Pull and Traction before moving forward.`;
    }
    
    passStatement = "We'll follow along and would be happy to re-evaluate once you have more Traction to demonstrate Product-Market Fit.";
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
        <TooltipProvider>
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
              {highlightFrameworksInText(mainParagraph)}
            </p>
            
            <p className="text-sm text-foreground leading-relaxed">
              {highlightFrameworksInText(passStatement)}
            </p>
            
            <p className="text-sm text-foreground leading-relaxed">
              {highlightFrameworksInText(closing)}
            </p>
            
            {/* Signature */}
            <div className="pt-4">
              <p className="text-sm text-foreground">Best regards,</p>
              <p className="text-sm text-foreground font-medium mt-2">Sarah Chen</p>
              <p className="text-xs text-muted-foreground">Partner, Apex Ventures</p>
            </div>
          </div>
          
          {/* Framework hint */}
          <div className="px-6 pb-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpen className="w-3 h-3 text-pink-500" />
              <span>Hover <span className="text-pink-500 font-medium">pink terms</span> for VC framework definitions</span>
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
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
}
